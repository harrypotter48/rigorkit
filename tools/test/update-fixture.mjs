// 010-update — shared harness: test remotes with release tags built from the working tree, clones at a tag,
// state files, pseudo-terminal runs. Never touches the real HOME, the user's git config or the network.
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, realpathSync, rmSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { cloneCopy, home as baseHome, put, run, repo, has } from './rigorkit-fixture.mjs';

export { put, run, repo, has };
// Temp HOME with resolved paths (macOS tmpdir is a symbolic link).
export function home(t, opts) {
  const h = baseHome(t, opts);
  return { root: realpathSync(h.root), HOME: realpathSync(h.HOME), TMPDIR: realpathSync(h.TMPDIR) };
}
// The shared 008 fixture is frozen: its clone copy predates lib/ and CHANGELOG.md, so 010 adds them here.
export const EXTRA_ENTRIES = ['lib', 'CHANGELOG.md'];
export function runtimeCopy(dir) {
  cloneCopy(dir);
  for (const e of EXTRA_ENTRIES) { const src = path.join(repo, e); if (existsSync(src)) cpSync(src, path.join(dir, e), { recursive: true }); }
  return dir;
}
export const PTY = path.join(repo, 'tools/test/pty-run.py');
export const NEED_PTY = has('python3') ? false : 'D4: python3 not installed (pseudo-terminal helper)';
export const STATE = HOME => path.join(HOME, '.local/state/rigorkit');
export const NOTICE = HOME => path.join(STATE(HOME), 'notice');
export const RECORD = HOME => path.join(STATE(HOME), 'global');

const GITENV = { GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1', GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t', LC_ALL: 'C' };
export function git(cwd, args, env = {}) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', env: { ...process.env, ...GITENV, ...env } });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
}

// A bare remote plus a work tree. release(version, mutate) commits the working-tree runtime files with
// VERSION=version, a complete changelog section, then mutate(dir); tags v<version> (annotated).
export function testRemote(t, root) {
  const bare = path.join(root, 'remote.git'), work = path.join(root, 'remote-work');
  mkdirSync(work, { recursive: true });
  git(root, ['init', '--quiet', '--bare', bare]);
  git(work, ['init', '--quiet', '-b', 'main']);
  git(work, ['remote', 'add', 'origin', bare]);
  let first = true;
  const release = (version, mutate = () => {}, { tag = `v${version}`, changelog } = {}) => {
    for (const e of readdirSync(work)) if (e !== '.git') rmSync(path.join(work, e), { recursive: true, force: true });
    runtimeCopy(work);
    writeFileSync(path.join(work, 'VERSION'), `${version}\n`);
    const log = path.join(work, 'CHANGELOG.md');
    const base = existsSync(log) ? readFileSync(log, 'utf8') : '# Changelog\n';
    const section = changelog ?? `## ${version}\nGlobal rules: unchanged\nNew packs: none\n\nTest release ${version}.\n`;
    writeFileSync(log, base.replace(/^# Changelog\n/, `# Changelog\n\n${section}\n`));
    mutate(work);
    git(work, ['add', '-A']);
    git(work, ['commit', '--quiet', '--allow-empty', '-m', `release ${version}`]);
    if (tag) git(work, ['tag', '-a', tag, '-m', `rigorkit ${version}`]);
    git(work, ['push', '--quiet', 'origin', first ? 'HEAD:refs/heads/main' : '+HEAD:refs/heads/main', '--tags']);
    first = false;
    return git(work, ['rev-parse', 'HEAD']);
  };
  return { bare, work, release };
}

// ~/.rigorkit cloned from the remote at a tag, as the one-line installer leaves it (detached, full history).
export function cloneAt(HOME, bare, tag) {
  const dest = path.join(HOME, '.rigorkit');
  git(HOME, ['-c', 'advice.detachedHead=false', 'clone', '--quiet', '--branch', tag, bare, dest]);
  return dest;
}

export function writeState(HOME, fields) {
  const body = Object.entries(fields).map(([k, v]) => `${k}=${v}`).join('\n') + '\n';
  return put(path.join(STATE(HOME), 'check'), body);
}
export function readState(HOME) {
  const f = path.join(STATE(HOME), 'check');
  if (!existsSync(f)) return null;
  return Object.fromEntries(readFileSync(f, 'utf8').split('\n').filter(Boolean).map(l => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]));
}
export const now = () => Math.floor(Date.now() / 1000);
export const hoursAgo = h => now() - Math.round(h * 3600);

// Environment for rigorkit runs inside a temp HOME.
export function envFor(h, extra = {}) {
  return { HOME: h.HOME, TMPDIR: h.TMPDIR, PATH: process.env.PATH, TERM: 'dumb', ...GITENV, ...extra };
}

// Run cmd in a pseudo-terminal; steps = [[expect, send], ...].
export function pty(cmd, args, { env, steps = [], eof = false, timeout = 20, cwd } = {}) {
  const a = ['--timeout', String(timeout)];
  for (const [e, s] of steps) a.push('--expect', e, '--send', s);
  if (eof) a.push('--eof');
  return run('python3', [PTY, ...a, '--', cmd, ...args], { env, cwd });
}

// Wait until fn() is truthy (polling), up to ms.
export function waitFor(fn, ms = 10000) {
  const end = Date.now() + ms;
  while (Date.now() < end) { const v = fn(); if (v) return v; spawnSync('sleep', ['0.1']); }
  return fn();
}
