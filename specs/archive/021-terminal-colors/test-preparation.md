# Test preparation — 021-terminal-colors B1
> Date: 2026-11-15 · Status: behavioral red observed; scenario checker and freeze pending · Department: Build / test preparation.

## Authority and state
- Spec approved 2026-11-14; the bounded help-note amendment approved 2026-11-15.
- Design/B1 test preparation approved 2026-11-15: "si dale, apruebo Design, comencemos con los tests de B1".
- Owner then confirmed 020 was merged and authorized a new branch carrying 021 plus 020's close commit. Branch: `feat/021-terminal-colors`, created from updated `origin/main` at `25668871ca6215e2bfc18628d158320bf3915836`.
- Current confirmed base: `a812f2eefce1765eca00f98e84fe2fa4e03aeec8`, the separate owner-authorized 020 close commit. It contains no 021 changes.
- At preparation time no execution had occurred. The owner-run suite result reviewed below now establishes behavioral red. Product implementation, scenario checker evidence, new test commit and frozen-test approval remain pending.

## Prepared boundary
Proposed paths to freeze only after owner-run red evidence and explicit owner approval:
- `tools/test/021-terminal-colors.test.mjs`
- `tools/test/021-terminal-colors-fixture.mjs`
- `tools/test/021-pty-run.py`
- `tools/test/fixtures/021-terminal-colors/plain.json`

Existing tests and shared helpers remain unchanged. The new suite imports only existing runtime fixtures and its own prepared fixture; it does not import a nonexistent production color helper, so a missing product module is not the intended red.

## Scenario coverage
The suite defines all 32 automated scenarios in spec RF-1–RF-7, one named test per scenario, plus a second RF-7.S1 dry-run safety test and a raw-byte/split-destination harness contract test (34 tests total). Coverage is a source-level authoring assessment, not an executed checker result.

| Area | Evidence prepared |
|---|---|
| RF-1 | Real independent stdout/stderr terminal and pipe destinations, nonterminal stdin, plain failures and agent captures |
| RF-2 | Empty/unset/nonempty opt-out (including `0`), empty/unset capable terminal context, `TERM=dumb`, agent PTY opt-out |
| RF-3 | Real CLI headings/warnings/errors, actual scan question/success, update additions/removals/hunks/context, all help routes, ordinary path classification and non-error keep |
| RF-4 | Fixed source help snapshots and literal diff reference, deterministic scan output, exact help-note exception, dry-run/keep/failed-command side effects, artifacts/records/fingerprints/agent notice |
| RF-5 | Snapshot captured before input delivery, reset before `read`, neutral context after colored additions, reset before diagnostic exit |
| RF-6 | Distinct official/custom outputs prove precedence, raw invalid-UTF8/NUL bytes and absent final newline, script-owned ANSI despite opt-out, nonzero status and CLI-looking content |
| RF-7 | Real safe-output paths for plain release data, tabs/newlines/Unicode, unsafe names, C0/C1/ANSI/OSC data and hostile staged helper during dry-run |

RF-3.E3 and RF-5.E2 remain manual live terminal checks. RF-5.S remains the spec's justified n/a. No manual case is represented as an automated pass.

The PTY harness uses OS terminal descriptors, not a mocked terminal predicate. It preserves raw bytes in base64 and disables PTY newline translation and synthetic input echo. It waits for the whole prompt write boundary before recording the pre-input capture; input colors still require the separate owner live check. The harness has its own assertion for terminal/pipe identity, byte 255, NUL and nonzero exit. Missing Python skips PTY-dependent cases explicitly; such skips leave terminal evidence pending.

`plain.json` records pre-change help source bytes and a literal expected diff hunk before production edits. Its metadata records the runtime source base; the source snapshots were read, not obtained by executing commands. No test regenerates this oracle from changed help. Color comparisons remove only the five fixed SGR sequences in the approved design; there is no broad ANSI/whitespace normalization.

## Owner-run commands
```sh
node --test tools/test/021-terminal-colors.test.mjs
node packs/sdd/skills/sdd-init/scripts/check-scenarios.mjs specs/changes/021-terminal-colors/spec.md --tests tools/test --strict
```

The actual scenario checker lives under the SDD pack, not `specs/scripts/` in this repository. The plan's command is corrected to that existing path; behavior and scenario scope are unchanged.

## Red evidence and next gate
- Owner ran `node --test tools/test/021-terminal-colors.test.mjs > /tmp/rigorkit-021-tests.log 2>&1`; this agent reviewed the supplied log on 2026-11-15. Result: 34 tests, 17 pass, 17 fail, 0 skipped/cancelled, 24,261.504708 ms. No rerun by this agent.
- Observed failures: 15 stop at missing semantic SGR (actual 0/default versus expected 31/32/33/36), and RF-4.H1/RF-4.E2 stop at the absent approved root-help note. These are the intended unimplemented behaviors, not import/configuration failures.
- Existing compatibility, opt-out, script and sanitizer assertions may already pass and must not be forced red.
- Any syntax/import/harness/fixture failure is structural and must be corrected before claiming behavioral red.
- Proposed commit after observed red and owner approval: `test(red): 021-terminal-colors preserve plain bytes and style terminal output`, with `Refs: HU-15`. No commit is authorized merely by this proposal.
- Record the exact approved red hash and the confirmed base above with these four frozen paths. Then request explicit frozen-boundary approval before production implementation. Until then T1 remains unchecked and implementation is not authorized.

## Checks not executed
The owner-run new suite is recorded above. Scenario checker, legacy regressions, install/dry-runs, manual terminal checks, generators, independent reviewers and full suite remain pending for 021. The 020 validation described in its separate archive/close commit is not reused as 021 execution evidence.


## Owner-run red review — 2026-11-15
- Source: `/tmp/rigorkit-021-tests.log`; SHA-256 `7d7fbd3fd434fd6ca5510c6d772aec55efd965c383899fd9a416c9ffeb3d705d`. The log stays outside git; this section preserves the reviewed result.
- The split-channel/raw-byte/status harness test passed. There are no reported timeouts, missing imports, syntax errors or structural harness failures in this run.
- Passing scenarios cover existing plain captures, non-empty opt-out, dumb-terminal errors, path classification, dry-run/keep side effects, all four script-ownership scenarios and all external-data/dry-run safety tests.
- Color-dependent tests stop at their first missing-color assertion. Later assertions inside those failed tests (including artifact or reset checks) are not counted as executed passes. Additional failures can surface after those earlier assertions become green.
- Behavioral red is established. The scenario checker has no supplied result yet; red commit/frozen-boundary approval remain pending. No tests or production files were changed while reviewing this log.

Historical reviewed-run fingerprints before the pre-freeze correction below (not an approved freeze):

| Path | SHA-256 |
|---|---|
| `tools/test/021-terminal-colors.test.mjs` | `b514faa0e1483ceceab74fc33094261d5074d06b649a7576f9f156b0b46c862b` |
| `tools/test/021-terminal-colors-fixture.mjs` | `5b81c42cbfc9b0429983afac015b6b98a68c0c1e757728ad409cc37aa0c26737` |
| `tools/test/021-pty-run.py` | `8569167c4d95a49249f11e222cde8596a17ae50d46c6622665fc2d98faa78c27` |
| `tools/test/fixtures/021-terminal-colors/plain.json` | `10ea7c32dba3ecd2f65d0aad6e43303cf07a951fedf9430f9b4a438095624d89` |


## Pre-freeze correction — 2026-11-15
- Readonly source review found a latent bad expectation in RF-5.H1: scan prints `Q + space + newline` through its existing `print_safe`, whereas update removes that newline. The reviewed log also shows scan's existing newline. The test had incorrectly required a final space only; its earlier color assertion prevented this check from being reached in the first run.
- Corrected RF-5.H1 to compare the exact existing scan prompt bytes, including the newline; retained the yellow-color and reset-before-input assertions. This aligns with unchanged spec RF-4/INV-1, not a new behavior or relaxed assertion. The plan's per-producer byte contract is clarified accordingly.
- Shortened assertColor diagnostics to marker, expected SGR and character position instead of printing complete CLI transcripts. Color assertions are unchanged.
- Tests are not frozen or committed, so no frozen-test amendment was made. No production changes or commands executed. The previous 17/17 result belongs to the prior test revision; the current revision needs owner-run suite and checker evidence before commit/freeze.

Current proposed boundary fingerprints (not an approved freeze):

| Path | SHA-256 |
|---|---|
| `tools/test/021-terminal-colors.test.mjs` | `35f4bd157b106312bd97610c6c5ebdee4d257706fa38b2c18649dd94d6d3228a` |
| `tools/test/021-terminal-colors-fixture.mjs` | `0b727c5c63f920390bf8b7fe0ca27806e4b152e0d70a545328b8072bb1a19e82` |
| `tools/test/021-pty-run.py` | `8569167c4d95a49249f11e222cde8596a17ae50d46c6622665fc2d98faa78c27` |
| `tools/test/fixtures/021-terminal-colors/plain.json` | `10ea7c32dba3ecd2f65d0aad6e43303cf07a951fedf9430f9b4a438095624d89` |


## Current-revision owner evidence — 2026-11-15
- Owner reran `node --test tools/test/021-terminal-colors.test.mjs > /tmp/rigorkit-021-tests.log 2>&1` after the pre-freeze correction. Agent read the supplied log; no commands rerun by the agent.
- Result: 34 tests, 17 pass, 17 fail, zero skipped/cancelled; duration 24,305.902792 ms. The harness passed. Fifteen failures are missing semantic colors; RF-4.H1 and RF-4.E2 fail on the missing approved help note. No structural error or timeout is reported. Assertions after each first failure remain unexecuted.
- Current log SHA-256: `2b32b041e2ff21c4536511d2d48c49e8b59cd3888826c3f2ac5df7c78bd70cb8`. The four current source hashes still match the most recent proposed boundary table above; no tests were changed during this review.
- Owner also supplied a passing scenario-checker result for `node packs/sdd/skills/sdd-init/scripts/check-scenarios.mjs specs/changes/021-terminal-colors/spec.md --tests tools/test --strict`: `✓ 021-terminal-colors — 35 scenarios, manual: RF-3.E3, RF-5.E2`. This is owner-reported evidence, not an agent-executed checker.
- Behavioral red and scenario trace are now evidenced. The 35 rows include 32 automated scenarios, two manual scenarios and one justified n/a; the suite has 34 tests because it also includes the second RF-7.S1 safety test and the harness contract.
- Next gate: owner approves the proposed test(red) commit and freezing the four exact paths/hashes above against base a812f2eefce1765eca00f98e84fe2fa4e03aeec8. No commit, freeze or production implementation has been performed by this review.

## Owner red/freeze approval — 2026-11-15
- Owner explicitly authorized the 021 test(red) commit, freezing the four current path/hash entries above and beginning B1 implementation autonomously. Base: a812f2eefce1765eca00f98e84fe2fa4e03aeec8. The red identity is this test(red) commit; its resolved hash will be recorded in the subsequent Build handoff.
- The four paths are frozen from this commit. Production implementation may proceed; further commits, test amendments, and command execution remain subject to the existing explicit gates.

## Resolved approved boundary — 2026-11-15
- Approved test(red) commit: `8d29670e69b88ffbbb91f72ce4a85fa5c8c84b17`; confirmed base `a812f2eefce1765eca00f98e84fe2fa4e03aeec8`. The four approved files are frozen. See freeze.md for exact red/index/worktree equality and the separately approved integrity exception.
- Implementation is authorized; current source work and pending green validation are tracked in implementation-validation.md.
