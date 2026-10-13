#!/usr/bin/env node
// rigorkit · check-scenarios — chequeo estático del plan de pruebas de un spec SDD.
//
// 1. Cada RF del spec tiene escenarios de los 4 tipos (H happy, E borde, F falla, S seguridad)
//    o una fila `RF-n.<tipo>` con `n/a — <motivo>`.
// 2. Cada escenario (salvo `[manual]`) tiene un test: un archivo de test que contiene el ID
//    del escenario (ej. `RF-3.F2`) y el <id> del cambio (ej. en el describe). El <id> evita
//    que un test de otro cambio con el mismo RF-n cuente por error.
//
// Uso (desde la raíz del repo, Node >= 18, sin dependencias):
//   node specs/scripts/check-scenarios.mjs                        todos los cambios de specs/changes/
//   node specs/scripts/check-scenarios.mjs specs/changes/<id>/spec.md [--tests <dir>]...
//
// Sin argumentos, un cambio sin ningún test todavía (spec en curso) se avisa y no falla.
// Con un spec explícito o con --strict, sí falla. Sale con código 1 si hay errores.

import fs from 'node:fs';
import path from 'node:path';

const TYPES = { H: 'happy', E: 'borde', F: 'falla', S: 'seguridad' };
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

  const start = lines.findIndex((l) => /^##\s+Escenarios de prueba/i.test(l));
  const scenarios = [];
  const errors = [];
  if (start === -1) return { rfs, scenarios, errors: ['no tiene la sección "## Escenarios de prueba"'] };

  for (let i = start + 1; i < lines.length && !/^##\s/.test(lines[i]); i++) {
    const l = lines[i].trim();
    if (!l.startsWith('|')) continue;
    const cells = l.split('|').slice(1, -1).map((c) => c.trim());
    const m = (cells[0] || '').replace(/`/g, '').match(/^RF-(\d+)\.([HEFS])(\d+)?$/);
    if (!m) continue;
    const [, rf, type, num] = m;
    const id = `RF-${rf}.${type}${num ?? ''}`;
    const na = !num;
    if (na && !/n\/a\s*[—–-]+\s*\S/i.test(l)) errors.push(`${id}: fila n/a sin motivo (formato: "n/a — <motivo>")`);
    if (!na && /\bn\/a\b/i.test(l)) errors.push(`${id}: un escenario con número no puede ser n/a (usa ${`RF-${rf}.${type}`})`);
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
    if (seen.has(s.id)) errors.push(`${s.id}: ID duplicado (línea ${s.line})`);
    seen.add(s.id);
    if (!rfs.has(s.rf)) errors.push(`${s.id}: el RF-${s.rf} no existe en el spec`);
  }

  if (rfs.size === 0) errors.push('no se encontró ningún RF (formato: "- RF-n: …")');
  for (const rf of [...rfs].sort((a, b) => a - b)) {
    for (const [t, name] of Object.entries(TYPES)) {
      const ofType = scenarios.filter((s) => s.rf === rf && s.type === t);
      const na = ofType.some((s) => s.na);
      const real = ofType.some((s) => !s.na);
      if (!na && !real) errors.push(`RF-${rf}: falta un escenario de ${name} (${t}) o una fila "RF-${rf}.${t} | n/a — <motivo>"`);
      if (na && real) errors.push(`RF-${rf}: ${name} (${t}) tiene escenarios y n/a a la vez`);
    }
  }

  const toTest = scenarios.filter((s) => !s.na && !s.manual);
  const missing = toTest.filter((s) => !hasTest(testFiles, changeId, s.id));
  if (toTest.length > 0 && missing.length === toTest.length && !strict) {
    warnings.push(`ningún escenario tiene test todavía: se omite la cobertura (usa --strict para exigirla)`);
  } else {
    for (const s of missing) errors.push(`${s.id}: sin test (ningún archivo de test contiene "${s.id}" y "${changeId}")`);
  }

  const manual = scenarios.filter((s) => s.manual).map((s) => s.id);
  return { specPath, changeId, errors, warnings, count: scenarios.length, manual };
}

const opts = parseArgs(process.argv.slice(2));
if (opts.help) {
  console.log('Uso: node specs/scripts/check-scenarios.mjs [specs/changes/<id>/spec.md ...] [--tests <dir>]... [--strict]');
  process.exit(0);
}

const explicit = opts.specs.length > 0;
const specs = explicit ? opts.specs : findSpecs();
if (specs.length === 0) {
  console.log('check-scenarios: no hay specs en specs/changes/, nada que revisar.');
  process.exit(0);
}

const testFiles = collectTestFiles(opts.tests.length ? opts.tests : ['.']);
let failed = false;
for (const spec of specs) {
  if (!fs.existsSync(spec)) { console.error(`✗ ${spec}: no existe`); failed = true; continue; }
  const r = checkSpec(spec, testFiles, opts.strict || explicit);
  const ok = r.errors.length === 0;
  failed ||= !ok;
  console.log(`${ok ? '✓' : '✗'} ${r.changeId} — ${r.count} escenarios${r.manual.length ? `, manuales: ${r.manual.join(', ')}` : ''}`);
  for (const w of r.warnings) console.log(`  ! ${w}`);
  for (const e of r.errors) console.log(`  ✗ ${e}`);
}
process.exit(failed ? 1 : 0);
