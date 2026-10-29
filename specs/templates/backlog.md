# Backlog — <project>

The flat index of the stories of the project. It holds the stories only: the change
written from a story lives in `specs/changes/` and the entry records its id.

One entry per vertical slice: a story delivers an observable result from data to
interface. The order is the priority of the owner, not the CRUD sequence of a feature.

## Status values
- `backlog` — proposed, not selected.
- `next` — the story to work on next. At most one.
- `wip` — the story in progress. At most one.
- `done` — its change was archived.

## Stories

| ID | Title | Why (value) | Feature | Size | Depends on | Status | Change |
|---|---|---|---|---|---|---|---|
<!-- One row per story. The id is the backlog id and the spec of its change records it in `Origin`. -->

The `Change` column holds the id of the change: the folder of `specs/changes/` before
the archive and the folder of `specs/archive/` after it.

## Open questions
<!-- One bullet per open question. -->
