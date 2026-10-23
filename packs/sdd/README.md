# sdd — Spec-Driven Development
Agree WHAT/WHY (spec), HOW (plan), then steps (tasks) before code. Each stage has an output and Definition of Done gate. Spec, clarification, plan, tasks, tests and every commit require human approval.

## Agent rules
Top 1% role for its stage; no flattery, identify blind spots. Verify code with file:line, never assume. User runs install/build/lint/tsc/tests/migrations/seeds/deploy; agent provides commands and waits for output, reads only. One commit per task with approval; never chain commits, push or merge. Stop at each stage.

## Repository layout
```
specs/
  constitution.md              principles (at most 15 lines) and critical paths; Language:
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
Always read full applicable instructions/constitution; load only current-stage skill. Implementation starts from task RF/scenario/decision/contract references, checks actual dependencies/all producers/consumers beyond initial paths, and expands to capabilities/baselines/full spec-plan when uncertain or impact grows. Changed approvals return to their gate. Reuse integration/contract checks for interactions and dependency checks for architecture; extra local unit tests alone are insufficient. Keep critical DoD.
Resume checks brief tasks state against current files/evidence: checkbox/commit never proves approval or green tests. Closing uses full spec/plan and accumulated diff, architecture/contracts/cross-task effects, regression and live checks. Missing reviewers mean manual checks, not no checks. Tasks reference rather than copy documents; reconstruct old tasks' missing references. Check only after verification; report changes/evidence/pending work briefly.
Installed copies need reinstall. Existing project templates stay in their structure/language; do not overwrite custom rules or migrate other repos. Missing artifact/templates sections are reported and skipped. New prose uses constitution Language:, else latest recognizable user language, then existing change artifacts; if neither exists ask once, fall back to English and say so if unanswered. Existing artifacts keep their prose/structure; chat follows user, fixed verdicts follow structure. Language may be a code/name; empty/unknown is undeclared.

## Stages
| Stage | Skill | Role (top 1%) | Gate | Approval |
|---|---|---|---|---|
| Setup | sdd-init | Tech lead | specs/ and templates created | Yes |
| −1 Adoption (mandatory for existing code) | sdd-adopt | Architect | Constitution/critical paths; module baselines with file:line; half-wired proposals | Yes |
| 0 Triage | sdd-triage | Tech lead | Size/owner/ID/DoD, critical if uncertain | Yes |
| 1 Context | sdd-context | Senior engineer | Current code evidence and unknowns | — |
| 2 Spec | sdd-spec | Product manager | >=5 questions, one at a time; EARS, 4 scenario types or justified n/a, exclusions, no code references | Yes |
| 2.5 Clarify | sdd-clarify | QA | Ready only with zero high/medium findings; every spec edit needs another round | Yes |
| 3 Plan | sdd-plan | Architect | All RFs, rejected alternatives, constitution validated | Yes |
| 4 Tasks | sdd-tasks | Tech lead | <=30 minutes, RF/completion/dependencies/context/restrictions | Yes |
| 4.5 Tests first | sdd-tests | Testing engineer | Scenario-ID tests, intended red, checker finds none missing | Yes |
| 5 Implement | sdd-implement | Senior developer | One task, impact/architecture/contracts checked, green before checkbox | Each commit |
| 6 Verify | sdd-verify | QA | Scenario/test/result table, global diff/contracts, cross-layer, critical DoD, verdict | User closes |
| 7 Archive | sdd-archive | Documenting engineer | Archive/capabilities/baselines current, half-wired registered, learnings proposed | Yes |

Support: sdd-resume (new session), sdd-change (requirements: spec first), sdd-legacy-review (@legacy), sdd-explain (explain.md summary/Mermaid/walkthrough/RF mapping; archive proposes when warranted). Readonly agents: sdd-explorer for context/adoption; sdd-reviewer for clarification/verification/independent review. Optional [architecture](../architecture/README.md)/[frontend](../frontend/README.md) reviewers get diff/constraints; frontend only for .tsx/.jsx/app/; missing packs are reported and checks still performed.

## Scope and DoD
Bugfix/adjustment without observable change: no artifacts, commit only. Small single-repo feature: spec+tasks. Architecture/data-model change: spec+plan (+data-model)+tasks. Multi-repo: full artifacts in owner, proposal elsewhere.
Normal DoD: all scenarios covered/green, coherent DB→API→DTO→frontend, live verification, same ID across repos, archived, remaining half-wired registered, owner approved. Critical (money/tenants/permissions/real-data migrations) adds relevant failure test, real-data smoke, existing-flow regression and honest missing-evidence report; see skills/sdd-verify/dod-critical.md.
Same ID everywhere; non-owners have proposal pointing to owner plus their tasks. Learnings only in owner. Each repo specifies its own work (API contract where implemented, UI where rendered).

## Scenarios and TDD
All RFs have happy/edge/failure/security or justified n/a rows, at either DoD level; critical adds evidence, not fewer scenario types. See skills/sdd-init/templates/scenarios.md. sdd-spec writes, sdd-clarify/reviewer audit (missing type = high and blocks plan), user approves table instead of code, sdd-tests writes ID-titled tests before implementation (4.5), checker verifies coverage in pre-push/CI. Pure visual UI uses [manual] and live verification.

## Optional vault
Works without one. specs/learnings/ is generic, cross-project, team-shared through Git; repo-specific knowledge stays in constitution/capabilities. Triage/context/plan/implementation consult tags only when a question/decision needs it: vocabulary, matching tags: lines, relevant notes; reuse valid context, repo wins. Archive proposes missing promotions including teammates' learnings. Ask once if unregistered and store approved response in unversioned user-local instructions. Link every promoted note from vault entry; never isolated notes. Vault rules win; see skills/sdd-archive/vault.md.
