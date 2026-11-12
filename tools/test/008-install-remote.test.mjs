// 008-updater HU-1 — one-line installer tools/install-remote.sh: clone, refusals, permissions, custom area (B3).
// Runs `sh tools/install-remote.sh` (what `sh -c "$(curl …)"` runs) in a temp HOME with a toolbox PATH.
// RIGORKIT_REMOTE is always a local bare repo, a refused value, or https://127.0.0.1:9/… ("network down").
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { execFileSync } from 'node:child_process';
import { chmodSync, cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, readlinkSync, realpathSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { home, cloneCopy, put, toolbox, run, snapshot, which, isRoot, repo } from './rigorkit-fixture.mjs';

const INSTALLER = path.join(repo, 'tools/install-remote.sh');
const NET_DOWN = 'https://127.0.0.1:9/x.git';
const START = '# rigorkit:start', END = '# rigorkit:end';
const PERM_MSG = /go-w|group|others/i; // RF-63 "says so": the message mentions the removed group/other write permission
const AGENTS = (readFileSync(path.join(repo, 'install.sh'), 'utf8').match(/case "\$a" in ([a-z|]+)\)/) || [, ''])[1].split('|');
const AGENT_DIRS = ['.claude', '.agents', '.codex', '.cursor', '.config/opencode'];
const ROOT_SKIP = isRoot() && 'D4: running as root ignores permission bits';

// --- local helpers (the shared fixture is frozen) -----------------------------------------
const real = h => ({ ...h, root: realpathSync(h.root), HOME: realpathSync(h.HOME), TMPDIR: realpathSync(h.TMPDIR) });
const mode = p => (lstatSync(p).mode & 0o777).toString(8);
const GIT_ID = ['-c', 'commit.gpgsign=false', '-c', 'tag.gpgsign=false', '-c', 'user.name=rigorkit-test', '-c', 'user.email=test@example.invalid', '-c', 'init.defaultBranch=main', '-c', 'core.hooksPath=/dev/null'];
function hostGit(args, cwdHome) {
  return execFileSync('git', [...GIT_ID, ...args], {
    encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    env: { PATH: process.env.PATH, HOME: cwdHome || tmpdir(), LC_ALL: 'C', GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1' },
  }).trim();
}

// Bare remote built from a copy of the working tree's runtime files.
// Default: v0.1.0 (no bin/), v0.10.0 (annotated), v0.2.0 committed in that order (newest by semver is not the
// newest by date nor by text), then `main` whose bin/rigorkit writes <root>/<name>-main-ran when run.
const DEFAULT_VERSIONS = [{ tag: 'v0.1.0', bin: false }, { tag: 'v0.10.0', annotated: true }, { tag: 'v0.2.0' }];
function buildRemote(root, { versions = DEFAULT_VERSIONS, main = true, name = 'remote' } = {}) {
  const work = cloneCopy(path.join(root, `${name}-work`));
  const binSaved = path.join(root, `${name}-bin`);
  cpSync(path.join(work, 'bin'), binSaved, { recursive: true });
  hostGit(['init', '-q', work]);
  const g = args => hostGit(['-C', work, ...args]);
  const restoreBin = () => { if (!existsSync(path.join(work, 'bin'))) cpSync(binSaved, path.join(work, 'bin'), { recursive: true }); };
  for (const v of versions) {
    if (v.bin === false) rmSync(path.join(work, 'bin'), { recursive: true, force: true }); else restoreBin();
    writeFileSync(path.join(work, 'VERSION'), `${v.version ?? (v.tag || 'x').replace(/^v/, '')}\n`);
    const forced = [];
    for (const [f, c] of Object.entries(v.files || {})) {
      const abs = path.join(work, f);
      mkdirSync(path.dirname(abs), { recursive: true });
      if (c && c.symlink) symlinkSync(c.symlink, abs); else writeFileSync(abs, c);
      forced.push(f);
    }
    g(['add', '-A']);
    if (forced.length) g(['add', '-f', '--', ...forced]);
    g(['commit', '-q', '--allow-empty', '-m', v.tag || 'commit']);
    for (const tg of [v.tag, ...(v.extraTags || [])].filter(Boolean)) g(v.annotated ? ['tag', '-a', '-m', tg, tg] : ['tag', tg]);
  }
  const marker = path.join(root, `${name}-main-ran`);
  if (main) {
    restoreBin();
    put(path.join(work, 'bin/rigorkit'), `#!/bin/sh\n: > '${marker}'\n`, 0o755);
    writeFileSync(path.join(work, 'VERSION'), 'main\n');
    g(['add', '-A']); g(['commit', '-q', '-m', 'main']);
  }
  const bare = path.join(root, `${name}.git`);
  hostGit(['clone', '-q', '--bare', work, bare]);
  return { path: bare, marker, commit: ref => hostGit(['-C', bare, 'rev-parse', `${ref}^{commit}`]) };
}

// Shared default remote (read-only for every test that uses it).
let shared;
function sharedRemote() {
  if (!shared) {
    const root = realpathSync(mkdtempSync(path.join(tmpdir(), 'rigorkit-008-remote-')));
    process.on('exit', () => rmSync(root, { recursive: true, force: true })); // not a test hook: shared across tests
    shared = buildRemote(root);
  }
  return shared;
}

const wrap = (bin, body = 'exec') => `#!/bin/sh\n${body === 'exec' ? `exec '${bin}' "$@"` : body}\n`;
// Tools outside the frozen fixture's list that a POSIX installer may reasonably call.
const EXTRA_TOOLS = ['rmdir', 'xargs', 'expr', 'true', 'false', 'tee', 'sleep', 'pwd', 'cmp', 'od'];
function box(t, root, { without = [], stubs = {}, sub = 'tb' } = {}) {
  const extra = {};
  for (const tool of EXTRA_TOOLS) { const f = which(tool); if (f && !without.includes(tool)) extra[tool] = wrap(f); }
  return toolbox(t, path.join(root, sub), { without: ['zsh', 'bash', ...without], stubs: { zsh: '#!/bin/sh\nexit 0\n', ...extra, ...stubs } });
}
// git wrapper: records each call (GIT_ALLOW_PROTOCOL + argv), optionally rewrites one argument and fails clones.
function gitStub(log, { from, to, failClone = false } = {}) {
  const realGit = which('git');
  const rewrite = from ? `for a do shift; [ "$a" = '${from}' ] && a='${to}'; set -- "$@" "$a"; done\n` : '';
  const tail = failClone
    ? `'${realGit}' "$@"; s=$?\ncase " $* " in *" clone "*) exit 128 ;; esac\nexit $s`
    : `exec '${realGit}' "$@"`;
  return `#!/bin/sh\n{ printf 'GAP=%s' "\${GIT_ALLOW_PROTOCOL-<unset>}"; for a do printf ' [%s]' "$a"; done; echo; } >> '${log}'\n${rewrite}${tail}\n`;
}
const chmodFail = log => `#!/bin/sh\nprintf 'chmod %s\\n' "$*" >> '${log}'\necho "chmod: denied $*" >&2\nexit 1\n`;
const chmodFailOn = (log, target) => `#!/bin/sh\nprintf 'chmod %s\\n' "$*" >> '${log}'\nfor a do case $a in '${target}'|'${target}/') echo "chmod: denied $a" >&2; exit 1 ;; esac; done\nexec '${which('chmod')}' "$@"\n`;
const readLog = f => (existsSync(f) ? readFileSync(f, 'utf8') : '');

function setup(t, { remote, versions, name = 'home', without, stubs, env = {} } = {}) {
  const h = real(home(t, { name }));
  const r = remote || (versions ? buildRemote(h.root, { versions }) : sharedRemote());
  const tb = box(t, h.root, { without, stubs: typeof stubs === 'function' ? stubs(h) : stubs });
  const T = path.join(h.HOME, '.rigorkit');
  const baseEnv = { HOME: h.HOME, TMPDIR: h.TMPDIR, SHELL: '/bin/zsh', PATH: tb, RIGORKIT_REMOTE: r.path, ...env };
  const install = (extra = {}, { umask = '022' } = {}) => {
    const e = { ...baseEnv, ...extra };
    for (const k of Object.keys(e)) if (e[k] === undefined) delete e[k];
    return run('/bin/sh', [INSTALLER], { env: e, umask });
  };
  const head = (dir = T) => hostGit(['-C', dir, 'rev-parse', 'HEAD']);
  const status = (dir = T) => hostGit(['-C', dir, 'status', '--porcelain']);
  const leftovers = () => readdirSync(h.HOME).filter(n => n.startsWith('.rigorkit-install.'));
  const zshrc = path.join(h.HOME, '.zshrc');
  return { ...h, r, tb, T, install, head, status, leftovers, zshrc, env: baseEnv };
}
// ~/.rigorkit holding only custom/ (the RF-51 case).
function customOnly(s, files = { 'packs/mine/rules.md': 'mine\n' }) {
  for (const [f, c] of Object.entries(files)) put(path.join(s.T, 'custom', f), c);
  return path.join(s.T, 'custom');
}
// An existing clone made without the installer (host git), at ref.
function existingClone(s, ref = 'v0.10.0', remote = s.r) {
  hostGit(['clone', '-q', '--branch', ref, remote.path, s.T]);
  return s.T;
}
// Paths under dir (symlinks excluded) whose mode has group or other write.
function looseModes(dir, { dirsOnly = false } = {}) {
  const out = [];
  const walk = p => {
    const st = lstatSync(p);
    if (st.isSymbolicLink()) return;
    if ((st.mode & 0o022) && (!dirsOnly || st.isDirectory())) out.push(path.relative(dir, p) || '.');
    if (st.isDirectory()) for (const e of readdirSync(p)) walk(path.join(p, e));
  };
  walk(dir);
  return out;
}
const blockCount = f => readFileSync(f, 'utf8').split('\n').filter(l => l === START).length;
const userZshrc = s => put(s.zshrc, 'export TOKEN_DIR=/x\nalias ll="ls -l"\n');

// --- RF-1: one-line installation ------------------------------------------------------------
test('RF-1.H1: clones the newest vX.Y.Z tag, creates empty custom folders, installs no pack and names the next step', t => {
  const s = setup(t, { versions: [...DEFAULT_VERSIONS.slice(0, 2), { tag: 'v0.2.0', extraTags: ['v9.9', 'latest'] }] });
  const r = s.install();
  assert.equal(r.status, 0, r.out);
  assert.equal(s.head(), s.r.commit('v0.10.0'));
  for (const d of ['custom/packs', 'custom/scripts']) assert.deepEqual(readdirSync(path.join(s.T, d)), [], d);
  assert.equal(s.status(), '');
  for (const d of AGENT_DIRS) assert.equal(existsSync(path.join(s.HOME, d)), false, `${d} must not exist`);
  assert.match(r.out, /new shell/i);
  assert.match(r.out, /rigorkit install --pack core --agent \S+ --global/);
  assert.ok(AGENTS.length >= 4, 'agent list parsed from install.sh');
  for (const a of AGENTS) assert.match(r.out, new RegExp(`\\b${a}\\b`), `names agent ${a}`);
  assert.deepEqual(s.leftovers(), []);
});

test('RF-1.E2: RIGORKIT_REF=main clones main', t => {
  const s = setup(t);
  const r = s.install({ RIGORKIT_REF: 'main' });
  assert.equal(r.status, 0, r.out);
  assert.equal(s.head(), s.r.commit('main'));
});

test('RF-1.E1: no vX.Y.Z tag in the remote: error says no release exists, nothing left, startup files unchanged', t => {
  const s = setup(t, { versions: [{ tag: 'release-1' }, { tag: 'v1.0' }] });
  userZshrc(s);
  const before = snapshot(s.HOME);
  const r = s.install();
  assert.notEqual(r.status, 0);
  assert.match(r.out, /no release/i);
  assert.deepEqual(snapshot(s.HOME), before);
});

test('RF-1.F1: network down: error names the remote, no ~/.rigorkit, startup files unchanged', t => {
  const s = setup(t);
  userZshrc(s);
  const before = snapshot(s.HOME);
  const r = s.install({ RIGORKIT_REMOTE: NET_DOWN });
  assert.notEqual(r.status, 0);
  assert.ok(r.out.includes(NET_DOWN), r.out);
  assert.deepEqual(snapshot(s.HOME), before);
});

test('RF-1.F2: git not installed: error names git, nothing written', t => {
  const s = setup(t, { without: ['git'] });
  userZshrc(s);
  const before = snapshot(s.HOME);
  const r = s.install();
  assert.notEqual(r.status, 0);
  assert.match(r.out, /\bgit\b/);
  assert.deepEqual(snapshot(s.HOME), before);
});

test('RF-1.F3: RIGORKIT_REF=nope: error names nope, no ~/.rigorkit, startup files unchanged', t => {
  const s = setup(t);
  userZshrc(s);
  const before = snapshot(s.HOME);
  const r = s.install({ RIGORKIT_REF: 'nope' });
  assert.notEqual(r.status, 0);
  assert.match(r.out, /\bnope\b/);
  assert.deepEqual(snapshot(s.HOME), before);
});

test('RF-1.S1: only the tag\'s files run: main\'s marker-writing bin/rigorkit never runs', t => {
  const s = setup(t, { remote: buildRemote(real(home(t, { name: 'r' })).root) });
  const r = s.install();
  assert.equal(r.status, 0, r.out);
  const help = run(path.join(s.T, 'bin/rigorkit'), ['help'], { env: { HOME: s.HOME, TMPDIR: s.TMPDIR } });
  assert.equal(help.status, 0, help.out);
  assert.equal(existsSync(s.r.marker), false, 'main bin/rigorkit ran');
});

// --- RF-48: RIGORKIT_REMOTE -----------------------------------------------------------------
test('RF-48.H1: RIGORKIT_REMOTE local path clones from it at v0.2.0', t => {
  const s = setup(t, { versions: [{ tag: 'v0.1.0', bin: false }, { tag: 'v0.2.0' }] });
  const r = s.install();
  assert.equal(r.status, 0, r.out);
  assert.equal(s.head(), s.r.commit('v0.2.0'));
  assert.equal(realpathSync(hostGit(['-C', s.T, 'remote', 'get-url', 'origin'])), realpathSync(s.r.path));
});

test('RF-48.E1: an SSH fork remote (user@host:path) is accepted and passed to git after --', t => {
  const SSH = 'git@github.com:me/rigorkit.git';
  const s = setup(t, { stubs: h => ({ git: gitStub(path.join(h.root, 'git.log'), { from: SSH, to: sharedRemote().path }) }), env: { RIGORKIT_REMOTE: SSH } });
  const log = path.join(s.root, 'git.log');
  const r = s.install();
  assert.equal(r.status, 0, r.out);
  assert.equal(s.head(), s.r.commit('v0.10.0'));
  const calls = readLog(log).split('\n').filter(l => l.includes(`[${SSH}]`));
  assert.ok(calls.length > 0, 'git called with the SSH remote');
  for (const c of calls) assert.ok(c.indexOf('[--]') >= 0 && c.indexOf('[--]') < c.indexOf(`[${SSH}]`), `-- before the remote: ${c}`);
});

test('RF-48.F1: a RIGORKIT_REMOTE path that does not exist: error names it, no ~/.rigorkit', t => {
  const s = setup(t);
  const missing = path.join(s.root, 'no-such-remote');
  const before = snapshot(s.HOME);
  const r = s.install({ RIGORKIT_REMOTE: missing });
  assert.notEqual(r.status, 0);
  assert.ok(r.out.includes(missing), r.out);
  assert.equal(existsSync(s.T), false);
  assert.deepEqual(snapshot(s.HOME), before);
});

test('RF-48.S1: http://, git://, file:// and empty RIGORKIT_REMOTE are refused naming the value, nothing written', t => {
  const s = setup(t);
  userZshrc(s);
  const before = snapshot(s.HOME);
  for (const v of ['http://127.0.0.1:9/x.git', 'git://127.0.0.1:9/x.git', `file://${s.r.path}`, '']) {
    const r = s.install({ RIGORKIT_REMOTE: v });
    assert.notEqual(r.status, 0, `accepted ${JSON.stringify(v)}`);
    assert.ok(v ? r.out.includes(v) : /RIGORKIT_REMOTE/.test(r.out), `names ${JSON.stringify(v)}: ${r.out}`);
    assert.deepEqual(snapshot(s.HOME), before, v);
  }
});

// --- RF-60: values that would become options ------------------------------------------------
test('RF-60.H1: RIGORKIT_REF=v0.2.0 clones v0.2.0', t => {
  const s = setup(t);
  const r = s.install({ RIGORKIT_REF: 'v0.2.0' });
  assert.equal(r.status, 0, r.out);
  assert.equal(s.head(), s.r.commit('v0.2.0'));
});

test('RF-60.E1: invalid (v0..2) or empty RIGORKIT_REF is refused naming it, nothing written', t => {
  const s = setup(t);
  userZshrc(s);
  const before = snapshot(s.HOME);
  for (const v of ['v0..2', '']) {
    const r = s.install({ RIGORKIT_REF: v });
    assert.notEqual(r.status, 0, `accepted ${JSON.stringify(v)}`);
    assert.ok(v ? r.out.includes(v) : /RIGORKIT_REF/.test(r.out), `names ${JSON.stringify(v)}: ${r.out}`);
    assert.deepEqual(snapshot(s.HOME), before, v);
  }
});

test('RF-60.F1: RIGORKIT_REF=--upload-pack=touch_marker is refused, marker absent, no ~/.rigorkit', t => {
  const s = setup(t, { stubs: h => ({ touch_marker: `#!/bin/sh\n: > '${path.join(h.root, 'marker')}'\n` }) });
  const marker = path.join(s.root, 'marker');
  const before = snapshot(s.HOME);
  const v = '--upload-pack=touch_marker';
  const r = s.install({ RIGORKIT_REF: v });
  assert.notEqual(r.status, 0);
  assert.ok(r.out.includes(v), r.out);
  assert.equal(existsSync(marker), false);
  assert.equal(existsSync(s.T), false);
  assert.deepEqual(snapshot(s.HOME), before);
});

test('RF-60.S1: RIGORKIT_REMOTE with a user, host or path starting with - is refused, marker absent, nothing written', t => {
  const touch = h => `#!/bin/sh\n: > '${path.join(h.root, 'marker')}'\nexit 255\n`;
  const s = setup(t, { stubs: h => ({ touch_marker: touch(h), ssh: touch(h) }) });
  const marker = path.join(s.root, 'marker');
  const before = snapshot(s.HOME);
  for (const v of ['-oProxyCommand=touch_marker@h:p', 'ssh://-oProxyCommand=touch_marker/p', 'git@-oProxyCommand=touch_marker:p', 'git@h:-p', 'https://-oProxy/x']) {
    const r = s.install({ RIGORKIT_REMOTE: v });
    assert.notEqual(r.status, 0, `accepted ${v}`);
    assert.ok(r.out.includes(v), `names ${v}: ${r.out}`);
    assert.equal(existsSync(marker), false, v);
    assert.deepEqual(snapshot(s.HOME), before, v);
  }
});

// --- RF-63: permissions of a new clone ------------------------------------------------------
test('RF-63.H1: umask 022: ~/.rigorkit mode unchanged (755) and no permission message', t => {
  const s = setup(t);
  const r = s.install({}, { umask: '022' });
  assert.equal(r.status, 0, r.out);
  assert.equal(mode(s.T), '755');
  assert.doesNotMatch(r.out, PERM_MSG);
});

test('RF-63.E1: umask 000: group/other write removed from the clone and the message says so', t => {
  const s = setup(t);
  const r = s.install({}, { umask: '000' });
  assert.equal(r.status, 0, r.out);
  assert.deepEqual(looseModes(s.T), []);
  assert.match(r.out, PERM_MSG);
});

test('RF-63.F1: umask 000 and a failing chmod: error names the path, no ~/.rigorkit, startup files unchanged, tmp removed', t => {
  const s = setup(t, { stubs: h => ({ chmod: chmodFail(path.join(h.root, 'chmod.log')) }) });
  const log = path.join(s.root, 'chmod.log');
  userZshrc(s);
  const before = snapshot(s.HOME);
  const r = s.install({}, { umask: '000' });
  assert.notEqual(r.status, 0);
  assert.ok(readLog(log).length > 0, 'chmod was called');
  assert.ok(r.out.includes(`${s.HOME}/.rigorkit-install.`), `names a path in the temporary clone: ${r.out}`);
  assert.deepEqual(snapshot(s.HOME), before);
});

test('RF-63.E2: RF-51 case, umask 000, failing chmod: ~/.rigorkit holds only the original custom/, byte- and mode-equal', t => {
  const s = setup(t, { stubs: h => ({ chmod: chmodFail(path.join(h.root, 'chmod.log')) }) });
  const log = path.join(s.root, 'chmod.log');
  customOnly(s);
  userZshrc(s);
  const before = snapshot(s.HOME);
  const r = s.install({}, { umask: '000' });
  assert.notEqual(r.status, 0);
  assert.ok(readLog(log).length > 0, 'chmod was called');
  assert.deepEqual(readdirSync(s.T), ['custom']);
  assert.deepEqual(snapshot(s.HOME), before);
});

test('RF-63.E3: RF-51 case, ~/.rigorkit 777 and custom/ 775: ~/.rigorkit becomes 755 with a message, custom/ stays 775', t => {
  const s = setup(t);
  const custom = customOnly(s);
  chmodSync(custom, 0o775); chmodSync(s.T, 0o777);
  const r = s.install();
  assert.equal(r.status, 0, r.out);
  assert.equal(mode(s.T), '755');
  assert.match(r.out, PERM_MSG);
  assert.ok(r.out.includes(s.T), `message names ~/.rigorkit: ${r.out}`);
  assert.equal(mode(custom), '775');
});

test('RF-63.F2: RF-51 case, ~/.rigorkit 777, chmod fails only on it: error names it, original custom/ kept, tmp removed', t => {
  const s = setup(t, { stubs: h => ({ chmod: chmodFailOn(path.join(h.root, 'chmod.log'), path.join(h.HOME, '.rigorkit')) }) });
  const log = path.join(s.root, 'chmod.log');
  customOnly(s);
  chmodSync(s.T, 0o777);
  userZshrc(s);
  const before = snapshot(s.HOME);
  const r = s.install({}, { umask: '022' });
  assert.notEqual(r.status, 0);
  assert.ok(r.out.includes(s.T), r.out);
  assert.deepEqual(readdirSync(s.T), ['custom']);
  assert.equal(mode(s.T), '777');
  assert.deepEqual(snapshot(s.HOME), before);
});

test('RF-63.S1: umask 000: no file or folder in ~/.rigorkit is writable by group or others', t => {
  const s = setup(t);
  const r = s.install({}, { umask: '000' });
  assert.equal(r.status, 0, r.out);
  assert.deepEqual(looseModes(s.T), []);
});

// --- RF-64: existing custom/ with loose modes (RF-51 case) ----------------------------------
test('RF-64.H1: RF-51 case, custom/scripts/x 775: x unchanged, warning names x and chmod go-w, new clone fixed', t => {
  const s = setup(t);
  customOnly(s);
  const x = put(path.join(s.T, 'custom/scripts/x'), '#!/bin/sh\n', 0o775);
  const r = s.install({}, { umask: '000' });
  assert.equal(r.status, 0, r.out);
  assert.equal(mode(x), '775');
  assert.match(r.out, /chmod go-w/);
  assert.ok(r.out.includes('custom/scripts/x'), r.out);
  assert.deepEqual(looseModes(s.T).filter(p => !p.startsWith('custom')), []);
});

test('RF-64.E1: RF-51 case, custom/ modes 755/644: no warning', t => {
  const s = setup(t);
  customOnly(s, { 'packs/mine/rules.md': 'm\n', 'scripts/y': '#!/bin/sh\n' });
  chmodSync(path.join(s.T, 'custom/scripts/y'), 0o644);
  const r = s.install();
  assert.equal(r.status, 0, r.out);
  assert.doesNotMatch(r.out, /chmod go-w/);
});

test('RF-64.F1: RF-51 case, unreadable custom/packs/secret: warning names it, install continues, mode unchanged', { skip: ROOT_SKIP }, t => {
  const s = setup(t);
  customOnly(s, { 'packs/secret/rules.md': 's\n' });
  const secret = path.join(s.T, 'custom/packs/secret');
  chmodSync(secret, 0o000);
  const r = s.install();
  assert.equal(r.status, 0, r.out);
  assert.ok(r.out.includes('custom/packs/secret'), r.out);
  assert.ok(existsSync(path.join(s.T, 'bin/rigorkit')), 'install continued');
  assert.equal(mode(secret), '0');
});

test('RF-64.E2: existing clone with custom/scripts/x 775: no RF-64 warning on a re-run', t => {
  const s = setup(t);
  assert.equal(s.install().status, 0);
  const x = put(path.join(s.T, 'custom/scripts/x'), '#!/bin/sh\n', 0o775);
  const r = s.install();
  assert.equal(r.status, 0, r.out);
  assert.doesNotMatch(r.out, /chmod go-w/);
  assert.equal(mode(x), '775');
});

test('RF-64.S1: RF-51 case with mixed modes: every mode and byte in custom/ unchanged (INV-3)', t => {
  const s = setup(t);
  const custom = customOnly(s, { 'packs/mine/rules.md': 'm\n', 'packs/mine/skills/a/SKILL.md': 'a\n', 'scripts/run': '#!/bin/sh\n', 'scripts/priv': 'p\n' });
  chmodSync(path.join(custom, 'packs/mine'), 0o775);
  chmodSync(path.join(custom, 'packs/mine/rules.md'), 0o664);
  chmodSync(path.join(custom, 'scripts/run'), 0o777);
  chmodSync(path.join(custom, 'scripts/priv'), 0o600);
  chmodSync(path.join(custom, 'packs/mine/skills'), 0o700);
  const before = snapshot(custom);
  const r = s.install({}, { umask: '000' });
  assert.equal(r.status, 0, r.out);
  assert.deepEqual(Object.fromEntries(Object.entries(snapshot(custom)).filter(([k]) => k in before)), before);
});

// --- RF-65: custom folders created without group/other write --------------------------------
test('RF-65.H1: new clone, umask 000: custom/, custom/packs/, custom/scripts/ not group/other-writable', t => {
  const s = setup(t);
  const r = s.install({}, { umask: '000' });
  assert.equal(r.status, 0, r.out);
  for (const d of ['custom', 'custom/packs', 'custom/scripts']) assert.equal(statSync(path.join(s.T, d)).mode & 0o022, 0, d);
});

test('RF-65.E1: RF-51 case with only custom/packs/, umask 000: created custom/scripts/ not loose, custom/packs/ unchanged', t => {
  const s = setup(t);
  mkdirSync(path.join(s.T, 'custom/packs'), { recursive: true });
  chmodSync(path.join(s.T, 'custom/packs'), 0o775);
  const r = s.install({}, { umask: '000' });
  assert.equal(r.status, 0, r.out);
  assert.equal(statSync(path.join(s.T, 'custom/scripts')).mode & 0o022, 0);
  assert.equal(mode(path.join(s.T, 'custom/packs')), '775');
});

test('RF-65.F1: RF-51 case, custom/ 555 with only packs/: error names custom/scripts and mkdir -m 755, clone and blocks kept', { skip: ROOT_SKIP }, t => {
  const s = setup(t);
  mkdirSync(path.join(s.T, 'custom/packs'), { recursive: true });
  const custom = path.join(s.T, 'custom');
  chmodSync(custom, 0o555);
  const before = snapshot(custom);
  const r = s.install();
  assert.notEqual(r.status, 0);
  assert.match(r.out, /custom\/scripts/);
  assert.match(r.out, /mkdir -m 755 \S*custom\/scripts/);
  assert.deepEqual(snapshot(custom), before);
  assert.equal(s.head(), s.r.commit('v0.10.0'));
  assert.ok(existsSync(path.join(s.T, 'bin/rigorkit')));
  assert.equal(blockCount(s.zshrc), 1, 'startup block added');
});

test('RF-65.S1: umask 000: no folder created by the installer is group/other-writable', t => {
  const s = setup(t);
  const r = s.install({}, { umask: '000' });
  assert.equal(r.status, 0, r.out);
  assert.deepEqual(looseModes(s.T, { dirsOnly: true }), []);
});

// --- RF-51: ~/.rigorkit with only custom/ ---------------------------------------------------
test('RF-51.H1: ~/.rigorkit with only custom/packs/mine: clone moved in, mine byte-equal, empty scripts/, clean status', t => {
  const s = setup(t);
  const custom = customOnly(s, { 'packs/mine/rules.md': 'mine rules\n', 'packs/mine/skills/a/SKILL.md': 'a\n' });
  const mine = snapshot(path.join(custom, 'packs/mine'));
  const r = s.install();
  assert.equal(r.status, 0, r.out);
  assert.equal(s.head(), s.r.commit('v0.10.0'));
  assert.deepEqual(snapshot(path.join(custom, 'packs/mine')), mine);
  assert.deepEqual(readdirSync(path.join(custom, 'scripts')), []);
  assert.equal(s.status(), '');
});

test('RF-51.E1: ~/.rigorkit with custom/ and another file is refused per RF-45', t => {
  const s = setup(t);
  customOnly(s);
  put(path.join(s.T, 'notes.txt'), 'n\n');
  userZshrc(s);
  const before = snapshot(s.HOME);
  const r = s.install();
  assert.notEqual(r.status, 0);
  assert.ok(r.out.includes(s.T), r.out);
  assert.deepEqual(snapshot(s.HOME), before);
});

test('RF-51.F1: RF-51 case, network down: error, ~/.rigorkit holds only the original custom/, tmp removed', t => {
  const s = setup(t);
  customOnly(s);
  const before = snapshot(s.HOME);
  const r = s.install({ RIGORKIT_REMOTE: NET_DOWN });
  assert.notEqual(r.status, 0);
  assert.ok(r.out.includes(NET_DOWN), r.out);
  assert.deepEqual(readdirSync(s.T), ['custom']);
  assert.deepEqual(snapshot(s.HOME), before);
});

test('RF-51.S1: success or failure, every existing file in custom/ stays byte-equal (INV-3)', t => {
  for (const [label, extra] of [['success', {}], ['failure', { RIGORKIT_REMOTE: NET_DOWN }]]) {
    const s = setup(t, { name: label });
    const custom = customOnly(s, { 'packs/mine/rules.md': 'r\n', 'scripts/tool': '#!/bin/sh\necho hi\n' });
    const before = snapshot(custom);
    const r = s.install(extra);
    assert.equal(r.status === 0, label === 'success', `${label}: ${r.out}`);
    const now = snapshot(custom);
    for (const [k, v] of Object.entries(before)) if (!v.startsWith('dir:')) assert.equal(now[k], v, `${label}: ${k}`);
  }
});

// --- RF-53: no bin/rigorkit -----------------------------------------------------------------
test('RF-53.H1: RIGORKIT_REF=v0.1.0 (no bin/rigorkit): refused naming v0.1.0, nothing left, startup files unchanged', t => {
  const s = setup(t);
  userZshrc(s);
  const before = snapshot(s.HOME);
  const r = s.install({ RIGORKIT_REF: 'v0.1.0' });
  assert.notEqual(r.status, 0);
  assert.match(r.out, /v0\.1\.0/);
  assert.deepEqual(s.leftovers(), []);
  assert.deepEqual(snapshot(s.HOME), before);
});

test('RF-53.E1: existing ~/.rigorkit from before HU-1 without bin/rigorkit: refused, no block added', t => {
  const s = setup(t);
  existingClone(s, 'v0.1.0');
  userZshrc(s);
  const before = snapshot(s.HOME);
  const r = s.install();
  assert.notEqual(r.status, 0);
  assert.match(r.out, /bin\/rigorkit/);
  assert.deepEqual(snapshot(s.HOME), before);
});

test('RF-53.F1: a fork whose newest tag lacks bin/rigorkit: refused naming the tag', t => {
  const s = setup(t, { versions: [{ tag: 'v0.2.0' }, { tag: 'v0.3.0', bin: false }] });
  userZshrc(s);
  const before = snapshot(s.HOME);
  const r = s.install();
  assert.notEqual(r.status, 0);
  assert.match(r.out, /v0\.3\.0/);
  assert.deepEqual(snapshot(s.HOME), before);
});

test('X1: every RF-53 refusal removes the temporary folder (umask 000 tmp)', t => {
  const s = setup(t);
  const r = s.install({ RIGORKIT_REF: 'v0.1.0' }, { umask: '000' });
  assert.notEqual(r.status, 0);
  assert.match(r.out, /v0\.1\.0/);
  assert.deepEqual(s.leftovers(), []);
  assert.deepEqual(readdirSync(s.HOME), []);
});

test('X2: the RF-51 top-folder fix runs after the RF-53 check: refusal keeps ~/.rigorkit mode 777', t => {
  const s = setup(t);
  customOnly(s);
  chmodSync(s.T, 0o777);
  const before = snapshot(s.HOME);
  const r = s.install({ RIGORKIT_REF: 'v0.1.0' });
  assert.notEqual(r.status, 0);
  assert.match(r.out, /v0\.1\.0/);
  assert.equal(mode(s.T), '777');
  assert.deepEqual(s.leftovers(), []);
  assert.deepEqual(snapshot(s.HOME), before);
});

// --- RF-56: clone failures leave nothing ----------------------------------------------------
test('RF-56.H1: git missing: error names git, no ~/.rigorkit, exit non-zero', t => {
  const s = setup(t, { without: ['git'] });
  const r = s.install();
  assert.notEqual(r.status, 0);
  assert.match(r.out, /\bgit\b/);
  assert.equal(existsSync(s.T), false);
  assert.deepEqual(readdirSync(s.HOME), []);
});

test('RF-56.E1: remote without vX.Y.Z tags: error says no release exists', t => {
  const s = setup(t, { versions: [{ tag: 'beta' }] });
  const r = s.install();
  assert.notEqual(r.status, 0);
  assert.match(r.out, /no release/i);
  assert.equal(existsSync(s.T), false);
});

test('RF-56.F1: clone fails midway: partial clone and temporary folder removed, exit non-zero', t => {
  const s = setup(t, { stubs: h => ({ git: gitStub(path.join(h.root, 'git.log'), { failClone: true }) }) });
  const log = path.join(s.root, 'git.log');
  userZshrc(s);
  const before = snapshot(s.HOME);
  const r = s.install();
  assert.notEqual(r.status, 0);
  assert.match(readLog(log), /\[clone\]/, 'clone attempted');
  assert.deepEqual(s.leftovers(), []);
  assert.deepEqual(snapshot(s.HOME), before);
});

test('RF-56.S1: every RF-56 failure leaves existing startup files byte-equal', t => {
  const cases = [
    ['git missing', { without: ['git'] }, {}, /\bgit\b/],
    ['no release', { versions: [{ tag: 'beta' }] }, {}, /no release/i],
    ['unknown ref', {}, { RIGORKIT_REF: 'nope' }, /\bnope\b/],
    ['network down', {}, { RIGORKIT_REMOTE: NET_DOWN }, /127\.0\.0\.1:9/],
  ];
  for (const [label, opts, extra, cause] of cases) {
    const s = setup(t, { name: label.replace(/ /g, '-'), stubs: { bash: '#!/bin/sh\nexit 0\n' }, ...opts });
    userZshrc(s);
    put(path.join(s.HOME, '.bashrc'), 'export A=1\n', 0o600);
    put(path.join(s.HOME, '.bash_profile'), 'export B=2\n');
    const before = snapshot(s.HOME);
    const r = s.install(extra);
    assert.notEqual(r.status, 0, label);
    assert.match(r.out, cause, `${label} names the cause: ${r.out}`);
    assert.deepEqual(snapshot(s.HOME), before, label);
  }
});

// --- RF-58: env values with an existing clone -----------------------------------------------
test('RF-58.H1: installed, RIGORKIT_REF=main: warning names it, already installed, clone unchanged, no git call', t => {
  const s = setup(t, { stubs: h => ({ git: gitStub(path.join(h.root, 'git.log')) }) });
  const log = path.join(s.root, 'git.log');
  assert.equal(s.install().status, 0);
  const before = snapshot(s.HOME);
  writeFileSync(log, '');
  const r = s.install({ RIGORKIT_REF: 'main' });
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /RIGORKIT_REF/);
  assert.match(r.out, /already installed/i);
  assert.deepEqual(snapshot(s.HOME), before);
  assert.equal(readLog(log), '', 'no git call with an existing clone (Q2)');
});

test('RF-58.E1: RIGORKIT_REMOTE set and a block missing: warning, missing block added', t => {
  const s = setup(t);
  userZshrc(s);
  const original = readFileSync(s.zshrc, 'utf8');
  assert.equal(s.install().status, 0);
  writeFileSync(s.zshrc, original);
  const r = s.install({ RIGORKIT_REMOTE: path.join(s.root, 'other.git') });
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /RIGORKIT_REMOTE/);
  assert.equal(blockCount(s.zshrc), 1);
});

test('RF-58.F1: invalid RIGORKIT_REMOTE (http://) with an existing clone: warning only, clone unchanged', t => {
  const s = setup(t);
  assert.equal(s.install().status, 0);
  const before = snapshot(s.T);
  const r = s.install({ RIGORKIT_REMOTE: 'http://127.0.0.1:9/x.git' });
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /RIGORKIT_REMOTE/);
  assert.deepEqual(snapshot(s.T), before);
});

test('RF-58.E2: installed, RIGORKIT_REF=--upload-pack=touch_marker: warning only, marker absent, clone unchanged, exit 0', t => {
  const s = setup(t, { stubs: h => ({ touch_marker: `#!/bin/sh\n: > '${path.join(h.root, 'marker')}'\n` }) });
  const marker = path.join(s.root, 'marker');
  assert.equal(s.install().status, 0);
  const before = snapshot(s.T);
  const r = s.install({ RIGORKIT_REF: '--upload-pack=touch_marker' });
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /RIGORKIT_REF/);
  assert.equal(existsSync(marker), false);
  assert.deepEqual(snapshot(s.T), before);
});

// --- RF-2 / RF-44: re-runs ------------------------------------------------------------------
test('RF-2.H1: installed with all blocks: a re-run says already installed, exit 0, every file byte-equal', t => {
  const s = setup(t, { stubs: { bash: '#!/bin/sh\nexit 0\n' } });
  userZshrc(s);
  put(path.join(s.HOME, '.bashrc'), 'export A=1\n');
  assert.equal(s.install().status, 0);
  const before = snapshot(s.HOME);
  const r = s.install();
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /already installed/i);
  assert.deepEqual(snapshot(s.HOME), before);
});

test('RF-2.E1: three runs leave one block per startup file', t => {
  const s = setup(t, { stubs: { bash: '#!/bin/sh\nexit 0\n' } });
  userZshrc(s);
  put(path.join(s.HOME, '.bashrc'), 'export A=1\n');
  put(path.join(s.HOME, '.bash_profile'), 'export B=2\n');
  for (let i = 0; i < 3; i++) assert.equal(s.install().status, 0, `run ${i + 1}`);
  for (const f of ['.zshrc', '.bashrc', '.bash_profile']) {
    const text = readFileSync(path.join(s.HOME, f), 'utf8');
    assert.equal(text.split('\n').filter(l => l === START).length, 1, f);
    assert.equal(text.split('\n').filter(l => l === END).length, 1, f);
  }
});

test('RF-44.H1: clone exists, user removed the .zshrc block: block added once, clone untouched', t => {
  const s = setup(t);
  userZshrc(s);
  const original = readFileSync(s.zshrc, 'utf8');
  assert.equal(s.install().status, 0);
  writeFileSync(s.zshrc, original);
  const clone = snapshot(s.T);
  const r = s.install();
  assert.equal(r.status, 0, r.out);
  assert.equal(blockCount(s.zshrc), 1);
  assert.ok(readFileSync(s.zshrc, 'utf8').startsWith(original));
  assert.deepEqual(snapshot(s.T), clone);
});

test('RF-44.E1: block in .zshrc, missing in .bashrc: only .bashrc gets it', t => {
  const s = setup(t, { stubs: { bash: '#!/bin/sh\nexit 0\n' } });
  userZshrc(s);
  const bashrc = put(path.join(s.HOME, '.bashrc'), 'export A=1\n');
  assert.equal(s.install().status, 0);
  writeFileSync(bashrc, 'export A=1\n');
  const zsh = snapshot(s.HOME)['.zshrc'];
  const r = s.install();
  assert.equal(r.status, 0, r.out);
  assert.equal(blockCount(bashrc), 1);
  assert.equal(snapshot(s.HOME)['.zshrc'], zsh);
});

test('RF-44.F1: one of two missing blocks cannot be written: error names it, the other added, clone untouched', { skip: ROOT_SKIP }, t => {
  const s = setup(t, { stubs: { bash: '#!/bin/sh\nexit 0\n' } });
  userZshrc(s);
  const zOrig = readFileSync(s.zshrc, 'utf8');
  const bashrc = put(path.join(s.HOME, '.bashrc'), 'export A=1\n');
  assert.equal(s.install().status, 0);
  writeFileSync(s.zshrc, zOrig); writeFileSync(bashrc, 'export A=1\n');
  chmodSync(s.zshrc, 0o444);
  const clone = snapshot(s.T);
  const r = s.install();
  assert.notEqual(r.status, 0);
  assert.ok(r.out.includes('.zshrc'), r.out);
  assert.equal(readFileSync(s.zshrc, 'utf8'), zOrig);
  assert.equal(blockCount(bashrc), 1);
  assert.deepEqual(snapshot(s.T), clone);
});

test('RF-44.E2: clone and blocks exist, custom/ missing: already installed, custom/ not created', t => {
  const s = setup(t);
  assert.equal(s.install().status, 0);
  rmSync(path.join(s.T, 'custom'), { recursive: true });
  const r = s.install();
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /already installed/i);
  assert.equal(existsSync(path.join(s.T, 'custom')), false);
});

// --- RF-45: ~/.rigorkit that is not a clone -------------------------------------------------
const NOT_CLONE = {
  unrelated: s => put(path.join(s.T, 'notes.txt'), 'mine\n'),
  empty: s => mkdirSync(s.T),
  file: s => put(s.T, 'a file\n'),
};
for (const [id, kind] of [['RF-45.H1', 'unrelated'], ['RF-45.E1', 'empty'], ['RF-45.F1', 'file']]) {
  test(`${id}: ~/.rigorkit is ${kind === 'file' ? 'a file' : `an ${kind} folder`}: refused naming it, exit non-zero`, t => {
    const s = setup(t);
    NOT_CLONE[kind](s);
    const r = s.install();
    assert.notEqual(r.status, 0);
    assert.ok(r.out.includes(s.T), r.out);
  });
}

test('RF-45.S1: on refusal the folder content and startup files stay byte-equal', t => {
  for (const kind of Object.keys(NOT_CLONE)) {
    const s = setup(t, { name: kind });
    NOT_CLONE[kind](s);
    userZshrc(s);
    const before = snapshot(s.HOME);
    const r = s.install();
    assert.notEqual(r.status, 0, kind);
    assert.ok(r.out.includes(s.T), `${kind}: ${r.out}`);
    assert.deepEqual(snapshot(s.HOME), before, kind);
  }
});

test('RF-45.E2: a fork clone (VERSION + install.sh) is treated as a clone: blocks added, clone untouched', t => {
  const s = setup(t);
  const fork = buildRemote(s.root, { name: 'fork', versions: [{ tag: 'v5.0.0', version: 'fork-5' }], main: false });
  existingClone(s, 'v5.0.0', fork);
  userZshrc(s);
  const clone = snapshot(s.T);
  const r = s.install();
  assert.equal(r.status, 0, r.out);
  assert.equal(blockCount(s.zshrc), 1);
  assert.deepEqual(snapshot(s.T), clone);
});

// --- Plan checks ----------------------------------------------------------------------------
test('round-13: a failed move into ~/.rigorkit (mode 555) is rolled back: only the original custom/, tmp removed', { skip: ROOT_SKIP }, t => {
  const s = setup(t, { stubs: h => ({ git: gitStub(path.join(h.root, 'git.log')) }) });
  const log = path.join(s.root, 'git.log');
  customOnly(s);
  chmodSync(s.T, 0o555);
  userZshrc(s);
  const before = snapshot(s.HOME);
  const r = s.install();
  assert.notEqual(r.status, 0);
  assert.match(readLog(log), /\[clone\]/, 'clone ran before the move');
  assert.ok(r.out.includes(s.T), r.out);
  assert.deepEqual(s.leftovers(), []);
  assert.deepEqual(snapshot(s.HOME), before);
});

test('D7: a ref that tracks custom/ in the RF-51 case is a clone failure: custom/ untouched, nothing moved', t => {
  const s = setup(t, { versions: [{ tag: 'v0.2.0', files: { 'custom/README': 'tracked\n' } }] });
  customOnly(s);
  const before = snapshot(s.HOME);
  const r = s.install();
  assert.notEqual(r.status, 0);
  assert.match(r.out, /custom/);
  assert.deepEqual(s.leftovers(), []);
  assert.deepEqual(snapshot(s.HOME), before);
});

test('D-sym: the permission fix never reaches a local remote\'s objects nor a symlink target outside the clone', t => {
  const h = real(home(t, { name: 'home' }));
  const victim = put(path.join(h.HOME, 'victim.txt'), 'v\n', 0o666);
  const remote = buildRemote(h.root, { name: 'symremote', versions: [{ tag: 'v0.2.0', files: { outside: { symlink: victim } } }] });
  execFileSync('chmod', ['-R', 'g+w,o+w', remote.path]);
  const remoteBefore = snapshot(remote.path);
  const tb = box(t, h.root);
  const r = run('/bin/sh', [INSTALLER], { env: { HOME: h.HOME, TMPDIR: h.TMPDIR, SHELL: '/bin/zsh', PATH: tb, RIGORKIT_REMOTE: remote.path }, umask: '000' });
  assert.equal(r.status, 0, r.out);
  assert.equal(mode(victim), '666');
  assert.equal(readFileSync(victim, 'utf8'), 'v\n');
  assert.equal(readlinkSync(path.join(h.HOME, '.rigorkit/outside')), victim);
  assert.deepEqual(snapshot(remote.path), remoteBefore);
  assert.deepEqual(looseModes(path.join(h.HOME, '.rigorkit')), []);
});

test('D-noGit: an existing ~/.rigorkit with a hostile .git/config never runs it (clone, RF-53.E1 and RF-45 paths)', t => {
  const variants = [['clone', 'v0.10.0', null], ['no-bin', 'v0.1.0', null], ['not-clone', 'v0.10.0', 'VERSION']];
  for (const [label, ref, drop] of variants) {
    const s = setup(t, { name: label });
    existingClone(s, ref);
    if (drop) rmSync(path.join(s.T, drop));
    const marker = path.join(s.root, 'hostile-ran');
    const touch = `touch '${marker}'`;
    writeFileSync(path.join(s.T, '.git/config'), readFileSync(path.join(s.T, '.git/config'), 'utf8') +
      `[core]\n\tfsmonitor = ${touch}\n\tsshCommand = ${touch}\n\tpager = ${touch}\n\thooksPath = hooks-evil\n[alias]\n\tstatus = !${touch}\n`);
    for (const hook of ['post-checkout', 'post-merge', 'reference-transaction', 'pre-auto-gc']) {
      put(path.join(s.T, '.git/hooks', hook), `#!/bin/sh\n${touch}\n`, 0o755);
      put(path.join(s.T, 'hooks-evil', hook), `#!/bin/sh\n${touch}\n`, 0o755);
    }
    const r = s.install();
    assert.equal(existsSync(marker), false, `${label}: hostile config ran`);
    if (label === 'clone') { assert.equal(r.status, 0, r.out); assert.equal(blockCount(s.zshrc), 1); }
    else { assert.notEqual(r.status, 0, `${label} refused`); assert.ok(r.out.includes(label === 'no-bin' ? 'bin/rigorkit' : s.T), `${label}: ${r.out}`); }
  }
});

test('INV-1: a new install writes only ~/.rigorkit, the named startup file and its backup', t => {
  const s = setup(t);
  userZshrc(s);
  put(path.join(s.HOME, '.profile'), 'export P=1\n');
  put(path.join(s.HOME, '.config/app/conf'), 'c\n');
  const before = snapshot(s.HOME);
  const r = s.install();
  assert.equal(r.status, 0, r.out);
  assert.deepEqual(readdirSync(s.HOME).sort(), ['.config', '.profile', '.rigorkit', '.zshrc', '.zshrc.rigorkit.bak']);
  const now = snapshot(s.HOME);
  for (const k of Object.keys(before)) if (k !== '.zshrc' && k !== '.') assert.equal(now[k], before[k], k);
});

test('PC-1: the installer body runs from main(), called on the last line; a truncated download runs nothing', t => {
  const src = readFileSync(INSTALLER, 'utf8');
  assert.match(src, /^#!\/bin\/sh\n/);
  const lines = src.replace(/\n+$/, '').split('\n');
  assert.equal(lines[lines.length - 1], 'main "$@"');
  let term = null;
  lines.slice(0, -1).forEach((l, i) => {
    if (term !== null) { if (l.replace(/^\t+/, '') === term) term = null; return; }
    const hd = l.match(/<<-?\s*\\?['"]?([A-Za-z_][A-Za-z0-9_]*)['"]?/);
    if (hd) term = hd[1];
    if (/^\s/.test(l) || l === '' || l.startsWith('#')) return;
    assert.match(l, /^([A-Za-z_][A-Za-z0-9_]*\s*\(\)\s*(\{.*)?|\{|\}.*)$/, `top-level statement at line ${i + 1}: ${l}`);
  });
  // Truncated downloads (sh -c "<partial text>") write nothing.
  const s = setup(t);
  for (const cut of [0.25, 0.5, 0.75, (src.length - 'main "$@"\n'.length) / src.length]) {
    const part = src.slice(0, Math.floor(src.length * cut));
    run('/bin/sh', ['-c', part, 'sh'], { env: { ...s.env } });
    assert.deepEqual(readdirSync(s.HOME), [], `cut at ${cut}`);
  }
});

test('PC-2: git gets -- before remote/path arguments, GIT_ALLOW_PROTOCOL=https:ssh:file, no submodules', t => {
  const src = readFileSync(INSTALLER, 'utf8');
  const code = src.split('\n').filter(l => !/^\s*#/.test(l));
  assert.match(src, /GIT_ALLOW_PROTOCOL=["']?https:ssh:file["']?/);
  assert.doesNotMatch(code.join('\n'), /submodule/);
  for (const l of code.filter(l => /\bgit\b.*\b(clone|ls-remote)\b/.test(l))) assert.match(l, / -- /, `missing -- : ${l}`);
  // Dynamic: every git call that carries the remote has -- before it and runs with the restricted protocols.
  const s = setup(t, { stubs: h => ({ git: gitStub(path.join(h.root, 'git.log')) }) });
  const log = path.join(s.root, 'git.log');
  const r = s.install();
  assert.equal(r.status, 0, r.out);
  const calls = readLog(log).trim().split('\n').filter(Boolean);
  assert.ok(calls.some(c => c.includes(`[${s.r.path}]`)), 'git called with the remote');
  for (const c of calls) {
    assert.ok(c.startsWith('GAP=https:ssh:file '), c);
    assert.doesNotMatch(c, /submodule/);
    if (c.includes(`[${s.r.path}]`)) assert.ok(c.indexOf('[--]') >= 0 && c.indexOf('[--]') < c.indexOf(`[${s.r.path}]`), c);
  }
});
