# architecture — Layers and extensibility
Reference skills for planning/implementation, plus readonly architecture review.

Lane: none of its own. These are specialists the SDD lane calls in its review station.

| Item | Purpose |
|---|---|
| architecture-boundaries | Layers/hexagonal, dependencies, ports/adapters, feature order, anti-patterns |
| architecture-plugin-registry | Registry fallback for closed dispatch; existing plugin lifecycle |
| architecture-reviewer | Diff review or debt audit; file:line, severity and verdict |

References follow their caller's stage/stop. Project constitution/AGENTS.md/architecture docs win; otherwise infer layers from code, never impose missing layers incidentally.

With sdd installed, implementation and verification launch the enabled reviewers together and pass architecture-reviewer the task diff, fixing introduced highs and listing others; verification supplies the full change diff and cannot declare fulfillment with introduced highs. Without this pack, SDD reports the missing reviewer and performs its own checks.

Ask for "audita la arquitectura de src/" to get debt by rule, counts and worst cases. On request, save under Architecture debt (legacy "Deuda de arquitectura") in module baseline.
```bash
./install.sh --pack architecture,sdd --agent claude --project ~/code/my-repo
```
