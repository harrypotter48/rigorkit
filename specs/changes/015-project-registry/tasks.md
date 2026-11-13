# Tasks — 015-project-registry (HU-9 Project registry)
## Resume state
Stage: tests · Approvals: slicing of HU-3 (G9 option c) and spec answers 2026-11-13; owner asked to continue autonomously (scoped tests and commits on this branch; no push/merge).
Authorized blocks: B1 · Current block: B1 · Current task: T1.
Pending/blockers: none.
Next step: red commit → T2.
Review stations: sdd-reviewer + architecture-reviewer + security-reviewer (critical path `install.sh`).
References: spec.md; `install.sh:108-200` (global record), `install.sh:445,467`; `lib/common.sh:37-44` (twin `record_valid`); `tools/test/010-review.test.mjs:124` (twins check).
Dependencies checked: `record_valid` is read by `lib/update.sh` for the global record only; the new header must keep the global path unchanged.
Freeze: `tools/test/015-project-registry.test.mjs` after the approved `test(red)` commit.

## Functional blocks
### B1 — project record (RF-1–RF-4, INV-1–4)
Tasks: T1–T2 · Depends on: none.
Done when: 015 tests, 008/010 install and update suites and the full suite green; project/global dry-runs and a real install in a temporary folder.
Reviewers: sdd + architecture + security.
- [ ] T1. Write `tools/test/015-project-registry.test.mjs`; red; commit `test(red): 015 project registry`. [test · rigorkit]
- [ ] T2. Project record in `install.sh` (and twin `record_valid` in `lib/common.sh`). (RF-1–RF-4, INV-1–4) [installer · rigorkit]

Trace real dependencies; reuse valid evidence. No time-box/internal-task stops. Decisions/blockers/restricted checks→owner; [x] needs evidence, every commit approval. Final full spec/plan/diff/integration review; owner accepts each slice.
