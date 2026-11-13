# Tasks — 012-git-scripts (HU-6 Compact git reads for agents)
## Resume state
Stage: tests · Approvals: triage + spec answers 2026-11-12; owner asked to continue autonomously (run scoped tests, commit on this branch; no push/merge).
Authorized blocks: B1–B3 · Current block: B1 · Current task: T1.
Pending/blockers: none.
Next step: red commit → T2–T4.
Review stations: sdd-reviewer + architecture-reviewer + security-reviewer (pending).
References: spec.md; `packs/core/scripts/test-summary` (pattern); `bin/rigorkit:31` (script lookup); `lib/update.sh:86-94` (packs/*/scripts glob); 011 convention in `specs/capabilities/work-tracking/spec.md`.
Dependencies checked: `bin/rigorkit script` resolves any `packs/*/scripts/<name>`; no consumer of these names yet.
Freeze: `tools/test/012-git-scripts.test.mjs` after the approved `test(red)` commit.

## Functional blocks
### B1 — git-compact (RF-1–RF-4)
Tasks: T2 · Depends on: T1.
Done when: RF-1–RF-4 scenarios green.
Verify: `node --test tools/test/012-git-scripts.test.mjs`.
Reviewers: approved profile.
- [ ] T1. Write `tools/test/012-git-scripts.test.mjs`; red; commit `test(red): 012 compact git reads`. (RF-1–RF-11, INV-1–3) [test · rigorkit]
- [ ] T2. `packs/core/scripts/git-compact`. (RF-1–RF-4, INV-2) [script · rigorkit]

### B2 — git-activity (RF-5–RF-9)
Tasks: T3 · Depends on: T1.
Done when: RF-5–RF-9 scenarios green.
Preserve: INV-1 (no option-like value reaches git), INV-3 (exit 3 on partial).
- [ ] T3. `packs/core/scripts/git-activity`. (RF-5–RF-9, INV-1–3) [script · rigorkit]

### B3 — spec-status (RF-10–RF-11)
Tasks: T4 · Depends on: T1.
Done when: RF-10–RF-11 scenarios green.
- [ ] T4. `packs/sdd/scripts/spec-status`. (RF-10–RF-11, INV-1–2) [script · rigorkit]

Trace real dependencies; reuse valid evidence. No time-box/internal-task stops. Decisions/blockers/restricted checks→owner; [x] needs evidence, every commit approval. Final full spec/plan/diff/integration review; owner accepts each slice.
