// 021-terminal-colors: real CLI fixtures. No product functions are stubbed.
// RF-1.H1, RF-2.E2, RF-4.H1, RF-6.H1, RF-7.S1: shared real-CLI fixture for
// terminal eligibility, exact bytes, script ownership and safe release display.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { home, runtimeCopy, envFor, run, put, has, testRemote, cloneAt, writeState, now, STATE, RECORD } from './update-fixture.mjs';

export { run, put, has, STATE, RECORD };
const here = path.dirname(fileURLToPath(import.meta.url));
export const NEED_PTY = has('python3') ? false : 'python3 unavailable: real terminal evidence pending';
export const BASE = JSON.parse(readFileSync(path.join(here, 'fixtures/021-terminal-colors/plain.json'), 'utf8'));
export const SGR = Object.freeze({ plain: 0, error: 31, success: 32, warning: 33, question: 33, heading: 36 });
export const Q = 'Register them with the suggested tools? [y = all / e = choose each / n = none]';
export const HELP_NOTE = 'Colors are shown only in terminals. Set NO_COLOR=1 or TERM=dumb to disable them.';
const HEADER = "---\nname: probe-skill\ndescription: 'Temporary terminal test skill.'\n---\n";
const BODY = 'shared context\nREMOVE-ME\nerror warning +context\nend context\n';
const NEXT_BODY = 'shared context\nADDED-LINE\nerror warning +context\nend context\n';

export function stripOwned(text) { return text.replace(/\x1b\[(?:0|31|32|33|36)m/g, ''); }
export function stateAtEnd(text) {
  let state = 0;
  for (const match of text.matchAll(/\x1b\[(0|31|32|33|36)m/g)) state = Number(match[1]);
  return state;
}
export function assertColor(text, needle, color) {
  const plain = stripOwned(text);
  const start = plain.indexOf(needle);
  assert.ok(start >= 0, `missing ${JSON.stringify(needle)} in ${text.length} output characters`);
  let state = 0, pos = 0;
  for (let i = 0; i < text.length;) {
    const match = /^\x1b\[(0|31|32|33|36)m/.exec(text.slice(i));
    if (match) { state = Number(match[1]); i += match[0].length; continue; }
    if (pos >= start && pos < start + needle.length && !/\s/.test(text[i])) {
      assert.equal(state, color, `${JSON.stringify(needle)} must use SGR ${color}; character ${pos - start}`);
    }
    pos++; i++;
  }
}
export const noEsc = text => assert.doesNotMatch(text, /\x1b/, `unexpected terminal controls: ${JSON.stringify(text)}`);
export function expectedRootHelp() { return BASE.help.rigorkit + '\n' + HELP_NOTE + '\n'; }

function configure(h) {
  put(path.join(h.HOME, '.config/rigorkit/config'), 'update_mode=disabled\nupdate_days=1\n');
  writeState(h.HOME, { checked: now(), newest: '' });
}
function commandEnvironment(h) { return envFor(h, { TERM: 'xterm-256color', NO_COLOR: '' }); }
export function setup(t) {
  const h = home(t);
  const clone = runtimeCopy(path.join(h.HOME, '.rigorkit'));
  configure(h);
  const s = { h, clone, env: commandEnvironment(h), serial: 0 };
  s.cli = path.join(clone, 'bin/rigorkit');
  s.version = readFileSync(path.join(clone, 'VERSION'), 'utf8').trim();
  return s;
}
export function plain(s, args, options = {}) {
  const { env = {}, ...rest } = options;
  return run(s.cli, args, { env: { ...s.env, NO_COLOR: '1', ...env }, cwd: s.h.HOME, input: '', ...rest });
}
export function terminal(s, args, options = {}) {
  const { env = {}, stdin = 'tty', stdout = 'tty', stderr = 'tty', steps = [], timeout = 60, command } = options;
  const config = path.join(s.h.root, `021-capture-${s.serial++}.json`);
  writeFileSync(config, JSON.stringify({ stdin, stdout, stderr, steps, timeout }));
  const argv = command ?? [s.cli, ...args];
  const processEnv = { ...s.env, ...env };
  for (const [key, value] of Object.entries(processEnv)) if (value === undefined) delete processEnv[key];
  const p = spawnSync('python3', [path.join(here, '021-pty-run.py'), config, '--', ...argv], {
    env: processEnv, cwd: s.h.HOME, encoding: 'utf8', timeout: (timeout + 5) * 1000, maxBuffer: 8 * 1024 * 1024,
  });
  assert.ifError(p.error);
  assert.equal(p.status, 0, `terminal harness failed structurally: ${p.stderr}\n${p.stdout}`);
  const result = JSON.parse(p.stdout);
  assert.equal(result.timedOut, false, `terminal command timed out: ${JSON.stringify(result)}`);
  assert.deepEqual(result.unmatchedSteps, [], 'an expected real CLI question was not reached');
  for (const channel of ['stdout', 'stderr']) {
    result[`raw${channel}`] = Buffer.from(result[channel], 'base64');
    result[channel] = result[`raw${channel}`].toString('utf8');
  }
  result.sent = result.sent.map(event => Object.fromEntries(Object.entries(event).map(([name, value]) => [name, Buffer.from(value, 'base64').toString('utf8')])));
  return result;
}
export function dual(s) {
  mkdirSync(path.join(s.clone, 'custom/packs/all'), { recursive: true });
  return ['install', '--list']; // real installer: stdout heading + invalid-pack stderr warning
}
export function project(s, name = 'one') {
  const dir = path.join(s.h.root, 'work', name);
  mkdirSync(path.join(dir, '.claude'), { recursive: true });
  put(path.join(dir, '.rigorkit-version'), '0.1.0\n');
  return dir;
}
export function scanExpected(p, { dry = false } = {}) {
  return `found 1 new projects:\n  1. ${p} (0.1.0) -> claude\n[1/1] ${p}\n${dry ? 'would register' : 'registered'} ${p} (claude) · 0.1.0 · 0 copies, 0 without a 0.1.0 match\nscan: 1 found, 1 ${dry ? 'would be registered' : 'registered'}, 0 already registered, 0 skipped\n`;
}
export function records(s) {
  const dir = path.join(STATE(s.h.HOME), 'projects');
  return existsSync(dir) ? readdirSync(dir).filter(n => /^[a-f0-9]{16}$/.test(n)).map(n => readFileSync(path.join(dir, n), 'utf8')) : [];
}
export function addProbe(root, body = BODY) {
  put(path.join(root, 'packs/probe/skills/probe-skill/SKILL.md'), HEADER + body);
  put(path.join(root, 'packs/probe/rules.md'), 'Fixture rule.\n');
}
export function updateSetup(t, { extra = '', changelogExtra = '', hostileHelper = false } = {}) {
  const h = home(t);
  configure(h);
  const remote = testRemote(t, h.root);
  remote.release('0.3.0', dir => addProbe(dir));
  const clone = cloneAt(h.HOME, remote.bare, 'v0.3.0');
  const s = { h, clone, env: commandEnvironment(h), serial: 0, remote, version: '0.3.0' };
  s.cli = path.join(clone, 'bin/rigorkit');
  const installed = run(s.cli, ['install', '--global', '--pack', 'probe', '--agent', 'claude'], { env: { ...s.env, NO_COLOR: '1' }, input: '', cwd: h.HOME });
  assert.equal(installed.status, 0, installed.out);
  s.copy = path.join(h.HOME, '.claude/skills/probe-skill');
  s.file = path.join(s.copy, 'SKILL.md');
  appendFileSync(s.file, 'OWNER-EDIT\n');
  s.mine = readFileSync(s.file, 'utf8');
  s.editedQuestion = `${s.copy} was edited. Overwrite or keep? [o/k]`;
  s.marker = path.join(h.root, 'downloaded-code-ran');
  remote.release('0.4.0', dir => {
    addProbe(dir, NEXT_BODY + extra);
    if (hostileHelper) {
      const markerLine = `\nprintf '%s' 'bad' > '${s.marker}'\n`;
      const helper = path.join(dir, 'lib/output.sh');
      put(helper, (existsSync(helper) ? readFileSync(helper, 'utf8') : '# test release helper\n') + markerLine);
    }
  }, { changelog: `## 0.4.0\nGlobal rules: unchanged\nNew packs: none\n\nTest release 0.4.0.${changelogExtra}\n` });
  return s;
}
export const keepSteps = s => [{ channel: 'stderr', expect: s.editedQuestion + ' ', send: 'k' }];
export function filesBelow(root) {
  if (!existsSync(root)) return {};
  const result = {};
  function walk(dir, prefix = '') {
    for (const item of readdirSync(dir, { withFileTypes: true })) {
      const rel = path.join(prefix, item.name), file = path.join(dir, item.name);
      if (item.isDirectory()) walk(file, rel);
      else if (item.isFile()) result[rel] = readFileSync(file).toString('base64');
    }
  }
  walk(root);
  return result;
}
