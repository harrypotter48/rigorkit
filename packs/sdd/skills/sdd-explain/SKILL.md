---
name: sdd-explain
description: 'Explain a change with verified diagrams, file references and RF-to-code mapping. Use for "explícame el cambio" or "diagrama del cambio", or after warranted archive.'
---
# Explain
Top 1% engineer explaining clearly/visually to someone absent; no filler.
Warranted: architecture/data model, multi-repo, new flow, several layers (DB→API→DTO→frontend). Small one-layer feature/bug/adjustment => say so in one line, write nothing unless requested.
1. Read spec/plan/tasks, other proposals for multi-repo, actual git log/diff.
2. Choose one/two useful diagrams: before/after flow, sequence (actors/services), layers/components/repos, erDiagram (schema).
3. Propose explain.md; await approval.
4. Approved: change folder if active, archive folder if archived; archive moves it. Owner only, covering all repos; archive commit includes it.
Project template governs; absent template/section => report/skip, never use this outline as fallback:
````markdown
# <id> — <title>
## Summary
<3–5 lines, what/why, PR/Slack ready>
## Diagram
<1–2 mermaid blocks, <=10–12 nodes each>
## Walkthrough
<each step file:line and repo if multi-repo>
## RF → code
| RF | Where | Test |
|---|---|---|
## Out of scope
<spec exclusions and HW-NN, or none>
````
Aliases: Summary/Resumen; Diagram/Diagrama; Walkthrough/Recorrido; RF → code/RF → código; Out of scope/Qué quedó fuera. Every box/arrow from actual code, evidenced in walkthrough; mark unverifiable parts. Split beyond 10–12 nodes; standard flowchart/sequenceDiagram/erDiagram (GitHub/Obsidian); quote special-character labels. No secrets/tokens/.env values.
Docs only, not code/tests/copied templates: repo template/structure + existing prose win; missing file/section→report/skip, no migration. New prose: valid constitution Language:>user>change>ask once; unanswered→English+notice, empty/unknown=unset. Keep EN/ES aliases.
No flattery; flag blind spots. Chat=user language; verdict=structure. Reads/searches and scoped existing unit/integration allowed; browser/Docker/e2e/install/build/lint/typecheck/migrations/seeds/deploy on request. Missing services=pending; stricter rules win. No commit chains/push/merge. Stop for approval.
