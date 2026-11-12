// 008-updater HU-1 — one-line installer startup blocks: targets, links, backups, exit status, new shells (B3).
// Installer runs see zsh/bash as "installed" through toolbox stubs; "open a new shell" uses the real zsh/bash
// (skipped with a reason when missing, D4). HOME is always a temp folder; RIGORKIT_REMOTE a local bare repo.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { execFileSync } from 'node:child_process';
import { chmodSync, cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, readlinkSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { home, cloneCopy, put, toolbox, run, snapshot, which, has, isRoot, repo } from './rigorkit-fixture.mjs';

const INSTALLER = path.join(repo, 'tools/install-remote.sh');
const START = '# rigorkit:start', END = '# rigorkit:end';
const ROOT_SKIP = isRoot() && 'D4: running as root ignores permission bits';
const NEED = (...tools) => { const miss = tools.filter(x => !has(x)); return miss.length ? `D4: ${miss.join(', ')} not installed` : false; };
const SHELL_KIND = has('zsh') ? 'zsh' : has('bash') ? 'bash' : null;
const NEED_SHELL = SHELL_KIND ? false : 'D4: neither zsh nor bash installed';

// --- local helpers (the shared fixture is frozen) -----------------------------------------
const real = h => ({ ...h, root: realpathSync(h.root), HOME: realpathSync(h.HOME), TMPDIR: realpathSync(h.TMPDIR) });
const mode = p => (lstatSync(p).mode & 0o777).toString(8);
const GIT_ID = ['-c', 'commit.gpgsign=false', '-c', 'tag.gpgsign=false', '-c', 'user.name=rigorkit-test', '-c', 'user.email=test@example.invalid', '-c', 'init.defaultBranch=main', '-c', 'core.hooksPath=/dev/null'];
function hostGit(args) {
  return execFileSync('git', [...GIT_ID, ...args], {
    encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    env: { PATH: process.env.PATH, HOME: tmpdir(), LC_ALL: 'C', GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1' },
  }).trim();
}
// One bare remote for the whole file (read-only): v0.1.0 without bin/, v0.10.0, v0.2.0, then main.
let shared;
function remote() {
  if (shared) return shared;
  const root = realpathSync(mkdtempSync(path.join(tmpdir(), 'rigorkit-008-remote-')));
  process.on('exit', () => rmSync(root, { recursive: true, force: true })); // shared across tests, not a test hook
  const work = cloneCopy(path.join(root, 'work'));
  const bin = path.join(root, 'bin-saved');
  cpSync(path.join(work, 'bin'), bin, { recursive: true });
  hostGit(['init', '-q', work]);
  const g = a => hostGit(['-C', work, ...a]);
  for (const [tag, withBin] of [['v0.1.0', false], ['v0.10.0', true], ['v0.2.0', true]]) {
    if (withBin) { if (!existsSync(path.join(work, 'bin'))) cpSync(bin, path.join(work, 'bin'), { recursive: true }); }
    else rmSync(path.join(work, 'bin'), { recursive: true, force: true });
    writeFileSync(path.join(work, 'VERSION'), `${tag.slice(1)}\n`);
    g(['add', '-A']); g(['commit', '-q', '-m', tag]); g(['tag', tag]);
  }
  put(path.join(work, 'bin/rigorkit'), `#!/bin/sh\n: > '${path.join(root, 'main-ran')}'\n`, 0o755);
  g(['add', '-A']); g(['commit', '-q', '-m', 'main']);
  const bare = path.join(root, 'remote.git');
  hostGit(['clone', '-q', '--bare', work, bare]);
  shared = { path: bare };
  return shared;
}

const STUB = '#!/bin/sh\nexit 0\n';
const EXTRA_TOOLS = ['rmdir', 'xargs', 'expr', 'true', 'false', 'tee', 'sleep', 'pwd', 'cmp', 'od'];
// zsh/bash "installed" = a stub in the toolbox; absent otherwise.
function setup(t, { zsh = true, bash = false, SHELL = '/bin/zsh', name = 'home', env = {} } = {}) {
  const h = real(home(t, { name }));
  const stubs = {};
  for (const tool of EXTRA_TOOLS) { const f = which(tool); if (f) stubs[tool] = `#!/bin/sh\nexec '${f}' "$@"\n`; }
  if (zsh) stubs.zsh = STUB;
  if (bash) stubs.bash = STUB;
  const tb = toolbox(t, h.root, { without: ['zsh', 'bash'], stubs });
  const T = path.join(h.HOME, '.rigorkit');
  const install = (extra = {}, { umask = '022' } = {}) =>
    run('/bin/sh', [INSTALLER], { env: { HOME: h.HOME, TMPDIR: h.TMPDIR, SHELL, PATH: tb, RIGORKIT_REMOTE: remote().path, ...env, ...extra }, umask });
  const f = name => path.join(h.HOME, name);
  return { ...h, T, install, f };
}
const read = p => readFileSync(p, 'utf8');
const count = (p, line = START) => read(p).split('\n').filter(l => l === line).length;
// The file is the user's bytes followed only by one marked block (blank lines allowed between).
function onlyBlockAdded(p, original) {
  const text = read(p);
  assert.ok(text.startsWith(original), `${p}: user content changed`);
  const rest = text.slice(original.length);
  assert.match(rest, new RegExp(`^\\n*${START}\\n[\\s\\S]*\\n${END}\\n?$`), `${p}: only a marked block may be added`);
  assert.equal(count(p), 1); assert.equal(count(p, END), 1);
}
// Open a new shell with the temp HOME and PATH=/usr/bin:/bin; MANPATH unset.
function openShell(kind, s, cmd, { login = false, env = {} } = {}) {
  const bin = which(kind);
  return run(bin, [login ? '-l' : '-i', '-c', cmd], { env: { HOME: s.HOME, PATH: '/usr/bin:/bin', SHELL: bin, TERM: 'dumb', MANPAGER: 'cat', PAGER: 'cat', ...env }, input: '' });
}
const between = (out, tag) => (out.match(new RegExp(`<${tag}>(.*)</${tag}>`)) || [])[1];
const rcOf = kind => (kind === 'zsh' ? '.zshrc' : '.bashrc');

// --- RF-42: which startup files get the block -----------------------------------------------
test('RF-42.H1: zsh default with .zshrc only: block only in .zshrc; a new zsh runs rigorkit help and man rigorkit', { skip: NEED('zsh', 'man') }, t => {
  const s = setup(t, { zsh: true, bash: true });
  put(s.f('.zshrc'), 'export A=1\n');
  const r = s.install();
  assert.equal(r.status, 0, r.out);
  assert.equal(count(s.f('.zshrc')), 1);
  assert.equal(existsSync(s.f('.bashrc')), false);
  assert.equal(existsSync(s.f('.bash_profile')), false);
  const o = openShell('zsh', s, 'rigorkit help && printf "<w>%s</w>\\n" "$(man -w rigorkit)" && man rigorkit | col -b');
  assert.equal(o.status, 0, o.out);
  assert.match(o.stdout, /Commands:/);
  assert.equal(between(o.stdout, 'w'), path.join(s.T, 'man/man1/rigorkit.1'));
  assert.match(o.stdout, /script/);
});

test('RF-42.E1: bash, .bash_profile not loading .bashrc and .bashrc exist: block in both', t => {
  const s = setup(t, { zsh: false, bash: true, SHELL: '/bin/bash' });
  put(s.f('.bash_profile'), 'export P=1\n');
  put(s.f('.bashrc'), 'export A=1\n');
  const r = s.install();
  assert.equal(r.status, 0, r.out);
  onlyBlockAdded(s.f('.bash_profile'), 'export P=1\n');
  onlyBlockAdded(s.f('.bashrc'), 'export A=1\n');
});

test('RF-42.E2: a .bash_profile that loads .bashrc keeps no block; only .bashrc gets it', t => {
  const loaders = [
    '[ -f ~/.bashrc ] && . ~/.bashrc\n',
    'source "$HOME/.bashrc"\n',
    "if [ -f ~/.bashrc ]; then\n  . '${HOME}/.bashrc'\nfi\n",
    'export X=1; source ~/.bashrc\n',
  ];
  for (const [i, loader] of loaders.entries()) {
    const s = setup(t, { zsh: false, bash: true, SHELL: '/bin/bash', name: `h${i}` });
    const bp = put(s.f('.bash_profile'), loader);
    put(s.f('.bashrc'), 'export A=1\n');
    const before = snapshot(s.HOME)['.bash_profile'];
    const r = s.install();
    assert.equal(r.status, 0, r.out);
    assert.equal(snapshot(s.HOME)['.bash_profile'], before, `loader ${JSON.stringify(loader)}`);
    assert.equal(existsSync(`${bp}.rigorkit.bak`), false);
    assert.equal(count(s.f('.bashrc')), 1);
  }
});

test('RF-42.E3: .bash_profile mentions .bashrc only in a comment: block in .bashrc and .bash_profile', t => {
  const s = setup(t, { zsh: false, bash: true, SHELL: '/bin/bash' });
  const original = '# . ~/.bashrc is loaded by my terminal\nexport P=1\n';
  put(s.f('.bash_profile'), original);
  put(s.f('.bashrc'), 'export A=1\n');
  const r = s.install();
  assert.equal(r.status, 0, r.out);
  onlyBlockAdded(s.f('.bash_profile'), original);
  assert.equal(count(s.f('.bashrc')), 1);
});

test('RF-42.E4: ZDOTDIR=~/.config/zsh: block in ~/.config/zsh/.zshrc, ~/.zshrc untouched', t => {
  const s = setup(t);
  const zdot = path.join(s.HOME, '.config/zsh');
  put(path.join(zdot, '.zshrc'), 'export Z=1\n');
  put(s.f('.zshrc'), 'export H=1\n');
  const before = snapshot(s.HOME)['.zshrc'];
  const r = s.install({ ZDOTDIR: zdot });
  assert.equal(r.status, 0, r.out);
  onlyBlockAdded(path.join(zdot, '.zshrc'), 'export Z=1\n');
  assert.equal(snapshot(s.HOME)['.zshrc'], before);
  assert.equal(existsSync(s.f('.zshrc.rigorkit.bak')), false);
});

test('RF-42.F1: .zshrc not writable: error names it, clone kept, .bashrc still written, exit non-zero', { skip: ROOT_SKIP }, t => {
  const s = setup(t, { zsh: true, bash: true });
  put(s.f('.zshrc'), 'export A=1\n', 0o444);
  put(s.f('.bashrc'), 'export B=1\n');
  const r = s.install();
  assert.notEqual(r.status, 0);
  assert.ok(r.out.includes(s.f('.zshrc')), r.out);
  assert.equal(read(s.f('.zshrc')), 'export A=1\n');
  assert.ok(existsSync(path.join(s.T, 'bin/rigorkit')), 'clone kept');
  assert.equal(count(s.f('.bashrc')), 1);
});

test('RF-42.S1: .zshrc with user content: only the marked block added, rest byte-equal, .zshrc.rigorkit.bak kept', t => {
  const s = setup(t);
  const original = '# my settings\nexport GH_TOKEN_FILE=~/.tok\nalias g="git"\n\n';
  put(s.f('.zshrc'), original, 0o644);
  const r = s.install();
  assert.equal(r.status, 0, r.out);
  onlyBlockAdded(s.f('.zshrc'), original);
  assert.equal(read(s.f('.zshrc.rigorkit.bak')), original);
});

test('RF-42.S2: a user\'s own .zshrc.bak stays byte-equal', t => {
  const s = setup(t);
  put(s.f('.zshrc'), 'export A=1\n');
  put(s.f('.zshrc.bak'), 'my own backup\n', 0o600);
  const before = snapshot(s.HOME)['.zshrc.bak'];
  const r = s.install();
  assert.equal(r.status, 0, r.out);
  assert.equal(snapshot(s.HOME)['.zshrc.bak'], before);
});

test('RF-42.E5: .bash_profile loads .profile which loads .bashrc: a login bash runs rigorkit, PATH/MANPATH hold the clone once', { skip: NEED('bash') }, t => {
  const s = setup(t, { zsh: false, bash: true, SHELL: '/bin/bash' });
  put(s.f('.bash_profile'), '. "$HOME/.profile"\n');
  put(s.f('.profile'), '. "$HOME/.bashrc"\n');
  put(s.f('.bashrc'), 'export A=1\n');
  const r = s.install();
  assert.equal(r.status, 0, r.out);
  assert.equal(count(s.f('.bashrc')), 1);
  assert.equal(count(s.f('.bash_profile')), 1);
  const o = openShell('bash', s, 'rigorkit help >/dev/null && printf "<p>%s</p>\\n<m>%s</m>\\n" "$PATH" "${MANPATH-}"', { login: true });
  assert.equal(o.status, 0, o.out);
  assert.equal(between(o.stdout, 'p').split(':').filter(p => p === path.join(s.T, 'bin')).length, 1, o.stdout);
  assert.equal(between(o.stdout, 'm').split(':').filter(p => p === path.join(s.T, 'man')).length, 1, o.stdout);
});

// --- RF-55: symbolic links ------------------------------------------------------------------
test('RF-55.H1: .zshrc linked to a dotfiles repo: link kept, target gets the block, backup next to the target', t => {
  const s = setup(t);
  const target = put(path.join(s.HOME, 'dotfiles/zshrc'), 'export D=1\n');
  symlinkSync(target, s.f('.zshrc'));
  const r = s.install();
  assert.equal(r.status, 0, r.out);
  assert.ok(lstatSync(s.f('.zshrc')).isSymbolicLink());
  assert.equal(readlinkSync(s.f('.zshrc')), target);
  assert.equal(count(target), 1);
  assert.equal(read(`${target}.rigorkit.bak`), 'export D=1\n');
  assert.equal(existsSync(s.f('.zshrc.rigorkit.bak')), false);
});

test('RF-55.E1: link to a link: the final target gets the block, both links kept', t => {
  const s = setup(t);
  const target = put(path.join(s.HOME, 'dotfiles/real-zshrc'), 'export D=1\n');
  const mid = path.join(s.HOME, 'dotfiles/zshrc');
  symlinkSync('real-zshrc', mid);
  symlinkSync(mid, s.f('.zshrc'));
  const r = s.install();
  assert.equal(r.status, 0, r.out);
  assert.equal(readlinkSync(s.f('.zshrc')), mid);
  assert.equal(readlinkSync(mid), 'real-zshrc');
  assert.equal(count(target), 1);
  assert.ok(existsSync(`${target}.rigorkit.bak`));
});

test('RF-55.F1: broken link: error names it, nothing written there, exit non-zero', t => {
  const s = setup(t);
  const missing = path.join(s.HOME, 'dotfiles/gone');
  symlinkSync(missing, s.f('.zshrc'));
  const r = s.install();
  assert.notEqual(r.status, 0);
  assert.ok(r.out.includes('.zshrc'), r.out);
  assert.equal(readlinkSync(s.f('.zshrc')), missing);
  assert.equal(existsSync(missing), false);
  assert.equal(existsSync(path.join(s.HOME, 'dotfiles')), false);
  assert.deepEqual(readdirSync(s.HOME).filter(n => n.includes('rigorkit.bak')), []);
});

test('RF-55.S1: link target with user content: only the marked block added, rest byte-equal', t => {
  const s = setup(t);
  const original = 'export SECRET_FILE=~/.s\nsetopt autocd\n';
  const target = put(path.join(s.HOME, 'dotfiles/zshrc'), original);
  symlinkSync(target, s.f('.zshrc'));
  const r = s.install();
  assert.equal(r.status, 0, r.out);
  onlyBlockAdded(target, original);
});

// --- RF-61: PATH order ----------------------------------------------------------------------
function installFor(t, kind, opts = {}) {
  const s = setup(t, kind === 'zsh' ? { zsh: true, ...opts } : { zsh: false, bash: true, SHELL: '/bin/bash', ...opts });
  put(s.f(rcOf(kind)), 'export A=1\n');
  const r = s.install();
  assert.equal(r.status, 0, r.out);
  return s;
}

test('RF-61.H1: PATH=/usr/bin:/bin: a new shell ends PATH with the clone bin and keeps /usr/bin first', { skip: NEED_SHELL }, t => {
  const s = installFor(t, SHELL_KIND);
  const o = openShell(SHELL_KIND, s, 'printf "<p>%s</p>\\n" "$PATH"');
  assert.equal(o.status, 0, o.out);
  const parts = between(o.stdout, 'p').split(':');
  assert.equal(parts[0], '/usr/bin');
  assert.equal(parts[parts.length - 1], path.join(s.T, 'bin'));
});

test('RF-61.E1: the block run twice in one shell leaves the clone bin once', { skip: NEED_SHELL }, t => {
  const s = installFor(t, SHELL_KIND);
  const o = openShell(SHELL_KIND, s, `. "$HOME/${rcOf(SHELL_KIND)}"; . "$HOME/${rcOf(SHELL_KIND)}"; printf "<p>%s</p>\\n<m>%s</m>\\n" "$PATH" "\${MANPATH-}"`);
  assert.equal(o.status, 0, o.out);
  assert.equal(between(o.stdout, 'p').split(':').filter(p => p === path.join(s.T, 'bin')).length, 1, o.stdout);
  assert.equal(between(o.stdout, 'm').split(':').filter(p => p === path.join(s.T, 'man')).length, 1, o.stdout);
});

test('RF-61.S1: a test ls in the clone bin/ does not shadow the system ls', { skip: NEED_SHELL }, t => {
  const s = installFor(t, SHELL_KIND);
  put(path.join(s.T, 'bin/ls'), '#!/bin/sh\necho fake\n', 0o755);
  const o = openShell(SHELL_KIND, s, 'printf "<l>%s</l>\\n" "$(command -v ls)"');
  assert.equal(o.status, 0, o.out);
  const found = between(o.stdout, 'l');
  assert.ok(found && !found.startsWith(s.T), `ls resolved to ${found}`);
});

// --- RF-43: creating missing startup files --------------------------------------------------
test('RF-43.H1: default shell zsh without .zshrc: .zshrc created with the block', t => {
  const s = setup(t);
  const r = s.install();
  assert.equal(r.status, 0, r.out);
  assert.equal(count(s.f('.zshrc')), 1);
});

test('RF-43.E1: default zsh, bash installed, no .bashrc nor .bash_profile: no bash file created', t => {
  const s = setup(t, { zsh: true, bash: true });
  const r = s.install();
  assert.equal(r.status, 0, r.out);
  assert.equal(existsSync(s.f('.bashrc')), false);
  assert.equal(existsSync(s.f('.bash_profile')), false);
  assert.equal(count(s.f('.zshrc')), 1);
});

test('RF-43.E2: default bash with only .profile and .bashrc: block in .bashrc, no .bash_profile, .profile byte-equal', t => {
  const s = setup(t, { zsh: false, bash: true, SHELL: '/bin/bash' });
  put(s.f('.profile'), 'export P=1\n');
  put(s.f('.bashrc'), 'export A=1\n');
  const before = snapshot(s.HOME)['.profile'];
  const r = s.install();
  assert.equal(r.status, 0, r.out);
  assert.equal(count(s.f('.bashrc')), 1);
  assert.equal(existsSync(s.f('.bash_profile')), false);
  assert.equal(snapshot(s.HOME)['.profile'], before);
});

// --- RF-62: backup mode ---------------------------------------------------------------------
test('RF-62.H1: .zshrc mode 600: .zshrc.rigorkit.bak mode 600', t => {
  const s = setup(t);
  put(s.f('.zshrc'), 'export TOKEN=x\n', 0o600);
  const r = s.install({}, { umask: '000' });
  assert.equal(r.status, 0, r.out);
  assert.equal(mode(s.f('.zshrc.rigorkit.bak')), '600');
  assert.equal(mode(s.f('.zshrc')), '600');
});

test('RF-62.E1: existing .zshrc.rigorkit.bak 644 and .zshrc 600: backup becomes 600 with the current content', t => {
  const s = setup(t);
  put(s.f('.zshrc'), 'export TOKEN=new\n', 0o600);
  put(s.f('.zshrc.rigorkit.bak'), 'old backup\n', 0o644);
  const r = s.install();
  assert.equal(r.status, 0, r.out);
  assert.equal(mode(s.f('.zshrc.rigorkit.bak')), '600');
  assert.equal(read(s.f('.zshrc.rigorkit.bak')), 'export TOKEN=new\n');
});

test('RF-62.F1: the backup cannot be written: error names it, original unchanged, exit non-zero', { skip: ROOT_SKIP }, t => {
  const s = setup(t);
  const zdot = path.join(s.HOME, 'zdot');
  put(path.join(zdot, '.zshrc'), 'export A=1\n', 0o644);
  chmodSync(zdot, 0o555);
  const r = s.install({ ZDOTDIR: zdot });
  assert.notEqual(r.status, 0);
  assert.ok(r.out.includes(path.join(zdot, '.zshrc.rigorkit.bak')), r.out);
  assert.equal(read(path.join(zdot, '.zshrc')), 'export A=1\n');
});

// --- RF-50: exit status ---------------------------------------------------------------------
test('RF-50.H1: every write succeeds: exit 0', t => {
  const s = setup(t, { zsh: true, bash: true });
  for (const f of ['.zshrc', '.bashrc', '.bash_profile']) put(s.f(f), `# ${f}\n`);
  const r = s.install();
  assert.equal(r.status, 0, r.out);
  for (const f of ['.zshrc', '.bashrc', '.bash_profile']) assert.equal(count(s.f(f)), 1, f);
});

test('RF-50.E1: default shell fish and .zshrc not writable: error names it, exit non-zero', { skip: ROOT_SKIP }, t => {
  const s = setup(t, { SHELL: '/usr/local/bin/fish' });
  put(s.f('.zshrc'), 'export A=1\n', 0o444);
  const r = s.install();
  assert.notEqual(r.status, 0);
  assert.ok(r.out.includes(s.f('.zshrc')), r.out);
});

test('RF-50.F1: .bashrc not writable: error names it, exit non-zero', { skip: ROOT_SKIP }, t => {
  const s = setup(t, { zsh: false, bash: true, SHELL: '/bin/bash' });
  put(s.f('.bashrc'), 'export A=1\n', 0o444);
  const r = s.install();
  assert.notEqual(r.status, 0);
  assert.ok(r.out.includes(s.f('.bashrc')), r.out);
});

// --- RF-52 / RF-54: messages ----------------------------------------------------------------
const UNSUPPORTED = /only zsh and bash/i;
test('RF-52.H1: default shell fish, zsh installed with .zshrc: block in .zshrc, unsupported-shell message, exit 0', t => {
  const s = setup(t, { SHELL: '/usr/local/bin/fish' });
  put(s.f('.zshrc'), 'export A=1\n');
  const r = s.install();
  assert.equal(r.status, 0, r.out);
  assert.equal(count(s.f('.zshrc')), 1);
  assert.match(r.out, UNSUPPORTED);
});

test('RF-52.E1: default shell fish, neither zsh nor bash installed: clone done, message, no startup file, exit 0', t => {
  const s = setup(t, { zsh: false, bash: false, SHELL: '/usr/local/bin/fish' });
  const r = s.install();
  assert.equal(r.status, 0, r.out);
  assert.ok(existsSync(path.join(s.T, 'bin/rigorkit')));
  assert.match(r.out, UNSUPPORTED);
  for (const f of ['.zshrc', '.bashrc', '.bash_profile', '.profile']) assert.equal(existsSync(s.f(f)), false, f);
});

test('RF-54.H1: default bash on macOS with only a .profile that does not load .bashrc: block in .bashrc, login hint, exit 0', t => {
  const s = setup(t, { zsh: false, bash: true, SHELL: '/bin/bash' });
  put(s.f('.profile'), 'export P=1\n');
  const r = s.install();
  assert.equal(r.status, 0, r.out);
  assert.equal(count(s.f('.bashrc')), 1);
  assert.match(r.out, /login/i);
  assert.equal(existsSync(s.f('.bash_profile')), false);
});

test('RF-54.E1: Ubuntu .profile sourcing "$HOME/.bashrc" inside an if: no hint', t => {
  const s = setup(t, { zsh: false, bash: true, SHELL: '/bin/bash' });
  put(s.f('.profile'), 'if [ -n "$BASH_VERSION" ]; then\n    # include .bashrc if it exists\n    if [ -f "$HOME/.bashrc" ]; then\n\t. "$HOME/.bashrc"\n    fi\nfi\n');
  put(s.f('.bashrc'), 'export A=1\n');
  const r = s.install();
  assert.equal(r.status, 0, r.out);
  assert.equal(count(s.f('.bashrc')), 1);
  assert.doesNotMatch(r.out, /login/i);
});

// --- RF-27.E2: system manual pages stay visible ---------------------------------------------
test('RF-27.E2: MANPATH unset before install: a new shell still finds man ls and also man rigorkit', { skip: NEED('man') || NEED_SHELL }, t => {
  const s = installFor(t, SHELL_KIND);
  const o = openShell(SHELL_KIND, s, 'printf "<l>%s</l>\\n<r>%s</r>\\n" "$(man -w ls)" "$(man -w rigorkit)"');
  assert.equal(o.status, 0, o.out);
  const ls = between(o.stdout, 'l') || '';
  assert.match(ls, /^\/.*ls\.1/, o.out); // a system page for ls (ls.1, rust-ls.1.gz…)
  assert.ok(!ls.startsWith(s.T), o.out); // not shadowed by the clone's man/
  assert.equal(between(o.stdout, 'r'), path.join(s.T, 'man/man1/rigorkit.1'));
});

// --- Plan checks ----------------------------------------------------------------------------
test('PC-3: HOME with a space: the block holds a literal $HOME/.rigorkit and a new shell finds rigorkit', { skip: NEED_SHELL }, t => {
  const kind = SHELL_KIND;
  const s = setup(t, kind === 'zsh' ? { name: 'my home' } : { name: 'my home', zsh: false, bash: true, SHELL: '/bin/bash' });
  assert.ok(s.HOME.includes(' '));
  const r = s.install();
  assert.equal(r.status, 0, r.out);
  const rc = read(s.f(rcOf(kind)));
  const block = rc.slice(rc.indexOf(START), rc.indexOf(END));
  assert.ok(block.includes('$HOME/.rigorkit'), block);
  assert.ok(!block.includes(s.HOME), 'block must not hold the expanded HOME');
  const o = openShell(kind, s, 'printf "<c>%s</c>\\n" "$(command -v rigorkit)"; rigorkit help >/dev/null && echo RAN');
  assert.equal(o.status, 0, o.out);
  assert.equal(between(o.stdout, 'c'), path.join(s.T, 'bin/rigorkit'));
  assert.match(o.stdout, /^RAN$/m);
});

test('Block-set-u: the block runs twice under sh -u with MANPATH unset and adds the clone once', t => {
  const s = setup(t);
  const r = s.install();
  assert.equal(r.status, 0, r.out);
  const o = run('/bin/sh', ['-u', '-c', '. "$HOME/.zshrc"; . "$HOME/.zshrc"; printf "<p>%s</p>\\n<m>%s</m>\\n" "$PATH" "$MANPATH"'], { env: { HOME: s.HOME, PATH: '/usr/bin:/bin' } });
  assert.equal(o.status, 0, o.out);
  assert.equal(between(o.stdout, 'p'), `/usr/bin:/bin:${path.join(s.T, 'bin')}`);
  assert.equal(between(o.stdout, 'm').split(':').filter(p => p === path.join(s.T, 'man')).length, 1);
});
