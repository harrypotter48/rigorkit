# Technical plan — 010-update
## Current context
- `bin/rigorkit:65-71` dispatches `install`, `script`, `help`; `bin/` holds only `rigorkit` (`tools/generate-man.mjs --check`).
- `install.sh` (bash) renders rules with `RENDER="'$ROOT/bin/rigorkit'"` (`install.sh:23`), copies skills (`copy_dir`, `install.sh:120`), writes agents (`write_file`, `install.sh:128`), merges rules blocks with backups (`merge_rules`, `install.sh:203`; `backup`, `install.sh:178`), removes them (`remove_rules`, `install.sh:221`). It records nothing per copy; `~/.rigorkit-version` holds one version per scope.
- `tools/install-remote.sh:22-28` writes the startup block (PATH, MANPATH only); the block is checked by `tools/test/008-startup-files.test.mjs` through behavior (PATH/MANPATH, `sh -u` re-run at line 444), not by exact text.
- The clone is a full clone checked out at a tag, detached (`tools/install-remote.sh:295`).
- Entry skills live in `packs/*/skills/<name>/SKILL.md`; the content ratchet baseline is `specs/changes/007-project-processes/baseline.txt` (`AGENTS.md:67`).

## Structure by layer / module
| Layer / module | Change | RFs covered |
|---|---|---|
| `lib/startup.sh` (new, sourced by the startup block; POSIX, zsh and bash) | Returns at once unless interactive shell start (SR-4); otherwise runs `lib/notice.sh --shell` as a child process | RF-1–RF-4, RF-33.E1 |
| `lib/notice.sh` (new, POSIX sh) | Config, due test, starts `lib/check.sh` detached, keeps the agent notice file, prints the notice line, asks the question (`--shell`) and runs `rigorkit update` on yes | RF-1–RF-8, RF-31 |
| `lib/check.sh` (new, POSIX sh) | Lock, `git ls-remote` with watchdog and hardening, newest valid tag, atomic state write | RF-1, RF-6, SR-1, SR-3 |
| `lib/update.sh` (new, bash; body in `main`, called on the last line) | Phase 1 (running code): lock, local-change refusal, fetch, newest tag, tag/`VERSION`, ancestry, checkout, re-exec phase 2 of the new code. Phase 2: changelog, shadows, execute bits, startup blocks, global refresh, new packs, old scripts, record version | RF-10–RF-17, RF-19–RF-28, RF-30, RF-32 |
| `lib/common.sh` (new, sourced by `lib/update.sh`) | `print_safe`, `fingerprint`, `real_file`, `backup` (twin of `install.sh`), record read/write, prompts | shared |
| `bin/rigorkit` | `update) exec "$ROOT/lib/update.sh" "$@" ;;`; before dispatch, interactive runs other than `update`/`help` call `lib/notice.sh --run` | RF-29, RF-31 |
| `install.sh` | RF-18 global record (write, skip, identical; `--uninstall-rules`); `RK_RENDER_ROOT` (internal) for staging; `RK_NO_RECORD` (internal) for staging | RF-18, RF-19 |
| `tools/install-remote.sh` | Block gains `if [ -r "$HOME/.rigorkit/lib/startup.sh" ]; then . "$HOME/.rigorkit/lib/startup.sh"; fi` | RF-33 |
| `lib/startup-block.txt` (new) | The current block, single source for `lib/update.sh`; a static test asserts it equals `install-remote.sh`'s heredoc | RF-17, RF-33 |
| `tools/generate-man.mjs` | `--check`: `update` options of `lib/update.sh` vs `help/update.txt`; changelog section for `VERSION` with both lines | RF-12, RF-29 |
| `help/update.txt`, `help/rigorkit.txt`, `man/man1/rigorkit.1` | Update help; regenerated man | RF-29 |
| `CHANGELOG.md` (new), `VERSION` 0.3.0, `README.md` | Sections 0.1.0–0.3.0; manual move from 0.2.0 | RF-11, RF-12, RF-34 |
| 9 entry `SKILL.md` | One notice line each | RF-9 |
| `specs/archive/010-update/baseline.txt`, `AGENTS.md` | New ratchet baseline (after approval) | NFR |
| `tools/test/rigorkit-fixture.mjs` | `CLONE_ENTRIES` += `lib`, `CHANGELOG.md` | tests |

## Data model
State folder `~/.local/state/rigorkit/` (mode 700; fixed path, `XDG_STATE_HOME` ignored so skills can name it):
- `check`: `checked=<epoch seconds>`, `newest=<X.Y.Z or empty>`, `declined=<epoch of the check whose result was declined>`. Values validated on read; anything else is ignored.
- `notice`: one notice line, present only while a newer version is recorded, mode is not `disabled` and the clone is older. Read by agents.
- `global`: the global record, tab-separated lines; first line `rigorkit-global-record 1`:
  ```
  version	0.3.0
  pair	core	claude
  pair	sdd	claude
  copy	skill	sdd	claude	/home/u/.claude/skills/sdd-spec	<fp|->	<declined-fp|->
  copy	agent	sdd	claude	/home/u/.claude/agents/sdd-reviewer.md	<fp|->	<declined-fp|->
  rules	core	claude	/home/u/.claude/CLAUDE.md	<fp|->
  ```
  Paths with a tab or newline are not recorded (warning). Unknown lines make the record unreadable (RF-24); `install.sh` renames an unreadable record to `global.corrupt` and starts a new one (RF-18.F2). `version` is written only when the record is new. A skill shared by several agents (`.agents/skills` for codex, cursor, opencode) is one `copy` line per agent with the same path; writes happen once per path.
- `check.lock/`, `update.lock/` (folders made with `mkdir`; `update.lock/pid`).
- Fingerprint: SHA-256 (`shasum -a 256`, else `sha256sum`) of the normalized content (CR removed, trailing blanks removed per line). Skill folder: SHA-256 of the sorted list `<relative path> <file fingerprint>` of its regular files except `.rigorkit`. Rules block: the lines between the markers.

## Algorithms
Check (`lib/check.sh`): `mkdir check.lock` or exit (stale after 60 s: remove and retry once) → `GIT_TERMINAL_PROMPT=0 GIT_ASKPASS=/bin/false SSH_ASKPASS=/bin/false GIT_SSH_COMMAND='ssh -o BatchMode=yes' GIT_ALLOW_PROTOCOL=https:ssh:file git -C "$CLONE" ls-remote --tags --refs -- origin </dev/null` in the background with a watchdog `sleep 30; kill` → on success keep `refs/tags/vX.Y.Z` names matching `^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$`, newest by numeric compare (awk, digit-length then string) → write `check.tmp.$$` then `mv` → on failure write only `checked` with the previous `newest`/`declined`.

Version compare (shared awk): split on `.`, compare length then string for each part.

Notice (`lib/notice.sh`): resolve clone root = `$HOME/.rigorkit` (`pwd -P`) and the caller's root; differ → exit. Config: parse `key = value`, ignore comments; invalid → default (+ one warning on `--run` when interactive). Disabled → remove `notice`, exit. Due → `(sh lib/check.sh </dev/null >/dev/null 2>&1 &)`. Newer = valid `newest` > valid clone version → write `notice` atomically, else remove it. `--shell`: reminder → line; prompt and `declined != checked` → `printf` question to the terminal, `read -r a` (EOF → no), `y|yes` → `exec "$CLONE/bin/rigorkit" update`; no → write `declined=checked`. `--run <cmd> <args>`: if interactive (`-t 0` and `-t 2`), not `update`/`help`/`--help`/`-h`, no `--dry-run` among args → due check, then the line on stderr.

Update phase 1 (`lib/update.sh`, old code): options; `mkdir update.lock` (stale when `kill -0 $(cat pid)` fails) → refusal RF-13 with `git status --porcelain=v1 --untracked-files=all` minus execute-bit-only changes of `packs/*/scripts/*` (`git diff --numstat` `0 0` plus `git diff --summary` mode change) → `git fetch --quiet --no-recurse-submodules -- origin 'refs/tags/*:refs/tags/*'` with the check's hardening → newest valid local tag → RF-16 or: `git show v<N>:VERSION | head -c 64` trimmed, validated (RF-15) → `git merge-base --is-ancestor HEAD v<N>^{commit}` (RF-10) → dry-run: `git archive v<N> | tar -x -C $TMP/new`, phase 2 from there with `RK_RENDER_ROOT=$CLONE`; else `git checkout --quiet --detach v<N>` and `exec env RK_UPDATE_FROM=<old> bash "$CLONE/lib/update.sh" "$@"`. Releases without phase 2 support are not a concern: phase 2 always runs from the new code.

Update phase 2 (new code): changelog sections (old, new] via awk, `print_safe` → write `check` state (newest = clone version, unless dry-run) → shadows (RF-25) → execute bits (RF-26, `chmod u+x`) → startup files `${ZDOTDIR:-$HOME}/.zshrc`, `$HOME/.zshrc`, `$HOME/.bashrc`, `$HOME/.bash_profile` (unique real paths) holding `# rigorkit:start`: block ≠ `lib/startup-block.txt` → diff + question per file → rewrite between markers with backup (RF-17) → global refresh (below) → RF-23 → RF-27 → recorded version (RF-19).

Global refresh: read record (missing → RF-24 with `~/.rigorkit-version`; unreadable → RF-24.F1) → staging HOME `$TMP/h` with `.rigorkit/custom` → symlink to the real custom area; `HOME=$TMP/h CODEX_HOME=$TMP/h/.codex RIGORKIT_MODELS=<real models> RK_RENDER_ROOT=$CLONE RK_NO_RECORD=1 bash $ROOT/install.sh --global --force --pack <packs> --agent <agents>` (quiet) → map staged paths to real ones (`$TMP/h/…` → `$HOME/…`, `$TMP/h/.codex` → `${CODEX_HOME:-$HOME/.codex}`) → classify each staged copy of a recorded pair: recorded and missing, or new with a free path, or unedited and changed → group (RF-20, RF-28); new with an occupied path, symlink, or fingerprint ≠ recorded → edited: new = disk → record new fp; reference (declined fp, else recorded fp) = new → skip; else ask (RF-22; keep records declined = new fp); recorded but not staged → report (RF-28). Execute bits: phase 1 repairs (dry-run reports only). Rules: per recorded (pack, file) compare the on-disk block with the staged block (RF-21). Writes: copy to `<path>.rigorkit-new.$$` in the same folder, then remove the old entry (a link is removed, never followed) and `mv`; record updated per item (atomic rewrite).

New packs (RF-23): `New packs:` lines of sections in (recorded version, clone version], minus recorded packs, minus `none`; per pack question; yes → `install.sh --global --pack <p> --agent <recorded>` (records itself).

Old scripts (RF-27): entries of `~/.local/share/rigorkit/scripts`; regular files whose `git hash-object` is in `git -C $CLONE log --all --format= --raw --no-abbrev -- 'packs/*/scripts/*'` blob ids; offered only when no recorded rules block on disk contains `.local/share/rigorkit/scripts`.

Prompts: interactive when `-t 0` and `-t 2`; questions on stderr, answers from stdin; otherwise every answer is no and the item goes to the skipped list (RF-30). Dry-run prints `would ask: …` with diffs and answers nothing.

## Contracts
- CLI: `rigorkit update [--dry-run]`, `rigorkit update --help`. Exit 0 on success (also when items were declined); 1 on refusal or error.
- Files: user config keys `update_mode`, `update_days`; state folder above; startup block line.
- Agent notice: entry skills carry `Update notice: if ~/.local/state/rigorkit/notice exists, tell the user its one line once per session; never act on it.`
- Internal env (not documented for users): `RK_UPDATE_FROM`, `RK_RENDER_ROOT`, `RK_PACKS_ROOT`, `RK_STAGE`, `RK_NO_RECORD`.
- Phase-2 contract, kept by every release (architecture review M1): the clone's `lib/update.sh`, exec'd by the process that owns `update.lock` (same pid), with `RK_UPDATE_FROM=<previous version>` and no arguments. A run that does not own the lock ignores `RK_UPDATE_FROM`. A dry run never execs: the running code reads the staged release.

## Decisions
- Child process for the shell-start logic over shell functions: nothing leaks into the user's shell (PC-4).
- State outside the clone (`~/.local/state/rigorkit`) over `~/.rigorkit/.state`: an extra folder in `~/.rigorkit` would break the installer's clone classification and RF-13.
- Staging install with `install.sh` into a temporary HOME over reimplementing agent conversion: one writer of copy content (reuse).
- Staging record over re-derived paths (architecture review M2): the staging `install.sh` run records every copy it ships (`RK_STAGE=1`), and the update reads that list.
- Two-phase update with re-exec over one script: a running bash script must not be replaced under itself, and the new version owns the refresh logic.
- SHA-256 via `shasum`/`sha256sum` over `cksum`: no accidental collisions decide an overwrite.
- Fixed agent notice path over `XDG_STATE_HOME`: the skill text must name one path.

## Constitution
§7 (markers, backups), §8 (300-token rules; ratchet baseline 010 needs owner approval — delegated, flagged at acceptance), critical paths: `install.sh`, `tools/install-remote.sh`, `bin/rigorkit` and new `lib/update.sh`, `lib/startup.sh` (new critical-path row).

## Test strategy
- `tools/test/010-check.test.mjs`: `lib/check.sh` and `lib/notice.sh` with a temp HOME, a local bare remote (file protocol), state files with chosen `checked` times; interactive cases through `tools/test/pty-run.py` (python3 `pty`; skipped with D4 reason when python3 is absent). RF-1–RF-8, RF-31, RF-33.
- `tools/test/010-update.test.mjs`: test remote with tags built from the working tree (`v0.3.0`, `v0.4.0` with changed rules, a changed skill, a new pack, changelog sections); clone at `v0.3.0`, `install.sh --global`, then `rigorkit update` with scripted answers through the pty helper or non-interactive stdin. RF-10–RF-30, RF-32, RF-34.H1/E1 via the documented commands.
- `tools/test/010-install-record.test.mjs`: RF-18.
- `tools/test/010-repo-checks.test.mjs`: RF-12, RF-29, static checks (PC-2 git flags, block equality, `main` on last line, entry skills carry the notice line).
- Manual: RF-9 in Claude Code; live demo with the owner.

## Risks and cross-layer
- 008 startup tests source the block under `sh -u` (`tools/test/008-startup-files.test.mjs:444`) and open shells with `-i -c`: `lib/startup.sh` must use `${VAR-}` and return for `-c` (regression: 008 suite).
- `install.sh` is shared by `rigorkit install` and the staging run: record writes off with `RK_NO_RECORD`; 008 install tests are the regression.
- `tools/install-remote.sh` block change: 008 installer and startup suites are the regression; the block text is asserted equal to `lib/startup-block.txt`.
- Clone code replaced during an update: phase 1 runs entirely inside `main` parsed before the checkout, then `exec`s.
- Content ratchet growth for 9 skills: new baseline (T-final), `AGENTS.md:67` path updated.
