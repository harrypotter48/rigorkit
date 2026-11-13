# Changelog

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
