# Changelog

## 0.6.2
Global rules: unchanged
New packs: none

- Rigorkit-owned CLI output now uses semantic colors only for terminal destinations, independently for stdout and stderr: additions/successes green, removals/errors red, questions/warnings yellow and headings cyan. Ordinary paths and typed answers keep the terminal default.
- Non-empty `NO_COLOR` or `TERM=dumb` disables styling; agents using a pseudoterminal can set `NO_COLOR=1`. Pipes, files, installed content and agent notices stay plain, and `rigorkit script` preserves each script's own output and colors.

## 0.6.1
Global rules: unchanged
New packs: none

- `rigorkit scan` lists every project it finds first and asks one question: `y` registers all with the suggested tools, `e` asks per project, `n` none. It shows progress and skips copies of tools you did not choose, so a first scan is quicker and never looks stuck waiting for an answer.
- README: quick start for new and existing installs, and the factory diagram.

## 0.6.0
Global rules: unchanged
New packs: none

- `rigorkit scan [--save] [<folder>...]`: finds the projects where rigorkit is installed (folders with `.rigorkit-version` below `scan_paths` in `~/.config/rigorkit/config`, skipping `scan_exclude`), asks which tools each serves, marks copies you edited since 0.1.0 and registers them.
- `rigorkit update` now also updates registered projects: one question per outdated project, edited copies asked overwrite or keep with the diff, development installs asked apart, records of deleted folders removable, and the `specs/backlog.md` → `specs/roadmap.md` rename offered. Nothing is committed or staged.
- `rigorkit install --project` registers each project in `~/.local/state/rigorkit/projects`.
- `rigorkit doctor`: read-only report of versions, edited or missing copies, shadowing custom items and outdated or missing projects; it only repairs the execute bit of official scripts.
- The one-line installer and the records reject versions with leading zeros, like `rigorkit update`.
- After updating: run `rigorkit scan --save ~/workspace` (or your folders) once, then `rigorkit update` to bring your projects up to date.

## 0.5.0
Global rules: unchanged
New packs: none

- `rigorkit script deferred add|list|clear`: work you defer during a change goes to `.git/rigorkit/deferred.md`, shared by worktrees and never committed; project rules tell agents to use it and `sdd-archive` lists what the change deferred.
- `specs/backlog.md` is now `specs/roadmap.md`, with statuses `proposed|next|wip|done`. Existing projects keep working: `sdd-slice` reads `backlog.md` and tells you once to run `git mv specs/backlog.md specs/roadmap.md`.
- `backlog: external` in `.rigorkit/project.yaml`: proposed slices go to the deferred file and the roadmap keeps only selected and finished work.

## 0.4.0
Global rules: changed
New packs: none

- Commit convention in project rules: `type(<id>): summary` with the change ID, no scope without a change, `Refs:` footer only with a ticket or HU; `test(red|green|amend)` put the ID first.
- `sdd-archive` proposes one `[close]` commit per change with Outcome, Validation, Deferred and Follow-ups.
- New helper scripts (`rigorkit script <name>`): `git-compact` (short log/diff/status), `git-activity` (work per change ID across repositories) and `spec-status` (state of every SDD change); the global rules now name them.

## 0.3.0
Global rules: unchanged
New packs: none

- `rigorkit update`: moves `~/.rigorkit` to the newest release, shows this changelog and refreshes your global scope, asking before it rewrites startup blocks, global rules, edited copies, new packs or old scripts.
- Daily update check at shell start and in `rigorkit` runs (`update_mode`: prompt, reminder, disabled; `update_days`).
- Entry skills tell you once per session when a new version exists.
- `rigorkit install --global` records what it installed in `~/.local/state/rigorkit/global`.
- From 0.2.0: move the clone by hand once (README, "Update from 0.2.0").

## 0.2.0
Global rules: changed
New packs: none

- One-line installer into `~/.rigorkit`, the `rigorkit` command, its manual page and the custom area.
- Global rules call helper scripts with `rigorkit script <name>`.
- Release tags are published by CI on merge.

## 0.1.0
Global rules: changed
New packs: core, sdd, architecture, frontend, design, security

- First release: packs installed with `install.sh`.
