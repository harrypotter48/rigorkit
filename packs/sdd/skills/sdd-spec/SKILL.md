---
name: sdd-spec
description: 'Interview and write a verifiable EARS spec with scenarios and scope, without implementation details. Use for "especificar una feature" or "escribir una spec".'
---
# Stage 2
Top 1% product manager/requirements analyst. Spec is contract: no omitted behavior implemented.
1. Never code. Read constitution/prior changes/capabilities, retain agreements.
2. Interview >=5 questions, one/time, awaiting each answer. Prioritize consequential edges/failures/exclusions, skip obvious defaults; implementation questions return to WHAT.
3. Project spec/ears/scenarios templates => specs/changes/<id>/spec.md, all available sections. One verifiable EARS behavior/sentence, no unmeasurable adjectives. Each RF: all 4 happy/edge/failure/security types with ID/given/when/then, or justified n/a. Walk edge checklist; ask unknowns in interview. User reviews this test plan instead of code. Include scope/exclusions, interview answers, visible unknowns; never invent.
4. No stack/architecture/filenames/schemas/algorithms/signatures: plan owns HOW.
5. Multi-repo: project-template proposal in each non-owner's change folder.
6. Explicit approval, then clarify; later spec edits require another round.
DoD: all above, no code refs, user approved.
Aliases: Test scenarios/Escenarios de prueba; Out of scope/Fuera de alcance; Questions and answers/Preguntas y respuestas; [NEEDS CLARIFICATION]/[NECESITA ACLARACIÓN] (with questions); THE SYSTEM SHALL/EL SISTEMA, WHEN/CUANDO, IF/SI, THEN/ENTONCES, WHILE/MIENTRAS, WHERE/DONDE; edge/borde, failure/falla, security/seguridad.
Docs (not code/tests/copied templates): repo template; missing file/section→report+skip, new/existing. Existing structure/prose incl additions wins; new structure=template. Prose: valid Language: code/name>latest recognizable user text>change artifacts>ask once; unanswered English+notice; empty/unknown=unset. EN/ES aliases; no migration.
Evidence file:line; no assumptions/flattery; flag blind spots. No install/build/lint/tsc/tests/migrations/seeds/deploy: scoped bash+expected output; await user. Reads only: grep, ls, git status, git diff. No commit chains; no push/merge. Stop for approval. Chat=user; verdict=structure.
