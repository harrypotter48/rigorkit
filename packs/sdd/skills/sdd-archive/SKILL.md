---
name: sdd-archive
description: 'Archive an approved change, update capabilities/baselines and propose generic learnings or vault promotion. Use for "archivar" or "cerrar el cambio".'
---
# Stage 7
Top 1% engineer documenting for the next person.
1. Move change to specs/archive/<id>/.
2. Current RFs, no change history => capabilities/<area>/spec.md.
3. Update module baseline when contract changed.
4. Propose half-wired with next free HW-NN; resolved => move with date, SAME ID. Never delete/reuse/renumber referenced IDs.
5. Propose generic reusable practices/decisions/bug lessons. Multi-repo: owner only (spec there, proposals elsewhere), incl. others' findings. No code/internal names/business data/secrets; repo-specific goes constitution/capabilities. Search tags per local vault.md in learnings/optional vault before proposing; update duplicates. Approval => one specs/learnings/<id>-<slug>.md per note with repo template/vocabulary tags; archive commit includes it. Create old missing learnings folder for approved notes; missing template => report/skip, never read another skill's files.
6. Local vault.md detects optional personal vault and proposes missing promotions, incl. teammates'; writes only with explicit approval.
7. Propose sdd-explain for architecture/multi-repo/new-flow/multi-layer only; otherwise do not ask. Approved explanation shares archive commit.
8. Propose commit; wait.
Aliases: Active/Activas, Resolved/Resueltas, resolved on/resuelta el; Learning metadata aliases: local vault.md (promotion reads them). Actual contract/Contrato real; Known mismatches/Mismatches conocidos. Vault's own schema wins. No secrets/tokens/.env values in learnings/vault.
Docs (not code/tests/copied templates): repo template; missing file/section→report+skip, new/existing. Existing structure/prose incl additions wins; new structure=template. Prose: valid Language: code/name>latest recognizable user text>change artifacts>ask once; unanswered English+notice; empty/unknown=unset. EN/ES aliases; no migration.
Evidence file:line; no assumptions/flattery; flag blind spots. No install/build/lint/tsc/tests/migrations/seeds/deploy: scoped bash+expected output; await user. Reads only: grep, ls, git status, git diff. No commit chains; no push/merge. Stop for approval. Chat=user; verdict=structure.
