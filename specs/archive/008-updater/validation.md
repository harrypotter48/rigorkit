# Validation — 008-updater (HU-1 Install rigorkit with one line)
Date: 2026-11-11 · Branch: feat/008-updater · Diff reviewed: `git diff 36c278b` (plan commit) to working tree.

## Automated evidence (macOS 27, /bin/sh = bash 3.2, zsh 5.9, BSD man; owner-authorized temp HOMEs)
| Check | Result |
|---|---|
| `node --test tools/test/*.test.mjs` | 218 tests: 216 pass, 0 fail, 2 todo (B1 copies of RF-26.E1/E2; green copies in `008-rigorkit-install.test.mjs`), 0 skipped |
| Scenario checker (`check-scenarios.mjs … --tests tools/test`) | 168 scenarios (151 executable, 17 n/a), none missing |
| `node tools/generate-man.mjs --check` | PASS (commands, install options, man page, `bin/` contents) |
| Content ratchet (`measure-content.mjs` vs 007 baseline) | 0 errors; `rules.md` 271 tokens committed, ≤ 300 rendered with a 100-character clone path (RF-29.S1) |
| Syntax | `sh -n`, `dash -n`, `bash --posix -n` on `tools/install-remote.sh`; `sh -n bin/rigorkit`; `bash -n install.sh` |

## Critical DoD (constitution critical paths)
1. Dry-runs project/global write nothing: RF-3.E1, RF-49.S1 (automated).
2. Real `--pack all --agent claude,codex,cursor,opencode`, global + project, vs Baseline 0.1.0 (`3ee339e`): same files except no `~/.local/share/rigorkit/scripts`; output differs only in the Cursor printed block, the scripts line and the project note (RF-3 exceptions). Manual run, recorded in tasks.md T12; project/sdd automated in RF-3.H1.
3. `--version`, `--list`, unknown agent/option: RF-3.E2/F1, RF-46.F1 (automated).
4. One-line installer: no byte outside markers, no second block, user `.bak` byte-equal: RF-42.S1/S2, RF-2.E1, RF-55.S1, RF-3.S1 (automated); smoke run in a scratch HOME with zsh and dash/bash (tasks.md T16).
5. Rules budget committed and rendered + ratchet: RF-29.S1, ratchet 0 errors.

## Independent reviews (same originals, no peer reports)
| Reviewer | Verdict | High / Medium / Low |
|---|---|---|
| sdd-reviewer | not complete → corrected | 0 / 1 / 7 |
| architecture | no introduced high | 0 / 3 / 6 |
| security | no introduced high/medium | 0 / 0 / 4 (2 pre-existing) |

One correction round (2026-11-11, within approved scope):
- SDD M: `rigorkit help <cmd> --help` and `help -h x` now show the `help` help (RF-26), checked by hand (exit 0).
- Arch M1 / Sec L2: backup temp file via `mktemp` next to the file (no predictable name, no planted link followed) in both scripts; both helpers marked as twins; `install.sh` link loop capped at 40.
- Arch M2: `rigorkit help <cmd>` uses `help/<cmd>.txt` as the only list (names restricted to `[a-z-]`).
- Arch M3: `LC_ALL=C` in `bin/rigorkit` no longer exported to `install.sh` or helper scripts.
- Arch L8 / SDD L: `install.sh` ROOT uses `pwd -P`, same as `bin/rigorkit`.
- SDD L: `rigorkit script` skips custom packs whose names RF-59 refuses.
- Sec L1: a remote part starting with `[-` is refused (bracketed SSH host).
- SDD L docs: constitution §7 names the user's own `.bak`; AGENTS.md intro; tasks/spec status lines.
After corrections: 216 pass, 0 fail, 2 todo; `--check` PASS.

## Not corrected (reported)
- Tests (frozen; need owner-approved `test(amend)`): remove the `todo` marks of RF-26.E1/E2 in `008-rigorkit-cli.test.mjs`; strengthen RF-42.H1 (`man rigorkit` through the block is only checked via `man -w`); add a test for `help <cmd> --help`.
- Pre-existing in `install.sh` (out of HU-1 scope): `--pack` values are not validated (`--pack ../../x`); new rules/skill files get the user's umask.
- Architecture lows accepted: checks hosted in `generate-man.mjs`; regex parsing of shell `case` arms; `$HOME/.rigorkit` repeated per script; pack-level script overrides not reported (RF-57 asks only for `custom/scripts`); HU-2 must reuse block replacement and newest-tag lookup.

## Pending (owner)
- Live demo on the owner's macOS: one-line install in a temporary HOME, new zsh and bash shells with `rigorkit help` and `man rigorkit`.
- Ubuntu CI run (GNU find, man-db; D4 skips zsh/man cases there).
- `site`: `npm run test:unit` (imports `rules.md` with `{{RIGORKIT}}`, README, constitution).
- Release tag `vX.Y.Z` containing `bin/rigorkit` before announcing the one line (answer 26); until then the installer answers "no release exists".

## Acceptance
Owner accepted HU-1 on 2026-11-12, after a live demo on macOS (one-line install from the local repo, `rigorkit help`, `man rigorkit`). Still pending at that date: Ubuntu CI run, `site` `npm run test:unit` result not reported, release tag.
