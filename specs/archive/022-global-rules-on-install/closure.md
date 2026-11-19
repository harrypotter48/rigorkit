# Closure — 022-global-rules-on-install
> Date: 2026-11-18 · Owner accepted 2026-11-17 after a live demo · Merged to main (PR 21), released as v0.7.0.

## Outcome
The one-line installer offers once, on a terminal, to install only the global rules of `core` for the detected tools, and `rigorkit install --global --rules-only` does the same from the CLI; `rigorkit update` keeps those entries current. HU-16 is done. Current behavior lives in installer capability RF-1, RF-2, RF-3, RF-6, RF-10 and the Global record definition.

## Validation
- Full suite before merge on 416470c: 694 tests, 692 pass, 0 fail, 2 pre-existing todo; after 7ec0063 and AMEND-5, scoped runs green (022-one-line-rules 58/58). Scenario checker 74, branch trace, man check: PASS. GitHub CI green on the merged branch after reruns of two unrelated intermittent tests.
- Owner live demo in a temporary home (question, `y`, block, `.rigorkit.bak`, no skills or agents) on 2026-11-17; agent re-ran it the same day with a pseudo-terminal.
- Independent SDD, architecture and security reviews: no high findings. Approver decision "needs human", closed by the owner's acceptance; exceptions accepted: exact frozen comparison, B1/B3 reds accepted on report, weak report assertions listed in validation.md.
- Amendments: AMEND-1 (spec), AMEND-2..5 (tests), see freeze.md.

## Deferred
No change-specific rows in the local deferred file. Follow-up HU-17 / 023-atomic-rules-write: atomic rules write, backup that survives a rerun, record on failure, update write-path checks (threat-model §5, plan R6/R8/R11). Intermittent tests `010-check` RF-6.H1 and `012-git-scripts` RF-2.E2 are unrelated and unfixed.

## Follow-ups and learning proposal
- Learning proposals are listed in the archive commit proposal; none written without owner approval. No half-wired entry changed.

## Locations
Archived at `specs/archive/022-global-rules-on-install/`; earlier text and test comments naming `specs/changes/022-…` mean this folder.
