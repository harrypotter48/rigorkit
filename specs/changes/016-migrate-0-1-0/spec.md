# Spec 016 — rigorkit scan (migrate 0.1.0 installs)
> Status: approved · Tier: story · DoD: critical (`bin/rigorkit`) · Owner repo: rigorkit · Affected repos: none
> Origin: HU-11 (slice of HU-3) — find the projects already installed, tell edited copies, and register them so one `rigorkit update` (HU-10) can update them.

## Context and goal
Every existing project install predates the registry (015): eleven projects of the owner are 0.1.0 installs with `<project>/.rigorkit-version` and a `.rigorkit` stamp in each skill folder. `rigorkit scan` walks configured folders, asks which tools each new project serves, decides per copy whether the owner edited it by matching the content of any commit whose `VERSION` was 0.1.0 (G9 option c), and writes 015 project records. Machine-level scan settings live in `~/.config/rigorkit/config`. The same change adds a docs check so principle 9 (docs travel with behaviour) is enforced by `tools/generate-man.mjs --check`. Prior answers: 008 answers 10, 15, 19 (`specs/archive/008-updater/full-draft.md:453,458,462`), draft RF-21/22/39 (`:82-84`); owner answers 2026-11-13 below.

## Users / actors
- The owner, once and when adding projects; later `rigorkit update` (HU-10) and doctor (HU-12) read the records.

## User stories
- H1: As the owner I want one command that finds my installed projects and registers them.
- H2: As the owner I want copies I edited marked, so updates never overwrite them silently.
- H3: As a maintainer I want the docs check to fail when a command, script or config key is undocumented.

## Acceptance
`rigorkit scan` with `scan_paths` registers every project below them that holds `.rigorkit-version` (not excluded, not already registered), with the tools the owner confirms, version, pairs and copy fingerprints (`-` for edited or unknown copies); `--dry-run` writes nothing; `generate-man --check` fails on undocumented commands, pack scripts and config keys; README, help and man document `scan`.

## Invariants
- INV-1: `rigorkit scan` writes only new project records (015 format and checks) and, with `--save`, the `scan_paths` line of the config; it never writes inside a project and never runs git in a scanned folder.
- INV-2: An existing project record is never changed by scan.
- INV-3: Printed paths and names go through `print_safe`; paths with control characters are reported, not recorded.

## Functional requirements (EARS)
### Find (H1)
- RF-1: WHEN called as `rigorkit scan [--dry-run] [--save] [--tools <list>] [dir…]`, THE SYSTEM SHALL scan the given folders, or else the comma-separated `scan_paths` of `~/.config/rigorkit/config` (`~` expanded); IF there is none, THEN it SHALL say how to set `scan_paths` and exit 2; a missing folder is reported and the run ends with exit 3.
- RF-2: THE SYSTEM SHALL treat as an installation every folder up to 4 levels below a root that holds `.rigorkit-version`, never entering `.git`, `node_modules` or a name listed in `scan_exclude`; a folder already registered is reported as such.
- RF-3: WHEN a new installation is found, THE SYSTEM SHALL show the tool folders it holds and ask which tools it serves (Enter = the suggested tools whose folders exist, `-` = skip); `--tools <list>` answers for every installation; without a terminal and without `--tools` it SHALL skip it and list it as skipped.
### Record (H2)
- RF-4: WHEN tools are confirmed, THE SYSTEM SHALL write the 015 project record with `path`, the `.rigorkit-version` version, one `pair` per pack (from its skills found) and tool, and one `copy` per stamped skill folder and per agent file of a known agent; a skill copy SHALL get its current fingerprint when it matches that skill at any commit of `~/.rigorkit` whose `VERSION` was 0.1.0, else `-`; agent copies SHALL get `-`; items no pack ships are reported, not recorded.
- RF-5: WHEN `--dry-run` is given, THE SYSTEM SHALL ask nothing and write nothing, and print what it would register.
- RF-6: WHEN `--save` is given with folders, THE SYSTEM SHALL add them to `scan_paths` (creating the config with owner-only permissions, keeping other keys).
### Docs (H3)
- RF-7: `node tools/generate-man.mjs --check` SHALL fail when a dispatched command is not in `README.md` as `rigorkit <command>`, a file in `packs/<pack>/scripts/` is not named in `packs/<pack>/README.md`, or a key read with `conf <key>` in `lib/*.sh` is not in `README.md`.
- RF-8: THE SYSTEM SHALL document `scan` in `help/scan.txt`, `help/rigorkit.txt`, the generated man page and `README.md` (with `scan_paths` and `scan_exclude`).

## Test scenarios
Tests in `tools/test/016-scan.test.mjs`: temporary HOME with a git clone whose history has two `VERSION 0.1.0` commits, projects with stamped copies, and the docs check on a repository copy.
### RF-1
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-1.H1 | happy | `scan_paths=~/work` in config | `scan --tools claude` | projects under `~/work` registered |
| RF-1.E1 | edge | folder argument | `scan --tools claude <dir>` | only that folder scanned |
| RF-1.F1 | failure | no argument, no `scan_paths` | `scan` | message names `scan_paths`, exit 2 |
| RF-1.F2 | failure | a missing folder and a valid one | `scan --tools claude a b` | valid one registered, missing named, exit 3 |
| RF-1.S1 | security | folder argument `--x` | `scan` | usage, exit 2 |
### RF-2
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-2.H1 | happy | projects at depth 1 and 4, one at depth 5 | `scan` | depth 1 and 4 registered, depth 5 not |
| RF-2.E1 | edge | a project inside `node_modules` and one inside a `scan_exclude` name | `scan` | neither registered |
| RF-2.E2 | edge | an already registered project | `scan` | reported as registered, record byte-equal (INV-2) |
| RF-2.F | n/a — unreadable folders are skipped by find; covered by RF-1.F2 | | | |
| RF-2.S | n/a — no git runs in scanned folders (INV-1), checked in RF-4.S1 | | | |
### RF-3
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-3.H1 | happy | terminal; project with `.claude` | `scan`, answer Enter | registered with claude |
| RF-3.E1 | edge | terminal; answer `-` | `scan` | skipped, no record |
| RF-3.F1 | failure | no terminal, no `--tools` | `scan` | skipped and listed, no record |
| RF-3.S | n/a — answers are validated against known tools (RF-3.H1/E1) | | | |
### RF-4
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-4.H1 | happy | a skill equal to one 0.1.0 commit, another equal to the other 0.1.0 commit | `scan --tools claude` | both with their current fingerprint; pairs sdd/claude; version 0.1.0 |
| RF-4.E1 | edge | an edited skill; an agent file; a stamped skill no pack ships | `scan --tools claude` | edited and agent get `-`; unknown reported, not recorded |
| RF-4.F | n/a — write failures follow 015 (warning, nothing written) | | | |
| RF-4.S1 | security | project whose `.git/config` sets `core.fsmonitor` to a marker command; a project path with an escape character | `scan --tools claude` | no marker; escape path reported, not recorded |
### RF-5
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-5.H1 | happy | new project | `scan --dry-run --tools claude` | prints `would register`, no projects folder |
| RF-5.E | n/a — single mode | | | |
| RF-5.F | n/a — dry run writes nothing by definition | | | |
| RF-5.S | n/a — covered by RF-4.S1 | | | |
### RF-6
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-6.H1 | happy | config with `update_mode=reminder` | `scan --save --tools claude <dir>` | config keeps `update_mode`, adds `<dir>` to `scan_paths`, mode 0600 |
| RF-6.E | n/a — single write | | | |
| RF-6.F | n/a — covered by INV-1 | | | |
| RF-6.S | n/a — no input beyond paths | | | |
### RF-7
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-7.H1 | happy | this repository | `generate-man --check` | exit 0 |
| RF-7.F1 | failure | copy without `rigorkit scan` in README; copy with an extra pack script; copy with a new `conf foo_bar` | `generate-man --check` | each fails naming the gap |
| RF-7.E | n/a — three failure kinds cover the boundaries | | | |
| RF-7.S | n/a — static check | | | |
### RF-8
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-8.H1 | happy | help, man, README | read | `scan` documented with `scan_paths`, `scan_exclude`, `--save`, `--tools` |
| RF-8.E | n/a — static | | | |
| RF-8.F | n/a — RF-7 fails on drift | | | |
| RF-8.S | n/a — static | | | |

## Out of scope
- Updating projects (HU-10); doctor (HU-12); scanning global folders (the global record exists since 0.3.0 installs).
- Agent copies compared against 0.1.0 (the converted output is tool-specific); they are marked `-`.

## Completion criteria
- All scenarios tested/green; `bin/rigorkit` regression (008/010 suites through `rigorkit install`, `script` safety); full suite green; manual `rigorkit scan --dry-run ~/workspace`.

## Questions and answers
1. Command `rigorkit scan` with settings `scan_paths`/`scan_exclude` in `~/.config/rigorkit/config`, not `project.yaml`. Owner, 2026-11-13.
2. Installation = `.rigorkit-version`, depth 4, `.git`/`node_modules` and `scan_exclude` skipped. Owner, 2026-11-13.
3. Tools asked per new project (answer 19); `--tools` for scripted runs; no terminal = skipped. Owner, 2026-11-13.
4. Edited detection G9 option c; unedited = current fingerprint, edited or unknown = `-`. Owner, 2026-11-13.
5. 0.1.0 installs registered as normal, no `dev`. Owner, 2026-11-13.
6. Global scope not scanned. Owner, 2026-11-13.
7. Docs check in `tools/generate-man.mjs --check` (principle 9). Owner, 2026-11-13.

## Amendments
- AMEND-1 (owner, 2026-11-13, autonomous run): adding `scan` changes the command list checked by `tools/test/008-rigorkit-cli.test.mjs` RF-25.H1 (`COMMANDS`) and `tools/test/010-repo-checks.test.mjs` RF-29.E1; both now expect `install, update, scan, script, help`.

## Open questions
None.
