---
name: architecture-plugin-registry
description: 'Reference for extensible dispatch: registry fallback, equal built-in/extension registration and existing lifecycle. Use for "hacerlo extensible" or "plugins".'
---
# architecture-plugin-registry — Open dispatch
**Type: reference.** Caller skill or user controls stage/stop.

Replace a closed switch default with registry lookup; built-ins/extensions register identically. Use existing plugin lifecycle (e.g. onInstall), never invent a new plugin type/loader. First find/reuse a registry/handler-map/plugin precedent, then its registration lifecycle.
```ts
type Renderer = (props: FieldProps) => Element;
type KnownType = 'text' | 'number';
type FieldType = KnownType | (string & {}); // open types, keep autocomplete
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
An ordinary extension plugin calls registerFieldType in onInstall. This reuses its loader and avoids editing the switch per type.

Ensure one shared registry instance across dynamically loaded host/extension bundles: duplicate packaged singletons create two Maps and register into an unread one. Unknown types must show a visible fallback, never crash. Explicitly choose overwrite or error for duplicate registration.
