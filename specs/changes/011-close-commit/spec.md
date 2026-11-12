# Spec 011 — Close commit on archive
> Status: approved · Tier: story · DoD: normal · Owner repo: rigorkit · Affected repos: none
> Origin: HU-5 — a report reads one commit per finished change instead of every red/green/docs commit.

## Context and goal
Commits already follow `type(<change-id>): summary` in practice (`git log`: `fix(010): …`), but no rule says so, and the archive commit has no fixed shape. Reports (daily, weekly, lead summaries) must read every commit of a change to learn its outcome. A written subject convention plus one structured close commit per change lets a reader attribute commits by change ID and read a finished change from a single commit.

## Users / actors
- Agents proposing commits in a project initialized with the sdd pack.
- The owner and report tooling (HU-6 `git-activity`) reading history.

## User stories
- H1: As an agent I want one written commit convention so every commit names its change.
- H2: As the owner I want the archive commit to carry outcome and validation so one commit tells me how a change ended.

## Acceptance
A project initialized from the sdd templates states the commit convention, and `sdd-archive` proposes a `[close]` commit with Outcome, Validation, Deferred, Follow-ups and a Refs footer; the sdd pack does not grow.

## Invariants
- INV-1: `test(red):` and `test(amend):` subjects keep the exact prefixes that `packs/sdd/skills/sdd-init/scripts/factory-checks.mjs:56,59,72` enforce.
- INV-2: sdd pack loaded tokens stay at or below `specs/archive/010-update/baseline.txt` (content ratchet, `AGENTS.md:67`).

## Functional requirements (EARS)
### Commit convention (H1)
- RF-1: THE SYSTEM SHALL state in the project rules template that commit subjects use `type(<id>): summary` and carry a `Refs: <ticket|HU>` footer when a ticket or HU exists.
- RF-2: THE SYSTEM SHALL state that `test(red)` and `test(amend)` keep their scope and put the change ID first in the summary.
- RF-3: THE SYSTEM SHALL keep the repository's own `specs/templates/AGENTS.md` identical to the pack template.
### Close commit (H2)
- RF-4: WHEN `sdd-archive` proposes the archive commit, THE SYSTEM SHALL propose the subject `type(<id>): close <title> [close]`.
- RF-5: WHEN `sdd-archive` proposes the archive commit, THE SYSTEM SHALL propose a body with `Outcome`, `Validation` (`done: how/env/date` or `pending: what`), `Deferred` and `Follow-ups`, and a `Refs` footer.

## Non-functional requirements
- INV-2 measured with `node tools/measure-content.mjs --root . --baseline specs/archive/010-update/baseline.txt`.

## Test scenarios
Static content checks in `tools/test/011-close-commit.test.mjs`, following `tools/test/010-repo-checks.test.mjs`. INV-2 is checked by `INV-2.H1` in the same file.
### RF-1
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-1.H1 | happy | sdd-init AGENTS template | read | states `type(<id>): summary` and `Refs: <ticket\|HU>` |
| RF-1.E | n/a — the conditional footer is part of the RF-1.H1 wording | | | |
| RF-1.F | n/a — prose rule read by agents; no runtime failure path | | | |
| RF-1.S | n/a — no input, authorization, secrets or network | | | |
### RF-2
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-2.H1 | happy | sdd-init AGENTS template | read | states `test(red\|amend): <id> first` |
| RF-2.E1 | edge | sdd-tests red subject rule | read | still `test(red): <HU/change> <behavior>` (INV-1) |
| RF-2.F1 | failure | subject `test(red): 011 close commit` | factory-checks prefix | still matches `^test\(red\):` (INV-1) |
| RF-2.S | n/a — no input, authorization, secrets or network | | | |
### RF-3
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-3.H1 | happy | both AGENTS templates | compare | byte-equal |
| RF-3.E | n/a — a single file comparison has no boundary | | | |
| RF-3.F | n/a — prose rule read by agents; no runtime failure path | | | |
| RF-3.S | n/a — no input, authorization, secrets or network | | | |
### RF-4
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-4.H1 | happy | sdd-archive SKILL.md | read | proposes `type(<id>): close <title> [close]` |
| RF-4.E | n/a — the subject has one form | | | |
| RF-4.F | n/a — prose rule read by agents; no runtime failure path | | | |
| RF-4.S | n/a — no input, authorization, secrets or network | | | |
### RF-5
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-5.H1 | happy | sdd-archive SKILL.md | read | names Outcome, Validation, Deferred, Follow-ups and `Refs footer` |
| RF-5.E1 | edge | validation not done at archive | read | the `pending: what` form exists |
| RF-5.F | n/a — prose rule read by agents; no runtime failure path | | | |
| RF-5.S | n/a — no input, authorization, secrets or network | | | |

## Out of scope
- `git-activity` parsing (HU-6), deferred file (HU-7), roadmap rename (HU-8).
- Branch policy for where the archive commit lands (owner practice, not toolkit rule).
- Changing `sdd-tests` or `factory-checks.mjs`.
- VERSION bump / changelog section: owner release decision.

## Completion criteria
- All scenarios tested/green; checker none missing.
- Content ratchet green.

## Questions and answers
1. Where does the convention live? → Pack AGENTS template (all commits); the `[close]` shape only in `sdd-archive`. Owner, 2026-11-12.
2. `test(red)`/`test(amend)` exception? → Keep scope, ID first. Owner, 2026-11-12.
3. Commits without a change (`chore`, loose `docs`)? → No scope; reports ignore them. Agent under owner delegation ("sigue autónomo"), 2026-11-12; owner may reverse.
4. `Refs` without Jira? → `Refs: HU-N`. Agent under delegation, 2026-11-12.
5. Archive branch policy? → Out of scope (owner practice). Agent under delegation, 2026-11-12.

## Open questions
None.
