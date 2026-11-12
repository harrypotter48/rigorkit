// 008-updater HU-1 — repository checks: help/command/option/man drift and bin/ contents (B1).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import path from 'node:path';
import { home, cloneCopy, put, run, repo } from './rigorkit-fixture.mjs';

const generator = path.join(repo, 'tools/generate-man.mjs');
const check = root => run(process.execPath, [generator, '--check', '--root', root]);

function copy(t) {
  const h = home(t);
  return cloneCopy(path.join(h.root, 'rigorkit'));
}
function edit(file, fn) { writeFileSync(file, fn(readFileSync(file, 'utf8'))); }

test('RF-28.H1: the repository checks pass on the repository', () => {
  const r = check(repo);
  assert.equal(r.status, 0, r.out);
});

test('RF-28.E1: help naming an option the command no longer has fails naming it', t => {
  const root = copy(t);
  edit(path.join(root, 'help/install.txt'), s => s.replace(/^Options:\n/m, 'Options:\n  --frobnicate  stale option\n'));
  const r = check(root);
  assert.notEqual(r.status, 0);
  assert.match(r.out, /--frobnicate/);
});

test('RF-28.E2: help changed without regenerating the manual page fails naming it', t => {
  const root = copy(t);
  appendFileSync(path.join(root, 'help/script.txt'), '\nChanged without regenerating.\n');
  const r = check(root);
  assert.notEqual(r.status, 0);
  assert.match(r.out, /man\/man1\/rigorkit\.1/);
});

test('RF-28.F1: a new command or install option without help fails naming it', t => {
  const root = copy(t);
  // Convention enforced here: one dispatch arm per line, the catch-all arm last.
  edit(path.join(root, 'bin/rigorkit'), s => {
    const lines = s.split('\n');
    const i = lines.findIndex(l => /^\s*\*\)/.test(l));
    assert.ok(i > 0, 'dispatch catch-all arm found');
    lines.splice(i, 0, '  doctor) exit 0 ;;');
    return lines.join('\n');
  });
  const cmd = check(root);
  assert.notEqual(cmd.status, 0);
  assert.match(cmd.out, /doctor/);

  const root2 = copy(t);
  edit(path.join(root2, 'install.sh'), s => s.replace(/^(\s*)--force\)/m, '$1--frob) shift ;;\n$1--force)'));
  const opt = check(root2);
  assert.notEqual(opt.status, 0);
  assert.match(opt.out, /--frob\b/);
});

test('RF-61.F1: a file other than rigorkit in bin/ fails the checks naming it', t => {
  const root = copy(t);
  put(path.join(root, 'bin/extra'), '#!/bin/sh\n', 0o755);
  const r = check(root);
  assert.notEqual(r.status, 0);
  assert.match(r.out, /bin\/extra/);
});

test('PC-4: rigorkit execs the resolved script with unchanged arguments and never evals', () => {
  const src = readFileSync(path.join(repo, 'bin/rigorkit'), 'utf8');
  const code = src.split('\n').filter(l => !/^\s*#/.test(l)).join('\n');
  assert.doesNotMatch(code, /\beval\b/);
  assert.match(code, /exec "\$\w+" "\$@"/);
  assert.match(src, /^#!\/bin\/sh\n/);
});
