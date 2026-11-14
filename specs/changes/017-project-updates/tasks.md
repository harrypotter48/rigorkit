# Tasks — 017-project-updates (HU-10 Update registered projects)
## Resume state
Stage: tests · Approvals: owner asked to finish HU-10 autonomously (2026-11-13); decisions 1–3 delegated; scoped tests and commits on this branch, no push/merge.
Authorized blocks: B1 · Current block: B1 · Current task: T1.
Pending/blockers: none.
Next step: red commit → T2–T3.
Review stations: sdd-reviewer + architecture-reviewer + security-reviewer (critical path `lib/update.sh`).
References: spec.md; `lib/update.sh:218-429` (global refresh, `write_copy`, `apply_edits`, `ask`/`ask_ok`), `:454-465` (phase 2); `install.sh` 015 project record; `lib/scan.sh` (016).
Dependencies checked: phase 2 runs also when the clone is already current; 010 suites pin the global refresh.
Freeze: `tools/test/017-project-updates.test.mjs` after the approved `test(red)` commit.

## Functional blocks
### B1 — project refresh (RF-1–RF-7, INV-1–3)
Tasks: T1–T3.
Done when: 017 and 010 update suites green; full suite; docs check.
- [ ] T1. Write `tools/test/017-project-updates.test.mjs`; red; commit `test(red): 017 project updates`. [test · rigorkit]
- [ ] T2. Project refresh in `lib/update.sh` sharing the global classification. (RF-1–RF-7) [updater · rigorkit]
- [ ] T3. `help/update.txt`, README, man page. (principle 9) [docs · rigorkit]

Trace real dependencies; reuse valid evidence. No time-box/internal-task stops. Decisions/blockers/restricted checks→owner; [x] needs evidence, every commit approval. Final full spec/plan/diff/integration review; owner accepts each slice.
