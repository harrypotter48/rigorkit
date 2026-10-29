# sdd — Spec-Driven Development
Start from a feature, propose the smallest useful vertical slices, and let the owner select one. Agree WHAT/WHY (spec + clarification), then HOW (design + plan/tasks) before code. SDD remains the delivery method; the factory coordinates its stations. Each slice is accepted separately; tasks are internal work, not separate user outcomes. Every new technical decision and every commit require explicit approval. Stricter project/user instructions win.

Lane: SDD, the core lane. It runs from triage to archive and calls the specialists of the other lanes in its review station.

## Agent rules
Top 1% role for its stage; no flattery, identify blind spots. Batch independent searches; filter command output with existing summary helpers when available, retaining failures/IDs/status and evidence gaps. Verify code with file:line, never assume. Agents may run existing scoped unit/integration tests (Jest or equivalent). Browser/Docker/e2e require an explicit request; install/build/lint/typecheck/migrations/seeds/deploy remain outside that permission. Missing services => pending evidence, never start infrastructure. Honor stricter project rules. Propose one commit per verified block; every commit needs explicit approval, never chain commits, push or merge. Stop at shared design gates, block review, missing evidence or consequential uncertainty; no stop between internal tasks.

## Repository layout
```
specs/
  constitution.md              principles (at most 15 lines) and critical paths; Language:
  backlog.md                   flat story/slice index; local Factory v2 entry work
  baselines/<module>.md        behavior at adoption
  capabilities/<area>/spec.md  current system, not change history
  changes/<id>/                spec, plan, tasks (+ data-model/contracts), or non-owner proposal
  archive/<id>/                completed changes
  half-wired.md                unfinished-feature register
  learnings/<id>-<slug>.md     reusable generic team knowledge, written by sdd-archive
  templates/                   copies from sdd-init
  scripts/check-scenarios.mjs  scenario structure/test-coverage check, copied by sdd-init
```
ID = NNN-kebab-name (e.g. 007-bank-transfer); methodology lives in rigorkit, project artifacts in their repo.

## Selective context, global verification
Read full applicable instructions/constitution once per unchanged context; never truncate governing rules. Load only the active skill, then its paired successor when needed. Reuse in-context sources and evidence while their revision/scope remains valid; search first, read relevant ranges, never whole archives/modules by default. Source revision includes working-tree edits, not HEAD alone. Recheck affected paths/diffs on resume, edits or external changes; after context loss reload governing rules and referenced evidence, not transcripts.
Start a block from its RF/scenario/decision/contract references and shared dependency map; tasks reference these instead of copying them. Trace actual dependencies/all producers/consumers beyond initial paths. Expand capabilities/baselines/spec/plan for missing refs, ambiguity, shared-contract changes, critical paths or growing impact; record unresolved dependencies, never infer safety from no matches. Recheck affected refs/consumers after edits, reuse unaffected findings. Scope/behavior/design changes return to their approval gate. Reuse integration/contract/dependency checks; local units alone are insufficient. Keep critical DoD.
Resume uses brief block/task state checked against current files/evidence; checkbox/commit never proves approval or green tests. Review the combined block diff once, rechecking fixes/changed dependencies rather than repeating each task review. Final verification still reads full spec/plan and accumulated diff, checks architecture/contracts/cross-block effects, regressions and live behavior. Reuse valid block evidence, never substitute it for global review. Missing reviewers mean manual checks. Mark complete only after verification; report evidence/pending work briefly.
Installed copies need reinstall. Existing project templates stay in their structure/language; do not overwrite custom rules or migrate other repos. Missing artifact/templates sections are reported and skipped. New prose uses constitution Language:, else latest recognizable user language, then existing change artifacts; if neither exists ask once, fall back to English and say so if unanswered. Existing artifacts keep their prose/structure; chat follows user, fixed verdicts follow structure. Language may be a code/name; empty/unknown is undeclared.

## Stages
| Stage | Skill | Role (top 1%) | Gate | Approval |
|---|---|---|---|---|
| Setup | sdd-init | Tech lead | specs/ and templates created | Yes |
| −1 Adoption (mandatory for existing code) | sdd-adopt | Architect | Constitution/critical paths; module baselines with file:line; half-wired proposals | Yes |
| Entry (Factory v2 work) | sdd-slice | Product manager | Propose useful vertical slices, backlog order/dependencies; select one | Owner selection |
| 0 Triage | sdd-triage | Tech lead | Size/owner/ID/DoD, critical if uncertain | Yes |
| 1 Context | sdd-context | Senior engineer | Current code evidence and unknowns | — |
| 2 Spec | sdd-spec | Product manager | >=5 questions, one at a time; EARS, 4 scenario types or justified n/a, exclusions, no code references | Continue to clarify |
| 2.5 Clarify | sdd-clarify | QA | Auto-audit/fix grounded gaps; ask user decisions; zero high/medium; re-audit edits | Approve clarified spec |
| 3 Plan | sdd-plan | Architect | All RFs, rejected alternatives, constitution validated | Continue to tasks |
| 4 Tasks | sdd-tasks | Tech lead | Functional blocks with internal tasks, RFs, dependencies, refs and checks; no time-box split | Approve plan + blocks/tasks |
| 4.5 Tests first | sdd-tests | Testing engineer | Block scenario-ID tests, intended-red evidence; whole-change gaps remain explicit | Recorded red evidence; owner decisions |
| 5 Implement | sdd-implement | Senior developer | Whole approved block; combined diff review; green before completion | Block review + each commit |
| 6 Verify | sdd-verify | QA | Scenario/test/result table, global diff/contracts, cross-layer, critical DoD, reviewer verdicts, approval decision, verdict | User closes |
| 7 Archive | sdd-archive | Documenting engineer | Archive/capabilities/baselines current, half-wired registered, learnings proposed | Yes |

Support: sdd-resume (new session), sdd-change (requirements: spec first), sdd-legacy-review (@legacy), sdd-explain (explain.md summary/Mermaid/walkthrough/RF mapping; archive proposes when warranted). Readonly agents: sdd-explorer for context/adoption; sdd-reviewer for clarification/verification/independent review; sdd-approver for the delivery decision. Writable agent: sdd-builder implements one approved block from a fresh context. Optional [architecture](../architecture/README.md)/[frontend](../frontend/README.md)/[design](../design/README.md)/[security](../security/README.md) reviewers get diff/constraints; frontend only for .tsx/.jsx/app/; missing packs are reported and checks still performed.

## Review stations
Triage proposes the review profile of each change: architecture and frontend reviewers, plus the security reviewer for sensitive paths and the interface reviewer for rendered screens; the project constitution can force more. After the builder, the enabled reviewers run together, each with the same references and no other reviewer's report. Their corrections are re-reviewed together once, then the change escalates to the owner. sdd-approver aggregates the verdicts into approved, needs human or failed, and the owner closes the change. Interface improvements never block; an interface defect blocks only when the same change does not correct it.

## Stations and handoffs
The owner supplies a feature intent; `sdd-slice` proposes stories/tickets that each represent a useful vertical slice. Do not create parallel HU/ticket/slice hierarchies. Setup/adoption precede the first change, and triage/context route the selected slice before its spec.

| Station | Required input | Output / exit criterion |
|---|---|---|
| Slice | Intent, relevant repo/vault facts | Smallest independently useful outcomes, dependencies and owner-selected priority |
| Specify + clarify | Selected outcome, applicable decisions | Behavior/acceptance/scenarios/exclusions clarified; owner approves WHAT |
| Design + plan | Approved spec, actual consumers/contracts | Minimum design and internal tasks; new technical decisions and HOW approved |
| Prepare tests | Agreed scenarios and test strategy | Discriminating tests; intended behavioral failure or valid existing coverage recorded |
| Build | Approved references and test evidence | Minimum implementation, permitted test results, diff and unresolved items |
| Review + accept | Spec, decisions, accumulated diff and evidence | Compliance and architecture checked separately; owner accepts this slice |
| Close + learn | Accepted result, validation gaps and discoveries | Repo state/knowledge updated, learnings proposed; next slice remains owner-selected |

Pass scope, decision/source references, affected consumers, evidence and open questions at every handoff. Never infer success from a previous agent's report alone. A code defect returns to build; a behavior or technical-design decision returns to its owner approval gate. The coordinating caller preserves the slice contract and routes blockers; it cannot approve decisions for the owner.

## Using the paired flow
Answer the interview, let clarification fix only gaps grounded in those answers, then approve the clarified spec. The agent prepares design/plan/tasks for your second review. It communicates reused decisions with their repo/vault source and waits for every new technical decision. An unclear source or conflicting repo rule becomes a question.

One slice normally uses one approved implementation block (B1), with dependent internal Tn tasks. Do not add another decomposition level unless needed and approved. Across repositories, preserve one observable result, verified producer/consumer contracts and one change owner; independent delivery must account for real dependencies. Review each slice while its context is small; retain final cross-slice/whole-change checks where required.

See [examples](examples.md) for a backlog, a spec excerpt, per-instance configuration, JavaScript/Jest code and a handoff report. These examples illustrate contracts; they are not a new architecture imposed on adopting projects.

## Functional blocks
A block delivers one verifiable behavior across its required layers; a small feature can be one block. Large features use dependent blocks with explicit integration points, not arbitrary minute/line limits. Group internal tasks by block, share references/checks, keep every RF assigned. Approval names the authorized block(s); never infer authorization for the next block or a commit. Continue internal tasks without permission prompts, but pause for required checks outside the permitted unit/integration boundary, blockers or scope/design decisions. Do not collect red evidence for unrelated future blocks. Whole-change verification still covers all blocks together. Legacy Tn tasks without blocks remain single-task units until regrouping is approved; preserve IDs/completion/evidence, never silently migrate project files.

## Scope and DoD
Bugfix/adjustment without observable change: no artifacts, commit only. Small single-repo feature: spec+tasks. Architecture/data-model change: spec+plan (+data-model)+tasks. Multi-repo: full artifacts in owner, proposal elsewhere.
Normal DoD: all required scenarios covered/green, coherent DB→API→DTO→frontend, same ID across repos, remaining half-wired registered and owner acceptance for each slice; archive after acceptance. Required live/browser/e2e checks stay pending until explicitly requested/performed; unit/integration green alone cannot establish that evidence. Critical (money/tenants/permissions/real-data migrations) adds relevant failure test, real-data smoke, existing-flow regression and honest missing-evidence report; see skills/sdd-verify/dod-critical.md.
Same ID everywhere; non-owners have proposal pointing to owner plus their tasks. Learnings only in owner. Each repo specifies its own work (API contract where implemented, UI where rendered).

## Scenarios and TDD
All RFs have happy/edge/failure/security or justified n/a rows, at either DoD level; critical adds evidence, not fewer scenario types. See skills/sdd-init/templates/scenarios.md. sdd-spec writes, sdd-clarify/reviewer audit (missing type = high and blocks plan), user approves table instead of code, sdd-tests writes ID-titled tests before implementation (4.5), checker verifies coverage in pre-push/CI. Pure visual UI uses [manual]; live/browser checks require an explicit request and otherwise remain pending; the interface reviewer reports defects and improvements, and only an uncorrected defect blocks.

## Optional vault
Works without one. When configured, the vault is a brain available at EVERY station, including reviews and closure; search matching tags/notes when a question or decision needs it, reuse valid evidence, and never reload the whole vault by default. Communicate every reused technical decision with its source and why it applies; new decisions need approval, conflicts/uncertain applicability return to the owner. The repo wins. specs/learnings/ stores generic reusable team knowledge; repo-specific facts stay in constitution/capabilities. Archive proposes missing promotions including teammates' learnings. Ask once if unregistered and store approved response in unversioned user-local instructions. Link every promoted note from vault entry; never isolated notes. Vault rules win; see skills/sdd-archive/vault.md.

## Allowed execution and delivery evidence
Use existing scoped unit/integration scripts and dependencies; no automatic package installation. Browser, Docker and end-to-end tests require an explicit request. Install/build/lint/typecheck/migrations/seeds/deploy require their own authorization. Integration requiring unavailable services stays pending. Give passing, failing and unrun checks separately with their scope; never present green unit tests as proof of the complete system.

This is the agreed operating contract. Factory v2 implementation is in progress: do not claim automatic frozen-test enforcement, branch-trace enforcement, tier routing or migrated installed copies merely because they are described in a draft. The slice/backlog entry is local work awaiting its delivery evidence.
