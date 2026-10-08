---
name: sdd-explain
description: 'Explica un cambio SDD de forma visual: resumen en texto, diagramas Mermaid elegidos según el cambio, recorrido con archivo:línea, mapa RF → código y lo que quedó fuera. Lo escribe en explain.md junto al cambio. Úsala al final de sdd-archive cuando el cambio lo amerita, o cuando el usuario pida "explícame el cambio", "diagrama del cambio" o algo para contarlo a otros.'
---

# sdd-explain — Explicar el cambio

Actúa como un **ingeniero del top 1% que explica un sistema a alguien que no estuvo en el cambio**: claro, visual y sin relleno.

## Cuándo
- **Lo amerita**: arquitectura o cambio de modelo de datos, multi-repo, un flujo nuevo o varias capas tocadas (DB → API → DTO → front).
- **No lo amerita**: bugfix, ajuste o feature chica de una sola capa. Dilo en una línea y no generes nada, salvo que el usuario lo pida.

## Qué hace
1. Lee el cambio: `spec.md`, `plan.md`, `tasks.md` y `proposal.md` de los otros repos si es multi-repo, y el diff real (`git log` y `git diff` del cambio).
2. Elige qué diagramas aportan; uno o dos suele bastar:
   - **Antes / después**, si cambió un flujo existente.
   - **Secuencia** del camino principal, si hay varios actores o servicios.
   - **Capas o componentes tocados**, si el cambio cruza capas o repos.
   - **Modelo de datos** (`erDiagram`), si cambió el esquema.
3. Propón el contenido de `explain.md` (estructura abajo) y espera el OK.
4. Con el OK, escríbelo en la carpeta del cambio: `specs/archive/<id>/explain.md` si ya está archivado, o `specs/changes/<id>/explain.md` si no (se mueve con el archive). En multi-repo, solo en el repo dueño, cubriendo todos los repos. Entra en el commit del archive.

## Estructura de `explain.md`
```markdown
# <id> — <título>

## Resumen
<3–5 líneas: qué cambió y por qué, listo para pegar en un PR o en Slack.>

## Diagrama
<uno o dos bloques ```mermaid, máximo 10–12 nodos cada uno>

## Recorrido
<el diagrama paso a paso; cada paso con `archivo:línea` (y repo si es multi-repo)>

## RF → código
| RF | Dónde | Test |
|---|---|---|

## Qué quedó fuera
<fuera de alcance del spec y entradas HW-NN de half-wired.md, o "nada">
```

## Reglas
- **Nada dibujado que no exista**: cada caja y cada flecha salen del código real, con su `archivo:línea` en el recorrido. Si algo no se pudo verificar, se marca como tal.
- Diagramas legibles: máximo 10–12 nodos; si hace falta más, se parte en dos.
- Mermaid estándar (`flowchart`, `sequenceDiagram`, `erDiagram`), que se ve en GitHub y en Obsidian. Etiquetas con caracteres especiales, entre comillas.
- Sin secrets, tokens ni valores de `.env`.
- Sin halagos; señala el punto ciego.
- No corras comandos de install, build, lint, tsc, tests, migraciones, seeds ni deploy. Solo lecturas (`grep`, `ls`, `git status`, `git log`, `git diff`).
- Nunca commits encadenados, push ni merge.
- Para al final y espera la aprobación del usuario.
