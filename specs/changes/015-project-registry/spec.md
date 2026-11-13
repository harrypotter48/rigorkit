# Spec 015 — Project registry
> Status: approved · Tier: story · DoD: critical (`install.sh`) · Owner repo: rigorkit · Affected repos: none
> Origin: HU-9 (slice of HU-3) — every project install is recorded so updates and doctor know every installation.

## Context and goal
`rigorkit install --global` records what it wrote (010), but a project install records nothing besides `<project>/.rigorkit-version`, and installs from another clone record nothing at all. HU-10 (update projects), HU-11 (0.1.0 migration) and HU-12 (doctor) need one record per project: path, packs, agents, version and a fingerprint per copy, plus whether it came from a development clone. Prior owner answers: 008 answers 8 and 14 (`specs/archive/008-updater/full-draft.md:451,457`), draft RF-20, RF-34, RF-35 (`:80-81,47`), INV-1 (`:26`); 010 RF-18 (a project install never changes the global record).

## Users / actors
- The owner running `rigorkit install --project` (from `~/.rigorkit` or a development clone).
- Later slices reading the registry (HU-10–HU-12).

## User stories
- H1: As the owner I want each project install recorded so updates can find it.
- H2: As the owner I want installs from a development clone marked as such.

## Acceptance
After `rigorkit install --project <dir>`, `~/.local/state/rigorkit/projects/<key>` holds a valid project record with the project's real path, version, pairs and copy fingerprints; reinstalling merges; a development install carries the clone; `--dry-run` and `RK_NO_RECORD=1` write nothing; the global record does not change.

## Invariants
- INV-1: A project install never changes the global record (010 RF-18).
- INV-2: `--dry-run`, `--uninstall-rules` and `RK_NO_RECORD=1` write no project record.
- INV-3: Record format and fingerprints stay twins of `lib/common.sh` (010 review twins check).
- INV-4: A failure to write the record never fails the install; it warns in one line (also without `shasum`/`sha256sum` or with a symlinked state folder).
- INV-5: Paths with any control character are never recorded. Readers take only files named `^[0-9a-f]{16}$` in `projects/` (temp and `.corrupt` files have dots).

## Functional requirements (EARS)
### Record (H1)
- RF-1: WHEN `install.sh --project <dir>` writes, THE SYSTEM SHALL write `~/.local/state/rigorkit/projects/<key>` (`<key>` = first 16 hex of the SHA-256 of the real path) with header `rigorkit-project-record 1`, `path <real path>`, `version`, one `pair` per pack/agent and one `copy` per skill/agent copy with its fingerprint, in the global record's line format.
- RF-2: WHEN the same project is installed again, THE SYSTEM SHALL keep earlier pairs and copies, add the new ones, replace changed fingerprints and set the version to the installing version; IF the existing record names another path, THEN it SHALL warn and not record this install.
- RF-3: IF the existing project record is unreadable or not a project record (`record_valid` checks the expected header and the lines its kind allows: `path` once and `dev` only in project records, `rules` only in the global one), THEN THE SYSTEM SHALL move it to `<record>.corrupt`, say so in one line and start a new record.
### Development (H2)
- RF-4: WHEN the install runs from a clone other than `~/.rigorkit`, THE SYSTEM SHALL add `dev <real clone path>` to the project record; an install from `~/.rigorkit` SHALL have no `dev` line; IF the clone path cannot be recorded, THEN the install is not recorded (warning).

## Test scenarios
Tests in `tools/test/015-project-registry.test.mjs` with a temporary HOME, clone copy and project.
### RF-1
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-1.H1 | happy | clone at `~/.rigorkit`, empty project | `install --project p --pack core,sdd --agent claude` | one record: header, `path` = real path, version, pairs core/claude and sdd/claude, `copy` for `.claude/skills/sdd-spec` with a 64-hex fingerprint; no `dev` |
| RF-1.E1 | edge | project reached through a symlinked path | install | `path` is the real path; key from the real path |
| RF-1.F1 | failure | `~/.local/state/rigorkit/projects` cannot be created (a file there) | install | install exits 0 and warns once about the project record |
| RF-1.S1 | security | a project path with a tab | install | no record line with that path; warning |
| RF-1.S2 | security | a project path with an escape character | install | no project record; warning |
### RF-2
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-2.H1 | happy | core for claude, then sdd for codex | second install | pairs core/claude and sdd/codex, copies of both kept |
| RF-2.E1 | edge | same install twice | second install | identical pairs and copies, no duplicates |
| RF-2.E2 | edge | first install at 0.5.0, then from a clone at 0.6.0 | second install | `version 0.6.0` |
| RF-2.F1 | failure | the record at this project's key names another path | install | warning, record unchanged |
| RF-2.S | n/a — no new input beyond RF-1.S1 | | | |
### RF-3
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-3.H1 | happy | garbage in the project record | install | `<record>.corrupt` holds the garbage; new valid record |
| RF-3.E1 | edge | a global-header record at the project key | install | moved to `.corrupt`; new project record |
| RF-3.F | n/a — move failure is covered by INV-4's warning | | | |
| RF-3.S | n/a — the corrupt content is never printed (checked in RF-3.H1) | | | |
### RF-4
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-4.H1 | happy | clone outside `~/.rigorkit` | install --project | record has `dev <real clone path>` |
| RF-4.E1 | edge | first from a development clone, then from `~/.rigorkit` | second install | no `dev` line |
| RF-4.F | n/a — same write path as RF-1.F1 | | | |
| RF-4.S1 | security | development clone path with a tab | install | no project record; warning |
### INV
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| INV-1.H1 | happy | existing global record | project install | global record byte-equal |
| INV-2.H1 | happy | `--dry-run`; `RK_NO_RECORD=1` | project install | no projects folder |

## Out of scope
- Listing, updating or removing project records (HU-10, HU-12); scanning 0.1.0 installs (HU-11).
- Project rules blocks (project installs write no rules).

## Completion criteria
- All scenarios tested/green; critical regression: 008/010 install suites and project/global dry-runs plus a real install in a temporary folder; full suite green.

## Questions and answers
1. One file per project in `~/.local/state/rigorkit/projects/<key>`, global record format plus `path` and `dev`. Owner, 2026-11-13.
2. Real path (`pwd -P`); a moved project is a new one; doctor reports the old one (HU-12). Owner, 2026-11-13.
3. Reinstall merges; nothing removed here. Owner, 2026-11-13.
4. `--dry-run` and `RK_NO_RECORD=1` write nothing. Owner, 2026-11-13.
5. Write failure warns, install continues. Owner, 2026-11-13.
6. Real installs in temporary HOME and project; full installer regression. Owner, 2026-11-13.

## Amendments
- AMEND-1 (owner, 2026-11-13, autonomous run; sdd and security reviews): kind-checked `record_valid`, project version set on reinstall, identity check on the record key, control characters, dev path and missing hash tool or symlinked state folder not recorded with a warning; new scenarios RF-1.S2, RF-2.E2, RF-2.F1, RF-3.E1, RF-4.S1.

## Open questions
None.
