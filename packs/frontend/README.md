# frontend — React / Next.js structure
A reference and readonly reviewer for pages, components, hooks and barrels.

| Item | Purpose |
|---|---|
| frontend-structure | Composition-only routes; `presentation/pages/<X>Page/`; PascalCase folders; .hook.ts/.helper.ts/.type.ts/.constant.ts/.store.ts; named barrels and shared/ |
| frontend-reviewer | Diff findings introduced/pre-existing or folder debt by rule/count/worst cases |

Project constitution/AGENTS.md conventions win. Layer direction belongs to [architecture](../architecture/README.md).
With sdd, implementation/verification passes frontend-reviewer the diff only for .tsx/.jsx/app/ changes. SDD still works without this pack and performs its own relevant checks.
Ask for "audita la estructura del front de src/". Requested saved debt uses module baseline Frontend debt (legacy "Deuda de frontend").
```bash
./install.sh --pack frontend,architecture,sdd --agent claude --project ~/code/my-repo
```
