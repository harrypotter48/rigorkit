# Validation — 001-english-and-compact

Status: COMPLETE / ARCHIVED by explicit user acceptance; verification exceptions retained. Updated: 2026-10-23.

## Evidence

- E1 — User confirmed 15 measurement tests green, baseline capture, project/global dry-runs and 50 tier/model compatibility cases (both vocabularies, four adapters, English/empty precedence, readonly and invalid tiers).
- E2 — User confirmed six checker tests and no missing scripted coverage for the real change spec. These 21 test results remain applicable: subsequent changes only translated/compacted documents; test/measurement/checker/installer code did not change.
- E3 — After the initial frontend/SDD reduction failure and text-only fixes, user reran the real measurement command and reported "ya dio 0 errores". Identity, description, rules and independent per-pack reduction gates pass. Final exact CLI rows were not supplied; static estimates are recorded separately in tasks.md.
- E4 — Direct document inspection: both constitution templates have an empty Language field; root constitution is English with Language: en; root instructions/constitution require English descriptions <=300 characters and rules <=300 tokens; both NOTICE copies describe English adaptation and retain attribution. This proves only those static scenarios, not live behavior or independent invariant preservation.
- E5 — User executed `/private/tmp/rigorkit-001-final-checks.py` and reported PASS: 25 frontmatters (PyYAML safe_load); 20 before/after installation matrices (sdd/all, project/global, four adapters separately and combined), equal dry-run paths and real file lists; 6 protection cases, exact backups/outside-marker text/other markers/sentinel preserved. Repository packs unchanged, temporary data removed, real global instructions untouched. Temporary snapshots redirect global path variables; real HOME/CODEX_HOME are not reassigned. T33/T34 complete; strict YAML portion of T32 complete.
- E6 — Prepared, NOT performed: independent review packet `/private/tmp/rigorkit-001-review/REQUEST.md`, before/after files and accumulated.diff against `edad00214e552594fe4da00e51c88803a22f19c5`. No independent reviewer verdict yet.

## Scenario evidence

PASS below means only the specific listed evidence. PENDING never counts as coverage. N/A reasons remain exactly those approved in spec.md. All scripted cases map to actual test declarations; manual cases require their own observations.

| Scenario | Type | Covering test / evidence | Result |
|---|---|---|---|
| RF-1.H1 | happy [manual] | Pending independent review / installation / live evidence; see batches below | PENDING |
| RF-1.E1 | edge [manual] | Pending independent review / installation / live evidence; see batches below | PENDING |
| RF-1.F1 | failure [manual] | Pending independent review / installation / live evidence; see batches below | PENDING |
| RF-1.S | security | n/a — no users, tenants or permissions involved | N/A (approved spec) |
| RF-2.H1 | happy | `tools/test/measure-content.test.mjs:11` — E1 | PASS (user tests) |
| RF-2.E1 | edge | `tools/test/measure-content.test.mjs:21` — E1 | PASS (user tests) |
| RF-2.F1 | failure | `tools/test/measure-content.test.mjs:32` — E1 | PASS (user tests) |
| RF-2.S | security | n/a — names carry no permissions | N/A (approved spec) |
| RF-3.H1 | happy [manual] | E1 — user-confirmed 50-case tier/model matrix | PASS |
| RF-3.E1 | edge [manual] | E1 — user-confirmed 50-case tier/model matrix | PASS |
| RF-3.E2 | edge [manual] | E1 — user-confirmed 50-case tier/model matrix | PASS |
| RF-3.F1 | failure [manual] | E1 — user-confirmed 50-case tier/model matrix | PASS |
| RF-3.S | security | n/a — no credentials involved | N/A (approved spec) |
| RF-4.H1 | happy [manual] | E5 — equal final/baseline installed file lists | PASS (user execution) |
| RF-4.E1 | edge [manual] | E5 — equal final/baseline planned global paths | PASS (user execution) |
| RF-4.F1 | failure [manual] | E5 — outside-marker content and exact .bak preserved | PASS (user execution) |
| RF-4.S1 | security [manual] | E5 — outside sentinel unchanged | PASS (user execution) |
| RF-5.H1 | happy [manual] | User deferred live smoke, 2026-10-23; retain scenario for next normal change | DEFERRED (not tested) |
| RF-5.E1 | edge [manual] | User deferred live smoke, 2026-10-23; retain scenario for next normal change | DEFERRED (not tested) |
| RF-5.E2 | edge [manual] | User deferred live smoke, 2026-10-23; retain scenario for next normal change | DEFERRED (not tested) |
| RF-5.F | failure | n/a — an existing artifact always has headings and prose to follow | N/A (approved spec) |
| RF-5.S | security | n/a — no permissions involved | N/A (approved spec) |
| RF-6.H1 | happy [manual] | User deferred live smoke, 2026-10-23; retain scenario for next normal change | DEFERRED (not tested) |
| RF-6.E1 | edge [manual] | User deferred live smoke, 2026-10-23; retain scenario for next normal change | DEFERRED (not tested) |
| RF-6.F | failure | n/a — a missing template or section is RF-7 | N/A (approved spec) |
| RF-6.S | security | n/a — no permissions involved | N/A (approved spec) |
| RF-7.H1 | happy [manual] | User deferred live smoke, 2026-10-23; retain scenario for next normal change | DEFERRED (not tested) |
| RF-7.E1 | edge [manual] | User deferred live smoke, 2026-10-23; retain scenario for next normal change | DEFERRED (not tested) |
| RF-7.F1 | failure [manual] | User deferred live smoke, 2026-10-23; retain scenario for next normal change | DEFERRED (not tested) |
| RF-7.S | security | n/a — no permissions involved | N/A (approved spec) |
| RF-8.H1 | happy | `tools/test/check-scenarios.test.mjs:13` — E2 | PASS (user tests) |
| RF-8.E1 | edge | `tools/test/check-scenarios.test.mjs:20` — E2 | PASS (user tests) |
| RF-8.E2 | edge [manual] | User deferred live smoke, 2026-10-23; retain scenario for next normal change | DEFERRED (not tested) |
| RF-8.E3 | edge [manual] | User deferred live smoke, 2026-10-23; retain scenario for next normal change | DEFERRED (not tested) |
| RF-8.F1 | failure | `tools/test/check-scenarios.test.mjs:26` — E2 | PASS (user tests) |
| RF-8.S | security | n/a — no permissions involved | N/A (approved spec) |
| RF-9.H1 | happy [manual] | E4 — direct static document inspection | PASS (static) |
| RF-9.E | edge | n/a — the template is one fixed file; an empty value is covered by RF-10.F1 | N/A (approved spec) |
| RF-9.F | failure | n/a — the template is one fixed file; an unreadable value is covered by RF-11.F1 | N/A (approved spec) |
| RF-9.S | security | n/a — no permissions involved | N/A (approved spec) |
| RF-10.H1 | happy [manual] | User deferred live smoke, 2026-10-23; retain scenario for next normal change | DEFERRED (not tested) |
| RF-10.E1 | edge [manual] | User deferred live smoke, 2026-10-23; retain scenario for next normal change | DEFERRED (not tested) |
| RF-10.F1 | failure [manual] | User deferred live smoke, 2026-10-23; retain scenario for next normal change | DEFERRED (not tested) |
| RF-10.S | security | n/a — no permissions involved | N/A (approved spec) |
| RF-11.H1 | happy [manual] | User deferred live smoke, 2026-10-23; retain scenario for next normal change | DEFERRED (not tested) |
| RF-11.E1 | edge [manual] | User deferred live smoke, 2026-10-23; retain scenario for next normal change | DEFERRED (not tested) |
| RF-11.F1 | failure [manual] | User deferred live smoke, 2026-10-23; retain scenario for next normal change | DEFERRED (not tested) |
| RF-11.S | security | n/a — no permissions involved | N/A (approved spec) |
| RF-12.H1 | happy [manual] | User deferred live smoke, 2026-10-23; retain scenario for next normal change | DEFERRED (not tested) |
| RF-12.E1 | edge [manual] | User deferred live smoke, 2026-10-23; retain scenario for next normal change | DEFERRED (not tested) |
| RF-12.F | failure | n/a — failure to determine the language is RF-13 | N/A (approved spec) |
| RF-12.S | security | n/a — no permissions involved | N/A (approved spec) |
| RF-13.H1 | happy [manual] | User deferred live smoke, 2026-10-23; retain scenario for next normal change | DEFERRED (not tested) |
| RF-13.E1 | edge [manual] | User deferred live smoke, 2026-10-23; retain scenario for next normal change | DEFERRED (not tested) |
| RF-13.F1 | failure [manual] | User deferred live smoke, 2026-10-23; retain scenario for next normal change | DEFERRED (not tested) |
| RF-13.S | security | n/a — no permissions involved | N/A (approved spec) |
| RF-14.H1 | happy [manual] | E4 — direct static document inspection | PASS (static) |
| RF-14.E | edge | n/a — one fixed file with one fixed value | N/A (approved spec) |
| RF-14.F | failure | n/a — one fixed file with one fixed value; wrong text is caught by RF-1 review | N/A (approved spec) |
| RF-14.S | security | n/a — no permissions involved | N/A (approved spec) |
| RF-15.H1 | happy [manual] | E4 — direct static document inspection | PASS (static) |
| RF-15.E1 | edge [manual] | E4 — direct static document inspection | PASS (static) |
| RF-15.F | failure | n/a — static documents | N/A (approved spec) |
| RF-15.S | security | n/a — no permissions involved | N/A (approved spec) |
| RF-16.H1 | happy | `tools/test/measure-content.test.mjs:46` — E1 | PASS (user tests) |
| RF-16.E1 | edge | `tools/test/measure-content.test.mjs:56` — E1 | PASS (user tests) |
| RF-16.F1 | failure | `tools/test/measure-content.test.mjs:67` — E1 | PASS (user tests) |
| RF-16.S | security | n/a — no permissions involved | N/A (approved spec) |
| RF-17.H1 | happy | `tools/test/measure-content.test.mjs:76` — E1; E3 real repository measurement | PASS (user tests) |
| RF-17.E1 | edge | `tools/test/measure-content.test.mjs:87` — E1 | PASS (user tests) |
| RF-17.F1 | failure | `tools/test/measure-content.test.mjs:96` — E1 | PASS (user tests) |
| RF-17.S | security | n/a — no permissions involved | N/A (approved spec) |
| RF-18.H1 | happy | `tools/test/measure-content.test.mjs:106` — E1; E3 real repository measurement | PASS (user tests) |
| RF-18.E1 | edge | `tools/test/measure-content.test.mjs:114` — E1 | PASS (user tests) |
| RF-18.F1 | failure | `tools/test/measure-content.test.mjs:121` — E1 | PASS (user tests) |
| RF-18.S | security | n/a — no permissions involved | N/A (approved spec) |
| RF-19.H1 | happy | `tools/test/measure-content.test.mjs:129` — E1 | PASS (user tests) |
| RF-19.E1 | edge | `tools/test/measure-content.test.mjs:150` — E1 | PASS (user tests) |
| RF-19.F1 | failure | `tools/test/measure-content.test.mjs:162` — E1 | PASS (user tests) |
| RF-19.S1 | security [manual] | Pending independent review / installation / live evidence; see batches below | PENDING |
| RF-20.H1 | happy [manual] | Pending independent review / installation / live evidence; see batches below | PENDING |
| RF-20.E1 | edge [manual] | Pending independent review / installation / live evidence; see batches below | PENDING |
| RF-20.F1 | failure [manual] | Pending independent review / installation / live evidence; see batches below | PENDING |
| RF-20.S1 | security [manual] | Pending independent review / installation / live evidence; see batches below | PENDING |
| RF-21.H1 | happy [manual] | E4 — direct static document inspection | PASS (static) |
| RF-21.E | edge | n/a — two identical static files | N/A (approved spec) |
| RF-21.F | failure | n/a — static documents | N/A (approved spec) |
| RF-21.S | security | n/a — no permissions involved | N/A (approved spec) |
| RF-22.H1 | happy [manual] | User deferred live smoke, 2026-10-23; retain scenario for next normal change | DEFERRED (not tested) |
| RF-22.E1 | edge [manual] | User deferred live smoke, 2026-10-23; retain scenario for next normal change | DEFERRED (not tested) |
| RF-22.F1 | failure [manual] | User deferred live smoke, 2026-10-23; retain scenario for next normal change | DEFERRED (not tested) |
| RF-22.S | security | n/a — no permissions involved | N/A (approved spec) |
| RF-23.H1 | happy [manual] | User deferred live smoke, 2026-10-23; retain scenario for next normal change | DEFERRED (not tested) |
| RF-23.E1 | edge [manual] | User deferred live smoke, 2026-10-23; retain scenario for next normal change | DEFERRED (not tested) |
| RF-23.F | failure | n/a — failure to determine the language is RF-13 | N/A (approved spec) |
| RF-23.S | security | n/a — no permissions involved | N/A (approved spec) |
| RF-24.H1 | happy [manual] | User deferred live smoke, 2026-10-23; retain scenario for next normal change | DEFERRED (not tested) |
| RF-24.E1 | edge [manual] | User deferred live smoke, 2026-10-23; retain scenario for next normal change | DEFERRED (not tested) |
| RF-24.F1 | failure [manual] | User deferred live smoke, 2026-10-23; retain scenario for next normal change | DEFERRED (not tested) |
| RF-24.S | security | n/a — no permissions involved | N/A (approved spec) |
| RF-25.H1 | happy | `tools/test/check-scenarios.test.mjs:34` — E2 | PASS (user tests) |
| RF-25.E1 | edge | `tools/test/check-scenarios.test.mjs:42` — E2 | PASS (user tests) |
| RF-25.F1 | failure | `tools/test/check-scenarios.test.mjs:48` — E2 | PASS (user tests) |
| RF-25.S | security | n/a — tests run locally on fixtures | N/A (approved spec) |

## Grouped manual execution

Deferred by explicit user instruction on 2026-10-23 until a normal future change; this runbook is retained for that occasion. Do not request these sessions again during current delivery. When resumed, run against the final installed skills in disposable projects with generic data. Keep each fixture and its transcript/diff until its scenario is reviewed; never use real user config or project data. Do not infer one case from another. Commands and agent sessions are run by the user. Normal stage approvals still apply; silence is never approval.

1. **T31/T32 — independent static review:** use E6 for RF-1 and RF-20 across every file, including semantic negative controls; review other packs/root instructions/NOTICE. E5 supplies strict YAML evidence separately. A self-review does not close the independent review requirement.
2. **T33/T34 — installer regression COMPLETE:** E5 passed; retain the user summary. Existing E1 covers model selection; new checks compare edad002/final sdd/all project/global paths and real file sets, Cursor alone and combined adapters, existing instructions with/without a core block, exact backup bytes, outside-marker text, other-pack markers and a sentinel. This is not a live agent-behavior test.
3. **T35 — declaration/prose:** disposable new/existing repos for init/adopt; answer the language question, then test unanswered language while separately approving file creation. Use English project templates with es/Spanish/unknown/absent Language values and English/Spanish requests. Switch user language between stages. Observe constitution value and actual newly written prose/structure, not just instruction strings.
4. **T36 — fallback:** fresh sessions with unset Language and neutral “ok”: existing Spanish artifact; no artifact/message language (one language question); then explicit continuation without a language answer (English plus notice). Keep language non-answer separate from creation approval.
5. **T37 — structure/aliases:** Spanish and mixed-language fixtures; resolve a HW entry under Resueltas; append clarification despite conflicting Language; create tasks from Spanish template; omit a missing resume section in new/existing tasks; omit missing learning template with notice; accept the old clarification verdict and review old scenarios. No real Synapse files or template migration.
6. **T38 — activation/chat/markers:** fresh Claude Code sessions with the exact Spanish trigger phrases below; record selected skill and response. Review a generic repo without layers in Spanish, then a Spanish project with English structure (English verdict). Mark demonstrably unused toy code in Spanish/English and confirm a marker without @legacy is not listed.

Record one observation per still-pending manual scenario:

| Scenario | Fixture / Given | Action | Expected observable result |
|---|---|---|---|
| RF-1.H1 | the content at the end of the change | the reviewer reads it | it is in English |
| RF-1.E1 | Spanish alias strings in parsers and quoted examples | the reviewer searches for Spanish | only aliases and quoted examples remain |
| RF-1.F1 | a content file left in Spanish | the reviewer searches | it is reported by path |
| RF-5.H1 | a `half-wired.md` with `## Resueltas` | `sdd-archive` resolves an entry | it adds it under `## Resueltas` |
| RF-5.E1 | a Spanish spec, then `Language: en` declared | `sdd-clarify` records round 2 | it keeps Spanish structure (`Veredicto:`) and Spanish prose |
| RF-5.E2 | a spec with English headings and Spanish prose | `sdd-clarify` adds a round | the new heading is English and its prose Spanish |
| RF-6.H1 | a project with Spanish project templates | `sdd-tasks` creates `tasks.md` | it uses `Hecho cuando:` |
| RF-6.E1 | English project templates and `Language: es` | `sdd-spec` creates a spec | English structure, Spanish prose |
| RF-7.H1 | Synapse's old `tasks.md` template without "Estado para retomar" | `sdd-tasks` creates a new `tasks.md` | it says the section is missing and writes the tasks without it |
| RF-7.E1 | an existing Synapse `tasks.md` without that section | `sdd-implement` updates it | it does not add the section and says so |
| RF-7.F1 | Spanish project templates without `learning.md` | `sdd-archive` wants to write a learning | it does not invent the template and says so |
| RF-8.E2 | a clarification with `Veredicto: listo para plan` | `sdd-plan` starts | it accepts it |
| RF-8.E3 | an old spec with `## Escenarios de prueba` | `sdd-reviewer` reviews it | it finds and checks the scenarios |
| RF-10.H1 | a new repo | `sdd-init` runs | it asks the language and records it |
| RF-10.E1 | an existing repo | `sdd-adopt` proposes the constitution | it asks the language and records it |
| RF-10.F1 | the user does not answer | the constitution is written | `Language:` is empty and RF-12 applies |
| RF-11.H1 | `Language: es` and an English request | `sdd-spec` writes the spec | the prose is in Spanish |
| RF-11.E1 | `Language: Spanish` | `sdd-spec` writes the spec | it is read as Spanish |
| RF-11.F1 | `Language: xx-unknown` | `sdd-spec` writes the spec | it counts as not declared (RF-12) |
| RF-12.H1 | no `Language:` and a Spanish request | `sdd-spec` writes the spec | the prose is in Spanish |
| RF-12.E1 | the user switches language between stages | the next artifact is written | it follows the most recent message |
| RF-13.H1 | no `Language:`, last message "ok", a Spanish spec in the change | `sdd-plan` writes the plan | the prose is in Spanish |
| RF-13.E1 | no `Language:`, no recognizable message, no artifacts | the first artifact is written | the skill asks the language once |
| RF-13.F1 | the user does not answer the language question | the artifact is written | it is in English and the skill says so |
| RF-19.S1 | `install.sh --pack core --global --dry-run` | it runs | `tools/` is not in the plan |
| RF-20.H1 | each skill and agent at `edad002` and at the end | `sdd-reviewer` compares them | role, stop, rules, negations, numbers and output structure are kept; the only behavior differences are those of RF-5 to RF-13, RF-23 and RF-24 |
| RF-20.E1 | a negation rephrased ("sin" → "no") | it is compared | it counts as kept |
| RF-20.F1 | a dropped rule (e.g. "never push") | it is compared | it is reported |
| RF-20.S1 | the "no secrets" rule | it is compared | it is present in every skill that had it |
| RF-22.H1 | "quiero especificar una feature nueva" | the user sends it in Claude Code | `sdd-spec` (or `sdd-triage` first) is activated |
| RF-22.E1 | "¿dónde quedamos?" | the user sends it | `sdd-resume` is activated, not `sdd-change` |
| RF-22.F1 | an ambiguous request ("cambia esto") | the user sends it | the agent asks or picks `sdd-change`, not an unrelated skill |
| RF-23.H1 | a Spanish request | `arch-reviewer` finds no layer structure | it says so in Spanish |
| RF-23.E1 | a Spanish project with English structure | `sdd-reviewer` ends a review | the verdict line follows the structure, the rest is in Spanish |
| RF-24.H1 | a Spanish project | `sdd-legacy-review` marks dead code | `@legacy — confirmado sin uso el <date>…` |
| RF-24.E1 | an English project | it marks dead code | `@legacy — confirmed unused on <date>…` |
| RF-24.F1 | a marker without `@legacy` | the review lists markers | it is not listed (the keyword is what is read) |

## Self-review in this session — 2026-10-23

The user requested continuing in the same session. This implementation-agent comparison does NOT close the independent T31/T32 requirement.

Compared before/after bodies for all 16 SDD skills, both SDD agents, the two verify checklists, archive/vault reference, architecture/frontend reference skills and reviewers, and core rules. Scope: stages/order, approvals/stops, roles, command restrictions, numbers/negations, outputs, local references and cross-skill producers/consumers. Follow-up self-review also compared all 11 actual init template files before/after (AGENTS, constitution, tasks, plan, half-wired, learning, spec, scenarios, ears, baseline, proposal); paired project copies are identical. Thresholds, IDs, tables, EARS patterns, 4-type scenarios, 10%/120/108 examples, all checklist categories, stops and no-secrets constraints were checked. No additional introduced findings in this pass. This remains a same-author review, not independent or live evidence.

Introduced findings corrected within RF-20:
1. Medium — Shared SDD footer “Never chain commits/push/merge” ambiguously scoped the push/merge prohibition. Replaced by “No commit chains; no push/merge” in 15 existing skills. Other redundant words were removed without dropping evidence/no-assumptions/no-flattery/blind-spot requirements.
2. Medium — `packs/sdd/skills/sdd-context/SKILL.md:7`: the original explicit restriction against reading unrelated modules was only implicit in “relevant”; restored “no unrelated modules”.
3. Medium — `packs/sdd/agents/sdd-reviewer.md:12`: the compacted required-artifact list could require a plan even where the approved process allows none. Restored “plan if any”. Original required constitution/spec/tasks/diff and no-git gate remain.

One follow-up static check confirms all edits are body-only: frontmatter/identities/file set unchanged. Static loaded-entry text comparison for the 16 edited files gives SDD delta -6 tokens; expected aggregate 11,507 (previous static 11,513). Baseline, descriptions, other packs and core rules unchanged. E3's user-confirmed passing thresholds are therefore retained by a non-increasing aggregate; this is a derived bound, NOT a new CLI run. User installer/YAML checks remain valid for unchanged paths/frontmatter. No tests, installer, measurement or live sessions were executed by the agent.

Live preparation: user-run `/private/tmp/rigorkit-001-live-setup.py` creates 18 disposable projects and installs current project-local Claude skills/agents; retains a RUNBOOK.md for scenario transcripts. User execution confirmed READY: 18 projects at `/var/folders/48/jzfj_ty569n1dm5f8nrlgzsm0000gn/T/rigorkit-001-live-1jedmu7s`; runbook `/var/folders/48/jzfj_ty569n1dm5f8nrlgzsm0000gn/T/rigorkit-001-live-1jedmu7s/RUNBOOK.md`; first project `/var/folders/48/jzfj_ty569n1dm5f8nrlgzsm0000gn/T/rigorkit-001-live-1jedmu7s/language-es`. Direct fixture inspection confirms Language: es and English project-template headings. No live agent response or generated spec observed yet. Setup never constitutes live behavior evidence or stage approval. Templates/specs in fixtures have no invented approval.

## Global review

Pending independent T31/T32 findings and closures. No independent verdict has been issued. Source snapshot/diff in E6 is a handoff, not proof of review. `git diff --check` passed after T29; no runtime commands were run by the implementation agent.

## Contracts and integration

Measurement contract passes via E3. Tier/model compatibility and checker contract pass via E1/E2. Full final installer/YAML checks pass via E5. Independent semantic review and producer/consumer language/structure behavior T35–T38 remain pending. No application layers exist in this toolkit; review soft dependencies and reader/writer contracts rather than inventing layers.

## Live test

User explicitly deferred the smoke on 2026-10-23: "ese smoke lo hare normal cuando vay a hacer un cambio, continua para terminar esta spec". T35–T38 and their live scenarios are deferred until a normal future change, not passed. The prepared fixtures/runbook remain optional references; temporary paths may expire. Searches, parser tests and token measurements do not substitute for observations. No further live-session request is part of current delivery.

## Accepted verification exceptions

Independent review was not performed; live checks are deferred to normal future use. On 2026-10-23 the user explicitly accepted these exceptions and requested marking the change completed and archiving it for repository delivery. T39 evidence integration is complete with that disposition. All 104 scenarios remain mapped to their actual evidence or deferred/unperformed status. No push, merge, external migration or vault writes are authorized.

Verdict: completed and archived by explicit user acceptance, with independent review unperformed and live smoke deferred; no claim of fully green manual verification.

## Archive maintenance

The real-spec test and baseline capture output now reference specs/archive/001-english-and-compact/. This is a path-only adjustment necessitated by the authorized archive; test assertions and baseline bytes/source are unchanged. Previous test results are retained as pre-archive evidence; no post-archive runtime rerun is claimed. Static checks verify the paths exist and the baseline digest is unchanged.
