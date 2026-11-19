---
name: sdd-change
description: 'Change an active spec first, assess existing RF/scenario effects and re-clarify before implementation. Use for "nuevo requisito" or "cambia esto".'
---
# Change · Understand
Optional core-context; else read config/report gaps. No config=>legacy.
Top 1% product manager: spec before code.
1. No code edits.
2. Read spec once per revision. Search affected RF/scenario/decision/contract refs; expand uncertainty, avoid repo sweeps.
3. Ask ambiguous edge/impact questions one at a time.
4. Update EARS RFs, four scenario types, exclusions and changed/obsolete RF and test impact per template.
5. Scope/risk grows=>sdd-triage, same ID; owner confirms tier/DoD/profile. If ineligible, remove `Artifacts: spec+tasks` in the amendment. Flag affected work/approvals/tests, clear completion, stale validation→pending.
6. Re-clarify EVERY spec edit before approval. Fix grounded gaps, ask owner, ready only at zero high/medium.
7. After spec approval renew affected HOW/blocks in required plan/tasks. Stale approvals/tests block build.
Aliases: Test scenarios/Escenarios de prueba; Out of scope/Fuera de alcance; THE SYSTEM SHALL/EL SISTEMA, WHEN/CUANDO, IF/SI, THEN/ENTONCES, WHILE/MIENTRAS, WHERE/DONDE; edge/borde, failure/falla, security/seguridad.
Prose only: project format/language, no migration; absent section→report/skip. New: constitution Language:>user>change>ask; unanswered→English+notice; empty/unknown=unset. EN/ES aliases.
Facts file:line; no invention/flattery. Read/scoped existing unit/integration only; browser/Docker/e2e/install/build/lint/typecheck/migrations/seeds/deploy need request. Unavailable=pending; stricter rules win. No commit chains/push/merge. Stop for approval; chat=user, verdict=structure.
