# Pack `sdd` — Spec-Driven Development por etapas

Antes de escribir código se acuerda **qué** y **por qué** (spec), después **cómo** (plan) y por último los **pasos** (tasks). Cada etapa tiene una salida concreta y un **Definition of Done** que funciona como gate. En spec, clarificación, plan, tasks, tests y en cada commit siempre hay aprobación humana.

## Reglas del agente (todas las skills)
- Actúa como el **top 1%** del rol de cada etapa. Sin halagos; señala el punto ciego.
- Verifica contra el código (`archivo:línea`); no supone.
- **No corre comandos** (install, build, lint, tsc, tests, migraciones, seeds, deploy): los da y espera la salida. Solo lecturas.
- Un commit por task, cada uno con OK del usuario. Nunca commits encadenados, push ni merge.
- Para al final de cada etapa.

## Estructura fija en cada repo
```
specs/
  constitution.md              reglas no negociables (máx. 15 líneas) + rutas críticas
  baselines/<módulo>.md        cómo funcionaba el módulo al adoptar SDD
  capabilities/<área>/spec.md  spec vivo: lo que el sistema ES hoy
  changes/<id>/                spec.md, plan.md, tasks.md (+ data-model, contracts)
                               o proposal.md si el repo no es el dueño del cambio
  archive/<id>/                cambios terminados
  half-wired.md                registro de features a medias
  learnings/<id>-<slug>.md     conocimiento reutilizable y genérico (lo escribe sdd-archive)
  templates/                   plantillas (las copia sdd-init)
```
`<id>` = `NNN-nombre-kebab` (ej. `007-pago-por-transferencia`). La metodología (estas skills) vive en rigorkit; el repo guarda solo lo suyo.

## Etapas
| # | Etapa | Skill | Rol (top 1%) | DoD (gate) | Aprobación |
|---|---|---|---|---|---|
| — | Preparar el repo | `sdd-init` | Tech lead | Estructura `specs/` y plantillas creadas | ✅ |
| −1 | Adopción (proyecto con código, obligatoria) | `sdd-adopt` | Arquitecto | Constitución con rutas críticas · un baseline por módulo con `archivo:línea` · features a medias registradas | ✅ |
| 0 | Triage | `sdd-triage` | Tech lead | Tamaño, repo dueño, `<id>` y nivel de DoD (crítico si hay duda) | ✅ |
| 1 | Contexto | `sdd-context` | Ingeniero senior | Qué existe hoy con `archivo:línea` · dudas listadas | — |
| 2 | Spec | `sdd-spec` | Product manager | ≥5 preguntas de una en una · RF en EARS · fuera de alcance · sin referencias al código | ✅ |
| 2.5 | Clarificación | `sdd-clarify` | QA | Ronda con veredicto "listo para plan" (cero hallazgos altos o medios). **Cualquier cambio al spec obliga a una ronda nueva** | ✅ |
| 3 | Plan | `sdd-plan` | Arquitecto | Todos los RF cubiertos · decisiones con alternativa descartada · constitución validada | ✅ |
| 4 | Tasks | `sdd-tasks` | Tech lead | Tasks ≤30 min con RF y "Hecho cuando:" | ✅ |
| 4.5 | Tests primero | `sdd-tests` | Ingeniero de testing | ≥1 test por RF que falla por la razón correcta | ✅ |
| 5 | Implementar | `sdd-implement` | Desarrollador senior | Una task por vez · tests en verde sin tocarlos · commit con OK | ✅ cada commit |
| 6 | Verificar | `sdd-verify` | QA | Tabla RF → test → resultado · cross-layer · DoD crítico si aplica · veredicto | ✅ lo cierra el usuario |
| 7 | Archivar | `sdd-archive` | Ingeniero que documenta | `archive/`, `capabilities/` y baseline al día · half-wired registrado · learnings propuestos | ✅ |

**Soporte:** `sdd-resume` (retomar en una sesión nueva), `sdd-change` (cambia un requisito: primero el spec), `sdd-legacy-review` (código muerto con `@legacy`).

**Subagentes (solo lectura):** `sdd-explorer` (contexto y baselines) y `sdd-reviewer` (clarificación, verificación y revisión independiente).

## Cuánto escribir
| Cambio | Qué se escribe |
|---|---|
| Bugfix o ajuste sin cambio observable | Nada; solo el commit |
| Feature chica, un repo | spec + tasks |
| Arquitectura o cambio de modelo de datos | spec + plan (+ data-model) + tasks |
| Varios repos | Lo anterior en el repo dueño + `proposal.md` en los demás |

## Definition of Done
**Normal:** todos los RF cubiertos y en verde · capas coherentes (DB → API → DTO → front) · verificado en vivo · multi-repo cerrado con el mismo `<id>` · archivado · lo que quedó a medias en `half-wired.md` · aprobado por el responsable.

**Crítico** (dinero, tenants, permisos, migraciones con datos reales): además, test de la falla relevante, smoke real con datos reales, regresión del camino crítico y reporte honesto de lo que falte. Ver `skills/sdd-verify/dod-critical.md`.

## Multi-repo
Mismo `<id>` en todos los repos. El repo dueño tiene spec, plan y tasks completos; los demás, un `proposal.md` que apunta al dueño y sus propias `tasks.md`. Cada repo especifica solo lo suyo: el contrato de API va donde se implementa y la UI donde se renderiza.

## TDD
Los RF del spec se convierten en tests antes de implementar (etapa 4.5). Excepción: la UI puramente visual se cubre con la verificación en vivo.

## Con o sin vault de conocimiento
Funciona solo con el repo. El conocimiento compartido del equipo vive en `specs/learnings/`: solo lo global y reutilizable, sin nada específico del repo. Llega a todos con git.

El vault es opcional y personal: cada persona puede tener uno o ninguno.
- `sdd-triage` y `sdd-context` buscan por tags, primero en el vault y luego en `specs/learnings/`.
- `sdd-archive` escribe los learnings del cambio. Si el usuario tiene vault, le propone promover los que le falten, también los de compañeros.
- Si el vault no está registrado, se pregunta una vez y la respuesta se guarda en las instrucciones locales del usuario.
- Toda nota promovida queda enlazada desde la nota de entrada del vault: nada de notas aisladas.

Detalle en `skills/sdd-archive/vault.md`.
