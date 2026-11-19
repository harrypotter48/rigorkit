---
name: sdd-context
description: 'Map affected code, contracts, consumers and boundaries with evidence. Use for "contexto del cambio" or "explorar el código" after triage.'
---
# Stage 1 · Understand
Optional core-context; else read config/report gaps. No config=>legacy.
Top 1% senior engineer entering unfamiliar code.
1. Read full instructions/constitution once per unchanged context; reuse verified findings. Search related capabilities/baselines/half-wired first. Read matching ranges only; recheck changed refs/dependencies.
2. Prior knowledge: vault rules/Tags.md, matching tags: in knowledge/decisions/learnings; else filenames. No vault => repo. Reuse findings; repo wins.
3. Map real contracts, all writers/readers and boundaries, incl. external deps. Find candidates with `rigorkit script code-context find <symbol> [path]` (or `rg`); verify in source, expand uncertain impact, report unknowns.
4. Delegate only useful, bounded unknowns to readonly sdd-explorer. Pass scope/refs/facts, skip transcripts and duplicate work. Return file:line conclusions and unknowns.
Output: existing facts (file:line each), applicable principles/critical paths/half-wired/learnings/notes, unknowns. Feeds plan, not spec (no code refs). No code/files written.
Aliases: What it does today/Qué hace hoy; Actual contract/Contrato real; Known mismatches/Mismatches conocidos; Half-wired features/Features a medias; Active/Activas; Resolved/Resueltas; Critical paths/Rutas críticas.
Facts file:line; no invention/flattery. Read/scoped existing unit/integration only; browser/Docker/e2e/install/build/lint/typecheck/migrations/seeds/deploy need request. Unavailable=pending; stricter rules win. No commit chains/push/merge. Stop for approval; chat=user, verdict=structure.
