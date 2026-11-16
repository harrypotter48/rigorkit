# Spec 020 — One question for a scan
> Status: approved · Tier: story · DoD: normal · Owner repo: rigorkit · Affected repos: none
> Origin: HU-14 — the owner's first `rigorkit scan --save ~/workspace` waited four hours at the first per-project question, which looked like a hang; with 12 projects it also asks twelve times and fingerprints copies for tools nobody chose.

## Context and goal
016 asks the tools question once per project while it walks the folders, so the first question appears after the first project and nothing says the run is waiting. This change splits the scan in two phases: find every new project (fast), print them numbered with their suggested tools, ask one question (`y` all with the suggested tools, `e` choose each, `n` none), then register with progress lines. Copies are fingerprinted only for the chosen tools.

## Invariants
- INV-1: 016 invariants hold (writes only new records and, with `--save`, `scan_paths`; no git in projects; safe printing).
- INV-2: Without a terminal and without `--tools`, nothing is registered and every new project is listed as skipped (016 RF-3.F1).

## Functional requirements (EARS)
- RF-1: WHEN new projects are found, THE SYSTEM SHALL first print `found <N> new projects:` and one numbered line per project `<i>. <path> (<version>) -> <suggested tools|none>`, before any question or fingerprint.
- RF-2: WHEN a terminal is attached and `--tools` is absent, THE SYSTEM SHALL ask once `Register them with the suggested tools? [y = all / e = choose each / n = none]`; `y` registers every project that has suggested tools (others are skipped), `e` asks the 016 per-project question, anything else registers none.
- RF-3: WHILE registering, THE SYSTEM SHALL print `[<i>/<N>] <path>` before each project.
- RF-4: THE SYSTEM SHALL fingerprint a copy only when one of its tools was chosen (a `.agents/skills` copy only for codex, cursor or opencode).

## Test scenarios
Tests in `tools/test/020-scan-batch.test.mjs` (same fixture as 016).
### RF-1
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-1.H1 | happy | two new projects | `scan --dry-run --tools claude` | `found 2 new projects:` and two numbered lines with `-> claude` before any `would register` |
| RF-1.E | n/a — single listing | | | |
| RF-1.F | n/a — no project prints no list (016 summary) | | | |
| RF-1.S | n/a — printed through print_safe (016) | | | |
### RF-2
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-2.H1 | happy | terminal, two projects with `.claude` | `scan`, answer `y` | both registered, one question only |
| RF-2.E1 | edge | terminal, two projects | `scan`, `e`, then Enter and `-` | first registered, second skipped |
| RF-2.F1 | failure | terminal, two projects | `scan`, answer `n` | none registered, both listed as skipped |
| RF-2.S | n/a — answers are fixed letters; tools validated as in 016 | | | |
### RF-3
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-3.H1 | happy | two projects | `scan --tools claude` | `[1/2]` and `[2/2]` lines |
| RF-3.E | n/a — single format | | | |
| RF-3.F | n/a — skipped projects get no progress line | | | |
| RF-3.S | n/a — no input | | | |
### RF-4
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-4.H1 | happy | project with `.claude/skills` and a stamped `.agents/skills` copy that no pack ships | `scan --tools claude` | no `not shipped` line for the `.agents` copy (it was never inspected) |
| RF-4.E | n/a — single rule | | | |
| RF-4.F | n/a — no failure path | | | |
| RF-4.S | n/a — no input | | | |

## Out of scope
- Faster fingerprint hashing itself.

## Completion criteria
- Scenarios green; 016 terminal scenarios amended to the new question; full suite; help/README (principle 9).

## Questions and answers
1. One question with all/each/none; `e` keeps the 016 per-project question (answer 19). Owner, 2026-11-14 ("incluyela").
2. 016 RF-3.H1/E1 pty steps move to the new question (AMEND-1 below).

## Amendments
- AMEND-1 (owner, 2026-11-14): `tools/test/016-scan.test.mjs` RF-3.H1 answers `y` to the single question; RF-3.E1 answers `e` then `-`.

## Open questions
None.
