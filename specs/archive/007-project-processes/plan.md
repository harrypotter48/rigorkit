# Technical plan — 007-project-processes
Date: 2026-11-06 · Status: approved by owner "adelante" on 2026-11-06; implementation B1 authorized.

## Current context
- AGENTS.md:5–16 and specs/constitution.md:7–14 require tool-neutral members, owner gates, self-contained skills, existing SDD behavior, bounded commands and selective knowledge. This plan proposes replacing the old public lane taxonomy, not existing member identities.
- packs/sdd/skills/sdd-init/SKILL.md:6–10 proposes/copies local templates and scripts only after approval, never overwrites existing specs, then uses sdd-adopt for existing code. packs/sdd/skills/sdd-adopt/SKILL.md:6–12 grounds baselines in real code without fixing it.
- specs/templates/AGENTS.md:8–14 and its mirrored copy hold project flow, permissions, frozen boundaries, independent review and learnings. Both copies must remain equal.
- install.sh:76–87 and :257–264 already discover/copy skills for any selected pack; core currently has rules/scripts but no skills. No installer code change is required to discover the proposed members. packs/core/README.md currently describes global-only rules; update it to distinguish project-installable skills from unchanged global-only rules/scripts.
- tools/measure-content.mjs:70–93 measures skill Markdown and :207–224 requires baseline registration for a newly populated pack. Active baseline: specs/changes/006-factory-v2/baseline.txt. A core skill budget/member registration requires approval; archived evidence remains immutable.
- Public docs originate in README/pack Markdown; site/scripts/prepare-docs.mjs imports them. Do not edit generated docs. No adopting project or installed copy is part of this change.

## Structure by layer / module
| Module | Proposed change | RFs |
|---|---|---|
| packs/core/skills/core-init/ | New top-1% project-initialization skill and LOCAL project.yaml template; interview, proposal/diff, owner-approved creation/adoption and optional software handoff | RF-1–RF-5, RF-7, RF-8 |
| packs/core/skills/core-context/ | New reference skill with its LOCAL configuration contract, department mapping and capability-resolution rules; read-only, follows caller's gates | RF-1, RF-3, RF-4, RF-6–RF-8 |
| packs/sdd/skills/sdd-init/, sdd-adopt/ | Keep existing direct entry points; offer configuration/adoption explicitly; no generic↔SDD recursion, no new hard dependency | RF-2, RF-4, RF-5 |
| packs/sdd/skills/ and agents/ | Add department ownership and applicable-config reference at entry/handoff while preserving existing names, scope and mandatory checks/reviewers | RF-1, RF-4, RF-6–RF-8 |
| specs/templates/AGENTS.md and mirrored copy | Project configuration pointer, department mapping and unchanged instruction precedence/permissions | RF-1, RF-3–RF-8 |
| README, AGENTS, core/sdd/design/security pack READMEs | Explain lane versus department versus pack, generic/software entries, capabilities, optional core installation and deferred features | RF-1–RF-8 |
| tools/test/project-processes.test.mjs (proposed) | Only meaningful deterministic template/copy/compatibility checks; never claim arbitrary YAML/model semantic validation | RF-3–RF-6 |
| specs/changes/007-project-processes/validation.md (later) | RF/scenario source and executable/manual evidence, original review results, unrun checks, budget and approvals | RF-1–RF-8 |

## Data model
The user already chose `.rigorkit/project.yaml`. Proposed schema 1 is a small declarative agreement, NOT executable workflow state. Example:

```yaml
schema: 1
lane: software
references:
  rules:
    - specs/constitution.md
departments:
  verify:
    skills:
      - team-contract-evaluation
    outputs:
      - specs/templates/validation.md
```

- `schema` is the integer 1 and `lane` is `software` for this release. Other lanes/versions are reported unsupported, never silently executed as software. An unknown domain can be interviewed and drafted, but does not become an installed runnable lane.
- `references` is optional. `rules` and `knowledge` are optional lists of explicit repository-owned file references, not inline copied instructions. Private vault locations remain in existing unversioned user-local instructions; no new mandatory brain registration.
- `departments` is optional and permits only `understand`, `design`, `build`, `verify`, `learn`. Omitted departments use the software defaults below; the template contains no empty department folders or copied full playbooks.
- Each department may declare optional `skills`, `agents`, `inputs`, `outputs` reference lists and `approval: required`. Lists add requirements/capabilities to baseline software behavior; they never remove mandatory stages, role separation, reviewers, tests or owner approvals. `approval: optional/none/automatic` is invalid for weakening an existing gate. More expressive replacement/routing is deferred.
- `skills`/`agents` are actual installed member identifiers; file references belong in `references`, `inputs` and `outputs`. New private naming schemes, global search rules and namespaces are not introduced. A custom owner-selected capability stays a reference; no copying/generation/installation occurs.
- Unknown control keys, contradictory settings and ambiguous references are reported for correction. No anchors, shell interpolation, executable hooks or remote sources are supported as execution features.
- Actual change status/evidence remains in existing spec/tasks/validation documents. The configuration records no inferred completed steps or approvals.

## Software department defaults
| Department | Existing work and invariants |
|---|---|
| Understand | Triage, useful-slice selection, context, spec and clarify; owner approves WHAT. Keep existing earlier triage/slice gates. |
| Design | Approved scope, technical design/plan/tasks; communicate reused choices and approve new choices/HOW. |
| Build | Existing test-first preparation and minimal implementation. Tests may be prepared before code; their existing independent commit/freeze gates remain. |
| Verify | Scenario/consumer evidence, scoped regression/integration, integrity/trace checks and independent conformance+architecture plus triggered specialists; owner accepts this slice. Verification also informs earlier departments. |
| Learn | Existing archive/state updates and approved learning capture/promotion, after acceptance. |

Design and security retain their current pack/member names and specialist behaviors. They are capabilities called within the software process, not separate work-domain lanes in the new descriptions. This changes vocabulary, not permission to skip their triggers. No renaming of the installed architecture/frontend/design/security/sdd members or automatic reclassification of current changes.

## Algorithms
### Initialization/adoption
1. Read applicable instructions once, detect selected/current work and existing project configuration. Interview only unanswered questions about real outcomes, artifacts, rules, evidence and capabilities; ask one unresolved decision at a time.
2. Propose the software mapping and exact configuration/AGENTS diff, citing verified current paths and reused decisions. Stop at owner approval before writes; no baseline/constitution/code change is implied by approval of configuration alone.
3. Write only explicitly approved files/sections. Existing valid equivalent configuration is a no-op. Existing unknown/custom settings are preserved and explained; conflicting or unreadable config is not replaced, partially interpreted or silently ignored.
4. Offer sdd-init if project artifacts are missing, then sdd-adopt for existing code under its own proposal/module gates. Preserve current scope, IDs, approvals, evidence and frozen boundary. No automatic next slice, commits or installation.
5. Legacy sdd-init remains callable alone. If core is present it may call core-init in configuration-only mode; that mode NEVER calls back to sdd-init. If absent, preserve existing SDD behavior and report the optional new configuration capability as unavailable.

### Reading configuration and assigning work
1. Call core-context by member NAME when available, not another skill's internal file path. Read the project's actual config and governing sources only once per unchanged context; invalidate affected values after edits or lost context.
2. No config means legacy software flow, not an invented on-disk config or forced migration. Present config with missing/unknown core capability means report the limitation and read the explicit governing project instructions; never declare requested custom routing successfully applied.
3. Resolve owner-referenced capabilities through the host's available-skill/agent inventory and verified project references; do not recursively scan the home/vault or invent precedence between duplicate names. Missing/duplicate/inapplicable capability returns a clear gap.
4. A missing optional specialist can be assigned to the main agent only with declared limitations and existing authority. If required independence, a required specialist or evidence cannot be supplied, keep acceptance pending and ask owner; self-review is never independent review.
5. Added capabilities/artifact references do not weaken baseline gates. Conflicting permission/behavior/design decisions return to the owner. No external skill can authorize tools or rewrite project policy.

## Contracts
- New entries: `core-init` (top-1% project onboarding lead; initialization/configuration-only modes) and `core-context` (**Type: reference**, read-only and caller-owned scope/gates). No new generic reviewer/builder/persona is necessary.
- Cross-pack references invoke names only; core-init template stays local to core-init and core-context contract stays local to core-context. Do not read another skill's internal resources. Keep shared public examples outside skill bodies; no mandatory preload of full docs.
- Existing SDD names and direct installed entry points remain; absent core keeps legacy SDD usable. Selecting `--pack sdd` must not secretly install core or require a parser/runtime. Selecting `--pack core` can install new skills through existing installer discovery; global rules remain global-only.
- No standalone schema checker/parser/runtime is shipped in this slice. YAML is consumed as declarative agent context, with a documented schema and explicit unsupported/conflict reporting. Deterministic template/copy checks do not certify that an arbitrary model enforces it.
- Preserve all existing command gates: only existing scoped unit/integration allowed; install/build/lint/typecheck/browser/Docker/e2e/deploy retain separate authorization. Configuration never grants them.

## Decisions approved by owner
- D1: Two common skills in the existing core pack, rather than a new pack or renaming all SDD members. One is initialization, one is a reference loaded only for relevant context; this separates writing gates from read-only context use.
- D2: Schema 1 with additive department adjustments and software only. Keep private brain settings unversioned; avoid generic branching/routing/replacement semantics and per-project skill duplication.
- D3: Agent-interpreted declarative YAML, not a new parser/engine/dependency. Arbitrary YAML/model compliance is manual adoption evidence, not a machine guarantee. Add deterministic parsing only in a later approved slice if real usage needs it.
- D4: Explicit opt-in adoption and legacy no-config/direct-SDD compatibility. No automatic migrations, installations or silent entrypoint replacement.
- D5: Proposed new core loaded-content budget <=1,200 estimated tokens across BOTH skills and all measured auxiliary Markdown (not an exemption for templates/reference files). Preserve SDD <=14,404 and all other pack/global-rule limits; measure actual source before acceptance. Existing baseline has no core skills, so new identities/core budget require explicit approval plus later immutable source-commit capture. Do not edit archived 006 evidence or invent a commit.
- D6: One implementation block for this useful software slice; internal tasks are not separately accepted slices. No prompts process, distributable plugin engine, marketplace or adopting-project changes.

## Constitution
No requested violation of tool neutrality, self-contained resources, soft dependencies, role/stop, source language or user-file preservation. New member names keep the core namespace. Core-context uses the existing reference-skill exception rather than inventing a specialist role. D5 is an explicit proposal for a newly populated core pack; until approved and captured, ratchet identity/core-budget failure is expected and must remain visible. No change to core global rules is planned.

## Test strategy
- Existing toolkit unit/integration suites and website source/workflow unit suites remain regression evidence. Do not add wording/heading snapshot tests that merely restate prose.
- Add only meaningful deterministic fixtures where implementation produces a testable artifact: mirrored templates, a project config copied from the real local template, preserving original project files and a standalone SDD distribution without mandatory core. If a fixture requires executing install.sh, its installation command remains separately owner-authorized; write/inspect it but do not run it without that approval.
- Manual forward exercises for this slice: new software config proposal; adoption with custom instructions and in-progress evidence; no-config legacy path; custom skill reference; missing/duplicate capability; a malicious permission override; unsupported lane/version and absent optional brain. Verify original artifacts and actual observed behavior; source inspection is not a successful agent run. No automated prompt-domain suite is implied.
- All 32 acceptance scenarios remain manual unless a real implemented deterministic behavior justifies an approved executable assertion. Record per-scenario source support, executed result or pending evidence; no structural checker pass or reviewer report is substituted for behavioral execution.
- Test-first/freeze: reuse existing valid tests; new executable behavior needs approved behavioral red/base/test paths or a recorded owner exception. This plan does not authorize real red/amend/green commits. No production stubs to manufacture red.
- No browser/Docker/e2e/full website build/typecheck/installation or deployment under general test permission. Owner may run those checks or explicitly authorize them later. Public-source importer may be exercised against temporary output without publishing.

## Risks and cross-layer
| Risk | Existing producer → consumer | Check / tasks |
|---|---|---|
| Generic/software init recursion | core-init → sdd-init → core-init | Separate configuration-only mode; manual direct/generic entry exercises; T2–T3 |
| Config ignored by a later SDD stage | init/config → project instructions → entry/context/resume/handoff/review | Trace every SDD entry and writable/readonly role, verify changed-config resume and actual handoff; T3–T5 |
| Core becomes mandatory | optional pack → independently installed SDD skills | Absent-core/no-config fixture and manual continuation; T3, T6 |
| Partial overwrite or resetting ongoing work | initialization/adoption → project instructions/spec/evidence | Before/after preservation and explicit proposal checks; T2–T3, T6 |
| Config/skill content weakens authority | project config/custom skill → dispatcher/builder/reviewer | Adversarial reference/gate scenarios, keep required independent reviewers; T4–T6 |
| Duplicate skill names or unavailable expertise | host inventory → assignment → acceptance | No invented lookup precedence, explicit gap versus fallback; T4, T6 |
| New vocabulary hides existing specialist triggers | public docs/templates → triage/review | Full affected-path/global review, identity check and named trigger trace; T4–T7 |
| Token growth or repeated full context | core entries/auxiliary Markdown → each station | D5 measurement, selective once-per-current-source behavior; T2, T4, T7 |
| Documentation diverges from actual installation | pack docs/installer discovery → Pages importer/installed skills | Public-source import and optional authorized temporary installation, generated docs untouched; T6–T7 |

## Approval boundary
Owner approved spec on 2026-11-06. Owner approved D1–D6 and B1 with "adelante". This authorizes only the implementation scope and technical decisions; no real commit, adopting-project migration, extra infrastructure or release action is inferred.
