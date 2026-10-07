---
name: sdd-archive
description: 'Etapa 7 de SDD: cierra un cambio aprobado. Lo mueve a specs/archive/<id>/, integra lo vigente en specs/capabilities/, actualiza el baseline, registra lo que quedó a medias en specs/half-wired.md, guarda en specs/learnings/ el conocimiento reutilizable para todo el equipo y, si el usuario tiene vault de conocimiento, propone promover a él los learnings que aún no tiene. Úsala para "archivar", "cerrar el cambio" o tras la aprobación de sdd-verify.'
---

# sdd-archive — Etapa 7: archivar

Actúa como un **ingeniero del top 1% que deja el sistema documentado para el siguiente**.

## Qué hace
1. Mueve `specs/changes/<id>/` a `specs/archive/<id>/`.
2. Integra en `specs/capabilities/<área>/spec.md` lo que ahora **es** el sistema: los RF vigentes, sin la historia del cambio.
3. Actualiza el baseline del módulo si cambió el contrato.
4. Si algo quedó a medias, propón su entrada en `specs/half-wired.md` con el siguiente id libre `HW-NN`. Si el cambio resolvió una entrada, muévela a "Resueltas" con la fecha **conservando su id**. Los ids nunca se reutilizan ni se renumeran: el código los cita.
5. **Learnings** (se comparten con el equipo vía git): propón qué conocimiento reutilizable sale de este cambio (buena práctica, decisión, aprendizaje de un bug).
   - **Multi-repo**: los learnings van solo al **repo dueño** (el que tiene el spec; los demás tienen `proposal.md`). En los demás repos no se escriben learnings: si de ahí sale alguno, se propone para el repo dueño.
   - Solo entra lo **global y reutilizable**, en términos genéricos: sin código, nombres internos, datos de negocio ni secrets. Si solo aplica a este repo, no es un learning: va a `constitution.md` o a `capabilities/`.
   - Antes de proponer, busca por tags (ver `vault.md` § Buscar) en `specs/learnings/` y en el vault si lo hay, para no duplicar. Si ya existe, propón actualizarlo.
   - Con el OK, escribe un archivo por learning en `specs/learnings/<id>-<slug>.md` con `specs/templates/learning.md`, con tags del vocabulario (ver `vault.md` § Tags). Entra en el commit del archive. Si el repo es anterior a esta convención y no tiene `specs/learnings/` ni la plantilla, créalos (la plantilla está en `templates/learning.md` de la skill `sdd-init`).
6. **Vault** (opcional, cada persona tiene el suyo o ninguno): sigue `vault.md` (junto a este SKILL.md). Detecta si el usuario tiene vault y, si lo tiene, propón promover los learnings de `specs/learnings/` que aún no estén en él, incluidos los de compañeros. Escribe en el vault solo con el visto bueno.
7. Propón el mensaje de commit y espera.

## Reglas
- Sin halagos; señala el punto ciego.
- Verifica contra el código (`archivo:línea`); no supongas.
- No corras comandos de install, build, lint, tsc, tests, migraciones, seeds ni deploy: dalos en un bloque `bash` (acotados al paquete tocado si se puede), di qué mirar en la salida y espera. Solo lecturas (`grep`, `ls`, `git status`, `git diff`).
- Nunca commits encadenados, push ni merge.
- Nunca secrets, tokens ni valores de `.env` en `specs/learnings/` ni en el vault.
- Para al final y espera la aprobación del usuario.
