## Clarification — 022-global-rules-on-install, round 1 (2026-11-16) · Verdict: not ready
Independent readonly audit by sdd-reviewer: 0 high, 11 medium, 10 low. Wording gaps were corrected in the spec; owner decisions are open questions C1–C9.
1. Ambiguities: "affirmative answer", "detected tool" and "later command" were undefined (M1, M3, M4) → defined. "Terminal available" with piped input (M2) → C1, C9. "Completed a new installation" after a partial failure (M5) → C2. Open, low: several behaviours per sentence in RF-1, RF-2, RF-3, RF-4, RF-8, RF-11 (L1); RF-1.S1 does not say link or target (L2).
2. Conflicting requirements: INV-1 was universal while RF-9 writes without a question (M6) → INV-1 scoped to the one-line installer. New install over an existing rules block against the no-refresh exclusion (M7) → C3. RF-10.E1 tested RF-9 behaviour (M8) → moved to RF-9.E2; default scope → C4. `RIGORKIT_REMOTE` under an existing clone and a non-release ref (L4, L8) → C7. Delivery evidence listed too few contracts (L3) → extended.
3. Missing test scenarios: RF-11 did not assert that update copies no skill, nor the full install after rules-only (M9) → RF-11.H1 extended, RF-11.E2 added. Source without rules (M10) → C5. Open, low: RF-6.F1 states behaviour no RF states and no exit status (L5); the no-change second run has no scenario (L6); exit status missing in RF-9.E1/F1 and no interrupt-at-prompt scenario (L7). The six n/a rows are sound.
4. Conflicts with the constitution: backup name, original mode and the user's own `.bak` (M11, principle 7) → RF-2 and RF-2.E2. `CHANGELOG.md` and CLI output baseline missing from completion criteria (L9) → added. Open: "runs release content after checkout" presupposes a mechanism and changes the "nothing from the clone runs" statement (L10); to settle in the threat model before the plan.
Next: owner answers C1–C9; round 2 re-audits the edited RFs and the open low findings.

## Clarification — 022-global-rules-on-install, round 2 (2026-11-16) · Verdict: not ready
Independent readonly audit by sdd-reviewer after the owner's answers to C1–C9: M1–M11 closed; 0 high, 4 new medium (N1–N4, all introduced by the round-1 edits), 5 low. Second corrective round reached: no further agent corrections of behaviour; D1–D4 go to the owner.
1. Ambiguities: "terminal available" tests input only while the update check needs input and output → D4. Open, low: `CODEX_HOME` set but empty and a symlinked tool folder are unstated; the case of `Y`/`YES` has no scenario.
2. Conflicting requirements: RF-12's condition did not hold for an older clone that ships rules (N2) → reworded to "cannot perform a rules-only install". Precedence among RF-3, RF-4, RF-5 and RF-12 unstated (N3) → D2. RF-8.F2 against RF-3 and RF-4 for an unterminated block (N4) → D3. RF-7 said "source and ref" while its scenarios assert one each → reworded.
3. Missing test scenarios: detected tools whose files all have a block have no stated behaviour on a new install, and RF-6.S1 sits outside RF-6's trigger (N1) → D1. Open, low: RF-6.S1 does not give startup blocks as present; RF-10 scenarios give no exit status. Every RF has four types or a sound n/a.
4. Conflicts with the constitution: none new; L1 and L10 deferrals are sound.
Next: owner answers D1–D4; round 3 re-audits the affected RFs before the approval gate.

## Clarification — 022-global-rules-on-install, round 3 (2026-11-16) · Verdict: not ready
Independent readonly audit by sdd-reviewer after the owner's answers to D1–D4: N1–N4 closed; 0 high, 3 new medium, 5 low. Two were wording and are corrected; one is the owner's (E1).
1. Ambiguities: "rules block" was not tied to `core` although markers are per pack (M1) → defined. Open, low: RF-3 does not state "not ask" without a terminal outside its scenarios; an end marker without a start marker counts as an offered file; an unreadable or non-regular instruction file is unclassified.
2. Conflicting requirements: the no-change second run NFR against the failure status of RF-15 and RF-1.E2 (M3) → NFR reworded.
3. Missing test scenarios: no offered file with an incomplete block has no stated output beyond RF-15 (M2) → E1. Open, low: opt-out with every file having a block; RF-12 with an incomplete block; exit status in RF-8.F1 and RF-8.S1. All 15 RFs have four types or a sound n/a.
4. Conflicts with the constitution: none; no contradiction with INV-1..INV-5 or out of scope.
Next: owner answers E1; round 4 re-audits RF-15 and the open low findings before the approval gate.

## Clarification — 022-global-rules-on-install, round 4 (2026-11-17) · Verdict: ready for plan
Independent readonly audit by sdd-reviewer after the owner's answer to E1: M1, M2 and M3 closed; 0 high, 0 medium, 4 low. No state of a one-line run lacks a stated behaviour and no two contradict.
1. Ambiguities: none medium. Low: the NFR phrase "says so" is unclear for the no-answer, no-terminal and no-tool states, where the later command is printed instead (L-c).
2. Conflicting requirements: none. RF-12, RF-4 and RF-5 take precedence over RF-15; RF-15 cannot coexist with RF-13; RF-15's two clauses are an accepted low of the L1 family.
3. Missing test scenarios: all 15 RFs have four types or a sound n/a. Low: a failed clone does not say whether the later command is printed or an incomplete block reported (L-a); no RF-15 scenario covers an existing clone (L-b); the CLI path leaves an incomplete block and write failures unstated, since RF-8 sits under the one-line installer and RF-9.F1 covers only Cursor (L-d). Lows L-a, L-b, L-c and L-d are deferred to the plan and test preparation; none became medium.
4. Conflicts with the constitution: none; no contradiction with INV-1..INV-5 or out of scope. L10 (nothing from the clone runs) is settled in the threat model before the plan.
Next: owner approval of the clarified spec; then a threat model, then the plan.
