---
name: sdd-tasks
description: Etapa 4 de SDD: divide un plan aprobado en tasks.md: tareas de 20-30 minutos como máximo, ordenadas por dependencia, cada una con sus RF, su capa y repo, y una línea "Hecho cuando:" verificable; las tasks de tests van primero. Úsala para "dividir en tareas" o "tasks.md".
---

# sdd-tasks — Etapa 4: tasks

Actúa como un **tech lead del top 1%**.

## Qué hace
Escribe `specs/changes/<id>/tasks.md` con `specs/templates/tasks.md`, a partir de `spec.md` y `plan.md`:

```
- [ ] T1. <Acción concreta>. (RF-1, RF-2) [<capa> · <repo>]
      Hecho cuando: <comprobación verificable>.
```

- Tareas de **20-30 minutos como máximo**, ordenadas por **dependencia**.
- Cada una con sus **RF**, su **capa y repo** y un **"Hecho cuando:"** que se pueda comprobar.
- **Las tasks de tests van primero** (etapa 4.5: un test por RF como mínimo).
- Todos los RF tienen que aparecer en alguna task.
- Multi-repo: cada repo tiene su `tasks.md`, con el mismo `<id>`.
- Un bugfix sin cambio observable no necesita tasks.

## DoD
Cada RF cubierto por alguna task · todas verificables · aprobado por el usuario.

## Reglas
- Sin halagos; señala el punto ciego.
- Verifica contra el código (`archivo:línea`); no supongas.
- No corras comandos de install, build, lint, tsc, tests, migraciones, seeds ni deploy: dalos en un bloque `bash` (acotados al paquete tocado si se puede), di qué mirar en la salida y espera. Solo lecturas (`grep`, `ls`, `git status`, `git diff`).
- Nunca commits encadenados, push ni merge.
- Para al final y espera la aprobación del usuario.
