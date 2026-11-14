# Tasks — 017-project-updates (HU-10 Update registered projects)
## Resume state
Stage: owner acceptance · Approvals: owner asked to finish HU-10 autonomously (2026-11-13); decisions 1–3, AMEND-1/2 delegated; scoped tests and commits on this branch, no push/merge.
Authorized blocks: B1 · Current block: B1 · Current task: done.
Pending/blockers: none.
Next step: changelog with the 0.6.0 release; push/PR; archive on the next story branch.
Review stations: sdd+architecture: changelog pending (release step), 3 medium (unshipped pack, rename after version, dev at release) + logical/physical path mismatch → fixed (project FAILED on unshipped pack or empty staging, rename before version and only on a clean refresh, dev asked at the release, project copies recorded under the real path in install.sh, links on the way skipped without FAILED, hash tool error); security: 1 medium (writes through linked folders) + 2 low → fixed (linked_below, renamed-in .rigorkit-version, mv -n with specs link check). Not re-reviewed.
References: spec.md; `lib/update.sh:218-429` (global refresh, `write_copy`, `apply_edits`, `ask`/`ask_ok`), `:454-465` (phase 2); `install.sh` 015 project record; `lib/scan.sh` (016).
Dependencies checked: phase 2 runs also when the clone is already current; 010 suites pin the global refresh.
Freeze: `tools/test/017-project-updates.test.mjs` (red dbc446c, AMEND-1); 014 RF-3.E1 amended (AMEND-2). Evidence: 017 suite 13/13 and 015 16/16 on /bin/bash 3.2; full suite 565/567, 0 fail; generate-man --check PASS.

## Functional blocks
### B1 — project refresh (RF-1–RF-7, INV-1–3)
Tasks: T1–T3.
Done when: 017 and 010 update suites green; full suite; docs check.
- [x] T1. Write `tools/test/017-project-updates.test.mjs`; red; commit `test(red): 017 project updates`. [test · rigorkit]
- [x] T2. Project refresh in `lib/update.sh` sharing the global classification. (RF-1–RF-7) [updater · rigorkit]
- [x] T3. `help/update.txt`, README, man page. (principle 9) [docs · rigorkit]

Trace real dependencies; reuse valid evidence. No time-box/internal-task stops. Decisions/blockers/restricted checks→owner; [x] needs evidence, every commit approval. Final full spec/plan/diff/integration review; owner accepts each slice.
