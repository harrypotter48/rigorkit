# Spec 006 — Factory v2: vertical slices, git backlog and frozen tests
> Status: implementation reviewed; release validation pending · Tier: feature · DoD: normal · Owner repo: rigorkit · Affected repos: rigorkit
## Context and goal
The factory of change 004 is slow because the ceremony has been fixed rather than scaled to the scope of each change, and a feature is decomposed into its CRUD operations instead of by value. The agent also writes branches for scenarios that will never happen, because nothing in the flow limits it, and the owner ends up reviewing the whole diff to find out what matters. This change makes the unit of work a vertical slice with its own short specification, keeps a flat backlog of stories in git, freezes the tests in red before the implementation so that the implementation cannot make them pass by changing them, scales the ceremony by tier and lets the machine checks run before the reviewers. The decision, its alternatives and the reasoning are recorded in the vault note "Factory v2 - vertical slices, backlog en git and frozen tests" of 2026-10-26.
## Users / actors
- The owner, who chooses the next story, approves the contract of a story, decides the amendments and closes the change.
- The agents: the slicer that proposes the stories, the test writer that freezes the red, the builder that implements the minimum, the reviewers and the approver that aggregates them.
## User stories
- H1: As the owner, I want the work split into vertical slices in a backlog I can reorder, so that I can advance on what I understand as a priority.
- H2: As the owner, I want the tests frozen before the implementation, so that the agent cannot make them pass by changing them.
- H3: As the owner, I want the ceremony to scale with the size of the change, so that a small story does not pay for a feature.
- H4: As the owner, I want the agent to implement only what the specification requires, so that the diff carries no speculative branches.
- H5: As the reviewer, I want the machine checks to run before the reviewers, so that a broken contract is not paid for in reviewer tokens.
## Functional requirements (EARS)
### Backlog and slicing (H1)
- RF-1: WHEN the owner states an intent or a feature, THE SYSTEM SHALL propose vertical slices as backlog entries with id, title, why (the value), feature, size, dependencies and status.
- RF-2: THE SYSTEM SHALL keep the backlog as a flat index of stories ordered by owner priority, with at most one story in `next` and at most one in `wip`, and SHALL refuse to start a second story while one is in `wip`.
- RF-3: WHEN the owner selects a story, THE SYSTEM SHALL create a change whose specification holds requirements, acceptance, scenarios, invariants, out of scope and open questions, and SHALL link that change from the backlog entry.
### Frozen tests (H2)
- RF-4: WHEN the specification of a story is approved, THE SYSTEM SHALL write the failing tests co-located with the source they test and SHALL propose a `test(red):` commit and record its exact hash only after explicit owner approval; valid reused coverage or a manual-only exception SHALL be evidenced instead of fabricated red.
- RF-5: THE SYSTEM SHALL freeze the tests at the behavioral red, where the assertion of the scenario fails, and SHALL NOT treat a structural red caused by a missing module as the behavioral red.
- RF-6: WHEN a commit after the red commit modifies a file that matches the test paths of the repository, THE SYSTEM SHALL require that commit to start with `test(amend):` and SHALL NOT allow any other commit to modify a test path.
- RF-7: WHEN a frozen test turns out to be wrong, THE SYSTEM SHALL stop and propose the amendment of the specification before any change to the test, and the `test(amend):` commit SHALL cite that amendment.
### Checks (H2, H5)
- RF-8: WHEN the frozen-test check runs, THE SYSTEM SHALL read the test paths from the constitution of the repository, SHALL report every test path modified after the red commit, and SHALL fail when a modification is not covered by a `test(amend):` commit.
- RF-9: WHEN the branch-trace check runs, THE SYSTEM SHALL report every branch point added by the change that carries no reference to a scenario or to an invariant, and SHALL fail while such a branch exists.
- RF-10: WHEN a change reaches the check stage, THE SYSTEM SHALL run the frozen-test check and the branch-trace check before launching any reviewer, and SHALL NOT launch the reviewers while a machine check fails.
### Reviewers (H3)
- RF-11: WHEN the reviewers of a story run, THE SYSTEM SHALL launch them together, each with a fresh context, the same approved inputs and no report of the others, and SHALL aggregate their verdicts in a final judge that does not close the change.
- RF-12: THE SYSTEM SHALL retain the base conformance (`sdd-reviewer`) and quality/architecture (`architecture-reviewer`) reviewers at every applicable review. WHEN impact reaches an owner-confirmed threshold, touches a critical path or creates a module/layer, THE SYSTEM SHALL reassess the owner-approved profile and reinforced DoD without dropping either base lens; applicable specialist triggers and stricter project rules SHALL remain.
- RF-13: WHEN a change is verified, THE SYSTEM SHALL record in its validation the verifications that did not run, including the container, browser and end-to-end suites.
### Tiers (H3)
- RF-14: WHEN a change is classified as trivial, story or feature, THE SYSTEM SHALL apply the specification, test, reviewer and verification set of that tier.
### Builder minimality (H4)
- RF-15: WHEN the builder implements a story, THE SYSTEM SHALL implement only the behavior covered by a scenario or required by an invariant, and SHALL NOT add a branch without one of them.
- RF-16: WHEN the builder finds that a doubt would require code, THE SYSTEM SHALL record it as an open question of the change instead of implementing it.
### Commands (H3)
- RF-17: WHEN a station needs scoped unit or integration test results, THE SYSTEM SHALL use the existing project test setup and record the actual results, and SHALL NOT run install, build, lint, typecheck, migrations, seeds, deploy, Docker/container infrastructure, browser or end-to-end suites without an explicit request of the owner. Tests requiring unavailable services SHALL remain pending instead of starting that infrastructure.
### Documentation (H3)
- RF-18: THE SYSTEM SHALL document the commit conventions `test(red):`, `test(green):`, `test(amend):` and `refactor:`, the tier table, the completion criteria of a story, and the split of commands between the agent and the owner.
## Non-functional requirements
Node >= 18 without dependencies, in the style of `tools/measure-content.mjs`; the new checks read the constitution of the repository they run in and never write to it; no network access; English content in the repository artifacts; the identity and limit checks of the content measurement stay untouched; no change to the installer, to the version file or to the published site beyond the documentation of the new stages; the packs keep their current member names, so the installed copies keep working.
## Test scenarios
All behavior below is manual instruction-following validation; the executable coverage lives in `tools/test/`.
### RF-1
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-1.H1 | happy [manual] | owner states a feature with two visible outcomes | slicing runs | the backlog holds one entry per outcome with id, title, why, feature, size, dependencies and status |
| RF-1.E1 | edge [manual] | owner states an intent with no observable outcome | slicing runs | the agent asks one question instead of proposing empty slices |
| RF-1.F1 | failure [manual] | proposed slice would cut a layer in half | slicing runs | the agent proposes a vertical slice instead and reports why |
| RF-1.S | n/a — a backlog entry carries no trust boundary | slicing runs | n/a |
### RF-2
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-2.H1 | happy [manual] | backlog with stories of two features | the owner reorders them | the index keeps the stories flat and follows the order of the owner |
| RF-2.E1 | edge [manual] | one story in `wip` | the owner selects another story | the index reports that a story is in progress and asks which one to leave |
| RF-2.F1 | failure [manual] | backlog without a `next` marker | the agent picks the next story | the agent asks and does not choose by the CRUD order of the feature |
| RF-2.S | n/a — the ordering of a backlog carries no trust boundary | the owner reorders | n/a |
### RF-3
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-3.H1 | happy [manual] | approved backlog entry | the owner selects it | the change holds requirements, acceptance, scenarios, invariants, out of scope and open questions, and the entry links it |
| RF-3.E1 | edge [manual] | selected entry without acceptance criteria | the change is written | the missing acceptance is an open question of the change |
| RF-3.F1 | failure [manual] | entry whose value no longer exists | the owner selects it | the agent reports the mismatch instead of writing the change |
| RF-3.S | n/a — a backlog link carries no trust boundary | the change is written | n/a |
### RF-4
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-4.H1 | happy [manual] | approved specification of a story and explicit red-commit approval | the test stage runs | the failing tests sit next to the source they test and the approved commit message starts with `test(red):` |
| RF-4.E1 | edge [manual] | a scenario with no unit-level expression | the test stage runs | the scenario is kept as manual with its reason and the rest is written |
| RF-4.F1 | failure [manual] | a test that cannot fail for the scenario reason | the test stage runs | the test is fixed instead of being committed as the red |
| RF-4.S | n/a — the location of a test carries no trust boundary | the test stage runs | n/a |
### RF-5
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-5.H1 | happy [manual] | module already exists | the test stage runs | the red is the failing assertion of the scenario |
| RF-5.E1 | edge [manual] | module does not exist yet | the test stage runs | the structural red is reported as structural and the behavioral red is the one that freezes |
| RF-5.F1 | failure [manual] | red caused by an import or configuration error | the test stage runs | the error is fixed and the red is not accepted as the freeze |
| RF-5.S | n/a — the kind of red carries no trust boundary | the test stage runs | n/a |
### RF-6
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-6.H1 | happy [manual] | frozen tests and a `test(green):` commit | the commit is inspected | no test path appears in the commit |
| RF-6.E1 | edge [manual] | an owner-approved `test(amend):` commit with a real cited spec amendment | the commit is inspected | the citation and approval are verified; a lexical prefix alone does not accept the slice |
| RF-6.F1 | failure [manual] | a commit that modifies a test path without the `test(amend):` prefix | the commit is inspected | the commit is rejected and the modified path is reported |
| RF-6.S | n/a — a commit prefix carries no trust boundary | the commit is inspected | n/a |
### RF-7
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-7.H1 | happy [manual] | frozen test that contradicts the specification | the build stage runs | the agent stops, proposes the amendment and changes nothing |
| RF-7.E1 | edge [manual] | frozen test that only misses an edge case | the build stage runs | the agent proposes the extra scenario instead of editing the test |
| RF-7.F1 | failure [manual] | implementation that only passes after editing the frozen test | the build stage runs | the check reports the modified test path and the change does not reach the reviewers |
| RF-7.S | n/a — the reason of an amendment carries no trust boundary | the build stage runs | n/a |
### RF-8
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-8.H1 | happy | declared patterns and clean pinned red | check runs | clean source changes pass |
| RF-8.H2 | happy | test(amend) with AMEND reference | check runs | cited paths are reported; owner approval remains separately checked |
| RF-8.H3 | happy | scripts copied by setup outside this checkout | CLI runs | self-contained frozen check passes |
| RF-8.E1 | edge | no declared test paths | check runs | fail closed |
| RF-8.F1 | failure | no red inside the confirmed change | check runs | fail closed |
| RF-8.F2 | failure | unauthorized edit followed by revert | history checked | violation remains visible |
| RF-8.F3 | failure | amend prefix without citation | check runs | fail |
| RF-8.F4 | failure | staged edit hidden by unstaged restoration | check runs | fail |
| RF-8.F5 | failure | untracked tests or renamed/deleted test paths | check runs | fail |
| RF-8.S1 | security | hostile revision argument | check runs | no shell interpolation; invalid input fails |
| RF-8.S2 | security | live test patterns changed to hide an edited test | check runs | frozen red policy still detects the violation |
### RF-9
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-9.H1 | happy | scenario reference in current hunk | check runs | branch accepted lexically |
| RF-9.E1 | edge | invariant reference | check runs | accepted |
| RF-9.E2 | edge | comments/string content or optional chaining | check runs | not mistaken for a branch |
| RF-9.E3 | edge | untracked source with branches and prose | repo check runs | source included, prose excluded |
| RF-9.E4 | edge | CLI fixture patch and malformed options | wrappers run | valid patch passes, bad arguments fail |
| RF-9.F1 | failure | branch without reference | check runs | file:line reported |
| RF-9.F2 | failure | only a deleted reference | check runs | new branch fails |
| RF-9.F3 | failure | marker in another hunk | check runs | uncovered hunk fails |
| RF-9.S | n/a — trace markers do not establish trust or semantic coverage | | | |
### RF-10
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-10.H1 | happy [manual] | both machine checks green | the check stage runs | the reviewers are launched together |
| RF-10.E1 | edge [manual] | branch-trace check red | the check stage runs | the reviewers are not launched and the reported branch is fixed first |
| RF-10.F1 | failure [manual] | frozen-test check red | the check stage runs | the reviewers are not launched and the modified test path is reported |
| RF-10.S | n/a — the order of the checks carries no trust boundary | the check stage runs | n/a |
### RF-11
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-11.H1 | happy [manual] | two reviewers enabled | the check stage runs | both run together with a fresh context, the same inputs and no report of the other |
| RF-11.E1 | edge [manual] | one reviewer reports a correction | the review station runs | the corrections are re-reviewed together once |
| RF-11.F1 | failure [manual] | a reviewer reports a high | the judge aggregates | the decision is `needs human` or `failed` and the change stays open |
| RF-11.S | n/a — a read-only reviewer carries no trust boundary | the check stage runs | n/a |
### RF-12
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-12.H1 | happy [manual] | story diff below the threshold | the profile is computed | both conformance and quality/architecture reviewers remain enabled |
| RF-12.E1 | edge [manual] | story diff of exactly the threshold | the profile is computed | both base reviewers remain and profile/DoD applicability is reassessed with the owner |
| RF-12.F1 | failure [manual] | story touches a critical path or creates a module | the profile is computed | both base reviewers remain and profile/DoD applicability is reassessed with the owner and the reinforced DoD applies |
| RF-12.S | n/a — a threshold carries no trust boundary | the profile is computed | n/a |
### RF-13
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-13.H1 | happy [manual] | story verified with unit tests only | the validation is written | it records that the container, browser and end-to-end suites did not run |
| RF-13.E1 | edge [manual] | owner requests the browser suite | the validation is written | it records the suite that ran and its result |
| RF-13.F1 | failure [manual] | a scenario without evidence | the validation is written | the scenario is pending and the verdict is not `spec fulfilled` |
| RF-13.S | n/a — a record of what did not run carries no trust boundary | the validation is written | n/a |
### RF-14
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-14.H1 | happy [manual] | change classified as trivial | the stages run | no specification and no tests are required and the diff is reviewed by reading |
| RF-14.E1 | edge [manual] | change classified as story | the stages run | the short specification, the frozen red, the base profile and the unit tests apply |
| RF-14.F1 | failure [manual] | change classified as feature | the stages run | the complete specification, the profile of the tier and the regression on request apply |
| RF-14.S | n/a — a tier carries no trust boundary | the stages run | n/a |
### RF-15
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-15.H1 | happy [manual] | scenario covered by the specification | the builder implements | only the behavior of the scenario and the invariants is written |
| RF-15.E1 | edge [manual] | behavior that the owner may need later | the builder implements | it is reported as an open question and not written |
| RF-15.F1 | failure [manual] | branch without a scenario or an invariant | the builder implements | the branch-trace check reports it and the change does not reach the reviewers |
| RF-15.S | n/a — the minimality of an implementation carries no trust boundary | the builder implements | n/a |
### RF-16
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-16.H1 | happy [manual] | doubt that would need code | the builder implements | the doubt is recorded as an open question of the change |
| RF-16.E1 | edge [manual] | doubt about an invariant | the builder implements | the invariant is confirmed with the owner before the code |
| RF-16.F1 | failure [manual] | doubt written as code | the builder implements | the branch-trace check reports the branch and it is removed |
| RF-16.S | n/a — a doubt carries no trust boundary | the builder implements | n/a |
### RF-17
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-17.H1 | happy [manual] | build stage with unit tests of the affected module | the build stage runs | the agent runs them and uses the result as the green evidence |
| RF-17.H2 | happy [manual] | existing in-process integration tests without restricted infrastructure | a station needs integration evidence | the agent runs the scoped suite and records its actual result |
| RF-17.E2 | edge [manual] | an integration suite requires unavailable services or Docker | the station assesses execution | it reports the check as pending and asks; it does not start infrastructure |
| RF-17.E1 | edge [manual] | owner asks for the browser suite | the build stage runs | the suite runs only on that request and its result is recorded |
| RF-17.F1 | failure [manual] | build stage about to run install, build, lint, typecheck, migrations, seeds or deploy | the build stage runs | the command is not run and is handed to the owner with its expected output |
| RF-17.S | n/a — the command split carries no trust boundary | the build stage runs | n/a |
### RF-18
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-18.H1 | happy [manual] | documentation of the factory | it is read | the commit conventions, the tier table, the completion criteria of a story and the command split are present |
| RF-18.E1 | edge [manual] | repository adopting the factory | it reads the documentation | the required constitution fields are named |
| RF-18.F1 | failure [manual] | documentation that still describes the old ceremony | it is read | the change is not approved while the old ceremony is described as current |
| RF-18.S | n/a — the documentation carries no trust boundary | the documentation is read | n/a |
### Additional guard regressions
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-8.E2 | edge | a blank test glob in the frozen policy | frozen check runs | configuration fails closed |
| RF-8.S3 | security | the live constitution is replaced by an in-repo symlink to an alternate old policy | frozen check runs | the redirected path is rejected |
| RF-9.F4 | failure | an unexplained branch is staged and the worktree restores old content | trace check runs | the staged violation is reported |
| RF-9.F5 | failure | an executable conditional in a template interpolation | trace check runs | the uncited branch is reported |
| RF-9.E5 | edge | template text or a cited interpolation | trace check runs | text is ignored and cited code passes |
## Out of scope
- The implementation of the factory v2 in the repositories that adopt it; this change only ships the toolkit.
- The installer, the version file, the published site copy and the packs `design`, `security`, `architecture` and `frontend`.
- The multi-tenancy, RBAC and SaaS candidate packs.
- The operation lane, the outcome metrics and the dedicated review of the product decisions.
- The automatic classification of the tier by the tool; the agent proposes it and the owner confirms it.
## Completion criteria
- Executable guard scenarios and existing toolkit/website source unit suites pass; strict scenario structure/coverage check has no missing executable scenario.
- Skills, agents and mirrored project templates implement the source contracts RF-1–RF-18; independent conformance and architecture review has no unresolved introduced blocking defect.
- Register sdd-slice against an immutable committed content baseline without increasing any pack budget; retain the historical 005 baseline.
- Real documentation import succeeds. Existing PR workflow must complete website build/typecheck/browser/output checks before merge; local unrun checks are not green.
- Manual instruction-following scenarios are identified as adoption validation, not claimed executed by source inspection or fixture tests. A real adopting repository and installed-project migration remain separate work.
## Questions and answers
1. Where does the backlog live? → In git, in `specs/backlog.md` of the repository, as the flat index of the stories. It is only the index; the written changes keep living in `specs/changes/`.
2. Does the backlog replace `specs/changes/`? → No. The backlog indexes the stories; each selected story becomes a change in `specs/changes/`.
3. Who declares the test paths? → The constitution of each repository. The frozen-test check reads them from there.
4. Which paths count as a test? → The co-located test files of the repository, declared in the constitution as patterns.
5. Where does the frozen-test check live? → In `tools/` of rigorkit, with the family of scripts that already exist for the tests and the rest of the checks.
6. What is the threshold that adds the quality and architecture reviewer? → Keep both existing reviewers. A project may confirm its own escalation threshold; 150 is a template proposal, not permission to remove a base reviewer.
7. Who runs the unit tests? → The agent, in the build loop. The install, build, lint, typecheck, migration, seed and deploy commands and the container, browser and end-to-end suites stay with the owner.
8. Can the red commit carry a production stub? → No. The red is behavioral; a structural red is reported as structural.
9. What happens when a frozen test is wrong? → The agent stops and proposes the amendment of the specification. Only a `test(amend):` commit that cites the amendment can touch a test path.
10. Do the reviewers keep running in parallel with a fresh context? → Yes. The base profile remains two independent lenses: conformance/trace and quality/architecture. The owner approved retaining it on 2026-10-29; tier does not silently remove a reviewer.
## Open questions
- Adoption follow-up: each repository confirms its escalation threshold; the 150-line proposal never disables either base reviewer.
- Resolved in triage: trivial has no observable, contract or critical behavior change; uncertain impact is not trivial. The owner confirms the proposed tier.
- Adoption follow-up: the adopting owner chooses migration scope/order through sdd-init and sdd-adopt; this toolkit release never rewrites an existing backlog automatically.
## Clarification — round 1 (2026-10-26) · Verdict: ready for plan
The design was agreed with the owner in a design session on 2026-10-26 and recorded in the vault note "Factory v2 - vertical slices, backlog en git and frozen tests" of the same date. The questions above close the five repository-specific points that the design session left open. The three open questions are validation items of the first adoption and do not block the plan.

## Owner clarification — 2026-10-28
The owner confirmed: each slice is the smallest useful end-to-end outcome and is accepted separately; HU/ticket describes that slice and technical tasks stay inside it. Every new technical decision requires approval before application. An applicable existing repo/vault decision can be reused only with explicit communication of its source and applicability; conflicts or uncertain applicability return to the owner. The repo governs; the configured vault and repo learnings are selectively available to every station. Propose reusable learnings and obtain approval before cross-project vault promotion. Implement only agreed behavior/invariants, never guessed defaults or speculative options. Scoped unit AND integration tests are allowed with the existing setup; browser, Docker and e2e remain on explicit request. README/examples/image updates communicate this agreement; draft automation and adoption evidence remain pending. This clarification does not mark this spec or its plan approved.

## Implementation adaptation — 2026-10-29 (before delivery approval below)
The owner requested implementation using selected agency-agents guidance. Handoffs, requirement/consumer/evidence matrices and bounded review were adapted with MIT attribution; upstream tool permissions, mandatory screenshots and speculative features were excluded. Test-integrity CLI examines every commit since the recorded red plus index/worktree/untracked paths; a cited amendment prefix is not proof of owner approval. Branch trace is a conservative lexical gate, not semantic coverage. The two-reviewer existing profile remains until the owner selects the proportional profile; the pending question does not authorize changing reviewer defaults. No production commits/installation/baseline replacement are authorized by this implementation request.

## Delivery decisions — 2026-10-29
The owner explicitly approved retaining both existing reviewers and registering sdd-slice without increasing the token budget. The earlier proportional-routing proposal is deferred, not a release blocker. Source implementation and toolkit validation are distinct from installation, real adopting-project behavior and owner slice acceptance. Each real commit, push and merge retains its own authorization boundary. See implementation-validation.md and release-checklist.md.
