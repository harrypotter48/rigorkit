// 014-roadmap HU-8 — project roadmap instead of backlog, external backlog and fallback (static checks).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = rel => readFileSync(path.join(repo, rel), 'utf8');
const has = rel => existsSync(path.join(repo, rel));
const TPL = 'packs/sdd/skills/sdd-init/templates';
const SLICE = 'packs/sdd/skills/sdd-slice/SKILL.md';
const FALLBACK = 'git mv specs/backlog.md specs/roadmap.md';
function files(rel) {
  const out = [];
  for (const e of readdirSync(path.join(repo, rel))) {
    const p = path.join(rel, e);
    if (statSync(path.join(repo, p)).isDirectory()) out.push(...files(p)); else if (/\.(md|ya?ml)$/.test(e)) out.push(p);
  }
  return out;
}

test('RF-1.H1: the roadmap template replaces the backlog template', () => {
  assert.ok(has(`${TPL}/roadmap.md`));
  assert.ok(!has(`${TPL}/backlog.md`));
  const s = read(`${TPL}/roadmap.md`);
  for (const w of ['proposed', 'next', 'wip', 'done']) assert.match(s, new RegExp(`- ${w}:`), w);
});

test('RF-1.E1: the repository template equals the pack template', () => {
  assert.equal(read('specs/templates/roadmap.md'), read(`${TPL}/roadmap.md`));
  assert.ok(!has('specs/templates/backlog.md'));
});

test('RF-2.H1: sdd-slice and sdd-init name the roadmap and its statuses', () => {
  assert.ok(read(SLICE).includes('specs/roadmap.md'));
  assert.ok(read(SLICE).includes('proposed|next|wip|done'));
  assert.ok(read('packs/sdd/skills/sdd-init/SKILL.md').includes('roadmap.md'));
});

test('RF-3.H1: rigorkit keeps its own roadmap with proposed statuses', () => {
  assert.ok(has('specs/roadmap.md'));
  assert.ok(!has('specs/backlog.md'));
  assert.doesNotMatch(read('specs/roadmap.md'), /\| backlog \|/);
});

test('RF-3.E1: backlog.md appears only in the fallback sentence', () => {
  const hits = [];
  for (const f of [...files('packs'), 'README.md', ...files('specs/changes').filter(f => !f.includes('014-roadmap'))]) {
    read(f).split('\n').forEach((line, i) => { if (line.includes('backlog.md') && !line.includes(FALLBACK)) hits.push(`${f}:${i + 1}`); });
  }
  assert.deepEqual(hits, []);
});

test('RF-4.H1: sdd-slice sends proposed slices to the deferred file with an external backlog', () => {
  const s = read(SLICE);
  assert.ok(s.includes('backlog: external'));
  assert.ok(s.includes('deferred add'));
});

test('RF-4.E1: the project template documents backlog: external', () => {
  assert.match(read('packs/core/skills/core-init/project.yaml'), /backlog: external/);
});

test('RF-5.H1: sdd-slice falls back to backlog.md with the rename command', () => {
  assert.ok(read(SLICE).includes(FALLBACK));
});

test('RF-6.H1: VERSION 0.5.0 with its changelog section', () => {
  assert.equal(read('VERSION').trim(), '0.5.0');
  const sec = read('CHANGELOG.md').split(/^## /m).find(x => x.startsWith('0.5.0'));
  assert.ok(sec, 'section 0.5.0');
  assert.match(sec, /^Global rules: unchanged$/m);
  assert.match(sec, /^New packs: none$/m);
  assert.match(sec, /deferred/);
  assert.match(sec, /roadmap/);
});

test('INV-2.H1: the sdd pack does not grow over the 010 baseline', () => {
  const r = spawnSync(process.execPath, ['tools/measure-content.mjs', '--root', '.', '--baseline', 'specs/archive/010-update/baseline.txt'], { cwd: repo, encoding: 'utf8' });
  assert.equal(r.status, 0, (r.stdout + r.stderr).split('\n').filter(l => /error|^sdd /.test(l)).join('\n'));
});
