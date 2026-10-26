# rigorkit
Tool-neutral skills and agents for rigorous AI-assisted work: verify before claiming, human approval gates and explicit Definition of Done. Supports Claude Code, Codex, Cursor and OpenCode. Install only the topic packs you need.

| Pack | Contents |
|---|---|
| [core](packs/core/README.md) | Global token-economy rules and test/error/JSON summary helpers; --global only |
| [sdd](packs/sdd/README.md) | Reviewed specs, joint plan/block approval, functional-block delivery and selective context; templates, checks and two readonly agents |
| [architecture](packs/architecture/README.md) | Layers/hexagonal, plugin registry, architecture review/audit |
| [frontend](packs/frontend/README.md) | React/Next.js folders/names/routes/barrels, frontend review/audit |

## Install
```bash
git clone <repository-url> rigorkit
cd rigorkit
./install.sh --list
./install.sh --pack sdd --agent claude,cursor --project ~/code/my-repo
./install.sh --pack sdd --agent claude,codex,cursor,opencode --global
./install.sh --pack all --agent claude,cursor --project ~/code/my-repo --force
./install.sh --pack core --agent claude,codex,opencode --global --dry-run
```
| Option | Meaning |
|---|---|
| --pack sdd[,other] | Select packs; all cannot be combined with names |
| --agent claude,codex,cursor,opencode | Target tools |
| --project DIR | Install into repository; default current directory |
| --global | User-wide installation |
| --force | Overwrite existing installed files |
| --dry-run | Show planned actions, rule diff; no writes |
| --uninstall-rules | Remove only rigorkit global rule blocks |
Update with git pull, then reinstall --force. --pack all --force replaces installed packs and adds new ones.

## Destinations
| Tool | Skills | Agents |
|---|---|---|
| Claude Code | .claude/skills/ | .claude/agents/*.md |
| Codex | .agents/skills/ | .codex/agents/*.toml |
| Cursor | .agents/skills/ | .cursor/agents/*.md; reads .claude/agents/ if Claude also selected |
| OpenCode | .agents/skills/ | .opencode/agents/*.md; global ~/.config/opencode/agents/ |
Global paths start at ~. Skills are copied, not symlinked (unreliable in Cursor/Codex); .rigorkit records origin. Cursor/OpenCode may see duplicate skills when .claude/skills and .agents/skills coexist.
Global core rules use markers in ~/.claude/CLAUDE.md, ~/.codex/AGENTS.md and ~/.config/opencode/AGENTS.md, preserving outside content; see [core](packs/core/README.md).

## Optional model tiers
Agents declare cheap/strong, never a fixed model. Configure per tool in ~/.config/rigorkit/models and reinstall --force:
```
claude.cheap=haiku
claude.strong=opus
opencode.cheap=<provider/model>
```
Legacy barato/fuerte tiers and keys still work; English keys take precedence, even when empty (inherit session). Missing file/tool mapping also inherits session; one-model/free-model setups need none. Override path with RIGORKIT_MODELS.

## SDD and packs
Install `sdd`, then ask for `sdd-init`. For existing code, continue with `sdd-adopt`.

Change flow:

1. `sdd-triage`
2. `sdd-spec` → `sdd-clarify` automatically; user approves the clarified spec
3. `sdd-plan` → `sdd-tasks` automatically; user approves the plan and functional blocks
4. `sdd-tests` for the selected block; user supplies intended-red evidence
5. `sdd-implement` (the approved functional block, tasks tracked internally)
6. `sdd-verify` (whole-change integration and live checks)
7. `sdd-archive`

You approve WHAT after the spec has been clarified, then HOW after the plan and block tasks are ready. Unresolved decisions come back to you before proceeding. Internal tasks are a checklist: implementation and review cover the approved functional block, with user-run checks and explicit approval for every commit.

Reuse verified context while its source is unchanged; read referenced sections and expand when evidence is missing, dependencies change or risk grows. Whole-change integration, critical-path checks and live verification remain required. See [functional blocks](packs/sdd/README.md#functional-blocks) and [selective context](packs/sdd/README.md#selective-context-global-verification).


Process skills have roles/stops; paired SDD stages share their approval gate. Reference skills (`arch-boundaries`, `frontend-structure`) supply knowledge and follow their caller's stop. Readonly reviewers inspect diffs or audit folder debt. Cross-pack dependencies are soft, by name: absent packs are reported and SDD performs relevant checks itself. Implementation/verification uses architecture reviewer and frontend reviewer for .tsx/.jsx/app/ changes.

Ask for "audita la arquitectura de src/" or "audita la estructura del front". Contribution rules: [AGENTS.md](AGENTS.md).

## Website
The intended GitHub Pages address is [harrypotter48.github.io/rigorkit](https://harrypotter48.github.io/rigorkit/). Publication requires enabling Pages and a successful primary-branch workflow; configuration alone does not mean the site is live.
The website regenerates documentation, pack summaries and search from this README and pack Markdown during CI builds. A push to main publishes the checked result through GitHub Actions when Pages is configured; feature branches and PRs only run checks. Internal specs are excluded from its pages/search. See [website maintenance](site/README.md) for local setup, checks and publishing prerequisites.

## License
MIT: [LICENSE](LICENSE). Some SDD templates derive from [hello-sdd](https://github.com/mouredev/hello-sdd), Apache-2.0; see [NOTICE](packs/sdd/NOTICE.md).
