// 020-scan-batch HU-14 — rigorkit scan lists first, asks once, shows progress, skips unchosen tools (fixture from 016).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { execFileSync } from 'node:child_process';
import { chmodSync, cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { home, run, envFor, STATE, pty, NEED_PTY, repo, runtimeCopy as cloneCopy } from './update-fixture.mjs';

const HEX = /^[0-9a-f]{64}$/;
const PROJECTS = HOME => path.join(STATE(HOME), 'projects');
const CONF = HOME => path.join(HOME, '.config/rigorkit/config');
const SPEC_A = '# sdd-spec A\nfirst 0.1.0 text\n';
const SPEC_B = '# sdd-spec B\nsecond 0.1.0 text\n';

function git(cwd, args) {
  return execFileSync('git', ['-c', 'core.hooksPath=/dev/null', '-c', 'commit.gpgsign=false', '-c', 'user.name=F', '-c', 'user.email=f@x.test', ...args],
    { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}
// Clone at ~/.rigorkit whose history has two VERSION 0.1.0 commits (sdd-spec text A then B) before the current one.
function setup(t) {
  const h = home(t);
  const clone = cloneCopy(path.join(h.HOME, '.rigorkit'));
  const spec = path.join(clone, 'packs/sdd/skills/sdd-spec/SKILL.md');
  const current = readFileSync(spec, 'utf8'), version = readFileSync(path.join(clone, 'VERSION'), 'utf8');
  git(clone, ['init', '-q', '-b', 'main']);
  writeFileSync(path.join(clone, 'VERSION'), '0.1.0\n'); writeFileSync(spec, SPEC_A);
  git(clone, ['add', '-A']); git(clone, ['commit', '-qm', 'a']);
  writeFileSync(spec, SPEC_B); git(clone, ['commit', '-qam', 'b']);
  writeFileSync(path.join(clone, 'VERSION'), version); writeFileSync(spec, current); git(clone, ['commit', '-qam', 'c']);
  const work = path.join(h.root, 'work'); mkdirSync(work);
  const rk = (args, opts = {}) => run(path.join(clone, 'bin/rigorkit'), ['scan', ...args], { env: envFor(h), cwd: h.HOME, ...opts });
  return { h, clone, work, rk };
}
function stamp(dir) { writeFileSync(path.join(dir, '.rigorkit'), 'installed-by: rigorkit\nversion: 0.1.0\n'); }
function project(s, rel, { skills = { 'sdd-spec': SPEC_A }, agents = [] } = {}) {
  const p = path.join(s.work, rel); mkdirSync(p, { recursive: true });
  writeFileSync(path.join(p, '.rigorkit-version'), '0.1.0\n');
  for (const [name, text] of Object.entries(skills)) {
    const d = path.join(p, '.claude/skills', name); mkdirSync(d, { recursive: true });
    writeFileSync(path.join(d, 'SKILL.md'), text); stamp(d);
  }
  for (const a of agents) { mkdirSync(path.join(p, '.claude/agents'), { recursive: true }); writeFileSync(path.join(p, '.claude/agents', `${a}.md`), `# ${a}\n`); }
  return p;
}
function records(HOME) {
  const dir = PROJECTS(HOME);
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(f => /^[0-9a-f]{16}$/.test(f)).map(f => readFileSync(path.join(dir, f), 'utf8'));
}
const field = (text, kind) => text.split('\n').filter(l => l.split('\t')[0] === kind).map(l => l.split('\t'));
const recFor = (HOME, p) => records(HOME).find(r => field(r, 'path').some(f => f[1] === p));
function config(HOME, text) { mkdirSync(path.dirname(CONF(HOME)), { recursive: true }); writeFileSync(CONF(HOME), text); }


test('RF-1.H1: new projects are listed with their suggested tools before anything else', t => {
  const s = setup(t);
  const a = project(s, 'a'), b = project(s, 'b');
  const r = s.rk(['--dry-run', '--tools', 'claude', s.work]);
  assert.equal(r.status, 0, r.out);
  const lines = r.out.split('\n');
  const i = lines.indexOf('found 2 new projects:');
  assert.ok(i >= 0, r.out);
  assert.match(lines[i + 1], /^ {2}1\. .* \(0\.1\.0\) -> claude$/);
  assert.match(lines[i + 2], /^ {2}2\. .* \(0\.1\.0\) -> claude$/);
  assert.ok(lines.findIndex(l => l.startsWith('would register')) > i + 2, r.out);
  assert.ok(r.out.includes(a) && r.out.includes(b));
});

const Q1 = 'Register them with the suggested tools? [y = all / e = choose each / n = none]';
const ptyScan = (s, steps) => pty(path.join(s.clone, 'bin/rigorkit'), ['scan', s.work], { env: envFor(s.h), cwd: s.h.HOME, steps });

test('RF-2.H1: one "y" registers every project', { skip: NEED_PTY }, t => {
  const s = setup(t);
  const a = project(s, 'a'), b = project(s, 'b');
  const r = ptyScan(s, [[Q1, 'y']]);
  assert.equal(r.status, 0, r.out);
  assert.ok(recFor(s.h.HOME, a)); assert.ok(recFor(s.h.HOME, b));
  assert.equal((r.out.match(/tools for /g) || []).length, 0, r.out);
});

test('RF-2.E1: "e" asks per project', { skip: NEED_PTY }, t => {
  const s = setup(t);
  const a = project(s, 'a'), b = project(s, 'b');
  const r = ptyScan(s, [[Q1, 'e'], ['tools for', ''], ['tools for', '-']]);
  assert.equal(r.status, 0, r.out);
  assert.equal(records(s.h.HOME).length, 1, r.out);
  assert.ok(recFor(s.h.HOME, a) || recFor(s.h.HOME, b));
});

test('RF-2.F1: "n" registers none and lists them as skipped', { skip: NEED_PTY }, t => {
  const s = setup(t);
  const a = project(s, 'a'), b = project(s, 'b');
  const r = ptyScan(s, [[Q1, 'n']]);
  assert.equal(r.status, 0, r.out);
  assert.equal(records(s.h.HOME).length, 0);
  assert.match(r.out, /skipped/); assert.ok(r.out.includes(a) && r.out.includes(b));
});

test('RF-3.H1: registering shows progress', t => {
  const s = setup(t);
  project(s, 'a'); project(s, 'b');
  const r = s.rk(['--tools', 'claude', s.work]);
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /^\[1\/2\] /m); assert.match(r.out, /^\[2\/2\] /m);
});

test('RF-4.H1: copies of tools that were not chosen are not inspected', t => {
  const s = setup(t);
  const p = project(s, 'a');
  const d = path.join(p, '.agents/skills/ghost-skill'); mkdirSync(d, { recursive: true });
  writeFileSync(path.join(d, 'SKILL.md'), '# ghost\n'); stamp(d);
  const r = s.rk(['--tools', 'claude', s.work]);
  assert.equal(r.status, 0, r.out);
  assert.doesNotMatch(r.out, /ghost-skill/);
});
