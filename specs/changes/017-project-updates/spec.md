# Spec 017 — Update registered projects
> Status: approved · Tier: story · DoD: critical (`lib/update.sh`) · Owner repo: rigorkit · Affected repos: none
> Origin: HU-10 (slice of HU-3) — one `rigorkit update` brings every registered project up to date, asking before anything the owner edited.

## Context and goal
Projects are registered by `install --project` (015) and `rigorkit scan` (016), but `rigorkit update` refreshes only the global scope. Phase 2 now also walks the project records: it lists projects older than the release, updates the ones the owner confirms with the same staging-and-fingerprint logic as the global refresh, asks with a diff before replacing an edited copy, offers to remove records of missing folders, treats development installs apart and offers the `backlog.md` → `roadmap.md` rename. Nothing is committed, staged or pushed. Prior owner answers: 008 answer 8 (`specs/archive/008-updater/full-draft.md:451`), INV-6 (`:31`), draft RF-15, RF-23, RF-36 (`:71,85,48`); decisions under the owner's delegation (2026-11-13) in Q&A.

## Users / actors
- The owner running `rigorkit update` in a terminal.

## User stories
- H1: As the owner I want one update to bring my registered projects to the new release.
- H2: As the owner I want my edited copies, development installs and missing folders handled explicitly.

## Acceptance
After a release, `rigorkit update` asks once per outdated registered project; on a yes its unedited copies are replaced, edited ones asked overwrite/keep with a diff, its record and `.rigorkit-version` move to the new version and nothing is staged; development installs get their own question; missing folders can be unregistered; `specs/backlog.md` can be renamed to `specs/roadmap.md`; `--dry-run` writes nothing; the global refresh is unchanged.

## Invariants
- INV-1: Project updates never commit, push or stage (008 INV-6); only copies, the project's `.rigorkit-version`, the optional rename and the project record change.
- INV-2: The global refresh keeps its 010 behaviour (010 suites unchanged).
- INV-3: A project record's version advances only when nothing in that project was answered no, skipped or failed; a kept edited copy is a decision remembered by its declined fingerprint and does not hold the version back (same as the global refresh, 010 RF-19).

## Functional requirements (EARS)
### Projects (H1)
- RF-1: WHEN phase 2 runs, THE SYSTEM SHALL list every valid project record (`projects/` files named by 16 hex digits) whose version is older than the release and ask `Update project <path> (<old> -> <new>)?`; on a yes it SHALL stage the project's recorded pairs with `install.sh --project` and replace unedited copies (current fingerprint equals the recorded one, or equals the new one).
- RF-2: WHEN a copy differs from both its recorded and its new fingerprint (or its record is `-` and it differs from the new one), THE SYSTEM SHALL show the diff and ask overwrite or keep, recording the kept new fingerprint as declined like the global refresh.
- RF-3: WHEN a project was updated without declines, skips or failures, THE SYSTEM SHALL set its record version and its `.rigorkit-version` to the release.
### Special cases (H2)
- RF-4: WHEN a record has `dev <clone>`, THE SYSTEM SHALL list it apart and ask `<path> was installed from the development clone <clone>. Update it from ~/.rigorkit?`; an update from `~/.rigorkit` drops the `dev` line.
- RF-5: IF a recorded project folder no longer exists, THEN THE SYSTEM SHALL report it and ask `Remove the record of <path>?`, removing only that record on a yes and going on with the rest.
- RF-6: WHEN an updated project has `specs/backlog.md` and no `specs/roadmap.md`, THE SYSTEM SHALL ask `Rename specs/backlog.md to specs/roadmap.md in <path>?` and rename it without git on a yes.
- RF-7: WHEN `--dry-run` is given or no terminal is attached, THE SYSTEM SHALL ask nothing and write nothing for projects, listing them as would-ask or skipped.

## Test scenarios
Tests in `tools/test/017-project-updates.test.mjs` with a local test remote, a clone at 0.3.0, a release 0.4.0 that changes a skill, and projects registered by `install --project`.
### RF-1
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-1.H1 | happy | git project registered at 0.3.0 | update, answer y | copy has the 0.4.0 text, nothing staged in the project |
| RF-1.E1 | edge | same | update, answer n | copy unchanged, project listed as pending |
| RF-1.F1 | failure | project whose record names a pack that is no longer shipped | update, answer y | other copies updated, message names the pack |
| RF-1.S1 | security | a project record with a wrong header in `projects/` | update | ignored, no question |
### RF-2
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-2.H1 | happy | edited skill copy | update, y, then k | copy kept, record keeps the declined new fingerprint, record version advanced |
| RF-2.E1 | edge | edited skill copy | update, y, then o | copy overwritten |
| RF-2.E2 | edge | record fingerprint `-` and copy equal to the new text | update, y | no overwrite question |
| RF-2.F | n/a — a failed write is reported and fails the project like RF-1.F1 | | | |
| RF-2.S | n/a — copies are written by the 010 `write_copy` (no write through links), covered by 010 | | | |
### RF-3
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-3.H1 | happy | updated project, nothing declined | after update | record `version 0.4.0`, `.rigorkit-version` 0.4.0 |
| RF-3.E | n/a — the declined case is RF-2.H1 | | | |
| RF-3.F | n/a — failure keeps the version (RF-1.F1 checks the record version stays) | | | |
| RF-3.S | n/a — no input | | | |
### RF-4
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-4.H1 | happy | project installed from a development clone | update | development question asked; on y the record has no `dev` line |
| RF-4.E | n/a — single question | | | |
| RF-4.F | n/a — same flow as RF-1 | | | |
| RF-4.S | n/a — the clone path is printed through print_safe | | | |
### RF-5
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-5.H1 | happy | registered project folder deleted | update, answer y | its record removed, other records kept |
| RF-5.E | n/a — a no keeps the record (same path as RF-1.E1) | | | |
| RF-5.F | n/a — removal failure reported like 010 | | | |
| RF-5.S | n/a — only the record file named by the hash is removed | | | |
### RF-6
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-6.H1 | happy | updated git project with `specs/backlog.md` | answer y | `specs/roadmap.md` holds the content, `backlog.md` gone, nothing staged |
| RF-6.E | n/a — no rename when `roadmap.md` exists (not asked) | | | |
| RF-6.F | n/a — rename failure reported | | | |
| RF-6.S | n/a — fixed names | | | |
### RF-7
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-7.H1 | happy | outdated project | `update --dry-run` | `would ask: Update project`, project and record unchanged |
| RF-7.F1 | failure | outdated project, no terminal | update | project listed as skipped, unchanged |
| RF-7.E | n/a — two modes cover it | | | |
| RF-7.S | n/a — no input | | | |

## Out of scope
- Doctor (HU-12); rules blocks in projects (projects have none); new packs offered to projects.

## Completion criteria
- All scenarios tested/green; 010 update suites green (INV-2); full suite; README, `help/update.txt` and changelog updated (principle 9).

## Questions and answers
1. One yes/no per outdated project (answer 8). Delegated, 2026-11-13.
2. Unedited copies of a confirmed project are replaced without another question; edited copies asked with diff. Delegated, 2026-11-13.
3. `.rigorkit-version` moves with the record version. Delegated, 2026-11-13.
4. Development installs asked apart (RF-36); missing folders offered for removal (RF-23). Owner answers 008, 2026-11-11.
5. The `specs/backlog.md` → `specs/roadmap.md` rename asked per project, plain `mv` (never staged). Owner, 2026-11-13 (014 Q6).

## Amendments
- AMEND-1 (owner delegation, 2026-11-13): a kept edited copy does not hold the project version back, as in the global refresh; RF-2.H1 expects version 0.4.0.

- AMEND-2 (owner delegation, 2026-11-13): `tools/test/014-roadmap.test.mjs` RF-3.E1 also accepts lines that name `roadmap.md` (the rename this change performs), not only the fallback sentence.

## Open questions
None.
