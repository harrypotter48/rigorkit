// 022-global-rules-on-install B3 — the one-line installer (tools/install-remote.sh) offers to install only the
// global rules of `core` (RF-1…RF-8, RF-12…RF-15) and the security checks V1–V12 of threat-model.md.
// Real `sh tools/install-remote.sh` against local bare remotes in a temporary HOME; questions go through a
// pseudo-terminal, no-terminal cases through plain pipes. RF-IDs: specs/changes/022-global-rules-on-install/spec.md.
//
// Message contracts proposed by these tests (the spec fixes behaviour, not wording):
//  - the question is the last paragraph of the output (after a blank line) and ends with the prompt `[y/N] `;
//  - the "later command" is `rigorkit install --pack core --agent <tools> --global --rules-only`;
//  - notices contain: `unavailable` (release cannot install rules only; for an old clone also `rigorkit update`),
//    `already installed` (every file has the block), `fix the markers by hand` (incomplete block).
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { chmodSync, existsSync, lstatSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { isRoot, snapshot, put, toolbox } from './rigorkit-fixture.mjs';
import { home, run, repo, testRemote, cloneAt, git, envFor, pty, NEED_PTY, has } from './update-fixture.mjs';

const INSTALLER = path.join(repo, 'tools/install-remote.sh');
const SKIP = NEED_PTY || (isRoot() && 'D4: running as root ignores permission bits');
const START = '<!-- rigorkit:core:start -->', END = '<!-- rigorkit:core:end -->';
const BLOCK = `${START}\nold rules\n${END}\n`;
const LATER = /rigorkit install --pack core --agent \S+ --global --rules-only/;
const ESC = String.fromCharCode(27);
const read = p => readFileSync(p, 'utf8');
const mode = p => statSync(p).mode & 0o777;
const count = (text, re) => (text.match(re) || []).length;
const asked = out => out.includes('[y/N]');
// The question: the last paragraph before the final prompt, prompt included.
const question = out => { const i = out.lastIndexOf('[y/N]'); return i < 0 ? '' : `${out.slice(0, i).split(/\n\s*\n/).pop()}[y/N]`; };
const withoutDownloadLine = out => out.split('\n').filter(l => !/downloading rigorkit/.test(l)).join('\n');

// --- scenes ---------------------------------------------------------------------------------------------------
const NO_RULES_RELEASE = dir => rmSync(path.join(dir, 'packs/core/rules.md'));
const OLD_RELEASE = dir => writeFileSync(path.join(dir, 'install.sh'), read(path.join(dir, 'install.sh')).replace('RULES_ONLY_SUPPORTED=1\n', ''));
const MARK_RUN = dir => writeFileSync(path.join(dir, 'install.sh'), read(path.join(dir, 'install.sh')).replace('set -euo pipefail\n', 'set -euo pipefail\n: > "$HOME/.install-ran"\n'));

// A temp HOME, a bare remote with release 0.9.0 (optionally mutated), a project folder as the working folder,
// and optionally an existing clone of that release.
function scene(t, { mutate, existing = false } = {}) {
  const h = home(t);
  const r = testRemote(t, h.root);
  r.release('0.9.0', mutate);
  const project = path.join(h.root, 'project');
  mkdirSync(project, { recursive: true });
  const s = { h, r, project, f: rel => path.join(h.HOME, rel), existing };
  if (existing) s.clone = cloneAt(h.HOME, r.bare, 'v0.9.0');
  s.env = (extra = {}) => ({ ...envFor(h, { RIGORKIT_REMOTE: r.bare, SHELL: '/bin/zsh' }), ...extra });
  return s;
}
const tool = (s, rel, content = null) => {
  const file = s.f(rel);
  mkdirSync(path.dirname(file), { recursive: true });
  if (content !== null) writeFileSync(file, content);
  return file;
};
const CLAUDE = '.claude/CLAUDE.md', CODEX = '.codex/AGENTS.md', OPENCODE = '.config/opencode/AGENTS.md';
// Run the installer. ask = answers for the prompt (a terminal); otherwise a plain pipe (no terminal).
const withTerminal = (s, { answer = null, env = {}, shell } = {}) => pty('sh', shell ?? [INSTALLER], { env: s.env(env), cwd: s.project, steps: answer === null ? [] : [['[y/N]', answer]], eof: true, timeout: 60 });
const noTerminal = (s, { input = '', env = {} } = {}) => run('sh', [INSTALLER], { env: s.env(env), cwd: s.project, input });
const hasBlock = text => text.includes(START) && text.includes(END);
const noRulesFiles = s => [CLAUDE, CODEX, OPENCODE].filter(rel => existsSync(s.f(rel)));

describe('022-global-rules-on-install', () => {
  // --- RF-1 -----------------------------------------------------------------------------------------------
  test('RF-1.H1: a new install with Claude Code detected asks once and names its instruction file', { skip: SKIP }, t => {
    const s = scene(t); tool(s, CLAUDE, 'mine\n');
    const o = withTerminal(s, { answer: 'n' });
    assert.equal(o.status, 0, o.out);
    assert.equal(count(o.out, /\[y\/N\]/g), 1);
    assert.ok(question(o.out).includes(s.f(CLAUDE)), question(o.out));
  });

  test('RF-1.E1: all three tools detected: a single question names the three files', { skip: SKIP }, t => {
    const s = scene(t); tool(s, CLAUDE, 'a\n'); tool(s, CODEX, 'b\n'); tool(s, OPENCODE, 'c\n');
    const o = withTerminal(s, { answer: 'n' });
    assert.equal(count(o.out, /\[y\/N\]/g), 1);
    for (const rel of [CLAUDE, CODEX, OPENCODE]) assert.ok(question(o.out).includes(s.f(rel)), rel);
  });

  test('RF-1.E2: a startup file that cannot be written does not stop the question; the run ends with a failure status', { skip: SKIP || !has('zsh') }, t => {
    const s = scene(t); tool(s, CLAUDE, 'mine\n');
    put(s.f('.zshrc'), 'export A=1\n', 0o444);
    const o = withTerminal(s, { answer: 'n' });
    assert.ok(asked(o.out), 'the question is still asked');
    assert.notEqual(o.status, 0, o.out);
  });

  test('RF-1.E3: a file that already has the block is not offered; the other is, and the first stays byte-identical', { skip: SKIP }, t => {
    const s = scene(t); tool(s, CLAUDE, BLOCK); tool(s, CODEX, 'mine\n');
    const o = withTerminal(s, { answer: 'y' });
    assert.equal(o.status, 0, o.out);
    assert.ok(question(o.out).includes(s.f(CODEX)));
    assert.ok(!question(o.out).includes(s.f(CLAUDE)));
    assert.equal(read(s.f(CLAUDE)), BLOCK);
    assert.ok(!existsSync(`${s.f(CLAUDE)}.rigorkit.bak`));
    assert.ok(hasBlock(read(s.f(CODEX))));
  });

  test('RF-1.F1: when the clone step fails there is no question and no instruction file changes', { skip: SKIP }, t => {
    const s = scene(t); tool(s, CLAUDE, 'mine\n');
    const before = snapshot(s.f('.claude'));
    const o = withTerminal(s, { answer: 'y', env: { RIGORKIT_REMOTE: 'https://127.0.0.1:9/x.git' } });
    assert.notEqual(o.status, 0);
    assert.ok(!asked(o.out));
    assert.deepEqual(snapshot(s.f('.claude')), before);
  });

  test('RF-1.S1: for a symbolic link the question names the target that would be written', { skip: SKIP }, t => {
    const s = scene(t);
    const target = path.join(s.h.root, 'elsewhere/real-claude.md');
    put(target, 'mine\n');
    mkdirSync(s.f('.claude'), { recursive: true });
    symlinkSync(target, s.f(CLAUDE));
    const o = withTerminal(s, { answer: 'n' });
    assert.ok(question(o.out).includes(target), question(o.out));
  });

  // --- RF-2 -----------------------------------------------------------------------------------------------
  test('RF-2.H1: yes adds the core rules block, keeps the user content byte-identical and writes a backup', { skip: SKIP }, t => {
    const s = scene(t); tool(s, CLAUDE, 'mine\n');
    const o = withTerminal(s, { answer: 'y' });
    assert.equal(o.status, 0, o.out);
    const text = read(s.f(CLAUDE));
    assert.ok(text.startsWith('mine\n') && hasBlock(text));
    assert.equal(read(`${s.f(CLAUDE)}.rigorkit.bak`), 'mine\n');
  });

  test('RF-2.E1: yes with no instruction file creates it with only the block and writes no backup', { skip: SKIP }, t => {
    const s = scene(t); tool(s, '.claude/.keep', '');
    const o = withTerminal(s, { answer: 'y' });
    assert.equal(o.status, 0, o.out);
    const text = read(s.f(CLAUDE));
    assert.ok(text.startsWith(START) && text.trimEnd().endsWith(END));
    assert.ok(!existsSync(`${s.f(CLAUDE)}.rigorkit.bak`));
  });

  test('RF-2.E2: the user\'s own .bak copy is untouched and the rigorkit backup keeps the original mode', { skip: SKIP }, t => {
    const s = scene(t); tool(s, CLAUDE, 'mine\n'); chmodSync(s.f(CLAUDE), 0o600);
    writeFileSync(`${s.f(CLAUDE)}.bak`, 'my own backup\n');
    const o = withTerminal(s, { answer: 'y' });
    assert.equal(o.status, 0, o.out);
    assert.equal(read(`${s.f(CLAUDE)}.bak`), 'my own backup\n');
    assert.equal(mode(`${s.f(CLAUDE)}.rigorkit.bak`), 0o600);
  });

  test('RF-2.S1: after a yes no skill or agent folder exists and the working project folder is untouched', { skip: SKIP }, t => {
    const s = scene(t); tool(s, CLAUDE, 'mine\n');
    const before = snapshot(s.project);
    withTerminal(s, { answer: 'y' });
    for (const d of ['.claude/skills', '.claude/agents', '.agents', '.cursor']) assert.ok(!existsSync(s.f(d)), d);
    assert.deepEqual(snapshot(s.project), before);
  });

  // --- RF-3 -----------------------------------------------------------------------------------------------
  test('RF-3.H1: a no leaves every instruction file byte-identical, prints the later command and succeeds', { skip: SKIP }, t => {
    const s = scene(t); tool(s, CLAUDE, 'mine\n');
    const o = withTerminal(s, { answer: 'n' });
    assert.equal(o.status, 0, o.out);
    assert.equal(read(s.f(CLAUDE)), 'mine\n');
    assert.match(o.out, LATER);
  });

  test('RF-3.E1: an empty answer or any other text counts as a no', { skip: SKIP }, t => {
    for (const answer of ['', 'maybe', 'yess']) {
      const s = scene(t); tool(s, CLAUDE, 'mine\n');
      const o = withTerminal(s, { answer });
      assert.equal(o.status, 0, `${JSON.stringify(answer)}: ${o.out}`);
      assert.equal(read(s.f(CLAUDE)), 'mine\n', JSON.stringify(answer));
      assert.match(o.out, LATER);
    }
  });

  test('RF-3.E2: a piped installer (curl | sh) in a session with a terminal does not ask', { skip: SKIP }, t => {
    const s = scene(t); tool(s, CLAUDE, 'mine\n');
    const o = withTerminal(s, { shell: ['-c', `cat "${INSTALLER}" | sh`] });
    assert.ok(!asked(o.out), o.out);
    assert.equal(read(s.f(CLAUDE)), 'mine\n');
    assert.match(o.out, LATER);
    assert.equal(o.status, 0, o.out);
  });

  test('RF-3.E3: input on a terminal and output redirected to a file: no question, later command printed', { skip: SKIP }, t => {
    const s = scene(t); tool(s, CLAUDE, 'mine\n');
    const outfile = path.join(s.h.root, 'redirected.out');
    const o = withTerminal(s, { shell: ['-c', `sh "${INSTALLER}" > "${outfile}"`] });
    const text = read(outfile);
    assert.ok(!asked(o.out) && !asked(text));
    assert.match(text, LATER);
    assert.equal(read(s.f(CLAUDE)), 'mine\n');
    assert.equal(o.status, 0, o.out);
  });

  test('RF-3.F1: with no terminal on standard input there is no question and the run succeeds', t => {
    const s = scene(t); tool(s, CLAUDE, 'mine\n');
    const o = noTerminal(s);
    assert.equal(o.status, 0, o.out);
    assert.ok(!asked(o.out));
    assert.equal(read(s.f(CLAUDE)), 'mine\n');
    assert.match(o.out, LATER);
  });

  test('RF-3.F2: interrupting the question leaves instruction files identical, the clone and startup blocks usable, and fails', { skip: SKIP }, t => {
    const s = scene(t); tool(s, CLAUDE, 'mine\n');
    const o = withTerminal(s, { answer: '\x03' });
    assert.notEqual(o.status, 0);
    assert.equal(read(s.f(CLAUDE)), 'mine\n');
    assert.ok(existsSync(s.f('.rigorkit/bin/rigorkit')));
    assert.ok(read(s.f('.zshrc')).includes('# rigorkit:start'));
  });

  test('RF-3.S1: piped text `y` without a terminal is not consent', t => {
    const s = scene(t); tool(s, CLAUDE, 'mine\n');
    const o = noTerminal(s, { input: 'y\ny\nyes\n' });
    assert.equal(read(s.f(CLAUDE)), 'mine\n');
    assert.ok(!existsSync(`${s.f(CLAUDE)}.rigorkit.bak`));
    assert.equal(o.status, 0, o.out);
  });

  // --- RF-4 -----------------------------------------------------------------------------------------------
  test('RF-4.H1: RIGORKIT_NO_RULES=1 means no question, files unchanged and the later command printed', { skip: SKIP }, t => {
    const s = scene(t); tool(s, CLAUDE, 'mine\n');
    const o = withTerminal(s, { env: { RIGORKIT_NO_RULES: '1' } });
    assert.ok(!asked(o.out));
    assert.equal(read(s.f(CLAUDE)), 'mine\n');
    assert.match(o.out, LATER);
  });

  test('RF-4.E1: RIGORKIT_NO_RULES set but empty is as if unset: the question is asked', { skip: SKIP }, t => {
    const s = scene(t); tool(s, CLAUDE, 'mine\n');
    const o = withTerminal(s, { answer: 'n', env: { RIGORKIT_NO_RULES: '' } });
    assert.ok(asked(o.out));
  });

  test('RF-4.S1: RIGORKIT_NO_RULES=0 is an opt-out: no file is written even with a yes ready', { skip: SKIP }, t => {
    const s = scene(t); tool(s, CLAUDE, 'mine\n');
    const o = withTerminal(s, { answer: 'y', env: { RIGORKIT_NO_RULES: '0' } });
    assert.ok(!asked(o.out));
    assert.equal(read(s.f(CLAUDE)), 'mine\n');
    assert.ok(!existsSync(`${s.f(CLAUDE)}.rigorkit.bak`));
  });

  // --- RF-5 -----------------------------------------------------------------------------------------------
  test('RF-5.H1: with no supported tool folder there is no question, the later command is printed and the run succeeds', { skip: SKIP }, t => {
    const s = scene(t);
    const o = withTerminal(s);
    assert.ok(!asked(o.out));
    assert.match(o.out, LATER);
    assert.equal(o.status, 0, o.out);
  });

  test('RF-5.E1: only a Cursor folder is the same as no tool detected', { skip: SKIP }, t => {
    const s = scene(t); tool(s, '.cursor/.keep', '');
    const o = withTerminal(s);
    assert.ok(!asked(o.out));
    assert.match(o.out, LATER);
  });

  test('RF-5.E2: CODEX_HOME naming an existing folder is detected in place of ~/.codex', { skip: SKIP }, t => {
    const s = scene(t);
    const codexHome = path.join(s.h.root, 'codex-home');
    mkdirSync(codexHome, { recursive: true });
    const o = withTerminal(s, { answer: 'n', env: { CODEX_HOME: codexHome } });
    assert.ok(question(o.out).includes(path.join(codexHome, 'AGENTS.md')), question(o.out));
  });

  test('RF-5.E3: ~/.claude as a regular file is not a detected tool and stays unchanged', { skip: SKIP }, t => {
    const s = scene(t); put(s.f('.claude'), 'i am a file\n');
    const o = withTerminal(s, { answer: 'y' });
    assert.ok(!asked(o.out));
    assert.equal(read(s.f('.claude')), 'i am a file\n');
  });

  test('RF-5.S1: with no tool folder no folder or instruction file is created', { skip: SKIP }, t => {
    const s = scene(t);
    withTerminal(s, { answer: 'y' });
    for (const d of ['.claude', '.codex', '.config/opencode']) assert.ok(!existsSync(s.f(d)), d);
  });

  // --- RF-6 (existing clone) -------------------------------------------------------------------------------
  test('RF-6.H1: an existing clone and a file without the block: the offer names it and a yes installs the block', { skip: SKIP }, t => {
    const s = scene(t, { existing: true }); tool(s, CLAUDE, 'mine\n');
    const o = withTerminal(s, { answer: 'y', env: { RIGORKIT_REMOTE: undefined } });
    assert.ok(question(o.out).includes(s.f(CLAUDE)), o.out);
    assert.ok(hasBlock(read(s.f(CLAUDE))));
  });

  test('RF-6.E1: an existing clone: the file with the block is not offered and stays byte-identical', { skip: SKIP }, t => {
    const s = scene(t, { existing: true }); tool(s, CLAUDE, BLOCK); tool(s, CODEX, 'mine\n');
    const o = withTerminal(s, { answer: 'y', env: { RIGORKIT_REMOTE: undefined } });
    assert.ok(question(o.out).includes(s.f(CODEX)) && !question(o.out).includes(s.f(CLAUDE)));
    assert.equal(read(s.f(CLAUDE)), BLOCK);
  });

  test('RF-6.S1: an existing clone, a block with older content and an offered Codex file: only Codex gains the block', { skip: SKIP }, t => {
    const s = scene(t, { existing: true }); tool(s, CLAUDE, `before\n${BLOCK}`); tool(s, CODEX, 'mine\n');
    const before = read(s.f(CLAUDE));
    withTerminal(s, { answer: 'y', env: { RIGORKIT_REMOTE: undefined } });
    assert.equal(read(s.f(CLAUDE)), before);
    assert.ok(hasBlock(read(s.f(CODEX))));
  });

  // --- RF-7 -----------------------------------------------------------------------------------------------
  test('RF-7.H1: RIGORKIT_REMOTE naming another source: the question names that source', { skip: SKIP }, t => {
    const s = scene(t); tool(s, CLAUDE, 'mine\n');
    const o = withTerminal(s, { answer: 'n' });
    assert.ok(question(o.out).includes(s.r.bare), question(o.out));
  });

  test('RF-7.E1: with RIGORKIT_REMOTE and RIGORKIT_REF unset the question names no source or ref', { skip: SKIP }, t => {
    const s = scene(t); tool(s, CLAUDE, 'mine\n');
    const cfg = path.join(s.h.root, 'gitconfig');
    writeFileSync(cfg, `[url "${s.r.bare}"]\n\tinsteadOf = https://github.com/harrypotter48/rigorkit.git\n`);
    const o = withTerminal(s, { answer: 'n', env: { RIGORKIT_REMOTE: undefined, GIT_CONFIG_GLOBAL: cfg } });
    assert.ok(asked(o.out), o.out);
    assert.ok(!question(o.out).includes(s.r.bare) && !/RIGORKIT_REF|ref /i.test(question(o.out)), question(o.out));
  });

  test('RF-7.E2: only RIGORKIT_REF naming a branch: the question names that ref', { skip: SKIP }, t => {
    const s = scene(t); tool(s, CLAUDE, 'mine\n');
    git(s.r.work, ['push', '--quiet', 'origin', 'HEAD:refs/heads/topic-x']);
    const cfg = path.join(s.h.root, 'gitconfig');
    writeFileSync(cfg, `[url "${s.r.bare}"]\n\tinsteadOf = https://github.com/harrypotter48/rigorkit.git\n`);
    const o = withTerminal(s, { answer: 'n', env: { RIGORKIT_REMOTE: undefined, RIGORKIT_REF: 'topic-x', GIT_CONFIG_GLOBAL: cfg } });
    assert.ok(question(o.out).includes('topic-x'), question(o.out));
  });

  test('RF-7.E3: an existing clone ignores RIGORKIT_REMOTE with its warning and the question names no source', { skip: SKIP }, t => {
    const s = scene(t, { existing: true }); tool(s, CLAUDE, 'mine\n');
    const o = withTerminal(s, { answer: 'n' });
    assert.match(o.out, /RIGORKIT_REMOTE is ignored/);
    assert.ok(!question(o.out).includes(s.r.bare), question(o.out));
  });

  test('RF-7.S1: control characters in the source name never reach the terminal through the question', { skip: SKIP }, t => {
    const s = scene(t); tool(s, CLAUDE, 'mine\n');
    const odd = path.join(s.h.root, `rem${ESC}[31mote`);
    symlinkSync(s.r.bare, odd);
    const o = withTerminal(s, { answer: 'n', env: { RIGORKIT_REMOTE: odd } });
    assert.ok(asked(o.out), o.out);
    assert.ok(!withoutDownloadLine(o.out).includes(ESC), 'no escape character outside the download line');
  });

  // --- RF-8 -----------------------------------------------------------------------------------------------
  test('RF-8.E1: the first of two files is not writable: it is reported and unchanged, the second gets the block, status is failure', { skip: SKIP }, t => {
    const s = scene(t); tool(s, CLAUDE, 'mine\n'); chmodSync(s.f(CLAUDE), 0o444); tool(s, CODEX, 'other\n');
    const o = withTerminal(s, { answer: 'y' });
    assert.notEqual(o.status, 0, o.out);
    assert.equal(read(s.f(CLAUDE)), 'mine\n');
    assert.match(o.out, /CLAUDE\.md/);
    assert.ok(hasBlock(read(s.f(CODEX))));
  });

  test('RF-8.F1: a backup that cannot be written leaves the file unchanged and reports it; the clone and startup blocks stay usable', { skip: SKIP }, t => {
    const s = scene(t); tool(s, CLAUDE, 'mine\n'); chmodSync(s.f('.claude'), 0o555);
    const o = withTerminal(s, { answer: 'y' });
    chmodSync(s.f('.claude'), 0o755);
    assert.equal(read(s.f(CLAUDE)), 'mine\n');
    assert.notEqual(o.status, 0, o.out);
    assert.match(o.out, /CLAUDE\.md/);
    assert.ok(existsSync(s.f('.rigorkit/bin/rigorkit')) && read(s.f('.zshrc')).includes('# rigorkit:start'));
  });

  test('RF-8.S1: a broken symbolic link: nothing is created at its target and the file is reported', { skip: SKIP }, t => {
    const s = scene(t);
    const target = path.join(s.h.root, 'missing-dir/real.md');
    mkdirSync(s.f('.claude'), { recursive: true });
    symlinkSync(target, s.f(CLAUDE));
    const o = withTerminal(s, { answer: 'y' });
    assert.ok(!existsSync(target) && !existsSync(path.dirname(target)));
    assert.match(o.out, /CLAUDE\.md/);
    assert.notEqual(o.status, 0, o.out);
  });

  // --- RF-12 ----------------------------------------------------------------------------------------------
  test('RF-12.E1: an existing clone older than this change: no question, the notice names rigorkit update, success', { skip: SKIP }, t => {
    const s = scene(t, { existing: true, mutate: OLD_RELEASE }); tool(s, CLAUDE, 'mine\n');
    const o = withTerminal(s, { answer: 'y', env: { RIGORKIT_REMOTE: undefined } });
    assert.ok(!asked(o.out));
    assert.match(o.out, /unavailable/i);
    assert.match(o.out, /rigorkit update/);
    assert.equal(read(s.f(CLAUDE)), 'mine\n');
    assert.equal(o.status, 0, o.out);
  });

  test('RF-12.F1: a new install of a release without core rules still installs the clone, with the notice and no question', { skip: SKIP }, t => {
    const s = scene(t, { mutate: NO_RULES_RELEASE }); tool(s, CLAUDE, 'mine\n');
    const o = withTerminal(s, { answer: 'y' });
    assert.ok(existsSync(s.f('.rigorkit/bin/rigorkit')));
    assert.ok(!asked(o.out));
    assert.match(o.out, /unavailable/i);
    assert.equal(o.status, 0, o.out);
  });

  test('RF-12.S1: when the release cannot install rules only, no instruction file is created or changed', { skip: SKIP }, t => {
    const s = scene(t, { mutate: OLD_RELEASE }); tool(s, CLAUDE, 'mine\n'); tool(s, '.codex/.keep', '');
    withTerminal(s, { answer: 'y' });
    assert.equal(read(s.f(CLAUDE)), 'mine\n');
    assert.ok(!existsSync(s.f(CODEX)));
  });

  // --- RF-13 ----------------------------------------------------------------------------------------------
  test('RF-13.H1: every detected tool already has the block: no question, "already installed", no later command, success', { skip: SKIP }, t => {
    const s = scene(t); tool(s, CLAUDE, BLOCK); tool(s, CODEX, BLOCK);
    const o = withTerminal(s, { answer: 'y' });
    assert.ok(!asked(o.out));
    assert.match(o.out, /already installed/i);
    assert.doesNotMatch(o.out, LATER);
    assert.equal(o.status, 0, o.out);
  });

  test('RF-13.E1: an existing clone with its startup blocks and every file with the block: no question, no change, success', { skip: SKIP }, t => {
    const s = scene(t, { existing: true }); tool(s, CLAUDE, BLOCK);
    withTerminal(s, { env: { RIGORKIT_REMOTE: undefined } });   // first run adds the startup blocks
    const o = withTerminal(s, { answer: 'y', env: { RIGORKIT_REMOTE: undefined } });
    assert.ok(!asked(o.out));
    assert.equal(read(s.f(CLAUDE)), BLOCK);
    assert.equal(o.status, 0, o.out);
  });

  test('RF-13.S1: blocks with older content than the release are never refreshed by the one-line installer', { skip: SKIP }, t => {
    const s = scene(t, { existing: true }); tool(s, CLAUDE, BLOCK); tool(s, CODEX, BLOCK);
    withTerminal(s, { answer: 'y', env: { RIGORKIT_REMOTE: undefined } });
    assert.equal(read(s.f(CLAUDE)), BLOCK);
    assert.equal(read(s.f(CODEX)), BLOCK);
  });

  // --- RF-14 ----------------------------------------------------------------------------------------------
  test('RF-14.E1: opt-out and a release that cannot install rules only: only the unavailable notice, no later command', { skip: SKIP }, t => {
    const s = scene(t, { mutate: OLD_RELEASE }); tool(s, CLAUDE, 'mine\n');
    const o = withTerminal(s, { env: { RIGORKIT_NO_RULES: '1' } });
    assert.match(o.out, /unavailable/i);
    assert.doesNotMatch(o.out, LATER);
  });

  test('RF-14.E2: no terminal and every detected tool already has the block: "already installed", no later command', t => {
    const s = scene(t); tool(s, CLAUDE, BLOCK);
    const o = noTerminal(s);
    assert.match(o.out, /already installed/i);
    assert.doesNotMatch(o.out, LATER);
  });

  test('RF-14.F1: no tool detected and a release that cannot install rules only: only the unavailable notice, success', t => {
    const s = scene(t, { mutate: OLD_RELEASE });
    const o = noTerminal(s);
    assert.match(o.out, /unavailable/i);
    assert.doesNotMatch(o.out, LATER);
    assert.equal(o.status, 0, o.out);
  });

  test('RF-14.S1: opt-out with no terminal and an offered file: no question, file identical, the later command printed once', t => {
    const s = scene(t); tool(s, CLAUDE, 'mine\n');
    const o = noTerminal(s, { env: { RIGORKIT_NO_RULES: '1' } });
    assert.ok(!asked(o.out));
    assert.equal(read(s.f(CLAUDE)), 'mine\n');
    assert.equal(count(o.out, new RegExp(LATER.source, 'g')), 1, o.out);
  });

  // --- RF-15 ----------------------------------------------------------------------------------------------
  const INCOMPLETE = `mine\n${START}\nhalf\n`;
  test('RF-15.E1: an incomplete block is reported before the question, which names only the offered file; status is failure', { skip: SKIP }, t => {
    const s = scene(t); tool(s, CLAUDE, INCOMPLETE); tool(s, CODEX, 'other\n');
    const o = withTerminal(s, { answer: 'n' });
    const at = o.out.indexOf(s.f(CLAUDE));
    assert.ok(at >= 0 && at < o.out.lastIndexOf('[y/N]'), 'the damaged file is reported before the question');
    assert.ok(question(o.out).includes(s.f(CODEX)) && !question(o.out).includes(s.f(CLAUDE)));
    assert.equal(read(s.f(CLAUDE)), INCOMPLETE);
    assert.notEqual(o.status, 0, o.out);
  });

  test('RF-15.F1: the only file has an incomplete block and there is no terminal: reported with the advice, no question, no later command, failure', t => {
    const s = scene(t); tool(s, CLAUDE, INCOMPLETE);
    const o = noTerminal(s);
    assert.match(o.out, /fix the markers by hand/i);
    assert.ok(!asked(o.out));
    assert.doesNotMatch(o.out, LATER);
    assert.equal(read(s.f(CLAUDE)), INCOMPLETE);
    assert.notEqual(o.status, 0, o.out);
  });

  test('RF-15.F2: the only file has an incomplete block and there is a terminal: same, no question and no later command', { skip: SKIP }, t => {
    const s = scene(t); tool(s, CLAUDE, INCOMPLETE);
    const o = withTerminal(s, { answer: 'y' });
    assert.ok(!asked(o.out));
    assert.doesNotMatch(o.out, LATER);
    assert.equal(read(s.f(CLAUDE)), INCOMPLETE);
    assert.match(o.out, /fix the markers by hand/i);
  });

  test('RF-15.S1: with the opt-out an incomplete block is not reported and the run succeeds', { skip: SKIP }, t => {
    const s = scene(t); tool(s, CLAUDE, INCOMPLETE);
    const o = withTerminal(s, { env: { RIGORKIT_NO_RULES: '1' } });
    assert.doesNotMatch(o.out, /fix the markers by hand/i);
    assert.equal(read(s.f(CLAUDE)), INCOMPLETE);
    assert.equal(o.status, 0, o.out);
  });

  // --- threat model checks V1–V12 ---------------------------------------------------------------------------
  test('V1: the clone\'s install.sh never runs without a yes (no, no terminal, opt-out, no tool, all blocks) and runs after a yes', { skip: SKIP }, t => {
    const cases = [
      ['a no', s => { tool(s, CLAUDE, 'mine\n'); return withTerminal(s, { answer: 'n' }); }],
      ['no terminal', s => { tool(s, CLAUDE, 'mine\n'); return noTerminal(s); }],
      ['opt-out', s => { tool(s, CLAUDE, 'mine\n'); return withTerminal(s, { env: { RIGORKIT_NO_RULES: '1' } }); }],
      ['no tool', s => withTerminal(s)],
      ['all blocks', s => { tool(s, CLAUDE, BLOCK); return withTerminal(s); }],
    ];
    for (const [name, go] of cases) {
      const s = scene(t, { mutate: MARK_RUN }); go(s);
      assert.ok(!existsSync(s.f('.install-ran')), `${name}: install.sh ran`);
    }
    const s = scene(t, { mutate: MARK_RUN }); tool(s, CLAUDE, 'mine\n');
    withTerminal(s, { answer: 'y' });
    assert.ok(existsSync(s.f('.install-ran')), 'a yes runs the clone\'s installer');
  });

  test('V2: after a yes an unsafe clone is refused with a report and a failure status, and nothing runs or changes', { skip: SKIP }, t => {
    const unsafe = [
      ['group-writable lib file', s => chmodSync(path.join(s.clone, 'lib/output.sh'), 0o664)],
      ['group-writable install.sh', s => chmodSync(path.join(s.clone, 'install.sh'), 0o775)],
      ['loose custom core pack', s => { put(path.join(s.clone, 'custom/packs/core/rules.md'), 'evil\n', 0o666); }],
      ['symbolic-link lib file', s => { const f = path.join(s.clone, 'lib/output.sh'); const keep = `${f}.orig`; writeFileSync(keep, read(f)); rmSync(f); symlinkSync(keep, f); }],
    ];
    for (const [name, make] of unsafe) {
      const s = scene(t, { existing: true, mutate: MARK_RUN }); tool(s, CLAUDE, 'mine\n');
      make(s);
      const o = withTerminal(s, { answer: 'y', env: { RIGORKIT_REMOTE: undefined } });
      assert.notEqual(o.status, 0, `${name}: ${o.out}`);
      assert.equal(read(s.f(CLAUDE)), 'mine\n', name);
      assert.ok(!existsSync(s.f('.install-ran')), `${name}: the clone's installer ran`);
    }
  });

  test('V3: BASH_ENV and the internal RK_* variables do not reach the clone\'s installer; the block names the real clone and the record is written', { skip: SKIP }, t => {
    const s = scene(t); tool(s, CLAUDE, 'mine\n');
    const hook = path.join(s.h.root, 'bash-env.sh');
    writeFileSync(hook, `: > "${s.h.HOME}/.bash-env-ran"\n`);
    const o = withTerminal(s, { answer: 'y', env: { BASH_ENV: hook, RK_NO_RECORD: '1', RK_RENDER_ROOT: '/tmp/elsewhere', RK_STAGE: '1' } });
    assert.equal(o.status, 0, o.out);
    assert.ok(!existsSync(s.f('.bash-env-ran')), 'BASH_ENV was honoured');
    assert.ok(read(s.f(CLAUDE)).includes(`${s.h.HOME}/.rigorkit/bin/rigorkit`));
    assert.ok(existsSync(s.f('.local/state/rigorkit/global')), 'the record is written');
  });

  test('V4: a link to a regular file changes only the target; the backup is made of the real file', { skip: SKIP }, t => {
    const s = scene(t);
    const target = path.join(s.h.root, 'dotfiles/claude.md');
    put(target, 'mine\n');
    mkdirSync(s.f('.claude'), { recursive: true });
    symlinkSync(target, s.f(CLAUDE));
    withTerminal(s, { answer: 'y' });
    assert.ok(lstatSync(s.f(CLAUDE)).isSymbolicLink());
    assert.ok(hasBlock(read(target)));
    assert.equal(read(`${target}.rigorkit.bak`), 'mine\n');
  });

  test('V10: an instruction file folder writable by others, or a relative CODEX_HOME, is refused after a yes with a failure status', { skip: SKIP }, t => {
    const a = scene(t); tool(a, CLAUDE, 'mine\n'); chmodSync(a.f('.claude'), 0o777);
    const oa = withTerminal(a, { answer: 'y' });
    chmodSync(a.f('.claude'), 0o755);
    assert.notEqual(oa.status, 0, oa.out);
    assert.equal(read(a.f(CLAUDE)), 'mine\n');
    const b = scene(t); mkdirSync(path.join(b.project, 'rel-codex'));
    const ob = withTerminal(b, { answer: 'y', env: { CODEX_HOME: 'rel-codex' } });
    assert.notEqual(ob.status, 0, ob.out);
    assert.ok(!existsSync(path.join(b.project, 'rel-codex/AGENTS.md')));
  });

  test('V11: the question shows the clone version, the other writes and the preview command', { skip: SKIP }, t => {
    const s = scene(t); tool(s, CLAUDE, 'mine\n');
    const q = question(withTerminal(s, { answer: 'n' }).out);
    assert.match(q, /0\.9\.0/);
    assert.match(q, /\.rigorkit-version/);
    assert.match(q, /--dry-run/);
  });

  test('V12: an existing clone offers the rules without any git command', { skip: SKIP }, t => {
    const s = scene(t, { existing: true }); tool(s, CLAUDE, 'mine\n');
    const stubs = path.join(s.h.root, 'stubs');
    put(path.join(stubs, 'git'), `#!/bin/sh\n: > "${s.h.root}/git-called"\nexit 1\n`, 0o755);
    withTerminal(s, { answer: 'y', env: { RIGORKIT_REMOTE: undefined, PATH: `${stubs}:${process.env.PATH}` } });
    assert.ok(!existsSync(path.join(s.h.root, 'git-called')));
    assert.ok(hasBlock(read(s.f(CLAUDE))));
  });

  test('Twin equality: the one-line installer and install.sh agree on the tool files, CODEX_HOME and the core markers', () => {
    const remote = read(INSTALLER), install = read(path.join(repo, 'install.sh'));
    for (const piece of ['.claude/CLAUDE.md', '.config/opencode/AGENTS.md', 'AGENTS.md', 'CODEX_HOME', START, END]) {
      assert.ok(install.includes(piece), `install.sh lacks ${piece}`);
      assert.ok(remote.includes(piece), `tools/install-remote.sh lacks ${piece}`);
    }
  });
});
