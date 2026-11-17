// 022-global-rules-on-install B2 — rules installed with `--rules-only` stay managed like rules of a global pack install
// (RF-11): `rigorkit update` refreshes them with consent and copies no skill or agent, doctor raises no issue,
// a later full install keeps one block, and rules uninstall removes only the block.
// Real clone at a release tag, real updates through a pseudo-terminal, temporary HOME. RF-IDs: specs/changes/022-*/spec.md.
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { appendFileSync, existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { isRoot } from './rigorkit-fixture.mjs';
import { home, run, testRemote, cloneAt, writeState, now, envFor, pty, NEED_PTY, RECORD } from './update-fixture.mjs';

const SKIP = NEED_PTY || (isRoot() && 'D4: running as root ignores permission bits');
const START = '<!-- rigorkit:core:start -->', END = '<!-- rigorkit:core:end -->';
const Q = { rules: f => `Rewrite the rigorkit block in ${f}? [y/N]`, group: 'unedited global copies? [y/N]' };
const changeRules = (text = '\nTest rule change.\n') => dir => appendFileSync(path.join(dir, 'packs/core/rules.md'), text);
const log = v => `## ${v}\nGlobal rules: changed\nNew packs: none\n\nTest release ${v}.\n`;
const read = p => readFileSync(p, 'utf8');
const count = (text, needle) => text.split(needle).length - 1;

// Clone at 0.3.0 (built from the working tree, so it has --rules-only), rules-only install of core for Claude
// Code (optionally over user text), then release 0.4.0 with changed rules.
function setup(t, { userText = null, later = true } = {}) {
  const h = home(t);
  const r = testRemote(t, h.root);
  r.release('0.3.0');
  const clone = cloneAt(h.HOME, r.bare, 'v0.3.0');
  const env = envFor(h);
  const s = { h, r, clone, env, file: path.join(h.HOME, '.claude/CLAUDE.md') };
  s.install = (...args) => run('bash', [path.join(clone, 'install.sh'), ...args], { env, cwd: h.HOME });
  if (userText !== null) { mkdirSync(path.dirname(s.file), { recursive: true }); writeFileSync(s.file, userText); }
  const o = s.install('--global', '--pack', 'core', '--agent', 'claude', '--rules-only');
  assert.equal(o.status, 0, `rules-only precondition: ${o.out}`);
  if (later) r.release('0.4.0', changeRules(), { changelog: log('0.4.0') });
  writeState(h.HOME, { checked: now(), newest: '' });
  return s;
}
const upd = (s, steps = []) => pty(path.join(s.clone, 'bin/rigorkit'), ['update'], { env: s.env, steps, eof: true, timeout: 90 });
const record = s => (existsSync(RECORD(s.h.HOME)) ? read(RECORD(s.h.HOME)) : '');
const kinds = text => text.split('\n').filter(Boolean).map(l => l.split('\t')[0]);

describe('022-global-rules-on-install', () => {
  test('RF-11.H1: a newer release with changed rules is offered with its diff, replaced on yes, and no skill or agent is copied', { skip: SKIP }, t => {
    const s = setup(t);
    const before = read(s.file);
    const o = upd(s, [[Q.rules(s.file), 'y']]);
    assert.match(read(s.file), /Test rule change\./, 'the changed rules block replaced the old one');
    assert.equal(read(`${s.file}.rigorkit.bak`), before, 'backup of the block as it was');
    assert.match(o.out, /^\s*\+Test rule change\./m, 'the difference was shown');
    assert.ok(!o.out.includes(Q.group), 'no group of skill copies is offered');
    assert.doesNotMatch(o.out, /no longer shipped/, 'a record with only rules-only entries updates cleanly');
    for (const d of ['.claude/skills', '.claude/agents', '.agents']) assert.equal(existsSync(path.join(s.h.HOME, d)), false, `${d} must not exist`);
    assert.ok(!kinds(record(s)).includes('pair') && !kinds(record(s)).includes('copy'), 'the record still has no pair or copy lines');
    assert.equal(read(path.join(s.clone, 'VERSION')).trim(), '0.4.0');
  });

  test('RF-11.E1: doctor reports no skill or agent missing and raises no issue for a rules-only entry', t => {
    const s = setup(t, { later: false });
    const o = run(path.join(s.clone, 'bin/rigorkit'), ['doctor'], { env: s.env, cwd: s.h.HOME });
    assert.equal(o.status, 0, o.out);
    assert.doesNotMatch(o.out, /missing|no longer shipped|edited/i);
  });

  test('RF-11.E2: a global install of core afterwards leaves one rules block and records its pair', t => {
    const s = setup(t, { later: false });
    const o = s.install('--global', '--pack', 'core', '--agent', 'claude');
    assert.equal(o.status, 0, o.out);
    const text = read(s.file);
    assert.equal(count(text, START), 1);
    assert.equal(count(text, END), 1);
    assert.match(record(s), /^pair\tcore\tclaude$/m);
    assert.ok(existsSync(path.join(s.h.HOME, '.claude/skills')), 'the full install copies the skills');
  });

  test('RF-11.F1: a block edited by hand is offered with its difference and never replaced without a yes', { skip: SKIP }, t => {
    const s = setup(t);
    writeFileSync(s.file, read(s.file).replace(END, `my inside line\n${END}`));
    const edited = read(s.file);
    const o = upd(s, [[Q.rules(s.file), 'n']]);
    assert.ok(o.out.includes(Q.rules(s.file)), 'the edited block is asked about');
    assert.match(o.out, /^\s*-my inside line/m, 'the diff shows the user line');
    assert.equal(read(s.file), edited, 'a no leaves the file byte-identical');
  });

  test('RF-11.S1: rules uninstall removes only the block and leaves the rest of the file byte-identical', t => {
    const s = setup(t, { userText: 'before\n', later: false });
    appendFileSync(s.file, 'after\n');
    const o = s.install('--uninstall-rules', '--agent', 'claude');
    assert.equal(o.status, 0, o.out);
    assert.equal(read(s.file), 'before\nafter\n');
    assert.ok(!kinds(record(s)).includes('rules'), 'the rules line leaves the record');
  });
});
