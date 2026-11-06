---
name: sdd-change
description: 'Change an active spec first, assess existing RF/scenario effects and re-clarify before implementation. Use for "nuevo requisito" or "cambia esto".'
---
# Change · Understand
Optional core-context; else read config/report gaps. No config=>legacy.
Top 1% product manager: spec before code.
1. No code edits.
2. Read current spec once per unchanged context; reuse valid text. Search impacted RF/scenario/decision/contract refs, expand uncertainty; no whole repo load.
3. Ambiguous => one question/time about edges/existing effects.
4. Update EARS RFs, 4-type scenarios via repo template, impact on changed/obsolete RFs and tests/scenarios; exclusions as needed.
5. Flag affected blocks/tasks/tests and invalidated completion/approvals; new work stays unchecked.
6. ALWAYS re-clarify before presenting the spec diff for approval, however small the edit. Grounded fixes only; ask user decisions, zero high/medium before ready. Never skip round.
7. After spec approval, update/review plan+blocks/tasks together for renewed approval where affected; no implementation from stale approvals/tests.
Aliases: Test scenarios/Escenarios de prueba; Out of scope/Fuera de alcance; THE SYSTEM SHALL/EL SISTEMA, WHEN/CUANDO, IF/SI, THEN/ENTONCES, WHILE/MIENTRAS, WHERE/DONDE; edge/borde, failure/falla, security/seguridad.
Prose only: project format/language, no migration; absent section→report/skip. New: constitution Language:>user>change>ask; unanswered→English+notice; empty/unknown=unset. EN/ES aliases.
Facts file:line; no invention/flattery. Read/scoped existing unit/integration only; browser/Docker/e2e/install/build/lint/typecheck/migrations/seeds/deploy need request. Unavailable=pending; stricter rules win. No commit chains/push/merge. Stop for approval; chat=user, verdict=structure.
