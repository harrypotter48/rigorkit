# Tasks — 012-git-scripts (HU-6 Compact git reads for agents)
## Resume state
Stage: owner acceptance · Approvals: triage + spec answers, AMEND-1, AMEND-2 2026-11-12; owner asked to continue autonomously (run scoped tests, commit on this branch; no push/merge).
Authorized blocks: B1–B3 · Current block: done · Current task: done.
Pending/blockers: owner acceptance. Round-2 hardening (signatures, lazy fetch, git://, alternates, split index, textconv on log, quoted paths, bare repos, fetch --all, SSH timeout) applied after the last review round; no marker tests for those vectors (test is frozen). Open low: RF-9.S1 checks `x` only in the test cwd (frozen test).
Next step: owner acceptance → archive on the next story branch.
Review stations: round 1 sdd not ready (2 blocking), security 3 medium, architecture 2 medium → AMEND-1/2; round 2 sdd 3 blocking + security 4 medium (INV-4 vectors) → fixed afterwards, not re-reviewed.
References: spec.md; `packs/core/scripts/test-summary` (pattern); `bin/rigorkit:31` (script lookup); `lib/update.sh:86-94` (packs/*/scripts glob); 011 convention in `specs/capabilities/work-tracking/spec.md`.
Dependencies checked: `bin/rigorkit script` resolves any `packs/*/scripts/<name>`; no consumer of these names yet.
Freeze: `tools/test/012-git-scripts.test.mjs`, red e300f4a, amended 8a62d29 (AMEND-1) and e49b9f2 (AMEND-2). Evidence: 012 suite 37/37 on /bin/bash 3.2; full toolkit suite 488 pass, 0 fail, 2 skipped (rerun after round-2 hardening: same, 488/490 pass, 0 fail).

## Functional blocks
### B1 — git-compact (RF-1–RF-4)
Tasks: T2 · Depends on: T1.
Done when: RF-1–RF-4 scenarios green.
Verify: `node --test tools/test/012-git-scripts.test.mjs`.
Reviewers: approved profile.
- [x] T1. Write `tools/test/012-git-scripts.test.mjs`; red; commit `test(red): 012 compact git reads`. (RF-1–RF-11, INV-1–3) [test · rigorkit]
- [x] T2. `packs/core/scripts/git-compact`. (RF-1–RF-4, INV-2) [script · rigorkit]

### B2 — git-activity (RF-5–RF-9)
Tasks: T3 · Depends on: T1.
Done when: RF-5–RF-9 scenarios green.
Preserve: INV-1 (no option-like value reaches git), INV-3 (exit 3 on partial).
- [x] T3. `packs/core/scripts/git-activity` (AMEND-2: core). (RF-5–RF-9, INV-1–3) [script · rigorkit]

### B3 — spec-status (RF-10–RF-11)
Tasks: T4 · Depends on: T1.
Done when: RF-10–RF-11 scenarios green.
- [x] T4. `packs/core/scripts/spec-status` (AMEND-2: core). (RF-10–RF-11, INV-1–2) [script · rigorkit]

Trace real dependencies; reuse valid evidence. No time-box/internal-task stops. Decisions/blockers/restricted checks→owner; [x] needs evidence, every commit approval. Final full spec/plan/diff/integration review; owner accepts each slice.
