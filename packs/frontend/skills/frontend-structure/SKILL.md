---
name: frontend-structure
description: 'Reference for React/Next.js pages, component folders, suffixes, barrels and shared code. Use for "estructura del front" or "cómo nombro este archivo".'
---
# React / Next.js
**Type: reference.** Caller stage/stop; repo constitution/AGENTS.md wins.

## Layout
```
app/users/page.tsx                      route composition only
src/presentation/
  pages/UsersPage/UsersPage.tsx          + index.ts
  components/UserList/
    UserList.tsx                        + index.ts
    components/UserListItem/UserListItem.tsx + index.ts
    hooks/useUserList.hook.ts           + index.ts
    helpers/formatUser.helper.ts        + index.ts
    types/userList.type.ts              + index.ts
    constants/userStatus.constant.ts    + index.ts
  shared/                              used by 2 or more components
    hooks/ helpers/ types/ constants/ stores/
```
Next page.tsx only composes: params/searchParams, metadata/generateMetadata, auth/redirect as needed, `presentation/pages/<X>Page/`. No route logic/state/effects/network: content handles them, data via project layers. page.tsx stays server; use client belongs on content, not route. layout.tsx/loading.tsx/error.tsx/not-found.tsx likewise compose, never implement.

## Names
| Kind | File | Example |
|---|---|---|
| Component | PascalCase.tsx, matching folder | UserList/UserList.tsx |
| Page | `<X>Page.tsx` in `presentation/pages/<X>Page/` | UsersPage/UsersPage.tsx |
| Hook | `use<Name>.hook.ts` | useUserList.hook.ts |
| Helper | `<name>.helper.ts` | formatUser.helper.ts |
| Type | `<name>.type.ts` | userList.type.ts |
| Constant | `<name>.constant.ts` | userStatus.constant.ts |
| Store | `<name>.store.ts` | userList.store.ts |
Always suffixes; only Next special files (page.tsx/layout.tsx/loading.tsx/error.tsx/not-found.tsx/route.ts) use framework-required lowercase names.

components/hooks/helpers/types/constants only as needed; never empty. Subcomponents go inside components/, never beside their parent. 2+ components→shared/; later one→leave it, no incidental moves.
Every component folder/subfolder: index.ts. Named exports ONLY (`export { UserList } from './UserList';`), never export * or default. No root barrel in components/pages/shared: pulls unused modules, defeats tree-shaking. Never mix server/use-client barrel exports. Import folder entry (`import { UserList } from '@/presentation/components/UserList';`).

## Checklist
- [ ] Routes compose/render <X>Page only.
- [ ] PascalCase component matches folder.
- [ ] Hook/helper/type/constant/store suffixes.
- [ ] Nested components/, no empty folders.
- [ ] index.ts per folder, named exports, no export * or root barrel.
- [ ] Shared by 2+ components lives in shared/.
