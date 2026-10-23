---
name: sdd-resume
description: 'Resume a change using selective reads and verified state, approvals, task and references. Use for "retomamos" or "¿dónde quedamos?".'
---
# Resume
Top 1% tech lead.
1. No ID => list changes and ask.
2. Full instructions/constitution; latest tasks/chat stage/approvals/task/decisions/pending/refs checked against files, git status, relevant diff/recent log; never trust stale summary.
3. Reconstruct unreliable state selectively. Orientation, NEVER approval evidence:
| Present | Stage |
|---|---|
| Nothing | Triage/spec |
| Unapproved spec or clarification marker | Spec/clarify |
| Approved spec; required plan absent | Plan |
| Plan; no tasks | Tasks |
| Tasks; no tests | Tests first |
| Partly checked tasks | Next unchecked implementation |
| All checked | Verify |
4. Read current RF/scenario/decision/contract refs. Expand missing refs, changed spec/plan/new impact. Selective reads; global checks needs full spec/plan/diff.
5. Flag unchecked evidence, uncommitted changes, spec newer than plan. Commit/checkbox proves neither approval nor green; ask only missing gate evidence.
Output stage, completed work, concrete next step/skill; stop.
Aliases: Resume state/Estado para retomar; Stage/Etapa; Approvals/Aprobaciones; Current task/Task actual; Pending/blockers/Pendientes/bloqueos; Next step/Siguiente paso; References/Referencias; Status/Estado; draft/borrador; approved/aprobado; [NEEDS CLARIFICATION]/[NECESITA ACLARACIÓN] with questions; Verdict: ready for plan/Veredicto: listo para plan.
Evidence file:line; no assumptions/flattery; flag blind spots. No install/build/lint/tsc/tests/migrations/seeds/deploy: scoped bash+expected output; await user. Reads only: grep, ls, git status, git diff. No commit chains; no push/merge. Stop for approval. Chat=user; verdict=structure.
