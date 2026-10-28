import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const script = path.join(repo, 'tools/capture-baseline.mjs');

function capture(args) {
  try {
    const output = execFileSync('node', [script, ...args], { cwd: repo, encoding: 'utf8' });
    return { status: 0, output, stderr: '' };
  } catch (error) {
    return { status: error.status ?? 1, output: error.stdout ?? '', stderr: error.stderr ?? '' };
  }
}

function temporary(t) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'rigorkit-capture-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}

describe('005-content-ratchet: content baseline capture', () => {
  it('RF-3.H1: a capture records the commit, the entries and the target, and refuses to overwrite', (t) => {
    const output = path.join(temporary(t), 'baseline.txt');
    const first = capture(['--source', 'HEAD', '--output', output, '--target', '0']);
    assert.equal(first.status, 0, first.stderr);
    const baseline = JSON.parse(readFileSync(output, 'utf8'));
    assert.equal(baseline.version, 1);
    assert.equal(baseline.targetReductionPercent, 0);
    assert.match(baseline.commit, /^[a-f0-9]{40}$/);
    assert.ok(baseline.entries.length > 0);
    assert.match(first.output, /Target: >=0%/);
    const second = capture(['--source', 'HEAD', '--output', output, '--target', '0']);
    assert.equal(second.status, 1);
    assert.match(second.stderr, /refusing overwrite/);
  });

  it('RF-3.E1: a capture without a target keeps the original baseline policy', (t) => {
    const output = path.join(temporary(t), 'baseline.txt');
    const result = capture(['--source', 'HEAD', '--output', output]);
    assert.equal(result.status, 0, result.stderr);
    const baseline = JSON.parse(readFileSync(output, 'utf8'));
    assert.equal(baseline.targetReductionPercent, undefined);
  });

  it('RF-3.F1: an invalid target percentage is rejected before any write', (t) => {
    const output = path.join(temporary(t), 'baseline.txt');
    const result = capture(['--source', 'HEAD', '--output', output, '--target', '101']);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /target/i);
  });

  it('RF-3.S1: a missing source commit is reported without writing a baseline', (t) => {
    const output = path.join(temporary(t), 'baseline.txt');
    const result = capture(['--source', 'no-such-commit', '--output', output]);
    assert.equal(result.status, 1);
    assert.equal(existsSync(output), false);
  });
});
