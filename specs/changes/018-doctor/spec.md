# Spec 018 — rigorkit doctor
> Status: approved · Tier: story · DoD: critical (`bin/rigorkit`) · Owner repo: rigorkit · Affected repos: none
> Origin: HU-12 (slice of HU-3) — one read-only report of every installation's health.

## Context and goal
With the global record (010), project records (015/016) and project updates (017), the owner needs one command that says what is out of date, edited, missing or shadowed, without changing anything except the execute bit of official helper scripts. Prior owner answers: 008 answers 6, 24 and 48 (`specs/archive/008-updater/full-draft.md:449,467`; `specs/archive/008-updater/spec.md:409`), draft RF-24 and RF-41 (`full-draft.md:88-89`); 010 follow-up L11 (pair lines of packs no longer shipped).

## Users / actors
- The owner, any time; scripts that check the exit status.

## User stories
- H1: As the owner I want one report of versions, edits and problems across my installations.

## Acceptance
`rigorkit doctor` prints the clone version and local changes, custom items shadowing official ones, the global record's version, edited and missing copies and pairs of packs no longer shipped, and per registered project its version, outdated state, development clone, edited copies or a missing folder; it repairs only the execute bit of official scripts; exit 0 when nothing needs attention, 1 otherwise.

## Invariants
- INV-1: doctor writes nothing except `chmod u+x` on official `packs/*/scripts/*` of the clone (RF-41); custom scripts are only reported.
- INV-2: Printed paths go through `print_safe`; no git runs in a project.

## Functional requirements (EARS)
- RF-1: WHEN called as `rigorkit doctor`, THE SYSTEM SHALL print `clone <version>` and, IF the clone has local changes outside `custom/`, a line saying so.
- RF-2: THE SYSTEM SHALL report custom scripts and packs that shadow official ones and custom scripts that are not executable, and SHALL make non-executable official scripts executable, reporting each in one line.
- RF-3: WHEN the global record exists, THE SYSTEM SHALL print its version and report each copy whose current fingerprint differs from a recorded one (`edited`), each recorded copy that is missing, and each `pair` whose pack is no longer shipped; IF it is unreadable, THEN it SHALL say so.
- RF-4: FOR each valid project record, THE SYSTEM SHALL print `project <path> <version>` with `outdated` when older than the clone, `dev <clone>` when present, the number of edited copies, and `missing` when the folder no longer exists.
- RF-5: THE SYSTEM SHALL exit 0 when nothing was reported as needing attention (outdated, edited, missing, shadowing, local changes, unreadable record, stale pair) and 1 otherwise; repairs alone do not count.
- RF-6: THE SYSTEM SHALL document `doctor` in `help/doctor.txt`, `help/rigorkit.txt`, the man page and README.

## Test scenarios
Tests in `tools/test/018-doctor.test.mjs` with a temporary HOME and a clone copy at `~/.rigorkit` (git repository).
### RF-1
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-1.H1 | happy | clean clone | `doctor` | `clone <VERSION>`, exit 0 |
| RF-1.E1 | edge | an edited tracked file in the clone | `doctor` | `local changes` line, exit 1 |
| RF-1.F | n/a — a clone without git reports no local-change line; covered by RF-1.H1 setup | | | |
| RF-1.S | n/a — no input | | | |
### RF-2
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-2.H1 | happy | an official script without execute bit | `doctor` | `made executable` line, bit set, exit 0 |
| RF-2.E1 | edge | `custom/scripts/test-summary` (not executable) | `doctor` | shadow and not-executable lines, custom file mode unchanged, exit 1 |
| RF-2.F | n/a — chmod failure is reported like the update | | | |
| RF-2.S | n/a — only clone files are touched (INV-1) | | | |
### RF-3
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-3.H1 | happy | global install of core for claude | `doctor` | `global <version>`, exit 0 |
| RF-3.E1 | edge | an edited global copy and a deleted one | `doctor` | `edited` and `missing` lines naming them, exit 1 |
| RF-3.E2 | edge | a record `pair` for a pack not shipped | `doctor` | `no longer shipped` line, exit 1 |
| RF-3.F1 | failure | unreadable global record | `doctor` | `cannot be read` line, exit 1 |
| RF-3.S | n/a — paths printed through print_safe (INV-2) | | | |
### RF-4
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-4.H1 | happy | project installed at the clone version | `doctor` | `project <path> <version>` without `outdated`, exit 0 |
| RF-4.E1 | edge | project record at an older version with `dev` and one edited copy | `doctor` | `outdated`, `dev <clone>`, `1 edited`, exit 1 |
| RF-4.F1 | failure | registered folder deleted | `doctor` | `missing`, exit 1 |
| RF-4.S | n/a — no git runs in projects (INV-2) | | | |
### RF-5
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-5.H1 | happy | healthy setup with a repaired script | `doctor` | exit 0 |
| RF-5.E | n/a — exit 1 cases are in RF-1.E1–RF-4.F1 | | | |
| RF-5.F | n/a — covered above | | | |
| RF-5.S | n/a — no input | | | |
### RF-6
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-6.H1 | happy | help, man, README | read | `doctor` documented; `generate-man --check` passes |
| RF-6.E | n/a — static | | | |
| RF-6.F | n/a — the docs check fails on drift (016) | | | |
| RF-6.S | n/a — static | | | |

## Out of scope
- Removing stale pair lines or records (doctor only reports); fixing edited copies (update does).

## Completion criteria
- All scenarios green; 008/010 command-list tests amended for `doctor`; full suite; docs check.

## Questions and answers
1. Exit 1 when anything needs attention, so scripts can use it. Delegated, 2026-11-13.
2. Only the execute bit of official scripts is repaired (answer 24). Owner, 2026-11-11.
3. Stale pairs are reported, not removed (010 L11 follow-up). Delegated, 2026-11-13.

## Amendments
- AMEND-1 (owner delegation, 2026-11-13): the command lists in `tools/test/008-rigorkit-cli.test.mjs` RF-25.H1 and `tools/test/010-repo-checks.test.mjs` RF-29.E1 now include `doctor`.

## Open questions
None.
