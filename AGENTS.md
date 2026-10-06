# AGENTS.md — rigorkit

## Proyecto
Monorepo de skills y agentes para agentes de IA (Claude Code, Codex, Cursor, OpenCode), organizado en packs por tema (`packs/<tema>/`). Sin build: son archivos Markdown y un instalador en bash (`install.sh`).

## Estructura
```
packs/<tema>/
  README.md            qué trae el pack y cómo se usa
  skills/<nombre>/     SKILL.md (+ plantillas, checklists, referencias)
  agents/<nombre>.md   agentes en formato neutro (install.sh los convierte)
install.sh
```

## Reglas para skills
- Formato Agent Skills: `skills/<nombre>/SKILL.md` con frontmatter `name` y `description`.
- `name`: minúsculas, números y guiones, ≤64 caracteres, **igual al nombre de la carpeta**. Con prefijo del pack (`sdd-…`).
- `description`: ≤1024 caracteres. Dice qué hace **y cuándo usarla** (frases con las que la pediría un usuario).
- `description` siempre **entre comillas simples** (`description: '…'`, con `''` para un apóstrofo): un `: ` sin comillas rompe el YAML y los parsers estrictos (OpenCode) descartan la skill.
- Cada skill declara su **rol del top 1%** y termina en un punto de parada que espera la aprobación del usuario.
- Cada skill es autocontenida: los archivos que usa viven en su carpeta. No referencies archivos de otra skill.
- Contenido en español; identificadores y nombres de archivo en inglés.

## Reglas para agentes (formato neutro)
```markdown
---
name: <nombre>
description: <qué hace y cuándo usarlo>
readonly: true            # opcional: el instalador le quita permisos de escritura
---
<instrucciones>
```
Una sola línea por campo de frontmatter. Si un agente necesita algo que el formato neutro no cubre, se amplía `install.sh`, no se escriben versiones por herramienta a mano.

## Reglas generales
- Nada de código, nombres internos ni datos de negocio de ningún trabajo: todo genérico.
- Nada de secrets.
- Las skills de terceros no se copian: se referencian desde el README del pack.
- Algo entra al kit cuando es un procedimiento que un agente debe ejecutar o se repite en varios proyectos.
- Al cambiar `install.sh`, prueba con `--dry-run` en `--project` y en `--global`.
