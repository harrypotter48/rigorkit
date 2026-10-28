#!/usr/bin/env node
// Captures a content baseline: the loaded-token estimate of every skill and agent of the
// packs tree at a given commit. The capture is immutable (it refuses to overwrite) and
// records the target that the comparison CLI will enforce against it.
//
//   node tools/capture-baseline.mjs --source <commit> --output <file> [--target <percent>]
//
// Without --target the baseline keeps the original policy (30% reduction in sdd,
// architecture and frontend). With --target the baseline becomes a ratchet: every pack
// it contains must hold that reduction, so 0 means no growth without a new baseline.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { measureRepository } from './measure-content.mjs';

const root = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const git = (...args) => execFileSync('git', args, { cwd: root, maxBuffer: 32 * 1024 * 1024 });

function optionsFor(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (!['--source', '--output', '--target'].includes(flag) || !value || value.startsWith('--')) {
      throw new Error('Usage: node tools/capture-baseline.mjs --source <commit> --output <file> [--target <percent>]');
    }
    const key = flag.slice(2);
    if (options[key] !== undefined) throw new Error(`Duplicate argument: ${flag}`);
    options[key] = value;
  }
  if (!options.source || !options.output) {
    throw new Error('Usage: node tools/capture-baseline.mjs --source <commit> --output <file> [--target <percent>]');
  }
  if (options.target !== undefined) {
    const percent = Number(options.target);
    if (!Number.isSafeInteger(percent) || percent < 0 || percent > 100) {
      throw new Error(`Invalid target percentage: ${options.target}`);
    }
    options.target = percent;
  }
  options.output = path.resolve(root, options.output);
  return options;
}

function capture(options) {
  const commit = git('rev-parse', '--verify', `${options.source}^{commit}`).toString('utf8').trim();
  if (!/^[a-f0-9]{40}$/.test(commit)) throw new Error('Unexpected source commit');
  if (fs.existsSync(options.output)) throw new Error(`Baseline already exists; refusing overwrite: ${options.output}`);
  const tree = git('ls-tree', '-r', '-z', '--full-tree', commit, '--', 'packs').toString('utf8');
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'rigorkit-baseline-'));
  try {
    for (const record of tree.split('\0').filter(Boolean)) {
      const tab = record.indexOf('\t');
      if (tab < 0) throw new Error('Invalid Git tree record');
      const [mode, type, object] = record.slice(0, tab).split(' ');
      const relative = record.slice(tab + 1);
      if (!/^100(?:644|755)$/.test(mode) || type !== 'blob' ||
          !/^[a-f0-9]{40}$/.test(object) || !relative.startsWith('packs/') ||
          relative.split('/').some((part) => !part || part === '.' || part === '..')) {
        throw new Error(`Unsupported baseline tree entry: ${relative}`);
      }
      const target = path.join(temporary, relative);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, git('cat-file', 'blob', object), { flag: 'wx' });
    }
    const measured = measureRepository(temporary);
    if (measured.entries.length === 0) throw new Error('Source commit has no skills or agents');
    for (const entry of measured.entries) {
      if (entry.name !== entry.expectedName) throw new Error(`Baseline name mismatch: ${entry.path}`);
    }
    const baseline = {
      version: 1, commit, estimator: 'nfc-codepoints-ceil-div4',
      entries: measured.entries.map(({ kind, pack, path: file, name, descriptionCharacters, loadedTokens }) =>
        ({ kind, pack, path: file, name, descriptionCharacters, loadedTokens })),
      rules: measured.rules,
    };
    if (options.target !== undefined) baseline.targetReductionPercent = options.target;
    // Capture records the original values; the new limits are only enforced by the comparison CLI.
    fs.mkdirSync(path.dirname(options.output), { recursive: true });
    fs.writeFileSync(options.output, JSON.stringify(baseline, null, 2) + '\n', { flag: 'wx' });
    console.log(`Baseline created: ${options.output}`);
    console.log(`Source: ${commit}; entries=${baseline.entries.length}; rules=${baseline.rules.length}`);
    if (options.target !== undefined) console.log(`Target: >=${options.target}% reduction over every pack in this baseline`);
    const totals = new Map();
    for (const entry of baseline.entries) totals.set(entry.pack, (totals.get(entry.pack) ?? 0) + entry.loadedTokens);
    for (const [pack, count] of [...totals].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)) {
      console.log(`${pack}: baseline loaded tokens=${count}`);
    }
    for (const rule of baseline.rules) console.log(`${rule.path}: baseline tokens=${rule.tokens}`);
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}

try { capture(optionsFor(process.argv.slice(2))); }
catch (error) {
  console.error(`error: ${error.message}`);
  process.exitCode = 1;
}
