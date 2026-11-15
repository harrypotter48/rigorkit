# Tasks — 021-terminal-colors
## Resume state
Stage: Build / implementation · Department/config: legacy SDD, no project config · Approvals: spec 021 approved 2026-11-14; help amendment and Design/B1 test preparation approved 2026-11-15. Owner explicitly approved test(red), the four-path freeze and B1 implementation on 2026-11-15.
Authorized blocks: B1 implementation · Current block: B1 · Current task: T2/T3 implementation; T1 red/trace and frozen-boundary approval evidenced.
Pending/blockers: owner-run green/regression/integrity/manual evidence and independent reviewers; no production blocker remains. Branch/base now confirmed in test-preparation.md.
Next step: record this approved red commit identity and implement T2–T4 while preserving the frozen test paths; owner runs validation commands.
Review stations: independent SDD + architecture + security profile approved with Design; none dispatched · Approval decision: needs human.
References: `spec.md` RF-1–RF-7/INV-1–INV-4 and owner answers 1–7; `clarification.md` round 3; `plan.md` D1–D9, Contracts, Test strategy and Risks; `specs/constitution.md` critical paths; repo learnings 006/010.
Dependencies checked: POSIX entry/notice, Bash installer/common/update/scan/doctor, final stdout/stderr consumers, script exec, release transition, staged installer logs, record/artifact/notice writers, current isolated fixture copy and TERM defaults. Recheck changed producers/consumers before Build; source paths do not bound impact.
Freeze: confirmed base a812f2eefce1765eca00f98e84fe2fa4e03aeec8; four proposed test paths in test-preparation.md. Owner-run suite: 34 tests, 17 pass/17 expected behavioral failures, zero skips; current path fingerprints in test-preparation.md. Red commit hash, scenario checker and frozen-boundary approval remain pending. Owner runs commands; builder preserves the approved frozen boundary.
Historical working state at Design start: branch `feat/020-readme-and-scan-speed`; `specs/roadmap.md` modified and `specs/changes/021-terminal-colors/` untracked from Understand. Existing 020 priority/status unchanged. Subsequent owner authorization created feat/021-terminal-colors from updated origin/main and committed only the separate 020 closure as a812f2e. No 021 commit, stash, push or merge is authorized.

## Functional blocks
### B1 — Semantic terminal colors without changing plain output (RF-1–RF-7)
Tasks: T1, T2, T3, T4, T5 · Depends on: approved spec and plan/tasks, resolved D9; then owner-confirmed test-red boundary before implementation.
Done when: the approved example and all CLI-owned output honor semantic colors and independent destinations; captures preserve their required bytes; invoked scripts remain untouched; scenario, critical regression, live-terminal and independent review evidence is current; owner accepts the complete slice.
Read: `spec.md` in full; `plan.md` Structure, Algorithms, Contracts, D1–D9, Test strategy and Risks; original source ranges in plan Current context; existing test suites by the relevant consumer. Keep original refs for reviewers, not paraphrases only.
Preserve: INV-1–INV-4; existing sanitizer, prompt/consent, dry-run safety, record/fingerprint formats, script precedence/exec/status, quiet startup probes and 020 scan behavior. No new command flags, dependency, persistent settings, artifact coloring or rule/skill prompt growth.
Verify: every RF scenario at its planned level; helper POSIX/Bash contracts; independent FD and exact-byte integration; owner-run project/global dry-runs and isolated installer/update regressions; related scan/registry/doctor tests; scenario/help/manual/frozen-test/trace checks where applicable; live prompt/example; accumulated diff reviewed across the whole block.
Reviewers: independent SDD reviewer, architecture reviewer and security reviewer; pending owner approval of the shared design/profile and applicable machine evidence before dispatch. No reviewers have run in Design.
- [x] T1. Prepare scenario tests and independent byte/PTY evidence first. (RF-1–RF-7) [test integration · rigorkit]
      Confirm implementation branch/base with the owner; no implicit move from the active 020 branch. Add change-specific suite/fixture/split-channel PTY harness; reuse existing runtime copies and PTY helper where sufficient. Capture deterministic pre-change references, including prompts and no-final-newline output. Keep shared legacy fixtures/tests unchanged. Owner runs red and supplies base/red identity/results. Obtain explicit frozen paths before T2/T3; absent or skipped PTY capability remains pending.
- [ ] T2. Add the silent POSIX terminal-presentation helper and safe display adapters. (RF-1–RF-5, RF-7) [CLI presentation · rigorkit]
      Depends on T1 freeze and approved D1–D5/D7. Preserve strict-shell status handling and exact-byte copy; reset every colored span. Keep `print_safe` and non-display helpers unchanged. Tests stay frozen.
- [ ] T3. Integrate every CLI-owned display producer end to end. (RF-1–RF-7) [CLI integration · rigorkit]
      Depends on T2. Cover entry/help/errors, installer, update questions/changelog/all diff sites, scan, doctor and CLI notices. Explicitly exclude script output, --shell notices and raw content/artifact writes. Verify staged logs and release/dry-run helper sourcing. Preserve the existing source-relative dispatch and two-phase update contracts.
- [ ] T4. Document terminal rules and regenerate the manual from its source. (RF-1, RF-2, RF-4, RF-6) [public docs · rigorkit]
      Follow owner-approved D9: append exactly one environment note to root help, preserve every pre-existing help byte and keep other help sources unchanged. RF-4.E2 verifies this bounded exception; no broader wording change is authorized. Update README, approved help source, affected core pack README and derived man page consistently; no website-generated source edits. State that PTY agents set NO_COLOR=1 and invoked scripts own their output. Owner runs any generator/check command; no version bump or publication is implied.
- [ ] T5. Collect integration, critical-path and live-terminal evidence, then request independent reviews and owner acceptance. (RF-1–RF-7) [Verify · rigorkit]
      Depends on T1–T4. Owner runs the scoped commands in plan Test strategy; record state/command/result and every pending item. Check the actual approved base/red/test boundary before reviewers; give reviewers original spec/plan/scenarios and the combined accumulated diff. Resolve introduced findings within authorized scope; return new choices or test amendments to the owner. No task is marked complete from an unrun check; owner accepts B1 separately from approving this design.

Trace real dependencies; reuse valid evidence. No helper-only acceptance or arbitrary internal-task approval stops. Required tests/build, frozen-boundary, Verify and owner-acceptance gates remain. Every commit requires explicit approval; never chain commits, push or merge.

## T1 preparation — 2026-11-15
- New suite, change-specific fixture, split-channel PTY harness and fixed source references are written; existing tests/shared fixtures and production code are unchanged.
- See `test-preparation.md` for source-level scenario mapping, proposed four-path freeze and exact owner-run commands. T1 remains unchecked until behavioral red, structural validity and owner-approved test boundary are evidenced.

## Red review — 2026-11-15
- Reviewed the owner-supplied log: 34 tests, 17 passing, 17 failing, zero skipped; 15 missing-color assertions and 2 missing-help-note assertions. Harness passed; no structural failures were reported.
- Result, log hash, unexecuted downstream assertions and proposed boundary hashes are recorded in `test-preparation.md`. T1 stays unchecked until its remaining checker/owner freeze gate is satisfied.

## Pre-freeze correction — 2026-11-15
- RF-5.H1 now preserves scan's observed existing space+newline prompt; assertColor diagnostics no longer dump complete transcripts. No frozen boundary or production code changed.
- Current test fingerprints are recorded in test-preparation.md; suite/checker rerun by owner remains pending before T1 completion or implementation.

## Current-revision red gate — 2026-11-15
- Owner-run suite reviewed: 34 tests, 17 pass, 17 expected behavioral failures, zero skips; no structural failures reported. Owner-reported strict scenario checker passed all 35 scenario rows.
- Four proposed source hashes still match test-preparation.md. Execution/checker requirements for the red gate are evidenced; T1 remains unchecked until the owner-approved commit/frozen boundary is recorded. No tests modified or production implementation started.

## Build authorization — 2026-11-15
- Owner authorized test(red), freezing the four exact paths/hashes in test-preparation.md and beginning B1 implementation autonomously. T1 is complete: current-revision red and strict scenario trace are evidenced; test boundary approved.
- This test(red) commit is the frozen red identity; resolve its hash in the next working-state update. No green commit, test amendment, push or merge is authorized.
