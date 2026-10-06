# rigorkit

Skills y agentes para trabajar con agentes de IA con rigor: verificar antes de afirmar, gates con aprobación humana y un Definition of Done claro. Funciona con **Claude Code, Codex, Cursor y OpenCode**.

Está organizado en **packs por tema**. Cada persona instala los que quiera.

| Pack | Qué trae |
|---|---|
| [`sdd`](packs/sdd/README.md) | Spec-Driven Development por etapas: una skill por etapa, plantillas (spec en EARS, plan, tasks, baseline…), checklists y dos subagentes de solo lectura |

## Instalar
```bash
git clone <url-del-repo> rigorkit
cd rigorkit
./install.sh --list
./install.sh --pack sdd --agent claude,cursor --project ~/code/mi-repo
./install.sh --pack sdd --agent claude,codex,cursor,opencode --global
```

| Opción | Qué hace |
|---|---|
| `--pack sdd[,otro]` | Packs a instalar |
| `--agent claude,codex,cursor,opencode` | Agentes destino |
| `--project DIR` | Instala en un repo (por defecto, el directorio actual) |
| `--global` | Instala para tu usuario, en todos los repos |
| `--force` | Sobrescribe lo que ya exista |
| `--dry-run` | Muestra qué haría sin escribir nada |

Para actualizar: `git pull` y volver a instalar con `--force`.

### Dónde instala
| | Skills | Agentes |
|---|---|---|
| Claude Code | `.claude/skills/` | `.claude/agents/*.md` |
| Codex | `.agents/skills/` | `.codex/agents/*.toml` |
| Cursor | `.agents/skills/` | `.cursor/agents/*.md` (o lee `.claude/agents/` si también instalas Claude) |
| OpenCode | `.agents/skills/` | `.opencode/agents/*.md` (global: `~/.config/opencode/agents/`) |

En `--global` las rutas cuelgan de `~`. Las skills se **copian**, no se enlazan, porque los symlinks no son fiables en Cursor ni en Codex. Cada skill instalada lleva un archivo `.rigorkit` que indica su origen.

## Empezar a usar SDD
1. Instala el pack `sdd`.
2. En tu repo, pídele al agente: "usa la skill sdd-init". Si el repo ya tiene código, después "sdd-adopt".
3. Para cada cambio: `sdd-triage` → `sdd-spec` → `sdd-clarify` → `sdd-plan` → `sdd-tasks` → `sdd-tests` → `sdd-implement` (una task por vez) → `sdd-verify` → `sdd-archive`.

El detalle está en [packs/sdd/README.md](packs/sdd/README.md).

## Contribuir
Las reglas para agregar skills, agentes o packs están en [AGENTS.md](AGENTS.md).

## Licencia
MIT, ver [LICENSE](LICENSE). Algunas plantillas del pack `sdd` derivan de [mouredev/hello-sdd](https://github.com/mouredev/hello-sdd) (Apache-2.0): ver [packs/sdd/NOTICE.md](packs/sdd/NOTICE.md).
