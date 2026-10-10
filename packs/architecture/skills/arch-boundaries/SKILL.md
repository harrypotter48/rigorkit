---
name: arch-boundaries
description: 'Referencia de arquitectura por capas o hexagonal (ports & adapters): qué va en domain, application, infrastructure y presentation, la regla de dependencia, qué puede importar cada capa y el orden para crear un feature. Úsala al planear o implementar código en un proyecto con capas, o cuando pregunten "dónde va esto", "arquitectura hexagonal", "clean architecture", "ports and adapters" o "en qué capa pongo X".'
---

# arch-boundaries — Capas y límites

**Tipo: referencia.** No tiene etapa ni punto de parada propio: la carga otra skill (por ejemplo, la de implementar) o el usuario, y manda el punto de parada de quien la usa.

## Primero, la del proyecto
1. Si la constitución, `AGENTS.md` o la documentación del repo definen capas o convenciones, **mandan sobre esta skill**.
2. Si no, infiérelas del código: carpetas (`domain/`, `application/`, `infrastructure/`, `presentation/` o equivalentes), alias de import y un feature existente de punta a punta.
3. Si el repo no tiene capas, no las impongas de paso: avisa y sigue la estructura que hay.

## Las 4 capas
| Capa | Contiene | Puede importar |
|---|---|---|
| `domain` | Modelos y tipos puros, DTOs de entrada y salida, **interfaces de repositorio (ports)** | Nada de otras capas ni de frameworks |
| `application` | Casos de uso: `queries/` (lectura) y `mutations/` (escritura) | Solo `domain` |
| `infrastructure` | **Adapters**: implementaciones de los ports (`*-repository-impl`), clientes HTTP/DB/storage, y el punto de entrada (controller o facade) que conecta caso de uso con implementación | `domain` y `application` |
| `presentation` | UI: páginas, componentes, hooks, stores | Controllers de `infrastructure` para operaciones; tipos de `domain` para tipar props y estado |

**Regla de dependencia:** las dependencias apuntan hacia `domain`. Nunca al revés: `domain` no conoce a nadie y `application` no conoce implementaciones.

## Hexagonal = estas capas
- **Port de salida** = interfaz de repositorio en `domain`.
- **Adapter de salida** = su implementación en `infrastructure`.
- **Adapter de entrada** = `presentation` (UI) o el controller HTTP del framework en un backend: llama a casos de uso, nunca a repositorios.
- **Composition root** = el controller o facade de `infrastructure`: obtiene la implementación del repositorio, se la pasa al caso de uso y delega. No tiene lógica de negocio.

## Casos de uso
- **Uno por archivo**, como función que recibe el repositorio por parámetro: `application/queries/order/getOrderById.ts`. Es fácil de encontrar y se testea con un repositorio falso.
- Variante que vas a encontrar: una clase por entidad (`OrderQueries`, `OrderMutations`) con el repositorio en el constructor. Es válida en código existente; el código nuevo sigue la convención que declare el proyecto y **no se migra lo existente de paso**.

## Flujo
```
presentation → controller (infrastructure) → caso de uso (application) → port (domain) ← repository impl (infrastructure) → red / DB
```

## Receta: nueva operación para la entidad `Order`
1. Tipos `Request`/`Response` y modelo en `domain/entities/order/`.
2. Método en la interfaz del repositorio (`domain`).
3. Implementación en `infrastructure/repositories/`.
4. Caso de uso en `application/{queries|mutations}/order/`.
5. Método en el controller de `infrastructure/controllers/`.
6. Presentation llama al controller.

## Anti-patrones
- **Presentation hablando con la red**: `fetch`, `axios` o el cliente de datos dentro de una página, componente o hook. Se pierde la validación de tipos que dan las capas, y es donde aparecen los bugs de shapes. No hay excepción para "una pantalla chica".
- Presentation importando repositorios o casos de uso directamente (se salta el controller).
- `domain` importando un framework, un ORM, un cliente HTTP o variables de entorno.
- Un caso de uso que instancia una implementación concreta en vez de recibir el port.
- Lógica de negocio (reglas, cálculos, decisiones) en el controller, en el repository impl o en un componente.

## Tests por capa
`domain`: unitarios puros · `application`: unitarios con repositorio falso · `infrastructure`: integración (HTTP, DB) · `presentation`: componentes + E2E.

## Checklist
- [ ] `domain` sin imports de frameworks ni de otras capas.
- [ ] Cada caso de uso depende solo de `domain` y recibe el port.
- [ ] Las implementaciones cumplen la interfaz del port.
- [ ] Presentation usa controllers para operaciones y tipos de `domain` para tipar; nada de red directa.
- [ ] Nombres consistentes por entidad en todas las capas, según la convención del proyecto.
