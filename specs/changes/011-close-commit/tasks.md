# Tasks — 011-close-commit (HU-5 Close commit on archive)
## Resume state
Stage: tests · Approvals: triage 2026-11-12; owner asked to continue autonomously (spec answers 3–5 delegated, reversible).
Authorized blocks: B1 · Current block: B1 · Current task: T1.
Pending/blockers: owner runs the red and commits `test(red): 011 close commit`; agents do not run tests or commit (owner rule).
Next step: owner red run + commit → T2–T4.
Review stations: sdd-reviewer + architecture-reviewer (pending).
References: spec.md; `packs/sdd/skills/sdd-archive/SKILL.md:10`; `packs/sdd/skills/sdd-init/templates/AGENTS.md:15`; `factory-checks.mjs:56,59,72`; `AGENTS.md:67`.
Dependencies checked: `specs/templates/AGENTS.md` byte-equal to the pack template; no test parses the archive commit.
Freeze: `tools/test/011-close-commit.test.mjs` after the approved `test(red)` commit.

## Functional blocks
### B1 — Written convention and close commit (RF-1–RF-5, INV-1–2)
Tasks: T1–T4 · Depends on: none.
Done when: 011 tests and content ratchet green.
Read: spec.md; the four reference lines above.
Preserve: `test(red):`/`test(amend):` prefixes; sdd pack loaded tokens ≤ 010 baseline.
Verify: `node --test tools/test/011-close-commit.test.mjs`; `node --test tools/test/factory-cli.test.mjs`; measure-content against 010 baseline.
Reviewers: sdd-reviewer + architecture-reviewer.
- [x] T1. Write `tools/test/011-close-commit.test.mjs`; owner runs red and commits `test(red): 011 close commit`. (RF-1–RF-5, INV-1–2) [test · rigorkit]
- [ ] T2. Add the commit convention to `packs/sdd/skills/sdd-init/templates/AGENTS.md:15` and copy to `specs/templates/AGENTS.md`. (RF-1–RF-3) [template · rigorkit]
- [ ] T3. Replace "Propose commit and stop." in `sdd-archive/SKILL.md:10` with the `[close]` proposal. (RF-4, RF-5) [skill · rigorkit]
- [ ] T4. Offset added characters inside the sdd pack without changing behavior until the ratchet is green. (INV-2) [skill · rigorkit]

Trace real dependencies; reuse valid evidence. No time-box/internal-task stops. Decisions/blockers/restricted checks→owner; [x] needs evidence, every commit approval. Final full spec/plan/diff and integration review; owner accepts each slice.
