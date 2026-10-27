import assert from 'node:assert/strict';
import { readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import {
  agentPath, expectSuccess, guidePath, measure, packRow, replaceBody,
  replaceDescription, reportRow, rulePath, skillPath, temporaryFixture,
} from '../fixtures/fixture-tools.mjs';

describe('001-english-and-compact: content measurement CLI', () => {
  it('RF-2.H1: unchanged baseline identities pass', (t) => {
    const dir = temporaryFixture(t, 'measurement');
    const result = measure(dir);
    expectSuccess(result);
    assert.match(result.output, /sdd-sample/);
    assert.match(result.output, /sdd-reader/);
    assert.match(result.output, /architecture-sample/);
    assert.match(result.output, /frontend-sample/);
  });

  it('RF-2.E1: every skill folder and agent filename matches its frontmatter name', (t) => {
    const dir = temporaryFixture(t, 'measurement');
    const result = measure(dir);
    expectSuccess(result);
    for (const file of [skillPath, agentPath,
      'packs/architecture/skills/architecture-sample/SKILL.md',
      'packs/frontend/skills/frontend-sample/SKILL.md']) {
      assert.ok(result.output.includes(file), `Missing identity report for ${file}`);
    }
  });

  it('RF-2.F1: a consistent folder and frontmatter rename is reported and rejected', (t) => {
    const dir = temporaryFixture(t, 'measurement');
    const oldFolder = path.join(dir, 'repo/packs/sdd/skills/sdd-sample');
    const newFolder = path.join(dir, 'repo/packs/sdd/skills/sdd-renamed');
    renameSync(oldFolder, newFolder);
    const file = path.join(newFolder, 'SKILL.md');
    writeFileSync(file, readFileSync(file, 'utf8').replace('name: sdd-sample', 'name: sdd-renamed'));
    const result = measure(dir);
    assert.equal(result.status, 1, result.output);
    assert.match(result.output, /sdd-sample/);
    assert.match(result.output, /sdd-renamed/);
    assert.match(result.output, /name|identity|renam|added|removed/i);
  });

  it('RF-16.H1: all skill and agent descriptions are measured below the limit', (t) => {
    const dir = temporaryFixture(t, 'measurement');
    const result = measure(dir);
    expectSuccess(result);
    assert.match(result.output, /description/i);
    // The YAML-escaped apostrophe is one character: Read a project's state. = 23.
    assert.match(reportRow(result.output, skillPath), /\b23\b/);
    assert.match(reportRow(result.output, agentPath), /\b18\b/);
  });

  it('RF-16.E1: exactly 300 normalized Unicode description characters pass', (t) => {
    const dir = temporaryFixture(t, 'measurement');
    const description = 'e\u0301'.repeat(150) + '😀'.repeat(150);
    replaceDescription(path.join(dir, 'repo', skillPath), description);
    replaceDescription(path.join(dir, 'repo', agentPath), description);
    const result = measure(dir);
    expectSuccess(result);
    assert.match(reportRow(result.output, skillPath), /\b300\b/);
    assert.match(reportRow(result.output, agentPath), /\b300\b/);
  });

  it('RF-16.F1: a 301-character description is reported and rejected', (t) => {
    const dir = temporaryFixture(t, 'measurement');
    replaceDescription(path.join(dir, 'repo', agentPath), 'd'.repeat(301));
    const result = measure(dir);
    assert.equal(result.status, 1, result.output);
    assert.match(result.output, /description/i);
    assert.match(reportRow(result.output, agentPath), /\b301\b/);
  });

  it('RF-17.H1: all three packs report reductions of at least 30 percent', (t) => {
    const dir = temporaryFixture(t, 'measurement');
    replaceBody(path.join(dir, 'repo', skillPath), 'x'.repeat(120));
    const result = measure(dir);
    expectSuccess(result);
    // Baseline: sdd 200, architecture 100, frontend 100. Actual: 110, 70, 70.
    assert.match(packRow(result.output, 'sdd'), /\b45(?:\.0+)?\s*%/);
    assert.match(packRow(result.output, 'architecture'), /\b30(?:\.0+)?\s*%/);
    assert.match(packRow(result.output, 'frontend'), /\b30(?:\.0+)?\s*%/);
  });

  it('RF-17.E1: a pack at exactly 30 percent reduction passes', (t) => {
    const dir = temporaryFixture(t, 'measurement');
    const result = measure(dir);
    expectSuccess(result);
    assert.match(packRow(result.output, 'sdd'), /\b30(?:\.0+)?\s*%/);
    assert.match(packRow(result.output, 'architecture'), /\b30(?:\.0+)?\s*%/);
    assert.match(packRow(result.output, 'frontend'), /\b30(?:\.0+)?\s*%/);
  });

  it('RF-17.F1: a single pack at 29 percent reduction fails despite savings elsewhere', (t) => {
    const dir = temporaryFixture(t, 'measurement');
    replaceBody(path.join(dir, 'repo/packs/architecture/skills/architecture-sample/SKILL.md'), 'x'.repeat(284));
    replaceBody(path.join(dir, 'repo', skillPath), 'x'.repeat(120));
    const result = measure(dir);
    assert.equal(result.status, 1, result.output);
    assert.match(packRow(result.output, 'architecture'), /\b29(?:\.0+)?\s*%/);
    assert.match(result.output, /reduction|reduc|30\s*%/i);
  });

  it('RF-18.H1: core rules below 300 estimated tokens pass', (t) => {
    const dir = temporaryFixture(t, 'measurement');
    writeFileSync(path.join(dir, 'repo', rulePath), 'r'.repeat(1196));
    const result = measure(dir);
    expectSuccess(result);
    assert.match(reportRow(result.output, rulePath), /\b299\b/);
  });

  it('RF-18.E1: core rules at exactly 300 estimated tokens pass', (t) => {
    const dir = temporaryFixture(t, 'measurement');
    const result = measure(dir);
    expectSuccess(result);
    assert.match(reportRow(result.output, rulePath), /\b300\b/);
  });

  it('RF-18.F1: core rules at 301 estimated tokens are reported and rejected', (t) => {
    const dir = temporaryFixture(t, 'measurement');
    writeFileSync(path.join(dir, 'repo', rulePath), 'r'.repeat(1201));
    const result = measure(dir);
    assert.equal(result.status, 1, result.output);
    assert.match(reportRow(result.output, rulePath), /\b301\b/);
  });

  it('RF-19.H1: CLI reports files, packs, baseline comparison and identity mismatches', (t) => {
    const dir = temporaryFixture(t, 'measurement');
    // A name mismatch is independent of folder rename and unchanged pack totals.
    const file = path.join(dir, 'repo', skillPath);
    writeFileSync(file, readFileSync(file, 'utf8').replace('name: sdd-sample', 'name: sdd-mismatch'));
    const result = measure(dir);
    assert.equal(result.status, 1, result.output);
    assert.match(reportRow(result.output, skillPath), /\b60\b/);
    assert.match(reportRow(result.output, guidePath), /\b10\b/);
    assert.match(reportRow(result.output, agentPath), /\b70\b/);
    assert.match(reportRow(result.output, rulePath), /\b300\b/);
    assert.match(packRow(result.output, 'sdd'), /\b140\b/);
    assert.match(packRow(result.output, 'sdd'), /\b200\b/);
    assert.match(packRow(result.output, 'architecture'), /\b70\b/);
    assert.match(packRow(result.output, 'frontend'), /\b70\b/);
    assert.match(result.output, /description/i);
    assert.match(result.output, /sdd-mismatch/);
    assert.match(result.output, /sdd-sample/);
    assert.match(result.output, /mismatch|identity|name.*differ/i);
  });

  it('RF-19.E1: decomposed text and astral characters count as normalized code points', (t) => {
    const dir = temporaryFixture(t, 'measurement');
    replaceBody(path.join(dir, 'repo', skillPath), 'e\u0301😀'.repeat(40));
    const result = measure(dir);
    expectSuccess(result);
    // NFC yields 80 code points = 20 body tokens, plus 10 guide tokens.
    assert.match(reportRow(result.output, skillPath), /\b20\b/);
    assert.match(reportRow(result.output, guidePath), /\b10\b/);
    assert.match(packRow(result.output, 'sdd'), /\b100\b/);
    assert.match(packRow(result.output, 'sdd'), /\b50(?:\.0+)?\s*%/);
  });

  it('RF-19.F1: a missing baseline returns an error with its path', (t) => {
    const dir = temporaryFixture(t, 'measurement');
    const missing = path.join(dir, 'absent-baseline.txt');
    const result = measure(dir, missing);
    assert.equal(result.status, 1, result.output);
    assert.match(result.stderr, /absent-baseline\.txt/);
    assert.match(result.stderr, /baseline.*(missing|not found|does not exist|ENOENT)|ENOENT.*baseline/i);
  });
});
