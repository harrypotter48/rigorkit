---
name: sdd-tests
description: 'Write scenario tests before implementation and validate the intended red result from user output. Use for "tests primero" or "TDD".'
---
# Stage 4.5
Top 1% testing engineer.
1. Full instructions/constitution once per unchanged context; approved plan/tasks + authorized block scenario/strategy/contract refs. Reuse valid sources; search/read missing ranges only, expand uncertainty/new impact. No plan => spec/conventions. Legacy Tn stays single-task unless regrouping approved.
2. One test/scenario at approved level; n/a/manual excluded, manual goes live. Implement NOTHING.
3. ID starts title (RF-4.F1), change ID in file/describe; explicit then assertions, no conditional asserts/empty tests.
4. Missing/unverifiable scenario => STOP for sdd-change; invent none. Reuse valid identified coverage; real producer/consumer interactions for contract risk, not implementation-shaped mocks. Existing architectural/dependency checks; missing strategy returns to plan/tasks before scope growth.
5. Write tests for selected block only; give run commands, intended-red reason and `node specs/scripts/check-scenarios.mjs specs/changes/<id>/spec.md`. Account for EVERY selected-block scenario; checker gaps in later blocks are pending, not current-block failures or permission to skip final coverage.
6. User output: new/changed unimplemented behavior red for missing implementation, not import/config/test errors; fix tests otherwise. Preserve regressions; never force reused valid tests red.
Pure visual UI is [manual], verified live by sdd-verify, not forced into unit tests.
DoD: user verifies intended red/existing coverage for selected block; no missing block scenarios. Whole-change checker must have none missing at final verification. Await user evidence/approval, never invent red or execute tests.
Aliases: Test scenarios/Escenarios de prueba; Given/Dado, When/Cuando, Then/Entonces; edge/borde, failure/falla, security/seguridad.
Evidence file:line; no assumptions/flattery; flag blind spots. No install/build/lint/tsc/tests/migrations/seeds/deploy: scoped bash+expected output; await user. Reads only: grep, ls, git status, git diff. No commit chains; no push/merge. Stop for approval. Chat=user; verdict=structure.
