# Validation — 022-global-rules-on-install
> Updated: 2026-11-17 · Technical evidence complete except the owner's live demo; independent reviews done; owner acceptance pending. All agent-run commands are existing scoped unit and integration suites in temporary homes with local remotes; nothing touched the real HOME.

## Confirmed scope and identity
- Approved spec RF-1…RF-15, INV-1…INV-5, answers 1–21 (2026-11-17); approved plan, tasks, AMEND-1 (RF-11.E1/E2 wording) and the follow-up decision.
- Base `8fedd1ee5991860cefa74a899d68ce336ce4aaaf` (main, 021 merged). Reds: B1 `90e62cb`, B2 `8622db9`, B3 `9587876`. Implementation: B1 `c540f96`, B2 `61dcf93`, B3 `5d42a8a`, docs B4 `e510f2b`, fix `416470c`. Approved amendments: AMEND-2 `1f63c4e`, AMEND-3 `23f4e86`, AMEND-4 `3024d58` (hashes and boundaries in freeze.md). Branch `feat/022-global-rules-on-install`, HEAD at the time of writing `74e85d3`.
- Owner-approved exceptions: frozen-test integrity checked by exact comparison because the constitution declares no Test paths; the B1 and B3 reds were accepted on the owner's report (the agent did not see that output), the B2 red from the owner's pasted output.

## Scenario matrix
| Scenarios | Evidence | Result |
|---|---|---|
| RF-9, RF-10 (8 scenarios) | `tools/test/022-rules-only.test.mjs`, 8 tests, real `install.sh` in a temp home | PASS (agent full run) |
| RF-11 (5 scenarios, AMEND-1 wording) | `tools/test/022-update-rules-only.test.mjs`, real `rigorkit update` through a pseudo-terminal | PASS |
| RF-1…RF-8, RF-12…RF-15 (n/a rows excluded) | `tools/test/022-one-line-rules.test.mjs`, 58 tests: real `sh tools/install-remote.sh` against local bare remotes, pseudo-terminal for questions, pipes for no-terminal cases | PASS |
| V1, V2, V3, V4, V10, V11, V12 | same file; V5 through RF-2.E2, V6 through RF-7.S1, V7 through RF-1.E3/RF-6.S1/RF-2.H1 | PASS |
| Twin facts | `022-one-line-rules` Twin equality (AMEND-3) and `tools/test/022-twin-guards.test.mjs` | PASS |
| n/a rows (11) | justified in the spec, reformatted to `n/a — reason` for the checker | n/a; not counted as passes |
| Scenario checker | `check-scenarios.mjs` on spec.md | PASS, 74 scenarios |
Not automated: reading from `/dev/tty` (the test pseudo-terminal always has one), a mode loosened between the question and the answer (mitigated by checking after the answer, V2), RF-3.F2 timing beyond the interrupt test.

## Integration and critical DoD
- Full `node --test tools/test/*.test.mjs` on `416470c`: 694 tests, 692 pass, 0 fail, 0 skipped, 2 pre-existing todo (not counted as passing). After that, only comment edits in the new twin-guard test (`74e85d3`), re-run: pass.
- Constitution critical paths `install.sh` and `tools/install-remote.sh`: temporary-home installs and dry-runs (008, 015, 022 suites), marker byte-safety and re-run idempotence (008 startup files, 022 RF-6/RF-13), a user's own `.bak` byte-equal (022 RF-2.E2); `lib/update.sh`: 010, 017 and 022 update suites; `bin/rigorkit` unchanged.
- `node tools/generate-man.mjs --check`: PASS. `check-branch-trace.mjs --base 8fedd1e`: PASS, 0 issues. `git diff --check main..HEAD`: clean.
- Frozen integrity by exact comparison: B1 and B2 test files identical to their reds; B3 file differs from its red only by the approved AMEND-3 lines.
- Independent reviews (review-reports.md): B1–B4 and the whole change reviewed by sdd, architecture and security reviewers with the same original references; no high findings remain; corrections applied or residual risks recorded (threat-model.md section 5, plan.md R7–R11).

## Correction round
After the approver's "needs human" the SDD and security reviewers re-ran (review-reports.md): spec fulfilled for test coverage, no high findings; a later edit (`rules_capable` refuses a link at `packs` or `packs/core`) was followed by `022-one-line-rules`, `008-install-remote` and `022-twin-guards` (125 tests, 125 pass).
Known weaker assertions in frozen tests (RF-8.E1/F1/S1 report text, RF-15.E1 advice, RF-2.H1, RF-13.E1, RF-1.E2): behaviour is implemented; strengthening them needs owner-approved test amendments.

## Pending
- Owner live demo on a real terminal in a temporary home (acceptance flow of the spec): not run.
- Pseudo-terminal-less environments, root runs, macOS ACLs: not run.
- `VERSION` bump to 0.6.3 and the release: owner decision, outside this change.
- Archive and capability updates (installer RF-1, RF-2, RF-3, RF-6, RF-10 and the Global record definition): at acceptance, on the next story's branch.
- Follow-up 023 (HU-17): atomic rules write and backup that survives a rerun, record on failure, update write path checks.
