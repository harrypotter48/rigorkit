import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'parse5';

const site = fileURLToPath(new URL('../', import.meta.url));
const normalize = value => value.replace(/\r\n/g, '\n').trim();
const attributes = node => Object.fromEntries((node.attrs ?? []).map(attr => [attr.name, attr.value]));
const text = node => node.nodeName === '#text' ? node.value : (node.childNodes ?? []).map(text).join('');
function elements(root, predicate) {
  const result = [];
  function visit(node) { if (predicate(node)) result.push(node); for (const child of node.childNodes ?? []) visit(child); }
  visit(root); return result;
}
function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if (entry.isSymbolicLink()) throw new Error(`Unexpected output symlink: ${entry.name}`);
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? files(file) : [file];
  });
}
function codeText(code) {
  const lines = elements(code, node => (attributes(node).class ?? '').split(/\s+/).includes('ec-line'));
  return lines.length ? lines.map(line => text(elements(line, node => (attributes(node).class ?? '').split(/\s+/).includes('code'))[0] ?? line)).join('\n') : text(code);
}
export function checkSite({ dist, manifest: manifestFile, base }) {
  dist = path.resolve(dist);
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  const errors = [];
  const htmlFiles = files(dist).filter(file => file.endsWith('.html'));
  const pages = new Map(htmlFiles.map(file => [file, parse(fs.readFileSync(file, 'utf8'))]));
  const expected = new Set(['index.html', 'packs/index.html', '404.html']);
  for (const doc of manifest.documents) {
    if (!(doc.sourcePath === 'README.md' || /^packs\/[^/]+\/.+\.md$/i.test(doc.sourcePath))) errors.push(`Excluded source in manifest: ${doc.sourcePath}`);
    if (!doc.route.startsWith('/docs/') || doc.route.includes('..')) { errors.push(`Invalid document route: ${doc.route}`); continue; }
    const relative = doc.route.slice(1) + 'index.html';
    expected.add(relative);
    const file = path.join(dist, relative);
    const tree = pages.get(file);
    if (!tree) { errors.push(`${doc.sourcePath}: missing document target ${doc.route}`); continue; }
    const ids = new Set(elements(tree, node => !!attributes(node).id).map(node => attributes(node).id));
    for (const heading of doc.headings) if (!ids.has(heading.id)) errors.push(`${doc.sourcePath}: missing heading #${heading.id}`);
    const renderedCode = elements(tree, node => node.tagName === 'pre').flatMap(pre => elements(pre, node => node.tagName === 'code').map(code => normalize(codeText(code))));
    for (const sourceCode of doc.codeBlocks) if (!renderedCode.includes(normalize(sourceCode))) errors.push(`${doc.sourcePath} (${doc.route}): code/command fidelity mismatch`);
  }
  for (const required of expected) if (!fs.existsSync(path.join(dist, required))) errors.push(`Missing output target: ${required}`);
  const origin = 'https://harrypotter48.github.io';
  for (const [file, tree] of pages) {
    const relative = path.relative(dist, file).split(path.sep).join('/');
    if (!expected.has(relative)) errors.push(`Unexpected HTML outside public corpus: ${relative}`);
    const pageRoute = relative.replace(/index\.html$/, '');
    const pageUrl = new URL(base + pageRoute, origin);
    for (const node of elements(tree, node => node.attrs?.some(attr => ['href', 'src'].includes(attr.name)))) {
      const attrs = attributes(node);
      for (const name of ['href', 'src']) {
        const value = attrs[name];
        if (!value || /^data:|^mailto:|^tel:/i.test(value)) continue;
        let url;
        try { url = new URL(value, pageUrl); } catch { errors.push(`${relative}: invalid link ${value}`); continue; }
        if (!['http:', 'https:'].includes(url.protocol)) { errors.push(`${relative}: unsafe link scheme ${value}`); continue; }
        if (url.origin !== origin) continue;
        if (!url.pathname.startsWith(base)) { errors.push(`${relative}: link missing project base prefix: ${value}`); continue; }
        let decoded;
        try { decoded = decodeURIComponent(url.pathname.slice(base.length)); } catch { errors.push(`${relative}: invalid encoded link ${value}`); continue; }
        let target = path.resolve(dist, decoded || '.');
        if (target !== dist && !target.startsWith(dist + path.sep)) { errors.push(`${relative}: target escapes output ${value}`); continue; }
        if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
        if (!fs.existsSync(target)) { errors.push(`${relative}: missing/broken target ${value}`); continue; }
        if (url.hash && target.endsWith('.html')) {
          const targetTree = pages.get(target);
          let id;
          try { id = decodeURIComponent(url.hash.slice(1)); } catch { errors.push(`${relative}: invalid fragment ${value}`); continue; }
          if (id && targetTree && !elements(targetTree, node => attributes(node).id === id).length) errors.push(`${relative}: unresolved heading ${value}`);
        }
      }
    }
  }
  const home = pages.get(path.join(dist, 'index.html'));
  const homeLinks = home ? elements(home, node => node.tagName === 'a').map(node => attributes(node).href) : [];
  for (const destination of [base + 'packs/', base + 'docs/overview/', base + 'docs/overview/#install']) if (!homeLinks.includes(destination)) errors.push(`index.html: missing required landing destination ${destination}`);
  const recovery = pages.get(path.join(dist, '404.html'));
  if (recovery && !elements(recovery, node => node.tagName === 'a' && [base, base + 'docs/overview/'].includes(attributes(node).href)).length) errors.push('404.html: missing working home/documentation recovery link');
  return { errors: [...new Set(errors)], documents: manifest.documents.length, pages: pages.size };
}
function main() {
  const options = { dist: path.join(site, 'dist'), manifest: path.join(site, 'src/content/docs/docs/manifest.json'), base: '/rigorkit/' };
  for (let index = 2; index < process.argv.length; index += 2) {
    const key = process.argv[index].replace(/^--/, '');
    if (!Object.hasOwn(options, key) || !process.argv[index + 1]) throw new Error(`Unknown or missing option: ${process.argv[index]}`);
    options[key] = process.argv[index + 1];
  }
  const result = checkSite(options);
  for (const error of result.errors) console.error(`error: ${error}`);
  console.log(`Site check: ${result.documents} source documents, ${result.pages} HTML pages, ${result.errors.length} errors.`);
  if (result.errors.length) process.exitCode = 1;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(`error: ${error.message}`); process.exitCode = 1; }
}
