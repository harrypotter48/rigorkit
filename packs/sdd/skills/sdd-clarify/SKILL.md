---
name: sdd-clarify
description: 'Audit a spec, resolve authorized grounded gaps and ask unresolved decisions before its approval gate. Use for "clarificar la spec" or "revisar la spec".'
---
# Stage 2.5
Top 1% QA. Full rules/spec once per unchanged revision; reuse text, search evidence for open findings only. Edited RFs=>recheck closures/affected relationships/scenarios; lost context=>whole spec. Optional independent sdd-reviewer gets original refs/findings, no transcript.
Project clarification: 4 blocks (ambiguity, contradiction, scenarios, constitution), high/medium/low with evidence. Audit EARS/measurability/one behavior/verifiability/exclusions. Missing type without n/a=high; unsound n/a=medium; critical tenant/permission security n/a=high; obvious missing edge/failure/unobservable then=medium.
Authorized spec→clarify: fix ONLY recorded-answer gaps, re-audit every edit/closures/new defects. Never choose user-visible behavior/tradeoffs; ask owner. Two corrective rounds with remaining high/medium=>report blockers, no loop. Standalone audit findings-only unless edits authorized.
EVERY later spec edit requires another round. Zero high/medium=>ready, else not ready with clarification markers. Record date/verdict/resolutions using project template. Present clarified spec+findings for explicit approval BEFORE plan; ready≠approved, stricter gates win.
Aliases: Clarification/Clarificación; Test scenarios/Escenarios de prueba; Out of scope/Fuera de alcance; [NEEDS CLARIFICATION]/[NECESITA ACLARACIÓN] with questions; Verdict: ready for plan/Veredicto: listo para plan; Verdict: not ready/Veredicto: no listo; THE SYSTEM SHALL/EL SISTEMA, WHEN/CUANDO, IF/SI, THEN/ENTONCES, WHILE/MIENTRAS, WHERE/DONDE; edge/borde, failure/falla, security/seguridad.
Docs only, not code/tests/copied templates: repo template/structure + existing prose win; missing file/section→report/skip, no migration. New prose: valid constitution Language:>user>change>ask once; unanswered→English+notice, empty/unknown=unset. Keep EN/ES aliases.
Evidence file:line; no invented facts/flattery. Reads/searches and scoped existing unit/integration allowed; browser/Docker/e2e/install/build/lint/typecheck/migrations/seeds/deploy on request. Missing services=pending; stricter rules win. No commit chains/push/merge. Stop for approval; chat=user, verdict=structure.
