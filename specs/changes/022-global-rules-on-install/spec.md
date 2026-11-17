# Spec 022 — Global rules on install
> Status: approved · Tier: story · DoD: critical · Owner repo: rigorkit · Affected repos: none
> Origin: HU-16 — owner request, 2026-11-16: "pon una opcion k solo instale las reglas globales al ejecutar el curl, de esta forma ya queda todo lo global instalado si luego quieres mas cosa globales ya es deciciondel usuario".

## Context and goal
The global rules of `core` are the only content every project needs at the user level; skills and agents are chosen per project. Today the one-line installer installs no pack, and the rules arrive only through a global install of `core`, which also copies its skills. A new user therefore needs a second command and ends with `core` skills both globally and in each project. After this change the one-line installer offers to install only the global rules, and the same rules-only install is available later from the CLI. Any other global install stays an explicit user decision.

## Users / actors
- A new user running the one-line installer.
- An existing user running the one-line installer again.
- A user running `rigorkit install` who wants the rules without global skills.
- Coding tools that read the user's global instruction file: Claude Code, Codex and OpenCode.

## Definitions
- **Global rules**: the rules block of a pack, written between rigorkit markers in a tool's global instruction file (installer capability, RF-3 and "Rules placeholder").
- **Supported tool**: a tool with a global instruction file: Claude Code, Codex, OpenCode. Cursor has none and is not a supported tool here.
- **Detected tool**: a supported tool whose user configuration folder already exists as a directory when the installer runs: `~/.claude`, `$CODEX_HOME` or `~/.codex` when unset, `~/.config/opencode`.
- **Affirmative answer**: exactly `y` or `yes`, as in the update notice (installer capability RF-9). Anything else is a no.
- **Terminal available**: the installer's standard input and standard output are both terminals. A piped installer (`curl … | sh`) has none, even when the session has a terminal.
- **Rules block**: in this spec, the rigorkit rules block of `core`. A block of another pack is user content here.
- **Incomplete rules block**: a start marker of the rules block without its end marker.
- **Offered file**: the global instruction file of a detected tool that has neither a rules block nor an incomplete one.
- **Later command**: the rules-only global install of `core` (`--rules-only`), printed with the supported tools. It replaces the global `core` install the one-line installer suggests today.
- **Rules-only install**: an install that writes global rules and no skill or agent.

## User stories
- H1: As a new user, I want the one-line installer to leave the global rules installed so that one command finishes everything that is global.
- H2: As a user, I want to install the global rules without global skills so that skills live only in the projects that use them.
- H3: As a user, I want to decide before my instruction files change so that nothing is written there without my consent.

## Acceptance
On a machine with Claude Code configured and no rigorkit, the owner runs the one-line installer, sees which instruction file would change, answers yes, and finds the `core` rules block in the Claude Code global instruction file with a backup next to it and no rigorkit skill or agent in any global folder. Answering no, setting the opt-out or running without a terminal leaves every instruction file byte-identical and prints the command that installs the rules later. `rigorkit update` and `rigorkit doctor` then treat those rules as they treat the rules of a global `core` install.

## Invariants
- INV-1: The one-line installer changes no global instruction file without an affirmative answer given in the same run.
- INV-2: Content outside the rigorkit markers of an instruction file stays byte-identical.
- INV-3: The one-line installer never installs a skill or an agent and never writes inside a project.
- INV-4: A failure while installing rules never removes or invalidates the clone or the startup blocks already written.
- INV-5: Nothing from the downloaded release runs before its ref is checked out and validated, as today.

## Functional requirements (EARS)
### Offer during the one-line install (H1, H3)
- RF-1: WHEN the one-line installer has put a new clone in place and at least one offered file exists, THE SYSTEM SHALL name each offered file and ask once whether to install the global rules, also when a startup block or custom folder failed in the same run.
- RF-2: WHEN the answer to that question is affirmative, THE SYSTEM SHALL install the global rules of `core` in each offered file, keeping for each file that already existed a `<file>.rigorkit.bak` backup with the original mode.
- RF-3: IF the answer is not affirmative or no terminal is available, THEN THE SYSTEM SHALL leave every instruction file unchanged, print the later command and not count the missing consent as a failure.
- RF-4: IF `RIGORKIT_NO_RULES` has a non-empty value, THEN THE SYSTEM SHALL not ask, leave every instruction file unchanged and print the later command.
- RF-5: IF no tool is detected, THEN THE SYSTEM SHALL create no tool folder or instruction file and print the later command.
- RF-6: WHEN the one-line installer finds an existing clone and at least one offered file exists, THE SYSTEM SHALL make the same offer for the offered files only.
- RF-7: IF `RIGORKIT_REMOTE` or `RIGORKIT_REF` selected what a new installation downloaded, THEN THE SYSTEM SHALL name each selected source and ref in the question.
- RF-8: IF the rules cannot be installed in an instruction file THEN THE SYSTEM SHALL leave that file unchanged, report the file and the reason, continue with the remaining files and finish with a failure status.
- RF-13: IF tools are detected and the instruction file of each one already has a rules block, THEN THE SYSTEM SHALL not ask, leave every instruction file unchanged, say that the global rules are already installed and not print the later command.
- RF-14: IF more than one of the conditions of RF-12, RF-4, RF-5, RF-13 and RF-3 holds, THEN THE SYSTEM SHALL apply only the first one in that order.
- RF-15: IF neither RF-12 nor RF-4 applies and a detected tool's instruction file has an incomplete rules block, THEN THE SYSTEM SHALL report that file before any question, leave it unchanged, exclude it from the offer, say to fix the markers by hand and run the installer again, and finish with a failure status, also when no terminal is available; WHEN no offered file remains, THE SYSTEM SHALL not ask and not print the later command.

### Rules-only install from the CLI (H2)
- RF-9: WHERE the rules-only option is given with the global scope, THE SYSTEM SHALL install the global rules of the selected packs for the selected tools and copy no skill or agent.
- RF-10: IF the rules-only option is given with a project scope or with no scope, THEN THE SYSTEM SHALL refuse the command with a usage error and change nothing.
- RF-11: WHEN a rules-only install completes, THE SYSTEM SHALL make those rules subject to update refresh, doctor reporting and rules uninstall exactly as rules written by a global pack install.

### Source without rules (H1)
- RF-12: IF the installed release cannot perform a rules-only install, because it predates this change or ships no `core` rules, THEN THE SYSTEM SHALL not ask, leave every instruction file unchanged, print a notice that the rules are unavailable in that release and not count it as a failure.

## Non-functional requirements
- No new mandatory dependency for the one-line installer or the CLI.
- The one-line installer asks at most one question per run.
- A second run that changes nothing and finds no problem to report says so and exits successfully; a problem that persists (RF-1.E2, RF-15) is reported again with a failure status.

## Test scenarios
### RF-1
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-1.H1 | happy | no rigorkit; Claude Code folder exists; terminal | one-line install completes the clone | one question names the Claude Code global instruction file |
| RF-1.E1 | edge | folders of all three supported tools exist | install completes | a single question names the three files |
| RF-1.E2 | edge | a startup file is not writable; Claude Code detected | install completes the clone | the question is still asked; the run ends with a failure status |
| RF-1.E3 | edge | no rigorkit; the Claude Code file already has a rules block; the Codex file has none | install completes the clone | the question names only the Codex file; the Claude Code file is byte-identical |
| RF-1.F1 | failure | the clone step fails | install runs | no question is asked and no instruction file changes |
| RF-1.S1 | security | the detected tool's instruction file is a symbolic link | install completes | the question names the link's target, the file that would be written |

### RF-2
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-2.H1 | happy | Claude Code detected; its instruction file has user content | answer is yes | the file gains the `core` rules block between markers, user content is byte-identical and a backup exists |
| RF-2.E1 | edge | the tool folder exists but has no instruction file | answer is yes | the file is created with only the rules block and no backup is written |
| RF-2.E2 | edge | the instruction file exists and the user keeps their own `.bak` copy next to it | answer is yes | the user's `.bak` is byte-identical and the `.rigorkit.bak` has the original file's mode |
| RF-2.F | n/a — write failures are RF-8 | — | — | — |
| RF-2.S1 | security | answer is yes | install finishes | no global skill or agent folder gained a rigorkit entry and no project folder was written |

### RF-3
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-3.H1 | happy | a tool is detected; terminal | answer is `n` | instruction files are byte-identical; the later command is printed; exit status is success |
| RF-3.E1 | edge | a tool is detected; terminal | answer is empty or any other text | same as a no |
| RF-3.E2 | edge | the installer is piped (`curl … \| sh`) in a session that has a terminal | install completes | no question; files unchanged; the later command is printed; exit status is success |
| RF-3.F1 | failure | standard input is not a terminal | install completes | no question; files unchanged; the later command is printed; exit status is success |
| RF-3.E3 | edge | standard input is a terminal and standard output is redirected to a file | install completes | no question; files unchanged; the later command is printed; exit status is success |
| RF-3.F2 | failure | the question is shown | the user interrupts the run | instruction files are byte-identical, the clone and startup blocks remain usable, exit status is failure |
| RF-3.S1 | security | input is piped with the text `y` and no terminal is available | install completes | the piped text is not taken as consent; files unchanged |

### RF-4
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-4.H1 | happy | `RIGORKIT_NO_RULES=1`; a tool is detected; terminal | install completes | no question; files unchanged; the later command is printed |
| RF-4.E1 | edge | `RIGORKIT_NO_RULES` set but empty | install completes | the question is asked as if unset |
| RF-4.F | n/a — the opt-out performs no operation that can fail | — | — | — |
| RF-4.S1 | security | `RIGORKIT_NO_RULES=0` | install completes | treated as opt-out: no file is written |

### RF-5
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-5.H1 | happy | no supported tool folder exists | install completes | no question; the later command is printed; exit status is success |
| RF-5.E2 | edge | `CODEX_HOME` names an existing folder and `~/.codex` does not exist | install completes | the question names the instruction file under `CODEX_HOME` |
| RF-5.E3 | edge | `~/.claude` is a regular file | install completes | Claude Code is not detected and the file is unchanged |
| RF-5.E1 | edge | only a Cursor folder exists | install completes | same as no tool detected |
| RF-5.F | n/a — nothing is written | — | — | — |
| RF-5.S1 | security | no supported tool folder exists | install completes | no tool folder or instruction file was created |

### RF-6
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-6.H1 | happy | existing clone; Claude Code detected without a rules block | one-line install runs | the offer names that file; yes installs the block |
| RF-6.E1 | edge | existing clone; Claude Code already has the block; Codex has none | one-line install runs | the offer names only the Codex file; the Claude Code file is byte-identical |
| RF-6.F | n/a — an incomplete rules block is RF-15 and write failures are RF-8 | — | — | — |
| RF-6.S1 | security | existing clone; the Claude Code file has a block with older content; the Codex file has none | answer is yes | only the Codex file gains the block; the Claude Code file is byte-identical |

### RF-7
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-7.H1 | happy | `RIGORKIT_REMOTE` names another source | the question is shown | it names that source |
| RF-7.E1 | edge | `RIGORKIT_REMOTE` and `RIGORKIT_REF` unset | the question is shown | no source or ref is named |
| RF-7.E2 | edge | only `RIGORKIT_REF` names a branch | the question is shown | it names that ref |
| RF-7.E3 | edge | existing clone; `RIGORKIT_REMOTE` set and ignored with its warning (installer RF-2) | the question is shown | no source is named |
| RF-7.F | n/a — an invalid source is refused before any question (installer RF-1) | — | — | — |
| RF-7.S1 | security | the source name holds control characters | the question is shown | they are not sent to the terminal |

### RF-8
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-8.H | n/a — this requirement covers failures only | — | — | — |
| RF-8.E1 | edge | two detected tools; the first file is not writable | answer is yes | the first is reported and unchanged, the second gets the block, exit status is failure |
| RF-8.F1 | failure | the backup of a file cannot be written | answer is yes | that file is unchanged, the reason is reported, the clone and startup blocks remain usable |
| RF-8.S1 | security | the instruction file is a broken symbolic link | answer is yes | nothing is created at the link target and the file is reported |

### RF-9
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-9.H1 | happy | rigorkit installed; no global content | rules-only global install of `core` for Claude Code | the rules block is in its instruction file and no skill or agent was copied |
| RF-9.E1 | edge | a pack without rules is selected | rules-only global install | nothing is written, the output says the pack has no rules and exit status is success |
| RF-9.E2 | edge | rules-only with a dry run and the global scope | command runs | the change is shown and nothing is written |
| RF-9.F1 | failure | a selected tool has no global instruction file (Cursor) | rules-only global install | nothing is written for it, the block to paste is printed and exit status is success, as a global install does today |
| RF-9.S1 | security | `core` skills are already installed globally and edited | rules-only global install | those copies are byte-identical |

### RF-10
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-10.H | n/a — this requirement covers a refusal only | — | — | — |
| RF-10.E1 | edge | rules-only with no scope given | command runs | usage error; nothing is written in the current folder or in global files |
| RF-10.F1 | failure | rules-only with a project scope | command runs | usage error; the project and global files are unchanged |
| RF-10.S1 | security | rules-only with a project scope whose instruction file is shared | command runs | that shared file is unchanged |

### RF-11
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-11.H1 | happy | rules installed rules-only; a newer release changes the rules | `rigorkit update`, answer yes | the changed block is offered with its difference and replaced; no skill or agent is copied to a global folder |
| RF-11.E1 | edge | rules installed rules-only | `rigorkit doctor` | no skill or agent is reported missing and no issue is raised for the rules entry |
| RF-11.E2 | edge | rules installed rules-only | a global install of `core` for the same tool | the file holds one rules block and its `pair` is recorded |
| RF-11.F1 | failure | rules installed rules-only, then the block edited by hand | `rigorkit update` | it is offered as a changed block, never replaced silently |
| RF-11.S1 | security | rules installed rules-only | rules uninstall for that tool | only the block is removed; the rest of the file is byte-identical |

### RF-12
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-12.H | n/a — this requirement covers a skip only | — | — | — |
| RF-12.E1 | edge | existing clone older than this change; Claude Code detected without a rules block | one-line install runs | no question; the notice names `rigorkit update`; exit status is success |
| RF-12.F1 | failure | `RIGORKIT_REF` names a ref without `core` rules; Claude Code detected | new install completes | the clone and startup blocks are installed, no question is asked, the notice is printed and exit status is success |
| RF-12.S1 | security | the installed release cannot perform a rules-only install | install completes | no instruction file was created or changed |

### RF-13
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-13.H1 | happy | no rigorkit; Claude Code and Codex detected; both files already have a rules block | new install completes | no question; the output says the global rules are already installed; the later command is not printed; exit status is success |
| RF-13.E1 | edge | existing clone with its startup blocks; every detected tool already has the block | one-line install runs | no question; no file changes; exit status is success |
| RF-13.F | n/a — nothing is written or asked, so no operation can fail | — | — | — |
| RF-13.S1 | security | every detected tool has a block with older content than the release | one-line install runs | every file is byte-identical; refreshing stays with `rigorkit update` |

### RF-14
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-14.H | n/a — precedence exists only when conditions combine | — | — | — |
| RF-14.E1 | edge | `RIGORKIT_NO_RULES=1` and a release that cannot perform a rules-only install | install completes | only the unavailable notice is printed; the later command is not printed |
| RF-14.E2 | edge | no terminal available and every detected tool already has the block | install completes | the output says the rules are already installed; the later command is not printed |
| RF-14.F1 | failure | no tool is detected and the release cannot perform a rules-only install | install completes | only the unavailable notice is printed; exit status is success |
| RF-14.S1 | security | `RIGORKIT_NO_RULES=1` and no terminal available, with an offered file | install completes | no question; the file is byte-identical; the later command is printed once |

### RF-15
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-15.H | n/a — this requirement covers a damaged file only | — | — | — |
| RF-15.E1 | edge | the Claude Code file has an incomplete rules block; the Codex file is an offered file; terminal | install completes | the Claude Code file is reported before the question, the question names only the Codex file, exit status is failure |
| RF-15.F1 | failure | the only detected tool's file has an incomplete rules block; no terminal available | install completes | the file is reported with the fix-by-hand advice and is byte-identical; no question; the later command is not printed; exit status is failure |
| RF-15.F2 | failure | the only detected tool's file has an incomplete rules block; terminal | install completes | same as RF-15.F1: no question and no later command |
| RF-15.S1 | security | `RIGORKIT_NO_RULES=1`; a detected tool's file has an incomplete rules block | install completes | the file is not reported and is byte-identical; exit status is success |

## Out of scope
- Installing skills or agents, or any pack other than `core`, from the one-line installer.
- Project installs, and any change to how rules behave in a project scope.
- A global rules file for Cursor.
- Refreshing an existing rules block from the one-line installer; that stays with `rigorkit update`.
- Removing `core` skills already installed globally, or reporting them as duplicates.
- Changing the content of the rules.
- A flag that answers yes without a terminal.

## Completion criteria
- All scenarios tested and green; the scenario checker reports none missing.
- Manual demo of the acceptance flow in a temporary home, run by the owner.
- Critical DoD of the constitution: install into a temporary home, project and global dry-runs, marker byte-safety and the isolated update checks stay green.
- A threat model exists before the plan: the one-line installer newly writes agent instruction files and runs release content after checkout.
- `CHANGELOG.md` has its `Global rules:` section and the CLI output baseline reflects the new messages.
- README quick start, `help/`, the manual page and the `core` pack README describe the offer, the opt-out and the rules-only install in the same change.
- Owner accepts the slice after independent SDD, architecture and security review.

## Questions and answers
Answers 1–7 are the recommendations the owner accepted on 2026-11-16 ("Sí, con las tuyas").
1. Which tools get the rules? → Those detected by their existing configuration folder; no folder is created.
2. Ask or write directly? → One confirmation before writing, with a backup of each existing file.
3. How is it disabled? → An environment variable, `RIGORKIT_NO_RULES`.
4. Existing clone? → The rules are also offered when a detected tool has no rules block.
5. Also an option in `rigorkit install`? → Yes, a rules-only option for the global scope.
6. What is recorded? → The mechanism is a plan decision; the observable result is RF-11.
7. No tool installed? → Skip with a notice and the command for later.

Answers 8–16 are the recommendations for C1–C9 of clarification round 1, accepted by the owner on 2026-11-16 ("Sí, todas").
8. Piped installer with a terminal in the session? → A no; only the documented `sh -c "$(curl …)"` form asks.
9. Offer after a failed startup block or custom folder? → Yes; the run still ends with a failure status.
10. New installation over a file that already has a rules block? → Left untouched and unasked.
11. Rules-only with no scope? → Usage error.
12. Source without rules? → Skip with a notice and succeed; for an old clone the notice names `rigorkit update`.
13. `RIGORKIT_NO_RULES=0`? → Any non-empty value disables the offer.
14. Custom source or ref? → The question names it.
15. Option name? → `--rules-only`.
16. No terminal? → A no; the run still succeeds.

Answers 17–20 are the recommendations for D1–D4 of clarification round 2, accepted by the owner on 2026-11-16 ("Sí, todas").
17. Every detected tool already has the block? → No question and no later command; one line says the rules are already installed; success.
18. Several skip conditions together? → The first of: release without rules-only install, opt-out, no detected tool, every file has a block, no terminal.
19. Incomplete rules block? → Never reported with the opt-out; otherwise reported before any question with a failure status, also without a terminal.
20. Terminal available? → Standard input and standard output are both terminals.

Answer 21 is the recommendation for E1 of clarification round 3, accepted by the owner on 2026-11-17 ("Sí, omítelo").
21. Only damaged files, no offered file? → Report them with advice to fix the markers by hand and rerun, failure status, no question and no later command.

## Open questions
None. Accepted as low: some requirements join the outcome and its report in one sentence (clarification L1). The statement that nothing from the clone runs (`tools/install-remote.sh:7`) is settled in the threat model before the plan (L10).

## Delivery evidence
- Understand only: no production code, tests or command behavior changed; no command other than read-only inspection was run.
- Current process: no `.rigorkit/project.yaml`; legacy SDD under `specs/constitution.md`.
- Contracts this change modifies at archive: installer capability RF-1 ("installs no pack" and its closing suggestion), RF-2 (existing clone gets only startup blocks), RF-3 (install options), and possibly the Global record definition, RF-10 and RF-15 through RF-11 of this spec.
- Read-only context, not design decisions: the installer states it never runs anything from the clone (`tools/install-remote.sh:7`); tools with a global instruction file (`install.sh:285-292`); rules install only with the global scope (`install.sh:475-484`); only `core` ships rules (`packs/core/rules.md`).
- Prior knowledge reused: vault note "Un instalador remoto valida todo antes de ejecutar nada" (touch user files only after every other step passed).
- Branch `feat/022-global-rules-on-install` from `main` at 8fedd1e (021 merged).
- Proposed review profile: sdd-reviewer, architecture-reviewer, security-reviewer. None dispatched yet.
- Spec approved by the owner on 2026-11-17 after clarification round 4 (ready for plan, 0 high/medium): "Apruebo la spec". Threat model, plan, test preparation and implementation remain separate gates.
- Design stage 2026-11-17: `threat-model.md`, `plan.md` and `tasks.md` written and reviewed independently (sdd, architecture, security). Proposed amendment AMEND-1 of RF-11.E1 and RF-11.E2 (doctor reports no rules lines today) is pending the owner; the spec is otherwise unchanged.
- Owner approved the plan, tasks, AMEND-1 (RF-11.E1 and RF-11.E2 reworded: doctor reports no rules lines today, `lib/doctor.sh:55-67`) and leaving the non-atomic rules write and backup overwrite as a separate follow-up, 2026-11-17: "Sí, apruebo". Test preparation and implementation remain separate gates.
