// 008-updater HU-1 — `rigorkit` command: help, manual page and helper scripts (B1).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, appendFileSync } from 'node:fs';
import path from 'node:path';
import { home, cloneCopy, put, stubScript, toolbox, run, snapshot, has, repo } from './rigorkit-fixture.mjs';

const COMMANDS = ['install', 'update', 'script', 'help'];

function setup(t, { clonePath } = {}) {
  const h = home(t);
  const clone = cloneCopy(clonePath ? path.join(h.root, clonePath) : path.join(h.HOME, '.rigorkit'));
  const custom = path.join(h.HOME, '.rigorkit', 'custom');
  // Official helper replaced by a stub so a run is observable.
  stubScript(path.join(clone, 'packs/core/scripts/test-summary'), 'official');
  const rk = (args, opts = {}) => run(path.join(clone, 'bin/rigorkit'), args, { ...opts, env: { HOME: h.HOME, TMPDIR: h.TMPDIR, ...(opts.env || {}) } });
  const helpText = name => readFileSync(path.join(clone, 'help', `${name}.txt`), 'utf8');
  return { ...h, clone, custom, rk, helpText };
}

// --- RF-47: one way to call each helper script -------------------------------------------
test('RF-47.H1: official script runs when no custom one exists, args passed unchanged', t => {
  const s = setup(t);
  const r = s.rk(['script', 'test-summary', 'a b', '$x', '']);
  assert.equal(r.status, 0, r.out);
  assert.equal(r.stdout, 'official [a b] [$x] []\n');
});

test('RF-47.E1: custom-area script wins over the official one', t => {
  const s = setup(t);
  stubScript(path.join(s.custom, 'scripts/test-summary'), 'custom');
  const r = s.rk(['script', 'test-summary']);
  assert.equal(r.status, 0, r.out);
  assert.equal(r.stdout, 'custom\n');
});

test('RF-47.E2: a development clone uses ~/.rigorkit/custom/scripts', t => {
  const s = setup(t, { clonePath: 'dev/rigorkit' });
  stubScript(path.join(s.custom, 'scripts/test-summary'), 'custom');
  const r = s.rk(['script', 'test-summary']);
  assert.equal(r.status, 0, r.out);
  assert.equal(r.stdout, 'custom\n');
});

test('RF-47.E3: --help after the script name goes to the script and its status is returned', t => {
  const s = setup(t);
  stubScript(path.join(s.clone, 'packs/core/scripts/test-summary'), 'official', { status: 3 });
  const r = s.rk(['script', 'test-summary', '--help']);
  assert.equal(r.status, 3, r.out);
  assert.equal(r.stdout, 'official [--help]\n');
});

test('RF-47.E4: custom packs resolve in byte order; a replaced official pack is not searched', t => {
  const s = setup(t);
  stubScript(path.join(s.custom, 'packs/mine/scripts/foo'), 'mine');
  stubScript(path.join(s.custom, 'packs/zeta/scripts/foo'), 'zeta');
  put(path.join(s.custom, 'packs/core/README.md'), 'custom core without scripts\n');
  const foo = s.rk(['script', 'foo']);
  assert.equal(foo.status, 0, foo.out);
  assert.equal(foo.stdout, 'mine\n');
  const ts = s.rk(['script', 'test-summary']);
  assert.notEqual(ts.status, 0);
  assert.doesNotMatch(ts.stdout, /official/);
  assert.match(ts.out, /test-summary/);
  stubScript(path.join(s.custom, 'packs/core/scripts/test-summary'), 'custom-core');
  const again = s.rk(['script', 'test-summary']);
  assert.equal(again.stdout, 'custom-core\n');
});

test('RF-47.F1: non-executable custom script is named; the official one does not run', t => {
  const s = setup(t);
  stubScript(path.join(s.custom, 'scripts/test-summary'), 'custom', { mode: 0o644 });
  const r = s.rk(['script', 'test-summary']);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /custom\/scripts\/test-summary/);
  assert.doesNotMatch(r.stdout, /official|custom/);
});

test('RF-47.F2: unknown script name is named and exits non-zero', t => {
  const s = setup(t);
  const r = s.rk(['script', 'nope']);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /nope/);
  assert.equal(r.stdout, '');
});

test('RF-47.F3: missing name or a name starting with - is refused and nothing runs', t => {
  const s = setup(t);
  stubScript(path.join(s.custom, 'scripts/-x'), 'dash');
  for (const [args, named] of [[['script'], /name/i], [['script', '-x'], /-x/]]) {
    const r = s.rk(args);
    assert.notEqual(r.status, 0, args.join(' '));
    assert.doesNotMatch(r.stdout, /dash|official/);
    assert.match(r.stderr, named, args.join(' '));
    assert.doesNotMatch(r.stderr, /not implemented/);
  }
});

test('RF-47.S1: names with / or .. are refused naming them; nothing runs', t => {
  const s = setup(t);
  stubScript(path.join(s.custom, 'scripts/a/b'), 'nested');
  for (const name of ['../../bin/sh', 'a/b', '..', 'x..y']) {
    const r = s.rk(['script', name]);
    assert.notEqual(r.status, 0, name);
    assert.ok(r.stderr.includes(name), `${name}: ${r.stderr}`);
    assert.equal(r.stdout, '', name);
  }
});

// --- RF-25: command list -----------------------------------------------------------------
test('RF-25.H1: rigorkit help lists every command once, in Definitions order', t => {
  const s = setup(t);
  const r = s.rk(['help']);
  assert.equal(r.status, 0, r.out);
  assert.equal(r.stdout, s.helpText('rigorkit'));
  const listed = r.stdout.split('\n').map(l => l.match(/^ {2}(\S+)/)?.[1]).filter(Boolean);
  assert.deepEqual(listed, COMMANDS);
});

test('RF-25.E1: rigorkit, --help and -h print the same list and exit 0', t => {
  const s = setup(t);
  const ref = s.rk(['help']).stdout;
  for (const args of [[], ['--help'], ['-h']]) {
    const r = s.rk(args);
    assert.equal(r.status, 0, args.join(' '));
    assert.equal(r.stdout, ref, args.join(' '));
  }
});

test('RF-25.F1: unknown command shows an error and the command list, exit non-zero', t => {
  const s = setup(t);
  const r = s.rk(['frobnicate']);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /frobnicate/);
  assert.ok(r.out.includes(s.helpText('rigorkit')), 'command list shown');
});

// --- RF-26: per-command help -------------------------------------------------------------
test('RF-26.H1: rigorkit help install shows options, examples and files it can write', t => {
  const s = setup(t);
  const r = s.rk(['help', 'install']);
  assert.equal(r.status, 0, r.out);
  assert.equal(r.stdout, s.helpText('install'));
  for (const section of ['Usage:', 'Options:', 'Examples:', 'Writes:']) assert.match(r.stdout, new RegExp(`^${section}`, 'm'));
  for (const opt of ['--pack', '--agent', '--project', '--global', '--force', '--dry-run', '--uninstall-rules', '--version', '--list', '--help']) {
    assert.match(r.stdout, new RegExp(`^ {2}${opt}\\b`, 'm'), opt);
  }
});

// install.sh owns `--help` (plan: RF-46/Q6); its pre-scan lands in B2 T7.
test('RF-26.E1: install --help with valid options shows help and installs nothing', { todo: 'green after B2 T7 (install.sh --help pre-scan)' }, t => {
  const s = setup(t);
  const before = snapshot(s.HOME);
  const r = s.rk(['install', '--help', '--pack', 'sdd', '--agent', 'claude', '--global']);
  assert.equal(r.status, 0, r.out);
  assert.equal(r.stdout, s.helpText('install'));
  assert.deepEqual(snapshot(s.HOME), before);
});

test('RF-26.E2: install --bogus --help shows help and exits 0', { todo: 'green after B2 T7 (install.sh --help pre-scan)' }, t => {
  const s = setup(t);
  const r = s.rk(['install', '--bogus', '--help']);
  assert.equal(r.status, 0, r.out);
  assert.equal(r.stdout, s.helpText('install'));
});

test('RF-26.E3: rigorkit script --help shows the script help and runs nothing', t => {
  const s = setup(t);
  const r = s.rk(['script', '--help']);
  assert.equal(r.status, 0, r.out);
  assert.equal(r.stdout, s.helpText('script'));
  for (const name of ['script', 'help']) assert.equal(s.rk(['help', name]).stdout, s.helpText(name));
});

test('RF-26.F1: help for an unknown command shows an error and the list, exit non-zero', t => {
  const s = setup(t);
  const r = s.rk(['help', 'nope']);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /nope/);
  assert.ok(r.out.includes(s.helpText('rigorkit')));
});

// --- RF-27: manual page ------------------------------------------------------------------
function manText(clone, env = {}) {
  const r = run('/bin/sh', ['-c', 'man rigorkit | col -b'], { env: { MANPATH: path.join(clone, 'man'), MANPAGER: 'cat', PAGER: 'cat', ...env } });
  return r;
}

test('RF-27.H1: man rigorkit shows every command and install option', { skip: !has('man') && 'man not installed (D4)' }, t => {
  const s = setup(t);
  const r = manText(s.clone, { HOME: s.HOME });
  assert.equal(r.status, 0, r.out);
  for (const c of COMMANDS) assert.match(r.stdout, new RegExp(`\\b${c}\\b`), c);
  for (const opt of ['--pack', '--agent', '--project', '--global', '--force', '--dry-run', '--uninstall-rules', '--version', '--list']) assert.ok(r.stdout.includes(opt), opt);
});

test('RF-27.E1: the generator picks up a help change', { skip: !has('man') && 'man not installed (D4)' }, t => {
  const s = setup(t);
  appendFileSync(path.join(s.clone, 'help/install.txt'), '\nNote: generator marker 7f3a.\n');
  const g = run(process.execPath, [path.join(repo, 'tools/generate-man.mjs'), '--root', s.clone]);
  assert.equal(g.status, 0, g.out);
  assert.match(manText(s.clone, { HOME: s.HOME }).stdout, /generator marker 7f3a/);
});

test('RF-27.F1: rigorkit help works without man', t => {
  const s = setup(t);
  const PATH = toolbox(t, s.root, { without: ['man', 'groff', 'nroff', 'mandoc', 'less'] });
  const r = s.rk(['help'], { env: { PATH } });
  assert.equal(r.status, 0, r.out);
  assert.equal(r.stdout, s.helpText('rigorkit'));
});
