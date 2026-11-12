// 011-close-commit HU-5 — written commit convention and the [close] archive commit (static content checks).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = rel => readFileSync(path.join(repo, rel), 'utf8');
const template = 'packs/sdd/skills/sdd-init/templates/AGENTS.md';
const archive = 'packs/sdd/skills/sdd-archive/SKILL.md';

test('RF-1.H1: the AGENTS template states the subject convention and the Refs footer', () => {
  const s = read(template);
  assert.ok(s.includes('`type(<id>): summary`'), 'missing `type(<id>): summary`');
  assert.ok(s.includes('`Refs: <ticket|HU>`'), 'missing `Refs: <ticket|HU>`');
});

test('RF-2.H1: the AGENTS template keeps test(red|amend) scopes with the ID first', () => {
  assert.ok(read(template).includes('test(red|amend): <id> first'));
});

test('RF-2.E1: sdd-tests keeps the red subject rule (INV-1)', () => {
  assert.ok(read('packs/sdd/skills/sdd-tests/SKILL.md').includes('test(red): <HU/change> <behavior>'));
});

test('RF-2.F1: an ID-first red subject still matches the factory-checks prefix (INV-1)', () => {
  const checks = read('packs/sdd/skills/sdd-init/scripts/factory-checks.mjs');
  assert.ok(checks.includes('/^test\\(red\\):/'), 'factory-checks red prefix changed');
  assert.match('test(red): 011 close commit', /^test\(red\):/);
});

test('RF-3.H1: the repository AGENTS template equals the pack template', () => {
  assert.equal(read('specs/templates/AGENTS.md'), read(template));
});

test('RF-4.H1: sdd-archive proposes the [close] subject', () => {
  assert.ok(read(archive).includes('`type(<id>): close <title> [close]`'));
});

test('RF-5.H1: sdd-archive names the close body fields and the Refs footer', () => {
  const s = read(archive);
  for (const field of ['Outcome', 'Validation (done: how/env/date|pending: what)', 'Deferred', 'Follow-ups', 'Refs footer']) {
    assert.ok(s.includes(field), `missing ${field}`);
  }
});

test('RF-5.E1: sdd-archive keeps a pending validation form', () => {
  assert.ok(read(archive).includes('pending: what'));
});

test('INV-2.H1: the sdd pack does not grow over the 010 baseline', () => {
  const r = spawnSync(process.execPath, ['tools/measure-content.mjs', '--root', '.', '--baseline', 'specs/archive/010-update/baseline.txt'], { cwd: repo, encoding: 'utf8' });
  assert.equal(r.status, 0, (r.stdout + r.stderr).split('\n').filter(l => /error|Error|sdd/.test(l)).join('\n'));
});
