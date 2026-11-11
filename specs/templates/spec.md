# Spec <NNN> — <Name>
> Status: draft | approved · Tier: trivial | story | feature · DoD: normal | critical · Owner repo: <repo> · Affected repos: <repos>
> Origin: <HU-N or none> — <request>
## Context and goal
<Problem/why, one paragraph; no implementation.>
## Users / actors
<Users.>
## User stories
- H1: As <role> I want <action> for <benefit>.
## Acceptance
<Observable owner outcome.>
## Invariants
<!-- INV-n: always-true constraint; implementing code cites ID. None if absent. -->
- INV-1: <constraint>.
## Functional requirements (EARS)
### <Group> (H1)
- RF-1: WHEN <event>, THE SYSTEM SHALL <observable response>.
- RF-2: IF <condition>, THEN THE SYSTEM SHALL <response>.
- RF-3: WHILE <state>, THE SYSTEM SHALL <response>.
- RF-4: THE SYSTEM SHALL <permanent behavior>.
## Non-functional requirements
<Applicable measurable constraints.>
## Test scenarios
<!-- Four types/RF or justified n/a; see scenarios.md. -->
### RF-1
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-1.H1 | happy | <state> | <action> | <result> |
| RF-1.E1 | edge | <boundary> | <action> | <result> |
| RF-1.F1 | failure | <error> | <action> | <response/unchanged state> |
| RF-1.S1 | security | <unauthorized/other tenant> | <action> | <rejected> |
## Out of scope
<Exclusions.>
## Completion criteria
- All scenarios tested/green; checker none missing.
- <Manual main-flow demo.>
- <Critical: real smoke + regression.>
## Questions and answers
1. <Question> → <answer>
## Open questions
- [NEEDS CLARIFICATION] <question>
## Delivery evidence
<Red/base/amendments, consumers, executed commands/results, unrun browser/container/e2e/other checks. Pending≠green; owner accepts each slice.>
