# Plan técnico — <id>

## Contexto actual
<Lo que existe hoy y se toca, con archivo:línea (sale de la etapa de contexto).>

## Estructura por capa / módulo
| Capa / módulo | Cambio | RF que cubre |
|---|---|---|
| `<ruta>` | <qué cambia> | RF-1, RF-2 |

## Modelo de datos
<Entidades, campos y migración con un ejemplo, o "sin cambios". Si es grande, va en data-model.md.>

## Algoritmos
<Pseudocódigo de cualquier lógica que no sea trivial, o "no aplica".>

## Contratos
<Endpoints, eventos, payloads, o "sin cambios". Si es grande, va en contracts/.>

## Decisiones
- <Decisión> — en vez de <alternativa descartada>, porque <razón / principio de la constitución>.

## Constitución
<Principios que aplican. Violaciones con su justificación, o "ninguna".>

## Estrategia de tests
<Qué se testea, a qué nivel y cómo (ej. inyectar la fecha en vez de mockear el reloj).>

## Riesgos y cross-layer
<Productores y consumidores del dato, seeds, rutas críticas tocadas.>
