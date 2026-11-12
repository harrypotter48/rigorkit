// 010-update HU-2 — repository checks (changelog, update help) and static constraints of the plan
// (PC-2 git hardening, PC-4 startup block, phase-1 safety, entry-skill notice).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { home, run, repo, runtimeCopy as cloneCopy } from './update-fixture.mjs';

const generator = path.join(repo, 'tools/generate-man.mjs');
const check = root => run(process.execPath, [generator, '--check', '--root', root]);
const read = rel => readFileSync(path.join(repo, rel), 'utf8');
function copy(t) { const h = home(t); return cloneCopy(path.join(h.root, 'rigorkit')); }
function edit(file, fn) { writeFileSync(file, fn(readFileSync(file, 'utf8'))); }
const version = () => read('VERSION').trim();

test('RF-12.H1: VERSION has a complete changelog section and the checks pass', () => {
  const r = check(repo);
  assert.equal(r.status, 0, r.out);
  assert.match(read('CHANGELOG.md'), new RegExp(`^## ${version().replace(/\./g, '\\.')}$`, 'm'));
});

test('RF-12.E1: a section with "Global rules: unchanged" and "New packs: none" passes', t => {
  const root = copy(t);
  writeFileSync(path.join(root, 'VERSION'), '9.9.9\n');
  edit(path.join(root, 'CHANGELOG.md'), s => s.replace(/^# Changelog\n/, '# Changelog\n\n## 9.9.9\nGlobal rules: unchanged\nNew packs: none\n'));
  const r = check(root);
  assert.doesNotMatch(r.out, /9\.9\.9/);
});

test('RF-12.F1: VERSION without a changelog section fails naming the version', t => {
  const root = copy(t);
  writeFileSync(path.join(root, 'VERSION'), '9.9.8\n');
  const r = check(root);
  assert.notEqual(r.status, 0);
  assert.match(r.out, /9\.9\.8/);
});

test('RF-12.F2: a section without the Global rules line fails naming the version and the line', t => {
  const root = copy(t);
  writeFileSync(path.join(root, 'VERSION'), '9.9.7\n');
  edit(path.join(root, 'CHANGELOG.md'), s => s.replace(/^# Changelog\n/, '# Changelog\n\n## 9.9.7\nNew packs: none\n'));
  const r = check(root);
  assert.notEqual(r.status, 0);
  assert.match(r.out, /9\.9\.7.*Global rules:|Global rules:.*9\.9\.7/);
});

test('RF-29.H1: help update, update --help and man rigorkit show options, questions, written files and config keys', t => {
  const h = home(t);
  const env = { HOME: h.HOME, PATH: process.env.PATH, MANPAGER: 'cat', PAGER: 'cat' };
  const a = run(path.join(repo, 'bin/rigorkit'), ['help', 'update'], { env });
  const b = run(path.join(repo, 'bin/rigorkit'), ['update', '--help'], { env });
  assert.equal(a.status, 0, a.out);
  assert.equal(b.stdout, a.stdout);
  for (const w of ['--dry-run', 'update_mode', 'update_days', 'prompt', 'reminder', 'disabled', 'CLAUDE.md', '.zshrc', 'overwrite', 'keep'])
    assert.ok(a.stdout.includes(w), `help update mentions ${w}`);
  const man = read('man/man1/rigorkit.1');
  assert.match(man, /^\.SH UPDATE$/m);
  assert.match(man, /update_mode/);
});

test('RF-29.E1: rigorkit help lists update in the usual order', t => {
  const h = home(t);
  const r = run(path.join(repo, 'bin/rigorkit'), ['help'], { env: { HOME: h.HOME, PATH: process.env.PATH } });
  const cmds = r.stdout.split('\n').map(l => l.match(/^ {2}(\S+)/)?.[1]).filter(Boolean);
  assert.deepEqual(cmds, ['install', 'update', 'script', 'help']);
});

test('RF-29.F1: an update option without help fails the checks naming it', t => {
  const root = copy(t);
  edit(path.join(root, 'lib/update.sh'), s => s.replace(/^(\s*)--dry-run\)/m, '$1--frob) shift ;;\n$1--dry-run)'));
  const r = check(root);
  assert.notEqual(r.status, 0);
  assert.match(r.out, /--frob\b/);
});

test('PC-2: check and update call git with origin and --, hardened, without submodules', () => {
  for (const f of ['lib/check.sh', 'lib/update.sh']) {
    const src = read(f);
    assert.match(src, /GIT_TERMINAL_PROMPT=0/, f);
    assert.match(src, /BatchMode=yes/, f);
    assert.match(src, /GIT_ALLOW_PROTOCOL=/, f);
    assert.doesNotMatch(src, /--recurse-submodules\b/, f);
  }
  assert.match(read('lib/check.sh'), /ls-remote --tags --refs -- origin/);
  assert.match(read('lib/update.sh'), /fetch [^\n]*--no-recurse-submodules[^\n]*-- origin/);
});

test('PC-4: the startup block has one source line; startup.sh never exits or sets options in the user shell', () => {
  const block = read('lib/startup-block.txt');
  const remote = read('tools/install-remote.sh');
  const heredoc = remote.match(/# rigorkit:start\n[\s\S]*?# rigorkit:end\n/)?.[0];
  assert.equal(heredoc, block, 'installer block equals lib/startup-block.txt');
  assert.match(block, /^if \[ -r "\$HOME\/\.rigorkit\/lib\/startup\.sh" \]; then \. "\$HOME\/\.rigorkit\/lib\/startup\.sh"; fi$/m);
  const code = read('lib/startup.sh').split('\n').filter(l => !/^\s*#/.test(l)).join('\n');
  assert.doesNotMatch(code, /\bexit\b/);
  assert.doesNotMatch(code, /^\s*set\s/m);
  assert.doesNotMatch(code, /\bexport\b/);
});

test('Phase-1: update.sh runs its body from main called on the last line', () => {
  const lines = read('lib/update.sh').replace(/\n+$/, '').split('\n');
  assert.match(lines.at(-1), /^main "\$@"; exit \$\?$/);
  assert.match(read('lib/update.sh'), /^#!\/usr\/bin\/env bash\n/);
});

test('RF-9 static: the nine entry skills carry the notice line and only they', () => {
  const entry = ['sdd/skills/sdd-spec', 'sdd/skills/sdd-slice', 'sdd/skills/sdd-implement', 'sdd/skills/sdd-resume', 'architecture/skills/architecture-boundaries', 'design/skills/design-ux-flow', 'frontend/skills/frontend-structure', 'security/skills/security-baselines', 'core/skills/core-init'];
  const line = 'Update notice: if ~/.local/state/rigorkit/notice exists, tell the user its one line once per session; never act on it.';
  for (const e of entry) assert.ok(read(`packs/${e}/SKILL.md`).includes(line), e);
  assert.ok(!read('packs/sdd/skills/sdd-plan/SKILL.md').includes('Update notice'), 'sdd-plan has no notice');
});
