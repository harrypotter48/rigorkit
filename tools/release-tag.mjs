#!/usr/bin/env node
// Publishes the release tag v<VERSION> when it is not released yet (009-release-tag, HU-4).
// Run by .github/workflows/release-tag.yml after the toolkit tests pass on main.
// Usage: node tools/release-tag.mjs [--root <dir>] [--remote <url|path>]
// Env: RK_PUSH_TOKEN — token used only for the tag push (GitHub Actions GITHUB_TOKEN).
// Never commits, never pushes a branch, never moves or deletes a tag; git runs without a shell.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const BOT_NAME = 'github-actions[bot]';
const BOT_EMAIL = '41898282+github-actions[bot]@users.noreply.github.com';
const VALID = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

function fail(message) { console.error(`release-tag: ${message}`); process.exit(1); }

function parseArgs(argv) {
  const opts = { root: process.cwd(), remote: '' };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--root') opts.root = path.resolve(argv[++i] ?? '');
    else if (argv[i] === '--remote') opts.remote = argv[++i] ?? '';
    else fail(`unknown argument: ${argv[i]}`);
  }
  return opts;
}

function git(root, args, { env = {} } = {}) {
  const r = spawnSync('git', args, { cwd: root, encoding: 'utf8', env: { ...process.env, GIT_TERMINAL_PROMPT: '0', ...env } });
  return { status: r.status, stdout: (r.stdout ?? '').trim(), stderr: (r.stderr ?? '').trim() };
}

const parts = v => v.split('.').map(BigInt);   // exact for any length of digits
function compare(a, b) {
  const x = parts(a), y = parts(b);
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] < y[i] ? -1 : 1;
  return 0;
}

function main() {
  const { root, remote: given } = parseArgs(process.argv.slice(2));
  const file = path.join(root, 'VERSION');
  if (!existsSync(file)) fail(`VERSION missing in ${root}`);
  const version = readFileSync(file, 'utf8').trim();
  if (!version) fail('VERSION is empty');
  if (!VALID.test(version)) fail(`invalid version in VERSION: "${version}" (expected X.Y.Z)`);
  const tag = `v${version}`;

  let remote = given;
  if (!remote) {
    const r = git(root, ['remote', 'get-url', 'origin']);
    if (r.status !== 0) fail(`cannot read the origin remote: ${r.stderr}`);
    remote = r.stdout;
  }

  // Remote tags, read anonymously: the checkout has none (C4, A4).
  const ls = git(root, ['ls-remote', '--tags', '--refs', '--', remote]);
  if (ls.status !== 0) fail(`cannot read the remote tags: ${ls.stderr}`);
  const names = ls.stdout ? ls.stdout.split('\n').map(l => l.split('\t')[1]?.replace(/^refs\/tags\//, '') ?? '') : [];
  if (names.includes(tag)) { console.log(`rigorkit ${version} is already released (${tag})`); return; }
  const released = names.filter(n => n.startsWith('v') && VALID.test(n.slice(1))).map(n => n.slice(1));
  const highest = released.sort(compare).at(-1);
  if (highest && compare(version, highest) <= 0) fail(`version ${version} is not greater than the highest release ${highest}`);

  const created = git(root, ['-c', `user.name=${BOT_NAME}`, '-c', `user.email=${BOT_EMAIL}`, '-c', 'tag.gpgsign=false',
    'tag', '-a', tag, '-m', `rigorkit ${version}`, 'HEAD']);
  if (created.status !== 0) fail(`cannot create tag ${tag}: ${created.stderr}`);

  // Credential through git's environment config, never argv (no process-listing exposure); the encoded
  // header is masked in GitHub logs too.
  const token = process.env.RK_PUSH_TOKEN || '';
  const basic = token ? Buffer.from(`x-access-token:${token}`).toString('base64') : '';
  if (basic && process.env.GITHUB_ACTIONS === 'true') console.log(`::add-mask::${basic}`);
  const auth = basic ? { GIT_CONFIG_COUNT: '1', GIT_CONFIG_KEY_0: 'http.extraheader', GIT_CONFIG_VALUE_0: `AUTHORIZATION: basic ${basic}` } : {};
  const pushed = git(root, ['push', '--', remote, `refs/tags/${tag}`], { env: auth });
  const redact = text => [token, basic].filter(Boolean).reduce((t, secret) => t.split(secret).join('***'), text);
  if (pushed.status !== 0) fail(`cannot push tag ${tag}: ${redact(pushed.stderr)}`);
  console.log(`published ${tag}`);
}

main();
