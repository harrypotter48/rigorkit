# Spec 014 — Project roadmap instead of backlog
> Status: approved · Tier: story · DoD: normal · Owner repo: rigorkit · Affected repos: none
> Origin: HU-8 — the project file is a roadmap; the backlog of future work can live outside the repository.

## Context and goal
Owners keep a general backlog outside their repositories (for example in a personal vault), so a per-project file called `backlog.md` is ambiguous. The project file becomes `specs/roadmap.md`, and a project can declare `backlog: external` so `sdd-slice` sends proposed slices to the deferred file (013) and the roadmap keeps only selected, in-progress and done work. Projects not yet migrated keep working through a fallback.

## Users / actors
- Agents running `sdd-init` and `sdd-slice`.
- Owners with an external backlog; teams without one.

## User stories
- H1: As an owner I want one name per thing: roadmap in the repository, backlog outside.
- H2: As an owner with an external backlog I want proposed slices to reach it instead of the roadmap.
- H3: As an owner of an unmigrated project I want the skills to keep working and tell me how to migrate.

## Acceptance
New projects get `specs/roadmap.md` with statuses `proposed|next|wip|done`; skills read the roadmap, fall back to `backlog.md` with a one-time rename notice, and honour `backlog: external`; rigorkit's own roadmap is renamed; no `backlog.md` path is left in packs or docs except the fallback; the sdd pack does not grow; 0.5.0 is released with 013 and 014.

## Invariants
- INV-1: Skills never rename or move a project's file themselves (migration is HU-3).
- INV-2: sdd pack loaded tokens stay at or below `specs/archive/010-update/baseline.txt`.

## Functional requirements (EARS)
### Roadmap (H1)
- RF-1: THE SYSTEM SHALL ship the template `templates/roadmap.md` (no `templates/backlog.md`) with statuses `proposed`, `next`, `wip`, `done`, in the sdd pack and in `specs/templates/`, byte-equal.
- RF-2: WHEN `sdd-init` proposes and creates project files, THE SYSTEM SHALL name `roadmap.md`; WHEN `sdd-slice` writes, it SHALL update `specs/roadmap.md` with those statuses.
- RF-3: THE SYSTEM SHALL keep no `backlog.md` path in `packs/`, `README.md` or active changes except the fallback sentence, and rigorkit's own file SHALL be `specs/roadmap.md` with `proposed` instead of `backlog` statuses.
### External backlog (H2)
- RF-4: WHERE `.rigorkit/project.yaml` has `backlog: external`, `sdd-slice` SHALL record approved proposed slices with `rigorkit script deferred add` and add a roadmap row only when a story is selected; the `core-init` project template SHALL document the key.
### Fallback (H3)
- RF-5: IF `specs/roadmap.md` is missing and `specs/backlog.md` exists, THEN `sdd-slice` SHALL use it and say once `git mv specs/backlog.md specs/roadmap.md`.
### Release
- RF-6: THE SYSTEM SHALL set `VERSION` 0.5.0 with a changelog section (`Global rules: unchanged`, `New packs: none`) listing the deferred helper and the roadmap.

## Test scenarios
Static content checks in `tools/test/014-roadmap.test.mjs`.
### RF-1
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-1.H1 | happy | sdd-init templates | read | `roadmap.md` exists with `proposed`, `next`, `wip`, `done`; no `backlog.md` |
| RF-1.E1 | edge | `specs/templates/roadmap.md` | compare | byte-equal to the pack template |
| RF-1.F | n/a — static template | | | |
| RF-1.S | n/a — no input, auth or secrets | | | |
### RF-2
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-2.H1 | happy | sdd-slice and sdd-init SKILL.md | read | name `specs/roadmap.md` / `roadmap.md` and `proposed\|next\|wip\|done` |
| RF-2.E | n/a — single wording check | | | |
| RF-2.F | n/a — prose rule | | | |
| RF-2.S | n/a — prose rule | | | |
### RF-3
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-3.H1 | happy | rigorkit `specs/` | read | `roadmap.md` exists, `backlog.md` absent, no `\| backlog \|` status cell |
| RF-3.E1 | edge | `packs/`, `README.md`, `specs/changes/` | scan | `backlog.md` appears only in the fallback sentence |
| RF-3.F | n/a — static scan | | | |
| RF-3.S | n/a — static scan | | | |
### RF-4
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-4.H1 | happy | sdd-slice SKILL.md | read | `backlog: external` with `deferred add` |
| RF-4.E1 | edge | core-init `project.yaml` | read | documents `backlog: external` |
| RF-4.F | n/a — prose rule | | | |
| RF-4.S | n/a — prose rule | | | |
### RF-5
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-5.H1 | happy | sdd-slice SKILL.md | read | names `git mv specs/backlog.md specs/roadmap.md` |
| RF-5.E | n/a — single wording check | | | |
| RF-5.F | n/a — prose rule | | | |
| RF-5.S | n/a — prose rule | | | |
### RF-6
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-6.H1 | happy | VERSION, CHANGELOG.md | read | `0.5.0` and a section with both required lines mentioning `deferred` and `roadmap` |
| RF-6.E | n/a — single release | | | |
| RF-6.F | n/a — covered by 010 repo checks | | | |
| RF-6.S | n/a — no input | | | |
### INV-2
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| INV-2.H1 | happy | repo | measure-content against the 010 baseline | exit 0 |

## Out of scope
- Renaming installed projects' files (HU-3); until then the fallback.
- Changing triage/archive wording beyond the file name.

## Completion criteria
- All scenarios tested/green; checker none missing; full suite green.

## Questions and answers
1. Status names → `proposed|next|wip|done`. Owner, 2026-11-13.
2. `backlog: external` → proposed slices go to `deferred add`; roadmap row on selection. Owner, 2026-11-13.
3. Fallback → read `backlog.md`, one notice with the `git mv` command; never rename. Owner, 2026-11-13.
4. Rename rigorkit's own file and update 006. Owner, 2026-11-13.
5. Release 0.5.0 with 013 and 014. Owner, 2026-11-13.
6. The owner's projects are not touched; commands listed in the summary. Owner, 2026-11-13.

## Open questions
None.
