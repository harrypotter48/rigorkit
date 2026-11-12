# Spec 008 — Updater: `rigorkit` CLI with update check, update and help
> Status: clarifying (round 2) · Tier: feature · DoD: critical (writes user folders, global rules and installed copies) · Owner repo: rigorkit · Affected repos: rigorkit; every project and global scope where rigorkit is installed (updated only on owner request)
> Origin: none — owner request of 2026-11-10: "an updater like oh-my-zsh's `omz update` that tells you when there is a new version, updates it and tells you whether the global rules changed or whether you want to install them".

## Context and goal
Today rigorkit is installed by running `install.sh` from a clone the user keeps anywhere, and "to update: `git pull` and install again" (vault decision "2026-10-06 Toolkit de agentes multi-herramienta", line 25). Nothing tells the user that a newer version exists. Installed copies already record their version (`.rigorkit-version` at the scope root, `version:` in each skill's `.rigorkit` marker) and `install.sh --list` compares local and installed versions (`install.sh:44-46`, `install.sh:107-112`), but nothing records **where** rigorkit is installed or with which options, so an update cannot be repeated without the user remembering every installation. This change adds a canonical clone, a `rigorkit` command with its own help, a daily non-blocking update check that warns in the terminal, in the command and in agent sessions, and an update that shows what changed and asks before writing global rules, new packs, edited copies or projects.

## Users / actors
- The owner and any colleague who uses rigorkit on their machine (the **user**).
- The coding agents that load rigorkit skills (Claude Code, Codex, Cursor, OpenCode): they only read the local update notice and never run the check or the update.
- The rigorkit maintainer, who publishes versions as tags.

## User stories
- H1: As a user, I want to install rigorkit with one line, so that a new machine has the command and the update check without manual steps.
- H2: As a user, I want rigorkit to check once a day and tell me when a new version exists, in the terminal and when I run `rigorkit`, so that I do not have to remember to check.
- H3: As a user, I want the agent to tell me when it uses a rigorkit skill and a new version exists, so that I notice it while I work.
- H4: As a user, I want `rigorkit update` to show what changed and ask before it changes my global rules, installs new packs, overwrites copies I edited or updates my projects, so that nothing of mine is rewritten without my consent.
- H5: As a user, I want my own packs and scripts in a custom area that updates never touch and that take precedence over the official ones, so that I can extend rigorkit safely.
- H6: As a user with installations from version 0.1.0, I want them discovered and registered on my first update, so that I do not reinstall everything by hand.
- H7: As a user, I want every command and option documented in `rigorkit help` and `man rigorkit`, so that I know which steps I can take.

## Acceptance
After the change, one line installs rigorkit into `~/.rigorkit` and enables the `rigorkit` command, its manual page and a daily background check. When a newer tagged version exists, the terminal, the `rigorkit` command and any agent using a rigorkit skill say so. `rigorkit update` updates the clone, shows the changes between versions and asks separately before rewriting global rules, installing new packs, overwriting edited copies and updating each registered project. Custom packs and scripts survive updates and shadow official ones with a warning. Existing 0.1.0 installations are found and registered. Every command is documented, and an automated check fails when one is not.

## Invariants
- INV-1: `rigorkit update` writes nothing outside the clone, its own state and the registry without an explicit confirmation by the user in that run; the one-line installer and `rigorkit install` write only what the command the user ran names; `--dry-run` writes nothing at all, including check state.
- INV-2: The update check and the agent notice never install, update or execute downloaded content; only `rigorkit update`, run by the user, changes installed files.
- INV-3: The custom area is never modified, moved or deleted by an update.
- INV-4: Content outside the rigorkit markers of a user instruction file is never changed, and a backup is kept before the marked block changes (constitution §7).
- INV-5: An interactive shell start never waits for the update check to finish.
- INV-6: Project updates never commit, push or stage; changes stay in the working tree for the user to review.

## Definitions
- **Clone version**: the version declared inside `~/.rigorkit`. The update check, the terminal notice and the agent notice compare it with the newest release tag.
- **Installed version of a location**: the version rigorkit recorded in a project or the global scope when it last installed there. Project updates (RF-15) and `rigorkit doctor` use it.
- **Release tag**: a git tag `vX.Y.Z` with numeric X, Y, Z, ordered by semantic versioning. Pre-release tags (`vX.Y.Z-<suffix>`) and tags that do not match are ignored.
- **Custom area**: `~/.rigorkit/custom/`, with `packs/` and `scripts/`, ignored by the clone's version control (answer 5).
- **User configuration**: `~/.config/rigorkit/config` (answer 12), next to the existing `~/.config/rigorkit/models`.
- **Installed copy**: a skill, an agent file or a rigorkit marked block that rigorkit wrote into a location.
- **Edited copy**: an installed copy whose content differs from what rigorkit wrote, ignoring line endings (LF/CRLF) and trailing whitespace on each line.

## Functional requirements (EARS)
### Installation (H1)
- RF-1: WHEN the user runs the one-line installer, THE SYSTEM SHALL clone rigorkit into `~/.rigorkit`, add between rigorkit markers, to the startup files of each installed shell (zsh: `.zshrc`; bash: `.bashrc`, and `.bash_profile` unless it already loads `.bashrc`), the line that enables the `rigorkit` command, its manual page and the update check, and SHALL NOT install any pack.
- RF-2: IF `~/.rigorkit` already exists or the startup file already contains the rigorkit line, THEN THE SYSTEM SHALL leave them unchanged, report it and exit without error.
- RF-3: THE SYSTEM SHALL provide through `rigorkit install` every option `install.sh` offers today (packs, agents, project or global scope, force, dry-run, rule removal, version, list) with the same effects, and `install.sh` SHALL stay a supported entry point with the same behavior as `rigorkit install` from any clone.
- RF-35: WHEN rigorkit installs from a clone other than `~/.rigorkit`, THE SYSTEM SHALL register the location as a development installation naming that clone.
- RF-36: WHEN `rigorkit update` finds development installations older than the new version, THE SYSTEM SHALL list them apart, warn that each came from a development clone, and update a development installation from `~/.rigorkit` only when the user confirms it.
- RF-33: WHEN the user runs `rigorkit install --pack <name>` for a pack in the custom area, THE SYSTEM SHALL install it with the same options and effects as an official pack.

### Update check (H2)
- RF-4: WHILE the update mode is `prompt` or `reminder` and the last check is at least the configured frequency old or is recorded in the future, THE SYSTEM SHALL check in the background at shell start and when `rigorkit` runs (except with `--dry-run`) whether the remote has a release tag newer than the clone version, and SHALL record the time and result of the check.
- RF-5: WHEN a newer version is known and the mode is `prompt`, THE SYSTEM SHALL ask in an interactive shell start and in the `rigorkit` command whether to update now, and SHALL run `rigorkit update` only on a yes.
- RF-37: WHEN the user answers no to the update question, THE SYSTEM SHALL not ask again until the next due check.
- RF-6: WHEN a newer version is known and the mode is `reminder`, THE SYSTEM SHALL show at every interactive shell start and every `rigorkit` run, until the update, one line naming the clone version and the new version, without asking.
- RF-7: WHILE the mode is `disabled`, THE SYSTEM SHALL perform no check and show no notice.
- RF-8: IF the remote cannot be reached or answers unexpectedly, THEN THE SYSTEM SHALL stay silent at shell start, keep the previous state and retry at the next due check.
- RF-9: THE SYSTEM SHALL read the mode and the frequency (whole days, at least 1) from the user configuration, with `prompt` and 1 day when they are absent, and SHALL report an invalid value naming the key and use its default.

### Agent notice (H3)
- RF-10: WHEN an agent uses one of the notice-carrying skills (`sdd-spec`, `sdd-slice`, `sdd-implement`, `sdd-resume`, `architecture-boundaries`, `design-ux-flow`, `frontend-structure`, `security-baselines`, `core-init`) and the recorded check result says a newer version exists, THE SYSTEM SHALL make the agent tell the user once per session the clone version, the new version and the command `rigorkit update`, without running any command or network request.

### Update (H4)
- RF-11: WHEN the user runs `rigorkit update`, THE SYSTEM SHALL update the clone to the newest release tag.
- RF-31: WHEN `rigorkit update` moves the clone to a newer version, THE SYSTEM SHALL show the changes of every version between the previous clone version and the new one, taken from that version's section of the repository changelog.
- RF-38: IF the declared version has no section in the repository changelog, or a section omits whether global rules changed and which packs are new, THEN THE SYSTEM SHALL fail the repository's automated checks naming the version.
- RF-12: WHEN the new version changes the global rules of an installed pack, THE SYSTEM SHALL show the difference for each affected instruction file and SHALL rewrite its marked block only after the user confirms that file.
- RF-13: WHEN the new version adds a pack that is not installed, THE SYSTEM SHALL offer to install it with the agents and scope already registered, and SHALL install it only on a yes.
- RF-32: WHEN `rigorkit update` moves the clone to a newer version, THE SYSTEM SHALL ask one confirmation for all unedited global-scope installed copies of the registered packs, naming how many would change, and SHALL update them only on a yes; edited copies follow RF-14.
- RF-14: IF an installed copy, including the text inside a rigorkit marked block, differs from what rigorkit installed, THEN THE SYSTEM SHALL show the difference between that copy and the new version and ask the user to overwrite it, keep it or (for skills and agents) move it to the custom area.
- RF-15: WHEN registered projects have an installed version older than the new one, THE SYSTEM SHALL list them and update only the projects the user selects, with the packs and agents registered for each.
- RF-16: IF the clone has local changes to tracked files, THEN THE SYSTEM SHALL refuse to update, list those files and tell the user to move them to the custom area.
- RF-17: WHERE `--dry-run` is given, THE SYSTEM SHALL show every change `rigorkit update` would make and write nothing.
- RF-18: IF the newest release tag does not match the version declared inside that release, THEN THE SYSTEM SHALL refuse to update and report both values.

### Custom area (H5)
- RF-19: WHEN a pack or script in the custom area has the same name as an official one, THE SYSTEM SHALL use the custom one and SHALL warn in `rigorkit update` and `rigorkit doctor` that it shadows the official one.

### Registry and migration (H6)
- RF-20: WHEN rigorkit installs into a project or the global scope, THE SYSTEM SHALL register the location, packs, agents and version, adding the new packs and agents to any earlier entry for the same location and setting its version.
- RF-34: WHEN rigorkit writes an installed copy, THE SYSTEM SHALL record a fingerprint of its content, so that a later update can tell whether the user edited it (answer 7).
- RF-21: WHEN `rigorkit update` runs without a registry or with `--scan`, THE SYSTEM SHALL search the global folders of each supported agent and the folders given with `--scan` for rigorkit markers and register what it finds.
- RF-39: WHEN the scan finds a location, THE SYSTEM SHALL show what it detected there (skill and agent folders per tool) and ask the user which tools that location serves, suggesting the tools whose agent folders exist, and SHALL register the location only with the confirmed tools.
- RF-22: WHEN an installation found without a content record is registered, THE SYSTEM SHALL compare each copy with the content of its recorded version to decide whether the user edited it.
- RF-23: IF a registered project folder no longer exists, THEN THE SYSTEM SHALL report it and offer to remove it from the registry, without failing the rest of the update.

### Diagnosis (H5, H6)
- RF-24: WHEN the user runs `rigorkit doctor`, THE SYSTEM SHALL report the clone version, the installed version of each registered location, the copies edited by the user, the custom items that shadow official ones and the registered locations that no longer exist, and SHALL write nothing except the permission repair of RF-41.
- RF-41: IF an official helper script is not executable, THEN THE SYSTEM SHALL, in `rigorkit update` and `rigorkit doctor`, make it executable and report it in one line; a custom-area script that is not executable SHALL only be reported.

### Help (H7)
- RF-25: WHEN the user runs `rigorkit help`, THE SYSTEM SHALL list every command with a one-line purpose and the usual order (install, update, doctor).
- RF-26: WHEN the user runs `rigorkit help <command>` or `rigorkit <command> --help`, THE SYSTEM SHALL show its options, examples and which files it can write.
- RF-27: THE SYSTEM SHALL provide `man rigorkit` with the same content as the help, generated from one source.
- RF-28: IF a command or option exists without help content, THEN THE SYSTEM SHALL fail the repository's automated checks naming it.

### Script location (H5)
- RF-29: THE SYSTEM SHALL install the helper scripts of a pack inside the rigorkit installation, and the global rules SHALL name that location.
- RF-30: WHEN `rigorkit update` finds at the previous location helper scripts that rigorkit installed, THE SYSTEM SHALL replace each one with a link to the same script in the new location.
- RF-40: WHILE every registered global instruction file names the new script location, THE SYSTEM SHALL offer in `rigorkit update` to remove the links at the previous location, and SHALL remove them only on a yes.

## Non-functional requirements
- Platform: macOS and Linux; zsh and bash. Git is required; no runtime beyond what `install.sh` needs today.
- Shell start: the check adds no network wait (INV-5).
- Context economy: the global rules of every pack stay at most 300 estimated tokens (constitution §8); any growth of pack content follows the content ratchet and needs a new owner-approved baseline.
- Language: CLI output, help and manual page in English.

## Test scenarios
### RF-1
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-1.H1 | happy | no `~/.rigorkit`, zsh and bash startup files without the line | run the one-line installer | clone exists, both files have one rigorkit line, a new shell finds `rigorkit` and `man rigorkit`, no pack installed |
| RF-1.E1 | edge | default shell zsh, bash installed, no `.bashrc` or `.bash_profile` | run the installer | block added to `.zshrc`; no bash file created |
| RF-1.E2 | edge | default shell bash on macOS, `.bash_profile` exists without loading `.bashrc` | run the installer | block in `.bashrc` and `.bash_profile` |
| RF-1.E3 | edge | `.bash_profile` already loads `.bashrc` | run the installer | block only in `.bashrc` |
| RF-1.E4 | edge | default shell zsh and `.zshrc` missing | run the installer | `.zshrc` created with the block |
| RF-1.F1 | failure | network down during the clone | run the installer | error message, no partial `~/.rigorkit`, startup files unchanged |
| RF-1.F2 | failure | git not installed | run the installer | error naming git, nothing written |
| RF-1.S1 | security | startup file has user content | run the installer | only the rigorkit marked block is added; the rest of the file is byte-equal and a backup exists |
### RF-2
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-2.H1 | happy | rigorkit already installed | run the installer again | "already installed", exit 0, nothing changed |
| RF-2.E1 | edge | clone exists but the startup line was removed | run the installer | line added once, clone untouched |
| RF-2.F1 | failure | `~/.rigorkit` exists and is not a rigorkit clone | run the installer | refuses, names the folder, changes nothing |
| RF-2.S | security | n/a — same write boundary as RF-1.S1 | | |
### RF-3
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-3.H1 | happy | a temporary project | `rigorkit install --pack sdd --agent claude --project <dir>` | same files as `install.sh` with the same options |
| RF-3.E1 | edge | `--dry-run --global` | run | prints the planned writes, writes nothing |
| RF-3.F1 | failure | unknown agent | run | same error and exit status as `install.sh` |
| RF-3.S1 | security | instruction file with user content | install `core --global` | only the marked block changes, backup kept |
### RF-4
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-4.H1 | happy | mode `prompt`, last check 25 h ago, remote has a newer tag | open a shell | check runs in the background, new version recorded, check time updated |
| RF-4.E1 | edge | last check 23 h ago | open a shell or run `rigorkit` | no check |
| RF-4.E4 | edge | last check exactly 1 day ago | open a shell | check runs |
| RF-4.E5 | edge | `rigorkit update --dry-run` with a due check | run | no check state written |
| RF-4.E7 | edge | last check recorded 2 days in the future | open a shell | check runs and records the current time |
| RF-4.E2 | edge | two shells start at once with a due check | open both | one recorded result, no corrupted state |
| RF-4.E3 | edge | installed version newer than the newest remote tag (maintainer clone ahead) | check | no new version reported |
| RF-4.E6 | edge | remote tags `v0.2.0`, `v0.10.0`, `v0.11.0-beta.1`, `0.12.0` | check from 0.2.0 | `v0.10.0` reported (numeric order; pre-release and unprefixed ignored) |
| RF-4.F1 | failure | remote has no release tags | check | no new version, no error at shell start |
| RF-4.S1 | security | remote tag name is not a version | check | ignored, nothing executed |
### RF-5
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-5.H1 | happy | newer version known, mode `prompt` | open an interactive shell, answer yes | `rigorkit update` runs |
| RF-5.E1 | edge | same, second terminal opened later the same day without answering in the first | open it | asked again |
| RF-5.E2 | edge | non-interactive shell (script, agent command) | start | no question, no output |
| RF-5.F1 | failure | update fails after yes | — | error shown, shell still opens |
| RF-5.S | security | n/a — the question only starts the user-run update, which keeps its own confirmations (RF-12–RF-15) | | |
### RF-37
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-37.H1 | happy | newer version known, mode `prompt` | answer no, open 3 more shells the same day | no question in those shells |
| RF-37.E1 | edge | next due check runs | open a shell | asked again |
| RF-37.F1 | failure | the "no" cannot be recorded | answer no | asked again at the next shell; no error shown |
| RF-37.S | security | n/a — only suppresses a question | | |
### RF-6
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-6.H1 | happy | newer version known, mode `reminder` | open a shell | one line "rigorkit 0.2.0 available (installed 0.1.0); run rigorkit update" |
| RF-6.E2 | edge | 5 shells opened the same day | open each | the line in each one until the update |
| RF-6.E1 | edge | non-interactive shell | start | no output |
| RF-6.F1 | failure | recorded notice is unreadable | open a shell | no line, no error |
| RF-6.S | security | n/a — read-only message | | |
### RF-7
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-7.H1 | happy | mode `disabled`, check due | open a shell, run `rigorkit` | no network access, no notice |
| RF-7.E1 | edge | mode changed to `disabled` while a notice is recorded | open a shell | no notice |
| RF-7.F1 | failure | n/a — no operation can fail when nothing runs | | |
| RF-7.S | security | n/a — disables behavior only | | |
### RF-8
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-8.H1 | happy | network down, check due | open a shell | no output, previous state kept |
| RF-8.E1 | edge | remote times out | check | silent; shell start not delayed |
| RF-8.F1 | failure | network down | run `rigorkit update` | clear error naming the remote, nothing changed |
| RF-8.S | security | n/a — failure path performs no writes | | |
### RF-9
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-9.H1 | happy | config sets `reminder`, 7 days | check | behaves as `reminder` every 7 days |
| RF-9.E1 | edge | no config file | check | `prompt`, 1 day |
| RF-9.F1 | failure | mode `sometimes` | run `rigorkit` | warns naming the key, uses `prompt` |
| RF-9.F2 | failure | frequency `0`, `-1` or `daily` | run `rigorkit` | warns naming the key, uses 1 day |
| RF-9.S | security | n/a — configuration is local to the user | | |
### RF-10
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-10.H1 | happy | notice records 0.2.0, installed 0.1.0 | agent uses an sdd skill | agent says once "rigorkit 0.2.0 available (installed 0.1.0); run `rigorkit update`" |
| RF-10.E1 | edge | second rigorkit skill in the same session | use it | no repeated notice |
| RF-10.E2 | edge | no notice, or mode `disabled` | use a skill | no mention |
| RF-10.E3 | edge | newer version known | agent uses only `sdd-plan` (not notice-carrying) | no mention |
| RF-10.F1 | failure | notice file unreadable | use a skill | no mention; skill continues normally |
| RF-10.S1 | security | notice content contains instructions | agent reads it | agent reports only versions; runs no command |
### RF-11
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-11.H1 | happy | installed 0.1.0, remote 0.2.0 | `rigorkit update` | clone at 0.2.0, changes 0.1.0→0.2.0 shown |
| RF-11.E1 | edge | already newest | `rigorkit update` | "already up to date", nothing changed |
| RF-11.E2 | edge | several versions skipped (0.1.0→0.4.0) | update | changes of every intermediate version shown |
| RF-11.F1 | failure | remote unreachable | update | error, clone unchanged |
| RF-11.S1 | security | remote history rewritten (tag not reachable as a fast-forward) | update | refuses, explains, clone unchanged |
### RF-12
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-12.H1 | happy | core rules changed, installed for Claude and Codex | update, confirm Claude only | Claude block rewritten with backup; Codex block unchanged and reported pending |
| RF-12.E1 | edge | rules unchanged | update | no question about rules |
| RF-12.E2 | edge | user edited text inside the rigorkit marked block and rules changed | update | treated as an edited copy (RF-14): diff shown, overwrite or keep |
| RF-12.F1 | failure | instruction file has a start marker without its end marker | update | that file is skipped and reported, others continue |
| RF-12.S1 | security | user text before and after the markers | confirm | text outside the markers byte-equal |
### RF-13
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-13.H1 | happy | 0.2.0 adds pack `backend` | update, answer yes | `backend` installed for the registered agents/scope and registered |
| RF-13.E1 | edge | answer no | update again later | offered again |
| RF-13.F1 | failure | installing the new pack fails | — | error reported, rest of the update kept, registry unchanged for that pack |
| RF-13.S | security | n/a — installs only after the confirmation of RF-13 itself, within the registered scope | | |
### RF-14
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-14.H1 | happy | user edited an installed `sdd-spec` | update | diff shown; choice overwrite/keep/move to custom |
| RF-14.E1 | edge | user chooses "move to custom" | update | edited copy in the custom area, new version installed, custom shadows it with a warning |
| RF-14.E2 | edge | copy unedited | update | not asked individually; covered by the location's confirmation (RF-32 global, RF-15 project) |
| RF-14.F1 | failure | user deleted an installed copy | update | reported as missing; offered to reinstall |
| RF-14.S1 | security | user chooses "keep" | update | copy byte-equal; reported as outdated by `rigorkit doctor` |
### RF-15
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-15.H1 | happy | 3 registered projects at 0.1.0 | update, select 2 | only those 2 updated, changes left uncommitted |
| RF-15.E1 | edge | select none | update | no project changed |
| RF-15.F1 | failure | one selected project fails | update | error for that project, the others continue, its registry version unchanged |
| RF-15.S1 | security | selected project has uncommitted changes in rigorkit-installed files | update | treated as edited copies (RF-14); nothing staged or committed |
### RF-16
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-16.H1 | happy | user edited a tracked file in `~/.rigorkit` | update | refuses, lists the file, suggests the custom area |
| RF-16.E1 | edge | only custom area has changes | update | proceeds |
| RF-16.F1 | failure | n/a — the refusal is itself the failure response | | |
| RF-16.S1 | security | refusal | — | no file in the clone changed |
### RF-17
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-17.H1 | happy | newer version, edited copy, rules change | `rigorkit update --dry-run` | every planned change listed; no file, registry or clone changed |
| RF-17.E1 | edge | already up to date | `--dry-run` | "nothing to do" |
| RF-17.F1 | failure | remote unreachable | `--dry-run` | error, nothing changed |
| RF-17.S | security | n/a — writes nothing | | |
### RF-18
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-18.H1 | happy | tag `v0.2.0`, declared version 0.2.0 | update | proceeds |
| RF-18.E1 | edge | declared version has a trailing newline or CRLF | update | proceeds (`v0.2.0` matches `0.2.0`) |
| RF-18.F1 | failure | tag `v0.2.0`, declared 0.1.9 | update | refuses naming both values, clone unchanged |
| RF-18.S | security | n/a — covered by RF-11.S1 and RF-4.S1 | | |
### RF-19
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-19.H1 | happy | custom `test-summary` and official `test-summary` | run the rules' `test-summary` | custom one runs; update and doctor warn |
| RF-19.E1 | edge | custom pack with a new name | install it | installed like an official pack, no warning |
| RF-19.F1 | failure | custom pack lacks a required file | install | error naming the pack and file |
| RF-19.S1 | security | update | — | custom area byte-equal (INV-3) |
### RF-20
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-20.H1 | happy | install sdd for claude in project A | install | registry has A, sdd, claude, version |
| RF-20.E1 | edge | install again in A with another pack | install | one entry for A with both packs |
| RF-20.E2 | edge | `--dry-run` | install | registry unchanged |
| RF-20.F1 | failure | registry file corrupted | install | install proceeds, registry error reported, file kept for inspection |
| RF-20.S1 | security | registry | — | holds paths, packs, agents, versions and content fingerprints only; no file contents or secrets |
### RF-35
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-35.H1 | happy | `install.sh` run from `~/workspace/personal/rigorkit` into project A | install | A registered as development, naming that clone |
| RF-35.E1 | edge | A later installed with `rigorkit install` from `~/.rigorkit` | install | A no longer development |
| RF-35.F1 | failure | development clone deleted later | `rigorkit doctor` | reports the missing clone, writes nothing |
| RF-35.S | security | n/a — same write boundary as RF-3 | | |
### RF-36
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-36.H1 | happy | development install of A at 0.1.0, clone updated to 0.2.0 | update, answer yes for A | A updated from `~/.rigorkit` and no longer development |
| RF-36.E1 | edge | answer no | update | A unchanged, listed again next update |
| RF-36.E2 | edge | development install newer than the new version (unreleased work) | update | listed as newer; not offered for update |
| RF-36.F1 | failure | updating A fails | update | error for A, rest continues, registry unchanged for A |
| RF-36.S1 | security | A has edited copies | answer yes | RF-14 applies to each edited copy |
### RF-31
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-31.H1 | happy | clone 0.1.0 → 0.2.0 | update | changes of 0.2.0 shown |
| RF-31.E1 | edge | 0.1.0 → 0.4.0 | update | changes of 0.2.0, 0.3.0 and 0.4.0 shown, in order |
| RF-31.F1 | failure | a version has no change text | update | says so for that version, update continues |
| RF-31.S | security | n/a — read-only output | | |
### RF-38
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-38.H1 | happy | `VERSION` 0.2.0 with a complete 0.2.0 section | run the checks | pass |
| RF-38.E1 | edge | section says "global rules: unchanged; new packs: none" | run the checks | pass |
| RF-38.F1 | failure | `VERSION` bumped to 0.3.0 without a section | run the checks | fail naming 0.3.0 |
| RF-38.F2 | failure | section omits the global-rules line | run the checks | fail naming the version and the missing line |
| RF-38.S | security | n/a — repository check | | |
### RF-32
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-32.H1 | happy | sdd installed globally for claude, 0.2.0 changes `sdd-spec` | update, answer yes | one question naming 1 copy; `sdd-spec` updated |
| RF-32.E2 | edge | same | answer no | no global copy written; reported as outdated by `rigorkit doctor` |
| RF-32.E1 | edge | new version does not change any installed copy | update | no global copy written |
| RF-32.F1 | failure | a global folder is not writable | update | error for that copy, the rest continues, its fingerprint unchanged |
| RF-32.S1 | security | user edited a global copy | update | RF-14 applies; never overwritten silently |
### RF-33
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-33.H1 | happy | `custom/packs/mine` with one skill | `rigorkit install --pack mine --agent claude --global` | skill installed and registered |
| RF-33.E1 | edge | custom pack with the name of an official one | install | custom one installed, shadow warning |
| RF-33.F1 | failure | custom pack lacks a required file | install | error naming the pack and file |
| RF-33.S1 | security | update after installing a custom pack | update | custom area byte-equal (INV-3) |
### RF-34
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-34.H1 | happy | install a skill | install | fingerprint recorded |
| RF-34.E1 | edge | `--dry-run` | install | nothing recorded |
| RF-34.F1 | failure | registry not writable | install | install proceeds, warning that edits cannot be detected for those copies |
| RF-34.S | security | n/a — covered by RF-20.S1 | | |
### RF-21
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-21.H1 | happy | 0.1.0 global install, no registry | `rigorkit update` | global installs registered |
| RF-21.E1 | edge | `--scan ~/workspace` with 5 projects | update | 5 projects registered |
| RF-21.E2 | edge | skill copies without rigorkit markers (third-party) | scan | not registered |
| RF-21.F1 | failure | unreadable folder under the scan path | scan | skipped and reported, scan continues |
| RF-21.S1 | security | scan | — | reads only; follows no symlink outside the scan path |
### RF-39
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-39.H1 | happy | project with sdd skills in `.claude/skills` and `.agents/skills`, agents in `.claude/agents` and `.opencode/agents` | scan | shows them, suggests claude,opencode; user confirms; registered with claude,opencode |
| RF-39.E1 | edge | only `.agents/skills`, no agent folders | scan | no suggestion; user must name the tools |
| RF-39.E2 | edge | user answers with an empty list | scan | location not registered, reported |
| RF-39.F1 | failure | user names an unknown tool | answer | rejected naming the supported tools, asked again |
| RF-39.S1 | security | scan question | — | nothing written to the location; only the registry after confirmation |
### RF-22
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-22.H1 | happy | 0.1.0 copy equal to the 0.1.0 content | register | not edited |
| RF-22.E1 | edge | copy differs only in line endings or trailing whitespace | register | not edited |
| RF-22.E2 | edge | copy differs in one word | register | edited |
| RF-22.F1 | failure | recorded version has no tag in the clone | register | copy treated as edited and reported |
| RF-22.S | security | n/a — read-only comparison | | |
### RF-23
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-23.H1 | happy | registered project deleted | update | reported; removed from registry on yes |
| RF-23.E1 | edge | answer no | update | entry kept, reported again next time |
| RF-23.F1 | failure | registry not writable when removing the entry | answer yes | error reported, entry kept, update continues |
| RF-23.S | security | n/a — registry entry only | | |
### RF-24
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-24.H1 | happy | clone 0.2.0, one project 0.1.0, one edited copy, one shadow | `rigorkit doctor` | all four facts reported |
| RF-24.E1 | edge | everything current | doctor | "no issues" |
| RF-24.F1 | failure | no registry | doctor | says so and suggests `rigorkit update --scan` |
| RF-24.F2 | failure | registry corrupted | doctor | reports it, writes nothing |
| RF-24.S1 | security | doctor with all scripts executable | — | no file changed |
### RF-41
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-41.H1 | happy | official `test-summary` without execute permission | `rigorkit doctor` | made executable; "fixed: test-summary not executable" |
| RF-41.E1 | edge | custom `my-script` without execute permission | `rigorkit doctor` | reported only; permission unchanged |
| RF-41.E2 | edge | `--dry-run` on update | run | reported as would-fix; nothing changed |
| RF-41.F1 | failure | permission cannot be changed | doctor | reported as not fixed; doctor continues |
| RF-41.S1 | security | repair | — | only the execute permission of official scripts changes; content byte-equal |
### RF-25
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-25.H1 | happy | — | `rigorkit help` | every command with one line, usual order shown |
| RF-25.E1 | edge | `rigorkit` with no arguments | run | same as `rigorkit help` |
| RF-25.F1 | failure | unknown command | run | error plus the command list, exit non-zero |
| RF-25.S | security | n/a — read-only output | | |
### RF-26
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-26.H1 | happy | — | `rigorkit help update` | options, examples, files it can write |
| RF-26.E1 | edge | `rigorkit update --help` | run | same content, nothing updated |
| RF-26.F1 | failure | `rigorkit help nope` | run | error plus the command list |
| RF-26.S | security | n/a — read-only output | | |
### RF-27
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-27.H1 | happy | new shell after install | `man rigorkit` | page with every command and option |
| RF-27.E1 | edge | after an update that adds a command | `man rigorkit` | new command present |
| RF-27.F1 | failure | system without `man` | `rigorkit help` | still works |
| RF-27.S | security | n/a — documentation | | |
### RF-28
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-28.H1 | happy | every command documented | run the checks | pass |
| RF-28.E1 | edge | option documented but removed from the command | run the checks | fail naming the stale option |
| RF-28.F1 | failure | new command without help | run the checks | fail naming the command |
| RF-28.S | security | n/a — repository check | | |
### RF-29
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-29.H1 | happy | install `core --global` | install | scripts inside the rigorkit installation; global rules name that location |
| RF-29.E1 | edge | custom script with an official name | call it | custom one used (RF-19) |
| RF-29.F1 | failure | script not executable after update | `rigorkit update` | repaired and reported (RF-41) |
| RF-29.S1 | security | user script in the custom area | update | custom script byte-equal (INV-3) |
### RF-30
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-30.H1 | happy | `test-summary` at the previous location | update | replaced by a link to the new location; calling the old path runs the new script |
| RF-30.E1 | edge | no scripts at the previous location | update | nothing reported |
| RF-30.E2 | edge | user declines the rules rewrite (RF-12) that names the new location | update | old path still works through the link; no removal offered |
| RF-30.E3 | edge | the old path is already a link | update | unchanged |
| RF-30.F1 | failure | previous location has a user file that rigorkit did not install | update | file untouched and reported |
| RF-30.S | security | n/a — covered by RF-30.F1 and INV-1 | | |
### RF-40
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-40.H1 | happy | all global rules name the new location, links exist | update, answer yes | links removed |
| RF-40.E1 | edge | one global instruction file still names the old location | update | no removal offered |
| RF-40.E2 | edge | answer no | update | links kept, offered again next update |
| RF-40.F1 | failure | a link cannot be removed | answer yes | reported, others removed, update continues |
| RF-40.S1 | security | a user file sits next to the links | answer yes | user file untouched |

## Out of scope
- Automatic update without asking (`auto` mode) — rejected (answer 12).
- Distribution through npm/`npx` or other package managers.
- Windows (WSL, Git Bash, PowerShell) and shells other than zsh and bash; deferred to a later change (answer 23).
- Uninstalling rigorkit itself.
- Updating project templates and scripts created by `sdd-init` inside a repo (the separate "update mode" idea); this change updates only rigorkit-installed copies.
- Committing, pushing or merging in projects (INV-6).
- Hooks specific to one tool (for example Claude Code `SessionStart`).
- Signed releases.

## Completion criteria
- Every scenario tested or recorded as manual with live evidence; checker reports none missing.
- Critical DoD: `--dry-run` in project and global modes plus a real installation and update in a temporary HOME; regression: install, then update from 0.1.0 to a test tag.
- Live demo: one-line install in a temporary HOME, `prompt` question at shell start, agent notice in at least Claude Code, `rigorkit update` with a rules diff, `man rigorkit`.
- Content ratchet passes with an owner-approved baseline; global rules at most 300 tokens.

## Questions and answers
1. Where does the notice appear? → In the terminal at shell start and when running `rigorkit`; agents also warn when they use rigorkit.
2. How often is the check? → Daily (changed from weekly).
3. Where do versions come from? → Git tags.
4. Same `install.sh` or separate CLI? → Separate `rigorkit` CLI.
5. Where does the clone live? → `~/.rigorkit` (option B); the scripts move there, with a custom area like oh-my-zsh's.
6. Custom item with an official name? → Custom wins; update and doctor warn (A).
7. Installed copy edited by the user? → Detect, show diff, ask overwrite/keep/move to custom (A).
8. How are projects known? → A registry written by each install; update lists outdated projects for the user to choose; changes stay uncommitted (A).
9. How is rigorkit installed? → One line, like oh-my-zsh; clones and adds the startup line, installs no pack (A).
10. Existing 0.1.0 installations? → Discovered on the first update from the global folders and `--scan` paths; edits detected against the 0.1.0 tag, which the owner creates (A).
11. Help? → `rigorkit help`, `help <command>`, `--help` and `man rigorkit` from one source, with a check that fails on undocumented commands (A).
12. What does the check do? → Modes `prompt` (default), `reminder`, `disabled`; configurable frequency, default 1 day; agents warn only in `prompt`/`reminder` (A).
13. Q-J: unedited global copies on update? → One confirmation for the whole global scope naming the count; edited copies still ask one by one (A).
14. Q-G: `install.sh` after the CLI? → Stays as an entry point with the same behavior from any clone; installs from another clone register as development; update lists them apart and asks whether to update each one anyway (A, plus "ask me even if it is development").
15. Q-H: tag format? → `vX.Y.Z`; pre-releases and non-version tags ignored (A). Answer 10's "0.1.0 tag" is `v0.1.0`.
16. Q-I: how often the notice? → Every interactive shell until the update; a "no" to the question silences it until the next due check; frequency in whole days, at least 1; a last check in the future counts as due (A).
17. Q-F: source of "what changed"? → A repository changelog with one section per version stating global-rule changes and new packs; written by hand; an automated check fails when `VERSION` has no complete section (A).
18. Q-E: which skills carry the agent notice? → Only entry skills: `sdd-spec`, `sdd-slice`, `sdd-implement`, `sdd-resume` and one per other pack (`architecture-boundaries`, `design-ux-flow`, `frontend-structure`, `security-baselines`, and `core-init` added after 007 merged); about 225 estimated tokens, needing an owner-approved ratchet baseline (A).
19. Q-K: migrating 0.1.0 installs whose tools are ambiguous? → Show what was detected per location and ask which tools it serves, suggesting those whose agent folders exist (A).
20. Q-A: scripts at the previous location? → Replaced by links to the new location; removal of the links offered once every global rule names the new location; files rigorkit did not install never touched (A).
21. Q-B: which startup files? → Those of each installed shell: `.zshrc`; `.bashrc` plus `.bash_profile` unless it already loads `.bashrc`; a missing file is created only for the default shell (A).
22. Q-C: line endings/trailing whitespace only? → Not an edit (A).
23. Windows? → Out of scope; a later change (WSL documentation first, then Git Bash or a Node CLI if needed). Keep the CLI free of avoidable macOS-only constructs.
24. Q-D: helper script not executable? → `rigorkit update` and `rigorkit doctor` repair official scripts and report it; custom scripts only reported (A).

## Open questions
None.

## Delivery evidence
Pending.
