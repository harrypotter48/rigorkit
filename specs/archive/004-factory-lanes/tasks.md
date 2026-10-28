# Tasks — 004-factory-lanes
## Resume state
Stage: ARCHIVED on 2026-10-26 by explicit user acceptance; RF-1–RF-16 in commit `88fd948` and RF-17–RF-24 in `23d193a`; user-run checks reported passing on 2026-10-26; the live station scenarios stay pending.
Evidence 2026-10-26: the user ran the website checks (`npm --prefix site run check`, `test:unit`, `test:browser`, `check:site`) and `node --test tools/test/*.test.mjs`, and reported every test passing and the generated site correct. The content measurement on the real repository still reports the identity changes and the sdd reduction gate, and the baseline recapture step is still pending.
Approvals: design decisions approved by the user, including the six amendment answers (factory framing, README scope, VERSION file, installed marker, manual semver from 0.1.0, unchanged name); spec, plan and block approval for B6 and B7 pending.
Authorized blocks: none · Current block: none · Current task: user review of the amended spec.md and plan.md and the B6/B7 diff.
Pending/blockers: four open questions in spec.md (installer cleanup of renamed members, baseline recapture timing, test-writing agent timing, sdd loaded-token reduction gate) plus the decision on whether projects commit `.rigorkit-version`; the DoD level is critical because `install.sh` is a constitutional critical path, so the evidence needs project and global dry-runs plus a real installation in a temporary folder.
Next step: user approves the amended spec and the B6 and B7 blocks; implementation starts only after that approval.
References: spec.md RF-1–RF-24 and clarification rounds 1–3; plan.md decisions and risks; commit `88fd948` is the source evidence for RF-1–RF-16.
Dependencies checked: root governance → packs (architecture, sdd, frontend) → init templates → content measurement tool → site tests and installer; the amendment adds the public documentation and the version source, and changed source requires reinstall by the user.
## Functional blocks
### B1 — Pack-name identity and role enforcement (RF-1, RF-2)
Tasks: T1–T3 · Depends on: none.
Done when: every member carries its pack name, the architecture members are renamed at all call sites, and the content check reports prefix and role violations.
Read: spec.md RF-1, RF-2; plan.md contracts; AGENTS.md identity and role rules; the current architecture pack and its callers.
Preserve: skill and agent identities outside the rename, English aliases, install paths, the 300-character description limit and the existing content checks.
Verify: RF-1.H1–RF-2.S1 manual scenarios; content measurement tool run by the user.
- [x] T1. Rename the architecture pack members and update every active caller and public text. (RF-1) [instructions · rigorkit]
- [x] T2. State the pack-name prefix rule and the top 1% role rule in the root governance and README. (RF-1, RF-2) [instructions · rigorkit]
- [x] T3. Extend the content measurement tool to report prefix mismatches and missing agent roles. (RF-2) [tooling · rigorkit]
### B2 — Design lane (RF-3–RF-7)
Tasks: T4–T6 · Depends on: none.
Done when: the design pack offers a UX flow reference, a UI criteria reference and an advisory UI reviewer whose findings separate defects from improvements, whose simulated results are labeled, whose accessibility default is AA with project override, and whose captures are defined for the human to produce.
Read: spec.md RF-3–RF-7; plan.md decisions; the frontend pack reviewer conventions as the report shape.
Preserve: optional-pack behavior, soft dependencies by name, user-run commands, no third-party service and no copied agent.
Verify: RF-3.H1–RF-7.S1 manual scenarios; content check for the new members.
- [x] T4. Write the UX flow reference with journeys, friction and the simulated-result label. (RF-3, RF-5) [knowledge · rigorkit]
- [x] T5. Write the UI criteria reference with hierarchy, states, responsive behavior, the accessibility level rule and the capture checklist. (RF-4, RF-6, RF-7) [knowledge · rigorkit]
- [x] T6. Write the UI reviewer agent with the shared report contract, the defect and improvement classification and the advisory blocking rule. (RF-4, RF-14) [agent · rigorkit]
### B3 — Security lane (RF-8, RF-9)
Tasks: T7–T8 · Depends on: none.
Done when: the security pack offers a threat modeling reference and a security reviewer, and a change touching sensitive paths carries the security reviewer in its review profile with a threat model before the plan when a new trust boundary or data flow appears.
Read: spec.md RF-8, RF-9; plan.md decisions; the existing reviewer report shape and severity scale.
Preserve: no copied agent, no third-party tool or policy, no secret values, and the existing severity vocabulary.
Verify: RF-8.H1–RF-9.S1 manual scenarios; content check for the new members.
- [x] T7. Write the threat modeling and secure code reference with trust boundaries and verifiable requirements. (RF-8, RF-9) [knowledge · rigorkit]
- [x] T8. Write the security reviewer agent with the shared report contract and exploitable-versus-hardening severity. (RF-9, RF-14) [agent · rigorkit]
### B4 — Factory stations inside SDD (RF-10–RF-16)
Tasks: T9–T12 · Depends on: B1 for the renamed caller names.
Done when: triage proposes a review profile, the enabled reviewers launch together after the builder with independent inputs, implement and verify call them with their evidence, the approver reports one decision after every reviewer reported and never closes, the builder implements one approved block from a fresh context, corrections are re-reviewed together once before escalation, and the station and accepted-item state is recorded with stable identifiers.
Read: spec.md RF-10–RF-16; plan.md algorithms and contracts; the current triage, implement, verify, tasks, archive and half-wired sources.
Preserve: the existing human gates, user-run commands, block boundaries, `HW-NN` semantics, verdict vocabularies and the SDD pause points.
Verify: RF-10.H1–RF-16.S1 manual scenarios; whole-change review at the end of the change.
- [x] T9. Add the review profile to triage and to the constitution override. (RF-10) [instructions · rigorkit]
- [x] T10. Launch the enabled reviewers together after the builder with independent inputs, wire their evidence into implement and verify, and the threat model into the plan path. (RF-9, RF-14, RF-15) [instructions · rigorkit]
- [x] T11. Write the approver agent, which runs after every reviewer reported, and the builder agent, with their roles, gates and stops. (RF-11, RF-12) [agent · rigorkit]
- [x] T12. Record station and reviewer state and accepted items in the tasks and half-wired templates, with corrections re-reviewed together once before escalation. (RF-13, RF-16) [instructions · rigorkit]
### B5 — Publication and evidence (RF-1, RF-3, RF-8)
Tasks: T13–T15 · Depends on: B1, B2, B3, B4.
Done when: the published pack table, the site pack list and the pack READMEs describe the new lanes, the measurement baseline is recaptured from the committed change, and the user-run checks are supplied with their output pending.
Read: spec.md completion criteria; plan.md test strategy; the root README pack table, the site maintenance notes and the measurement tool baseline flow.
Preserve: generated site content, the documented publication gate and the rule that the agent does not run the checks.
Verify: RF-1.H1, RF-3.H1, RF-8.H1 manual scenarios; user-run content, scenario, website and installer checks.
- [x] T13. Publish the new packs and the renamed members in the root README and the pack READMEs. (RF-1, RF-3, RF-8) [documentation · rigorkit]
- [x] T14. Update the site pack list and verify that the published docs regenerate from the pack sources. (RF-1, RF-3, RF-8) [documentation · rigorkit]
- [ ] T15. Supply the user-run verification commands and the baseline recapture step, and record their output as pending. (RF-1, RF-2) [validation · rigorkit]
### B6 — Factory framing and public documentation (RF-17–RF-21)
Tasks: T16–T19 · Depends on: B5 for the renamed members and the published pack list.
Done when: the root README, every pack README and the site copy present rigorkit as an AI software factory, describe the SDD, design and security lanes with their entry, specialists, output and exit criterion, keep the pack as the namespace of its members, list every member with its current name, resolve their links, and the corrected documentation is in place before the factory framing is announced.
Read: spec.md RF-17–RF-21 and the answers 12–14; plan.md decisions; the root README pack table, every pack README and the site copy sources.
Preserve: the pack folders, the install flag, the member names, the soft dependency by name, the 300-character descriptions and the English content.
Verify: RF-17.H1–RF-21.S1 manual scenarios; the site checks and the documentation review by the user.
- [x] T16. Write the lane model in the root README and in `AGENTS.md`: the factory, the lanes, the packs as specialists and the core pack as global rules. (RF-17, RF-18, RF-19) [documentation · rigorkit]
- [x] T17. Correct the root README and one README per pack: current member names, working links, the lane each pack staffs and the deferred operation lane. (RF-20) [documentation · rigorkit]
- [x] T18. Update the site copy to the factory framing and show the lanes, keeping the pack list generated from the pack sources. (RF-17, RF-20, RF-21) [documentation · rigorkit]
- [x] T19. Correct the documentation before announcing the framing, and record the documentation review as a manual scenario. (RF-21) [documentation · rigorkit]
### B7 — Version of the toolkit and of the installed copy (RF-22–RF-24)
Tasks: T20–T23 · Depends on: none; the installer change is a constitutional critical path, so its evidence is a real installation in a temporary folder.
Done when: a VERSION file at the repository root holds the semantic version 0.1.0, `install.sh --version` prints it, `install.sh --list` shows it next to the installed version, the installer records the installed version in the project and global scopes, a difference between both versions is reported without overwriting the installed copy, and the site shows the version read from the same file.
Read: spec.md RF-22–RF-24 and the answers 15–16; plan.md algorithms, contracts and test strategy; `install.sh`, the site build and its footer.
Preserve: the installer behaviour outside version reporting and the marker, the principle that user files are preserved, the soft dependencies and the user-run commands.
Verify: RF-22.H1–RF-24.S1 manual scenarios; project and global dry-runs plus a real installation in a temporary folder, run by the user.
- [x] T20. Add the VERSION file at the repository root with the semantic version 0.1.0 and make it the only source of the version. (RF-22) [tooling · rigorkit]
- [x] T21. Add `install.sh --version` and the local version in `install.sh --list`, reading the VERSION file. (RF-23) [tooling · rigorkit]
- [x] T22. Record the installed version per scope during the installation and report it in `--list` next to the local one, without overwriting the installed copy without `--force`. (RF-24) [tooling · rigorkit]
- [x] T23. Show the version in the site, read from the VERSION file at build time. (RF-23) [documentation · rigorkit]
T1–T14 are implemented in commit `88fd948`; their verification still waits for the user-run checks. T15 and T16–T23 remain unchecked. No completion, green check, savings or live result is inferred from written instructions.
