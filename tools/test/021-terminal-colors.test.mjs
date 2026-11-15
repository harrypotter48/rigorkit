// 021-terminal-colors — scenario tests for approved B1; no product scaffolding.
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import {
  BASE, NEED_PTY, Q, SGR, STATE, RECORD, setup, plain, terminal, dual,
  project, scanExpected, records, addProbe, updateSetup, keepSteps,
  assertColor, stateAtEnd, stripOwned, noEsc, expectedRootHelp, put, filesBelow,
} from './021-terminal-colors-fixture.mjs';

const tty = { skip: NEED_PTY };
const warnText = "warning: custom pack 'all' ignored: a pack name cannot be all or contain a comma or space";
const heading = s => `rigorkit ${s.version} (local)`;
const invalid = ['unknown-command'];
const errorText = 'rigorkit: unknown command: unknown-command';
const content = (s, rel) => readFileSync(path.join(s.h.HOME, rel), 'utf8');

function coloredDiff(s, options = {}) {
  const result = terminal(s, ['update'], { steps: keepSteps(s), ...options });
  assert.equal(result.status, 0, result.stderr);
  return result;
}
function checkDiff(result) {
  assertColor(result.stdout, '-REMOVE-ME', SGR.error);
  assertColor(result.stdout, '+ADDED-LINE', SGR.success);
  assertColor(result.stdout, '@@ -3,7 +3,6 @@', SGR.heading);
  assertColor(result.stdout, ' error warning +context', SGR.plain);
  assert.ok(stripOwned(result.stdout).includes(BASE.diffHunk), result.stdout);
}

describe('021-terminal-colors', () => {
  test('Harness: independent terminals, pipes, raw bytes and nonzero status', tty, t => {
    const s = setup(t);
    for (const [stdout, stderr] of [['tty', 'pipe'], ['pipe', 'tty'], ['tty', 'tty'], ['pipe', 'pipe']]) {
      const result = terminal(s, [], { stdout, stderr, stdin: 'pipe', command: ['/bin/sh', '-c',
        'if [ -t 0 ]; then printf tty; else printf pipe; fi; if [ -t 1 ]; then printf :tty; else printf :pipe; fi; if [ -t 2 ]; then printf :tty; else printf :pipe; fi; printf "\\377\\000" >&2; exit 7'] });
      assert.equal(result.status, 7);
      assert.equal(result.stdout, `pipe:${stdout}:${stderr}`);
      assert.deepEqual(result.rawstderr, Buffer.from([255, 0]));
    }
  });

  test('RF-1.H1: stdout and stderr independently receive semantic colors on terminals', tty, t => {
    const s = setup(t), result = terminal(s, dual(s));
    assert.equal(result.status, 0);
    assertColor(result.stdout, heading(s), SGR.heading);
    assertColor(result.stderr, warnText, SGR.warning);
  });
  test('RF-1.E1: redirected stdout is plain while terminal stderr stays colored', tty, t => {
    const s = setup(t), result = terminal(s, dual(s), { stdout: 'pipe' });
    assert.equal(result.status, 0);
    noEsc(result.stdout);
    assert.ok(result.stdout.includes(heading(s)));
    assertColor(result.stderr, warnText, SGR.warning);
  });
  test('RF-1.E2: terminal stdout stays colored while redirected stderr is plain', tty, t => {
    const s = setup(t), result = terminal(s, dual(s), { stderr: 'pipe' });
    assert.equal(result.status, 0);
    assertColor(result.stdout, heading(s), SGR.heading);
    assert.equal(result.stderr, warnText + '\n');
  });
  test('RF-1.E3: terminal color does not depend on terminal stdin', tty, t => {
    const s = setup(t), result = terminal(s, dual(s), { stdin: 'pipe' });
    assertColor(result.stdout, heading(s), SGR.heading);
    assertColor(result.stderr, warnText, SGR.warning);
    const p = project(s);
    const scan = terminal(s, ['scan', path.dirname(p)], { stdin: 'pipe' });
    assert.equal(scan.status, 0);
    assert.equal(scan.stderr, '', 'non-terminal input must not make scan interactive');
    assert.equal(records(s).length, 0);
    assertColor(scan.stdout, 'found 1 new projects:', SGR.heading);
  });
  test('RF-1.F1: failed command with both channels captured retains plain text and status', t => {
    const s = setup(t), result = plain(s, ['update', '--bad'], { env: { NO_COLOR: '' } });
    assert.equal(result.status, 2);
    assert.equal(result.stdout, '');
    assert.equal(result.stderr, 'rigorkit: unknown option: --bad (see rigorkit help update)\n');
  });
  test('RF-1.S1: nonterminal agent capture receives no added controls without opt-out', t => {
    const s = setup(t), result = plain(s, dual(s), { env: { NO_COLOR: '' } });
    assert.equal(result.status, 0);
    noEsc(result.stdout); noEsc(result.stderr);
    assert.equal(result.stderr, warnText + '\n');
  });

  test('RF-2.H1: NO_COLOR=1 disables both terminal channels', tty, t => {
    const s = setup(t), result = terminal(s, dual(s), { env: { NO_COLOR: '1' } });
    noEsc(result.stdout); noEsc(result.stderr);
    assert.equal(result.stderr, warnText + '\n');
  });
  test('RF-2.E1: every nonempty NO_COLOR value disables styling, including 0', tty, t => {
    const s = setup(t), args = dual(s);
    for (const NO_COLOR of ['0', 'false', 'anything', ' ']) {
      const result = terminal(s, args, { env: { NO_COLOR } });
      noEsc(result.stdout); noEsc(result.stderr);
      assert.equal(result.status, 0);
    }
  });
  test('RF-2.E2: unset or empty NO_COLOR permits terminal styling', tty, t => {
    const s = setup(t), args = dual(s);
    for (const TERM of [undefined, 'xterm-256color']) {
      for (const NO_COLOR of [undefined, '']) {
        const result = terminal(s, args, { env: { NO_COLOR, TERM } });
        assertColor(result.stdout, heading(s), SGR.heading);
        assertColor(result.stderr, warnText, SGR.warning);
      }
    }
  });
  test('RF-2.F1: TERM=dumb independently disables colors on errors', tty, t => {
    const s = setup(t);
    for (const NO_COLOR of [undefined, '']) {
      const result = terminal(s, ['update', '--bad'], { env: { TERM: 'dumb', NO_COLOR } });
      assert.equal(result.status, 2); noEsc(result.stdout); noEsc(result.stderr);
      assert.equal(result.stderr, 'rigorkit: unknown option: --bad (see rigorkit help update)\n');
    }
  });
  test('RF-2.S1: an agent pseudoterminal can opt out without changing destinations', tty, t => {
    const s = setup(t), args = dual(s);
    const human = terminal(s, args);
    assertColor(human.stdout, heading(s), SGR.heading);
    const agent = terminal(s, args, { env: { NO_COLOR: '1' } });
    noEsc(agent.stdout); noEsc(agent.stderr);
    assert.equal(stripOwned(human.stdout), agent.stdout);
    assert.equal(stripOwned(human.stderr), agent.stderr);
  });

  test('RF-3.H1: actual CLI messages cover the complete semantic palette', tty, t => {
    const s = setup(t), mixed = terminal(s, dual(s));
    assertColor(mixed.stdout, heading(s), SGR.heading);
    assertColor(mixed.stderr, warnText, SGR.warning);
    const p = project(s), scan = terminal(s, ['scan', path.dirname(p)], { steps: [{ expect: Q + ' ', send: 'y' }] });
    assert.equal(scan.status, 0);
    assertColor(scan.stderr, Q, SGR.question);
    assertColor(scan.stdout, `registered ${p}`, SGR.success);
    assertColor(scan.stdout, `[1/1] ${p}`, SGR.plain);
    const error = terminal(s, ['update', '--bad']);
    assertColor(error.stderr, 'rigorkit: unknown option:', SGR.error);
  });
  test('RF-3.E1: real update diff colors additions, removals and hunks but not context', tty, t => {
    const s = updateSetup(t), result = coloredDiff(s);
    checkDiff(result);
    assert.equal(readFileSync(s.file, 'utf8'), s.mine);
  });
  test('RF-3.E2: each command family, help route and dispatch uses the same palette', tty, t => {
    const s = setup(t);
    for (const name of ['install', 'update', 'scan', 'doctor', 'script', 'help']) {
      const result = terminal(s, ['help', name]);
      assert.equal(result.status, 0);
      assertColor(result.stdout, 'Usage:', SGR.heading);
    }
    for (const name of ['install', 'update', 'scan', 'doctor']) {
      const result = terminal(s, [name, '--help']);
      assert.equal(result.status, 0);
      assertColor(result.stdout, 'Usage:', SGR.heading);
    }
    const bad = terminal(s, invalid);
    assert.equal(bad.status, 2);
    assertColor(bad.stderr, errorText, SGR.error);
    put(path.join(s.clone, 'custom/scripts/test-summary'), '#!/bin/sh\nexit 0\n', 0o755);
    const doctor = terminal(s, ['doctor']);
    assert.equal(doctor.status, 1);
    assertColor(doctor.stdout, 'custom script test-summary shadows the official one', SGR.warning);
    // --run is shared with shell-start notices; style only its CLI display.
    put(path.join(s.h.HOME, '.config/rigorkit/config'), 'update_mode=invalid\nupdate_days=1\n');
    const notice = terminal(s, ['install', '--version']);
    assertColor(notice.stderr, 'rigorkit: warning: invalid update_mode', SGR.warning);
  });
  test('RF-3.F1: errors are red, warnings yellow, and declining is not an error', tty, t => {
    const s = setup(t), warning = terminal(s, dual(s)), error = terminal(s, ['update', '--bad']);
    assertColor(warning.stderr, warnText, SGR.warning);
    assertColor(error.stderr, 'rigorkit: unknown option:', SGR.error);
    const u = updateSetup(t), declined = coloredDiff(u);
    assertColor(declined.stderr, u.editedQuestion, SGR.question);
    assert.doesNotMatch(declined.stderr, /\x1b\[31m/);
    assert.equal(readFileSync(u.file, 'utf8'), u.mine);
  });
  test('RF-3.S1: punctuation and severity words in paths never choose their color', tty, t => {
    const s = setup(t), p = project(s, '+error warning -literal');
    const result = terminal(s, ['scan', '--dry-run', '--tools', 'claude', path.dirname(p)]);
    assert.equal(result.status, 0);
    assertColor(result.stdout, `  1. ${p} (0.1.0) -> claude`, SGR.plain);
    assertColor(result.stdout, `[1/1] ${p}`, SGR.plain);
  });

  test('RF-4.H1: plain output matches fixed pre-change references with only the help exception', t => {
    const s = setup(t), p = project(s);
    const scan = plain(s, ['scan', '--dry-run', '--tools', 'claude', path.dirname(p)]);
    assert.equal(scan.status, 0); assert.equal(scan.stderr, '');
    assert.equal(scan.stdout, scanExpected(p, { dry: true }));
    for (const [name, expected] of Object.entries(BASE.help)) {
      const result = plain(s, name === 'rigorkit' ? [] : ['help', name]);
      assert.equal(result.status, 0);
      assert.equal(result.stdout, name === 'rigorkit' ? expectedRootHelp() : expected, name);
      assert.equal(result.stderr, '');
    }
    assert.equal(plain(s, ['install', '--version']).stdout, s.version + '\n');
    assert.equal(plain(s, ['scan']).stderr, `rigorkit scan: no folder given and no scan_paths in ${path.join(s.h.HOME, '.config/rigorkit/config')} (for example: scan_paths=~/workspace)\n`);
  });
  test('RF-4.E1: removing only approved SGR preserves bytes in terminal output', tty, t => {
    const s = setup(t), p = project(s);
    const result = terminal(s, ['scan', '--dry-run', '--tools', 'claude', path.dirname(p)]);
    assert.equal(stripOwned(result.stdout), scanExpected(p, { dry: true }));
    noEsc(stripOwned(result.stdout));
    assertColor(result.stdout, 'found 1 new projects:', SGR.heading);
    const bad = terminal(s, invalid);
    assert.equal(stripOwned(bad.stderr), errorText + '\n\n' + expectedRootHelp());
    const help = terminal(s, []);
    assert.equal(stripOwned(help.stdout), expectedRootHelp());
  });
  test('RF-4.E2: help appends exactly one note and preserves every pre-existing byte', tty, t => {
    const s = setup(t), a = plain(s, []), b = terminal(s, ['--help']);
    assert.equal(a.stdout, expectedRootHelp());
    assert.equal(stripOwned(b.stdout), a.stdout);
    assert.equal(a.stdout.slice(0, BASE.help.rigorkit.length), BASE.help.rigorkit);
    assert.equal(readFileSync(path.join(s.clone, 'help/rigorkit.txt'), 'utf8'), expectedRootHelp());
    noEsc(readFileSync(path.join(s.clone, 'help/rigorkit.txt'), 'utf8'));
    for (const [name, expected] of Object.entries(BASE.help)) {
      if (name !== 'rigorkit') assert.equal(readFileSync(path.join(s.clone, 'help', name + '.txt'), 'utf8'), expected);
    }
  });
  test('RF-4.F1: preview, failed commands and keep decisions preserve existing side effects', tty, t => {
    const s = updateSetup(t), before = filesBelow(path.join(s.h.HOME, '.claude'));
    const plainPreview = terminal(s, ['update', '--dry-run'], { env: { NO_COLOR: '1' } });
    const colorPreview = terminal(s, ['update', '--dry-run']);
    assert.equal(plainPreview.status, 0); assert.equal(colorPreview.status, 0);
    assert.deepEqual(filesBelow(path.join(s.h.HOME, '.claude')), before);
    assert.equal(content(s, '.rigorkit/VERSION'), '0.3.0\n');
    assert.ok(plainPreview.stdout.includes('would ask: ' + s.editedQuestion.replace(/ \[o\/k\]$/, '')));
    assert.ok(stripOwned(colorPreview.stdout).includes('would ask: ' + s.editedQuestion.replace(/ \[o\/k\]$/, '')));
    const kept = coloredDiff(s);
    assert.equal(kept.status, 0);
    assert.equal(readFileSync(s.file, 'utf8'), s.mine);
    assert.equal(content(s, '.rigorkit/VERSION'), '0.4.0\n');
    const failure = terminal(s, ['update', '--bad']);
    assert.equal(failure.status, 2);
    assert.equal(readFileSync(s.file, 'utf8'), s.mine);
  });
  test('RF-4.S1: colors never enter installed artifacts, records, fingerprints or agent notices', tty, t => {
    const s = setup(t); addProbe(s.clone);
    const installed = terminal(s, ['install', '--global', '--pack', 'probe', '--agent', 'claude']);
    assert.equal(installed.status, 0, installed.stderr);
    assertColor(installed.stdout, 'done.', SGR.success);
    const skill = content(s, '.claude/skills/probe-skill/SKILL.md');
    assert.equal(skill, readFileSync(path.join(s.clone, 'packs/probe/skills/probe-skill/SKILL.md'), 'utf8'));
    for (const bytes of Object.values(filesBelow(path.join(s.h.HOME, '.claude')))) noEsc(Buffer.from(bytes, 'base64').toString('utf8'));
    const rec = readFileSync(RECORD(s.h.HOME), 'utf8'); noEsc(rec);
    const copies = rec.split('\n').filter(line => line.startsWith('copy\t'));
    assert.ok(copies.length > 0);
    for (const line of copies) assert.match(line.split('\t')[5], /^[a-f0-9]{64}$/);
    put(path.join(s.h.HOME, '.config/rigorkit/config'), 'update_mode=reminder\nupdate_days=1\n');
    put(path.join(STATE(s.h.HOME), 'check'), `checked=${Math.floor(Date.now() / 1000)}\nnewest=99.0.0\ndeclined=\n`);
    const noticed = terminal(s, ['install', '--version']);
    assert.equal(noticed.status, 0);
    const notice = readFileSync(path.join(STATE(s.h.HOME), 'notice'), 'utf8');
    assert.equal(notice, `rigorkit 99.0.0 is available (you have ${s.version}); run: rigorkit update\n`); noEsc(notice);
  });

  test('RF-5.H1: a question is reset before the test supplies any input', tty, t => {
    const s = setup(t), p = project(s);
    const result = terminal(s, ['scan', path.dirname(p)], { steps: [{ expect: Q + ' ', send: 'n' }] });
    assert.equal(result.sent.length, 1);
    assertColor(result.sent[0].stderr, Q, SGR.question);
    assert.equal(stripOwned(result.sent[0].stderr), Q + ' \n', 'preserve scan prompt bytes, including its existing newline');
    assert.equal(stateAtEnd(result.sent[0].stderr), SGR.plain, 'question color must be reset before read');
    assert.equal(records(s).length, 0);
  });
  test('RF-5.E1: neutral diff context after a colored line never inherits its style', tty, t => {
    const s = updateSetup(t), result = coloredDiff(s);
    assertColor(result.stdout, '+ADDED-LINE', SGR.success);
    assertColor(result.stdout, ' error warning +context', SGR.plain);
    assert.equal(stateAtEnd(result.stdout), SGR.plain);
    assert.equal(stateAtEnd(result.stderr), SGR.plain);
  });
  test('RF-5.F1: exiting after a colored diagnostic restores default style', tty, t => {
    const s = setup(t), result = terminal(s, ['update', '--bad']);
    assert.equal(result.status, 2);
    assertColor(result.stderr, 'rigorkit: unknown option: --bad', SGR.error);
    assert.equal(stateAtEnd(result.stderr), SGR.plain);
  });

  test('RF-6.H1: official and overriding custom scripts retain exact bytes on both channels', tty, t => {
    const s = setup(t);
    for (const relative of ['packs/probe/scripts/emit', 'custom/scripts/emit']) {
      const label = relative.startsWith('custom/') ? 'custom' : 'official';
      put(path.join(s.clone, relative), `#!/bin/sh\nprintf '${label} stdout\\377\\000'\nprintf '${label} stderr\\n' >&2\n`, 0o755);
      const result = terminal(s, ['script', 'emit']);
      assert.equal(result.status, 0);
      assert.deepEqual(result.rawstdout, Buffer.concat([Buffer.from(`${label} stdout`), Buffer.from([255, 0])]));
      assert.deepEqual(result.rawstderr, Buffer.from(`${label} stderr\n`));
    }
  });
  test('RF-6.E1: script-owned ANSI survives even when NO_COLOR=1', tty, t => {
    const s = setup(t);
    put(path.join(s.clone, 'custom/scripts/emit'), "#!/bin/sh\nprintf '\\033[35mowned\\033[0m'\nprintf '\\033[34merror\\033[0m' >&2\n", 0o755);
    for (const NO_COLOR of ['', '1']) {
      const result = terminal(s, ['script', 'emit'], { env: { NO_COLOR } });
      assert.equal(result.status, 0);
      assert.deepEqual(result.rawstdout, Buffer.from('\x1b[35mowned\x1b[0m'));
      assert.deepEqual(result.rawstderr, Buffer.from('\x1b[34merror\x1b[0m'));
    }
  });
  test('RF-6.F1: script diagnostic bytes and failure status pass through unchanged', tty, t => {
    const s = setup(t);
    put(path.join(s.clone, 'custom/scripts/emit'), "#!/bin/sh\nprintf 'failed without newline' >&2\nexit 7\n", 0o755);
    const result = terminal(s, ['script', 'emit']);
    assert.equal(result.status, 7); assert.equal(result.stdout, '');
    assert.equal(result.stderr, 'failed without newline');
  });
  test('RF-6.S1: content resembling CLI questions and diffs is never reinterpreted', tty, t => {
    const s = setup(t);
    const text = '+ADDED\n-REMOVED\n@@ -1 +1 @@\nwarning: fake\nOverwrite or keep? [o/k]';
    put(path.join(s.clone, 'custom/scripts/emit'), "#!/bin/sh\nprintf '%s' '" + text + "'\n", 0o755);
    const result = terminal(s, ['script', 'emit']);
    assert.equal(result.status, 0); assert.equal(result.stdout, text); assert.equal(result.stderr, '');
  });

  test('RF-7.H1: ordinary release text has identical safe content with color on and off', tty, t => {
    const s = updateSetup(t, { extra: 'plain release detail\n', changelogExtra: ' External release prose.' });
    const a = terminal(s, ['update', '--dry-run'], { env: { NO_COLOR: '1' } });
    const b = terminal(s, ['update', '--dry-run']);
    for (const result of [a, b]) {
      assert.equal(result.status, 0);
      assert.ok(stripOwned(result.stdout).includes('Test release 0.4.0. External release prose.\n'));
      assert.ok(stripOwned(result.stdout).includes('    +plain release detail\n'));
      noEsc(stripOwned(result.stdout));
    }
    noEsc(a.stdout);
  });
  test('RF-7.E1: permitted tabs, newlines and Unicode survive existing safe printing', tty, t => {
    const s = updateSetup(t, { extra: 'café\t東京\nsecond line\n' });
    for (const env of [{ NO_COLOR: '1' }, { NO_COLOR: '' }]) {
      const result = terminal(s, ['update', '--dry-run'], { env });
      assert.equal(result.status, 0);
      assert.ok(stripOwned(result.stdout).includes('    +café\t東京\n    +second line\n'), result.stdout);
    }
  });
  test('RF-7.F1: unsafe project names remain sanitized and are never registered', tty, t => {
    const s = setup(t), p = project(s, 'bad\x1bname');
    for (const env of [{ NO_COLOR: '1' }, { NO_COLOR: '' }]) {
      const result = terminal(s, ['scan', '--tools', 'claude', path.dirname(p)], { env });
      assert.equal(result.status, 0);
      noEsc(stripOwned(result.stdout));
      assert.ok(stripOwned(result.stdout).includes('not recorded (control characters in the path): ' + p.replace('\x1b', '?')));
      assert.equal(records(s).length, 0);
    }
  });
  test('RF-7.S1: external ANSI and OSC hyperlink controls stay neutralized in diffs and changelogs', tty, t => {
    const attack = '\x1b[35mFORGED\x1b[0m\x1b]8;;https://example.invalid\x07LINK\x1b]8;;\x07\u009b35mC1';
    const s = updateSetup(t, { extra: attack + '\n', changelogExtra: attack });
    for (const env of [{ NO_COLOR: '1' }, { NO_COLOR: '' }]) {
      const result = terminal(s, ['update', '--dry-run'], { env });
      assert.equal(result.status, 0);
      const safe = stripOwned(result.stdout);
      noEsc(safe); assert.doesNotMatch(safe, /[\x00-\x08\x0b-\x1f\x7f]/);
      assert.doesNotMatch(safe, /[\u0080-\u009f]/);
      assert.ok(safe.includes('?[35mFORGED?[0m?]8;;https://example.invalid?LINK?]8;;??35mC1'), safe);
    }
  });
  test('RF-7.S1: dry-run never sources a presentation helper from the downloaded release', tty, t => {
    const s = updateSetup(t, { hostileHelper: true });
    const result = terminal(s, ['update', '--dry-run']);
    assert.equal(result.status, 0);
    assert.equal(existsSync(s.marker), false, 'staged helper executed despite dry-run');
    assert.equal(content(s, '.rigorkit/VERSION'), '0.3.0\n');
    assert.equal(readFileSync(s.file, 'utf8'), s.mine);
  });
});
