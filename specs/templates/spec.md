# Spec <NNN> — <Nombre>

> Estado: borrador | aprobado · DoD: normal | crítico · Repo dueño: <repo> · Repos afectados: <…>

## Contexto y objetivo
<Qué problema resuelve y por qué merece la pena. Un párrafo. Sin stack ni archivos.>

## Usuarios / actores
<Quién lo usa.>

## Historias de usuario
- H1: Como <rol> quiero <acción> para <beneficio>.

## Requisitos funcionales (EARS)
### <Grupo> (H1)
- RF-1: CUANDO <evento>, EL SISTEMA <respuesta> (<resultado esperado>).
- RF-2: SI <condición no deseada>, ENTONCES EL SISTEMA <respuesta>.
- RF-3: MIENTRAS <estado>, EL SISTEMA <respuesta>.
- RF-4: EL SISTEMA <comportamiento permanente>.

## Requisitos no funcionales
<Solo los que apliquen, con umbral: rendimiento, seguridad, plataformas, idioma…>

## Escenarios de prueba
<!-- Cada RF con los 4 tipos: happy (H), borde (E), falla (F) y seguridad (S).
     Un tipo que no aplica va como fila `RF-n.<tipo>` con `n/a — <motivo>`. Ver `specs/templates/scenarios.md`. -->
### RF-1
| ID | Tipo | Dado | Cuando | Entonces |
|---|---|---|---|---|
| RF-1.H1 | happy | <estado inicial> | <acción> | <resultado observable> |
| RF-1.E1 | borde | <valor en el límite> | <acción> | <resultado> |
| RF-1.F1 | falla | <input inválido o error> | <acción> | <cómo responde y qué no cambia> |
| RF-1.S1 | seguridad | <usuario sin permiso / otro tenant> | <acción> | <se rechaza> |

## Fuera de alcance
<Lo que explícitamente NO se hace en esta iteración.>

## Criterios de finalización
- Cada escenario de prueba cubierto por su test, en verde (`check-scenarios` sin faltantes).
- <Demo manual del flujo principal.>
- <Si es crítico: smoke real + regresión del camino crítico.>

## Preguntas y respuestas
1. <Pregunta> → <respuesta>

## Dudas abiertas
- [NECESITA ACLARACIÓN] <pregunta concreta>
