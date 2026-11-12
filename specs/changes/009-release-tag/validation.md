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

## Open — owner decision (security medium)
- M1: in the write job, `actions/checkout` and `actions/setup-node` receive `github.token` by default (write) and are pinned by major tag `@v6`, not SHA.
- M2: toolkit tests run in the same job before the push step; code on `main` could influence the next step (`$GITHUB_ENV`, `$GITHUB_PATH`, workspace edits) and reach the token.
Both need a spec amendment (RF-5.H1 "same job", NFR credentials) and a `test(amend)` (RF-5.H1 one-job check, C6 `@v6`) if changed.

## Accepted / noted
- Arch L1: the newest-tag rule exists in `release-tag.mjs` (JS) and `install-remote.sh` (sh); the shell accepts leading zeros. HU-2 should reuse the shell copy and align it.
- Arch L2 / Sec L5: back-to-back bumps can skip a pending run (answer 7).
- SDD L2: some assertions are weaker than the scenario text (RF-1.S1 position checks, RF-3.F1 empty-file message, RF-6.E1/F1 message).

## Pending (owner)
- GitHub: tag ruleset on `v*` (only GitHub Actions) and `main` PR-only, before merge.
- Live: after merge, `v0.2.0` published by the workflow; the one-line installer installs it (resolves HW-01); manual rows RF-2.E1/F1, RF-7.E1/F1.
