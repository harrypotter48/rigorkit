# Spec 001 — English and compact content

> Status: approved by user on 2026-10-23 (clarified: round 8, ready for plan) · DoD: critical (touches `install.sh` and `packs/*/rules.md`) · Owner repo: rigorkit · Affected repos: none

> **Declared deviations**:
> - This spec is in English while `specs/constitution.md` and `AGENTS.md` still say "content in Spanish"; this change updates them (RF-14, RF-15).
> - rigorkit has no build: scripted scenarios are covered by `node --test` tests in `tools/test/` (Node's built-in runner, no dependencies; RF-25); the rest are verified by review or live checks, marked `[manual]`.

## Context and goal
rigorkit is public and gaining users, but its content is in Spanish, which limits its reach. It also costs more tokens than needed: every `description` is loaded in every session (18 of 23 exceed 300 characters, max 515), `packs/core/rules.md` is loaded in every turn (≈ 364 tokens, above its own ~300 limit), and bodies, templates and references are loaded on each use. The goal is all of rigorkit in English and measurably more compact, **without changing what skills do**, without breaking projects that already use rigorkit in Spanish (with their own Spanish templates and scripts), and letting each project write its artifacts in its own language.

## Users / actors
- People who install rigorkit (the author, teammates, the GitHub community).
- AI agents that load the skills, agents and rules.
- Existing projects with Spanish artifacts and old copies of templates and `check-scenarios.mjs` (e.g. Synapse).

## User stories
- H1: As a GitHub visitor I want rigorkit in English so I can understand and adopt it.
- H2: As a user I want skills and rules that cost fewer tokens so every session is cheaper.
- H3: As a project that writes in Spanish I want my artifacts in my language and my existing specs, templates and checks to keep working.

## Definitions
- **Content**: every tracked text file under `packs/` (`SKILL.md`, agent files, `README.md`, `NOTICE.md`, `rules.md`, templates, checklists, references, and the user-facing messages of scripts such as `check-scenarios.mjs`), plus the root `README.md` and `AGENTS.md`, and rigorkit's own `specs/`. Not content: `LICENSE`, `CLAUDE.md`, `.gitignore`, `.gitkeep`.
- **Body**: everything in a `SKILL.md` or agent file after the frontmatter.
- **Loaded on use**: for a skill, its body plus every Markdown file in its folder except `NOTICE.md`; for an agent, its body.
- **Token estimate**: Unicode code points after NFC normalization, divided by 4, rounded up.
- **Baseline**: at commit `edad002`, the token estimate of what each skill and agent loads on use (frontmatter excluded), the length of each `description`, the token estimate of each `rules.md`, and the list of skill and agent names, stored in `baseline.txt` in this change's folder.
- **Artifact**: a file a skill writes inside the user's project repository (spec, clarification, plan, tasks, validation, baseline, proposal, half-wired entry, learning, explanation, constitution, `AGENTS.md` section). Not artifacts: templates copied by `sdd-init` (they are copied as they are) and vault notes (the vault's own rules decide).
- **Structure of an artifact**: the fixed strings its template prescribes (headings, header keys and values such as `Status:`/`DoD:`, column names, verdict lines, EARS keywords, markers like `[NEEDS CLARIFICATION]` and `Done when:`), plus the verdict lines that agents prescribe. **Prose**: everything else.
- **Project templates**: the files in the project's `specs/templates/`.
- **Structure language of the project**: the language of its `specs/templates/spec.md`; English if it has none.
- **Chat output**: what a skill or agent says to the user in the conversation (not written to a file).
- **Structure aliases**: for each structural string, its form in the templates and agents at `edad002` (Spanish) and its form after this change (English). The plan derives the table by comparing both versions; it is not written by hand. Each skill or agent that reads a structural string, and `check-scenarios.mjs`, carries inline only the aliases it reads.
- **Declared language**: a non-empty `Language:` value in the project's constitution, read as a language name (`es`, `Spanish`, `es-MX`). An empty or uninterpretable value counts as not declared.
- **User's language**: the language of the user's most recent message that has a recognizable language.
- **Invariants of a skill or agent**: its role, its stop point, its rules (does not run commands, does not chain commits, never pushes or merges, no secrets, verifies against the code), every negation, every number, and the structure of every output format it prescribes (not the language of that structure).

## Functional requirements (EARS)

### Language and compatibility (H1, H3)
- RF-1: The system shall have all content in English, except Spanish structure aliases and quoted examples.
- RF-2: The system shall keep every skill and agent `name` and folder name unchanged.
- RF-3: If an agent file or `~/.config/rigorkit/models` uses `barato` or `fuerte`, then `install.sh` shall treat them as `cheap` and `strong`, and a `cheap`/`strong` key shall take precedence over its alias.
- RF-4: When `install.sh` runs with the same arguments as before this change, the system shall install the same set of files as before.

### Structure of artifacts (H3)
- RF-5: When a skill adds to an existing artifact, the system shall keep the structure its current headings use and the language its current prose uses, including in the sections it adds, within the limit of RF-7.
- RF-6: When a skill creates a new artifact whose template exists in the project templates, the system shall write its structure as in that template.
- RF-7: If the project templates lack an artifact's template or one of its sections, then the skill shall say so and continue without writing that template or section, for new and existing artifacts.
- RF-8: When a skill, agent or script reads the structure of an artifact, the system shall accept both forms of every structure alias.

### Language of prose (H3)
- RF-9: The system shall have a `Language:` field in the constitution template.
- RF-10: When `sdd-init` or `sdd-adopt` creates a constitution, the system shall ask for the project's language and record it in `Language:`.
- RF-11: Where a project has a declared language, the system shall write the prose of every new artifact in that language.
- RF-12: If a project has no declared language, then the system shall write the prose of every new artifact in the user's language.
- RF-13: If neither a declared language nor the user's language can be determined, then the system shall use the language of the change's existing artifacts, or ask the user once if there are none, and use English and say so if the user does not answer.
- RF-14: The system shall have rigorkit's own constitution in English with `Language: en`.

### Rules (H1, H2)
- RF-15: The system shall state in `AGENTS.md` and in the constitution that content is in English, that a `description` is in English with at most 300 characters (what it does, when to use it, and one or two request phrases), and that a `rules.md` has a token estimate of at most 300.

### Compaction (H2)
- RF-16: The system shall keep every skill and agent `description` at 300 characters or fewer.
- RF-17: When this change ends, the token estimate of what is loaded on use shall be at least 30% lower than its baseline in each of the packs `sdd`, `architecture` and `frontend`.
- RF-18: The system shall keep the token estimate of each `rules.md` at or below 300.
- RF-19: The system shall have a measurement script in `tools/` that, for a repository root and a baseline file given as arguments (`--root`, `--baseline`), reports per file and per pack the token estimate, the description lengths, the comparison with the baseline, the skill and agent names that differ from the baseline list, and every `name` that differs from its folder, and exits with an error when the baseline is missing or RF-2, RF-16, RF-17 or RF-18 is not met.
- RF-20: The system shall keep every invariant of every skill and agent.

### Attribution and activation (H1, H3)
- RF-21: The system shall describe, in both copies of `NOTICE.md`, the material derived from third parties as it is after this change.
- RF-22: When a user asks in Spanish for an SDD stage, the system shall activate the matching skill.

### Chat output, code markers and tests
- RF-23: The system shall write chat output of skills and agents in the user's language, except verdict lines, which are structure.
- RF-24: When `sdd-legacy-review` writes a marker in code, the system shall keep the keyword `@legacy` and write the rest of the marker in the structure language of the project.
- RF-25: The system shall have `node --test` tests in `tools/test/`, with fixtures in `tools/fixtures/`, and an ID-named test mentioning `001-english-and-compact` for every scenario that is neither manual nor not-applicable, so that `node packs/sdd/skills/sdd-init/scripts/check-scenarios.mjs specs/changes/001-english-and-compact/spec.md --tests tools/test` reports no missing test.

## Non-functional requirements
- **YAML stays valid**: every frontmatter parses with a strict YAML parser; `description` stays in single quotes.
- **Same behavior**: compaction removes words, not instructions: same steps, same order, same stops.
- **`tools/` is not installed**: `install.sh` only reads `packs/`.

## Test scenarios
### RF-1
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-1.H1 | happy [manual] | the content at the end of the change | the reviewer reads it | it is in English |
| RF-1.E1 | edge [manual] | Spanish alias strings in parsers and quoted examples | the reviewer searches for Spanish | only aliases and quoted examples remain |
| RF-1.F1 | failure [manual] | a content file left in Spanish | the reviewer searches | it is reported by path |
| RF-1.S | security | n/a — no users, tenants or permissions involved | | |
### RF-2
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-2.H1 | happy | a fixture whose names match its baseline list | the script runs | no name differences are reported |
| RF-2.E1 | edge | each frontmatter `name` and its folder | the script compares them | they match |
| RF-2.F1 | failure | a fixture with a skill renamed in folder and `name` | the script runs | the rename is reported and the script exits with an error |
| RF-2.S | security | n/a — names carry no permissions | | |
### RF-3
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-3.H1 | happy [manual] | an agent with `tier: cheap` and `claude.cheap=<model>` | `install.sh` runs in a temp folder | the agent gets `<model>` |
| RF-3.E1 | edge [manual] | a models file with only `claude.barato=<model>` | `install.sh` runs | `cheap` agents get `<model>` |
| RF-3.E2 | edge [manual] | a models file with `claude.barato=A` and `claude.cheap=B` | `install.sh` runs | `cheap` agents get `B` |
| RF-3.F1 | failure [manual] | an agent with `tier: medium` | `install.sh` runs | it fails with a clear message, as today |
| RF-3.S | security | n/a — no credentials involved | | |
### RF-4
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-4.H1 | happy [manual] | `--pack sdd --agent claude,codex,cursor,opencode --project <tmp>` | it runs at `edad002` and at the end | same file list |
| RF-4.E1 | edge [manual] | `--global --dry-run` | it runs before and after | same planned paths |
| RF-4.F1 | failure [manual] | an existing user instructions file | `install.sh --global` runs | it only writes between markers and keeps `.bak` |
| RF-4.S1 | security [manual] | a user file outside rigorkit's targets | `install.sh` runs | it is not touched |
### RF-5
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-5.H1 | happy [manual] | a `half-wired.md` with `## Resueltas` | `sdd-archive` resolves an entry | it adds it under `## Resueltas` |
| RF-5.E1 | edge [manual] | a Spanish spec, then `Language: en` declared | `sdd-clarify` records round 2 | it keeps Spanish structure (`Veredicto:`) and Spanish prose |
| RF-5.E2 | edge [manual] | a spec with English headings and Spanish prose | `sdd-clarify` adds a round | the new heading is English and its prose Spanish |
| RF-5.F | failure | n/a — an existing artifact always has headings and prose to follow | | |
| RF-5.S | security | n/a — no permissions involved | | |
### RF-6
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-6.H1 | happy [manual] | a project with Spanish project templates | `sdd-tasks` creates `tasks.md` | it uses `Hecho cuando:` |
| RF-6.E1 | edge [manual] | English project templates and `Language: es` | `sdd-spec` creates a spec | English structure, Spanish prose |
| RF-6.F | failure | n/a — a missing template or section is RF-7 | | |
| RF-6.S | security | n/a — no permissions involved | | |
### RF-7
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-7.H1 | happy [manual] | Synapse's old `tasks.md` template without "Estado para retomar" | `sdd-tasks` creates a new `tasks.md` | it says the section is missing and writes the tasks without it |
| RF-7.E1 | edge [manual] | an existing Synapse `tasks.md` without that section | `sdd-implement` updates it | it does not add the section and says so |
| RF-7.F1 | failure [manual] | Spanish project templates without `learning.md` | `sdd-archive` wants to write a learning | it does not invent the template and says so |
| RF-7.S | security | n/a — no permissions involved | | |
### RF-8
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-8.H1 | happy | a spec with `## Test scenarios` | the new `check-scenarios` runs | it finds the section |
| RF-8.E1 | edge | a spec with `## Escenarios de prueba` | the new `check-scenarios` runs | it finds the section |
| RF-8.E2 | edge [manual] | a clarification with `Veredicto: listo para plan` | `sdd-plan` starts | it accepts it |
| RF-8.E3 | edge [manual] | an old spec with `## Escenarios de prueba` | `sdd-reviewer` reviews it | it finds and checks the scenarios |
| RF-8.F1 | failure | a spec with neither heading | the new `check-scenarios` runs | it reports the missing section in English |
| RF-8.S | security | n/a — no permissions involved | | |
### RF-9
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-9.H1 | happy [manual] | the constitution template | it is read | it has `Language:` |
| RF-9.E | edge | n/a — the template is one fixed file; an empty value is covered by RF-10.F1 | | |
| RF-9.F | failure | n/a — the template is one fixed file; an unreadable value is covered by RF-11.F1 | | |
| RF-9.S | security | n/a — no permissions involved | | |
### RF-10
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-10.H1 | happy [manual] | a new repo | `sdd-init` runs | it asks the language and records it |
| RF-10.E1 | edge [manual] | an existing repo | `sdd-adopt` proposes the constitution | it asks the language and records it |
| RF-10.F1 | failure [manual] | the user does not answer | the constitution is written | `Language:` is empty and RF-12 applies |
| RF-10.S | security | n/a — no permissions involved | | |
### RF-11
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-11.H1 | happy [manual] | `Language: es` and an English request | `sdd-spec` writes the spec | the prose is in Spanish |
| RF-11.E1 | edge [manual] | `Language: Spanish` | `sdd-spec` writes the spec | it is read as Spanish |
| RF-11.F1 | failure [manual] | `Language: xx-unknown` | `sdd-spec` writes the spec | it counts as not declared (RF-12) |
| RF-11.S | security | n/a — no permissions involved | | |
### RF-12
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-12.H1 | happy [manual] | no `Language:` and a Spanish request | `sdd-spec` writes the spec | the prose is in Spanish |
| RF-12.E1 | edge [manual] | the user switches language between stages | the next artifact is written | it follows the most recent message |
| RF-12.F | failure | n/a — failure to determine the language is RF-13 | | |
| RF-12.S | security | n/a — no permissions involved | | |
### RF-13
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-13.H1 | happy [manual] | no `Language:`, last message "ok", a Spanish spec in the change | `sdd-plan` writes the plan | the prose is in Spanish |
| RF-13.E1 | edge [manual] | no `Language:`, no recognizable message, no artifacts | the first artifact is written | the skill asks the language once |
| RF-13.F1 | failure [manual] | the user does not answer the language question | the artifact is written | it is in English and the skill says so |
| RF-13.S | security | n/a — no permissions involved | | |
### RF-14
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-14.H1 | happy [manual] | rigorkit's constitution | it is read | English with `Language: en` |
| RF-14.E | edge | n/a — one fixed file with one fixed value | | |
| RF-14.F | failure | n/a — one fixed file with one fixed value; wrong text is caught by RF-1 review | | |
| RF-14.S | security | n/a — no permissions involved | | |
### RF-15
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-15.H1 | happy [manual] | `AGENTS.md` and the constitution | they are read | they state the three rules |
| RF-15.E1 | edge [manual] | older limits (`≤1024`, "about 300", "content in Spanish") | the reviewer searches | they no longer appear as rules |
| RF-15.F | failure | n/a — static documents | | |
| RF-15.S | security | n/a — no permissions involved | | |
### RF-16
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-16.H1 | happy | every skill and agent | the script measures descriptions | all are ≤ 300 characters |
| RF-16.E1 | edge | a description of exactly 300 characters | it is measured | it passes |
| RF-16.F1 | failure | a description of 301 characters | it is measured | it is reported and the script exits with an error |
| RF-16.S | security | n/a — no permissions involved | | |
### RF-17
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-17.H1 | happy | the baseline and the final state | the script compares per pack | each of the 3 packs is ≥ 30% lower |
| RF-17.E1 | edge | a pack exactly 30% lower | it is compared | it passes |
| RF-17.F1 | failure | a pack 29% lower | it is compared | it is reported and the script exits with an error |
| RF-17.S | security | n/a — no permissions involved | | |
### RF-18
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-18.H1 | happy | `packs/core/rules.md` | it is measured | ≤ 300 |
| RF-18.E1 | edge | a `rules.md` at exactly 300 | it is measured | it passes |
| RF-18.F1 | failure | a `rules.md` at 301 | it is measured | it is reported and the script exits with an error |
| RF-18.S | security | n/a — no permissions involved | | |
### RF-19
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-19.H1 | happy | the repo and `baseline.txt` | the script runs with `--root` and `--baseline` | it prints per file and per pack, the comparison and name mismatches |
| RF-19.E1 | edge | a fixture with non-ASCII and decomposed characters | it is measured | code points after NFC are counted, not bytes |
| RF-19.F1 | failure | a missing `baseline.txt` | the script runs | it exits with an error message |
| RF-19.S1 | security [manual] | `install.sh --pack core --global --dry-run` | it runs | `tools/` is not in the plan |
### RF-20
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-20.H1 | happy [manual] | each skill and agent at `edad002` and at the end | `sdd-reviewer` compares them | role, stop, rules, negations, numbers and output structure are kept; the only behavior differences are those of RF-5 to RF-13, RF-23 and RF-24 |
| RF-20.E1 | edge [manual] | a negation rephrased ("sin" → "no") | it is compared | it counts as kept |
| RF-20.F1 | failure [manual] | a dropped rule (e.g. "never push") | it is compared | it is reported |
| RF-20.S1 | security [manual] | the "no secrets" rule | it is compared | it is present in every skill that had it |
### RF-21
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-21.H1 | happy [manual] | both copies of `NOTICE.md` | they are read | they say the material was adapted from the original and is now in English |
| RF-21.E | edge | n/a — two identical static files | | |
| RF-21.F | failure | n/a — static documents | | |
| RF-21.S | security | n/a — no permissions involved | | |
### RF-22
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-22.H1 | happy [manual] | "quiero especificar una feature nueva" | the user sends it in Claude Code | `sdd-spec` (or `sdd-triage` first) is activated |
| RF-22.E1 | edge [manual] | "¿dónde quedamos?" | the user sends it | `sdd-resume` is activated, not `sdd-change` |
| RF-22.F1 | failure [manual] | an ambiguous request ("cambia esto") | the user sends it | the agent asks or picks `sdd-change`, not an unrelated skill |
| RF-22.S | security | n/a — no permissions involved | | |
### RF-23
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-23.H1 | happy [manual] | a Spanish request | `arch-reviewer` finds no layer structure | it says so in Spanish |
| RF-23.E1 | edge [manual] | a Spanish project with English structure | `sdd-reviewer` ends a review | the verdict line follows the structure, the rest is in Spanish |
| RF-23.F | failure | n/a — failure to determine the language is RF-13 | | |
| RF-23.S | security | n/a — no permissions involved | | |
### RF-24
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-24.H1 | happy [manual] | a Spanish project | `sdd-legacy-review` marks dead code | `@legacy — confirmado sin uso el <date>…` |
| RF-24.E1 | edge [manual] | an English project | it marks dead code | `@legacy — confirmed unused on <date>…` |
| RF-24.F1 | failure [manual] | a marker without `@legacy` | the review lists markers | it is not listed (the keyword is what is read) |
| RF-24.S | security | n/a — no permissions involved | | |
### RF-25
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-25.H1 | happy | this spec and `tools/test/` | the pack's checker runs with `--tests tools/test` | it reports no missing test |
| RF-25.E1 | edge | a scenario flagged as manual in its type cell | the checker runs | it is not asked for a test |
| RF-25.F1 | failure | a fixture spec with a scripted scenario and no test | the checker runs on it | the scenario is reported as missing a test |
| RF-25.S | security | n/a — tests run locally on fixtures | | |
## Edge cases
- `core` has no bodies → excluded from RF-17.
- Translation alone shrinks text → the estimator counts characters, so most of the 30% must come from real compaction.
- An existing project keeps its old Spanish templates and old `check-scenarios.mjs` → RF-5 and RF-6 keep writing Spanish structure there, so the old checker keeps passing. Updating a project's templates and checker is out of scope.
- A new project with `Language: es` → English structure from the copied templates, Spanish prose (RF-6, RF-11).
- This spec uses `## Test scenarios`, which today's `check-scenarios.mjs` does not recognize → recognized once RF-8 is implemented.

## Known limitation (pre-existing)
Projects whose templates predate rigorkit's current ones (the 5 work repos: requirements as `### R1.`, no scenarios section, no `clarification.md`, `validation.md` or, in 4 of them, `check-scenarios.mjs`) do not fit today's skills either. This change does not fix it: under RF-7 their missing sections are reported and skipped, so their specs cannot reach "ready for plan" until they adopt rigorkit's templates. That is a separate change: an update mode in `sdd-init` plus one migration change per repo.

## Out of scope
- The website (change `002`).
- Declaring `Language:` or updating templates in other repos.
- Translating the vault or changing its registration line.
- New skills, agents or packs; changes to what skills do, except RF-5 to RF-13, RF-23 and RF-24.
- A mode in `sdd-init` to update existing project templates or scripts (a separate change).
- `install.sh` logic beyond RF-3.

## Completion criteria
- `validation.md` with every RF and scenario and its evidence (script output or review), all green.
- Measurement script (RF-19) exits without error: RF-16, RF-17 and RF-18 met.
- Independent review (`sdd-reviewer`) of the invariants, before vs after (RF-20), and of the language (RF-1).
- **Critical DoD**: `install.sh` regression (RF-3, RF-4) and `rules.md` size (RF-18).
- Live checks by the user in Claude Code (RF-11, RF-12, RF-22).

## Questions and answers
1. Website language? → English.
2. How to organize the language switch? → Two changes on this branch: `001` (English + compaction) and `002` (website).
3. Compaction target? → A hard limit for descriptions and a measured reduction, with invariants checked by the reviewer.
4. Language of the artifacts? → The project's language, declared in the constitution; otherwise the user's language.
5. What gets translated? → All content, including `rules.md`, `install.sh` messages and rigorkit's own `specs/`.

## Clarification — 001, round 1 (2026-10-23) · Verdict: not ready
1. Ambiguities
   - (high) Strings that skills write and others parse → handled as structure (closed list in v2; replaced in v3 by RF-5–RF-8).
   - (high) `check-scenarios.mjs` hardcodes the Spanish heading → it is content and reads both forms (RF-1, RF-8).
   - (medium) "Content" left out `rules.md` and named a root `NOTICE` that does not exist → definition fixed.
   - (medium) "User's language" undefined → defined (most recent message with a recognizable language).
   - (medium) "Artifact" incomplete → operational definition.
   - (medium) Token estimate undefined → characters/4.
   - (medium) "Each pack" with `core` empty; templates loaded on use → "loaded on use" includes templates; `core` excluded.
2. Contradictions
   - (high) `tier` values are logic and user config keys → English values with Spanish aliases (RF-3).
   - (high) A measurement script in `packs/core/scripts/` changes the installed files → `tools/`, not installed (RF-19, RF-4).
   - (medium) The 30% target mixed translation and compaction → character-based estimator.
   - (medium) Invariants included the language of prescribed formats → only the structure is an invariant.
3. Edge cases
   - (high) No test scenarios → added.
   - (medium) Vault registration line → not touched (out of scope); `sdd-archive` reads both forms (RF-8).
   - (medium) Spanish projects with English templates → RF-5, RF-11.
   - (medium) Stale copies in existing repos → RF-5, RF-8.
4. Constitution / process
   - (high) Scenarios missing → added.
   - (medium) `AGENTS.md` script rule; content language and limits → RF-15; `tools/` outside `packs/`.
   - (medium) `AGENTS.md` and the constitution keep Spanish and old limits → RF-15.

## Clarification — 001, round 2 (2026-10-23) · Verdict: not ready
1. Ambiguities
   - (medium) The closed token list was incomplete (reviewer verdicts, spec header, sections read by other skills, EARS keywords) → replaced by an operational rule: structure comes from the project templates (RF-5, RF-6), aliases are derived by comparing template versions (RF-8).
   - (medium) Empty or unrecognized `Language:` → "declared language" defined.
   - (medium) Scenarios relied on capabilities RF-16 did not require → RF-19 extended (descriptions, baseline comparison, exit code).
   - (low) `NOTICE.md` counted as loaded on use and duplicated → excluded; RF-21 covers both copies. Alias precedence → English key wins (RF-3).
2. Contradictions
   - (medium) Templates copied before the language is asked → copied templates are not artifacts; structure follows them.
   - (medium) The n/a reason of RF-9.F did not hold → `Language:` can be empty (RF-10.F1, RF-11.F1).
   - (low) Spanish words in the spec vs RF-1 → aliases and quoted examples excluded.
3. Edge cases
   - (medium) Old `check-scenarios.mjs` copies fail with new English headings → RF-5 keeps the project's own structure.
   - (medium) Adding to existing Spanish artifacts → RF-7.
   - (medium) A message with no recognizable language → RF-13.
   - (low) Spanish requests activating skills had no RF → RF-22.
4. Constitution / process
   - (medium) No test runner → `[manual]` scenarios and script output, declared deviation.
   - (medium) Round 1 record incomplete → rewritten with every finding.
   - (low) Record format → one heading per round; rules.md ≈ 364.

## Clarification — 001, round 3 (2026-10-23) · Verdict: not ready
1. Ambiguities
   - (medium) Fixed strings outside templates (`@legacy` marker, arch-reviewer's message) → RF-24 for the marker; chat output in the user's language (RF-23).
   - (medium) A project template missing an artifact or a section (Synapse's old `tasks.md`) → RF-7: the skill's template, with structure in the project's structure language.
   - (medium) RF-2 scenarios needed a script that RF-19 did not require → RF-19 also checks names.
   - (low) "UTF-8 characters" → code points after NFC.
2. Contradictions
   - (medium) No precedence between keeping an existing artifact's language and writing in the declared language → RF-5 (existing artifacts) wins; RF-6 and RF-7 apply to new artifacts.
3. Edge cases
   - (medium) RF-13.F's n/a did not hold → the user may not answer: English, and the skill says so.
   - (medium) Edge and failure scenarios of the script need synthetic inputs → `--root` and `--baseline` (RF-19), fixtures in tests (RF-25).
   - (low) Thin n/a reasons (RF-9, RF-14) and an unstated rule in RF-7.F1 → rewritten; the mixed-artifact rule is in RF-5.
4. Constitution / process
   - (medium) `check-scenarios` strict mode needs a test per scripted scenario → `node --test` tests (RF-25), declared deviation updated.

## Clarification — 001, round 4 (2026-10-23) · Verdict: not ready
1. Ambiguities
   - (medium) Mixed artifacts: "language of the section being edited" was undefined with English headings and Spanish prose, and for new sections → RF-5 keeps the current structure and the current prose language, also for added sections.
   - (medium) Where the alias table lives at runtime → each reading skill and `check-scenarios.mjs` carry inline only the aliases they read (constitution §2, no new installed files).
   - (low) RF-19.E1 wording and missing-baseline exit → updated.
2. Contradictions
   - (high) RF-7 "the skill's own template" did not exist outside `sdd-init`; adding them broke RF-4, reading them broke §2 → RF-7: the skill reports the gap and proposes updating the project templates with `sdd-init`.
   - (medium) RF-5 vs RF-11/RF-12 → RF-11 and RF-12 apply to new artifacts.
3. Edge cases
   - (medium) A consistent rename was not detectable → the baseline stores the names list and RF-19 compares it.
   - (low) Fixtures under a `test` folder count as tests → fixtures in `tools/fixtures/`.
4. Constitution / process
   - (medium) RF-25 rows contained literal `n/a` and `[manual]` text that the checker parses → rewritten.
   - (medium) Which checker runs → the pack's copy, with explicit spec path and `--tests tools/test` (RF-25).

## Clarification — 001, round 5 (2026-10-23) · Verdict: not ready
1. Ambiguities
   - (medium) The baseline could not separate bodies from frontmatter → it stores the loaded-on-use estimate per skill and agent without frontmatter, description lengths, `rules.md` estimates and names.
   - (medium) Structure language with mixed-language templates → the language of `specs/templates/spec.md`.
   - (medium) Agents also read structure (`sdd-reviewer`) → RF-8 covers agents.
2. Contradictions
   - (medium) RF-5 vs RF-7 when adding to an existing artifact → RF-7 applies to new and existing artifacts and limits RF-5.
   - (medium) "No changes to what skills do" vs RFs that add behavior → out of scope names the exceptions; RF-20 accepts them.
3. Edge cases
   - (medium) RF-7 relied on an `sdd-init` update mode that does not exist → the skill reports the gap and continues; the update mode is a separate change.
4. Constitution / process: none.

## Clarification — 001, round 6 (2026-10-23) · Verdict: ready for plan
0 high, 0 medium. Reality checks: the 4 precedence cases have one outcome each; RF-7's degraded behavior is acceptable for Synapse (`sdd-resume` rebuilds the stage without the state block); the checker parses the spec with 0 structural errors (104 scenarios: 50 manual, 33 not applicable, 21 scripted); the baseline supports RF-2 and RF-16–RF-19.
Remaining low findings:
- RF-19 says "per file" while the baseline stores one estimate per skill or agent; the pack is inferred from the unchanged names.
- Projects initialized between `55512c3` and `34831ec` have a spec template without the scenarios section: under RF-7 their specs never reach "ready for plan". Fixing it needs the `sdd-init` update mode (out of scope).

## Clarification — 001, round 7 (2026-10-23) · Verdict: not ready
Version 7 added RF-26 (always write process-required sections) after round 6 found that the 5 work repos' spec templates lack the scenarios section.
1. Ambiguities
   - (medium) RF-26's "format the skill itself prescribes" does not exist inside the skills (they point to `sdd-init` templates); inlining it is required by §2.
   - (medium) The round record lives in `clarification.md`, not in the spec template, so RF-26's trigger was unclear.
2. Contradictions
   - (medium) The work repos use `### R1.` requirements, which the scenario gates cannot parse; RF-26 alone does not make their specs pass.
3. Edge cases (low): missing `validation.md` and `check-scenarios.mjs` in the work repos; RF-26.F1 typed as failure but describing success.

**Resolution**: the incompatibility exists before this change and is a migration of the work repos' process, not part of translating rigorkit. RF-26 and its definition were removed (back to version 6, which reached "ready for plan" in round 6) and the issue is recorded as a known limitation, to be handled by a separate change (`sdd-init` update mode + per-repo migration).

## Clarification — 001, round 8 (2026-10-23) · Verdict: ready for plan
Scope: the difference from version 6. 0 high, 0 medium. RF-26 is fully removed outside the history; RF-7 and its scenarios have the v6 meaning; the known limitation matches the 5 work repos and contradicts nothing; the checker parses the spec with 0 structural errors (104 scenarios, 50 manual, 21 scripted).
Remaining low findings: the round-7 record attributes the work-repo finding to round 6 (it came from checking the repos after round 6's low finding); the known limitation could also list the missing `scenarios.md` and `baseline.md` templates.

## Open questions
- None.
