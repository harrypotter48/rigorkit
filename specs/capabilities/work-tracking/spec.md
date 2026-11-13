# Capability — Work tracking from history

> Status: current · Owner repo: rigorkit · DoD: normal

## Context and goal
Reports (daily, weekly, lead summaries) read work from git history. Commits name their change, and every finished change ends in one structured close commit, so a reader attributes commits by change ID and reads a finished change from a single commit.

## Users / actors
- Agents proposing commits in projects initialized with the sdd pack.
- The owner and report tooling reading history.

## Current contracts
- RF-1: The project rules template states `type(<id>): summary`, `<id>` = change ID; commits without a change take no scope; a `Refs: <ticket|HU>` footer only when a ticket or HU exists. (011)
- RF-2: `test(red)`, `test(green)`, `test(amend)` keep their scope with the change ID first; `sdd-tests` proposes `test(red): <id> <behavior>`, `sdd-implement` `test(green): <id> <behavior>`. (011)
- RF-3: `specs/templates/AGENTS.md` stays byte-equal to the pack template. (011)
- RF-4: `sdd-archive` proposes `type(<id>): close <title> [close]` with the change's main type. (011)
- RF-5: The close body carries `Outcome`, `Validation` (`done: how/env/date` or `pending: what`), `Deferred`, `Follow-ups` and a `Refs` footer. (011)
- RF-6: `sdd-implement` proposes `refactor(<id>):`; the sdd README lists it. (011)
- INV-1: `test(red):`/`test(amend):` prefixes stay as `factory-checks.mjs` enforces them.

## Scenario coverage
`tools/test/011-close-commit.test.mjs`: RF-1.H1/E1, RF-2.H1/E1/E2/F1, RF-3.H1, RF-4.H1/E1, RF-5.H1/E1, RF-6.H1/E1, INV-2.H1 (content ratchet).

## Out of scope
- Where the archive commit lands (owner branch practice).
- Parsing history (HU-6), deferred file (HU-7), roadmap rename (HU-8).

## Verification references
- `specs/archive/011-close-commit/` (spec with AMEND-1, tasks).
