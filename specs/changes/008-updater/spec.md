# Spec 008 — Install rigorkit with one line (HU-1)
> Status: clarifying (round 14, threat model) · Tier: feature · DoD: critical (writes user startup files, global rules and user folders) · Owner repo: rigorkit · Affected repos: rigorkit
> Origin: HU-1 — owner request of 2026-11-10 for an updater like oh-my-zsh's `omz update`; sliced on 2026-11-11 into HU-1 (this change), HU-2 and HU-3 (`specs/backlog.md`). The pre-slicing draft with all 41 requirements is kept in `full-draft.md` for HU-2 and HU-3.

## Context and goal
Today rigorkit is installed by running `install.sh` from a clone the user keeps anywhere (vault decision "2026-10-06 Toolkit de agentes multi-herramienta", line 25), and helper scripts go to `~/.local/share/rigorkit/scripts` (`install.sh:20`, `packs/core/rules.md:8`). There is no `rigorkit` command, no single place for the user's own packs and scripts, and no manual. This slice gives rigorkit a canonical home: one line clones it into `~/.rigorkit`, enables a `rigorkit` command with help and a manual page, keeps helper scripts inside the installation and adds a custom area that takes precedence over official packs and scripts. It is the base that HU-2 (update check and update) and HU-3 (projects and migration) build on.

## Users / actors
- The owner and any colleague who uses rigorkit on their machine (the **user**).
- The rigorkit maintainer, who changes commands and their help.

## User stories
- H1: As a user, I want to install rigorkit with one line, so that a new machine has the `rigorkit` command without manual steps.
- H5: As a user, I want my own packs and scripts in a custom area that take precedence over the official ones, so that I can extend rigorkit safely.
- H7: As a user, I want every command and option documented in `rigorkit help` and `man rigorkit`, so that I know which steps I can take.

## Acceptance
After the change, one line installs rigorkit into `~/.rigorkit` and enables the `rigorkit` command and `man rigorkit` in new zsh shells and in bash shells that read `.bashrc` or a `.bash_profile` that rigorkit writes (a macOS login bash with only `.profile` gets a hint instead, answer 30), without installing any pack. `rigorkit install` installs packs like `install.sh` does today, which stays usable. Helper scripts live inside the rigorkit installation and the global rules name them there. Packs and scripts in the custom area install and run in place of official ones with the same name. Every command and option has help, and an automated check fails when help and commands drift apart.

## Invariants
- INV-1: The one-line installer and `rigorkit install` write only what the command the user ran names; `--dry-run` of `rigorkit install` and `install.sh` writes nothing.
- INV-2: (dropped in slicing; the update-confirmation invariant stays in `full-draft.md` for HU-2.)
- INV-3: No rigorkit command modifies, moves or deletes anything in the custom area; the one-line installer creates the missing empty `custom/`, `packs/` and `scripts/` folders only together with a new clone (RF-1, RF-51), never changing what already exists there.
- INV-4: Content outside the rigorkit markers of a user startup or instruction file is never changed, and a backup `<file>.rigorkit.bak` is kept next to the real file (the target of a symbolic link), with the original file's permission mode even when the backup already exists (RF-62), before the marked block changes (constitution §7, answer 36); a user's own `<file>.bak` is never written.

## Definitions
- **Clone**: the rigorkit repository at `~/.rigorkit` (answer 5).
- **Rigorkit clone**: a git work tree with `VERSION` and `install.sh` at its root; forks count (answer 33). A **development clone** is any rigorkit clone other than `~/.rigorkit`.
- **Custom area**: `~/.rigorkit/custom/`, with `packs/` and `scripts/`, ignored by the clone's version control (answer 5). It is the same for every clone, including development clones; when it does not exist there are no custom items (answer 31).
- **One-line installer**: `tools/install-remote.sh`, POSIX `sh`, served from `main` and run as `sh -c "$(curl -fsSL https://raw.githubusercontent.com/harrypotter48/rigorkit/main/tools/install-remote.sh)"`; it needs git and `curl` or `wget` (answer 38).
- **`rigorkit` command**: `bin/rigorkit` in each clone.
- **Startup block**: the lines rigorkit adds to a shell startup file between the markers `# rigorkit:start` and `# rigorkit:end`; running it twice in one shell has the same effect as once.
- **`.zshrc`**: `$ZDOTDIR/.zshrc` when `ZDOTDIR` is set, `~/.zshrc` otherwise (answer 40).
- **Loads `.bashrc`**: a startup file (`.bash_profile` or `.profile`) has a non-comment line that sources `~/.bashrc`, `$HOME/.bashrc` or `${HOME}/.bashrc`, with any quoting, with `.` or `source`. Indirect loading and `.bash_login` are not detected (accepted limit; the startup block is idempotent).
- **Rules placeholder**: the token `{{RIGORKIT}}` in a pack's `rules.md`, replaced by the absolute path of the clone's `bin/rigorkit` in single quotes; it appears once per `rules.md`.
- **Baseline 0.1.0**: `install.sh` at commit `3ee339e`. File comparisons ignore the `source:` path, date and version value inside `.rigorkit` stamps and `.rigorkit-version`; output comparisons ignore the version value.
- **Default shell**: the shell named by `$SHELL`. A shell is **installed** when `command -v` finds it.
- **Newest release tag**: the `vX.Y.Z` tag with the highest semantic version.
- **Commands (HU-1)**, in help order: `install [options]`, `script <name> [args]`, `help [<command>]`. `rigorkit`, `rigorkit help`, `rigorkit --help` and `rigorkit -h` show the same list (answer 39). `--help` after a command applies to it, except after `script <name>`, where every argument passes to the script.
- **Manual page**: `man/man1/rigorkit.1`, committed to the repository and generated from the help source by a repository script the maintainer runs.

## Functional requirements (EARS)
### One-line installation (H1)
- RF-1: WHEN the user runs the one-line installer, THE SYSTEM SHALL clone rigorkit into `~/.rigorkit` at the newest release tag, or at `RIGORKIT_REF` when set (answers 26, 33), SHALL create `custom/packs/` and `custom/scripts/` when missing, SHALL NOT run anything from the clone before that ref is checked out, SHALL NOT install any pack, and SHALL end by telling the user to open a new shell and run `rigorkit install --pack core --agent <agent> --global`, naming the supported agents, and exit 0 (answers 34, 38).
- RF-53: IF the checked-out ref, or an existing clone, has no `bin/rigorkit`, THEN THE SYSTEM SHALL refuse naming the ref, leave no new `~/.rigorkit`, add no startup block and exit non-zero (answer 42).
- RF-51: IF `~/.rigorkit` contains only `custom/`, THEN THE SYSTEM SHALL clone into a temporary folder, move the clone into `~/.rigorkit`, create only the missing `custom/packs/` or `custom/scripts/`, and leave every existing file in `custom/` byte-equal (answer 41).
- RF-48: WHERE `RIGORKIT_REMOTE` is set, THE SYSTEM SHALL clone from it instead of `https://github.com/harrypotter48/rigorkit.git`, accepting only `https://`, SSH (`ssh://` or `user@host:path`) or an existing local path, and SHALL refuse any other value, including `http://`, `git://`, `file://` and an empty value (answers 33, 34).
- RF-60: IF no clone exists and either `RIGORKIT_REF` is set but empty, starts with `-` or fails `git check-ref-format --allow-onelevel`, or the value of `RIGORKIT_REMOTE` or its user, host or path part starts with `-`, THEN THE SYSTEM SHALL refuse naming the value, write nothing and exit non-zero (threat model T4, answer 46). With an existing clone the values are ignored (RF-58).
- RF-63: IF any file or folder of a new clone, outside an existing `custom/`, is writable by group or others, THEN THE SYSTEM SHALL remove those permission bits and say so; IF removing them fails, THEN it SHALL name the path, leave no new `~/.rigorkit` (in the RF-51 case, only the original `custom/`), remove the temporary folder, add no startup block and exit non-zero (threat model T11, answers 46, 49). THE SYSTEM SHALL clone every new clone into a temporary folder (RF-51 or not) and run this permission fix there, before the move into `~/.rigorkit` and before any custom folder is created. WHERE `~/.rigorkit` contains only `custom/` (RF-51), IF that folder itself is writable by group or others, THEN THE SYSTEM SHALL remove those bits from that folder only, before moving the clone in, leave `custom/` unchanged and say so; IF that fails, THEN the RF-63 failure outcome applies (answer 50).
- RF-64: WHEN the one-line installer clones in the RF-51 case, IF `custom/` or any file or folder in it is writable by group or others, THEN THE SYSTEM SHALL leave it unchanged and warn naming it with the `chmod go-w` command to fix it (INV-3, answer 47). In that case, IF a path in `custom/` cannot be read, THEN it SHALL warn naming it and continue.
- RF-65: WHEN the one-line installer creates `custom/`, `custom/packs/` or `custom/scripts/`, THE SYSTEM SHALL create them without group or others write permission, whatever the umask (threat model T11).
- RF-42: WHEN the one-line installer runs, THE SYSTEM SHALL add the startup block that enables the `rigorkit` command and `man rigorkit` to `.zshrc` if zsh is installed, and, if bash is installed, to `.bashrc` and to an existing `.bash_profile` that does not already load `.bashrc` (answers 21, 30).
- RF-61: THE SYSTEM SHALL make the startup block add the clone's `bin/` to the end of `PATH`, and the repository's automated checks SHALL fail if `bin/` holds anything other than `rigorkit` (threat model T7, answer 46).
- RF-43: IF a startup file the installer would write does not exist, THEN THE SYSTEM SHALL create it only when it is `.zshrc` or `.bashrc` of the default shell, SHALL never create `.bash_profile` (answer 30), and SHALL skip it otherwise.
- RF-50: IF cloning, creating a custom folder or writing any startup block fails, THEN THE SYSTEM SHALL name what failed and exit non-zero, whatever the default shell. Unless RF-56 or RF-63 apply, THE SYSTEM SHALL continue with the remaining writes and keep them; for a custom folder that cannot be created, the message SHALL give `mkdir -m 755 <path>` to create it by hand.
- RF-56: IF git is missing, no release tag exists, the ref does not exist or the clone fails, THEN THE SYSTEM SHALL leave no new `~/.rigorkit`, remove any temporary folder, change no startup file and exit non-zero naming the cause.
- RF-55: IF a startup file is a symbolic link, THEN THE SYSTEM SHALL keep the link and write the block to its target.
- RF-62: WHEN THE SYSTEM writes `<file>.rigorkit.bak`, it SHALL give it the permission mode of the original file, also when the backup already exists (threat model T10, answer 46).
- RF-52: IF the default shell is neither zsh nor bash and nothing failed, THEN THE SYSTEM SHALL say only zsh and bash are supported and exit 0.
- RF-54: IF bash is the default shell and neither `.bash_profile` nor a `.profile` that loads `.bashrc` exists, THEN THE SYSTEM SHALL print a hint that login bash shells will not read `.bashrc`.
- RF-2: IF the clone and every applicable startup block already exist, THEN THE SYSTEM SHALL report that rigorkit is already installed, change nothing and exit successfully.
- RF-58: IF the clone exists and `RIGORKIT_REF` or `RIGORKIT_REMOTE` is set, THEN THE SYSTEM SHALL warn that they are ignored for an existing clone and continue as RF-2 or RF-44 (answer 44).
- RF-44: IF the clone exists but an applicable startup block is missing, THEN THE SYSTEM SHALL add only the missing startup blocks, and SHALL NOT create the custom folders.
- RF-45: IF `~/.rigorkit` exists, is not a rigorkit clone (Definitions) and is not the RF-51 case, THEN THE SYSTEM SHALL refuse, name the folder, change nothing and exit with an error.

### Installing packs (H1, H5)
- RF-3: THE SYSTEM SHALL provide through `rigorkit install` every option `install.sh` offers today (packs, agents, project or global scope, force, dry-run, rule removal, version, list) with the same effects as Baseline 0.1.0, except: helper scripts are not copied (RF-29), global rules are rendered with the clone path (RF-49), backups are named `<file>.rigorkit.bak` with the original's mode (INV-4, RF-62), `--list` also shows custom packs and `--uninstall-rules` also removes custom packs' rule blocks (RF-33) and `--uninstall-rules` says scripts stay in the clone.
- RF-46: THE SYSTEM SHALL keep `install.sh` as a supported entry point with the same behavior as `rigorkit install`, from any clone (answer 14).
- RF-33: WHEN the user runs `rigorkit install --pack <name>` for a pack in the custom area, THE SYSTEM SHALL install it with the same options and effects as an official pack; `--pack all` SHALL include custom packs, and `--list` SHALL show them marked custom (answer 32).
- RF-59: IF a custom pack is named `all` or its name contains `,` or whitespace, THEN THE SYSTEM SHALL neither list nor install it and SHALL warn naming it (answer 45).
- RF-19: WHEN a custom pack has the same name as an official pack, THE SYSTEM SHALL install the custom one in place of the whole official one, installing nothing from the official pack, and SHALL name the shadowed pack in the install report (answers 6, 28, 32).
- RF-57: WHEN a script in `custom/scripts/` has the same name as a script of an installed official pack, THE SYSTEM SHALL install that pack as usual and SHALL name the shadowed script in the install report (answers 6, 28).

### Helper scripts (H5)
- RF-29: WHEN a pack with helper scripts is installed in the global scope, THE SYSTEM SHALL NOT copy its scripts and SHALL run them from the clone the install ran from (`~/.rigorkit` or a development clone) (answer 27).
- RF-47: THE SYSTEM SHALL make the global rules name one way to call each helper script, `rigorkit script <name>` through the absolute path of that clone's `rigorkit` command, that runs the first script with that name in `custom/scripts/`, then the custom packs' `scripts/`, then the official packs not replaced by a custom pack, with packs in byte order of their names within each step (answer 43), passing every following argument unchanged and returning the script's exit status; IF the first matching script, custom or official, is not executable, THEN THE SYSTEM SHALL name it, run nothing and exit non-zero; IF the name is missing, starts with `-` (other than `--help` as the first argument, RF-26), contains `/` or `..`, or no script has that name, THEN THE SYSTEM SHALL run nothing, name it and exit non-zero.
- RF-49: WHEN global rules are installed, THE SYSTEM SHALL write them with the rules placeholder rendered for the clone the install ran from; for an agent without a global rules file (Cursor), it SHALL print that rendered block to paste (answer 35); IF the clone path contains `'` or a newline, THEN THE SYSTEM SHALL refuse the whole install before writing anything, naming the path, and exit non-zero.

### Help (H7)
- RF-25: WHEN the user runs `rigorkit help` or `rigorkit` without arguments, THE SYSTEM SHALL list every command of Definitions with a one-line purpose, in that order; IF the command is unknown, THEN THE SYSTEM SHALL show an error and the list and exit non-zero.
- RF-26: WHEN the user runs `rigorkit help <command>` or `rigorkit <command> --help`, THE SYSTEM SHALL show its options, examples and which files it can write, and SHALL run nothing else; `--help` wins over any other option, valid or not, except after `script <name>` (Definitions).
- RF-27: THE SYSTEM SHALL provide `man rigorkit` from the committed manual page, with the same content as the help (answer 11); the startup block adds the clone's `man/` folder to the manual path without hiding the system manual pages.
- RF-28: IF a command or option exists without help content, or help content names a command or option that does not exist, or the committed manual page differs from what the help source generates, THEN THE SYSTEM SHALL fail the repository's automated checks naming it (answer 11: help must not drift from the code).

## Non-functional requirements
- Platform: macOS and Linux; zsh and bash. Git is required. No runtime beyond what `install.sh` needs today, plus `curl` or `wget` for the one-line installer. Avoid constructs that only work on macOS (answer 23).
- Context economy: `packs/core/rules.md` stays at most 300 estimated tokens as committed (constitution §8), and also when rendered with a 100-character clone path; pack content follows the content ratchet. Today it estimates about 279 tokens, so the plan shortens its text to fit the rendered path.
- Language: CLI output, help and manual page in English.
- Constitution: this change adds the one-line installer and the `rigorkit` CLI to the critical-path table, because they write user files like `install.sh` (answer 29). Critical-path regression for both: a startup file changes outside the markers, a re-run adds a second block, or a user's own `.bak` changes. It also updates constitution §7, `AGENTS.md` (old script folder, `.bak`) and `packs/core/README.md` (old script folder, pasting raw `rules.md`, `.bak`) to the new script call, rendered rules and `.rigorkit.bak` (answer 36).

## Test scenarios
### RF-1
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-1.H1 | happy | no `~/.rigorkit`; remote tags `v0.2.0`, `v0.10.0` | run the one-line installer | clone at `v0.10.0`; empty `custom/packs` and `custom/scripts`; `git status` clean; no pack installed in any agent folder; final message names `rigorkit install --pack core --agent <agent> --global` and every supported agent; exit 0 |
| RF-1.E2 | edge | `RIGORKIT_REF=main` | run the installer | clone at `main` |
| RF-1.E1 | edge | no `vX.Y.Z` tag exists in the remote | run the installer | error saying no release exists; no `~/.rigorkit` left; startup files unchanged |
| RF-1.F1 | failure | network down during the clone | run the installer | error naming the remote; no `~/.rigorkit` left; startup files unchanged |
| RF-1.F2 | failure | git not installed | run the installer | error naming git; nothing written |
| RF-1.F3 | failure | `RIGORKIT_REF=nope` | run the installer | error naming `nope`; no `~/.rigorkit` left; startup files unchanged |
| RF-1.S1 | security | test remote whose default branch `bin/rigorkit` writes a marker file when run, and whose newest tag has a clean one | run the installer, then `rigorkit help` | marker file absent: only the tag's files ran |
### RF-48
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-48.H1 | happy | `RIGORKIT_REMOTE=<local path to a test remote with tag v0.2.0 containing bin/rigorkit>` | run the installer | clone from that path at `v0.2.0` |
| RF-48.E1 | edge | `RIGORKIT_REMOTE=git@github.com:me/rigorkit.git` (fork) | run the installer | accepted as SSH |
| RF-48.F1 | failure | `RIGORKIT_REMOTE` path does not exist | run the installer | error naming it; no `~/.rigorkit` left |
| RF-48.S1 | security | `RIGORKIT_REMOTE` is `http://…`, `git://…`, `file://…` or empty | run the installer | refused naming the value; nothing written |
### RF-60
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-60.H1 | happy | `RIGORKIT_REF=v0.2.0` | run the installer | clone at `v0.2.0`; exit 0 |
| RF-60.E1 | edge | `RIGORKIT_REF='v0..2'` (invalid ref name) or `RIGORKIT_REF=` (empty) | run the installer | refused naming it; nothing written |
| RF-60.F1 | failure | `RIGORKIT_REF=--upload-pack=touch_marker` | run the installer | refused; marker absent; no `~/.rigorkit`; exit non-zero |
| RF-60.S1 | security | `RIGORKIT_REMOTE='-oProxyCommand=touch_marker@h:p'` or `ssh://-oProxyCommand=x/p` | run the installer | refused; marker absent; nothing written |
### RF-63
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-63.H1 | happy | umask `022` | run the installer | `~/.rigorkit` mode unchanged; no message |
| RF-63.E1 | edge | umask `000` | run the installer | group/other write bits removed from the clone; message says so |
| RF-63.F1 | failure | umask `000`, stubbed `chmod` that fails | run the installer | error naming the path; no `~/.rigorkit`; startup files unchanged; exit non-zero; temporary folder removed |
| RF-63.E2 | edge | RF-51 case, umask `000`, stubbed `chmod` that fails | run the installer | `~/.rigorkit` holds only the original `custom/`, byte- and mode-equal; startup files unchanged; temporary folder removed |
| RF-63.E3 | edge | RF-51 case, `~/.rigorkit` mode `777`, `custom/` mode `775` | run the installer | `~/.rigorkit` mode `755`; message says so; `custom/` mode `775` unchanged (RF-64 warns) |
| RF-63.F2 | failure | RF-51 case, `~/.rigorkit` mode `777`, umask `022`, stubbed `chmod` that fails only on `~/.rigorkit` | run the installer | error naming `~/.rigorkit`; it holds only the original `custom/`, byte- and mode-equal; startup files unchanged; temporary folder removed; exit non-zero |
| RF-63.S1 | security | umask `000` | run the installer, then check every file in `~/.rigorkit` | no file or folder writable by group or others |
### RF-64
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-64.H1 | happy | RF-51 case, `custom/scripts/x` mode `775` | run the installer | `x` mode `775`; warning names `x` and `chmod go-w`; the new clone fixed per RF-63 |
| RF-64.E1 | edge | RF-51 case, `custom/` modes `755`/`644` | run the installer | no warning |
| RF-64.F1 | failure | RF-51 case, `custom/packs/secret` unreadable | run the installer | warning names it; install continues; its mode unchanged |
| RF-64.E2 | edge | existing clone, `custom/scripts/x` mode `775` | run the installer again | no RF-64 warning (answer 48) |
| RF-64.S1 | security | RF-51 case, any modes | run the installer | every mode and byte in `custom/` unchanged (INV-3) |
### RF-65
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-65.H1 | happy | new clone, umask `000` | run the installer | `custom/`, `custom/packs/`, `custom/scripts/` not group/other-writable |
| RF-65.E1 | edge | RF-51 case with only `custom/packs/`, umask `000` | run the installer | created `custom/scripts/` not group/other-writable; `custom/packs/` mode unchanged |
| RF-65.F1 | failure | RF-51 case, `custom/` mode `555` with only `custom/packs/` | run the installer | error names `custom/scripts` and the `mkdir -m 755` command; existing `custom/` unchanged; clone kept in `~/.rigorkit`; startup blocks added; exit non-zero (RF-50) |
| RF-65.S1 | security | umask `000` | run the installer | no folder created by the installer is group/other-writable |
### RF-51
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-51.H1 | happy | `~/.rigorkit` holds only `custom/packs/mine` | run the installer | clone in `~/.rigorkit`; `custom/packs/mine` byte-equal; empty `custom/scripts` created; `git status` clean |
| RF-51.E1 | edge | `~/.rigorkit` holds `custom/` and another file | run the installer | refused per RF-45 |
| RF-51.F1 | failure | network down | run the installer | error; `~/.rigorkit` holds only the original `custom/`; temporary folder removed |
| RF-51.S1 | security | any outcome | run the installer | every existing file in `custom/` byte-equal (INV-3) |
### RF-42
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-42.H1 | happy | zsh default, `.zshrc` exists, no `.bashrc` nor `.bash_profile` | install, open a new zsh | block only in `.zshrc`; `rigorkit help` and `man rigorkit` work |
| RF-42.E1 | edge | bash on macOS, `.bash_profile` exists without loading `.bashrc`, `.bashrc` exists | install | block in `.bashrc` and `.bash_profile` |
| RF-42.E2 | edge | `.bash_profile` has `[ -f ~/.bashrc ] && . ~/.bashrc` | install | block only in `.bashrc` |
| RF-42.E3 | edge | `.bash_profile` mentions `.bashrc` only in a comment | install | block in `.bashrc` and `.bash_profile` |
| RF-42.E4 | edge | `ZDOTDIR=~/.config/zsh` | install | block in `~/.config/zsh/.zshrc`; `~/.zshrc` untouched |
| RF-42.F1 | failure | `.zshrc` not writable | install | error naming the file; clone kept; other files still written; exit non-zero (RF-50) |
| RF-42.S1 | security | `.zshrc` has user content | install | only the marked block added; rest byte-equal; `.zshrc.rigorkit.bak` exists |
| RF-42.S2 | security | user's own `.zshrc.bak` exists | install | `.zshrc.bak` byte-equal |
| RF-42.E5 | edge | `.bash_profile` loads `.profile`, which loads `.bashrc`; `.bashrc` and `.bash_profile` get the block | open a login bash | `rigorkit` works; PATH and MANPATH hold the clone once |
### RF-55
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-55.H1 | happy | `.zshrc` is a symbolic link to a dotfiles repo | install | link kept; target gets the block; `.rigorkit.bak` next to the target |
| RF-55.E1 | edge | link to a link | install | final target gets the block; both links kept |
| RF-55.F1 | failure | broken link | install | error naming it; nothing written there; exit non-zero |
| RF-55.S1 | security | link target has user content | install | only the marked block added; rest byte-equal |
### RF-61
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-61.H1 | happy | `PATH=/usr/bin:/bin` | new shell after install | `PATH` ends with the clone's `bin`; `/usr/bin` still first |
| RF-61.E1 | edge | startup block runs twice (RF-42.E5) | new login shell | clone `bin` appears once |
| RF-61.F1 | failure | a file other than `rigorkit` added to `bin/` | run the checks | fail naming it |
| RF-61.S1 | security | clone `bin/` holds a test `ls` (check disabled) | new shell, `command -v ls` | system `ls` found first |
### RF-43
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-43.H1 | happy | default shell zsh, no `.zshrc` | install | `.zshrc` created with the block |
| RF-43.E1 | edge | default shell zsh, bash installed, no `.bashrc` nor `.bash_profile` | install | no bash file created |
| RF-43.E2 | edge | default shell bash, only `.profile` and `.bashrc` exist | install | block in `.bashrc`; no `.bash_profile` created; `.profile` byte-equal |
| RF-43.F1 | failure | n/a — an unsupported default shell is RF-52; write failures are RF-50 | | |
| RF-43.S | security | n/a — creates only the user's own startup file | | |
### RF-62
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-62.H1 | happy | `.zshrc` mode `600` | install | `.zshrc.rigorkit.bak` mode `600` |
| RF-62.E1 | edge | existing `.zshrc.rigorkit.bak` mode `644`, `.zshrc` mode `600` | install | backup mode `600` |
| RF-62.F1 | failure | backup cannot be written | install | error naming it; original unchanged; exit non-zero |
| RF-62.S1 | security | `CLAUDE.md` mode `600` | `rigorkit install --pack core --agent claude --global` | `CLAUDE.md.rigorkit.bak` mode `600` |
### RF-50
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-50.H1 | happy | every write succeeds | install | exit 0 |
| RF-50.E1 | edge | default shell fish, `.zshrc` not writable | install | error naming it; exit non-zero |
| RF-50.F1 | failure | `.bashrc` not writable | install | error naming it; exit non-zero |
| RF-50.S | security | n/a — exit status only; writes covered by RF-42.S1 | | |
### RF-52
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-52.H1 | happy | default shell fish, zsh installed with `.zshrc` | install | block in `.zshrc`; unsupported-shell message; exit 0 |
| RF-52.E1 | edge | default shell fish, no zsh nor bash installed | install | clone done; message; no startup file created; exit 0 |
| RF-52.F1 | failure | n/a — failures are RF-50 | | |
| RF-52.S | security | n/a — messages only | | |
### RF-54
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-54.H1 | happy | default shell bash on macOS, only `.profile` without loading `.bashrc` | install | block in `.bashrc`; login-shell hint printed; exit 0 |
| RF-54.E1 | edge | Ubuntu `.profile` with `. "$HOME/.bashrc"` inside an `if` | install | no hint |
| RF-54.F1 | failure | n/a — failures are RF-50 | | |
| RF-54.S | security | n/a — message only | | |
### RF-53
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-53.H1 | happy | `RIGORKIT_REF=v0.1.0` (no `bin/rigorkit`) | run the installer | refused naming `v0.1.0`; no `~/.rigorkit`; startup files unchanged; exit non-zero |
| RF-53.E1 | edge | existing `~/.rigorkit` from before HU-1, no startup block | run the installer | refused; no block added |
| RF-53.F1 | failure | fork whose newest tag lacks `bin/rigorkit` | run the installer | refused naming the tag |
| RF-53.S | security | n/a — refusal writes nothing (RF-53.H1) | | |
### RF-56
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-56.H1 | happy | git missing | run the installer | error naming git; no `~/.rigorkit`; exit non-zero (also RF-1.F2) |
| RF-56.E1 | edge | remote without `vX.Y.Z` tags | run the installer | error saying no release exists (also RF-1.E1) |
| RF-56.F1 | failure | clone fails midway | run the installer | partial clone removed; exit non-zero (also RF-1.F1); temporary folder removed |
| RF-56.S1 | security | any RF-56 failure with existing startup files | run the installer | startup files byte-equal |
### RF-58
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-58.H1 | happy | rigorkit installed, `RIGORKIT_REF=main` | run the installer | warning names `RIGORKIT_REF`; "already installed"; clone unchanged; exit 0 |
| RF-58.E1 | edge | `RIGORKIT_REMOTE` set, a block missing | run the installer | warning; missing block added |
| RF-58.F1 | failure | invalid `RIGORKIT_REMOTE` (`http://`) with an existing clone | run the installer | warning only; clone unchanged |
| RF-58.E2 | edge | rigorkit installed, `RIGORKIT_REF=--upload-pack=touch_marker` | run the installer | warning only; marker absent; clone unchanged; exit 0 |
| RF-58.S | security | n/a — the values are not used | | |
### RF-2
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-2.H1 | happy | rigorkit installed with all blocks | run the installer again | "already installed", exit 0, every file byte-equal |
| RF-2.E1 | edge | run it 3 times | — | still one block per file |
| RF-2.F1 | failure | n/a — RF-45 covers an existing folder that is not a clone | | |
| RF-2.S | security | n/a — writes nothing | | |
### RF-44
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-44.H1 | happy | clone exists, user removed the block from `.zshrc` | run the installer | block added once; clone untouched |
| RF-44.E1 | edge | block present in `.zshrc`, missing in `.bashrc` | run the installer | only `.bashrc` gets it |
| RF-44.F1 | failure | one of two missing blocks' files not writable | run the installer | error naming it; the other block added; clone untouched; exit non-zero |
| RF-44.E2 | edge | clone and blocks exist, `custom/` missing | run the installer | "already installed"; `custom/` not created |
| RF-44.S | security | n/a — same write boundary as RF-42.S1 | | |
### RF-45
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-45.H1 | happy | `~/.rigorkit` is an unrelated folder | run the installer | refuses naming it; exit non-zero |
| RF-45.E1 | edge | `~/.rigorkit` is an empty folder | run the installer | refuses naming it |
| RF-45.E2 | edge | `~/.rigorkit` is a fork clone (has `VERSION` and `install.sh`) | run the installer | treated as a clone (RF-2 or RF-44) |
| RF-45.F1 | failure | `~/.rigorkit` is a file | run the installer | refuses naming it |
| RF-45.S1 | security | refusal | — | folder content and startup files byte-equal |
### RF-3
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-3.H1 | happy | temporary project | `rigorkit install --pack sdd --agent claude --project <dir>` | same files and output as Baseline 0.1.0 with the same options, except the RF-3 exceptions |
| RF-3.E1 | edge | `--dry-run --global` | run | planned writes printed; nothing written |
| RF-3.E2 | edge | `--version`, `--list` without custom packs | run | same output as Baseline 0.1.0 |
| RF-3.E3 | edge | `--uninstall-rules --global` | run | blocks removed; message says scripts stay in the clone |
| RF-3.E4 | edge | custom pack `mine` with `rules.md` installed globally | `--uninstall-rules --global` | `mine` block removed too |
| RF-3.F1 | failure | unknown agent | run | same error and exit status as `install.sh` |
| RF-3.S1 | security | `CLAUDE.md` with user content and the user's own `CLAUDE.md.bak` | `rigorkit install --pack core --global` | only the marked block changes; `CLAUDE.md.rigorkit.bak` kept; `CLAUDE.md.bak` byte-equal |
### RF-46
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-46.H1 | happy | development clone `~/workspace/personal/rigorkit` | `./install.sh --pack sdd --agent claude --project <dir>` | same result as `rigorkit install` from that clone and as Baseline 0.1.0, except the RF-3 exceptions |
| RF-46.E1 | edge | no `~/.rigorkit` | run `install.sh` from a development clone | works; rules call scripts through the development clone's `rigorkit` |
| RF-46.F1 | failure | unknown option | run | same error as today |
| RF-46.S | security | n/a — same write boundary as RF-3.S1 | | |
### RF-33
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-33.H1 | happy | `custom/packs/mine` with one skill | `rigorkit install --pack mine --agent claude --global` | skill installed like an official one |
| RF-33.E1 | edge | custom pack skill folder without `SKILL.md` | install | that folder skipped, as `install.sh` does for official packs |
| RF-33.E2 | edge | custom pack `mine` | `rigorkit install --pack all --agent claude --global`, then `--list` | `mine` installed; listed marked custom |
| RF-33.E3 | edge | `~/.rigorkit/custom/packs/mine`, install run from a development clone | `install.sh --pack mine --agent claude --global` | `mine` installed from `~/.rigorkit/custom` |
| RF-33.F1 | failure | `--pack nope` in neither area | install | "unknown pack" error, as today |
| RF-33.S1 | security | install a custom pack | — | custom area byte-equal (INV-3) |
### RF-59
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-59.H1 | happy | custom packs `all` and `a,b` | `rigorkit install --list` | neither listed; warning names both |
| RF-59.E1 | edge | custom pack `my pack` and valid `mine` | `--pack all --agent claude --global` | `mine` installed; `my pack` skipped with a warning |
| RF-59.F1 | failure | `--pack 'my pack'` | install | "unknown pack" error, as today |
| RF-59.S1 | security | refused custom pack | — | custom area byte-equal |
### RF-19
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-19.H1 | happy | custom pack `sdd` and official `sdd` | `rigorkit install --pack sdd` | custom `sdd` installed; report says custom `sdd` shadows the official one |
| RF-19.E1 | edge | custom `sdd` with only `sdd-spec` | `rigorkit install --pack sdd --agent claude --global` | only `sdd-spec` installed; report says custom `sdd` shadows the official one |
| RF-19.F1 | failure | custom area missing | install an official pack | works; no error |
| RF-19.S1 | security | install with a shadowing custom pack | — | custom area byte-equal; official pack files byte-equal |
### RF-57
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-57.H1 | happy | custom `scripts/test-summary` | `rigorkit install --pack core --agent claude --global` | report says custom `test-summary` shadows the official one |
| RF-57.E1 | edge | custom `scripts/foo`, no official `foo` | install `core` | no shadow line in the report |
| RF-57.F1 | failure | custom area missing | install `core` | works; no shadow line |
| RF-57.S1 | security | install with a shadowing custom script | — | custom area byte-equal; official pack installed as usual |
### RF-29
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-29.H1 | happy | `rigorkit install --pack core --global` | install | no script copied; global rules call `<clone>/bin/rigorkit script <name>` with the absolute clone path |
| RF-29.E1 | edge | global scope installed from `~/.rigorkit`, then `install.sh --global --force` from a development clone | install | rules now name the development clone; reported as changed |
| RF-29.F1 | failure | the clone named in the rules was moved or deleted | the agent calls a script | shell error naming the missing path; no other script runs |
| RF-29.S1 | security | committed `packs/core/rules.md`, and the block rendered with a 100-character clone path | estimate tokens | both at most 300 |
### RF-47
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-47.H1 | happy | official `test-summary` only | call it the way the rules name | official runs |
| RF-47.E1 | edge | custom `test-summary` exists | call it | custom runs |
| RF-47.E2 | edge | `~/.rigorkit/custom/scripts/test-summary`, rules installed from a development clone | call it | custom runs |
| RF-47.F1 | failure | custom `test-summary` not executable | call it | error naming the custom script; official not run silently |
| RF-47.F2 | failure | `rigorkit script nope` | call it | error naming `nope`; exit non-zero |
| RF-47.F3 | failure | `rigorkit script` or `rigorkit script -x` | call it | error; nothing runs; exit non-zero |
| RF-47.E4 | edge | custom pack `mine` with `scripts/foo`; custom `core` replacing the official one | call `foo`, then `test-summary` | `foo` runs from `mine`; `test-summary` not found unless custom `core` or `custom/scripts` has it |
| RF-47.E3 | edge | `rigorkit script test-summary --help` | call it | `--help` passed to the script; its exit status returned |
| RF-47.S1 | security | `rigorkit script ../../bin/sh` or `rigorkit script a/b` | call it | refused naming it; nothing runs; exit non-zero |
### RF-49
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-49.H1 | happy | install from `~/.rigorkit` | `rigorkit install --pack core --agent claude --global` | `CLAUDE.md` block names `<HOME>/.rigorkit/bin/rigorkit`; no placeholder left |
| RF-49.E1 | edge | `--agent cursor --global` | install | prints the rendered block to paste, with the clone path; writes no Cursor file |
| RF-49.E2 | edge | clone path contains a space | install | rendered path quoted; calling a script works |
| RF-49.F1 | failure | clone path contains `'` or a newline | install | refused naming the path; nothing written; exit non-zero |
| RF-49.E3 | edge | clone path contains `$`, a backtick and `\` | install, call a script | rendered path in single quotes; script runs; no expansion |
| RF-49.S1 | security | `--dry-run --global` | run | rendered block shown in the diff; nothing written |
### RF-25
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-25.H1 | happy | — | `rigorkit help` | every command with one line, in Definitions order |
| RF-25.E1 | edge | `rigorkit`, `rigorkit --help`, `rigorkit -h` | run | same output as `rigorkit help`; exit 0 |
| RF-25.F1 | failure | unknown command | run | error plus the command list; exit non-zero |
| RF-25.S | security | n/a — read-only output | | |
### RF-26
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-26.H1 | happy | — | `rigorkit help install` | options, examples, files it can write |
| RF-26.E1 | edge | `rigorkit install --help --pack sdd --agent claude --global` | run | help shown; nothing installed |
| RF-26.E2 | edge | `rigorkit install --bogus --help` | run | help shown; exit 0 |
| RF-26.E3 | edge | `rigorkit script --help` | run | help of `script`; nothing runs; exit 0 |
| RF-26.F1 | failure | `rigorkit help nope` | run | error plus the command list; exit non-zero |
| RF-26.S | security | n/a — read-only output | | |
### RF-27
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-27.H1 | happy | new shell after install | `man rigorkit` | page with every command and option |
| RF-27.E1 | edge | maintainer changed the help source | runs the generator, then `man rigorkit` | change present |
| RF-27.E2 | edge | `MANPATH` unset before install | new shell, `man ls` | system page still shown |
| RF-27.F1 | failure | system without `man` | `rigorkit help` | still works |
| RF-27.S | security | n/a — documentation | | |
### RF-28
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-28.H1 | happy | every command and option documented | run the checks | pass |
| RF-28.E1 | edge | help names an option the command no longer has | run the checks | fail naming the stale option |
| RF-28.E2 | edge | help source changed, `man/man1/rigorkit.1` not regenerated | run the checks | fail naming the manual page |
| RF-28.F1 | failure | new command without help | run the checks | fail naming the command |
| RF-28.S | security | n/a — repository check | | |

## Out of scope
- HU-2: update check, terminal and agent notices, `rigorkit update`, changelog, edited-copy detection, moving scripts from the previous location (`full-draft.md` RF-4–RF-14, RF-16–RF-18, RF-30–RF-32, RF-34, RF-37, RF-38, RF-40, RF-41). The startup block of this slice does not start any check yet.
- HU-3: installation registry, project and development-install updates, migration scan, `rigorkit doctor` (`full-draft.md` RF-15, RF-20–RF-24, RF-35, RF-36, RF-39).
- Scripts already at `~/.local/share/rigorkit/scripts`: left as they are; HU-2 handles them (answer 20).
- Windows (answer 23), npm/`npx`, uninstalling rigorkit itself.

## Completion criteria
- Every scenario tested or recorded as manual with live evidence; checker reports none missing.
- Critical DoD: `--dry-run` in project and global modes plus a real one-line install and `rigorkit install` in a temporary HOME; regression: project and global installs give the same files as Baseline 0.1.0, except the RF-3 exceptions.
- Live demo: one-line install in a temporary HOME, new zsh and bash shells with `rigorkit help` and `man rigorkit` (bash via `.bashrc`).
- Content ratchet passes; global rules at most 300 tokens.

## Questions and answers
Answers recorded before slicing (numbering kept from `full-draft.md`); only those that apply to HU-1:
4. Same `install.sh` or separate CLI? → Separate `rigorkit` CLI.
5. Where does the clone live? → `~/.rigorkit`; scripts move there, with a custom area like oh-my-zsh's.
6. Custom item with an official name? → Custom wins; update and doctor warn (A).
9. How is rigorkit installed? → One line, like oh-my-zsh; clones and adds the startup line, installs no pack (A).
11. Help? → `rigorkit help`, `help <command>`, `--help` and `man rigorkit` from one source, with a check that fails on undocumented commands (A).
14. `install.sh` after the CLI? → Stays as an entry point with the same behavior from any clone (development registration is HU-3).
20. Scripts at the previous location? → Handled by HU-2.
21. Which startup files? → Those of each installed shell; `.bash_profile` unless it loads `.bashrc`; a missing file is created only for the default shell (A).
23. Windows? → Out of scope; avoid macOS-only constructs.
25. Slicing (2026-11-11)? → Three vertical stories; HU-1 first (A).
26. Q-1 ref the installer checks out (2026-11-11)? → Newest `vX.Y.Z` tag; error if none. The owner creates the first tag before announcing the installer (A).
27. Q-2 scripts with a development clone or no `~/.rigorkit` (2026-11-11)? → Not copied; run from the clone the install ran from through `rigorkit script <name>`, custom first (A).
28. Q-3 does `rigorkit install` warn about a shadowing custom item in HU-1 (2026-11-11)? → Yes, in the install report (A).
29. Q-4 add the installer and the CLI to the constitution's critical paths (2026-11-11)? → Yes (A).
30. H1 create `.bash_profile` when missing? → Never; write `.bashrc` only and leave `.profile` alone (A).
31. H2 custom area of a development clone? → Always `~/.rigorkit/custom/`; absent means no custom items (A).
32. H3 custom packs? → `--pack all` includes them; a custom pack replaces the whole official one (A).
33. H4 what is a rigorkit clone; test remote? → Git work tree with `VERSION` and `install.sh`, forks count; `RIGORKIT_REMOTE` and `RIGORKIT_REF` override remote and ref (A).
34. H5 installer integrity? → Only HTTPS, SSH or a local path; nothing from the clone runs before the chosen ref is checked out; no tag signatures (A).
35. H6 Cursor rules with a per-machine path? → Rules rendered with the clone path at install; Cursor gets the rendered block printed (A).
36. H7 backups? → `<file>.rigorkit.bak` for every file rigorkit backs up; an exception to RF-3 (A).
37. Agent defaults of round 3 (2026-11-11)? → Approved: unsupported default shell exits 0; `--help` wins over invalid options; rendered-rules bound uses a 100-character path; manual page committed in the repository.
38. K14 one-line installer? → `tools/install-remote.sh`, POSIX `sh`, served from `main`, run with `curl`; clones the newest tag; ends with the next step (A).
39. K15 `rigorkit --help` and `-h`? → Same as `rigorkit help`, exit 0 (A).
40. `ZDOTDIR`? → Respected (A).
41. `~/.rigorkit` with only `custom/`? → Clone to a temporary folder and move it in; `custom/` untouched (A).
42. M4 ref or clone without `bin/rigorkit`? → Refuse; write nothing (A).
43. M5 scripts of custom packs? → Order: `custom/scripts/`, custom packs, official packs not replaced; scripts of a replaced official pack are not callable (A).
44. P12 `RIGORKIT_REF`/`RIGORKIT_REMOTE` with an existing clone? → Warn that they are ignored (A).
45. P13 custom pack named `all` or with `,`/space? → Refused with a warning (A).
46. Threat model (2026-11-11)? → Add SR-1–SR-4 as RF-60–RF-63; PC-1–PC-4 go to the plan; profile sdd + architecture + security reviewers. `main` is protected on GitHub and only merges through pull requests (owner, T3) (A).
47. R4 group-writable files in an existing `custom/`? → Leave unchanged, warn with the fix (A).
48. R11 existing and development clones not checked? → Accepted residual; `rigorkit doctor` (HU-3) can check them (A).
49. S1 `chmod` fails in RF-63? → Like RF-53/RF-56: no new clone, no startup block, original `custom/` kept (A).
50. V1 existing group/other-writable `~/.rigorkit` in the RF-51 case? → Remove those bits from that folder only and say so (A).

## Open questions
- None.

## Delivery evidence
Pending.
