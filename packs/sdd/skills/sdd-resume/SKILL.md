---
name: sdd-resume
description: 'Retoma un cambio SDD con lecturas selectivas: verifica estado, aprobaciones, task actual y referencias antes de continuar. Úsala para "retomamos", "¿dónde quedamos?" o "continuar el cambio".'
---

# sdd-resume — Retomar un cambio

Actúa como un **tech lead del top 1%**.

## Qué hace
1. Si no hay `<id>`, lista los cambios en `specs/changes/` y pregunta cuál.
2. Lee instrucciones aplicables y constitución completas. Usa el último estado breve de `tasks.md` o de la conversación: etapa, aprobaciones, task actual, decisiones, pendientes y referencias. Contrástalo con los archivos actuales, `git status`, el diff pertinente y `git log` reciente; no asumas que el resumen sigue vigente.
3. Sin estado fiable, reconstruye la etapa localizando artefactos, estados/aprobaciones y marcas de tasks, con lecturas selectivas. Usa la tabla solo como orientación, nunca como prueba de aprobación:

   | Hay… | Etapa |
   |---|---|
   | Nada | Triage / spec |
   | spec sin aprobar o con `[NECESITA ACLARACIÓN]` | Spec / clarificación |
   | spec aprobado, sin plan (y el tamaño lo pide) | Plan |
   | plan, sin tasks | Tasks |
   | tasks sin tests | Tests primero |
   | tasks a medio marcar | Implementar (siguiente task sin `[x]`) |
   | todas las tasks `[x]` | Verificar |

4. Lee la task actual y sus referencias a RF, escenarios, decisiones y contratos; amplía contexto si faltan referencias, cambió el spec/plan o hay impacto no previsto. No cargues toda la carpeta por defecto; para la verificación global sí hacen falta spec/plan completos y diff acumulado.
5. Señala inconsistencias (tasks marcadas sin evidencia de verificación, cambios sin commitear, spec cambiado después del plan). No deduzcas aprobaciones ni tests verdes de un commit o una casilla. Si falta evidencia de un gate, dilo y pide solo lo necesario antes de avanzar.

## Salida
Etapa actual, qué está hecho, siguiente paso concreto (y qué skill usar). Para.

## Reglas
- Sin halagos; señala el punto ciego.
- Verifica contra el código (`archivo:línea`); no supongas.
- No corras comandos de install, build, lint, tsc, tests, migraciones, seeds ni deploy: dalos en un bloque `bash` (acotados al paquete tocado si se puede), di qué mirar en la salida y espera. Solo lecturas (`grep`, `ls`, `git status`, `git diff`).
- Nunca commits encadenados, push ni merge.
- Para al final y espera la aprobación del usuario.
