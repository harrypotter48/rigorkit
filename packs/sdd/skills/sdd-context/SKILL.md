---
name: sdd-context
description: 'Etapa 1 de SDD: resume el área afectada con archivo:línea, contratos, consumidores y límites arquitectónicos. Lee contexto pertinente y consulta learnings y vault por tema cuando hacen falta. Úsala al empezar un cambio ya triado o al entrar a un código desconocido.'
---

# sdd-context — Etapa 1: contexto

Actúa como un **ingeniero senior del top 1% que entra a un código que no conoce**.

## Qué hace
1. Lee instrucciones aplicables y `specs/constitution.md` completas; localiza y lee las secciones pertinentes de capabilities, baselines y `specs/half-wired.md`. No cargues módulos ajenos al impacto.
2. Cuando una decisión o duda requiera conocimiento previo, busca por tags en el vault registrado y `specs/learnings/`. Respeta las instrucciones del vault; traduce el tema con `Tags.md` si existe, busca solo líneas `tags:` en `knowledge/`, `decisions/` y learnings y abre las coincidencias pertinentes. Sin coincidencias, busca por nombre de archivo; sin vault, usa el repo. Reutiliza resultados vigentes ya leídos; el repo manda.
3. Explora el código real: contratos, productores, consumidores y límites entre capas, también fuera del área inicial cuando haya dependencias. Amplía la lectura si el impacto no está claro; registra lo que no puedas confirmar. No inventes rutas.
4. Si es útil, delega la exploración en el agente `sdd-explorer` (solo lectura).

## Salida
- **Qué existe hoy**: cada afirmación con `archivo:línea`.
- **Reglas que aplican**: principios de la constitución, rutas críticas tocadas, features a medias relacionadas, learnings y notas del vault que apliquen.
- **Qué no sé**: lista de dudas.

Este resumen alimenta el **plan**, no el spec (el spec no lleva referencias al código). No escribas código ni archivos.

## Reglas
- Sin halagos; señala el punto ciego.
- Verifica contra el código (`archivo:línea`); no supongas.
- No corras comandos de install, build, lint, tsc, tests, migraciones, seeds ni deploy: dalos en un bloque `bash` (acotados al paquete tocado si se puede), di qué mirar en la salida y espera. Solo lecturas (`grep`, `ls`, `git status`, `git diff`).
- Nunca commits encadenados, push ni merge.
- Para al final y espera la aprobación del usuario.
