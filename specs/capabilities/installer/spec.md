# Capability — Installer and `rigorkit` command

> Status: current · Owner repo: rigorkit · DoD: critical (writes shell startup files, global rules and user folders)

## Context and goal
rigorkit installs with one line into `~/.rigorkit`, exposes a `rigorkit` command with help and a manual page, installs packs through `rigorkit install` (same options as `install.sh`), runs helper scripts from the clone and lets users add their own packs and scripts in a custom area that takes precedence over official ones.

## Definitions
- **Clone**: `~/.rigorkit`; a **rigorkit clone** is a git work tree with `VERSION` and `install.sh` at its root (forks count); a **development clone** is any other one.
- **Custom area**: `~/.rigorkit/custom/{packs,scripts}`, git-ignored, the same for every clone; rigorkit never modifies it.
- **Startup block**: lines between `# rigorkit:start` and `# rigorkit:end` in `.zshrc` (`$ZDOTDIR/.zshrc` when set), `.bashrc` and an existing `.bash_profile` that does not load `.bashrc`; idempotent; appends the clone's `bin/` to the end of `PATH` and its `man/` to `MANPATH` without hiding system pages.
- **Newest release tag**: the `vX.Y.Z` tag with the highest semantic version.
- **Rules placeholder**: `{{RIGORKIT}}` in a pack's `rules.md`, rendered as the single-quoted absolute path of the installing clone's `bin/rigorkit`.

## Current contracts
- RF-1: `tools/install-remote.sh` (one line: `sh -c "$(curl -fsSL …/main/tools/install-remote.sh)"`) clones the newest release tag (or `RIGORKIT_REF`) from `https://github.com/harrypotter48/rigorkit.git` (or `RIGORKIT_REMOTE`: https, `user@host:path`/`ssh://`, or a local path only; values or parts starting with `-` refused) into a temporary folder, refuses a ref without `bin/rigorkit`, removes group/other write bits, moves it into `~/.rigorkit` (also when it holds only `custom/`), creates missing custom folders never group/other-writable, adds startup blocks with `<file>.rigorkit.bak` backups (original mode) and installs no pack. Nothing from the clone runs before the tag is checked out; failures leave no new clone and no temporary folder.
- RF-2: An existing clone gets only missing startup blocks; `RIGORKIT_REF`/`RIGORKIT_REMOTE` are then ignored with a warning; a folder that is not a clone is refused.
- RF-3: `rigorkit install` and `install.sh` behave identically and as `install.sh` 0.1.0 except: no script copy, rendered rules (refused if the clone path holds `'` or a newline), `<file>.rigorkit.bak` with the original mode, custom packs in `--list`/`all`/uninstall, and `--help` in any position.
- RF-4: A custom pack replaces the whole official pack with the same name; custom packs named `all` or with `,`/whitespace are ignored with a warning; shadowed packs and `custom/scripts` shadowing official scripts are reported.
- RF-5: `rigorkit script <name> [args]` runs the first match in `custom/scripts`, custom packs, then official packs not replaced (byte order), with unchanged args and its exit status; names missing, starting with `-`, or with `/`/`..` are refused (2); not found 127; not executable 126.
- RF-7: Releases: a merge to `main` whose `VERSION` is an unreleased `X.Y.Z` greater than every `vX.Y.Z` tag publishes the annotated tag `v<VERSION>` (`.github/workflows/release-tag.yml`: read-only `test` job, then a `tag` job without actions that pushes only that tag with the workflow token); a released version changes nothing; published tags cannot be moved or deleted (repository ruleset).
- RF-6: `rigorkit`, `help`, `--help`, `-h` list `install`, `script`, `help`; `help <cmd>` and `<cmd> --help` show `help/<cmd>.txt`; `man rigorkit` is `man/man1/rigorkit.1`, generated from `help/` by `tools/generate-man.mjs`; its `--check` fails on command/option/man drift and on any file in `bin/` other than `rigorkit`.

## Verification references
Current implementations: `.github/workflows/release-tag.yml`, `tools/release-tag.mjs`, `tools/install-remote.sh`, `bin/rigorkit`, `install.sh`, `help/`, `man/man1/rigorkit.1`, `tools/generate-man.mjs`. Scenario IDs refer to the archived changes [008-updater](../../archive/008-updater/spec.md) and [009-release-tag](../../archive/009-release-tag/spec.md) and to `tools/test/008-*.test.mjs`, `tools/test/009-release-tag.test.mjs`; evidence and accepted residuals in [validation 008](../../archive/008-updater/validation.md) and [threat model 008](../../archive/008-updater/threat-model.md). Update check, `rigorkit update` and project updates are HU-2/HU-3.
