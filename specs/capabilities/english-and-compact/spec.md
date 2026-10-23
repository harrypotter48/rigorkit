# Capability — English and compact content

> Status: current · Owner repo: rigorkit · DoD: critical for installer/global rules

## Context and goal
Rigorkit distributes English, compact skills, agents, templates and rules for four adapters, retaining names and legacy Spanish tier/structure compatibility. Project templates govern artifact structure, constitution/user language governs new prose, and chat follows the user. Existing artifact structure/prose is preserved. Installation paths and user-file protection remain stable.

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
- **Baseline**: at the archived source commit `edad002`, the token estimate of what each skill and agent loads on use (frontmatter excluded), the length of each `description`, the token estimate of each `rules.md`, and the list of skill and agent names, stored in `baseline.txt` in this change's folder.
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
- RF-25: The system shall have `node --test` tests in `tools/test/`, with fixtures in `tools/fixtures/`, and an ID-named test mentioning `001-english-and-compact` for every scenario that is neither manual nor not-applicable, so that `node packs/sdd/skills/sdd-init/scripts/check-scenarios.mjs specs/archive/001-english-and-compact/spec.md --tests tools/test` reports no missing test.

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

## Verification references

Current implementations: packs/, install.sh, tools/measure-content.mjs. The immutable measurement reference is specs/archive/001-english-and-compact/baseline.txt. Measurement enforces description <=300 characters, rules <=300 estimated tokens and >=30% loaded-token reduction independently per target pack.

Scenario IDs refer to the originating change 001-english-and-compact and tools/test/. Historical evidence and accepted verification exceptions: [archived validation](../../archive/001-english-and-compact/validation.md). Independent review was not performed and live agent behavior checks remain deferred; current contract statements do not imply those checks ran. Future defects are handled in a new change.
