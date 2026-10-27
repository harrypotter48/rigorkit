# Tasks — 004-factory-lanes
## Resume state
Stage: spec/plan/tasks drafted · Approvals: design decisions approved by the user; spec, plan and block approval pending.
Authorized blocks: none · Current block: none · Current task: user review of spec.md and plan.md.
Pending/blockers: three open questions in spec.md (installer cleanup of renamed members, baseline recapture timing, test-writing agent timing) plus the sdd loaded-token reduction gate, already failing on main and now at 11.71% (14530 against a 11519 limit); no commit, push or merge authorized.
Next step: user approves the spec, then the plan and blocks; implementation starts only after that approval.
References: spec.md RF-1–RF-16; plan.md decisions and risks; the branch diff is the current source evidence.
Dependencies checked: root governance → packs (architecture, sdd, frontend) → init templates → content measurement tool → site tests and installer; changed source requires reinstall by the user.
## Functional blocks
### B1 — Pack-name identity and role enforcement (RF-1, RF-2)
Tasks: T1–T3 · Depends on: none.
Done when: every member carries its pack name, the architecture members are renamed at all call sites, and the content check reports prefix and role violations.
Read: spec.md RF-1, RF-2; plan.md contracts; AGENTS.md identity and role rules; the current architecture pack and its callers.
Preserve: skill and agent identities outside the rename, English aliases, install paths, the 300-character description limit and the existing content checks.
Verify: RF-1.H1–RF-2.S1 manual scenarios; content measurement tool run by the user.
- [ ] T1. Rename the architecture pack members and update every active caller and public text. (RF-1) [instructions · rigorkit]
- [ ] T2. State the pack-name prefix rule and the top 1% role rule in the root governance and README. (RF-1, RF-2) [instructions · rigorkit]
- [ ] T3. Extend the content measurement tool to report prefix mismatches and missing agent roles. (RF-2) [tooling · rigorkit]
### B2 — Design lane (RF-3–RF-7)
Tasks: T4–T6 · Depends on: none.
Done when: the design pack offers a UX flow reference, a UI criteria reference and an advisory UI reviewer whose findings separate defects from improvements, whose simulated results are labeled, whose accessibility default is AA with project override, and whose captures are defined for the human to produce.
Read: spec.md RF-3–RF-7; plan.md decisions; the frontend pack reviewer conventions as the report shape.
Preserve: optional-pack behavior, soft dependencies by name, user-run commands, no third-party service and no copied agent.
Verify: RF-3.H1–RF-7.S1 manual scenarios; content check for the new members.
- [ ] T4. Write the UX flow reference with journeys, friction and the simulated-result label. (RF-3, RF-5) [knowledge · rigorkit]
- [ ] T5. Write the UI criteria reference with hierarchy, states, responsive behavior, the accessibility level rule and the capture checklist. (RF-4, RF-6, RF-7) [knowledge · rigorkit]
- [ ] T6. Write the UI reviewer agent with the shared report contract, the defect and improvement classification and the advisory blocking rule. (RF-4, RF-14) [agent · rigorkit]
### B3 — Security lane (RF-8, RF-9)
Tasks: T7–T8 · Depends on: none.
Done when: the security pack offers a threat modeling reference and a security reviewer, and a change touching sensitive paths carries the security reviewer in its review profile with a threat model before the plan when a new trust boundary or data flow appears.
Read: spec.md RF-8, RF-9; plan.md decisions; the existing reviewer report shape and severity scale.
Preserve: no copied agent, no third-party tool or policy, no secret values, and the existing severity vocabulary.
Verify: RF-8.H1–RF-9.S1 manual scenarios; content check for the new members.
- [ ] T7. Write the threat modeling and secure code reference with trust boundaries and verifiable requirements. (RF-8, RF-9) [knowledge · rigorkit]
- [ ] T8. Write the security reviewer agent with the shared report contract and exploitable-versus-hardening severity. (RF-9, RF-14) [agent · rigorkit]
### B4 — Factory stations inside SDD (RF-10–RF-16)
Tasks: T9–T12 · Depends on: B1 for the renamed caller names.
Done when: triage proposes a review profile, the enabled reviewers launch together after the builder with independent inputs, implement and verify call them with their evidence, the approver reports one decision after every reviewer reported and never closes, the builder implements one approved block from a fresh context, corrections are re-reviewed together once before escalation, and the station and accepted-item state is recorded with stable identifiers.
Read: spec.md RF-10–RF-16; plan.md algorithms and contracts; the current triage, implement, verify, tasks, archive and half-wired sources.
Preserve: the existing human gates, user-run commands, block boundaries, `HW-NN` semantics, verdict vocabularies and the SDD pause points.
Verify: RF-10.H1–RF-16.S1 manual scenarios; whole-change review at the end of the change.
- [ ] T9. Add the review profile to triage and to the constitution override. (RF-10) [instructions · rigorkit]
- [ ] T10. Launch the enabled reviewers together after the builder with independent inputs, wire their evidence into implement and verify, and the threat model into the plan path. (RF-9, RF-14, RF-15) [instructions · rigorkit]
- [ ] T11. Write the approver agent, which runs after every reviewer reported, and the builder agent, with their roles, gates and stops. (RF-11, RF-12) [agent · rigorkit]
- [ ] T12. Record station and reviewer state and accepted items in the tasks and half-wired templates, with corrections re-reviewed together once before escalation. (RF-13, RF-16) [instructions · rigorkit]
### B5 — Publication and evidence (RF-1, RF-3, RF-8)
Tasks: T13–T15 · Depends on: B1, B2, B3, B4.
Done when: the published pack table, the site pack list and the pack READMEs describe the new lanes, the measurement baseline is recaptured from the committed change, and the user-run checks are supplied with their output pending.
Read: spec.md completion criteria; plan.md test strategy; the root README pack table, the site maintenance notes and the measurement tool baseline flow.
Preserve: generated site content, the documented publication gate and the rule that the agent does not run the checks.
Verify: RF-1.H1, RF-3.H1, RF-8.H1 manual scenarios; user-run content, scenario, website and installer checks.
- [ ] T13. Publish the new packs and the renamed members in the root README and the pack READMEs. (RF-1, RF-3, RF-8) [documentation · rigorkit]
- [ ] T14. Update the site pack list and verify that the published docs regenerate from the pack sources. (RF-1, RF-3, RF-8) [documentation · rigorkit]
- [ ] T15. Supply the user-run verification commands and the baseline recapture step, and record their output as pending. (RF-1, RF-2) [validation · rigorkit]
All source edits are pending implementation; tasks remain unchecked. No completion, green check, savings or live result is inferred from written instructions.
