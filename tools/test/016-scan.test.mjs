// 016-migrate-0-1-0 HU-11 — rigorkit scan registers 0.1.0 installs (RF-1–RF-6) and the docs check (RF-7–RF-8).
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

test('RF-1.H1: scan_paths from the config are scanned', t => {
  const s = setup(t);
  const p = project(s, 'one');
  config(s.h.HOME, `scan_paths=${s.work}\n`);
  const r = s.rk(['--tools', 'claude']);
  assert.equal(r.status, 0, r.out);
  assert.ok(recFor(s.h.HOME, p), r.out);
});

test('RF-1.E1: a folder argument limits the scan', t => {
  const s = setup(t);
  const a = project(s, 'a/one'), b = project(s, 'b/two');
  assert.equal(s.rk(['--tools', 'claude', path.join(s.work, 'a')]).status, 0);
  assert.ok(recFor(s.h.HOME, a));
  assert.equal(recFor(s.h.HOME, b), undefined);
});

test('RF-1.F1: without folders or scan_paths it names scan_paths and exits 2', t => {
  const s = setup(t);
  const r = s.rk([]);
  assert.equal(r.status, 2);
  assert.match(r.out, /scan_paths/);
});

test('RF-1.F2: a missing folder is named and the run exits 3', t => {
  const s = setup(t);
  const p = project(s, 'one');
  const missing = path.join(s.h.root, 'nope');
  const r = s.rk(['--tools', 'claude', missing, s.work]);
  assert.equal(r.status, 3, r.out);
  assert.ok(r.out.includes(missing), r.out);
  assert.ok(recFor(s.h.HOME, p));
});

test('RF-1.S1: an option-like folder is refused', t => {
  const s = setup(t);
  for (const args of [['--x'], ['--tools', 'claude', '--', '-x']]) {
    const r = s.rk(args);
    assert.equal(r.status, 2, args.join(' '));
    assert.match(r.out, /usage: rigorkit scan/);
  }
});

test('RF-2.H1: projects up to depth 4 are found, deeper ones are not', t => {
  const s = setup(t);
  const d1 = project(s, 'p1'), d4 = project(s, 'a/b/c/p4'), d5 = project(s, 'a/b/c/d/p5');
  assert.equal(s.rk(['--tools', 'claude', s.work]).status, 0);
  assert.ok(recFor(s.h.HOME, d1)); assert.ok(recFor(s.h.HOME, d4));
  assert.equal(recFor(s.h.HOME, d5), undefined);
});

test('RF-2.E1: node_modules and scan_exclude names are not entered', t => {
  const s = setup(t);
  const nm = project(s, 'node_modules/pkg'), ex = project(s, 'archive/old');
  config(s.h.HOME, `scan_exclude=archive\n`);
  assert.equal(s.rk(['--tools', 'claude', s.work]).status, 0);
  assert.equal(recFor(s.h.HOME, nm), undefined);
  assert.equal(recFor(s.h.HOME, ex), undefined);
});

test('RF-2.E2: an already registered project is reported and left as it is', t => {
  const s = setup(t);
  const p = project(s, 'one');
  s.rk(['--tools', 'claude', s.work]);
  const dir = PROJECTS(s.h.HOME), f = readdirSync(dir).find(x => /^[0-9a-f]{16}$/.test(x));
  const before = readFileSync(path.join(dir, f), 'utf8');
  const r = s.rk(['--tools', 'claude', s.work]);
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /already registered/);
  assert.equal(readFileSync(path.join(dir, f), 'utf8'), before);
  assert.ok(p);
});

test('RF-3.H1: in a terminal, Enter accepts the suggested tools', { skip: NEED_PTY }, t => {
  const s = setup(t);
  const p = project(s, 'one');
  const r = pty(path.join(s.clone, 'bin/rigorkit'), ['scan', s.work], { env: envFor(s.h), cwd: s.h.HOME, steps: [['Register them with the suggested tools?', 'y']] }); // AMEND-1 (020): one question
  assert.equal(r.status, 0, r.out);
  assert.deepEqual(field(recFor(s.h.HOME, p), 'pair').map(f => f[2]), ['claude']);
});

test('RF-3.E1: in a terminal, "-" skips the project', { skip: NEED_PTY }, t => {
  const s = setup(t);
  const p = project(s, 'one');
  const r = pty(path.join(s.clone, 'bin/rigorkit'), ['scan', s.work], { env: envFor(s.h), cwd: s.h.HOME, steps: [['Register them with the suggested tools?', 'e'], ['tools for', '-']] }); // AMEND-1 (020)
  assert.equal(r.status, 0, r.out);
  assert.equal(recFor(s.h.HOME, p), undefined);
});

test('RF-3.F1: without a terminal or --tools the project is skipped and listed', t => {
  const s = setup(t);
  const p = project(s, 'one');
  const r = s.rk([s.work]);
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /skipped/);
  assert.ok(r.out.includes(p));
  assert.equal(recFor(s.h.HOME, p), undefined);
});

test('RF-4.H1: copies matching any 0.1.0 commit keep their fingerprint', t => {
  const s = setup(t);
  const a = project(s, 'a', { skills: { 'sdd-spec': SPEC_A } }), b = project(s, 'b', { skills: { 'sdd-spec': SPEC_B } });
  assert.equal(s.rk(['--tools', 'claude', s.work]).status, 0);
  for (const p of [a, b]) {
    const rec = recFor(s.h.HOME, p);
    assert.deepEqual(field(rec, 'version').map(f => f[1]), ['0.1.0']);
    assert.deepEqual(field(rec, 'pair').map(f => `${f[1]}/${f[2]}`), ['sdd/claude']);
    const c = field(rec, 'copy').find(f => f[4] === path.join(p, '.claude/skills/sdd-spec'));
    assert.ok(c, rec); assert.match(c[5], HEX);
  }
});

test('RF-4.E1: edited and agent copies get "-", unknown items are only reported', t => {
  const s = setup(t);
  const p = project(s, 'one', { skills: { 'sdd-spec': '# edited by the owner\n', 'old-skill': '# gone\n' }, agents: ['sdd-reviewer'] });
  const r = s.rk(['--tools', 'claude', s.work]);
  assert.equal(r.status, 0, r.out);
  const rec = recFor(s.h.HOME, p);
  assert.equal(field(rec, 'copy').find(f => f[4].endsWith('/sdd-spec'))[5], '-');
  assert.equal(field(rec, 'copy').find(f => f[4].endsWith('/sdd-reviewer.md'))[5], '-');
  assert.equal(field(rec, 'copy').find(f => f[4].endsWith('/old-skill')), undefined);
  assert.match(r.out, /old-skill/);
});

test('RF-4.S1: no git runs in a scanned project; an escape path is not recorded', t => {
  const s = setup(t);
  const p = project(s, 'one');
  const marker = path.join(s.h.root, 'ran');
  git(p, ['init', '-q']);
  writeFileSync(path.join(s.h.root, 'fsm'), `#!/bin/sh\ntouch '${marker}'\nexit 1\n`); chmodSync(path.join(s.h.root, 'fsm'), 0o755);
  git(p, ['config', 'core.fsmonitor', path.join(s.h.root, 'fsm')]);
  const odd = project(s, 'esc\x1bproj');
  const r = s.rk(['--tools', 'claude', s.work]);
  assert.equal(r.status, 0, r.out);
  assert.equal(existsSync(marker), false);
  assert.equal(recFor(s.h.HOME, odd), undefined);
  assert.doesNotMatch(r.out, /\x1b/);
});

test('RF-5.H1: --dry-run prints and writes nothing', t => {
  const s = setup(t);
  project(s, 'one');
  const r = s.rk(['--dry-run', '--tools', 'claude', s.work]);
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /would register/);
  assert.equal(existsSync(PROJECTS(s.h.HOME)), false);
});

test('RF-6.H1: --save adds the folder to scan_paths and keeps other keys', t => {
  const s = setup(t);
  project(s, 'one');
  config(s.h.HOME, 'update_mode=reminder\n');
  assert.equal(s.rk(['--save', '--tools', 'claude', s.work]).status, 0);
  const text = readFileSync(CONF(s.h.HOME), 'utf8');
  assert.match(text, /^update_mode=reminder$/m);
  assert.match(text, new RegExp(`^scan_paths=.*${s.work.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'm'));
  assert.equal(statSync(CONF(s.h.HOME)).mode & 0o077, 0);
});

const gen = root => run(process.execPath, [path.join(repo, 'tools/generate-man.mjs'), '--check', '--root', root]);

test('RF-7.H1: the docs check passes on this repository', () => {
  const r = gen(repo);
  assert.equal(r.status, 0, r.out);
});

test('RF-7.F1: an undocumented command, pack script or config key fails the docs check', t => {
  const h = home(t);
  const copy = cp => { const d = path.join(h.root, cp); cpSync(repo, d, { recursive: true, filter: src => !/\/(\.git|node_modules|site)(\/|$)/.test(src) }); return d; };
  const a = copy('a');
  writeFileSync(path.join(a, 'README.md'), readFileSync(path.join(a, 'README.md'), 'utf8').replaceAll('rigorkit scan', 'rigorkit sc4n'));
  assert.match(gen(a).out, /scan/);
  const b = copy('b');
  writeFileSync(path.join(b, 'packs/core/scripts/undocumented-helper'), '#!/bin/sh\n');
  assert.match(gen(b).out, /undocumented-helper/);
  const c = copy('c');
  writeFileSync(path.join(c, 'lib/notice.sh'), readFileSync(path.join(c, 'lib/notice.sh'), 'utf8') + '\n# x=$(conf foo_bar)\n');
  assert.match(gen(c).out, /foo_bar/);
  for (const d of [a, b, c]) assert.notEqual(gen(d).status, 0);
});

test('RF-8.H1: help, man and README document scan', () => {
  const help = readFileSync(path.join(repo, 'help/scan.txt'), 'utf8');
  for (const w of ['scan_paths', 'scan_exclude', '--save', '--tools', '--dry-run']) assert.ok(help.includes(w), w);
  assert.match(readFileSync(path.join(repo, 'help/rigorkit.txt'), 'utf8'), /^ {2}scan /m);
  assert.match(readFileSync(path.join(repo, 'man/man1/rigorkit.1'), 'utf8'), /SCAN/);
  const readme = readFileSync(path.join(repo, 'README.md'), 'utf8');
  for (const w of ['rigorkit scan', 'scan_paths', 'scan_exclude']) assert.ok(readme.includes(w), w);
});
