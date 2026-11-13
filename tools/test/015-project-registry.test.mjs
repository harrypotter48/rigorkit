// 015-project-registry HU-9 — project record written by `install.sh --project` (RF-1–RF-4, INV-1–2).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, symlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { home, run, envFor, RECORD, STATE, runtimeCopy as cloneCopy } from './update-fixture.mjs';

const HEX = /^[0-9a-f]{64}$/;
const PROJECTS = HOME => path.join(STATE(HOME), 'projects');

function setup(t, { dev = false } = {}) {
  const h = home(t);
  const clone = cloneCopy(dev ? path.join(h.root, 'dev-clone') : path.join(h.HOME, '.rigorkit'));
  const project = path.join(h.root, 'proj');
  mkdirSync(project, { recursive: true });
  const install = (args, env = {}, c = clone) => run('bash', [path.join(c, 'install.sh'), ...args], { env: { ...envFor(h), ...env }, cwd: h.HOME });
  return { h, clone, project, install };
}
function records(HOME) {
  const dir = PROJECTS(HOME);
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(f => !f.includes('.')).map(f => ({ file: path.join(dir, f), text: readFileSync(path.join(dir, f), 'utf8') }));
}
const lines = text => text.split('\n').filter(Boolean);
const field = (text, kind) => lines(text).filter(l => l.split('\t')[0] === kind).map(l => l.split('\t'));
const pairs = text => field(text, 'pair').map(f => `${f[1]}/${f[2]}`).sort();

test('RF-1.H1: a project install writes one record with path, version, pairs and fingerprints', t => {
  const s = setup(t);
  const r = s.install(['--project', s.project, '--pack', 'core,sdd', '--agent', 'claude']);
  assert.equal(r.status, 0, r.out);
  const recs = records(s.h.HOME);
  assert.equal(recs.length, 1);
  const rec = recs[0].text;
  assert.equal(lines(rec)[0], 'rigorkit-project-record 1');
  assert.deepEqual(field(rec, 'path').map(f => f[1]), [realpathSync(s.project)]);
  assert.deepEqual(field(rec, 'version').map(f => f[1]), [readFileSync(path.join(s.clone, 'VERSION'), 'utf8').trim()]);
  assert.deepEqual(pairs(rec), ['core/claude', 'sdd/claude']);
  const spec = field(rec, 'copy').find(f => f[4] === path.join(realpathSync(s.project), '.claude/skills/sdd-spec'));
  assert.ok(spec, rec);
  assert.match(spec[5], HEX);
  assert.deepEqual(field(rec, 'dev'), []);
  assert.match(path.basename(recs[0].file), /^[0-9a-f]{16}$/);
});

test('RF-1.E1: a symlinked project path records the real path', t => {
  const s = setup(t);
  const link = path.join(s.h.root, 'link');
  symlinkSync(s.project, link);
  assert.equal(s.install(['--project', link, '--pack', 'core', '--agent', 'claude']).status, 0);
  const recs = records(s.h.HOME);
  assert.equal(recs.length, 1);
  assert.deepEqual(field(recs[0].text, 'path').map(f => f[1]), [realpathSync(s.project)]);
});

test('RF-1.F1: an unwritable projects folder warns and the install still succeeds', t => {
  const s = setup(t);
  mkdirSync(STATE(s.h.HOME), { recursive: true });
  writeFileSync(PROJECTS(s.h.HOME), 'not a folder\n');
  const r = s.install(['--project', s.project, '--pack', 'core', '--agent', 'claude']);
  assert.equal(r.status, 0, r.out);
  assert.equal((r.out.match(/project record/g) || []).length, 1, r.out);
  assert.ok(existsSync(path.join(s.project, '.claude/skills')) || existsSync(path.join(s.project, '.rigorkit-version')));
});

test('RF-1.S1: a project path with a tab is not recorded', t => {
  const s = setup(t);
  const odd = path.join(s.h.root, 'with\ttab');
  mkdirSync(odd);
  const r = s.install(['--project', odd, '--pack', 'core', '--agent', 'claude']);
  assert.equal(r.status, 0, r.out);
  for (const rec of records(s.h.HOME)) assert.ok(!rec.text.includes('with\ttab'), rec.text);
  assert.match(r.out, /not recorded/);
});

test('RF-2.H1: a second install adds pairs and keeps earlier copies', t => {
  const s = setup(t);
  s.install(['--project', s.project, '--pack', 'core', '--agent', 'claude']);
  assert.equal(s.install(['--project', s.project, '--pack', 'sdd', '--agent', 'codex']).status, 0);
  const recs = records(s.h.HOME);
  assert.equal(recs.length, 1);
  assert.deepEqual(pairs(recs[0].text), ['core/claude', 'sdd/codex']);
  const copies = field(recs[0].text, 'copy').map(f => f[4]);
  assert.ok(copies.some(p => p.includes('/.claude/skills/core-')), 'core copy kept');
  assert.ok(copies.some(p => p.includes('/.agents/skills/sdd-')), 'sdd copy added');
});

test('RF-2.E1: the same install twice adds no duplicates', t => {
  const s = setup(t);
  const args = ['--project', s.project, '--pack', 'core,sdd', '--agent', 'claude'];
  s.install(args);
  const first = records(s.h.HOME)[0].text;
  assert.equal(s.install([...args, '--force']).status, 0);
  const second = records(s.h.HOME)[0].text;
  assert.deepEqual(pairs(second), pairs(first));
  assert.equal(field(second, 'copy').length, field(first, 'copy').length);
});

test('RF-3.H1: an unreadable project record is moved aside without printing it', t => {
  const s = setup(t);
  s.install(['--project', s.project, '--pack', 'core', '--agent', 'claude']);
  const file = records(s.h.HOME)[0].file;
  writeFileSync(file, 'garbage SECRET-LINE\n');
  const r = s.install(['--project', s.project, '--pack', 'core', '--agent', 'claude']);
  assert.equal(r.status, 0, r.out);
  assert.equal(readFileSync(`${file}.corrupt`, 'utf8'), 'garbage SECRET-LINE\n');
  assert.equal(lines(readFileSync(file, 'utf8'))[0], 'rigorkit-project-record 1');
  assert.doesNotMatch(r.out, /SECRET-LINE/);
  assert.match(r.out, /corrupt/);
});

test('RF-4.H1: an install from a development clone records dev with the clone path', t => {
  const s = setup(t, { dev: true });
  assert.equal(s.install(['--project', s.project, '--pack', 'core', '--agent', 'claude']).status, 0);
  const recs = records(s.h.HOME);
  assert.equal(recs.length, 1);
  assert.deepEqual(field(recs[0].text, 'dev').map(f => f[1]), [realpathSync(s.clone)]);
});

test('RF-4.E1: a later install from ~/.rigorkit drops the dev line', t => {
  const s = setup(t, { dev: true });
  s.install(['--project', s.project, '--pack', 'core', '--agent', 'claude']);
  const home = cloneCopy(path.join(s.h.HOME, '.rigorkit'));
  assert.equal(s.install(['--project', s.project, '--pack', 'core', '--agent', 'claude', '--force'], {}, home).status, 0);
  assert.deepEqual(field(records(s.h.HOME)[0].text, 'dev'), []);
});

test('INV-1.H1: a project install leaves the global record byte-equal', t => {
  const s = setup(t);
  assert.equal(s.install(['--global', '--pack', 'core', '--agent', 'claude']).status, 0);
  const before = readFileSync(RECORD(s.h.HOME), 'utf8');
  assert.equal(s.install(['--project', s.project, '--pack', 'sdd', '--agent', 'claude']).status, 0);
  assert.equal(readFileSync(RECORD(s.h.HOME), 'utf8'), before);
});

test('INV-2.H1: --dry-run and RK_NO_RECORD=1 write no project record', t => {
  const s = setup(t);
  assert.equal(s.install(['--project', s.project, '--pack', 'core', '--agent', 'claude', '--dry-run']).status, 0);
  assert.equal(s.install(['--project', s.project, '--pack', 'core', '--agent', 'claude'], { RK_NO_RECORD: '1' }).status, 0);
  assert.equal(existsSync(PROJECTS(s.h.HOME)), false);
});
