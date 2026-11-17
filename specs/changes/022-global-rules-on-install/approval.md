# Approval decision — 022-global-rules-on-install
> 2026-11-17 · Consolidated by sdd-approver; the approver never closes a change.

Decision: **needs human**. No introduced blocking defect is evidenced; the change stays open for the owner.

## Why it is not "approved"
- Live demo of the acceptance flow on a real terminal in a temporary home: not run (required gate; owner).
- Independent re-reviews requested by the approver ran afterwards (review-reports.md, correction round): SDD spec fulfilled for test coverage; security delta closed, no high findings; one more code edit followed (`rules_capable` link check) with its scoped suites green; the approver has not re-run on that evidence.
- Owner confirmations still open: the exact-comparison exception for frozen-test integrity; the B1 and B3 reds accepted on the owner's report; that agent-run full `tools/test` counts as evidence (the owner delegated autonomy for it); whether to strengthen the weak report assertions listed in validation.md by test amendment or leave them.

## Pending, not counted as passing
Live demo; environments without a pseudo-terminal, root runs and macOS ACLs; `VERSION` bump to 0.6.3 and the release; archive and installer capability updates (tasks.md T11) on the next story's branch; follow-up 023 (HU-17: atomic write, backup that survives a rerun, record on failure, update write path); accepted residual risk of non-ASCII controls in paths (threat-model.md section 5).
