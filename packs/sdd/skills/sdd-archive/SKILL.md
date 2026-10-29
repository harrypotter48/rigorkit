---
name: sdd-archive
description: 'Archive an approved change, update capabilities/baselines and propose generic learnings or vault promotion. Use for "archivar" or "cerrar el cambio".'
---
# Stage 7
Top 1% documenting engineer. Require owner acceptance for THIS slice; no next-slice authority. Move change→archive/<id>; Origin HU entry→done, never remove/reorder.
Current RFs→capabilities/<area>/spec.md, not history. Changed contract→module baseline. Half-wired: next HW-NN; resolved moves with date and SAME ID, never delete/reuse/renumber.
Propose generic team practices/decisions/bug lessons; multi-repo owner only, including teammates. Search matching tags in learnings/optional vault, update duplicates. No code/internal names/business data/secrets; repo-specific facts stay constitution/capabilities. Approval=>one specs/learnings/<id>-<slug>.md per note, project template/tags, in archive commit; approved missing folder allowed, missing template=>report/skip, no other skill files.
Local vault.md: optional-vault detection and promotion proposals; vault writes require explicit approval. Propose sdd-explain only for architecture/multi-repo/new-flow/multi-layer; approved explanation shares archive commit. Propose commit and stop.
Aliases: Active/Activas, Resolved/Resueltas, resolved on/resuelta el; Learning metadata aliases: local vault.md (promotion reads them). Actual contract/Contrato real; Known mismatches/Mismatches conocidos. Vault's own schema wins. No secrets/tokens/.env values in learnings/vault.
Docs only, not code/tests/copied templates: repo template/structure + existing prose win; missing file/section→report/skip, no migration. New prose: valid constitution Language:>user>change>ask once; unanswered→English+notice, empty/unknown=unset. Keep EN/ES aliases.
Evidence file:line; no invented facts/flattery. Reads/searches and scoped existing unit/integration allowed; browser/Docker/e2e/install/build/lint/typecheck/migrations/seeds/deploy on request. Missing services=pending; stricter rules win. No commit chains/push/merge. Stop for approval; chat=user, verdict=structure.
