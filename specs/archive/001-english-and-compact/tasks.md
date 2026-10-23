# Tasks — 001-english-and-compact

## Resume state
Stage: COMPLETE / ARCHIVED by explicit user acceptance, 2026-10-23. Current task: none. Approvals: original spec/plan/tasks and grouped implementation approvals retained below; final user instruction explicitly closes/archives the change, accepting later fixes if needed.
Pending/blockers: none blocking user-accepted closure. Verification exceptions retained: independent review not performed; live smoke deferred to normal future use. Next step: deliver archive/capability and one local completion commit; no push or merge.
References: spec RF-1–RF-25; plan D1–D9 and Test strategy; aliases below. Commits: `8b13977` (T5/T6), `7fbda02` (T7–T10); Remaining implementation and archive are included in the local completion commit. Final closure/archive explicitly approved; no push/merge/vault writes.

Evidence (2026-10-23):
- User confirmed 15 measurement tests and baseline capture; baseline v1 has 23 entries and one rules record, source `edad00214e552594fe4da00e51c88803a22f19c5`, unchanged.
- User confirmed project/global installer dry-runs and 50 tier/model compatibility cases; six checker tests and real-spec scenario coverage passed. Later work changed documentation only, retaining these results; broader installation comparison/protection subsequently passed under T33/T34.
- T10–T29 translations preserve template pairs, IDs, dependencies, approval/history sources, names/paths, project precedence, local aliases, language fallback, roles/stops, readonly tiers, cross-layer contracts, stable HW IDs and vault consent/secrets/reachability rules. No new installed files; helper/checker/installer/tests/baseline unchanged by compaction.
- The first measurement failed frontend (1,275 / 1,738; 26.64%) and SDD (15,972 / 16,457; 2.95%); architecture passed (1,619 / 2,390; 32.26%). Further compaction was applied without moving content between packs or changing the estimator/baseline.
- User reran `node tools/measure-content.mjs --root . --baseline specs/changes/001-english-and-compact/baseline.txt 2>&1 | tail -8` and confirmed "ya dio 0 errores". This closes T30 identity/description/rules/reduction gates. Static expected totals at E3: architecture 1,619; frontend 1,208; SDD 11,513; core rules 278. Subsequent body-only self-review fixes reduce SDD by 6 tokens to an expected 11,507; all other measurement inputs/limits unchanged. Exact final CLI rows were not supplied; these totals remain static estimates, distinct from the user's zero-error result.
- T31–T39 preparation: validation.md maps all 104 approved scenarios to evidence or explicit pending status; temporary installer/YAML verifier passed; independent before/after review packet is ready, reviewer verdict pending.
- Static/documentary review is implementation evidence, not independent invariant or live behavioral review. Before final acceptance, T31/T32 and T35–T39 remained unchecked; final accepted exceptions below close them without inventing verification; tests/measurement alone do not establish spec fulfillment.

- User confirmed final verifier PASS: 25 frontmatters parsed with PyYAML safe_load; 20 before/after installation matrices (sdd/all, project/global, four adapters separately and combined); dry-run paths and real installed file lists equal; 6 protection cases preserve exact backups, outside-marker text, other-pack markers and sentinel. Repository packs unchanged, temporary data removed, real global instructions untouched. T33/T34 complete; T32 remains open only for independent semantic review.

- Same-session self-review requested by user: three introduced medium precision/invariant findings corrected (explicit no push/merge, no unrelated modules, optional plan for reviewer). No independent verdict claimed; details and limits in validation.md. Live setup script/runbook prepared for 18 disposable projects; user setup execution confirmed (18 projects, final project-local skills/agents). Root: `/var/folders/48/jzfj_ty569n1dm5f8nrlgzsm0000gn/T/rigorkit-001-live-1jedmu7s`. Observed scenario evidence deferred by user until a normal future change. No runtime commands executed by the implementation agent.

- Delivery decision, 2026-10-23: user explicitly deferred the smoke until a normal future change and requested finishing this change now. No more live prompts/setup runs are required in this delivery. T35–T38 stay unchecked with deferral reason; T31/T32 remain independently unreviewed; T39 has a complete evidence matrix but cannot claim all original criteria fulfilled. No requirements/scenarios deleted or silently waived.

## Final acceptance — 2026-10-23
All tasks are closed by the user's explicit acceptance of this delivery. For T31/T32, independent review was accepted as an unperformed exception (T32 strict YAML and self-review did run). For T35–T38, [x] means accepted closure with deferred live evidence, NOT tests passed. T39 closes evidence integration with these explicit exceptions. Original done-when criteria remain below for traceability; prior pending-state entries are historical evidence. The user requested completed/archive status despite these gaps, with later problems handled in a later change.
Archive-only maintenance changes the real-spec location in tools/test/check-scenarios.test.mjs and the fixed output path in tools/capture-baseline.mjs. No assertion, fixture, estimator, source commit, baseline bytes or installed path changes. Earlier test results predate these two path-only edits; no rerun claimed.

Derived aliases for T14–T23 (migration evidence, not an installed shared reference):
Source: `git show edad002:packs/sdd/skills/sdd-init/templates/<file>` compared with the English templates and their readers. Both template copies matched the original before editing. Each reader embeds only aliases it reads, under D4. Spanish strings below quote original structure for compatibility.

| Template / class | Derived pairs | Producers / consumers |
|---|---|---|
| `spec.md` — headings | `# Spec <NNN> — <Nombre>` → `# Spec <NNN> — <Name>`; `## Contexto y objetivo` → `## Context and goal`; `## Usuarios / actores` → `## Users / actors`; `## Historias de usuario` → `## User stories`; `## Requisitos funcionales (EARS)` → `## Functional requirements (EARS)`; `### <Grupo> (H1)` → `### <Group> (H1)`; `## Requisitos no funcionales` → `## Non-functional requirements`; `## Escenarios de prueba` → `## Test scenarios`; `## Fuera de alcance` → `## Out of scope`; `## Criterios de finalización` → `## Completion criteria`; `## Preguntas y respuestas` → `## Questions and answers`; `## Dudas abiertas` → `## Open questions` | sdd-spec (T15); sdd-clarify/plan (T16); sdd-tests (T18); sdd-change (T22); sdd-reviewer (T23); checker (T9, heading only) |
| `spec.md` — columns | `\| ID \| Tipo \| Dado \| Cuando \| Entonces \|` → `\| ID \| Type \| Given \| When \| Then \|` | sdd-spec (T15); sdd-clarify/plan (T16); sdd-tests (T18); sdd-change (T22); sdd-reviewer (T23); checker (T9, heading only) |
| `spec.md` — metadata and EARS | `> Estado: borrador \| aprobado · DoD: normal \| crítico · Repo dueño: <repo> · Repos afectados: <…>` → `> Status: draft \| approved · DoD: normal \| critical · Owner repo: <repo> · Affected repos: <…>`; `- RF-1: CUANDO <evento>, EL SISTEMA <respuesta> (<resultado esperado>).` → `- RF-1: WHEN <event>, THE SYSTEM SHALL <response> (<expected result>).`; `- RF-2: SI <condición no deseada>, ENTONCES EL SISTEMA <respuesta>.` → `- RF-2: IF <unwanted condition>, THEN THE SYSTEM SHALL <response>.`; `- RF-3: MIENTRAS <estado>, EL SISTEMA <respuesta>.` → `- RF-3: WHILE <state>, THE SYSTEM SHALL <response>.`; `- RF-4: EL SISTEMA <comportamiento permanente>.` → `- RF-4: THE SYSTEM SHALL <permanent behavior>.` | sdd-spec (T15); sdd-clarify/plan (T16); sdd-tests (T18); sdd-change (T22); sdd-reviewer (T23); checker (T9, heading only) |
| `spec.md` — markers | `[NECESITA ACLARACIÓN]` → `[NEEDS CLARIFICATION]` | sdd-spec (T15); sdd-clarify/plan (T16); sdd-tests (T18); sdd-change (T22); sdd-reviewer (T23); checker (T9, heading only) |
| `spec.md` — row types | `borde` → `edge`; `falla` → `failure`; `seguridad` → `security` | sdd-spec (T15); sdd-clarify/plan (T16); sdd-tests (T18); sdd-change (T22); sdd-reviewer (T23); checker (T9, heading only) |
| `scenarios.md` — headings | `# Escenarios de prueba` → `# Test scenarios`; `## Tipos` → `## Types`; `## Regla` → `## Rule`; `## Formato en el spec` → `## Spec format`; `## Checklist para encontrar bordes y fallas` → `## Checklist for edges and failures`; `## Chequeo automático` → `## Automated check` | sdd-spec (T15); sdd-clarify (T16); sdd-tests (T18); sdd-verify (T19); sdd-reviewer (T23) |
| `scenarios.md` — columns | `\| Tipo \| Letra \| Qué prueba \| Ejemplo (aplicar cupón) \|` → `\| Type \| Letter \| What it tests \| Example (apply coupon) \|`; `\| ID \| Tipo \| Dado \| Cuando \| Entonces \|` → `\| ID \| Type \| Given \| When \| Then \|` | sdd-spec (T15); sdd-clarify (T16); sdd-tests (T18); sdd-verify (T19); sdd-reviewer (T23) |
| `scenarios.md` — row types | `borde` → `edge`; `falla` → `failure`; `seguridad` → `security` | sdd-spec (T15); sdd-clarify (T16); sdd-tests (T18); sdd-verify (T19); sdd-reviewer (T23) |
| `ears.md` — headings | `# EARS: cómo escribir requisitos` → `# EARS: writing requirements`; `## Reglas` → `## Rules`; `## Ejemplo` → `## Example` | sdd-spec (T15); sdd-clarify (T16); sdd-change (T22); sdd-reviewer (T23) |
| `ears.md` — columns | `\| Patrón \| Forma \| Cuándo \|` → `\| Pattern \| Form \| When \|` | sdd-spec (T15); sdd-clarify (T16); sdd-change (T22); sdd-reviewer (T23) |
| `ears.md` — EARS patterns | `EL SISTEMA \<hará\>` → `THE SYSTEM SHALL \<action\>`; `CUANDO \<disparador\>, EL SISTEMA \<hará\>` → `WHEN \<trigger\>, THE SYSTEM SHALL \<action\>`; `MIENTRAS \<estado\>, EL SISTEMA \<hará\>` → `WHILE \<state\>, THE SYSTEM SHALL \<action\>`; `DONDE \<característica\>, EL SISTEMA \<hará\>` → `WHERE \<feature\>, THE SYSTEM SHALL \<action\>`; `SI \<condición\>, ENTONCES EL SISTEMA \<hará\>` → `IF \<condition\>, THEN THE SYSTEM SHALL \<action\>` | sdd-spec (T15); sdd-clarify (T16); sdd-change (T22); sdd-reviewer (T23) |
| `ears.md` — markers | `[NECESITA ACLARACIÓN: <pregunta concreta>]` → `[NEEDS CLARIFICATION: <specific question>]` | sdd-spec (T15); sdd-clarify (T16); sdd-change (T22); sdd-reviewer (T23) |
| `clarification.md` — headings | `## Clarificación — <id>, ronda <n> (<fecha>) · Veredicto: listo para plan \| no listo` → `## Clarification — <id>, round <n> (<date>) · Verdict: ready for plan \| not ready` | sdd-clarify/plan (T16); sdd-resume (T17); sdd-reviewer (T23) |
| `validation.md` — headings | `## Validación — <id>` → `## Validation — <id>` | sdd-verify (T19); sdd-reviewer (T23) |
| `validation.md` — columns | `\| Escenario \| Tipo \| Test que lo cubre \| Resultado \|` → `\| Scenario \| Type \| Covering test \| Result \|` | sdd-verify (T19); sdd-reviewer (T23) |
| `validation.md` — fields and verdict | `Revisión global` → `Global review`; `Contratos e integración` → `Contracts and integration`; `Prueba en vivo` → `Live test`; `Pendientes` → `Pending`; `Veredicto` → `Verdict` | sdd-verify (T19); sdd-reviewer (T23) |
| `validation.md` — checker outcome | `check-scenarios: sin faltantes \| faltan <…>` → `check-scenarios: none missing \| missing <…>` | sdd-verify (T19); sdd-reviewer (T23) |
| `validation.md` — verdict | `Veredicto: spec cumplido \| falta <…>` → `Verdict: spec fulfilled \| missing <…>` | sdd-verify (T19); sdd-reviewer (T23) |

| `plan.md` — headings | `# Plan técnico — <id>` → `# Technical plan — <id>`; `## Contexto actual` → `## Current context`; `## Estructura por capa / módulo` → `## Structure by layer / module`; `## Modelo de datos` → `## Data model`; `## Algoritmos` → `## Algorithms`; `## Contratos` → `## Contracts`; `## Decisiones` → `## Decisions`; `## Constitución` → `## Constitution`; `## Estrategia de tests` → `## Test strategy`; `## Riesgos y cross-layer` → `## Risks and cross-layer` | sdd-plan (T16); sdd-tasks/tests (T18); sdd-implement/verify (T19); sdd-reviewer (T23) |
| `plan.md` — columns | `\| Capa / módulo \| Cambio \| RF que cubre \|` → `\| Layer / module \| Change \| RFs covered \|` | sdd-plan (T16); sdd-tasks/tests (T18); sdd-implement/verify (T19); sdd-reviewer (T23) |
| `tasks.md` — headings | `## Estado para retomar` → `## Resume state` | sdd-tasks/tests (T18); sdd-resume (T17); sdd-implement/verify (T19) |
| `tasks.md` — fields | `Hecho cuando` → `Done when`; `Depende de` → `Depends on`; `Leer` → `Read`; `Conservar` → `Preserve`; `Verificar` → `Verify` | sdd-tasks/tests (T18); sdd-resume (T17); sdd-implement/verify (T19) |
| `tasks.md` — state | `Etapa: <…> · Aprobaciones: <evidencia o pendiente> · Task actual: <Tn o ninguna>.` → `Stage: <…> · Approvals: <evidence or pending> · Current task: <Tn or none>.`; `Pendientes/bloqueos: <…> · Siguiente paso: <…>.` → `Pending/blockers: <…> · Next step: <…>.`; `Referencias: <secciones relevantes; no duplicar spec/plan>.` → `References: <relevant sections; do not duplicate spec/plan>.` | sdd-tasks/tests (T18); sdd-resume (T17); sdd-implement/verify (T19) |
| `baseline.md` — headings | `# Baseline — <módulo> (<fecha>)` → `# Baseline — <module> (<date>)`; `## Qué hace hoy` → `## What it does today`; `## Contrato real` → `## Actual contract`; `## Mismatches conocidos` → `## Known mismatches`; `## Features a medias detectadas` → `## Detected half-wired features`; `## ¿Ruta crítica?` → `## Critical path?` | sdd-adopt (T14); sdd-context (T17); sdd-archive (T21); sdd-reviewer (T23) |
| `baseline.md` — columns | `\| Campo \| Entity \| Migración \| DTO \| Tipo compartido \| Productores \| Consumidores \|` → `\| Field \| Entity \| Migration \| DTO \| Shared type \| Producers \| Consumers \|` | sdd-adopt (T14); sdd-context (T17); sdd-archive (T21); sdd-reviewer (T23) |
| `proposal.md` — fields | `Repo dueño` → `Owner repo`; `Qué le toca a este repo` → `This repo's scope`; `RF del spec que implementa este repo` → `Spec RFs implemented by this repo` | sdd-spec (T15); sdd-tasks (T18); sdd-archive (T21) |
| `half-wired.md` — headings | `# Features a medias` → `# Half-wired features`; `## Activas` → `## Active`; `### HW-01 · <Feature> (<módulo>)` → `### HW-01 · <Feature> (<module>)`; `## Resueltas` → `## Resolved`; `### HW-NN · <Feature> — resuelta el <YYYY-MM-DD>` → `### HW-NN · <Feature> — resolved on <YYYY-MM-DD>` | sdd-adopt (T14); sdd-context (T17); sdd-verify (T19); sdd-archive (T21) |
| `half-wired.md` — fields | `Dónde` → `Where`; `Qué parece` → `What it seems to do`; `Qué falta en realidad` → `What is actually missing`; `Decisión` → `Decision` | sdd-adopt (T14); sdd-context (T17); sdd-verify (T19); sdd-archive (T21) |
| `learning.md` — headings | `# <Título legible: la regla en una frase>` → `# <Readable title: the rule in one sentence>`; `## Por qué` → `## Why`; `## Ejemplo` → `## Example` | sdd-archive/vault (T21); tag readers (T15/T17, tags key unchanged) |
| `learning.md` — frontmatter | `tipo: conocimiento \| decision \| aprendizaje` → `type: knowledge \| decision \| learning`; `estado: vigente` → `status: current`; `origen: "specs/archive/<id>/"` → `source: "specs/archive/<id>/"`; `actualizado: YYYY-MM-DD` → `updated: YYYY-MM-DD` | sdd-archive/vault (T21); tag readers (T15/T17, tags key unchanged) |
| `learning.md` — sections by type | `Para tipo: decision, usa las secciones Contexto / Decisión / Alternativas descartadas.` → `For type: decision, use Context / Decision / Rejected alternatives.`; `Para tipo: aprendizaje, usa Síntoma / Causa / Solución / Cómo detectarlo.` → `For type: learning, use Symptom / Cause / Solution / How to detect it.` | sdd-archive/vault (T21); tag readers (T15/T17, tags key unchanged) |

| `constitution.md` — added RF-9 field | absent in edad002 → `Language:` empty; question/record handled by T14 | sdd-init/adopt (T14); language consumers T15–T22; critical paths sdd-verify (T19) |
| `constitution.md` — headings | `# Constitución — <proyecto>` → `# Constitution — <project>`; `## Rutas críticas (DoD reforzado)` → `## Critical paths (reinforced DoD)` | sdd-init/adopt (T14); language consumers T15–T22; critical paths sdd-verify (T19) |
| `constitution.md` — columns | `\| Ruta / módulo \| Por qué es crítica \| Camino crítico de regresión \|` → `\| Path / module \| Why critical \| Critical-path regression \|` | sdd-init/adopt (T14); language consumers T15–T22; critical paths sdd-verify (T19) |
| `AGENTS.md` — headings | `# AGENTS.md — <proyecto>` → `# AGENTS.md — <project>`; `## Proyecto` → `## Project`; `## Comandos (los corre el usuario, nunca el agente)` → `## Commands (the user runs them, never the agent)`; `## Estilo y convenciones` → `## Style and conventions`; `## Reglas` → `## Rules`; `## Al terminar cualquier task` → `## After every task` | sdd-init (T14); agents reading project instructions |
| `AGENTS.md` — commands | `Ejecutar` → `Run` | sdd-init (T14); agents reading project instructions |


## Tasks
Each task is at most 20–30 minutes. Split overruns without broader scope or lost references. The user runs commands; unexecuted checks stay pending. RF references include their spec scenarios; D1–D9 are plan decisions. Tests first; new behavior needs intended red, never forced regression failures.

- [x] T1. Write identity and description fixtures/tests. (RF-2, RF-16, RF-19) [measurement tests · rigorkit]
      Done when: Six RF-2.H1/E1/F1 and RF-16.H1/E1/F1 CLI tests; isolated fixtures; user confirms intended implementation-absent red.
      Depends on: none.
      Read: spec RF/scenarios above; plan: Data model; Measurement and identity; Contracts; Test strategy; `install.sh:162-164`.
      Preserve: D1–D3/D9; names, escaped apostrophes, exact bounds, fixture isolation.
      Verify: Six ID-first tests and change ID; otherwise-valid fixtures; consistent rename; 300/301 characters.

- [x] T2. Complete reduction, rules and report tests. (RF-17, RF-18, RF-19) [measurement tests · rigorkit]
      Done when: Nine RF-17.H1/E1/F1, RF-18.H1/E1/F1, RF-19.H1/E1/F1 tests; user confirms intended new red.
      Depends on: T1.
      Read: spec RF/scenarios above; plan: Measurement and identity; Data model; Test strategy.
      Preserve: D2/D3; independent packs, NFC/code points and entry rounding; no byte/display-percent oracle.
      Verify: 30%/29%, 300/301 tokens, composed/decomposed Unicode, file/pack/identity report, missing baseline and exit 1.

- [x] T3. Write checker heading tests. (RF-8, RF-25) [integration tests · rigorkit]
      Done when: RF-8.H1/E1/F1 invoke real pack checker; user supplies results.
      Depends on: none.
      Read: spec RF/scenarios above; plan: Contracts; Test strategy; `packs/sdd/skills/sdd-init/scripts/check-scenarios.mjs:64-95,133-157`.
      Preserve: Valid requirements/rows; CLI/codes; existing Spanish regression stays green.
      Verify: English/Spanish accepted; absent heading gives English error; no unrelated fixture-coverage failure.

- [x] T4. Write coverage and real-spec integration tests. (RF-25) [integration tests · rigorkit]
      Done when: RF-25.H1/E1/F1 plus 21 required titles; user output distinguishes regressions from new red.
      Depends on: T1, T2, T3.
      Read: spec RF/scenarios above; plan: Test strategy; Contracts; `:93-127`; `:20-61`.
      Preserve: Scenario/change association, manual/n/a exclusion, no marker pollution hiding gaps.
      Verify: H1 uses real spec and --tests tools/test; E1 manual excluded; F1 missing test detected; useful assertions each.

- [x] T5. Implement measurement inventory and estimates. (RF-2, RF-16, RF-18, RF-19) [tools · rigorkit]
      Done when: CLI inventories skills/agents/rules, measures descriptions/load and reports plan-defined files; user verifies applicable T1/T2 cases.
      Depends on: T1, T2, T3, T4.
      Read: spec RF/scenarios above; plan: Measurement and identity; Data model; Contracts; D1–D3.
      Preserve: Node built-ins, no frontmatter/NOTICE in load, include auxiliaries, no new installed files.
      Verify: Skill-folder/agent-file names, YAML apostrophes, NFC, whole rules, clear errors; checker writes nothing.

- [x] T6. Implement baseline comparison and failures. (RF-2, RF-16, RF-17, RF-18, RF-19) [tools · rigorkit]
      Done when: --root/--baseline, schema/set/limit checks, all violations and 0/1 exit; user confirms 15 measurement tests green.
      Depends on: T5.
      Read: spec RF/scenarios above; plan: Measurement and identity; Contracts; D2/D3.
      Preserve: Integer per-pack threshold, readable errors, immutable baseline, stable path order.
      Verify: Exactly 30% passes/29% fails; additions/removals/renames/name mismatch; bad args/missing or unreadable/invalid baseline never silently pass.

- [x] T7. Prepare reproducible capture and obtain edad002 baseline. (RF-2, RF-17, RF-19, RF-20) [baseline · rigorkit]
      Done when: baseline.txt contains plan schema, full edad002 commit, names/descriptions/load/rules; user output proves source/inventory.
      Depends on: T6.
      Read: spec RF/scenarios above; plan: Data model; Contracts; `git ls-tree`; `git show`.
      Preserve: Separate explicit capture, no checkout switch/overwrite, no new reduction gate on original state.
      Verify: Concrete temporary-path command; no personal config; compare edad002 inventory before packed-content edits.

- [x] T8. Normalize tiers and prefer English model keys. (RF-3, RF-4) [installer · rigorkit]
      Done when: Installer accepts both tier vocabularies and English presence precedence; adapters/targets/escaping unchanged; user supplies focused checks.
      Depends on: T7.
      Read: spec RF/scenarios above; plan: Tiers and model selection; Contracts; D6; `install.sh:162-206`; D6.
      Preserve: Empty tier inherits; empty English key wins; invalid tier fails; readonly/YAML/TOML; no logic beyond RF-3.
      Verify: Both levels with old/new/both/no config; Cursor without Claude and remaining adapters; full regression T33/T34.

- [x] T9. Update pack scenario checker. (RF-1, RF-8, RF-25) [checker · rigorkit]
      Done when: Both headings, English comments/messages; user confirms six checker tests and real-spec checker green.
      Depends on: T4, T7.
      Read: spec RF/scenarios above; plan: Derived aliases; Contracts; `:20-157`.
      Preserve: RF/HEFS, IDs/n/a/manual, test discovery, strict modes and change association.
      Verify: Spanish/manual/n/a/missing-test/non-strict regressions; no second checker copy.

- [x] T10. Translate spec, scenarios, EARS, clarification and validation templates. (RF-1, RF-6, RF-8, RF-17, RF-20) [templates · rigorkit]
      Done when: Both copies of five files translated; structural before/after pairs and consumers identified.
      Depends on: T7, T9.
      Read: spec RF/scenarios above; plan: Derived aliases; D4/D5; `packs/sdd/skills/sdd-init/templates/{spec,scenarios,ears,clarification,validation}.md`; `specs/templates/`; D4/D5.
      Preserve: Requirements/scenarios/columns/verdicts/IDs/formats; no new skill files.
      Verify: edad002 diff, synchronized copies, compatible checker; alias evidence for T14–T19.

- [x] T11. Translate plan, tasks, baseline, proposal, half-wired and learning templates. (RF-1, RF-5, RF-6, RF-8, RF-17, RF-20) [templates · rigorkit]
      Done when: Both copies of six files English, fields/rules intact; pairs and consumers identified.
      Depends on: T7.
      Read: spec RF/scenarios above; plan: Derived aliases; Risks and cross-layer; `sdd-init/templates/`; `specs/templates/`.
      Preserve: Stable HW-NN, task/resume fields, learning metadata, approvals/dependencies.
      Verify: Before/after and copy comparisons; archive/resume/tasks/adopt consumer tasks retain refs; no other repo migration.

- [x] T12. Translate constitution and SDD instructions templates. (RF-1, RF-8, RF-9, RF-17, RF-20) [templates · rigorkit]
      Done when: Both constitution/AGENTS copies English; Language: field present; derived contracts ready for init/adopt.
      Depends on: T7.
      Read: spec RF/scenarios above; plan: Artifact language and structure; Derived aliases.
      Preserve: Limits/gates, user-run commands, protected user instructions; no forced English for future projects.
      Verify: Language field and all principles/critical-path table preserved.

- [x] T13. Update own repository rules. (RF-1, RF-14, RF-15) [instructions · rigorkit]
      Done when: Root AGENTS/constitution English; description <=300 characters, rules <=300 tokens; constitution Language: en.
      Depends on: T7, T12.
      Read: spec RF/scenarios above; plan: Constitution.
      Preserve: Eight principles, critical paths, prefixes, YAML quotes, reference exception, soft dependencies, no overwrites.
      Verify: Replace old language/limit rules without other loss; diff against edad002.

- [x] T14. Translate/compact init and adopt with language declaration. (RF-1, RF-2, RF-5, RF-6, RF-7, RF-8, RF-10, RF-11, RF-12, RF-13, RF-16, RF-17, RF-20, RF-22, RF-23) [SDD skills · rigorkit]
      Done when: Both skills keep stages/approvals, ask constitution language, follow project templates/aliases; English descriptions <=300.
      Depends on: T10, T11, T12, T13.
      Read: spec RF/scenarios above; plan: Artifact language and structure; Derived aliases; D4/D5/D7/D8; `packs/sdd/skills/sdd-{init,adopt}/SKILL.md`; D4/D5/D7/D8.
      Preserve: No specs overwrite; one question/time; max 15 principle lines; one module/time; no adoption fixes.
      Verify: RF-10.H1/E1/F1, missing templates/fallback and before/after evidence; live cases T35.

- [x] T15. Translate/compact triage and spec. (RF-1, RF-2, RF-5, RF-6, RF-7, RF-8, RF-11, RF-12, RF-13, RF-16, RF-17, RF-20, RF-22, RF-23) [SDD skills · rigorkit]
      Done when: Classification/interview/gates retained, language/structure rules and <=300 descriptions with quoted Spanish requests.
      Depends on: T10, T12, T13.
      Read: spec RF/scenarios above; plan: Artifact language and structure; D4/D5/D7/D8; `packs/sdd/skills/sdd-{triage,spec}/SKILL.md`; D4/D5/D7/D8.
      Preserve: At least 5 questions one/time; EARS, scenario types, scope/approval.
      Verify: Invariant/contracts diff; never invent missing section; Spanish activation T35/T38.

- [x] T16. Translate/compact clarify and plan. (RF-1, RF-2, RF-5, RF-6, RF-7, RF-8, RF-11, RF-12, RF-13, RF-16, RF-17, RF-20, RF-22, RF-23) [SDD skills · rigorkit]
      Done when: Both skills produce/accept structure-language verdicts; rounds/preconditions retained, descriptions <=300.
      Depends on: T10, T11, T13.
      Read: spec RF/scenarios above; plan: Derived aliases; Risks and cross-layer; `packs/sdd/skills/sdd-{clarify,plan}/SKILL.md`.
      Preserve: Zero high/medium for ready, latest round, separate user approval, constitution read, no plan-stage code.
      Verify: RF-5.E1/E2 and RF-8.E2; clarify/reviewer producers and plan consumer support both languages.

- [x] T17. Translate/compact context and resume. (RF-1, RF-2, RF-5, RF-6, RF-7, RF-8, RF-11, RF-12, RF-13, RF-16, RF-17, RF-20, RF-22, RF-23) [SDD skills · rigorkit]
      Done when: Selective reads and reconstruction without resume block retained; local aliases/descriptions <=300.
      Depends on: T11, T13.
      Read: spec RF/scenarios above; plan: D4/D5/D8; `packs/sdd/skills/sdd-{context,resume}/SKILL.md`; D4/D5/D8.
      Preserve: Verify files/git, never infer approval/green from commits/checkboxes; cheap knowledge search and stop.
      Verify: Absent state block, Spanish artifacts and quoted Spanish resume request; same reconstruction/gates.

- [x] T18. Translate/compact tasks and tests. (RF-1, RF-2, RF-5, RF-6, RF-7, RF-8, RF-11, RF-12, RF-13, RF-16, RF-17, RF-20, RF-22, RF-23, RF-25) [SDD skills · rigorkit]
      Done when: Verifiable task/test-per-scenario contracts retained; local aliases/descriptions <=300.
      Depends on: T10, T11, T13.
      Read: spec RF/scenarios above; plan: Artifact language and structure; Test strategy; `packs/sdd/skills/sdd-{tasks,tests}/SKILL.md`.
      Preserve: 20–30 minutes, tests first, initial scenario ID, explicit assertions, intended red, visual exception, evidence before checking.
      Verify: RF-6.H1/RF-7.H1/E1; project structure, missing block omitted, checker refs valid.

- [x] T19. Translate/compact implement and verify. (RF-1, RF-2, RF-5, RF-6, RF-7, RF-8, RF-11, RF-12, RF-13, RF-16, RF-17, RF-20, RF-22, RF-23, RF-25) [SDD skills · rigorkit]
      Done when: Accumulated verification/review/user-output handling retained; descriptions <=300 and local aliases.
      Depends on: T10, T11, T13.
      Read: spec RF/scenarios above; plan: Risks and cross-layer; D4/D5/D8; `packs/sdd/skills/sdd-{implement,verify}/SKILL.md`; D4/D5/D8.
      Preserve: Task scope, introduced highs only, one re-review, global verification, critical DoD, pending checks never claimed.
      Verify: Tasks/validation producers/readers, by-name soft dependencies, absent-section cases; no new auxiliaries.

- [x] T20. Translate/compact verify references. (RF-1, RF-17, RF-20) [SDD references · rigorkit]
      Done when: Both local verify reference files English, all checks/exceptions retained.
      Depends on: T7, T19.
      Read: spec RF/scenarios above; plan: D8; critical DoD; `sdd-verify/SKILL.md`; D8.
      Preserve: Real evidence, critical-path regression and cross-layer contracts; no moving files to hide load.
      Verify: Before/after review and whole-folder measurement, not SKILL.md alone.

- [x] T21. Translate/compact archive and vault reference. (RF-1, RF-2, RF-5, RF-6, RF-7, RF-8, RF-11, RF-12, RF-13, RF-16, RF-17, RF-20, RF-22, RF-23) [SDD skills · rigorkit]
      Done when: Both English; approved promotion, stable IDs, bilingual structures; description <=300.
      Depends on: T11, T13.
      Read: spec RF/scenarios above; plan: D4/D5/D8; Artifact language and structure; `packs/sdd/skills/sdd-archive/{SKILL,vault}.md`; D4/D5/D8.
      Preserve: Vault rules, learning owner, no secrets, duplicate search, approval before writing, no HW renumbering.
      Verify: RF-5.H1/RF-7.F1; Resolved aliases, bilingual vault registration, no invented learning template; no vault writes.

- [x] T22. Translate/compact change, explain and legacy review. (RF-1, RF-2, RF-5, RF-6, RF-7, RF-8, RF-11, RF-12, RF-13, RF-16, RF-17, RF-20, RF-22, RF-23, RF-24) [SDD skills · rigorkit]
      Done when: Three skills retain gates/output/scope, descriptions <=300; @legacy keyword and structure-language text.
      Depends on: T10, T11, T13.
      Read: spec RF/scenarios above; plan: D4/D5/D8; `packs/sdd/skills/sdd-{change,explain,legacy-review}/SKILL.md`; D4/D5/D8.
      Preserve: Evidence before marking/deleting, half-wired distinction, explain criteria, approved writing, prior-RF impact.
      Verify: RF-24.H1/E1/F1, change/capability refs and all output formats; split if >30 minutes.

- [x] T23. Translate/compact SDD explorer and reviewer. (RF-1, RF-2, RF-8, RF-16, RF-17, RF-20, RF-23) [SDD agents · rigorkit]
      Done when: English content/descriptions <=300, cheap/strong, relevant aliases, user-language chat.
      Depends on: T8, T10, T11, T13, T16.
      Read: spec RF/scenarios above; plan: Derived aliases; Contracts; `packs/sdd/agents/sdd-{explorer,reviewer}.md`.
      Preserve: Readonly/roles/severity/formats/verdicts, verify prior closures; explorer never edits.
      Verify: RF-8.E3/RF-23.E1; Spanish spec readable, plan/clarify verdict compatible, valid installer frontmatter.

- [x] T24. Translate/compact architecture references. (RF-1, RF-2, RF-16, RF-17, RF-20) [architecture · rigorkit]
      Done when: Both references English, descriptions <=300, rules retained.
      Depends on: T7, T13.
      Read: spec RF/scenarios above; plan: D8; Constitution; D8.
      Preserve: Reference role/stop exception, existing-code exceptions, dependency direction, registry contracts.
      Verify: edad002 review and pack measurement; no added role/stop or dependencies.

- [x] T25. Translate/compact architecture reviewer. (RF-1, RF-2, RF-8, RF-16, RF-17, RF-20, RF-23) [architecture agent · rigorkit]
      Done when: English strong reviewer, description <=300, two modes/verdict contract retained.
      Depends on: T8, T24.
      Read: spec RF/scenarios above; plan: Derived aliases; Contracts; `packs/architecture/agents/arch-reviewer.md`.
      Preserve: Readonly, project precedence, supplied diff, introduced/pre-existing, audit.
      Verify: RF-23.H1, structure verdict/user chat; >=30% pack reduction or explicit T30 adjustment.

- [x] T26. Translate/compact frontend reference and reviewer. (RF-1, RF-2, RF-8, RF-16, RF-17, RF-20, RF-23) [frontend · rigorkit]
      Done when: Both English, descriptions <=300, reviewer strong; rules/modes retained.
      Depends on: T7, T8, T13.
      Read: spec RF/scenarios above; plan: D8; `packs/frontend/skills/frontend-structure/SKILL.md`; `packs/frontend/agents/frontend-reviewer.md`; D8.
      Preserve: Suffixes/barrels/server-client/routes/existing exceptions; architecture reviewer boundary.
      Verify: Before/after invariants, output aliases, >=30% pack reduction; split if >30 minutes.

- [x] T27. Translate/compact core rules and helper documentation. (RF-1, RF-18, RF-20) [core · rigorkit]
      Done when: Rules/README/Spanish helper comments/messages English; rules <=300 tokens.
      Depends on: T7, T13.
      Read: spec RF/scenarios above; plan: D8; `packs/core/{rules.md,README.md,scripts/*}`; D8.
      Preserve: Negations/numbers/units/commands/paths, cheap search, subagent limits/context clearing; helper contracts/logic.
      Verify: Rule measurement, every rule reviewed, helper changes content-only; no functional-output changes for compaction.

- [x] T28. Translate READMEs and both attributions. (RF-1, RF-3, RF-4, RF-21) [documentation · rigorkit]
      Done when: Root/sdd/architecture/frontend READMEs English; English-tier examples explain aliases; NOTICE describes current adaptations.
      Depends on: T8, T14, T23, T25, T26, T27.
      Read: spec RF/scenarios above; plan: Contracts; `install.sh`.
      Preserve: Author/license/URLs/paths, existing flags/install warnings; no website/third-party copying.
      Verify: Identical NOTICE copies, valid local links, examples match installer; no unverified compatibility claims.

- [x] T29. Translate remaining own artifacts and consolidate alias evidence. (RF-1, RF-5, RF-8, RF-14, RF-20) [own specs · rigorkit]
      Done when: Own plan/tasks/half-wired English; spec meaning/history/approvals retained; derived structure pairs/readers traceable.
      Depends on: T10, T11, T12, T13, T14, T15, T16, T17, T18, T19, T20, T21, T22, T23.
      Read: spec RF/scenarios above; plan: Derived aliases; RF-1/RF-5; `specs/`; `edad002`.
      Preserve: RF/T/D/HW IDs, dependencies/checks/approval sources, clarification history/baseline; aliases only from actual sources.
      Verify: Every read structural string has pairs/consumers; no old own rules or non-exempt Spanish prose; split if >30 minutes.

- [x] T30. Measure whole change and adjust compaction where needed. (RF-2, RF-16, RF-17, RF-18, RF-19, RF-20) [content integration · rigorkit]
      Done when: User output proves >=30% per target pack, descriptions <=300, rules <=300, stable identity; fixes preserve invariants.
      Depends on: T6, T7, T14, T15, T16, T17, T18, T19, T20, T21, T22, T23, T24, T25, T26, T27, T28, T29.
      Read: spec RF/scenarios above; plan: D2/D3/D8; Measurement and identity; D2/D3/D8.
      Preserve: Immutable edad002 baseline, all auxiliaries counted, no moving load between packs.
      Verify: Report per file/pack; if adjustments exceed 30 minutes, split focused subtasks and keep this pending.

- [x] T31. Independently review SDD invariants and language. (RF-1, RF-20, RF-21) [SDD review · rigorkit]
      Done when: sdd-reviewer accumulated SDD diff vs edad002 gives evidence per skill/agent; no unresolved invariant loss.
      Depends on: T30.
      Read: spec RF/scenarios above; plan: Test strategy; spec Invariants.
      Preserve: Readonly review, roles/stops/order/negations/numbers/formats; only spec-permitted behavior changes.
      Verify: Introduced/pre-existing/severity separated; green tests alone never prove review; split file groups if >30 minutes.

- [x] T32. Review remaining packs and strictly parse frontmatter. (RF-1, RF-2, RF-15, RF-16, RF-20, RF-23) [contract review · rigorkit]
      Done when: Independent architecture/frontend/core/instructions review preserves invariants; user supplies strict YAML parsing of all frontmatter.
      Depends on: T30.
      Read: spec RF/scenarios above; plan: D9; RF-20; `edad002`; D9.
      Preserve: Reference/reviewer roles, readonly, scope/output; no new production dependency.
      Verify: Choose available strict parser with user; quotes/apostrophes/name-path/length; absent evidence stays pending, regex alone insufficient.

- [x] T33. Prepare/verify temporary installer and model matrix. (RF-3, RF-4, RF-19) [installer regression · rigorkit]
      Done when: User runs concrete project/global dry-runs and real temporary matrix; compare edad002/final targets/models for all adapters.
      Depends on: T8, T28, T30.
      Read: spec RF/scenarios above; plan: Test strategy; installer adapters; `install.sh`.
      Preserve: Isolated temporary environment, Cursor without Claude, both-level aliases, no real config writes/checkout changes.
      Verify: Relative file equivalence, readonly/escaping, invalid tiers, English/empty precedence, tools excluded; user output required.

- [x] T34. Verify file protection/backups in real temporary install. (RF-4) [critical DoD · rigorkit]
      Done when: User evidence covers RF-4.F1/S1: prior instructions, rigorkit blocks, .bak and outside sentinel intact.
      Depends on: T33.
      Read: spec RF/scenarios above; plan: Constitution critical paths; Risks and cross-layer.
      Preserve: No real user-file writes, installer logic beyond RF-3 unchanged, same installed set.
      Verify: Compare outside-marker content, recoverable backup, sentinel; failures stay pending with scoped fixes.

- [x] T35. Live-check language declaration and new-artifact prose. (RF-9, RF-10, RF-11, RF-12) [manual verification · rigorkit] — DEFERRED by user, 2026-10-23; pending real-use smoke, not PASS.
      Done when: User Claude Code evidence covers manual RF-9–RF-12, final installed version and temporary projects.
      Depends on: T14, T15, T16, T17, T18, T19, T21, T22, T23, T25, T26, T31, T32, T33.
      Read: spec RF/scenarios above; plan: Artifact language and structure; Test strategy.
      Preserve: Init/adopt questions/approvals, project templates, generic data, per-ID evidence.
      Verify: Language es/Spanish/invalid/absent, empty when unanswered, user-language switch; never personal config copies.

- [x] T36. Live-check language fallback. (RF-13) [manual verification · rigorkit] — DEFERRED by user, 2026-10-23; pending real-use smoke, not PASS.
      Done when: User evidence covers RF-13.H1/E1/F1 in temporary projects with/without prior artifacts.
      Depends on: T31, T33.
      Read: spec RF/scenarios above; plan: Artifact language and structure.
      Preserve: Ask language once; silence chooses language only, never approval; no real project changes.
      Verify: Prior-artifact language, one question without references, announced English fallback without answer; request/result per case.

- [x] T37. Live-check artifact structure and compatibility. (RF-5, RF-6, RF-7, RF-8) [manual verification · rigorkit] — DEFERRED by user, 2026-10-23; pending real-use smoke, not PASS.
      Done when: User evidence covers manual RF-5–RF-8: Spanish/English/mixed artifacts and missing templates/sections.
      Depends on: T31, T33.
      Read: spec RF/scenarios above; plan: D4/D5; Derived aliases; D4/D5.
      Preserve: Existing structure/prose/gates/project templates; no migration or invented sections.
      Verify: Resolved, prose-preserving additions, Done when, absent resume block, skipped learning, Spanish verdict/reviewer spec.

- [x] T38. Live-check activation, chat and markers. (RF-22, RF-23, RF-24) [manual verification · rigorkit] — DEFERRED by user, 2026-10-23; pending real-use smoke, not PASS.
      Done when: User evidence covers manual RF-22–RF-24 with installed version and observable result per ID.
      Depends on: T31, T32, T33.
      Read: spec RF/scenarios above; plan: RF-22–RF-24; final descriptions/verdict/marker contracts.
      Preserve: Quoted Spanish requests, chat language, verdict structure, @legacy; no real-code marking without evidence.
      Verify: Spec/resume/ambiguous activation, Spanish architecture message, structure-language verdict, Spanish/English/missing-keyword marker.

- [x] T39. Integrate validation and accumulated verification. (RF-1, RF-2, RF-3, RF-4, RF-5, RF-6, RF-7, RF-8, RF-9, RF-10, RF-11, RF-12, RF-13, RF-14, RF-15, RF-16, RF-17, RF-18, RF-19, RF-20, RF-21, RF-22, RF-23, RF-24, RF-25) [sdd-verify · rigorkit]
      Done when: validation.md maps every RF/scenario to valid evidence, n/a reasons and explicit pending work; fulfilled verdict only when all accredited.
      Depends on: T9, T13, T28, T29, T30, T31, T32, T33, T34, T35, T36, T37, T38.
      Read: spec RF/scenarios above; plan: Full spec/plan/tasks; accumulated diff; validation template; `edad002`.
      Preserve: Critical DoD, cross-component checks, independent review; no string searches replacing live tests; user runs commands.
      Verify: 21 tests, coverage no gaps, measurement no errors, individual manual evidence; reuse valid results unless later changes invalidate them.

References guide reading, never limit real dependency checks. Mark [x] only with sufficient verification/review. Task grouping alone did not authorize commits, push, merge, archival or vault writes; the final explicit closure request authorizes this archive/local delivery commit. No push/merge/vault writes.
