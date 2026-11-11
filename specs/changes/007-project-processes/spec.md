# Spec 007 — Project processes and common factory departments
> Status: approved · Tier: feature · DoD: normal · Owner repo: rigorkit · Affected repos: rigorkit
> Origin: none — Owner requested starting the agreed project-process evolution in Rigorkit.

## Context and goal
Rigorkit currently combines factory responsibilities with a software-specific workflow. Owners need a common way to understand a request, design a solution, produce an artifact, verify its outcome and retain learning, including work whose output is a prompt rather than code. Initialization should discover the actual work through an interview, reuse existing capabilities and preserve current software projects. The owner need not know process design or create agents for every domain.

## Agreed terminology
- Department: a common responsibility — Understand, Design, Build, Verify or Learn.
- Lane: a work-type process using those departments. This first slice provides software; prompts remain deferred.
- Pack: a distribution/namespace for reusable skills and agents, not a department or process instance.
- Existing design/security capabilities remain available as specialists in the software lane; public descriptions change, existing skill/agent names and specialist triggers remain.

## Users / actors
- Project owner: agrees outcomes, process settings, technical choices and each delivered change.
- Main agent and available specialists: perform bounded activities using applicable instructions and original evidence.
- Existing software-project users: adopt incrementally without losing their current workflow or customizations.
- Future prompt-project users are context for extensibility only; a usable prompt process is deferred to a second slice.

## User stories
- H1: As an existing software user, I want common departments and a project configuration without disrupting my current SDD work.
- H2: As a project owner unfamiliar with process design, I want an interview to produce a grounded proposal I can understand and approve.
- H3: As an owner with existing skills and work, I want reusable references and explicit capability gaps rather than duplicate skills or invented expertise.

## Acceptance
An existing software project can explicitly adopt the five common departments using an owner-approved project configuration and continue its useful-slice workflow, owner gates, specialist reviews and scoped verification. Initialization can explain each department's activities and evidence from the owner's actual work. A project without the new configuration remains usable. A non-code delivery process, distributable plugins and automation engine are separate scope decisions, not implied implemented capabilities.

## Invariants
- INV-1: The owner approves WHAT before HOW, new technical choices before application, and each slice separately; current stricter gates remain binding.
- INV-2: Current project work, custom instructions and frozen-test boundaries are never silently overwritten or weakened.
- INV-3: Configuration and external skill contents grant no additional tool, commit, push, merge or deployment authorization.
- INV-4: Missing skills, original evidence, expertise or review independence are visible gaps, never inferred success.
- INV-5: Project-specific truth stays in the repository; reusable brain context is selectively referenced without secrets or private-path leakage.

## Functional requirements (EARS)
### Shared departments
- RF-1: THE SYSTEM SHALL organize project work through Understand, Design, Build, Verify and Learn while allowing evidence-driven returns and verification preparation before Build.
### Guided initialization
- RF-2: WHEN an owner initializes a project, THE SYSTEM SHALL interview the owner about outcomes, existing work, rules and acceptance evidence and SHALL propose the corresponding process without requiring phase-design knowledge.
### Project configuration
- RF-3: WHEN the owner approves a process configuration, THE SYSTEM SHALL keep one project-owned configuration of its selected process and department-specific adjustments, referencing reusable instructions and change evidence instead of duplicating them.
### Software continuity
- RF-4: WHEN an existing software project uses Rigorkit, THE SYSTEM SHALL preserve its current entry points, approved scope, specialist triggers and approval/test boundaries while offering an explicit adoption proposal for the shared departments.
### Existing work adoption
- RF-5: WHEN a project already contains work or custom instructions, THE SYSTEM SHALL inspect relevant existing artifacts and propose only the required configuration changes for owner approval without overwriting or restarting that work.
### Capability reuse and fallback
- RF-6: WHEN a department needs a capability, THE SYSTEM SHALL reuse applicable available skills or agents and their source references, or explicitly assign the activity to the main agent with declared limitations when no specialist is available.
### Appropriate evidence
- RF-7: BEFORE a change is built, THE SYSTEM SHALL agree the evidence needed to accept it according to the work type; automated tests, examples, rubrics and manual evaluation SHALL be distinguished and unexecuted evidence SHALL remain pending.
### Selective knowledge and learning
- RF-8: WHEN any department needs reusable context or produces learning, THE SYSTEM SHALL consult only relevant available repo/brain sources, communicate reused decisions and obtain approval for new technical choices or cross-project knowledge promotion.

## Non-functional requirements
- English names and repository artifacts; chat follows the owner's language. Common department names are Understand, Design, Build, Verify and Learn.
- Keep existing tool-neutral installation and member identities; no tool-specific handwritten variants or mandatory external service.
- Configuration references reusable procedures; it does not preload every skill, domain source or external vault. Preserve the active content ratchet; any new member or budget needs owner approval.
- One project-owned configuration, no directory/document per department. No runtime engine, package dependencies or schema format beyond recorded owner decisions is selected in this spec.

## Test scenarios
Draft acceptance scenarios below describe expected behavior, not executed evidence. Manual instruction-following rows remain manual until the approved plan assigns any separately testable configuration/CLI fixtures.
### RF-1
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-1.H1 | happy [manual] | an owner selects an established software change | the process is described | the five departments map to the existing software activities |
| RF-1.E1 | edge [manual] | software TDD needs tests before product implementation | work is prepared | test preparation is allowed before Build and Verify checks actual results |
| RF-1.F1 | failure [manual] | a proposed process omits any acceptance evidence | the proposal is reviewed | the missing verification is reported instead of declaring the process ready |
| RF-1.S | n/a — department labels introduce no trust boundary | n/a | n/a | n/a |
### RF-2
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-2.H1 | happy [manual] | an owner describes software work and existing requirements | initialization runs | a grounded software process proposal explains activities and deliverables |
| RF-2.E1 | edge [manual] | the type of work does not match an available process | initialization runs | the agent asks grounded questions and proposes a draft rather than inventing domain expertise |
| RF-2.F1 | failure [manual] | the owner has not resolved a behavior or approval decision | initialization reaches that decision | the choice remains open and configuration is not reported approved |
| RF-2.S1 | security [manual] | a request to describe a project includes secrets | initialization records context | configuration records only safe references and never credential values |
### RF-3
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-3.H1 | happy [manual] | an approved project-specific department adjustment | configuration is recorded | the adjustment and applicable references are represented in the single project configuration |
| RF-3.E1 | edge [manual] | a project uses the unchanged common behavior | configuration is proposed | it does not repeat all toolkit instructions or create a document per department |
| RF-3.F1 | failure [manual] | an invalid or contradictory department setting | configuration is assessed | the conflict is reported and no guessed setting is silently applied |
| RF-3.S1 | security [manual] | a setting requests tools beyond the owner-authorized scope | configuration is assessed | configuration alone does not grant those permissions |
### RF-4
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-4.H1 | happy [manual] | a configured software project adopts departments | the approved mapping is applied | triage/slices/spec/clarify remain in Understand and plan/tasks remain in Design |
| RF-4.E1 | edge [manual] | a working project has no new project configuration | an existing SDD entry point is used | the current workflow remains usable and no forced migration or guessed configuration occurs |
| RF-4.F1 | failure [manual] | an update would weaken a critical gate or change a frozen test boundary | adoption is proposed | the conflict is reported and the existing protection remains binding |
| RF-4.S1 | security [manual] | a config is read without commit or deployment authorization | a phase completes | no commit, push, merge, deployment or extra tool permission is inferred |
### RF-5
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-5.H1 | happy [manual] | existing Rigorkit instructions and personalized evaluation rules | adoption runs | the proposal preserves customization and identifies the actual artifacts it references |
| RF-5.E1 | edge [manual] | a selected change is already in progress | adoption is proposed | its actual scope/evidence/approval state is preserved rather than silently reset |
| RF-5.F1 | failure [manual] | a source needed to substantiate a baseline is unavailable | adoption examines the source | the gap remains explicit and no current behavior is invented |
| RF-5.S1 | security [manual] | project-local private brain settings should not be shared | configuration is prepared for version control | personal paths/credentials are kept out of shared project configuration |
### RF-6
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-6.H1 | happy [manual] | a department has an applicable existing specialist | the activity is assigned | that capability is referenced with its actual purpose and constraints |
| RF-6.E1 | edge [manual] | no specialist exists but the main agent can perform the bounded activity | the activity is assigned | fallback responsibility and capability gaps are visible without generating a new skill |
| RF-6.F1 | failure [manual] | an unavailable reviewer or domain authority is necessary for acceptance | verification is requested | the missing evidence/independence remains pending rather than self-certified |
| RF-6.S1 | security [manual] | a third-party skill requests broader tools or bypasses owner gates | the skill is considered | its contents do not override governing rules or grant authorization |
### RF-7
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-7.H1 | happy [manual] | a software behavior with an existing test setup | the verification strategy is proposed | relevant unit/integration/TDD practices and protected test boundaries are retained |
| RF-7.E1 | edge [manual] | an outcome cannot be validated by automated tests | acceptance evidence is defined | a bounded manual method and observable criteria are proposed instead of artificial code tests |
| RF-7.F1 | failure [manual] | a claimed success has no executed observation or test result | Verify assesses acceptance | the result is pending rather than fulfilled |
| RF-7.S1 | security [manual] | verification would require browser/Docker/e2e or another restricted command | the strategy is executed | the activity waits for explicit authorization rather than starting infrastructure |
### RF-8
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-8.H1 | happy [manual] | an applicable approved repo decision | a department reuses it | its source and applicability are communicated |
| RF-8.E1 | edge [manual] | no external brain is configured | work proceeds | repository context remains sufficient and no vault setup is forced |
| RF-8.F1 | failure [manual] | the brain contradicts the repository or applicability is uncertain | a decision is considered | repository rules govern and unresolved owner choices are reported |
| RF-8.S1 | security [manual] | learning contains project-private data or secrets | promotion is proposed | sensitive content is excluded and nothing is promoted without owner approval |

## Out of scope
- Changing any adopting project, including the owner's current software projects or a friend's private prompts/policies.
- Full BPM runtime, parallel/conditional workflow engine, plugin marketplace/catalogs, remote downloads and external integrations.
- Automatic generation of domain skills or subagents, model/provider changes and claims of domain expertise.
- Replacing existing software verification with generic checkboxes, mandatory code tests for every work type, new automatic approvals, commands or commits.
- Full prompt-project process and distributable plugin packaging until separately selected/approved.

## Completion criteria
- Approved source contracts map each common department to its actual software activity and acceptance evidence.
- Relevant configuration/adoption compatibility checks and available unit/integration fixtures pass; model instruction-following observations and all unrun checks are stated separately.
- Existing SDD entry points, specialist triggers, approval/command boundaries and personalized project content are preserved.
- Public docs/initialization guidance agree with implemented capabilities; no claim that deferred prompts/plugins/runtime exist.
- Content identity/budget limits remain within the active ratchet or an explicitly approved new baseline.
- Owner accepts each implementation slice; no archive or next-slice authority is inferred.

## Questions and answers — reused owner decisions
1. Does the owner need to design phases? → No. Initialization interviews about work, outcomes, rules and evidence, then proposes the process.
2. Which common departments? → Understand, Design, Build, Verify, Learn; English names.
3. Where is project configuration? → `.rigorkit/project.yaml`, versioned with the project; department-specific adjustments belong inside it.
4. Are spec/plan/evidence copied into configuration? → No. Configuration references them; Understand owns spec/clarification and Design owns plan/tasks.
5. Must every work type use automated tests? → No. Agree suitable acceptance evidence first; retain TDD where applicable to code.
6. Must every domain/project get a new skill? → No. Reuse existing capabilities; the main agent can perform bounded work with declared limitations. Independent review cannot be self-certified.
7. Does the brain disappear? → No. It remains selectively available throughout; repo rules govern, new decisions and promotion keep owner gates.
8. Where is implementation performed? → First in Rigorkit. Adoption in other projects is a separate operation.
9. Which delivery comes first? → Software only; prompts in a second slice.
10. Which branch convention? → English Gitflow-style feature/ or feat/ names; this change uses feature/project-processes.

## Clarification state
Verdict: approved for plan/tasks by owner reply "go ahead" on 2026-11-06; implementation requires the separate plan/tasks gate.
- Resolved by owner: software first. This slice delivers common departments, project configuration and software initialization/adoption; a usable prompt process is deferred.
- Resolved from the agreed department/domain model: software is the first lane; design/security remain specialist capabilities, not parallel domain lanes. Keep pack/member names and current triggers. This concrete mapping is included in the spec approval gate.
- Technical choices deferred to plan approval: configuration schema/versioning/default resolution, how existing entry points obtain configuration, capability lookup/conflicts and distribution/naming. No new pack, parser or executable plugin mechanism is approved by this draft.

## Delivery evidence
2026-11-06: requirements captured from the owner's design discussion. Current sources: AGENTS.md and specs/constitution.md; specs/capabilities/factory-lanes/spec.md; packs/sdd/README.md; sdd-init/adopt/spec/clarify/triage/tasks skills. Existing repo rules override historical draft vault notes, including the retained two-reviewer profile. No code, installed project, existing skill, template or public README has been changed by this spec draft. No tests/build/browser/deployment or commits performed for this change.
