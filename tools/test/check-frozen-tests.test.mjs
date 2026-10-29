// 006-factory-v2 — executable scenario coverage.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { symlinkSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { checkFrozen } from '../../packs/sdd/skills/sdd-init/scripts/factory-checks.mjs';
import { fixture, git, put, commit } from './factory-fixture.mjs';

test('RF-8.H1: clean frozen boundary passes across direct/nested glob matches', t => {
  const f = fixture(t); put(f.root, 'src/module.js', 'export const value = 1;'); commit(f.root, 'test(green): HU-1');
  assert.equal(checkFrozen(f).ok, true);
});
test('RF-8.F1: a red commit is required within the selected change', t => {
  const f = fixture(t); assert.equal(checkFrozen({ ...f, base: f.red, red: undefined }).ok, false);
});
test('RF-8.E1: missing test-path declarations fail closed', t => {
  const f = fixture(t, '# Constitution\n'); assert.equal(checkFrozen(f).ok, false);
});
test('RF-8.F2: unauthorized test edit is rejected even after a later revert', t => {
  const f = fixture(t); put(f.root, 'src/form.test.js', '// weakened'); commit(f.root, 'fix: weaken assertions');
  put(f.root, 'src/form.test.js', '// RF-8.H1: expected behavior\n'); commit(f.root, 'fix: restore assertions');
  const result = checkFrozen(f); assert.equal(result.ok, false); assert.match(result.errors.join(' '), /form.test.js/);
});
test('RF-8.H2: test amendment needs its cited spec amendment', t => {
  const f = fixture(t); put(f.root, 'src/nested/field.test.js', '// amended');
  commit(f.root, 'test(amend): HU-1 AMEND-1 corrected acceptance');
  const result = checkFrozen(f); assert.equal(result.ok, true); assert.ok(result.amended.some(x => x.path === 'src/nested/field.test.js'));
});
test('RF-8.F3: a test(amend) prefix without an amendment reference is insufficient', t => {
  const f = fixture(t); put(f.root, 'src/form.test.js', '// weakened'); commit(f.root, 'test(amend): make green');
  assert.equal(checkFrozen(f).ok, false);
});
test('RF-8.F4: staged edits cannot hide behind an unstaged restoration to HEAD', t => {
  const f = fixture(t); put(f.root, 'src/form.test.js', '// changed'); git(f.root, 'add', 'src/form.test.js');
  put(f.root, 'src/form.test.js', '// RF-8.H1: expected behavior\n'); assert.equal(checkFrozen(f).ok, false);
});
test('RF-8.F5: untracked tests and deletion/rename are still test changes', t => {
  const f = fixture(t); put(f.root, 'src/new.test.js', '// new'); assert.equal(checkFrozen(f).ok, false);
  git(f.root, 'mv', 'src/form.test.js', 'src/form.js'); commit(f.root, 'fix: hide a test'); assert.equal(checkFrozen(f).ok, false);
});
test('RF-8.S1: untrusted option values are git arguments, never shell commands', t => {
  const f = fixture(t); assert.equal(checkFrozen({ ...f, red: '--not-a-revision' }).ok, false);
});

test('RF-8.S2: editing the live constitution cannot hide a frozen test change', t => {
  const f = fixture(t);
  put(f.root, 'specs/constitution.md', '# Constitution\n## Test paths (frozen tests)\n- `other/**/*.test.js`\n');
  put(f.root, 'src/form.test.js', '// weakened'); commit(f.root, 'fix: change patterns and test');
  assert.equal(checkFrozen(f).ok, false);
});

test('RF-8.E2: a blank test glob fails closed', t => {
  const f = fixture(t, '# Constitution\n## Test paths (frozen tests)\n- \n');
  assert.equal(checkFrozen(f).ok, false);
});
test('RF-8.S3: a live symlink cannot redirect the pinned policy', t => {
  const f = fixture(t);
  put(f.root, 'specs/alternate.md', '# Constitution\n## Test paths (frozen tests)\n- `other/**/*.test.js`\n');
  const red = commit(f.root, 'test(red): HU-1 explicit policy boundary');
  unlinkSync(path.join(f.root, 'specs/constitution.md'));
  symlinkSync('alternate.md', path.join(f.root, 'specs/constitution.md'));
  put(f.root, 'src/form.test.js', '// weakened');
  commit(f.root, 'fix: redirect policy and weaken test');
  assert.equal(checkFrozen({ ...f, red }).ok, false);
});
