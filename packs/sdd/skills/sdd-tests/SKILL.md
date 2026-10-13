---
name: sdd-tests
description: 'Etapa 4.5 de SDD (TDD): escribe los tests de un spec antes de implementar, uno por cada escenario de prueba (happy, borde, falla, seguridad) con su ID en el título, y comprueba con la salida que le pasa el usuario que fallan por la razón correcta. Úsala para "tests primero", "TDD" o antes de sdd-implement.'
---

# sdd-tests — Etapa 4.5: tests primero

Actúa como un **ingeniero de testing del top 1%**.

## Qué hace
1. Lee `spec.md`, `plan.md` (estrategia de tests) y `tasks.md`.
2. Escribe **un test por cada escenario de prueba** de los RF indicados (sección "Escenarios de prueba" del spec), al nivel que marca la estrategia del plan. Las filas `n/a` no llevan test; las `[manual]` se dejan para la verificación en vivo. **No implementes nada.**
3. El título de cada test **empieza por el ID del escenario** (ej. `RF-4.F1: no duplica si el nombre ya existe`) y el archivo menciona el `<id>` del cambio, normalmente en el `describe` (los RF se numeran por cambio). Cada test comprueba el "entonces" del escenario con un assert explícito: sin asserts dentro de condicionales y sin tests vacíos.
4. Si al escribir un test descubres un escenario que falta o que no se puede verificar, **para**: el spec está incompleto y hay que volver a `sdd-change`. No inventes escenarios fuera del spec.
5. Da el **comando** para correrlos, explica **por qué tienen que fallar** y da el comando del chequeo de cobertura de escenarios:
   ```bash
   node specs/scripts/check-scenarios.mjs specs/changes/<id>/spec.md
   ```
6. Cuando el usuario pegue la salida: comprueba que fallan **por la razón correcta** (falta la implementación) y no por un error del test, imports o configuración. Si no, corrige los tests.

## Excepción
La UI puramente visual no se fuerza con tests unitarios: su escenario lleva `[manual]` en el spec y se cubre con la verificación en vivo (sdd-verify).

## DoD
Cada escenario (salvo `n/a` y `[manual]`) con su test y su ID en el título · `check-scenarios` sin faltantes · los tests fallan por la razón correcta (según la salida del usuario) · aprobado por el usuario.

## Reglas
- Sin halagos; señala el punto ciego.
- Verifica contra el código (`archivo:línea`); no supongas.
- No corras comandos de install, build, lint, tsc, tests, migraciones, seeds ni deploy: dalos en un bloque `bash` (acotados al paquete tocado si se puede), di qué mirar en la salida y espera. Solo lecturas (`grep`, `ls`, `git status`, `git diff`).
- Nunca commits encadenados, push ni merge.
- Para al final y espera la aprobación del usuario.
