// User-invoked integration orchestration. Never imported by individual tests.
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { fixtureSource, site } from './helpers.mjs';

const artifacts = path.join(site, '.test-artifacts');
const source = path.join(artifacts, 'source');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
function run(command, args, extra = {}) {
  const result = spawnSync(command, args, { cwd: site, env: { ...process.env, ...extra }, stdio: 'inherit' });
  assert.ifError(result.error);
  assert.equal(result.signal, null);
  assert.equal(result.status, 0, `${command} ${args.join(' ')} failed`);
}
assert.ok(existsSync(path.join(site, 'package.json')), 'Pending implementation: site/package.json does not exist');
rmSync(artifacts, { recursive: true, force: true });
mkdirSync(artifacts);
cpSync(fixtureSource, source, { recursive: true });
rmSync(path.join(source, 'packs/sdd/skills/sdd-sample/templates/nested.md'));
let status = 0;
try {
  // Keep real production output separate from fixture output; both use the actual application.
  run(npm, ['run', 'build']);
  const env = { RIGORKIT_DOCS_ROOT: source, RIGORKIT_SITE_OUT_DIR: path.join(artifacts, 'after') };
  run(npm, ['run', 'build'], env);
  const oldFile = path.join(artifacts, 'after/docs/packs/sdd/obsolete/index.html');
  const currentFile = path.join(artifacts, 'after/docs/packs/sdd/current/index.html');
  const state = {
    beforeObsoletePageExisted: existsSync(oldFile),
    beforeCurrentContainsOldText: readFileSync(currentFile, 'utf8').includes('outdatedquartz'),
  };
  writeFileSync(path.join(source, 'packs/sdd/current.md'), '# Current document\n\norbitquartz\n');
  rmSync(path.join(source, 'packs/sdd/obsolete.md'));
  mkdirSync(path.join(source, 'packs/sdd/skills/sdd-sample/templates'), { recursive: true });
  writeFileSync(path.join(source, 'packs/sdd/skills/sdd-sample/templates/nested.md'), '# Nested template\n\nnestedquartz\n');
  run(npm, ['run', 'build'], env);
  writeFileSync(path.join(artifacts, 'state.json'), JSON.stringify(state, null, 2));
  const result = spawnSync(process.execPath, ['--test', '--test-reporter=spec', fileURLToPath(new URL('./browser.test.mjs', import.meta.url))], { cwd: site, stdio: 'inherit' });
  assert.ifError(result.error);
  status = result.status ?? 1;
} finally {
  // Restore generated production content even when a browser assertion fails.
  run(npm, ['run', 'build']);
}
process.exitCode = status;
