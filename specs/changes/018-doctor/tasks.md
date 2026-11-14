# Tasks — 018-doctor (HU-12 rigorkit doctor)
## Resume state
Stage: owner acceptance · Approvals: owner asked to finish everything autonomously (2026-11-13); decisions 1 and 3 delegated.
Authorized blocks: B1 · Current block: B1 · Current task: done.
Pending/blockers: none.
Next step: review with 019; release 0.6.0.
Review stations: sdd+security review (with 019): 2 medium (missing copies counted as edited; untested non-git clone) + 4 low → fixed: separate edited/missing counts, git check only when the clone is its own repository top, GIT_OPTIONAL_LOCKS=0, no chmod through linked pack/scripts folders, records without version flagged, docs wording (read-only, stale pairs). Not re-reviewed. 019: no findings.
References: spec.md; `lib/update.sh` `shadows()` and execute-bit repair (phase 1); `lib/common.sh` (`fp_path`, `record_valid`); 015/016 project records.
Freeze: `tools/test/018-doctor.test.mjs` (red c4c36ac); 008/010 command lists amended (AMEND-1). Evidence: 018 suite 13/13; generate-man --check PASS.

## Functional blocks
### B1 — doctor (RF-1–RF-6, INV-1–2)
- [x] T1. Write `tools/test/018-doctor.test.mjs`; red; commit. [test · rigorkit]
- [x] T2. `lib/doctor.sh`, `doctor` dispatch, help, README, man; 008/010 command lists amended. (RF-1–RF-6) [cli · rigorkit]

Trace real dependencies; reuse valid evidence. No time-box/internal-task stops. Decisions/blockers/restricted checks→owner; [x] needs evidence, every commit approval. Final full spec/plan/diff/integration review; owner accepts each slice.
