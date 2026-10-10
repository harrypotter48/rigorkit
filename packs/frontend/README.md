# Pack `frontend` — Estructura y nombres en React / Next.js

Una referencia de cómo se organizan y nombran páginas, componentes, hooks y barriles en un frontend React o Next.js, y un revisor de solo lectura que la comprueba.

## Qué trae
| Tipo | Nombre | Qué hace |
|---|---|---|
| Skill (referencia) | `frontend-structure` | `page.tsx` que solo compone, `presentation/pages/<X>Page/`, componentes en PascalCase, subcarpetas con sufijos (`.hook.ts`, `.helper.ts`, `.type.ts`, `.constant.ts`, `.store.ts`), barriles con exports nombrados y `shared/` |
| Agente (solo lectura) | `frontend-reviewer` | Revisa un diff (hallazgos introducidos vs preexistentes) o audita una carpeta (deuda por regla, con conteos y peores casos) |

Las capas y la dirección de dependencias son del pack [`architecture`](../architecture/README.md); este pack revisa la estructura y los nombres dentro del front.

## Con el pack `sdd`
Si los dos packs están instalados, `sdd-implement` (al terminar cada task) y `sdd-verify` le pasan el diff a `frontend-reviewer` **solo si el diff toca el frontend** (`.tsx`, `.jsx` o `app/`). Sin este pack, `sdd` funciona igual.

## Deuda técnica
Pídele al agente: "audita la estructura del front de `src/`". Devuelve la deuda agrupada por regla. Si quieres guardarla, va en una sección "Deuda de frontend" del baseline del módulo.

## La convención del proyecto manda
Si la constitución o el `AGENTS.md` del repo definen otra convención, el revisor y la skill siguen la del repo.

## Instalar
```bash
./install.sh --pack frontend,architecture,sdd --agent claude --project ~/code/mi-repo
```
