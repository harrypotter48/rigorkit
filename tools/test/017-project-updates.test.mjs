// 017-project-updates HU-10 — rigorkit update refreshes registered projects (RF-1–RF-7, INV-1–3).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { isRoot } from './rigorkit-fixture.mjs';
import { home, run, testRemote, cloneAt, git, writeState, now, envFor, pty, NEED_PTY, STATE, runtimeCopy } from './update-fixture.mjs';

const SKIP = NEED_PTY || (isRoot() && 'D4: running as root ignores permission bits');
const CHANGE = '\nChanged in 0.4.0.\n';
const Q = {
  project: (p, a = '0.3.0', b = '0.4.0') => `Update project ${p} (${a} -> ${b})? [y/N]`,
  edited: p => `${p} was edited. Overwrite or keep? [o/k]`,
  dev: p => `${p} was installed from the development clone`,
  missing: p => `Remove the record of ${p}? [y/N]`,
  rename: p => `Rename specs/backlog.md to specs/roadmap.md in ${p}? [y/N]`,
};
const skill = (dir, name = 'sdd-spec') => path.join(dir, '.claude/skills', name, 'SKILL.md');
const PROJECTS = HOME => path.join(STATE(HOME), 'projects');

function setup(t, { mutate = dir => appendFileSync(path.join(dir, 'packs/sdd/skills/sdd-spec/SKILL.md'), CHANGE) } = {}) {
  const h = home(t);
  const r = testRemote(t, h.root);
  r.release('0.3.0');
  const clone = cloneAt(h.HOME, r.bare, 'v0.3.0');
  const env = envFor(h);
  const s = { h, r, clone, env };
  s.project = (name, { packs = 'sdd', from = clone, gitInit = true } = {}) => {
    const p = path.join(h.root, name); mkdirSync(p, { recursive: true });
    if (gitInit) { git(p, ['init', '-q']); writeFileSync(path.join(p, 'README'), 'x\n'); git(p, ['add', '-A']); git(p, ['commit', '-qm', 'base']); }
    const o = run('bash', [path.join(from, 'install.sh'), '--project', p, '--pack', packs, '--agent', 'claude'], { env, cwd: h.HOME });
    assert.equal(o.status, 0, o.out);
    return p;
  };
  s.release = () => { r.release('0.4.0', mutate); writeState(h.HOME, { checked: now(), newest: '' }); };
  s.upd = (steps = [], args = []) => pty(path.join(clone, 'bin/rigorkit'), ['update', ...args], { env, steps, eof: true, timeout: 120 });
  s.updNonTty = () => run(path.join(clone, 'bin/rigorkit'), ['update'], { env, input: '' });
  return s;
}
function records(HOME) {
  const dir = PROJECTS(HOME);
  return existsSync(dir) ? readdirSync(dir).filter(f => /^[0-9a-f]{16}$/.test(f)).map(f => ({ file: path.join(dir, f), text: readFileSync(path.join(dir, f), 'utf8') })) : [];
}
const recOf = (HOME, p) => records(HOME).find(r => r.text.split('\n').some(l => l === `path\t${p}`));
const field = (text, kind) => text.split('\n').filter(l => l.split('\t')[0] === kind).map(l => l.split('\t'));
const staged = p => git(p, ['diff', '--cached', '--name-only']);

test('RF-1.H1: a confirmed project gets the new copies and nothing is staged', { skip: SKIP }, t => {
  const s = setup(t);
  const p = s.project('proj');
  s.release();
  const o = s.upd([[Q.project(p), 'y']]);
  assert.equal(o.status, 0, o.out);
  assert.ok(readFileSync(skill(p), 'utf8').endsWith(CHANGE), o.out);
  assert.equal(staged(p), '');
});

test('RF-1.E1: answering no leaves the project and lists it as pending', { skip: SKIP }, t => {
  const s = setup(t);
  const p = s.project('proj');
  const before = readFileSync(skill(p), 'utf8');
  s.release();
  const o = s.upd([[Q.project(p), 'n']]);
  assert.equal(readFileSync(skill(p), 'utf8'), before);
  assert.match(o.out, /pending/);
  assert.ok(o.out.includes(p));
});

test('RF-1.F1: a pack no longer shipped is named and the rest is updated', { skip: SKIP }, t => {
  const s = setup(t, { mutate: dir => { appendFileSync(path.join(dir, 'packs/sdd/skills/sdd-spec/SKILL.md'), CHANGE); rmSync(path.join(dir, 'packs/design'), { recursive: true }); } });
  const p = s.project('proj', { packs: 'sdd,design' });
  s.release();
  const o = s.upd([[Q.project(p), 'y']]);
  assert.match(o.out, /pack design is no longer shipped/);
  assert.ok(readFileSync(skill(p), 'utf8').endsWith(CHANGE));
});

test('RF-1.S1: a record with the wrong header is ignored', { skip: SKIP }, t => {
  const s = setup(t);
  mkdirSync(PROJECTS(s.h.HOME), { recursive: true });
  writeFileSync(path.join(PROJECTS(s.h.HOME), 'aaaaaaaaaaaaaaaa'), 'rigorkit-global-record 1\nversion\t0.1.0\n');
  s.release();
  const o = s.upd();
  assert.equal(o.status, 0, o.out);
  assert.doesNotMatch(o.out, /Update project/);
});

test('RF-2.H1: an edited copy kept on "k" keeps the declined fingerprint; the version advances (AMEND-1)', { skip: SKIP }, t => {
  const s = setup(t);
  const p = s.project('proj');
  appendFileSync(skill(p), '\nmy edit\n');
  s.release();
  const o = s.upd([[Q.project(p), 'y'], [Q.edited(path.dirname(skill(p))), 'k']]);
  assert.ok(readFileSync(skill(p), 'utf8').endsWith('\nmy edit\n'), o.out);
  const rec = recOf(s.h.HOME, p).text;
  const c = field(rec, 'copy').find(f => f[4] === path.dirname(skill(p)));
  assert.match(c[6], /^[0-9a-f]{64}$/, rec);
  assert.deepEqual(field(rec, 'version').map(f => f[1]), ['0.4.0']);
});

test('RF-2.E1: an edited copy overwritten on "o" gets the new text', { skip: SKIP }, t => {
  const s = setup(t);
  const p = s.project('proj');
  appendFileSync(skill(p), '\nmy edit\n');
  s.release();
  s.upd([[Q.project(p), 'y'], [Q.edited(path.dirname(skill(p))), 'o']]);
  const text = readFileSync(skill(p), 'utf8');
  assert.ok(text.endsWith(CHANGE)); assert.ok(!text.includes('my edit'));
});

test('RF-2.E2: a "-" copy that already equals the new text is not asked', { skip: SKIP }, t => {
  const s = setup(t);
  const p = s.project('proj');
  const rec = recOf(s.h.HOME, p);
  writeFileSync(rec.file, rec.text.split('\n').map(l => { const f = l.split('\t'); if (f[0] === 'copy' && f[4] === path.dirname(skill(p))) f[5] = '-'; return f.join('\t'); }).join('\n'));
  appendFileSync(skill(p), CHANGE);
  s.release();
  const o = s.upd([[Q.project(p), 'y']]);
  assert.doesNotMatch(o.out, /was edited/);
  assert.deepEqual(field(recOf(s.h.HOME, p).text, 'version').map(f => f[1]), ['0.4.0'], o.out);
});

test('RF-3.H1: the record and .rigorkit-version move to the release', { skip: SKIP }, t => {
  const s = setup(t);
  const p = s.project('proj');
  s.release();
  s.upd([[Q.project(p), 'y']]);
  assert.deepEqual(field(recOf(s.h.HOME, p).text, 'version').map(f => f[1]), ['0.4.0']);
  assert.equal(readFileSync(path.join(p, '.rigorkit-version'), 'utf8').trim(), '0.4.0');
});

test('RF-4.H1: a development install is asked apart and loses its dev line', { skip: SKIP }, t => {
  const s = setup(t);
  const dev = runtimeCopy(path.join(s.h.root, 'devclone'));
  writeFileSync(path.join(dev, 'VERSION'), '0.3.0\n');
  const p = s.project('proj', { from: dev });
  assert.equal(field(recOf(s.h.HOME, p).text, 'dev').length, 1);
  s.release();
  const o = s.upd([[Q.dev(p), 'y']]);
  assert.equal(o.status, 0, o.out);
  assert.deepEqual(field(recOf(s.h.HOME, p).text, 'dev'), []);
  assert.ok(readFileSync(skill(p), 'utf8').endsWith(CHANGE));
});

test('RF-5.H1: the record of a missing folder is removed on yes', { skip: SKIP }, t => {
  const s = setup(t);
  const gone = s.project('gone'), kept = s.project('kept');
  rmSync(gone, { recursive: true });
  s.release();
  const o = s.upd([[Q.missing(gone), 'y'], [Q.project(kept), 'n']]);
  assert.equal(recOf(s.h.HOME, gone), undefined, o.out);
  assert.ok(recOf(s.h.HOME, kept));
});

test('RF-6.H1: specs/backlog.md is renamed on yes and nothing is staged', { skip: SKIP }, t => {
  const s = setup(t);
  const p = s.project('proj');
  mkdirSync(path.join(p, 'specs')); writeFileSync(path.join(p, 'specs/backlog.md'), '# Backlog\n');
  git(p, ['add', '-A']); git(p, ['commit', '-qm', 'specs']);
  s.release();
  s.upd([[Q.project(p), 'y'], [Q.rename(p), 'y']]);
  assert.equal(readFileSync(path.join(p, 'specs/roadmap.md'), 'utf8'), '# Backlog\n');
  assert.equal(existsSync(path.join(p, 'specs/backlog.md')), false);
  assert.equal(staged(p), '');
});

test('RF-7.H1: --dry-run asks nothing and changes no project', { skip: SKIP }, t => {
  const s = setup(t);
  const p = s.project('proj');
  const before = readFileSync(skill(p), 'utf8'), rec = recOf(s.h.HOME, p).text;
  s.release();
  const o = s.upd([], ['--dry-run']);
  assert.match(o.out, /would ask: Update project/);
  assert.equal(readFileSync(skill(p), 'utf8'), before);
  assert.equal(recOf(s.h.HOME, p).text, rec);
});

test('RF-7.F1: without a terminal the project is skipped and unchanged', { skip: SKIP }, t => {
  const s = setup(t);
  const p = s.project('proj');
  const before = readFileSync(skill(p), 'utf8');
  s.release();
  const o = s.updNonTty();
  assert.match(o.out, /skipped/);
  assert.ok(o.out.includes(p));
  assert.equal(readFileSync(skill(p), 'utf8'), before);
});
