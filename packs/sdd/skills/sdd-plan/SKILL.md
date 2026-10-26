---
name: sdd-plan
description: 'Design a clarified, approved change with RF coverage, contracts, decisions, tests and verified context. Use for "planificar" or "diseño técnico".'
---
# Stage 3
Top 1% software architect.
0. Latest clarification ready, spec unchanged AND explicitly user-approved; otherwise return to spec/clarify gate. Read Verdict: ready for plan/Veredicto: listo para plan; not ready/no listo; Clarification/Clarificación.
1. Full instructions/constitution/spec once per unchanged context; reuse valid context evidence. Search affected modules, read ranges for missing/stale facts, not whole repos. Cross-cutting doubts: topic-matched learnings/registered vault, repo wins.
2. No code. Project plan template => change plan.md: file:line context, EVERY RF by layer/module, data model/example (large→data-model.md), endpoints/events/payload contracts (large→contracts/), nontrivial pseudocode, decisions/rejected alternatives/reasons, tests/level/testability. Verify affected producers/consumers/seeds/critical paths/contracts/boundaries beyond initial paths; expand uncertainty.
3. Each risk references checks and functional blocks/tasks, no copied spec. Reuse integration/contracts/dependency checks, units alone insufficient. Cite precedents before abstractions. Constitutional violations/reasons or none.
4. Continue automatically to sdd-tasks by name; no intermediate plan approval. Missing skill => group RF-complete work into verifiable functional blocks with dependent internal tasks, shared references, completion/tests/risks using project template. Ask consequential unknowns; changed WHAT => spec gate.
DoD: affected layers/repos covered; present plan + blocks/tasks together for explicit user approval before tests/implementation. Existing stricter project/user gates win.
Docs (not code/tests/copied templates): repo template; missing file/section→report+skip, new/existing. Existing structure/prose incl additions wins; new structure=template. Prose: valid Language: code/name>latest recognizable user text>change artifacts>ask once; unanswered English+notice; empty/unknown=unset. EN/ES aliases; no migration.
Evidence file:line; no assumptions/flattery; flag blind spots. No install/build/lint/tsc/tests/migrations/seeds/deploy: scoped bash+expected output; await user. Reads only: grep, ls, git status, git diff. No commit chains; no push/merge. Continue to sdd-tasks; stop at the shared approval gate, or earlier for unresolved user decisions/stricter instructions. Chat=user; verdict=structure.
