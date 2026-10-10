---
name: frontend-structure
description: 'Referencia de estructura de carpetas y nombres para frontend React y Next.js: page.tsx que solo renderiza su componente de presentation/pages, componentes en PascalCase con su carpeta, subcarpetas hooks/helpers/types/constants/components con sufijos, barriles index.ts con exports nombrados y qué va en shared. Úsala al crear o mover componentes, páginas o hooks, o cuando pregunten "dónde pongo este componente", "cómo nombro este archivo" o "estructura del front".'
---

# frontend-structure — Estructura y nombres en React / Next.js

**Tipo: referencia.** No tiene etapa ni punto de parada propio: la carga otra skill o el usuario. Si la constitución o el `AGENTS.md` del repo definen otra convención, **manda la del repo**.

## Árbol
```
app/users/page.tsx                    ruta de Next: solo compone
src/presentation/
  pages/UsersPage/                    contenido de la página
    UsersPage.tsx
    index.ts
  components/
    UserList/
      UserList.tsx
      index.ts
      components/                     subcomponentes privados
        UserListItem/
          UserListItem.tsx
          index.ts
      hooks/useUserList.hook.ts       + index.ts
      helpers/formatUser.helper.ts    + index.ts
      types/userList.type.ts          + index.ts
      constants/userStatus.constant.ts + index.ts
  shared/                             lo que usan 2 o más componentes
    hooks/ helpers/ types/ constants/ stores/
```

## Rutas de Next (`app/`)
- `page.tsx` **solo compone**: lee `params`/`searchParams`, define `metadata`/`generateMetadata`, hace auth o `redirect` si hace falta, y renderiza el componente de `presentation/pages/<X>Page/`.
- Sin lógica, estado, efectos ni llamadas a la red en `page.tsx`. Todo eso va en el componente de la página (y los datos, por las capas del proyecto).
- `page.tsx` queda como server component. Si el contenido necesita `"use client"`, la directiva va en el componente, no en la página.
- `layout.tsx`, `loading.tsx`, `error.tsx` y `not-found.tsx` siguen la misma idea: componen, no implementan.

## Nombres
| Qué | Archivo | Ejemplo |
|---|---|---|
| Componente | `PascalCase.tsx`, igual que su carpeta | `UserList/UserList.tsx` |
| Página | `<X>Page.tsx` en `presentation/pages/<X>Page/` | `UsersPage/UsersPage.tsx` |
| Hook | `use<Name>.hook.ts` | `useUserList.hook.ts` |
| Helper | `<name>.helper.ts` | `formatUser.helper.ts` |
| Tipos | `<name>.type.ts` | `userList.type.ts` |
| Constantes | `<name>.constant.ts` | `userStatus.constant.ts` |
| Store | `<name>.store.ts` | `userList.store.ts` |

Los sufijos van **siempre**. Excepción: los archivos especiales de Next (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.ts`) van en minúscula, como exige el framework.

## Subcarpetas
- `components/`, `hooks/`, `helpers/`, `types/`, `constants/` dentro de un componente **solo si hacen falta**. Nada de carpetas vacías.
- Los subcomponentes van **dentro de `components/`**, nunca al mismo nivel que el componente que los usa.
- Si algo lo usan 2 o más componentes, se mueve a `shared/`. Si deja de usarse en más de uno, se queda donde está: no se mueve de paso.

## Barriles (`index.ts`)
- Cada carpeta de componente y cada subcarpeta tiene su `index.ts`.
- **Exports nombrados siempre**: `export { UserList } from './UserList';`. Nada de `export *` ni de `export default`.
- **Sin barril en la raíz** de `components/`, `pages/` o `shared/`: arrastra módulos que no se usan y rompe el tree-shaking.
- No mezcles en un mismo barril exports de server y de `"use client"`: el cliente termina importando código de servidor, o al revés.
- Se importa desde la carpeta: `import { UserList } from '@/presentation/components/UserList';`.

## Checklist
- [ ] `page.tsx` solo compone y renderiza su `<X>Page`.
- [ ] Componentes en PascalCase con el mismo nombre que su carpeta.
- [ ] Sufijos en hooks, helpers, types, constants y stores.
- [ ] Subcomponentes dentro de `components/`; sin carpetas vacías.
- [ ] Un `index.ts` por carpeta, con exports nombrados, sin `export *` ni barril en la raíz.
- [ ] Lo compartido por 2 o más componentes está en `shared/`.
