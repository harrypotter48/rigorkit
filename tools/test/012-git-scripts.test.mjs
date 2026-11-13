// 012-git-scripts HU-6 — git-compact, git-activity and spec-status on temporary repositories.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const COMPACT = path.join(repo, 'packs/core/scripts/git-compact');
const ACTIVITY = path.join(repo, 'packs/core/scripts/git-activity');
const STATUS = path.join(repo, 'packs/sdd/scripts/spec-status');

function temp(t, name = 'rigorkit-012-') {
  const dir = realpathSync(mkdtempSync(path.join(tmpdir(), name)));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}
const baseEnv = { GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null' };
function git(cwd, args, env = {}) {
  return execFileSync('git', ['-c', 'core.hooksPath=/dev/null', '-c', 'commit.gpgsign=false', ...args],
    { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, ...baseEnv, ...env } }).trim();
}
function put(root, file, content) {
  mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  writeFileSync(path.join(root, file), content);
}
function init(t, name = 'repo') {
  const root = path.join(temp(t), name);
  mkdirSync(root);
  git(root, ['init', '-q', '-b', 'main']);
  git(root, ['config', 'user.name', 'Fixture']);
  git(root, ['config', 'user.email', 'a@x.test']);
  return root;
}
let tick = 0;
function commit(root, message, { date = '2026-01-15T10:00:00', email = 'a@x.test', file } = {}) {
  put(root, file ?? `f${++tick}.txt`, `${tick}\n`);
  git(root, ['add', '-A']);
  git(root, ['commit', '-qm', message], { GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date, GIT_AUTHOR_EMAIL: email, GIT_COMMITTER_EMAIL: email });
}
function run(script, args, { cwd, env = {} } = {}) {
  const r = spawnSync('bash', [script, ...args], { cwd, encoding: 'utf8', env: { ...process.env, ...baseEnv, ...env } });
  return { status: r.status, out: r.stdout, err: r.stderr, lines: r.stdout.split('\n').filter(Boolean) };
}
const rows = r => r.lines.filter(l => l.includes('\t') && !l.startsWith('repo\t'));

// ---------- git-compact ----------
test('RF-1.H1: log prints hash, date and subject per commit', t => {
  const r0 = init(t);
  commit(r0, 'feat(011): one'); commit(r0, 'fix(011): two'); commit(r0, 'docs(012): three');
  const r = run(COMPACT, ['log'], { cwd: r0 });
  assert.equal(r.status, 0, r.err);
  assert.equal(r.lines.length, 3, r.out);
  assert.match(r.lines[0], /^[0-9a-f]{7,} 2026-01-15 docs\(012\): three$/);
  assert.doesNotMatch(r.out, /more · full log/);
});

test('RF-1.E1: log truncates at 30 lines and keeps the full log', t => {
  const r0 = init(t);
  for (let i = 0; i < 35; i++) commit(r0, `chore: c${i}`);
  const tmp = temp(t);
  const r = run(COMPACT, ['log'], { cwd: r0, env: { TMPDIR: tmp } });
  assert.equal(r.lines.length, 31, r.out);
  const m = r.lines[30].match(/^… 5 more · full log: (.+)$/);
  assert.ok(m, r.lines[30]);
  assert.equal(readFileSync(m[1], 'utf8').split('\n').filter(Boolean).length, 35);
});

test('RF-2.H1: diff prints stat and hunk headers without content lines', t => {
  const r0 = init(t);
  put(r0, 'a.txt', Array.from({ length: 40 }, (_, i) => `line ${i}`).join('\n') + '\n');
  commit(r0, 'chore: base', { file: 'b.txt' });
  const lines = readFileSync(path.join(r0, 'a.txt'), 'utf8').split('\n');
  lines[2] = 'changed 2'; lines[35] = 'changed 35';
  writeFileSync(path.join(r0, 'a.txt'), lines.join('\n'));
  const r = run(COMPACT, ['diff'], { cwd: r0 });
  assert.equal(r.status, 0, r.err);
  assert.match(r.out, /a\.txt \| +2 /);
  assert.equal(r.lines.filter(l => /^\s*@@ /.test(l)).length, 2, r.out);
  assert.ok(!r.lines.some(l => /^[+-](?![+-])/.test(l) && !/^\s*@@/.test(l)), r.out);
});

test('RF-2.E1: diff --full truncates at 200 lines', t => {
  const r0 = init(t);
  commit(r0, 'chore: base');
  put(r0, 'big.txt', Array.from({ length: 300 }, (_, i) => `l${i}`).join('\n') + '\n');
  git(r0, ['add', '-N', 'big.txt']);
  const r = run(COMPACT, ['diff', '--full'], { cwd: r0, env: { TMPDIR: temp(t) } });
  assert.equal(r.lines.length, 201, `${r.lines.length}`);
  assert.match(r.lines[200], /^… \d+ more · full log: /);
});

test('RF-3.H1: status prints short status with branch', t => {
  const r0 = init(t);
  commit(r0, 'chore: base', { file: 'm.txt' });
  put(r0, 'm.txt', 'changed\n'); put(r0, 'new.txt', 'x\n');
  const r = run(COMPACT, ['status'], { cwd: r0 });
  assert.equal(r.status, 0, r.err);
  assert.match(r.lines[0], /^## main/);
  assert.ok(r.lines.includes(' M m.txt'), r.out);
  assert.ok(r.lines.includes('?? new.txt'), r.out);
});

test('RF-3.E1: status truncates at 50 lines', t => {
  const r0 = init(t);
  commit(r0, 'chore: base');
  for (let i = 0; i < 60; i++) put(r0, `u${i}.txt`, 'x\n');
  const r = run(COMPACT, ['status'], { cwd: r0, env: { TMPDIR: temp(t) } });
  assert.equal(r.lines.length, 51, r.out);
  assert.match(r.lines[50], /^… 11 more · full log: /);
});

test('RF-4.H1: a valid read exits 0', t => {
  const r0 = init(t); commit(r0, 'chore: base');
  assert.equal(run(COMPACT, ['log'], { cwd: r0 }).status, 0);
});

test('RF-4.E1: no or unknown subcommand prints usage and exits 2', t => {
  const r0 = init(t);
  for (const args of [[], ['blame']]) {
    const r = run(COMPACT, args, { cwd: r0 });
    assert.equal(r.status, 2);
    assert.match(r.err, /usage: git-compact/);
  }
});

test('RF-4.F1: git errors keep stderr and a non-zero exit', t => {
  const r = run(COMPACT, ['log'], { cwd: temp(t) });
  assert.notEqual(r.status, 0);
  assert.match(r.err, /not a git repository/i);
});

// ---------- git-activity ----------
function activityRepo(t) {
  const r0 = init(t);
  commit(r0, 'feat(011): add one', { date: '2026-01-10T10:00:00' });
  commit(r0, 'fix(011): fix one', { date: '2026-01-11T10:00:00' });
  commit(r0, 'docs(012): spec two', { date: '2026-01-12T10:00:00' });
  return r0;
}

test('RF-5.H1: rows per change ID, newest first', t => {
  const r0 = activityRepo(t);
  const r = run(ACTIVITY, ['--since', '2026-01-01', '--no-fetch', r0]);
  assert.equal(r.status, 0, r.err);
  assert.equal(r.lines[0], 'repo\tid\tcommits\tfirst\tlast\tlast-subject');
  assert.deepEqual(rows(r), [
    'repo\t012\t1\t2026-01-12\t2026-01-12\tdocs(012): spec two',
    'repo\t011\t2\t2026-01-10\t2026-01-11\tfix(011): fix one',
  ]);
});

test('RF-5.E1: test(...) subjects use the first word; others go to "-"; all branches count', t => {
  const r0 = init(t);
  commit(r0, 'test(red): 013 red one', { date: '2026-01-10T10:00:00' });
  commit(r0, 'chore: tidy', { date: '2026-01-11T10:00:00' });
  git(r0, ['switch', '-q', '-c', 'side']);
  commit(r0, 'feat(014): side work', { date: '2026-01-12T10:00:00' });
  git(r0, ['switch', '-q', 'main']);
  const ids = rows(run(ACTIVITY, ['--since', '2026-01-01', '--no-fetch', r0])).map(l => l.split('\t')[1]).sort();
  assert.deepEqual(ids, ['-', '013', '014']);
});

test('RF-5.E2: a linked worktree path reads the same history', t => {
  const r0 = activityRepo(t);
  const wt = path.join(temp(t), 'wt');
  git(r0, ['worktree', 'add', '-q', '-b', 'wt', wt]);
  const a = rows(run(ACTIVITY, ['--since', '2026-01-01', '--no-fetch', r0])).map(l => l.split('\t').slice(1).join('\t'));
  const b = rows(run(ACTIVITY, ['--since', '2026-01-01', '--no-fetch', wt])).map(l => l.split('\t').slice(1).join('\t'));
  assert.equal(a.length, 2);
  assert.deepEqual(b, a);
});

test('RF-6.H1: --until limits the range', t => {
  const r0 = init(t);
  commit(r0, 'feat(021): early', { date: '2026-01-05T10:00:00' });
  commit(r0, 'feat(022): late', { date: '2026-01-20T10:00:00' });
  const ids = rows(run(ACTIVITY, ['--since', '2026-01-01', '--until', '2026-01-10', '--no-fetch', r0])).map(l => l.split('\t')[1]);
  assert.deepEqual(ids, ['021']);
});

test('RF-6.E1: --authors keeps only those emails, matched literally', t => {
  const r0 = init(t);
  commit(r0, 'feat(031): by a', { email: 'a@x.test' });
  commit(r0, 'feat(032): by b', { email: 'b@x.test' });
  commit(r0, 'feat(033): by axxtest', { email: 'a@xxtest' });
  const ids = rows(run(ACTIVITY, ['--since', '2026-01-01', '--authors', 'a@x.test', '--no-fetch', r0])).map(l => l.split('\t')[1]);
  assert.deepEqual(ids, ['031']);
});

function withRemote(t) {
  const base = temp(t);
  const bare = path.join(base, 'remote.git');
  git(base, ['init', '-q', '--bare', '-b', 'main', bare]);
  const up = init(t, 'up');
  commit(up, 'feat(041): first', { date: '2026-01-10T10:00:00' });
  git(up, ['remote', 'add', 'origin', bare]); git(up, ['push', '-q', 'origin', 'main']);
  const clone = path.join(base, 'clone');
  git(base, ['clone', '-q', bare, clone]);
  commit(up, 'feat(042): newer', { date: '2026-01-11T10:00:00' }); git(up, ['push', '-q', 'origin', 'main']);
  return clone;
}

test('RF-7.H1: fetch brings remote commits into the count', t => {
  const clone = withRemote(t);
  const r = run(ACTIVITY, ['--since', '2026-01-01', clone]);
  assert.equal(r.status, 0, r.err);
  assert.deepEqual(rows(r).map(l => l.split('\t')[1]).sort(), ['041', '042']);
});

test('RF-7.F1: a failed fetch falls back to local data with a note', t => {
  const clone = withRemote(t);
  git(clone, ['remote', 'set-url', 'origin', path.join(temp(t), 'missing.git')]);
  const r = run(ACTIVITY, ['--since', '2026-01-01', clone]);
  assert.equal(r.status, 0, r.err);
  assert.deepEqual(rows(r).map(l => l.split('\t')[1]), ['041']);
  assert.match(r.out, /fetch failed: clone/);
});

test('RF-7.F2: a non-repository path is named in coverage and exits 3', t => {
  const r0 = activityRepo(t);
  const bad = temp(t);
  const r = run(ACTIVITY, ['--since', '2026-01-01', '--no-fetch', r0, bad]);
  assert.equal(r.status, 3);
  assert.equal(rows(r).length, 2);
  assert.equal(r.lines.at(-1), `repos: 1 read, 1 failed (${bad})`);
});

test('RF-7.E1: a repository without remote needs no fetch note', t => {
  const r = run(ACTIVITY, ['--since', '2026-01-01', activityRepo(t)]);
  assert.equal(r.status, 0, r.err);
  assert.doesNotMatch(r.out, /fetch failed/);
});

test('RF-8.H1: --close lists close commits with Outcome and Validation', t => {
  const r0 = activityRepo(t);
  put(r0, 'c.txt', 'c\n'); git(r0, ['add', '-A']);
  git(r0, ['commit', '-q', '-m', 'feat(011): close one [close]', '-m', 'Outcome: one works.\nValidation: pending: smoke on staging.\nDeferred: none'],
    { GIT_AUTHOR_DATE: '2026-01-13T10:00:00', GIT_COMMITTER_DATE: '2026-01-13T10:00:00' });
  const r = run(ACTIVITY, ['--since', '2026-01-01', '--close', '--no-fetch', r0]);
  assert.equal(r.status, 0, r.err);
  const i = r.lines.findIndex(l => l === 'repo\t011\t2026-01-13\tfeat(011): close one [close]');
  assert.ok(i > 0, r.out);
  assert.equal(r.lines[i + 1], '  Outcome: one works.');
  assert.equal(r.lines[i + 2], '  Validation: pending: smoke on staging.');
  assert.doesNotMatch(r.out, /fix one/);
});

test('RF-8.E1: --close without close commits prints header and coverage only', t => {
  const r = run(ACTIVITY, ['--since', '2026-01-01', '--close', '--no-fetch', activityRepo(t)]);
  assert.equal(r.status, 0, r.err);
  assert.equal(r.lines.length, 2, r.out);
  assert.equal(r.lines[1], 'repos: 1 read, 0 failed');
});

test('RF-9.H1: the last line is the coverage line', t => {
  const r = run(ACTIVITY, ['--since', '2026-01-01', '--no-fetch', activityRepo(t)]);
  assert.equal(r.lines.at(-1), 'repos: 1 read, 0 failed');
});

test('RF-9.E1: a date with time is accepted', t => {
  const r = run(ACTIVITY, ['--since', '2026-01-11T09:30', '--no-fetch', activityRepo(t)]);
  assert.equal(r.status, 0, r.err);
  assert.deepEqual(rows(r).map(l => l.split('\t')[2]), ['1', '1']);
});

test('RF-9.F1: missing or invalid values print usage and exit 2', t => {
  const r0 = activityRepo(t);
  for (const args of [[r0], ['--since', 'yesterday', r0], ['--since', '2026-01-01', '--authors', 'not-an-email', r0], ['--since', '2026-01-01']]) {
    const r = run(ACTIVITY, ['--no-fetch', ...args]);
    assert.equal(r.status, 2, args.join(' '));
    assert.match(r.err, /usage: git-activity/);
  }
});

test('RF-9.S1: option-like values never reach git', t => {
  const r0 = activityRepo(t);
  const cwd = temp(t);
  for (const args of [['--since=--output=x', r0], ['--since', '2026-01-01', '--authors', '--upload-pack=x', r0], ['--since', '2026-01-01', '--exec=x'], ['--since', '--output=x', r0]]) {
    const r = run(ACTIVITY, ['--no-fetch', ...args], { cwd });
    assert.equal(r.status, 2, args.join(' '));
  }
  assert.equal(existsSync(path.join(cwd, 'x')), false);
});

// ---------- spec-status ----------
function specRepo(t) {
  const r0 = init(t);
  const change = (dir, done, total, extra = {}) => {
    put(r0, `specs/${dir}/spec.md`, '# Spec\n');
    const tasks = Array.from({ length: total }, (_, i) => `- [${i < done ? 'x' : ' '}] T${i + 1}. task`).join('\n');
    put(r0, `specs/${dir}/tasks.md`, `# Tasks\n${tasks}\n`);
    if (extra.validation) put(r0, `specs/${dir}/validation.md`, '# Validation\n');
  };
  change('changes/001-a', 0, 2);
  change('changes/002-b', 1, 3);
  change('changes/003-c', 3, 3);
  change('changes/004-d', 3, 3, { validation: true });
  change('archive/005-e', 1, 1); change('archive/006-f', 1, 1); change('archive/007-g', 1, 1);
  commit(r0, 'docs(001): spec a');
  put(r0, 'e.txt', 'e\n'); git(r0, ['add', '-A']); git(r0, ['commit', '-q', '-m', 'feat(005): close e [close]', '-m', 'Outcome: e.\nValidation: done: tests, local, 2026-01-15']);
  put(r0, 'f.txt', 'f\n'); git(r0, ['add', '-A']); git(r0, ['commit', '-q', '-m', 'feat(006): close f [close]', '-m', 'Outcome: f.\nValidation: pending: smoke']);
  return r0;
}
const states = r => Object.fromEntries(r.lines.filter(l => l.includes('\t') && !l.startsWith('id\t')).map(l => { const [id, state, tasks] = l.split('\t'); return [id, `${state} ${tasks}`]; }));

test('RF-10.H1: active changes get defined, in-progress, implemented, validated', t => {
  const r = run(STATUS, [specRepo(t)]);
  assert.equal(r.status, 0, r.err);
  assert.equal(r.lines[0], 'id\tstate\ttasks');
  const s = states(r);
  assert.equal(s['001-a'], 'defined 0/2');
  assert.equal(s['002-b'], 'in-progress 1/3');
  assert.equal(s['003-c'], 'implemented 3/3');
  assert.equal(s['004-d'], 'validated 3/3');
});

test('RF-10.E1: a code commit for the ID makes a change in-progress', t => {
  const r0 = specRepo(t);
  commit(r0, 'feat(001): first code');
  assert.equal(states(run(STATUS, [r0]))['001-a'], 'in-progress 0/2');
});

test('RF-10.F1: a path without specs/ fails naming it', t => {
  const r0 = init(t); commit(r0, 'chore: base');
  const r = run(STATUS, [r0]);
  assert.equal(r.status, 2);
  assert.ok(r.err.includes(r0), r.err);
});

test('RF-10.S1: an option-like repository argument is rejected', t => {
  const r = run(STATUS, ['--help=x'], { cwd: specRepo(t) });
  assert.equal(r.status, 2);
  assert.match(r.err, /usage: spec-status/);
});

test('RF-11.H1: an archived change with validation done is archived', t => {
  assert.equal(states(run(STATUS, [specRepo(t)]))['005-e'], 'archived 1/1');
});

test('RF-11.E1: pending validation and missing close commit', t => {
  const s = states(run(STATUS, [specRepo(t)]));
  assert.equal(s['006-f'], 'archived-unvalidated 1/1');
  assert.equal(s['007-g'], 'archived 1/1');
});
