# AGENTS.md — rigorkit

## Project
Tool-neutral skills and agents for Claude Code, Codex, Cursor and OpenCode, grouped in `packs/<topic>/`. Markdown plus a Bash installer (`install.sh`); the toolkit needs no build. The isolated Astro/Starlight website lives in `site/` and has its own npm build/test commands.

## Factory departments, lanes and packs
- Rigorkit organizes verified work through Understand, Design, Build, Verify and Learn. Departments are responsibilities, not a rigid waterfall: test preparation can precede code and findings can return to earlier work.
- A lane adapts departments to a work type; software is the only implemented lane. Prompts and executable plugin/workflow engines remain deferred.
- A pack distributes named capabilities. sdd provides software activities; design/security/architecture/frontend remain specialists with unchanged triggers and member names. core adds optional project initialization/context alongside unchanged global-only rules/scripts.
- .rigorkit/project.yaml is a project-owned declarative agreement, not execution/approval state. Invoke core-context when available; absent read approved project refs and report routing gaps; no config means legacy SDD. Configuration never grants authority or weakens mandatory reviewers/checks/gates.
- core-init interviews/proposes before approved writes; configuration-only never calls sdd-init. Direct sdd-init/adopt stay usable without core; no auto-migration/installation or project rewriting.
- The pack stays the namespace of its members: `<pack>-<role>`. `--pack` and the pack folders keep their names.
- The factory coordinates stations; SDD remains the method per slice: slice → spec/clarify → design/plan/tasks → tests → build → review/owner acceptance → close/learnings. A HU/ticket describes a useful vertical slice; tasks stay internal. Implement only agreed behavior/constraints, no speculative branches or guessed defaults.
- Every new technical decision needs owner approval before application. Reused repo/vault decisions must be communicated with their source and applicability; conflicts/uncertainty return to the owner. Accept each slice separately; never infer authority for another slice, commit, push or merge.
- Consult the configured vault/repo learnings selectively whenever needed at any station; reuse valid context, repo wins. Repo-specific facts stay in the repo, reusable team lessons in specs/learnings/, cross-project vault promotion only with approval.
- Agents may run existing scoped unit/integration tests. Browser/Docker/e2e need an explicit request; installation/build/lint/typecheck/migrations/seeds/deploy require separate authorization. Missing infrastructure means pending evidence. Stricter project/user gates win.
- Pin owner-approved test(red) hash/base/test paths; builder never edits frozen tests. Amendments need owner approval and cited test(amend); applicable integrity/trace checks precede reviewers. Missing or stale evidence is pending, not green; owner alone accepts each slice.
- Public documentation describes the factory, its lanes and every member with its current name; a change that adds, renames or removes a member corrects the affected README in the same change.
- `VERSION` at the repository root is the only copy of the version (semantic versioning, bumped by hand). `install.sh --version` prints it, `--list` shows the local and installed versions, and the installer records the installed version in `.rigorkit-version` at the scope root.

## Layout
```
packs/<topic>/
  README.md             contents and usage
  skills/<name>/        SKILL.md and local templates/checklists/references
  agents/<name>.md      neutral agents converted by install.sh
  rules.md              optional global rules, --global only, between markers
  scripts/<name>        optional rule helpers installed in ~/.local/share/rigorkit/scripts/
install.sh
VERSION                  single source of the toolkit version (semver)
site/                  website only; dependencies/generated files never installed as packs
.github/workflows/     website checks and gated Pages publication
```

## Skills
- Agent Skills format: `skills/<name>/SKILL.md`, frontmatter `name` and `description`.
- `name`: lowercase letters/numbers/hyphens, at most 64 characters, matching its folder. The name starts with its pack name (`core-`, `sdd-`, `architecture-`, `frontend-`, `design-`, `security-`); agents and skills follow the same rule.
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
- Every agent declares its top 1% role in its body. Reviewers are readonly and cannot run git; callers provide the diff. Builders write and omit `readonly`. Review mode distinguishes introduced/pre-existing findings with severity/verdict; audit mode lists folder debt by rule.
- One line per frontmatter field. Extend `install.sh` for missing neutral-format capabilities; never handwrite tool-specific variants.

## General rules
- Follow the SDD pack's process under `specs/`; `specs/constitution.md` governs.
- Generic content only: no work-project code, internal names, business data or secrets.
- Reference third-party skills from the pack README; do not copy them.
- Add procedures agents must execute or practices reused across projects.
- The content check reports a member whose name does not start with its pack name, and an agent whose body omits its top 1% role.
- **Content ratchet**: `node tools/measure-content.mjs --root . --baseline specs/changes/006-factory-v2/baseline.txt` compares the current content with the ratchet baseline (0% growth over every pack it contains, and a new pack needs a new baseline). Growth is a decision, not an accident: capture a new baseline with `node tools/capture-baseline.mjs --source <commit> --output <file> --target 0` after the owner approves it. The archived baselines of changes 001 and 005 remain historical evidence; the active 006 baseline registers sdd-slice and tightens SDD to 14,404 estimated tokens without increasing any pack budget.
- Changes to `install.sh` require `--dry-run` in both `--project` and `--global` modes.
- Never replace user instructions: `install.sh` writes only between `<!-- rigorkit:<pack>:start/end -->` markers and keeps `.bak`.
- Each `rules.md` must have a token estimate at most 300; global rules cost context every turn.

## Website development
- Public docs are generated only from the main README and pack Markdown. Never copy internal specs/tools into website pages or search.
- Store README illustrations under site/public/images/ and use repository-relative Markdown image links; the importer maps them to raw GitHub source URLs. Author public docs in their repository source. `site/src/content/docs/docs/` is importer-owned generated content; never edit/commit it.
- Node 24 and all website packages stay in site/. Agents may run the existing test:unit suite; website check/build/browser/check:site/preview and installation stay with the user unless explicitly requested. See site/README.md.
- Tests run against real production and isolated fixture builds. Upload only the restored/checked normal site/dist output, never fixtures.
- Feature branches/PRs cannot publish. User confirms Pages settings/default branch and performs push/merge; configuration is not deployment evidence.
