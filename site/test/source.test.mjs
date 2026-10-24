import assert from 'node:assert/strict';
import { readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { base, checkOutput, fixture, generated, manifest, outputFixture, prepare, success, treeText, write } from './helpers.mjs';

describe('002-website: source importer and built-output contract', () => {
  it('RF-1.F1: a missing landing destination blocks output validation', t => {
    const f = fixture(t); success(prepare(f)); const dist = outputFixture(f);
    rmSync(path.join(dist, 'packs/index.html'));
    const result = checkOutput(f, dist);
    assert.equal(result.status, 1, result.text);
    assert.match(result.text, /packs/i);
    assert.match(result.text, /missing|broken|unresolved|not found/i);
  });
  it('RF-2.E1: a new source-listed pack appears without a second prose copy', t => {
    const f = fixture(t);
    const text = readFileSync(path.join(f.source, 'README.md'), 'utf8');
    write(f.source, 'README.md', text.replace('| [frontend](packs/frontend/README.md) | Frontend documentation summary |', '| [frontend](packs/frontend/README.md) | Frontend documentation summary |\n| [extra](packs/extra/README.md) | Extra source-derived summary |'));
    // Incidental pack links in other tables must not overwrite catalog summaries.
    write(f.source, 'README.md', readFileSync(path.join(f.source, 'README.md'), 'utf8') + '\n\n| Note |\n|---|\n| See [core](packs/core/README.md). |\n');
    write(f.source, 'packs/extra/README.md', '# Extra\n\nExtra source-derived body.\n');
    success(prepare(f));
    assert.equal(manifest(f).packs.find(row => row.name === 'core').summary, 'Core documentation summary');
    const pack = manifest(f).packs.find(row => row.name === 'extra');
    assert.ok(pack);
    assert.equal(pack.summary, 'Extra source-derived summary');
    assert.equal(pack.documentRoute, '/docs/packs/extra/');
    assert.match(generated(f, 'packs/extra/README.md'), /Extra source-derived body/);
  });
  it('RF-2.F1: a catalog pack with no documentation target is rejected', t => {
    const f = fixture(t); rmSync(path.join(f.source, 'packs/sdd/README.md'));
    const result = prepare(f);
    assert.equal(result.status, 1, result.text);
    assert.match(result.text, /sdd/i);
    assert.match(result.text, /README|documentation|target/i);
  });
  it('RF-3.F1: source command corruption is reported by built-output validation', t => {
    const f = fixture(t); success(prepare(f)); const dist = outputFixture(f);
    const file = path.join(dist, 'docs/overview/index.html');
    const html = readFileSync(file, 'utf8');
    assert.match(html, /printf/);
    write(dist, 'docs/overview/index.html', html.replace('printf', 'corrupted-command'));
    const result = checkOutput(f, dist);
    assert.equal(result.status, 1, result.text);
    assert.match(result.text, /command|code|fidelity/i);
    assert.match(result.text, /overview|README/i);
  });
  it('RF-5.H1: only the source allowlist feeds generated documentation and navigation', t => {
    const f = fixture(t); success(prepare(f));
    const data = manifest(f);
    assert.ok(data.documents.length > 4);
    assert.ok(data.documents.every(row => row.sourcePath === 'README.md' || /^packs\/.*\.md$/.test(row.sourcePath)));
    assert.ok(data.packs.every(row => row.documentRoute.startsWith('/docs/packs/')));
    assert.doesNotMatch(treeText(f.output), /privatequartzsentinel|toolquartzsentinel|sitequartzsentinel/);
  });
  it('RF-5.F1: Markdown elsewhere in the repository is not accidentally published', t => {
    const f = fixture(t); write(f.source, 'notes/README.md', '# Private\n\noutsidesourcequartz\n');
    success(prepare(f));
    assert.ok(!manifest(f).documents.some(row => row.sourcePath.startsWith('notes/')));
    assert.doesNotMatch(treeText(f.output), /outsidesourcequartz/);
  });
  it('RF-5.S1: a specs-only sentinel is absent without changing its repository source', t => {
    const f = fixture(t); const file = path.join(f.source, 'specs/changes/999-internal/spec.md');
    const before = readFileSync(file);
    success(prepare(f));
    assert.doesNotMatch(treeText(f.output), /privatequartzsentinel|999-internal/);
    assert.deepEqual(readFileSync(file), before);
  });
  it('RF-6.F1: an unresolved relative source link blocks publication preparation', t => {
    const f = fixture(t);
    write(f.source, 'packs/sdd/broken.md', '# Broken link\n\n[Missing](missing-document.md).\n');
    const result = prepare(f);
    assert.equal(result.status, 1, result.text);
    assert.match(result.text, /broken\.md/);
    assert.match(result.text, /missing-document\.md/);
  });
  it('RF-7.F1: a built link without the project prefix is rejected', t => {
    const f = fixture(t); success(prepare(f)); const dist = outputFixture(f);
    write(dist, 'index.html', readFileSync(path.join(dist, 'index.html'), 'utf8').replace(`${base}packs/`, '/packs/'));
    const result = checkOutput(f, dist);
    assert.equal(result.status, 1, result.text);
    assert.match(result.text, /\/packs\//);
    assert.match(result.text, /base|prefix|missing|broken|unresolved/i);
  });
  it('RF-8.F1: a broken 404 recovery destination is reported', t => {
    const f = fixture(t); success(prepare(f)); const dist = outputFixture(f);
    write(dist, '404.html', `<h1>Not found</h1><a href="${base}missing-recovery/">Home</a>`);
    const result = checkOutput(f, dist);
    assert.equal(result.status, 1, result.text);
    assert.match(result.text, /missing-recovery/);
    assert.match(result.text, /404/);
  });
});
