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
- RF-7: `packs/core/scripts/git-compact <log|diff|status>` prints one line per commit (30), stat + hunk headers (60, `--full` 200) or short status (50); truncation keeps a per-run full log; refuses `--output`, `-o`, `--ext-diff`, `--textconv`, `--no-index`, `--show-signature`, `%G` formats and bare repositories. (012)
- RF-8: `git-activity --since <date> [--until] [--authors] [--close] [--no-fetch] <repo>...` prints TSV per repository and change ID (scope, or first word after `test(red|green|amend):`, else `-`), exact case-insensitive author emails, commit dates, `--close` with Outcome/Validation; coverage line last, exit 3 when a path is not a repository top. (012)
- RF-9: `spec-status [repo]` prints `id state tasks` for `specs/changes/` (defined, in-progress, implemented, validated) and `specs/archive/` (archived, archived-unvalidated); IDs compared as text; exit 3 when git history is unreadable. (012)
- INV-2: Helpers only read (no index write, `GIT_OPTIONAL_LOCKS=0`, private index copy for diff) except `git-activity`'s fetch. (012)
- RF-10: `packs/core/scripts/deferred add [--change <id>] [--repo <dir>] [--] <text…>` appends `- YYYY-MM-DD HH:MM · <id|-> · <text>` to `<git-common-dir>/rigorkit/deferred.md` (owner-only, shared by worktrees, never committed); `list [dir…]` prints TSV and `deferred: N in M repos`; `clear --first <n> --yes` removes only the first n under a lock shared with `add`. Exit 0/1 (write, lock)/2 (usage)/3 (not a repository top, symlink or fake git dir). (013)
- RF-11: Project rules tell agents to run `rigorkit script deferred add` when the owner defers work; `sdd-archive` fills `Deferred` from the change's rows. (013)
- RF-12: The project index is `specs/roadmap.md` with statuses `proposed|next|wip|done` (template in sdd-init and `specs/templates/`); `sdd-slice` falls back to an old `specs/backlog.md` (status `backlog` = `proposed`), says once `git mv specs/backlog.md specs/roadmap.md` and never renames; `sdd-init` treats an old backlog file as the roadmap. (014)
- RF-13: `backlog: external` in `.rigorkit/project.yaml` makes `sdd-slice` record proposed slices with `rigorkit script deferred add`; the roadmap row appears when a story is selected. (014)
- INV-3: The inspected repository's config never runs a program: hooks, fsmonitor, signatures, textconv, external diff, clean/smudge filters, alternates, credential helpers and prompts are off; reads use no transport (lazy fetch blocked); `git://` refused for fetch. (012)

## Scenario coverage
`tools/test/011-close-commit.test.mjs`: RF-1.H1/E1, RF-2.H1/E1/E2/F1, RF-3.H1, RF-4.H1/E1, RF-5.H1/E1, RF-6.H1/E1, INV-2.H1 (content ratchet).
`tools/test/014-roadmap.test.mjs`: static checks for RF-12/RF-13 and the 0.5.0 release.
`tools/test/013-deferred-file.test.mjs`: 19 tests for RF-10/RF-11 (symlink, full clear, race checked by hand).
`tools/test/012-git-scripts.test.mjs`: 37 scenarios for RF-7–RF-9 and INV-2/INV-3 (marker tests cover hooks and fsmonitor; signature, lazy-fetch, filter and `git://` hardening checked by hand and in review).

## Out of scope
- Where the archive commit lands (owner branch practice).
- Renaming installed projects' files (HU-3). External mode entry fields and HU-N allocation; switching an existing roadmap to external (014 review, low). Unicode C1/bidi characters in deferred text are not filtered (013 review, low).

## Verification references
- `specs/archive/011-close-commit/` (spec with AMEND-1, tasks).
- `specs/archive/012-git-scripts/` (spec with AMEND-1–3, tasks).
- `specs/archive/013-deferred-file/` (spec with AMEND-1, tasks).
- `specs/archive/014-roadmap/` (spec with AMEND-1, tasks).
