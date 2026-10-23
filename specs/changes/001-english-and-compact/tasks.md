# Tasks — 001-english-and-compact

## Estado para retomar
Etapa: T1–T10 completas en su alcance; pendiente autorización para T11 · Aprobaciones: spec/plan/tasks y continuidad por usuario; T10 por «all green continua», 2026-10-23 · Task actual: ninguna; siguiente T11.
Pendientes/bloqueos: traducción de plantillas restantes y consumidores; medición final/revisión global/en vivo pendientes · Siguiente paso: T11. Commit previo: `8b13977`; T7–T10, baseline y estado actual sin commit.
Referencias: `spec.md` RF-1/RF-6/RF-8/RF-17/RF-20; `plan.md` § Alias derivados y D4/D5; ambas carpetas de plantillas.

Evidencia vigente (2026-10-23):
- T5–T7: usuario confirmó tests del medidor/captura; baseline v1 presente, commit `edad00214e552594fe4da00e51c88803a22f19c5`, 23 entradas y 1 rules.md.
- T8: usuario aportó dry-runs project/global y confirmó los 50 casos de la matriz temporal. Regresión completa contra edad002/protección de archivos siguen en T33/T34.
- T9: usuario confirmó «all green continua» tras recibir seis tests del checker y chequeo del spec real. Se registra como confirmación de ambos comandos, sin atribuir ejecución al agente.
- T10: cinco plantillas traducidas en ambas copias; originales contrastados contra edad002, IDs preservados y parejas de estructura derivadas de los textos reales antes/después. Revisión manual conserva negaciones, cifras, cinco patrones EARS, cuatro tipos, exclusiones n/a/manual, veredictos y formatos. Copias sincronizadas por construcción; no se modificaron tests ni checker.
- T10 solo cambia documentación/plantillas. La evidencia de T9 sigue vigente para el checker; integración conductual de productores/consumidores y revisión independiente global quedan en T14–T23/T31/T35–T39. No repetir tests sin cambios relevantes a sus consumidores.

Alias derivados para T14–T23 (evidencia de migración, no una referencia instalada compartida):
Fuente: `git show edad002:packs/sdd/skills/sdd-init/templates/<archivo>` frente a su traducción en T10; ambos juegos eran idénticos al original antes de editar. Los consumidores incorporarán solo los alias que lean, inline, según D4. Las versiones españolas de esta tabla son citas de estructura para compatibilidad.

| Plantilla / clase | Parejas derivadas | Productores / consumidores |
|---|---|---|
| `spec.md` — encabezados | `# Spec <NNN> — <Nombre>` → `# Spec <NNN> — <Name>`; `## Contexto y objetivo` → `## Context and goal`; `## Usuarios / actores` → `## Users / actors`; `## Historias de usuario` → `## User stories`; `## Requisitos funcionales (EARS)` → `## Functional requirements (EARS)`; `### <Grupo> (H1)` → `### <Group> (H1)`; `## Requisitos no funcionales` → `## Non-functional requirements`; `## Escenarios de prueba` → `## Test scenarios`; `## Fuera de alcance` → `## Out of scope`; `## Criterios de finalización` → `## Completion criteria`; `## Preguntas y respuestas` → `## Questions and answers`; `## Dudas abiertas` → `## Open questions` | sdd-spec (T15); sdd-clarify/plan (T16); sdd-tests (T18); sdd-change (T22); sdd-reviewer (T23); checker (T9, solo cabecera) |
| `spec.md` — columnas | `\| ID \| Tipo \| Dado \| Cuando \| Entonces \|` → `\| ID \| Type \| Given \| When \| Then \|` | sdd-spec (T15); sdd-clarify/plan (T16); sdd-tests (T18); sdd-change (T22); sdd-reviewer (T23); checker (T9, solo cabecera) |
| `spec.md` — metadata y EARS | `> Estado: borrador \| aprobado · DoD: normal \| crítico · Repo dueño: <repo> · Repos afectados: <…>` → `> Status: draft \| approved · DoD: normal \| critical · Owner repo: <repo> · Affected repos: <…>`; `- RF-1: CUANDO <evento>, EL SISTEMA <respuesta> (<resultado esperado>).` → `- RF-1: WHEN <event>, THE SYSTEM SHALL <response> (<expected result>).`; `- RF-2: SI <condición no deseada>, ENTONCES EL SISTEMA <respuesta>.` → `- RF-2: IF <unwanted condition>, THEN THE SYSTEM SHALL <response>.`; `- RF-3: MIENTRAS <estado>, EL SISTEMA <respuesta>.` → `- RF-3: WHILE <state>, THE SYSTEM SHALL <response>.`; `- RF-4: EL SISTEMA <comportamiento permanente>.` → `- RF-4: THE SYSTEM SHALL <permanent behavior>.` | sdd-spec (T15); sdd-clarify/plan (T16); sdd-tests (T18); sdd-change (T22); sdd-reviewer (T23); checker (T9, solo cabecera) |
| `spec.md` — marcadores | `[NECESITA ACLARACIÓN]` → `[NEEDS CLARIFICATION]` | sdd-spec (T15); sdd-clarify/plan (T16); sdd-tests (T18); sdd-change (T22); sdd-reviewer (T23); checker (T9, solo cabecera) |
| `spec.md` — tipos de fila | `borde` → `edge`; `falla` → `failure`; `seguridad` → `security` | sdd-spec (T15); sdd-clarify/plan (T16); sdd-tests (T18); sdd-change (T22); sdd-reviewer (T23); checker (T9, solo cabecera) |
| `scenarios.md` — encabezados | `# Escenarios de prueba` → `# Test scenarios`; `## Tipos` → `## Types`; `## Regla` → `## Rule`; `## Formato en el spec` → `## Spec format`; `## Checklist para encontrar bordes y fallas` → `## Checklist for edges and failures`; `## Chequeo automático` → `## Automated check` | sdd-spec (T15); sdd-clarify (T16); sdd-tests (T18); sdd-verify (T19); sdd-reviewer (T23) |
| `scenarios.md` — columnas | `\| Tipo \| Letra \| Qué prueba \| Ejemplo (aplicar cupón) \|` → `\| Type \| Letter \| What it tests \| Example (apply coupon) \|`; `\| ID \| Tipo \| Dado \| Cuando \| Entonces \|` → `\| ID \| Type \| Given \| When \| Then \|` | sdd-spec (T15); sdd-clarify (T16); sdd-tests (T18); sdd-verify (T19); sdd-reviewer (T23) |
| `scenarios.md` — tipos de fila | `borde` → `edge`; `falla` → `failure`; `seguridad` → `security` | sdd-spec (T15); sdd-clarify (T16); sdd-tests (T18); sdd-verify (T19); sdd-reviewer (T23) |
| `ears.md` — encabezados | `# EARS: cómo escribir requisitos` → `# EARS: writing requirements`; `## Reglas` → `## Rules`; `## Ejemplo` → `## Example` | sdd-spec (T15); sdd-clarify (T16); sdd-change (T22); sdd-reviewer (T23) |
| `ears.md` — columnas | `\| Patrón \| Forma \| Cuándo \|` → `\| Pattern \| Form \| When \|` | sdd-spec (T15); sdd-clarify (T16); sdd-change (T22); sdd-reviewer (T23) |
| `ears.md` — patrones EARS | `EL SISTEMA \<hará\>` → `THE SYSTEM SHALL \<action\>`; `CUANDO \<disparador\>, EL SISTEMA \<hará\>` → `WHEN \<trigger\>, THE SYSTEM SHALL \<action\>`; `MIENTRAS \<estado\>, EL SISTEMA \<hará\>` → `WHILE \<state\>, THE SYSTEM SHALL \<action\>`; `DONDE \<característica\>, EL SISTEMA \<hará\>` → `WHERE \<feature\>, THE SYSTEM SHALL \<action\>`; `SI \<condición\>, ENTONCES EL SISTEMA \<hará\>` → `IF \<condition\>, THEN THE SYSTEM SHALL \<action\>` | sdd-spec (T15); sdd-clarify (T16); sdd-change (T22); sdd-reviewer (T23) |
| `ears.md` — marcadores | `[NECESITA ACLARACIÓN: <pregunta concreta>]` → `[NEEDS CLARIFICATION: <specific question>]` | sdd-spec (T15); sdd-clarify (T16); sdd-change (T22); sdd-reviewer (T23) |
| `clarification.md` — encabezados | `## Clarificación — <id>, ronda <n> (<fecha>) · Veredicto: listo para plan \| no listo` → `## Clarification — <id>, round <n> (<date>) · Verdict: ready for plan \| not ready` | sdd-clarify/plan (T16); sdd-resume (T17); sdd-reviewer (T23) |
| `validation.md` — encabezados | `## Validación — <id>` → `## Validation — <id>` | sdd-verify (T19); sdd-reviewer (T23) |
| `validation.md` — columnas | `\| Escenario \| Tipo \| Test que lo cubre \| Resultado \|` → `\| Scenario \| Type \| Covering test \| Result \|` | sdd-verify (T19); sdd-reviewer (T23) |
| `validation.md` — campos y veredicto | `Revisión global` → `Global review`; `Contratos e integración` → `Contracts and integration`; `Prueba en vivo` → `Live test`; `Pendientes` → `Pending`; `Veredicto` → `Verdict` | sdd-verify (T19); sdd-reviewer (T23) |
| `validation.md` — resultado del checker | `check-scenarios: sin faltantes \| faltan <…>` → `check-scenarios: none missing \| missing <…>` | sdd-verify (T19); sdd-reviewer (T23) |
| `validation.md` — veredicto | `Veredicto: spec cumplido \| falta <…>` → `Verdict: spec fulfilled \| missing <…>` | sdd-verify (T19); sdd-reviewer (T23) |

## Tasks

Todas las tasks tienen un presupuesto de 20–30 minutos como máximo. Si una no cabe, dividirla conservando referencias y sin ampliar alcance. Los comandos los ejecuta el usuario; una verificación sin su salida sigue pendiente. Las referencias a RF incluyen sus escenarios en `spec.md`; D1–D9 remiten a `plan.md` § Decisiones. Las tareas de tests se escriben primero; el rojo solo aplica a conducta nueva, no se fuerzan fallos de regresiones existentes.

- [x] T1. Escribir fixtures y tests de identidad y descripciones. (RF-2, RF-16, RF-19) [tests de medición · rigorkit]
      Hecho cuando: `tools/test/measure-content.test.mjs` contiene un test por RF-2.H1/E1/F1 y RF-16.H1/E1/F1 con asserts sobre la CLI y fixtures aisladas; salida del usuario acredita el rojo por ausencia de implementación, no errores de tests.
      Depende de: ninguna.
      Leer: plan §§ Modelo de datos, Medición e identidad, Contratos y Estrategia de tests; spec escenarios RF-2/RF-16; `install.sh:162-164` como precedente de frontmatter.
      Conservar: D1–D3/D9; nombres, apóstrofos escapados, límites exactos y aislamiento de `tools/fixtures/`.
      Verificar: seis tests con ID inicial y `001-english-and-compact`; fixtures con restricciones restantes válidas, renombrado coherente detectable y 300/301 caracteres.

- [x] T2. Completar tests de reducción, reglas e informe. (RF-17, RF-18, RF-19) [tests de medición · rigorkit]
      Hecho cuando: el mismo archivo añade tests individuales RF-17.H1/E1/F1, RF-18.H1/E1/F1 y RF-19.H1/E1/F1; salida del usuario acredita los fallos nuevos esperados.
      Depende de: T1.
      Leer: plan §§ Medición e identidad, Modelo de datos y Estrategia de tests; escenarios RF-17–RF-19.
      Conservar: D2/D3; per-pack independiente, NFC/code points y redondeo agregado por entrada; no usar bytes ni porcentaje mostrado como oráculo.
      Verificar: nueve tests con 30%/29%, reglas 300/301 tokens, Unicode compuesto/descompuesto, informe por archivo/pack e identidades, baseline inexistente y salida 1.

- [x] T3. Escribir tests de cabeceras del checker. (RF-8, RF-25) [tests de integración · rigorkit]
      Hecho cuando: `tools/test/check-scenarios.test.mjs` prueba RF-8.H1/E1/F1 invocando el checker del pack, con resultados reales aportados por el usuario.
      Depende de: ninguna.
      Leer: escenarios RF-8; plan §§ Contratos y Estrategia de tests; `packs/sdd/skills/sdd-init/scripts/check-scenarios.mjs:64-95,133-157`.
      Conservar: requisitos/filas válidos en fixtures, CLI y códigos; test de cabecera española conserva su resultado vigente.
      Verificar: inglés detectado, español aceptado y cabecera ausente informada en inglés; el rojo nuevo no proviene de falta de tests en la fixture.

- [x] T4. Escribir tests de cobertura e integración del spec real. (RF-25) [tests de integración · rigorkit]
      Hecho cuando: hay tests RF-25.H1/E1/F1 y 21 títulos obligatorios en total; el usuario entrega resultados y se distinguen regresiones verdes de cambios aún rojos.
      Depende de: T1, T2, T3.
      Leer: escenarios RF-25; plan § Estrategia de tests; checker `:93-127` y nombres que descubre `:20-61`.
      Conservar: asociación entre escenario y cambio, exclusiones manual/n/a, fixtures sin falsos IDs que oculten cobertura faltante.
      Verificar: H1 usa el spec real y `--tests tools/test`; E1 excluye manual; F1 detecta un escenario sin test; cada test tiene assertion del resultado esperado.

- [x] T5. Implementar inventario y estimación en la CLI de medición. (RF-2, RF-16, RF-18, RF-19) [tools · rigorkit]
      Hecho cuando: `tools/measure-content.mjs` inventaría skills/agentes/reglas, mide carga/descripciones y genera el desglose definido por el plan; el usuario verifica los casos aplicables de T1/T2.
      Depende de: T1, T2, T3, T4.
      Leer: plan §§ Medición e identidad, Modelo de datos, Contratos; D1–D3; fixtures T1/T2.
      Conservar: módulos incorporados de Node, NOTICE/frontmatter excluidos de carga, auxiliares incluidos, ningún archivo instalado nuevo.
      Verificar: nombre de skill/carpeta y agente/archivo, apóstrofos YAML, NFC, reglas completas y errores claros; el chequeo permanece sin escrituras.

- [x] T6. Implementar comparación y fallos del medidor. (RF-2, RF-16, RF-17, RF-18, RF-19) [tools · rigorkit]
      Hecho cuando: la CLI acepta `--root`/`--baseline`, valida esquema, compara conjuntos y límites, informa todos los incumplimientos y devuelve 0/1; los 15 tests del medidor pasan según salida del usuario.
      Depende de: T5.
      Leer: plan §§ Medición e identidad y Contratos; D2/D3; tests T1/T2.
      Conservar: comparación entera por pack, precedencia de errores legibles, baseline inmutable, orden estable por ruta.
      Verificar: reducción exactamente 30%, fallo 29%, altas/bajas/renombrados y name/ruta; argumentos, baseline ausente/ilegible y esquema inválido no se aceptan silenciosamente.

- [x] T7. Preparar captura reproducible y obtener baseline de `edad002`. (RF-2, RF-17, RF-19, RF-20) [baseline · rigorkit]
      Hecho cuando: existe `baseline.txt` con esquema del plan, commit completo resuelto desde `edad002`, nombres, descripciones, cargas y reglas; la salida del comando ejecutado por el usuario acredita la fuente y el inventario.
      Depende de: T6.
      Leer: spec § Definitions, plan §§ Modelo de datos y Contratos; `git ls-tree`/`git show` del commit fuente.
      Conservar: operación de captura explícita separada del chequeo, sin cambiar checkout ni sobrescribir baseline existente; ninguna exigencia de reducción sobre el estado inicial.
      Verificar: comando de captura documentado con rutas temporales concretas, sin leer configuración personal; contraste de inventario con `edad002` antes de editar contenido empaquetado.

- [x] T8. Añadir normalización de tiers y precedencia de claves. (RF-3, RF-4) [instalador · rigorkit]
      Hecho cuando: `install.sh` acepta ambos idiomas de tier y resuelve claves inglesas primero por presencia, manteniendo adaptadores, destinos y escapes; comprobaciones focalizadas del usuario registradas.
      Depende de: T7.
      Leer: RF-3/RF-4 y escenarios; plan § Tiers y selección de modelo, Contratos, D6; `install.sh:162-206`.
      Conservar: tier vacío hereda, clave inglesa vacía prevalece, tier inválido falla, readonly y YAML/TOML; no tocar lógica fuera de RF-3.
      Verificar: ambos niveles con claves antiguas/inglesas/ambas y ausencia de configuración; Cursor sin Claude además de adaptadores restantes; dejar regresión completa a T33/T34.

- [x] T9. Actualizar el checker del pack. (RF-1, RF-8, RF-25) [checker · rigorkit]
      Hecho cuando: acepta las dos cabeceras y tiene comentarios/mensajes ingleses; los seis tests de checker y el checker contra el spec real pasan según salida del usuario.
      Depende de: T4, T7.
      Leer: escenarios RF-8/RF-25; plan §§ Alias derivados y Contratos; checker `:20-157`.
      Conservar: RF/HEFS, IDs, n/a, manual, detección de archivos, modo estricto y asociación con ID de cambio.
      Verificar: regresiones de cabecera española, manual/n/a, escenario faltante y comportamiento no estricto; no añadir otra copia del checker.

- [x] T10. Traducir plantillas de spec, escenarios, EARS, clarificación y validación. (RF-1, RF-6, RF-8, RF-17, RF-20) [plantillas · rigorkit]
      Hecho cuando: ambas copias de esos cinco archivos están traducidas y sus cadenas estructurales tienen pareja antes/después identificada con consumidores.
      Depende de: T7, T9.
      Leer: plan § Alias derivados y D4/D5; `packs/sdd/skills/sdd-init/templates/{spec,scenarios,ears,clarification,validation}.md` y `specs/templates/` equivalentes.
      Conservar: requisitos, escenarios, columnas, veredictos, IDs y formatos; no añadir archivos dentro de skills.
      Verificar: comparación con `edad002`, ambas copias consistentes y checker compatible; evidencia de alias para T14–T19.

- [ ] T11. Traducir plantillas de plan, tasks, baseline, proposal, half-wired y learning. (RF-1, RF-5, RF-6, RF-8, RF-17, RF-20) [plantillas · rigorkit]
      Hecho cuando: ambas copias de los seis archivos están en inglés con campos y reglas conservados; parejas de estructura y consumidores quedan identificados.
      Depende de: T7.
      Leer: archivos homónimos bajo `sdd-init/templates/` y `specs/templates/`; plan §§ Alias derivados y Riesgos y cross-layer.
      Conservar: `HW-NN` estable, campos de tasks y estado para retomar, contrato de metadata de learnings, aprobaciones y dependencias.
      Verificar: diff antes/después y comparación entre copias; referencias que leen archive/resume/tasks/adopt actualizadas en sus tasks, sin imponer plantilla nueva a otros repos.

- [ ] T12. Traducir plantillas de constitución e instrucciones SDD. (RF-1, RF-8, RF-9, RF-17, RF-20) [plantillas · rigorkit]
      Hecho cuando: las dos copias de `constitution.md` y `AGENTS.md` están en inglés y las constituciones incluyen `Language:`; contratos derivados disponibles para init/adopt.
      Depende de: T7.
      Leer: ambas carpetas de plantillas; RF-9/RF-10; plan §§ Idioma y estructura de artefactos y Alias derivados.
      Conservar: límites, gates, ausencia de ejecución de comandos y protección de instrucciones del usuario; no imponer `Language: en` a proyectos futuros.
      Verificar: presencia de campo de idioma y preservación de todos los principios/formato de rutas críticas.

- [ ] T13. Actualizar reglas propias del repo. (RF-1, RF-14, RF-15) [instrucciones · rigorkit]
      Hecho cuando: `AGENTS.md` y `specs/constitution.md` están en inglés, declaran descriptions de hasta 300 caracteres y rules de hasta 300 tokens; constitución incluye `Language: en`.
      Depende de: T7, T12.
      Leer: RF-14/RF-15 y escenarios; instrucciones actuales completas, constitución y plan § Constitución.
      Conservar: ocho principios, rutas críticas, prefijos, quotes YAML, excepciones de referencias, dependencia blanda y no sobrescritura.
      Verificar: reglas antiguas de idioma/límites sustituidas sin perder otras obligaciones; revisión del diff contra `edad002`.

- [ ] T14. Traducir/compactar init y adopt con declaración de idioma. (RF-1, RF-2, RF-5, RF-6, RF-7, RF-8, RF-10, RF-11, RF-12, RF-13, RF-16, RF-17, RF-20, RF-22, RF-23) [skills SDD · rigorkit]
      Hecho cuando: ambos SKILL.md conservan etapas y aprobaciones, preguntan idioma al crear constitución y usan plantillas/alias del proyecto; descripciones inglesas <=300.
      Depende de: T10, T11, T12, T13.
      Leer: `packs/sdd/skills/sdd-{init,adopt}/SKILL.md`; plan §§ Idioma y estructura de artefactos, Alias derivados; D4/D5/D7/D8.
      Conservar: no sobrescribir specs, preguntas de una en una, máximo 15 líneas, un módulo por vez y no arreglar durante adopción.
      Verificar: RF-10.H1/E1/F1, templates faltantes, fallback y trazabilidad del antes/después; casos en vivo en T35.

- [ ] T15. Traducir/compactar triage y spec. (RF-1, RF-2, RF-5, RF-6, RF-7, RF-8, RF-11, RF-12, RF-13, RF-16, RF-17, RF-20, RF-22, RF-23) [skills SDD · rigorkit]
      Hecho cuando: ambos SKILL.md mantienen clasificación, entrevista y gates; incorporan idioma/estructura pertinentes y descripciones <=300 con peticiones españolas citadas.
      Depende de: T10, T12, T13.
      Leer: `packs/sdd/skills/sdd-{triage,spec}/SKILL.md`; plan D4/D5/D7/D8; escenarios RF-6/RF-7/RF-11–RF-13/RF-22.
      Conservar: al menos cinco preguntas de una en una al especificar, EARS, tipos de escenarios, alcance y aprobación.
      Verificar: diff de invariantes y contratos; no inventar sección ausente; activación en español pendiente de T35.

- [ ] T16. Traducir/compactar clarify y plan. (RF-1, RF-2, RF-5, RF-6, RF-7, RF-8, RF-11, RF-12, RF-13, RF-16, RF-17, RF-20, RF-22, RF-23) [skills SDD · rigorkit]
      Hecho cuando: ambos SKILL.md producen/aceptan veredictos según estructura del proyecto, conservan rondas y precondiciones, y tienen descriptions <=300.
      Depende de: T10, T11, T13.
      Leer: `packs/sdd/skills/sdd-{clarify,plan}/SKILL.md`; plan §§ Alias derivados y Riesgos y cross-layer; escenarios RF-5/RF-8.
      Conservar: cero altos/medios para ready, ronda vigente, aprobación humana independiente, lectura de constitución y no escribir código en plan.
      Verificar: RF-5.E1/E2 y RF-8.E2; productor clarify/reviewer y consumidor plan cubiertos en ambos idiomas.

- [ ] T17. Traducir/compactar context y resume. (RF-1, RF-2, RF-5, RF-6, RF-7, RF-8, RF-11, RF-12, RF-13, RF-16, RF-17, RF-20, RF-22, RF-23) [skills SDD · rigorkit]
      Hecho cuando: ambos SKILL.md mantienen lecturas selectivas y reconstruyen estado cuando falta bloque de resume; alias locales y descripciones <=300.
      Depende de: T11, T13.
      Leer: `packs/sdd/skills/sdd-{context,resume}/SKILL.md`; plan D4/D5/D8; RF-7 y RF-22.E1.
      Conservar: contrastar git/archivos, no inferir aprobación ni tests de commits/casillas, búsqueda barata de conocimiento y salida con parada.
      Verificar: estado sin bloque, artefactos españoles y «¿dónde quedamos?»; misma secuencia de reconstrucción y gates.

- [ ] T18. Traducir/compactar tasks y tests. (RF-1, RF-2, RF-5, RF-6, RF-7, RF-8, RF-11, RF-12, RF-13, RF-16, RF-17, RF-20, RF-22, RF-23, RF-25) [skills SDD · rigorkit]
      Hecho cuando: ambos SKILL.md mantienen tareas verificables y tests por escenario, con alias locales y descripciones <=300.
      Depende de: T10, T11, T13.
      Leer: `packs/sdd/skills/sdd-{tasks,tests}/SKILL.md`; RF-6/RF-7/RF-25; plan §§ Idioma y estructura de artefactos y Estrategia de tests.
      Conservar: 20–30 minutos, tests primero, ID inicial, assertions explícitas, rojo por razón correcta, excepción visual y evidencia antes de marcar.
      Verificar: RF-6.H1 y RF-7.H1/E1; estructura según plantilla propia y bloque faltante omitido; referencias a checker válidas.

- [ ] T19. Traducir/compactar implement y verify. (RF-1, RF-2, RF-5, RF-6, RF-7, RF-8, RF-11, RF-12, RF-13, RF-16, RF-17, RF-20, RF-22, RF-23, RF-25) [skills SDD · rigorkit]
      Hecho cuando: ambos SKILL.md preservan verificación acumulada, revisiones y manejo de salida del usuario; descriptions <=300 y alias pertinentes.
      Depende de: T10, T11, T13.
      Leer: `packs/sdd/skills/sdd-{implement,verify}/SKILL.md`; plan D4/D5/D8 y § Riesgos y cross-layer.
      Conservar: alcance de task, solo altos introducidos, una nueva revisión, verificación global, DoD crítico y no acreditar comandos pendientes.
      Verificar: productores/consumidores de tasks/validation, dependencias blandas por nombre y casos de sección faltante; no crear nuevos auxiliares.

- [ ] T20. Traducir/compactar auxiliares de verify. (RF-1, RF-17, RF-20) [referencias SDD · rigorkit]
      Hecho cuando: `sdd-verify/{dod-critical,checklist-cross-layer}.md` están en inglés conservando todas las comprobaciones y excepciones.
      Depende de: T7, T19.
      Leer: esos dos archivos y su consumidor `sdd-verify/SKILL.md`; plan D8 y DoD crítico del spec.
      Conservar: evidencia real, regresión de rutas críticas y contratos entre capas; sin mover archivos para ocultar carga.
      Verificar: revisión antes/después y desglose del medidor para toda la carpeta, no solo SKILL.md.

- [ ] T21. Traducir/compactar archive y vault.md. (RF-1, RF-2, RF-5, RF-6, RF-7, RF-8, RF-11, RF-12, RF-13, RF-16, RF-17, RF-20, RF-22, RF-23) [skills SDD · rigorkit]
      Hecho cuando: ambos archivos están en inglés, conservan promociones con aprobación, IDs estables y lectura de estructura española/inglesa; description <=300.
      Depende de: T11, T13.
      Leer: `packs/sdd/skills/sdd-archive/{SKILL,vault}.md`; escenarios RF-5.H1/RF-7.F1; plan D4/D5/D8.
      Conservar: reglas del vault, repos dueño, no secrets, búsqueda de duplicados, no escribir sin visto bueno y no renumerar HW.
      Verificar: «Resueltas»/equivalente inglés; registro del vault leído en ambos idiomas; no crear learning si falta plantilla; no modificar el vault.

- [ ] T22. Traducir/compactar change, explain y legacy-review. (RF-1, RF-2, RF-5, RF-6, RF-7, RF-8, RF-11, RF-12, RF-13, RF-16, RF-17, RF-20, RF-22, RF-23, RF-24) [skills SDD · rigorkit]
      Hecho cuando: los tres SKILL.md conservan gates, salidas y alcance, con descriptions <=300; marcador `@legacy` mantiene keyword e idioma de estructura.
      Depende de: T10, T11, T13.
      Leer: `packs/sdd/skills/sdd-{change,explain,legacy-review}/SKILL.md`; escenarios RF-24; plan D4/D5/D8.
      Conservar: evidencia antes de marcar/borrar, distinción half-wired, criterios de explain, aprobación antes de escribir y análisis de efecto sobre RF previos.
      Verificar: RF-24.H1/E1/F1, referencias entre cambios/capabilities y todos los formatos de salida; dividir esta task si excede 30 minutos.

- [ ] T23. Traducir/compactar explorer y reviewer SDD. (RF-1, RF-2, RF-8, RF-16, RF-17, RF-20, RF-23) [agentes SDD · rigorkit]
      Hecho cuando: ambos agentes tienen contenido/descriptions ingleses <=300 y tiers cheap/strong; leen alias que consumen y responden según idioma del usuario.
      Depende de: T8, T10, T11, T13, T16.
      Leer: `packs/sdd/agents/sdd-{explorer,reviewer}.md`; RF-8.E3/RF-23.E1; plan §§ Alias derivados y Contratos.
      Conservar: readonly, roles, severidades, formatos y veredictos, revisión posterior de cierres; explorer no hace cambios.
      Verificar: spec español legible, veredicto compatible con plan/clarify y frontmatter válido para el instalador.

- [ ] T24. Traducir/compactar referencias de arquitectura. (RF-1, RF-2, RF-16, RF-17, RF-20) [pack architecture · rigorkit]
      Hecho cuando: `arch-boundaries` y `arch-plugin-registry` están en inglés, con descriptions <=300 y reglas conservadas.
      Depende de: T7, T13.
      Leer: los dos SKILL.md del pack; plan D8, constitución sobre referencias y dependencia blanda.
      Conservar: carácter de referencia, excepciones para código existente, límites/dirección de dependencias y contratos del registry.
      Verificar: revisión contra `edad002` y medición del pack, sin añadir rol/parada donde no corresponde ni nuevas dependencias.

- [ ] T25. Traducir/compactar reviewer de arquitectura. (RF-1, RF-2, RF-8, RF-16, RF-17, RF-20, RF-23) [agente architecture · rigorkit]
      Hecho cuando: agente en inglés con tier strong y description <=300; conserva dos modos y contrato de veredictos.
      Depende de: T8, T24.
      Leer: `packs/architecture/agents/arch-reviewer.md`; escenarios RF-23 y plan §§ Alias derivados y Contratos.
      Conservar: readonly, instrucciones del proyecto prevalecen, diff suministrado, distinción introducidos/preexistentes y auditoría.
      Verificar: RF-23.H1, veredicto según estructura y chat español; medidor acredita reducción del pack >=30% o deja ajuste explícito para T30.

- [ ] T26. Traducir/compactar referencia y reviewer frontend. (RF-1, RF-2, RF-8, RF-16, RF-17, RF-20, RF-23) [pack frontend · rigorkit]
      Hecho cuando: ambos archivos están en inglés con descriptions <=300 y tier strong del reviewer; preservan reglas y modos.
      Depende de: T7, T8, T13.
      Leer: `packs/frontend/skills/frontend-structure/SKILL.md` y `packs/frontend/agents/frontend-reviewer.md`; plan D8.
      Conservar: sufijos, barriles, server/client, composición de rutas, excepciones existentes y frontera con arch-reviewer.
      Verificar: invariantes antes/después, alias de salidas y reducción del pack >=30%; dividir si excede 30 minutos.

- [ ] T27. Traducir/compactar reglas core y documentación de sus scripts. (RF-1, RF-18, RF-20) [pack core · rigorkit]
      Hecho cuando: `packs/core/rules.md`, README y comentarios/mensajes españoles de scripts están en inglés; rules <=300 tokens.
      Depende de: T7, T13.
      Leer: `packs/core/{rules.md,README.md,scripts/*}`; RF-18 y plan D8.
      Conservar: negaciones, números/unidades, comandos/rutas, búsqueda barata, límites de subagentes y limpieza de contexto; contratos y lógica de scripts intactos.
      Verificar: medidor con desglose de rules, revisión de todas las reglas y diff limitado a contenido en scripts; no cambiar salida funcional por compactar.

- [ ] T28. Traducir READMEs y actualizar ambas atribuciones. (RF-1, RF-3, RF-4, RF-21) [documentación · rigorkit]
      Hecho cuando: README raíz y READMEs sdd/architecture/frontend están en inglés, ejemplos usan tiers ingleses explicando aliases, ambos NOTICE describen adaptación actual.
      Depende de: T8, T14, T23, T25, T26, T27.
      Leer: archivos indicados, RF-21 y plan § Contratos; `install.sh` como fuente de destinos/opciones.
      Conservar: autoría/licencias, URLs y rutas, opciones existentes y advertencias de instalación; no tocar website ni copiar terceros.
      Verificar: NOTICE idénticos, enlaces locales válidos y ejemplos concordantes con instalador sin afirmar compatibilidad nueva no verificada.

- [ ] T29. Traducir artefactos propios restantes y consolidar evidencia de alias. (RF-1, RF-5, RF-8, RF-14, RF-20) [specs propios · rigorkit]
      Hecho cuando: `plan.md`, `tasks.md` y `specs/half-wired.md` están en inglés; spec conserva significado, historial y aprobaciones; parejas estructurales/consumidores derivados quedan trazados en evidencia.
      Depende de: T10, T11, T12, T13, T14, T15, T16, T17, T18, T19, T20, T21, T22, T23.
      Leer: plan § Alias derivados y RF-1/RF-5; `specs/` rastreado, comparado con `edad002`; contratos resultantes de T10–T23.
      Conservar: IDs T/RF/D/HW, dependencias, marcas y fuentes de aprobación, historia de aclaraciones y datos de baseline; no crear aliases manuales ajenos a fuentes.
      Verificar: todas las cadenas estructurales leídas tienen parejas/consumidores cubiertos; no quedan instrucciones propias antiguas ni prosa española fuera de excepciones; dividir si supera 30 minutos.

- [ ] T30. Medir el conjunto y ajustar compacción focalizada. (RF-2, RF-16, RF-17, RF-18, RF-19, RF-20) [integración de contenido · rigorkit]
      Hecho cuando: salida del usuario acredita >=30% por cada pack objetivo, descriptions <=300, rules <=300 e identidades conservadas; cualquier ajuste conserva invariantes.
      Depende de: T6, T7, T14, T15, T16, T17, T18, T19, T20, T21, T22, T23, T24, T25, T26, T27, T28, T29.
      Leer: informe por archivo del medidor, plan D2/D3/D8 y escenarios RF-16–RF-19.
      Conservar: baseline `edad002` inmutable, cargas auxiliares incluidas y ausencia de traslados entre packs para aparentar ahorro.
      Verificar: comando de medición del plan y resultados por pack; si ajustes exceden 30 minutos, crear subtasks focalizadas y dejar esta pendiente.

- [ ] T31. Revisar independientemente invariantes e idioma de SDD. (RF-1, RF-20, RF-21) [review SDD · rigorkit]
      Hecho cuando: revisión `sdd-reviewer` del diff acumulado de SDD contra `edad002` aporta evidencia por skill/agente y no deja pérdida de invariantes sin resolver.
      Depende de: T30.
      Leer: spec § Invariants y RF-20, plan § Estrategia de tests; diff completo de SDD, archivos nuevos y ambas atribuciones.
      Conservar: revisión readonly, roles/paradas, orden, negaciones, números, formatos y cambios de conducta permitidos exclusivamente por el spec.
      Verificar: separar hallazgos introducidos/preexistentes y severidad; no inferir revisión de tests verdes; dividir por grupos de archivos si excede 30 minutos.

- [ ] T32. Revisar packs restantes y validar frontmatter estricto. (RF-1, RF-2, RF-15, RF-16, RF-20, RF-23) [review de contratos · rigorkit]
      Hecho cuando: revisión independiente de architecture/frontend/core e instrucciones preserva invariantes; usuario aporta parseo YAML estricto de todos los frontmatters.
      Depende de: T30.
      Leer: diffs de esos packs e instrucciones contra `edad002`, plan D9 y RF-20.
      Conservar: roles de referencia/revisores, readonly, scopes y formatos; sin dependencia nueva de producción.
      Verificar: parser YAML disponible elegido con el usuario, comillas simples/apóstrofos, name/ruta y longitud; si no hay parser o evidencia, pendiente explícito, no dar por válido solo con regex.

- [ ] T33. Preparar y verificar matriz de instalación/modelos en carpetas temporales. (RF-3, RF-4, RF-19) [regresión del instalador · rigorkit]
      Hecho cuando: usuario ejecuta comandos concretos de dry-run project/global y matriz real temporal; resultados comparan `edad002`/final, destinos y modelos en los cuatro adaptadores.
      Depende de: T8, T28, T30.
      Leer: RF-3.H1/E1/E2/F1, RF-4.H1/E1, RF-19.S1; plan § Estrategia de tests y `install.sh` adaptadores.
      Conservar: entorno temporal aislado, Cursor sin Claude, aliases de ambos niveles, sin escritura a configuración real ni cambio de checkout.
      Verificar: archivos relativos equivalentes, readonly/escaping, tier inválido falla, clave inglesa prevalece incluso vacía y `tools/` fuera de destinos; no marcar sin salidas.

- [ ] T34. Verificar protección de archivos y backups en instalación real temporal. (RF-4) [DoD crítico · rigorkit]
      Hecho cuando: usuario aporta evidencia RF-4.F1/S1 con instrucciones previas, bloques rigorkit, `.bak` y centinela externo preservados.
      Depende de: T33.
      Leer: RF-4.F1/S1, constitución § Rutas críticas, plan § Riesgos y cross-layer y funciones de merge_rules del instalador.
      Conservar: sin tocar archivos reales del usuario, sin ampliar cambios del instalador fuera de RF-3, mismo conjunto instalado.
      Verificar: comparar contenido antes/después fuera de marcadores, backup recuperable y centinela; fallo implica task pendiente y corrección acotada.

- [ ] T35. Verificar en vivo declaración e idioma de artefactos nuevos. (RF-9, RF-10, RF-11, RF-12) [verificación manual · rigorkit]
      Hecho cuando: usuario aporta resultados en Claude Code para los escenarios manuales de estos RF, usando versión final instalada y proyectos de prueba.
      Depende de: T14, T15, T16, T17, T18, T19, T21, T22, T23, T25, T26, T31, T32, T33.
      Leer: escenarios manuales correspondientes, plan §§ Idioma y estructura de artefactos y Estrategia de tests.
      Conservar: preguntas/aprobaciones propias de init/adopt; plantillas del proyecto, datos de prueba genéricos y evidencia por ID.
      Verificar: Language es/Spanish/inválido/ausente, valor vacío sin respuesta y cambio de idioma del usuario; no copiar configuración personal.

- [ ] T36. Verificar fallback de idioma en vivo. (RF-13) [verificación manual · rigorkit]
      Hecho cuando: evidencia del usuario acredita RF-13.H1/E1/F1 en proyectos temporales con y sin artefactos anteriores.
      Depende de: T31, T33.
      Leer: escenarios RF-13 y plan § Idioma y estructura de artefactos; skills productoras ya traducidas.
      Conservar: preguntar idioma solo una vez, silencio decide únicamente idioma y no aprobación; no alterar proyectos reales.
      Verificar: idioma de artefactos anteriores, pregunta si no hay referencias y fallback inglés comunicado sin respuesta; registrar petición y resultado por caso.

- [ ] T37. Verificar estructura y compatibilidad de artefactos en vivo. (RF-5, RF-6, RF-7, RF-8) [verificación manual · rigorkit]
      Hecho cuando: usuario aporta evidencia por escenario manual de estos RF para artefactos españoles, ingleses, mixtos y con plantillas/secciones faltantes.
      Depende de: T31, T33.
      Leer: escenarios RF-5–RF-8 y tabla de productores/consumidores derivada en T29; plan D4/D5.
      Conservar: estructura/prosa existentes, gates y plantilla propia; proyecto sin plantilla no se migra ni recibe secciones inventadas.
      Verificar: Resueltas, nuevas secciones con prosa conservada, Hecho cuando, bloque resume ausente, learning omitido, veredicto español y reviewer sobre spec español.

- [ ] T38. Verificar activación, chat y marcadores en vivo. (RF-22, RF-23, RF-24) [verificación manual · rigorkit]
      Hecho cuando: evidencia del usuario acredita escenarios manuales de RF-22/RF-23/RF-24 con versión instalada y resultado observable por ID.
      Depende de: T31, T32, T33.
      Leer: escenarios RF-22–RF-24; descriptions finales y contratos de veredictos/marcadores.
      Conservar: peticiones españolas citadas, idioma del chat, estructura del veredicto y keyword @legacy; no marcar código real sin evidencia.
      Verificar: activación spec/resume/ambigua, aviso de arquitectura en español, veredicto según estructura y marcadores español/inglés/sin keyword.

- [ ] T39. Integrar resultados en validation y cerrar verificación acumulada. (RF-1, RF-2, RF-3, RF-4, RF-5, RF-6, RF-7, RF-8, RF-9, RF-10, RF-11, RF-12, RF-13, RF-14, RF-15, RF-16, RF-17, RF-18, RF-19, RF-20, RF-21, RF-22, RF-23, RF-24, RF-25) [sdd-verify · rigorkit]
      Hecho cuando: `validation.md` cubre todos los RF y escenarios con evidencia válida, razones n/a y pendientes explícitos; solo con todo acreditado puede declarar spec cumplido.
      Depende de: T9, T13, T28, T29, T30, T31, T32, T33, T34, T35, T36, T37, T38.
      Leer: spec y plan completos, tasks, diff acumulado contra `edad002` incluyendo locales/nuevos; plantilla validation del proyecto y evidencia T1–T38.
      Conservar: DoD crítico, comprobaciones entre componentes y revisión independiente; no sustituir pruebas en vivo por búsquedas de texto ni ejecutar comandos por el usuario.
      Verificar: suite de 21 tests, checker sin cobertura faltante, medidor sin errores y evidencia manual individual; reutilizar resultados vigentes y repetir solo si cambios posteriores los invalidan.

Las referencias orientan la lectura; comprobar dependencias reales antes de editar.
Marcar `[x]` solo con evidencia suficiente de verificación y revisión. La división en tasks no autoriza commits, push, merge, archivo del cambio ni actualización del vault.
