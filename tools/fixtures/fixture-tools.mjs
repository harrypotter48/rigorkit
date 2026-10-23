import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const repo = fileURLToPath(new URL('../../', import.meta.url));
const fixtures = fileURLToPath(new URL('./', import.meta.url));
export const skillPath = 'packs/sdd/skills/sdd-sample/SKILL.md';
export const agentPath = 'packs/sdd/agents/sdd-reader.md';
export const guidePath = 'packs/sdd/skills/sdd-sample/guide.md';
export const rulePath = 'packs/core/rules.md';

export function temporaryFixture(t, name) {
  const dir = mkdtempSync(path.join(tmpdir(), 'rigorkit-001-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  cpSync(path.join(fixtures, name), dir, { recursive: true });
  return dir;
}

export function execute(script, args, cwd) {
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd, encoding: 'utf8', timeout: 15_000, maxBuffer: 1024 * 1024,
  });
  assert.ifError(result.error);
  assert.equal(result.signal, null, 'The command must finish without a signal');
  return { ...result, output: result.stdout + result.stderr };
}

export function measure(dir, baseline = path.join(dir, 'baseline.txt')) {
  const script = path.join(repo, 'tools/measure-content.mjs');
  assert.ok(existsSync(script), 'Pending implementation: tools/measure-content.mjs does not exist (T5/T6)');
  return execute(script, ['--root', path.join(dir, 'repo'), '--baseline', baseline], dir);
}

export function check(spec, tests, cwd = repo) {
  return execute(path.join(repo, 'packs/sdd/skills/sdd-init/scripts/check-scenarios.mjs'),
    [spec, '--tests', tests], cwd);
}

export function replaceBody(file, body) {
  const original = readFileSync(file, 'utf8');
  const frontmatter = original.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
  assert.ok(frontmatter, 'The fixture needs valid frontmatter before replacing its body');
  writeFileSync(file, frontmatter[0] + body);
}

export function replaceDescription(file, value) {
  const original = readFileSync(file, 'utf8');
  assert.match(original, /^description: '[^\n]*'$/m);
  writeFileSync(file, original.replace(/^description: '[^\n]*'$/m,
    () => `description: '${value.replaceAll("'", "''")}'`));
}

export function reportRow(output, key) {
  const rows = output.split(/\r?\n/).filter((line) => line.includes(key));
  assert.ok(rows.length > 0, `The report must include ${key}:\n${output}`);
  return rows.join('\n');
}

export function packRow(output, pack) {
  const rows = output.split(/\r?\n/).filter((line) =>
    !line.includes('packs/') && new RegExp(`\\b${pack}\\b`).test(line));
  assert.ok(rows.length > 0, `The report must include a summary for pack ${pack}:\n${output}`);
  return rows.join('\n');
}

export function expectSuccess(result) {
  assert.equal(result.status, 0, result.output);
}
