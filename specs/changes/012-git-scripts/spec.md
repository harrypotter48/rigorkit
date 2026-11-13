# Spec 012 — Compact git reads for agents
> Status: approved · Tier: story · DoD: normal · Owner repo: rigorkit · Affected repos: none
> Origin: HU-6 — agents read git activity in a few lines instead of raw `git log`/`git diff` output.

## Context and goal
Agents preparing dailies and reports read raw git output: long logs, full diffs and noisy status, across several repositories. Three bash helpers, run through `rigorkit script <name>` like `test-summary`, return only what a reader needs: `git-compact` for everyday reads, `git-activity` for work done in a time range attributed by change ID (011 convention), and `spec-status` for where each SDD change stands.

## Users / actors
- Agents calling the helpers (any tool; bash 3.2 compatible, macOS default).
- The owner reading the reports built from them.

## User stories
- H1: As an agent I want compact `log`/`diff`/`status` so a read costs a few lines and the full output stays available.
- H2: As an agent I want activity per change across repositories in a date range so a report needs one call.
- H3: As an agent I want the state of every change in a repository so I do not read each spec and tasks file.

## Acceptance
On local test repositories, `git-compact`, `git-activity` and `spec-status` print the contracted lines, keep git's errors and exit codes, report incomplete coverage explicitly and never pass an option-like user value to git.

## Invariants
- INV-1: A user value in a date, author or repository position never reaches git as an option (rejected if it starts with `-`; git calls use `--end-of-options` or `--` where git accepts them).
- INV-2: Helpers only read: no write to files, the worktree, the index or refs (git runs with `GIT_OPTIONAL_LOCKS=0`; `git-compact` rejects `--output`, `-o`, `--ext-diff`, `--textconv`, `--no-index`), except `git fetch` in `git-activity` without `--no-fetch`.
- INV-4: The inspected repository's config never runs a program: every git call disables hooks, fsmonitor, external diff and textconv; fetch never prompts (`GIT_TERMINAL_PROMPT=0`, batch SSH); a path is read only if it is the top of a repository or worktree.
- INV-3: Partial results are never silent: any repository not read is named in the coverage line and the exit code is 3.

## Functional requirements (EARS)
### git-compact (H1)
- RF-1: WHEN called as `git-compact log [args]`, THE SYSTEM SHALL print one line per commit `<short-hash> <YYYY-MM-DD> <subject>`, at most 30, followed by `… N more · full log: <path>` when truncated.
- RF-2: WHEN called as `git-compact diff [args]`, THE SYSTEM SHALL print `git diff --stat` and, per file, its hunk headers, at most 60 lines; with `--full` it SHALL print the full diff, at most 200 lines; truncation adds `… N more · full log: <path>`.
- RF-3: WHEN called as `git-compact status [args]`, THE SYSTEM SHALL print `git status --short --branch`, at most 50 lines with the same truncation line.
- RF-4: IF git fails or the subcommand is unknown, THEN THE SYSTEM SHALL keep git's stderr and exit code, or print usage and exit 2.
### git-activity (H2)
- RF-5: WHEN called with `--since <date>` and repositories, THE SYSTEM SHALL print a TSV header `repo id commits first last last-subject` and one row per repository and change ID over `--all --no-merges` commits in range, newest first; the ID is the subject scope (`type(<id>):`) or, for `test(red|green|amend):`, the first summary word; other commits go to ID `-`.
- RF-6: WHEN `--until` or `--authors a,b` is given, THE SYSTEM SHALL keep only commits up to that date (commit date, also the date shown) and whose author email equals one of those emails, ignoring case.
- RF-7: WHEN a repository has a remote and `--no-fetch` is absent, THE SYSTEM SHALL `git fetch --quiet` first; IF the fetch fails, THEN it SHALL read local data and note `fetch failed: <repo>`; IF a path is not the top of a git repository or worktree, THEN it SHALL skip it, name it in the coverage line and exit 3.
- RF-8: WHEN `--close` is given, THE SYSTEM SHALL list only commits whose subject ends in `[close]` as `repo id date subject`, each followed by its `Outcome:` and `Validation:` body lines indented.
- RF-9: THE SYSTEM SHALL end with `repos: <N> read, <M> failed` and reject, with usage and exit 2, a missing `--since`, a date not `YYYY-MM-DD` (optionally `THH:MM`) or out of range (month 01–12, day 01–31, hour 00–23, minute 00–59), an empty or non-email author, or any value starting with `-`.
### spec-status (H3)
- RF-10: WHEN called as `spec-status [repo]`, THE SYSTEM SHALL print `id state tasks` for each folder in `specs/changes/`, where state is `defined` (no task done, no code commit), `in-progress` (some task done or a `feat|fix|refactor|perf|test(green)` commit for the ID), `implemented` (all tasks done, no `validation.md`) or `validated` (all tasks done and `validation.md`); a commit matches the ID when its scope (or, for `test(red|green|amend)`, its first word) equals the full name or its leading number, compared as text; IF git cannot read the repository, THEN it SHALL exit 3 with an error instead of printing states.
- RF-11: WHEN a folder is in `specs/archive/`, THE SYSTEM SHALL print `archived-unvalidated` if its `[close]` commit has `Validation: pending`, else `archived` (also when no `[close]` commit exists).

## Non-functional requirements
- bash 3.2 + POSIX awk/sed; no other runtime. `git-compact` lives in `packs/core/scripts/` (generic git); `git-activity` and `spec-status` in `packs/sdd/scripts/` (they depend on the 011 SDD convention). Executable.
- Full output for truncated reads goes to a new file per run, `mktemp "${TMPDIR:-/tmp}/rigorkit-git-compact.XXXXXX"`.
- Output strips control characters other than tab from repository text.

## Test scenarios
Tests in `tools/test/012-git-scripts.test.mjs` on temporary repositories with a local bare remote and a linked worktree.
### RF-1
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-1.H1 | happy | 3 commits | `git-compact log` | 3 lines `<hash> <date> <subject>`, no truncation line |
| RF-1.E1 | edge | 35 commits | `git-compact log` | 30 lines + `… 5 more · full log:` and the log file has 35 lines |
| RF-1.F | n/a — git failures are RF-4 | | | |
| RF-1.S | n/a — git-compact passes the agent's own arguments with git's trust; write and exec options are INV-2/INV-4 scenarios | | | |
### RF-2
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-2.H1 | happy | one modified file with two hunks | `git-compact diff` | stat line and both `@@` headers, no `+`/`-` content lines |
| RF-2.E2 | edge | a modified file named `my file.txt` | `git-compact diff` | heading `my file.txt:` |
| RF-2.E1 | edge | 300-line change | `git-compact diff --full` | 200 lines + `… N more · full log:` |
| RF-2.F | n/a — git failures are RF-4 | | | |
| RF-2.S | n/a — git-compact passes the agent's own arguments with git's trust; write and exec options are INV-2/INV-4 scenarios | | | |
### RF-3
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-3.H1 | happy | one modified, one untracked file | `git-compact status` | `## <branch>` line, ` M` and `??` lines |
| RF-3.E1 | edge | 60 untracked files | `git-compact status` | 50 lines + truncation line |
| RF-3.F | n/a — git failures are RF-4 | | | |
| RF-3.S | n/a — git-compact passes the agent's own arguments with git's trust; write and exec options are INV-2/INV-4 scenarios | | | |
### RF-4
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-4.H1 | happy | valid repo | `git-compact log` | exit 0 |
| RF-4.E1 | edge | no subcommand | `git-compact` | usage, exit 2 |
| RF-4.F1 | failure | not a git repository | `git-compact log` | git's `not a git repository` on stderr, git's non-zero exit |
| RF-4.S | n/a — git-compact passes the agent's own arguments with git's trust; no privilege boundary | | | |
### RF-5
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-5.H1 | happy | commits `feat(011)`, `fix(011)`, `docs(012)` | `git-activity --since … --no-fetch repo` | header, row `011` with 2 commits and row `012`, newest first |
| RF-5.E1 | edge | `test(red): 013 x`, `chore: y` and a commit only on another branch | same | rows `013` and `-`; the other branch's commit counted |
| RF-5.E2 | edge | a linked worktree path | same | same rows as the main checkout |
| RF-5.F | n/a — failures are RF-7 and RF-9 | | | |
| RF-5.S | n/a — covered by RF-9.S1 | | | |
### RF-6
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-6.H1 | happy | commits on 2026-01-05 and 2026-01-20 | `--since 2026-01-01 --until 2026-01-10` | only the first counted |
| RF-6.E1 | edge | commits by `a@x.test`, `b@x.test`, `a@xxtest`, `ba@x.test` and `A@X.test` | `--authors a@x.test` | only `a@x.test` and `A@X.test` counted |
| RF-6.F | n/a — invalid values are RF-9 | | | |
| RF-6.S | n/a — covered by RF-9.S1 | | | |
### RF-7
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-7.H1 | happy | clone whose remote has a newer commit | `git-activity` without `--no-fetch` | the remote commit is counted |
| RF-7.F1 | failure | remote URL that does not exist | `git-activity` | local rows, `fetch failed: <repo>`, exit 0 |
| RF-7.F2 | failure | one valid repo and one non-repo path | `git-activity` | valid rows, `repos: 1 read, 1 failed (<path>)`, exit 3 |
| RF-7.E1 | edge | repo without remote | `git-activity` | no fetch note, exit 0 |
| RF-7.E2 | edge | a subdirectory of a repository | `git-activity` | named in coverage, exit 3 |
| RF-7.S | n/a — fetch uses the repository's own configured remote | | | |
### RF-8
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-8.H1 | happy | a `[close]` commit with Outcome and Validation | `--close` | one row and its two indented body lines; normal commits absent |
| RF-8.E1 | edge | no `[close]` commit in range | `--close` | header and coverage line only, exit 0 |
| RF-8.F | n/a — failures are RF-7 and RF-9 | | | |
| RF-8.S | n/a — covered by RF-9.S1 | | | |
### RF-9
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-9.H1 | happy | valid call | `git-activity` | last line `repos: 1 read, 0 failed` |
| RF-9.E1 | edge | `--since 2026-01-01T09:30` | `git-activity` | accepted |
| RF-9.F1 | failure | no `--since`; `--since yesterday`; `--since 2026-13-45`; `--since 2026-01-01T09:30:00`; `--authors not-an-email`; `--authors ''` | `git-activity` | usage, exit 2 |
| RF-9.S1 | security | `--since=--output=x`, author `--upload-pack=x`, repo `--exec=x` | `git-activity` | exit 2, no file `x` created |
### RF-10
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-10.H1 | happy | changes `001-a` (no tasks done), `002-b` (1/3 done), `003-c` (3/3 done), `004-d` (3/3 + validation.md) | `spec-status` | `defined`, `in-progress`, `implemented`, `validated` with tasks `x/y` |
| RF-10.E1 | edge | `001-a` with 0/2 tasks and a `feat(001)` commit | `spec-status` | `in-progress` |
| RF-10.F1 | failure | path without `specs/` | `spec-status` | error naming the path, exit 2 |
| RF-10.F2 | failure | `specs/` in a folder that is not a git repository | `spec-status` | error, exit 3, no states |
| RF-10.E2 | edge | change folder `008-(x` and a `feat(008-(x):` commit | `spec-status` | `008-(x` `in-progress`, other rows intact |
| RF-10.S1 | security | repo argument `--help=x` | `spec-status` | usage, exit 2 |
### RF-11
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-11.H1 | happy | archived `005-e` with `[close]` `Validation: done: …` | `spec-status` | `archived` |
| RF-11.E1 | edge | archived `006-f` with `Validation: pending: smoke` and archived `007-g` without `[close]` | `spec-status` | `archived-unvalidated`, `archived` |
| RF-11.F | n/a — archive state has no failure path beyond RF-10.F1 | | | |
| RF-11.S | n/a — covered by RF-10.S1 | | | |

### INV-2 / INV-4
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| INV-2.H1 | happy | repo with a modified file | `git-compact status` and `diff` | `.git/index` bytes unchanged |
| INV-2.S1 | security | `git-compact log --output=x`, `diff -o x`, `diff --ext-diff`, `diff --no-index a b` | `git-compact` | usage, exit 2, no `x` |
| INV-4.S1 | security | repo with `core.fsmonitor` and a `core.hooksPath` hook that each create a marker file | `git-compact status`, `git-activity` with fetch | no marker file |

## Out of scope
- Announcing the helpers in `packs/core/rules.md` (critical path, 300-token limit): later HU.
- Other `git-compact` subcommands (`blame`, `show`, `grep`, `find`): deferred.
- Agent hooks that rewrite commands to these helpers: deferred.
- `blocked` state: set by the owner, never detected.
- Mapping HU to change IDs, reports and vault writes (productivity skill).

## Completion criteria
- All scenarios tested/green; checker none missing.
- Existing core script tests unaffected.

## Questions and answers
1. `git-compact log` shape → `%h %ad %s`, short date, 30 lines + full log. Owner, 2026-11-12.
2. `git-compact diff` → stat + hunk headers (60); `--full` 200 lines. Owner, 2026-11-12.
3. `git-compact status` → `--short --branch`. Owner, 2026-11-12.
4. `git-activity` CLI, TSV, fetch, coverage and exit codes 0/2/3 → as RF-5–RF-9. Owner, 2026-11-12.
5. `spec-status` states → as RF-10–RF-11; `blocked` is the owner's. Owner, 2026-11-12.
6. Option-like values → rejected; `--end-of-options`/`--` to git; strict ISO dates. Owner, 2026-11-12.

## Amendments
- AMEND-1 (owner, 2026-11-12, after sdd/security/architecture reviews): INV-2 widened (no index write, git-compact write/exec options rejected); INV-4 hardening against repository config; RF-6 exact case-insensitive author email and commit date; RF-7 repository top only; RF-9 strict dates and empty authors; RF-10 text ID match and git failure exit 3; git-activity moves to the sdd pack; per-run log file; control characters stripped. Frozen test amended: fixture rows filter (`repo\tid\t`), RF-2.H1 stat `| 4`, new scenarios above.

## Open questions
None.
