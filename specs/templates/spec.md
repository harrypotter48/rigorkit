# Spec <NNN> — <Name>
> Status: draft | approved · DoD: normal | critical · Owner repo: <repo> · Affected repos: <…>
## Context and goal
<Problem/why; 1 paragraph, no stack/files.>
## Users / actors
<Who uses it.>
## User stories
- H1: As <role> I want <action> for <benefit>.
## Functional requirements (EARS)
### <Group> (H1)
- RF-1: WHEN <event>, THE SYSTEM SHALL <response> (<expected result>).
- RF-2: IF <unwanted condition>, THEN THE SYSTEM SHALL <response>.
- RF-3: WHILE <state>, THE SYSTEM SHALL <response>.
- RF-4: THE SYSTEM SHALL <permanent behavior>.
## Non-functional requirements
<Applicable performance/security/platform/language thresholds.>
## Test scenarios
<!-- ALL 4 types per RF, or RF-n.<type> n/a — reason; specs/templates/scenarios.md. -->
### RF-1
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-1.H1 | happy | <initial state> | <action> | <observable result> |
| RF-1.E1 | edge | <boundary> | <action> | <result> |
| RF-1.F1 | failure | <invalid input/error> | <action> | <response/unchanged state> |
| RF-1.S1 | security | <unauthorized user/other tenant> | <action> | <rejected> |
## Out of scope
<Explicitly NOT done this iteration.>
## Completion criteria
- All scenarios tested/green; checker none missing.
- <Manual main-flow demo.>
- <Critical: real smoke + critical-path regression.>
## Questions and answers
1. <Question> → <answer>
## Open questions
- [NEEDS CLARIFICATION] <specific question>
