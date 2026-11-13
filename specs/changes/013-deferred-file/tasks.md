# Tasks — 013-deferred-file (HU-7 Deferred work file)
## Resume state
Stage: owner acceptance · Approvals: triage + spec answers, AMEND-1 2026-11-13; owner asked to continue autonomously (scoped tests and commits on this branch; no push/merge).
Authorized blocks: B1 · Current block: B1 · Current task: done.
Pending/blockers: none.
Next step: owner acceptance → archive on the next story branch.
Review stations: round 1 sdd not ready (1 high: empty-file count; 3 medium) and security 1 medium (symlinks) + 3 low → AMEND-1 fixed all but C1/bidi characters (low, open); not re-reviewed. Manual race check: 20 concurrent adds during a clear, none lost.
References: spec.md; `packs/core/scripts/git-activity` (hardening pattern); `packs/sdd/skills/sdd-init/templates/AGENTS.md:15`; `packs/sdd/skills/sdd-archive/SKILL.md:10`; `AGENTS.md:67` (ratchet).
Dependencies checked: `specs/templates/AGENTS.md` byte-equal to the pack template; vault productivity skill will call `deferred list/clear`.
Freeze: `tools/test/013-deferred-file.test.mjs`, red 831f3fa, amended for AMEND-1. Evidence: 013 suite 19/19 on /bin/bash 3.2; ratchet sdd 14520 ≤ 14521; full suite 507/509 pass, 0 fail.

## Functional blocks
### B1 — deferred helper and rules (RF-1–RF-6, INV-1–5)
Tasks: T1–T3 · Depends on: none.
Done when: 013 tests, ratchet and full suite green.
Verify: `node --test tools/test/013-deferred-file.test.mjs`; full `tools/test`.
Reviewers: sdd-reviewer + security-reviewer.
- [x] T1. Write `tools/test/013-deferred-file.test.mjs`; red; commit `test(red): 013 deferred work file`. [test · rigorkit]
- [x] T2. `packs/core/scripts/deferred` and core README row. (RF-1–RF-5, INV-1–4) [script · rigorkit]
- [x] T3. Rule in both AGENTS templates and `Deferred:` in sdd-archive, offsetting tokens in the sdd pack. (RF-6, INV-5) [skill · rigorkit]

Trace real dependencies; reuse valid evidence. No time-box/internal-task stops. Decisions/blockers/restricted checks→owner; [x] needs evidence, every commit approval. Final full spec/plan/diff/integration review; owner accepts each slice.
