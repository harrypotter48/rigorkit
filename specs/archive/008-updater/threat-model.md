# Threat model — 008-updater HU-1 (2026-11-11)
> Security lane, before plan (`packs/security/README.md:13`). Reference: `packs/security/skills/security-baselines`. Scope: `spec.md` (HU-1) as approved on 2026-11-11. Status: approved by the owner on 2026-11-11 (spec answer 46): SR-1–SR-4 → spec RF-60–RF-63; PC-1–PC-4 → plan; profile approved.

## 1. Assets
| Asset | Sensitivity |
|---|---|
| User account (code runs as the user) | High: the installer and `rigorkit script` execute code |
| Shell startup files (`.zshrc`, `.bashrc`, `.bash_profile`) | High: often hold exported tokens; a bad write breaks every new shell |
| Agent rules files (`CLAUDE.md`, `AGENTS.md`…) | High: agents follow them and run the commands they name |
| `~/.rigorkit` clone and custom area | Medium: code that agents run through `rigorkit script` |
| Backups `<file>.rigorkit.bak` | High: copies of startup files, same secrets |

## 2. Trust boundaries
- B1 Internet → installer script (`curl` from `raw.githubusercontent.com/.../main`).
- B2 Remote repository → clone content (newest tag).
- B3 Environment (`RIGORKIT_REMOTE`, `RIGORKIT_REF`, `ZDOTDIR`, `SHELL`, `HOME`) → installer.
- B4 Clone path → rendered rules and startup block (data becomes shell/agent text).
- B5 Agent (possibly prompt-injected) → `rigorkit script <name> [args]`.
- B6 Custom area (user files) → installed skills, rules and executed scripts.

## 3. Flows
1. `sh -c "$(curl -fsSL …/main/tools/install-remote.sh)"` → validate env → `git clone` at tag → check `bin/rigorkit` → write startup blocks (+ backups).
2. `rigorkit install` / `install.sh` → read official + custom packs → render rules with clone path → write agent folders and rules (+ backups).
3. Agent reads rules → runs `'<clone>/bin/rigorkit' script <name> args` → resolves custom → custom packs → official → `exec`.

## 4. Abuse cases
| # | Boundary | Abuse | Control today (spec) | Gap | Severity |
|---|---|---|---|---|---|
| T1 | B1, B2 | Network attacker swaps installer or clone | HTTPS default; RF-48 allowlist | — | covered |
| T2 | B1 | Truncated download runs half a script | `sh -c "$(curl -f…)"` runs only a complete download | Body must run from one function called on the last line | hardening (plan) |
| T3 | B1, B2 | Compromised `main` or moved tag ships malicious code to new installs | Installer from `main` (answer 38); tags unsigned (answer 34) | Residual; owner action: branch and tag protection, 2FA | accepted residual |
| T4 | B3 | `RIGORKIT_REF=--upload-pack=…` or remote `-oProxyCommand=…@host:x` turns a value into a git/ssh option | RF-48 allowlist only checks the scheme | **Refuse a ref or remote host/path starting with `-`; pass values after `--`; restrict git protocols; no submodules** | hardening (precondition: env control) |
| T5 | B2 | Code from the default branch runs before the tag is checked out | RF-1, RF-1.S1 | — | covered |
| T6 | B4 | Clone path with quotes, `$` or newline injects shell into rules or startup block | RF-49 single quotes, refuses `'`/newline | Startup block must write `$HOME/.rigorkit` literally, not the expanded path (round 7 Q4) | hardening (plan) |
| T7 | B4 | `bin/` of the clone shadows system commands (`ls`, `git`) via PATH | — | **Startup block appends to PATH; repo check: `bin/` holds only `rigorkit`** | medium |
| T8 | B5 | Agent calls `rigorkit script ../x` or a crafted name | RF-47 refuses `/`, `..`, leading `-` | Args passed as argv with `exec`, never `eval` | hardening (plan) |
| T9 | B5 | Injected agent runs any installed script | Only scripts in rigorkit areas | Residual: scripts must be safe to run with agent-chosen args | accepted residual |
| T10 | — | Backup of a `600` `.zshrc` readable by others leaks exported tokens to other local users | `install.sh:134` plain `cp` keeps the source mode only when the backup is new; an existing backup keeps its own mode | **Backup always gets the original file's mode** | low (needs an existing looser backup) |
| T11 | — | Group/world-writable `~/.rigorkit` lets another local user change scripts agents run | — | **Installer refuses or fixes a clone writable by group/other** | medium |
| T12 | B6 | Custom pack/script runs code | User-owned by design (answer 5) | — | accepted (by design) |
| T13 | B3 | `--dry-run` prints startup-file diffs with secrets on screen | User-run, local | — | accepted |

## 5. Requirements
Spec additions (observable behavior → need a clarify round):
- SR-1 (T4): IF `RIGORKIT_REF` starts with `-` or is not a valid ref name, or the host or path of `RIGORKIT_REMOTE` starts with `-`, THEN refuse naming it, write nothing, exit non-zero. Check: scenarios with `--upload-pack=x` and `-oProxyCommand=x@h:p`.
- SR-2 (T7): the startup block appends the clone's `bin/` to the end of `PATH`. Check: scenario where `PATH` has `/usr/bin` before it; repo check that `bin/` holds only `rigorkit`.
- SR-3 (T10): every `<file>.rigorkit.bak` keeps the mode of the original. Check: `.zshrc` mode `600` → backup `600`.
- SR-4 (T11): IF `~/.rigorkit` is writable by group or others after cloning, THEN the installer removes those bits and says so. Check: umask `000` scenario → `~/.rigorkit` not group/other-writable.

Plan constraints (implementation, each with a check):
- PC-1 (T2): installer body in one function invoked on the last line. Check: static test.
- PC-2 (T4): git called with `--` before remote and paths; `GIT_ALLOW_PROTOCOL=https:ssh:file`; no `--recurse-submodules`. Check: static test + RF-48.S1.
- PC-3 (T6): startup block contains `$HOME/.rigorkit` literally. Check: scenario with a `HOME` containing a space.
- PC-4 (T8): `rigorkit script` uses `exec "$path" "$@"`; no `eval` in `bin/rigorkit`. Check: static test.

Accepted residual (answer 48): RF-63 checks only a new clone; an existing clone and development clones are not checked in HU-1, and only the existing top folder in the RF-51 case is fixed (answer 50) (candidate for `rigorkit doctor`, HU-3). Existing `custom/` only warned (RF-64, answer 47).

Owner actions (outside the repo, T3): `main` is protected and merges only through pull requests (owner, 2026-11-11). Protected `v*` tags and 2FA not confirmed.

## 6. Review profile (proposal)
`sdd-reviewer` + `architecture-reviewer` (required) + `security-reviewer` (input parsing, remote code, dependencies). `frontend` and interface: n/a (no rendered screens).
