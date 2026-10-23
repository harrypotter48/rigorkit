# architecture — Layers and extensibility
Reference skills for planning/implementation, plus readonly architecture review.

| Item | Purpose |
|---|---|
| arch-boundaries | Layers/hexagonal, dependencies, ports/adapters, feature order, anti-patterns |
| arch-plugin-registry | Registry fallback for closed dispatch; existing plugin lifecycle |
| arch-reviewer | Diff review or debt audit; file:line, severity and verdict |

References follow their caller's stage/stop. Project constitution/AGENTS.md/architecture docs win; otherwise infer layers from code, never impose missing layers incidentally.

With sdd installed, sdd-implement supplies its task diff, fixes introduced highs and lists others; sdd-verify supplies full change diff and cannot declare fulfillment with introduced highs. Without this pack, SDD reports the missing reviewer and performs its own checks.
Ask for "audita la arquitectura de src/" to get debt by rule, counts and worst cases. On request, save under Architecture debt (legacy "Deuda de arquitectura") in module baseline.
```bash
./install.sh --pack architecture,sdd --agent claude --project ~/code/my-repo
```
