---
name: sdd-clarify
description: 'Audit a spec, resolve authorized grounded gaps and ask unresolved decisions before its approval gate. Use for "clarificar la spec" or "revisar la spec".'
---
# Stage 2.5
Top 1% QA finding cheap-to-fix gaps.
1. Full instructions/constitution and whole spec once per unchanged revision; reuse valid in-context text. Search referenced evidence only for unresolved findings; no full repo/plan load. On edits recheck changed RFs, prior closures and affected scenarios/relationships; missing context => full spec.
2. Optional independent sdd-reviewer gets exact spec/constitution refs and open findings, no transcript.
3. Project clarification template: ambiguities, contradictions, missing scenarios, constitutional conflicts; findings high/medium/low with evidence (repo=file:line).
4. Audit EARS/measurability/one behavior/verifiability/exclusions. Missing scenario type without n/a=high; unsupported n/a=medium; critical tenant/permission security n/a=high; obvious missing edge/failure or unobservable then=medium.
5. In the authorized spec→clarify pair, fix only issues resolved by recorded user answers, then re-audit closures and new defects. Never choose user-visible behavior/tradeoffs. Ask unresolved decisions; after two corrective rounds with remaining high/medium, report blockers instead of looping. Standalone audit is findings-only unless edits authorized.
6. EVERY later spec edit needs another round. Final ready only at zero high/medium; otherwise not ready, keep clarification markers. Record date/verdict/resolutions in spec with project template.
Present clarified spec + findings/resolutions for explicit approval before plan. Readiness never approves the spec; stricter project/user gates win.
Aliases: Clarification/Clarificación; Test scenarios/Escenarios de prueba; Out of scope/Fuera de alcance; [NEEDS CLARIFICATION]/[NECESITA ACLARACIÓN] with questions; Verdict: ready for plan/Veredicto: listo para plan; Verdict: not ready/Veredicto: no listo; THE SYSTEM SHALL/EL SISTEMA, WHEN/CUANDO, IF/SI, THEN/ENTONCES, WHILE/MIENTRAS, WHERE/DONDE; edge/borde, failure/falla, security/seguridad.
Docs (not code/tests/copied templates): repo template; missing file/section→report+skip, new/existing. Existing structure/prose incl additions wins; new structure=template. Prose: valid Language: code/name>latest recognizable user text>change artifacts>ask once; unanswered English+notice; empty/unknown=unset. EN/ES aliases; no migration.
Evidence file:line; no assumptions/flattery; flag blind spots. No install/build/lint/tsc/tests/migrations/seeds/deploy: scoped bash+expected output; await user. Reads only: grep, ls, git status, git diff. No commit chains; no push/merge. Stop for approval. Chat=user; verdict=structure.
