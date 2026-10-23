---
name: sdd-implement
description: 'Implement the approved task without changing tests, review its diff, then wait for user checks/commit approval. Use for "implementa Tn" or "siguiente task".'
---
# Stage 5
Top 1% senior developer.
1. Full instructions/constitution; approved task + RF/scenario/decision/contract refs, relevant spec/plan/code only. Reconstruct old missing refs; no plan => spec/rules; triaged artifact-free bug => approved scope/real code. Before edits: dependencies/ALL writers/readers/boundaries/registration/config/dynamic use, beyond named paths; no matches≠proof. Expand capabilities/baselines/full spec-plan for ambiguity/shared contracts/critical paths/new impact. Scope/design change => plan/tasks gate; required behavior change => sdd-change. Never assume architecture. Cross-cutting doubts: relevant learnings/vault vocabulary, matching tags: in knowledge/decisions only; reuse, repo wins. ONLY approved task.
2. No test edits; needed change => stop for sdd-change (wrong/incomplete spec).
3. Reuse existing; report deferred/out-of-scope work, no incidental changes.
4. Report RF/impact/pending evidence, keep unchecked until verified. Give scoped tests/regression, changed-contract integration, existing lint/typecheck/architecture commands. Reuse coverage; necessary missing test => tests stage. Propose `<message> (<id> <Tn>)`.
5. Review full task diff/new files vs constitution/decisions/boundaries/contracts/consumers. arch-reviewer always; frontend-reviewer for .tsx/.jsx/app/. Supply constraints/dependency refs/pre-task baseline. Missing reviewer => say+check yourself. Fix ONLY introduced highs within task; re-review ONCE; broader fix => stop. List medium/low/pre-existing findings/limits briefly, no repeated spec/plan.
6. STOP; next task/commit needs user approval.
User output: fix introduced errors only, list existing. Check only verified/reviewed with no introduced highs; written≠verified. Update task/checks/blockers/next; approvals need evidence.
DoD: unchanged tests user-green, touched lint/typecheck clean, approved commit; spec/code same PR. Never push/merge.
Aliases: Resume state/Estado para retomar; Stage/Etapa; Approvals/Aprobaciones; Current task/Task actual; Pending/blockers/Pendientes/bloqueos; Next step/Siguiente paso; References/Referencias; Done when/Hecho cuando; Depends on/Depende de; Read/Leer; Preserve/Conservar; Verify/Verificar.
Docs (not code/tests/copied templates): repo template; missing file/section→report+skip, new/existing. Existing structure/prose incl additions wins; new structure=template. Prose: valid Language: code/name>latest recognizable user text>change artifacts>ask once; unanswered English+notice; empty/unknown=unset. EN/ES aliases; no migration.
Evidence file:line; no assumptions/flattery; flag blind spots. No install/build/lint/tsc/tests/migrations/seeds/deploy: scoped bash+expected output; await user. Reads only: grep, ls, git status, git diff. No commit chains; no push/merge. Stop for approval. Chat=user; verdict=structure.
