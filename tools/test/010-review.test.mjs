// 010-update HU-2 — regressions for the findings of the independent reviews (sdd, architecture, security),
// 2026-11-12. Each test names the finding it pins; scenario ids refer to spec 010.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { appendFileSync, chmodSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { isRoot } from './rigorkit-fixture.mjs';
import { home, put, run, repo, testRemote, cloneAt, git, writeState, now, envFor, pty, NEED_PTY, RECORD, STATE, runtimeCopy } from './update-fixture.mjs';

const SKIP = NEED_PTY || (isRoot() && 'D4: running as root ignores permission bits');
const MAC_ONLY = process.platform === 'darwin' ? false : 'D4: chflags uchg needs macOS';
const read = p => readFileSync(p, 'utf8');

function setup(t, { install, later = [] } = {}) {
  const h = home(t);
  const r = testRemote(t, h.root);
  r.release('0.3.0');
  const clone = cloneAt(h.HOME, r.bare, 'v0.3.0');
  const env = envFor(h);
  const s = { h, r, clone, env, f: rel => path.join(h.HOME, rel) };
  if (install) assert.equal(run('bash', [path.join(clone, 'install.sh'), '--global', '--pack', install.packs, '--agent', install.agents], { env }).status, 0);
  for (const [v, mutate, opts] of later) r.release(v, mutate, opts);
  writeState(h.HOME, { checked: now(), newest: '' });
  return s;
}
const upd = (s, steps = [], args = []) => pty(path.join(s.clone, 'bin/rigorkit'), ['update', ...args], { env: s.env, steps, eof: true, timeout: 90 });
const nonTty = (s, extra = {}) => run(path.join(s.clone, 'bin/rigorkit'), ['update'], { env: { ...s.env, ...extra }, input: '' });
const recVersion = s => read(RECORD(s.h.HOME)).split('\n').find(l => l.startsWith('version\t')).split('\t')[1];
const version = s => read(path.join(s.clone, 'VERSION')).trim();
const newPack = dir => put(path.join(dir, 'packs/backend/skills/backend-x/SKILL.md'), "---\nname: backend-x\ndescription: 'x'\n---\n");
const log = (v, packs = 'none') => `## ${v}\nGlobal rules: unchanged\nNew packs: ${packs}\n\nTest release ${v}.\n`;

test('RF-30.E2: review H1 (RF-19): a skipped question in a non-interactive run keeps the recorded version; the next interactive update offers it', { skip: SKIP }, t => {
  const s = setup(t, { install: { packs: 'core', agents: 'claude' }, later: [['0.4.0', newPack, { changelog: log('0.4.0', 'backend') }]] });
  const o = nonTty(s);
  assert.equal(version(s), '0.4.0', o.out);
  assert.equal(recVersion(s), '0.3.0');
  assert.ok(upd(s, [['Install new pack backend globally', 'n']]).out.includes('Install new pack backend globally'));
});

test('review sdd M2 (INV-1): a dry run removes its temporary folder', { skip: SKIP }, t => {
  const s = setup(t, { install: { packs: 'core', agents: 'claude' }, later: [['0.4.0']] });
  const before = readdirSync(s.h.TMPDIR).sort();
  assert.equal(upd(s, [], ['--dry-run']).status, 0);
  assert.deepEqual(readdirSync(s.h.TMPDIR).sort(), before);
});

test('RF-14.S2: review security M1: a dry run never runs code from the downloaded release', { skip: SKIP }, t => {
  const pwned = 'touch "$HOME/pwned"\n';
  const s = setup(t, { install: { packs: 'core', agents: 'claude' }, later: [['0.4.0', d => {
    for (const f of ['lib/update.sh', 'install.sh', 'lib/common.sh']) writeFileSync(path.join(d, f), read(path.join(d, f)).replace(/\n/, `\n${pwned}`));
  }]] });
  const o = upd(s, [], ['--dry-run']);
  assert.equal(o.status, 0, o.out);
  assert.equal(existsSync(s.f('pwned')), false);
});

test('RF-38.H1, RF-38.S1: review security M2: a release that tracks files under custom/ is refused; the custom area is untouched', { skip: SKIP }, t => {
  const s = setup(t);
  s.r.release('0.4.0', undefined, { tag: null });
  put(path.join(s.r.work, 'custom/scripts/test-summary'), 'from release\n');
  git(s.r.work, ['add', '-f', 'custom/scripts/test-summary']);
  git(s.r.work, ['commit', '--quiet', '-m', 'tracks custom']);
  git(s.r.work, ['tag', '-a', 'v0.4.0', '-m', 'rigorkit 0.4.0']);
  git(s.r.work, ['push', '--quiet', 'origin', '+HEAD:refs/heads/main', '--tags']);
  put(path.join(s.clone, 'custom/scripts/test-summary'), 'mine\n', 0o755);
  const h0 = git(s.clone, ['rev-parse', 'HEAD']);
  const o = upd(s);
  assert.notEqual(o.status, 0);
  assert.match(o.out, /custom/);
  assert.equal(git(s.clone, ['rev-parse', 'HEAD']), h0);
  assert.equal(read(path.join(s.clone, 'custom/scripts/test-summary')), 'mine\n');
});

test('review L1/L5 (RF-13, RF-32): an inherited RK_UPDATE_FROM never skips phase 1 or removes another update\'s lock', { skip: SKIP }, t => {
  const s = setup(t, { later: [['0.4.0']] });
  appendFileSync(path.join(s.clone, 'install.sh'), '# mine\n');
  const o = nonTty(s, { RK_UPDATE_FROM: '0.3.0' });
  assert.notEqual(o.status, 0);
  assert.match(o.out, /local changes/);
  put(path.join(STATE(s.h.HOME), 'update.lock/pid'), `${process.pid}\n`);
  const o2 = nonTty(s, { RK_UPDATE_FROM: '0.3.0' });
  assert.match(o2.out, /another rigorkit update is running/);
  assert.ok(existsSync(path.join(STATE(s.h.HOME), 'update.lock/pid')));
});

test('review sdd M4 (RF-26.F1, RF-37): a script whose bit cannot be restored does not block a move that leaves it alone', { skip: SKIP || MAC_ONLY }, t => {
  const s = setup(t, { later: [['0.4.0']] });
  const sc = path.join(s.clone, 'packs/core/scripts/test-summary');
  chmodSync(sc, 0o644);
  run('chflags', ['uchg', sc]);
  try {
    const o = upd(s);
    assert.equal(version(s), '0.4.0', o.out);
  } finally { run('chflags', ['nouchg', sc]); }
});

test('review sdd M5 (RF-37): a failed move leaves no file of the new release behind', { skip: SKIP }, t => {
  const s = setup(t, { later: [['0.4.0', d => { put(path.join(d, 'aaa-new/file'), 'new\n'); appendFileSync(path.join(d, 'packs/core/scripts/test-summary'), '# changed\n'); }]] });
  const dir = path.join(s.clone, 'packs/core/scripts');
  chmodSync(dir, 0o555);
  t.after(() => { try { chmodSync(dir, 0o755); } catch {} });
  const o = upd(s);
  assert.notEqual(o.status, 0);
  assert.equal(git(s.clone, ['status', '--porcelain']), '');
  assert.equal(existsSync(path.join(s.clone, 'aaa-new')), false);
});

test('RF-18.E8: review architecture M4: a global install from a development clone writes no record', t => {
  const h = home(t);
  const dev = runtimeCopy(path.join(h.root, 'dev'));
  const o = run('bash', [path.join(dev, 'install.sh'), '--global', '--pack', 'core', '--agent', 'claude'], { env: envFor(h) });
  assert.equal(o.status, 0, o.out);
  assert.equal(existsSync(RECORD(h.HOME)), false);
  const existing = 'rigorkit-global-record 1\nversion\t0.3.0\npair\tsdd\tclaude\n';
  put(RECORD(h.HOME), existing);
  assert.equal(run('bash', [path.join(dev, 'install.sh'), '--global', '--pack', 'core', '--agent', 'claude', '--force'], { env: envFor(h) }).status, 0);
  assert.equal(read(RECORD(h.HOME)), existing);
});

test('review architecture M3: install.sh and lib/common.sh keep identical fingerprint and record helpers', () => {
  const body = (src, name) => src.match(new RegExp(`^${name}\\(\\) \\{[\\s\\S]*?^\\}$|^${name}\\(\\) \\{.*\\}$`, 'm'))?.[0];
  const a = read(path.join(repo, 'install.sh')), b = read(path.join(repo, 'lib/common.sh'));
  for (const fn of ['sha256', 'fp_text', 'fp_file', 'fp_skill', 'record_valid']) {
    assert.ok(body(a, fn), `install.sh ${fn}`);
    assert.equal(body(a, fn), body(b, fn), fn);
  }
});

test('review security L4 (SR-2): UTF-8 C1 controls are printed safely', { skip: SKIP }, t => {
  const s = setup(t, { later: [['0.4.0', undefined, { changelog: `${log('0.4.0')}c1 \u009b31m end\n` }]] });
  const o = upd(s);
  assert.doesNotMatch(o.out, /\u009b/);
  assert.match(o.out, /c1 \?31m end/);
});

test('review sdd M3 (INV-6): an old copy that cannot be fully removed never leaves the new copy half-written', { skip: SKIP || MAC_ONLY }, t => {
  const s = setup(t, { install: { packs: 'sdd', agents: 'claude' }, later: [['0.4.0', d => appendFileSync(path.join(d, 'packs/sdd/skills/sdd-spec/SKILL.md'), '\nNew.\n')]] });
  const stuck = s.f('.claude/skills/sdd-spec/stuck');
  put(stuck, 'x\n');
  run('chflags', ['uchg', stuck]);
  try {
    const o = upd(s, [['.claude/skills/sdd-spec was edited. Overwrite or keep? [o/k]', 'o']]);
    assert.match(read(s.f('.claude/skills/sdd-spec/SKILL.md')), /New\./, o.out);
  } finally {
    for (const d of readdirSync(s.f('.claude/skills'))) { const p = path.join(s.f('.claude/skills'), d, 'stuck'); if (existsSync(p)) run('chflags', ['nouchg', p]); }
  }
});

test('review architecture L9: a pack that fails to stage is reported with its reason, not as no longer shipped', { skip: SKIP }, t => {
  const s = setup(t, { install: { packs: 'sdd', agents: 'claude' }, later: [['0.4.0', d => put(path.join(d, 'packs/sdd/agents/zz-bad.md'), '---\ntier: cheap\n---\nno name\n')]] });
  const o = upd(s);
  assert.match(o.out, /cannot prepare pack sdd/);
  assert.match(o.out, /agent without name/);
  assert.doesNotMatch(o.out, /no longer shipped/);
});

test('RF-38.E1: --dry-run refuses a release that tracks files under custom/', { skip: SKIP }, t => {
  const s = setup(t);
  s.r.release('0.4.0', undefined, { tag: null });
  put(path.join(s.r.work, 'custom/scripts/x'), 'from release\n');
  git(s.r.work, ['add', '-f', 'custom/scripts/x']);
  git(s.r.work, ['commit', '--quiet', '-m', 'tracks custom']);
  git(s.r.work, ['tag', '-a', 'v0.4.0', '-m', 'rigorkit 0.4.0']);
  git(s.r.work, ['push', '--quiet', 'origin', '+HEAD:refs/heads/main', '--tags']);
  const o = upd(s, [], ['--dry-run']);
  assert.notEqual(o.status, 0);
  assert.match(o.out, /custom/);
});
