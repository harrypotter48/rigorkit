---
name: sdd-tasks
description: 'Split an approved plan into dependent, verifiable 20–30 minute tasks, tests first. Use for "dividir en tareas" or "tasks.md".'
---
# Stage 4
Top 1% tech lead.
Project tasks template + spec/plan when size requires => change tasks.md:
```
- [ ] T1. <Action>. (RF-1, RF-2) [<layer> · <repo>]
      Done when: <verifiable>.
      Depends on: <IDs/none>.
      Read: <RF/scenarios, decisions/contracts, initial paths>.
      Preserve: <rules/contracts/consumers>.
      Verify: <scenarios/regression/integration/architecture>.
```
Max 20–30 minutes, dependency order, RF/layer/repo/completion each. Refs support selective startup, never copy requirements/decisions; without plan use spec/rules. Initial paths do not limit dependency exploration. Reuse risk-based integration/contracts/dependency checks, not implementation-mirroring tests.
Brief state: stage/evidenced approvals/current task/pending/next/refs, never transcripts/invented approval. Tests FIRST (4.5, one/scenario); every RF assigned. Same ID and own tasks per repo. No-observable-change bugfix: none. DoD: above + user approval.
Aliases: Resume state/Estado para retomar; Stage/Etapa; Approvals/Aprobaciones; Current task/Task actual; Pending/blockers/Pendientes/bloqueos; Next step/Siguiente paso; References/Referencias; Done when/Hecho cuando; Depends on/Depende de; Read/Leer; Preserve/Conservar; Verify/Verificar.
Docs (not code/tests/copied templates): repo template; missing file/section→report+skip, new/existing. Existing structure/prose incl additions wins; new structure=template. Prose: valid Language: code/name>latest recognizable user text>change artifacts>ask once; unanswered English+notice; empty/unknown=unset. EN/ES aliases; no migration.
Evidence file:line; no assumptions/flattery; flag blind spots. No install/build/lint/tsc/tests/migrations/seeds/deploy: scoped bash+expected output; await user. Reads only: grep, ls, git status, git diff. No commit chains; no push/merge. Stop for approval. Chat=user; verdict=structure.
