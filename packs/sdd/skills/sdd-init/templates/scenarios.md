# Escenarios de prueba

El plan de pruebas vive en el spec: cada RF tiene sus **escenarios**, con un ID propio y en formato dado / cuando / entonces. Los escribe `sdd-spec`, los audita `sdd-clarify`, los aprueba el usuario y `sdd-tests` escribe un test por escenario.

## Tipos
| Tipo | Letra | Qué prueba | Ejemplo (aplicar cupón) |
|---|---|---|---|
| Happy path | `H` | El uso normal, todo bien | Cupón válido → descuenta 10 % |
| Borde | `E` | Valores en el límite o raros, pero válidos | Total justo en el mínimo; cupón que vence hoy |
| Falla | `F` | Input inválido o algo que sale mal, y cómo responde el sistema | Cupón inexistente → error, pedido intacto |
| Seguridad | `S` | Quién puede hacerlo y datos de otro tenant o usuario | Cupón de otro tenant → rechazado |

## Regla
- **Cada RF tiene los 4 tipos**, sea el cambio normal o crítico. Un RF nunca se prueba solo con el camino feliz.
- Un tipo solo se omite con una fila `n/a — <motivo>`. Así se distingue "no aplica" de "se olvidó". El motivo tiene que sostenerse: lo revisa `sdd-clarify`.
- **Crítico**: `S` no puede ser `n/a` si el RF toca tenants o permisos. El nivel no cambia qué se prueba, sino cuánta evidencia extra se pide (ver el Definition of Done reforzado en `sdd-verify`).

## IDs
- Escenario: `RF-<n>.<tipo><k>`, por ejemplo `RF-3.H1`, `RF-3.E2`.
- No aplica: `RF-<n>.<tipo>` sin número, con `n/a — <motivo>` en la fila.
- El título de cada test empieza por el ID del escenario: `RF-3.F2: no duplica el descuento si se aplica dos veces`.
- Los RF se numeran por cambio, así que el archivo de test también menciona el `<id>` del cambio, normalmente en el `describe` (`describe('007-cupones', …)`). Sin eso, un `RF-1.H1` de otro cambio contaría por error.
- Un escenario que se verifica a mano (UI puramente visual) lleva `[manual]` en la fila; no necesita test, pero sí aparece en la verificación en vivo.

## Formato en el spec
```md
### RF-3
| ID | Tipo | Dado | Cuando | Entonces |
|---|---|---|---|---|
| RF-3.H1 | happy | un pedido de 120 y un cupón válido del 10 % | se aplica el cupón | el total es 108 |
| RF-3.E1 | borde | un pedido justo en el mínimo del cupón | se aplica el cupón | el descuento se aplica |
| RF-3.F1 | falla | un código de cupón que no existe | se aplica el cupón | se rechaza y el pedido no cambia |
| RF-3.F2 | falla | un cupón ya aplicado al pedido | se aplica otra vez | no se duplica el descuento |
| RF-3.S | seguridad | n/a — el cupón no depende del usuario ni del tenant | | |
```

## Checklist para encontrar bordes y fallas
- Límites: 0, mínimo, máximo, justo por debajo y por encima.
- Vacío: `null`, texto vacío, lista vacía, campo ausente.
- Duplicados e idempotencia: repetir la misma acción, doble click, reintento.
- Concurrencia: dos usuarios o dos peticiones a la vez sobre lo mismo.
- Permisos y tenants: usuario sin permiso, recurso de otro tenant, sesión vencida.
- Input inválido: formato, tipo, longitud, caracteres especiales.
- Dependencias externas: timeout, error o respuesta inesperada de un servicio o la base de datos.
- Fechas y horas: zona horaria, cambio de día, vencimientos, años bisiestos.
- Estado: la acción sobre algo ya cancelado, borrado, cerrado o a medio crear.

## Chequeo automático
`specs/scripts/check-scenarios.mjs` comprueba que cada RF tiene los 4 tipos (o `n/a` con motivo) y que cada escenario (salvo `[manual]`) tiene un test con su ID, en un archivo que menciona el `<id>` del cambio. Comprueba que el test **existe**, no que pruebe lo correcto: eso lo cubren la revisión de los títulos y el lint de tests.

```bash
node specs/scripts/check-scenarios.mjs specs/changes/<id>/spec.md
```

Sin argumentos revisa todos los cambios de `specs/changes/`; un cambio que todavía no tiene ningún test (spec en curso) se avisa sin fallar, salvo con `--strict`. Así sirve como paso del hook `pre-push` o de CI. `--tests <dir>` acota dónde buscar los tests.
