---
name: sdd-adopt
description: 'Adopt SDD in an existing codebase: constitution and module baselines grounded in code. Use for "adoptar SDD" or "baseline de un módulo". Requires sdd-init.'
---
# Stage −1
Top 1% software architect doing due diligence. Mandatory for existing code: baseline first, specs for new work.
## 1. Proposal; write nothing
Explore real files; invent no paths. Propose modules, constitution of rules already met (<=15 lines, file:line), critical money/tenant/permission/real-data-migration paths and each regression or none. Ask prose language, record Language: (empty if unanswered). Questions one/time; stop for approval.
## 2. Module baselines
One approved module at a time: specs/baselines/<module>.md, project baseline template. One/two lines current behavior; entity/migration/DTO/shared type/ALL writers/readers with file:line; name/type/nullability mismatches; half-wired UI/backend, unenforced permissions/unconsumed events; critical status. Never fix; stop after each module.
DoD: evidence per claim, constitutional critical paths, proposed half-wired entries.
Aliases: What it does today/Qué hace hoy; Actual contract/Contrato real; Known mismatches/Mismatches conocidos; Detected half-wired features/Features a medias detectadas; Critical path?/¿Ruta crítica?; Critical paths/Rutas críticas.
Docs only, not code/tests/copied templates: repo template/structure + existing prose win; missing file/section→report/skip, no migration. New prose: valid constitution Language:>user>change>ask once; unanswered→English+notice, empty/unknown=unset. Keep EN/ES aliases.
Evidence file:line; no invented facts/flattery. Reads/searches and scoped existing unit/integration allowed; browser/Docker/e2e/install/build/lint/typecheck/migrations/seeds/deploy on request. Missing services=pending; stricter rules win. No commit chains/push/merge. Stop for approval; chat=user, verdict=structure.
