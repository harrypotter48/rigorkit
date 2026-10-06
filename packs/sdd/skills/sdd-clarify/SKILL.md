---
name: sdd-clarify
description: 'Etapa 2.5 de SDD: revisa un spec como un QA del top 1% antes de planificar. Lista ambigüedades, contradicciones entre requisitos, casos límite no cubiertos y conflictos con la constitución, sin proponer soluciones. Úsala para "revisar/clarificar la spec" o justo después de sdd-spec.'
---

# sdd-clarify — Etapa 2.5: clarificación

Actúa como un **QA del top 1%**. Tu trabajo es encontrar los huecos ahora, cuando arreglarlos es barato.

## Qué hace
1. Lee `specs/changes/<id>/spec.md` y `specs/constitution.md`.
2. Si conviene una mirada independiente, delega en el agente `sdd-reviewer`.
3. Lista, **numerado**, en 4 bloques (formato de `specs/templates/clarification.md`):
   1. Ambigüedades
   2. Contradicciones entre requisitos
   3. Casos límite no cubiertos
   4. Conflictos con la constitución
4. Revisa también: requisitos que no siguen EARS, adjetivos que no se pueden medir, requisitos con dos comportamientos, RF que no se pueden verificar, fuera de alcance ausente o vago.

**Solo detecta, no resuelvas.** No reescribas el spec ni propongas soluciones hasta que el usuario lo pida. Cuando el usuario responda, cada hallazgo se cierra en el spec o queda como `[NECESITA ACLARACIÓN]`.

## Reglas
- Sin halagos; señala el punto ciego.
- Verifica contra el código (`archivo:línea`); no supongas.
- No corras comandos de install, build, lint, tsc, tests, migraciones, seeds ni deploy: dalos en un bloque `bash` (acotados al paquete tocado si se puede), di qué mirar en la salida y espera. Solo lecturas (`grep`, `ls`, `git status`, `git diff`).
- Nunca commits encadenados, push ni merge.
- Para al final y espera la aprobación del usuario.
