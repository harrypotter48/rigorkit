# AGENTS.md — rigorkit

## Project
Tool-neutral skills and agents for Claude Code, Codex, Cursor and OpenCode, grouped in `packs/<topic>/`. Markdown plus a Bash installer (`install.sh`); the toolkit needs no build. The isolated Astro/Starlight website lives in `site/` and has its own npm build/test commands.

## Layout
```
packs/<topic>/
  README.md             contents and usage
  skills/<name>/        SKILL.md and local templates/checklists/references
  agents/<name>.md      neutral agents converted by install.sh
  rules.md              optional global rules, --global only, between markers
  scripts/<name>        optional rule helpers installed in ~/.local/share/rigorkit/scripts/
install.sh
site/                  website only; dependencies/generated files never installed as packs
.github/workflows/     website checks and gated Pages publication
```

## Skills
- Agent Skills format: `skills/<name>/SKILL.md`, frontmatter `name` and `description`.
- `name`: lowercase letters/numbers/hyphens, at most 64 characters, matching its folder. Prefix by pack (`sdd-`, `arch-`, `frontend-`); agents use prefixes too.
- `description`: English, at most 300 characters; purpose, when to use it, and one or two request phrases. Always single-quoted; escape apostrophes as `''`. An unquoted `: ` breaks strict YAML parsers such as OpenCode's.
- Every skill declares its top 1% role. SDD pairs spec→clarify and plan→tasks without intermediate approval; each pair ends at its user gate. Other skills stop at their declared gate; stricter project/user gates win. Reference skills instead declare `**Type: reference.**`; they have no role/stop of their own and follow the caller.
- Self-contained: files used by a skill live in its folder; never read another skill's files.
- Between packs, invoke skills/agents by name, never path. If absent, say so in one line and continue; no pack requires another to function.
- Content is English, except Spanish structure aliases and quoted examples. Identifiers and filenames are English.

## Neutral agents
```markdown
---
name: <name>
description: '<purpose and activation>'
readonly: true            # optional: installer removes write permissions
tier: cheap | strong      # optional, never a concrete model
---
<instructions>
```
- Users map tiers per tool in `~/.config/rigorkit/models`; without a mapping, inherit the session model. Explorers use cheap, reviewers strong. Spanish aliases `barato`/`fuerte` remain supported; English keys take precedence.
- Every agent declares its top 1% role. Reviewers are readonly and cannot run git; callers provide the diff. Review mode distinguishes introduced/pre-existing findings with severity/verdict; audit mode lists folder debt by rule.
- One line per frontmatter field. Extend `install.sh` for missing neutral-format capabilities; never handwrite tool-specific variants.

## General rules
- Follow the SDD pack's process under `specs/`; `specs/constitution.md` governs.
- Generic content only: no work-project code, internal names, business data or secrets.
- Reference third-party skills from the pack README; do not copy them.
- Add procedures agents must execute or practices reused across projects.
- Changes to `install.sh` require `--dry-run` in both `--project` and `--global` modes.
- Never replace user instructions: `install.sh` writes only between `<!-- rigorkit:<pack>:start/end -->` markers and keeps `.bak`.
- Each `rules.md` must have a token estimate at most 300; global rules cost context every turn.

## Website development
- Public docs are generated only from the main README and pack Markdown. Never copy internal specs/tools into website pages or search.
- Author public docs in their repository source. `site/src/content/docs/docs/` is importer-owned generated content; never edit/commit it.
- Node 24 and all website packages stay in site/. User runs `npm --prefix site run check`, `test:unit`, `test:browser`, `check:site`, build and preview; see site/README.md.
- Tests run against real production and isolated fixture builds. Upload only the restored/checked normal site/dist output, never fixtures.
- Feature branches/PRs cannot publish. User confirms Pages settings/default branch and performs push/merge; configuration is not deployment evidence.
