# core — Token economy
Always-on reading/reply rules and reusable command-output helpers. Some ideas reference [caveman](https://github.com/juliusbrussee/caveman); its skills are not copied.

Lane: none. `core` carries the global rules every session reads; it is not a track of work.

| Item | Purpose |
|---|---|
| rules.md | Brief replies, scoped reads, filtered output, file state; at most 300 estimated tokens per turn |
| test-summary <cmd> | Run tests; failures, summary and exit code only; full log in $TMPDIR |
| first-error <cmd> | First error with context; also accepts stdin |
| json-peek <file> [depth] [path] | JSON keys/types/array lengths, not a dump; jq with python3 fallback |

## Install
Global only: personal preferences must not enter shared repo instructions.
```bash
./install.sh --pack core --agent claude,codex,opencode --global --dry-run
./install.sh --pack core --agent claude,codex,opencode --global
```
Rules: Claude ~/.claude/CLAUDE.md; Codex ~/.codex/AGENTS.md (or $CODEX_HOME/AGENTS.md); OpenCode ~/.config/opencode/AGENTS.md. Cursor has no global file: paste rules.md in Settings → Rules → User Rules. Scripts: ~/.local/share/rigorkit/scripts/.

Only the block between `<!-- rigorkit:core:start -->` and `<!-- rigorkit:core:end -->` is replaced, or appended when absent; reinstall never duplicates it. Outside content stays intact. Existing files get .bak before change; --dry-run shows diff without writes.
Remove only rule blocks, with backups: `./install.sh --uninstall-rules --agent claude,codex,opencode`. Compare real-feature usage before/after using Claude Code /cost or OpenCode session usage.
