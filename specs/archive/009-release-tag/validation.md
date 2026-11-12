# Validation — 009-release-tag (HU-4 Release tag on merge)
Date: 2026-11-12 · Branch: feat/009-release-tag · Diff reviewed: `git diff main`.

## Automated evidence (macOS)
| Check | Result |
|---|---|
| `node --test tools/test/*.test.mjs` | 243 tests: 241 pass, 0 fail, 2 todo (008 B1 copies) |
| `tools/test/009-release-tag.test.mjs` | 25/25 |
| Scenario checker | 34 scenarios, none missing; manual: RF-2.E1, RF-2.F1, RF-7.E1, RF-7.F1 |
| `pages.yml`, `site/` | unchanged vs `main`; `site` `npm run test:unit` 15/15 |
| Workflow YAML | parses (site `yaml`), one job `tag`, trigger push on `main` |

## Independent reviews
| Reviewer | High / Medium / Low |
|---|---|
| sdd-reviewer | 0 / 0 / 4 |
| architecture | 0 / 0 / 4 |
| security | 0 / 2 / 3 |

Corrections applied (2026-11-12): push credential moved from argv to `GIT_CONFIG_COUNT/KEY/VALUE` env, base64 header masked (`::add-mask::`) and redacted (Sec L3, SDD L1); version compare with `BigInt` (Sec L4); README blank line before "Releases" (SDD L3). After corrections: 241 pass, 0 fail.

## Security medium findings — resolved (answer 9)
- M1/M2 (write token reachable by actions and test code in one job): owner chose to split the workflow. Spec amended (clarify rounds 4–5 ready), `test(amend)` of the static checks, workflow `6eb7d4b`: read-only `test` job with SHA-pinned actions; `tag` job `needs: test`, no actions, anonymous fetch of `$GITHUB_SHA`, token only in the push step.
- Focused security re-review: M1 and M2 closed; lows: unpinned preinstalled node/git on the runner (accepted, image already trusted); raw token no longer inherited by git children (fixed).
- After corrections: 242 pass, 0 fail, 2 todo.

## Accepted / noted
- Arch L1: the newest-tag rule exists in `release-tag.mjs` (JS) and `install-remote.sh` (sh); the shell accepts leading zeros. HU-2 should reuse the shell copy and align it.
- Arch L2 / Sec L5: back-to-back bumps can skip a pending run (answer 7).
- SDD L2: some assertions are weaker than the scenario text (RF-1.S1 position checks, RF-3.F1 empty-file message, RF-6.E1/F1 message).

## Pending (owner)
- GitHub: tag ruleset on `v*` restricting updates and deletions (answer 10; no bypass possible for Actions in a personal repo) and `main` PR-only, before merge. Residual: push access can create new `v*` tags.
- Live: after merge, `v0.2.0` published by the workflow; the one-line installer installs it (resolves HW-01); manual rows RF-2.E1/F1, RF-7.E1/F1.

## Live evidence and acceptance
2026-11-12: after merging PR #7, the `Release tag` workflow published the annotated tag `v0.2.0` (object `08adb7d`, commit `09a6878`). The one-line installer from `main` installed `v0.2.0` in a scratch HOME: `rigorkit install --version` → `0.2.0`, `man -w rigorkit` resolves. Owner accepted HU-4 the same day ("todo verde … listo"). Manual rows RF-2.E1/F1 and RF-7.E1/F1 not exercised separately.
