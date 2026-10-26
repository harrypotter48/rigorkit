---
name: sdd-verify
description: 'Verify a completed change against all scenarios, accumulated diff, integration and critical DoD. Use for "verificar", "validar" or "¿está terminado?".'
---
# Stage 6
Top 1% QA: underestimate progress, never overstate.
0. Full instructions/constitution/spec/plan if present and accumulated confirmed-base→HEAD + local/new diff vs decisions/contracts/boundaries, ALL producers/consumers/cross-block effects. Reuse complete unchanged in-context sources and valid block evidence, but inspect whole-change interactions; expand stale/missing dependencies. Block success alone is insufficient; missing access/evidence stays pending.
1. Project validation template: every scenario→test→user result; absent output => commands incl. `node specs/scripts/check-scenarios.mjs specs/changes/<id>/spec.md`. n/a reasons retained, manual goes live; explicitly flag failures/gaps. Happy-only does not fulfill RF.
2. Check completion criteria.
3. Multiple layers => local checklist-cross-layer.md.
4. Critical => local dod-critical.md, real-data smoke/constitutional regression.
5. Concrete browser/Storybook/app live steps.
6. List missing/half-wired candidates.
7. Independent sdd-reviewer.
8. arch-reviewer always, frontend-reviewer for .tsx/.jsx/app/; files/constraints/full base diff + local/new. Missing reviewer => say+check yourself; introduced high blocks fulfillment.
9. Reuse regression/integration/contract/dependency checks; units cannot substitute. New tests need risk. User executes; unrun=pending; repeat only for changes/justified doubt.
Output validation/checklist/live steps/verdict; user alone closes. Record actual token/time observations only; no claimed savings from selective-read rules alone.
Aliases: Test scenarios/Escenarios de prueba; Completion criteria/Criterios de finalización; critical/crítico; Validation/Validación; Scenario/Escenario; Type/Tipo; Covering test/Test que lo cubre; Result/Resultado; Global review/Revisión global; Contracts and integration/Contratos e integración; Live test/Prueba en vivo; Pending/Pendientes; Verdict: spec fulfilled/Veredicto: spec cumplido; Verdict: missing/Veredicto: falta.
Docs (not code/tests/copied templates): repo template; missing file/section→report+skip, new/existing. Existing structure/prose incl additions wins; new structure=template. Prose: valid Language: code/name>latest recognizable user text>change artifacts>ask once; unanswered English+notice; empty/unknown=unset. EN/ES aliases; no migration.
Evidence file:line; no assumptions/flattery; flag blind spots. No install/build/lint/tsc/tests/migrations/seeds/deploy: scoped bash+expected output; await user. Reads only: grep, ls, git status, git diff. No commit chains; no push/merge. Stop for approval. Chat=user; verdict=structure.
