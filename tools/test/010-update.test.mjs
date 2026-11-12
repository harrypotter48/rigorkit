// 010-update HU-2 — `rigorkit update`: clone move, changelog, refusals, startup blocks and global refresh
// (RF-10, RF-11, RF-13–RF-17, RF-19–RF-28, RF-30, RF-32, RF-34, RF-37, RF-18.E7).
// Answers go through a pseudo-terminal; questions are matched by their stable text (plan "Contracts").
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { spawn, spawnSync } from 'node:child_process';
import { chmodSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, readlinkSync, rmSync, symlinkSync, writeFileSync, appendFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { isRoot, snapshot } from './rigorkit-fixture.mjs';
import { home, put, run, repo, has, testRemote, cloneAt, git, writeState, readState, now, envFor, pty, waitFor, NEED_PTY, RECORD, STATE, PTY } from './update-fixture.mjs';

const ROOT_SKIP = isRoot() && 'D4: running as root ignores permission bits';
const MAC_ONLY = process.platform === 'darwin' ? false : 'D4: chflags uchg needs macOS';
const SKIP = NEED_PTY || ROOT_SKIP;
const OLD_BLOCK = '# rigorkit:start\ncase ":$PATH:" in *":$HOME/.rigorkit/bin:"*) ;; *) export PATH="$PATH:$HOME/.rigorkit/bin" ;; esac\ncase ":${MANPATH-}:" in *":$HOME/.rigorkit/man:"*) ;; *) export MANPATH="${MANPATH-}:$HOME/.rigorkit/man" ;; esac\n# rigorkit:end\n';
const BLOCK = readFileSync(path.join(repo, 'lib/startup-block.txt'), 'utf8');

// Question texts (plan "Contracts").
const Q = {
  group: 'unedited global copies? [y/N]',
  rules: f => `Rewrite the rigorkit block in ${f}? [y/N]`,
  edited: p => `${p} was edited. Overwrite or keep? [o/k]`,
  pack: p => `Install new pack ${p} globally`,
  startup: f => `Rewrite the rigorkit startup block in ${f}? [y/N]`,
  old: 'old rigorkit scripts from',
};

// --- content mutators for test releases ----------------------------------------------------------
const skillFile = (dir, pack, name) => path.join(dir, 'packs', pack, 'skills', name, 'SKILL.md');
const changeSkill = (pack, name, text = '\nChanged in a test release.\n') => dir => appendFileSync(skillFile(dir, pack, name), text);
const changeRules = (text = '\nTest rule change.\n') => dir => appendFileSync(path.join(dir, 'packs/core/rules.md'), text);
const changeAgent = (pack, name) => dir => appendFileSync(path.join(dir, 'packs', pack, 'agents', `${name}.md`), '\nChanged agent.\n');
const addSkill = (pack, name) => dir => put(skillFile(dir, pack, name), `---\nname: ${name}\ndescription: 'Test skill.'\n---\nBody.\n`);
const addPack = (name, { broken = false } = {}) => dir => {
  put(skillFile(dir, name, `${name}-x`), `---\nname: ${name}-x\ndescription: 'Test pack skill.'\n---\nBody.\n`);
  if (broken) put(path.join(dir, 'packs', name, 'agents', 'bad.md'), '---\ntier: cheap\n---\nno name\n');
};
const removeSkill = (pack, name) => dir => rmSync(path.join(dir, 'packs', pack, 'skills', name), { recursive: true });
const all = (...fns) => dir => fns.forEach(f => f(dir));
const log = (v, { rules = 'unchanged', packs = 'none', extra = '' } = {}) => `## ${v}\nGlobal rules: ${rules}\nNew packs: ${packs}\n\nTest release ${v}.${extra}\n`;

// --- setup ----------------------------------------------------------------------------------------
// Clone at v<at>, optional global install (packs/agents) from it, then later releases [version, mutate, opts].
function setup(t, { at = '0.3.0', install = null, later = [['0.4.0']], before } = {}) {
  const h = home(t);
  const r = testRemote(t, h.root);
  r.release(at);
  const clone = cloneAt(h.HOME, r.bare, `v${at}`);
  const env = envFor(h);
  const s = { h, r, clone, env };
  s.install = (...args) => run('bash', [path.join(s.clone, 'install.sh'), ...args], { env, cwd: h.HOME });
  if (before) before(s);
  if (install) { const o = s.install('--global', '--pack', install.packs, '--agent', install.agents); assert.equal(o.status, 0, o.out); }
  for (const [v, mutate, opts] of later) r.release(v, mutate, opts);
  writeState(h.HOME, { checked: now(), newest: '' });
  return s;
}
const release = (s, v, mutate, opts) => s.r.release(v, mutate, opts);
// Interactive update: steps [[expect, answer], ...]; end of input after the last answer.
const upd = (s, steps = [], args = [], extra = {}) => pty(path.join(s.clone, 'bin/rigorkit'), ['update', ...args], { env: s.env, steps, eof: true, timeout: 90, ...extra });
const updNonTty = (s, args = []) => run(path.join(s.clone, 'bin/rigorkit'), ['update', ...args], { env: s.env, input: '' });
const version = s => readFileSync(path.join(s.clone, 'VERSION'), 'utf8').trim();
const head = s => git(s.clone, ['rev-parse', 'HEAD']);
const f = (s, rel) => path.join(s.h.HOME, rel);
const read = p => readFileSync(p, 'utf8');
const recordText = s => (existsSync(RECORD(s.h.HOME)) ? read(RECORD(s.h.HOME)) : null);
const recVersion = s => recordText(s)?.split('\n').find(l => l.startsWith('version\t'))?.split('\t')[1];
const recCopy = (s, p) => recordText(s)?.split('\n').map(l => l.split('\t')).find(x => x[0] === 'copy' && x[4] === p);
const officialSkill = (s, pack, name) => read(skillFile(s.clone, pack, name));
// Everything under HOME except the clone's git data (and, unless state = true, rigorkit's own state).
const homeSnap = (s, { state = true } = {}) => { const x = snapshot(s.h.HOME); for (const k of Object.keys(x)) if (k.startsWith('.rigorkit/.git') || (!state && k.startsWith('.local/state'))) delete x[k]; return x; };
const noEsc = o => assert.doesNotMatch(o.out, /\x1b/);
const asks = (o, text) => o.out.includes(text);
const mode = p => statSync(p).mode & 0o777;

// --- RF-10 / RF-11 ----------------------------------------------------------------------------------
test('RF-10.H1: clone 0.3.0, tag v0.4.0: clone at 0.4.0 and no newer version recorded', { skip: SKIP }, t => {
  const s = setup(t);
  const o = upd(s);
  assert.equal(o.status, 0, o.out);
  assert.equal(version(s), '0.4.0');
  assert.equal(git(s.clone, ['describe', '--tags', '--exact-match']), 'v0.4.0');
  const st = readState(s.h.HOME);
  assert.ok(!st.newest || st.newest === '0.4.0');
  assert.equal(existsSync(path.join(STATE(s.h.HOME), 'notice')), false);
});

test('RF-10.E1: tags v0.4.0 and v0.10.0: clone at 0.10.0', { skip: SKIP }, t => {
  const s = setup(t, { later: [['0.4.0'], ['0.10.0']] });
  assert.equal(upd(s).status, 0);
  assert.equal(version(s), '0.10.0');
});

test('RF-10.F1: remote unreachable: error naming the remote, clone unchanged, non-zero status', { skip: SKIP }, t => {
  const s = setup(t);
  git(s.clone, ['remote', 'set-url', 'origin', path.join(s.h.root, 'gone.git')]);
  const h0 = head(s);
  const o = upd(s);
  assert.notEqual(o.status, 0);
  assert.match(o.out, /gone\.git/);
  assert.equal(head(s), h0);
});

test('RF-10.S1: newest tag not descending from the clone: refused, clone and global scope unchanged', { skip: SKIP }, t => {
  const s = setup(t, { install: { packs: 'core', agents: 'claude' }, later: [] });
  git(s.r.work, ['checkout', '--quiet', '--orphan', 'other']);
  s.r.release('0.4.0');
  const h0 = head(s), before = homeSnap(s, { state: false });
  const o = upd(s);
  assert.notEqual(o.status, 0);
  assert.match(o.out, /descend/);
  assert.equal(head(s), h0);
  assert.deepEqual(homeSnap(s, { state: false }), before);
});

test('RF-11.H1: 0.3.0 → 0.4.0 shows the 0.4.0 changelog section', { skip: SKIP }, t => {
  const s = setup(t);
  assert.match(upd(s).out, /Test release 0\.4\.0\./);
});

test('RF-11.E1: 0.3.0 → 0.6.0 shows 0.4.0, 0.5.0, 0.6.0 in order and nothing older', { skip: SKIP }, t => {
  const s = setup(t, { later: [['0.4.0'], ['0.5.0'], ['0.6.0']] });
  const o = upd(s).out;
  const i = ['0.4.0', '0.5.0', '0.6.0'].map(v => o.indexOf(`Test release ${v}.`));
  assert.ok(i[0] >= 0 && i[0] < i[1] && i[1] < i[2], o);
  assert.doesNotMatch(o, /Test release 0\.3\.0\./);
});

test('RF-11.F1: a missing 0.5.0 section is reported and the update continues', { skip: SKIP }, t => {
  const s = setup(t, { later: [['0.4.0'], ['0.5.0', undefined, { changelog: '' }], ['0.6.0']] });
  const o = upd(s);
  assert.match(o.out, /no changelog entry for 0\.5\.0/);
  assert.equal(version(s), '0.6.0');
});

test('RF-11.S1: an escape sequence in a changelog section is printed safely', { skip: SKIP }, t => {
  const s = setup(t, { later: [['0.4.0', undefined, { changelog: log('0.4.0', { extra: '\nevil \x1b[2J\x1b]0;title\x07 end' }) }]] });
  const o = upd(s);
  noEsc(o);
  assert.match(o.out, /evil \?\[2J\?\]0;title\? end/);
});

// --- RF-13 -------------------------------------------------------------------------------------------
test('RF-13.H1: an edited tracked file: refused, listed, custom area suggested', { skip: SKIP }, t => {
  const s = setup(t);
  appendFileSync(path.join(s.clone, 'install.sh'), '# mine\n');
  const h0 = head(s);
  const o = upd(s);
  assert.notEqual(o.status, 0);
  assert.match(o.out, /local changes/);
  assert.match(o.out, /^\s*install\.sh$/m);
  assert.match(o.out, /custom/);
  assert.equal(head(s), h0);
});

test('RF-13.E1: only custom/, git-ignored files or a lost execute bit: the update proceeds', { skip: SKIP }, t => {
  const s = setup(t);
  put(path.join(s.clone, 'custom/scripts/mine'), '#!/bin/sh\n', 0o755);
  put(path.join(s.clone, '.DS_Store'), 'x');
  chmodSync(path.join(s.clone, 'packs/core/scripts/test-summary'), 0o644);
  const o = upd(s);
  assert.equal(o.status, 0, o.out);
  assert.equal(version(s), '0.4.0');
});

test('RF-13.E2: --dry-run with an edited tracked file gives the same refusal', { skip: SKIP }, t => {
  const s = setup(t);
  appendFileSync(path.join(s.clone, 'install.sh'), '# mine\n');
  const o = upd(s, [], ['--dry-run']);
  assert.notEqual(o.status, 0);
  assert.match(o.out, /local changes/);
  assert.match(o.out, /^\s*install\.sh$/m);
});

test('RF-13.E3: a lost execute bit on a script the new tag changes: bit restored, clone moved, one line', { skip: SKIP }, t => {
  const s = setup(t, { later: [['0.4.0', d => appendFileSync(path.join(d, 'packs/core/scripts/test-summary'), '# changed\n')]] });
  chmodSync(path.join(s.clone, 'packs/core/scripts/test-summary'), 0o644);
  const o = upd(s);
  assert.equal(o.status, 0, o.out);
  assert.equal(version(s), '0.4.0');
  assert.ok(mode(path.join(s.clone, 'packs/core/scripts/test-summary')) & 0o100);
  assert.equal(o.out.split('\n').filter(l => /made executable/.test(l)).length, 1);
});

test('RF-13.F1: an untracked file packs/mine/x: refused listing it', { skip: SKIP }, t => {
  const s = setup(t);
  put(path.join(s.clone, 'packs/mine/x'), 'x');
  const o = upd(s);
  assert.notEqual(o.status, 0);
  assert.match(o.out, /packs\/mine\/x/);
});

test('RF-13.S1: a refusal changes no file in the clone or the global scope', { skip: SKIP }, t => {
  const s = setup(t, { install: { packs: 'core', agents: 'claude' } });
  appendFileSync(path.join(s.clone, 'install.sh'), '# mine\n');
  const before = homeSnap(s, { state: false });
  upd(s);
  assert.deepEqual(homeSnap(s, { state: false }), before);
});

// --- RF-14 -------------------------------------------------------------------------------------------
test('RF-14.H1: --dry-run lists changelog, questions and diffs, asks nothing and writes nothing outside .git', { skip: SKIP }, t => {
  const s = setup(t, { install: { packs: 'core,sdd', agents: 'claude' }, later: [['0.4.0', all(changeSkill('sdd', 'sdd-spec'), changeRules()), { changelog: log('0.4.0', { rules: 'changed' }) }]] });
  appendFileSync(f(s, '.claude/skills/sdd-spec/SKILL.md'), '\nmy edit\n');
  const before = homeSnap(s);
  const o = upd(s, [], ['--dry-run']);
  assert.equal(o.status, 0, o.out);
  assert.match(o.out, /Test release 0\.4\.0\./);
  assert.match(o.out, /would ask: .*CLAUDE\.md/);
  assert.match(o.out, /would ask: .*sdd-spec/);
  assert.match(o.out, /^\s*\+.*Test rule change\./m);
  assert.doesNotMatch(o.out, /\[y\/N\]|\[o\/k\]/);
  assert.deepEqual(homeSnap(s), before);
});

test('RF-14.E1: --dry-run with nothing to do says so', { skip: SKIP }, t => {
  const s = setup(t, { install: { packs: 'core', agents: 'claude' }, later: [] });
  assert.match(upd(s, [], ['--dry-run']).out, /nothing to do/);
});

test('RF-14.F1: --dry-run with the remote unreachable: error naming it, nothing changed', { skip: SKIP }, t => {
  const s = setup(t);
  git(s.clone, ['remote', 'set-url', 'origin', path.join(s.h.root, 'gone.git')]);
  const before = homeSnap(s);
  const o = upd(s, [], ['--dry-run']);
  assert.notEqual(o.status, 0);
  assert.match(o.out, /gone\.git/);
  assert.deepEqual(homeSnap(s), before);
});

test('RF-14.S1: --dry-run prints escape sequences from the fetched tag safely and writes nothing', { skip: SKIP }, t => {
  const s = setup(t, { install: { packs: 'sdd', agents: 'claude' }, later: [['0.4.0', changeSkill('sdd', 'sdd-spec', '\nbad \x1b[31m red\n'), { changelog: log('0.4.0', { extra: '\n\x1b[2J' }) }]] });
  const before = homeSnap(s);
  const o = upd(s, [], ['--dry-run']);
  noEsc(o);
  assert.deepEqual(homeSnap(s), before);
});

// --- RF-15 / RF-16 / RF-37 ----------------------------------------------------------------------------
test('RF-15.H1: tag v0.4.0 declaring 0.4.0 proceeds', { skip: SKIP }, t => {
  const s = setup(t);
  assert.equal(upd(s).status, 0);
  assert.equal(version(s), '0.4.0');
});

test('RF-15.E1: VERSION 0.4.0 with CRLF and a trailing newline proceeds', { skip: SKIP }, t => {
  const s = setup(t, { later: [['0.4.0', d => writeFileSync(path.join(d, 'VERSION'), '0.4.0\r\n\n')]] });
  assert.equal(upd(s).status, 0);
  assert.equal(git(s.clone, ['describe', '--tags', '--exact-match']), 'v0.4.0');
});

test('RF-15.F1: tag v0.4.0 declaring 0.3.9: refused naming both, clone unchanged', { skip: SKIP }, t => {
  const s = setup(t, { later: [['0.3.9', undefined, { tag: 'v0.4.0' }]] });
  const h0 = head(s);
  const o = upd(s);
  assert.notEqual(o.status, 0);
  assert.match(o.out, /0\.4\.0/);
  assert.match(o.out, /0\.3\.9/);
  assert.equal(head(s), h0);
});

test('RF-15.S1: a VERSION with an escape sequence or 1 MB of text: refused as invalid, content not printed', { skip: SKIP }, t => {
  for (const bad of ['0.4.0\x1b[31m', 'x'.repeat(1024 * 1024)]) {
    const s = setup(t, { later: [['0.4.0', d => writeFileSync(path.join(d, 'VERSION'), bad)]] });
    const o = upd(s);
    assert.notEqual(o.status, 0);
    assert.match(o.out, /invalid/);
    noEsc(o);
    assert.ok(o.out.length < 5000, 'content not printed');
  }
});

test('RF-16.H1: clone at the newest release and record current: up to date, nothing written', { skip: SKIP }, t => {
  const s = setup(t, { install: { packs: 'core', agents: 'claude' }, later: [] });
  const before = homeSnap(s, { state: false });
  const o = upd(s);
  assert.equal(o.status, 0, o.out);
  assert.match(o.out, /up to date/);
  assert.deepEqual(homeSnap(s, { state: false }), before);
});

test('RF-16.E1: clone 0.5.0 ahead of the newest tag 0.4.0: says it is newer, not moved', { skip: SKIP }, t => {
  const h = home(t);
  const r = testRemote(t, h.root);
  r.release('0.4.0'); r.release('0.5.0', undefined, { tag: null });
  const clone = cloneAt(h.HOME, r.bare, 'main');
  const s = { h, r, clone, env: envFor(h) };
  const h0 = head(s);
  const o = upd(s);
  assert.match(o.out, /newer/);
  assert.equal(head(s), h0);
});

test('RF-16.E2: clone up to date but a refresh question answered no last time: asked again', { skip: SKIP }, t => {
  const s = setup(t, { install: { packs: 'sdd', agents: 'claude' }, later: [['0.4.0', changeSkill('sdd', 'sdd-spec')]] });
  upd(s, [[Q.group, 'n']]);
  const h0 = head(s);
  const o = upd(s, [[Q.group, 'n']]);
  assert.equal(head(s), h0);
  assert.ok(asks(o, Q.group), o.out);
});

test('RF-16.F1: remote unreachable with a pending refresh and an old block: error, non-zero, no questions', { skip: SKIP }, t => {
  const s = setup(t, { install: { packs: 'sdd', agents: 'claude' }, later: [['0.4.0', changeSkill('sdd', 'sdd-spec')]] });
  upd(s, [[Q.group, 'n']]);
  put(f(s, '.zshrc'), OLD_BLOCK);
  git(s.clone, ['remote', 'set-url', 'origin', path.join(s.h.root, 'gone.git')]);
  const o = upd(s);
  assert.notEqual(o.status, 0);
  assert.match(o.out, /gone\.git/);
  assert.ok(!asks(o, '[y/N]'), o.out);
});

test('RF-37.H1: git cannot write a file the new tag changes: clone at its previous commit, error, non-zero, no questions', { skip: SKIP }, t => {
  const s = setup(t, { later: [['0.4.0', d => appendFileSync(path.join(d, 'packs/core/scripts/test-summary'), '# changed\n')]] });
  put(f(s, '.zshrc'), OLD_BLOCK);
  const dir = path.join(s.clone, 'packs/core/scripts');
  chmodSync(dir, 0o555);
  t.after(() => chmodSync(dir, 0o755));
  const h0 = head(s);
  const o = upd(s);
  assert.notEqual(o.status, 0);
  assert.equal(head(s), h0);
  assert.equal(version(s), '0.3.0');
  assert.ok(!asks(o, '[y/N]'), o.out);
});

test('RF-37.E1: another git process holds the index lock: same as H1', { skip: SKIP }, t => {
  const s = setup(t);
  put(path.join(s.clone, '.git/index.lock'), '');
  const h0 = head(s);
  const o = upd(s);
  assert.notEqual(o.status, 0);
  assert.equal(head(s), h0);
  assert.match(o.out, /index\.lock/);
});

test('RF-37.F1: a git error is printed safely', { skip: SKIP }, t => {
  const s = setup(t);
  put(path.join(s.clone, '.git/index.lock'), '');
  const o = upd(s);
  assert.notEqual(o.status, 0);
  assert.match(o.out, /index\.lock/);
  noEsc(o);
});

// --- RF-17 -------------------------------------------------------------------------------------------
test('RF-17.H1: an old .zshrc block is rewritten on yes, with a backup and the rest byte-equal', { skip: SKIP }, t => {
  const s = setup(t);
  const user = 'export A=1\n', tail = 'alias x=y\n';
  put(f(s, '.zshrc'), user + OLD_BLOCK + tail, 0o600);
  const o = upd(s, [[Q.startup(f(s, '.zshrc')), 'y']]);
  assert.equal(o.status, 0, o.out);
  assert.equal(read(f(s, '.zshrc')), user + BLOCK + tail);
  assert.equal(read(f(s, '.zshrc.rigorkit.bak')), user + OLD_BLOCK + tail);
});

test('RF-17.E1: yes for .zshrc, no for .bashrc: only .zshrc rewritten; .bashrc asked again next time', { skip: SKIP }, t => {
  const s = setup(t);
  put(f(s, '.zshrc'), OLD_BLOCK); put(f(s, '.bashrc'), OLD_BLOCK);
  upd(s, [[Q.startup(f(s, '.zshrc')), 'y'], [Q.startup(f(s, '.bashrc')), 'n']]);
  assert.equal(read(f(s, '.zshrc')), BLOCK);
  assert.equal(read(f(s, '.bashrc')), OLD_BLOCK);
  const again = upd(s, [[Q.startup(f(s, '.bashrc')), 'n']]);
  assert.ok(asks(again, Q.startup(f(s, '.bashrc'))));
  assert.ok(!asks(again, Q.startup(f(s, '.zshrc'))));
});

test('RF-17.E2: a current block is not asked about', { skip: SKIP }, t => {
  const s = setup(t);
  put(f(s, '.zshrc'), BLOCK);
  assert.ok(!asks(upd(s), 'startup block'));
  assert.equal(version(s), '0.4.0');
});

test('RF-17.E3: no global record and an old block: the block is rewritten, the global scope unchanged', { skip: SKIP }, t => {
  const s = setup(t);
  put(f(s, '.rigorkit-version'), '0.2.0\n');
  put(f(s, '.claude/skills/x/SKILL.md'), 'old\n');
  put(f(s, '.zshrc'), OLD_BLOCK);
  upd(s, [[Q.startup(f(s, '.zshrc')), 'y']]);
  assert.equal(read(f(s, '.zshrc')), BLOCK);
  assert.equal(read(f(s, '.claude/skills/x/SKILL.md')), 'old\n');
});

test('RF-17.F1: a start marker without its end marker: that file skipped and reported, the rest continues', { skip: SKIP }, t => {
  const s = setup(t);
  put(f(s, '.zshrc'), '# rigorkit:start\nexport A=1\n'); put(f(s, '.bashrc'), OLD_BLOCK);
  const o = upd(s, [[Q.startup(f(s, '.bashrc')), 'y']]);
  assert.match(o.out, /\.zshrc.*without.*end|end marker.*\.zshrc/);
  assert.equal(read(f(s, '.zshrc')), '# rigorkit:start\nexport A=1\n');
  assert.equal(read(f(s, '.bashrc')), BLOCK);
});

test('RF-17.S1: a symbolic-link .zshrc: diff printed safely, link kept, target rewritten and backed up with its mode', { skip: SKIP }, t => {
  const s = setup(t);
  const target = f(s, 'dotfiles/zshrc');
  const old = OLD_BLOCK.replace('# rigorkit:end', '# \x1b[31mred\n# rigorkit:end');
  put(target, old, 0o600);
  symlinkSync(target, f(s, '.zshrc'));
  const o = upd(s, [[Q.startup(f(s, '.zshrc')), 'y']]);
  noEsc(o);
  assert.ok(lstatSync(f(s, '.zshrc')).isSymbolicLink());
  assert.equal(read(target), BLOCK);
  assert.equal(read(`${target}.rigorkit.bak`), old);
  assert.equal(mode(`${target}.rigorkit.bak`), 0o600);
});

// --- RF-30 / RF-32 -----------------------------------------------------------------------------------
test('RF-30.H1: non-interactive update moves the clone, writes no global or startup file and lists the skipped items', { skip: ROOT_SKIP }, t => {
  const s = setup(t, { install: { packs: 'core', agents: 'claude' }, later: [['0.4.0', changeRules(), { changelog: log('0.4.0', { rules: 'changed' }) }]] });
  put(f(s, '.zshrc'), OLD_BLOCK);
  const claude = read(f(s, '.claude/CLAUDE.md'));
  const o = updNonTty(s);
  assert.equal(o.status, 0, o.out);
  assert.equal(version(s), '0.4.0');
  assert.equal(read(f(s, '.claude/CLAUDE.md')), claude);
  assert.equal(read(f(s, '.zshrc')), OLD_BLOCK);
  assert.match(o.out, /skipped/);
  assert.match(o.out, /CLAUDE\.md/);
  assert.match(o.out, /\.zshrc/);
});

test('RF-30.E1: non-interactive update with nothing to ask: clone moved, no skipped list', { skip: ROOT_SKIP }, t => {
  const s = setup(t);
  const o = updNonTty(s);
  assert.equal(version(s), '0.4.0');
  assert.doesNotMatch(o.out, /skipped/);
});

test('RF-30.S1: an agent running rigorkit update writes no global file', { skip: ROOT_SKIP }, t => {
  const s = setup(t, { install: { packs: 'core,sdd', agents: 'claude' }, later: [['0.4.0', all(changeRules(), changeSkill('sdd', 'sdd-spec'), addPack('backend')), { changelog: log('0.4.0', { rules: 'changed', packs: 'backend' }) }]] });
  appendFileSync(f(s, '.claude/skills/sdd-plan/SKILL.md'), 'edit\n');
  const before = snapshot(f(s, '.claude'));
  updNonTty(s);
  assert.equal(version(s), '0.4.0');
  assert.deepEqual(snapshot(f(s, '.claude')), before);
});

const exited = c => new Promise(res => (c.exitCode !== null || c.signalCode !== null ? res() : c.on('exit', () => res())));
test('RF-32.H1: a second update while one waits for an answer: refused, nothing changed', { skip: SKIP }, async t => {
  const s = setup(t, { install: { packs: 'sdd', agents: 'claude' }, later: [['0.4.0', changeSkill('sdd', 'sdd-spec')]] });
  const first = spawn('python3', [PTY, '--timeout', '60', '--', path.join(s.clone, 'bin/rigorkit'), 'update'], { env: { ...process.env, ...s.env }, stdio: 'ignore' });
  t.after(() => first.kill('SIGKILL'));
  const lock = path.join(STATE(s.h.HOME), 'update.lock');
  for (let i = 0; i < 200 && !existsSync(lock); i++) await new Promise(r => setTimeout(r, 100));
  assert.ok(existsSync(lock), 'first update holds the lock');
  await new Promise(r => setTimeout(r, 1500));
  const claude = snapshot(f(s, '.claude'));
  const o = upd(s);
  assert.notEqual(o.status, 0);
  assert.match(o.out, /another rigorkit update is running/);
  assert.deepEqual(snapshot(f(s, '.claude')), claude);
  first.kill('SIGKILL');
  await exited(first);
});

test('RF-32.E1: a stale lock left by a killed update is detected and the update proceeds', { skip: SKIP }, t => {
  const s = setup(t);
  const dead = spawnSync('sh', ['-c', 'echo $$']).stdout.toString().trim();
  put(path.join(STATE(s.h.HOME), 'update.lock/pid'), `${dead}\n`);
  const o = upd(s);
  assert.equal(o.status, 0, o.out);
  assert.equal(version(s), '0.4.0');
});

test('RF-32.S1: two updates answering yes at once: at most one moves the clone or writes global files', { skip: SKIP }, async t => {
  const s = setup(t, { install: { packs: 'sdd', agents: 'claude' }, later: [['0.4.0', changeSkill('sdd', 'sdd-spec')]] });
  const args = ['--expect', Q.group, '--send', 'y', '--eof', '--timeout', '60', '--', path.join(s.clone, 'bin/rigorkit'), 'update'];
  const kids = [0, 1].map(() => spawn('python3', [PTY, ...args], { env: { ...process.env, ...s.env } }));
  const outs = kids.map(c => { const o = { text: '' }; c.stdout.on('data', d => { o.text += d; }); return o; });
  t.after(() => kids.forEach(c => c.kill('SIGKILL')));
  await Promise.all(kids.map(exited));
  const refused = outs.filter(o => /another rigorkit update is running/.test(o.text)).length;
  const asked = outs.filter(o => o.text.includes(Q.group)).length;
  assert.ok(asked <= 1, outs.map(o => o.text).join('\n----\n'));
  assert.ok(refused + asked >= 1);
  assert.equal(version(s), '0.4.0');
});

// --- RF-19 -------------------------------------------------------------------------------------------
const changed = () => [['0.4.0', all(changeSkill('sdd', 'sdd-spec'), changeRules()), { changelog: log('0.4.0', { rules: 'changed' }) }]];

test('RF-19.H1: all refresh questions answered yes: recorded global version 0.4.0', { skip: SKIP }, t => {
  const s = setup(t, { install: { packs: 'core,sdd', agents: 'claude' }, later: changed() });
  const o = upd(s, [[Q.group, 'y'], [Q.rules(f(s, '.claude/CLAUDE.md')), 'y']]);
  assert.equal(o.status, 0, o.out);
  assert.equal(recVersion(s), '0.4.0');
});

test('RF-19.E1: one question answered no: recorded global version stays 0.3.0', { skip: SKIP }, t => {
  const s = setup(t, { install: { packs: 'core,sdd', agents: 'claude' }, later: changed() });
  upd(s, [[Q.group, 'y'], [Q.rules(f(s, '.claude/CLAUDE.md')), 'n']]);
  assert.equal(recVersion(s), '0.3.0');
});

test('RF-19.E2: the only question is an edited copy answered keep: version 0.4.0, the next update asks nothing', { skip: SKIP }, t => {
  const s = setup(t, { install: { packs: 'sdd', agents: 'claude' }, later: [['0.4.0', changeSkill('sdd', 'sdd-spec')]] });
  const p = f(s, '.claude/skills/sdd-spec');
  appendFileSync(path.join(p, 'SKILL.md'), '\nmine\n');
  upd(s, [[Q.edited(p), 'k']]);
  assert.equal(recVersion(s), '0.4.0');
  assert.ok(!asks(upd(s), '[o/k]'));
});

test('RF-19.F1: one item fails to write: error for it, the others continue, version unchanged', { skip: SKIP }, t => {
  const s = setup(t, { install: { packs: 'core,sdd', agents: 'claude' }, later: changed() });
  const skills = f(s, '.claude/skills');
  chmodSync(skills, 0o555);
  t.after(() => chmodSync(skills, 0o755));
  const o = upd(s, [[Q.group, 'y'], [Q.rules(f(s, '.claude/CLAUDE.md')), 'y']]);
  assert.match(o.out, /sdd-spec/);
  assert.match(read(f(s, '.claude/CLAUDE.md')), /Test rule change\./);
  assert.equal(recVersion(s), '0.3.0');
});

test('RF-19.S1: project scopes are never changed by the update', { skip: SKIP }, t => {
  const proj = { dir: null };
  const s = setup(t, {
    install: { packs: 'sdd', agents: 'claude' }, later: [['0.4.0', changeSkill('sdd', 'sdd-spec')]],
    before: x => { proj.dir = path.join(x.h.root, 'proj'); mkdirSync(proj.dir); assert.equal(x.install('--pack', 'sdd', '--agent', 'claude', '--project', proj.dir).status, 0); },
  });
  const before = snapshot(proj.dir);
  upd(s, [[Q.group, 'y']]);
  assert.deepEqual(snapshot(proj.dir), before);
});

// --- RF-20 -------------------------------------------------------------------------------------------
test('RF-20.H1: an unedited changed sdd-spec: one question naming 1 copy; yes rewrites it and its fingerprint', { skip: SKIP }, t => {
  const s = setup(t, { install: { packs: 'sdd', agents: 'claude' }, later: [['0.4.0', changeSkill('sdd', 'sdd-spec')]] });
  const p = f(s, '.claude/skills/sdd-spec'), fp0 = recCopy(s, p)[5];
  const o = upd(s, [[Q.group, 'y']]);
  assert.match(o.out, /Update 1 unedited global copies\?/);
  assert.equal(read(path.join(p, 'SKILL.md')), officialSkill(s, 'sdd', 'sdd-spec'));
  assert.notEqual(recCopy(s, p)[5], fp0);
});

test('RF-20.E1: answer no: nothing written, asked again next update', { skip: SKIP }, t => {
  const s = setup(t, { install: { packs: 'sdd', agents: 'claude' }, later: [['0.4.0', changeSkill('sdd', 'sdd-spec')]] });
  const before = snapshot(f(s, '.claude'));
  assert.ok(asks(upd(s, [[Q.group, 'n']]), Q.group));
  assert.deepEqual(snapshot(f(s, '.claude')), before);
  assert.ok(asks(upd(s, [[Q.group, 'n']]), Q.group));
});

test('RF-20.E2: no unedited copy changes: no group question', { skip: SKIP }, t => {
  const s = setup(t, { install: { packs: 'sdd', agents: 'claude' } });
  assert.ok(!asks(upd(s), Q.group));
  assert.equal(version(s), '0.4.0');
});

test('RF-20.E3: a new skill in sdd with pairs sdd/claude and core/codex: written for claude only and recorded', { skip: SKIP }, t => {
  const s = setup(t, { later: [['0.4.0', addSkill('sdd', 'sdd-new')]], before: x => {
    assert.equal(x.install('--global', '--pack', 'sdd', '--agent', 'claude').status, 0);
    assert.equal(x.install('--global', '--pack', 'core', '--agent', 'codex').status, 0);
  } });
  const o = upd(s, [[Q.group, 'y']]);
  assert.match(o.out, /Update 1 unedited global copies\?/);
  assert.ok(existsSync(f(s, '.claude/skills/sdd-new/SKILL.md')));
  assert.equal(existsSync(f(s, '.agents/skills/sdd-new')), false);
  assert.ok(recCopy(s, f(s, '.claude/skills/sdd-new')));
});

test('RF-20.F1: an unwritable global folder: error for that copy, the others written, its fingerprint unchanged', { skip: SKIP }, t => {
  const s = setup(t, { install: { packs: 'sdd', agents: 'claude' }, later: [['0.4.0', all(changeSkill('sdd', 'sdd-spec'), changeAgent('sdd', 'sdd-reviewer'))]] });
  const p = f(s, '.claude/skills/sdd-spec'), fp0 = recCopy(s, p)[5];
  chmodSync(f(s, '.claude/skills'), 0o555);
  t.after(() => chmodSync(f(s, '.claude/skills'), 0o755));
  const o = upd(s, [[Q.group, 'y']]);
  assert.match(o.out, /sdd-spec/);
  assert.match(read(f(s, '.claude/agents/sdd-reviewer.md')), /Changed agent\./);
  assert.equal(recCopy(s, p)[5], fp0);
});

test('RF-20.S1: the group yes never writes an edited copy', { skip: SKIP }, t => {
  const s = setup(t, { install: { packs: 'sdd', agents: 'claude' }, later: [['0.4.0', all(changeSkill('sdd', 'sdd-spec'), changeSkill('sdd', 'sdd-plan'))]] });
  appendFileSync(f(s, '.claude/skills/sdd-plan/SKILL.md'), '\nmine\n');
  const mine = read(f(s, '.claude/skills/sdd-plan/SKILL.md'));
  assert.ok(asks(upd(s, [[Q.group, 'y']]), Q.group));
  assert.equal(read(f(s, '.claude/skills/sdd-plan/SKILL.md')), mine);
});

test('RF-20.S2: a new skill whose path holds a user folder or a link is asked individually with its diff', { skip: SKIP }, t => {
  for (const kind of ['folder', 'link']) {
    const s = setup(t, { install: { packs: 'sdd', agents: 'claude' }, later: [['0.4.0', addSkill('sdd', 'sdd-new')]] });
    const p = f(s, '.claude/skills/sdd-new');
    if (kind === 'folder') put(path.join(p, 'SKILL.md'), 'user content\n');
    else { put(f(s, 'elsewhere/SKILL.md'), 'user content\n'); symlinkSync(f(s, 'elsewhere'), p); }
    const o = upd(s);
    assert.ok(!asks(o, Q.group), kind);
    assert.ok(asks(o, Q.edited(p)), kind);
    assert.match(o.out, /user content/);
  }
});

// --- RF-21 -------------------------------------------------------------------------------------------
test('RF-21.H1: yes for CLAUDE.md, no for codex: Claude block rewritten with backup, Codex byte-equal and pending', { skip: SKIP }, t => {
  const s = setup(t, { install: { packs: 'core', agents: 'claude,codex' }, later: [['0.4.0', changeRules(), { changelog: log('0.4.0', { rules: 'changed' }) }]] });
  const codex = read(f(s, '.codex/AGENTS.md')), claude = read(f(s, '.claude/CLAUDE.md'));
  const o = upd(s, [[Q.rules(f(s, '.claude/CLAUDE.md')), 'y'], [Q.rules(f(s, '.codex/AGENTS.md')), 'n']]);
  assert.match(read(f(s, '.claude/CLAUDE.md')), /Test rule change\./);
  assert.equal(read(f(s, '.claude/CLAUDE.md.rigorkit.bak')), claude);
  assert.equal(read(f(s, '.codex/AGENTS.md')), codex);
  assert.match(o.out, /pending.*AGENTS\.md|AGENTS\.md.*pending/s);
});

test('RF-21.E1: a rules block equal to the new block is not asked about', { skip: SKIP }, t => {
  const s = setup(t, { install: { packs: 'core', agents: 'claude' } });
  assert.ok(!asks(upd(s), 'Rewrite the rigorkit block'));
  assert.equal(version(s), '0.4.0');
});

test('RF-21.E2: user text inside the block: diff of the edited block against the new one, same question', { skip: SKIP }, t => {
  const s = setup(t, { install: { packs: 'core', agents: 'claude' }, later: [['0.4.0', changeRules()]] });
  const file = f(s, '.claude/CLAUDE.md');
  writeFileSync(file, read(file).replace('<!-- rigorkit:core:end -->', 'my inside line\n<!-- rigorkit:core:end -->'));
  const o = upd(s, [[Q.rules(file), 'n']]);
  assert.match(o.out, /^\s*-my inside line/m);
  assert.ok(asks(o, Q.rules(file)));
});

test('RF-21.E3: a deleted block is offered; yes adds it back with a backup', { skip: SKIP }, t => {
  const s = setup(t, { install: { packs: 'core', agents: 'claude' } });
  const file = f(s, '.claude/CLAUDE.md');
  writeFileSync(file, 'only mine\n');
  upd(s, [[Q.rules(file), 'y']]);
  assert.match(read(file), /^only mine\n/);
  assert.match(read(file), /rigorkit:core:start/);
  assert.equal(read(`${file}.rigorkit.bak`), 'only mine\n');
});

test('RF-21.F1: a start marker without its end: file skipped and reported, others continue', { skip: SKIP }, t => {
  const s = setup(t, { install: { packs: 'core', agents: 'claude,codex' }, later: [['0.4.0', changeRules()]] });
  const file = f(s, '.claude/CLAUDE.md');
  writeFileSync(file, read(file).replace('<!-- rigorkit:core:end -->\n', ''));
  const broken = read(file);
  const o = upd(s, [[Q.rules(f(s, '.codex/AGENTS.md')), 'y']]);
  assert.match(o.out, /CLAUDE\.md/);
  assert.equal(read(file), broken);
  assert.match(read(f(s, '.codex/AGENTS.md')), /Test rule change\./);
});

test('RF-21.S1: text outside the markers byte-equal, backup mode kept, diff printed safely', { skip: SKIP }, t => {
  const s = setup(t, { install: { packs: 'core', agents: 'claude' }, later: [['0.4.0', changeRules()]] });
  const file = f(s, '.claude/CLAUDE.md');
  const withUser = `before\n${read(file).replace('<!-- rigorkit:core:end -->', 'esc \x1b[31m\n<!-- rigorkit:core:end -->')}after\n`;
  writeFileSync(file, withUser); chmodSync(file, 0o600);
  const o = upd(s, [[Q.rules(file), 'y']]);
  noEsc(o);
  const now_ = read(file);
  assert.ok(now_.startsWith('before\n') && now_.endsWith('after\n'));
  assert.equal(mode(`${file}.rigorkit.bak`), 0o600);
});

// --- RF-22 / RF-18.E7 ---------------------------------------------------------------------------------
function edited(t, later = [['0.4.0', changeSkill('sdd', 'sdd-spec')]]) {
  const s = setup(t, { install: { packs: 'sdd', agents: 'claude' }, later });
  s.p = f(s, '.claude/skills/sdd-spec');
  appendFileSync(path.join(s.p, 'SKILL.md'), '\nmy edit\n');
  s.mine = read(path.join(s.p, 'SKILL.md'));
  return s;
}

test('RF-22.H1: an edited sdd-spec: diff shown; overwrite rewrites it and its fingerprint', { skip: SKIP }, t => {
  const s = edited(t);
  const fp0 = recCopy(s, s.p)[5];
  const o = upd(s, [[Q.edited(s.p), 'o']]);
  assert.match(o.out, /my edit/);
  assert.equal(read(path.join(s.p, 'SKILL.md')), officialSkill(s, 'sdd', 'sdd-spec'));
  assert.notEqual(recCopy(s, s.p)[5], fp0);
});

test('RF-22.E1: keep leaves the copy byte-equal; a second update without a new change does not ask', { skip: SKIP }, t => {
  const s = edited(t);
  assert.ok(asks(upd(s, [[Q.edited(s.p), 'k']]), Q.edited(s.p)));
  assert.equal(read(path.join(s.p, 'SKILL.md')), s.mine);
  assert.ok(!asks(upd(s), Q.edited(s.p)));
});

test('RF-22.E2: an edited copy whose official content did not change is not asked', { skip: SKIP }, t => {
  const s = edited(t, [['0.4.0']]);
  assert.ok(!asks(upd(s), Q.edited(s.p)));
  assert.equal(version(s), '0.4.0');
});

test('RF-22.E3: only line endings or trailing spaces differ: treated as unedited', { skip: SKIP }, t => {
  const s = setup(t, { install: { packs: 'sdd', agents: 'claude' }, later: [['0.4.0', changeSkill('sdd', 'sdd-spec')]] });
  const file = f(s, '.claude/skills/sdd-spec/SKILL.md');
  writeFileSync(file, read(file).split('\n').map(l => `${l}  `).join('\r\n'));
  const o = upd(s, [[Q.group, 'y']]);
  assert.match(o.out, /Update 1 unedited global copies\?/);
  assert.equal(read(file), officialSkill(s, 'sdd', 'sdd-spec'));
});

test('RF-22.E4: a copy recorded without fingerprint and differing from the clone is asked', { skip: SKIP }, t => {
  const s = setup(t, { install: { packs: 'sdd', agents: 'claude' }, later: [['0.4.0']], before: x => put(f(x, '.claude/skills/sdd-spec/SKILL.md'), 'pre-existing\n') });
  assert.equal(recCopy(s, f(s, '.claude/skills/sdd-spec'))[5], '-');
  assert.ok(asks(upd(s), Q.edited(f(s, '.claude/skills/sdd-spec'))));
});

test('RF-22.E5: a copy kept at 0.4.0 is asked again when 0.5.0 changes it again', { skip: SKIP }, t => {
  const s = edited(t);
  upd(s, [[Q.edited(s.p), 'k']]);
  release(s, '0.5.0', all(changeSkill('sdd', 'sdd-spec'), changeSkill('sdd', 'sdd-spec', '\nAgain.\n')));
  assert.ok(asks(upd(s, [[Q.edited(s.p), 'k']]), Q.edited(s.p)));
});

test('RF-22.E6: a non-interactive run records nothing for an edited copy; the next interactive run asks', { skip: SKIP }, t => {
  const s = edited(t);
  const before = recCopy(s, s.p).join('\t');
  updNonTty(s);
  assert.equal(recCopy(s, s.p).join('\t'), before);
  assert.ok(asks(upd(s), Q.edited(s.p)));
});

test('RF-22.F1: a failed overwrite leaves the copy and its fingerprint as they were', { skip: SKIP }, t => {
  const s = edited(t);
  const fp0 = recCopy(s, s.p)[5];
  chmodSync(f(s, '.claude/skills'), 0o555);
  t.after(() => chmodSync(f(s, '.claude/skills'), 0o755));
  const o = upd(s, [[Q.edited(s.p), 'o']]);
  assert.match(o.out, /sdd-spec/);
  assert.equal(read(path.join(s.p, 'SKILL.md')), s.mine);
  assert.equal(recCopy(s, s.p)[5], fp0);
});

test('RF-22.S1: a non-interactive update keeps an edited copy byte-equal', { skip: ROOT_SKIP }, t => {
  const s = edited(t);
  updNonTty(s);
  assert.equal(version(s), '0.4.0');
  assert.equal(read(path.join(s.p, 'SKILL.md')), s.mine);
});

test('RF-22.S2: a skill path that is a link out of the agent folder is replaced by a folder; the target is untouched', { skip: SKIP }, t => {
  const s = setup(t, { install: { packs: 'sdd', agents: 'claude' }, later: [['0.4.0', changeSkill('sdd', 'sdd-spec')]] });
  const p = f(s, '.claude/skills/sdd-spec'), out = f(s, 'outside/sdd-spec');
  mkdirSync(path.dirname(out), { recursive: true });
  run('cp', ['-R', p, out]);
  appendFileSync(path.join(out, 'SKILL.md'), 'outside\n');
  rmSync(p, { recursive: true }); symlinkSync(out, p);
  const target = snapshot(out);
  upd(s, [[Q.edited(p), 'o']]);
  assert.ok(lstatSync(p).isDirectory() && !lstatSync(p).isSymbolicLink());
  assert.equal(read(path.join(p, 'SKILL.md')), officialSkill(s, 'sdd', 'sdd-spec'));
  assert.deepEqual(snapshot(out), target);
});

test('RF-22.S3: escape sequences in an edited skill and its new content are printed safely', { skip: SKIP }, t => {
  const s = edited(t, [['0.4.0', changeSkill('sdd', 'sdd-spec', '\nnew \x1b[32m\n')]]);
  appendFileSync(path.join(s.p, 'SKILL.md'), 'mine \x1b[31m\n');
  const o = upd(s, [[Q.edited(s.p), 'k']]);
  assert.ok(asks(o, Q.edited(s.p)));
  noEsc(o);
});

test('RF-18.E7: a kept copy overwritten later and edited again is not asked without a new official change', { skip: SKIP }, t => {
  const s = edited(t);
  assert.ok(asks(upd(s, [[Q.edited(s.p), 'k']]), Q.edited(s.p)));
  assert.equal(s.install('--global', '--pack', 'sdd', '--agent', 'claude', '--force').status, 0);
  appendFileSync(path.join(s.p, 'SKILL.md'), '\nsecond edit\n');
  assert.ok(!asks(upd(s), Q.edited(s.p)));
});

// --- RF-23 -------------------------------------------------------------------------------------------
const newPack = (opts = {}) => [['0.4.0', addPack('backend', opts), { changelog: log('0.4.0', { packs: 'backend' }) }]];

test('RF-23.H1: a new pack backend: yes installs it for claude and records it', { skip: SKIP }, t => {
  const s = setup(t, { install: { packs: 'core', agents: 'claude' }, later: newPack() });
  upd(s, [[Q.pack('backend'), 'y']]);
  assert.ok(existsSync(f(s, '.claude/skills/backend-x/SKILL.md')));
  assert.match(recordText(s), /^pair\tbackend\tclaude$/m);
});

test('RF-23.E1: answer no: offered again next update', { skip: SKIP }, t => {
  const s = setup(t, { install: { packs: 'core', agents: 'claude' }, later: newPack() });
  upd(s, [[Q.pack('backend'), 'n']]);
  assert.ok(asks(upd(s, [[Q.pack('backend'), 'n']]), Q.pack('backend')));
});

test('RF-23.E2: a custom pack named backend: the offer says the custom pack would be installed', { skip: SKIP }, t => {
  const s = setup(t, { install: { packs: 'core', agents: 'claude' }, later: newPack() });
  put(path.join(s.clone, 'custom/packs/backend/skills/mine/SKILL.md'), '---\nname: mine\ndescription: x\n---\n');
  const o = upd(s, [[Q.pack('backend'), 'n']]);
  assert.ok(asks(o, Q.pack('backend')));
  assert.match(o.out, /custom pack/);
});

test('RF-23.E3: a pack that existed before and was never installed is not offered', { skip: SKIP }, t => {
  const s = setup(t, { install: { packs: 'core', agents: 'claude' }, later: newPack() });
  const o = upd(s, [[Q.pack('backend'), 'n']]);
  assert.ok(asks(o, Q.pack('backend')));
  assert.ok(!asks(o, Q.pack('design')));
});

test('RF-23.F1: installing the pack fails: error, the rest of the update kept, record without backend', { skip: SKIP }, t => {
  const s = setup(t, { install: { packs: 'core', agents: 'claude' }, later: newPack({ broken: true }) });
  const o = upd(s, [[Q.pack('backend'), 'y']]);
  assert.match(o.out, /backend/);
  assert.equal(version(s), '0.4.0');
  assert.doesNotMatch(recordText(s), /\tbackend\t/);
});

test('RF-23.S1: unshipped, path-like, option-like and escaped names are not offered and are reported safely', { skip: SKIP }, t => {
  const s = setup(t, { install: { packs: 'core', agents: 'claude' }, later: [['0.4.0', undefined, { changelog: log('0.4.0', { packs: 'ghost, ../x, -x, e\x1bvil' }) }]] });
  const o = upd(s);
  noEsc(o);
  assert.ok(!asks(o, 'Install new pack'));
  for (const n of ['ghost', '../x', '-x']) assert.ok(o.out.includes(n), n);
  assert.equal(existsSync(f(s, '.claude/skills/ghost')), false);
});

// --- RF-24 / RF-25 / RF-26 ----------------------------------------------------------------------------
test('RF-24.H1: ~/.rigorkit-version without a record: clone updated, install command shown, no global change', { skip: SKIP }, t => {
  const s = setup(t);
  put(f(s, '.rigorkit-version'), '0.2.0\n');
  put(f(s, '.claude/skills/sdd-spec/SKILL.md'), 'old\n');
  const o = upd(s);
  assert.equal(version(s), '0.4.0');
  assert.match(o.out, /rigorkit install --global --pack/);
  assert.equal(read(f(s, '.claude/skills/sdd-spec/SKILL.md')), 'old\n');
});

test('RF-24.E1: neither record nor ~/.rigorkit-version: no refresh and no message', { skip: SKIP }, t => {
  const s = setup(t);
  assert.doesNotMatch(upd(s).out, /rigorkit install --global/);
  assert.equal(version(s), '0.4.0');
});

test('RF-24.F1: a corrupted record: message names it and says the install moves it aside; record byte-equal', { skip: SKIP }, t => {
  const s = setup(t, { install: { packs: 'core', agents: 'claude' } });
  writeFileSync(RECORD(s.h.HOME), 'garbage\n');
  const o = upd(s);
  assert.equal(version(s), '0.4.0');
  assert.ok(o.out.includes(RECORD(s.h.HOME)));
  assert.match(o.out, /aside/);
  assert.equal(read(RECORD(s.h.HOME)), 'garbage\n');
});

test('RF-24.S1: unrecorded global copies stay byte-equal', { skip: SKIP }, t => {
  const s = setup(t, { later: [['0.4.0', changeSkill('sdd', 'sdd-spec')]], before: x => run('bash', [path.join(x.clone, 'install.sh'), '--global', '--pack', 'sdd', '--agent', 'claude'], { env: { ...x.env, RK_NO_RECORD: '1' } }) });
  put(f(s, '.rigorkit-version'), '0.3.0\n');
  const before = snapshot(f(s, '.claude'));
  upd(s);
  assert.equal(version(s), '0.4.0');
  assert.deepEqual(snapshot(f(s, '.claude')), before);
});

test('RF-25.H1: a custom script with an official name: the update warns it shadows the official one', { skip: SKIP }, t => {
  const s = setup(t);
  put(path.join(s.clone, 'custom/scripts/test-summary'), '#!/bin/sh\n', 0o755);
  assert.match(upd(s).out, /test-summary.*shadows|shadows.*test-summary/);
});

test('RF-25.E1: a custom pack with a new name: no warning', { skip: SKIP }, t => {
  const s = setup(t);
  put(path.join(s.clone, 'custom/packs/mine/skills/m/SKILL.md'), 'x\n');
  assert.doesNotMatch(upd(s).out, /shadows/);
  assert.equal(version(s), '0.4.0');
});

test('RF-25.F1: an unreadable custom area: one warning, the update continues', { skip: SKIP }, t => {
  const s = setup(t);
  const c = path.join(s.clone, 'custom'); mkdirSync(path.join(c, 'packs'), { recursive: true });
  chmodSync(c, 0o000);
  t.after(() => chmodSync(c, 0o755));
  const o = upd(s);
  assert.equal(version(s), '0.4.0');
  assert.equal(o.out.split('\n').filter(l => /custom/.test(l) && /warning/.test(l)).length, 1, o.out);
});

test('RF-25.S1: the custom area stays byte-equal', { skip: SKIP }, t => {
  const s = setup(t, { install: { packs: 'core', agents: 'claude' }, later: changed() });
  put(path.join(s.clone, 'custom/scripts/test-summary'), '#!/bin/sh\n', 0o755);
  put(path.join(s.clone, 'custom/packs/core/rules.md'), 'mine\n');
  const before = snapshot(path.join(s.clone, 'custom'));
  assert.ok(asks(upd(s, [[Q.rules(f(s, '.claude/CLAUDE.md')), 'y']]), Q.rules(f(s, '.claude/CLAUDE.md'))));
  assert.deepEqual(snapshot(path.join(s.clone, 'custom')), before);
});

const script = s => path.join(s.clone, 'packs/core/scripts/test-summary');
test('RF-26.H1: an official script without its execute bit: made executable, one line', { skip: SKIP }, t => {
  const s = setup(t);
  chmodSync(script(s), 0o644);
  const o = upd(s);
  assert.ok(mode(script(s)) & 0o100);
  assert.equal(o.out.split('\n').filter(l => /made executable/.test(l)).length, 1);
});

test('RF-26.E1: all scripts executable: nothing reported', { skip: SKIP }, t => {
  const s = setup(t);
  assert.doesNotMatch(upd(s).out, /executable/);
  assert.equal(version(s), '0.4.0');
});

test('RF-26.E2: clone up to date and a script lost its bit: repaired and reported', { skip: SKIP }, t => {
  const s = setup(t, { later: [] });
  chmodSync(script(s), 0o644);
  assert.match(upd(s).out, /made executable/);
  assert.ok(mode(script(s)) & 0o100);
});

test('RF-26.E3: --dry-run reports the repair and leaves the mode unchanged', { skip: SKIP }, t => {
  const s = setup(t);
  chmodSync(script(s), 0o644);
  assert.match(upd(s, [], ['--dry-run']).out, /would make executable/);
  assert.equal(mode(script(s)), 0o644);
});

test('RF-26.E4: a custom script that is not executable is only reported', { skip: SKIP }, t => {
  const s = setup(t);
  const c = put(path.join(s.clone, 'custom/scripts/mine'), '#!/bin/sh\n', 0o644);
  assert.match(upd(s).out, /mine.*not executable/);
  assert.equal(mode(c), 0o644);
});

test('RF-26.E5: a lost bit and a refused update: mode and clone unchanged', { skip: SKIP }, t => {
  const s = setup(t);
  chmodSync(script(s), 0o644);
  appendFileSync(path.join(s.clone, 'install.sh'), '# mine\n');
  const h0 = head(s);
  assert.match(upd(s).out, /local changes/);
  assert.equal(mode(script(s)), 0o644);
  assert.equal(head(s), h0);
});

test('RF-26.F1: the execute bit cannot be added: reported, the update continues', { skip: SKIP || MAC_ONLY }, t => {
  const s = setup(t, { later: [] });
  chmodSync(script(s), 0o644);
  run('chflags', ['uchg', script(s)]);
  t.after(() => run('chflags', ['nouchg', script(s)]));
  const o = upd(s);
  assert.match(o.out, /test-summary/);
  assert.equal(o.status, 0, o.out);
});

test('RF-26.S1: the repair adds only the user execute bit', { skip: SKIP }, t => {
  const s = setup(t);
  chmodSync(script(s), 0o644);
  upd(s);
  assert.equal(mode(script(s)), 0o744);
});

// --- RF-27 -------------------------------------------------------------------------------------------
const OLD = s => f(s, '.local/share/rigorkit/scripts');
function oldScripts(t, { agents = 'claude' } = {}) {
  const s = setup(t, { install: { packs: 'core', agents } });
  put(path.join(OLD(s), 'test-summary'), read(script(s)), 0o755);
  return s;
}

test('RF-27.H1: an old published script and no rules block naming the location: removed on yes', { skip: SKIP }, t => {
  const s = oldScripts(t);
  upd(s, [[Q.old, 'y']]);
  assert.equal(existsSync(path.join(OLD(s), 'test-summary')), false);
});

test('RF-27.E1: a recorded rules block still names the old location: no removal offered', { skip: SKIP }, t => {
  const s = oldScripts(t);
  const file = f(s, '.claude/CLAUDE.md');
  writeFileSync(file, read(file).replace('<!-- rigorkit:core:end -->', '~/.local/share/rigorkit/scripts/test-summary\n<!-- rigorkit:core:end -->'));
  assert.ok(!asks(upd(s), Q.old));
  assert.equal(version(s), '0.4.0');
});

test('RF-27.E2: answer no: files kept and offered again next update', { skip: SKIP }, t => {
  const s = oldScripts(t);
  upd(s, [[Q.old, 'n']]);
  assert.ok(existsSync(path.join(OLD(s), 'test-summary')));
  assert.ok(asks(upd(s, [[Q.old, 'n']]), Q.old));
});

test('RF-27.E3: Cursor recorded: the question says to paste Cursor rules again first', { skip: SKIP }, t => {
  const s = oldScripts(t, { agents: 'claude,cursor' });
  assert.match(upd(s, [[Q.old, 'n']]).out, /Cursor/);
});

test('RF-27.E4: only user text outside the markers names the old location: removal offered', { skip: SKIP }, t => {
  const s = oldScripts(t);
  appendFileSync(f(s, '.claude/CLAUDE.md'), '\nI used ~/.local/share/rigorkit/scripts once.\n');
  assert.ok(asks(upd(s, [[Q.old, 'n']]), Q.old));
});

test('RF-27.F1: a file that cannot be removed is reported; the others are removed', { skip: SKIP || MAC_ONLY }, t => {
  const s = oldScripts(t);
  put(path.join(OLD(s), 'json-peek'), read(path.join(s.clone, 'packs/core/scripts/json-peek')), 0o755);
  run('chflags', ['uchg', path.join(OLD(s), 'json-peek')]);
  t.after(() => run('chflags', ['nouchg', path.join(OLD(s), 'json-peek')]));
  const o = upd(s, [[Q.old, 'y']]);
  assert.match(o.out, /json-peek/);
  assert.equal(existsSync(path.join(OLD(s), 'test-summary')), false);
  assert.equal(o.status, 0, o.out);
});

test('RF-27.S1: a user file, an edited script and a link to a user file are untouched and listed', { skip: SKIP }, t => {
  const s = oldScripts(t);
  put(path.join(OLD(s), 'mine'), 'user\n');
  put(path.join(OLD(s), 'first-error'), `${read(path.join(s.clone, 'packs/core/scripts/first-error'))}# edited\n`, 0o755);
  const target = put(f(s, 'precious'), 'keep\n');
  symlinkSync(target, path.join(OLD(s), 'json-peek'));
  const o = upd(s, [[Q.old, 'y']]);
  for (const n of ['mine', 'first-error', 'json-peek']) { assert.ok(existsSync(path.join(OLD(s), n)) || lstatSync(path.join(OLD(s), n)), n); assert.ok(o.out.includes(n), n); }
  assert.ok(lstatSync(path.join(OLD(s), 'json-peek')).isSymbolicLink());
  assert.equal(read(target), 'keep\n');
});

// --- RF-28 -------------------------------------------------------------------------------------------
test('RF-28.H1: a skill removed from its pack is reported as no longer shipped and left on disk', { skip: SKIP }, t => {
  const s = setup(t, { install: { packs: 'sdd', agents: 'claude' }, later: [['0.4.0', removeSkill('sdd', 'sdd-explain')]] });
  const o = upd(s);
  assert.match(o.out, /sdd-explain.*no longer shipped/);
  assert.ok(existsSync(f(s, '.claude/skills/sdd-explain/SKILL.md')));
});

test('RF-28.E1: a deleted recorded copy is reported missing and counted in the group question', { skip: SKIP }, t => {
  const s = setup(t, { install: { packs: 'sdd', agents: 'claude' }, later: [['0.4.0']] });
  rmSync(f(s, '.claude/skills/sdd-spec'), { recursive: true });
  const o = upd(s, [[Q.group, 'y']]);
  assert.match(o.out, /sdd-spec.*missing/);
  assert.match(o.out, /Update 1 unedited global copies\?/);
  assert.ok(existsSync(f(s, '.claude/skills/sdd-spec/SKILL.md')));
});

test('RF-28.S1: a copy no longer shipped stays byte-equal', { skip: SKIP }, t => {
  const s = setup(t, { install: { packs: 'sdd', agents: 'claude' }, later: [['0.4.0', removeSkill('sdd', 'sdd-explain')]] });
  const before = snapshot(f(s, '.claude/skills/sdd-explain'));
  assert.match(upd(s).out, /no longer shipped/);
  assert.deepEqual(snapshot(f(s, '.claude/skills/sdd-explain')), before);
});

// --- RF-34 -------------------------------------------------------------------------------------------
function readmeCommands() {
  const text = read(path.join(repo, 'README.md'));
  const sec = text.split(/^### /m).find(x => /^Update from 0\.2\.0/.test(x));
  assert.ok(sec, 'README has "### Update from 0.2.0"');
  return { sec, cmds: [...sec.matchAll(/```bash\n([\s\S]*?)```/g)].map(m => m[1].trim()).filter(c => c.startsWith('git -C ~/.rigorkit')) };
}

test('RF-34.H1: the documented commands move a 0.2.0 clone to the first release with rigorkit update', t => {
  const h = home(t);
  const r = testRemote(t, h.root);
  r.release('0.2.0', d => rmSync(path.join(d, 'lib'), { recursive: true, force: true }));
  r.release(read(path.join(repo, 'VERSION')).trim());
  const clone = cloneAt(h.HOME, r.bare, 'v0.2.0');
  const { cmds } = readmeCommands();
  assert.ok(cmds.length >= 1);
  for (const c of cmds) { const o = run('sh', ['-c', c], { env: envFor(h) }); assert.equal(o.status, 0, `${c}\n${o.out}`); }
  const help = run(path.join(clone, 'bin/rigorkit'), ['help'], { env: envFor(h) });
  assert.match(help.stdout, /^ {2}update /m);
});

test('RF-34.E1: an edited tracked file stops the documented commands; the text says to move the edit to custom first', t => {
  const h = home(t);
  const r = testRemote(t, h.root);
  r.release('0.2.0', d => rmSync(path.join(d, 'lib'), { recursive: true, force: true }));
  r.release(read(path.join(repo, 'VERSION')).trim(), d => appendFileSync(path.join(d, 'install.sh'), '# new\n'));
  const clone = cloneAt(h.HOME, r.bare, 'v0.2.0');
  appendFileSync(path.join(clone, 'install.sh'), '# mine\n');
  const { sec, cmds } = readmeCommands();
  const statuses = cmds.map(c => run('sh', ['-c', c], { env: envFor(h) }).status);
  assert.ok(statuses.some(x => x !== 0));
  assert.equal(read(path.join(clone, 'VERSION')).trim(), '0.2.0');
  assert.match(sec, /custom/);
});
