# Tasks — 019-version-rule (HU-13 One version rule)
## Resume state
Stage: tests · Approvals: owner asked to finish everything autonomously (2026-11-13).
Authorized blocks: B1 · Current block: B1 · Current task: T1.
Review stations: sdd-reviewer + security-reviewer (critical paths).
References: spec.md; `tools/install-remote.sh:209`; `install.sh:131`, `lib/common.sh:41` (`record_valid`); `lib/common.sh:4` (`RK_VERSION_RE`).
Freeze: `tools/test/019-version-rule.test.mjs` after the approved `test(red)` commit.

## Functional blocks
### B1 — strict versions (RF-1–RF-2, INV-1)
- [ ] T1. Write the test; red; commit. [test · rigorkit]
- [ ] T2. Strict tag filter in `install-remote.sh`; strict `version` in both `record_valid`. [installer · rigorkit]

Trace real dependencies; reuse valid evidence. No time-box/internal-task stops. Decisions/blockers/restricted checks→owner; [x] needs evidence, every commit approval. Final full spec/plan/diff/integration review; owner accepts each slice.
