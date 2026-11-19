# Review reports — 022-global-rules-on-install
> Independent, read-only reviews; reviewers got the same original references and none saw another's report. None ran tests; findings are by reading the code. Dates 2026-11-17.

## Design (plan, tasks, threat model)
- sdd-reviewer: not ready before revision (a broken-link versus RF-8.S1 contradiction, empty-pack guard in `lib/update.sh`, line references, test levels); revised.
- architecture-reviewer: sound; two mediums (capability marker, duplicated facts) applied.
- security-reviewer: 1 high (V2 did not cover the custom core pack, links, `$HOME`), 6 mediums (TOCTOU, unseen content, environment, parent folders, atomic write, development clone), 3 lows; high and mediums applied or recorded as residual (threat-model.md section 5).

## Blocks
- B1 (`c540f96`): sdd ready; architecture 1 high (capability line with a trailing comment) and mediums; security 1 medium (non-regular destinations); all applied.
- B2 (`61dcf93`): sdd ready; architecture 2 mediums (duplicated staging loops, pattern matching); security mediums pre-existing (record file path unchecked, broken link in the update path), recorded as R8; applied the refactor and exact matching.
- B3 (`5d42a8a`): sdd 1 high (008 RF-1.H1 stale, resolved by AMEND-2); architecture 3 mediums; security 2 mediums (`custom/` parents, V12 text); applied.
- B4 (`e510f2b`): sdd ready; lows applied.

## Final, whole change (base 8fedd1e to 3024d58)
- sdd-reviewer: verdict "spec missing", no high findings, no wrong scope/default/ownership defect; 4 mediums that were documentation and bookkeeping: baseline not updated, opt-out documented only in some places, archive contract list incomplete, "spec does not carry AMEND-1" (not true: `spec.md` RF-11.E1/E2 carry it). Handled: baseline left unchanged on purpose (it covers CLI colors; the one-line installer is outside the CLI, 021 out of scope), opt-out added to the core pack README, archive list completed in tasks.md T11, tasks.md state refreshed. The reviewer did not open the 022 test files.
- architecture-reviewer: no high; 2 mediums: twin guard was substring-only (applied: `tools/test/022-twin-guards.test.mjs` compares the tool-to-file functions of the three scripts), and a multi-agent rules-only run dying midway leaves files written but unrecorded (pre-existing for every multi-agent global install; recorded as R11 and proposed for the follow-up 023).
- security-reviewer: no high; all of V1–V12 hold by reading; 4 lows: reads through links of the downloaded clone before consent (applied: `416470c`), non-ASCII controls in paths (accepted residual, would refuse legitimate UTF-8 paths), pseudo-terminal-driven consent and unlisted residuals (listed in threat-model.md section 5 and plan.md R11).

## Correction round (second reviews, 2026-11-17, after the approver said "needs human")
- sdd-reviewer, now reading all four 022 test files: spec fulfilled for the test coverage, no vacuous scenario test; mediums that are weak report assertions in frozen tests, not missing behaviour: RF-8.E1/F1/S1 look for the file name in the whole output, which the question also contains (they prove the failure status and the unchanged file, not that a failure line with a reason is printed); RF-15.E1 does not check the fix-by-hand advice (RF-15.F1/F2 do). Lows: RF-2.H1 checks markers only, RF-13.E1 omits the message, RF-1.E2 does not tie the status to its cause. Changing them needs owner-approved test amendments; recorded here, left unchanged.
- security-reviewer, delta `416470c`, `74e85d3` and the twin-guard test: pre-consent reads closed for final-component links; two lows applied afterwards: `rules_capable` also refuses a link at `packs` or `packs/core`, and the stale FIFO sentence of plan.md R10 and the threat-model wording were corrected. The twin-guard test runs only extracted function definitions with a replaced environment.
