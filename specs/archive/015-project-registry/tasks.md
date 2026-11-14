# Tasks — 015-project-registry (HU-9 Project registry)
## Resume state
Stage: owner acceptance · Approvals: slicing of HU-3 (G9 option c), spec answers and AMEND-1 2026-11-13; owner asked to continue autonomously (scoped tests and commits on this branch; no push/merge).
Authorized blocks: B1 · Current block: B1 · Current task: done.
Pending/blockers: none.
Next step: push/PR (no release yet; release with HU-10/HU-11); archive on the next story branch.
Review stations: sdd+architecture round 1 not ready (4 medium), security 4 low → AMEND-1 fixed record kinds, project version, dev path, identity, control characters, symlinked state folder and missing hash tool; open low: temp/.corrupt files share `projects/` (readers filter by name). Not re-reviewed.
References: spec.md; `install.sh:108-200` (global record), `install.sh:445,467`; `lib/common.sh:37-44` (twin `record_valid`); `tools/test/010-review.test.mjs:124` (twins check).
Dependencies checked: `record_valid` is read by `lib/update.sh` for the global record only; the new header must keep the global path unchanged.
Freeze: `tools/test/015-project-registry.test.mjs` (red 5534fe5, amended AMEND-1). Evidence: 015 suite 16/16; full suite 533/535, 0 fail (includes 008/010 install suites and the 010 twins check); manual project/global dry-runs and a real project install in a temp HOME.

## Functional blocks
### B1 — project record (RF-1–RF-4, INV-1–4)
Tasks: T1–T2 · Depends on: none.
Done when: 015 tests, 008/010 install and update suites and the full suite green; project/global dry-runs and a real install in a temporary folder.
Reviewers: sdd + architecture + security.
- [x] T1. Write `tools/test/015-project-registry.test.mjs`; red; commit `test(red): 015 project registry`. [test · rigorkit]
- [x] T2. Project record in `install.sh` (and twin `record_valid` in `lib/common.sh`). (RF-1–RF-4, INV-1–4) [installer · rigorkit]

Trace real dependencies; reuse valid evidence. No time-box/internal-task stops. Decisions/blockers/restricted checks→owner; [x] needs evidence, every commit approval. Final full spec/plan/diff/integration review; owner accepts each slice.
