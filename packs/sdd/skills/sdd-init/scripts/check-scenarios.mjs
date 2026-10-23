#!/usr/bin/env node
// rigorkit · check-scenarios — static checks for an SDD spec's test plan.
//
// 1. Every RF has all four scenario types (H happy, E edge, F failure, S security),
//    or an RF-n.<type> row with "n/a — <reason>".
// 2. Every scenario except [manual] has a test file containing its ID (e.g. RF-3.F2)
//    and the change ID (e.g. in describe). The change ID prevents another change's
//    test with the same RF-n from counting by mistake.
//
// Usage (from the repository root, Node >= 18, no dependencies):
//   node specs/scripts/check-scenarios.mjs                        all specs/changes/
//   node specs/scripts/check-scenarios.mjs specs/changes/<id>/spec.md [--tests <dir>]...
//
// Without arguments, a change with no tests yet is warned about without failing.
// An explicit spec or --strict requires coverage. Exit code 1 means errors.

import fs from 'node:fs';
import path from 'node:path';

const TYPES = { H: 'happy', E: 'edge', F: 'failure', S: 'security' };
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', 'out', 'coverage', '.next', '.turbo', '.cache', 'specs']);
const TEST_FILE = /(\.|_)(test|spec)\.[a-z0-9]+$|^test_.*\.py$/i;
const TEST_DIR = /^(__tests__|tests?|e2e)$/i;

function parseArgs(argv) {
  const opts = { specs: [], tests: [], strict: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--tests') opts.tests.push(argv[++i]);
    else if (a === '--strict') opts.strict = true;
    else if (a === '-h' || a === '--help') opts.help = true;
    else opts.specs.push(a);
  }
  return opts;
}

function findSpecs() {
  const dir = path.join('specs', 'changes');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => path.join(dir, d.name, 'spec.md'))
    .filter((p) => fs.existsSync(p));
}

function collectTestFiles(roots) {
  const files = [];
  const walk = (dir, inTestDir) => {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (!SKIP_DIRS.has(e.name)) walk(full, inTestDir || TEST_DIR.test(e.name));
      } else if (e.isFile() && (TEST_FILE.test(e.name) || (inTestDir && /\.[a-z0-9]+$/i.test(e.name)))) {
        files.push(full);
      }
    }
  };
  for (const r of roots) walk(r, false);
  return files.map((f) => ({ file: f, content: fs.readFileSync(f, 'utf8') }));
}

function parseSpec(text) {
  const lines = text.split(/\r?\n/);
  const rfs = new Set();
  for (const l of lines) {
    const m = l.match(/^\s*[-*]\s*\**RF-(\d+)\**\s*:/);
    if (m) rfs.add(Number(m[1]));
  }

  const start = lines.findIndex((l) => /^##\s+(?:Test scenarios|Escenarios de prueba)/i.test(l));
  const scenarios = [];
  const errors = [];
  if (start === -1) return { rfs, scenarios, errors: ['missing section "## Test scenarios" (Spanish alias: "## Escenarios de prueba")'] };

  for (let i = start + 1; i < lines.length && !/^##\s/.test(lines[i]); i++) {
    const l = lines[i].trim();
    if (!l.startsWith('|')) continue;
    const cells = l.split('|').slice(1, -1).map((c) => c.trim());
    const m = (cells[0] || '').replace(/`/g, '').match(/^RF-(\d+)\.([HEFS])(\d+)?$/);
    if (!m) continue;
    const [, rf, type, num] = m;
    const id = `RF-${rf}.${type}${num ?? ''}`;
    const na = !num;
    if (na && !/n\/a\s*[—–-]+\s*\S/i.test(l)) errors.push(`${id}: n/a row has no reason (format: "n/a — <reason>")`);
    if (!na && /\bn\/a\b/i.test(l)) errors.push(`${id}: a numbered scenario cannot be n/a (use ${`RF-${rf}.${type}`})`);
    scenarios.push({ id, rf: Number(rf), type, na, manual: /\[manual\]/i.test(l), line: i + 1 });
  }
  return { rfs, scenarios, errors };
}

function hasTest(testFiles, changeId, scenarioId) {
  const re = new RegExp(`(?<![\\w.-])${scenarioId.replace('.', '\\.')}(?!\\d)`);
  return testFiles.some((t) => t.content.includes(changeId) && re.test(t.content));
}

function checkSpec(specPath, testFiles, strict) {
  const changeId = path.basename(path.dirname(specPath));
  const { rfs, scenarios, errors } = parseSpec(fs.readFileSync(specPath, 'utf8'));
  const warnings = [];

  const seen = new Set();
  for (const s of scenarios) {
    if (seen.has(s.id)) errors.push(`${s.id}: duplicate ID (line ${s.line})`);
    seen.add(s.id);
    if (!rfs.has(s.rf)) errors.push(`${s.id}: el RF-${s.rf} does not exist in the spec`);
  }

  if (rfs.size === 0) errors.push('no RF found (format: "- RF-n: …")');
  for (const rf of [...rfs].sort((a, b) => a - b)) {
    for (const [t, name] of Object.entries(TYPES)) {
      const ofType = scenarios.filter((s) => s.rf === rf && s.type === t);
      const na = ofType.some((s) => s.na);
      const real = ofType.some((s) => !s.na);
      if (!na && !real) errors.push(`RF-${rf}: missing a ${name} scenario (${t}) or a row "RF-${rf}.${t} | n/a — <reason>"`);
      if (na && real) errors.push(`RF-${rf}: ${name} (${t}) has both scenarios and n/a`);
    }
  }

  const toTest = scenarios.filter((s) => !s.na && !s.manual);
  const missing = toTest.filter((s) => !hasTest(testFiles, changeId, s.id));
  if (toTest.length > 0 && missing.length === toTest.length && !strict) {
    warnings.push(`no scenario has a test yet: skipping coverage (use --strict to require it)`);
  } else {
    for (const s of missing) errors.push(`${s.id}: missing test (no test file contains "${s.id}" and "${changeId}")`);
  }

  const manual = scenarios.filter((s) => s.manual).map((s) => s.id);
  return { specPath, changeId, errors, warnings, count: scenarios.length, manual };
}

const opts = parseArgs(process.argv.slice(2));
if (opts.help) {
  console.log('Usage: node specs/scripts/check-scenarios.mjs [specs/changes/<id>/spec.md ...] [--tests <dir>]... [--strict]');
  process.exit(0);
}

const explicit = opts.specs.length > 0;
const specs = explicit ? opts.specs : findSpecs();
if (specs.length === 0) {
  console.log('check-scenarios: no specs in specs/changes/, nothing to check.');
  process.exit(0);
}

const testFiles = collectTestFiles(opts.tests.length ? opts.tests : ['.']);
let failed = false;
for (const spec of specs) {
  if (!fs.existsSync(spec)) { console.error(`✗ ${spec}: does not exist`); failed = true; continue; }
  const r = checkSpec(spec, testFiles, opts.strict || explicit);
  const ok = r.errors.length === 0;
  failed ||= !ok;
  console.log(`${ok ? '✓' : '✗'} ${r.changeId} — ${r.count} scenarios${r.manual.length ? `, manual: ${r.manual.join(', ')}` : ''}`);
  for (const w of r.warnings) console.log(`  ! ${w}`);
  for (const e of r.errors) console.log(`  ✗ ${e}`);
}
process.exit(failed ? 1 : 0);
