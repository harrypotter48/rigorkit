// 022-global-rules-on-install — guards for facts that three scripts repeat (architecture review of B3 and of the whole change).
// The tool-to-file map lives in install.sh (rules_file), lib/update.sh (rules_file) and tools/install-remote.sh (instr_file):
// each function is extracted from its script and run for every tool, with and without CODEX_HOME; the results must agree.
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { home, run, repo } from './update-fixture.mjs';

const text = f => readFileSync(path.join(repo, f), 'utf8');
const body = (src, name) => {
  const m = src.match(new RegExp(`^${name}\\(\\) \\{[^\\n]*\\n(?:.*\\n)*?\\}\\n`, 'm'));
  assert.ok(m, `function ${name} not found`);
  return m[0];
};
const TOOLS = ['claude', 'codex', 'opencode', 'cursor'];

describe('022-global-rules-on-install', () => {
  test('Twin guard: install.sh, lib/update.sh and tools/install-remote.sh map every tool to the same instruction file', t => {
    const h = home(t);
    const codexHome = path.join(h.root, 'codex-home');
    const install = body(text('install.sh'), 'rules_file');
    const update = body(text('lib/update.sh'), 'rules_file');
    const remote = body(text('tools/install-remote.sh'), 'instr_file');
    for (const env of [{}, { CODEX_HOME: codexHome }]) {
      for (const tool of TOOLS) {
        const e = { HOME: h.HOME, ...env };
        const a = run('bash', ['-c', `${install}\nrules_file ${tool}`], { env: e }).stdout.trim();
        const b = run('bash', ['-c', `${update}\nrules_file "$HOME" "\${CODEX_HOME:-$HOME/.codex}" ${tool}`], { env: e }).stdout.trim();
        const c = run('sh', ['-c', `${remote}\ninstr_file ${tool}`], { env: e }).stdout.trim();
        if (tool === 'cursor') { assert.equal(a, ''); assert.equal(b, ''); assert.equal(c, ''); continue; }
        assert.ok(a.endsWith('.md') && a.startsWith(h.HOME) || a.startsWith(codexHome), `${tool}: ${a}`);
        assert.equal(c, a, `${tool}: tools/install-remote.sh differs from install.sh (${JSON.stringify(env)})`);
        assert.equal(b, a, `${tool}: lib/update.sh differs from install.sh (${JSON.stringify(env)})`);
      }
    }
  });
});
