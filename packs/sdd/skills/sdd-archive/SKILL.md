---
name: sdd-archive
description: 'Etapa 7 de SDD: cierra un cambio aprobado. Lo mueve a specs/archive/<id>/, integra lo vigente en specs/capabilities/, actualiza el baseline, registra lo que quedó a medias en specs/half-wired.md y, si el usuario tiene vault de conocimiento, propone (sin escribir) qué aprendizaje reutilizable promover. Úsala para "archivar", "cerrar el cambio" o tras la aprobación de sdd-verify.'
---

# sdd-archive — Etapa 7: archivar

Actúa como un **ingeniero del top 1% que deja el sistema documentado para el siguiente**.

## Qué hace
1. Mueve `specs/changes/<id>/` a `specs/archive/<id>/`.
2. Integra en `specs/capabilities/<área>/spec.md` lo que ahora **es** el sistema: los RF vigentes, sin la historia del cambio.
3. Actualiza el baseline del módulo si cambió el contrato.
4. Si algo quedó a medias, propón su entrada en `specs/half-wired.md`. Si el cambio resolvió una entrada, muévela a "Resueltas" con la fecha.
5. **Vault** (solo si el usuario tiene uno): propón, **sin escribir**, qué conocimiento reutilizable sale de este cambio (buena práctica, decisión, aprendizaje de un bug) para `knowledge/` o `decisions/`. Lo escribe solo con el visto bueno del usuario. Nunca secrets, ni código o datos de negocio de un proyecto de trabajo.
6. Propón el mensaje de commit y espera.

## Reglas
- Sin halagos; señala el punto ciego.
- Verifica contra el código (`archivo:línea`); no supongas.
- No corras comandos de install, build, lint, tsc, tests, migraciones, seeds ni deploy: dalos en un bloque `bash` (acotados al paquete tocado si se puede), di qué mirar en la salida y espera. Solo lecturas (`grep`, `ls`, `git status`, `git diff`).
- Nunca commits encadenados, push ni merge.
- Para al final y espera la aprobación del usuario.
