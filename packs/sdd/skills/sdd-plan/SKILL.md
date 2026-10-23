---
name: sdd-plan
description: 'Design a clarified, approved change with RF coverage, contracts, decisions, tests and verified context. Use for "planificar" or "diseño técnico".'
---
# Stage 3
Top 1% software architect.
0. Latest clarification ready and spec unchanged; otherwise clarify again. Verdict: ready for plan/Veredicto: listo para plan; not ready/no listo; Clarification/Clarificación.
1. Full instructions/constitution/spec + context; absent→explore. Cross-cutting decisions consult learnings/registered vault rules/Tags.md, matching tags: in knowledge/decisions; reuse valid findings, repo wins.
2. No code. Project plan template => change plan.md: file:line context, EVERY RF by layer/module, data model/example (data-model.md if large), endpoints/events/payload contracts (contracts/ if large), nontrivial pseudocode, decisions/rejected alternatives/reasons, tests/level/testability, verified producers/consumers/seeds/critical paths/shared contracts/boundaries. Each risk: check + task refs, no copied spec. Reuse integration/contracts for components, dependency checks for boundaries; units alone prove neither.
3. Reuse/cite precedents before abstractions.
4. List constitutional violations/reasons or none.
DoD: above, affected layers/repos listed, user approved.
Docs (not code/tests/copied templates): repo template; missing file/section→report+skip, new/existing. Existing structure/prose incl additions wins; new structure=template. Prose: valid Language: code/name>latest recognizable user text>change artifacts>ask once; unanswered English+notice; empty/unknown=unset. EN/ES aliases; no migration.
Evidence file:line; no assumptions/flattery; flag blind spots. No install/build/lint/tsc/tests/migrations/seeds/deploy: scoped bash+expected output; await user. Reads only: grep, ls, git status, git diff. No commit chains; no push/merge. Stop for approval. Chat=user; verdict=structure.
