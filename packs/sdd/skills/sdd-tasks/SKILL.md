---
name: sdd-tasks
description: 'Group a plan into verifiable functional blocks with dependent internal tasks and selective context. Use for "dividir en tareas" or "tasks.md".'
---
# Stage 4
Top 1% tech lead.
1. Reuse full instructions/constitution/approved spec and current plan when required, already in context; otherwise load the needed sources once. Read relevant code/contract ranges to resolve missing facts, not every prior change. Plan may be unapproved during authorized plan→tasks; scope must match approved spec.
2. Project tasks template => tasks.md. Group dependent internal Tn tasks into Bn functional blocks; one verifiable behavior across required layers. No 20–30-minute or line-count split. Small feature can be one block. Every RF assigned, shared refs/checks at block level, no duplicated requirements/decisions. No-observable-change bugfix: no artifact.
3. Per block: behavior/RFs, task IDs, dependencies/integration points, Read refs, Preserve rules/contracts/consumers, Verify scenario/regression/integration/dependency checks, Done when. Tasks retain IDs/layer/repo/action and task-specific dependencies/completion/check exceptions only; initial paths never bound dependency exploration. Without plan use spec/rules; multi-repo same change ID, own tasks.
4. Tests FIRST per selected block, scenario IDs at approved level; reuse valid coverage, not implementation-shaped tests. Whole-change coverage/integration remains final gate. Legacy tasks keep IDs/completion/evidence and single-task boundaries unless regrouping approved; missing template sections => propose minimal additions, do not silently migrate.
5. Brief resume state: stage, evidenced spec + plan/blocks approvals, authorized/current block/task, refs+revision, checked dependencies, pending checks/blockers, next. No transcript/copied spec/invented approval.
DoD: present plan + blocks/tasks for ONE explicit approval naming authorized block(s); no implementation from an unapproved plan. Stricter project/user gates win.
Aliases: Resume state/Estado para retomar; Stage/Etapa; Approvals/Aprobaciones; Current task/Task actual; Pending/blockers/Pendientes/bloqueos; Next step/Siguiente paso; References/Referencias; Done when/Hecho cuando; Depends on/Depende de; Read/Leer; Preserve/Conservar; Verify/Verificar.
Docs (not code/tests/copied templates): repo template; missing file/section→report+skip, new/existing. Existing structure/prose incl additions wins; new structure=template. Prose: valid Language: code/name>latest recognizable user text>change artifacts>ask once; unanswered English+notice; empty/unknown=unset. EN/ES aliases; no migration.
Evidence file:line; no assumptions/flattery; flag blind spots. No install/build/lint/tsc/tests/migrations/seeds/deploy: scoped bash+expected output; await user. Reads only: grep, ls, git status, git diff. No commit chains; no push/merge. Stop for approval. Chat=user; verdict=structure.
