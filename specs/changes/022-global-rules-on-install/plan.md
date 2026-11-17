# Technical plan — 022-global-rules-on-install
Spec: `spec.md` (approved 2026-11-17, RF-1…RF-15, answers 1–21). Threat model: `threat-model.md` (V1–V9).

## Current context
- The one-line installer runs nothing from the clone and installs no pack (`tools/install-remote.sh:7`, installer capability RF-1). It ends by suggesting a global install of `core` with skills (`tools/install-remote.sh:308`). Startup blocks, backups and symbolic-link resolution already exist and are twinned with `install.sh` (`resolve_link` `:32`, `backup` `:46`, `exists` `:64`); an existing clone only gets missing blocks (`existing_clone` `:277`).
- Global rules are merged by `install.sh`: tool files `rules_file` `:285-292`, render `:312`, backup `:304`, write `apply_rules` `:317` (writes through a link with `cat > dst` and calls `mark_installed_version`, so the home marker `~/.rigorkit-version` is also written), `merge_rules` `:332` (dies on a start marker without its end), loop over packs `:456-491` (skills, agents, rules, scripts note), record lines `rec_line pair` `:459`, `rec_rules` `:163`, `rec_write` `:168-191`. A custom `core` pack replaces the official one (`install.sh:59,448`).
- Records: `pair` (pack, agent) drives staging in `rigorkit update` (`lib/update.sh:298-313`; with no `pair` line the empty pack list still iterates once with an empty name, `:308-317`, and prints "pack  is no longer shipped" through `pack_dir ""`, `:232-234`); a `rules` line is refreshed only when a `pair` of the same pack and agent exists (`lib/update.sh:382`). `record_valid` already accepts `rules` lines without a `pair` (`install.sh:130-139`, twin `lib/common.sh:41`). `rigorkit doctor` reports copies and pairs, and has no rules line (`lib/doctor.sh:55-67`).
- Terminal and answer conventions: `ask()` accepts `y`/`yes` in any case and reads standard input (`lib/update.sh:27-41`). Existing tests: `tools/test/008-install-remote.test.mjs` (local bare remotes, a `bin/rigorkit` that writes `<name>-main-ran`), `008-startup-files.test.mjs:46`, pseudoterminal runner `tools/test/pty-run.py` and `021-pty-run.py`.
- Prior knowledge reused: vault note "Un instalador remoto valida todo antes de ejecutar nada" (touch user files only after every other step passed); threat models 008 and 010 for clone and instruction-file boundaries.

## Structure by layer / module
| Module | Change | RFs covered |
|---|---|---|
| `install.sh` | `RULES_ONLY_SUPPORTED=1` capability line near the top; `--rules-only`: needs an explicit `--global`, else a usage error; per pack it skips skills, agents, scripts note and `pair` records, installs rules only, records only the `rules` line; says when a pack has no rules. `apply_rules` refuses a broken symbolic link target (creates nothing there) in every scope | RF-8.S1, RF-9, RF-10 |
| `lib/common.sh`, `install.sh` (`rec_write` comment) | One named function `rules_only_entries` defines "a `rules` line whose pack and agent have no `pair` line" and is the only place that infers it | RF-11 |
| `lib/update.sh` | First, skip an empty pack list (the pre-existing empty-name iteration). Then rules-only entries are staged with `--rules-only` and refreshed by the existing rules-refresh loop; no skill or agent is ever staged for them and no "no longer shipped" noise appears | RF-11 |
| `tools/install-remote.sh` | New function `offer_rules` called after the startup blocks on both paths (new clone and existing clone): capability check, opt-out, detection and classification, report of incomplete blocks, terminal check, one question, then per tool a safety check and one `install.sh --global --rules-only` run under `env -i` with an allowlist; the closing "next" lines become the later command | RF-1…RF-8, RF-12…RF-15 |
| `help/install.txt`, `man/man1/rigorkit.1` (generated), `README.md`, `packs/core/README.md`, `CHANGELOG.md`, `specs/baselines/cli-output.md` | Document the option, the offer, `RIGORKIT_NO_RULES`, the new messages | RF-1, RF-4, RF-9 (constitution principle 9) |
| `tools/test/022-*.test.mjs` | New tests per block | all |

## Data model
No new record kind. A rules-only install writes `version` and `rules <pack> <agent> <file> <fingerprint>` lines and no `pair` line. Rules-only entries are the `rules` lines whose pack and agent have no `pair` line. Example after a rules-only install for Claude Code: `rigorkit-global-record 1`, `version 0.6.3`, `rules core claude /Users/x/.claude/CLAUDE.md <sha256>`.

## Algorithms
`offer_rules(source_named)` (new clone or existing clone), in the order fixed by RF-14:
```
if not capable(T): print unavailable notice (old clone → names `rigorkit update`); return        # RF-12
if RIGORKIT_NO_RULES non-empty: print later command; return                                     # RF-4
detected = tools whose config folder is a directory (claude ~/.claude, codex ${CODEX_HOME:-~/.codex}, opencode ~/.config/opencode)
if detected empty: print later command; return                                                  # RF-5
for each detected tool: file = its instruction file
     class = incomplete if the core start marker is a whole line and the end marker is not      # RF-15
           | has        if both markers are whole lines
           | offered    otherwise: absent, plain, a link, a broken link, odd paths (the spec's "offered file")
report each incomplete file; RK_FAILED=1
if offered empty:
   if incomplete files exist: say to fix the markers by hand and rerun; return                  # RF-15 clause 2
   say "global rules already installed"; return                                                 # RF-13
if stdin and stdout are not both terminals: print later command; return                         # RF-3
ask once (stdin only, no /dev/tty fallback): name each offered file (link target, sanitized), the clone version,
   the sanitized source and ref when source_named, whether the rules come from the official or a custom core pack,
   the block size in lines, the other writes (backup next to each existing file, ~/.rigorkit-version, the record
   under ~/.local/state/rigorkit) and the preview command (`<T>/bin/rigorkit install … --rules-only --dry-run`)
answer y/yes (any case):
   for each offered tool, immediately before its run:                                           # re-checked after the answer (TOCTOU)
      safe_target(tool) and safe_clone(T) else report the reason, RK_FAILED=1, next tool       # RF-8
      env -i HOME PATH=/usr/bin:/bin:/usr/sbin:/sbin TERM LANG LC_ALL NO_COLOR [CODEX_HOME if absolute and clean] \
          bash "$T/install.sh" --global --rules-only --pack core --agent <tool>               # nonzero → report, RK_FAILED=1
any other answer: print later command
capable(T) = T/install.sh is a regular file with a line exactly `RULES_ONLY_SUPPORTED=1` AND T/packs/core/rules.md is a regular file   # file tests only, nothing executed
safe_clone(T) = T is a real directory (not a link) owned by the current user; $HOME not group/other-writable; install.sh, bin/rigorkit, VERSION, every file under lib/ and packs/core/ and (when it exists) custom/packs/core are not links, owned by the user and not group/other-writable
safe_target(tool) = CODEX_HOME (when used) absolute with no control character; the file path and its link target hold no control character; the file's parent folder is a user-owned directory not group/other-writable; an existing file is a readable regular file or a link to one, owned by the user and not group/other-writable
```
`install.sh --rules-only` per pack: unknown pack → error as today; no `rules.md` → "pack <p> has no rules" and nothing written; else for each agent with a global file `merge_rules` + `rec_rules`; an agent without one (Cursor) prints the block to paste, as today. The `pair`, skill, agent and script steps are skipped, and so is the Cursor/OpenCode duplicate-skill note. `apply_rules` dies when the destination is a link whose target does not exist, before any `mkdir` or write.

`lib/update.sh` staging: `rules_only_entries` returns the rules-only (pack, agent) pairs; the pack loop skips an empty name; for each pack there, run the same staging install with `--rules-only --pack p --agent <its agents>`; the rules-refresh loop accepts a line when its pack and agent are in `pairs` or in `rules_only_entries`.

## Contracts
- CLI: `install.sh --pack <p> --agent <a> --global --rules-only [--dry-run] [--force]`; refused (exit 1, message `--rules-only needs --global`) with `--project` or without a scope. `--dry-run` shows the diff and writes nothing (RF-9.E2).
- Environment: `RIGORKIT_NO_RULES` (non-empty disables the offer). The clone's installer runs with a cleared environment and only `HOME`, a fixed `PATH`, `TERM`, `LANG`, `LC_ALL`, `NO_COLOR` and a clean absolute `CODEX_HOME`.
- Later command printed by the one-liner: `rigorkit install --pack core --agent <claude|codex|opencode> --global --rules-only`, preceded by "open a new shell" on a new install.
- Exit status of the one-liner: failure only for RF-8 failures (including a safety refusal after a yes), RF-15 and existing failures; a no, no terminal, opt-out, no tool, all blocks and an unavailable release are success.

## Decisions
- Run the clone's `install.sh --rules-only` over re-implementing the merge in `tools/install-remote.sh`: one writer of rules, the record and fingerprints stay consistent, and no second copy drifts (the file already carries two twins, `backup` and `resolve_link`). Cost: release code runs once earlier, behind consent (threat model T1–T3, residual risk).
- Safety refusals (unsafe clone, unsafe target) happen after the answer and are RF-8 failures, not a silent change of the offer: the spec's offered-file definition stays intact, RF-8.S1 stays testable, a no or a missing terminal never fails, and the check is as close to the write as it can be.
- Environment cleared with an allowlist over unsetting `RK_*`: `BASH_ENV`, `PATH`, `TMPDIR`, `LD_*` also steer a bash script; POSIX `unset` does not glob.
- A dedicated capability line over grepping for the option name: help text and comments mention options they do not implement.
- Rules-only inference lives in one function and is named at archive in the record definition: any future command that drops `pair` lines must not turn full installs into rules-only.
- One `install.sh` run per tool over one run for all: RF-8 needs the remaining files to proceed after a failure, and `merge_rules` dies on the first problem.
- Capability detection by file test (`--rules-only` named in `install.sh`, `packs/core/rules.md` present) over executing the old clone to ask: INV-5 forbids running unvalidated code and an old clone cannot answer.
- No `pair` for rules-only entries over a new record kind: `record_valid` stays unchanged (two twins, no format change) and an update can never copy skills for them; the cost is the `ronly` derivation in `lib/update.sh`.
- `y`/`yes` matched in any case, as `ask()` does (answer 8–16 and the definition cite the update notice); the spec's "exactly" is read as "only those two words".
- Rejected: reading the answer from `/dev/tty` when stdin is piped (a script could not be told apart from a person, answer 8); a flag that answers yes (out of scope).

## Constitution
Critical paths touched: `install.sh`, `tools/install-remote.sh` (`specs/constitution.md:17-24`) → critical DoD: temp-home install, project and global dry-runs, marker byte-safety, isolated update checks. Principle 9: README, `help/`, pack README, manual page and CHANGELOG change with the behaviour. No violation. Contracts changed at archive: installer RF-1 ("installs no pack", closing suggestion), RF-2, RF-3.

## Test strategy
Node tests under `tools/test/`, temporary homes, local bare remotes (`008-install-remote.test.mjs` pattern); terminal scenarios through the existing pseudoterminal runner (precedent 021); dependency fixture: a clone whose `install.sh` leaves a marker file, to prove V1.
| Scenarios | Level |
|---|---|
| RF-9.*, RF-10.* | integration (real `install.sh` in a temp home) |
| RF-11.H1, E1, E2, F1 | integration with a staged release (`tools/test/010-update.test.mjs` pattern); E1 asserts doctor raises no issue and no "no longer shipped" text appears; a record with only rules-only entries must update cleanly |
| RF-11.S1 | integration (`--uninstall-rules`, byte comparison outside markers) |
| RF-1…RF-8, RF-12…RF-15 | integration of `tools/install-remote.sh`; question scenarios, RF-3.E3 (input on a terminal, output redirected) and RF-3.F2 (interrupt) through a pseudoterminal; no-terminal scenarios through plain pipes |
| RF-4.H1, RF-4.S1, RF-14.* | integration, environment matrix |
| RF-7.S1, V6 | integration with control characters in `RIGORKIT_REMOTE` and `CODEX_HOME` |
| V1–V12 | integration (security checks of the threat model, including a custom core pack with loose modes, a linked `~/.rigorkit`, `BASH_ENV` and `RK_NO_RECORD` in the environment, a mode loosened between question and answer, a relative `CODEX_HOME`, and no `/dev/tty` fallback) |
| Twin equality | one test with a table of the three tools: path map, marker strings and incomplete-block rule equal in `tools/install-remote.sh` and `install.sh` |
| Documentation (principle 9) | existing `generate-man.mjs --check` and README key checks |
Amended existing scenarios: `008-install-remote.test.mjs:144-157` RF-1.H1 (installs no pack and names the next step; line 155 requires every agent name, cursor included, which the later command omits); the other `install-remote` users assert files, not closing lines; handled with a cited `test(amend)` commit.

## Risks and cross-layer
- **R1 Update with no pairs.** A record with only rules-only entries (the normal state after the one-line install) makes `lib/update.sh:308-317` iterate once with an empty pack name; fixed first in B2. Writers: `rec_write` (`install.sh:168-191`); readers: `lib/update.sh:298,382`, `lib/doctor.sh:67`, `lib/common.sh:41`. Checks: B2 test with a rules-only-only record asserting a clean update; existing 010/017 suites unchanged.
- **R7 Record guard (B1 review).** `rec_write` returns when nothing was recorded (`install.sh`), so a rules-only run or a no-rules stage leaves no record file and a staging install may leave no staged record; B2 must not assume `lib/update.sh:319` finds one. Pre-existing and left alone: INV-2 byte-identity for a user file without a final newline (`merge_rules` append and replace normalise the end), and `die` prints the destination unfiltered; B3 tests cover the control-character refusal and a file without a final newline.
- **R8 Update write path (B2 review, pre-existing).** `rigorkit update` rewrites the file named in a `rules` record line without checking it against `rules_file` for that agent (`lib/update.sh` rules loop), `real_file` plus `mkdir -p` and `replace_file` would create a broken link's target, and `replace_file` uses a predictable temporary name (`lib/update.sh:247-252`). Rules-only entries now reach this path, but it needs write access to the user's own record or folders and every rewrite still needs a yes. Not changed here; proposed for the follow-up change 023 (atomic rules write). Also unconfirmed: whether a rules-only run on a stale record leaves its `version` line old (`install.sh` `rec_write`), which would widen the changelog window of the next update.
- **R9 B2 scope note.** Not named in T5/T5b: no new pack is offered when the record has no `pair` line (nothing global was chosen), `stage_pack` and `managed_pair` in `lib/update.sh` replace two copied staging loops and two pattern greps.
- **R10 B3 review (applied and residual).** Applied: `safe_clone` also checks `bin/`, `packs/`, `custom/`, `custom/packs/` (links, owner, group/other write) and a `find` error counts as unsafe; `safe_target` checks every folder above the file inside `$HOME`; the question says the clone's installer will run (new or existing clone) and counts the block of the custom core pack when one is used; `CODEX_HOME` reaches only the codex run; names printed are printable ASCII only; `RS_STATE` no longer reuses `RK_STATE`; `RK_LATER` is derived from `RK_TOOLS`. Residual, accepted: the state folder `~/.local/state/rigorkit` is written by `install.sh` as for any global install and is not checked by `safe_target`; extended ACLs are invisible to `-perm`; (superseded by R11: the pre-consent reads of `VERSION` and `rules.md` happen only for regular files, with no link at `packs`, `packs/core` or the file itself); a `$HOME` that is group-writable (mode 775) makes every yes end in a refusal with a failure status (V2 as written); the markers stay literal in `tools/install-remote.sh` (the twin test greps them) and the tool list lives in `RK_TOOLS` and `instr_file`.
- **R11 Final review (applied and residual).** Applied: pre-consent reads of `VERSION` and `packs/core/rules.md` only when they are regular files, not links (`plain_file`, `rules_capable`); new test `tools/test/022-twin-guards.test.mjs` runs the tool-to-file function of `install.sh`, `lib/update.sh` and `tools/install-remote.sh` for every tool with and without `CODEX_HOME` and compares them. Residual, accepted or for the follow-up 023: the record is written only at the end of an `install.sh` run, so a die mid-run leaves files written and unrecorded (pre-existing for every multi-agent global install; the one-line offer runs one tool per run; proposed for 023 together with the atomic write); `rec_write` keeps an old recorded `version` for a rules-only run on a stale record (confirmed by reading, `install.sh:183,192`), widening the changelog window of the next update; doctor does not notice a rules-only entry of a pack that stops shipping rules (R2); the markers and `RK_TOOLS` stay literal in the bootstrap (guard above).
- **R2 Doctor.** `rigorkit doctor` reports no rules lines today, so RF-11.E1 and RF-11.E2 ("doctor reports the rules block / once") cannot hold without changing doctor. Proposed spec amendment AMEND-1 below; with it doctor needs no change. Known debt: doctor does not notice a rules-only entry of a pack that stops shipping rules (`lib/doctor.sh:66` checks pairs only).
- **R3 Old clone.** An existing clone older than this change has no `--rules-only`; `capable` reports it and the notice names `rigorkit update` (RF-12.E1). Check: B3 test with a fixture clone lacking the option.
- **R4 Twin drift.** `offer_rules` repeats three `install.sh` facts: the tool-to-file map (`:285-292`, `CODEX_HOME`), the marker strings and the incomplete-block rule (`merge_rules` `:332`). Check: the twin equality test of the Test strategy.
- **R6 Non-atomic write and backup overwrite (pre-existing).** `apply_rules` truncates in place (`install.sh:328`) and `backup()` replaces an earlier backup when the content differs. Same as today's global install; not changed here. Proposed follow-up, owner decides.
- **R5 Pseudoterminal flakiness** in CI for the question scenarios. Check: reuse the runner and its timeouts; pipe scenarios carry the no-terminal rules.

## Proposed spec amendment (owner approval needed before tests)
AMEND-1: `RF-11.E1` becomes "rules installed rules-only → `rigorkit doctor` → reports no skill or agent as missing and raises no issue for the rules entry"; `RF-11.E2` becomes "a global install of `core` for the same tool afterwards → the file holds one rules block and its `pair` is recorded". Reason: doctor does not report rules blocks today (`lib/doctor.sh:55-67`), and "exactly as a global pack install" means it keeps not doing so. Alternative: add a rules line to doctor (touches installer capability RF-15; larger scope). Recommended: the amendment.
