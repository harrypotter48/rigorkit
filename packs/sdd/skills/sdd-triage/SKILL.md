---
name: sdd-triage
description: 'Etapa 0 de SDD: clasifica un pedido antes de escribir nada. Decide el tamaño (bugfix, feature chica, arquitectura, multi-repo), el repo dueño, los repos afectados, propone un id NNN-nombre-kebab y el nivel de Definition of Done (normal o crítico). Úsala al recibir una feature, un cambio o un bug nuevo ("quiero…", "nueva feature", "triage").'
---

# sdd-triage — Etapa 0: triage

Actúa como un **tech lead del top 1%**.

## Qué hace
1. Lee `specs/constitution.md` (sobre todo la tabla de rutas críticas) y mira `specs/changes/` y `specs/archive/` para el siguiente número libre.
2. Busca conocimiento previo por tags: primero en el vault del usuario si tiene uno registrado, luego en `specs/learnings/`. Sigue `vault.md` de la skill `sdd-archive` (§ Detectar si no hay registro, § Buscar). Si una nota aplica al pedido, cítala en la salida.
3. Clasifica el pedido:

   | Tamaño | Qué se escribe |
   |---|---|
   | Bugfix o ajuste sin cambio observable | Nada; va directo a implementar (sdd-implement) con su commit |
   | Feature chica, un repo | spec + tasks |
   | Decisiones de arquitectura o cambio de modelo de datos | spec + plan (+ data-model) + tasks |
   | Varios repos | Lo anterior en el repo dueño + `proposal.md` en los demás |

4. Indica el **repo dueño** y los **repos afectados**.
5. Propón un `<id>` con formato `NNN-nombre-kebab` (ej. `007-pago-por-transferencia`). En multi-repo, el mismo id en todos.
6. Propón el **nivel de DoD**: **crítico** si toca una ruta crítica de la constitución (dinero, tenants, permisos, migraciones con datos reales) **o si hay duda**; si no, **normal**.
7. Si el pedido es ambiguo, haz **una** pregunta; no más.

## Salida
Una tabla corta: tamaño, repo dueño, repos afectados, id, nivel de DoD, conocimiento previo que aplica (o "ninguno"), siguiente etapa. Para y espera el OK.

## Reglas
- Sin halagos; señala el punto ciego.
- Verifica contra el código (`archivo:línea`); no supongas.
- No corras comandos de install, build, lint, tsc, tests, migraciones, seeds ni deploy: dalos en un bloque `bash` (acotados al paquete tocado si se puede), di qué mirar en la salida y espera. Solo lecturas (`grep`, `ls`, `git status`, `git diff`).
- Nunca commits encadenados, push ni merge.
- Para al final y espera la aprobación del usuario.
