import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

export function git(root, ...args) {
  return execFileSync('git', ['-c', 'core.hooksPath=/dev/null', '-c', 'commit.gpgsign=false', ...args], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}
export function put(root, file, content) {
  mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  writeFileSync(path.join(root, file), content);
}
export function commit(root, message) { git(root, 'add', '-A'); git(root, 'commit', '-qm', message); return git(root, 'rev-parse', 'HEAD'); }
export function fixture(t, constitution = '# Constitution\n## Test paths (frozen tests)\n- `src/**/*.test.js`\n') {
  const root = mkdtempSync(path.join(tmpdir(), 'rigorkit-factory-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  git(root, 'init', '-q'); git(root, 'config', 'user.name', 'Factory fixture'); git(root, 'config', 'user.email', 'factory@example.invalid');
  put(root, 'specs/constitution.md', constitution); put(root, 'README.md', 'fixture');
  const base = commit(root, 'fixture base');
  put(root, 'src/form.test.js', '// RF-8.H1: expected behavior\n');
  const red = commit(root, 'test(red): HU-1 form behavior');
  return { root, base, red };
}
