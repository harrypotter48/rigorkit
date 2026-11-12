# Spec 010 — Update check and `rigorkit update` (HU-2)
> Status: ready (clarify round 7, 2026-11-12), approval delegated (answer 4) · Tier: feature · DoD: critical (moves the clone to downloaded code; rewrites shell startup blocks, global rules and global installed copies) · Owner repo: rigorkit · Affected repos: rigorkit; the user's global scope (written only after confirmation)
> Origin: HU-2 — owner request of 2026-11-10 for an updater like oh-my-zsh's `omz update` (`specs/archive/008-updater/full-draft.md`, sliced 2026-11-11). Reuses draft answers 1–24 and the round 1–2 findings; owner kept HU-2 as one spec (answer 1). Draft ids are given as (dRF-n). Threat model: `threat-model.md` (SR-1–SR-6 below).

## Context and goal
HU-1 installs rigorkit into `~/.rigorkit`, with a `rigorkit` command, help, a manual page and a custom area (capability `installer`). HU-4 publishes `v<VERSION>` on every release. Nothing tells the user that a newer release exists, and updating means a manual `git` checkout plus reinstalling the global scope by hand with `--force`, which overwrites copies the user edited without showing them. This change adds a daily check at shell start and in the `rigorkit` command, terminal and agent notices, and `rigorkit update`: it moves the clone to the newest release, shows the changelog of every skipped version, and refreshes the global scope asking before it rewrites global rules, edited copies, new packs, startup blocks or old helper scripts. Projects, the registry of projects, development installs, 0.1.0 migration and `rigorkit doctor` are HU-3.

## Users / actors
- The **user**: the owner or a colleague with rigorkit installed in `~/.rigorkit`.
- The coding agents that load rigorkit skills (Claude Code, Codex, Cursor, OpenCode): they read the recorded notice; their non-interactive `rigorkit` runs start no check and show no notice.
- The maintainer, who writes the changelog section of each version.

## User stories
- H1: As a user, I want rigorkit to check once a day, when I open a terminal or run `rigorkit`, and tell me when a new version exists, so that I do not have to remember to check.
- H2: As a user, I want the agent to tell me once per session that a new version exists when it uses a rigorkit entry skill, so that I notice it while I work.
- H3: As a user, I want `rigorkit update` to move rigorkit to the newest release and show me what changed in every version I skipped, so that I know what I am getting.
- H4: As a user, I want the update to refresh my global scope, asking before it changes my global rules, overwrites copies I edited, installs new packs, rewrites startup blocks or removes old helper scripts, so that nothing of mine is rewritten without my consent.

## Acceptance
In a temporary HOME, with rigorkit installed by the one-line installer from a local test remote at a release that contains this change, and the global scope installed with `rigorkit install --global`, then a newer test release tagged on that remote: opening an interactive shell after a day checks the remote without delaying the prompt; in `prompt` mode the next interactive shell asks whether to update and a "no" silences it until the next due check; in `reminder` mode every interactive shell and interactive `rigorkit` run shows one line; an agent using an entry skill mentions the new version once. `rigorkit update` moves the clone to the newest release, prints the changelog of every version in between, and then asks separately: one question for all unedited global copies, one per changed instructions file (with the diff), one per edited copy (overwrite or keep, with the diff), one per new pack, one per outdated startup file and one for old helper scripts. Declined items stay byte-equal and are offered again on the next update; `--dry-run` shows the same plan and changes no file outside `~/.rigorkit/.git`. A plausible wrong implementation that overwrites an edited copy after the group "yes", moves the clone with local edits, or asks at an editor's `zsh -i -c` probe, fails the acceptance.

## Invariants
- INV-1: `rigorkit update` writes, without a confirmation given in that run, only the clone (`~/.rigorkit` except `custom/`), its git data and rigorkit's own state and record; every other write (global rules, global installed copies, new packs, startup blocks, old helper scripts) needs a yes for that item or group. `--dry-run` writes nothing outside `~/.rigorkit/.git` except temporary files it removes before it ends (answer 3).
- INV-2: The check and the notices never install, update, move the clone or execute downloaded content; only `rigorkit update`, started by the user (directly or by answering yes to the shell question), changes installed files (draft INV-2).
- INV-3: The custom area is never modified, moved or deleted (draft INV-3).
- INV-4: Content outside the rigorkit markers of a user file is never changed, and a `<file>.rigorkit.bak` backup with the original mode is kept before a marked block changes (constitution §7, capability `installer` RF-1).
- INV-5: An interactive shell start never waits for the network (draft INV-5).
- INV-6: A failure in one item of the global refresh never leaves that item half-written and never stops the other items.

## Definitions
- **Clone**: `~/.rigorkit`. **Clone version**: its `VERSION`. A `rigorkit` run from any other clone (development clone) starts no check and shows no notice.
- **Release tag**, **newest release tag**: as in capability `installer` (`vX.Y.Z`, numeric order; pre-releases and other names ignored); for the check and the update a part with a leading zero (`v01.0.0`) is not a version, as in `tools/release-tag.mjs`. A **newer version** is a newest release tag greater than the clone version.
- **Due check**: no recorded check, a recorded check at least the configured frequency old, or a recorded check in the future.
- **User configuration**: `~/.config/rigorkit/config`, `key = value` lines, `#` comments (same syntax as `~/.config/rigorkit/models`). Keys: `update_mode` (`prompt`, `reminder`, `disabled`; default `prompt`) and `update_days` (whole days, at least 1; default 1).
- **Interactive shell start**: a zsh or bash start that is interactive, runs no command string (`-c`) and has a terminal as standard input and standard output (SR-4). **Interactive run**: a `rigorkit` run whose standard input and standard error are terminals.
- **Notice line**: `rigorkit <new> is available (you have <clone>); run: rigorkit update`.
- **Global record**: what `rigorkit install --global` recorded (RF-18): the installed pack/agent pairs, the recorded global version, and per installed copy and rules block its path and fingerprint; a copy the user kept (RF-22) also records the fingerprint of the clone content the user declined (**declined content**).
- **Valid pack name**: the name of an official pack of the clone, or of a custom pack accepted by capability `installer` RF-4; never a name with `/`, `..` or a leading `-`.
- **Installed copy**: a skill folder or an agent file written by `rigorkit install --global`. **Rules block**: a rigorkit marked block in a global instructions file. Rules blocks are handled only by RF-21.
- **Edited copy**: an installed copy whose content differs from its recorded fingerprint, ignoring LF/CRLF and trailing whitespace on each line (draft answer 22); a copy with no fingerprint, or that is a symbolic link, counts as edited. The skill marker file `.rigorkit` is not part of a skill's content.
- **Entry skills**: `sdd-spec`, `sdd-slice`, `sdd-implement`, `sdd-resume`, `architecture-boundaries`, `design-ux-flow`, `frontend-structure`, `security-baselines`, `core-init` (draft answer 18).
- **Old script location**: `~/.local/share/rigorkit/scripts`, where 0.1.0 copied helper scripts. An **old rigorkit script** is a regular file there (not a symbolic link) whose content equals a helper script rigorkit published in some earlier commit.
- **Changelog**: `CHANGELOG.md` at the repository root, one `## X.Y.Z` section per version with a `Global rules:` line (`changed` or `unchanged`) and a `New packs:` line (`none` or the names) (draft answer 17).
- **Printed safely**: every control character other than newline and tab is replaced by `?`, never sent raw to the terminal (SR-2). Changelog text, diffs, pack names and values read from a downloaded tag are always printed safely.

## Functional requirements (EARS)
### Update check (H1)
- RF-1: WHILE `update_mode` is `prompt` or `reminder`, WHEN an interactive shell start happens, or an interactive run of the clone's `rigorkit` with a command other than `update` (a bare `rigorkit` counts as `help`) and without `--dry-run`, and the check is due, THE SYSTEM SHALL start, without waiting for it, one check of whether the clone's remote has a newer version, and SHALL record the time and result (dRF-4; answer 2).
- RF-2: WHEN a newer version is recorded, `update_mode` is `prompt` and an interactive shell start happens, THE SYSTEM SHALL ask whether to update now and SHALL run `rigorkit update` only on `y` or `yes` (any case); an empty answer, end of input or any other answer is a no (dRF-5; delegated G14, G15).
- RF-3: WHEN the user answers no to the update question, THE SYSTEM SHALL not ask again until the next due check finds a newer version (dRF-37).
- RF-4: WHEN a newer version is recorded, `update_mode` is `reminder` and an interactive shell start happens, THE SYSTEM SHALL show the notice line (dRF-6).
- RF-31: WHEN a newer version is recorded, `update_mode` is `prompt` or `reminder`, and an interactive run of the clone's `rigorkit` has a command other than `update`, `help`, `--help` or `-h`, THE SYSTEM SHALL show the notice line on standard error before the command's own output (delegated G14).
- RF-5: WHILE `update_mode` is `disabled`, THE SYSTEM SHALL perform no check and show no notice, in the terminal or to agents (dRF-7).
- RF-6: IF the remote cannot be reached, times out, asks for credentials or answers unexpectedly during a check, THEN THE SYSTEM SHALL stay silent, never prompt or read the terminal, keep the previous result and retry at the next due check (dRF-8; SR-3).
- RF-7: THE SYSTEM SHALL read `update_mode` and `update_days` from the user configuration, use the defaults when they are absent, and for an invalid value show at interactive runs one warning naming the key and use its default (dRF-9).
- RF-8: WHEN the clone version is equal to or greater than the recorded newer version, or the clone version is not a valid version, THE SYSTEM SHALL show no notice and ask no question.

### Agent notice (H2)
- RF-9: WHEN an agent uses an entry skill, directly or loaded by another skill, while a newer version is recorded and `update_mode` is not `disabled`, THE SYSTEM SHALL make the agent tell the user once per session the notice line, without running any command or network request (dRF-10; delegated G13).

### Update (H3)
- RF-10: WHEN the user runs `rigorkit update` and a newer version exists, THE SYSTEM SHALL move the clone to the newest release tag, only when that tag's commit descends from the clone's current commit, and SHALL record the check result (dRF-11).
- RF-11: WHEN the clone moved to a newer version, THE SYSTEM SHALL print safely the changelog section of every version greater than the previous clone version and not greater than the new one, in ascending order, taken from the new clone's changelog; a missing section is reported for that version and the update continues (dRF-31).
- RF-12: IF `VERSION` has no changelog section, or its section lacks the `Global rules:` or the `New packs:` line, THEN THE SYSTEM SHALL fail the repository's automated checks naming the version and the missing part (dRF-38).
- RF-13: IF the clone has changes to tracked files other than the execute bit of official helper scripts, or untracked files that are not git-ignored, THEN `rigorkit update` (also with `--dry-run`) SHALL refuse before moving the clone, list those files, suggest the custom area and change nothing (dRF-16; K2, K17).
- RF-14: WHERE `--dry-run` is given, THE SYSTEM SHALL fetch the newest release, show the changelog and every question the update would ask with its diffs, ask nothing and write nothing outside `~/.rigorkit/.git` (dRF-17; answer 3).
- RF-15: IF the newest release tag's version differs from the `VERSION` inside that tag, THEN THE SYSTEM SHALL refuse to move the clone and report both values, showing a value that is not a valid version as "invalid" instead of its content (dRF-18).
- RF-16: WHEN the clone version is equal to or greater than the newest release tag, THE SYSTEM SHALL say the clone is up to date (or newer than the newest release), not move it, and continue with the global refresh (RF-19). A refusal by RF-10, RF-13, RF-15 or RF-32, a failure to reach or read the remote, or a failed clone move (RF-37), ends the update with a non-zero status, without startup-block rewrite or global refresh (L5).
- RF-17: WHEN `rigorkit update` ends without a refusal (RF-16), with or without a global record, THE SYSTEM SHALL, for each startup file of capability `installer` RF-1 that holds a rigorkit startup block different from the current one, print safely its difference and rewrite that block only after a yes for that file, with a backup (INV-4) (L4).
- RF-30: WHILE `rigorkit update` is not an interactive run, THE SYSTEM SHALL answer every question no, list every item it skipped and still move the clone (delegated G14).
- RF-32: IF another `rigorkit update` is running, THEN THE SYSTEM SHALL refuse saying so and change nothing (K9).
- RF-33: WHEN the one-line installer writes a startup block, THE SYSTEM SHALL write the current block, which starts the check and the notices (K11).

### Global refresh (H4)
- RF-18: WHEN `rigorkit install --global` writes, skips or finds identical an installed copy or rules block, THE SYSTEM SHALL record the pack/agent pair, the version and the fingerprint as it is on disk after the install (a skipped differing copy without a fingerprint, keeping the fingerprint and declined content it already had, M6); writing a copy clears its declined content (N1); the recorded global version is set only when the scope had no record (a later install keeps it, L7); `--dry-run` records nothing; a project install never changes the record (dRF-20, dRF-34 for the global scope).
- RF-35: IF `rigorkit install --global` without `--dry-run` or `--uninstall-rules` finds the global record unreadable, THEN THE SYSTEM SHALL rename it to `<record>.corrupt` (replacing an older one), start a new record with this install and say so (L1).
- RF-36: WHEN `--uninstall-rules` removes a rules block, THE SYSTEM SHALL remove that block from the global record.
- RF-19: WHEN `rigorkit update` ends without a refusal and the global record exists and is readable, THE SYSTEM SHALL run the global refresh for the recorded pack/agent pairs (RF-20–RF-23, RF-27, RF-28) and set the recorded global version to the clone version only when no question of the refresh was answered no or left unanswered (RF-30) and no item failed; a keep answer (RF-22) is not a no.
- RF-20: THE SYSTEM SHALL ask one confirmation for all unedited installed copies whose content differs from the clone's, plus missing recorded copies and copies that a recorded pack/agent pair now ships whose path holds nothing, naming how many; a new copy whose path already holds a file, folder or link is handled as an edited copy without fingerprint (RF-22, M2); and write and record them only on a yes (dRF-32).
- RF-21: WHEN a recorded rules block on disk differs from the block the clone would write, or is missing from its recorded file, THE SYSTEM SHALL show safely the difference for that file and rewrite or add the block only after a yes for that file (dRF-12).
- RF-22: IF an installed copy is edited, the clone's content differs from the copy, and the clone's content differs from its reference (the declined content when the user kept the copy before, otherwise the recorded fingerprint; a copy without either is always asked), THEN THE SYSTEM SHALL print safely the difference between the copy and the clone's content and ask overwrite or keep; keep leaves the copy byte-equal and records the clone's content as declined content; an unanswered question in a non-interactive run (RF-30) records nothing and is asked again (dRF-14; delegated G4; M3; N3).
- RF-23: WHEN a pack named in the `New packs:` line of a version greater than the recorded global version and not greater than the clone version is not in the global record and has a valid pack name, THE SYSTEM SHALL offer to install it into the global scope for the recorded agents, one question per pack, and install and record it only on a yes; any other listed name that is not recorded is reported, printed safely, and not offered (dRF-13; delegated G23; L3).
- RF-24: IF the global scope has a `~/.rigorkit-version` but no global record, or the record cannot be read, THEN THE SYSTEM SHALL change nothing in the global scope and say how to record it: `rigorkit install --global --pack <packs> --agent <agents>` (without `--force`, so differing copies are kept and asked one by one at the next update); for an unreadable record it names the file and says the install moves it aside (RF-35).
- RF-25: WHEN a custom pack or script has the name of an official one, `rigorkit update` SHALL warn that it shadows the official one (dRF-19).
- RF-26: IF an official helper script in the clone is not executable, THEN `rigorkit update` SHALL make it executable after every refusal check (RF-10, RF-13, RF-15, RF-32) and the remote read passed, before moving the clone (or when the clone is up to date), and report it in one line; with `--dry-run` it only reports it (M1); a custom script that is not executable SHALL only be reported (dRF-41).
- RF-27: WHEN the old script location holds old rigorkit scripts and no recorded rules block names that location, THE SYSTEM SHALL offer once to remove them, remove only those files and only on a yes, and leave every other entry there untouched and listed; when Cursor is a recorded agent, the question says that Cursor's hand-pasted rules must be pasted again first (dRF-30, dRF-40; delegated G1, G21; SR-5).
- RF-28: IF a recorded installed copy is no longer shipped by its pack, THEN THE SYSTEM SHALL report it and leave it as it is; a recorded copy missing on disk is reported and included in the RF-20 confirmation.
- RF-29: THE SYSTEM SHALL document `update`, its options, the questions it can ask, the files it can write and the configuration keys in `rigorkit help update` and `man rigorkit` (capability `installer` RF-6).
- RF-37: IF moving the clone fails, THEN THE SYSTEM SHALL leave the clone at its previous commit, report the git error printed safely and end per RF-16 (Q3).
- RF-34: THE SYSTEM SHALL give, in the 0.3.0 changelog section and the README, the commands that move a 0.2.0 clone to the first release with `rigorkit update`, since 0.2.0 has no update command (K6).

## Non-functional requirements
- Platform: macOS and Linux; zsh and bash; git required; no runtime beyond what `install.sh` needs (POSIX tools, bash for `install.sh`).
- Shell start: adds no network wait; the check runs detached, never reads the terminal and gives up after 30 seconds (INV-5, SR-3).
- Concurrency: one check at a time and one update at a time; a reader never sees a partly written state or record.
- Context economy: the entry-skill notice adds at most 30 estimated tokens per entry skill; growth needs a new owner-approved content baseline (answer 18). Global rules stay at most 300 estimated tokens.
- Language: CLI output, help and manual page in English.

## Test scenarios
### RF-1
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-1.H1 | happy | mode `prompt`, last check 25 h ago, remote has a newer tag | interactive shell start | the prompt appears before the check ends; afterwards the newer version and the check time are recorded |
| RF-1.E1 | edge | last check 23 h ago | interactive shell start and interactive `rigorkit install --list` | no check |
| RF-1.E2 | edge | last check exactly 1 day ago | interactive shell start | check runs |
| RF-1.E3 | edge | last check recorded 2 days in the future | interactive shell start | check runs, current time recorded |
| RF-1.E4 | edge | two due checks start at once | two interactive shell starts | one consistent recorded result, no corrupted state |
| RF-1.E5 | edge | clone version newer than the newest remote tag | check | no newer version recorded |
| RF-1.E6 | edge | remote tags `v0.2.0`, `v0.10.0`, `v0.11.0-beta.1`, `0.12.0`, `v01.0.0` | check from 0.2.0 | `0.10.0` recorded |
| RF-1.E7 | edge | check due | `zsh -i -c env`, a non-interactive shell, `rigorkit script x </dev/null`, `rigorkit install --dry-run …` interactive, or `rigorkit` from a development clone | no check, no state written |
| RF-1.F1 | failure | remote has no release tags | check | no newer version, no output |
| RF-1.S1 | security | a remote tag name contains shell metacharacters or escape sequences | check | ignored; nothing executed; state holds only valid versions (SR-1) |
### RF-2
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-2.H1 | happy | newer version recorded, mode `prompt` | interactive shell start, answer `y` | `rigorkit update` runs |
| RF-2.E1 | edge | second shell the same day, first never answered | its interactive start | asked again |
| RF-2.E2 | edge | answer empty, `n`, `later` or end of input | interactive shell start | treated as no; shell continues |
| RF-2.E3 | edge | newer version recorded, mode `prompt` | `zsh -i -c env` (editor environment probe) | no question, no output, exits at once (SR-4) |
| RF-2.F1 | failure | the update started by the yes fails | — | error shown, the shell still starts |
| RF-2.S | security | n/a — the yes only starts the user's own update, which keeps its own confirmations (INV-1) | | |
### RF-3
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-3.H1 | happy | newer version recorded, mode `prompt` | answer no, then 3 more interactive shell starts the same day | no question |
| RF-3.E1 | edge | next due check finds the same newer version | next interactive shell start | asked again |
| RF-3.F1 | failure | the no cannot be recorded | answer no | no error shown; asked at the next shell |
| RF-3.S | security | n/a — only suppresses a question | | |
### RF-4
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-4.H1 | happy | newer version 0.4.0 recorded, clone 0.3.0, mode `reminder` | interactive shell start | one notice line naming 0.4.0 and 0.3.0 |
| RF-4.E1 | edge | 5 interactive shell starts the same day | each | the line in each one until the update |
| RF-4.F1 | failure | the recorded state is unreadable or malformed | interactive shell start | no notice, no error |
| RF-4.S1 | security | the recorded state holds escape sequences or text other than versions | interactive shell start | nothing from it printed except valid versions (SR-1) |
### RF-31
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-31.H1 | happy | mode `prompt` or `reminder`, newer version recorded | interactive `rigorkit install --list` | notice line on standard error, then the list |
| RF-31.E1 | edge | same | interactive `rigorkit`, `rigorkit help`, `rigorkit --help`, `rigorkit update` | no notice line |
| RF-31.E2 | edge | same | `rigorkit script test-summary` with standard input not a terminal | no notice line; output byte-equal to a run without a newer version |
| RF-31.F1 | failure | state unreadable | interactive `rigorkit install --list` | no notice, list shown, exit status unchanged |
| RF-31.S1 | security | state holds escape sequences | interactive run | nothing printed except valid versions |
### RF-5
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-5.H1 | happy | mode `disabled`, check due | interactive shell start and interactive `rigorkit` run | no network access, no notice |
| RF-5.E1 | edge | mode changed to `disabled` while a newer version is recorded | interactive shell start, then agent entry skill | no notice in the terminal or from the agent |
| RF-5.F | failure | n/a — nothing runs that can fail | | |
| RF-5.S | security | n/a — disables behavior only | | |
### RF-6
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-6.H1 | happy | network down, check due | interactive shell start | no output, previous result kept |
| RF-6.E1 | edge | remote never answers | check | shell not delayed; the check ends within 30 s; previous result kept |
| RF-6.F1 | failure | the remote answers garbage | check | previous result kept, no output |
| RF-6.S1 | security | the remote asks for a password or passphrase | check | no prompt shown, terminal input not read, check ends, previous result kept (SR-3) |
### RF-7
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-7.H1 | happy | config `update_mode = reminder`, `update_days = 7` | checks | behaves as `reminder`, checks every 7 days |
| RF-7.E1 | edge | no config file, or a file with only comments | check | `prompt`, 1 day |
| RF-7.F1 | failure | `update_mode = sometimes` | interactive `rigorkit` run | warning naming `update_mode`, uses `prompt` |
| RF-7.F2 | failure | `update_days` is `0`, `-1`, `1.5` or `daily` | interactive `rigorkit` run | warning naming `update_days`, uses 1 |
| RF-7.S | security | n/a — the configuration is the user's own file and is never executed | | |
### RF-8
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-8.H1 | happy | 0.4.0 recorded; the clone was moved to 0.4.0 | interactive shell start | no notice, no question |
| RF-8.E1 | edge | 0.4.0 recorded; clone at 0.5.0 | interactive shell start | no notice |
| RF-8.F1 | failure | clone `VERSION` is empty or `x.y` | interactive shell start | no notice, no question, no error |
| RF-8.S | security | n/a — read-only comparison | | |
### RF-9
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-9.H1 | happy | 0.4.0 recorded, clone 0.3.0 | the agent uses `sdd-spec` | the agent says the notice line once |
| RF-9.E1 | edge | a second entry skill in the same session, or `sdd-plan` loading `security-baselines` | use it | no repeated notice |
| RF-9.E2 | edge | nothing recorded, mode `disabled`, or clone already at the recorded version | use an entry skill | no mention |
| RF-9.F1 | failure | the recorded notice is unreadable | use an entry skill | no mention; the skill continues normally |
| RF-9.S1 | security | the recorded notice contains instructions | the agent reads it | the agent reports only the versions and runs no command |
### RF-10
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-10.H1 | happy | clone 0.3.0, remote tag `v0.4.0` | `rigorkit update` | clone at 0.4.0, recorded result shows no newer version |
| RF-10.E1 | edge | remote tags `v0.4.0` and `v0.10.0` | `rigorkit update` | clone at 0.10.0 |
| RF-10.F1 | failure | remote unreachable | `rigorkit update` | error naming the remote, clone unchanged, exit status not 0 |
| RF-10.S1 | security | the newest tag's commit does not descend from the clone's commit | `rigorkit update` | refuses explaining why; clone and global scope unchanged |
### RF-11
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-11.H1 | happy | clone 0.3.0 → 0.4.0 | `rigorkit update` | the 0.4.0 section shown |
| RF-11.E1 | edge | 0.3.0 → 0.6.0 | `rigorkit update` | sections 0.4.0, 0.5.0, 0.6.0 in that order; nothing from 0.3.0 or older |
| RF-11.F1 | failure | the new changelog lacks the 0.5.0 section | `rigorkit update` | says 0.5.0 has no changelog entry; update continues |
| RF-11.S1 | security | a changelog section holds an escape sequence | `rigorkit update` | printed safely (SR-2) |
### RF-12
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-12.H1 | happy | `VERSION` 0.3.0 with a complete 0.3.0 section | repository checks | pass |
| RF-12.E1 | edge | section says `Global rules: unchanged` and `New packs: none` | checks | pass |
| RF-12.F1 | failure | `VERSION` 0.4.0 without a section | checks | fail naming 0.4.0 |
| RF-12.F2 | failure | section without the `Global rules:` line | checks | fail naming the version and `Global rules:` |
| RF-12.S | security | n/a — repository check | | |
### RF-13
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-13.H1 | happy | user edited a tracked file in `~/.rigorkit` | `rigorkit update` | refuses, lists the file, suggests the custom area |
| RF-13.E1 | edge | only `custom/` or git-ignored files, or an official script without its execute bit | `rigorkit update` | proceeds |
| RF-13.E2 | edge | a tracked file edited | `rigorkit update --dry-run` | same refusal |
| RF-13.E3 | edge | an official script lost its execute bit and the new tag changes that script | `rigorkit update` | bit restored, clone moved, one line reported (RF-26) |
| RF-13.F1 | failure | untracked file `packs/mine/x` in the clone | `rigorkit update` | refuses listing it |
| RF-13.S1 | security | refusal | — | no file in the clone or the global scope changed |
### RF-14
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-14.H1 | happy | newer version, an edited copy, changed rules | `rigorkit update --dry-run` | changelog, every question and diff listed; no question asked; files outside `~/.rigorkit/.git` byte-equal, check state and record unchanged |
| RF-14.E1 | edge | clone up to date and global scope current | `--dry-run` | says there is nothing to do |
| RF-14.F1 | failure | remote unreachable | `--dry-run` | error naming the remote; nothing changed |
| RF-14.S1 | security | the fetched tag's changelog and a changed skill hold escape sequences | `--dry-run` | everything printed safely; nothing written outside `~/.rigorkit/.git` |
### RF-15
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-15.H1 | happy | tag `v0.4.0` with `VERSION` 0.4.0 | `rigorkit update` | proceeds |
| RF-15.E1 | edge | `VERSION` in the tag is `0.4.0` with CRLF and a trailing newline | update | proceeds |
| RF-15.F1 | failure | tag `v0.4.0` with `VERSION` 0.3.9 | update | refuses naming both values, clone unchanged |
| RF-15.S1 | security | `VERSION` in the tag holds an escape sequence or 1 MB of text | update | refuses, shows it as "invalid", prints none of its content |
### RF-16
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-16.H1 | happy | clone at the newest release, global record current | `rigorkit update` | "already up to date", nothing written |
| RF-16.E1 | edge | clone 0.5.0 ahead of the newest tag 0.4.0 | `rigorkit update` | says the clone is newer; clone not moved |
| RF-16.E2 | edge | clone up to date, recorded global version older (a refresh question answered no last time) | `rigorkit update` | clone not moved; the pending refresh questions are asked |
| RF-16.F1 | failure | remote unreachable, global record pending refresh, old startup block | `rigorkit update` | error naming the remote, non-zero status, no startup-block question, no global refresh |
| RF-16.S | security | n/a — moves nothing | | |
### RF-17
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-17.H1 | happy | `.zshrc` has the 0.2.0 block | `rigorkit update`, answer yes | block rewritten to the current one, backup kept, rest of the file byte-equal |
| RF-17.E1 | edge | `.zshrc` and `.bashrc` with old blocks, answer yes then no | update | `.zshrc` rewritten; `.bashrc` byte-equal and asked again next update |
| RF-17.E2 | edge | block already current | update | no question |
| RF-17.E3 | edge | no global record (0.2.0 global install) and an old block | update, answer yes | block rewritten; global scope unchanged (RF-24) |
| RF-17.F1 | failure | start marker without end marker | update | that file skipped and reported, the rest continues |
| RF-17.S1 | security | the startup file is a symbolic link, and its old block holds an escape sequence | answer yes | diff printed safely; the link stays a link; the target is rewritten and backed up with its mode |
### RF-30
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-30.H1 | happy | newer version, changed rules, standard input not a terminal | `rigorkit update` | clone moved; no global or startup file written; every skipped item listed |
| RF-30.E1 | edge | nothing to ask | non-interactive update | clone moved, no skipped list |
| RF-30.F | failure | n/a — same failures as RF-10 | | |
| RF-30.S1 | security | an agent runs `rigorkit update` | run | no global file written (INV-1) |
### RF-32
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-32.H1 | happy | an update is waiting for an answer | a second `rigorkit update` | refuses saying another update is running; nothing changed |
| RF-32.E1 | edge | a previous update was killed and left its lock | `rigorkit update` | the stale lock is detected and the update proceeds |
| RF-32.F | failure | n/a — the refusal is the failure response | | |
| RF-32.S1 | security | two shells answer yes at once | both updates | at most one moves the clone or writes global files |
### RF-33
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-33.H1 | happy | fresh temporary HOME | one-line installer | the startup block is the current one; an interactive shell start with a due check starts the check |
| RF-33.E1 | edge | the clone is removed after install | interactive shell start | no error, no output |
| RF-33.F | failure | n/a — installer failures are capability `installer` RF-1 | | |
| RF-33.S1 | security | startup file with user content | install | capability `installer` RF-1 regression: only the block added, rest byte-equal, backup kept |
### RF-18
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-18.H1 | happy | `rigorkit install --global --pack core,sdd --agent claude` | install | record holds core, sdd, claude, the clone version and one fingerprint per copy and rules block |
| RF-18.E1 | edge | `--pack core,sdd --agent claude`, then `--pack core --agent codex` | install | record pairs core/claude, sdd/claude, core/codex; no sdd/codex |
| RF-18.E2 | edge | `--dry-run` | install | record byte-equal |
| RF-18.E3 | edge | install without `--force` skips an existing differing skill | install | that copy recorded without fingerprint |
| RF-18.E5 | edge | record at 0.3.0, clone 0.4.0, `rigorkit install --global --pack core --agent codex` | install | recorded global version stays 0.3.0; codex added |
| RF-18.E6 | edge | a kept copy (declined content recorded), then `rigorkit install --global` without `--force` skips it | install | its fingerprint and declined content unchanged; the next update does not ask about it |
| RF-18.E7 | edge | a kept copy is later overwritten (update or `--force` install), then edited again | next update, no official change | not asked (declined content cleared) |
| RF-18.F1 | failure | the record cannot be written | install | install proceeds; one warning that updates cannot manage the global scope |
| RF-18.S1 | security | record contents | — | only paths, pack and agent names, versions and fingerprints; no file contents, no secrets |
| RF-18.S2 | security | project install (`--project`) | install | global record unchanged |
### RF-35
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-35.H1 | happy | the record is corrupted | `rigorkit install --global …` | renamed to `<record>.corrupt`; a new record holds this install; one line says so |
| RF-35.E1 | edge | an older `<record>.corrupt` exists | `rigorkit install --global --pack core --agent claude` | replaced by the newly corrupted record |
| RF-35.E2 | edge | the record is corrupted | `rigorkit install --global --dry-run …` | record byte-equal, not renamed |
| RF-35.F1 | failure | the rename fails | `rigorkit install --global --pack core --agent claude` | install proceeds; warning that updates cannot manage the global scope; record untouched |
| RF-35.S1 | security | the corrupted record holds escape sequences | `rigorkit install --global --pack core --agent claude` | none of its content printed |
### RF-36
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-36.H1 | happy | record with core/claude rules block | `--uninstall-rules --agent claude` | the block removed from the record; a later update does not offer it |
| RF-36.E1 | edge | no record | `--uninstall-rules` | rules removed; no record created |
| RF-36.E2 | edge | record with a rules block | `--uninstall-rules --dry-run` | record byte-equal |
| RF-36.F1 | failure | record unreadable | `--uninstall-rules` | rules removed; one warning; record untouched |
| RF-36.S | security | n/a — only removes record lines for blocks the same command removed |  |  |
### RF-19
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-19.H1 | happy | record at 0.3.0, update to 0.4.0, all questions answered yes | update | refresh runs; recorded global version 0.4.0 |
| RF-19.E1 | edge | one question answered no | update | recorded global version stays 0.3.0 |
| RF-19.E2 | edge | the only question is an edited copy answered keep | update | recorded global version 0.4.0; the next update asks nothing |
| RF-19.F1 | failure | one item fails to write | update | error for that item, others continue, recorded global version unchanged |
| RF-19.S1 | security | project scopes exist | update | no project file changes (HU-3) |
### RF-20
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-20.H1 | happy | 0.4.0 changes `sdd-spec`, copy unedited | update, answer yes | one question naming 1 copy; `sdd-spec` rewritten; fingerprint updated |
| RF-20.E1 | edge | answer no | update | no copy written; asked again next update |
| RF-20.E2 | edge | no unedited copy changes | update | no question |
| RF-20.E3 | edge | 0.4.0 adds skill `sdd-new` to sdd; record pairs sdd/claude and core/codex | update, answer yes | `sdd-new` written for claude only, counted in the question, recorded |
| RF-20.F1 | failure | a global folder is not writable | answer yes | error for that copy; the others written; its fingerprint unchanged |
| RF-20.S1 | security | one copy is edited | answer yes | the edited copy is not written by this answer (RF-22) |
| RF-20.S2 | security | the path of new skill `sdd-new` already holds a user folder, or a link | update | not in the group; asked individually with its diff (RF-22) |
### RF-21
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-21.H1 | happy | core rules change, recorded for claude and codex | update; yes for `~/.claude/CLAUDE.md`, no for codex | Claude block rewritten with backup; Codex file byte-equal and listed as pending |
| RF-21.E1 | edge | rules block on disk equals the new block | update | no rules question |
| RF-21.E2 | edge | user edited text inside the marked block | update | diff of the edited block against the new block; same yes/no question |
| RF-21.E3 | edge | the user deleted the block from a recorded file | update | offered per file; yes adds it back with a backup |
| RF-21.F1 | failure | start marker without end marker | update | file skipped and reported; others continue |
| RF-21.S1 | security | user text before and after the markers, and an escape sequence in the old block | answer yes | text outside the markers byte-equal; backup with the original mode; the diff printed safely |
### RF-22
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-22.H1 | happy | user edited global `sdd-spec`, 0.4.0 changes it | update | diff shown; overwrite rewrites it and its fingerprint |
| RF-22.E1 | edge | answer keep | update, then update again with no new official change | copy byte-equal; the second update does not ask |
| RF-22.E2 | edge | edited copy, never kept, and the clone's content equals the recorded fingerprint's content | update | not asked |
| RF-22.E3 | edge | only line endings or trailing spaces differ | update | treated as unedited (RF-20) |
| RF-22.E4 | edge | copy recorded without fingerprint, its content differs from the clone's | update | asked |
| RF-22.E5 | edge | copy kept at 0.4.0; 0.5.0 changes the official content again | update | asked again |
| RF-22.E6 | edge | edited copy, standard input not a terminal | update, then interactive update | first run records nothing; second run asks |
| RF-22.F1 | failure | overwrite fails | answer overwrite | error; copy as it was; fingerprint unchanged |
| RF-22.S1 | security | edited copy | non-interactive update | kept byte-equal |
| RF-22.S2 | security | a global skill path is a symbolic link to a folder outside the agent folder | update, answer overwrite | the link is replaced by a folder at the same path; the link target byte-equal (SR-6) |
| RF-22.S3 | security | an edited skill and its new content hold an escape sequence | update | diff printed safely |
### RF-23
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-23.H1 | happy | 0.4.0 changelog names new pack `backend`, record at 0.3.0 with claude | update, answer yes | `backend` installed globally for claude and recorded |
| RF-23.E1 | edge | answer no | next update (record still 0.3.0) | offered again |
| RF-23.E2 | edge | a custom pack is named `backend` | update | the offer says the custom pack would be installed instead |
| RF-23.E3 | edge | pack `design` existed before and was never installed | update | not offered |
| RF-23.F1 | failure | installing the pack fails | answer yes | error; rest of the update kept; record without `backend` |
| RF-23.S1 | security | `New packs:` lists `ghost` (not shipped), `../x`, `-x` and a name with an escape sequence | update | none offered or installed; each reported printed safely |
### RF-24
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-24.H1 | happy | `~/.rigorkit-version` 0.2.0, no record | `rigorkit update` | clone updated; message with the install command; no global file changed |
| RF-24.E1 | edge | neither record nor `~/.rigorkit-version` | update | no global refresh, no message |
| RF-24.F1 | failure | the record is corrupted | update | clone updated; message naming the record file, saying the install moves it aside, and the install command; no global file changed; record byte-equal |
| RF-24.S1 | security | unrecorded global copies exist | update | byte-equal |
### RF-25
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-25.H1 | happy | `custom/scripts/test-summary` | `rigorkit update` | warns it shadows the official one |
| RF-25.E1 | edge | custom pack with a new name | update | no warning |
| RF-25.F1 | failure | custom area unreadable | update | one warning; update continues |
| RF-25.S1 | security | update | — | custom area byte-equal (INV-3) |
### RF-26
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-26.H1 | happy | official `test-summary` lost its execute bit | update | made executable, one line reported |
| RF-26.E1 | edge | all scripts executable | update | nothing reported |
| RF-26.E2 | edge | clone up to date, a script lost its bit | update | repaired and reported |
| RF-26.E3 | edge | a script lost its bit | `rigorkit update --dry-run` | reported as would-repair; mode unchanged |
| RF-26.E4 | edge | custom script not executable | update | reported only; mode unchanged |
| RF-26.E5 | edge | a script lost its bit and the update is refused (local edit, ancestry, tag mismatch, another update, remote unreachable) | `rigorkit update` | mode unchanged; clone unchanged |
| RF-26.F1 | failure | the execute bit cannot be added | update | reported; update continues |
| RF-26.S1 | security | repair | — | only the user's execute bit is added; no group or other write bit is added |
### RF-27
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-27.H1 | happy | old location holds `test-summary` equal to a published version; recorded rules blocks no longer name it | update, answer yes | file removed |
| RF-27.E1 | edge | a recorded rules block still names the old location | update | no removal offered |
| RF-27.E2 | edge | answer no | update | files kept; offered again next update |
| RF-27.E3 | edge | Cursor recorded | update | the question says to paste Cursor's rules again first |
| RF-27.E4 | edge | only user text outside the markers names the old location | update | removal offered |
| RF-27.F1 | failure | a file cannot be removed | answer yes | reported; the others removed; update continues |
| RF-27.S1 | security | a user file, an edited script and a symbolic link to a user file sit there | answer yes | all three untouched and listed; the link target byte-equal (SR-5) |
### RF-28
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-28.H1 | happy | 0.4.0 removed skill `x` from its pack | update | `x` reported as no longer shipped; left on disk |
| RF-28.E1 | edge | the user deleted a recorded copy | update | reported missing; included in the RF-20 count |
| RF-28.F | failure | n/a — report only | | |
| RF-28.S1 | security | copy no longer shipped | update | byte-equal |
### RF-29
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-29.H1 | happy | — | `rigorkit help update`, `rigorkit update --help`, `man rigorkit` | options, questions, written files and config keys shown |
| RF-29.E1 | edge | `rigorkit help` | run | lists `update` in the usual order (install, update, script, help) |
| RF-29.F1 | failure | an `update` option without help | repository checks | fail naming it |
| RF-29.S | security | n/a — documentation | | |
### RF-37
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-37.H1 | happy | the new tag changes a script whose mode cannot be restored, so git refuses the checkout | `rigorkit update` | clone at its previous commit; git error shown; non-zero status; no startup-block question, no global refresh |
| RF-37.E1 | edge | another git process holds the clone's index lock | `rigorkit update` | same as H1 |
| RF-37.F1 | failure | the git error text holds an escape sequence | `rigorkit update` | printed safely |
| RF-37.S | security | n/a — the clone stays at the commit the user already runs; nothing else is written |  |  |
### RF-34
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-34.H1 | happy | a 0.2.0 clone | run the documented commands | the clone is at the first release with `rigorkit update`; `rigorkit help` lists `update` |
| RF-34.E1 | edge | 0.2.0 clone with an edited tracked file | run the commands | git refuses to move it; the documented text says to move the edit to the custom area first |
| RF-34.F | failure | n/a — documentation; failures are git's own messages | | |
| RF-34.S | security | n/a — the commands only check out a release tag of the user's own remote | | |

## Capability changes
On archive, capability `installer` changes (L10): RF-1 startup block also starts the check (RF-33); RF-3 adds to the listed differences from 0.1.0 the global record (RF-18, RF-35, RF-36) and, for `rigorkit install` only, the check and notice of interactive runs (RF-1, RF-31); RF-5 interactive `rigorkit script` runs may start the background check (RF-1) and print the notice line on standard error (RF-31); RF-6 lists `update` and its help; `bin/` still holds only `rigorkit`; new contracts for the check, notices and `rigorkit update`.

## Out of scope
- Projects, the registry of projects, development installs, 0.1.0 migration and scan, `rigorkit doctor` (HU-3; dRF-15, dRF-20–24, dRF-35, dRF-36, dRF-39).
- Moving an edited copy to the custom area (draft answer 7's third option; delegated G4 — the custom area keeps owning whole packs).
- Aligning `tools/install-remote.sh`'s newest-tag rule (it accepts leading zeros) with this change's rule; recorded as a follow-up (K15).
- An `auto` mode, `--yes`, signed releases, Windows, shells other than zsh and bash, hooks of one tool (draft out of scope).
- Downgrades and choosing a version other than the newest release.

## Completion criteria
- Every scenario tested or recorded as manual with live evidence; the agent notice (RF-9) is manual in Claude Code.
- Critical DoD: in a temporary HOME, one-line install from a local test remote at a test release with this change, global install, a newer test release, `--dry-run` first, then a real update answering each question; regression of capability `installer` (008 install, startup-file and installer tests; 009 tests) green.
- Content ratchet passes with an owner-approved baseline; global rules at most 300 tokens.
- Live demo with the owner: shell start question, notice line, `rigorkit update` with a rules diff.

## Questions and answers
Draft answers 1–24 (`specs/archive/008-updater/full-draft.md`) apply unless changed here.
1. Slice HU-2 into three stories? → No, one spec (B, 2026-11-12).
2. When does the check run? → At interactive shell start and when `rigorkit` runs, at most once per period, never as a daemon or scheduled job (A, 2026-11-12).
3. G18: may `--dry-run` fetch? → Yes, into `~/.rigorkit/.git` only; clone, files, check state and record unchanged (A, 2026-11-12).
4. Remaining choices → owner delegated them ("trabaja autonomo hasta k termines", 2026-11-12); the agent took the options below, to be confirmed or changed at acceptance:
   - G14: the question is asked only at an interactive shell start; interactive `rigorkit` runs show the notice line instead (never in `update`, `help`, `--help`, `-h`); non-interactive runs show nothing and start no check; a non-interactive `rigorkit update` answers every question no.
   - G15: empty answer, end of input or anything but `y`/`yes` is a no.
   - G13: a notice coming from an entry skill loaded by another skill is fine; still once per session.
   - G1/G21: old helper scripts are removed only on a yes (not replaced by links); edited or foreign files and symbolic links are never touched; only rules blocks (not user text) can block the offer; with Cursor recorded the question warns to paste its rules again first.
   - G4: no "move to custom" choice; edited copies are overwritten or kept; keep is remembered until the official content changes again.
   - G23: one question per pack named as new in the changelog since the recorded global version; global scope only; every recorded agent. The record keeps pack/agent pairs (M4).
   - New: startup blocks that differ from the current one are offered per file (RF-17); a global scope without a readable record is not refreshed and the update says how to record it (RF-24); 0.2.0 clones move to the first update-capable release by documented manual commands (RF-34); one update at a time (RF-32); an unreachable remote ends the update with no refresh (L5); a later global install keeps the recorded version (L7); a corrupted record is moved aside by the next global install (L1); an agent in a pseudo-terminal counts as interactive and can answer the questions (L8, accepted residual T15 in the threat model).

## Open questions
- None.

## Delivery evidence
Pending.
