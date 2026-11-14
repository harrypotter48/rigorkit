// 019-version-rule HU-13 — the remote installer and the record check reject leading zeros (RF-1, RF-2).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { home, run, envFor, git, STATE, repo, runtimeCopy } from './update-fixture.mjs';

test('RF-1.H1: a v01.0.0 tag is never picked as the newest release', t => {
  const h = home(t);
  const work = path.join(h.root, 'work'), bare = path.join(h.root, 'remote.git');
  runtimeCopy(work);
  git(h.root, ['init', '-q', '--bare', bare]);
  git(work, ['init', '-q', '-b', 'main']);
  writeFileSync(path.join(work, 'VERSION'), '0.2.0\n'); git(work, ['add', '-A']); git(work, ['commit', '-qm', 'r1']); git(work, ['tag', 'v0.2.0']);
  writeFileSync(path.join(work, 'VERSION'), '1.0.0\n'); git(work, ['commit', '-qam', 'r2']); git(work, ['tag', 'v01.0.0']);
  git(work, ['push', '-q', bare, 'main', '--tags']);
  const r = run('sh', [path.join(repo, 'tools/install-remote.sh')], { env: envFor(h, { RIGORKIT_REMOTE: bare, SHELL: '/bin/sh' }), cwd: h.HOME });
  assert.equal(r.status, 0, r.out);
  assert.equal(readFileSync(path.join(h.HOME, '.rigorkit/VERSION'), 'utf8').trim(), '0.2.0');
});

test('RF-2.H1: a project record whose version has a leading zero is moved aside', t => {
  const h = home(t);
  const clone = runtimeCopy(path.join(h.HOME, '.rigorkit'));
  const p = path.join(h.root, 'proj'); mkdirSync(p);
  const install = () => run('bash', [path.join(clone, 'install.sh'), '--project', p, '--pack', 'core', '--agent', 'claude'], { env: envFor(h), cwd: h.HOME });
  assert.equal(install().status, 0);
  const dir = path.join(STATE(h.HOME), 'projects');
  const f = path.join(dir, readdirSync(dir).find(x => /^[0-9a-f]{16}$/.test(x)));
  writeFileSync(f, readFileSync(f, 'utf8').replace(/^version\t.*$/m, 'version\t01.0.0'));
  const o = install();
  assert.equal(o.status, 0, o.out);
  assert.ok(existsSync(`${f}.corrupt`), o.out);
  assert.doesNotMatch(readFileSync(f, 'utf8'), /^version\t01\.0\.0$/m);
});
