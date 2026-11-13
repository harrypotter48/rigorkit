// 013-deferred-file HU-7 — deferred add/list/clear in <git-common-dir>/rigorkit/deferred.md.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync, realpathSync, chmodSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DEFERRED = path.join(repo, 'packs/core/scripts/deferred');
const baseEnv = { GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null' };

function temp(t) {
  const dir = realpathSync(mkdtempSync(path.join(tmpdir(), 'rigorkit-013-')));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}
function git(cwd, args) {
  return execFileSync('git', ['-c', 'core.hooksPath=/dev/null', '-c', 'commit.gpgsign=false', ...args],
    { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, ...baseEnv } }).trim();
}
function init(t, name = 'repo') {
  const root = path.join(temp(t), name);
  mkdirSync(root);
  git(root, ['init', '-q', '-b', 'main']);
  git(root, ['config', 'user.name', 'F']); git(root, ['config', 'user.email', 'a@x.test']);
  writeFileSync(path.join(root, 'a.txt'), 'a\n'); git(root, ['add', '-A']); git(root, ['commit', '-qm', 'chore: base']);
  return root;
}
const file = root => path.join(git(root, ['rev-parse', '--path-format=absolute', '--git-common-dir']), 'rigorkit/deferred.md');
const entries = root => existsSync(file(root)) ? readFileSync(file(root), 'utf8').split('\n').filter(Boolean) : [];
function run(args, { cwd } = {}) {
  const r = spawnSync('bash', [DEFERRED, ...args], { cwd, encoding: 'utf8', env: { ...process.env, ...baseEnv } });
  return { status: r.status, out: r.stdout, err: r.stderr, lines: r.stdout.split('\n').filter(Boolean) };
}
const ENTRY = /^- \d{4}-\d{2}-\d{2} \d{2}:\d{2} · ([^ ]+) · (.+)$/;

test('RF-1.H1: add appends one entry outside the worktree', t => {
  const r0 = init(t);
  const r = run(['add', '--change', '013', 'onclick', 'for', 'another', 'story'], { cwd: r0 });
  assert.equal(r.status, 0, r.err);
  assert.match(r.out, /deferred: added \(1 in /);
  const e = entries(r0);
  assert.equal(e.length, 1);
  assert.deepEqual(e[0].match(ENTRY).slice(1), ['013', 'onclick for another story']);
  assert.equal(git(r0, ['status', '--porcelain']), '');
  assert.equal(statSync(file(r0)).mode & 0o077, 0);
});

test('RF-1.E1: a linked worktree shares the same file', t => {
  const r0 = init(t);
  const wt = path.join(temp(t), 'wt');
  git(r0, ['worktree', 'add', '-q', '-b', 'wt', wt]);
  assert.equal(run(['add', 'from', 'worktree'], { cwd: wt }).status, 0);
  const r = run(['list'], { cwd: r0 });
  assert.ok(r.lines.some(l => l.endsWith('\t-\tfrom worktree')), r.out);
});

test('RF-1.E2: no change gives "-" and control characters are removed', t => {
  const r0 = init(t);
  assert.equal(run(['add', '--', 'line one\nline\ttwo'], { cwd: r0 }).status, 0);
  const e = entries(r0);
  assert.equal(e.length, 1);
  assert.deepEqual(e[0].match(ENTRY).slice(1), ['-', 'line one line two']);
  assert.doesNotMatch(e[0], /[\t\x00-\x1f]/);
});

test('RF-1.S1: repository config never runs hooks or fsmonitor', t => {
  const r0 = init(t);
  const marker = path.join(temp(t), 'ran');
  const hooks = path.join(temp(t), 'hooks'); mkdirSync(hooks);
  for (const n of ['fsmonitor', 'post-checkout', 'reference-transaction']) {
    writeFileSync(path.join(hooks, n), `#!/bin/sh\ntouch '${marker}'\nexit 1\n`); chmodSync(path.join(hooks, n), 0o755);
  }
  git(r0, ['config', 'core.hooksPath', hooks]); git(r0, ['config', 'core.fsmonitor', path.join(hooks, 'fsmonitor')]);
  assert.equal(run(['add', 'x'], { cwd: r0 }).status, 0);
  assert.equal(run(['list'], { cwd: r0 }).status, 0);
  assert.equal(run(['clear', '--first', '1', '--yes'], { cwd: r0 }).status, 0);
  assert.equal(existsSync(marker), false);
});

test('RF-2.H1: text after -- may start with a dash', t => {
  const r0 = init(t);
  assert.equal(run(['add', '--', '-x', 'is', 'text'], { cwd: r0 }).status, 0);
  assert.equal(entries(r0)[0].match(ENTRY)[2], '-x is text');
});

test('RF-2.F1: empty text, option-like change or unknown option write nothing', t => {
  const r0 = init(t);
  for (const args of [['add'], ['add', '--', '\n\t'], ['add', '--change', '-x', 'text'], ['add', '--bogus', 'text'], ['add', '--change', 'a b', 'text']]) {
    const r = run(args, { cwd: r0 });
    assert.equal(r.status, 2, args.join(' '));
    assert.match(r.err, /usage: deferred/);
  }
  assert.equal(existsSync(file(r0)), false);
});

test('RF-3.H1: list prints header, rows and count', t => {
  const r0 = init(t);
  run(['add', '--change', '013', 'one'], { cwd: r0 }); run(['add', 'two'], { cwd: r0 });
  const r = run(['list'], { cwd: r0 });
  assert.equal(r.status, 0, r.err);
  assert.equal(r.lines[0], 'repo\tdate\tchange\ttext');
  assert.deepEqual(r.lines.slice(1, 3).map(l => l.split('\t').filter((_, i) => i !== 1)), [['repo', '013', 'one'], ['repo', '-', 'two']]);
  assert.equal(r.lines.at(-1), 'deferred: 2 in 1 repos');
});

test('RF-3.E1: a repository without file counts zero', t => {
  const a = init(t, 'a'), b = init(t, 'b');
  run(['add', 'only a'], { cwd: a });
  const r = run(['list', a, b]);
  assert.equal(r.status, 0, r.err);
  assert.equal(r.lines.filter(l => l.startsWith('a\t')).length, 1);
  assert.equal(r.lines.at(-1), 'deferred: 1 in 2 repos');
});

test('RF-4.H1: clear removes the first N entries', t => {
  const r0 = init(t);
  for (const x of ['one', 'two', 'three']) run(['add', x], { cwd: r0 });
  const r = run(['clear', '--first', '2', '--yes'], { cwd: r0 });
  assert.equal(r.status, 0, r.err);
  assert.deepEqual(entries(r0).map(e => e.match(ENTRY)[2]), ['three']);
});

test('RF-4.E1: entries added after listing stay', t => {
  const r0 = init(t);
  run(['add', 'one'], { cwd: r0 }); run(['add', 'two'], { cwd: r0 });
  const n = Number(run(['list'], { cwd: r0 }).lines.at(-1).match(/deferred: (\d+)/)[1]);
  run(['add', 'late'], { cwd: r0 });
  assert.equal(run(['clear', '--first', String(n), '--yes'], { cwd: r0 }).status, 0);
  assert.deepEqual(entries(r0).map(e => e.match(ENTRY)[2]), ['late']);
});

test('RF-4.F1: clear without --yes, with 0 or too many leaves the file unchanged', t => {
  const r0 = init(t);
  run(['add', 'one'], { cwd: r0 }); run(['add', 'two'], { cwd: r0 });
  const before = readFileSync(file(r0), 'utf8');
  for (const args of [['clear', '--first', '1'], ['clear', '--first', '0', '--yes'], ['clear', '--first', '5', '--yes'], ['clear', '--yes']]) {
    assert.equal(run(args, { cwd: r0 }).status, 2, args.join(' '));
  }
  assert.equal(readFileSync(file(r0), 'utf8'), before);
});

test('RF-5.H1: list on a valid repository exits 0', t => {
  assert.equal(run(['list'], { cwd: init(t) }).status, 0);
});

test('RF-5.F1: a plain folder or a subdirectory is named and exits 3', t => {
  const r0 = init(t);
  run(['add', 'kept'], { cwd: r0 });
  const plain = temp(t);
  mkdirSync(path.join(r0, 'sub'));
  const sub = path.join(r0, 'sub');
  assert.equal(run(['add', '--repo', plain, 'x']).status, 3);
  assert.equal(run(['add', 'x'], { cwd: sub }).status, 3);
  const r = run(['list', r0, plain]);
  assert.equal(r.status, 3);
  assert.ok(r.lines.some(l => l.endsWith('\tkept')), r.out);
  assert.match(r.out + r.err, new RegExp(plain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.deepEqual(entries(r0).map(e => e.match(ENTRY)[2]), ['kept']);
});

test('RF-6.H1: both AGENTS templates tell agents to use deferred add', () => {
  const a = readFileSync(path.join(repo, 'packs/sdd/skills/sdd-init/templates/AGENTS.md'), 'utf8');
  assert.ok(a.includes('rigorkit script deferred add'));
  assert.equal(readFileSync(path.join(repo, 'specs/templates/AGENTS.md'), 'utf8'), a);
});

test('RF-6.E1: sdd-archive fills Deferred from deferred list', () => {
  assert.match(readFileSync(path.join(repo, 'packs/sdd/skills/sdd-archive/SKILL.md'), 'utf8'), /Deferred[^.;]*deferred list/);
});

test('INV-5.H1: the sdd pack does not grow over the 010 baseline', () => {
  const r = spawnSync(process.execPath, ['tools/measure-content.mjs', '--root', '.', '--baseline', 'specs/archive/010-update/baseline.txt'], { cwd: repo, encoding: 'utf8' });
  assert.equal(r.status, 0, (r.stdout + r.stderr).split('\n').filter(l => /error|^sdd /.test(l)).join('\n'));
});
