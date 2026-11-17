# Threat model — 022-global-rules-on-install (2026-11-17)
> Security lane, before plan (`packs/security/README.md`). References: `packs/security/skills/security-baselines`, threat models 008 and 010 (`specs/archive/008-updater/threat-model.md`, `specs/archive/010-update/threat-model.md`). Scope: `spec.md` (HU-16). Status: reviewed once by an independent security reviewer on 2026-11-17 (1 high, 6 medium, 3 low); every finding is addressed below or listed as residual.

## 1. Assets
| Asset | Sensitivity |
|---|---|
| Global agent instruction files (`CLAUDE.md`, `AGENTS.md` of Codex and OpenCode) | High: agents obey them and run what they name; they hold the user's own rules |
| User account (code runs as the user) | High: the one-line installer would now run release code once, before the first shell start |
| Shell startup files | High: already handled by the existing installer; must not be affected by a failure here (INV-4) |
| Global record (fingerprints of the rules block) | Low: decides what `rigorkit update` asks |
| Backups `<file>.rigorkit.bak` | Medium: hold the user's previous instructions, possibly private |

## 2. Trust boundaries
- B1 Remote repository and ref (`RIGORKIT_REMOTE`, `RIGORKIT_REF`, the newest tag) → the code and rules content that land in the clone.
- B2 The user's terminal → the answer that authorizes any write (INV-1).
- B3 The clone (`~/.rigorkit`, new or existing) → the process that runs its `install.sh`.
- B4 The user's environment (`HOME`, `CODEX_HOME`, internal `RK_*` variables) → paths written and content rendered.
- B5 Instruction files and their parent folders (symbolic links, odd modes, markers) → what the installer reads and overwrites.

## 3. Flows
1. One-line run → clone validated and moved (unchanged) → startup blocks (unchanged) → capability check → opt-out → detection and classification of files → report of damaged files → terminal check → question → on yes, one `install.sh --global --rules-only` run per tool → exit status.
2. `install.sh` (clone) → renders `packs/core/rules.md` with the clone path → backs up → writes the block between markers → writes the record and the home version marker.
3. Later `rigorkit update` → stages and refreshes the rules block with consent (010).

## 4. Threats and mitigations
| ID | Threat (STRIDE) | Mitigation → verifiable requirement |
|---|---|---|
| T1 | Tampering: release code runs before it is validated, or without the user's say-so (breaks `tools/install-remote.sh:7`) | Code runs only after checkout and the existing validation, only after an affirmative answer on a terminal (INV-1, INV-5, RF-3, RF-4). **V1**: no `install.sh` of the clone is executed on any path without an affirmative answer; a test fixture whose `install.sh` leaves a marker proves it for opt-out, no terminal, piped input, no tool, all-blocks, and a no. |
| T2 | Elevation: a local user plants code or rules text in the clone, in its executed set or in the custom `core` pack that replaces the official rules (`install.sh:59,448`), or swaps `~/.rigorkit` for a link | **V2**: immediately before each run (after the answer, so a mode changed while the question was open is caught), refuse with a report and a failure status unless the clone is a real directory owned by the user and `install.sh`, `bin/rigorkit`, `VERSION`, every file under `lib/` and `packs/core/` and `custom/packs/core` are not links, are owned by the user and not group/other-writable, and `$HOME` is not group/other-writable. The question says whether the rules come from the official or a custom `core` pack. |
| T3 | Tampering: environment steers the clone's installer (`RK_RENDER_ROOT`, `RK_PACKS_ROOT`, `RK_STAGE`, `RK_NO_RECORD`, `RIGORKIT_MODELS`, and for any bash script `BASH_ENV`, `PATH`, `TMPDIR`, `LD_*`) | **V3**: the run uses `env -i` with an allowlist (`HOME`, `PATH=/usr/bin:/bin:/usr/sbin:/sbin`, `TERM`, `LANG`, `LC_ALL`, `NO_COLOR`, and `CODEX_HOME` only when absolute and clean); a test sets `BASH_ENV` and `RK_NO_RECORD` and shows neither takes effect, the block names `~/.rigorkit/bin/rigorkit` and the record is written. |
| T4 | Tampering: symbolic link on an instruction file or its parent redirects the write | Existing behaviour writes through a link to its target and backs up the real target (`real_file`, `apply_rules`); the offer names the target (RF-1.S1). **V4**: a link to a regular file changes only the target; `apply_rules` refuses a broken link before any `mkdir` or write, so nothing is created at its target (RF-8.S1). |
| T5 | Information: backup keeps user content readable by others | Existing `backup()` uses a mode-600 temporary file and `cp -p` (`install.sh` backup twin). **V5**: the backup has the original file's mode (RF-2.E2) and is never created world-readable while copying. |
| T6 | Spoofing/Repudiation: the question misleads (control characters in a source name, path, link target or `CODEX_HOME`, terminal escape injection) | **V6**: every name printed in the question or a report has control characters removed (RF-7.S1); a path, link target or `CODEX_HOME` holding a control character, or a relative `CODEX_HOME`, is refused after the answer with a report (RF-8) so `install.sh` never prints it. |
| T7 | Tampering: another pack's block or user text mistaken for the `core` block, or an incomplete block overwritten | Block detection matches only `<!-- rigorkit:core:start/end -->` as whole lines; an incomplete block is excluded (RF-15). **V7**: user content outside the markers is byte-identical after the install (INV-2). |
| T8 | Denial: a rules failure breaks the clone or startup blocks | The offer runs after both are written and its failure only sets the exit status (INV-4). **V8**: a failing rules install leaves the clone and startup blocks intact. |
| T9 | Elevation: consent from a pipe or script (`yes \| sh`) | Consent requires stdin and stdout to be terminals (answer 20); piped installers never ask (RF-3.E2, RF-3.S1). |
| T11 | Elevation: the parent folder of an instruction file (`~/.claude`, `~/.config/opencode`, `CODEX_HOME`) or the file is group/other-writable, so the file or a link is swapped between check and write | **V10**: immediately before each tool's run, a parent folder or an existing file that is not owned by the user or is group/other-writable is refused with a report (RF-8). |
| T12 | Information/Repudiation: the user consents to content they cannot see (custom remote or branch ref) | **V11**: the question shows the clone version, the source and ref, the line count of the block, every file written (instruction files with backups, `~/.rigorkit-version`, the record) and the preview command with `--dry-run`. |
| T13 | Tampering: a dev or edited existing clone is run unknowingly | **V12**: for an existing clone the offer makes no git call (hooks, config), names the clone's version read from `VERSION` and says the clone's installer will run. |
| T10 | Information: the rules block names the clone path inside single quotes | Existing refusal of a clone path with a quote or newline (`install.sh` RF-49) stays; **V9**: the run fails with that message and writes nothing in that case. |

## 5. Residual risk
- The rules write is not atomic and a later run with different content replaces the earlier backup (`install.sh:328`, `backup()`); this is the behaviour of every global rules install today and is not changed here. A follow-up is proposed to the owner.
- Final review of 2026-11-17 (no high findings) added these accepted residuals:
  - A program driving a pseudo-terminal (`expect`, `script`, `tmux send-keys`) can answer yes, and type-ahead is not flushed before the `read`; the agent already holds the user's rights, so the added exposure is small.
  - For an existing clone the question names the version and says the clone's installer runs, but not the clone's `origin` (T13); code planted in `~/.rigorkit` by anything running as the user runs on a yes.
  - `safe_target` checks the folder of the file and of its link target and every folder above them inside `$HOME`, not the folders above a link target outside `$HOME`; `~/.rigorkit-version` is written through a link if `$HOME/.rigorkit-version` is one (mitigated by the `$HOME` check).
  - `has_ctrl` is ASCII-only so that legitimate UTF-8 paths (accented user names) work: C1 and bidi characters in `CODEX_HOME` or a link target are hidden from the question by `clean()` but `install.sh` prints the path raw in its own messages.
  - Before consent the offer reads only `VERSION` and `packs/core/rules.md` when each is a regular file and neither `packs` nor `packs/core` is a link (a final-component or directory link makes the release count as unable to install rules alone); a link there prints `unknown` and, for `rules.md`, makes the release count as unable to install rules alone.
  - A rules-only install for several tools in one `install.sh` run (the printed later command) dies at the first bad file after earlier files were written and before `rec_write`, so those files are written but unrecorded; the one-line offer avoids it by running one tool per `install.sh`. The same holds for any multi-agent global install today.
- Hostile `git` configuration or hooks in a remote clone are not exercised: the offer runs no git command after the clone exists.
- The release the user chose runs once earlier than before (during the one-line run instead of the first new shell, where the startup block already sources `lib/startup.sh`). The exposure is the same code under the same account, now behind consent. Accepted by design of the request; the owner confirms it when approving the plan.
- A user who answers yes while running a custom `RIGORKIT_REMOTE` trusts that remote; the question names it (RF-7).

## 6. Review
Security review: done 2026-11-17 (findings reflected above). Implementation review by the security reviewer stays in the review profile.
