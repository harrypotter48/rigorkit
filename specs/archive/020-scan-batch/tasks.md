# Tasks — 020-scan-batch (HU-14 One question for a scan)
## Resume state
Stage: archived · Approvals: scope owner 2026-11-14 ("incluyela"); owner acceptance/closure 2026-11-15 (confirmed merge and requested close commit).
Authorized blocks: B1 · Current block: B1 · Current task: done.
Review stations: sdd-reviewer.
References: spec.md; `lib/scan.sh` (016); `tools/test/016-scan.test.mjs` RF-3 (AMEND-1).
Freeze: `tools/test/020-scan-batch.test.mjs` (red 7c13c40); 016 RF-3 amended. Evidence: 020+016 25/25; full suite 586/588, 0 fail; dry run on ~/workspace 12 projects in 32 s (was 42 s). Review: not run (small change; owner asked to include it).

## Functional blocks
### B1 — two-phase scan (RF-1–RF-4)
- [x] T1. Tests 020 and 016 AMEND-1; red; commits. [test · rigorkit]
- [x] T2. Two phases, one question, progress, chosen tools only, help/README. [cli · rigorkit]

Trace real dependencies; reuse valid evidence. No time-box/internal-task stops. Decisions/blockers/restricted checks→owner; [x] needs evidence, every commit approval. Final full spec/plan/diff/integration review; owner accepts each slice.

## Closure — 2026-11-15
- Owner confirmed the previous branch was merged and explicitly requested its close commit on the new 021 branch.
- Local origin/main updated to merge 25668871ca6215e2bfc18628d158320bf3915836; its tree matches the prior feature HEAD.
- Validation above is recorded evidence from the previous session, not re-execution by this agent. Full suite: 586/588, zero failures; the remaining two results are not relabeled as passing. Independent review was not run, as recorded above.
- No tests, install/dry-run or live checks were rerun during closure.
- Follow-up 021 terminal colors remains separate and uncommitted by this close commit.
