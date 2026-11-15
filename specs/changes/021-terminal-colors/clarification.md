## Clarification — 021-terminal-colors, round 1 (2026-11-14) · Verdict: not ready
1. Ambiguities: medium — `NO_COLOR` was approved without specifying the empty-value case. Non-empty semantics were proposed in RF-2 and RF-2.E2, pending owner confirmation.
2. Conflicting requirements: none identified. Terminal-default typed answers supersede the preview's green answers. Paths inside colored questions/headings inherit that role; standalone paths stay neutral.
3. Missing test scenarios: none identified in the authoring prose audit; all RFs have the four scenario types or a scoped justification. Machine checking and execution remain pending.
4. Conflicts with the constitution: none identified. Critical DoD, documentation, required reviews and owner-run checks are retained.

## Clarification — 021-terminal-colors, round 2 (2026-11-14) · Verdict: ready for plan
1. Ambiguities: resolved — the owner confirmed that only a non-empty `NO_COLOR` disables styling, for example `NO_COLOR=1`. An unset or empty value leaves per-channel terminal eligibility and `TERM=dumb` rules in effect. RF-2 and RF-2.E1/E2 already express that behavior; answer 6 now records approval and the open question is closed.
2. Conflicting requirements: none identified after re-auditing the affected requirement, scenarios and recorded answers. `TERM=dumb` independently disables added styling, including when `NO_COLOR` is empty. Each output channel still decides eligibility independently.
3. Missing test scenarios: none identified in the authoring prose audit. RF-2 covers `1`, another non-empty value including `0`, empty/unset, `TERM=dumb`, and an agent pseudoterminal with opt-out. All other RFs retain their coverage, including exact plain bytes, script-owned styling, input resets and external control sanitization. No checks were executed.
4. Conflicts with the constitution: none identified. No production code or test boundary changed; critical regressions, required reviews, public documentation and live terminal evidence remain delivery gates.

Resolutions: all six owner answers incorporated. Zero outstanding high/medium findings in this authoring audit. No independent reviewer has run; planned independent review and validation remain pending.

Approval: spec approved by the owner on 2026-11-14: "si dale, apruebo la spec 021, pasemos a Design". Design is authorized; plan/tasks approval, test preparation and implementation remain pending. Design identified a documentation conflict between exact old help bytes and mandatory help updates; the owner resolved it on 2026-11-15 as recorded in round 3 below.


## Clarification — 021-terminal-colors, round 3 (2026-11-15) · Verdict: ready for plan
1. Ambiguities: resolved — owner answer "Sí, añadir la nota a la ayuda" authorizes one appended environment note in root CLI help. Existing help bytes and all other operational text remain unchanged. Answer 7 records the bounded exception.
2. Conflicting requirements: resolved — INV-1, RF-4, acceptance scenarios and the scope exclusion now permit only the approved help-note addition. Public help/manual documentation can satisfy constitution principle 9 without a broader text rewrite.
3. Missing test scenarios: none identified in the focused prose re-audit. RF-4.H1/E1 retain plain/colored compatibility with the exact approved exception; RF-4.E2 checks the old help text and exactly one new note. Failure/artifact-security coverage and RF-1–RF-3/RF-5–RF-7 remain unaffected. Machine checks and execution are pending.
4. Conflicts with the constitution: none identified. Help remains plain source for the generated manual. No command behavior, safe-print boundary, test freeze or critical DoD changes.

Approval: original spec approved on 2026-11-14; the sole scope amendment above explicitly approved on 2026-11-15. Zero outstanding high/medium findings in this authoring audit. No independent reviewer has run. Shared plan/tasks approval remains pending before test preparation or implementation.

## Design handoff — 2026-11-15
- Owner approved the combined plan/tasks and starting B1 tests. The prior shared Design gate is satisfied; red evidence and frozen-test approval remain required before production implementation. No WHAT/scenario amendment was made during test preparation.
