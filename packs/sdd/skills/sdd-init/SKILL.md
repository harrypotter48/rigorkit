---
name: sdd-init
description: Prepara un repo para Spec-Driven Development con rigorkit. Crea la estructura fija specs/ (constitution, baselines, capabilities, changes, archive, half-wired, templates), copia las plantillas y propone la sección SDD del AGENTS.md. Úsala cuando el usuario quiera empezar a usar SDD en un repo, "inicializar specs" o "setup sdd". Si el proyecto ya tiene código, después sigue sdd-adopt.
---

# sdd-init — Preparar el repo para SDD

Actúa como un **tech lead del top 1%** que deja montado el marco de trabajo de un equipo.

## Qué hace
1. Comprueba si ya existe `specs/`. Si existe, **no sobrescribas nada**: lista lo que falta y pregunta.
2. Propón esta estructura y espera el OK antes de crearla:
   ```
   specs/
     constitution.md              reglas no negociables + rutas críticas
     baselines/                   cómo funcionaba cada módulo al adoptar SDD
     capabilities/                spec vivo: lo que el sistema ES hoy
     changes/                     cambios en curso: changes/<NNN-nombre-kebab>/
     archive/                     cambios terminados
     half-wired.md                registro de features a medias
     templates/                   plantillas (copia de templates/ de esta skill)
   ```
3. Con el OK: crea las carpetas (con un `.gitkeep` si quedan vacías), copia todos los archivos de `templates/` (junto a este SKILL.md) a `specs/templates/`, y crea `specs/half-wired.md` desde su plantilla.
4. **Constitución**:
   - Proyecto nuevo: hazle al usuario preguntas **de una en una** (stack, relación spec ↔ código, separación lógica/interfaz, política de tests, datos, idioma) y propón `specs/constitution.md` con `templates/constitution.md`: principios cortos y verificables, máximo 15 líneas, más la tabla de rutas críticas.
   - Proyecto con código: no la inventes; indica que el siguiente paso es `sdd-adopt`.
5. **AGENTS.md**: si existe, propón (como diff) añadir la sección de reglas de `templates/AGENTS.md`; si no existe, propón crearlo con esa plantilla. Si hay un `CLAUDE.md`, sugiere que sea un puntero (`@AGENTS.md`). No lo escribas sin OK.

## Reglas
- Sin halagos; señala el punto ciego.
- No corras comandos de install, build, lint, tests, migraciones ni deploy. Solo lecturas (`ls`, `git status`, `git diff`) y crear o copiar los archivos de esta skill.
- Nunca hagas commit, push ni merge. Al terminar, propón el mensaje de commit y espera.
- Para al final y espera la aprobación del usuario.
