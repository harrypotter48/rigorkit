# Tasks — 013-deferred-file (HU-7 Deferred work file)
## Resume state
Stage: tests · Approvals: triage + spec answers 2026-11-13; owner asked to continue autonomously (scoped tests and commits on this branch; no push/merge).
Authorized blocks: B1 · Current block: B1 · Current task: T1.
Pending/blockers: none.
Next step: red commit → T2–T3.
Review stations: sdd-reviewer + security-reviewer (pending).
References: spec.md; `packs/core/scripts/git-activity` (hardening pattern); `packs/sdd/skills/sdd-init/templates/AGENTS.md:15`; `packs/sdd/skills/sdd-archive/SKILL.md:10`; `AGENTS.md:67` (ratchet).
Dependencies checked: `specs/templates/AGENTS.md` byte-equal to the pack template; vault productivity skill will call `deferred list/clear`.
Freeze: `tools/test/013-deferred-file.test.mjs` after the approved `test(red)` commit.

## Functional blocks
### B1 — deferred helper and rules (RF-1–RF-6, INV-1–5)
Tasks: T1–T3 · Depends on: none.
Done when: 013 tests, ratchet and full suite green.
Verify: `node --test tools/test/013-deferred-file.test.mjs`; full `tools/test`.
Reviewers: sdd-reviewer + security-reviewer.
- [ ] T1. Write `tools/test/013-deferred-file.test.mjs`; red; commit `test(red): 013 deferred work file`. [test · rigorkit]
- [ ] T2. `packs/core/scripts/deferred` and core README row. (RF-1–RF-5, INV-1–4) [script · rigorkit]
- [ ] T3. Rule in both AGENTS templates and `Deferred:` in sdd-archive, offsetting tokens in the sdd pack. (RF-6, INV-5) [skill · rigorkit]

Trace real dependencies; reuse valid evidence. No time-box/internal-task stops. Decisions/blockers/restricted checks→owner; [x] needs evidence, every commit approval. Final full spec/plan/diff/integration review; owner accepts each slice.
