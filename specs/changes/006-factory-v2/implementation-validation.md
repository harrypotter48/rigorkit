# Implementation validation — 006-factory-v2
Date: 2026-10-29 · Verdict: source reviewed and baseline packaged; owner/CI release gates pending.

## Scope and decisions
Owner requested source implementation and completion for PR/production integration. Retain BOTH existing base reviewers and register sdd-slice without increasing token budgets, explicitly approved on 2026-10-29. Proportional reviewer removal is deferred. Selected MIT agency-agents practices are attributed in packs/sdd/agency-adaptations.md and NOTICE.md. Installation and real adopting-project execution remain separate scope.

## Executable evidence
| Check | Current result |
|---|---|
| Toolkit `node --test --test-reporter=dot tools/test/*.test.mjs` | PASS: 53 tests, including copied-script CLI/history/index/worktree/untracked fixtures; exit 0 |
| Website `node --test --test-reporter=dot test/source.test.mjs test/workflow.test.mjs` | PASS; exit 0 |
| Strict scenario checker, spec 006 against tools/test | PASS: 91 scenarios structurally checked and executable references found; manual rows are NOT executed |
| `node tools/check-branch-trace.mjs --base 46177ea` | PASS: 0 issues, current combined sources/index/untracked |
| Real documentation import to fresh temporary output | PASS: 60 documents, 6 packs; internal specs/tools excluded; generated source tree not edited |
| `git diff --check` | PASS |
| Active 006 content ratchet | PASS: all identities and limits; immutable baseline from b291c9b registers sdd-slice |
| Budget comparison against archived 005 | PASS: no pack budget increased; SDD tightens from 14,530 to 14,404 |

Earlier guard implementation had 12 expected assertion failures before green. During final independent review, four additional behavioral regressions failed before fixes: live symlink policy redirection, blank frozen-test glob, staged trace hidden by worktree restoration and ignored executable template interpolation. After corrections, all 22 targeted guard tests and the full toolkit suite passed. No real repo red/amend/green history was fabricated; fixture histories live only in temporary repositories.

## Source/review evidence
Conformance and architecture reviewers independently inspected original sources without peer reports. Their four introduced findings were corrected and re-reviewed once. Final correction verdicts: no unresolved introduced high/medium finding in the reviewed scope. Reviewers did not rerun tests or establish adopting-project/model behavior; executable results above were obtained by the calling agent.
Source contracts cover backlog ownership, owner design/technical/acceptance gates, selective context, decisions with sources, actual consumers/instances, bounded handoffs, immutable tests, command permissions and learnings. Root and copied project templates must remain equal.

## Tokens
Current SDD estimate: 14,404 versus historical pack budget 14,530 (126 lower; 0.87%). Other pack estimates unchanged. Static NFC-codepoint estimates, not measured runtime savings. Register a new baseline only from a real owner-authorized committed source; never modify the archived 005 evidence, forge a commit or enlarge a pack budget.

## Guarantees and limits
Frozen check pins policy at the approved red and rejects redirected live paths/blank patterns. It inspects intermediate history, staged/unstaged/untracked tests and rename/deletion. Amendment citation is lexical; reviewers still verify actual owner approval and spec amendment.
Trace checks JS/TS hunks in both index and worktree plus untracked source, including executable template interpolation. It remains lexical with possible false positives/negatives; RF/INV markers alone cannot prove semantic fulfillment.
The frozen checker was not declared green for this real branch: this implementation predates a pinned approved red/configuration. Its actual behavior is covered by isolated Git fixtures. Source inspection is not a retrospective frozen boundary or executed manual adoption.

## Unrun and remaining gates
- Baseline packaging complete: baseline.txt records full source commit b291c9b76115be9c2d5599179610d1c1b1cdd8c3; AGENTS.md points to the active 006 baseline. Archived 005 was not modified.
- No local full website build/typecheck, browser/Docker/e2e, installation, migrations, seeds, deployment, push or merge. Existing GitHub PR workflow must pass its checks before owner merge. Pages publishes on main, not an unconfigured production branch.
- Model instruction-following/manual scenarios and real adopting-project installation/acceptance remain unexecuted. Each adopting owner approves scope, decisions, paths/thresholds and each slice.
- Owner explicitly authorized both local delivery commits. Source commit b291c9b contains the reviewed implementation; the second packages this baseline and delivery state. Owner release acceptance/PR review/CI remain pending. See release-checklist.md.
