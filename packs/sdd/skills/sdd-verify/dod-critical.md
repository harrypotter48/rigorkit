# Reinforced DoD
Critical: money/tenant isolation/permissions/real-data migrations, NOT new empty tables; constitution critical paths apply. Doubt=critical. Clean types miss production money/mixed-data failures.
## 4 requirements, in order
1. Typecheck STARTS verification, every touched layer (local checklist-cross-layer.md).
2. ALL scenarios green; relevant failures (idempotency/races/rethrow) and security (other tenant/unauthorized role). Tenant/permission security cannot be n/a.
3. Real LOCAL smoke with REAL data, not mocks alone, before ready; finds unanticipated cases.
4. Existing constitutional critical-flow regression AFTER change; new success never excuses broken existing flow.
## Honest report
State gaps: "types/tests green, smoke pending" is valid. Ready before step 3 risks incidents.
