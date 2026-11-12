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
| HU-2 | Learn about new versions and update the global scope | Daily check with terminal and agent notices, and `rigorkit update` for the clone and the global scope (changelog, global rules, edited copies, new packs, old script location), like `omz update` | updater | L | HU-1 | wip | 010-update |
| HU-3 | Update projects and migrate 0.1.0 installs | Installation registry, project and development-install updates, scan of 0.1.0 installs and `rigorkit doctor`, so no installation is forgotten | updater | M | HU-2 | backlog | |
| HU-4 | Release tag on merge | A merge that changes `VERSION` publishes `v<VERSION>` after the toolkit tests pass, so the one-line installer gets releases without manual tagging | release | S | HU-1 | done | 009-release-tag |

## Open questions
- HU-2/HU-3 reuse the owner answers and clarification findings recorded in `specs/archive/008-updater/full-draft.md` and `clarification.md` (rounds 1–2, 2026-11-11). Pending owner choices per story: HU-2 — G1, G4, G13, G14, G15, G18, G21, G23; HU-3 — G9.
