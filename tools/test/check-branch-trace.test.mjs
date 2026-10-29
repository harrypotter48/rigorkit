// 006-factory-v2 — executable scenario coverage.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { checkTrace, checkTraceRepository } from '../../packs/sdd/skills/sdd-init/scripts/factory-checks.mjs';
import { fixture, put, commit, git } from './factory-fixture.mjs';
const diff = body => `diff --git a/src/form.js b/src/form.js\n--- a/src/form.js\n+++ b/src/form.js\n@@ -1,1 +1,2 @@\n${body}\n`;
test('RF-9.H1: a scenario reference in the current hunk covers a branch', () => {
  assert.equal(checkTrace({ diff: diff('+// RF-1.H1\n+if (visible) show();') }).ok, true);
});
test('RF-9.E1: an invariant reference is accepted', () => {
  assert.equal(checkTrace({ diff: diff('+// INV-1\n+return option ?? fallback;') }).ok, true);
});
test('RF-9.F1: an unexplained added branch is reported with its location', () => {
  const r = checkTrace({ diff: diff('+if (visible) show();') }); assert.equal(r.ok, false); assert.match(r.errors.join(' '), /src\/form.js:1/);
});
test('RF-9.F2: deleted references cannot justify newly added code', () => {
  assert.equal(checkTrace({ diff: diff('-// RF-1.H1\n+if (visible) show();') }).ok, false);
});
test('RF-9.E2: text in comments/strings and optional chaining are not branches', () => {
  assert.equal(checkTrace({ diff: diff('+const text = "if (x) a || b";\n+const name = obj?.name;') }).ok, true);
});
test('RF-9.F3: a marker in a previous hunk does not cover another hunk', () => {
  assert.equal(checkTrace({ diff: diff('+// RF-1.H1\n+if (a) run();') + '@@ -20,0 +20,1 @@\n+if (b) run();\n' }).ok, false);
});
test('RF-9.E3: actual git diff includes untracked source while excluding prose', t => {
  const f = fixture(t); put(f.root, 'src/new.js', 'if (visible) show();\n');
  assert.equal(checkTraceRepository(f).ok, false);
  put(f.root, 'src/new.js', '// RF-1.H1\nif (visible) show();\n'); put(f.root, 'notes.md', 'if (anything)');
  assert.equal(checkTraceRepository(f).ok, true);
});

test('RF-9.F4: staged branches cannot hide behind worktree restoration', t => {
  const f = fixture(t);
  put(f.root, 'src/module.js', 'export const value = 1;\n');
  const base = commit(f.root, 'fixture source');
  put(f.root, 'src/module.js', 'if (visible) show();\n');
  git(f.root, 'add', 'src/module.js');
  put(f.root, 'src/module.js', 'export const value = 1;\n');
  assert.equal(checkTraceRepository({ ...f, base }).ok, false);
});
test('RF-9.F5: executable template interpolations require traceability', () => {
  for (const expression of [
    'const out = `${visible ? show() : hide()}`;',
    'const out = `prefix ${value || fallback}`;',
    'const out = `outer ${`inner ${value ?? fallback}`}`;',
    'const out = `text ${(() => { if (visible) show(); })()}`;',
  ]) assert.equal(checkTrace({ diff: diff('+' + expression) }).ok, false, expression);
});
test('RF-9.E5: template text is ignored and cited interpolations pass', () => {
  assert.equal(checkTrace({ diff: diff('+const text = `if (x) a || b`;') }).ok, true);
  assert.equal(checkTrace({ diff: diff('+// RF-1.H1\n+const text = `${value ?? fallback}`;') }).ok, true);
});
