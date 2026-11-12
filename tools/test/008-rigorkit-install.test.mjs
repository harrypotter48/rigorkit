// 008-updater HU-1 — `rigorkit install` / install.sh: custom packs, clone-run scripts, rendered rules, backups (B2).
// Baseline 0.1.0 = tools/fixtures/baseline-0.1.0/install.sh (byte copy of `git show 3ee339e:install.sh`, D8),
// run against the same packs so only installer behavior is compared.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { chmodSync, cpSync, existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, renameSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { home, cloneCopy, put, stubScript, run, snapshot, repo } from './rigorkit-fixture.mjs';

const BASELINE = path.join(repo, 'tools/fixtures/baseline-0.1.0/install.sh');
const PLACEHOLDER = '{{RIGORKIT}}';
const tokens = text => Math.ceil([...text.normalize('NFC')].length / 4); // same estimator as tools/measure-content.mjs:10-11

// Resolved paths (macOS tmpdir is a symlink: /var -> /private/var), so expected paths match `pwd -P`.
const real = h => ({ ...h, root: realpathSync(h.root), HOME: realpathSync(h.HOME), TMPDIR: realpathSync(h.TMPDIR) });

function setup(t, { clonePath, at } = {}) {
  const h = real(home(t));
  const clone = at ?? (clonePath ? path.join(h.root, clonePath) : path.join(h.HOME, '.rigorkit'));
  cloneCopy(clone);
  stubScript(path.join(clone, 'packs/core/scripts/test-summary'), 'official');
  const custom = path.join(h.HOME, '.rigorkit', 'custom');
  const env = { HOME: h.HOME, TMPDIR: h.TMPDIR, CODEX_HOME: path.join(h.HOME, '.codex') };
  const rk = (args, opts = {}) => run(path.join(clone, 'bin/rigorkit'), ['install', ...args], { env, ...opts });
  const sh = (args, opts = {}) => run(path.join(clone, 'install.sh'), args, { env, ...opts });
  const claude = () => path.join(h.HOME, '.claude/CLAUDE.md');
  return { ...h, clone, custom, env, rk, sh, claude };
}

// Runs Baseline 0.1.0 from its own clone copy (same packs) in its own HOME.
function baseline(t) {
  const h = real(home(t, { name: 'bhome' }));
  const clone = cloneCopy(path.join(h.root, 'bclone'));
  cpSync(BASELINE, path.join(clone, 'install.sh'));
  stubScript(path.join(clone, 'packs/core/scripts/test-summary'), 'official');
  const env = { HOME: h.HOME, TMPDIR: h.TMPDIR, CODEX_HOME: path.join(h.HOME, '.codex') };
  return { ...h, clone, run: (args, opts = {}) => run(path.join(clone, 'install.sh'), args, { env, ...opts }) };
}

const quoted = clone => `'${clone}/bin/rigorkit'`;
// Normalizes a tree snapshot or output: roots, stamps, version values, rendered path → placeholder.
function norm(value, { clone, HOME, project }) {
  let s = typeof value === 'string' ? value : JSON.stringify(value, null, 1);
  const decode = s.replace(/file:(\d+):([A-Za-z0-9+/=]+)/g, (_, m, b) => `file:${m}:${JSON.stringify(Buffer.from(b, 'base64').toString('utf8'))}`);
  s = decode;
  // Paths may appear as given or resolved (macOS /var -> /private/var through `pwd -P`).
  const both = p => (p && existsSync(p) && realpathSync(p) !== p ? [realpathSync(p), p] : [p]);
  const pairs = [];
  for (const c of both(clone)) pairs.push([quoted(c), PLACEHOLDER]);
  for (const c of both(clone)) pairs.push([c, '<ROOT>']);
  if (project) for (const c of both(project)) pairs.push([c, '<P>']);
  for (const c of both(HOME)) pairs.push([c, '<HOME>']);
  for (const [from, to] of pairs) s = s.split(from).join(to);
  return s.replace(/date: \d{4}-\d{2}-\d{2}/g, 'date: <D>').replace(/version: [0-9.]+/g, 'version: <V>');
}
function rulesBlock(text, pack = 'core') {
  const m = text.match(new RegExp(`<!-- rigorkit:${pack}:start -->\\n([\\s\\S]*?)<!-- rigorkit:${pack}:end -->`));
  return m ? m[1] : null;
}
function renderedCommand(text) {
  const m = text.match(/('(?:[^']|\n)*?\/bin\/rigorkit') script <name>/);
  return m ? m[1] : null;
}
const mode = file => (statSync(file).mode & 0o777).toString(8);

// --- RF-3 / RF-46: same behavior as Baseline 0.1.0 except the RF-3 exceptions -----------
test('RF-3.H1: project install gives the same files and output as Baseline 0.1.0', t => {
  const s = setup(t), b = baseline(t);
  const p1 = path.join(s.root, 'proj'), p2 = path.join(b.root, 'proj');
  mkdirSync(p1); mkdirSync(p2);
  const r = s.rk(['--pack', 'sdd', '--agent', 'claude', '--project', p1]);
  const o = b.run(['--pack', 'sdd', '--agent', 'claude', '--project', p2]);
  assert.equal(r.status, 0, r.out); assert.equal(o.status, 0, o.out);
  assert.equal(norm(snapshot(p1), { clone: s.clone, HOME: s.HOME, project: p1 }), norm(snapshot(p2), { clone: b.clone, HOME: b.HOME, project: p2 }));
  assert.equal(norm(r.out, { clone: s.clone, HOME: s.HOME, project: p1 }), norm(o.out, { clone: b.clone, HOME: b.HOME, project: p2 }));
});

test('RF-3.E1: --dry-run --global prints planned writes and writes nothing (INV-1)', t => {
  const s = setup(t);
  const before = snapshot(s.HOME), tmpBefore = snapshot(s.TMPDIR);
  const r = s.rk(['--pack', 'core,sdd', '--agent', 'claude,codex,opencode', '--global', '--dry-run']);
  assert.equal(r.status, 0, r.out);
  assert.match(r.stdout, /dry run/);
  assert.match(r.stdout, /copy|rules/);
  assert.deepEqual(snapshot(s.HOME), before);
  assert.deepEqual(snapshot(s.TMPDIR), tmpBefore, 'no temp file left (Q10)');
});

test('RF-3.E2: --version and --list without custom packs match Baseline 0.1.0', t => {
  const s = setup(t), b = baseline(t);
  for (const args of [['--version'], ['--list']]) {
    const r = s.rk(args), o = b.run(args);
    assert.equal(r.status, o.status, args[0]);
    assert.equal(norm(r.out, { clone: s.clone, HOME: s.HOME }), norm(o.out, { clone: b.clone, HOME: b.HOME }), args[0]);
  }
});

test('RF-3.E3: --uninstall-rules removes the blocks and says scripts stay in the clone', t => {
  const s = setup(t);
  assert.equal(s.rk(['--pack', 'core', '--agent', 'claude', '--global']).status, 0);
  assert.ok(rulesBlock(readFileSync(s.claude(), 'utf8')));
  const r = s.rk(['--uninstall-rules', '--agent', 'claude']);
  assert.equal(r.status, 0, r.out);
  assert.equal(rulesBlock(readFileSync(s.claude(), 'utf8')), null);
  assert.match(r.stdout, /Scripts stay in the clone/);
  assert.ok(r.stdout.includes(s.clone));
  assert.doesNotMatch(r.stdout, /\.local\/share\/rigorkit/);
});

test('RF-3.E4: --uninstall-rules also removes a custom pack block', t => {
  const s = setup(t);
  put(path.join(s.custom, 'packs/mine/rules.md'), '**Mine** custom rule.\n');
  const i = s.rk(['--pack', 'mine', '--agent', 'claude', '--global']);
  assert.equal(i.status, 0, i.out);
  assert.ok(rulesBlock(readFileSync(s.claude(), 'utf8'), 'mine'));
  const r = s.rk(['--uninstall-rules', '--agent', 'claude']);
  assert.equal(r.status, 0, r.out);
  assert.equal(rulesBlock(readFileSync(s.claude(), 'utf8'), 'mine'), null);
});

test('RF-3.F1: unknown agent gives the same error and status as Baseline 0.1.0', t => {
  const s = setup(t), b = baseline(t);
  const r = s.rk(['--pack', 'sdd', '--agent', 'nope', '--global']), o = b.run(['--pack', 'sdd', '--agent', 'nope', '--global']);
  assert.equal(r.status, o.status); assert.notEqual(r.status, 0);
  assert.equal(r.stderr, o.stderr);
});

test('RF-3.S1: only the marked block changes; .rigorkit.bak kept; the user .bak is untouched', t => {
  const s = setup(t);
  put(s.claude(), '# Mine\nuser line\n');
  put(s.claude() + '.bak', 'my own backup\n');
  const r = s.rk(['--pack', 'core', '--agent', 'claude', '--global']);
  assert.equal(r.status, 0, r.out);
  const text = readFileSync(s.claude(), 'utf8');
  assert.ok(text.startsWith('# Mine\nuser line\n'), text);
  assert.equal(text.replace(/\n?<!-- rigorkit:core:start -->[\s\S]*<!-- rigorkit:core:end -->\n/, ''), '# Mine\nuser line\n');
  assert.equal(readFileSync(s.claude() + '.rigorkit.bak', 'utf8'), '# Mine\nuser line\n');
  assert.equal(readFileSync(s.claude() + '.bak', 'utf8'), 'my own backup\n');
});

test('RF-62.S1: the backup of a 600 rules file is 600, also when an older backup was 644', t => {
  const s = setup(t);
  put(s.claude(), 'secret line\n', 0o600);
  assert.equal(s.rk(['--pack', 'core', '--agent', 'claude', '--global']).status, 0);
  assert.equal(mode(s.claude() + '.rigorkit.bak'), '600');
  chmodSync(s.claude() + '.rigorkit.bak', 0o644);
  writeFileSync(s.claude(), readFileSync(s.claude(), 'utf8') + 'more\n'); chmodSync(s.claude(), 0o600);
  assert.equal(s.rk(['--pack', 'core', '--agent', 'claude', '--global', '--force']).status, 0);
  assert.equal(mode(s.claude() + '.rigorkit.bak'), '600');
});

test('RF-46.H1: install.sh and rigorkit install from a development clone give the same result', t => {
  const s = setup(t, { clonePath: 'dev/rigorkit' });
  const p1 = path.join(s.root, 'p1'), p2 = path.join(s.root, 'p2');
  mkdirSync(p1); mkdirSync(p2);
  const a = s.sh(['--pack', 'sdd', '--agent', 'claude', '--project', p1]);
  const r = s.rk(['--pack', 'sdd', '--agent', 'claude', '--project', p2]);
  assert.equal(a.status, 0, a.out); assert.equal(r.status, 0, r.out);
  assert.equal(norm(snapshot(p1), { clone: s.clone, HOME: s.HOME, project: p1 }), norm(snapshot(p2), { clone: s.clone, HOME: s.HOME, project: p2 }));
  assert.equal(norm(a.out, { clone: s.clone, HOME: s.HOME, project: p1 }), norm(r.out, { clone: s.clone, HOME: s.HOME, project: p2 }));
});

test('RF-46.E1: without ~/.rigorkit, rules call scripts through the development clone', t => {
  const s = setup(t, { clonePath: 'dev/rigorkit' });
  assert.equal(existsSync(path.join(s.HOME, '.rigorkit')), false);
  const r = s.sh(['--pack', 'core', '--agent', 'claude', '--global']);
  assert.equal(r.status, 0, r.out);
  const cmd = renderedCommand(readFileSync(s.claude(), 'utf8'));
  assert.equal(cmd, quoted(s.clone));
  const call = run('/bin/sh', ['-c', `${cmd} script test-summary ok`], { env: s.env });
  assert.equal(call.stdout, 'official [ok]\n', call.out);
});

test('RF-46.F1: unknown option gives the same error as Baseline 0.1.0', t => {
  const s = setup(t), b = baseline(t);
  const r = s.sh(['--bogus']), o = b.run(['--bogus']);
  assert.equal(r.status, o.status); assert.equal(r.stderr, o.stderr);
});

// --- RF-26.E1/E2 (B1 todo items, green here): install.sh owns --help ---------------------
test('RF-26.E1: install --help with valid options shows the install help; nothing installed', t => {
  const s = setup(t);
  const before = snapshot(s.HOME);
  const r = s.rk(['--help', '--pack', 'sdd', '--agent', 'claude', '--global']);
  assert.equal(r.status, 0, r.out);
  assert.equal(r.stdout, readFileSync(path.join(s.clone, 'help/install.txt'), 'utf8'));
  assert.deepEqual(snapshot(s.HOME), before);
});
test('RF-26.E2: install --bogus --help and --pack --help show the help, exit 0 (Q5)', t => {
  const s = setup(t);
  for (const args of [['--bogus', '--help'], ['--pack', '--help'], ['-h']]) {
    const r = s.rk(args);
    assert.equal(r.status, 0, args.join(' '));
    assert.equal(r.stdout, readFileSync(path.join(s.clone, 'help/install.txt'), 'utf8'), args.join(' '));
  }
  assert.equal(s.sh(['--help']).stdout, readFileSync(path.join(s.clone, 'help/install.txt'), 'utf8'), 'install.sh --help (Q6)');
});

// --- RF-33 / RF-59: custom packs ----------------------------------------------------------
function customSkill(custom, pack, skill, body = `---\nname: ${skill}\ndescription: custom skill\n---\nCustom body.\n`) {
  return put(path.join(custom, 'packs', pack, 'skills', skill, 'SKILL.md'), body);
}

test('RF-33.H1: a custom pack installs like an official one', t => {
  const s = setup(t);
  customSkill(s.custom, 'mine', 'mine-skill');
  const r = s.rk(['--pack', 'mine', '--agent', 'claude', '--global']);
  assert.equal(r.status, 0, r.out);
  const dst = path.join(s.HOME, '.claude/skills/mine-skill');
  assert.equal(readFileSync(path.join(dst, 'SKILL.md'), 'utf8'), readFileSync(path.join(s.custom, 'packs/mine/skills/mine-skill/SKILL.md'), 'utf8'));
  assert.match(readFileSync(path.join(dst, '.rigorkit'), 'utf8'), /installed-by: rigorkit/);
});

test('RF-33.E1: a custom skill folder without SKILL.md is skipped', t => {
  const s = setup(t);
  customSkill(s.custom, 'mine', 'good');
  put(path.join(s.custom, 'packs/mine/skills/broken/notes.md'), 'no SKILL.md here\n');
  const r = s.rk(['--pack', 'mine', '--agent', 'claude', '--global']);
  assert.equal(r.status, 0, r.out);
  assert.ok(existsSync(path.join(s.HOME, '.claude/skills/good/SKILL.md')));
  assert.equal(existsSync(path.join(s.HOME, '.claude/skills/broken')), false);
});

test('RF-33.E2: --pack all includes custom packs and --list marks them custom', t => {
  const s = setup(t);
  customSkill(s.custom, 'mine', 'mine-skill');
  const r = s.rk(['--pack', 'all', '--agent', 'claude', '--global']);
  assert.equal(r.status, 0, r.out);
  assert.ok(existsSync(path.join(s.HOME, '.claude/skills/mine-skill/SKILL.md')));
  assert.ok(existsSync(path.join(s.HOME, '.claude/skills/sdd-spec/SKILL.md')), 'official packs too');
  const l = s.rk(['--list']);
  assert.match(l.stdout, /^mine {2}\(custom\)$/m);
});

test('RF-33.E3: a development clone installs a pack from ~/.rigorkit/custom', t => {
  const s = setup(t, { clonePath: 'dev/rigorkit' });
  customSkill(s.custom, 'mine', 'mine-skill');
  const r = s.sh(['--pack', 'mine', '--agent', 'claude', '--global']);
  assert.equal(r.status, 0, r.out);
  assert.ok(existsSync(path.join(s.HOME, '.claude/skills/mine-skill/SKILL.md')));
});

test('RF-33.F1: a pack in neither area gives the baseline "unknown pack" error', t => {
  const s = setup(t), b = baseline(t);
  const r = s.rk(['--pack', 'nope', '--agent', 'claude', '--global']), o = b.run(['--pack', 'nope', '--agent', 'claude', '--global']);
  assert.equal(r.status, o.status); assert.notEqual(r.status, 0);
  assert.match(r.stderr, /unknown pack: nope/);
});

test('RF-33.S1: installing a custom pack leaves the custom area byte-equal (INV-3)', t => {
  const s = setup(t);
  customSkill(s.custom, 'mine', 'mine-skill');
  put(path.join(s.custom, 'packs/mine/rules.md'), 'mine rule\n');
  const before = snapshot(s.custom);
  assert.equal(s.rk(['--pack', 'mine', '--agent', 'claude,codex', '--global', '--force']).status, 0);
  assert.deepEqual(snapshot(s.custom), before);
});

test('RF-59.H1: custom packs named all or with a comma are not listed and are warned about', t => {
  const s = setup(t);
  customSkill(s.custom, 'all', 'x-skill'); customSkill(s.custom, 'a,b', 'y-skill');
  const r = s.rk(['--list']);
  assert.equal(r.status, 0, r.out);
  assert.doesNotMatch(r.stdout, /^all {2}\(custom/m);
  assert.doesNotMatch(r.stdout, /^a,b/m);
  assert.match(r.stderr, /all/); assert.match(r.stderr, /a,b/);
});

test('RF-59.E1: --pack all skips a custom pack with a space and installs the valid one', t => {
  const s = setup(t);
  customSkill(s.custom, 'my pack', 'space-skill'); customSkill(s.custom, 'mine', 'mine-skill');
  const r = s.rk(['--pack', 'all', '--agent', 'claude', '--global']);
  assert.equal(r.status, 0, r.out);
  assert.ok(existsSync(path.join(s.HOME, '.claude/skills/mine-skill/SKILL.md')));
  assert.equal(existsSync(path.join(s.HOME, '.claude/skills/space-skill')), false);
  assert.match(r.stderr, /my pack/);
});

test('RF-59.F1: --pack "my pack" gives the baseline unknown-pack error', t => {
  const s = setup(t), b = baseline(t);
  customSkill(s.custom, 'my pack', 'space-skill');
  const r = s.rk(['--pack', 'my pack', '--agent', 'claude', '--global']), o = b.run(['--pack', 'my pack', '--agent', 'claude', '--global']);
  assert.notEqual(r.status, 0);
  assert.equal(r.status, o.status);
  assert.match(r.stderr, /unknown pack/);
});

test('RF-59.S1: a refused custom pack leaves the custom area byte-equal', t => {
  const s = setup(t);
  customSkill(s.custom, 'all', 'x-skill'); customSkill(s.custom, 'my pack', 'y-skill');
  const before = snapshot(s.custom);
  s.rk(['--list']); s.rk(['--pack', 'all', '--agent', 'claude', '--global']);
  assert.deepEqual(snapshot(s.custom), before);
});

// --- RF-19 / RF-57: shadowing --------------------------------------------------------------
test('RF-19.H1: a custom pack replaces the official pack with the same name and is reported', t => {
  const s = setup(t);
  cpSync(path.join(s.clone, 'packs/sdd'), path.join(s.custom, 'packs/sdd'), { recursive: true });
  put(path.join(s.custom, 'packs/sdd/skills/sdd-spec/SKILL.md'), '---\nname: sdd-spec\ndescription: custom spec\n---\nCustom spec body.\n');
  const r = s.rk(['--pack', 'sdd', '--agent', 'claude', '--global']);
  assert.equal(r.status, 0, r.out);
  assert.match(readFileSync(path.join(s.HOME, '.claude/skills/sdd-spec/SKILL.md'), 'utf8'), /Custom spec body/);
  assert.match(r.stdout, /custom pack sdd replaces the official one/);
});

test('RF-19.E1: a partial custom pack installs only its own skills', t => {
  const s = setup(t);
  customSkill(s.custom, 'sdd', 'sdd-spec');
  const r = s.rk(['--pack', 'sdd', '--agent', 'claude', '--global']);
  assert.equal(r.status, 0, r.out);
  const skills = readdirSync(path.join(s.HOME, '.claude/skills'));
  assert.deepEqual(skills, ['sdd-spec']);
  assert.equal(existsSync(path.join(s.HOME, '.claude/agents')), false, 'no official sdd agents');
  assert.match(r.stdout, /custom pack sdd replaces the official one/);
});

test('RF-19.F1: without a custom area an official pack installs with no shadow line', t => {
  const s = setup(t);
  const r = s.rk(['--pack', 'sdd', '--agent', 'claude', '--global']);
  assert.equal(r.status, 0, r.out);
  assert.doesNotMatch(r.out, /replaces the official/);
});

test('RF-19.S1: a shadowing install leaves the custom area and the official pack byte-equal', t => {
  const s = setup(t);
  customSkill(s.custom, 'sdd', 'sdd-spec');
  const custom = snapshot(s.custom), official = snapshot(path.join(s.clone, 'packs/sdd'));
  assert.equal(s.rk(['--pack', 'sdd', '--agent', 'claude', '--global']).status, 0);
  assert.deepEqual(snapshot(s.custom), custom);
  assert.deepEqual(snapshot(path.join(s.clone, 'packs/sdd')), official);
});

test('RF-57.H1: a custom script shadowing an official one is reported', t => {
  const s = setup(t);
  stubScript(path.join(s.custom, 'scripts/test-summary'), 'custom');
  const r = s.rk(['--pack', 'core', '--agent', 'claude', '--global']);
  assert.equal(r.status, 0, r.out);
  assert.match(r.stdout, /custom script test-summary replaces the official one/);
});

test('RF-57.E1: a custom script with a new name gives no shadow line', t => {
  const s = setup(t);
  stubScript(path.join(s.custom, 'scripts/foo'), 'foo');
  const r = s.rk(['--pack', 'core', '--agent', 'claude', '--global']);
  assert.equal(r.status, 0, r.out);
  assert.doesNotMatch(r.out, /replaces the official/);
});

test('RF-57.F1: without a custom area core installs with no shadow line', t => {
  const s = setup(t);
  const r = s.rk(['--pack', 'core', '--agent', 'claude', '--global']);
  assert.equal(r.status, 0, r.out);
  assert.doesNotMatch(r.out, /replaces the official/);
});

test('RF-57.S1: a shadowing custom script leaves the custom area byte-equal; core installs as usual', t => {
  const s = setup(t);
  stubScript(path.join(s.custom, 'scripts/test-summary'), 'custom');
  const before = snapshot(s.custom);
  assert.equal(s.rk(['--pack', 'core', '--agent', 'claude', '--global']).status, 0);
  assert.deepEqual(snapshot(s.custom), before);
  assert.ok(rulesBlock(readFileSync(s.claude(), 'utf8')));
  assert.ok(existsSync(path.join(s.HOME, '.claude/skills/core-init/SKILL.md')));
});

// --- RF-29 / RF-49: scripts run from the clone; rules rendered with its path ---------------
test('RF-29.H1: no script is copied; global rules call the clone rigorkit with an absolute path', t => {
  const s = setup(t);
  const r = s.rk(['--pack', 'core', '--agent', 'claude', '--global']);
  assert.equal(r.status, 0, r.out);
  assert.equal(existsSync(path.join(s.HOME, '.local/share/rigorkit')), false);
  assert.equal(renderedCommand(readFileSync(s.claude(), 'utf8')), quoted(s.clone));
  assert.ok(path.isAbsolute(s.clone));
});

test('RF-29.E1: reinstalling from a development clone with --force points the rules to it', t => {
  const s = setup(t);
  const dev = cloneCopy(path.join(s.root, 'dev/rigorkit'));
  assert.equal(s.rk(['--pack', 'core', '--agent', 'claude', '--global']).status, 0);
  const r = run(path.join(dev, 'install.sh'), ['--pack', 'core', '--agent', 'claude', '--global', '--force'], { env: s.env });
  assert.equal(r.status, 0, r.out);
  const text = readFileSync(s.claude(), 'utf8');
  assert.equal(renderedCommand(text), quoted(dev));
  assert.ok(!text.includes(quoted(s.clone)));
  assert.match(r.stdout, /rules {2}.*CLAUDE\.md/);
});

test('RF-29.F1: a moved clone makes the rendered call fail naming the path; nothing else runs', t => {
  const s = setup(t, { clonePath: 'dev/rigorkit' });
  assert.equal(s.sh(['--pack', 'core', '--agent', 'claude', '--global']).status, 0);
  const cmd = renderedCommand(readFileSync(s.claude(), 'utf8'));
  renameSync(s.clone, s.clone + '-moved');
  const call = run('/bin/sh', ['-c', `${cmd} script test-summary`], { env: s.env });
  assert.notEqual(call.status, 0);
  assert.ok(call.stderr.includes(path.join(s.clone, 'bin/rigorkit')), call.stderr);
  assert.doesNotMatch(call.stdout, /official/);
});

test('RF-29.S1: rules.md fits 300 tokens committed and rendered with a 100-character clone path', t => {
  const committed = readFileSync(path.join(repo, 'packs/core/rules.md'), 'utf8');
  assert.ok(committed.includes(PLACEHOLDER), 'rules.md names scripts through the placeholder');
  assert.ok(tokens(committed) <= 300, `committed ${tokens(committed)}`);
  const h = real(home(t));
  const prefix = path.join(h.root, 'c');
  const at = prefix + '/' + 'x'.repeat(100 - prefix.length - 1);
  assert.equal(at.length, 100);
  const s = setup(t, { at });
  assert.equal(s.rk(['--pack', 'core', '--agent', 'claude', '--global']).status, 0);
  const block = rulesBlock(readFileSync(s.claude(), 'utf8'));
  assert.ok(block.includes(quoted(at)));
  assert.ok(tokens(block) <= 300, `rendered ${tokens(block)}`);
});

test('RF-49.H1: CLAUDE.md names <HOME>/.rigorkit/bin/rigorkit and no placeholder is left', t => {
  const s = setup(t);
  const r = s.rk(['--pack', 'core', '--agent', 'claude', '--global']);
  assert.equal(r.status, 0, r.out);
  const text = readFileSync(s.claude(), 'utf8');
  assert.ok(text.includes(`'${s.HOME}/.rigorkit/bin/rigorkit' script`));
  assert.ok(!text.includes(PLACEHOLDER));
});

test('RF-49.E1: Cursor gets the rendered block printed and no rules file', t => {
  const s = setup(t);
  const before = snapshot(s.HOME);
  const r = s.rk(['--pack', 'core', '--agent', 'cursor', '--global']);
  assert.equal(r.status, 0, r.out);
  const committed = readFileSync(path.join(s.clone, 'packs/core/rules.md'), 'utf8');
  assert.ok(r.stdout.includes(committed.split(PLACEHOLDER).join(quoted(s.clone)).trimEnd()), r.stdout);
  assert.ok(!r.stdout.includes(PLACEHOLDER));
  const files = Object.entries(snapshot(s.HOME)).filter(([k, v]) => !(k in before) && v.startsWith('file:'));
  for (const [k, v] of files) assert.ok(!Buffer.from(v.split(':')[2], 'base64').toString('utf8').includes('rigorkit:core:start'), `${k} holds the core block`);
});

test('RF-49.E2: a clone path with a space is quoted and the call works', t => {
  const s = setup(t, { clonePath: 'my clones/rigorkit' });
  assert.equal(s.sh(['--pack', 'core', '--agent', 'claude', '--global']).status, 0);
  const cmd = renderedCommand(readFileSync(s.claude(), 'utf8'));
  assert.equal(cmd, quoted(s.clone));
  assert.equal(run('/bin/sh', ['-c', `${cmd} script test-summary a`], { env: s.env }).stdout, 'official [a]\n');
});

test('RF-49.E3: $, backtick and \\ in the clone path are not expanded', t => {
  const s = setup(t, { clonePath: 'c$HOME`touch pwned`\\x/rigorkit' });
  assert.equal(s.sh(['--pack', 'core', '--agent', 'claude', '--global']).status, 0);
  const cmd = renderedCommand(readFileSync(s.claude(), 'utf8'));
  assert.equal(cmd, quoted(s.clone));
  const call = run('/bin/sh', ['-c', `${cmd} script test-summary`], { env: s.env, cwd: s.root });
  assert.equal(call.stdout, 'official\n', call.out);
  assert.equal(existsSync(path.join(s.root, 'pwned')), false);
});

test('RF-49.F1: a clone path with a quote or a newline is refused before any write', t => {
  for (const name of ["it's/rigorkit", 'line\nbreak/rigorkit']) {
    const s = setup(t, { clonePath: name });
    const before = snapshot(s.HOME);
    const r = s.sh(['--pack', 'core', '--agent', 'claude', '--global']);
    assert.notEqual(r.status, 0, JSON.stringify(name));
    assert.ok(r.stderr.includes(s.clone), r.stderr);
    assert.deepEqual(snapshot(s.HOME), before, JSON.stringify(name));
  }
});

test('RF-49.S1: --dry-run --global shows the rendered block and writes nothing', t => {
  const s = setup(t);
  const before = snapshot(s.HOME);
  const r = s.rk(['--pack', 'core', '--agent', 'claude', '--global', '--dry-run']);
  assert.equal(r.status, 0, r.out);
  assert.ok(r.stdout.includes(quoted(s.clone)));
  assert.deepEqual(snapshot(s.HOME), before);
});
