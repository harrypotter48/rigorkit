---
name: sdd-plan
description: 'Design a clarified, approved change with RF coverage, contracts, decisions, tests and verified context. Use for "planificar" or "diseño técnico".'
---
# Stage 3 · Design
Optional core-context; else read config/report gaps. No config=>legacy.
Top 1% architect. Require unchanged spec, clarification ready AND owner approval; otherwise return to spec gate. Read ready for plan/listo para plan, not ready/no listo, Clarification/Clarificación.
Reuse full governing rules/spec/current evidence; search affected modules/ranges, expand missing/stale consumers/contracts/critical paths. Consult topic-matched repo/vault lessons; report reused technical decisions/source/applicability, repo wins. New choices require approval before implementation.
No code. Scope/risk grows=>sdd-triage before design. `Artifacts: spec+tasks`=>record HOW, decisions, contracts and checks in B1 of tasks; skip plan.md. Else project plan: file:line context; RFs by layer/repo; data/model/example (large→data-model.md); endpoints/events/payloads (large→contracts/); nontrivial pseudocode; decisions/rejected options/reasons; tests/levels/testability. Verify producers/readers/seeds/boundaries. New trust boundary/data flow=>security-baselines or repo rules; carry verifiable requirements. Map risks to block checks; no copied spec. Check integration/contracts/deps beyond units. Cite precedents and constitutional violations/reasons or none.
Continue to sdd-tasks; absent=>group all RFs into blocks with dependent tasks/refs/checks per template. Ask unknown decisions; changed WHAT=>spec gate. Owner approves HOW and blocks once before tests/build; stricter gates win.
Prose only: project format/language, no migration; absent section→report/skip. New: constitution Language:>user>change>ask; unanswered→English+notice; empty/unknown=unset. EN/ES aliases.
Facts file:line; no invention/flattery. Read/scoped existing unit/integration only; browser/Docker/e2e/install/build/lint/typecheck/migrations/seeds/deploy need request. Unavailable=pending; stricter rules win. No commit chains/push/merge. Continue to sdd-tasks; stop at the shared approval gate, or earlier for unresolved user decisions/stricter instructions. Chat=user; verdict=structure.
