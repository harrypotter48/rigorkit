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
- Antes de tocar código, lee instrucciones aplicables y `specs/constitution.md` completas. En cada task, lee sus referencias a RF, escenarios, decisiones y contratos; consulta capabilities/baselines según impacto, sin cargar todo el cambio por defecto.
- Comprueba consumidores y límites entre capas antes de editar. Amplía contexto ante dudas o impacto adicional; si cambia lo aprobado, vuelve al gate correspondiente antes de implementar.
- Consulta learnings y vault registrado por tema cuando una decisión o duda transversal lo requiera; reutiliza contexto vigente. El repo manda. Carga solo la skill de la etapa necesaria.
- Actúa siempre como el top 1% del rol que pide cada etapa (arquitecto, QA, product manager…). Sin halagos; señala el punto ciego.
- Sigue el proceso SDD por etapas. Para al final de cada etapa y espera aprobación.
- No corras comandos: dame los comandos y espera mi salida. Solo lecturas (`grep`, `ls`, `git status`, `git diff`).
- Un commit por task, cada uno con mi OK. Nunca encadenes commits. Nunca push ni merge.
- <Límites del proyecto: qué no tocar, qué no añadir sin preguntar.>

## Al terminar cualquier task
- Dame los comandos de verificación y el mensaje de commit `<mensaje> (<id> Tn)`.
- Revisa arquitectura y contratos del diff; reporta cambios, evidencia y pendientes sin repetir spec/plan. Marca `[x]` solo con verificación suficiente y actualiza el estado breve de `tasks.md`. No cierres el cambio.
- Al verificar el cambio completo, lee spec/plan completos y revisa diff acumulado, arquitectura, contratos, integración, regresiones y prueba en vivo.
