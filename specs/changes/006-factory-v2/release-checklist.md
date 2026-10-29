# Release checklist — Factory v2
Date: 2026-10-29 · Branch: feat/004-factory-lanes

## Source package
- English spec/plan/tasks, README/examples, editable workflow references in the vault, all SDD skills/agents/templates and MIT attribution are prepared.
- Two independent base reviewers retained; selective context and current token budgets preserved.
- Guards/regression fixes and public-source import validated; see implementation-validation.md.
- Packaging complete: immutable baseline.txt from approved source commit b291c9b; active AGENTS.md reference updated and ratchet passes. No pack budget increased; historical 005 remains unchanged.

## Proposed pull request
Title: feat(sdd): deliver vertical-slice factory with frozen-test and trace guards

Body:
Factory work now follows a useful vertical slice from backlog through owner-approved contracts/design, discriminating tests, bounded implementation, independent review and per-slice acceptance. Instance requirements must be traced through their actual consumers, so a global setting cannot stand in for an instance-level outcome.

Adds self-contained frozen-test/branch-trace guards, copied-script/history/index/untracked regressions and attributed agency-agents handoff/evidence practices. Retains both base reviewers and the existing token budget. Updates English docs, examples and the before/after illustration through the existing Pages importer.

Validation: toolkit and website source unit suites, strict scenario coverage structure, branch trace, public documentation import and whitespace checks pass. Full website build/browser/output checks remain for the existing PR workflow. Real adopting-project instruction-following and installed-project migration are not claimed tested.

## Owner upload/merge
1. Both local delivery commits were explicitly authorized. Source commit b291c9b contains the reviewed change; the baseline commit records its immutable content measurement. No historical red commit was fabricated.
2. Confirm actual target branch. Local main exists and existing Pages publication targets main; no production branch was present during preparation. No workflow target was changed.
3. Push branch and open PR against the intended protected branch. This task does not authorize agent push/merge.
4. Require existing GitHub checks to pass, review actual diff and accept the source delivery before merge. CI configuration alone is not deployment evidence.
5. If merged into main, existing Pages workflow performs its gated publication. Confirm that run's result.

## First adoption
Use sdd-init/sdd-adopt to propose an update rather than overwriting customization. Confirm real test paths, escalation threshold and project command permissions. Observe a small useful slice end to end; test independent instance settings with a shared definition. Record actual acceptance and learnings, promoting cross-project knowledge only with approval.
