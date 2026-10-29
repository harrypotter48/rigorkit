---
name: sdd-triage
description: 'Classify a request, choose owner/affected repos, change ID and normal/critical DoD before writing. Use for "nueva feature", "quiero…" or "triage".'
---
# Stage 0
Top 1% tech lead. Full governing rules once; list change/archive filenames for next ID, no artifact bodies. Search affected refs; expand uncertainty. Relevant prior knowledge=>matching tags in repo/vault, cite decisions/sources, repo wins; never discover/configure unnecessary vault. New technical choices need owner approval.
Propose owner-confirmed tier: trivial=no observable/contract/critical change; story=one useful vertical slice; feature=multiple slices. Uncertain impact is not trivial. Trivial=>approved scope/diff review, no invented spec/tests; small story=>spec+tasks; architecture/data model=>plan(+data-model); multi-repo=>owner artifacts/non-owner proposals.
Identify owner/affected repos; propose next NNN-kebab-name, same everywhere. Selected HU entry=>read id/value/size/dependencies, write only Change cell, no reordering/status changes. Money/tenants/permissions/real-data migration or doubt=>critical, else normal. Record Tier in spec when present.
Profile requires approval: retain sdd-reviewer+architecture-reviewer; proportional removal is deferred. Propose escalation for declared review-lines threshold (150 only a proposal), critical/new module/layer/feature; never drop required reviewers silently, recheck actual impact before dispatch. Frontend for .tsx/.jsx/app/; security for authn/authz/tenancy/permissions/input/crypto/secrets/uploads/webhooks/integrations/dependencies; interface for rendered screens. Constitution may require more; unknown=>one question, never guess.
Output tier/size, owner/repos, ID, DoD, proposed/evidenced profile, sources/none and next stage; stop for approval.
Aliases: Critical paths/Rutas críticas; critical/crítico; Owner repo/Repo dueño; Affected repos/Repos afectados.
Evidence file:line; no invented facts/flattery. Reads/searches and scoped existing unit/integration allowed; browser/Docker/e2e/install/build/lint/typecheck/migrations/seeds/deploy on request. Missing services=pending; stricter rules win. No commit chains/push/merge. Stop for approval; chat=user, verdict=structure.
