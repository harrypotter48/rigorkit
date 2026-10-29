# Validation — 004-factory-lanes

Status: COMPLETE / ARCHIVED by explicit user acceptance; the live station scenarios remain pending. Updated: 2026-10-26.

## Evidence

- E1 — On 2026-10-26 the user ran the website checks (`npm --prefix site run check`, `test:unit`, `test:browser`, `check:site`) and `node --test tools/test/*.test.mjs` and reported every test passing and the generated site correct.
- E2 — Installer verification in disposable scopes: `--version` prints 0.1.0; `--list` shows the local version next to the installed ones; project and global dry-runs; a real installation in a temporary folder (project scope and a temporary home) wrote the marker `.rigorkit-version` with 0.1.0; an installed version of 0.0.9 was reported as different and the installed copy was preserved without `--force` and replaced with it; an invalid `VERSION` file exits 1 with `error: invalid VERSION file`.
- E3 — Content check: the scenario checker accepted the 96 scenarios of RF-1 to RF-24; the fixture measurement reports 0 errors; the prefix and role violations fire on a negative copy of the fixture; the pack catalog still resolves the six packs after the documentation rewrite.
- E4 — Measured content history of the `sdd` pack: 16457 tokens at `edad002`, 11507 at `b828b4a` (30.08%, twelve tokens of headroom), 13338 at `339fa69` (already red on main before this change) and 14530 at `23d193a` (11.71%). The historical target no longer measured the compaction it was written for, so change 005 replaced it with a content ratchet.
- E5 — The change was implemented in two commits, `88fd948` (RF-1 to RF-16) and `23d193a` (RF-17 to RF-24), plus the amended spec, plan and tasks.
- E6 — No live agent run has exercised the review stations. The parallel reviewer launch, the approver decision, the builder with a fresh context and the advisory interface rule are instruction contracts that only a real change can confirm.

## Scenario evidence

The 96 scenarios are defined in this change's spec.md and follow the `RF-n.Xk` identifiers. Executable coverage exists for the naming and role checks (content measurement fixtures) and for the installer behaviour of the version. The remaining scenarios are manual instruction-following validation and stay pending until a real change goes through the factory; the capability Factory lanes and review stations carries the contract-to-scenario mapping and its current result.

## Accepted verification exceptions

On 2026-10-26 the owner explicitly accepted archiving the change with the live station scenarios pending and asked to close it to start a new division of work. Independent review was not performed, and no live agent behaviour was observed. No push, merge or external migration is authorized, and no vault write is part of this archive.

Verdict: completed and archived by explicit user acceptance, with the live review-station scenarios pending and no claim of a green live run.
