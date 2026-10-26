# Technical plan — 003-functional-blocks
## Current context
- `packs/sdd/README.md:28` defines separate stages/approvals; `:22` already defines selective startup/global verification.
- `packs/sdd/skills/sdd-implement/SKILL.md:11` reviews each task and `:12` stops before the next.
- `packs/sdd/agents/sdd-reviewer.md:12` previously loaded whole artifacts for every change review.
- `specs/constitution.md:9` and `AGENTS.md:22` previously required each skill to stop; update explicitly for authorized pairs.
References describe the inspected pre-change source, not post-edit line positions.
## Structure by layer / module
| Layer / module | Change | RFs covered |
|---|---|---|
| Root governance, README, SDD README | Paired gates, block execution, context lifecycle | RF-1–RF-4 |
| Website source copy and maintenance README | Expose the same public workflow; existing importer/CI regenerate docs/catalog/search | RF-1–RF-4 |
| spec/clarify/change/plan/tasks skills | Grounded clarification and joint approvals; preserve user decisions | RF-1, RF-2 |
| implement/tests/resume skills + templates | Block state, selective tests/evidence, legacy fallback | RF-2–RF-4 |
| context/verify skills, reviewer/explorer agents | Scoped reuse, dependency invalidation, global closure | RF-3, RF-4 |
## Data model
No runtime model; tasks template gains block/authorization/dependency state. Preserve legacy artifacts.
## Algorithms
Reuse evidence only for unchanged revision/scope. On edit/resume, inspect scoped diff, invalidate affected refs/consumers and expand unresolved impact. After context loss reload governing rules and required original evidence. Whole-change verification retains full coverage.
## Contracts
Skill names/install paths unchanged; English/Spanish structural compatibility retained. No automatic migration or installed-copy update.
## Decisions
- Blocks rather than timed tasks: coherent behavior and one combined review; retain internal checklist/IDs.
- Paired gates rather than one final design approval: user controls behavior before technical planning.
- Inline compact guidance rather than a new mandatory context artifact: no additional per-turn global payload or copied source.
- Keep user-run tests and commit gates; no automation of commands.
## Constitution
Explicitly adjust principle 3 for agreed pairs; preserve self-containment, soft dependencies, roles, English/YAML/identity/global limits. No critical installer/global-rule path edits.
## Test strategy
Read-only diff/consistency review now. User runs content tests, scenario checker and existing estimator; live scenarios validate actual behavior. Estimator measures static payload, not session savings.
## Risks and cross-layer
- Contradictory stops across governance/skills/templates: B1 updates all active producers; historical archive/capability claims remain historical.
- Per-block test coverage could mask other blocks: pending outside-block coverage explicit; final checker must have none missing.
- Stale context could hide dependency drift: B1 adds revision/scope rechecks and mandatory escalation/global review.
- Legacy templates: preserve IDs/evidence; propose missing sections instead of silent migration.
