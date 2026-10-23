# Technical plan — 001-english-and-compact

## Current context

Spec approved on 2026-10-23 by the user's "adelante" after clarification round 8 (`spec.md:399`); plan approved by "continua", tasks by "dale". These approvals never imply implementation or green tests. The user later authorized grouped work. Current progress/evidence lives in `tasks.md`.

Planning snapshot, before translation:
- `AGENTS.md:15` defined prefixed names, single-quoted YAML, Spanish content and descriptions up to 1024 characters. `specs/constitution.md:5` required self-containment, soft dependencies, roles/stops and protected installer/rules paths. RF-14/RF-15 replace language and size rules, retaining the others.
- `install.sh:162-180` parsed one-line fields/escaped apostrophes, looked up exact model keys and accepted only empty/barato/fuerte tiers. Four adapters (`:182-206`) consumed the same lookup. `:213-233` installed only packs: complete skill folders, converted agents, global rules/scripts. New skill-local files would alter installed files; tools/ stays outside.
- `sdd-init/SKILL.md:25` copied local templates/checker into projects. Project templates are independent; translate both rigorkit copies without migrating other repos.
- The checker's `:64-95` parsed RF-n, Spanish scenario heading and scenario IDs; `:121-127` excluded manual/n/a and required coverage in strict mode. Retain that behavior except bilingual headings and English messages.
- Text contracts connect tasks fields/resume state (`sdd-tasks:14-27`), clarification verdicts (`sdd-clarify:30-33`) and plan gate (`sdd-plan:11`), Resolved entries (`sdd-archive:14`), @legacy marker (`sdd-legacy-review:14`) and reviewer verdicts (`sdd-reviewer:38`). Translate producers and readers together.
- Core rules (`:5-23`) contain invariants to compact without loss. Both NOTICE copies attribute adapted material.
- At planning time, `git diff edad002 HEAD --stat` contained only this spec; baseline, tools tests and saved context were absent. The half-wired register was empty and no module baseline/capability/learning constrained this change. Baseline capture has since been confirmed by the user; its source remains edad002.
- Consulted vault notes: operational definitions instead of manual lists; token economy (draft); multi-tool toolkit (draft). Use them as background; repo code/constitution prevail. No vault writes are part of this change.

Line references above identify the inspected pre-change snapshot; tasks point to current files, since translation changes line numbers.

## Structure by layer / module

| Module | Change | RFs |
|---|---|---|
| Installer and README model examples | Normalize tiers, prefer English keys by presence, preserve adapters/targets | RF-3, RF-4 |
| SDD skills and agents | English/compaction, project artifact rules, local aliases, user-language chat | RF-1, RF-2, RF-5–RF-8, RF-11–RF-13, RF-16, RF-17, RF-20, RF-22, RF-23 |
| Init/adopt and both constitution templates | Ask project language when creating constitution; empty if unanswered | RF-9, RF-10 |
| Legacy review | Keep @legacy, use project structure language for marker text | RF-8, RF-24 |
| Both template trees and own specs | Translate structures/artifacts without changing IDs, decisions or historical evidence | RF-1, RF-5, RF-6, RF-8, RF-14 |
| Pack checker | Both headings, English messages; unchanged CLI/coverage | RF-1, RF-8, RF-25 |
| Architecture/frontend | Compact references/reviewers; preserve exceptions, modes, outputs | RF-1, RF-2, RF-8, RF-16, RF-17, RF-20, RF-23 |
| Core, READMEs, root instructions/constitution | English, exact limits, compact rules, unchanged helper contracts | RF-1, RF-14, RF-15, RF-18, RF-20 |
| Both NOTICE copies | Describe current adaptation; preserve attribution/license | RF-21 |
| Measurement CLI and change baseline | Reproducible inventory, estimates and comparison outside installation | RF-2, RF-16–RF-19 |
| tools/test and tools/fixtures | One test per scripted scenario, real CLI integration | RF-2, RF-8, RF-16–RF-19, RF-25 |

Order: tests/fixtures first; measurement and immutable baseline before content edits; installer/checker; templates and their consumers; per-pack compaction; docs/rules/own artifacts; accumulated verification. Tasks remain at most 20–30 minutes; user-authorized grouping changes approval cadence, not dependencies or evidence requirements.

## Data model

No database/migrations. `baseline.txt` is versioned UTF-8 JSON, retaining the spec's filename, captured from edad002 without changing checkout. Example values below are illustrative, not actual measurements:

```json
{
  "version": 1,
  "commit": "edad002",
  "estimator": "nfc-codepoints-ceil-div4",
  "entries": [
    {"kind": "skill", "pack": "sdd", "path": "packs/sdd/skills/sdd-resume/SKILL.md", "name": "sdd-resume", "descriptionCharacters": 240, "loadedTokens": 500}
  ],
  "rules": [{"path": "packs/core/rules.md", "tokens": 364}]
}
```

One entry per skill/agent: kind, pack, path, name, description length and loaded estimate. Derive pack totals, never maintain duplicate totals. The current report adds every contributing Markdown file, including auxiliaries without frontmatter. Approval records stay in spec/plan and brief tasks state; never fabricate test evidence or treat ready-for-plan as user approval.

## Algorithms

### Measurement and identity

```text
estimate(text) = ceil(code_points(NFC(text)) / 4)
inventory(root):
  find packs/*/skills/*/SKILL.md and packs/*/agents/*.md
  parse one-line frontmatter; decode single quotes and escaped apostrophes
  skill name matches folder; agent name matches filename without .md
  measure decoded description by NFC code points, excluding YAML quotes
  body = everything after closing frontmatter delimiter, without trim
  skill load = body + all other recursive local .md files, excluding NOTICE.md
  agent load = body
  report each file; estimate concatenated entry load without added separators
  sum entry estimates by pack; measure whole packs/*/rules.md
compare(current, baseline):
  validate version/schema; missing/unreadable baseline is an error
  compare sets of (kind, pack, path, name): additions, removals, renames
  require name/path match and descriptions <= 300
  require 10 * currentPack <= 7 * baselinePack for sdd/architecture/frontend
  require each rules estimate <= 300; core has no body-reduction target
  report every violation; return 1 if any, otherwise 0
```

Include auxiliaries even if only read on a branch: loaded-on-use is the spec's definition, not a usage prediction. File rounding can differ from aggregated entry rounding; label both. Frontmatter/NOTICE do not count toward RF-17; descriptions are checked separately. Do not follow symlinks outside fixture roots.

### Tiers and model selection

```text
normalize: empty -> empty; barato/cheap -> cheap; fuerte/strong -> strong
anything else -> existing failure with updated vocabulary
for tool and normalized tier:
  no tier or models file -> inherit session
  if English key exists, use its value, even empty (inherit); do not fall back
  otherwise use Spanish alias
  preserve trim, comments and first occurrence per key
```

Normalize once before the four adapters; preserve targets, YAML/TOML escapes, readonly permissions and install order.

### Artifact language and structure

```text
check project template/section before writing process artifacts
missing -> explain and omit that artifact/section; continue permitted work
existing -> preserve structure and prose language, including additions
new -> template structure; prose from recognized constitution Language
  else latest recognizable user message
  else change's existing artifact language
  else ask once; without answer use English and say so
chat -> user's language; fixed verdict -> structure language
read -> accept relevant English/Spanish structural aliases
```

Never require another skill's files for shared policy. Repeat compact rules and only the aliases each reader uses. This language fallback never grants write/commit approval. Code/tests and copied templates are not process-document template fallbacks.

### Derived aliases

Compare each template/agent's edad002 structure with its translated form: headings, keys/values, columns, verdicts, markers, EARS words. Locate producers/readers before replacement. Record pairs/consumers in task evidence and inline only each reader's needed pairs. No manually maintained global source list or new installed helper. The checker needs only the two scenario headings; keep RF/HEFS, n/a, [manual]. `tasks.md` holds migration evidence derived from actual before/after files.

## Contracts

- No endpoints/events/tool-specific formats added. Skill/agent names and paths stay fixed; installer consumes neutral frontmatter as before.
- `node tools/measure-content.mjs --root <repo> --baseline <baseline.txt>` resolves relative paths from cwd; stable path-ordered report; no writes. Report file/pack estimates, descriptions, identity changes, reductions and failures. Argument/baseline/read errors go to stderr with exit 1; success is 0.
- Capture is separate: `node tools/capture-baseline.mjs` reads blobs from `edad00214e552594fe4da00e51c88803a22f19c5` into a temporary tree, reuses measurement, writes the change baseline exclusively, refuses overwrite, does not change checkout or enforce new limits on old content. Checking never creates baseline implicitly.
- Checker retains positional specs, --tests, --strict, exit codes and discovery (`:25-61,133-157` in planning snapshot). Only heading acceptance and message language change, not test/change/scenario association.
- Preserve RIGORKIT_MODELS and tool.tier=model; English keys beat legacy aliases for either tier vocabulary.
- New project templates are English with Language:. Existing projects retain templates, prose and scripts; no declaration/migration in other repos. Update mode and website remain separate changes.

## Decisions

- D1. Node built-in measurement under tools/, rather than core scripts: avoid changing installed files (installer copies whole skills and pack scripts).
- D2. Versioned JSON in baseline.txt tied to edad002, rather than ambiguous table text or working-tree baseline: reliable identity and before/after data.
- D3. Aggregate load per entry then sum per pack; integer 30% inequality rather than averaged/rounded displayed percentages: exact reproducible boundary.
- D4. Short repeated policy and local aliases, rather than a cross-skill shared reference: self-contained skills and stable installed file set.
- D5. Separate structure, prose and chat, rather than translating everything to constitution language: preserve old artifacts and stage gates.
- D6. Normalize tiers centrally and resolve English keys by presence, rather than migrating personal configuration or falling back from empty English values: preserve precedence/session inheritance.
- D7. English descriptions <=300 with quoted Spanish request phrases, rather than removing Spanish triggers or duplicating skills: RF-1/RF-2/RF-22.
- D8. Remove redundant wording, not rules/order/exceptions, rather than sacrificing behavior for percentage. Restore missing rules; never lower baseline or move load across packs to fake savings.
- D9. Reuse existing checker and CLI fixtures, rather than another coverage parser. User validates frontmatter with an available strict YAML parser; no production dependency solely for that check.

## Constitution

All eight principles apply: tool-neutral format, self-containment/soft dependencies, roles/stops, valid YAML, generic/secret-free content, attribution, protected user files and context economy. Descriptions tighten 1024→300; rules about 300→at most 300. Keep quotes and prefixes. No new violation planned. The spec's language deviation was declared; RF-14/RF-15 update root instructions/constitution during implementation. Critical paths remain installer and rules, with reinforced DoD. No implementation/evidence is implied by document approval.

## Test strategy

Use node:test/assert/strict and real CLI spawnSync, no runtime dependencies or interpolated shell. Isolated tools/fixtures; copy to temporary directories before mutations, never personal configuration. Titles start with scenario ID; files mention 001-english-and-compact.

| Test file | Individual scenario IDs | Evidence |
|---|---|---|
| measure-content.test.mjs | RF-2.H1/E1/F1 | Stable identity, name/path, consistent rename detectable |
| Same | RF-16.H1/E1/F1 | Description bounds 300/301 |
| Same | RF-17.H1/E1/F1 | Three independent packs; exactly 30% passes, 29% fails |
| Same | RF-18.H1/E1/F1 | Rules bounds 300/301 tokens |
| Same | RF-19.H1/E1/F1 | Report, NFC/code points versus bytes, missing baseline |
| check-scenarios.test.mjs | RF-8.H1/E1/F1 | English/Spanish/missing heading and English error |
| Same | RF-25.H1/E1/F1 | Real spec coverage, manual exclusion, missing test |

21 required tests. RF-25.H1 checks real spec and tools/test. Heading fixtures need valid requirements/rows so unrelated errors cannot explain failure. Isolate measurement thresholds by satisfying other constraints. Assert status/output/values explicitly: ID strings without useful assertions are not fulfillment.

Keep each of 50 manual scenarios in validation with individual evidence, not fictional automated tests. Preserve 33 n/a reasons; counts are from round 6 and must be confirmed against current checker output.

- Installer RF-3/RF-4: compare edad002/final with identical arguments in temporary project/global installs, all adapters separately and together, including Cursor without Claude. Both tiers with old/new/both keys, invalid tier and inheritance. Compare relative files, readonly/escaping, markers, backup and an outside sentinel. User chooses isolated execution environment; never real personal configuration.
- Content/contracts RF-1/RF-5–RF-15/RF-20–RF-24: accumulated diff, derived alias map, all producers/readers, both template/NOTICE copies and strict YAML parsing. Distinguish Spanish aliases/examples from untranslated prose.
- User live Claude Code checks: RF-11/RF-12/RF-22 plus mixed prose/structure, missing template, fallback, chat/verdict cases. Record request, installed revision and observable outcome; string tests prove neither activation nor agent conduct.
- Independent sdd-reviewer: compare every skill/agent with edad002 for role, stop, rules, negations, numbers, order and output formats. Percentage alone does not prove RF-20.

Commands are for the user, after implementation; do not repeat valid results without relevant changes:

```bash
node --test tools/test/*.test.mjs
node packs/sdd/skills/sdd-init/scripts/check-scenarios.mjs specs/archive/001-english-and-compact/spec.md --tests tools/test
node tools/measure-content.mjs --root . --baseline specs/archive/001-english-and-compact/baseline.txt
./install.sh --pack all --agent claude,codex,cursor,opencode --project <tmp-project> --dry-run
./install.sh --pack all --agent claude,codex,cursor,opencode --global --dry-run
```

Expect green tests, no uncovered scripted scenarios, no measurement violations, equivalent targets. Concrete temporary installation/regression commands belong to their tasks; dry-runs do not replace real installation/model checks. Only the user runs executable verification.

## Risks and cross-layer

| Risk / producer → consumer | Task verification |
|---|---|
| Init-copied templates → artifact writers/readers | Derived aliases; Spanish/English/mixed artifacts and absent sections; no other repo migration |
| Reviewer/clarify verdict → plan gate | Both languages; technical ready never implies user approval |
| Scenario template → checker → coverage | RF-8/RF-25 CLI tests; IDs/exclusions/discovery and strict/non-strict behavior intact |
| Agent tier → installer → model lookup → adapters | Both levels/vocabularies/configs/empty precedence; readonly/escaping preserved |
| New skill auxiliaries → whole-folder copy | No new installed helper; compare file lists/dry-runs; tools excluded |
| Compaction → lost rule/artificial load relocation | Entry/pack report and independent before/after invariant review, not adjusted baseline |
| Duplicate templates/NOTICE → inconsistent initialization | Compare both copies; preserve/document intentional project customizations |
| English spec → old Spanish checker | Use pack checker, not another repo copy; no migration of installed old projects |
| Mutated baseline → fictional reduction | Fixed edad002 source, separate capture, schema validation before content edits; no initial 30% requirement |
| Own instructions still Spanish during planning | Follow rules then in force; translate own instructions/artifacts under RF-1/RF-14/RF-15 without reopening approved requirements |

No entities/seeds/tenants/business contracts are changed. Relevant boundary: packed content → installation → project artifacts → readers/gates. Website, vault, external repos and init update mode remain out of scope. Grouped implementation proceeds under user authorization; tasks records current measurement, independent review and live-verification gates. Suggest clearing context on stage changes; keep state in files.
