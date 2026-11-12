// 010-update HU-2 — global record written by `rigorkit install --global` (RF-18, RF-35, RF-36).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { chmodSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { home, run, envFor, RECORD, STATE, runtimeCopy as cloneCopy } from './update-fixture.mjs';
import { isRoot } from './rigorkit-fixture.mjs';

const ROOT_SKIP = isRoot() && 'D4: running as root ignores permission bits';
const HEX = /^[0-9a-f]{64}$/;

function setup(t, version) {
  const h = home(t);
  const clone = cloneCopy(path.join(h.HOME, '.rigorkit'));
  if (version) writeFileSync(path.join(clone, 'VERSION'), `${version}\n`);
  const install = (...args) => run('bash', [path.join(clone, 'install.sh'), ...args], { env: envFor(h), cwd: h.HOME });
  return { h, clone, install, record: () => (existsSync(RECORD(h.HOME)) ? readFileSync(RECORD(h.HOME), 'utf8') : null) };
}
const lines = text => text.split('\n').filter(Boolean);
const field = (text, kind) => lines(text).filter(l => l.split('\t')[0] === kind).map(l => l.split('\t'));
const copyLine = (text, p) => field(text, 'copy').find(f => f[4] === p);

test('RF-18.H1: install --global core,sdd for claude records pairs, version and one fingerprint per copy and rules block', t => {
  const s = setup(t, '0.3.0');
  const r = s.install('--global', '--pack', 'core,sdd', '--agent', 'claude');
  assert.equal(r.status, 0, r.out);
  const rec = s.record();
  assert.ok(rec, 'record written');
  assert.equal(lines(rec)[0], 'rigorkit-global-record 1');
  assert.deepEqual(field(rec, 'version').map(f => f[1]), ['0.3.0']);
  assert.deepEqual(field(rec, 'pair').map(f => `${f[1]}/${f[2]}`).sort(), ['core/claude', 'sdd/claude']);
  const spec = copyLine(rec, path.join(s.h.HOME, '.claude/skills/sdd-spec'));
  assert.ok(spec, 'sdd-spec recorded');
  assert.deepEqual(spec.slice(1, 4), ['skill', 'sdd', 'claude']);
  assert.match(spec[5], HEX);
  const agent = copyLine(rec, path.join(s.h.HOME, '.claude/agents/sdd-reviewer.md'));
  assert.ok(agent && agent[1] === 'agent' && HEX.test(agent[5]), 'agent file recorded with fingerprint');
  const rules = field(rec, 'rules');
  assert.equal(rules.length, 1);
  assert.deepEqual(rules[0].slice(1, 4), ['core', 'claude', path.join(s.h.HOME, '.claude/CLAUDE.md')]);
  assert.match(rules[0][4], HEX);
});

test('RF-18.E1: core,sdd for claude then core for codex records core/claude, sdd/claude, core/codex and no sdd/codex', t => {
  const s = setup(t);
  assert.equal(s.install('--global', '--pack', 'core,sdd', '--agent', 'claude').status, 0);
  assert.equal(s.install('--global', '--pack', 'core', '--agent', 'codex').status, 0);
  const pairs = field(s.record(), 'pair').map(f => `${f[1]}/${f[2]}`).sort();
  assert.deepEqual(pairs, ['core/claude', 'core/codex', 'sdd/claude']);
});

test('RF-18.E2: --dry-run writes no record', t => {
  const s = setup(t);
  const r = s.install('--global', '--pack', 'core', '--agent', 'claude', '--dry-run');
  assert.equal(r.status, 0, r.out);
  assert.equal(s.record(), null);
});

test('RF-18.E3: a skipped existing differing skill is recorded without fingerprint', t => {
  const s = setup(t);
  mkdirSync(path.join(s.h.HOME, '.claude/skills/sdd-spec'), { recursive: true });
  writeFileSync(path.join(s.h.HOME, '.claude/skills/sdd-spec/SKILL.md'), 'mine\n');
  assert.equal(s.install('--global', '--pack', 'sdd', '--agent', 'claude').status, 0);
  const line = copyLine(s.record(), path.join(s.h.HOME, '.claude/skills/sdd-spec'));
  assert.ok(line, 'recorded');
  assert.equal(line[5], '-');
  const other = copyLine(s.record(), path.join(s.h.HOME, '.claude/skills/sdd-plan'));
  assert.match(other[5], HEX);
});

test('RF-18.E5: a later install keeps the recorded global version and adds the codex pair', t => {
  const s = setup(t, '0.3.0');
  assert.equal(s.install('--global', '--pack', 'core', '--agent', 'claude').status, 0);
  writeFileSync(path.join(s.clone, 'VERSION'), '0.4.0\n');
  assert.equal(s.install('--global', '--pack', 'core', '--agent', 'codex').status, 0);
  const rec = s.record();
  assert.deepEqual(field(rec, 'version').map(f => f[1]), ['0.3.0']);
  assert.ok(field(rec, 'pair').some(f => f[1] === 'core' && f[2] === 'codex'));
});

test('RF-18.E6: re-install without --force keeps the fingerprint and declined content of a kept copy', t => {
  const s = setup(t);
  assert.equal(s.install('--global', '--pack', 'sdd', '--agent', 'claude').status, 0);
  const p = path.join(s.h.HOME, '.claude/skills/sdd-spec');
  writeFileSync(path.join(p, 'SKILL.md'), 'kept edit\n');
  const fp = 'a'.repeat(64), declined = 'b'.repeat(64);
  const edited = lines(s.record()).map(l => (l.split('\t')[4] === p ? ['copy', 'skill', 'sdd', 'claude', p, fp, declined].join('\t') : l)).join('\n') + '\n';
  writeFileSync(RECORD(s.h.HOME), edited);
  assert.equal(s.install('--global', '--pack', 'sdd', '--agent', 'claude').status, 0);
  const line = copyLine(s.record(), p);
  assert.equal(line[5], fp);
  assert.equal(line[6], declined);
});

test('RF-18.F1: an unwritable record folder: install proceeds with one warning', { skip: ROOT_SKIP }, t => {
  const s = setup(t);
  mkdirSync(STATE(s.h.HOME), { recursive: true });
  chmodSync(STATE(s.h.HOME), 0o500);
  t.after(() => { try { chmodSync(STATE(s.h.HOME), 0o700); } catch {} });
  const r = s.install('--global', '--pack', 'core', '--agent', 'claude');
  assert.equal(r.status, 0, r.out);
  assert.ok(existsSync(path.join(s.h.HOME, '.claude/CLAUDE.md')), 'install still wrote the rules');
  assert.equal(r.out.split('\n').filter(l => /updates cannot manage the global scope/.test(l)).length, 1, r.out);
});

test('RF-18.S1: the record holds only paths, names, versions and fingerprints', t => {
  const s = setup(t);
  assert.equal(s.install('--global', '--pack', 'all', '--agent', 'claude,codex,opencode,cursor').status, 0);
  const rec = s.record();
  const shapes = [
    /^rigorkit-global-record 1$/,
    /^version\t\d+\.\d+\.\d+$/,
    /^pair\t[\w.-]+\t(claude|codex|cursor|opencode)$/,
    /^copy\t(skill|agent)\t[\w.-]+\t(claude|codex|cursor|opencode)\t\/[^\t]+\t([0-9a-f]{64}|-)\t([0-9a-f]{64}|-)$/,
    /^rules\t[\w.-]+\t(claude|codex|cursor|opencode)\t\/[^\t]+\t([0-9a-f]{64}|-)$/,
  ];
  for (const l of lines(rec)) assert.ok(shapes.some(re => re.test(l)), `unexpected record line: ${l}`);
  assert.doesNotMatch(rec, /Token economy/);
});

test('RF-18.S2: a project install leaves the global record unchanged', t => {
  const s = setup(t);
  assert.equal(s.install('--global', '--pack', 'core', '--agent', 'claude').status, 0);
  const before = s.record();
  const proj = path.join(s.h.root, 'proj'); mkdirSync(proj);
  assert.equal(s.install('--pack', 'sdd', '--agent', 'claude', '--project', proj).status, 0);
  assert.equal(s.record(), before);
});

function corrupt(s, text = 'garbage line\n') {
  mkdirSync(STATE(s.h.HOME), { recursive: true });
  writeFileSync(RECORD(s.h.HOME), text);
}

test('RF-35.H1: a corrupted record is renamed to .corrupt, a new record holds this install and one line says so', t => {
  const s = setup(t);
  corrupt(s);
  const r = s.install('--global', '--pack', 'core', '--agent', 'claude');
  assert.equal(r.status, 0, r.out);
  assert.equal(readFileSync(RECORD(s.h.HOME) + '.corrupt', 'utf8'), 'garbage line\n');
  assert.equal(lines(s.record())[0], 'rigorkit-global-record 1');
  assert.ok(field(s.record(), 'pair').length === 1);
  assert.match(r.out, /\.corrupt/);
});

test('RF-35.E1: an older .corrupt is replaced by the newly corrupted record', t => {
  const s = setup(t);
  corrupt(s, 'new garbage\n');
  writeFileSync(RECORD(s.h.HOME) + '.corrupt', 'old garbage\n');
  assert.equal(s.install('--global', '--pack', 'core', '--agent', 'claude').status, 0);
  assert.equal(readFileSync(RECORD(s.h.HOME) + '.corrupt', 'utf8'), 'new garbage\n');
});

test('RF-35.E2: --dry-run leaves a corrupted record byte-equal and not renamed', t => {
  const s = setup(t);
  corrupt(s);
  assert.equal(s.install('--global', '--pack', 'core', '--agent', 'claude', '--dry-run').status, 0);
  assert.equal(s.record(), 'garbage line\n');
  assert.equal(existsSync(RECORD(s.h.HOME) + '.corrupt'), false);
});

test('RF-35.F1: the rename fails: install proceeds, warns, record untouched', { skip: ROOT_SKIP }, t => {
  const s = setup(t);
  corrupt(s);
  chmodSync(STATE(s.h.HOME), 0o500);
  t.after(() => { try { chmodSync(STATE(s.h.HOME), 0o700); } catch {} });
  const r = s.install('--global', '--pack', 'core', '--agent', 'claude');
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /updates cannot manage the global scope/);
  assert.equal(s.record(), 'garbage line\n');
});

test('RF-35.S1: none of a corrupted record content is printed', t => {
  const s = setup(t);
  corrupt(s, 'evil \x1b]0;pwned\x07 line\n');
  const r = s.install('--global', '--pack', 'core', '--agent', 'claude');
  assert.equal(r.status, 0, r.out);
  assert.doesNotMatch(r.out, /\x1b|pwned/);
});

test('RF-36.H1: --uninstall-rules removes the claude rules block from the record', t => {
  const s = setup(t);
  assert.equal(s.install('--global', '--pack', 'core,sdd', '--agent', 'claude').status, 0);
  assert.equal(field(s.record(), 'rules').length, 1);
  const r = s.install('--uninstall-rules', '--agent', 'claude');
  assert.equal(r.status, 0, r.out);
  assert.equal(field(s.record(), 'rules').length, 0);
  assert.ok(field(s.record(), 'copy').length > 0, 'copies stay recorded');
});

test('RF-36.E1: --uninstall-rules without a record removes the rules and creates no record', t => {
  const s = setup(t);
  assert.equal(s.install('--global', '--pack', 'core', '--agent', 'claude').status, 0);
  rmSync(RECORD(s.h.HOME));
  const r = s.install('--uninstall-rules', '--agent', 'claude');
  assert.equal(r.status, 0, r.out);
  assert.doesNotMatch(readFileSync(path.join(s.h.HOME, '.claude/CLAUDE.md'), 'utf8'), /rigorkit:core:start/);
  assert.equal(s.record(), null);
});

test('RF-36.E2: --uninstall-rules --dry-run leaves the record byte-equal', t => {
  const s = setup(t);
  assert.equal(s.install('--global', '--pack', 'core', '--agent', 'claude').status, 0);
  const before = s.record();
  assert.equal(s.install('--uninstall-rules', '--agent', 'claude', '--dry-run').status, 0);
  assert.equal(s.record(), before);
});

test('RF-36.F1: an unreadable record: rules removed, one warning, record untouched', t => {
  const s = setup(t);
  assert.equal(s.install('--global', '--pack', 'core', '--agent', 'claude').status, 0);
  writeFileSync(RECORD(s.h.HOME), 'garbage line\n');
  const r = s.install('--uninstall-rules', '--agent', 'claude');
  assert.equal(r.status, 0, r.out);
  assert.doesNotMatch(readFileSync(path.join(s.h.HOME, '.claude/CLAUDE.md'), 'utf8'), /rigorkit:core:start/);
  assert.equal(r.out.split('\n').filter(l => /record/.test(l) && /warning/.test(l)).length, 1, r.out);
  assert.equal(s.record(), 'garbage line\n');
});
