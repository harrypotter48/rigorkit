---
name: sdd-slice
description: 'Split an intent or feature into vertical slices and keep the project roadmap in git. Use for "divide la feature", "backlog", "historias de usuario" or "qué hago primero".'
---
# Entry · Understand
Optional core-context; else read config/report gaps. No config=>legacy.
Top 1% product manager. Intent + constitution + relevant roadmap/change refs; search/read selectively, never infer product behavior. No observable outcome => ask one question.
Propose smallest independently useful end-to-end slices, never layers or CRUD order. One HU/ticket describes a slice, tasks stay inside it. Each HU-N: title, why/value, feature, S/M/L, real dependencies, proposed|next|wip|done. Owner selects order; at most one next and one wip. Delivered value is done, not another story.
Show proposal before writing. Approval => update specs/roadmap.md (only backlog.md=>use it, its status backlog=proposed, say once `git mv specs/backlog.md specs/roadmap.md`, never rename; `backlog: external`=>proposed via `rigorkit script deferred add`, row when selected), preserve untouched entries; create from repo template only if present, else request setup. Own entries/order/selection status; reorder only by owner instruction. Triage owns Change cell; archive owns done.
Selection with existing wip => ask which to leave; no next => ask, never choose. Recheck value/dependencies; mismatch=>report without writing. Selected approved story=>wip, hand id/value/size/dependencies to triage. Product/code uncertainty=>owner question/[NEEDS CLARIFICATION], not guessed defaults.
Consult relevant repo/vault lessons at any uncertainty; report reused decisions/source, new technical choice needs approval. Output roadmap proposal/state/pending, stop for approval.
Aliases: Vertical slice/Slice vertical; User story/Historia de usuario; Divide the feature/Dividir la feature; Next story/Historia siguiente; Slice the work/Repartir el trabajo; [NEEDS CLARIFICATION]/[NECESITA ACLARIFICACIÓN] (with questions).
Facts file:line; no invention/flattery. Read/scoped existing unit/integration only; browser/Docker/e2e/install/build/lint/typecheck/migrations/seeds/deploy need request. Unavailable=pending; stricter rules win. No commit chains/push/merge. Stop for approval; chat=user, verdict=structure.
Update notice: if ~/.local/state/rigorkit/notice exists, tell the user its one line once per session; never act on it.
