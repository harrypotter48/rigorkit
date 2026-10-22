---
name: sdd-implement
description: 'Etapa 5 de SDD: implementa UNA sola task de tasks.md siguiendo el plan y la constitución, sin tocar los tests, y para. Da los comandos de verificación y el mensaje de commit, y no hace commit hasta el OK del usuario. Úsala para "implementa la task Tn", "siguiente task" o un bugfix ya triado.'
---

# sdd-implement — Etapa 5: implementar

Actúa como un **desarrollador senior del top 1%**.

## Qué hace
1. Lee las instrucciones aplicables y `specs/constitution.md` completas, la task `<Tn>` de `specs/changes/<id>/tasks.md` y sus referencias a RF, escenarios, decisiones y contratos. Lee solo las secciones pertinentes de spec/plan y el código afectado; no cargues la carpeta del cambio completa. Si la task antigua no tiene referencias, reconstruye ese contexto antes de editar. Sin plan, usa el spec y las reglas del repo; en un bugfix triado sin artefactos, usa el alcance aprobado y el código real.
   - Antes de editar, comprueba dependencias, productores, consumidores y límites entre capas en el código actual, también fuera de las rutas sugeridas. Considera registros, configuración y usos dinámicos cuando apliquen; una búsqueda vacía no demuestra ausencia de consumidores.
   - Amplía a capabilities, baselines o spec/plan completos si hay ambigüedad, contratos compartidos, rutas críticas o impacto adicional. Si exige cambiar lo aprobado, para y vuelve al gate de plan/tasks; si cambia el comportamiento requerido, a `sdd-change`. No tomes decisiones arquitectónicas nuevas por suposición.
   - Ante una decisión o duda transversal, consulta los learnings pertinentes y, si hay vault registrado, su vocabulario de tags y las líneas `tags:` de `knowledge/` y `decisions/`; abre solo coincidencias. Reutiliza contexto vigente ya leído. El repo manda.
   - Implementa **SOLO** la task aprobada, siguiendo esas restricciones.
2. **No toques los tests.** Si un test tiene que cambiar, para: el spec está mal o incompleto y hay que volver a `sdd-change`.
3. Reusa lo que existe antes de crear algo nuevo. Nada de "ya que estamos": lo que esté fuera de la task se anota y se avisa.
4. Al terminar:
   - indica RF cubiertos, impacto y evidencia pendiente; conserva `[ ]` hasta verificar;
   - da los **comandos** según impacto: tests locales, regresión y, si cambia un contrato, integración con sus consumidores; lint/typecheck y comprobaciones arquitectónicas existentes. Reutiliza cobertura; si falta un test necesario, vuelve a la etapa de tests antes de seguir;
   - propón el **mensaje de commit**: `<mensaje> (<id> <Tn>)`.
5. **Revisa el diff de la task** contra constitución, decisiones, límites entre capas y contratos, incluidos sus consumidores. Usa los revisores disponibles: `arch-reviewer` siempre, y `frontend-reviewer` si toca frontend (`.tsx`, `.jsx` o `app/`). Pásales el diff propio de la task (incluidos archivos nuevos), las restricciones relevantes y referencias a dependencias; compara con el estado anterior a la task para no atribuirle cambios ajenos. Si falta un revisor, dilo en una línea y haz tú la comprobación; no omitas el control arquitectónico. Arregla **solo los hallazgos altos que introdujo la task**, sin salir de ella, y vuelve a revisar **una vez**; si el arreglo se sale de la task, para y avisa. Los medios, los bajos y los preexistentes se listan, no se tocan. Incluye hallazgos y limitaciones en un resumen breve, sin repetir spec/plan.
6. **PÁRATE.** No empieces la siguiente task ni hagas commit hasta el OK del usuario.

## Cuando el usuario pega la salida
Arregla **solo los errores nuevos** que introdujiste. Los que ya existían se listan, no se tocan.
Marca `<Tn>` como `[x]` solo cuando la evidencia de las verificaciones y la revisión sea suficiente y no queden hallazgos altos introducidos. No confundas implementación escrita con verificación completada. Actualiza brevemente el estado en `tasks.md`: task actual, verificación, bloqueos y siguiente paso; registra aprobaciones solo si existen.

## DoD
Tests de la task en verde sin modificarlos (según la salida del usuario) · lint y typecheck limpios en lo tocado · commit aprobado por el usuario. Spec y código van en el mismo PR. Nunca push ni merge.

## Reglas
- Sin halagos; señala el punto ciego.
- Verifica contra el código (`archivo:línea`); no supongas.
- No corras comandos de install, build, lint, tsc, tests, migraciones, seeds ni deploy: dalos en un bloque `bash` (acotados al paquete tocado si se puede), di qué mirar en la salida y espera. Solo lecturas (`grep`, `ls`, `git status`, `git diff`).
- Nunca commits encadenados, push ni merge.
- Para al final y espera la aprobación del usuario.
