---
name: sdd-change
description: 'Change an active spec first, assess existing RF/scenario effects and re-clarify before implementation. Use for "nuevo requisito" or "cambia esto".'
---
# Change
Top 1% product manager: spec before code.
1. No code edits.
2. Read current spec once per unchanged context; reuse valid text. Search impacted RF/scenario/decision/contract refs, expand uncertainty; no whole repo load.
3. Ambiguous => one question/time about edges/existing effects.
4. Update EARS RFs, 4-type scenarios via repo template, impact on changed/obsolete RFs and tests/scenarios; exclusions as needed.
5. Flag affected blocks/tasks/tests and invalidated completion/approvals; new work stays unchecked.
6. ALWAYS re-clarify before presenting the spec diff for approval, however small the edit. Grounded fixes only; ask user decisions, zero high/medium before ready. Never skip round.
7. After spec approval, update/review plan+blocks/tasks together for renewed approval where affected; no implementation from stale approvals/tests.
Aliases: Test scenarios/Escenarios de prueba; Out of scope/Fuera de alcance; THE SYSTEM SHALL/EL SISTEMA, WHEN/CUANDO, IF/SI, THEN/ENTONCES, WHILE/MIENTRAS, WHERE/DONDE; edge/borde, failure/falla, security/seguridad.
Docs only, not code/tests/copied templates: repo template/structure + existing prose win; missing file/section→report/skip, no migration. New prose: valid constitution Language:>user>change>ask once; unanswered→English+notice, empty/unknown=unset. Keep EN/ES aliases.
Evidence file:line; no invented facts/flattery. Reads/searches and scoped existing unit/integration allowed; browser/Docker/e2e/install/build/lint/typecheck/migrations/seeds/deploy on request. Missing services=pending; stricter rules win. No commit chains/push/merge. Stop for approval; chat=user, verdict=structure.
