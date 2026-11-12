# Constitution — rigorkit

Language: en

Non-negotiable principles for every spec, plan and task.

1. **Tool-neutral**: Agent Skills (`SKILL.md`), neutral agents converted by `install.sh`; no handwritten tool-specific variants.
2. **Self-contained, soft dependencies**: skill files stay in its folder; invoke other packs by name, never path; their absence never breaks a pack.
3. **Role and stop**: skills (except references) and agents declare a top 1% role; SDD pairs spec→clarify and plan→tasks stop at their shared approval gate; other skills retain their declared stop. Stricter project/user gates win.
4. **Valid YAML**: prefixed `name` matches its folder; English, single-quoted `description`, at most 300 characters, covering purpose, when to use and one or two request phrases. Content is English except Spanish structure aliases and quoted examples.
5. **Generic, no secrets**: no work-project code, internal names, business data or secrets.
6. **Reference, do not copy** third-party skills.
7. **Preserve user files**: installer writes only between markers and keeps `<file>.rigorkit.bak` with the original's mode; never writes a user's own `<file>.bak` and never replaces user instructions.
8. **Context economy**: each `rules.md` has a token estimate at most 300; content loaded every turn costs every turn.

## Critical paths (reinforced DoD)
| Path | Why critical | Critical-path regression |
|---|---|---|
| `install.sh` | Writes user folders/instructions | Project/global dry-runs plus real installation in a temporary folder |
| `packs/*/rules.md` | Loaded every turn in user sessions | Token estimate at most 300 |
| `tools/install-remote.sh` | Downloads and installs rigorkit; writes shell startup files | Install in a temporary HOME: no byte outside markers changes, a re-run adds no second block, a user's own `.bak` stays byte-equal |
| `bin/rigorkit` | Runs helper scripts named by global rules; entry point for `install` | Same checks as `install.sh` through `rigorkit install`; `script` never runs a name with `/`, `..` or a leading `-` |
