---
name: design-ux-flow
description: 'Reference for user flows: journeys, tasks, friction, recovery and observable usability criteria, with simulated results labeled. Use for "recorrido de usuario" or "fricción de UX" when specifying or planning.'
---
# design-ux-flow — User flows
**Type: reference.** No stage/stop of its own; caller skill or user controls approval.

## Project first
Constitution/AGENTS.md and the project's own UX artifacts win. Search them first: existing journeys, flows, research notes and support evidence in the repo. Cite them with file:line. Never restate them as new.

## Flow model
1. User and job: who acts, what they finish, how often, what breaks when they fail.
2. First-read object: what must be understood first; primary action: the one observable action.
3. Steps and touchpoints: entry, decisions, data entry, confirmation, recovery, exit.
4. Friction per step: extra steps, hidden state, unclear error, lost context, ambiguity, waiting.
5. Recovery: what the user does when a step fails, and what the product tells them.

## Simulated versus real
- With no user research in the project, the result is **simulated and heuristic**: state it, label every finding as a hypothesis, and never present it as user evidence, a quote, a sample size or a metric.
- With real research in the project, read it and cite it instead of simulating; a simulated finding that contradicts research loses.
- Never invent participants, interviews, percentages or business impact.
- When the flow matters and no research exists, ask for it as an open question instead of filling the gap with a persona.

## Observable criteria
Every recommendation becomes a checkable statement, not an adjective. Prefer counts, states and named elements over "intuitive", "clear" or "fast".
- Good: "the primary action is reachable in at most two interactions from the screen entry".
- Good: "a failed step names the field, the failed action and the next option".
- Bad: "the onboarding feels intuitive".

## Output
Questions for the spec (WHAT), observable acceptance criteria with the evidence to check them, and the assumptions labeled as assumptions. No implementation detail, no code structure and no visual finish judgment.

## Boundary
Code structure belongs to `frontend-structure`; hierarchy, states, responsive behavior and accessibility criteria belong to `design-ui-criteria`; the rendered review belongs to `design-ui-reviewer`. This reference produces requirements, not findings on a built screen.
