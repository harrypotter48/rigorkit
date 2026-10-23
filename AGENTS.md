# AGENTS.md — rigorkit

## Proyecto
Monorepo de skills y agentes para agentes de IA (Claude Code, Codex, Cursor, OpenCode), organizado en packs por tema (`packs/<tema>/`). Sin build: son archivos Markdown y un instalador en bash (`install.sh`).

## Estructura
```
packs/<tema>/
  README.md            qué trae el pack y cómo se usa
  skills/<nombre>/     SKILL.md (+ plantillas, checklists, referencias)
  agents/<nombre>.md   agentes en formato neutro (install.sh los convierte)
  rules.md             opcional: reglas globales (solo --global, entre marcadores)
  scripts/<nombre>     opcional: scripts que las reglas nombran (~/.local/share/rigorkit/scripts/)
install.sh
```

## Reglas para skills
- Formato Agent Skills: `skills/<nombre>/SKILL.md` con frontmatter `name` y `description`.
- `name`: minúsculas, números y guiones, ≤64 caracteres, **igual al nombre de la carpeta**. Con prefijo del pack (`sdd-…`, `arch-…`, `frontend-…`). Los agentes también llevan el prefijo del pack.
- `description`: ≤1024 caracteres. Dice qué hace **y cuándo usarla** (frases con las que la pediría un usuario).
- `description` siempre **entre comillas simples** (`description: '…'`, con `''` para un apóstrofo): un `: ` sin comillas rompe el YAML y los parsers estrictos (OpenCode) descartan la skill.
- Cada skill declara su **rol del top 1%** y termina en un punto de parada que espera la aprobación del usuario.
- Excepción: las skills de **referencia** (conocimiento que aplica otra skill, ej. `arch-boundaries`) lo dicen al inicio (`**Tipo: referencia.**`) y no tienen rol ni punto de parada propio: manda el de quien la carga.
- Cada skill es autocontenida: los archivos que usa viven en su carpeta. No referencies archivos de otra skill.
- **Entre packs, dependencia blanda**: una skill invoca skills o agentes de otro pack **por nombre**, nunca por ruta, y si no están disponibles lo dice en una línea y sigue. Ningún pack deja de funcionar porque falte otro.
- Contenido en español; identificadores y nombres de archivo en inglés.

## Reglas para agentes (formato neutro)
```markdown
---
name: <nombre>
description: <qué hace y cuándo usarlo>
readonly: true            # opcional: el instalador le quita permisos de escritura
tier: barato | fuerte     # opcional: nivel de modelo, nunca un modelo concreto
---
<instrucciones>
```
- `tier` no nombra modelos: cada usuario los mapea por herramienta en `~/.config/rigorkit/models`. Sin mapeo, el agente usa el modelo de la sesión. Exploradores `barato`, revisores `fuerte`.
- Todo agente declara su **rol del top 1%**.
- Los revisores son `readonly`. Como en ese modo no pueden correr `git`, el diff se lo pasa quien los invoca. Tienen modo revisión (diff: hallazgos introducidos vs preexistentes, severidad y veredicto) y modo auditoría (carpeta: deuda por regla).
- Una sola línea por campo de frontmatter. Si un agente necesita algo que el formato neutro no cubre, se amplía `install.sh`, no se escriben versiones por herramienta a mano.

## Reglas generales
- Los cambios siguen el proceso SDD del propio pack `sdd`: `specs/`, con la constitución en `specs/constitution.md`.
- Nada de código, nombres internos ni datos de negocio de ningún trabajo: todo genérico.
- Nada de secrets.
- Las skills de terceros no se copian: se referencian desde el README del pack.
- Algo entra al kit cuando es un procedimiento que un agente debe ejecutar o se repite en varios proyectos.
- Al cambiar `install.sh`, prueba con `--dry-run` en `--project` y en `--global`.
- `install.sh` nunca reemplaza un archivo de instrucciones del usuario: solo escribe entre `<!-- rigorkit:<pack>:start/end -->` y guarda `.bak`.
- Las reglas globales (`rules.md`) se pagan en cada turno: cortas, unos 300 tokens.
