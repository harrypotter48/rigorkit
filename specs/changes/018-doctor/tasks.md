# Tasks — 018-doctor (HU-12 rigorkit doctor)
## Resume state
Stage: tests · Approvals: owner asked to finish everything autonomously (2026-11-13); decisions 1 and 3 delegated.
Authorized blocks: B1 · Current block: B1 · Current task: T1.
Pending/blockers: none.
Next step: red commit → T2.
Review stations: sdd-reviewer + security-reviewer (critical path `bin/rigorkit`).
References: spec.md; `lib/update.sh` `shadows()` and execute-bit repair (phase 1); `lib/common.sh` (`fp_path`, `record_valid`); 015/016 project records.
Freeze: `tools/test/018-doctor.test.mjs` after the approved `test(red)` commit.

## Functional blocks
### B1 — doctor (RF-1–RF-6, INV-1–2)
- [ ] T1. Write `tools/test/018-doctor.test.mjs`; red; commit. [test · rigorkit]
- [ ] T2. `lib/doctor.sh`, `doctor` dispatch, help, README, man; 008/010 command lists amended. (RF-1–RF-6) [cli · rigorkit]

Trace real dependencies; reuse valid evidence. No time-box/internal-task stops. Decisions/blockers/restricted checks→owner; [x] needs evidence, every commit approval. Final full spec/plan/diff/integration review; owner accepts each slice.
