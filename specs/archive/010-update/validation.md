# Validation — 010-update (HU-2 Update check and `rigorkit update`)
Date: 2026-11-12 · Branch: feat/010-update · Diff reviewed: `git diff fa96562` (origin/main).

## Automated evidence (macOS)
| Check | Result |
|---|---|
| `node --test tools/test/*.test.mjs` | 439 tests: 437 pass, 0 fail, 2 todo (008 B1 copies) |
| 010 files | check 48/48 · update 105/105 · install-record 18/18 · repo-checks 11/11 · review 13/13 |
| 008 regression (installer critical paths) | 163 pass, 0 fail, 2 todo |
| Scenario checker | 202 scenarios, none missing (184 with tests, 18 justified n/a) |
| `node tools/generate-man.mjs --check` | PASS (commands, options, man page, changelog section for 0.3.0) |
| Content ratchet vs `specs/archive/010-update/baseline.txt` | PASS; entry skills +30 estimated tokens each, global rules 271 ≤ 300 |
| Linux CI (GitHub Actions) | green on `d7a0ac0` (owner, 2026-11-12), after two fixes found only on Linux: `c24b1cf` (a successful check clears the previous no, RF-3.E1) and `d7a0ac0` (the detached check ignores SIGHUP before the fork, RF-1.H1) |

## Scenarios
| Scenario | Type | Covering test | Result |
|---|---|---|---|
| RF-1.H1 | happy | `010-check.test.mjs` | ✅ |
| RF-1.E1 | edge | `010-check.test.mjs` | ✅ |
| RF-1.E2 | edge | `010-check.test.mjs` | ✅ |
| RF-1.E3 | edge | `010-check.test.mjs` | ✅ |
| RF-1.E4 | edge | `010-check.test.mjs` | ✅ |
| RF-1.E5 | edge | `010-check.test.mjs` | ✅ |
| RF-1.E6 | edge | `010-check.test.mjs` | ✅ |
| RF-1.E7 | edge | `010-check.test.mjs` | ✅ |
| RF-1.F1 | failure | `010-check.test.mjs` | ✅ |
| RF-1.S1 | security | `010-check.test.mjs` | ✅ |
| RF-2.H1 | happy | `010-check.test.mjs` | ✅ |
| RF-2.E1 | edge | `010-check.test.mjs` | ✅ |
| RF-2.E2 | edge | `010-check.test.mjs` | ✅ |
| RF-2.E3 | edge | `010-check.test.mjs` | ✅ |
| RF-2.F1 | failure | `010-check.test.mjs` | ✅ |
| RF-2.S | security | n/a — justified in spec | — |
| RF-3.H1 | happy | `010-check.test.mjs` | ✅ |
| RF-3.E1 | edge | `010-check.test.mjs` | ✅ |
| RF-3.F1 | failure | `010-check.test.mjs` | ✅ |
| RF-3.S | security | n/a — justified in spec | — |
| RF-4.H1 | happy | `010-check.test.mjs` | ✅ |
| RF-4.E1 | edge | `010-check.test.mjs` | ✅ |
| RF-4.F1 | failure | `010-check.test.mjs` | ✅ |
| RF-4.S1 | security | `010-check.test.mjs` | ✅ |
| RF-31.H1 | happy | `010-check.test.mjs` | ✅ |
| RF-31.E1 | edge | `010-check.test.mjs` | ✅ |
| RF-31.E2 | edge | `010-check.test.mjs` | ✅ |
| RF-31.F1 | failure | `010-check.test.mjs` | ✅ |
| RF-31.S1 | security | `010-check.test.mjs` | ✅ |
| RF-5.H1 | happy | `010-check.test.mjs` | ✅ |
| RF-5.E1 | edge | `010-check.test.mjs` | ✅ |
| RF-5.F | failure | n/a — justified in spec | — |
| RF-5.S | security | n/a — justified in spec | — |
| RF-6.H1 | happy | `010-check.test.mjs` | ✅ |
| RF-6.E1 | edge | `010-check.test.mjs` | ✅ |
| RF-6.F1 | failure | `010-check.test.mjs` | ✅ |
| RF-6.S1 | security | `010-check.test.mjs` | ✅ |
| RF-7.H1 | happy | `010-check.test.mjs` | ✅ |
| RF-7.E1 | edge | `010-check.test.mjs` | ✅ |
| RF-7.F1 | failure | `010-check.test.mjs` | ✅ |
| RF-7.F2 | failure | `010-check.test.mjs` | ✅ |
| RF-7.S | security | n/a — justified in spec | — |
| RF-8.H1 | happy | `010-check.test.mjs` | ✅ |
| RF-8.E1 | edge | `010-check.test.mjs` | ✅ |
| RF-8.F1 | failure | `010-check.test.mjs` | ✅ |
| RF-8.S | security | n/a — justified in spec | — |
| RF-9.H1 | happy | `010-check.test.mjs` | ✅ + manual (Claude Code) |
| RF-9.E1 | edge | `010-check.test.mjs` | ✅ + manual (Claude Code) |
| RF-9.E2 | edge | `010-check.test.mjs` | ✅ |
| RF-9.F1 | failure | `010-check.test.mjs` | ✅ + manual (Claude Code) |
| RF-9.S1 | security | `010-check.test.mjs` | ✅ |
| RF-10.H1 | happy | `010-update.test.mjs` | ✅ |
| RF-10.E1 | edge | `010-update.test.mjs` | ✅ |
| RF-10.F1 | failure | `010-update.test.mjs` | ✅ |
| RF-10.S1 | security | `010-update.test.mjs` | ✅ |
| RF-11.H1 | happy | `010-update.test.mjs` | ✅ |
| RF-11.E1 | edge | `010-update.test.mjs` | ✅ |
| RF-11.F1 | failure | `010-update.test.mjs` | ✅ |
| RF-11.S1 | security | `010-update.test.mjs` | ✅ |
| RF-12.H1 | happy | `010-repo-checks.test.mjs` | ✅ |
| RF-12.E1 | edge | `010-repo-checks.test.mjs` | ✅ |
| RF-12.F1 | failure | `010-repo-checks.test.mjs` | ✅ |
| RF-12.F2 | failure | `010-repo-checks.test.mjs` | ✅ |
| RF-12.S | security | n/a — justified in spec | — |
| RF-13.H1 | happy | `010-update.test.mjs` | ✅ |
| RF-13.E1 | edge | `010-update.test.mjs` | ✅ |
| RF-13.E2 | edge | `010-update.test.mjs` | ✅ |
| RF-13.E3 | edge | `010-update.test.mjs` | ✅ |
| RF-13.F1 | failure | `010-update.test.mjs` | ✅ |
| RF-13.S1 | security | `010-update.test.mjs` | ✅ |
| RF-14.H1 | happy | `010-update.test.mjs` | ✅ |
| RF-14.E1 | edge | `010-update.test.mjs` | ✅ |
| RF-14.F1 | failure | `010-update.test.mjs` | ✅ |
| RF-14.S1 | security | `010-update.test.mjs` | ✅ |
| RF-14.S2 | security | `010-review.test.mjs` | ✅ |
| RF-15.H1 | happy | `010-update.test.mjs` | ✅ |
| RF-15.E1 | edge | `010-update.test.mjs` | ✅ |
| RF-15.F1 | failure | `010-update.test.mjs` | ✅ |
| RF-15.S1 | security | `010-update.test.mjs` | ✅ |
| RF-16.H1 | happy | `010-update.test.mjs` | ✅ |
| RF-16.E1 | edge | `010-update.test.mjs` | ✅ |
| RF-16.E2 | edge | `010-update.test.mjs` | ✅ |
| RF-16.F1 | failure | `010-update.test.mjs` | ✅ |
| RF-16.S | security | n/a — justified in spec | — |
| RF-17.H1 | happy | `010-update.test.mjs` | ✅ |
| RF-17.E1 | edge | `010-update.test.mjs` | ✅ |
| RF-17.E2 | edge | `010-update.test.mjs` | ✅ |
| RF-17.E3 | edge | `010-update.test.mjs` | ✅ |
| RF-17.F1 | failure | `010-update.test.mjs` | ✅ |
| RF-17.S1 | security | `010-update.test.mjs` | ✅ |
| RF-30.H1 | happy | `010-update.test.mjs` | ✅ |
| RF-30.E1 | edge | `010-update.test.mjs` | ✅ |
| RF-30.E2 | edge | `010-review.test.mjs` | ✅ |
| RF-30.F | failure | n/a — justified in spec | — |
| RF-30.S1 | security | `010-update.test.mjs` | ✅ |
| RF-32.H1 | happy | `010-update.test.mjs` | ✅ |
| RF-32.E1 | edge | `010-update.test.mjs` | ✅ |
| RF-32.F | failure | n/a — justified in spec | — |
| RF-32.S1 | security | `010-update.test.mjs` | ✅ |
| RF-33.H1 | happy | `010-check.test.mjs` | ✅ |
| RF-33.E1 | edge | `010-check.test.mjs` | ✅ |
| RF-33.F | failure | n/a — justified in spec | — |
| RF-33.S1 | security | `010-check.test.mjs` | ✅ |
| RF-18.H1 | happy | `010-install-record.test.mjs` | ✅ |
| RF-18.E1 | edge | `010-install-record.test.mjs` | ✅ |
| RF-18.E2 | edge | `010-install-record.test.mjs` | ✅ |
| RF-18.E3 | edge | `010-install-record.test.mjs` | ✅ |
| RF-18.E5 | edge | `010-install-record.test.mjs` | ✅ |
| RF-18.E6 | edge | `010-install-record.test.mjs` | ✅ |
| RF-18.E7 | edge | `010-update.test.mjs` | ✅ |
| RF-18.E8 | edge | `010-review.test.mjs` | ✅ |
| RF-18.F1 | failure | `010-install-record.test.mjs` | ✅ |
| RF-18.S1 | security | `010-install-record.test.mjs` | ✅ |
| RF-18.S2 | security | `010-install-record.test.mjs` | ✅ |
| RF-35.H1 | happy | `010-install-record.test.mjs` | ✅ |
| RF-35.E1 | edge | `010-install-record.test.mjs` | ✅ |
| RF-35.E2 | edge | `010-install-record.test.mjs` | ✅ |
| RF-35.F1 | failure | `010-install-record.test.mjs` | ✅ |
| RF-35.S1 | security | `010-install-record.test.mjs` | ✅ |
| RF-36.H1 | happy | `010-install-record.test.mjs` | ✅ |
| RF-36.E1 | edge | `010-install-record.test.mjs` | ✅ |
| RF-36.E2 | edge | `010-install-record.test.mjs` | ✅ |
| RF-36.F1 | failure | `010-install-record.test.mjs` | ✅ |
| RF-36.S | security | n/a — justified in spec | — |
| RF-19.H1 | happy | `010-update.test.mjs` | ✅ |
| RF-19.E1 | edge | `010-update.test.mjs` | ✅ |
| RF-19.E2 | edge | `010-update.test.mjs` | ✅ |
| RF-19.F1 | failure | `010-update.test.mjs` | ✅ |
| RF-19.S1 | security | `010-update.test.mjs` | ✅ |
| RF-20.H1 | happy | `010-update.test.mjs` | ✅ |
| RF-20.E1 | edge | `010-update.test.mjs` | ✅ |
| RF-20.E2 | edge | `010-update.test.mjs` | ✅ |
| RF-20.E3 | edge | `010-update.test.mjs` | ✅ |
| RF-20.F1 | failure | `010-update.test.mjs` | ✅ |
| RF-20.S1 | security | `010-update.test.mjs` | ✅ |
| RF-20.S2 | security | `010-update.test.mjs` | ✅ |
| RF-21.H1 | happy | `010-update.test.mjs` | ✅ |
| RF-21.E1 | edge | `010-update.test.mjs` | ✅ |
| RF-21.E2 | edge | `010-update.test.mjs` | ✅ |
| RF-21.E3 | edge | `010-update.test.mjs` | ✅ |
| RF-21.F1 | failure | `010-update.test.mjs` | ✅ |
| RF-21.S1 | security | `010-update.test.mjs` | ✅ |
| RF-22.H1 | happy | `010-update.test.mjs` | ✅ |
| RF-22.E1 | edge | `010-update.test.mjs` | ✅ |
| RF-22.E2 | edge | `010-update.test.mjs` | ✅ |
| RF-22.E3 | edge | `010-update.test.mjs` | ✅ |
| RF-22.E4 | edge | `010-update.test.mjs` | ✅ |
| RF-22.E5 | edge | `010-update.test.mjs` | ✅ |
| RF-22.E6 | edge | `010-update.test.mjs` | ✅ |
| RF-22.F1 | failure | `010-update.test.mjs` | ✅ |
| RF-22.S1 | security | `010-update.test.mjs` | ✅ |
| RF-22.S2 | security | `010-update.test.mjs` | ✅ |
| RF-22.S3 | security | `010-update.test.mjs` | ✅ |
| RF-23.H1 | happy | `010-update.test.mjs` | ✅ |
| RF-23.E1 | edge | `010-update.test.mjs` | ✅ |
| RF-23.E2 | edge | `010-update.test.mjs` | ✅ |
| RF-23.E3 | edge | `010-update.test.mjs` | ✅ |
| RF-23.F1 | failure | `010-update.test.mjs` | ✅ |
| RF-23.S1 | security | `010-update.test.mjs` | ✅ |
| RF-24.H1 | happy | `010-update.test.mjs` | ✅ |
| RF-24.E1 | edge | `010-update.test.mjs` | ✅ |
| RF-24.F1 | failure | `010-update.test.mjs` | ✅ |
| RF-24.S1 | security | `010-update.test.mjs` | ✅ |
| RF-25.H1 | happy | `010-update.test.mjs` | ✅ |
| RF-25.E1 | edge | `010-update.test.mjs` | ✅ |
| RF-25.F1 | failure | `010-update.test.mjs` | ✅ |
| RF-25.S1 | security | `010-update.test.mjs` | ✅ |
| RF-26.H1 | happy | `010-update.test.mjs` | ✅ |
| RF-26.E1 | edge | `010-update.test.mjs` | ✅ |
| RF-26.E2 | edge | `010-update.test.mjs` | ✅ |
| RF-26.E3 | edge | `010-update.test.mjs` | ✅ |
| RF-26.E4 | edge | `010-update.test.mjs` | ✅ |
| RF-26.E5 | edge | `010-update.test.mjs` | ✅ |
| RF-26.F1 | failure | `010-review.test.mjs` | ✅ |
| RF-26.S1 | security | `010-update.test.mjs` | ✅ |
| RF-27.H1 | happy | `010-update.test.mjs` | ✅ |
| RF-27.E1 | edge | `010-update.test.mjs` | ✅ |
| RF-27.E2 | edge | `010-update.test.mjs` | ✅ |
| RF-27.E3 | edge | `010-update.test.mjs` | ✅ |
| RF-27.E4 | edge | `010-update.test.mjs` | ✅ |
| RF-27.F1 | failure | `010-update.test.mjs` | ✅ |
| RF-27.S1 | security | `010-update.test.mjs` | ✅ |
| RF-28.H1 | happy | `010-update.test.mjs` | ✅ |
| RF-28.E1 | edge | `010-update.test.mjs` | ✅ |
| RF-28.F | failure | n/a — justified in spec | — |
| RF-28.S1 | security | `010-update.test.mjs` | ✅ |
| RF-29.H1 | happy | `010-repo-checks.test.mjs` | ✅ |
| RF-29.E1 | edge | `010-repo-checks.test.mjs` | ✅ |
| RF-29.F1 | failure | `010-repo-checks.test.mjs` | ✅ |
| RF-29.S | security | n/a — justified in spec | — |
| RF-37.H1 | happy | `010-update.test.mjs` | ✅ |
| RF-37.E1 | edge | `010-update.test.mjs` | ✅ |
| RF-37.F1 | failure | `010-update.test.mjs` | ✅ |
| RF-37.S | security | n/a — justified in spec | — |
| RF-38.H1 | happy | `010-review.test.mjs` | ✅ |
| RF-38.E1 | edge | `010-review.test.mjs` | ✅ |
| RF-38.F | failure | n/a — justified in spec | — |
| RF-38.S1 | security | `010-review.test.mjs` | ✅ |
| RF-34.H1 | happy | `010-update.test.mjs` | ✅ |
| RF-34.E1 | edge | `010-update.test.mjs` | ✅ |
| RF-34.F | failure | n/a — justified in spec | — |
| RF-34.S | security | n/a — justified in spec | — |

`check-scenarios`: none missing.

## Independent reviews
| Reviewer | High / Medium / Low |
|---|---|
| sdd-reviewer | 1 / 5 / 5 |
| architecture | 0 / 5 / 9 |
| security | 0 / 2 / 7 |

Corrections (`fe8532a` plus the round-8 spec fixes): H1 (skipped questions kept the recorded version moving) fixed; every medium fixed except architecture M1, which became a written phase-2 contract (plan "Contracts") with the dry run no longer executing the release; security L6/L7 accepted as threat-model residuals T19/T20; architecture lows L11 (pair lines never removed) and L14 (version compare in three POSIX/bash files) accepted. Spec re-audited in rounds 8–9 (ready). Regression tests: `tools/test/010-review.test.mjs`.

## Test amendments after `test(red)` `12755a0`
`aa1fce5`, `60ceb03`, `8cca976`, `8247bd8`: harness fixes (cleanup order, pty EOF echo, changelog carry-over, python bytecode, timing waits) and RF-6.F1's previous result; `7b61759`, `cae398e`: 008 command list and fixture entries for HU-2. No assertion was weakened (sdd review).

## Live / manual (owner)
- RF-9: in Claude Code, with a newer version recorded, use `sdd-spec`: the agent says the notice line once.
- Demo: one-line install from the branch is not possible before a release; after merge (release `v0.3.0`), a 0.2.0 clone moves by the README commands, then `rigorkit update --dry-run` and `rigorkit update` in a terminal.
- Confirm the delegated choices (spec answer 4), the review corrections (answer 5) and the ratchet baseline.

Verdict: spec fulfilled (macOS and Linux CI); pending the owner's manual checks and acceptance above.

## Acceptance
Owner accepted on 2026-11-12 after the merge (PR #10) and the live checks on their machine: clone moved from 0.2.0 to `v0.3.0` with the README commands, `rigorkit update --dry-run` and `rigorkit update` (startup block, global record, refresh questions), and the agent notice in Claude Code. The delegated answers 4–5 and the content baseline are accepted with it.
