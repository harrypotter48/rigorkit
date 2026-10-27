#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ESTIMATOR = 'nfc-codepoints-ceil-div4';
const REDUCTION_PACKS = new Set(['sdd', 'architecture', 'frontend']);
const order = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const characters = (text) => [...text.normalize('NFC')].length;
const tokens = (text) => Math.ceil(characters(text) / 4);
const identity = ({ kind, pack, path: file, name }) => JSON.stringify([kind, pack, file, name]);

function stat(file) {
  try { return fs.lstatSync(file); }
  catch (error) {
    if (error.code === 'ENOENT') return undefined;
    throw error;
  }
}

function regular(file, type) {
  const info = stat(file);
  if (!info) return false;
  if (info.isSymbolicLink()) throw new Error(`Symlinks are not supported in measured content: ${file}`);
  if (!(type === 'directory' ? info.isDirectory() : info.isFile())) {
    throw new Error(`Expected ${type}: ${file}`);
  }
  return true;
}

function directories(dir) {
  if (!regular(dir, 'directory')) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => order(a.name, b.name));
}

function frontmatter(text, file) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error(`Missing or invalid frontmatter: ${file}`);
  const fields = new Map();
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^(name|description):\s*(.*?)\s*$/);
    if (!field) continue;
    if (fields.has(field[1])) throw new Error(`Duplicate ${field[1]} in ${file}`);
    fields.set(field[1], field[2]);
  }
  const description = fields.get('description')?.match(/^'((?:[^']|'')*)'$/);
  const rawName = fields.get('name') ?? '';
  const name = rawName.startsWith("'") && rawName.endsWith("'")
    ? rawName.slice(1, -1).replaceAll("''", "'") : rawName;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) || name.length > 64 || !description) {
    throw new Error(`Invalid name or single-quoted description: ${file}`);
  }
  return { name, description: description[1].replaceAll("''", "'"), body: text.slice(match[0].length) };
}

export function measureRepository(root) {
  const resolved = fs.realpathSync(root);
  const packsDir = path.join(resolved, 'packs');
  if (!regular(packsDir, 'directory')) throw new Error(`Missing packs directory: ${packsDir}`);
  const entries = [];
  const files = [];
  const rules = [];
  const packs = [];
  const read = (relative) => {
    const absolute = path.join(resolved, relative);
    if (!regular(absolute, 'file')) throw new Error(`Missing content file: ${relative}`);
    return fs.readFileSync(absolute, 'utf8');
  };
  const markdown = (relative) => {
    const found = [];
    for (const item of directories(path.join(resolved, relative))) {
      const child = `${relative}/${item.name}`;
      if (item.isSymbolicLink()) throw new Error(`Symlinks are not supported in measured content: ${child}`);
      if (item.isDirectory()) found.push(...markdown(child));
      else if (item.isFile() && item.name.endsWith('.md') && item.name !== 'NOTICE.md') found.push(child);
    }
    return found;
  };
  const add = (kind, pack, relative, expectedName) => {
    const { name, description, body } = frontmatter(read(relative), relative);
    const parts = [{ path: relative, content: body }];
    if (kind === 'skill') {
      for (const auxiliary of markdown(path.posix.dirname(relative))) {
        if (auxiliary !== relative) parts.push({ path: auxiliary, content: read(auxiliary) });
      }
    }
    const entry = {
      kind, pack, path: relative, name, expectedName,
      descriptionCharacters: characters(description),
      loadedTokens: tokens(parts.map((part) => part.content).join('')),
      packPrefix: name.startsWith(`${pack}-`),
      roleDeclared: kind === 'agent' ? /top 1%/i.test(body) : null,
    };
    entries.push(entry);
    for (const part of parts) files.push({ path: part.path, tokens: tokens(part.content), entry });
  };

  for (const pack of directories(packsDir)) {
    if (pack.isSymbolicLink()) throw new Error(`Symlinks are not supported in packs: ${pack.name}`);
    if (!pack.isDirectory()) continue;
    packs.push(pack.name);
    const base = `packs/${pack.name}`;
    for (const skill of directories(path.join(resolved, base, 'skills'))) {
      if (skill.isSymbolicLink()) throw new Error(`Symlinks are not supported in skills: ${skill.name}`);
      if (!skill.isDirectory()) continue;
      const relative = `${base}/skills/${skill.name}/SKILL.md`;
      if (regular(path.join(resolved, relative), 'file')) add('skill', pack.name, relative, skill.name);
    }
    for (const agent of directories(path.join(resolved, base, 'agents'))) {
      if (agent.isSymbolicLink()) throw new Error(`Symlinks are not supported in agents: ${agent.name}`);
      if (agent.isFile() && agent.name.endsWith('.md')) {
        add('agent', pack.name, `${base}/agents/${agent.name}`, agent.name.slice(0, -3));
      }
    }
    const relative = `${base}/rules.md`;
    if (regular(path.join(resolved, relative), 'file')) rules.push({ path: relative, tokens: tokens(read(relative)) });
  }
  entries.sort((a, b) => order(a.path, b.path));
  files.sort((a, b) => order(a.path, b.path));
  rules.sort((a, b) => order(a.path, b.path));
  return { entries, files, rules, packs };
}

function readBaseline(file) {
  let baseline;
  try { baseline = JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (error) { throw new Error(`Cannot read baseline ${file}: ${error.message}`); }
  const invalid = (reason) => { throw new Error(`Invalid baseline ${file}: ${reason}`); };
  const integer = (value) => Number.isSafeInteger(value) && value >= 0;
  if (!baseline || baseline.version !== 1 || baseline.estimator !== ESTIMATOR ||
      typeof baseline.commit !== 'string' || !/^[a-f0-9]{7,40}$/i.test(baseline.commit) ||
      !Array.isArray(baseline.entries) || !Array.isArray(baseline.rules)) {
    invalid('expected version 1, commit, estimator, entries and rules');
  }
  const paths = new Set();
  for (const entry of baseline.entries) {
    if (!entry || !['skill', 'agent'].includes(entry.kind) || typeof entry.path !== 'string' ||
        typeof entry.name !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.name) ||
        entry.name.length > 64 || !integer(entry.descriptionCharacters) || !integer(entry.loadedTokens)) {
      invalid('invalid skill/agent entry');
    }
    const match = entry.kind === 'skill'
      ? entry.path.match(/^packs\/([^/]+)\/skills\/([^/]+)\/SKILL\.md$/)
      : entry.path.match(/^packs\/([^/]+)\/agents\/([^/]+)\.md$/);
    if (!match || entry.pack !== match[1] || entry.name !== match[2] ||
        ['.', '..'].includes(entry.pack) || paths.has(entry.path)) {
      invalid(`invalid or duplicate identity: ${entry.path}`);
    }
    paths.add(entry.path);
  }
  for (const rule of baseline.rules) {
    const match = typeof rule?.path === 'string' && rule.path.match(/^packs\/([^/]+)\/rules\.md$/);
    if (!match || ['.', '..'].includes(match[1]) || !integer(rule.tokens) || paths.has(rule.path)) {
      invalid('invalid or duplicate rules entry');
    }
    paths.add(rule.path);
  }
  return baseline;
}

function packTotals(entries) {
  const totals = new Map();
  for (const entry of entries) {
    const sum = (totals.get(entry.pack) ?? 0) + entry.loadedTokens;
    if (!Number.isSafeInteger(sum)) throw new Error(`Token total exceeds the safe integer range: ${entry.pack}`);
    totals.set(entry.pack, sum);
  }
  return totals;
}

function compare(current, baseline) {
  const errors = [];
  const previous = new Map(baseline.entries.map((entry) => [identity(entry), entry]));
  const actual = new Map(current.entries.map((entry) => [identity(entry), entry]));
  for (const [key, entry] of previous) {
    if (!actual.has(key)) errors.push(`Identity removed: ${entry.kind} ${entry.name} (${entry.path})`);
  }
  for (const [key, entry] of actual) {
    if (!previous.has(key)) errors.push(`Identity added: ${entry.kind} ${entry.name} (${entry.path})`);
    if (entry.name !== entry.expectedName) {
      errors.push(`Name mismatch: ${entry.path}: ${entry.name}; expected ${entry.expectedName}`);
    }
    if (entry.descriptionCharacters > 300) {
      errors.push(`Description exceeds 300 characters: ${entry.path}: ${entry.descriptionCharacters}`);
    }
    if (!entry.packPrefix) {
      errors.push(`Pack prefix mismatch: ${entry.path}: ${entry.name} does not start with "${entry.pack}-"`);
    }
    if (entry.kind === 'agent' && !entry.roleDeclared) {
      errors.push(`Missing top 1% role: ${entry.path}`);
    }
  }
  for (const rule of current.rules) {
    if (rule.tokens > 300) errors.push(`Rules exceed 300 tokens: ${rule.path}: ${rule.tokens}`);
  }
  const before = packTotals(baseline.entries);
  const after = packTotals(current.entries);
  const names = new Set([...current.packs, ...before.keys(), ...REDUCTION_PACKS]);
  const packs = [...names].sort(order).map((name) => {
    const oldTokens = before.get(name) ?? 0;
    const newTokens = after.get(name) ?? 0;
    const required = REDUCTION_PACKS.has(name);
    const meetsTarget = oldTokens > 0 && BigInt(newTokens) * 10n <= BigInt(oldTokens) * 7n;
    if (required && !meetsTarget) {
      errors.push(oldTokens === 0
        ? `Reduction baseline missing or zero for pack ${name}`
        : `Reduction below 30% for pack ${name}: current=${newTokens} baseline=${oldTokens}`);
    }
    const reduction = oldTokens > 0 ? `${((1 - newTokens / oldTokens) * 100).toFixed(2)}%` : 'n/a';
    return { name, oldTokens, newTokens, required, meetsTarget, reduction };
  });
  return { errors, packs };
}

function report(current, baseline, comparison, baselinePath) {
  const entries = new Map(baseline.entries.map((entry) => [entry.path, entry]));
  const rules = new Map(baseline.rules.map((rule) => [rule.path, rule]));
  console.log(`Baseline: ${baselinePath}; commit=${baseline.commit}; estimator=${ESTIMATOR}`);
  console.log('Files: current tokens; main files also show loaded entry tokens and description characters.');
  console.log('Auxiliary file baselines are included in their entry totals; file rounding is independent.');
  for (const file of current.files) {
    const entry = file.entry;
    const old = entries.get(entry.path);
    const details = file.path === entry.path
      ? ` loaded=${entry.loadedTokens} baseline-loaded=${old?.loadedTokens ?? 'n/a'}` +
        ` description=${entry.descriptionCharacters} baseline-description=${old?.descriptionCharacters ?? 'n/a'} name=${entry.name}`
      : ' baseline=included-in-entry';
    console.log(`${file.path} tokens=${file.tokens}${details}`);
  }
  console.log('Rules: current and baseline token estimates.');
  for (const rule of current.rules) {
    console.log(`${rule.path} tokens=${rule.tokens} baseline=${rules.get(rule.path)?.tokens ?? 'n/a'}`);
  }
  for (const rule of baseline.rules) {
    if (!current.rules.some((actual) => actual.path === rule.path)) {
      console.log(`${rule.path} current=absent baseline=${rule.tokens}`);
    }
  }
  console.log('Packs: loaded tokens, excluding frontmatter and NOTICE; reduction tested independently.');
  for (const pack of comparison.packs) {
    const target = pack.required ? ` target>=30% ${pack.meetsTarget ? 'PASS' : 'FAIL'}` : ' target=n/a';
    console.log(`${pack.name} current=${pack.newTokens} baseline=${pack.oldTokens} reduction=${pack.reduction}${target}`);
  }
  console.log(`Identity and limit checks: ${comparison.errors.length} error(s).`);
  for (const error of comparison.errors) console.error(`error: ${error}`);
}

function argumentsFor(argv) {
  if (argv.length === 1 && ['-h', '--help'].includes(argv[0])) return { help: true };
  const options = {};
  for (let i = 0; i < argv.length; i += 2) {
    const flag = argv[i];
    const value = argv[i + 1];
    if (!['--root', '--baseline'].includes(flag) || !value || value.startsWith('--')) {
      throw new Error('Usage: node tools/measure-content.mjs --root <repo> --baseline <baseline.txt>');
    }
    const key = flag.slice(2);
    if (options[key]) throw new Error(`Duplicate argument: ${flag}`);
    options[key] = path.resolve(value);
  }
  if (!options.root || !options.baseline) throw new Error('Both --root and --baseline are required');
  return options;
}

function main() {
  try {
    const options = argumentsFor(process.argv.slice(2));
    if (options.help) {
      console.log('Usage: node tools/measure-content.mjs --root <repo> --baseline <baseline.txt>');
      return;
    }
    const baseline = readBaseline(options.baseline);
    const current = measureRepository(options.root);
    const comparison = compare(current, baseline);
    report(current, baseline, comparison, options.baseline);
    process.exitCode = comparison.errors.length ? 1 : 0;
  } catch (error) {
    console.error(`error: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
