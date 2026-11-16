# Technical plan — 021-terminal-colors
> Status: approved · Department: Design · Owner approval: 2026-11-15 · Scope: B1; current authority is test preparation only.

## Current context
- Spec 021 and clarification round 2 are approved by the owner on 2026-11-14: "si dale, apruebo la spec 021, pasemos a Design". Implementation and tests are not approved by that message. The owner separately approved the single help-note exception on 2026-11-15; clarification round 3 is ready for plan.
- No `.rigorkit/project.yaml`; follow legacy SDD and `specs/constitution.md`. No application layers exist here: retain the shell CLI/module structure. All proposed technical decisions below require approval at the shared plan/tasks gate.
- `bin/rigorkit:1,19–21,47,64,68–77`: POSIX entry point; help is printed from files, errors go to stderr, scripts run via `exec`, and an interactive notice precedes dispatch.
- `lib/common.sh:17–20`: Bash shared safe-print helpers remove forbidden control characters. Do not weaken them or put display styling into fingerprint/record helpers in the same file.
- `lib/update.sh:29–48,171,207,306–308,386,407`: questions have no trailing newline, diff output has four-space indentation, changelog content is sanitized, and staged installer logs are captured. Phase 2 re-execs the checked-out release at `lib/update.sh:160–161`; dry-run uses the running code with staged release data (`lib/update.sh:10,306–307`).
- `lib/scan.sh:16,133–146,226`: a separate safe one-line formatter, stderr questions, stdout progress/summary. Preserve the 020 batch behavior and its approved 016 amendments.
- `install.sh:27–29,78–99,242–262,315–323,365,452–498`: direct invocation and CLI invocation share output; helpers used to write agents/rules/records must not receive styling. The explicit rule block shown for manual pasting at 481–483 is content and stays raw.
- `lib/doctor.sh:13–18,23,62–100`: help, issues, status headings and report lines. Existing health checks, exit codes and permission repair remain intact.
- `lib/notice.sh:49–61,90–115`: POSIX notice producer, shared between CLI and shell startup; writes a separate plain agent notice file. Only `--run` terminal presentation is in this change. Preserve `--shell` behavior and the startup gating in `lib/startup.sh:4–8`.
- `tools/test/update-fixture.mjs:14–22,82–95`: isolated runtime copies and real PTY helper; default `TERM=dumb` deliberately keeps legacy terminal tests plain. `tools/test/rigorkit-fixture.mjs:11,24–28` copies the whole `lib` directory, so a new shell presentation helper is already included in fixtures.
- Reused repo decisions: `specs/learnings/006-help-is-the-single-source.md` (plain help remains the manual source); `specs/learnings/010-dry-run-never-runs-downloaded-code.md` (source only running-code helpers during preview). Relevant vault topic search found no additional terminal-color decision to apply.

## Structure by layer / module
| Layer / module | Change | RFs covered |
|---|---|---|
| `lib/output.sh` (new, sourced POSIX helper) | Final-destination eligibility, fixed SGR palette, byte-preserving styled spans and explicit help/diff presentation modes; no data writing or agent detection | RF-1–RF-5, RF-7 |
| `bin/rigorkit` | Source presentation from resolved clone root; style owned help/diagnostics; leave script `exec` untouched | RF-1–RF-6 |
| `install.sh` | Source helper from executing installer's root; annotate terminal messages/help/dry-run diff only; preserve rendered artifacts and raw manual-paste blocks | RF-1–RF-5, RF-7 |
| `lib/common.sh` | Source presentation from the executing scripts' existing `CODE` root; add explicitly named safe display wrappers without changing `print_safe`, `say_safe`, fingerprint or record contracts | RF-1–RF-5, RF-7 |
| `lib/update.sh` | Annotate semantic messages, questions, headings, changelog headings and every displayed diff after sanitization | RF-1–RF-5, RF-7 |
| `lib/scan.sh` | Preserve one-line escaping; annotate existing question/list headings and outcomes; leave progress/path listings default | RF-1–RF-5, RF-7 |
| `lib/doctor.sh` | Annotate existing report headings and warning/error/success messages at their producer; do not infer severity from arbitrary names | RF-1–RF-5, RF-7 |
| `lib/notice.sh` | Source its own running-root POSIX helper only for `--run`; style existing CLI warnings/reminder; retain plain file writes and unchanged `--shell` output | RF-1–RF-5, RF-7 |
| `tools/test/021-terminal-colors.test.mjs` (new) | Observable CLI, redirected channel, byte-compatibility, script, prompt and sanitization assertions using isolated real runtime | RF-1–RF-7 |
| `tools/test/021-pty-run.py` and `021-terminal-colors-fixture.mjs` (new, test-only) | Separate destination captures, redirected stdin, raw bytes and stable pre-change references; reuse old harness where sufficient | RF-1, RF-2, RF-4–RF-6 |
| `README.md`, `help/`, `man/man1/rigorkit.1`, `packs/core/README.md` | Document terminal rules and script ownership; preserve help as manual source; append only the owner-approved environment note to root help; preserve all existing help text | RF-1, RF-2, RF-6 |

## Data model
None. No config key, state migration, persisted palette, record-format change, artifact metadata change or model selection. Only existing environment values are read; no color variables are exported to child scripts.

## Algorithms
Final presentation is a local output adapter, never a wrapper around an entire command:

```text
present(role, existing_bytes):
    inspect this invocation's actual stdout destination after shell redirections
    if destination is not a terminal OR NO_COLOR is non-empty OR TERM == dumb:
        copy existing_bytes exactly
    else if role is ordinary/content:
        copy existing_bytes exactly
    else:
        emit only the fixed SGR sequence for role
        copy existing_bytes exactly
        emit reset immediately, before any subsequent input or neutral output

safe display at a protected output site:
    existing producer -> existing sanitization -> present(explicit semantic role)

diff display at an existing diff site:
    existing diff/tail/indent/sanitization -> present_diff
    parse only the known unified-diff output context
    preserve indentation and bytes; added green, removed red, hunk heading cyan
    file headers, context and metadata remain default
```

The renderer reads stdin as a stream; it never stores a complete command transcript, strips external script styling, uses `echo -e`, evals input, or pipes output back into command data. Existing producers retain their formatting semantics; do not silently replace Bash `echo` with `printf` where that could change text. Disabled color uses a byte-for-byte stream copy, including empty streams and absent final newline.

Detect eligibility at the final writer's stdout, not the original process's cached stdout and not the renderer's stdin. For stderr presentation the renderer itself is redirected with `>&2`, so its stdout descriptor is the real destination. Never pass an earlier stage's TTY result through a global environment variable. In particular, command substitutions and installer staging captures see a non-terminal destination and remain plain.

Pure stream parsing is restricted to known displayed diff, help and changelog structures. Ordinary path/message producers pass a role explicitly; a path containing `+`, `error` or `warning` cannot change its color category. Diff parsing tracks hunk state so directory/file headers are not confused with added or removed lines; four-space indentation is preserved and removed only for classification. Help headings are identified from the known help format, with source files remaining plain. Changelog `## <version>` headings receive cyan only inside the existing changelog display adapter.

## Contracts
- `lib/output.sh` is sourced, portable to POSIX sh and Bash under `set -u`/`set -euo pipefail`. Sourcing is silent and side-effect free except for private function definitions; no `exit`, global shell-option changes or environment exports.
- Proposed internal stream API: `rk_present <plain|success|error|warning|question|heading>` copies stdin to stdout; `rk_present_diff` and `rk_present_help` are explicit structured display adapters. Ordinary content can bypass adapters entirely. Fixed palette: SGR 32 green, 31 red, 33 yellow, 36 cyan; SGR 0 reset. No bold/extra decoration is introduced.
- Each adapter evaluates its final stdout descriptor at invocation. `${NO_COLOR-}` and `${TERM-}` are safe when unset; only a non-empty first value or an exact `dumb` second value disables styling beyond the terminal requirement.
- Adapters do not introduce a newline or trim trailing bytes. Question bytes are preserved per producer: update removes the sanitizer newline and ends in a space; scan currently ends in a space plus newline because its safe printer appends it. Restore default styling before `read` without adding or removing either producer's bytes. If a question contains a project heading, the specific heading span may be cyan and its choice marker yellow; ordinary questions remain yellow. Typed answers are never recolored.
- Existing safe-print producers sanitize external text before presentation. The presentation helper emits only fixed internally selected controls, using a data-safe print/copy path. `print_safe` itself remains unchanged and is never taught to permit arbitrary escape sequences.
- Status/exit semantics remain those of the original command and producer. Preserve existing pipeline `pipefail` behavior and deliberate `diff` status handling, including the installer's `|| true`; presentation must not mask a previously observable producer failure or make a valid diff fail.
- Existing dispatch, script precedence, `exec`, script arguments, environment conventions and script statuses are unchanged. Rigorkit's separate pre-dispatch notice may use the CLI palette; invoked script bytes are never piped through a renderer, and scripts may ignore `NO_COLOR` themselves.
- Updater dry-run loads presentation only from executing `CODE`, never staged `ROOT`; real phase 2 reinitializes from its newly executing release. Never cache a function body from a file that an update can replace mid-execution outside the existing updater `main()` safety contract.
- Internal artifacts, fingerprints, record rows, shell startup files and `$STATE/notice` remain unstyled. A terminal pasteable rules block remains content, not a heading or a success message.
- No public API endpoint, event payload or option is added. Standalone `tools/install-remote.sh` and shell startup output remain unchanged.

## Decisions
- D1 (owner-approved 2026-11-15): one small POSIX presentation helper rather than Bash-only functions in `common.sh`; both entry point and notice producer are POSIX, and duplicating palette/eligibility would drift.
- D2 (owner-approved 2026-11-15): explicit output roles and narrow structured adapters rather than whole-command regex coloring; preserves ownership, scripts, safe data paths and truthful categories.
- D3 (owner-approved 2026-11-15): inspect the destination at each final writer rather than caching `-t 1` on startup; redirects, stderr, staging logs and command substitutions must stay correct.
- D4 (owner-approved 2026-11-15): add only fixed color/reset SGR sequences after existing sanitization rather than relaxing `print_safe` or honoring release-provided ANSI; protects the existing trust boundary.
- D5 (owner-approved 2026-11-15): no `tput`, terminfo lookup, external color library, runtime Python or dependency addition; the approved terminal/environment gate and fixed palette are sufficient.
- D6 (owner-approved 2026-11-15): leave shell-start `notice.sh --shell` styling unchanged; only CLI-owned `--run` output is in the approved scope. Keep both the persisted agent notice and source help/man files plain.
- D7 (owner-approved 2026-11-15): add a change-specific split-channel PTY harness rather than modify frozen shared helpers; reuse the existing PTY helper for ordinary combined-terminal interactions. Existing tests already use `TERM=dumb`; colored tests explicitly set a capable `TERM`.
- D8 (owner-approved 2026-11-15): one useful end-to-end block, B1, with internal test/helper/integration/docs/validation tasks; do not accept a helper-only partial delivery.
- D9 (owner-approved scope exception, 2026-11-15): append one environment note to `help/rigorkit.txt`, without rewriting existing help text. Proposed note: "Colors are shown only in terminals. Set NO_COLOR=1 or TERM=dumb to disable them." Preserve the existing trailing newline and append a blank separator plus the note with normal help line wrapping. Other help sources retain their exact text. Regenerate the manual from the updated source. Spec answer 7, INV-1, RF-4 and RF-4.E2 record this exception; clarification round 3 is ready. No broader text change is authorized.
- Reused decisions: keep `help/*.txt` the only manual source (006 learning); keep dry-run restricted to running code (010 learning); retain exact current safe-print behavior and 020 batch/prompt semantics.

## Constitution
Principles 1/2: tool-neutral shell presentation with no new pack dependencies. Principles 5/7: generic content and unchanged user-file writes. Principle 8: no global-rule/skill prompt growth, so no ratchet reset is proposed. Principle 9: README/help/manual/affected pack documentation must describe the approved behavior; D9 resolves the exact-help-byte conflict through the owner-approved single appended note; all prior help text remains exact. Critical DoD applies to `bin/rigorkit`, `install.sh`, updater and CLI notices. Required dry-runs/regressions and independent reviews stay mandatory; owner runs commands. No other violations or exceptions proposed.

## Test strategy
All execution is pending and remains owner-run. T1 writes tests first; owner supplies the red command/result, base/red identity and frozen paths before implementation. Do not modify existing frozen tests or their helpers; an actual need to amend them returns to the owner with evidence.

| Scenarios | Level and observable evidence |
|---|---|
| RF-1.H1/E1/E2/E3/F1/S1 | Real CLI integration with independently attached stdout/stderr/stdin; capture each channel separately; inspect exact added SGR presence/absence and unchanged exit status |
| RF-2.H1/E1/E2/F1/S1 | Real terminal integration for unset, empty, `1`, `0`, arbitrary non-empty opt-out, dumb terminal, and agent PTY opt-out |
| RF-3.H1/E1/E2/F1/S1 | Real command-family outputs plus focused renderer contracts; assert correct SGR around additions/removals/headings/warnings/questions/errors, neutral context/paths and no name-based classification |
| RF-3.E3 | Manual live terminal inspection of the approved update example; pending owner evidence |
| RF-4.H1/E1/E2/F1/S1 | Fixed pre-change byte references and independent temporary-home runs of plain/styled output; remove only the exact internally emitted SGR codes for color comparison; preserve old help bytes and check exactly the D9 appended note, without general text normalization; compare statuses, decision outcomes, artifacts/records/fingerprints and notices |
| RF-5.H1/E1/F1 | PTY integration asserts reset before prompt input echo, neutral content and command exit; test exact producer-specific prompt bytes, including scan's existing newline; no newline is introduced or removed |
| RF-5.E2 | Manual live typed-answer observation; pending owner evidence |
| RF-6.H1/E1/F1/S1 | Real official/custom script fixtures emit exact bytes on both channels, including own ANSI and nonzero status; run with capable terminal and opt-out; no new processing of the script output |
| RF-7.H1/E1/F1/S1 | Real update/scan safe-output paths with control bytes, OSC hyperlinks, ANSI colors, tabs/newlines and non-ASCII text; require identical existing sanitization with color on/off and no attacker-supplied terminal controls |

Contract tests exercise the new helper under `/bin/sh` and Bash; no fake `isatty` mocks. PTY byte comparisons account only for explicitly configured transport CRLF behavior, not arbitrary whitespace normalization. Use deterministic local inputs/temporary HOME/TMPDIR and local test remotes; never run the user's actual update or install into real scopes to validate this change.

Suggested owner-run evidence after the relevant gate:
- New scenario suite: `node --test tools/test/021-terminal-colors.test.mjs`.
- Existing command/installer suites: `node --test tools/test/008-rigorkit-cli.test.mjs tools/test/008-rigorkit-install.test.mjs tools/test/010-install-record.test.mjs`.
- Existing updater/safety suites: `node --test tools/test/010-update.test.mjs tools/test/010-review.test.mjs tools/test/010-check.test.mjs tools/test/010-repo-checks.test.mjs`.
- Related registry/scan/doctor suites: `node --test tools/test/015-project-registry.test.mjs tools/test/016-scan.test.mjs tools/test/018-doctor.test.mjs tools/test/020-scan-batch.test.mjs`.
- Required project/global `rigorkit install --dry-run` plus real temporary installation remain explicit owner evidence, not inferred from unit results.
- Scenario trace: `node packs/sdd/skills/sdd-init/scripts/check-scenarios.mjs specs/changes/021-terminal-colors/spec.md --tests tools/test`; use strict mode only once scenario tests exist and according to checker support.
- Help/manual: regenerate with `node tools/generate-man.mjs`, then owner checks `node tools/generate-man.mjs --check` for the D9-approved help note. Applicable content/trace/frozen-test checks stay required; they are not executed in Design.

## Risks and cross-layer
| Verified risk/boundary | Mitigation and required check | Tasks |
|---|---|---|
| Source safe-print boundary (`lib/common.sh:17`), updater display sites | Fixed SGR only after sanitization; RF-7 and injection integration assertions; independent security review | T1, T2, T3, T5 |
| POSIX entry/notice vs Bash command bodies (`bin/rigorkit:1`, `lib/notice.sh:1`) | Silent shell-portable helper, strict-shell contract checks, CLI and notice regressions | T1, T2, T3, T5 |
| Redirections/staged installer stdout (`lib/update.sh:306–308`) | Per-final-writer eligibility, split-channel and staging-log byte checks; no cached flag | T1, T2, T3, T5 |
| Whole-command wrapper would recolor scripts (`bin/rigorkit:47`) | Preserve `exec`; raw official/custom stdout/stderr assertions and script status regressions | T1, T3, T5 |
| Artifact writes intermixed with installer display (`install.sh:250,414–437,481–483`) | Enumerate display-only producers, preserve raw artifact producers and pasteable rules; compare snapshots/fingerprints | T1, T3, T5 |
| Update switches release mid-run (`lib/update.sh:160–161`) | Helper loaded from executing release; existing two-phase updater regression plus hostile staged-helper dry-run marker test | T1, T3, T5 |
| Agent notice writes share CLI producer (`lib/notice.sh:90–115`) | Style only `--run` display, never notice file or shell-start output; 010 notice/startup regressions | T1, T3, T5 |
| Terminal echo would inherit question color | Reset before `read`; byte assertion and live input check, no terminal-mode changes | T1, T2, T3, T5 |
| Exact-output evidence might normalize away regressions | Pre-change references; remove only known added SGR, never broad ANSI/whitespace stripping; preserve no-final-newline cases | T1, T5 |
| Help exception could expand into unrelated text rewrites | D9/answer 7 and clarification round 3 bound the exception; RF-4.E2 verifies exact old text plus one note; manual-source drift check afterward | T1, T4, T5 |
| Current branch is `feat/020-readme-and-scan-speed` and 020 is wip | Design writes docs only; choose/confirm implementation branch and base before red freeze, no stash or priority change | T1 |

No new persistence or network flow is introduced. Existing untrusted release/file data still crosses the same safe-print boundary; terminal controls remain emitted only by trusted presentation code. This is an output security boundary review, not a change to release execution authority.

## Test-preparation handoff — 2026-11-15
- Owner approved Design and B1 test preparation. Prepared paths, source-level coverage and pending execution are recorded in `test-preparation.md`.
- Branch now `feat/021-terminal-colors`, from updated origin/main; confirmed base is `a812f2eefce1765eca00f98e84fe2fa4e03aeec8` (separate owner-authorized 020 closure). No product implementation is authorized before red/freeze gates.
- Scenario-checker command corrected to its verified existing pack path; no tests/checkers executed.
