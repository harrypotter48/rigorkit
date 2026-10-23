# Plan técnico — 001-english-and-compact

## Contexto actual

- Spec aprobado por el usuario el 2026-10-23 mediante «adelante», después de la ronda 8 (`spec.md:399`). Plan aprobado por el usuario el 2026-10-23 mediante «continua». Las aprobaciones de spec y plan no acreditan implementación ni tests.
- Se usa la estructura y el idioma de las instrucciones actuales y de `specs/templates/plan.md:1`. Durante la implementación, este plan se traducirá junto al resto de `specs/` (RF-1), conservando el significado y las aprobaciones.
- `AGENTS.md:15` prescribe Agent Skills, nombres estables y YAML entre comillas simples; todavía permite descripciones de 1024 caracteres y exige español. `specs/constitution.md:5` exige autocontención, dependencia blanda, roles y parada; sus rutas críticas son el instalador y las reglas globales.
- `install.sh:162` extrae frontmatter de una línea y desescapa apóstrofos. `install.sh:166` busca una clave exacta de modelo; `install.sh:180` solo acepta tiers vacíos, `barato` o `fuerte`. Los cuatro adaptadores consumen el mismo `model_for` (`install.sh:182-206`).
- `install.sh:213-233` solo recorre `packs/`: copia carpetas completas de skills, convierte agentes y gestiona reglas/scripts globales. Añadir archivos dentro de una skill modifica los archivos instalados; `tools/` queda fuera.
- `packs/sdd/skills/sdd-init/SKILL.md:25` copia sus plantillas y checker al proyecto. Las copias de `specs/templates/` son independientes: hay que traducir ambos juegos, sin actualizar otros repos.
- `packs/sdd/skills/sdd-init/scripts/check-scenarios.mjs:64-95` reconoce requisitos `RF-n`, una cabecera española y IDs de escenarios. Sus líneas 121-127 excluyen escenarios manuales/no aplicables y exigen referencias de tests en modo estricto. No se cambiará esa semántica.
- Hay contratos textuales entre etapas: `sdd-tasks/SKILL.md:14-27` prescribe campos y estado para retomar; `sdd-clarify/SKILL.md:30-33` produce veredictos; `sdd-plan/SKILL.md:11` los consume; `sdd-archive/SKILL.md:14` consume «Resueltas»; `sdd-legacy-review/SKILL.md:14` prescribe `@legacy`; `sdd-reviewer.md:38` prescribe veredictos.
- `packs/core/rules.md:5-23` reúne reglas que deben mantenerse al compactar. `packs/sdd/NOTICE.md:3-11` atribuye material adaptado; existe una segunda copia en `sdd-init/NOTICE.md`.
- `git diff edad002 HEAD --stat` solo muestra el spec: `edad002` es una base pertinente para los contenidos existentes. No existe aún `baseline.txt`, contexto guardado ni suite en `tools/`. `specs/half-wired.md:9-15` no tiene entradas; no se encontraron baselines, capabilities ni learnings de módulos que condicionen este cambio.
- Referencias consultadas en el vault: «Definiciones operativas en vez de listas a mano» (derivar inventarios de fuentes), «Economía de tokens con agentes» (medir antes/después, nota en borrador) y «Toolkit de agentes multi-herramienta» (autocontención y dependencia blanda, nota en borrador). El código y la constitución del repo prevalecen.

## Estructura por capa / módulo

| Capa / módulo | Cambio | RF que cubre |
|---|---|---|
| `install.sh`, ejemplos de configuración del README | Normalizar tiers; buscar clave inglesa antes del alias; mantener destinos y operaciones | RF-3, RF-4 |
| `packs/sdd/skills/*/SKILL.md` y agentes SDD | Traducir/compactar; aplicar precedencia de estructura/prosa, alias locales y respuestas en idioma del usuario | RF-1, RF-2, RF-5, RF-6, RF-7, RF-8, RF-11, RF-12, RF-13, RF-16, RF-17, RF-20, RF-22, RF-23 |
| `sdd-init`, `sdd-adopt` y ambas copias de la plantilla de constitución | Preguntar idioma al crear constitución y registrar `Language:`; vacío si no se responde | RF-9, RF-10 |
| `sdd-legacy-review` | Conservar `@legacy`; adaptar el resto del marcador al idioma de estructura | RF-8, RF-24 |
| `packs/sdd/skills/sdd-init/templates/`, `specs/templates/`, resto de `specs/` | Traducir las dos copias y los artefactos propios; conservar IDs, decisiones y evidencias históricas | RF-1, RF-5, RF-6, RF-8, RF-14 |
| Checker del pack | Aceptar las dos cabeceras y traducir mensajes/comentarios sin cambiar cobertura ni CLI | RF-1, RF-8, RF-25 |
| `packs/architecture/`, `packs/frontend/` | Traducir/compactar referencias y revisores; conservar excepciones, modos y salidas | RF-1, RF-2, RF-8, RF-16, RF-17, RF-20, RF-23 |
| `packs/core/`, READMEs, `AGENTS.md`, `specs/constitution.md` | Inglés, límites exactos y reglas compactas; conservar contratos de scripts y advertencias | RF-1, RF-14, RF-15, RF-18, RF-20 |
| Ambas copias de `NOTICE.md` | Actualizar descripción de las adaptaciones y traducción; conservar autoría y licencia | RF-21 |
| `tools/measure-content.mjs`, `baseline.txt` del cambio | Inventario, medición y comparación reproducible fuera de lo instalado | RF-2, RF-16, RF-17, RF-18, RF-19 |
| `tools/test/*.test.mjs`, `tools/fixtures/` | Un test por escenario automatizable; integración con las CLI reales | RF-2, RF-8, RF-16, RF-17, RF-18, RF-19, RF-25 |

Orden de implementación para futuras tasks: tests y fixtures primero; herramienta de medición y captura de baseline antes de editar contenidos; instalador y checker; traducción de plantillas/contratos y sus consumidores; compacción por pack; documentación y reglas propias; verificación acumulada. Dividir después en tasks de 20–30 minutos. No crear tasks ni código durante esta etapa.

## Modelo de datos

Sin base de datos ni migraciones. `specs/changes/001-english-and-compact/baseline.txt` será JSON UTF-8 versionado, aunque conserve la extensión exigida por el spec. Se generará desde el árbol de `edad002`, no desde contenidos ya traducidos. La captura leerá ese commit sin cambiar de checkout; el usuario ejecutará el comando que se prepare en implementación.

Ejemplo de esquema, con valores ilustrativos y no mediciones reales:

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

Cada entrada corresponde a una skill o agente; guarda identidad, ruta, pack, longitud de descripción y estimación de carga. Las cifras de pack se derivan de esas entradas, no se mantienen por separado. El informe actual añade el desglose de los archivos que contribuyen a cada entrada, incluso cuando un archivo auxiliar no tiene frontmatter.

El registro de aprobación del spec se conserva en el propio spec y en este plan; la futura sección de estado de `tasks.md` lo referenciará. No inventar evidencia de tests ni convertir «ready for plan» en aprobación del usuario.

## Algoritmos

### Medición e identidad

```text
estimar(texto) = ceil(numero_de_code_points(NFC(texto)) / 4)
inventariar(root):
  recorrer packs/*/skills/*/SKILL.md y packs/*/agents/*.md
  extraer frontmatter de una línea, quitar comillas simples y desescapar ''
  skill: name debe coincidir con su carpeta; agente: con el nombre de archivo sin .md
  contar description por code points NFC, sin las comillas YAML
  cuerpo = todo lo posterior al delimitador de cierre del frontmatter, sin trim
  skill: carga = cuerpo + contenido de todos sus demás .md recursivos, salvo NOTICE.md
  agente: carga = cuerpo
  informar estimación por archivo; estimar la concatenación de carga sin separadores añadidos
  sumar estimaciones de skills y agentes por pack; medir cada packs/*/rules.md completo
comparar(actual, baseline):
  validar versión/esquema y presencia de baseline; error claro si falta o es ilegible
  comparar conjuntos de (kind, pack, path, name): detectar altas, bajas y renombrados
  comprobar coincidencia name/carpeta o name/archivo y description <= 300
  exigir 10 * actualPack <= 7 * baselinePack para sdd, architecture y frontend
  exigir rules <= 300; core no participa en la reducción de cuerpos
  presentar todos los incumplimientos y devolver 1 si existe alguno; si no, 0
```

La carga de una skill incluye sus auxiliares aunque solo se lean en alguna rama: es la definición del spec, no una predicción de uso. El desglose por archivo puede diferir de la suma del pack por el redondeo; el informe distinguirá estimación por archivo y carga agregada por entrada. No contar frontmatter ni NOTICE en RF-17; sí medir descripciones por separado. No seguir symlinks fuera del root de fixtures.

### Tiers y selección de modelo

```text
normalizar tier: vacío -> vacío; barato/cheap -> cheap; fuerte/strong -> strong
cualquier otro valor -> error actual con vocabulario actualizado
para tool y tier normalizado:
  si no hay tier o archivo de modelos, heredar sesión
  buscar primero la clave tool.cheap o tool.strong
  si la clave existe, usar su valor, incluso vacío (heredar); no usar el alias
  si no existe, buscar tool.barato o tool.fuerte
  conservar trim, comentarios y selección de primera coincidencia del parser actual
```

Aplicarlo una vez antes de los cuatro adaptadores. No cambiar destinos, escape YAML/TOML, permisos readonly ni orden de instalación.

### Idioma y estructura de artefactos

```text
al escribir: comprobar plantilla/ sección en specs/templates/
si falta: comunicar el hueco y omitir ese artefacto/sección; continuar lo permitido
si artefacto existe: mantener su estructura y el idioma de su prosa, también al añadir
si es nuevo: estructura de plantilla; prosa según Language válido de constitución
  o último mensaje reconocible del usuario
  o idioma de artefactos existentes del cambio
  o preguntar una vez; sin respuesta usar inglés y comunicarlo
en chat: idioma del usuario; veredictos según contrato de estructura
al leer estructura: aceptar la forma española y la inglesa del contrato pertinente
```

No crear una utilidad compartida que una skill deba leer desde otra carpeta. Compactar esta regla dentro de cada skill/agente que produzca o consuma artefactos. No inferir una autorización de la ausencia de respuesta: el fallback solo decide idioma.

### Alias derivados

Para cada plantilla/agente en `edad002`, comparar sus cadenas estructurales con las de su traducción final: encabezados, claves/valores, columnas, veredictos, marcadores y palabras EARS. Buscar sus apariciones en productores y consumidores antes de sustituirlas. Anotar las parejas y consumidores en la evidencia de revisión de las tasks y trasladar solo las parejas leídas por cada skill/agente a su texto inline. No escribir una lista global manual como fuente de verdad ni instalar un nuevo archivo auxiliar. El checker solo necesita las dos formas de la cabecera de escenarios; conserva RF/HEFS, `n/a` y `[manual]`.

## Contratos

- Sin endpoints, eventos ni nuevos formatos por herramienta. Skills/agentes conservan nombres y rutas; el instalador continúa consumiendo el mismo frontmatter y convirtiéndolo.
- CLI nueva: `node tools/measure-content.mjs --root <repo> --baseline <baseline.txt>`. Rutas relativas a cwd; errores de argumentos, baseline o lectura por stderr y salida 1; informe estable ordenado por ruta, sin escrituras durante la medición. Incluye estimación por archivo/pack, longitudes, diferencias de identidad, reducción y fallos.
- La generación inicial de baseline será una operación explícita distinta del chequeo: nunca sobrescribir la baseline como efecto lateral de medir. Su comando se concretará junto con la implementación; la captura debe admitir el árbol exportado de `edad002` y no exigir sus límites nuevos.
- CLI existente del checker: mismos argumentos posicionales, `--tests`, `--strict`, códigos 0/1 y búsqueda de tests (`check-scenarios.mjs:25-61,133-157`). Cambian idioma de mensajes y aceptación de cabecera, no la asociación test/cambio/escenario.
- Configuración existente: `RIGORKIT_MODELS` y `tool.tier=model`, con aliases antiguos compatibles. Las claves inglesas prevalecen con cualquiera de las dos formas del tier del agente.
- Estructura propia de nuevos proyectos: plantillas inglesas con `Language:`. Proyectos existentes: conservar sus plantillas, prose y scripts; no declararles idioma ni migrarlos. El modo de actualización y el website siguen diferidos.

## Decisiones

- D1. CLI de medición en `tools/`, Node con módulos incorporados — en vez de otro script del pack `core`, porque `install.sh:216-232` instala contenidos de los packs y RF-4 conserva los archivos instalados.
- D2. JSON en `baseline.txt`, versionado y ligado a `edad002` — en vez de texto tabular ambiguo o baseline del working tree, para comparar identidades y cifras sin contaminar el antes/después.
- D3. Estimar carga agregada por entrada y sumar por pack, con fórmula entera para el 30% — en vez de sumar porcentajes o redondear un porcentaje mostrado, para que el umbral exacto sea reproducible.
- D4. Repetir reglas cortas y solo alias locales en cada consumidor — en vez de una referencia compartida entre skills, por autocontención y para conservar los archivos instalados.
- D5. Tratar estructura, prosa y chat por separado — en vez de traducir todo al idioma de la constitución, para conservar los artefactos antiguos y los gates entre etapas.
- D6. Normalizar tier en el instalador y resolver la clave inglesa por presencia — en vez de migrar archivos personales o usar el alias al encontrar un valor inglés vacío, para respetar precedencia y herencia de sesión.
- D7. Mantener ejemplos de peticiones españolas entre comillas dentro de descripciones inglesas de hasta 300 caracteres — en vez de eliminar todo español o crear skills duplicadas, por RF-1/RF-2/RF-22.
- D8. Compactar quitando redundancia y manteniendo orden, reglas y formatos — en vez de eliminar escenarios/excepciones para alcanzar el porcentaje. Si una regla falta, se corrige el contenido; no se rebaja la baseline ni se oculta carga en otro pack.
- D9. Reutilizar el checker existente y probar sus CLI con fixtures — en vez de crear otro parser para acreditar cobertura. Los límites de YAML se validarán también con un parser YAML estricto disponible en el entorno del usuario; no se añadirá una dependencia de producción por ello.

## Constitución

Aplican los ocho principios: formato neutral, autocontención, dependencia blanda, rol/parada, YAML válido, ausencia de secretos, atribución, respeto de archivos del usuario y economía de contexto. El límite de descripción pasa de 1024 a 300 y las reglas de aproximadamente 300 a como máximo 300; mantener comillas simples y prefijos.

Violaciones nuevas: ninguna prevista. La desviación de idioma del spec ya está declarada (`spec.md:5-7`); RF-14/RF-15 actualizarán instrucciones y constitución en la implementación. Este plan no cambia anticipadamente las reglas ni inicia implementación. Rutas críticas: instalador y `rules.md`, ambas con DoD reforzado.

## Estrategia de tests

Usar `node:test`, `node:assert/strict` y ejecución de la CLI real con `spawnSync`, sin dependencias ni shell interpolado. Fixtures aisladas en `tools/fixtures/`; copiar a carpeta temporal solo cuando haga falta mutarlas. No leer ni escribir configuración real del usuario. Cada título empieza por el ID y el archivo incluye `001-english-and-compact`.

| Tests futuros | IDs que deben tener un test individual | Qué acreditan |
|---|---|---|
| `tools/test/measure-content.test.mjs` | RF-2.H1, RF-2.E1, RF-2.F1 | Identidad conservada, name/ruta y renombrado consistente detectable |
| Mismo archivo | RF-16.H1, RF-16.E1, RF-16.F1 | Descripciones válidas y bordes 300/301 |
| Mismo archivo | RF-17.H1, RF-17.E1, RF-17.F1 | Tres packs por separado; pasa exactamente 30%, falla 29% |
| Mismo archivo | RF-18.H1, RF-18.E1, RF-18.F1 | Reglas y bordes exactos 300/301 tokens |
| Mismo archivo | RF-19.H1, RF-19.E1, RF-19.F1 | Informe, code points/NFC frente a bytes, baseline ausente |
| `tools/test/check-scenarios.test.mjs` | RF-8.H1, RF-8.E1, RF-8.F1 | Cabeceras inglesa/española y mensaje inglés si falta |
| Mismo archivo | RF-25.H1, RF-25.E1, RF-25.F1 | Cobertura real del spec, manual excluido, escenario sin test detectado |

Son 21 tests obligatorios; el test de RF-25.H1 invoca el checker contra el spec real y `tools/test/`. Las fixtures de cabeceras deben tener requisitos y filas válidos para que el resultado no se deba a otro error. Los tests de medición aislarán el umbral investigado manteniendo válidas las demás restricciones. Comprobar explícitamente salida, código y valores esperados; IDs presentes sin assertions útiles no acreditan cumplimiento.

Los 50 escenarios manuales del spec se conservarán como checklist con evidencia individual en `validation.md`, no como tests automatizados ficticios. Las 33 filas no aplicables conservan sus razones. Los recuentos son los registrados en la ronda 6; el usuario confirmará los vigentes al ejecutar el checker.

- Instalador (RF-3/RF-4): comparar `edad002` y final en instalaciones temporales con los mismos argumentos, los cuatro destinos y cada adaptador por separado, incluido Cursor sin Claude. Cubrir ambos tiers, claves antiguas/inglesas/ambas, tier inválido y herencia; verificar archivos relativos, permisos readonly, marcadores, `.bak` y archivo centinela fuera de objetivos. Usar home temporal aislado con la herramienta de ejecución elegida por el usuario, sin tocar su configuración real.
- Contenido/contratos (RF-1/RF-5–RF-15/RF-20–RF-24): revisar diff acumulado contra `edad002`, tabla de alias derivada y cada productor/consumidor. Verificar ambas copias de plantillas y NOTICE; parsear frontmatter con YAML estricto. Revisar idioma sin confundir aliases o ejemplos españoles con prosa pendiente.
- Verificación en vivo en Claude Code por el usuario: RF-11/RF-12/RF-22 y casos manuales de estructura/prosa mixta, plantilla ausente, fallback y chat/veredictos. Guardar petición, versión instalada y resultado observable; un test de strings no acredita activación ni conducta del agente.
- Revisión independiente mediante `sdd-reviewer`: cada skill/agente antes/después con reglas, negaciones, números, orden, roles y paradas. No marcar cumplido RF-20 solo por alcanzar el porcentaje.

Comandos para el usuario, una vez implementadas las rutas; no se ejecutan durante el plan:

```bash
node --test tools/test/*.test.mjs
node packs/sdd/skills/sdd-init/scripts/check-scenarios.mjs specs/changes/001-english-and-compact/spec.md --tests tools/test
node tools/measure-content.mjs --root . --baseline specs/changes/001-english-and-compact/baseline.txt
./install.sh --pack all --agent claude,codex,cursor,opencode --project <tmp-project> --dry-run
./install.sh --pack all --agent claude,codex,cursor,opencode --global --dry-run
```

Esperado: tests verdes, cero escenarios sin test, cero errores del medidor y destinos equivalentes en dry-run. Los comandos exactos de instalación real y comparación se prepararán con rutas temporales concretas al llegar a esa task; estos dry-runs no sustituyen la regresión real ni las pruebas de modelos. Solo el usuario corre tests, instalación y verificaciones ejecutables.

## Riesgos y cross-layer

| Riesgo / productor → consumidor | Verificación y referencia para tasks |
|---|---|
| Plantillas copiadas por `sdd-init:25` → skills que escriben y leen artefactos | Derivar alias del antes/después; probar artefactos españoles, ingleses y mixtos, además del caso de sección ausente. No actualizar otros repos. |
| Veredicto del reviewer/clarify → gate de `sdd-plan:11` | Revisar productores y consumidores juntos; aceptar ambos idiomas sin deducir aprobación del usuario del veredicto técnico. |
| Templates de escenarios → checker `:64-95` → cobertura `:121-127` | RF-8 y RF-25 a nivel CLI; conservar RF/HEFS, exclusiones, búsqueda por ID de cambio y modos estricto/no estricto. |
| Agente tier → `install_agent:178-180` → `model_for:166` → cuatro adaptadores | Matriz manual de ambos niveles, aliases y precedencia, con archivo de modelos temporal. Comparar readonly y escaping antes/después. |
| Añadir auxiliares a una skill → copia completa en `install.sh:218` | Evitar archivos instalables nuevos; comparación de listas relativas de instalación y dry-runs. `tools/` no debe aparecer. |
| Compacción → pérdida de reglas o traslado artificial de carga | Medición por entrada/pack y revisión independiente de todos los invariantes contra `edad002`; NOTICE excluido de carga sigue sujeto a RF-21. |
| Duplicados de plantillas/NOTICE → proyecto inicializado inconsistente | Comparar ambos juegos de plantillas y ambos NOTICE tras traducir; conservar las personalizaciones propias si existen y documentar diferencias intencionadas. |
| Uso de nuevo checker para el spec inglés → checker viejo solo español | La suite invoca la copia del pack. No añadir un segundo checker al repo ni modificar copias instaladas en proyectos existentes. |
| Baseline regenerada desde contenido modificado → reducción ficticia | Fuente inmutable `edad002`, esquema validado y captura separada; revisar baseline antes de traducir. No usar el chequeo actual para exigir 30% al estado inicial. |
| Instrucciones propias siguen en español mientras se prepara el plan | Aplicar reglas vigentes; traducir `AGENTS.md`, constitución y artefactos propios dentro de RF-1/RF-14/RF-15, sin reabrir requisitos aprobados. |

No hay entidades, seeds, tenants ni contratos de negocio. El límite relevante es contenido empaquetado → instalación → artefactos del proyecto → lectores/gates. No se toca el website, el vault, repos externos ni el modo de actualización diferido de `sdd-init`.

Plan, tasks e implementación T5/T6 aprobados por el usuario; T5/T6 escritas y pendientes de verificación verde. Siguiente gate: revisar la salida del medidor antes de T7; evidencia y cobertura pendiente de T9 en `tasks.md`. Al cambiar de etapa se sugiere limpiar el contexto; las referencias y aprobaciones necesarias quedan aquí y luego en `tasks.md`.
