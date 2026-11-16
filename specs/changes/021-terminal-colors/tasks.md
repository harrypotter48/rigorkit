# Tasks — 021-terminal-colors
## Resume state
Stage: B1 accepted · Department/config: legacy SDD, no project config · Approvals: owner accepted B1 and explicitly authorized this test(green) commit on 2026-11-16.
Authorized blocks: B1 accepted · Current block: B1 · Current task: all T1–T5 complete; create the owner-authorized test(green) commit containing this acceptance record.
Pending/blockers: none for B1 acceptance. Archive/close, further commits, push, merge and publication require their own authority; they are not part of this green commit.
Next step: report the resulting green commit identity; no automatic archive, next slice, push or merge.
Review stations: SDD/architecture/security no findings; delivery recommendation approved · Approval decision: owner accepted B1 on 2026-11-16.
References: `spec.md` RF-1–RF-7/INV-1–INV-4 and owner answers 1–7; `clarification.md` round 3; `plan.md` D1–D9, Contracts, Test strategy and Risks; `specs/constitution.md` critical paths; repo learnings 006/010.
Dependencies checked: POSIX entry/notice, Bash installer/common/update/scan/doctor, final stdout/stderr consumers, script exec, release transition, staged installer logs, record/artifact/notice writers, current isolated fixture copy and TERM defaults. Recheck changed producers/consumers before Build; source paths do not bound impact.
Freeze: base a812f2eefce1765eca00f98e84fe2fa4e03aeec8; original red 8d29670e69b88ffbbb91f72ce4a85fa5c8c84b17; fixture AMEND-1 pin 77fe85573bb795cf8f2a63da0572acd5da1d339c; other three paths remain pinned to red. Exact hashes/index/worktree equality and comment-only equivalence in freeze.md.
Historical Design branch was feat/020-readme-and-scan-speed. Current branch feat/021-terminal-colors contains separate authorized 020 close a812f2e and approved 021 test(red) 8d29670. Production working changes remain uncommitted; no green commit, push or merge authorized.

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
- [x] T2. Add the silent POSIX terminal-presentation helper and safe display adapters. (RF-1–RF-5, RF-7) [CLI presentation · rigorkit]
      Depends on T1 freeze and approved D1–D5/D7. Preserve strict-shell status handling and exact-byte copy; reset every colored span. Keep `print_safe` and non-display helpers unchanged. Tests stay frozen.
- [x] T3. Integrate every CLI-owned display producer end to end. (RF-1–RF-7) [CLI integration · rigorkit]
      Depends on T2. Cover entry/help/errors, installer, update questions/changelog/all diff sites, scan, doctor and CLI notices. Explicitly exclude script output, --shell notices and raw content/artifact writes. Verify staged logs and release/dry-run helper sourcing. Preserve the existing source-relative dispatch and two-phase update contracts.
- [x] T4. Document terminal rules and regenerate the manual from its source. (RF-1, RF-2, RF-4, RF-6) [public docs · rigorkit]
      Follow owner-approved D9: append exactly one environment note to root help, preserve every pre-existing help byte and keep other help sources unchanged. RF-4.E2 verifies this bounded exception; no broader wording change is authorized. Update README, approved help source, affected core pack README and derived man page consistently; no website-generated source edits. State that PTY agents set NO_COLOR=1 and invoked scripts own their output. Owner runs any generator/check command; no version bump or publication is implied.
- [x] T5. Collect integration, critical-path and live-terminal evidence, then request independent reviews and owner acceptance. (RF-1–RF-7) [Verify · rigorkit]
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

## Implementation handoff — 2026-11-15
- Approved test(red) resolved to 8d29670e69b88ffbbb91f72ce4a85fa5c8c84b17; the four paths are frozen and exact byte equality verified in freeze.md.
- T2/T3 implementation and T4 source docs are written. They remain unchecked until their required behavioral/integration evidence is current; manual generation stays owner-run.
- Owner approved exact four-file comparison as the scoped integrity exception for missing Test paths in the red constitution. Branch trace and all other checks are still required.
- See implementation-validation.md for RF/consumer coverage, source review, current pending evidence and immediate commands. No tests/generator executed by agent and no independent review claimed.

## First implementation validation and corrections — 2026-11-15
- Owner suite reviewed: 32/34 pass, two failures (RF-2.E2 unset TERM and RF-3.E2 direct update --help). Both addressed in production; frozen tests unchanged.
- Current-revision suite rerun pending. Manual is generated in worktree; trace/manual checker results await owner confirmation. Full details and log hash are in implementation-validation.md.

## Scoped green — 2026-11-16
- Current owner-run suite: 34/34 passing, no failures/skips; the two production corrections pass. Exact frozen red/index/worktree equality rechecked. T2/T3 have current scoped integration evidence.
- T4 remains pending manual drift success; T5 remains pending critical/legacy regression, branch trace, live terminal cases and independent reviews. See implementation-validation.md and dod-critical.md. No green commit or final acceptance yet.

## Global-check review — 2026-11-16
- Full owner-run suite: 620 pass/0 fail/2 TODO (622 total); manual/repository checker PASS.
- Branch-trace FAIL: 12 fixture locations reported twice, missing scenario/INV citation in its added hunk. No runtime assertion failure.
- AMEND-1 two-line comment-only proposal prepared in amendment-proposal.md; owner approval of frozen edit and separate test(amend) commit pending. Required independent reviews have not started while trace is failing.

## AMEND-1 committed — 2026-11-16
- Owner-approved two-comment trace correction committed separately as 77fe855; no production or executable test changes included. Updated frozen pins and equivalence verified. Branch-trace rerun pending; reviewers remain undispatched until its result.

## Current review/live completion — 2026-11-16
- Three independent reviewers returned no findings; their scope and evidence are preserved in review-reports.md.
- Owner ran the isolated live-preview in a terminal and confirmed both RF-3.E3 and RF-5.E2. Current production hashes still match the reviewed manifest.
- See validation.md for complete scenario/critical evidence. Earlier pending review/live labels in historical entries are superseded by this current resume state; no owner acceptance or green commit approval inferred.

## Independent delivery recommendation — 2026-11-16
- /root/approve_021 recommends approved based on current original evidence and three independent verdicts. See approval.md.
- Required verification work is complete; T5 owner acceptance and the separate green commit are not inferred. No product source changed after reviewed/green state.

## Owner acceptance and green commit — 2026-11-16
- Owner: "si dale, acepto B1 y autorizo el commit test(green) de 021". All B1 tasks are accepted with evidence in validation.md, review-reports.md and approval.md.
- Green identity: the owner-authorized test(green) commit containing this record; its hash is reported after creation. No source changes since the validated/reviewed manifest and no frozen test changes.
- Archive/close, another commit, push, merge or release was not requested and is not performed by this acceptance.
