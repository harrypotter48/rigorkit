# Tasks — 016-migrate-0-1-0 (HU-11 rigorkit scan)
## Resume state
Stage: owner acceptance · Approvals: spec answers and AMEND-1 2026-11-13 (scan command, config keys, docs check); owner asked to continue autonomously (scoped tests and commits on this branch; no push/merge).
Authorized blocks: B1–B2 · Current block: B1 · Current task: done.
Pending/blockers: none.
Next step: push/PR; release with HU-10; archive on the next story branch.
Review stations: sdd+architecture: 0 high, 1 medium (README heading change = the owner's own uncommitted edit, not in this change) + lows; security: 2 medium (symlinked tool folders recorded as project copies; --save writing control characters or commas) + 2 low. Fixed: symlink refusal, --save checks, symlinked config, one-line messages, spaced tool answers, dry run without a terminal, find -H for a symlinked root, --tools in README. Open low: tools suggestion for .agents-only projects, pack moves since 0.1.0 and non-0.1.0 installs get '-', conf()/record-writer duplicates without twin tests, scan_exclude as name patterns. Not re-reviewed.
References: spec.md; `bin/rigorkit:67-75` (dispatch); `lib/common.sh` (fingerprints, `record_valid`, `print_safe`); `lib/notice.sh:20-25` (`conf`); `lib/update.sh:26-47` (questions); `install.sh` 015 project record; `tools/generate-man.mjs:85-116` (check).
Dependencies checked: `generate-man --check` runs in CI; `bin/rigorkit` dispatch list is read by the check.
Freeze: `tools/test/016-scan.test.mjs` (red 9ec50ad); 008/010 command lists amended (21e20fd). Evidence: 016 suite 19/19 on /bin/bash 3.2; full suite 552/554, 0 fail; generate-man --check PASS; dry run on ~/workspace: 12 projects, synapse with 1 edited skill, ~40 s.

## Functional blocks
### B1 — rigorkit scan (RF-1–RF-6, INV-1–3)
Tasks: T1–T3.
Done when: 016 scan scenarios green; 008/010 suites green.
- [x] T1. Write `tools/test/016-scan.test.mjs`; red; commit `test(red): 016 rigorkit scan`. [test · rigorkit]
- [x] T2. `lib/scan.sh` and `scan` in `bin/rigorkit`. (RF-1–RF-6) [cli · rigorkit]
- [x] T3. `help/scan.txt`, `help/rigorkit.txt`, regenerated man page, README section. (RF-8) [docs · rigorkit]

### B2 — docs check (RF-7)
Tasks: T4.
- [x] T4. README/pack README/config-key checks in `tools/generate-man.mjs --check`. (RF-7) [tooling · rigorkit]

Trace real dependencies; reuse valid evidence. No time-box/internal-task stops. Decisions/blockers/restricted checks→owner; [x] needs evidence, every commit approval. Final full spec/plan/diff/integration review; owner accepts each slice.
