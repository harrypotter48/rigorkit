#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { measureRepository } from './measure-content.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const sourceCommit = 'edad00214e552594fe4da00e51c88803a22f19c5';
const output = path.join(root, 'specs/changes/001-english-and-compact/baseline.txt');
const git = (...args) => execFileSync('git', args, { cwd: root, maxBuffer: 32 * 1024 * 1024 });

function capture() {
  if (process.argv.length !== 2) {
    throw new Error('Usage: node tools/capture-baseline.mjs (fixed source: edad002; refuses overwrite)');
  }
  const commit = git('rev-parse', '--verify', `${sourceCommit}^{commit}`).toString('utf8').trim();
  if (commit !== sourceCommit) throw new Error('Unexpected source commit');
  if (fs.existsSync(output)) throw new Error(`Baseline already exists; refusing overwrite: ${output}`);
  const tree = git('ls-tree', '-r', '-z', '--full-tree', commit, '--', 'packs').toString('utf8');
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'rigorkit-baseline-001-'));
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
    // Capture records the original values; the new limits are only enforced by the comparison CLI.
    fs.writeFileSync(output, JSON.stringify(baseline, null, 2) + '\n', { flag: 'wx' });
    console.log(`Baseline created: ${output}`);
    console.log(`Source: ${commit}; entries=${baseline.entries.length}; rules=${baseline.rules.length}`);
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

try { capture(); }
catch (error) {
  console.error(`error: ${error.message}`);
  process.exitCode = 1;
}
