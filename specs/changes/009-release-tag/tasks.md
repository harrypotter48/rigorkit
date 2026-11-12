# Tasks — 009-release-tag (HU-4 Release tag on merge)

## Resume state
Stage: design · Approvals: spec approved 2026-11-12 (round 3 ready; C3 → VERSION 0.2.0); plan + tasks approved 2026-11-12; owner asked to work autonomously until ready (authorizes running 009 tests and the 009 commits on this branch; no push/merge).
Branch: feat/009-release-tag · Scope owner: rigorkit only. Test runs in temp dirs authorized.
Next step: owner decision on security M1/M2 (validation.md), then acceptance after the live release. Red `2043468` (frozen: `tools/test/009-release-tag.test.mjs`).
Review stations: sdd + architecture + security.
Freeze: `tools/test/009-release-tag.test.mjs` after the approved `test(red)` commit.

## Functional blocks
### B1 — CI publishes v<VERSION> on main (RF-1–RF-8, INV-1–3)
- [x] T1. Write `tools/test/009-release-tag.test.mjs` (logic with local bare remote; static workflow checks); add scaffolding if red is structural (owner approval); propose `test(red): HU-4 release tag`; stop.
- [x] T2. Implement `tools/release-tag.mjs` per plan algorithm. (RF-1, 3, 4, 6, 8; INV-1, 2)
- [x] T3. Add `.github/workflows/release-tag.yml` per plan contracts. (RF-1, 2, 5, 7; INV-3)
- [x] T4. `VERSION` 0.2.0; README version line + release process; AGENTS.md release note; constitution critical-path row. (NFR, C3)
      Evidence 2026-11-12: `node --test tools/test/*.test.mjs` 243 tests, 241 pass, 0 fail, 2 todo; 009 file 25/25; scenario checker 34 (4 manual); `pages.yml` unchanged vs main; workflow parses as YAML (site `yaml`); `site` `npm run test:unit` 15/15; `generate-man --check` PASS. Implementation note: the frozen RF-1.S1 check looks for the script name in the lines before the secret, so the step lists `run:` before `env:`.
- [x] T5. Green run (009 + all suites, scenario checker, `pages.yml` unchanged); three independent reviews, one correction round; `validation.md`; manual/live items listed for the owner (ruleset before merge; v0.2.0 after merge; one-line install from it).
