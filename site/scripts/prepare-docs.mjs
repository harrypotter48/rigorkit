import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { toString } from 'mdast-util-to-string';
import { toMarkdown } from 'mdast-util-to-markdown';
import GithubSlugger from 'github-slugger';
import { parseDocument } from 'yaml';

const site = fileURLToPath(new URL('../', import.meta.url));
const processor = unified().use(remarkParse).use(remarkGfm);
const slash = value => value.split(path.sep).join('/');
const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const text = node => node.type === 'html' ? node.value : node.children ? node.children.map(text).join('') : toString(node);
function visit(node, callback) { if (callback(node) === false) return; for (const child of node.children ?? []) visit(child, callback); }
function relative(root, file) {
  const result = path.relative(root, file);
  if (result === '..' || result.startsWith('..' + path.sep) || path.isAbsolute(result)) throw new Error(`Path escapes source root: ${file}`);
  return slash(result);
}
function regular(root, file) {
  relative(root, file);
  const stat = fs.lstatSync(file);
  if (stat.isSymbolicLink()) throw new Error(`Symlink is not public documentation: ${file}`);
  return stat;
}
function discover(root, directory) {
  const result = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const file = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Symlink is not public documentation: ${relative(root, file)}`);
    if (entry.isDirectory()) result.push(...discover(root, file));
    else if (entry.isFile() && /\.md$/i.test(entry.name)) result.push(relative(root, file));
  }
  return result;
}
function docRoute(sourcePath) {
  if (sourcePath === 'README.md') return '/docs/overview/';
  const segments = sourcePath.replace(/\.(md)$/i, '').split('/');
  if (/^(readme|skill)$/i.test(segments.at(-1))) segments.pop();
  return '/docs/' + segments.map(part => part.toLowerCase()).join('/') + '/';
}
function readDocument(root, sourcePath) {
  const file = path.join(root, sourcePath);
  if (!regular(root, file).isFile()) throw new Error(`Missing document: ${sourcePath}`);
  const raw = fs.readFileSync(file, 'utf8');
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  let originalMetadata = {};
  if (match) {
    const yaml = parseDocument(match[1], { uniqueKeys: true });
    if (yaml.errors.length) throw new Error(`${sourcePath}: ${yaml.errors.map(error => error.message).join('; ')}`);
    originalMetadata = yaml.toJS({ maxAliasCount: 20 });
    if (!originalMetadata || typeof originalMetadata !== 'object' || Array.isArray(originalMetadata)) throw new Error(`Invalid document metadata: ${sourcePath}`);
  }
  const body = match ? raw.slice(match[0].length) : raw;
  const tree = processor.parse(body);
  const headings = [];
  const codeBlocks = [];
  const slugger = new GithubSlugger();
  visit(tree, node => {
    if (node.type === 'heading') headings.push({ id: slugger.slug(text(node)), text: text(node), depth: node.depth });
    if (node.type === 'code') codeBlocks.push(node.value);
  });
  const title = originalMetadata.name || headings.find(h => h.depth === 1)?.text || path.basename(sourcePath, '.md');
  const route = docRoute(sourcePath);
  const kind = /(?:^|\/)NOTICE\.md$/i.test(sourcePath) ? 'notice' : /(?:^|\/)README\.md$/i.test(sourcePath) ? 'readme' : sourcePath.includes('/templates/') ? 'template' : /\/SKILL\.md$/i.test(sourcePath) ? 'skill' : sourcePath.includes('/agents/') ? 'agent' : /checklist|dod-critical/.test(sourcePath) ? 'checklist' : 'reference';
  return { sourcePath, kind, generatedPath: route.slice('/docs/'.length).replace(/\/$/, '') + '.md', route, title, pack: sourcePath.startsWith('packs/') ? sourcePath.split('/')[1] : null, headings, codeBlocks, originalMetadata, body, tree, metadataText: match?.[1] ?? '', sourceHasH1: headings.some(h => h.depth === 1) };
}
function catalog(documents) {
  const summary = new Map();
  const overview = documents.find(doc => doc.sourcePath === 'README.md');
  visit(overview.tree, node => {
    if (node.type !== 'tableRow') return;
    const link = node.children[0]?.children?.find(child => child.type === 'link');
    const match = link?.url.match(/^\.?\/?packs\/([^/]+)\/README\.md$/i);
    // A prose row can also contain a pack link; only catalog-shaped rows supply summaries.
    if (!match || node.children.length < 2 || text(node.children[0]).trim() !== text(link).trim()) return;
    const description = text(node.children[1]).trim();
    if (description) summary.set(match[1], description);
  });
  const order = [...summary.keys()];
  const names = [...new Set(documents.map(doc => doc.pack).filter(Boolean))].sort((a, b) => order.indexOf(a) - order.indexOf(b) || a.localeCompare(b));
  return names.map(name => {
    const index = documents.find(doc => doc.sourcePath === `packs/${name}/README.md`);
    if (!index) throw new Error(`Pack ${name}: missing documentation target packs/${name}/README.md`);
    if (!summary.get(name)) throw new Error(`Pack ${name}: missing summary in README catalog`);
    return { name, summary: summary.get(name), documentRoute: index.route };
  });
}
function sourceUrl(repository, ref, target, directory = false) {
  return `${repository.replace(/\/$/, '')}/${directory ? 'tree' : 'blob'}/${encodeURIComponent(ref)}/${target.split('/').map(encodeURIComponent).join('/')}`;
}
function resolveLink(url, doc, bySource, root, base, repository, ref, image = false) {
  if (/^(https?:|mailto:|tel:)/i.test(url)) return url;
  if (url.startsWith('//')) return url;
  if (/^[a-z][a-z\d+.-]*:/i.test(url)) throw new Error(`${doc.sourcePath}: unsupported link scheme ${url}`);
  const parts = url.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/);
  if (!parts) throw new Error(`${doc.sourcePath}: invalid link ${url}`);
  const [, location, query = '', hash = ''] = parts;
  const targetFile = !location ? path.join(root, doc.sourcePath) : location.startsWith('/') ? path.resolve(root, '.' + decodeURIComponent(location)) : path.resolve(root, path.dirname(doc.sourcePath), decodeURIComponent(location));
  const target = relative(root, targetFile);
  if (!fs.existsSync(targetFile)) throw new Error(`${doc.sourcePath}: unresolved link ${url} (missing ${target})`);
  const stat = regular(root, targetFile);
  const candidate = stat.isDirectory() ? slash(path.join(target, 'README.md')) : target;
  const mapped = bySource.get(candidate);
  if (mapped && !image) {
    const id = decodeURIComponent(hash.slice(1));
    if (id && !mapped.headings.some(h => h.id === id)) throw new Error(`${doc.sourcePath}: unresolved heading ${url}`);
    return base.replace(/\/$/, '') + mapped.route + query + hash;
  }
  if (image) {
    const name = repository.replace(/^https:\/\/github\.com\//, '');
    return `https://raw.githubusercontent.com/${name}/${encodeURIComponent(ref)}/${target.split('/').map(encodeURIComponent).join('/')}${query}${hash}`;
  }
  return sourceUrl(repository, ref, target, stat.isDirectory()) + query + hash;
}
function renderDocument(doc, bySource, options) {
  const edits = [];
  visit(doc.tree, node => {
    if (['link', 'image', 'definition'].includes(node.type)) {
      const url = resolveLink(node.url, doc, bySource, options.root, options.base, options.repository, options.ref, node.type === 'image');
      if (url === node.url) return;
      function rewrite(child) {
        if (child.type === 'html') return { type: 'text', value: child.value };
        const value = ['link', 'image', 'definition'].includes(child.type) ? { ...child, url: resolveLink(child.url, doc, bySource, options.root, options.base, options.repository, options.ref, child.type === 'image') } : { ...child };
        if (child.children) value.children = child.children.map(rewrite);
        return value;
      }
      const replacement = rewrite(node);
      const serialized = node.type === 'definition' ? toMarkdown({ type: 'root', children: [replacement] }) : toMarkdown({ type: 'root', children: [{ type: 'paragraph', children: [replacement] }] });
      edits.push({ start: node.position.start.offset, end: node.position.end.offset, value: serialized.trimEnd() });
      return false;
    } else if (node.type === 'html' && !/^<!--[\s\S]*-->$/.test(node.value)) {
      edits.push({ start: node.position.start.offset, end: node.position.end.offset, value: escape(node.value) });
    }
  });
  let body = doc.body;
  let boundary = body.length;
  for (const edit of edits.sort((a, b) => b.start - a.start)) {
    if (edit.end > boundary) throw new Error(`${doc.sourcePath}: overlapping Markdown edits`);
    body = body.slice(0, edit.start) + edit.value + body.slice(edit.end);
    boundary = edit.start;
  }
  const header = {
    title: String(doc.title), sourcePath: doc.sourcePath,
    sourceUrl: sourceUrl(options.repository, options.ref, doc.sourcePath), sourceHasH1: doc.sourceHasH1,
    editUrl: false,
  };
  const frontmatter = Object.entries(header).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join('\n');
  if (doc.metadataText) {
    const runs = [...doc.metadataText.matchAll(/`+/g)].map(match => match[0].length);
    const fence = '`'.repeat(Math.max(3, ...runs.map(length => length + 1)));
    body += `\n\n---\n\n**Source metadata**\n\n${fence}yaml\n${doc.metadataText}\n${fence}\n`;
  }
  return `---\n${frontmatter}\n---\n\n${body}`;
}
export function prepareDocumentation(options) {
  const root = fs.realpathSync(options.root);
  const output = path.resolve(options.output);
  const base = '/' + options.base.replace(/^\/+|\/+$/g, '') + '/';
  if (!fs.existsSync(path.join(root, 'README.md'))) throw new Error('Missing README.md documentation source');
  if (!regular(root, path.join(root, 'packs')).isDirectory()) throw new Error('Missing packs directory');
  const paths = ['README.md', ...discover(root, path.join(root, 'packs'))];
  const documents = paths.map(sourcePath => readDocument(root, sourcePath));
  const bySource = new Map(documents.map(doc => [doc.sourcePath, doc]));
  const routes = new Set();
  for (const doc of documents) {
    if (routes.has(doc.route)) throw new Error(`Route collision: ${doc.route} (${doc.sourcePath})`);
    routes.add(doc.route);
  }
  const packs = catalog(documents);
  const settings = { ...options, root, output, base };
  const content = documents.map(doc => ({ doc, markdown: renderDocument(doc, bySource, settings) }));
  if (output === root || root.startsWith(output + path.sep) || output === path.join(root, 'packs') || output.startsWith(path.join(root, 'packs') + path.sep)) throw new Error('Generated output must not replace source content');
  const marker = path.join(output, '.rigorkit-generated');
  if (fs.existsSync(output) && fs.readdirSync(output).length && !fs.existsSync(marker)) throw new Error(`Refusing to clear unowned directory: ${output}`);
  fs.rmSync(output, { recursive: true, force: true });
  fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(marker, 'Generated by rigorkit website; edit repository Markdown instead.\n');
  for (const { doc, markdown } of content) {
    const file = path.join(output, doc.generatedPath);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, markdown);
  }
  const manifest = { base, documents: documents.map(({ body, tree, metadataText, ...doc }) => doc), packs };
  fs.writeFileSync(path.join(output, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  return manifest;
}
function main() {
  const defaults = { root: process.env.RIGORKIT_DOCS_ROOT || path.dirname(site.replace(/\/$/, '')), output: path.join(site, 'src/content/docs/docs'), base: '/rigorkit/', repository: 'https://github.com/harrypotter48/rigorkit', ref: process.env.GITHUB_SHA || 'main' };
  const options = { ...defaults };
  for (let index = 2; index < process.argv.length; index += 2) {
    const key = process.argv[index].replace(/^--/, '');
    if (!Object.hasOwn(defaults, key) || !process.argv[index + 1]) throw new Error(`Unknown or missing option: ${process.argv[index]}`);
    options[key] = process.argv[index + 1];
  }
  const manifest = prepareDocumentation(options);
  console.log(`Prepared ${manifest.documents.length} source documents and ${manifest.packs.length} packs; internal specs/tools excluded.`);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(`error: ${error.message}`); process.exitCode = 1; }
}
