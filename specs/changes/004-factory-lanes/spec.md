# Spec 004 — Factory lanes: design, security, approver and builder
> Status: draft · DoD: normal · Owner repo: rigorkit · Affected repos: rigorkit
## Context and goal
rigorkit specifies, plans, implements and verifies changes, but it has no lane for interface quality, no lane for application security, no fresh-context builder and no aggregate approval step. A change can therefore leave the factory with an approved spec and a reviewed diff, yet with an unreviewed interface, an unmodelled threat and no single decision about what still needs the human. This change adds those lanes, fixes the naming rule that identifies each pack member, and records the factory state in the change artifacts, keeping SDD as the specification and traceability core.
## Users / actors
Rigorkit users, coding agents working under SDD, and the human owner who approves specs, plans, blocks and commits and who runs the checks.
## User stories
- H1: As the owner, I want interface and security reviewed in their own lanes so that defects reach me with evidence instead of as surprises.
- H2: As the owner, I want one decision that tells me whether delivery still needs me so that I do not re-read every reviewer report.
- H3: As the owner, I want every pack member named after its pack so that I can tell which lane an agent belongs to.
## Functional requirements (EARS)
### Identity and role (H3)
- RF-1: THE SYSTEM SHALL name every installed agent and skill with the name of its pack as prefix.
- RF-2: WHEN an agent or skill does not use its pack name as prefix, or an agent body omits its top 1% role, THEN THE SYSTEM SHALL report the mismatch in the content check.
### Design lane (H1)
- RF-3: THE SYSTEM SHALL provide a design pack containing a UX flow reference, a UI criteria reference and a UI reviewer agent.
- RF-4: WHEN the UI reviewer reports a finding, THEN THE SYSTEM SHALL classify it as a defect or an improvement, and SHALL block delivery only for a defect that the same change does not correct.
- RF-5: WHEN the design reference evaluates a flow without real user participants, THEN THE SYSTEM SHALL label the result as simulated and heuristic.
- RF-6: THE SYSTEM SHALL evaluate accessibility against WCAG 2.2 level AA unless the project declares another level.
- RF-7: WHEN the UI reviewer needs visual evidence, THEN THE SYSTEM SHALL define the required captures and states in the design reference and SHALL NOT execute the application itself.
### Security lane (H1)
- RF-8: THE SYSTEM SHALL provide a security pack containing a threat modeling reference and a security reviewer agent.
- RF-9: WHEN a change touches authentication, authorization, tenancy, permissions, input parsing, cryptography, secrets, uploads, webhooks, third-party integrations or dependencies, THEN THE SYSTEM SHALL include the security reviewer in the review profile of that change; WHEN a change introduces a trust boundary or a new data flow, THEN THE SYSTEM SHALL evaluate a threat model before its plan.
### Factory stations (H2)
- RF-10: WHEN a change enters triage, THEN THE SYSTEM SHALL propose a review profile for that change; WHEN the project constitution forces a reviewer, THEN THE SYSTEM SHALL include that reviewer in the profile.
- RF-11: THE SYSTEM SHALL provide an approver agent that runs after every enabled reviewer has reported and aggregates their verdicts into exactly one decision among approved, needs human and failed; WHEN it reports needs human, THEN THE SYSTEM SHALL list the pending items that require the human and SHALL NOT close the change.
- RF-12: THE SYSTEM SHALL provide a builder agent that implements one approved functional block and receives only the approved specification, plan and block references.
- RF-13: THE SYSTEM SHALL record the state of every factory station and every accepted defect, warning or risk in the change artifacts.
- RF-14: EVERY reviewer SHALL report the scope reviewed, the evidence used, the findings with severity, the untested scope and its verdict.
- RF-15: WHEN the builder finishes an approved block, THEN THE SYSTEM SHALL launch the enabled reviewers together, giving each the same approved references and none of the other reviewers' reports.
- RF-16: WHEN several reviewers report corrections, THEN THE SYSTEM SHALL re-review those corrections together; WHEN the corrections of a reviewer are exhausted, THEN THE SYSTEM SHALL escalate to a human decision.
## Non-functional requirements
Tool-neutral English content; no third-party service dependency and no copied third-party agent; no new installer capability; agent descriptions <=300 characters; global rules unchanged; content checks stay dependency-free; pack names act as namespaces, so a renamed member leaves its previously installed copy to the user.
## Test scenarios
All behavior below is manual instruction-following validation; the content check verifies naming and role only.
### RF-1
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-1.H1 | happy [manual] | architecture pack members renamed | packs are listed | every agent and skill starts with its pack name |
| RF-1.E1 | edge [manual] | pack without agents or skills | content check runs | no naming violation is reported for that pack |
| RF-1.F1 | failure [manual] | member named without its pack prefix | content check runs | mismatch is reported with the member path |
| RF-1.S | security | n/a — a name carries no trust boundary | content check runs | n/a |
### RF-2
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-2.H1 | happy [manual] | agent body declares a top 1% role | content check runs | no role violation is reported |
| RF-2.E1 | edge [manual] | reference skill without a role of its own | content check runs | reference skills are not reported as agents |
| RF-2.F1 | failure [manual] | agent body omits its role | content check runs | violation is reported with the agent path |
| RF-2.S | security | n/a — a role declaration carries no trust boundary | content check runs | n/a |
### RF-3
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-3.H1 | happy [manual] | design pack installed | packs are listed | pack offers a UX flow reference, a UI criteria reference and a UI reviewer agent |
| RF-3.E1 | edge [manual] | project without a user interface | design pack installed | pack is optional and does not block SDD |
| RF-3.F1 | failure [manual] | UI reviewer invoked without captures or code | reviewer runs | it reports missing evidence instead of findings |
| RF-3.S | security | n/a — pack composition carries no trust boundary | packs are listed | n/a |
### RF-4
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-4.H1 | happy [manual] | improvement found in a screen | UI reviewer reports | classified as improvement and reported as non-blocking warning |
| RF-4.E1 | edge [manual] | defect corrected in the same change | change closes | defect is not reported as blocking |
| RF-4.F1 | failure [manual] | defect not corrected in the same change | change closes | defect is reported as blocking |
| RF-4.S1 | security [manual] | screen exposes another tenant's data | UI reviewer reports | classified as defect and blocking |
### RF-5
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-5.H1 | happy [manual] | flow reviewed without participants | design reference reports | result is labeled simulated and heuristic |
| RF-5.E1 | edge [manual] | real user research exists in the project | design reference reports | simulated results are not presented as user evidence |
| RF-5.F1 | failure [manual] | request asks for user evidence | design reference answers | it states that no user research was performed |
| RF-5.S | security | n/a — an honest label carries no trust boundary | design reference reports | n/a |
### RF-6
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-6.H1 | happy [manual] | project declares no accessibility level | UI criteria are applied | WCAG 2.2 level AA is used |
| RF-6.E1 | edge [manual] | project declares level AAA or a national rule | UI criteria are applied | the declared level is used |
| RF-6.F1 | failure [manual] | declared level is unknown | UI criteria are applied | it falls back to AA and reports the unknown level |
| RF-6.S | security | n/a — an accessibility level carries no trust boundary | UI criteria are applied | n/a |
### RF-7
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-7.H1 | happy [manual] | UI reviewer needs a screen | design reference is read | required viewports, states and captures are listed |
| RF-7.E1 | edge [manual] | a state cannot be captured | reviewer runs | it reports that state as untested scope |
| RF-7.F1 | failure [manual] | reviewer is asked to start the application | reviewer runs | it refuses and asks the human for the captures |
| RF-7.S1 | security [manual] | captures contain customer data | checklist is defined | it requires local or redacted captures and forbids secrets in artifacts |
### RF-8
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-8.H1 | happy [manual] | security pack installed | packs are listed | pack offers a threat modeling reference and a security reviewer agent |
| RF-8.E1 | edge [manual] | project without sensitive paths | security pack installed | pack is optional and does not block SDD |
| RF-8.F1 | failure [manual] | security reviewer invoked without a diff or design | reviewer runs | it asks for the missing scope and stops |
| RF-8.S | security | n/a — pack composition carries no trust boundary | packs are listed | n/a |
### RF-9
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-9.H1 | happy [manual] | change touches authorization | review profile is proposed | security reviewer is included |
| RF-9.E1 | edge [manual] | change introduces a new data flow | plan is prepared | a threat model is evaluated before the plan |
| RF-9.F1 | failure [manual] | sensitive path changed without the security reviewer | review profile is proposed | omission is reported and the change waits |
| RF-9.S1 | security [manual] | missing authorization check on a tenant-scoped endpoint | security reviewer reviews | it reports an exploitable finding with the highest severity |
### RF-10
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-10.H1 | happy [manual] | change enters triage | triage runs | a review profile is proposed and awaits approval |
| RF-10.E1 | edge [manual] | constitution forces a reviewer | profile is proposed | the forced reviewer is included |
| RF-10.F1 | failure [manual] | change scope cannot be classified | triage runs | it asks one question instead of guessing the profile |
| RF-10.S | security | n/a — profile selection carries no trust boundary | triage runs | n/a |
### RF-11
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-11.H1 | happy [manual] | all required reviewer verdicts are present | approver agent runs | it reports exactly one decision among approved, needs human and failed |
| RF-11.E1 | edge [manual] | a reviewer reports only warnings | approver agent runs | decision stays approved with the warnings listed |
| RF-11.F1 | failure [manual] | a required verdict is missing | approver agent runs | it reports needs human and lists the missing evidence |
| RF-11.S | security | n/a — an approval decision carries no trust boundary | approver agent runs | n/a |
### RF-12
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-12.H1 | happy [manual] | block approved | builder agent runs | it implements only that block from the approved references |
| RF-12.E1 | edge [manual] | next block not authorized | builder agent runs | it does not start the next block |
| RF-12.F1 | failure [manual] | block needs a decision outside the approved references | builder agent runs | it stops and reports the decision instead of inventing it |
| RF-12.S | security | n/a — a fresh context carries no trust boundary | builder agent runs | n/a |
### RF-13
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-13.H1 | happy [manual] | lanes have run | change artifacts are read | every station state and accepted item is recorded with a stable identifier |
| RF-13.E1 | edge [manual] | reviewer corrections delivered | reviewer runs again | one re-review of the corrections is accepted |
| RF-13.F1 | failure [manual] | corrections exhausted without resolution | reviewer runs | the change escalates to a human decision |
| RF-13.S | security | n/a — recorded state carries no trust boundary | change artifacts are read | n/a |
### RF-14
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-14.H1 | happy [manual] | reviewer reports | report is read | scope, evidence, findings with severity, untested scope and verdict are present |
| RF-14.E1 | edge [manual] | no finding | reviewer reports | zero findings for the tested scope is a valid result |
| RF-14.F1 | failure [manual] | reviewer omits the untested scope | reviewer reports | the report is treated as incomplete |
| RF-14.S | security | n/a — a report contract carries no trust boundary | reviewer reports | n/a |
### RF-15
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-15.H1 | happy [manual] | builder finished an approved block | review station starts | every enabled reviewer is launched together |
| RF-15.E1 | edge [manual] | one reviewer has no corrections | re-review round runs | only the reviewers with corrections are launched again |
| RF-15.F1 | failure [manual] | a reviewer fails to launch | review station ends | the station is reported incomplete and the change waits |
| RF-15.S1 | security [manual] | reviewer receives references from another change | reviewer runs | it reports the scope mismatch and stops |
### RF-16
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-16.H1 | happy [manual] | two reviewers report corrections | corrections are delivered | both corrections are re-reviewed together |
| RF-16.E1 | edge [manual] | a reviewer reports no findings | review station ends | its verdict stands and it is not re-launched |
| RF-16.F1 | failure [manual] | corrections exhausted without resolution | re-review round ends | the change escalates to a human decision |
| RF-16.S | security | n/a — concurrency carries no trust boundary | re-review round runs | n/a |
## Out of scope
The operation and measurement lane (observability, SLOs, rollout and rollback) and any product outcome metric; a dedicated test-writing agent, keeping the existing tests-first skill for now; a generic code-quality reviewer beyond the existing architecture and frontend reviewers; installer changes and automatic cleanup of previously installed copies; automated test execution, commits, pushes and merges.
## Completion criteria
Source instructions and templates are consistent; the content check reports naming and role violations; user-run installs, content checks, scenario checker, estimator and website checks are supplied as commands and their output is pending; live instruction-following scenarios remain pending until observed. No closure without evidence.
## Questions and answers
The preceding design conversation supplies the agreed scope; no new product decisions are inferred.
1. One pack or two for UX and UI? → One pack `design`.
2. Member names? → Every agent and skill carries its pack name as prefix; the architecture pack members are renamed.
3. Review profile fixed or dynamic? → Dynamic per change at triage; the constitution can force extra reviewers.
4. Who produces live UI evidence? → The human; the design reference defines the required captures and the reviewer never runs the application.
5. Accessibility level? → WCAG 2.2 AA by default; a project may declare another level.
6. Do UI findings block delivery? → No; only a defect not corrected in the same change blocks.
7. Where do accepted risks and warnings live? → The unfinished-feature register, with stable identifiers.
8. Does the factory get its own orchestrator? → No; SDD remains the orchestrator and the new agents are called by name.
9. Builder? → A builder agent with a fresh context per approved functional block, included in this change.
10. Name of the later operation lane? → `operation`.
11. How do the reviewers run? → Concurrently after the builder, each with the same approved references and without the other reviewers' reports.
## Open questions
- [NEEDS CLARIFICATION] Should the installer remove the previously installed copy of a renamed member, or does the change documentation instruct the user to remove it manually? This affects the installer and is currently out of scope.
- [NEEDS CLARIFICATION] The measurement baseline must be recaptured from a commit that includes the renamed and new members; confirm that the baseline step happens after the user commits, since no commit is authorized here.
- [NEEDS CLARIFICATION] Should the dedicated test-writing agent be added in this change or deferred with the operation lane?
- [NEEDS CLARIFICATION] The sdd pack loaded-token reduction already failed before this change (18.95% against a 30% target on main) and falls to 11.71% with the new stations, 14530 tokens against a 11519 limit. Meeting the target needs a dedicated compaction change or a baseline refresh, and the capture tool is pinned to a fixed source commit. Confirm the follow-up.
## Clarification — round 1 (2026-10-26) · Verdict: ready for plan
1. Ambiguities: the UI reviewer's blocking rule is limited to defects not corrected in the same change; the approver decision vocabulary is fixed to approved, needs human and failed; "review profile" means the optional reviewers a change activates.
2. Conflicting requirements: the UI lane is advisory while the architecture and frontend lanes stay blocking for introduced high findings; the tester lane keeps its existing tests-first skill and does not change the reviewer contract.
3. Missing test scenarios: missing capture evidence, declared accessibility level, missing reviewer verdict, corrections exhausted, renamed installed copy and absent user research are covered.
4. Conflicts with constitution: soft dependencies by name, self-contained pack folders, English content, descriptions at most 300 characters, top 1% roles, user-run commands, no installer capability and no global rule change are preserved.
Approval evidence: the user closed the design decisions above and authorized creating the branch and these artifacts. Spec, plan and block approval remain pending.
## Clarification — round 2 (2026-10-26) · Verdict: ready for plan
1. Ambiguities: the review station is one station with parallel branches; the enabled reviewers launch together after the builder and each receives the same approved references without the other reviewers' reports, so no reviewer anchors on another.
2. Conflicting requirements: the dynamic review profile bounds the parallel fan-out; the approver still runs last, after every enabled reviewer has reported; the interface lane stays advisory inside the same parallel round.
3. Missing test scenarios: a reviewer that fails to launch, a reviewer with no corrections, a re-review round with several corrections and a reviewer that receives a foreign scope are covered.
4. Conflicts with constitution: parallelism stays tool-neutral, keeps the user-run commands and the single human gate, and does not authorize autonomous closure.
Approval evidence: the user stated that the reviewers after the builder run concurrently.
