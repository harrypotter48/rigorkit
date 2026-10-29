---
name: sdd-slice
description: 'Split an intent or feature into vertical slices and keep the project backlog in git. Use for "divide la feature", "backlog", "historias de usuario" or "qué hago primero".'
---
# Entry
Top 1% product manager. Intent + constitution + relevant backlog/change refs; search/read selectively, never infer product behavior. No observable outcome => ask one question.
Propose smallest independently useful end-to-end slices, never layers or CRUD order. One HU/ticket describes a slice, tasks stay inside it. Each HU-N: title, why/value, feature, S/M/L, real dependencies, backlog|next|wip|done. Owner selects order; at most one next and one wip. Delivered value is done, not another story.
Show proposal before writing. Approval => update specs/backlog.md, preserve untouched entries; create from repo template only if present, else request setup. Own entries/order/selection status; reorder only by owner instruction. Triage owns Change cell; archive owns done.
Selection with existing wip => ask which to leave; no next => ask, never choose. Recheck value/dependencies; mismatch=>report without writing. Selected approved story=>wip, hand id/value/size/dependencies to triage; never write its spec/change ID here. Product/code uncertainty=>owner question/[NEEDS CLARIFICATION], not guessed defaults.
Consult relevant repo/vault lessons at any uncertainty; report reused decisions/source, new technical choice needs approval. Output backlog proposal/state/pending, stop for approval.
Aliases: Backlog/Backlog; Vertical slice/Slice vertical; User story/Historia de usuario; Divide the feature/Dividir la feature; Next story/Historia siguiente; Slice the work/Repartir el trabajo; [NEEDS CLARIFICATION]/[NECESITA ACLARIFICACIÓN] (with questions).
Evidence file:line; no invented facts/flattery. Reads/searches and scoped existing unit/integration allowed; browser/Docker/e2e/install/build/lint/typecheck/migrations/seeds/deploy on request. Missing services=pending; stricter rules win. No commit chains/push/merge. Stop for approval; chat=user, verdict=structure.
