# Tasks — 014-roadmap (HU-8 Project roadmap instead of backlog)
## Resume state
Stage: owner acceptance · Approvals: triage + spec answers, AMEND-1 2026-11-13; owner asked to continue autonomously (scoped tests and commits on this branch; no push/merge).
Authorized blocks: B1 · Current block: B1 · Current task: done.
Pending/blockers: none.
Next step: push/PR; archive 014 on the next story branch.
Review stations: sdd-reviewer round 1: 0 high, 2 medium (init overwriting an old backlog, mixed status names) + 3 low → AMEND-1 fixed both mediums and the stale README wording; open low: external-mode entry fields/HU-N allocation and switching an existing roadmap to external. Not re-reviewed.
References: spec.md; `packs/sdd/skills/sdd-slice/SKILL.md`; `packs/sdd/skills/sdd-init/SKILL.md:7-8`; `packs/core/skills/core-init/project.yaml`; `packs/core/scripts/deferred` (013).
Dependencies checked: no script or test reads `backlog.md`; 006 references are prose paths.
Freeze: `tools/test/014-roadmap.test.mjs` (red 76921b0); `tools/test/010-update.test.mjs` RF-11.F1 amended (AMEND-1). Evidence: 011+013+014 suites 43/43; ratchet sdd 14519 ≤ 14521; full suite 517/519 pass, 0 fail.

## Functional blocks
### B1 — roadmap, external backlog, fallback and release (RF-1–RF-6, INV-1–2)
Tasks: T1–T4 · Depends on: none.
Done when: 014 tests, ratchet and full suite green.
Verify: `node --test tools/test/014-roadmap.test.mjs`; full `tools/test`.
Reviewers: sdd-reviewer.
- [x] T1. Write `tools/test/014-roadmap.test.mjs`; red; commit `test(red): 014 project roadmap`. [test · rigorkit]
- [x] T2. Templates, sdd-init, sdd-slice (fallback, `backlog: external`), core-init `project.yaml`, docs and 006 paths. (RF-1–RF-5) [skill · rigorkit]
- [x] T3. `git mv specs/backlog.md specs/roadmap.md` with `proposed` statuses. (RF-3) [specs · rigorkit]
- [x] T4. VERSION 0.5.0 and changelog. (RF-6) [release · rigorkit]

Trace real dependencies; reuse valid evidence. No time-box/internal-task stops. Decisions/blockers/restricted checks→owner; [x] needs evidence, every commit approval. Final full spec/plan/diff/integration review; owner accepts each slice.
