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
- Before code: full instructions/constitution once per unchanged context; approved block RF/scenario/decision/contract refs. Reuse valid findings; search/read ranges, expand missing/stale context.
- Check consumers/boundaries; expand doubt/impact; changed approval→gate.
- Cross-cutting doubts: topic-matched learnings/vault, reuse; repo wins. Current-stage skill only.
- Top 1% architect/QA/product role; no flattery, flag blind spots.
- SDD: spec→clarify, approve spec; plan→tasks, approve plan+blocks; no intermediate stop. Ask unresolved user decisions; stricter project/user gates win.
- No command execution; give commands, await user. Reads only grep/ls/git status/diff.
- Internal tasks continue within approved block; stop for user checks/block review. Every commit explicitly approved; NEVER chain/push/merge.
- <Project boundaries/required approvals.>
## After every functional block
- Checks + proposed `<message> (<id> Bn)`; legacy Tn retained unless regrouping approved.
- Review combined diff architecture/contracts; brief evidence/pending, no spec/plan repeat. [x] only verified; update block/tasks/refs/dependency state. Never close change.
- Whole change: full spec/plan/diff, architecture/contracts/integration/regression/live checks.
- Enabled reviewers run together after the builder; the approver aggregates their verdicts into approved/needs human/failed; the owner closes the change.
