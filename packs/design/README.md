# design — Interface quality and usability
Reference skills for the design lane, plus a readonly interface reviewer.

| Item | Purpose |
|---|---|
| design-ux-flow | Journeys, tasks, friction and observable usability criteria; simulated results labeled |
| design-ui-criteria | Hierarchy, states, responsive behavior, accessibility level and the capture checklist |
| design-ui-reviewer | Review of rendered screens; defect or improvement, with evidence and untested scope |

References follow their caller's stage/stop. Project constitution/AGENTS.md wins, including the accessibility level it declares.

With sdd installed, the lane runs before the plan (UX criteria become requirements) and after the builder (interface review). Findings are defects or improvements: an improvement is a warning that never blocks, and a defect blocks only when the same change does not correct it. The human produces the captures; the reviewer never runs the application.

Ask for "revisa la interfaz de la pantalla de login" or "audita los criterios de accesibilidad".
```bash
./install.sh --pack design,sdd --agent claude --project ~/code/my-repo
```
