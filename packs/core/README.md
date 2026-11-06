# core — Project process and token economy
Project initialization/context skills, plus always-on reading/reply rules and reusable command-output helpers. Some ideas reference [caveman](https://github.com/juliusbrussee/caveman); its skills are not copied.

Lane: none. `core` provides shared project capabilities and global rules, not a work-type process. Software is the only implemented lane. The configured vault is available at every station, but consulted by relevant topic/decision only. Reuse unchanged evidence; revisit affected sources when code or scope changes. Helpers do not authorize browser, Docker, e2e or other commands outside the approved test boundary.

| Item | Purpose |
|---|---|
| [core-init](skills/core-init/SKILL.md) | Interview and propose project initialization/adoption; local minimal template, approval before writes |
| [core-context](skills/core-context/SKILL.md) | Reference: read relevant configuration, department duties and capability gaps; no writes or dispatch |
| rules.md | Brief replies, scoped reads, filtered output, file state; at most 300 estimated tokens per turn |
| test-summary <cmd> | Run tests; failures, summary and exit code only; full log in $TMPDIR |
| first-error <cmd> | First error with context; also accepts stdin |
| json-peek <file> [depth] [path] | JSON keys/types/array lengths, not a dump; jq with python3 fallback |

## Install
Skills may be installed per project or globally. For a software project:
```bash
./install.sh --pack core,sdd --agent claude,codex,opencode --project ~/code/my-repo
```
Ask the agent for core-init; it proposes `.rigorkit/project.yaml` and an optional AGENTS diff before writes. Configuration-only never calls sdd-init. Full initialization offers software setup/adoption under their existing gates. No prompts lane/parser/workflow runtime or automatic installation is shipped. Missing context skill/config evidence is reported, not silently interpreted as approval.

Rules and helpers remain global only: personal preferences must not enter shared repo instructions.
```bash
./install.sh --pack core --agent claude,codex,opencode --global --dry-run
./install.sh --pack core --agent claude,codex,opencode --global
```
Rules: Claude ~/.claude/CLAUDE.md; Codex ~/.codex/AGENTS.md (or $CODEX_HOME/AGENTS.md); OpenCode ~/.config/opencode/AGENTS.md. Cursor has no global file: paste rules.md in Settings → Rules → User Rules. Scripts: ~/.local/share/rigorkit/scripts/.

Only the block between `<!-- rigorkit:core:start -->` and `<!-- rigorkit:core:end -->` is replaced, or appended when absent; reinstall never duplicates it. Outside content stays intact. Existing files get .bak before change; --dry-run shows diff without writes.
Remove only rule blocks, with backups: `./install.sh --uninstall-rules --agent claude,codex,opencode`. Compare real-feature usage before/after using Claude Code /cost or OpenCode session usage.
