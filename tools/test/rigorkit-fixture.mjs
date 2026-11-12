// 008-updater — shared harness for HU-1 tests: temp HOME, clone copies, toolbox PATH, snapshots.
// Never touches the real HOME, the user's git config or the network.
import { spawnSync, execFileSync } from 'node:child_process';
import { chmodSync, cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, readlinkSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const repo = fileURLToPath(new URL('../../', import.meta.url));
// Files a clone needs at runtime (what the one-line installer clones).
export const CLONE_ENTRIES = ['VERSION', 'install.sh', 'bin', 'help', 'man', 'packs', '.gitignore', 'lib', 'CHANGELOG.md'];

// A fresh test root with HOME and TMPDIR inside it (TMPDIR outside HOME).
export function home(t, { name = 'home' } = {}) {
  const root = mkdtempSync(path.join(tmpdir(), 'rigorkit-008-'));
  t.after(() => { try { execFileSync('chmod', ['-R', 'u+rwX', root]); } catch {} rmSync(root, { recursive: true, force: true }); });
  const HOME = path.join(root, name), TMPDIR = path.join(root, 'tmp');
  mkdirSync(HOME, { recursive: true }); mkdirSync(TMPDIR, { recursive: true });
  return { root, HOME, TMPDIR };
}

// Copy the working tree's runtime entries into dir (a "clone" without .git). Missing entries are skipped.
export function cloneCopy(dir) {
  mkdirSync(dir, { recursive: true });
  for (const e of CLONE_ENTRIES) {
    const src = path.join(repo, e);
    if (existsSync(src)) cpSync(src, path.join(dir, e), { recursive: true });
  }
  return dir;
}

export function put(file, content, mode) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, content);
  if (mode !== undefined) chmodSync(file, mode);
  return file;
}

// A script that prints its label and arguments, then exits with `status`.
export function stubScript(file, label, { status = 0, mode = 0o755 } = {}) {
  return put(file, `#!/bin/sh\nprintf '%s' '${label}'\nfor a in "$@"; do printf ' [%s]' "$a"; done\necho\nexit ${status}\n`, mode);
}

// A PATH directory holding symlinks to the named host commands, plus stub scripts.
const BASE_TOOLS = ['sh', 'cat', 'ls', 'readlink', 'dirname', 'basename', 'env', 'printf', 'echo', 'test', '[', 'sed', 'awk', 'grep', 'sort', 'tr', 'mkdir', 'rm', 'cp', 'mv', 'ln', 'chmod', 'find', 'head', 'tail', 'wc', 'uname', 'id', 'mktemp', 'touch', 'cut', 'diff', 'date', 'git', 'bash', 'zsh', 'man', 'less', 'groff', 'nroff', 'mandoc', 'col'];
export function toolbox(t, root, { without = [], stubs = {} } = {}) {
  const dir = path.join(root, 'toolbox');
  mkdirSync(dir, { recursive: true });
  for (const tool of BASE_TOOLS) {
    if (without.includes(tool) || stubs[tool]) continue;
    const found = which(tool);
    if (found) symlinkSync(found, path.join(dir, tool));
  }
  for (const [tool, body] of Object.entries(stubs)) put(path.join(dir, tool), body, 0o755);
  return dir;
}

export function which(tool) {
  const r = spawnSync('/bin/sh', ['-c', `command -v "$1"`, 'sh', tool], { encoding: 'utf8' });
  const p = r.stdout.trim();
  return r.status === 0 && p.startsWith('/') ? p : '';
}
export const has = tool => Boolean(which(tool));
export const isRoot = () => typeof process.getuid === 'function' && process.getuid() === 0;

// Run a command with a controlled environment. env.PATH defaults to the host PATH.
export function run(cmd, args = [], { env = {}, cwd, umask, input } = {}) {
  const fullEnv = { PATH: process.env.PATH, LC_ALL: 'C', GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1', ...env };
  let file = cmd, argv = args;
  if (umask !== undefined) { file = '/bin/sh'; argv = ['-c', `umask ${umask}; exec "$@"`, 'sh', cmd, ...args]; }
  const r = spawnSync(file, argv, { env: fullEnv, cwd, encoding: 'utf8', input });
  return { status: r.status, stdout: r.stdout ?? '', stderr: r.stderr ?? '', out: (r.stdout ?? '') + (r.stderr ?? '') };
}

// Bytes, modes and link targets of every entry under dir (for INV checks).
export function snapshot(dir) {
  const out = {};
  const walk = rel => {
    const abs = path.join(dir, rel);
    if (!existsSync(abs) && !isLink(abs)) return;
    const st = lstatSync(abs);
    const mode = (st.mode & 0o7777).toString(8);
    if (st.isSymbolicLink()) out[rel || '.'] = `link:${readlinkSync(abs)}`;
    else if (st.isDirectory()) { out[rel || '.'] = `dir:${mode}`; for (const e of readdirSync(abs).sort()) walk(path.join(rel, e)); }
    else out[rel] = `file:${mode}:${readFileSync(abs).toString('base64')}`;
  };
  walk('');
  return out;
}
function isLink(p) { try { return lstatSync(p).isSymbolicLink(); } catch { return false; } }
