import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { deployAllowed, workflow } from './helpers.mjs';

const main = { event: 'push', ref: 'refs/heads/main', buildStatus: 'success' };
describe('002-website: actual Pages workflow policy and failure gates', () => {
  it('RF-11.E1: feature pushes and unmerged pull requests cannot replace production', async () => {
    const config = await workflow();
    assert.equal(deployAllowed(config, { ...main, ref: 'refs/heads/feature-demo' }), false);
    assert.equal(deployAllowed(config, { ...main, event: 'pull_request', ref: 'refs/pull/7/merge' }), false);
    assert.equal(deployAllowed(config, main), true, 'The guard must still allow the approved primary-branch success path');
  });
  it('RF-11.F1: failed generation or checks cannot reach deployment', async () => {
    const config = await workflow();
    assert.equal(deployAllowed(config, { ...main, buildStatus: 'failure' }), false);
    assert.equal(deployAllowed(config, { ...main, buildStatus: 'cancelled' }), false);
    assert.notEqual(config.jobs.build['continue-on-error'], true);
    assert.ok(config.jobs.build.steps.every(step => step['continue-on-error'] !== true));
  });
  it('RF-11.S1: external unmerged contributions receive no production authority', async () => {
    const config = await workflow();
    assert.equal(deployAllowed(config, { ...main, event: 'pull_request', ref: 'refs/pull/999/merge' }), false);
    assert.ok(!Object.hasOwn(config.on, 'pull_request_target'));
    assert.notEqual(config.permissions?.pages, 'write');
    assert.notEqual(config.permissions?.['id-token'], 'write');
    assert.notEqual(config.jobs.build.permissions?.pages, 'write');
    assert.notEqual(config.jobs.build.permissions?.['id-token'], 'write');
    assert.equal(config.jobs.deploy.permissions.pages, 'write');
    assert.equal(config.jobs.deploy.permissions['id-token'], 'write');
    assert.equal(config.jobs.deploy.environment.name, 'github-pages');
  });
  it('RF-12.H1: a failed build is visible and cannot replace the prior published target', async () => {
    const config = await workflow();
    assert.equal(deployAllowed(config, { ...main, buildStatus: 'failure' }), false);
    assert.notEqual(config.jobs.build['continue-on-error'], true);
    const runText = config.jobs.build.steps.map(step => step.run ?? '').join('\n');
    assert.doesNotMatch(runText, /\|\|\s*true|gh\s+api[^\n]*DELETE|git\s+push[^\n]*--force/);
    assert.ok(config.jobs.build.steps.every(step => !String(step.uses ?? '').startsWith('actions/deploy-pages@')));
    assert.notEqual(config.jobs.build.permissions?.pages, 'write');
    assert.ok(config.jobs.deploy.steps.some(step => String(step.uses ?? '').startsWith('actions/deploy-pages@')));
  });
  it('RF-12.E1: initial failure has no successful-deployment URL or success claim', async () => {
    const config = await workflow();
    assert.equal(deployAllowed(config, { ...main, buildStatus: 'failure' }), false);
    assert.match(config.jobs.deploy.environment.url, /steps\.[\w-]+\.outputs\.page_url/);
    const buildOutput = JSON.stringify({ outputs: config.jobs.build.outputs ?? {}, steps: config.jobs.build.steps });
    assert.doesNotMatch(buildOutput, /echo[^\n]*(?:successfully published|deployment succeeded)/i);
    assert.ok(config.jobs.deploy.steps.some(step => step.id && String(step.uses ?? '').startsWith('actions/deploy-pages@')));
  });
});
