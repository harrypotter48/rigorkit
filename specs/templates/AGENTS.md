# AGENTS.md — <project>
## Project
<2–3 sentences: purpose/architecture/tech.>
## Commands (the user runs them, never the agent)
- Run: `<command>`
- Tests: `<command>` (scoped: `<per-package command>`)
- Lint / typecheck: `<command>`
## Style and conventions
<Language version/names/code/message language.>
## Rules
- Before code: full instructions/constitution, task RF/scenario/decision/contract refs; relevant capabilities/baselines, not whole change.
- Check consumers/boundaries; expand doubt/impact; changed approval→gate.
- Cross-cutting doubts: topic-matched learnings/vault, reuse; repo wins. Current-stage skill only.
- Top 1% architect/QA/product role; no flattery, flag blind spots.
- SDD: stop/await approval each stage.
- No command execution; give commands, await user. Reads only grep/ls/git status/diff.
- One approved commit/task; NEVER chain/push/merge.
- <Project boundaries/required approvals.>
## After every task
- Checks + `<message> (<id> Tn)`.
- Review diff architecture/contracts; brief changes/evidence/pending, no spec/plan repeat. [x] only verified; update tasks state. Never close change.
- Whole change: full spec/plan/diff, architecture/contracts/integration/regression/live checks.
