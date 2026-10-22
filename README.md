# rigorkit

Skills y agentes para trabajar con agentes de IA con rigor: verificar antes de afirmar, gates con aprobación humana y un Definition of Done claro. Funciona con **Claude Code, Codex, Cursor y OpenCode**.

Está organizado en **packs por tema**. Cada persona instala los que quiera.

| Pack | Qué trae |
|---|---|
| [`core`](packs/core/README.md) | Economía de tokens: reglas globales para que el agente diga y lea menos, y scripts que resumen la salida de tests, errores y JSON. Solo `--global` |
| [`sdd`](packs/sdd/README.md) | Spec-Driven Development por etapas: una skill por etapa, plantillas (spec en EARS, plan, tasks, baseline…), checklists y dos subagentes de solo lectura |
| [`architecture`](packs/architecture/README.md) | Referencias de capas/hexagonal y registry de plugins, y `arch-reviewer`, que revisa límites y dependencias; `sdd-implement` y `sdd-verify` lo usan si está instalado |
| [`frontend`](packs/frontend/README.md) | Estructura y nombres en React/Next.js (páginas, componentes, sufijos, barriles) y `frontend-reviewer`, que la revisa o audita la deuda; `sdd-implement` y `sdd-verify` lo usan si el diff toca el front |

## Instalar
```bash
git clone <url-del-repo> rigorkit
cd rigorkit
./install.sh --list
./install.sh --pack sdd --agent claude,cursor --project ~/code/mi-repo
./install.sh --pack sdd --agent claude,codex,cursor,opencode --global
./install.sh --pack all --agent claude,cursor --project ~/code/mi-repo --force
./install.sh --pack core --agent claude,codex,opencode --global --dry-run
```

| Opción | Qué hace |
|---|---|
| `--pack sdd[,otro]` | Packs a instalar. `all` instala todos (no se combina con otros nombres) |
| `--agent claude,codex,cursor,opencode` | Agentes destino |
| `--project DIR` | Instala en un repo (por defecto, el directorio actual) |
| `--global` | Instala para tu usuario, en todos los repos |
| `--force` | Sobrescribe lo que ya exista |
| `--dry-run` | Muestra qué haría sin escribir nada (con reglas, el diff) |
| `--uninstall-rules` | Quita solo los bloques de reglas de rigorkit de los archivos globales |

Para actualizar: `git pull` y volver a instalar con `--force`. Con `--pack all --force` se sobrescribe lo que ya tenías (por ejemplo, `sdd`) y se instalan los packs nuevos.

### Dónde instala
| | Skills | Agentes |
|---|---|---|
| Claude Code | `.claude/skills/` | `.claude/agents/*.md` |
| Codex | `.agents/skills/` | `.codex/agents/*.toml` |
| Cursor | `.agents/skills/` | `.cursor/agents/*.md` (o lee `.claude/agents/` si también instalas Claude) |
| OpenCode | `.agents/skills/` | `.opencode/agents/*.md` (global: `~/.config/opencode/agents/`) |

En `--global` las rutas cuelgan de `~`. Las skills se **copian**, no se enlazan, porque los symlinks no son fiables en Cursor ni en Codex. Cada skill instalada lleva un archivo `.rigorkit` que indica su origen.

Las reglas globales (pack `core`) van entre marcadores en `~/.claude/CLAUDE.md`, `~/.codex/AGENTS.md` y `~/.config/opencode/AGENTS.md`, sin tocar el resto del archivo. Detalle en [packs/core/README.md](packs/core/README.md).

### Modelo por agente (opcional)
Los agentes declaran un nivel (`tier: barato` o `fuerte`), no un modelo. Si quieres un modelo distinto por nivel, créalo en `~/.config/rigorkit/models` y reinstala con `--force`:
```
claude.barato=haiku
claude.fuerte=opus
opencode.barato=<proveedor/modelo>
```
Sin ese archivo, o sin la línea de una herramienta, los agentes usan el modelo de la sesión. Con un solo modelo (por ejemplo, uno free en OpenCode) no hace falta nada. Otra ruta: `RIGORKIT_MODELS=/ruta/archivo`.

## Empezar a usar SDD
1. Instala el pack `sdd`.
2. En tu repo, pídele al agente: "usa la skill sdd-init". Si el repo ya tiene código, después "sdd-adopt".
3. Para cada cambio: `sdd-triage` → `sdd-spec` → `sdd-clarify` → `sdd-plan` → `sdd-tasks` → `sdd-tests` → `sdd-implement` (una task por vez) → `sdd-verify` → `sdd-archive`.

El detalle está en [packs/sdd/README.md](packs/sdd/README.md).

## Cómo se combinan los packs
- **Skills de proceso**, como las de `sdd`: tienen rol y punto de parada.
- **Skills de referencia**, como `arch-boundaries` o `frontend-structure`: son conocimiento que aplica otra skill o el usuario, sin parada propia.
- **Revisores**, como `arch-reviewer` o `frontend-reviewer`: agentes de solo lectura con dos modos, uno que revisa un diff y otro que audita una carpeta para medir la deuda.
- **Dependencia blanda**: un pack usa skills o agentes de otro **por nombre** si están instalados; si no, lo dice y sigue. Por ejemplo, con `architecture` y `frontend` instalados, `sdd-implement` (al terminar cada task) y `sdd-verify` les pasan el diff a sus revisores.

Para auditar la deuda de un repo, pídele al agente "audita la arquitectura de `src/`" o "audita la estructura del front".

## Contribuir
Las reglas para agregar skills, agentes o packs están en [AGENTS.md](AGENTS.md).

## Licencia
MIT, ver [LICENSE](LICENSE). Algunas plantillas del pack `sdd` derivan de [mouredev/hello-sdd](https://github.com/mouredev/hello-sdd) (Apache-2.0): ver [packs/sdd/NOTICE.md](packs/sdd/NOTICE.md).
