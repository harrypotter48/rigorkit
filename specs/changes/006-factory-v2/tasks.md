# Tasks — 006-factory-v2

## Resume state
Stage: spec and plan drafted, neither approved · Approvals: pending.
Authorized blocks: pending · Current block: none · Current task: none.
Pending/blockers: the owner must approve the spec and the plan; the three open questions of the spec are validation items of the first adoption and do not block the implementation · Next step: owner review of `specs/changes/006-factory-v2/spec.md` and `plan.md`.
Review stations: not launched · Approval decision: pending.
References: spec RF-1 to RF-18 with their 72 scenarios; plan decisions, contracts, data model and test strategy; vault note "Factory v2 - vertical slices, backlog en git and frozen tests" of 2026-10-26.
Dependencies checked: `packs/sdd/skills/` (16 skills), `packs/sdd/agents/` (4 agents), `specs/templates/` (13 templates), `tools/` (2 scripts) and `tools/test/` (3 test files) at revision `b3cfc8e`; the site copies the pack documentation through `site/scripts/prepare-docs.mjs`; edit any affected entry after the changes land.

## Functional blocks
### B1 — A backlog of vertical slices in git and a short contract per story (RF-1, RF-2, RF-3)
Tasks: T1, T2, T3 · Depends on: none; the slicing stage writes the backlog that the other stages read.
Done when: the owner states an intent, the pack proposes the vertical slices in `specs/backlog.md` with the fields of an entry, the index stays flat with one `next` and one `wip`, and a selected story becomes a change whose spec holds acceptance and invariants.
Read: spec RF-1 to RF-3 with their scenarios; plan data model and contracts; `packs/sdd/skills/sdd-triage/SKILL.md`, `specs/templates/spec.md`, `specs/templates/constitution.md`.
Preserve: the language and the structure of the existing skills and templates; the member naming rule; the decision that the backlog is only the index and the changes keep living in `specs/changes/`.
Verify: RF-1, RF-2, RF-3 manual scenarios with a real intent; the scenario checker; the content measurement of the pack.
Reviewers: sdd-reviewer and architecture-reviewer, launched together after the builder.

- [ ] T1. Write `specs/templates/backlog.md` with the header, the table of the entries and the status values, following the structure of the existing templates. (RF-1) [specs/templates · rigorkit]
- [ ] T2. Write `packs/sdd/skills/sdd-slice/SKILL.md` as the entry stage: it proposes the vertical slices from an intent, keeps the flat index with the owner priority, refuses a second story in `wip` and links the change of a selected story. (RF-2, RF-3) [packs/sdd/skills · rigorkit]
- [ ] T3. Extend `specs/templates/spec.md` with the acceptance and the invariants sections and the tier in the header, and reference the backlog entry that opened the change. (RF-3) [specs/templates · rigorkit]

### B2 — The tests are frozen in red and the implementation cannot touch them (RF-4, RF-5, RF-6, RF-7, RF-17)
Tasks: T4, T5, T6 · Depends on: none; the build stage reads the red commit written by the tests stage.
Done when: the tests of a story are written next to their source and committed with `test(red):`, the freeze happens at the behavioral red, the implementation commits with `test(green):` without touching a test path, a wrong frozen test stops the build with a proposed amendment, and the agent runs the unit tests of the affected module to obtain the green evidence.
Read: spec RF-4 to RF-7 and RF-17 with their scenarios; plan contracts and decisions; `packs/sdd/skills/sdd-tests/SKILL.md`, `packs/sdd/skills/sdd-implement/SKILL.md`, `packs/sdd/agents/sdd-builder.md`.
Preserve: the rule that the tests stage implements nothing; the rule that the builder never claims green tests; the footer that keeps install, build, lint, typecheck, migrations, seeds and deploy with the owner; the block and task discipline of the stages.
Verify: RF-4 to RF-7 and RF-17 manual scenarios; the unit-test run of the affected module in the build loop; the content measurement of the pack.
Reviewers: sdd-reviewer and architecture-reviewer, launched together after the builder.

- [ ] T4. Rewrite the tests stage so that it writes the failing tests next to their source, commits them with `test(red):`, reports a structural red as structural and freezes the behavioral red, and observes the intended red by running the unit tests of the affected module. (RF-4, RF-5, RF-17) [packs/sdd/skills · rigorkit]
- [ ] T5. Extend the build stage with the `test(green):` convention, the rule that no test path may change outside a `test(amend):` commit that cites the amendment of the specification, the rule that a doubt becomes an open question instead of code, and the unit-test run that produces the green evidence. (RF-6, RF-7, RF-15, RF-16, RF-17) [packs/sdd/skills · rigorkit]
- [ ] T6. Extend the builder agent so that it never edits a test path, implements only the behavior covered by a scenario or required by an invariant, records a doubt as an open question and reports the unit-test result instead of claiming green. (RF-6, RF-15, RF-16, RF-17) [packs/sdd/agents · rigorkit]

### B3 — The machine checks run before the reviewers (RF-8, RF-9, RF-10)
Tasks: T7, T8, T9, T10, T11, T12 · Depends on: B2 for the red commit that the frozen-test check reads.
Done when: the frozen-test check reads the test paths of the constitution and fails on an unamended modification, the branch-trace check reports the added branch points without a scenario or invariant reference, and the check stage runs both before launching any reviewer.
Read: spec RF-8 to RF-10 with their scenarios; plan algorithms, data model and test strategy; `tools/measure-content.mjs`, `tools/capture-baseline.mjs`, `tools/test/`, `specs/templates/constitution.md`.
Preserve: the dependency-free style and the CLI shape of the existing tools; the identity and limit checks of the content measurement; the rule that the tools never write to the repository.
Verify: the unit tests of both tools; RF-8 and RF-9 executable scenarios; the content measurement of the pack.
Reviewers: sdd-reviewer and architecture-reviewer, launched together after the builder.

- [ ] T7. Write `tools/check-frozen-tests.mjs` with the algorithm of the plan: read the test paths of the constitution, find the last `test(red):` commit, report the test paths changed after it and fail on the ones without a `test(amend):` commit. (RF-8) [tools · rigorkit]
- [ ] T8. Write `tools/test/check-frozen-tests.test.mjs` with the four cases of the plan and the scenario ids of RF-8. (RF-8) [tools/test · rigorkit]
- [ ] T9. Write `tools/check-branch-trace.mjs` with the algorithm of the plan: report the branch points added by the change whose hunk carries no scenario or invariant reference. (RF-9) [tools · rigorkit]
- [ ] T10. Write `tools/test/check-branch-trace.test.mjs` with the three fixtures of the plan and the scenario ids of RF-9. (RF-9) [tools/test · rigorkit]
- [ ] T11. Extend `specs/templates/constitution.md` with the test paths and the review thresholds sections, with the default of 150 lines, and with the instruction that the repository declares its own patterns. (RF-8, RF-12) [specs/templates · rigorkit]
- [ ] T12. Make the build stage and the verification stage run the frozen-test check and the branch-trace check before launching the reviewers, and stop the station while a machine check fails. (RF-10) [packs/sdd/skills · rigorkit]

### B4 — The ceremony scales with the tier and the profile keeps its lenses (RF-11, RF-12, RF-13, RF-14)
Tasks: T13, T14 · Depends on: B1 for the tier of the change, B3 for the machine checks.
Done when: the triage stage classifies the change as trivial, story or feature and computes the review profile with the threshold, the critical path and the new module as triggers, the reviewers keep running together with a fresh context and no report of the others, the judge aggregates without closing, and the validation records the verifications that did not run.
Read: spec RF-11 to RF-14 with their scenarios; plan decisions and contracts; `packs/sdd/skills/sdd-triage/SKILL.md`, `packs/sdd/skills/sdd-verify/SKILL.md`, `packs/sdd/agents/sdd-approver.md`, `packs/sdd/README.md`.
Preserve: the parallel launch with a fresh context and the single re-review of the corrections; the rule that the user alone closes the change; the existing specialist triggers for the frontend, security and design reviewers.
Verify: RF-11 to RF-14 manual scenarios; the content measurement of the pack.
Reviewers: sdd-reviewer and architecture-reviewer, launched together after the builder.

- [ ] T13. Extend the triage stage with the tier classification and the tier-aware review profile: the base profile with the two lenses, the quality and architecture reviewer when the diff exceeds the threshold of the constitution, touches a critical path or creates a module or layer, and the specialist triggers that already exist. (RF-12, RF-14) [packs/sdd/skills · rigorkit]
- [ ] T14. Extend the verification stage with the tier-aware verification set, the record of the verifications that did not run and the unit-test run of the affected module, keeping the container, browser and end-to-end suites on request. (RF-13, RF-14, RF-17) [packs/sdd/skills · rigorkit]

### B5 — The documentation describes the factory that exists (RF-18)
Tasks: T15, T16, T17, T18 · Depends on: B1 to B4.
Done when: the pack README, the root AGENTS.md and the regenerated site describe the commit conventions, the tier table, the completion criteria of a story and the split of commands between the agent and the owner, and the content measurement of the pack stays inside the ratchet or a new baseline is proposed to the owner.
Read: spec RF-18 with its scenarios; plan contracts; `packs/sdd/README.md`, `AGENTS.md`, `README.md`, `site/src/content/docs/`.
Preserve: the structure and the language of the public documentation; the ratchet command of change 005; the version and the framing of the site.
Verify: the site checks; the content measurement with the ratchet baseline; the manual scenarios of RF-18.
Reviewers: sdd-reviewer and architecture-reviewer, launched together after the builder.

- [ ] T15. Rewrite the review stations section and add the new stages of `packs/sdd/README.md` with the commit conventions, the tier table and the command split. (RF-18) [packs/sdd · rigorkit]
- [ ] T16. Extend the root `AGENTS.md` with the factory v2 flow, the frozen tests and the new checks, keeping the ratchet section as it is. (RF-18) [docs · rigorkit]
- [ ] T17. Regenerate the documentation of the site and update the copy of the site that describes the flow, leaving the version and the framing untouched. (RF-18) [site · rigorkit]
- [ ] T18. Measure the pack after the implementation with `node tools/measure-content.mjs --root . --baseline specs/archive/005-content-ratchet/baseline.txt` and, when the ratchet is red, propose the new baseline to the owner with `node tools/capture-baseline.mjs --source <commit> --output <file> --target 0`. (RF-18) [tools · rigorkit]

References guide reading; trace actual dependencies beyond initial paths. Reuse unchanged evidence, recheck affected refs after edits.
No arbitrary time limit. Continue internal tasks within authorized block; stop for decisions/blockers/user-run checks and block review.
Mark `[x]` only with sufficient verification/review evidence; implemented without evidence stays pending. Every commit needs explicit approval.
Whole-change verification still checks full spec/plan/accumulated diff and cross-block integration.
Review station: launch the enabled reviewers together after the builder, re-review their corrections together once, and escalate to the owner when a reviewer's corrections are exhausted.
