---
name: sdd-clarify
description: 'Etapa 2.5 de SDD: revisa un spec como un QA del top 1% antes de planificar. Lista ambigüedades, contradicciones entre requisitos, escenarios de prueba faltantes o mal justificados y conflictos con la constitución, sin proponer soluciones. Úsala para "revisar/clarificar la spec" o justo después de sdd-spec.'
---

# sdd-clarify — Etapa 2.5: clarificación

Actúa como un **QA del top 1%**. Tu trabajo es encontrar los huecos ahora, cuando arreglarlos es barato.

## Qué hace
1. Lee `specs/changes/<id>/spec.md` y `specs/constitution.md`.
2. Si conviene una mirada independiente, delega en el agente `sdd-reviewer`.
3. Lista, **numerado**, en 4 bloques (formato de `specs/templates/clarification.md`):
   1. Ambigüedades
   2. Contradicciones entre requisitos
   3. Escenarios de prueba faltantes
   4. Conflictos con la constitución
4. Revisa también: requisitos que no siguen EARS, adjetivos que no se pueden medir, requisitos con dos comportamientos, RF que no se pueden verificar, fuera de alcance ausente o vago.
5. **Audita los escenarios de prueba** contra `specs/templates/scenarios.md`:
   - RF al que le falta un tipo (happy, borde, falla, seguridad) sin fila `n/a` → **alta**.
   - `n/a` sin motivo, o con un motivo que no se sostiene → **media**.
   - Cambio crítico con seguridad en `n/a` en un RF que toca tenants o permisos → **alta**.
   - Borde o falla evidente del checklist que no está cubierto → **media**.
   - Escenario que no se puede verificar (sin resultado observable en el "entonces") → **media**.

Cada hallazgo lleva severidad (alta / media / baja) y evidencia (`archivo:línea` si sale del repo).

**Solo detecta, no resuelvas.** No reescribas el spec ni propongas soluciones hasta que el usuario lo pida. Cuando el usuario responda, cada hallazgo se cierra en el spec o queda como `[NECESITA ACLARACIÓN]`.

## Rondas y veredicto
- Termina siempre con un veredicto: **"listo para plan"** solo si hay **cero hallazgos altos y cero medios**; si no, **"no listo"**.
- **Cualquier cambio al spec después de una clarificación obliga a una ronda nueva**, aunque el cambio sea para cerrar hallazgos. Cada ronda nueva comprueba que los cierres de la anterior son reales y busca problemas nuevos introducidos por la reescritura.
- Registra cada ronda en la sección "Clarificación" del spec: fecha, veredicto y cómo se cerró cada hallazgo (`specs/templates/clarification.md`).
- Solo con "listo para plan" se pasa a `sdd-plan`.

## Reglas
- Sin halagos; señala el punto ciego.
- Verifica contra el código (`archivo:línea`); no supongas.
- No corras comandos de install, build, lint, tsc, tests, migraciones, seeds ni deploy: dalos en un bloque `bash` (acotados al paquete tocado si se puede), di qué mirar en la salida y espera. Solo lecturas (`grep`, `ls`, `git status`, `git diff`).
- Nunca commits encadenados, push ni merge.
- Para al final y espera la aprobación del usuario.
