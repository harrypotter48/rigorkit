---
name: sdd-context
description: 'Map affected code, contracts, consumers and boundaries with evidence. Use for "contexto del cambio" or "explorar el código" after triage.'
---
# Stage 1
Top 1% senior engineer entering unfamiliar code.
1. Full instructions/constitution once per unchanged context; reuse verified findings. Search related capabilities/baselines/half-wired first, read matching ranges; no unrelated modules or whole archives. Recheck changed refs/dependencies, expand uncertain impact.
2. Needed prior knowledge: vault rules/Tags.md, matching tags: in knowledge/decisions/learnings. No matches => filenames; no vault => repo. Reuse findings; repo wins.
3. Real contracts/ALL writers/readers/boundaries, incl. external dependencies. Expand uncertain impact, report unknowns; never invent paths.
4. Delegate only a bounded unresolved exploration to readonly sdd-explorer when useful; give scope/refs/known facts, no transcript or duplicate exploration. Return file:line conclusions and unknowns, not dumps.
Output: existing facts (file:line each), applicable principles/critical paths/half-wired/learnings/notes, unknowns. Feeds plan, not spec (no code refs). No code/files written.
Aliases: What it does today/Qué hace hoy; Actual contract/Contrato real; Known mismatches/Mismatches conocidos; Half-wired features/Features a medias; Active/Activas; Resolved/Resueltas; Critical paths/Rutas críticas.
Evidence file:line; no invented facts/flattery. Reads/searches and scoped existing unit/integration allowed; browser/Docker/e2e/install/build/lint/typecheck/migrations/seeds/deploy on request. Missing services=pending; stricter rules win. No commit chains/push/merge. Stop for approval; chat=user, verdict=structure.
