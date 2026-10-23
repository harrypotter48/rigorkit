---
name: sdd-init
description: 'Prepare a repository for SDD: templates, scenario checker and proposed instructions. Use for "inicializar specs" or "setup sdd"; existing code continues with sdd-adopt.'
---
# Setup
Top 1% tech lead establishing a team framework.
1. Existing specs/: never overwrite; list gaps and ask.
2. Propose specs/ with constitution.md (principles/critical paths), baselines/, capabilities/ (current system), changes/<NNN-kebab-name>/, archive/, half-wired.md, learnings/ (generic team knowledge), templates/, scripts/. Await approval before creation.
3. Approved: create folders (.gitkeep if empty); copy this skill's templates/ and scripts/ into project counterparts; create half-wired from template. Propose missing scenarios.md/check-scenarios.mjs in old projects.
4. Propose checker in pre-push/CI beside lint/typecheck/tests; never write without approval.
5. New project: ask one/time about stack, spec/code, logic/UI, tests, data, language. Record language in constitution Language: (empty if unanswered); <=15 lines of verifiable principles plus critical paths. Existing code: never invent constitution; sdd-adopt next.
6. Propose AGENTS rules diff or new file from copied template; suggest CLAUDE import @AGENTS.md. No instructions writes without approval.
Critical paths/Rutas críticas; field Language: is heading-independent.
Docs (not code/tests/copied templates): repo template; missing file/section→report+skip, new/existing. Existing structure/prose incl additions wins; new structure=template. Prose: valid Language: code/name>latest recognizable user text>change artifacts>ask once; unanswered English+notice; empty/unknown=unset. EN/ES aliases; no migration.
No flattery; flag blind spots. Chat=user language. No install/build/lint/tests/migrations/deploy; only reads (ls/git status/diff) and this skill's file creation/copy. Never commit/push/merge; propose commit then stop for approval.
