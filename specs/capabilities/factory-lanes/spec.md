# Capability — Factory lanes and review stations

> Status: current · Owner repo: rigorkit · DoD: critical for the installer

## Context and goal
rigorkit is an AI software factory. A lane is a track of work with an entry condition, its specialists, its output and its exit criterion; a pack is the set of specialists staffed in a lane and stays their namespace. The SDD lane is the core one, design and security staff their own lanes, architecture and frontend are specialists the SDD lane calls in its review station, and core carries global rules instead of a lane. Every change records the state of its stations, and an approver aggregates the reviewer verdicts into one decision that only the owner can close.

## Users / actors
- The owner who approves specs, plans, functional blocks and commits, and who closes every change.
- Coding agents working under SDD: explorer, reviewer, builder, approver and the lane reviewers.
- Projects that install only the packs they need.

## User stories
- H1: As the owner, I want interface and security reviewed in their own lanes so that defects reach me with evidence instead of as surprises.
- H2: As the owner, I want one decision that tells me whether delivery still needs me so that I do not re-read every reviewer report.
- H3: As the owner, I want every pack member named after its pack so that I can tell which specialists a lane staffs.
- H4: As the owner, I want the installed version visible so that I know which behaviour is running in a project.

## Definitions
- **Lane**: a track of work with an entry condition, its specialists, its output and its exit criterion. Lanes today: SDD (core), design and security. The operation lane is deferred to a later change.
- **Pack**: a folder of specialists under `packs/<topic>/`. Every member is named `<pack>-<role>`, so the pack is the namespace of its members.
- **Specialist**: an agent or skill of a pack. Readonly reviewers inspect a diff or audit folder debt; the builder writes.
- **Review profile**: the reviewers a change activates, proposed at triage and extended by the project constitution.
- **Review station**: the point of the process where the enabled reviewers run together after the builder, each with the same approved references and without the other reviewers' reports.
- **Approver decision**: `approved`, `needs human` or `failed`. The approver never closes the change.
- **Advisory interface lane**: an improvement never blocks delivery; only a defect the same change does not correct blocks it.
- **Accepted item**: a finding the owner accepts, registered in `specs/half-wired.md` with a stable `HW-NN` identifier.
- **Version**: the semantic version in `VERSION` at the repository root, the single source. The installer records the version it wrote in `.rigorkit-version` at the scope root.
- **Content ratchet**: the comparison of the current content with a baseline that declares its own target. See the capability English and compact content.

## Current contracts
- RF-1: The system presents rigorkit as an AI software factory whose tracks of work are lanes; a pack is the set of specialists staffed in a lane and is not a lane itself.
- RF-2: The lanes are SDD (core, staffed by the `sdd` pack), design (staffed by the `design` pack) and security (staffed by the `security` pack); `architecture` and `frontend` are specialists called from the SDD review station, `core` provides global rules instead of a lane, and the operation lane stays deferred.
- RF-3: Every agent and skill is named with its pack name as prefix, and every agent body declares its top 1% role; the content check reports both violations.
- RF-4: The design lane offers a UX flow reference and a UI criteria reference, evaluates accessibility against WCAG 2.2 level AA unless the project declares another level, labels results obtained without participants as simulated and heuristic, and defines the captures the human produces.
- RF-5: The interface reviewer classifies every finding as a defect or an improvement; an improvement never blocks and only a defect the same change does not correct blocks.
- RF-6: The security lane offers a threat modeling reference and a security reviewer; a change that touches sensitive paths gets that reviewer in its review profile, and a change that introduces a trust boundary or a new data flow gets a threat model before its plan.
- RF-7: Triage proposes the review profile of the change, and the project constitution can force a reviewer into it.
- RF-8: After the builder finishes an approved block, the enabled reviewers run together, each with the same approved references and none of the other reports; their corrections are re-reviewed together once and then the change escalates to the owner.
- RF-9: Every reviewer reports the scope reviewed, the evidence used, the findings with severity, the untested scope and its verdict.
- RF-10: The approver runs after every enabled reviewer has reported and aggregates the verdicts into exactly one decision among approved, needs human and failed; when it reports needs human it lists the pending items and does not close the change.
- RF-11: The builder implements one approved functional block from the approved specification, plan and block references only, with a fresh context.
- RF-12: The change artifacts record the state of every station and every accepted item with a stable identifier.
- RF-13: The version lives in `VERSION` at the repository root as the only copy; `install.sh --version` prints it, `install.sh --list` shows it next to the installed version, the installer records the installed version per scope and the site reads the same file.

## Scenario coverage
The scenario definitions and their evidence live in the archived change 004-factory-lanes (96 scenarios) and 005-content-ratchet (32 scenarios). No live agent run has exercised the review stations yet: the manual scenarios of 004 remain pending until a real change goes through the factory.

| Contract | Scenarios | Result |
|---|---|---|
| RF-1, RF-2 | 004 RF-17.H1–RF-19.S | PASS (static: README, AGENTS.md and pack READMEs) for the model; manual lane behavior PENDING |
| RF-3 | 004 RF-1.H1–RF-2.S1 | PASS (content check reports prefix and role violations; fixture tests) |
| RF-4 | 004 RF-3.H1–RF-7.S1 | PASS (static: the design pack content); manual review behavior PENDING |
| RF-5 | 004 RF-4.H1–RF-4.S1 | PASS (static: the reviewer instruction); manual classification PENDING |
| RF-6 | 004 RF-8.H1–RF-9.S1 | PASS (static: the security pack and the triage and plan instructions); manual review PENDING |
| RF-7 | 004 RF-10.H1–RF-10.S | PASS (static: the triage instruction); manual profile selection PENDING |
| RF-8 | 004 RF-15.H1–RF-16.S | PASS (static: the implement and verify instructions); manual parallel run PENDING |
| RF-9 | 004 RF-14.H1–RF-14.S | PASS (static: the reviewer report contract); manual report PENDING |
| RF-10 | 004 RF-11.H1–RF-11.S | PASS (static: the approver agent); manual decision PENDING |
| RF-11 | 004 RF-12.H1–RF-12.S | PASS (static: the builder agent); manual block implementation PENDING |
| RF-12 | 004 RF-13.H1–RF-13.S | PASS (static: the tasks and half-wired templates); manual recording PENDING |
| RF-13 | 004 RF-22.H1–RF-24.S1 | PASS (user checks and agent verification: version file, `--version`, `--list`, marker per scope, difference report, site) |
| Content ratchet | 005 RF-1.H1–RF-8.S | PASS (29 executable tests; live measurement against the ratchet baseline with 0 errors) |

## Out of scope
The operation and measurement lane with its product outcome metrics; a dedicated test-writing agent, while the existing tests-first skill stays; renaming the repository or the npm package; renaming packs to lanes in folders, flags or member names; automatic version bumps; publishing the version to npm; an automatic cleanup of previously installed copies of renamed members.

## Verification references
Current implementations: `packs/`, `install.sh`, `VERSION`, `tools/measure-content.mjs`, `tools/capture-baseline.mjs`. Scenario IDs refer to the archived changes 004-factory-lanes and 005-content-ratchet and to `tools/test/`. Historical evidence and accepted verification exceptions: [validation 004](../archive/004-factory-lanes/validation.md) and [validation 005](../archive/005-content-ratchet/validation.md). Independent review was not performed and no live agent run has exercised the review stations; the current contract statements do not imply those checks ran. Future defects are handled in a new change.
