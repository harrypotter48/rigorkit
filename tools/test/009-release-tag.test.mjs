// 009-release-tag HU-4 — the CI publishes v<VERSION> on main: tag logic against local git repositories
// (bare remote + work clone) and dependency-free static checks of the workflow file.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { execFileSync, spawnSync } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = fileURLToPath(new URL('../../', import.meta.url));
const SCRIPT = path.join(repo, 'tools/release-tag.mjs');
const WORKFLOW = path.join(repo, '.github/workflows/release-tag.yml');
const isRoot = () => typeof process.getuid === 'function' && process.getuid() === 0;
const BOT = 'github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>';

// Git with no user/system config and no identity (like a fresh runner).
function bareEnv(root, extra = {}) {
  return { PATH: process.env.PATH, HOME: root, GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1', GIT_TERMINAL_PROMPT: '0', LC_ALL: 'C', ...extra };
}
function git(cwd, root, ...args) {
  return execFileSync('git', ['-c', 'commit.gpgsign=false', '-c', 'tag.gpgsign=false', ...args], { cwd, env: bareEnv(root), encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}
const ID = ['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid'];

function fixture(t, version = '0.2.0') {
  const root = realpathSync(mkdtempSync(path.join(tmpdir(), 'rigorkit-009-')));
  t.after(() => { try { execFileSync('chmod', ['-R', 'u+rwX', root]); } catch {} rmSync(root, { recursive: true, force: true }); });
  const remote = path.join(root, 'remote.git'), work = path.join(root, 'work');
  git(root, root, 'init', '-q', '--bare', '-b', 'main', remote);
  git(root, root, 'init', '-q', '-b', 'main', work);
  git(work, root, 'remote', 'add', 'origin', remote);
  const commit = (v, msg = `version ${v}`) => {
    writeFileSync(path.join(work, 'VERSION'), v === null ? '' : `${v}\n`);
    git(work, root, 'add', '-A'); git(work, root, ...ID, 'commit', '-q', '--allow-empty', '-m', msg);
    git(work, root, 'push', '-q', 'origin', 'HEAD:main');
    return git(work, root, 'rev-parse', 'HEAD');
  };
  // Tag on the remote only (annotated by default), at a given commit.
  const remoteTag = (name, at, { lightweight = false } = {}) => {
    if (lightweight) git(work, root, 'tag', name, at);
    else git(work, root, ...ID, 'tag', '-a', name, '-m', name, at);
    git(work, root, 'push', '-q', 'origin', `refs/tags/${name}`);
    git(work, root, 'tag', '-d', name);
  };
  const remoteRefs = () => {
    const out = git(root, root, 'ls-remote', '--tags', '--refs', remote);
    return Object.fromEntries(out ? out.split('\n').map(l => l.split('\t').reverse()) : []);
  };
  const tagInfo = name => git(remote, root, 'for-each-ref', `refs/tags/${name}`, '--format=%(objecttype)|%(taggername) %(taggeremail)|%(contents:subject)|%(*objectname)%(objectname)');
  const run = ({ env = {}, cwd = work } = {}) => {
    const r = spawnSync(process.execPath, [SCRIPT, '--root', work, '--remote', remote], { cwd, env: bareEnv(root, env), encoding: 'utf8' });
    return { status: r.status, out: (r.stdout ?? '') + (r.stderr ?? ''), stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
  };
  const first = commit(version);
  return { root, remote, work, commit, remoteTag, remoteRefs, tagInfo, run, first };
}

// --- RF-1: publish an unreleased, greater version ------------------------------------------
test('RF-1.H1: annotated v0.2.0 on the commit, message and bot tagger, pushed (no git identity configured)', t => {
  const f = fixture(t, '0.1.0');
  f.remoteTag('v0.1.0', f.first);
  const head = f.commit('0.2.0');
  const r = f.run();
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /v0\.2\.0/);
  const [type, tagger, subject, target] = f.tagInfo('v0.2.0').split('|');
  assert.equal(type, 'tag');
  assert.equal(tagger, BOT);
  assert.equal(subject, 'rigorkit 0.2.0');
  assert.ok(target.startsWith(head), `${target} vs ${head}`);
});

test('RF-1.E1: no release tag yet publishes the Version', t => {
  const f = fixture(t, '0.2.0');
  const r = f.run();
  assert.equal(r.status, 0, r.out);
  assert.ok(f.remoteRefs()['refs/tags/v0.2.0']);
});

test('RF-1.E2: a fix commit after red tests keeps 0.2.0 and publishes it on the fix commit', t => {
  const f = fixture(t, '0.2.0');
  const fix = f.commit('0.2.0', 'fix after red tests');
  const r = f.run();
  assert.equal(r.status, 0, r.out);
  assert.ok(f.tagInfo('v0.2.0').split('|')[3].startsWith(fix));
});

test('RF-1.F1: remote tags are read even when the checkout has none', t => {
  const f = fixture(t, '0.9.0');
  f.remoteTag('v0.10.0', f.first);
  assert.equal(git(f.work, f.root, 'tag', '-l'), '', 'checkout has no local tags');
  const r = f.run();
  assert.notEqual(r.status, 0);
  assert.match(r.out, /0\.9\.0/); assert.match(r.out, /0\.10\.0/);
  assert.equal(f.remoteRefs()['refs/tags/v0.9.0'], undefined);
});

// --- RF-3: valid version ---------------------------------------------------------------------
test('RF-3.H1: 1.2.3 is accepted', t => {
  const f = fixture(t, '1.2.3');
  assert.equal(f.run().status, 0);
  assert.ok(f.remoteRefs()['refs/tags/v1.2.3']);
});

test('RF-3.E1: surrounding whitespace is trimmed', t => {
  const f = fixture(t, '  1.2.3  \n');
  const r = f.run();
  assert.equal(r.status, 0, r.out);
  assert.ok(f.remoteRefs()['refs/tags/v1.2.3']);
});

test('RF-3.F1: malformed, empty or missing VERSION creates no tag and names the value', t => {
  for (const v of ['1.2', 'v1.2.3', '01.2.3', '1.2.3-rc1']) {
    const f = fixture(t, v);
    const r = f.run();
    assert.notEqual(r.status, 0, v);
    assert.ok(r.out.includes(v), `${v}: ${r.out}`);
    assert.deepEqual(f.remoteRefs(), {}, v);
  }
  const empty = fixture(t, null);
  assert.notEqual(empty.run().status, 0);
  assert.deepEqual(empty.remoteRefs(), {});
  const missing = fixture(t, '0.2.0');
  rmSync(path.join(missing.work, 'VERSION'));
  const m = missing.run();
  assert.notEqual(m.status, 0);
  assert.match(m.out, /VERSION/);
  assert.deepEqual(missing.remoteRefs(), {});
});

test('RF-3.S1: shell-looking VERSION content runs nothing', t => {
  for (const v of ['1.2.3; touch x', '$(touch x)', '`touch x`']) {
    const f = fixture(t, v);
    const r = f.run({ cwd: f.root });
    assert.notEqual(r.status, 0, v);
    assert.ok(r.out.includes(v), r.out);
    assert.equal(existsSync(path.join(f.root, 'x')), false, v);
    assert.equal(existsSync(path.join(f.work, 'x')), false, v);
    assert.deepEqual(f.remoteRefs(), {});
  }
});

// --- RF-4: greater than the highest release tag ----------------------------------------------
test('RF-4.H1: semantic order: v0.10.0 is higher than v0.9.0, so 0.11.0 publishes', t => {
  const f = fixture(t, '0.11.0');
  f.remoteTag('v0.9.0', f.first); f.remoteTag('v0.10.0', f.first);
  const r = f.run();
  assert.equal(r.status, 0, r.out);
  assert.ok(f.remoteRefs()['refs/tags/v0.11.0']);
});

test('RF-4.E1: tag names that are not vX.Y.Z are ignored', t => {
  const f = fixture(t, '0.11.0');
  f.remoteTag('v0.10.0', f.first); f.remoteTag('v1.0.0-rc1', f.first); f.remoteTag('vfoo', f.first); f.remoteTag('v9.9', f.first);
  const r = f.run();
  assert.equal(r.status, 0, r.out);
  assert.ok(f.remoteRefs()['refs/tags/v0.11.0']);
});

test('RF-4.F1: a lower unreleased Version fails naming both versions', t => {
  const f = fixture(t, '0.9.0');
  f.remoteTag('v0.10.0', f.first);
  const r = f.run();
  assert.notEqual(r.status, 0);
  assert.match(r.out, /0\.9\.0/); assert.match(r.out, /0\.10\.0/);
  assert.equal(f.remoteRefs()['refs/tags/v0.9.0'], undefined);
});

test('RF-4.S1: existing remote tags still point to the same objects (INV-1)', t => {
  const f = fixture(t, '0.1.0');
  f.remoteTag('v0.1.0', f.first); f.remoteTag('v0.0.9', f.first, { lightweight: true });
  f.commit('0.2.0');
  const before = f.remoteRefs();
  assert.equal(f.run().status, 0);
  const after = f.remoteRefs();
  for (const [ref, oid] of Object.entries(before)) assert.equal(after[ref], oid, ref);
  const bad = fixture(t, '0.0.5');
  bad.remoteTag('v0.1.0', bad.first);
  const b0 = bad.remoteRefs();
  assert.notEqual(bad.run().status, 0);
  assert.deepEqual(bad.remoteRefs(), b0);
});

// --- RF-6: already released --------------------------------------------------------------------
test('RF-6.H1: v0.2.0 already on this commit: no change, success, says released', t => {
  const f = fixture(t, '0.2.0');
  f.remoteTag('v0.2.0', f.first);
  const before = f.remoteRefs();
  const r = f.run();
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /already released/i);
  assert.deepEqual(f.remoteRefs(), before);
});

test('RF-6.E1: v0.2.0 on an earlier commit and a later push keeps 0.2.0: no change, success', t => {
  const f = fixture(t, '0.2.0');
  f.remoteTag('v0.2.0', f.first);
  f.commit('0.2.0', 'docs only');
  const before = f.remoteRefs();
  const r = f.run();
  assert.equal(r.status, 0, r.out);
  assert.deepEqual(f.remoteRefs(), before);
});

test('RF-6.F1: a lightweight v0.2.0 counts as released and is not replaced', t => {
  const f = fixture(t, '0.2.0');
  f.remoteTag('v0.2.0', f.first, { lightweight: true });
  const before = f.remoteRefs();
  const r = f.run();
  assert.equal(r.status, 0, r.out);
  assert.deepEqual(f.remoteRefs(), before);
});

// --- RF-8: push failures ------------------------------------------------------------------------
test('RF-8.H1: a successful push names the published tag', t => {
  const f = fixture(t, '0.3.0');
  const r = f.run();
  assert.equal(r.status, 0, r.out);
  assert.match(r.stdout, /published v0\.3\.0/);
});

test('RF-8.E1: a tag created on the remote between the check and the push is not replaced', t => {
  const f = fixture(t, '0.2.0');
  const other = f.commit('0.2.0', 'other commit');
  git(f.work, f.root, 'reset', '-q', '--hard', 'HEAD~1');
  // git wrapper: on push, another actor first publishes v0.2.0 on another commit.
  const bin = path.join(f.root, 'bin'); mkdirSync(bin);
  const realGit = execFileSync('/bin/sh', ['-c', 'command -v git'], { encoding: 'utf8' }).trim();
  writeFileSync(path.join(bin, 'git'), `#!/bin/sh\nfor a in "$@"; do\n  if [ "$a" = push ]; then\n    "${realGit}" -C "${f.work}" push -q "${f.remote}" "${other}:refs/tags/v0.2.0" >/dev/null 2>&1\n    break\n  fi\ndone\nexec "${realGit}" "$@"\n`);
  chmodSync(path.join(bin, 'git'), 0o755);
  const r = f.run({ env: { PATH: `${bin}:${process.env.PATH}` } });
  assert.notEqual(r.status, 0, r.out);
  assert.match(r.out, /v0\.2\.0/);
  assert.equal(f.remoteRefs()['refs/tags/v0.2.0'], other, 'competing tag kept');
});

test('RF-8.F1: a remote that rejects the push fails naming the tag; remote tags unchanged', { skip: isRoot() && 'root ignores file modes' }, t => {
  const f = fixture(t, '0.1.0');
  f.remoteTag('v0.1.0', f.first);
  f.commit('0.2.0');
  const before = f.remoteRefs();
  execFileSync('chmod', ['-R', 'a-w', f.remote]);
  const r = f.run();
  assert.notEqual(r.status, 0);
  assert.match(r.out, /v0\.2\.0/);
  execFileSync('chmod', ['-R', 'u+w', f.remote]);
  assert.deepEqual(f.remoteRefs(), before);
});

// --- Static checks of the workflow and the script (A7, C5, C6) ----------------------------------
const wf = () => readFileSync(WORKFLOW, 'utf8');
const lines = () => wf().split('\n');
// Lines that belong to `run:` scripts (inline value or indented block).
function runLines() {
  const out = []; const ls = lines();
  for (let i = 0; i < ls.length; i++) {
    const m = ls[i].match(/^(\s*)(?:- )?run:\s*(.*)$/);
    if (!m) continue;
    const indent = m[1].length;
    if (m[2] && !/^[|>]/.test(m[2])) { out.push(m[2]); continue; }
    for (let j = i + 1; j < ls.length && (ls[j].trim() === '' || ls[j].search(/\S/) > indent); j++) out.push(ls[j]);
  }
  return out;
}
// Text of one job (from `  <name>:` under `jobs:` to the next job or end).
function job(name) {
  const ls = lines(), start = ls.findIndex(l => l === `  ${name}:`);
  if (start < 0) return '';
  let end = start + 1;
  while (end < ls.length && !/^ {2}\S/.test(ls[end]) && !/^\S/.test(ls[end])) end++;
  return ls.slice(start, end).join('\n');
}
const jobNames = () => { const ls = lines(), i = ls.indexOf('jobs:'); return ls.slice(i + 1).filter(l => /^ {2}[A-Za-z0-9_-]+:\s*$/.test(l)).map(l => l.trim().slice(0, -1)); };

test('RF-2.H1: triggers only on push to main; no PR, workflow_run or tag triggers', () => {
  const text = wf();
  assert.match(text, /^on:\s*\n\s+push:\s*\n\s+branches:\s*\[\s*main\s*\]\s*$/m);
  for (const bad of ['pull_request', 'pull_request_target', 'workflow_run', 'workflow_dispatch', 'schedule', 'tags:']) assert.ok(!text.includes(bad), bad);
});

test('RF-1.S1: read-only default, write only in job tag (no actions there), one GITHUB_TOKEN in the push step env, SHA-pinned actions only in job test', () => {
  const text = wf(), tag = job('tag'), tst = job('test');
  assert.match(text, /^permissions:\s*\n\s+contents:\s*read\s*$/m);
  assert.equal((text.match(/contents:\s*write/g) || []).length, 1);
  assert.match(tag, /contents:\s*write/);
  assert.ok(!/uses:/.test(tag), 'job tag runs no action');
  assert.match(tst, /persist-credentials:\s*false/);
  const secrets = text.match(/(secrets\.[A-Za-z_]+|github\.token)/g) || [];
  assert.deepEqual(secrets, ['secrets.GITHUB_TOKEN']);
  const ls = tag.split('\n'), i = ls.findIndex(l => l.includes('secrets.GITHUB_TOKEN'));
  const step = ls.slice(ls.slice(0, i + 1).map((l, k) => (/^\s*- /.test(l) ? k : -1)).filter(k => k >= 0).at(-1), i + 1).join('\n');
  assert.match(step, /env:/); assert.match(step, /release-tag\.mjs/);
  const uses = (text.match(/uses:\s*\S+/g) || []).map(u => u.replace(/uses:\s*/, ''));
  assert.ok(uses.length >= 1);
  for (const u of uses) assert.match(u, /^actions\/(checkout|setup-node)@[0-9a-f]{40}$/, u);
  assert.ok(!/git\s+(commit|push)/.test(runLines().join('\n')), 'no git commit/push in run scripts');
});

test('RF-1.S3: both jobs work on the pushed commit; the tag job fetches $GITHUB_SHA from $GITHUB_REPOSITORY', () => {
  const tst = job('test'), tag = job('tag');
  assert.ok(!/\bref:/.test(tst), 'test checkout has no ref: override');
  assert.match(tag, /git fetch[^\n]*"https:\/\/github\.com\/\$GITHUB_REPOSITORY\.git"[^\n]*"\$GITHUB_SHA"/);
  assert.match(tag, /node tools\/release-tag\.mjs --remote "https:\/\/github\.com\/\$GITHUB_REPOSITORY\.git"/);
});

test('RF-1.S2: no expressions or Version text inside run scripts; failures are never ignored', () => {
  const run = runLines().join('\n');
  assert.ok(!run.includes('${{'), run);
  assert.ok(!/cat\s+VERSION|\$\(.*VERSION/.test(run), run);
  assert.ok(!wf().includes('continue-on-error'));
  assert.ok(!/\|\|\s*true/.test(run));
});

test('RF-5.H1: job test (read-only) runs the toolkit tests; job tag needs it and runs no tests', () => {
  assert.deepEqual(jobNames(), ['test', 'tag']);
  const tst = job('test'), tag = job('tag');
  assert.match(tst, /node --test tools\/test\/\*\.test\.mjs/);
  assert.ok(!/contents:\s*write/.test(tst));
  assert.match(tag, /needs:\s*test/);
  assert.ok(!/node --test/.test(tag));
  for (const j of [tst, tag]) assert.match(j, /runs-on:\s*ubuntu-latest/);
});

test('RF-5.F1: a failed test step stops the job before tagging', () => {
  const text = wf();
  assert.ok(!text.includes('continue-on-error'));
  assert.ok(!/if:.*(always\(\)|failure\(\)|!\s*cancelled\(\))/.test(text), 'no if: that runs after a failure');
});

test('RF-7.H1: one fixed workflow-level concurrency group without cancel-in-progress', () => {
  const text = wf();
  assert.match(text, /^concurrency:\s*\n\s+group:\s*release-tag\s*\n\s+cancel-in-progress:\s*false/m);
  assert.equal((text.match(/concurrency:/g) || []).length, 1);
});

test('C5/C6: the script pushes only refs/tags, never commits or forces; Node 24 in job test; token never in argv', () => {
  const src = readFileSync(SCRIPT, 'utf8');
  assert.match(src, /refs\/tags\//);
  for (const bad of ["'commit'", '"commit"', "'--force'", "'-f'", "'-d'", "'--delete'"]) assert.ok(!src.includes(bad), bad);
  assert.match(job('test'), /node-version:\s*24/);
  assert.ok(!/http\.extraheader=/.test(src), 'token header not passed on the command line');
  assert.match(src, /GIT_CONFIG_COUNT/);
});
