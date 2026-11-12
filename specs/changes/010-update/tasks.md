# Tasks — 010-update (HU-2 Update check and `rigorkit update`)

## Resume state
Stage: verify · Approvals: owner chose one spec (answer 1), answers 2–3; owner delegated the remaining choices and asked to work autonomously until done (answer 4, 2026-11-12: authorizes the clarify rounds, plan, tasks, 010 tests in temporary folders and the 010 commits on this branch; no push or merge). Spec, plan, ratchet baseline and delegated choices are confirmed by the owner at acceptance.
Branch: feat/010-update · Scope owner: rigorkit only.
Next step: three independent reviews → one correction round → `validation.md` → owner acceptance. Red `12755a0`; amendments `aa1fce5`, `60ceb03`, `8cca976`, `7b61759` (harness and 008 command list only; no assertion weakened); feat `2d46609`; baseline `b350414`.
Review stations: sdd + architecture + security (critical DoD).
Freeze: `tools/test/010-*.test.mjs` and `tools/test/pty-run.py` after the `test(red)` commit.

## Functional blocks
### B1 — Global record and repository checks (RF-12, RF-18, RF-29, RF-34)
Done when: `install.sh --global` writes the record; `generate-man --check` checks the changelog and `update` options; `CHANGELOG.md`, `VERSION` 0.3.0, help and README in place.
- [x] T1. Write `tools/test/010-*.test.mjs` and `tools/test/pty-run.py` (all scenarios, manual ones marked `[manual]`); `tools/test/update-fixture.mjs` copies `lib` and `CHANGELOG.md` (the 008 fixture is frozen); scaffolding where red is structural; commit `test(red): HU-2 update check and update`.
- [x] T2. `install.sh` record (RF-18), `RK_RENDER_ROOT`, `RK_NO_RECORD`. (RF-18)
- [x] T3. `CHANGELOG.md`, `VERSION` 0.3.0, `help/update.txt`, `help/rigorkit.txt`, regenerated man, `generate-man --check` changelog and `update` options, README update section and 0.2.0 manual move. (RF-12, RF-29, RF-34)

### B2 — Check and notices (RF-1–RF-9, RF-31, RF-33)
Done when: shell start and interactive runs check, notify and ask per spec; editors' `-i -c` probes see nothing.
- [x] T4. `lib/check.sh`, `lib/notice.sh`, `lib/startup.sh`, `lib/startup-block.txt`; `bin/rigorkit` notice hook; `tools/install-remote.sh` block. (RF-1–RF-8, RF-31, RF-33)
- [x] T5. Notice line in the 9 entry skills. (RF-9)

### B3 — `rigorkit update` (RF-10–RF-17, RF-19–RF-28, RF-30, RF-32)
Done when: a test remote update moves the clone and asks each refresh question per spec.
- [x] T6. `lib/common.sh`, `lib/update.sh` phase 1 and phase 2; `bin/rigorkit` `update` arm.

### B4 — Close (NFR, critical DoD)
Evidence 2026-11-12 (macOS): `node --test tools/test/*.test.mjs` 426 tests, 423 pass, 0 fail, 2 todo (008); 010 files: check 48/48, update 105/105, install-record 18/18, repo-checks 11/11; `generate-man --check` PASS; scenario checker 195 scenarios PASS; content ratchet vs `specs/changes/010-update/baseline.txt` PASS (entry skills +30 tokens each, owner confirmation pending). Linux CI pending (push is the owner's).
- [x] T7. Full suite green, scenario checker, content ratchet with a new baseline `specs/changes/010-update/baseline.txt` (`AGENTS.md` path), constitution critical-path row for `lib/`.
- [ ] T8. Three independent reviews, one correction round, `validation.md`, manual items for the owner (RF-9 in Claude Code, live demo).
