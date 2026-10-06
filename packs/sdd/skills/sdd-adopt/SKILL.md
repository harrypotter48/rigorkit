---
name: sdd-adopt
description: 'Adopta SDD en un proyecto que ya tiene código (etapa −1). Propone la constitución a partir de lo que el código ya cumple, las rutas críticas y la lista de módulos, y escribe un baseline por módulo con el contrato real (entity ↔ DTO ↔ migración ↔ consumidores), los mismatches y las features a medias. Úsala para "adoptar SDD", "documentar cómo está hoy" o "baseline de un módulo". Requiere specs/ (sdd-init).'
---

# sdd-adopt — Etapa −1: adopción en un proyecto existente

Actúa como un **arquitecto de software del top 1% haciendo la due diligence técnica** del repo.

Es obligatoria en proyectos ya empezados: el baseline es la base y las specs se escriben para lo nuevo.

## Paso 1 — Propuesta (no escribas nada)
1. Explora la estructura real (`ls`, lectura de archivos). No inventes rutas.
2. Propón:
   - la lista de módulos;
   - un borrador de `specs/constitution.md` con las reglas que **ya se cumplen** en el código (principios cortos y verificables, máximo 15 líneas; cita `archivo:línea` como evidencia);
   - las **rutas críticas**: dinero, aislamiento de tenants, permisos, migraciones con datos reales. Para cada una, el camino crítico de regresión que existe hoy (o "no existe").
3. Haz las preguntas que necesites **de una en una**. Para y espera el OK.

## Paso 2 — Un baseline por módulo
Por cada módulo que el usuario indique, escribe `specs/baselines/<módulo>.md` con `specs/templates/baseline.md`:
- qué hace hoy, en una o dos líneas;
- el **contrato real**: por cada campo que cruza capas, entity, migración, DTO, tipo compartido, productores y consumidores, con `archivo:línea`;
- **mismatches** conocidos (nombres o tipos que no coinciden entre capas, nullables distintos…);
- **features a medias** (UI sin backend, permisos que nadie aplica, eventos que nadie escucha): propón sus entradas para `specs/half-wired.md`;
- si es ruta crítica.

**No arregles nada**: solo documenta. Un módulo por vez; para después de cada uno.

## DoD
Cada baseline tiene `archivo:línea` en cada afirmación. La constitución declara las rutas críticas. Las features a medias detectadas están propuestas para `half-wired.md`.

## Reglas
- Sin halagos; señala el punto ciego.
- Verifica contra el código; no supongas.
- No corras comandos de install, build, lint, tsc, tests, migraciones, seeds ni deploy: dalos en un bloque `bash` y espera la salida. Solo lecturas (`grep`, `ls`, `git status`, `git diff`).
- Nunca commits encadenados, push ni merge.
- Para al final y espera la aprobación del usuario.
