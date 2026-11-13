# Tasks — 016-migrate-0-1-0 (HU-11 rigorkit scan)
## Resume state
Stage: tests · Approvals: spec answers 2026-11-13 (scan command, config keys, docs check); owner asked to continue autonomously (scoped tests and commits on this branch; no push/merge).
Authorized blocks: B1–B2 · Current block: B1 · Current task: T1.
Pending/blockers: none.
Next step: red commit → T2–T4.
Review stations: sdd-reviewer + architecture-reviewer + security-reviewer (critical path `bin/rigorkit`).
References: spec.md; `bin/rigorkit:67-75` (dispatch); `lib/common.sh` (fingerprints, `record_valid`, `print_safe`); `lib/notice.sh:20-25` (`conf`); `lib/update.sh:26-47` (questions); `install.sh` 015 project record; `tools/generate-man.mjs:85-116` (check).
Dependencies checked: `generate-man --check` runs in CI; `bin/rigorkit` dispatch list is read by the check.
Freeze: `tools/test/016-scan.test.mjs` after the approved `test(red)` commit.

## Functional blocks
### B1 — rigorkit scan (RF-1–RF-6, INV-1–3)
Tasks: T1–T3.
Done when: 016 scan scenarios green; 008/010 suites green.
- [ ] T1. Write `tools/test/016-scan.test.mjs`; red; commit `test(red): 016 rigorkit scan`. [test · rigorkit]
- [ ] T2. `lib/scan.sh` and `scan` in `bin/rigorkit`. (RF-1–RF-6) [cli · rigorkit]
- [ ] T3. `help/scan.txt`, `help/rigorkit.txt`, regenerated man page, README section. (RF-8) [docs · rigorkit]

### B2 — docs check (RF-7)
Tasks: T4.
- [ ] T4. README/pack README/config-key checks in `tools/generate-man.mjs --check`. (RF-7) [tooling · rigorkit]

Trace real dependencies; reuse valid evidence. No time-box/internal-task stops. Decisions/blockers/restricted checks→owner; [x] needs evidence, every commit approval. Final full spec/plan/diff/integration review; owner accepts each slice.
