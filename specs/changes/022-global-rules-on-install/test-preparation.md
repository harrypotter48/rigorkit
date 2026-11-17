# Test preparation — 022-global-rules-on-install B1
> Date: 2026-11-17 · Status: owner reports the suite fails in red; failing assertions not shared, scenario checker and freeze pending · Department: Build / test preparation.

## Authority and state
- Spec approved 2026-11-17; plan, tasks and AMEND-1 approved 2026-11-17 ("Sí, apruebo"). Branch `feat/022-global-rules-on-install` from `main` at `8fedd1ee5991860cefa74a899d68ce336ce4aaaf` (021 merged); nothing committed.
- No test was run and no production code changed. The install tests run `install.sh` in a temporary home, so the owner runs them.

## Prepared boundary (to freeze only after owner-run red evidence and approval)
- `tools/test/022-rules-only.test.mjs` (new). It imports only existing fixtures (`update-fixture.mjs`, `rigorkit-fixture.mjs`); existing tests and fixtures are unchanged.

## Scenario coverage (block B1: RF-9, RF-10)
Eight tests, one per scenario: RF-9.H1, E1, E2, F1, S1 and RF-10.E1, F1, S1. RF-9.H1 also asserts the record shape of the plan (one `rules` line, no `pair`, no `copy`). RF-10.H1 is n/a in the spec (refusal only). Coverage is an authoring assessment: the scenario checker named by the templates (`specs/scripts/check-scenarios.mjs`) is absent from this repository, so checker evidence is pending.
- RF-9.E1 requires that a rules-only run for a pack without rules writes nothing at all (no record, no version marker); RF-9.E2 and RF-9.F1 require an unchanged home as well.
- RF-9.S1 uses `--force` to show that rules-only never rewrites skill copies, the plausible wrong implementation.
- RF-10 tests assert the exact refusal text `--rules-only needs --global`, so today's generic "unknown option" failure is not accepted as green.

## Expected behavioral red
Today `install.sh` rejects `--rules-only` as an unknown option (exit 1), so every RF-9 test fails on its assertion (status 0, block written, nothing copied) and every RF-10 test fails on the message assertion. This is behavioral red, not a structural error: the file imports no missing module.

## Owner run
```bash
node --test tools/test/022-rules-only.test.mjs
```
Owner run 2026-11-17: "Ya los corrí, falla en rojo". The output was not shared with the agent, so the failing assertions and the cause are taken from the owner's report and from the expected cause above, not observed by the agent. Pending: `test(red): 022-global-rules-on-install B1 rules-only install from the CLI` commit approval, frozen-test boundary approval.

## B2 — update and lifecycle of rules-only entries (RF-11) — 2026-11-17
> Status: tests authored, not run; behavioral red pending the owner's run. B1 is committed (`c540f96`).

- New file `tools/test/022-update-rules-only.test.mjs` (not frozen yet); imports only existing fixtures. Five tests, one per RF-11 scenario with the AMEND-1 wording: H1, E1, E2, F1, S1.
- Real clone at a release tag built from the working tree (so it has `--rules-only`), a rules-only install, then a release with changed rules; updates run through the pseudo-terminal helper.
- RF-11.H1 also asserts the plan's checks: no `no longer shipped` text, no group of skill copies offered, no skill or agent folder, no `pair` or `copy` record lines, clone at 0.4.0.
- Expected red: H1 and F1 fail today because `lib/update.sh` refreshes a `rules` line only when a `pair` of the same pack and agent exists (`lib/update.sh:382`) and iterates an empty pack name once (`:308-317`). E1, E2 and S1 describe behaviour that B1 may already satisfy; a green there is evidence of reuse, not a defect, and is reported as such.
- The scenario checker remains absent (`specs/scripts/check-scenarios.mjs`); coverage is an authoring assessment.

```bash
node --test tools/test/022-update-rules-only.test.mjs
```

### B2 owner run — 2026-11-17 (output pasted by the owner, observed)
`node --test tools/test/022-update-rules-only.test.mjs`: 5 tests, 3 pass, 2 fail.
- RF-11.H1 fails at the assertion "the changed rules block replaced the old one": after `rigorkit update` with a yes the file still holds the old block (no `Test rule change.`). Cause: the rules line has no `pair`, so the rules-refresh loop skips it (`lib/update.sh:382`). Behavioral red.
- RF-11.F1 fails at "the edited block is asked about": the update never asks about the hand-edited block, for the same reason. Behavioral red.
- RF-11.E1, E2 and S1 pass: doctor, a later full install and rules uninstall already behave as RF-11 requires with B1 in place (reuse, not a defect).
- No structural error: the file imports no missing module and the harness ran the real `rigorkit update` through the pseudo-terminal.
Pending: `test(red): 022-global-rules-on-install B2 rules-only entries in update` commit approval and the frozen-test boundary for `tools/test/022-update-rules-only.test.mjs`.

## B3 — the one-line installer offers the global rules (RF-1…RF-8, RF-12…RF-15, V1–V12) — 2026-11-17
> Status: tests authored, not run; behavioral red pending the owner's run. B1 `c540f96` and B2 `61dcf93` are committed and green per owner runs.

- New file `tools/test/022-one-line-rules.test.mjs` (not frozen yet), 58 tests: one per spec scenario of RF-1…RF-8 and RF-12…RF-15 (n/a rows excluded), the security checks V1, V2, V3, V4, V10, V11, V12 of the threat model, and a twin-equality test. It imports only existing fixtures (`update-fixture.mjs`, `rigorkit-fixture.mjs`) and the pseudo-terminal helper.
- Real `sh tools/install-remote.sh` against a local bare remote with release 0.9.0 in a temporary HOME; questions through a pseudo-terminal (python3), no-terminal cases through plain pipes. V1 uses a release whose `install.sh` leaves a marker when executed; RF-12 uses releases without the capability line or without `packs/core/rules.md`.
- Message contracts the tests propose (the spec fixes behaviour, not wording; the owner confirms them with this boundary): the question is the last paragraph of the output and ends with the prompt `[y/N] `; the later command matches `rigorkit install --pack core --agent <tools> --global --rules-only`; notices contain `unavailable` (and `rigorkit update` for an old clone), `already installed`, and `fix the markers by hand`; the question shows the clone version, `.rigorkit-version` and the `--dry-run` preview command (V11).
- Expected red: nearly every test, because the offer does not exist (the old closing line suggests a global install of `core`). Tests that assert "no question and files unchanged" may already pass; those are reused-behaviour evidence, not defects, and are reported as such.
- V2 loosens modes and links of an existing clone; V10 loosens a folder mode; RF-1.E2, RF-8.E1, RF-8.F1 use read-only modes; those skip as root. RF-1.E2 also needs zsh. Pseudo-terminal tests skip without python3.
- Not covered by an automated test and left to the final review: no read from `/dev/tty` (the pseudo-terminal always has one), a mode loosened between the question and the answer (needs a timing hook), V5 backup mode (covered by RF-2.E2), V6 beyond the source name (RF-7.S1), V7 (RF-1.E3, RF-6.S1, RF-2.H1), V8 and V9.
- The scenario checker remains absent; coverage is an authoring assessment.

```bash
node --test tools/test/022-one-line-rules.test.mjs
```

### B3 owner run — 2026-11-17 (owner report, not observed)
Owner: "Ya los corrí, falla en rojo". The output was not shared with the agent (asked twice), so the number of failing tests, which ones pass by reuse, and whether any failure is structural rather than behavioral are taken from the owner's report and not verified. A harness problem (pseudo-terminal, fixtures, an assertion on wording) would show as red too; it is caught at the first implementation run and corrected by an owner-approved `test(amend)`.
Pending: `test(red): 022-global-rules-on-install B3 one-line installer offers the global rules` commit approval and the frozen-test boundary for `tools/test/022-one-line-rules.test.mjs`, including the message contracts above.

### B3 implementation note — 2026-11-17
`tools/install-remote.sh` now implements `offer_rules` (uncommitted). The existing test `tools/test/008-install-remote.test.mjs` `RF-1.H1` will fail on its line asserting that the closing output names every agent of `install.sh` (`claude`, `codex`, `cursor`, `opencode`): the old closing lines (`next: … --global` and `agents: …`) were replaced by the offer and the later command, which names only the three tools with a global instruction file. Proposed `test(amend)` (needs owner approval): that loop checks `claude`, `codex` and `opencode` and the title says "names the later command" instead of "names the next step". Nothing else in that test changes.

### AMEND-2 — owner-approved 2026-11-17 ("Apruebo la enmienda")
`tools/test/008-install-remote.test.mjs` RF-1.H1: the title says "names the later command" instead of "names the next step", and the loop over agents checks `claude`, `codex` and `opencode` (the tools with a global instruction file) instead of every agent parsed from `install.sh`, because the closing lines of the one-line installer changed (`next:` and `agents:` replaced by the offer and the later command). The `new shell`, `--global` and every other assertion are unchanged. Applied in the working tree, to be committed apart as `test(amend): 022-global-rules-on-install AMEND-2 008 RF-1.H1 names the later command`; not yet run.

### B3 owner run — 2026-11-17 (output pasted by the owner, observed) and AMEND-3
Run of the 022, 008 install-remote and startup-files, 010-check and 019 suites: two failures, all other tests of those files pass (including the 58 B3 tests except one).
- `008-install-remote` PC-1 (existing test): the installer body must hold only functions at the top level and run from `main()`. Cause: implementation (four top-level assignments for the offer). Fixed in `tools/install-remote.sh` (`rules_consts`, called by `offer_rules`); the markers stay literal in the file.
- `022-one-line-rules` `Twin equality` (frozen test): looked for the literal `<!-- rigorkit:core:start -->` in `install.sh`, which builds the markers from the pack name (`<!-- rigorkit:$1:start -->`). Cause: the test, as the architecture review of B3 had anticipated. Owner-approved AMEND-3 (2026-11-17, "Apruebo AMEND-3"): the test checks that `install.sh` holds the templates `<!-- rigorkit:$1:start -->` and `<!-- rigorkit:$1:end -->` and that the one-line installer holds the core literals; the tool files and `CODEX_HOME` checks are unchanged. No other assertion or scenario changes. To be committed apart as `test(amend)`; the frozen hash in `freeze.md` is updated with that commit.

### Full toolkit run — 2026-11-17 (agent-run, `node --test tools/test/*.test.mjs`)
693 tests: 689 pass, 2 fail, 2 todo, 0 skipped. All 022 tests (the three 022 files), 008, 010, 017, 018 and 019 pass.
The two failures are existing 021 tests: `RF-4.H1` and `RF-4.E2` in `tools/test/021-terminal-colors.test.mjs`. Both compare the `help install` text byte for byte with the pre-change reference `help.install` in `tools/test/fixtures/021-terminal-colors/plain.json` (021 INV-1), and the `--rules-only` line added to `help/install.txt` in B1 is not in it. The line cannot be removed: `tools/generate-man.mjs` requires every `install.sh` option to have a line in `help/install.txt` (`optionsInInstaller`/`optionsInHelp`). Cause: the pinned fixture of an archived change versus an intentional later help change.
Proposed AMEND-4 (needs owner approval): add exactly the line `  --rules-only          With --global: install only the pack rules, no skills or agents` after the `--dry-run` line in `help.install` of that fixture; no other byte of the fixture and no assertion changes.

### AMEND-4 — owner-approved 2026-11-17 ("Apruebo AMEND-4")
Applied exactly as proposed: one line added to `help.install` of `tools/test/fixtures/021-terminal-colors/plain.json`. Commit `3024d584364032fbb68f03fafe423fbbb17794e5`. Agent-run `node --test tools/test/021-terminal-colors.test.mjs`: 34 tests, 34 pass.

### AMEND-5 — owner-approved 2026-11-17 ("Apruebo AMEND-5")
Cause: the CI runner has no zsh, the installer then writes no `.zshrc` (correct), and RF-3.F2 and RF-8.F1 read it. Applied: the scene appends a stub `zsh` folder to PATH, the same pattern as `008-install-remote.test.mjs`. Commit `e74d2d79d9a620bc1ab30481ef06d36fa4cd714d`. Agent-run `node --test tools/test/022-one-line-rules.test.mjs`: 58 tests, 58 pass (local machine has zsh; the no-zsh case is confirmed by the next CI run).
