# Spec 021 — Terminal colors
> Status: approved · Tier: story · DoD: critical · Owner repo: rigorkit · Affected repos: none
> Origin: HU-15 — personal backlog BP-10; owner-approved terminal preview and five answers, 2026-11-14.

## Context and goal
Long CLI updates mix questions, paths and diffs without visual separation. Add semantic colors to Rigorkit's own terminal output while preserving the current text and keeping redirected output and agent captures free of added styling. A pseudoterminal alone cannot distinguish an agent from a human: agents using one must set `NO_COLOR=1`.

## Users / actors
- People running the Rigorkit CLI in a terminal.
- Agents, pipelines and file consumers receiving CLI output.
- Official and custom scripts invoked through `rigorkit script`, which own their output.

## User stories
- H1: As a terminal user, I want questions, changes and outcomes to stand out so I can follow long runs.
- H2: As an output consumer, I want the existing plain text so styling does not pollute captures or alter scripts.

## Acceptance
The owner's update example retains its exact text, paths, spacing and line order, with added lines green, removed lines red, diff headings cyan and pending questions yellow. Standalone path listings remain uncolored. Typed answers use the terminal's default input color. Redirecting either output channel removes added styling only from that channel. The same rules apply across the CLI's own output, including install, update, scan, doctor, help and dispatch diagnostics. Script output remains owned by the invoked script.

## Invariants
- INV-1: Removing only the styling introduced by this change yields the exact pre-change output bytes for the same inputs and environment, except for the single appended help note approved in answer 7; all pre-existing help text stays byte-equal.
- INV-2: Color does not change command outcomes, exit codes, prompts, input handling, writes, update approvals or dry-run behavior.
- INV-3: Existing control-character sanitization remains effective; external content cannot supply additional terminal controls through the new styling feature.
- INV-4: Colors never become part of installed content, records, fingerprints, diffs being compared, or agent notice files.

## Functional requirements (EARS)
### Channel eligibility (H2)
- RF-1: WHEN Rigorkit emits its own CLI output, THE SYSTEM SHALL determine color eligibility independently for each destination channel using that channel's terminal attachment.
- RF-2: IF `NO_COLOR` has a non-empty value or `TERM` is `dumb`, THEN THE SYSTEM SHALL emit no styling added by this change on either output channel.

### Semantic presentation (H1)
- RF-3: WHILE a destination channel is color-eligible, THE SYSTEM SHALL apply the palette in the following table to Rigorkit's own output according to its meaning.

| Meaning | Color |
|---|---|
| Added diff content; success messages | Green |
| Removed diff content; error messages | Red |
| Questions, including choice markers; warnings | Yellow |
| Headings, including project update headings and diff hunk headings | Cyan |
| Standalone paths, unchanged diff context, ordinary text | Terminal default |

Question text may include a path in yellow; a project heading may include a path in cyan. Path listings remain neutral. Classification is based on the output's role, not on words or punctuation found inside arbitrary names or content. Progress text stays ordinary unless it is already a heading or an outcome. A negative answer is not itself an error.

### Compatibility and isolation (H1, H2)
- RF-4: WHEN CLI output is emitted, THE SYSTEM SHALL preserve its exact existing text and formatting apart from eligible styling and the single appended help note approved in answer 7.
- RF-5: WHEN Rigorkit finishes a styled span, THE SYSTEM SHALL restore terminal-default styling before subsequent unstyled content or user input.
- RF-6: WHEN `rigorkit script` invokes a script, THE SYSTEM SHALL preserve that script's own output without adding, removing or rewriting styling.
- RF-7: WHEN externally sourced text is displayed, THE SYSTEM SHALL retain the existing protection against control characters independently of color eligibility.

## Non-functional requirements
- No new mandatory runtime dependency for the CLI.
- Eligibility and palette apply consistently across Rigorkit's own stdout and stderr output.
- Color eligibility never depends on stdin being a terminal; existing interactive prompt rules remain unchanged.

## Test scenarios
### RF-1
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-1.H1 | happy | both output channels terminal-attached, no opt-out | CLI emits eligible messages on both | each channel receives its semantic colors |
| RF-1.E1 | edge | stdout redirected, stderr terminal-attached | CLI emits to both | stdout contains no added styling; stderr is styled |
| RF-1.E2 | edge | stdout terminal-attached, stderr redirected | CLI emits to both | stdout is styled; stderr contains no added styling |
| RF-1.E3 | edge | stdout terminal-attached, stdin redirected | a non-prompt message is emitted | stdout remains color-eligible; prompt behavior is unchanged |
| RF-1.F1 | failure | both channels captured in pipes or files | a command reports failure | neither channel contains added styling; existing error text and exit code remain |
| RF-1.S1 | security | agent capture has no terminal | command emits output | no added terminal controls reach the capture |

### RF-2
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-2.H1 | happy | both channels terminal-attached, `NO_COLOR=1` | CLI emits normally styled messages | neither channel contains added styling |
| RF-2.E1 | edge | terminal-attached output, `NO_COLOR` is another non-empty value, including `0` | CLI emits output | no styling is added |
| RF-2.E2 | edge | terminal-attached output, `NO_COLOR` unset or empty, `TERM` not `dumb` | CLI emits a semantic message | terminal eligibility permits color |
| RF-2.F1 | failure | terminal-attached output, `TERM=dumb`, `NO_COLOR` absent | CLI reports an error | existing error is plain; its exit code is preserved |
| RF-2.S1 | security | agent uses a pseudoterminal and sets `NO_COLOR=1` | CLI emits output | no added styling reaches the agent |

### RF-3
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-3.H1 | happy | color-eligible output containing each palette category | each category is emitted | its assigned color or default styling is used |
| RF-3.E1 | edge | diff contains additions, removals, hunk headings and context, with existing indentation | diff is displayed | additions green, removals red, hunk headings cyan, context default; indentation retained |
| RF-3.E2 | edge | all documented CLI command families, help and invalid-command dispatch | each emits its own output | the same semantic palette applies throughout |
| RF-3.E3 | edge [manual] | owner's supplied update example | colored output is inspected live | paths stay neutral outside questions/headings; questions and diffs match the approved palette |
| RF-3.F1 | failure | color-eligible output | CLI reports an actual error and a warning | error red, warning yellow; an ordinary declined question is not classified as an error |
| RF-3.S1 | security | a path or unchanged content contains `+`, `-`, `warning` or `error` | it is printed as an ordinary path or context | its contents do not forge a semantic output category |

### RF-4
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-4.H1 | happy | fixed representative outputs and pre-change byte references | equivalent CLI flows run without color | exact bytes match, including spaces, newlines and prompt punctuation; help differs only by the approved appended note |
| RF-4.E1 | edge | the same outputs in color mode | only styling introduced by this change is removed | remaining bytes match pre-change references exactly, with only the approved help-note addition permitted |
| RF-4.E2 | edge | root help has its pre-existing text and the single approved note | help is displayed plain and colored | the old text is byte-equal after removal of only added SGR; one appended note explains terminal colors, NO_COLOR and TERM=dumb; no other help text changes |
| RF-4.F1 | failure | declined overwrite, failed command or dry run | the flow runs with color enabled and disabled | output text, exit codes, prompt decisions and side effects match existing behavior |
| RF-4.S1 | security | installed content, records, fingerprints and agent notice files | commands execute in color mode | none acquires styling bytes from this change |

### RF-5
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-5.H1 | happy | a colored question awaits input | Rigorkit finishes printing the question | default styling is restored before input echo |
| RF-5.E1 | edge | colored span followed by a neutral path or context on the same channel | output continues | color does not bleed into neutral content |
| RF-5.E2 | edge [manual] | live terminal question | owner types an answer | answer uses terminal-default input color |
| RF-5.F1 | failure | final output is a colored error | command exits | terminal-default styling has been restored |
| RF-5.S | n/a — restoration controls presentation only; untrusted controls are covered by RF-7 | | | |

### RF-6
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-6.H1 | happy | invoked official or custom script emits plain stdout and stderr | `rigorkit script` runs it | the script's bytes pass through unchanged |
| RF-6.E1 | edge | script deliberately emits its own colors, including with `NO_COLOR=1` | script runs | Rigorkit does not strip, add or override its styling |
| RF-6.F1 | failure | script emits a diagnostic and fails | script runs | its diagnostic bytes and exit status are preserved |
| RF-6.S1 | security | custom script emits text resembling Rigorkit questions or diffs | script runs | Rigorkit does not reinterpret or recolor its content |

### RF-7
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-7.H1 | happy | ordinary externally sourced text currently sanitized by Rigorkit | it is displayed in terminal and plain modes | sanitization matches existing behavior in both |
| RF-7.E1 | edge | sanitized content contains permitted tabs, newlines or non-ASCII text | it is displayed with color on and off | existing treatment is unchanged |
| RF-7.F1 | failure | a release diff, changelog or name includes forbidden control characters | existing safe-printing paths display it | controls remain replaced according to existing rules |
| RF-7.S1 | security | external text embeds terminal escape sequences, including forged colors and hyperlinks | displayed through existing safe-printing paths | external controls remain neutralized; only Rigorkit's own eligible styling is introduced |

## Out of scope
- Changing any existing wording, layout, icons, symbols, prompt choices or input echo behavior, except appending the single help note approved in answer 7.
- Recoloring or enforcing environment conventions inside invoked official/custom scripts.
- Automatic agent detection beyond the agreed channel and environment rules.
- Forced-color flags, configurable palettes or persistent color settings.
- Standalone bootstrap installation outside the Rigorkit CLI, manual-page viewer styling, or adding styling to generated artifact contents.
- Changes to scan registration, update approval policy, project cleanup, performance or batch answers.

## Completion criteria
- Applicable scenarios have current evidence; manual scenarios are checked live in a terminal.
- Plain-output byte comparisons cover representative success, prompt, error, help, diff and progress output across the CLI; the sole permitted text difference is the exact appended help note from answer 7, checked separately.
- Independent stdout/stderr redirection and pseudoterminal opt-out checks pass.
- Critical-path regressions required by the constitution remain green, including project/global install dry-runs and isolated update refusal, consent, dry-run and startup checks.
- Public README/help and affected pack documentation are updated with the behavior and agent pseudoterminal opt-out.
- Required scoped validation is run by the owner; no unrun check is counted as passing.
- Owner accepts this slice after independent SDD, architecture and applicable security review.

## Questions and answers
Owner decisions, 2026-11-14:
1. All CLI or update/scan only? → All of the CLI's own output; invoked scripts keep their own output.
2. Eligibility and agents? → Terminal destinations only; respect `NO_COLOR` and `TERM=dumb`; agents using a pseudoterminal set `NO_COLOR=1`.
3. Channels independently? → Yes; a redirected channel is plain even if the other remains a terminal.
4. Text compatibility? → Preserve exact existing text; add colors only where eligible.
5. Palette and typed answers? → Green additions/success, red removals/errors, yellow questions/warnings, cyan headings, default paths/ordinary text; answers retain terminal-default input color.
6. Empty `NO_COLOR`? → Disable styling only when its value is non-empty, for example `NO_COLOR=1`; an unset or empty value does not disable color by itself. Owner, 2026-11-14.

7. Exact output versus help documentation? → Append one note about NO_COLOR and TERM=dumb to the root CLI help as the sole documentary exception; preserve all pre-existing help text and every other operational message. Owner, 2026-11-15: "Sí, añadir la nota a la ayuda".

## Open questions
- None. Non-empty `NO_COLOR` semantics and the single help-note exception are confirmed by the owner.

## Delivery evidence
- Spec approved by the owner on 2026-11-14: "si dale, apruebo la spec 021, pasemos a Design". Design approval, test preparation and implementation remain separate gates.
- Understand approved; Design documentation prepared. The owner approved the answer-7 help exception on 2026-11-15; clarification round 3 re-audits the amendment. No production code, tests or command behavior changed.
- Current process: no `.rigorkit/project.yaml`; legacy SDD under `specs/constitution.md`.
- Readonly context: CLI dispatch and script delegation (`bin/rigorkit:47,64,68`); safe printing (`lib/common.sh:17`); update prompt/diff output (`lib/update.sh:22,33,43,48,207,386,407`); scan output (`lib/scan.sh:16,135,144,226`); installer output/diffs (`install.sh:29,321`); doctor output (`lib/doctor.sh:17`); notice warning (`lib/notice.sh:61`). These are context references, not implementation decisions.
- Existing user content and release control-character protections: installer capability RF-10 and change 020 INV-1.
- Repo was clean on branch `feat/020-readme-and-scan-speed` before documentation preparation; 020 remains the roadmap's existing wip entry. No branch, priority or acceptance state is changed for it.
- Planned review profile: independent SDD and architecture review; security review for safe-printing/terminal-control boundaries. Reviewers have not been dispatched.
- Checks, live terminal demonstration, test references and frozen-test boundary: pending; owner runs commands. No tests were run in Understand.

## Design approval and test preparation — 2026-11-15
- Owner approved Design and starting B1 tests: "si dale, apruebo Design, comencemos con los tests de B1".
- Test sources prepared; commands, observed red, test commit and frozen-boundary approval are pending. No production code changed. Current branch/base and prepared paths are recorded in `test-preparation.md`.

## Amendments
- AMEND-1 (owner-approved 2026-11-16): add only two RF-reference comments to the frozen shared test fixture in a separate cited test(amend) commit. No RF, invariant, scenario, assertion, executable code or accepted product behavior changes. Commit: 77fe85573bb795cf8f2a63da0572acd5da1d339c; exact scope in amendment-proposal.md and freeze.md.

## Owner acceptance — 2026-11-16
- B1 accepted and test(green) explicitly authorized by the owner. Scope/RFs/invariants/scenarios are unchanged; current evidence and independent delivery recommendation are in validation.md and approval.md.
