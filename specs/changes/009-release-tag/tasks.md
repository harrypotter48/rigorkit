# Tasks — 009-release-tag (HU-4 Release tag on merge)

## Resume state
Stage: design · Approvals: spec approved 2026-11-12 (round 3 ready; C3 → VERSION 0.2.0); plan + tasks approved 2026-11-12; owner asked to work autonomously until ready (authorizes running 009 tests and the 009 commits on this branch; no push/merge).
Branch: feat/009-release-tag · Scope owner: rigorkit only. Test runs in temp dirs authorized.
Next step: T1 tests first.
Review stations: sdd + architecture + security.
Freeze: `tools/test/009-release-tag.test.mjs` after the approved `test(red)` commit.

## Functional blocks
### B1 — CI publishes v<VERSION> on main (RF-1–RF-8, INV-1–3)
- [ ] T1. Write `tools/test/009-release-tag.test.mjs` (logic with local bare remote; static workflow checks); add scaffolding if red is structural (owner approval); propose `test(red): HU-4 release tag`; stop.
- [ ] T2. Implement `tools/release-tag.mjs` per plan algorithm. (RF-1, 3, 4, 6, 8; INV-1, 2)
- [ ] T3. Add `.github/workflows/release-tag.yml` per plan contracts. (RF-1, 2, 5, 7; INV-3)
- [ ] T4. `VERSION` 0.2.0; README version line + release process; AGENTS.md release note; constitution critical-path row. (NFR, C3)
- [ ] T5. Green run (009 + all suites, scenario checker, `pages.yml` unchanged); three independent reviews, one correction round; `validation.md`; manual/live items listed for the owner (ruleset before merge; v0.2.0 after merge; one-line install from it).
