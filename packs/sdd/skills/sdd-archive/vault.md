# Vault de conocimiento (opcional)

Cada persona del equipo puede tener su propio vault (Obsidian u otro, notas Markdown) o ninguno. Los learnings del repo (`specs/learnings/`) son la parte compartida. El vault es personal y se alimenta de ellos.

Si el vault tiene su propio `AGENTS.md` (o similar), **sus reglas mandan** sobre lo que dice aquí.

## 1. Detectar
1. Busca el vault registrado en las instrucciones del usuario: las globales (p. ej. `~/.claude/CLAUDE.md`, `~/.codex/AGENTS.md`) y las locales no versionadas del repo (p. ej. `CLAUDE.local.md`). Busca una línea `Vault: <ruta> · entrada: <nota>` o `Vault: no tengo`, o cualquier mención clara a la ruta del vault. Si no indica la nota de entrada, se asume `Home`.
2. Si no hay registro, pregunta **una vez**: "¿Tienes un vault de conocimiento? Dime la ruta y su nota de entrada (p. ej. `Home`), si es nuevo, o si no tienes."
   - **No tiene**: muéstrale los learnings de este cambio como propuesta y no copies nada.
   - **Tiene**: sigue con § Promover.
   - **Empieza de cero**: § Vault desde cero y después § Promover.
3. Con su OK, registra la respuesta en sus instrucciones locales no versionadas (p. ej. `CLAUDE.local.md`), para no volver a preguntar. Comprueba con `git check-ignore` que el archivo no se versiona. Si no está ignorado, propón añadirlo a `.git/info/exclude`.

## 2. Tags
Una sola forma de clasificar: el campo `tags` del frontmatter. No se usa un campo de keywords aparte.
- **Vocabulario**: `Tags.md` en la raíz del vault, una línea por tag con sus sinónimos (`multitenancy — multi-tenant, tenants, aislamiento`). Sin vault, el vocabulario son los tags que ya existen en `specs/learnings/`.
- Usa tags del vocabulario. Si hace falta uno nuevo, propónlo para añadirlo a `Tags.md`, con OK.
- Tags en minúsculas y kebab-case. No repiten el `tipo` (`decision`, `aprendizaje`).

## 3. Buscar (barato)
1. Traduce las palabras del pedido a tags con `Tags.md`, si existe.
2. Busca esos tags **solo en las líneas `tags:`** del frontmatter: en el vault, `knowledge/` y `decisions/`; en el repo, `specs/learnings/`. Por ejemplo: `grep -rl -E '^tags:.*\b(multitenancy|permisos)\b' <carpetas>`.
3. Abre solo las notas que coincidan. Si ninguna coincide, busca por nombre de archivo y nada más. No leas el vault entero.

## 4. Promover
1. Para cada archivo de `specs/learnings/` (también los de compañeros), comprueba si ya está en el vault: busca su ruta en las `fuente:` del vault (`grep -rl 'specs/learnings/<archivo>'`). El estado "promovido" **no** se guarda en el repo, porque depende de cada vault.
2. Lista los que faltan y propón para cada uno:
   - **Dónde**: `decisions/YYYY-MM-DD Título.md` si es `tipo: decision`, o `knowledge/<área>/Título.md` en los demás casos (o la estructura que use su vault).
   - **Contenido**: el del learning, con `fuente: "repo:<repo>/specs/learnings/<archivo>"`. Revisa de nuevo que sea genérico: nada de código, nombres internos, datos de negocio ni secrets.
   - **Desde dónde se enlaza** (§ Conexión).
3. Escribe solo con el visto bueno, nota por nota. Si una nota del vault ya cubre el tema, propón actualizarla en vez de crear otra.

## 5. Conexión con la nota de entrada
En el grafo no puede haber notas aisladas: **toda nota tiene que poder alcanzarse desde la nota de entrada** (`Home` por defecto) siguiendo enlaces, en cualquier nivel. No vale que dos notas se enlacen entre sí sin conexión con la entrada. Quedan fuera las plantillas y los archivos de instrucciones (`AGENTS.md`, `CLAUDE.md`).
1. Antes de escribir, elige la nota padre: la sección que toque de la nota de entrada, o una nota que ya cuelgue de ella (la del proyecto, una nota padre del tema). Inclúyelo en la propuesta.
2. Después de escribir, añade el `[[enlace]]` en la nota padre y comprueba la cadena: desde la nota padre, sigue los enlaces entrantes hasta la nota de entrada. Si no llega, avisa.

## 6. Vault desde cero
Con OK, en la ruta que indique: `Home.md` (secciones Conocimiento y Decisiones, con un enlace a `[[Tags]]`), `Tags.md` (vacío o con los tags de `specs/learnings/`), `knowledge/` y `decisions/`. Nada más.
