---
type: knowledge
status: current
tags: [tooling, calidad, enforcement]
source: "specs/archive/008-updater/"
updated: 2026-11-12
---
# Help text is the single source: generate the manual from it and let CI catch drift

> Keep one plain-text help file per command, print it for `help` and `--help`, generate the man page from those files, and fail the checks when a command or option has no help, help names something that no longer exists, or the committed man page is stale.

## Why
Help, manual and code drift apart silently: a new option ships undocumented, or the manual keeps describing a removed one. A drift check that compares the documented commands and options with the dispatch and option parser turns that into a red build that names the item.

## Example
`help/<command>.txt` files are printed by the CLI; a small generator writes `man/man1/<tool>.1` without dates so the output is deterministic; `generator --check` compares the dispatch arms and the option loop with the help files and the committed man page and runs in CI.
