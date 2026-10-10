---
name: arch-plugin-registry
description: 'Referencia para hacer extensible algo que hoy se despacha con un switch o if/else cerrado: el default consulta un registry y los built-ins y las extensiones se registran igual, reusando el ciclo de vida que ya existe. Úsala cuando pidan "hacerlo extensible", "agregar tipos sin tocar el switch", "plugins", "registry" o "que terceros agreguen X".'
---

# arch-plugin-registry — Registry en vez de switch cerrado

**Tipo: referencia.** No tiene etapa ni punto de parada propio: la carga otra skill o el usuario.

## Regla
Para hacer extensible un `switch` cerrado, el `default` pasa a consultar un **registry**. Los built-ins y las extensiones se registran **de la misma forma**. Las extensiones se enganchan al ciclo de vida que ya existe (por ejemplo, `onInstall` de un plugin) en vez de inventar un tipo de plugin o un loader nuevo.

## Antes de diseñar
1. Busca un **precedente** en el código: otro registry, un mapa de handlers, un sistema de plugins. Si existe, cópialo.
2. Busca el ciclo de vida existente donde una extensión pueda registrarse.

## Forma
```ts
type Renderer = (props: FieldProps) => Element;
type KnownType = 'text' | 'number';
type FieldType = KnownType | (string & {}); // acepta tipos nuevos sin perder el autocompletado

const registry = new Map<string, Renderer>();
export const registerFieldType = (type: string, r: Renderer) => registry.set(type, r);

switch (type) {
  case 'text': return renderText(props);
  case 'number': return renderNumber(props);
  default: {
    const r = registry.get(type);
    return r ? r(props) : renderUnknown(type);
  }
}
```
Una extensión es un plugin normal que, en su `onInstall`, llama a `registerFieldType(...)`.

## Por qué
Hay menos superficie de cambio: el switch no se toca para cada tipo nuevo y se reusa el loader que ya existe.

## Cuidado
- **Singletons en bundles cargados dinámicamente**: si el registry vive en un paquete que se empaqueta dos veces (host y extensión), hay dos `Map` y las extensiones registran en el que nadie lee. El registry tiene que ser una sola instancia compartida.
- Un tipo desconocido no debe romper: tiene un fallback visible (`renderUnknown`).
- Registrar dos veces el mismo tipo: decide si se sobrescribe o es error, y que sea explícito.
