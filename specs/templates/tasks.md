# Tasks — <id>

## Resume state
Stage: <…> · Approvals: <spec and plan/blocks evidence or pending>.
Authorized blocks: <Bn or pending> · Current block: <Bn or none> · Current task: <Tn or none>.
Pending/blockers: <implemented/unverified work, checks, decisions> · Next step: <…>.
Review stations: <per enabled reviewer: launched together, verdict, pending> · Approval decision: <approved | needs human | failed>.
References: <relevant sections + revision/working-tree state; no copied spec/plan>.
Dependencies checked: <paths/consumers + revision; invalidate affected entries after edits>.

## Functional blocks
### B1 — <Verifiable behavior> (RF-1, RF-2)
Tasks: T1, T2 · Depends on: <block IDs or none; integration points>.
Done when: <observable behavior + required green/review evidence>.
Read: <spec RF/scenarios; plan decisions/contracts if present; initial paths>.
Preserve: <rules/contracts/consumers>.
Verify: <scenario IDs, regression/integration/architecture/live checks>.
Reviewers: <enabled reviewers for this block; launched together after the builder>.

- [ ] T1. <Action>. (RF-1) [<layer> · <repo>]
- [ ] T2. <Action>. (RF-2) [<layer> · <repo>]
      Read / Preserve / Verify: <task-specific additions/dependencies/completion checks only, if needed>.

References guide reading; trace actual dependencies beyond initial paths. Reuse unchanged evidence, recheck affected refs after edits.
No arbitrary time limit. Continue internal tasks within authorized block; stop for decisions/blockers/user-run checks and block review.
Mark `[x]` only with sufficient verification/review evidence; implemented without evidence stays pending. Every commit needs explicit approval.
Whole-change verification still checks full spec/plan/accumulated diff and cross-block integration.
Review station: launch the enabled reviewers together after the builder, re-review their corrections together once, and escalate to the owner when a reviewer's corrections are exhausted.
