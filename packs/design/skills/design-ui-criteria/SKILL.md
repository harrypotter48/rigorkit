---
name: design-ui-criteria
description: 'Reference for interface quality: visual hierarchy, states, responsive behavior, accessibility level and the capture checklist. Use for "criterios de UI" or "accesibilidad" when specifying or reviewing a screen.'
---
# design-ui-criteria — Interface criteria
**Type: reference.** No stage/stop of its own; caller skill or user controls approval.

## Project first
Constitution/AGENTS.md wins: design system, tokens, components, accessibility level and supported viewports come from the project. Declare the level used: default **WCAG 2.2 AA**, or the level the project declares; an unknown declared level falls back to AA and is reported.

## Hierarchy
- First-read object and primary action are visible without scrolling at the declared viewport.
- Visual weight follows user decisions, not component-library defaults.
- Density is a decision (compact, balanced, spacious) with a reason, not an accident.
- Forbidden by default: card grid without hierarchy, decorative gradients or glass, motion without purpose, empty state that hides the user's work.

## States
Every state is designed, not improvised: loading, empty, partial, error, success, disabled, selected, focus, long content, permission denied, offline. A state says what happened, what the user can do next and where the data comes from.

## Responsive
Narrow layout preserves the job, not the desktop column order stacked into cards. Keep the primary action and the first-read object reachable. Targets are usable by touch and by keyboard.

## Accessibility criteria
- Keyboard: every interactive element reachable, visible focus, no trap, logical order, Escape and focus return for overlays.
- Semantics: name, role and value for custom controls; label tied to its field; error announced and associated.
- Content: alternatives for non-text content, logical headings and landmarks, reflow at zoom without loss of content.
- Visual: contrast for text and meaningful graphics, no meaning by color alone, reduced motion respected.
- Standards: WCAG 2.2 AA by default; cite the success criterion number and level for each finding.

## Capture checklist
The human produces the evidence; the agent never starts the application.
- Viewports: declared desktop and narrow widths (default 1440 and 390).
- States: every state of the screen under review.
- Per capture: viewport, state, and the interaction that produced it.
- Evidence stays local or redacted: no customer data, no credentials, no tokens in artifacts.

## Output
Checklist of criteria with the evidence each one needs, so a requirement can be written as a verifiable statement and a review can be judged from what was captured.
