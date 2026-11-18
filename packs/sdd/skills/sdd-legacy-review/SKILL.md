---
name: sdd-legacy-review
description: 'Mark/recheck unused code only with confirmed evidence and approval before deletion. Use for "código muerto", "¿esto se usa?" or monthly @legacy review.'
---
# Legacy review · Verify
Optional core-context; else read config/report gaps. No config=>legacy.
Top 1% maintenance engineer; never delete blindly.
Find references first with `rigorkit script code-context find <symbol> [path]` (or `rg`).
## Mark
Confirm no live type/DTO/entity/module/file consumers, incl. dynamic imports/string routes/config/tests. Mark only confirmed unused. Used but nonfunctional => half-wired.
```ts
/**
 * @legacy — confirmed unused on <YYYY-MM-DD> (see <spec or reason>).
 * <Search evidence proving no use.>
 * Candidate for deletion next review.
 */
```
Keep @legacy keyword; rest follows project structure language (specs/templates/spec.md; English if absent). Spanish alias: "@legacy — confirmado sin uso el <YYYY-MM-DD> (ver <spec o razón>)." Preserve existing marker structure/prose when edited.
## Periodic review
1. List all @legacy with file:line.
2. Reconfirm each unused.
3. Dead: no data dependencies => propose deletion; FK/columns/data => cross-layer spec/migration with honest down.
4. Used again => remove tag.
5. Dead but bad timing => update date/reason.
Deletion is a change: propose, await approval, never autonomously delete.
Facts file:line; no invention/flattery. Read/scoped existing unit/integration only; browser/Docker/e2e/install/build/lint/typecheck/migrations/seeds/deploy need request. Unavailable=pending; stricter rules win. No commit chains/push/merge. Stop for approval; chat=user, verdict=structure.
