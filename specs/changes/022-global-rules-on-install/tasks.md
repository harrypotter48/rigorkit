# Tasks — 022-global-rules-on-install
## Resume state
Stage: B1 (`c540f96`), B2 (`61dcf93`), B3 (`5d42a8a`) and B4 (`e510f2b`) committed; B5 verification in progress; frozen reds `90e62cb`, `8622db9`, `9587876`, amendments AMEND-2..4 (`1f63c4e`, `23f4e86`, `3024d58`) · Approvals: spec, plan, tasks, AMEND-1..4 and every frozen boundary approved by the owner on 2026-11-17.
Authorized blocks: none · Current block: none · Current task: none.
Pending/blockers: final review verdicts (SDD, architecture, security) and their corrections; `validation.md`, `dod-critical.md`, approver decision; owner live demo on a real terminal in a temporary home; owner acceptance; archive at the next story's branch · Next step: consolidate the final reviews, then ask the owner to accept.
Review stations: B1, B2, B3 (sdd, architecture, security each) and B4 (sdd) reviewed with findings applied; final whole-change reviews run 2026-11-17 · Approval decision: pending the approver.
References: `spec.md` (approved 2026-11-17), `plan.md`, `threat-model.md`, `clarification.md` (round 4 ready).
Dependencies checked: consumers of the global record (`lib/update.sh:298,382`, `lib/doctor.sh:67`, `lib/common.sh:41`), twins (`install.sh` / `tools/install-remote.sh` backup and resolve_link); recheck after any edit to the record or the twins.
Freeze: B1, B2 and B3 frozen, see `freeze.md` (hashes, red commits and amendments).

## Functional blocks
### B1 — Rules-only install from the CLI (RF-9, RF-10)
Tasks: T1, T2, T3 · Depends on: none.
Note: includes the broken-link refusal in `apply_rules` (RF-8.S1) and the `RULES_ONLY_SUPPORTED=1` capability line.
Done when: `install.sh --pack core --agent claude --global --rules-only` writes only the rules block with a backup and a `rules` record line and no `pair`, skill or agent; project or no scope is refused.
Read: spec RF-9, RF-10 and scenarios; plan "Algorithms" (rules-only), "Contracts"; `install.sh:285-372,466-488`.
Preserve: `--global` and `--project` installs byte-for-byte unchanged without the option; record format; `--dry-run` writes nothing.
Verify: RF-9.* and RF-10.* tests; existing 008 install, 010 record and 021 output suites.
Evidence: owner ran `node --test tools/test/022-rules-only.test.mjs tools/test/008-rigorkit-install.test.mjs tools/test/010-install-record.test.mjs` on 2026-11-17 and reported "Todo verde"; output not seen by the agent. The 017 and 021 suites and the man-page check were not reported.
Reviewers: sdd-reviewer, architecture-reviewer, security-reviewer.
- [x] T1. Tests first for RF-9.H1–S1, RF-10.E1–S1 and record shape. (RF-9, RF-10) [tests · rigorkit]
- [x] T2. Add the option, the scope refusal and the per-pack skips. (RF-9, RF-10) [installer · rigorkit]
- [x] T3. Record only `rules` lines for rules-only entries. (RF-9) [installer · rigorkit]

### B2 — Update refreshes rules-only entries (RF-11)
Tasks: T4, T5, T5b · Depends on: B1.
Done when: after a rules-only install and a newer release with changed rules, `rigorkit update` offers the block with its diff, replaces it on yes, and copies no skill or agent; an edited block is offered, never replaced silently; `--uninstall-rules` removes only the block.
Read: spec RF-11 and AMEND-1; plan "Algorithms" (staging), R1; `lib/update.sh:292-313,376-410`.
Preserve: refresh of paired packs, project refresh (017), the dry-run staging contract.
Verify: RF-11.* tests; existing 010/017 update suites; a record with only rules-only entries.
Reviewers: sdd-reviewer, architecture-reviewer, security-reviewer.
- [x] T4. Tests first (red observed: H1 and F1 fail, E1/E2/S1 pass by reuse) for RF-11.H1–S1 with AMEND-1 wording. (RF-11) [tests · rigorkit]
- [x] T5. Skip the empty pack name in the staging loop first, with its own test that a record with only rules-only entries updates cleanly. (RF-11) [updater · rigorkit]
- [x] T5b. Add `rules_only_entries` to `lib/common.sh`, stage rules-only entries with the option and accept them in the rules-refresh loop. (RF-11) [updater · rigorkit]

### B3 — One-line installer offers the global rules (RF-1…RF-8, RF-12…RF-15)
Tasks: T6, T7, T8, T9 · Depends on: B1.
Done when: the acceptance flow of the spec works in a temporary home on a terminal; every other state follows RF-14's order; no clone code runs without an affirmative answer (V1).
Read: spec RF-1…RF-8, RF-12…RF-15, answers 1–21, definitions; threat model T1–T10, V1–V9; plan "Algorithms" (`offer_rules`); `tools/install-remote.sh:34-64,258-306`.
Preserve: clone, validation, modes, startup blocks, refusals and exit status of every current path; the twins; INV-4.
Verify: scenario tests of every RF, V1–V9 checks, existing 008 remote and startup suites.
Reviewers: sdd-reviewer, architecture-reviewer, security-reviewer.
- [x] T6. Tests first for the question flow, no-terminal, opt-out, detection and classification states (RF-1…RF-8). (RF-1…RF-8) [tests · rigorkit]
- [x] T7. Tests first for RF-12…RF-15, the twin equality test and the security checks V1–V12 (pseudoterminal for the question scenarios); amend 008 RF-1.H1 with a cited `test(amend)`. (RF-12…RF-15) [tests · rigorkit]
- [x] T8. Implement `offer_rules` and its helpers (detect, classify, sanitize, `safe_clone`, `safe_target`, `env -i` run, question content). (RF-1…RF-8) [installer · rigorkit]
- [x] T9. Wire both paths, the later command and RF-12…RF-15 order; replace the old closing suggestion. (RF-12…RF-15) [installer · rigorkit]

### B4 — Documentation and changelog (principle 9)
Tasks: T10 · Depends on: B1, B2, B3.
Done when: README quick start, `help/install.txt`, pack README, CHANGELOG section (`Global rules: unchanged`, `New packs: none`) and the CLI output baseline describe the offer, `RIGORKIT_NO_RULES` and `--rules-only`; `node tools/generate-man.mjs --check` passes.
Read: constitution principle 9; installer capability RF-6, RF-13; plan "Structure".
Preserve: help text outside the new option byte-equal (021 INV-1).
Verify: `generate-man.mjs --check`, byte comparison of untouched help text, manual read of README quick start.
Reviewers: sdd-reviewer.
- [x] T10. (docs written; `generate-man.mjs --check` PASS run by the agent; sdd review applied) Update docs, regenerate the manual page and the baseline. (RF-1, RF-4, RF-9) [docs · rigorkit]

### B5 — Close
Tasks: T11 · Depends on: B1–B4.
Done when: full verification with the critical DoD (temp-home install, dry-runs, marker byte-safety, isolated update), live demo in a temporary home on a terminal, independent reviews and owner acceptance; capability installer RF-1/RF-2/RF-3 updated at archive; roadmap HU-16 done.
Verify: `sdd-verify`, review station, approver decision.
Reviewers: sdd-reviewer, architecture-reviewer, security-reviewer.
- [ ] T11. Verify, review and archive. At archive, update the installer capability: RF-1 (offers the rules after the clone, closing suggestion), RF-2 (an existing clone also gets the offer), RF-3 (`--rules-only`, `apply_rules` refusing a broken link, a folder or another non-regular destination in every scope), RF-6 (help and man), RF-10 (`rigorkit update` refreshes rules-only entries and skips an empty pack name) and the Global record definition (`rules` lines without a `pair` line are rules-only entries). (all) [verify · rigorkit]

Trace real dependencies; reuse valid evidence. No time-box/internal-task stops. Decisions/blockers/restricted checks→owner; [x] needs evidence, every commit approval. Final full spec/plan/diff/integration review; owner accepts each slice. The owner runs install, build and test commands.
