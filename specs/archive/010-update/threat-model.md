# Threat model — 010-update (2026-11-12)
> Security lane, before plan (`packs/security/README.md`). Reference: `packs/security/skills/security-baselines`, threat model 008 (`specs/archive/008-updater/threat-model.md`). Scope: `spec.md` (HU-2). Status: reviewed 2026-11-12 (security review: 0 high, 2 medium fixed — T17, T18 —, lows L1–L5 fixed, L6/L7 accepted as T19/T20); owner delegated decisions (spec answer 4), owner reviews at acceptance.

## 1. Assets
| Asset | Sensitivity |
|---|---|
| User account (code runs as the user) | High: the update moves the clone, whose code runs at every shell start and in agents |
| Shell startup files | High: hold exported tokens; a hanging or broken block breaks every new shell and editors that read the shell environment |
| Global agent rules and global skills/agents | High: agents follow them and run what they name |
| Check state and agent notice | Medium: printed in the terminal and read by agents (prompt-injection channel) |
| Global record (fingerprints) | Low: decides what is asked; tampering needs the user's own write access |

## 2. Trust boundaries
- B1 Remote repository (`origin` of the clone) → tag names, tag contents, changelog.
- B2 Check state on disk → terminal output and agent context.
- B3 Shell start (interactive, also editors that spawn `zsh -i -c env` to read the environment) → background check and question.
- B4 Agent (possibly prompt-injected) → `rigorkit update` and `rigorkit` commands.
- B5 Files in the global scope and the old script location → what the update reads, compares and removes.

## 3. Flows
1. Shell start or `rigorkit` run → due? → detached `git ls-remote` of `origin` → validated newest version → state (atomic).
2. Shell start → state → notice line or question → yes → `rigorkit update`.
3. Agent uses an entry skill → reads the notice → tells the user.
4. `rigorkit update` → refuse on local changes → fetch tags → verify tag/`VERSION` and ancestry → move clone → changelog → global refresh questions → writes with backups → record.

## 4. Abuse cases
| # | Boundary | Abuse | Control (spec) | Gap | Severity |
|---|---|---|---|---|---|
| T1 | B1 | Compromised repository publishes a malicious release | Tags only from CI on protected `main`; tags cannot be moved or deleted (capability `installer` RF-7); unsigned (draft out of scope) | Residual | accepted residual |
| T2 | B1 | Rewritten history or forced tag points to unrelated code | RF-10 ancestry check, RF-15 tag/`VERSION` check | — | covered |
| T3 | B1, B2 | Tag name with shell metacharacters or escape sequences reaches the terminal or the agent | RF-1.S1, RF-4.S1, RF-9.S1 | **State keeps only versions that match `X.Y.Z`; notice built from validated versions only** | hardening (SR-1) |
| T4 | B1 | Changelog or diffs carry terminal escape sequences | RF-11.S1 | **Same filtering for every diff the update prints** | medium (SR-2) |
| T5 | B3 | Background check prompts for a password or SSH passphrase, or reads the shell's input | — | **Check never reads the terminal: no credential prompts, input from nothing, output discarded** | high (SR-3) |
| T6 | B3 | Question at shell start hangs a non-interactive consumer (editor environment probe `zsh -i -c`, `ssh host cmd`) | "Interactive" defined only as an interactive shell | **Ask only when the shell runs no command string and input and output are terminals** | high (SR-4) |
| T7 | B2 | Another local user plants or edits the state file, or a symlink at its path | — | **State in a folder only the user can write; written to a new file then renamed; not followed if it is a symbolic link** | medium (PC-1) |
| T8 | B4 | Injected agent runs `rigorkit update` | RF-30: non-interactive answers no to every question | Clone still moves to a newer release (fast-forward, released only) | accepted residual |
| T9 | B5 | Old-location entry is a symbolic link to a user file; removal deletes or reads the target | RF-27 removes only old rigorkit scripts | **Only regular files, never followed links; content compared without following links** | medium (SR-5) |
| T10 | B5 | Global copy path is a symbolic link out of the agent folder; overwrite writes elsewhere | — | **Overwrite replaces the copy at its own path; never writes through a link that leaves the agent folder** | medium (SR-6) |
| T11 | B1 | Git option injection through a remote URL or ref | Remote read from the clone's own config; 008 PC-2 | **Call git with the remote name `origin` and `--`; `GIT_ALLOW_PROTOCOL=https:ssh:file`; no submodules** | hardening (PC-2) |
| T12 | B3 | Many shells start checks at once (fork storm, rate limits) | NFR concurrency | **One check at a time (lock); a stale lock older than 60 s is ignored** | low (PC-3) |
| T13 | — | Backups of startup files or rules readable by others | capability `installer` RF-1 backup keeps mode | Reuse the same backup | covered |
| T14 | — | `--dry-run` writes to `~/.rigorkit/.git` | Answer 3 | — | accepted |
| T15 | B4 | Injected agent running in a pseudo-terminal answers the refresh questions | Diffs shown; same power as `rigorkit install --force`, which agents can already run | Residual (spec answer 4, L8) | accepted residual |
| T17 | B1 | `--dry-run` used to vet a release runs that release's code | Fixed in review: phase 2 of the running code reads the staged release; staging uses the running `install.sh` with the release's packs (`RK_PACKS_ROOT`) | — | covered |
| T18 | B1 | A release tracking files under the git-ignored `custom/` overwrites them on checkout | Fixed in review: such a release is refused before the move | — | covered |
| T19 | B5 | `~/.claude` or `~/.claude/skills` is itself a link (dotfiles): copies are written into its target | Only the last path component is checked (SR-6); the user chose the link | Residual | accepted residual |
| T20 | B3 | The check triggers GUI prompts (ssh-agent confirmation, FIDO touch, GUI credential helper) | `BatchMode`, `GIT_TERMINAL_PROMPT=0`, `GIT_ASKPASS=false` stop terminal prompts only | Residual; `update_mode = disabled` turns the check off | accepted residual |
| T16 | B1 | `New packs:` names from the remote changelog reach the question and the installer | RF-23: only names the clone or custom area ships, valid pack names; printed safely | — | covered |

## 5. Requirements
Spec additions (observable → clarify round):
- SR-1 (T3): the check records only versions matching `X.Y.Z`; the notice line and agent notice contain only recorded versions. Check: RF-1.S1, RF-4.S1, RF-9.S1.
- SR-2 (T4): every changelog section and diff the update prints shows control characters other than newline and tab escaped. Check: RF-11.S1 and a diff scenario with ESC in a skill.
- SR-3 (T5): the check never prompts for credentials and never reads from or writes to the terminal. Check: remote that asks for credentials → no prompt, check ends, previous result kept.
- SR-4 (T6): the question is asked only at an interactive shell start that runs no command string, with terminal input and output. Check: `zsh -i -c env` with a newer version recorded in `prompt` mode → no question, no output, exits at once.
- SR-5 (T9): the old-location removal acts only on regular files and never follows symbolic links. Check: RF-27 scenario with a link to a user file.
- SR-6 (T10): a global copy that is a symbolic link is not overwritten through the link; it is reported as edited. Check: scenario.

Plan constraints:
- PC-1 (T7): state under a user-only folder, created with mode 700; atomic write (temp file in the same folder, then rename); refuse a state path that is a symbolic link. Check: tests.
- PC-2 (T11): `git -C <clone> ls-remote --tags --refs -- origin`, `fetch` with `--no-recurse-submodules`; `GIT_TERMINAL_PROMPT=0`, `GIT_SSH_COMMAND` with `BatchMode=yes`, stdin from `/dev/null`. Check: static test.
- PC-3 (T12): one lock per check with a stale timeout. Check: concurrency scenario RF-1.E4.
- PC-4: the startup block calls one clone file that does nothing when the clone is missing and never `exit`s or `set`s options in the user's shell. Check: static test plus a shell start with the clone removed.

## 6. Review profile (proposal)
sdd-reviewer, architecture-reviewer and security-reviewer (critical DoD: downloads and moves code; writes startup files and global rules).
