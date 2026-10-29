# Technical plan — 006-factory-v2
Date: 2026-10-29 · Source implementation; owner release acceptance pending.

## Approved decisions
- Smallest useful vertical slices; HU/tickets describe outcomes and tasks stay inside each slice. No speculative behavior/defaults.
- Owner gates: spec/clarify, plan/tasks and each slice acceptance. Every new technical decision needs approval; reused repo/vault decisions report source and applicability. Repo wins.
- Existing conformance and architecture reviewers remain. Owner explicitly confirmed this and the unchanged token budget on 2026-10-29. Proportional removal of reviewers is deferred.
- Scoped existing unit/integration only; other commands/infrastructure retain explicit-request gates. Every real commit needs approval; never infer push/merge.

## Modules and ownership
| Module | Contract |
|---|---|
| sdd-slice + backlog template | Propose useful HU entries; owner chooses order/selection; at most one next and wip |
| triage / spec / clarify | Triage writes Change cell; spec records origin, acceptance, invariants and actual consumers; resolve questions before approval |
| plan / tasks / resume | Minimum design and bounded handoff; source paths/results/pending/next gate rather than transcript replay |
| tests / builder / implement | Discriminating behavioral assertions, explicit frozen boundary, no frozen-test edits by builder, amendments return to owner |
| verify / reviewer / approver | RF/INV → all consumers → code → assertion/result; independent review, original evidence, one correction round; owner accepts |
| archive | Close backlog entry only after acceptance; reusable team learnings in repo, cross-project vault promotion with approval |
| init templates/scripts | Self-contained project copies; preserve existing customizations; owner configures real test globs/thresholds |

## Guard algorithms
Implementation: packs/sdd/skills/sdd-init/scripts/factory-checks.mjs. Both local tools wrappers and copied setup entrypoints import that local shared module, with no runtime package dependency.

Frozen tests (RF-8): confirm repository/base/red ancestry; require selected red inside this change and test(red) prefix. Pin the approved repo-relative constitution path and its content at red; reject path redirection, missing/empty/unsupported globs. Inspect every subsequent commit, including merge-parent diffs, plus index/worktree/untracked tests and rename/deletion. A test(amend) prefix needs AMEND-/spec.md# citation. Lexical citation is not proof of approval: reviewers inspect the actual amendment. Failure returns nonzero; never write the checked repo.

Branch trace (RF-9): inspect JS/TS added lines in base→worktree AND base→index, plus untracked source. Require RF-n.H/E/F/S-number or INV-number in each affected hunk; deleted or other-hunk markers do not count. Skip text/comments while examining template interpolation expressions. This remains lexical, not AST/semantic coverage; model/reviewer verification is still required. Unsupported/missing configuration blocks automatic progression; owner exceptions must be explicit.

## Context economy
Load only relevant spec ranges and referenced dependencies during stations; consult relevant vault/repo learnings as needed at any station. Reviewers share original evidence, never each other's reports. Global final review still checks full contracts and accumulated impact. All roles retain their top 1% specialty. Existing pack/global-rule budgets stay binding; record actual estimates, not runtime-saving claims.

## Validation and delivery
- Unit and CLI fixtures exercise history, index/worktree separation, symlink policy redirection, blank globs, template expressions and independently copied scripts.
- Strict scenario checker validates executable references; manual model behavior remains unexecuted adoption evidence.
- Independent conformance and architecture review; correct introduced defects and re-review once.
- Import real public sources into a temporary output; never commit generated website sources. Existing Pages workflow builds/tests and publishes only on main pushes; production branch naming must be confirmed before any workflow change.
- Capture an immutable baseline from a real owner-authorized source commit; do not forge a commit or modify archived evidence. New baseline must not exceed any prior pack budget.
- Record exact validation, pending CI/installation/adoption and owner gates in implementation-validation.md/release-checklist.md. No migration, installation, push, merge or deployment is part of this source change.

## Attribution
Selected agency-agents evidence/handoff practices: packs/sdd/agency-adaptations.md and NOTICE.md, pinned MIT source. No upstream tool permissions, autonomous deployment, forced browser screenshots or speculative features are imported.
