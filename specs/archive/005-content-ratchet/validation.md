# Validation — 005-content-ratchet

Status: COMPLETE / ARCHIVED by explicit user acceptance. Updated: 2026-10-26.

## Evidence

- E1 — The executable suite passes: 29 tests, 0 failures, including the four new capture cases and the four new ratchet cases (`node --test tools/test/*.test.mjs`). Two defects were found by those tests and fixed before archiving: a pack absent from the baseline was not required, and the growth fixture did not exceed its baseline.
- E2 — The live measurement against the ratchet baseline reports 0 errors: architecture 1623, design 1839, frontend 1208, sdd 14530 and security 1254, each at 0.00% against its baseline, and the identities match.
- E3 — The growth path was verified on a disposable copy of the packs: one extra line in a `sdd` skill moved the pack to 14537 tokens and the check reported `Content growth for pack sdd: current=14537 baseline=14530 (target>=0%)` with a failing exit.
- E4 — The capture was verified from the commit that closes change 004 (`23d193a`): the baseline records the commit, the estimator, the 30 entries, the rules entry and the target of 0%. A second capture to the same path is refused, an invalid target percentage and an unknown commit are reported, and no file is written in those cases.
- E5 — The archived baseline of change 001 was not modified: the same tool still reads it and applies the original 30% policy in `sdd`, `architecture` and `frontend`.
- E6 — The ratchet baseline was captured from the commit that closes change 004, so the comparison starts exactly at the current content.

## Scenario evidence

The 32 scenarios are defined in this change's spec.md. Executable coverage maps to RF-1 (target resolution and legacy policy), RF-2 (growth report), RF-3 (pack without baseline), RF-4 (capture content), RF-5 (overwrite refusal) and RF-6 (invalid input). The manual scenarios of RF-7 and RF-8 are satisfied by the static inspection of the archived baseline and by the documentation that names the live and historical references.

## Accepted verification exceptions

None: the change is covered by executable tests and by a live measurement with 0 errors. The ratchet accepts the current size of the `sdd` pack as its reference; a later compaction of that pack is a separate change and stays open in the spec. No push or merge is authorized.

Verdict: completed and archived by explicit user acceptance.
