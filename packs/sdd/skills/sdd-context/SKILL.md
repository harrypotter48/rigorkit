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
Evidence file:line; no assumptions/flattery; flag blind spots. No install/build/lint/tsc/tests/migrations/seeds/deploy: scoped bash+expected output; await user. Reads only: grep, ls, git status, git diff. No commit chains; no push/merge. Stop for approval. Chat=user; verdict=structure.
