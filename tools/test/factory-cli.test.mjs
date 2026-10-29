// 006-factory-v2 — executable scenario coverage.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cpSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { fixture, put } from './factory-fixture.mjs';
const repo = fileURLToPath(new URL('../../', import.meta.url));

test('RF-8.H3: copied setup scripts work without the rigorkit checkout', t => {
  const f = fixture(t), output = mkdtempSync(path.join(tmpdir(), 'rigorkit-copied-'));
  t.after(() => rmSync(output, { recursive: true, force: true }));
  cpSync(path.join(repo, 'packs/sdd/skills/sdd-init/scripts'), output, { recursive: true });
  const result = execFileSync(process.execPath, [path.join(output, 'check-frozen-tests.mjs'), '--root', f.root, '--base', f.base, '--red', f.red], { encoding: 'utf8' });
  assert.match(result, /frozen: PASS/);
});
test('RF-9.E4: CLI wrappers reject bad arguments and validate fixture patches', t => {
  const f = fixture(t), script = path.join(repo, 'tools/check-branch-trace.mjs');
  const bad = spawnSync(process.execPath, [script, '--unknown', 'value'], { encoding: 'utf8' });
  assert.equal(bad.status, 1); assert.match(bad.stderr, /Invalid/);
  put(f.root, 'review.patch', 'diff --git a/src/a.js b/src/a.js\n--- a/src/a.js\n+++ b/src/a.js\n@@ -0,0 +1,2 @@\n+// INV-1\n+if (ok) run();\n');
  const output = execFileSync(process.execPath, [script, '--diff', path.join(f.root, 'review.patch')], { encoding: 'utf8' });
  assert.match(output, /trace: PASS/);
});
