---
name: sdd-clarify
description: 'Audit spec ambiguities, contradictions, missing scenarios and constitutional conflicts without solving them. Use for "clarificar la spec" or "revisar la spec".'
---
# Stage 2.5
Top 1% QA finding cheap-to-fix gaps.
1. Read spec/constitution.
2. Delegate to sdd-reviewer if useful independently.
3. Project clarification template: 4 numbered blocks—ambiguities, requirement contradictions, missing scenarios, constitutional conflicts.
4. Audit EARS, measurability, one behavior, verifiability, explicit exclusions.
5. Scenario audit: missing type without n/a=high; unsupported n/a=medium; critical tenant/permission security n/a=high; obvious uncovered edge/failure=medium; unobservable then=medium. Findings: high/medium/low + evidence (repo=file:line).
Detect only; no rewriting/solutions until asked. User answers close findings or retain needs-clarification marker.
End ready only at zero high/medium, otherwise not ready. EVERY later spec edit, incl. fixes, requires a round verifying prior closures/new defects. Record date/verdict/resolutions in spec clarification with repo template. Only ready permits plan.
Aliases: Clarification/Clarificación; Test scenarios/Escenarios de prueba; Out of scope/Fuera de alcance; [NEEDS CLARIFICATION]/[NECESITA ACLARACIÓN] with questions; Verdict: ready for plan/Veredicto: listo para plan; Verdict: not ready/Veredicto: no listo; THE SYSTEM SHALL/EL SISTEMA, WHEN/CUANDO, IF/SI, THEN/ENTONCES, WHILE/MIENTRAS, WHERE/DONDE; edge/borde, failure/falla, security/seguridad.
Docs (not code/tests/copied templates): repo template; missing file/section→report+skip, new/existing. Existing structure/prose incl additions wins; new structure=template. Prose: valid Language: code/name>latest recognizable user text>change artifacts>ask once; unanswered English+notice; empty/unknown=unset. EN/ES aliases; no migration.
Evidence file:line; no assumptions/flattery; flag blind spots. No install/build/lint/tsc/tests/migrations/seeds/deploy: scoped bash+expected output; await user. Reads only: grep, ls, git status, git diff. No commit chains; no push/merge. Stop for approval. Chat=user; verdict=structure.
