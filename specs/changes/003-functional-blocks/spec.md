# Spec 003 — Functional blocks and selective context
> Status: approved scope · DoD: normal · Owner repo: rigorkit · Affected repos: rigorkit
## Context and goal
Reduce repeated reads, per-task interruptions and duplicate reviews while preserving behavioral agreement, checks and global verification.
## Users / actors
Rigorkit users and coding agents.
## User stories
- H1: As a user I want to approve behavior and execution design separately, then receive a complete verified functional block.
## Functional requirements (EARS)
- RF-1: WHEN interview answers define a spec, THE SYSTEM SHALL clarify it before requesting spec approval and require that approval before planning.
- RF-2: WHEN planning an approved spec, THE SYSTEM SHALL prepare plan and internal tasks grouped into functional blocks for one joint approval.
- RF-3: WHEN a block is authorized, THE SYSTEM SHALL continue its internal tasks without per-task approval prompts, retaining user decisions, checks, block review and explicit commit approval.
- RF-4: WHEN context is still valid, THE SYSTEM SHALL reuse it and read referenced ranges; IF evidence becomes stale or impact uncertain, THEN THE SYSTEM SHALL expand/revalidate it, retaining whole-change verification.
## Non-functional requirements
Tool-neutral English instructions; unchanged skill identities/installer; descriptions <=300 characters; no new global rules. No invented savings or test results.
## Test scenarios
All behavior below is manual instruction-following validation; automated content checks cannot establish live compliance.
### RF-1
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-1.H1 | happy [manual] | settled interview | spec drafted | clarify runs before approval; plan waits |
| RF-1.E1 | edge [manual] | later spec edit | resume | re-audit required; stale readiness invalid |
| RF-1.F1 | failure [manual] | unresolved high/medium | clarify | user decision requested; no invented behavior or endless loop |
| RF-1.S1 | security [manual] | permission behavior unclear | clarify | no silent authorization assumption |
### RF-2
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-2.H1 | happy [manual] | approved spec | plan drafted | blocks/tasks prepared before joint approval |
| RF-2.E1 | edge [manual] | legacy Tn tasks | resume | IDs/evidence and boundaries preserved unless regrouping approved |
| RF-2.F1 | failure [manual] | plan changes behavior | planning | return to spec approval |
| RF-2.S1 | security [manual] | stricter repo gate | paired flow | stricter approval retained |
### RF-3
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-3.H1 | happy [manual] | B1 approved, T1/T2 internal | implement | both proceed; one combined block review |
| RF-3.E1 | edge [manual] | B2 not authorized | B1 verified | no inferred B2 or commit authorization |
| RF-3.F1 | failure [manual] | missing intended red or green | implement | request user checks; completion pending |
| RF-3.S1 | security [manual] | critical path touched | block delivery | failure/security/smoke/regression gates retained |
### RF-4
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-4.H1 | happy [manual] | unchanged context/map | next internal task | reuse refs; no repeated whole-document load |
| RF-4.E1 | edge [manual] | context lost or external edit | resume | reload rules/references and revalidate affected dependencies |
| RF-4.F1 | failure [manual] | no matches or missing refs | dependency search | report uncertainty and expand; no safety claim |
| RF-4.S1 | security [manual] | shared contract/critical path | impact changes | expand evidence; no omitted governing rules |
## Out of scope
Installer changes, installed copies/other repos, automated test execution, commits, model changes, retrospective capability edits and promised savings.
## Completion criteria
Source instructions/templates consistent; existing content/scenario checks user-run; live paired-flow/block/resume/global checks pending until observed. No closure without evidence.
## Questions and answers
Existing conversation supplies the agreed scope; no new product decisions are inferred.
1. When approve spec? → After questions and clarification, before plan.
2. Clarify automatically? → Yes; unresolved user decisions still asked.
3. When approve design? → Plan and tasks together.
4. Execution unit? → Whole feature or coherent functional block, tasks internal.
5. Main constraint? → Token economy, especially selective reading, without losing verification quality.
6. Commits/check execution? → Existing user-run commands and explicit commit approvals retained.
## Open questions
None for the authorized scope; real token/time savings remain unmeasured.
## Clarification — round 1 (2026-10-25) · Verdict: ready for plan
1. Ambiguities: approved blocks must be named; no automatic next-block/commit authority.
2. Conflicting requirements: update old per-skill stops and per-task reviews at their sources.
3. Missing test scenarios: include stale context, legacy tasks, absent evidence, critical paths and final integration.
4. Conflicts with constitution: authorized paired gates replace the previous universal per-skill stop; governing/critical checks remain.
Approval evidence: user explicitly requested implementing the preceding agreed workflow and selective-reading improvements. Delivery validation is pending.
