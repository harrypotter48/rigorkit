# Spec <NNN> — <Name>

> Status: draft | approved · DoD: normal | critical · Owner repo: <repo> · Affected repos: <…>

## Context and goal
<Problem and why it matters. One paragraph; no stack or files.>

## Users / actors
<Who uses it.>

## User stories
- H1: As a <role> I want <action> so that <benefit>.

## Functional requirements (EARS)
### <Group> (H1)
- RF-1: WHEN <event>, THE SYSTEM SHALL <response> (<expected result>).
- RF-2: IF <unwanted condition>, THEN THE SYSTEM SHALL <response>.
- RF-3: WHILE <state>, THE SYSTEM SHALL <response>.
- RF-4: THE SYSTEM SHALL <permanent behavior>.

## Non-functional requirements
<Only applicable requirements, with thresholds: performance, security, platforms, language…>

## Test scenarios
<!-- Each RF needs all 4 types: happy (H), edge (E), failure (F), security (S).
     An inapplicable type needs an RF-n.<type> row with "n/a — <reason>". See specs/templates/scenarios.md. -->
### RF-1
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-1.H1 | happy | <initial state> | <action> | <observable result> |
| RF-1.E1 | edge | <boundary value> | <action> | <result> |
| RF-1.F1 | failure | <invalid input or error> | <action> | <response and what stays unchanged> |
| RF-1.S1 | security | <unauthorized user / another tenant> | <action> | <rejected> |

## Out of scope
<What this iteration explicitly does NOT do.>

## Completion criteria
- Every test scenario covered by a passing test (`check-scenarios` reports none missing).
- <Manual demo of the main flow.>
- <If critical: real smoke test + critical-path regression.>

## Questions and answers
1. <Question> → <answer>

## Open questions
- [NEEDS CLARIFICATION] <specific question>
