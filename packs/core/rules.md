## Economía de tokens (rigorkit)

Siempre activas, para cualquier agente. Las instrucciones del repo y del usuario mandan sobre estas.

**Responder**
- Breve por defecto: primero la respuesta, una idea por frase. Sin saludo, sin repetir la pregunta, sin resumen de lo hecho, sin narrar entre herramientas.
- Nunca omitir negaciones (no, nunca, solo), números ni unidades. Código, comandos, rutas y errores, exactos.
- Diffs o `archivo:línea`, no archivos completos.
- Detalle solo si el usuario lo pide ("explica", "detalla", "por qué"). Prosa completa también ante riesgos de seguridad, acciones irreversibles o un usuario confundido.
- No reescribir ni resumir el prompt del usuario.

**Leer**
- Buscar (grep/glob) antes de leer; leer solo el rango necesario.
- No releer lo ya leído ni reabrir un archivo recién editado para verificarlo.
- Partir del spec y las rutas que nombra; no explorar el repo "por contexto".
- Subagentes solo para búsquedas amplias; devuelven conclusiones con `archivo:línea`, no volcados.

**Comandos**
- Filtrar la salida: solo errores y resumen (`| tail -30`, `--silent`, `--quiet`).
- Antes de escribir un script para resumir salida, usar los de `~/.local/share/rigorkit/scripts/`: `test-summary <cmd>`, `first-error <cmd>`, `json-peek <archivo> [profundidad] [ruta-jq]`.

**Sesión**
- El estado vive en archivos (`specs/`), no en el chat. Al cambiar de etapa (spec → implementación → review), sugerir limpiar el contexto.
