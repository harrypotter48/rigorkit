# Backlog — rigorkit
Flat owner-ordered index: one HU/story/ticket per useful vertical slice, never a layer or CRUD step. Change details live in specs/changes/ (spec Origin carries HU-N); archived changes live in specs/archive/. The Change cell stores the stable change ID.

## Status values
- backlog: proposed, not selected.
- next: owner-selected next; at most one.
- wip: in progress; at most one.
- done: accepted change archived, keep its entry.

## Stories
| ID | Title | Why (value) | Feature | Size | Depends on | Status | Change |
|---|---|---|---|---|---|---|---|
| HU-1 | Install rigorkit with one line | A new machine gets `~/.rigorkit`, the `rigorkit` command, its help and manual page, helper scripts inside the installation and a custom area, without manual steps | updater | M | — | done | 008-updater |
| HU-2 | Learn about new versions and update the global scope | Daily check with terminal and agent notices, and `rigorkit update` for the clone and the global scope (changelog, global rules, edited copies, new packs, old script location), like `omz update` | updater | L | HU-1 | done | 010-update |
| HU-3 | Update projects and migrate 0.1.0 installs | Installation registry, project and development-install updates, scan of 0.1.0 installs and `rigorkit doctor`, so no installation is forgotten | updater | M | HU-2 | backlog | |
| HU-4 | Release tag on merge | A merge that changes `VERSION` publishes `v<VERSION>` after the toolkit tests pass, so the one-line installer gets releases without manual tagging | release | S | HU-1 | done | 009-release-tag |
| HU-5 | Close commit on archive | `sdd-archive` proposes one `type(<id>): close … [close]` commit with Outcome/Validation/Deferred/Refs, so a report reads one commit per finished change instead of every red/green/docs commit | work-tracking | S | — | done | 011-close-commit |
| HU-6 | Compact git reads for agents | `git-compact` (log/diff/status) and `git-activity --since/--until` (fetch, attribution by change-id scope, summary and close modes) in core, plus `spec-status` in sdd, so agents read activity in a few lines | work-tracking | M | HU-5 (close mode only) | done | 012-git-scripts |
| HU-7 | Deferred work file | Items the owner defers during a change go to `<git-common-dir>/rigorkit/deferred.md`, shared by worktrees and never committed, ready to move to an external backlog | work-tracking | S | — | wip | 013-deferred-file |
| HU-8 | Project roadmap instead of backlog | `specs/roadmap.md` replaces `specs/backlog.md` in templates, skills and docs, with a fallback to `backlog.md` plus a notice; `backlog: external` in `.rigorkit/project.yaml` sends future slices to the deferred file | work-tracking | M | HU-7 | backlog | |

## Open questions
- HU-2/HU-3 reuse the owner answers and clarification findings recorded in `specs/archive/008-updater/full-draft.md` and `clarification.md` (rounds 1–2, 2026-11-11). Pending owner choices: HU-3 — G9 (HU-2's choices were answered or delegated in `specs/archive/010-update/spec.md` answers 3–5). HU-3 follow-ups from 010: remove `pair` lines when a pack is no longer installed (architecture review L11); align `tools/install-remote.sh`'s newest-tag rule with the update's (no leading zeros, 010 K15).
- work-tracking (owner, 2026-11-12): proposed change IDs follow the work order — HU-5→011, HU-6→012, HU-7→013, HU-8→014; triage confirms. HU-3 also renames `specs/backlog.md` → `specs/roadmap.md` in installed projects; until then HU-8's fallback covers them.
