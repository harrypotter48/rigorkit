import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';

export const site = fileURLToPath(new URL('../', import.meta.url));
export const repo = path.dirname(site.replace(/\/$/, ''));
export const base = '/rigorkit/';
export const fixtureSource = fileURLToPath(new URL('./fixtures/source/', import.meta.url));
export const overview = '/docs/overview/';
export const guide = '/docs/packs/sdd/skills/sdd-sample/guide/';
export const current = '/docs/packs/sdd/current/';
export const obsolete = '/docs/packs/sdd/obsolete/';
export const nested = '/docs/packs/sdd/skills/sdd-sample/templates/nested/';
export const normalize = text => text.replace(/\r\n/g, '\n').trim();
export const escapeHtml = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
export function write(root, relative, content) {
  const file = path.join(root, relative);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, content);
}
export function fixture(t) {
  const dir = mkdtempSync(path.join(tmpdir(), 'rigorkit-002-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const source = path.join(dir, 'source');
  cpSync(fixtureSource, source, { recursive: true });
  return { dir, source, output: path.join(dir, 'generated') };
}
export function execute(script, args) {
  assert.ok(existsSync(script), `Pending implementation: ${path.relative(repo, script)} does not exist`);
  const result = spawnSync(process.execPath, [script, ...args], { cwd: repo, encoding: 'utf8', timeout: 30_000, maxBuffer: 4 * 1024 * 1024 });
  assert.ifError(result.error);
  assert.equal(result.signal, null, 'CLI must finish without a signal');
  return { ...result, text: result.stdout + result.stderr };
}
export function prepare(f) {
  return execute(path.join(site, 'scripts/prepare-docs.mjs'), ['--root', f.source, '--output', f.output, '--base', base, '--repository', 'https://github.com/harrypotter48/rigorkit', '--ref', 'main']);
}
export function success(result) { assert.equal(result.status, 0, result.text); }
export function manifest(f) { return JSON.parse(readFileSync(path.join(f.output, 'manifest.json'), 'utf8')); }
export function generated(f, sourcePath) {
  const doc = manifest(f).documents.find(row => row.sourcePath === sourcePath);
  assert.ok(doc, `Missing source document: ${sourcePath}`);
  assert.ok(doc.generatedPath && !path.isAbsolute(doc.generatedPath) && !doc.generatedPath.split('/').includes('..'));
  return readFileSync(path.join(f.output, doc.generatedPath), 'utf8');
}
export function treeText(root) {
  return readdirSync(root, { withFileTypes: true }).map(entry => {
    const file = path.join(root, entry.name);
    return entry.isDirectory() ? treeText(file) : readFileSync(file, 'utf8');
  }).join('\n');
}
export function outputFixture(f) {
  const dist = path.join(f.dir, 'dist');
  const data = manifest(f);
  for (const doc of data.documents) {
    const headings = (doc.headings ?? []).map(h => `<h2 id="${escapeHtml(h.id)}">${escapeHtml(h.text)}</h2>`).join('');
    const codes = (doc.codeBlocks ?? []).map(code => `<pre><code>${escapeHtml(code)}</code></pre>`).join('');
    write(dist, doc.route.replace(/^\//, '') + 'index.html', `<html lang="en"><body><main>${headings}${codes}</main></body></html>`);
  }
  write(dist, 'index.html', `<html lang="en"><body><main>rigorkit Claude Code Codex Cursor OpenCode <a href="${base}packs/">Packs</a><a href="${base}docs/overview/#install">Install</a><a href="${base}docs/overview/">Documentation</a><a href="https://github.com/harrypotter48/rigorkit">GitHub</a></main></body></html>`);
  write(dist, 'packs/index.html', '<main>' + data.packs.map(p => `<a href="${base.slice(0, -1)}${p.documentRoute}">${escapeHtml(p.name)} ${escapeHtml(p.summary)}</a>`).join('') + '</main>');
  write(dist, '404.html', `<h1>Not found</h1><a href="${base}">Home</a>`);
  return dist;
}
export function checkOutput(f, dist) {
  return execute(path.join(site, 'scripts/check-site.mjs'), ['--dist', dist, '--manifest', path.join(f.output, 'manifest.json'), '--base', base]);
}

export async function website(t, { production = false, blockSearch = false } = {}) {
  const dist = path.join(site, production ? 'dist' : '.test-artifacts/after');
  assert.ok(existsSync(path.join(dist, 'index.html')), `Pending implementation: ${path.relative(repo, dist)}/index.html does not exist; production-browser artifacts are built by test/run-browser.mjs`);
  const { chromium } = await import('playwright');
  const mime = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.wasm': 'application/wasm', '.svg': 'image/svg+xml' };
  const server = createServer((request, response) => {
    let pathname;
    try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
    catch { response.writeHead(400); response.end(); return; }
    const relative = pathname.startsWith(base) ? pathname.slice(base.length) : '../invalid';
    let file = path.resolve(dist, relative || '.');
    const contained = file === path.resolve(dist) || file.startsWith(path.resolve(dist) + path.sep);
    if (!contained) { response.writeHead(404); response.end(); return; }
    if (existsSync(file) && statSync(file).isDirectory()) file = path.join(file, 'index.html');
    const found = existsSync(file) && statSync(file).isFile();
    if (!found) file = path.join(dist, '404.html');
    response.writeHead(found ? 200 : 404, { 'Content-Type': mime[path.extname(file)] ?? 'application/octet-stream' });
    response.end(existsSync(file) ? readFileSync(file) : 'Not found');
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }));
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.setDefaultTimeout(10_000);
  await page.addInitScript(() => { globalThis.__rigorkitProbe = 0; });
  if (blockSearch) await page.route(/\/(?:_?pagefind)\//, route => route.abort());
  const origin = `http://127.0.0.1:${server.address().port}`;
  const go = route => page.goto(origin + base.slice(0, -1) + route);
  await go('/');
  return { page, go, origin, dist };
}
export async function search(page, query) {
  const dialog = page.locator('dialog');
  if (!await dialog.isVisible()) await page.getByRole('button', { name: /search/i }).first().click();
  const field = page.locator('dialog input[type="search"], dialog input[type="text"]').first();
  await field.waitFor({ state: 'visible' });
  await field.fill(query);
  return field;
}
export function resultLinks(page) { return page.locator('dialog a[href*="/docs/"]'); }
export async function waitForResult(page, route) { await page.locator(`dialog a[href*="${route}"]`).first().waitFor({ state: 'visible' }); }
export async function noResults(page) { await page.locator('dialog').getByText(/no results/i).waitFor({ state: 'visible' }); }
export function fixtureState() {
  const file = path.join(site, '.test-artifacts/state.json');
  assert.ok(existsSync(file), 'Pending implementation: production-browser fixture artifacts do not exist; test/run-browser.mjs builds them');
  return JSON.parse(readFileSync(file, 'utf8'));
}

export async function workflow() {
  const file = path.join(repo, '.github/workflows/pages.yml');
  assert.ok(existsSync(file), 'Pending implementation: .github/workflows/pages.yml does not exist');
  const { parseDocument } = await import('yaml');
  const document = parseDocument(readFileSync(file, 'utf8'), { uniqueKeys: true });
  assert.deepEqual(document.errors, [], 'Workflow must parse as strict YAML');
  return document.toJS();
}
export function deployAllowed(config, { event, ref, buildStatus }) {
  const deploy = config.jobs.deploy;
  assert.ok(deploy, 'Actual workflow must have a deploy job');
  const needs = [deploy.needs].flat();
  assert.ok(needs.includes('build'), 'Deployment must depend on actual build success');
  const expression = String(deploy.if ?? '').replace(/^\s*\$\{\{\s*|\s*\}\}\s*$/g, '').trim();
  const conditions = expression.split(/\s*&&\s*/).map(part => {
    const match = part.match(/^github\.(event_name|ref)\s*==\s*'([^']+)'$/);
    assert.ok(match, `Use the approved explicit event/ref AND gate; unsupported guard: ${part}`);
    return { key: match[1], expected: match[2] };
  });
  assert.ok(conditions.some(c => c.key === 'event_name') && conditions.some(c => c.key === 'ref'));
  const context = { event_name: event, ref };
  return buildStatus === 'success' && conditions.every(c => context[c.key] === c.expected);
}
