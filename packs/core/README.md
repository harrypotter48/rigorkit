# Pack `core` — Economía de tokens

Reglas siempre activas para que cualquier agente diga y lea menos, y scripts que resumen la salida de los comandos para que el agente no los reescriba en cada sesión. Algunas ideas vienen de [caveman](https://github.com/juliusbrussee/caveman) (referencia, no se copia).

## Qué trae
| Tipo | Nombre | Qué hace |
|---|---|---|
| Reglas | `rules.md` | Responder breve (detalle solo si se pide), leer por rangos, filtrar la salida de comandos, estado en archivos. Unos 300 tokens por turno |
| Script | `test-summary <cmd>` | Corre los tests y muestra solo fallos, resumen y código de salida. El log completo queda en `$TMPDIR` |
| Script | `first-error <cmd>` | Muestra solo el primer error con contexto. También lee de stdin |
| Script | `json-peek <archivo> [prof] [ruta]` | Forma de un JSON (claves, tipos, largos de arrays) sin volcarlo. Usa `jq` o, si no está, `python3` |

## Instalar
Solo con `--global`: son preferencias tuyas, no del repo, y el `AGENTS.md` de un repo puede ser compartido con el equipo.
```bash
./install.sh --pack core --agent claude,codex,opencode --global --dry-run
./install.sh --pack core --agent claude,codex,opencode --global
```

| Agente | Archivo donde van las reglas |
|---|---|
| Claude Code | `~/.claude/CLAUDE.md` |
| Codex | `~/.codex/AGENTS.md` (o `$CODEX_HOME/AGENTS.md`) |
| OpenCode | `~/.config/opencode/AGENTS.md` |
| Cursor | No tiene archivo global: pega `rules.md` en *Settings → Rules → User Rules* |

Los scripts van a `~/.local/share/rigorkit/scripts/`.

## No pisa lo que ya tienes
- Las reglas van entre `<!-- rigorkit:core:start -->` y `<!-- rigorkit:core:end -->`. Lo que esté fuera del bloque no se toca.
- Si el bloque ya existe, se reemplaza solo su contenido; si no, se agrega al final. Reinstalar no duplica.
- Antes de cambiar un archivo existente se guarda una copia `.bak`. `--dry-run` muestra el diff sin escribir.
- Para quitarlas: `./install.sh --uninstall-rules --agent claude,codex,opencode` (borra solo el bloque, con `.bak`).

## Medir
Antes y después, en una feature real: `/cost` en Claude Code o el uso de la sesión en OpenCode.
