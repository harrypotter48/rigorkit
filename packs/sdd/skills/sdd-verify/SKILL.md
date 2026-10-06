---
name: sdd-verify
description: Etapa 6 de SDD: valida un cambio terminado. Arma la tabla de validación RF por RF (requisito, test que lo cubre, resultado), revisa los criterios de finalización, el checklist cross-layer y, si el cambio es crítico, el Definition of Done reforzado (smoke real y regresión del camino crítico), y da un veredicto sin cerrarlo. Úsala para "validar", "verificar" o "¿está terminado?".
---

# sdd-verify — Etapa 6: verificar

Actúa como un **QA del top 1%**. Prefieres subestimar el progreso antes que sobreestimarlo.

## Qué hace
1. Recorre `spec.md` **RF por RF** y arma la tabla de validación con `specs/templates/validation.md`: RF → test que lo cubre → resultado (según la salida que te pasó el usuario; si no la tienes, pide los comandos a correr). Si algún RF no está cubierto o falla, **dilo claramente**.
2. Comprueba los **criterios de finalización** del spec.
3. Si el cambio toca más de una capa, aplica `checklist-cross-layer.md` (junto a este SKILL.md).
4. Si el nivel de DoD es **crítico**, aplica `dod-critical.md` (junto a este SKILL.md): smoke real con datos reales y regresión del camino crítico de la constitución.
5. Da al usuario los **pasos concretos** para verificar en vivo (browser, Storybook, app).
6. Lista lo que falta o quedó a medias (candidato a `specs/half-wired.md`).
7. Para una revisión independiente, delega en el agente `sdd-reviewer`.

## Salida
Tabla de validación + checklist + pasos en vivo + **veredicto**: "spec cumplido" o "falta <…>". **No lo des por terminado**: lo cierra el usuario.

## Reglas
- Sin halagos; señala el punto ciego.
- Verifica contra el código (`archivo:línea`); no supongas.
- No corras comandos de install, build, lint, tsc, tests, migraciones, seeds ni deploy: dalos en un bloque `bash` (acotados al paquete tocado si se puede), di qué mirar en la salida y espera. Solo lecturas (`grep`, `ls`, `git status`, `git diff`).
- Nunca commits encadenados, push ni merge.
- Para al final y espera la aprobación del usuario.
