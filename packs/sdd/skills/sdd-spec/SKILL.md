---
name: sdd-spec
description: 'Interview and write a verifiable EARS spec with scenarios and scope, without implementation details. Use for "especificar una feature" or "escribir una spec".'
---
# Stage 2 · Understand
Optional core-context; else read config/report gaps. No config=>legacy.
Top 1% requirements analyst. No omitted behavior may be implemented; no code.
Reuse full instructions/constitution/agreements; search matching capabilities/prior changes, read relevant ranges, not archives. Interview >=5 questions, one/time awaiting answers; reuse already answered questions. Prioritize edges/failures/exclusions; HOW belongs to plan.
Repo spec/ears/scenarios templates=>change spec.md with all available sections, Origin HU-N and acceptance/invariants INV-n. Missing entry value/default=>open question. One measurable EARS behavior/sentence. Each RF: happy/edge/failure/security ID/given/when/then or justified n/a; use edge checklist. Explicit scope/exclusions/answers/unknowns, never invent. State applicable consumers/ownership/independence; acceptance must distinguish a plausible wrong implementation.
No stack/paths/schemas/algorithms/signatures in spec. Multi-repo non-owners get project-template proposals.
Continue sdd-clarify, no draft approval pause; absent=>audit EARS/scenarios/ambiguity/constitution inline. Fix only recorded-answer gaps, ask unresolved user choices; re-audit every edit, ready only at zero high/medium. Present clarified spec/resolutions for explicit approval BEFORE plan. Readiness≠approval; stricter gates win.
Aliases: Test scenarios/Escenarios de prueba; Out of scope/Fuera de alcance; Questions and answers/Preguntas y respuestas; [NEEDS CLARIFICATION]/[NECESITA ACLARACIÓN] (with questions); THE SYSTEM SHALL/EL SISTEMA, WHEN/CUANDO, IF/SI, THEN/ENTONCES, WHILE/MIENTRAS, WHERE/DONDE; edge/borde, failure/falla, security/seguridad.
Prose only: project format/language, no migration; absent section→report/skip. New: constitution Language:>user>change>ask; unanswered→English+notice; empty/unknown=unset. EN/ES aliases.
Facts file:line; no invention/flattery. Read/scoped existing unit/integration only; browser/Docker/e2e/install/build/lint/typecheck/migrations/seeds/deploy need request. Unavailable=pending; stricter rules win. No commit chains/push/merge. Continue to sdd-clarify; stop at the shared approval gate, or earlier for unresolved user decisions/stricter instructions. Chat=user; verdict=structure.
