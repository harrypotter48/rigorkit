// 018-doctor HU-12 — rigorkit doctor reports installation health and repairs only official script bits.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { appendFileSync, chmodSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { home, run, envFor, git, RECORD, STATE, repo, runtimeCopy } from './update-fixture.mjs';

function setup(t) {
  const h = home(t);
  const clone = runtimeCopy(path.join(h.HOME, '.rigorkit'));
  git(clone, ['init', '-q', '-b', 'main']); git(clone, ['add', '-A']); git(clone, ['commit', '-qm', 'clone']);
  const env = envFor(h);
  const version = readFileSync(path.join(clone, 'VERSION'), 'utf8').trim();
  const s = { h, clone, env, version };
  s.doctor = () => run(path.join(clone, 'bin/rigorkit'), ['doctor'], { env, cwd: h.HOME });
  s.install = (...args) => { const o = run('bash', [path.join(clone, 'install.sh'), ...args], { env, cwd: h.HOME }); assert.equal(o.status, 0, o.out); return o; };
  s.project = name => { const p = path.join(h.root, name); mkdirSync(p, { recursive: true }); s.install('--project', p, '--pack', 'sdd', '--agent', 'claude'); return p; };
  return s;
}
const recFile = (HOME, p) => { const d = path.join(STATE(HOME), 'projects'); return readdirSync(d).map(f => path.join(d, f)).find(f => readFileSync(f, 'utf8').includes(`path\t${p}\n`)); };

test('RF-1.H1: a clean clone reports its version and exits 0', t => {
  const s = setup(t);
  const o = s.doctor();
  assert.equal(o.status, 0, o.out);
  assert.match(o.out, new RegExp(`^clone ${s.version.replace(/\./g, '\\.')}`, 'm'));
});

test('RF-1.E1: local changes in the clone are reported and exit 1', t => {
  const s = setup(t);
  appendFileSync(path.join(s.clone, 'install.sh'), '\n# mine\n');
  const o = s.doctor();
  assert.equal(o.status, 1, o.out);
  assert.match(o.out, /local changes/);
});

test('RF-2.H1: a non-executable official script is repaired and does not fail', t => {
  const s = setup(t);
  const f = path.join(s.clone, 'packs/core/scripts/test-summary');
  chmodSync(f, 0o644); git(s.clone, ['update-index', '--chmod=-x', 'packs/core/scripts/test-summary']); git(s.clone, ['commit', '-qm', 'mode']);
  const o = s.doctor();
  assert.match(o.out, /made executable: packs\/core\/scripts\/test-summary/);
  assert.ok(statSync(f).mode & 0o100);
  assert.equal(o.status, 0, o.out);
});

test('RF-2.E1: a custom script shadowing an official one is reported, never changed', t => {
  const s = setup(t);
  mkdirSync(path.join(s.clone, 'custom/scripts'), { recursive: true });
  const f = path.join(s.clone, 'custom/scripts/test-summary');
  writeFileSync(f, '#!/bin/sh\n'); chmodSync(f, 0o644);
  const o = s.doctor();
  assert.equal(o.status, 1, o.out);
  assert.match(o.out, /custom script test-summary shadows the official one/);
  assert.match(o.out, /not executable/);
  assert.equal(statSync(f).mode & 0o777, 0o644);
});

test('RF-3.H1: a healthy global install reports its version', t => {
  const s = setup(t);
  s.install('--global', '--pack', 'core', '--agent', 'claude');
  const o = s.doctor();
  assert.equal(o.status, 0, o.out);
  assert.match(o.out, new RegExp(`^global ${s.version.replace(/\./g, '\\.')}`, 'm'));
});

test('RF-3.E1: edited and missing global copies are named', t => {
  const s = setup(t);
  s.install('--global', '--pack', 'core', '--agent', 'claude');
  const edited = path.join(s.h.HOME, '.claude/skills/core-init'), gone = path.join(s.h.HOME, '.claude/skills/core-context');
  appendFileSync(path.join(edited, 'SKILL.md'), '\nmine\n');
  rmSync(gone, { recursive: true });
  const o = s.doctor();
  assert.equal(o.status, 1, o.out);
  assert.match(o.out, new RegExp(`edited: ${edited.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
  assert.match(o.out, new RegExp(`missing: ${gone.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
});

test('RF-3.E2: a pair of a pack no longer shipped is reported', t => {
  const s = setup(t);
  s.install('--global', '--pack', 'core', '--agent', 'claude');
  appendFileSync(RECORD(s.h.HOME), 'pair\tghost\tclaude\n');
  const o = s.doctor();
  assert.equal(o.status, 1, o.out);
  assert.match(o.out, /pack ghost .*no longer shipped/);
});

test('RF-3.F1: an unreadable global record is reported', t => {
  const s = setup(t);
  mkdirSync(STATE(s.h.HOME), { recursive: true });
  writeFileSync(RECORD(s.h.HOME), 'garbage\n');
  const o = s.doctor();
  assert.equal(o.status, 1, o.out);
  assert.match(o.out, /cannot be read/);
});

test('RF-4.H1: a current project is listed without outdated', t => {
  const s = setup(t);
  const p = s.project('proj');
  const o = s.doctor();
  assert.equal(o.status, 0, o.out);
  const line = o.out.split('\n').find(l => l.startsWith(`project ${p} `));
  assert.ok(line, o.out);
  assert.doesNotMatch(line, /outdated/);
});

test('RF-4.E1: an old development project with an edited copy is flagged', t => {
  const s = setup(t);
  const p = s.project('proj');
  const f = recFile(s.h.HOME, p);
  writeFileSync(f, readFileSync(f, 'utf8').replace(/^version\t.*$/m, 'version\t0.0.1').replace(/^(path\t.*)$/m, '$1\ndev\t/somewhere/devclone'));
  appendFileSync(path.join(p, '.claude/skills/sdd-spec/SKILL.md'), '\nmine\n');
  const o = s.doctor();
  assert.equal(o.status, 1, o.out);
  const line = o.out.split('\n').find(l => l.startsWith(`project ${p} `));
  assert.match(line, /0\.0\.1/); assert.match(line, /outdated/); assert.match(line, /dev \/somewhere\/devclone/); assert.match(line, /1 edited/);
});

test('RF-4.F1: a deleted project folder is missing', t => {
  const s = setup(t);
  const p = s.project('proj');
  rmSync(p, { recursive: true });
  const o = s.doctor();
  assert.equal(o.status, 1, o.out);
  assert.match(o.out, new RegExp(`project ${p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} .*missing`));
});

test('RF-5.H1: a healthy setup with a repaired script exits 0', t => {
  const s = setup(t);
  s.install('--global', '--pack', 'core', '--agent', 'claude');
  s.project('proj');
  chmodSync(path.join(s.clone, 'packs/core/scripts/json-peek'), 0o644);
  git(s.clone, ['update-index', '--chmod=-x', 'packs/core/scripts/json-peek']); git(s.clone, ['commit', '-qm', 'mode']);
  assert.equal(s.doctor().status, 0);
});

test('RF-6.H1: doctor is documented in help, man and README', () => {
  assert.ok(existsSync(path.join(repo, 'help/doctor.txt')));
  assert.match(readFileSync(path.join(repo, 'help/rigorkit.txt'), 'utf8'), /^ {2}doctor /m);
  assert.match(readFileSync(path.join(repo, 'man/man1/rigorkit.1'), 'utf8'), /DOCTOR/);
  assert.ok(readFileSync(path.join(repo, 'README.md'), 'utf8').includes('rigorkit doctor'));
  const r = run(process.execPath, [path.join(repo, 'tools/generate-man.mjs'), '--check', '--root', repo]);
  assert.equal(r.status, 0, r.out);
});
