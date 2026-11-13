# Spec 013 — Deferred work file
> Status: approved · Tier: story · DoD: normal · Owner repo: rigorkit · Affected repos: none
> Origin: HU-7 — work the owner defers during a change is kept outside git, shared by worktrees, ready to move to an external backlog.

## Context and goal
When the owner says "leave this for another story" during a change, nothing records it except chat or the spec's Out of scope, which is design, not a queue. A per-repository file outside git, shared by every worktree, keeps those items until the owner moves them to their backlog (e.g. the vault productivity skill). A core helper writes, lists and clears it so agents and skills need only one short rule.

## Users / actors
- Agents during any SDD stage when the owner defers work.
- The owner's backlog tooling, which lists and clears the file.

## User stories
- H1: As the owner I want deferred items recorded the moment I defer them so none is lost.
- H2: As backlog tooling I want to list and clear them per repository without losing items added meanwhile.

## Acceptance
`rigorkit script deferred add|list|clear` keeps one-line entries in `<git-common-dir>/rigorkit/deferred.md`, shared by worktrees and never committed; the project rules tell agents to use it; `sdd-archive` reports what the change deferred; the sdd pack does not grow.

## Invariants
- INV-1: The file lives in `$(git rev-parse --git-common-dir)/rigorkit/deferred.md`: never in the worktree, never committed, the same for every worktree; a symlinked `rigorkit/` or `deferred.md`, or a common dir without `HEAD`, is refused (exit 3); `GIT_COMMON_DIR` and `CDPATH` from the environment are ignored.
- INV-2: An entry is one line `- YYYY-MM-DD HH:MM · <change-id|-> · <text>`; control characters in the text become spaces, runs of spaces collapse and ends are trimmed.
- INV-3: `clear` removes only the first N entries the caller listed; entries added later stay, also when an `add` runs at the same time (`add` and `clear` share a lock).
- INV-4: The inspected repository's config never runs a program (same git hardening as 012: hooks, fsmonitor off; no transport).
- INV-6: Exit codes: 0 ok, 1 write failure or lock timeout, 2 usage, 3 not a repository top or unsafe location. Repository names in the output have no control characters.
- INV-5: sdd pack loaded tokens stay at or below `specs/archive/010-update/baseline.txt`.

## Functional requirements (EARS)
### Record (H1)
- RF-1: WHEN called as `deferred add [--change <id>] [--repo <dir>] [--] <text…>`, THE SYSTEM SHALL append one INV-2 entry (local time; `-` without `--change`), create the folder and file with owner-only permissions if missing, and print `deferred: added (<N> in <repo>)`.
- RF-2: IF the text is empty after removing control characters, the change ID does not match `^[A-Za-z0-9._][A-Za-z0-9._-]*$`, or an option is unknown, THEN THE SYSTEM SHALL print usage and exit 2 without writing.
### List and clear (H2)
- RF-3: WHEN called as `deferred list [dir…]` (default `.`), THE SYSTEM SHALL print a TSV header `repo date change text`, one row per entry in file order, and end with `deferred: <N> in <M> repos`; a repository without file counts 0.
- RF-4: WHEN called as `deferred clear --first <n> --yes [--repo <dir>]`, THE SYSTEM SHALL remove the first `n` entries and keep the rest; IF `--yes` is missing or `n` is not a positive integer or exceeds the entries, THEN it SHALL print usage or the count and exit 2 without writing.
- RF-5: IF a directory is not the top of a git repository or worktree, THEN `add`, `list` and `clear` SHALL name it and exit 3 (`list` still prints the others).
### Rules (H1)
- RF-6: THE SYSTEM SHALL tell agents in the project rules template to run `rigorkit script deferred add` when the owner defers work, and `sdd-archive` SHALL fill `Deferred:` from the entries of the change.

## Non-functional requirements
- bash 3.2; `packs/core/scripts/deferred`, executable. Core README row.

## Test scenarios
Tests in `tools/test/013-deferred-file.test.mjs` on temporary repositories with a linked worktree.
### RF-1
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-1.H1 | happy | repo | `deferred add --change 013 onclick for another story` | one entry `- <date> <time> · 013 · onclick for another story` in the common-dir file; `git status` clean |
| RF-1.E1 | edge | linked worktree | `add` from the worktree, `list` from the main checkout | same entry |
| RF-1.E2 | edge | no `--change`; text with a newline and a tab | `add` | change `-`; one line, no control characters |
| RF-1.F | n/a — write failures are RF-2 and RF-5 | | | |
| RF-1.S2 | security | `rigorkit/deferred.md` is a symlink to a file outside `.git` | `add` | exit 3, target unchanged |
| RF-1.S1 | security | repo whose `core.hooksPath` hook and `core.fsmonitor` create a marker | `add`, `list`, `clear` | no marker (INV-4) |
### RF-2
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-2.H1 | happy | text after `--` that starts with `-` | `add -- -x is text` | accepted |
| RF-2.F1 | failure | empty text; `--change -x`; `--bogus` | `add` | usage, exit 2, no file |
| RF-2.E | n/a — boundaries are RF-2.F1 | | | |
| RF-2.S | n/a — option-like values covered by RF-2.F1 | | | |
### RF-3
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-3.H1 | happy | 2 entries | `list` | header, 2 rows, `deferred: 2 in 1 repos` |
| RF-3.E1 | edge | two repos, one without file | `list a b` | rows of a, `deferred: N in 2 repos` |
| RF-3.F | n/a — failure is RF-5 | | | |
| RF-3.S | n/a — covered by RF-1.S1 | | | |
### RF-4
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-4.H1 | happy | 3 entries | `clear --first 2 --yes` | 1 entry left (the third) |
| RF-4.E1 | edge | 2 listed, 1 added after listing | `clear --first 2 --yes` | the added one stays |
| RF-4.E2 | edge | 2 entries | `clear --first 2 --yes`, then `list` | file empty; `deferred: 0 in 1 repos`, exit 0 |
| RF-4.F2 | failure | plain folder | `clear --first 1 --yes --repo <dir>` | exit 3 |
| RF-4.F1 | failure | no `--yes`; `--first 0`; `--first 5` with 2 | `clear` | exit 2, file unchanged |
| RF-4.S | n/a — covered by RF-1.S1 | | | |
### RF-5
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-5.H1 | happy | valid repo | `list` | exit 0 |
| RF-5.F1 | failure | plain folder; subdirectory of a repo | `add`, `list` | named, exit 3; `list` still prints the valid repo |
| RF-5.E | n/a — covered by RF-5.F1 subdirectory case | | | |
| RF-5.S | n/a — covered by RF-1.S1 | | | |
### RF-6
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-6.H1 | happy | sdd-init AGENTS template and the repo copy | read | both contain `rigorkit script deferred add` and are byte-equal |
| RF-6.E1 | edge | sdd-archive SKILL.md | read | `Deferred` refers to `deferred list` |
| RF-6.F | n/a — prose rule | | | |
| RF-6.S | n/a — prose rule | | | |
### INV-5
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| INV-5.H1 | happy | repo | measure-content against the 010 baseline | exit 0 |

## Out of scope
- `backlog: external` and the roadmap rename (HU-8).
- Moving entries to the vault (productivity skill).

## Completion criteria
- All scenarios tested/green; checker none missing; full suite green.

## Questions and answers
1. Writer → core script `deferred add|list|clear`. Owner, 2026-11-13.
2. Trigger → one rule in the AGENTS template; `sdd-archive` fills `Deferred:`. Owner, 2026-11-13.
3. Entry format → `- YYYY-MM-DD HH:MM · <change-id|-> · <text>`. Owner, 2026-11-13.
4. Out of scope stays in the spec; only explicit owner deferrals go to the file. Owner, 2026-11-13.
5. `clear` needs `--yes` and removes only the listed first N. Owner, 2026-11-13.

## Amendments
- AMEND-1 (owner, 2026-11-13, autonomous run; sdd and security reviews): empty-file count, shared lock for `add`/`clear`, symlink and common-dir checks, exit 1 for write failures, sanitized names; new scenarios RF-1.S2, RF-4.E2, RF-4.F2. sdd-archive keeps only the change's rows in `Deferred`.

## Open questions
None.
