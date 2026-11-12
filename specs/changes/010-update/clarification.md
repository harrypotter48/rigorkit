## Clarification — 010-update, round 1 (2026-11-12) · Verdict: not ready
Independent sdd-reviewer; 0 high, 12 medium (K1–K12), 7 low (K13–K19). All fixable from recorded answers or the choices delegated in answer 4.
Resolved (spec edited; round 2 re-audits):
- K1: rules blocks split from installed copies; only RF-21 handles them, including a missing block (RF-21.E3).
- K2: RF-13 ignores execute-bit-only changes of official scripts; RF-26 repairs them.
- K3: RF-21 compares the on-disk block with the clone's; RF-23 uses the changelog `New packs:` lines since the recorded global version.
- K4: keep records the declined official content; keep is not a no (RF-19.E2, RF-22.E1).
- K5: RF-1 only interactive runs of the clone's `rigorkit`, never with `--dry-run`; actors line aligned.
- K6: acceptance and completion use a local test remote with a release that has this change; RF-24 recovery without `--force`; RF-34 documents the manual move from 0.2.0.
- K7: RF-18 removes uninstalled blocks from the record (RF-18.E4).
- K8: RF-24 covers an unreadable record (RF-24.F1).
- K9: RF-32 one update at a time.
- K10: RF-15 shows an invalid value as "invalid" (RF-15.S1).
- K11: RF-33 installer writes the current block; installer regression in completion criteria.
- K12: only rules blocks block the old-script offer.
- K13: RF-4 split into RF-4 (shell) and RF-31 (`rigorkit` runs). K14: one question per startup file. K15: leading-zero rule defined; installer alignment out of scope (follow-up). K16: RF-26.S1 reworded. K17: RF-13 git-ignored files and `--dry-run`; RF-16 no refresh after a refusal. K18: fallback removed. K19: RF-8 malformed clone `VERSION`.
- Threat model SR-1–SR-6 added (definitions "Interactive shell start" and "Printed safely"; RF-2.E3, RF-6.S1, RF-21.S1, RF-22.S2, RF-27.S1).

## Clarification — 010-update, round 2 (2026-11-12) · Verdict: not ready
Independent sdd-reviewer; 0 high, 5 medium (L1–L5), 5 low (L6–L10). K1–K19 closures hold; SR-1, SR-3–SR-6 covered.
Resolved (spec edited; round 3 re-audits):
- L1: a corrupted record is renamed to `<record>.corrupt` by the next global install (RF-18.F2); RF-24 says so.
- L2: RF-17 prints its diff safely; RF-14.S1 replaces the n/a; RF-22.S3 escape in a skill diff; "printed safely" covers changelog, diffs, pack names and tag values.
- L3: RF-23 offers only shipped, valid pack names; RF-23.S1.
- L4: RF-17 runs after any non-refused update, with or without a record (RF-17.E3).
- L5: an unreachable remote ends the update with non-zero status and no refresh (RF-16, RF-16.F1).
- L6: RF-27.E1 split (RF-27.E4). L7: a later install keeps the recorded version (RF-18.E5). L8: accepted residual T15 (answer 4). L9: RF-26 repairs before moving (RF-13.E3, RF-26.E2). L10: "Capability changes" section.
- Agent edits in the same pass: INV-1 temporary files; RF-20 includes copies a recorded pack now ships; "printed safely" means replaced by `?`.

## Clarification — 010-update, round 3 (2026-11-12) · Verdict: not ready
Independent sdd-reviewer; 0 high, 4 medium (M1–M4), 3 low (M5–M7). L-closures hold; SR-1–SR-6 covered.
Resolved (round 4 re-audits): M1 dry-run only reports execute bits (RF-26.E3). M2 new copies with an occupied path are asked individually (RF-20.E3, RF-20.S2). M3 RF-22 reference defined (declined content, else recorded fingerprint; RF-22.E2, RF-22.E4). M4 record keeps pack/agent pairs (RF-18.E1). M5 "Valid pack name" defined. M6 re-install keeps kept-copy data (RF-18.E6). M7 code reference removed.

## Clarification — 010-update, round 4 (2026-11-12) · Verdict: not ready
Independent sdd-reviewer; 0 high, 3 medium (N1–N3), 5 low (N4–N8). M-closures hold; SR-1–SR-6 covered.
Resolved (round 5 re-audits): N1 writing a copy clears declined content (RF-18.E7). N2 RF-22.E5. N3 non-interactive records nothing (RF-22, RF-22.E6). N4 pairs in RF-19. N5 RF-23 only unrecorded names reported. N6 RF-18 split into RF-18, RF-35 (corrupt record), RF-36 (`--uninstall-rules`). N7 RF-26.F1 real failure, custom case RF-26.E4. N8 capability RF-5 in "Capability changes".

## Clarification — 010-update, round 5 (2026-11-12) · Verdict: not ready
Independent sdd-reviewer; 0 high, 3 medium (P1–P3), 4 low (P4–P7). N-closures hold.
Resolved (round 6 re-audits): P1 RF-26 repairs only after the refusal checks pass (RF-26.E5). P2 "Capability changes" lists RF-1/RF-31 and RF-35/RF-36 under RF-3. P3 RF-35 not with `--dry-run` (RF-35.E2). P4 RF-24 reference. P5 RF-19 readable record. P6 unanswered blocks the version bump. P7 RF-36.E2.

## Clarification — 010-update, round 6 (2026-11-12) · Verdict: not ready
Independent sdd-reviewer; 0 high, 3 medium (Q1–Q3), 3 low (Q4–Q6). P-closures hold.
Resolved (round 7 re-audits): Q1 explicit "When" in RF-35 rows. Q2 RF-35 excludes `--uninstall-rules`. Q3 new RF-37 (failed clone move) and RF-16 lists it. Q4 bare `rigorkit` counts as `help` (RF-1, RF-31.E1). Q5 capability RF-5 entry mentions the check. Q6 scenario rows ordered.

## Clarification — 010-update, round 7 (2026-11-12) · Verdict: ready for plan
Independent sdd-reviewer; 0 high, 0 medium, 3 low. Q-closures hold; SR-1–SR-6 covered.
Accepted low, resolved in the plan without a spec edit: R1 (`--dry-run` and `--help` count only as options of `rigorkit` and its `install`/`update` commands, never inside `rigorkit script` arguments); R2 (capability RF-6 entry gains the check note at archive); R3 (RF-37.H1 built with a work-tree file git cannot overwrite).
Approval: owner delegated (answer 4); spec, plan and delegated choices are confirmed at acceptance.
- Format fix (2026-11-12, no behavior change): n/a failure rows renamed RF-n.F as the scenario checker requires.

## Review corrections (2026-11-12)
Three independent reviews (sdd: 1 high, 5 medium; architecture: 0 high, 5 medium; security: 0 high, 2 medium) and one correction round. Spec edits: RF-18 scope (clone at `~/.rigorkit`), out-of-scope line for development clones, answer 5. Regression tests: `tools/test/010-review.test.mjs`. Round 8 re-audits these edits.
