# AGENTS.md — <proyecto>

## Proyecto
<Qué es, en 2-3 frases. Arquitectura y tecnologías.>

## Comandos (los corre el usuario, nunca el agente)
- Ejecutar: `<comando>`
- Tests: `<comando>` (acotado: `<comando por paquete>`)
- Lint / typecheck: `<comando>`

## Estilo y convenciones
<Versión del lenguaje, nombres, idioma del código y de los mensajes.>

## Reglas
- Antes de tocar código, lee `specs/constitution.md`, la capability afectada y el cambio activo en `specs/changes/`.
- Actúa siempre como el top 1% del rol que pide cada etapa (arquitecto, QA, product manager…). Sin halagos; señala el punto ciego.
- Sigue el proceso SDD por etapas. Para al final de cada etapa y espera aprobación.
- No corras comandos: dame los comandos y espera mi salida. Solo lecturas (`grep`, `ls`, `git status`, `git diff`).
- Un commit por task, cada uno con mi OK. Nunca encadenes commits. Nunca push ni merge.
- <Límites del proyecto: qué no tocar, qué no añadir sin preguntar.>

## Al terminar cualquier task
- Dame los comandos de verificación y el mensaje de commit `<mensaje> (<id> Tn)`.
- Reporta qué hiciste, qué falta y qué verifico a mano. No la des por cerrada.
