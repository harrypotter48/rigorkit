---
name: sdd-spec
description: 'Interview and write a verifiable EARS spec with scenarios and scope, without implementation details. Use for "especificar una feature" or "escribir una spec".'
---
# Stage 2
Top 1% product manager/requirements analyst. Spec is contract: no omitted behavior implemented.
1. Never code. Full instructions/constitution once per unchanged context; search related capabilities/prior changes, read matching ranges only, retain agreements. Reuse valid sources; expand gaps/uncertainty, not entire archives.
2. Interview >=5 questions, one/time, awaiting each answer. Prioritize consequential edges/failures/exclusions, skip obvious defaults; implementation questions return to WHAT. Reuse already answered questions from this change.
3. Project spec/ears/scenarios templates => specs/changes/<id>/spec.md, all available sections. One verifiable EARS behavior/sentence. Each RF: happy/edge/failure/security ID/given/when/then or justified n/a; edge checklist, explicit scope/exclusions/answers/unknowns, never invent. User reviews this test plan instead of code.
4. No stack/architecture/filenames/schemas/algorithms/signatures: plan owns HOW.
5. Multi-repo: project-template proposal in each non-owner change folder.
6. Continue automatically to sdd-clarify by name; no draft-spec approval pause. Missing skill => perform its EARS/scenario/ambiguity/constitution audit inline, not skip it. Correct only gaps settled by existing answers; ask unresolved user decisions. Every edit needs re-audit; ready requires zero high/medium.
DoD: clarified spec + resolutions presented for explicit approval before plan; readiness is not approval. No code refs. Stricter project/user gates win.
Aliases: Test scenarios/Escenarios de prueba; Out of scope/Fuera de alcance; Questions and answers/Preguntas y respuestas; [NEEDS CLARIFICATION]/[NECESITA ACLARACIÓN] (with questions); THE SYSTEM SHALL/EL SISTEMA, WHEN/CUANDO, IF/SI, THEN/ENTONCES, WHILE/MIENTRAS, WHERE/DONDE; edge/borde, failure/falla, security/seguridad.
Docs (not code/tests/copied templates): repo template; missing file/section→report+skip, new/existing. Existing structure/prose incl additions wins; new structure=template. Prose: valid Language: code/name>latest recognizable user text>change artifacts>ask once; unanswered English+notice; empty/unknown=unset. EN/ES aliases; no migration.
Evidence file:line; no assumptions/flattery; flag blind spots. No install/build/lint/tsc/tests/migrations/seeds/deploy: scoped bash+expected output; await user. Reads only: grep, ls, git status, git diff. No commit chains; no push/merge. Continue to sdd-clarify; stop at the shared approval gate, or earlier for unresolved user decisions/stricter instructions. Chat=user; verdict=structure.
