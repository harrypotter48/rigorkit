// 022-global-rules-on-install B1 — `install.sh --rules-only` (RF-9, RF-10): global rules without skills or agents.
// Real install.sh in a temp HOME; never touches the real HOME, the user's git config or the network.
// RF-IDs refer to specs/changes/022-global-rules-on-install/spec.md.
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { home, run, envFor, RECORD, runtimeCopy as cloneCopy } from './update-fixture.mjs';
import { snapshot } from './rigorkit-fixture.mjs';

const START = '<!-- rigorkit:core:start -->', END = '<!-- rigorkit:core:end -->';

function setup(t) {
  const h = home(t);
  const clone = cloneCopy(path.join(h.HOME, '.rigorkit'));
  const project = path.join(h.root, 'project');
  mkdirSync(project, { recursive: true });
  const install = (args, { cwd = h.HOME } = {}) => run('bash', [path.join(clone, 'install.sh'), ...args], { env: envFor(h), cwd });
  const claudeFile = path.join(h.HOME, '.claude/CLAUDE.md');
  const record = () => (existsSync(RECORD(h.HOME)) ? readFileSync(RECORD(h.HOME), 'utf8') : null);
  return { h, clone, project, install, claudeFile, record };
}
const lines = text => text.split('\n').filter(Boolean);
const kinds = text => lines(text).map(l => l.split('\t')[0]);

describe('022-global-rules-on-install', () => {
  // --- RF-9 -----------------------------------------------------------------------------------------------
  test('RF-9.H1: rules-only global install of core for Claude Code writes the rules block, keeps user content and copies no skill or agent', t => {
    const s = setup(t);
    mkdirSync(path.dirname(s.claudeFile), { recursive: true });
    const mine = 'my own rules\n';
    writeFileSync(s.claudeFile, mine);
    const r = s.install(['--pack', 'core', '--agent', 'claude', '--global', '--rules-only']);
    assert.equal(r.status, 0, r.out);
    const after = readFileSync(s.claudeFile, 'utf8');
    assert.ok(after.startsWith(mine), 'user content is kept byte-identical before the block');
    assert.ok(after.includes(START) && after.includes(END), 'core rules block between markers');
    assert.equal(readFileSync(`${s.claudeFile}.rigorkit.bak`, 'utf8'), mine, 'backup of the original file');
    for (const d of ['.claude/skills', '.claude/agents', '.agents', '.codex', '.cursor', '.config/opencode']) {
      assert.equal(existsSync(path.join(s.h.HOME, d)), false, `${d} must not exist: no skill or agent is copied`);
    }
    const rec = s.record();
    assert.ok(rec, 'global record written');
    assert.equal(lines(rec)[0], 'rigorkit-global-record 1');
    assert.deepEqual(kinds(rec).filter(k => k !== 'version' && k !== 'rigorkit-global-record 1'), ['rules'], 'only a rules line: no pair and no copy lines');
    const rules = lines(rec).filter(l => l.startsWith('rules\t')).map(l => l.split('\t'));
    assert.deepEqual(rules[0].slice(1, 4), ['core', 'claude', s.claudeFile]);
    assert.match(rules[0][4], /^[0-9a-f]{64}$/);
  });

  test('RF-9.E1: rules-only with a pack that has no rules writes nothing and says so', t => {
    const s = setup(t);
    const before = snapshot(s.h.HOME);
    const r = s.install(['--pack', 'sdd', '--agent', 'claude', '--global', '--rules-only']);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /no rules/i);
    assert.deepEqual(snapshot(s.h.HOME), before, 'nothing is written: no file, no record, no marker');
  });

  test('RF-9.E2: rules-only with a dry run shows the change and writes nothing', t => {
    const s = setup(t);
    const before = snapshot(s.h.HOME);
    const r = s.install(['--pack', 'core', '--agent', 'claude', '--global', '--rules-only', '--dry-run']);
    assert.equal(r.status, 0, r.out);
    assert.ok(r.out.includes(s.claudeFile), 'names the file that would change');
    assert.ok(r.out.includes('rigorkit:core:start'), 'shows the block that would be written');
    assert.deepEqual(snapshot(s.h.HOME), before);
  });

  test('RF-9.F1: rules-only for a tool without a global instruction file writes nothing and prints the block to paste', t => {
    const s = setup(t);
    const before = snapshot(s.h.HOME);
    const r = s.install(['--pack', 'core', '--agent', 'cursor', '--global', '--rules-only']);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /cursor has no global rules file/i);
    assert.match(r.out, /end of block/);
    assert.deepEqual(snapshot(s.h.HOME), before);
  });

  test('RF-9.S1: rules-only leaves edited global core skills byte-identical', t => {
    const s = setup(t);
    assert.equal(s.install(['--pack', 'core', '--agent', 'claude', '--global']).status, 0);
    const skill = path.join(s.h.HOME, '.claude/skills/core-init/SKILL.md');
    writeFileSync(skill, `${readFileSync(skill, 'utf8')}\nedited by the user\n`);
    const skills = path.join(s.h.HOME, '.claude/skills'), agents = path.join(s.h.HOME, '.claude/agents');
    const before = { skills: snapshot(skills), agents: existsSync(agents) ? snapshot(agents) : null };
    const r = s.install(['--pack', 'core', '--agent', 'claude', '--global', '--rules-only', '--force']);
    assert.equal(r.status, 0, r.out);
    assert.deepEqual(snapshot(skills), before.skills, 'edited skill copies are not touched, not even with --force');
    if (before.agents) assert.deepEqual(snapshot(agents), before.agents);
  });

  // --- RF-10 ----------------------------------------------------------------------------------------------
  test('RF-10.F1: rules-only with a project scope is a usage error and changes nothing', t => {
    const s = setup(t);
    const beforeHome = snapshot(s.h.HOME), beforeProject = snapshot(s.project);
    const r = s.install(['--pack', 'core', '--agent', 'claude', '--project', s.project, '--rules-only']);
    assert.notEqual(r.status, 0, r.out);
    assert.match(r.out, /--rules-only needs --global/);
    assert.deepEqual(snapshot(s.h.HOME), beforeHome);
    assert.deepEqual(snapshot(s.project), beforeProject);
  });

  test('RF-10.E1: rules-only with no scope is a usage error and writes nothing in the current folder or in global files', t => {
    const s = setup(t);
    const beforeHome = snapshot(s.h.HOME), beforeProject = snapshot(s.project);
    const r = s.install(['--pack', 'core', '--agent', 'claude', '--rules-only'], { cwd: s.project });
    assert.notEqual(r.status, 0, r.out);
    assert.match(r.out, /--rules-only needs --global/);
    assert.deepEqual(snapshot(s.h.HOME), beforeHome);
    assert.deepEqual(snapshot(s.project), beforeProject);
  });

  test('RF-10.S1: rules-only with a project scope leaves the project\'s shared instruction files byte-identical', t => {
    const s = setup(t);
    writeFileSync(path.join(s.project, 'AGENTS.md'), 'shared by the team\n');
    writeFileSync(path.join(s.project, 'CLAUDE.md'), '@AGENTS.md\n');
    const before = snapshot(s.project);
    const r = s.install(['--pack', 'core', '--agent', 'claude,codex', '--project', s.project, '--rules-only']);
    assert.notEqual(r.status, 0, r.out);
    assert.match(r.out, /--rules-only needs --global/);
    assert.deepEqual(snapshot(s.project), before);
  });
});
