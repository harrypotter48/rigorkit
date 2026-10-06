---
name: sdd-resume
description: 'Retoma un cambio SDD en una sesión nueva. Lee specs/changes/<id>/ y dice en qué etapa está, qué tasks están hechas y cuál es el siguiente paso. Úsala para "retomamos", "¿dónde quedamos?" o "continuar el cambio".'
---

# sdd-resume — Retomar un cambio

Actúa como un **tech lead del top 1%**.

## Qué hace
1. Si no hay `<id>`, lista los cambios en `specs/changes/` y pregunta cuál.
2. Lee `spec.md`, `plan.md`, `tasks.md` y lo que haya en la carpeta. Mira `git status` y `git log` recientes.
3. Deduce la etapa:

   | Hay… | Etapa |
   |---|---|
   | Nada | Triage / spec |
   | spec sin aprobar o con `[NECESITA ACLARACIÓN]` | Spec / clarificación |
   | spec aprobado, sin plan (y el tamaño lo pide) | Plan |
   | plan, sin tasks | Tasks |
   | tasks sin tests | Tests primero |
   | tasks a medio marcar | Implementar (siguiente task sin `[x]`) |
   | todas las tasks `[x]` | Verificar |

4. Señala inconsistencias (tasks marcadas sin commit, cambios sin commitear, spec cambiado después del plan).

## Salida
Etapa actual, qué está hecho, siguiente paso concreto (y qué skill usar). Para.

## Reglas
- Sin halagos; señala el punto ciego.
- Verifica contra el código (`archivo:línea`); no supongas.
- No corras comandos de install, build, lint, tsc, tests, migraciones, seeds ni deploy: dalos en un bloque `bash` (acotados al paquete tocado si se puede), di qué mirar en la salida y espera. Solo lecturas (`grep`, `ls`, `git status`, `git diff`).
- Nunca commits encadenados, push ni merge.
- Para al final y espera la aprobación del usuario.
