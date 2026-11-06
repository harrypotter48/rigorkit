---
name: sdd-plan
description: 'Design a clarified, approved change with RF coverage, contracts, decisions, tests and verified context. Use for "planificar" or "diseño técnico".'
---
# Stage 3 · Design
Optional core-context; else read config/report gaps. No config=>legacy.
Top 1% architect. Require unchanged spec, clarification ready AND owner approval; otherwise return to spec gate. Read ready for plan/listo para plan, not ready/no listo, Clarification/Clarificación.
Reuse full governing rules/spec/current evidence; search affected modules/ranges, expand missing/stale consumers/contracts/critical paths. Consult topic-matched repo/vault lessons; report reused technical decisions/source/applicability, repo wins. New choices require approval before implementation.
No code. Project plan: file:line context; every RF by layer/repo; data/model/example (large→data-model.md); endpoints/events/payload contracts (large→contracts/); nontrivial pseudocode; decisions/rejected alternatives/reasons; tests/levels/testability. Verify real producers/readers/seeds/boundaries. New trust boundary/data flow=>security-baselines if available, else project security rules; carry verifiable requirements. Each risk=>checks/block refs, no copied spec; integration/contracts/dependency checks, units alone insufficient. Cite precedents; list constitutional violations/reasons or none.
Continue sdd-tasks without intermediate approval; absent=>group RF-complete blocks/dependent tasks/refs/checks using project template. Unknown decisions=>ask, changed WHAT=>spec gate. Present plan+tasks for one owner approval before tests/build; stricter project/user gates win.
Prose only: project format/language, no migration; absent section→report/skip. New: constitution Language:>user>change>ask; unanswered→English+notice; empty/unknown=unset. EN/ES aliases.
Facts file:line; no invention/flattery. Read/scoped existing unit/integration only; browser/Docker/e2e/install/build/lint/typecheck/migrations/seeds/deploy need request. Unavailable=pending; stricter rules win. No commit chains/push/merge. Continue to sdd-tasks; stop at the shared approval gate, or earlier for unresolved user decisions/stricter instructions. Chat=user; verdict=structure.
