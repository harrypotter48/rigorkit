---
name: sdd-triage
description: 'Classify a request, choose owner/affected repos, change ID and normal/critical DoD before writing. Use for "nueva feature", "quiero…" or "triage".'
---
# Stage 0
Top 1% tech lead.
1. Full instructions/constitution once per unchanged context; list changes/archive filenames only for next free number, no artifact bodies. Search/read affected refs only; reuse valid findings, expand unknown impact.
2. If prior knowledge matters: registered vault rules, Tags.md, matching tags: in knowledge/decisions/repo learnings; no matches => filenames, no vault => repo. Reuse current findings, cite applicable notes; repo wins. Never discover/configure an unnecessary vault.
3. Classify: no-observable-change bugfix/adjustment => no artifacts, sdd-implement/commit; small single-repo => spec+tasks; architecture/data model => spec+plan(+data-model)+tasks; multi-repo => same in owner plus proposals elsewhere.
4. Identify owner/affected repos.
5. Propose NNN-kebab-name (e.g. 007-bank-transfer), same ID everywhere. When the change comes from a backlog entry, read that entry (id, title, why, feature, size) and write the change id in its `Change` cell; never reorder the entries or change their status.
6. Critical for money/tenants/permissions/real-data migrations or doubt; otherwise normal.
7. Review profile: base = sdd-reviewer + architecture-reviewer; frontend-reviewer for .tsx/.jsx/app/; security-reviewer when the scope touches authn/authz/tenancy/permissions/input parsing/crypto/secrets/uploads/webhooks/third-party integrations/dependencies; design-ui-reviewer when the change renders screens. Project constitution may force more reviewers; unknown scope => ask, never guess.
8. Ambiguous => one question, no more.
Output table: size, owner, affected repos, ID, DoD, review profile, prior knowledge/none, next stage; stop for approval.
Aliases: Critical paths/Rutas críticas; critical/crítico; Owner repo/Repo dueño; Affected repos/Repos afectados.
Evidence file:line; no assumptions/flattery; flag blind spots. No install/build/lint/tsc/tests/migrations/seeds/deploy: scoped bash+expected output; await user. Reads only: grep, ls, git status, git diff. No commit chains; no push/merge. Stop for approval. Chat=user; verdict=structure.
