import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, it } from 'node:test';
import { check, expectSuccess, repo, temporaryFixture } from '../fixtures/fixture-tools.mjs';

function fixtureCheck(t, name) {
  const dir = temporaryFixture(t, 'scenarios');
  const change = path.join(dir, name);
  return check(path.join(change, 'spec.md'), path.join(change, 'tests'), dir);
}

describe('001-english-and-compact: real scenario checker CLI', () => {
  it('RF-8.H1: English scenario heading is recognized', (t) => {
    const result = fixtureCheck(t, 'fixture-english');
    expectSuccess(result);
    assert.match(result.output, /fixture-english/);
    assert.doesNotMatch(result.output, /RF-1\.H1:.*(?:missing|without|sin test)/i);
  });

  it('RF-8.E1: Spanish scenario heading remains compatible', (t) => {
    const result = fixtureCheck(t, 'fixture-spanish');
    expectSuccess(result);
    assert.match(result.output, /fixture-spanish/);
  });

  it('RF-8.F1: absent scenario heading is reported in English', (t) => {
    const result = fixtureCheck(t, 'fixture-no-heading');
    assert.equal(result.status, 1, result.output);
    assert.match(result.output, /(?:missing|no|without|does not have|has no).*section|section.*(?:missing|not found)/i);
    assert.match(result.output, /Test scenarios/);
    assert.doesNotMatch(result.output, /no tiene la secci[oó]n/i);
  });

  it('RF-25.H1: the change spec has no scripted scenario missing a test', () => {
    const result = check(path.join(repo, 'specs/archive/001-english-and-compact/spec.md'),
      path.join(repo, 'tools/test'));
    expectSuccess(result);
    assert.match(result.output, /001-english-and-compact/);
    assert.doesNotMatch(result.output, /(?:missing|without|sin) (?:a )?test/i);
  });

  it('RF-25.E1: a scenario with manual in the type cell needs no test', (t) => {
    const result = fixtureCheck(t, 'fixture-manual');
    expectSuccess(result);
    assert.match(result.output, /RF-1\.H1/);
  });

  it('RF-25.F1: an uncovered scripted scenario is reported as missing a test', (t) => {
    const result = fixtureCheck(t, 'fixture-missing-test');
    assert.equal(result.status, 1, result.output);
    assert.match(result.output, /RF-1\.H1[^\n]*(?:missing|without|no test|sin test)|(?:missing|without)[^\n]*RF-1\.H1/i);
    assert.doesNotMatch(result.output, /no tiene la secci[oó]n|missing[^\n]*section/i);
  });
});
