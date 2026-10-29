import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

// RF-8: all Git input stays in an argument vector; never invoke a shell.
function git(root, args) {
  return execFileSync('git', ['-c', 'core.quotepath=false', ...args], {
    cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}
const paths = value => [...new Set(value.split('\0').filter(Boolean))];
function revision(root, value) {
  if (!value || value.startsWith('-') || /[\r\n\0]/.test(value)) throw new Error('A confirmed Git revision is required');
  return git(root, ['rev-parse', '--verify', `${value}^{commit}`]).trim();
}
function rootOf(root) {
  return fs.realpathSync(git(path.resolve(root), ['rev-parse', '--show-toplevel']).trim());
}
// RF-8.S3: live symlinks must never select a different historical policy.
function policyPath(root, constitution) {
  const file = path.resolve(root, constitution);
  if (!file.startsWith(root + path.sep) || fs.realpathSync(file) !== file) throw new Error('Constitution must be a non-symlink path inside the selected repository');
  return file;
}
function testPatterns(root, constitution, frozenContent) {
  const file = policyPath(root, constitution);
  const content = frozenContent ?? fs.readFileSync(file, 'utf8');
  const section = content.match(/^##\s+(?:Test paths(?:\s*\(frozen tests\))?|Rutas de tests[^\n]*)\s*\n([\s\S]*?)(?=^##\s|$(?![\s\S]))/m);
  const values = section?.[1].split('\n').filter(line => /^\s*-\s+/.test(line)).map(line => line.match(/`([^`]+)`/)?.[1] ?? line.replace(/^\s*-\s+/, '').trim()) ?? [];
  if (!values.length) throw new Error('Constitution does not declare Test paths');
  return values.map(glob => {
    // RF-8.E1: unsupported/placeholder patterns fail instead of silently matching nothing.
    if (!glob || glob.startsWith('/') || glob.split('/').includes('..') || /[<>\[\]{}\\]/.test(glob)) throw new Error(`Unsupported test glob: ${glob}; use repository-relative *, ** and ?`);
    let regex = '^';
    for (let i = 0; i < glob.length; i++) {
      const ch = glob[i];
      if (ch === '*' && glob[i + 1] === '*') {
        i++;
        if (glob[i + 1] === '/') { regex += '(?:.*/)?'; i++; }
        else regex += '.*';
      } else if (ch === '*') regex += '[^/]*';
      else if (ch === '?') regex += '[^/]';
      else regex += ch.replace(/[.+^$()|]/g, '\\$&');
    }
    return new RegExp(regex + '$');
  });
}

export function checkFrozen({ root = process.cwd(), base, red, constitution = 'specs/constitution.md' } = {}) {
  try {
    root = rootOf(root);
    const baseHash = revision(root, base);
    git(root, ['merge-base', '--is-ancestor', baseHash, 'HEAD']);
    const changes = git(root, ['log', '--format=%H%x09%s', '--ancestry-path', `${baseHash}..HEAD`]).trim().split('\n').filter(Boolean);
    const selected = red ? revision(root, red) : changes.find(line => /^[^\t]+\ttest\(red\):/.test(line))?.split('\t')[0];
    if (!selected || !changes.some(line => line.startsWith(selected + '\t'))) throw new Error('No frozen test(red): boundary inside the confirmed change');
    git(root, ['merge-base', '--is-ancestor', selected, 'HEAD']);
    if (!/^test\(red\):/.test(git(root, ['show', '-s', '--format=%s', selected]))) throw new Error('Pinned red revision is not a test(red): commit');
    // RF-8.S2: the approved red owns the frozen policy; live pattern edits cannot erase it.
    const configPath = path.relative(root, policyPath(root, constitution)).split(path.sep).join('/');
    const frozenContent = git(root, ['show', `${selected}:${configPath}`]);
    const patterns = testPatterns(root, constitution, frozenContent);
    const match = file => patterns.some(regex => regex.test(file));
    const errors = [], amended = [];
    const commits = git(root, ['rev-list', '--reverse', '--ancestry-path', `${selected}..HEAD`]).trim().split('\n').filter(Boolean);
    for (const commit of commits) {
      // RF-8.F2: inspect history, not only net red→HEAD; edit-and-revert must not hide a violation.
      const touched = paths(git(root, ['diff-tree', '--root', '-m', '-r', '--no-commit-id', '--no-renames', '--name-only', '-z', commit])).filter(match);
      if (!touched.length) continue;
      const message = git(root, ['show', '-s', '--format=%B', commit]);
      const cited = /^test\(amend\):/.test(message) && /\bAMEND-[\w-]+\b|spec\.md#[\w-]+/.test(message);
      for (const file of touched) {
        if (cited) amended.push({ commit, path: file });
        else errors.push(`${file}: test changed by ${commit.slice(0, 12)} without a cited test(amend):`);
      }
    }
    // RF-8.F4/F5: index, worktree and untracked are independent inputs; no test-value logging.
    const pending = paths(git(root, ['diff', '--cached', '--name-only', '-z']) + git(root, ['diff', '--name-only', '-z']) + git(root, ['ls-files', '--others', '--exclude-standard', '-z'])).filter(match);
    for (const file of pending) errors.push(`${file}: uncommitted frozen-test change requires approved amendment`);
    return { ok: !errors.length, errors, amended, red: selected };
  } catch (error) {
    return { ok: false, errors: [error.message], amended: [] };
  }
}

// RF-9: lexical traceability only. It cannot establish semantic test coverage or approved behavior.
function codeOnly(line, state) {
  let out = '';
  for (let i = 0; i < line.length; i++) {
    const ch = line[i], next = line[i + 1];
    if (state.block) { if (ch === '*' && next === '/') { state.block = false; i++; } continue; }
    // RF-9.F5: template text is data, but nested ${...} executes code.
    const frame = state.templates.at(-1);
    if (frame?.kind === 'text') {
      if (ch === '\\') i++;
      else if (ch === '`') state.templates.pop();
      else if (ch === '$' && next === '{') { state.templates.push({ kind: 'expression', depth: 1 }); i++; }
      continue;
    }
    if (state.quote) {
      if (ch === '\\') i++;
      else if (ch === state.quote) state.quote = null;
      continue;
    }
    if (ch === '/' && next === '/') break;
    if (ch === '/' && next === '*') { state.block = true; i++; continue; }
    if (ch === '`') { state.templates.push({ kind: 'text' }); continue; }
    if (ch === '"' || ch === "'") { state.quote = ch; continue; }
    if (frame?.kind === 'expression') {
      if (ch === '{') frame.depth++;
      if (ch === '}' && --frame.depth === 0) { state.templates.pop(); continue; }
    }
    out += ch;
  }
  return out;
}
export function checkTrace({ diff = '' } = {}) {
  const errors = [];
  let file = '', hunk = [], start = 0;
  function flush() {
    if (!/\.(?:[cm]?[jt]s|[jt]sx)$/.test(file)) { hunk = []; return; }
    const retained = hunk.filter(line => !line.startsWith('-'));
    const cited = retained.some(line => /\bRF-\d+\.[HEFS]\d+\b|\bINV-\d+\b/.test(line));
    const state = { block: false, quote: null, templates: [] };
    let number = start;
    for (const line of hunk) {
      if (line.startsWith('-') || line.startsWith('\\')) continue;
      const code = codeOnly(line.slice(1), state);
      if (line.startsWith('+') && !cited && /\b(?:if|switch|case|catch)\b|&&|\|\||\?\?|\?(?![?.:])/.test(code)) errors.push(`${file}:${number}: branch lacks RF scenario/INV reference in its hunk`);
      number++;
    }
    hunk = [];
  }
  for (const line of diff.split('\n')) {
    if (line.startsWith('diff --git ')) { flush(); file = ''; }
    else if (line.startsWith('+++ ')) {
      const value = line.slice(4);
      file = value.startsWith('"') ? JSON.parse(value).replace(/^b\//, '') : value.replace(/^b\//, '').split('\t')[0];
    } else if (line.startsWith('@@ ')) { flush(); start = Number(line.match(/\+(\d+)/)?.[1] ?? 0); }
    else if (/^[ +\-\\]/.test(line)) hunk.push(line);
  }
  flush();
  return { ok: !errors.length, errors };
}
export function checkTraceRepository({ root = process.cwd(), base } = {}) {
  try {
    root = rootOf(root);
    const hash = revision(root, base);
    git(root, ['merge-base', '--is-ancestor', hash, 'HEAD']);
    // RF-9.F4: a staged branch remains reviewable even if the worktree restores it.
    let diff = git(root, ['diff', '--no-ext-diff', '--no-textconv', '--unified=1', hash, '--']) + '\n' +
      git(root, ['diff', '--cached', '--no-ext-diff', '--no-textconv', '--unified=1', hash, '--']);
    // RF-9.E3: newly written source is absent from git diff until staged; include it explicitly.
    for (const file of paths(git(root, ['ls-files', '--others', '--exclude-standard', '-z']))) {
      if (!/\.(?:[cm]?[jt]s|[jt]sx)$/.test(file)) continue;
      const absolute = fs.realpathSync(path.join(root, file));
      if (!absolute.startsWith(root + path.sep)) throw new Error('Untracked source must stay inside repository');
      const lines = fs.readFileSync(absolute, 'utf8').split('\n');
      diff += `\ndiff --git a/${file} b/${file}\n--- /dev/null\n+++ b/${file}\n@@ -0,0 +1,${lines.length} @@\n` + lines.map(line => '+' + line).join('\n');
    }
    return checkTrace({ diff });
  } catch (error) { return { ok: false, errors: [error.message] }; }
}

export function runCli(kind, argv = process.argv.slice(2)) {
  try {
    if (argv.length === 1 && ['--help', '-h'].includes(argv[0])) {
      console.log(kind === 'frozen' ? 'Usage: node check-frozen-tests.mjs --base <confirmed-base> [--red <approved-red>] [--root <repo>] [--constitution <file>]' : 'Usage: node check-branch-trace.mjs --base <confirmed-base> [--root <repo>] | --diff <patch>');
      return;
    }
    const options = {};
    const allowed = kind === 'frozen' ? ['root', 'base', 'red', 'constitution'] : ['root', 'base', 'diff'];
    for (let i = 0; i < argv.length; i += 2) {
      const key = argv[i].replace(/^--/, ''), value = argv[i + 1];
      if (!argv[i].startsWith('--') || !allowed.includes(key) || !value || value.startsWith('--') || Object.hasOwn(options, key)) throw new Error('Invalid or duplicate argument; use --help');
      options[key] = value;
    }
    if (kind === 'trace' && options.diff && options.base) throw new Error('Choose --diff or --base, not both');
    const result = kind === 'frozen' ? checkFrozen(options) : options.diff ? checkTrace({ diff: fs.readFileSync(options.diff, 'utf8') }) : checkTraceRepository(options);
    for (const error of result.errors) console.error(`error: ${error}`);
    console.log(`${kind}: ${result.ok ? 'PASS' : 'FAIL'}; ${result.errors.length} issue(s)${result.amended ? `; ${result.amended.length} cited amendment path(s)` : ''}`);
    process.exitCode = result.ok ? 0 : 1;
  } catch (error) { console.error(`error: ${error.message}`); process.exitCode = 1; }
}
