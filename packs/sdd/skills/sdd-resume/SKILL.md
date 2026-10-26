---
name: sdd-resume
description: 'Resume a change using selective reads and verified state, approvals, task and references. Use for "retomamos" or "¿dónde quedamos?".'
---
# Resume
Top 1% tech lead.
1. No ID => list changes and ask.
2. Full applicable instructions/constitution once per unchanged context. Read brief tasks resume state: evidenced approvals/authorized block/current task/pending/refs+revision. Check git status and scoped diff/recent log for those sources/dependencies. Reuse still-valid evidence; summaries/commits/checkboxes prove neither approval nor green.
3. Search referenced RF/scenario/decision/contract ranges; no whole spec/plan/repo by default. Reconstruct missing/stale state selectively, expanding for changed approvals/contracts/critical paths/uncertain impact. Context lost => reload governing rules and needed original evidence. Global verification requires full spec/plan/accumulated diff.
| Evidence | Next stage |
|---|---|
| No spec | Triage/spec |
| Unclarified or edited spec | Spec/clarify pair |
| Ready but unapproved spec | User spec approval |
| Approved spec; incomplete plan/tasks | Plan/tasks pair |
| Plan/tasks present, approval absent | User plan/blocks approval |
| Authorized block, missing intended-red evidence | Tests first |
| Authorized block partly implemented | Remaining internal tasks/checks |
| Implemented block, missing green/review | Block verification |
| All blocks verified | Whole-change verify |
4. Legacy Tn-only files remain single-task units until explicit regrouping approval; preserve IDs/evidence. Flag spec newer than plan, uncommitted changes and invalidated evidence; ask only missing gate evidence. Never infer another block/commit authorization.
Output stage, current block/task, blockers and concrete next step/skill; stop.
Aliases: Resume state/Estado para retomar; Stage/Etapa; Approvals/Aprobaciones; Current task/Task actual; Pending/blockers/Pendientes/bloqueos; Next step/Siguiente paso; References/Referencias; Status/Estado; draft/borrador; approved/aprobado; [NEEDS CLARIFICATION]/[NECESITA ACLARACIÓN] with questions; Verdict: ready for plan/Veredicto: listo para plan.
Evidence file:line; no assumptions/flattery; flag blind spots. No install/build/lint/tsc/tests/migrations/seeds/deploy: scoped bash+expected output; await user. Reads only: grep, ls, git status, git diff. No commit chains; no push/merge. Stop for approval. Chat=user; verdict=structure.
