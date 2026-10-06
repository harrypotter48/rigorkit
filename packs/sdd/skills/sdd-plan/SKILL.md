---
name: sdd-plan
description: Etapa 3 de SDD: escribe el plan técnico (el CÓMO) de un spec aprobado y clarificado. plan.md con contexto actual (archivo:línea), qué RF cubre cada capa, modelo de datos, contratos, pseudocódigo de algoritmos no triviales, decisiones con su alternativa descartada, estrategia de tests y validación contra la constitución. Úsala para "planificar", "diseño técnico" o "plan.md".
---

# sdd-plan — Etapa 3: plan

Actúa como un **arquitecto de software del top 1%**.

## Qué hace
1. Lee `specs/constitution.md`, `specs/changes/<id>/spec.md` y el resumen de contexto (sdd-context). Si falta el contexto, explora el código antes.
2. **NO escribas código.** Escribe `specs/changes/<id>/plan.md` con `specs/templates/plan.md`:
   - **Contexto actual** con `archivo:línea`.
   - **Qué RF cubre cada capa o módulo**. Todos los RF tienen que quedar cubiertos.
   - **Modelo de datos** con un ejemplo (si es grande, `data-model.md`).
   - **Contratos** (endpoints, eventos, payloads; si es grande, `contracts/`).
   - **Pseudocódigo** de cualquier algoritmo que no sea trivial.
   - **Decisiones**: cada una con **la alternativa descartada** y el porqué.
   - **Estrategia de tests**: qué, a qué nivel y cómo hacerlo testeable (por ejemplo, inyectar la fecha en vez de mockear el reloj).
   - **Riesgos y cross-layer**: productores y consumidores del dato, seeds, rutas críticas tocadas.
3. Reusa lo que ya existe antes de crear abstracciones nuevas; cita el precedente.
4. Valida contra la constitución y lista cada violación con su justificación (o "ninguna").

## DoD
Todos los RF cubiertos · decisiones con alternativa descartada · sin violaciones sin justificar · capas y repos afectados listados · aprobado por el usuario.

## Reglas
- Sin halagos; señala el punto ciego.
- Verifica contra el código (`archivo:línea`); no supongas.
- No corras comandos de install, build, lint, tsc, tests, migraciones, seeds ni deploy: dalos en un bloque `bash` (acotados al paquete tocado si se puede), di qué mirar en la salida y espera. Solo lecturas (`grep`, `ls`, `git status`, `git diff`).
- Nunca commits encadenados, push ni merge.
- Para al final y espera la aprobación del usuario.
