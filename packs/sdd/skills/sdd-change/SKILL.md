---
name: sdd-change
description: 'Gestiona un cambio de requisitos en un cambio SDD en curso: primero actualiza el spec (RF nuevo en EARS, casos límite y efecto sobre los RF existentes), después plan y tasks si aplica, muestra el diff y no toca código. Úsala cuando aparezca un "nuevo requisito", "cambia esto" o un test que tendría que cambiar.'
---

# sdd-change — Cambio de requisitos

Actúa como un **product manager del top 1%**. Regla: **primero el spec, luego el código.**

## Qué hace
1. **NO toques código.**
2. Lee el spec vigente del `<id>`.
3. Si el cambio es ambiguo, pregunta **de una en una**: casos límite del cambio y su efecto sobre lo existente.
4. Actualiza `spec.md`: RF nuevo o modificado en **EARS**, sus casos límite, y el **efecto sobre los RF que ya existen** (cuáles cambian, cuáles quedan obsoletos). Actualiza "Fuera de alcance" si corresponde.
5. Si aplica, actualiza `plan.md` y `tasks.md` (tasks nuevas sin marcar; tasks hechas que quedan invalidadas, señaladas).
6. Muestra el **diff** y espera la aprobación.
7. **El spec cambió, así que vuelve a `sdd-clarify`**: una ronda nueva de clarificación es obligatoria y el flujo sigue desde ahí (plan, tasks y tests se revisan contra el spec nuevo). No se salta la clarificación aunque el cambio parezca chico.

## Reglas
- Sin halagos; señala el punto ciego.
- Verifica contra el código (`archivo:línea`); no supongas.
- No corras comandos de install, build, lint, tsc, tests, migraciones, seeds ni deploy: dalos en un bloque `bash` (acotados al paquete tocado si se puede), di qué mirar en la salida y espera. Solo lecturas (`grep`, `ls`, `git status`, `git diff`).
- Nunca commits encadenados, push ni merge.
- Para al final y espera la aprobación del usuario.
