# Validation — 003-functional-blocks
> Status: pending user checks/live evidence · Updated: 2026-10-25

## Source review
- Read-only `git diff --check`: no whitespace errors in tracked source changes.
- Reviewed paired gates in governing rules, public docs, spec/clarify/change/plan/tasks; removed intermediate-stop contradictions in spec/plan footers.
- Reviewed block implementation/review boundaries, preserved user-run red/green checks and explicit commit approvals.
- Reviewed selective startup in triage/context/spec/plan/tasks/tests/implementation/resume/review; full final spec/plan/diff and critical DoD remain.
- Init/project template edits share the same source text; installed copies and existing project artifacts were not changed.
- Public README/catalog summaries, landing copy and maintenance instructions reflect paired gates/blocks/selective context. Existing `prebuild` regenerates docs; Pages deployment remains gated to a successful main push. No workflow changes were needed.
- No runtime logic, installer, global rules, model tiers or other projects changed. No tests, installation, estimator or live sessions executed by the agent. No independent reviewer run claimed.

## User-run content checks
From the rigorkit repository root:
```sh
node --test tools/test/*.test.mjs
node tools/measure-content.mjs --root . --baseline specs/archive/001-english-and-compact/baseline.txt
node packs/sdd/skills/sdd-init/scripts/check-scenarios.mjs specs/changes/003-functional-blocks/spec.md --strict
```
Expected: tests pass; estimator preserves identity/description/global-rule limits and existing per-pack reduction thresholds; scenario structure has no gaps. Manual markers do not establish execution or acceptance. If estimator fails, do not change the baseline or relax thresholds; compact the affected guidance before delivery validation.
The checker is invoked from the pack because this repository has no `specs/scripts/` copy. No copying/installing is required for these checks.

## User-run website checks
```sh
npm --prefix site run check
npm --prefix site run test:unit
npm --prefix site run test:browser
npm --prefix site run check:site
```
The browser suite builds production/fixture sites and restores the normal production output. Pending: open the local preview, inspect landing copy/catalog, follow the block/context links and search for functional blocks. After the user publishes main, verify the Pages Actions result and public home/nested docs/search. Local source review does not prove a successful publication.

## Live instruction-following checks
| Scenarios | Required evidence | Result |
|---|---|---|
| RF-1.H1/E1/F1/S1 | Interview→clarify→spec approval; grounded fixes, re-audit and unresolved/security decisions | Pending |
| RF-2.H1/E1/F1/S1 | Joint plan/tasks gate; legacy IDs and stricter rules preserved; behavior change returns to spec | Pending |
| RF-3.H1/E1/F1/S1 | Multi-task block without per-task prompts; combined review; no unapproved next block/commit; checks/critical DoD retained | Pending |
| RF-4.H1/E1/F1/S1 | Unchanged refs reused, working-tree/context drift revalidated, missing dependencies expanded, global review retained | Pending |

## Token economy
Static payload and session cost are different measurements. Instructions gained block/context controls; a lower static payload is not asserted. Record estimator output, then compare actual tokens/time/repeated reads/review rounds and defects on comparable changes. No percentage savings claimed.

## Activation and verdict
User reinstalls the SDD pack through the existing installer workflow when ready; installed skill copies and project-local templates/rules remain unchanged until explicitly updated. Existing stricter project rules still win.
Verdict: missing — user content/estimator results and live evidence. B1 implemented, not verified/closed. User requested branch/PR delivery; branch `feat/sdd-functional-blocks` is based on refreshed `origin/main` (9a62f1a). No merge authorization.
