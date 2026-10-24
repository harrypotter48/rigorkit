# Validation — 002-website

## Evidence and limits

- User supplied intended-red results: 38 tests, 0 pass, 38 fail, with missing implementation/artifact guards.
- User supplied scenario checker output: 48 scenarios, including 3 manual scenarios. Seven scenarios are approved n/a.
- T4–T14 implementation has passing scoped checks. T15 accumulated review and T16–T19 live/hosting/closure work remain pending.
- Dependency files and npm lockfile are present locally; user-run production/browser checks demonstrate the installed runtime. The agent has not run install/build/check/test/deploy commands.
- Static self-review covered importer boundaries, source links, rendering inputs, search states and publication guards. This is not independent review or runtime evidence.
- Local responsive/keyboard observation, public deployment and previous-version hosting observation remain pending. No exception from change 001 is inherited.
- No push, merge or public deployment has been performed by the agent.

## Reported implementation failure

- User reported production generation failing with `Pack core: missing summary in README catalog`; browser builds consequently fail and output validation has no manifest.
- Read-only Markdown AST inspection identified a later incidental `core` link in a table row overwriting its catalog summary with an empty value.
- Importer now accepts only catalog-shaped rows with a standalone pack link and a nonempty summary. Existing RF-2.E1 test now includes an incidental-link table and asserts the core summary survives. Runtime confirmation pending.

- User confirmed importer success: 47 source documents and 4 packs. Astro then rejected `outDir` as a URL object; the installed Astro schema requires a string. Configuration now supplies filesystem path strings for normal and fixture builds, preserving the fixture output boundary. Type/build verification remains pending.

- User reported built-output link validation failing for `#_top` across documentation pages. Installed Starlight defines its page title target as `h1#_top`; the custom PageTitle used `starlight__title`. Restored the expected heading target while retaining source heading IDs, and extended RF-7.H1 to follow the top link. Rebuilt output and green verification remain pending.

- User log `/private/tmp/rigorkit-website-checks.log`: production build succeeded; browser suite reported 22 pass / 1 fail. RF-7.H1 timed out because the new regression clicked the visually hidden keyboard skip link with a pointer. It now focuses the link and activates it with Enter. Output checker reported only the landing `#_top` target missing; hero heading and its aria-labelledby now use `_top`. Both fixes await rerun; no all-green claim.

## Latest verification — 2026-10-23

- User-run log `/private/tmp/rigorkit-website-checks.log`: 23 browser tests passed, 0 failed; real production and fixture builds succeeded.
- Final restored production output check: 47 source documents, 50 HTML pages, 0 errors.
- User-run `/private/tmp/rigorkit-website-final.log`: Astro check 0 errors / 0 warnings; source/workflow tests 15/15 pass; existing toolkit tests 21/21 pass; scenario checker covers 48 scenarios (3 manual). Combined with the browser log, all 38 scripted website tests pass. Manual responsive/keyboard and public hosting observations remain pending.

## Local preview observation — 2026-10-23

- Agent opened the user-started production preview in the in-app browser at a measured 971-pixel viewport. Landing and nested baseline document visually inspected; actual search for `baseline` returned 16 matching documents and its first link opened the nested page.
- Direct nested reload succeeded. Wide table scrolls within the content, with document width equal to viewport width. Tab visibly focused Skip to content; Enter reached `#_top`.
- Exact 360/1280 visual evidence remains pending. In-app browser exposes no viewport sizing capability; native Codex app control was denied. Prepared user-run `site/scripts/capture-preview.mjs` to save actual preview screenshots at both sizes for visual inspection; it does not build or deploy.

## Approved reading refinement — 2026-10-23

- User approved roomier documentation typography, highlighted skill identifiers, a numbered change flow and left-aligned prose; landing display font is retained.
- Updated source README with inline-code skill names and a numbered workflow (single source for GitHub and website). Scoped direct prose/list typography, paragraph/list/heading spacing and inline-code badges in the website stylesheet; fenced commands remain unchanged.
- Earlier scripted results predate this visual/source refinement. Regenerated output/link validation and visual captures at 360/1280 remain pending. No extra mirrored implementation tests added for CSS.

## Visual capture review — 2026-10-23

- Inspected user-generated 360/1280 document screenshots and keyboard screenshots, plus mobile landing/search. Captures show readable spacing, highlighted inline code and visible skip-link focus. Four measured page/viewport width pairs match: home and baseline document at 360 and 1280 pixels, no page overflow. Rebuild and final output check succeeded (47 source documents / 50 pages / 0 errors).
- Visual review found search results created by JavaScript lacked Astro scoped CSS attributes. Anchored global descendant selectors now style the dynamic result cards and clamp excerpts to three lines. Excerpt entities are decoded in an inert document and inserted only through textContent; no parsed nodes are inserted into the live page.
- Added workflow-section captures to inspect the approved numbered skill flow directly. Updated search rendering and workflow captures await user rerun; RF-1.E1/T16 remain open until this review finishes.

## Reading refinement verification — 2026-10-23

- Latest user-run `/private/tmp/rigorkit-website-visual.log`: 23/23 browser tests pass after search rendering changes; final production output check reports 47 documents / 50 pages / 0 errors.
- Inspected updated search screenshots at 360/1280: styled result cards, decoded placeholder characters, short excerpts, visible input focus and scrollable results. Inspected desktop numbered-flow screenshot: highlighted skill names and roomier paragraph/list spacing are visible. Mobile workflow screenshot captured preceding prose during anchor scrolling, so it is not evidence of the entire numbered flow at that width.
- Latest observations show no page overflow for home, overview and nested baseline document at both 360/1280 (six matching page/viewport width pairs). Combined with inspected landing/document/keyboard screenshots and direct browser interaction, RF-1.E1 local responsive/keyboard observation passes. Public deployment and provider-failure observations remain pending.

## Delivery approval — 2026-10-23

- User approved the visual result ("ok lo veo perfecto") and explicitly requested one local commit ("ok haz el commit local").
- This delivery records the implementation and available verification evidence. Accumulated final review/independent review and public deployment/provider-failure observations remain outstanding. The spec is not archived or declared fully fulfilled by committing it.

## Scenario evidence

| Scenario | Verification reference | Result |
|---|---|---|
| RF-1.H1 | `site/test/browser.test.mjs:9` | PASS — user-run log, 2026-10-23 |
| RF-1.E1 | Local browser interaction plus user-run 360/1280 screenshots and width observations | PASS — 2026-10-23 |
| RF-1.F1 | `site/test/source.test.mjs:8` | PASS — user-run final log, 2026-10-23 |
| RF-1.S | n/a — this requirement provides public navigation, not authentication or permission changes | N/A per approved spec |
| RF-2.H1 | `site/test/browser.test.mjs:21` | PASS — user-run log, 2026-10-23 |
| RF-2.E1 | `site/test/source.test.mjs:16` | PASS — user-run final log, 2026-10-23 |
| RF-2.F1 | `site/test/source.test.mjs:31` | PASS — user-run final log, 2026-10-23 |
| RF-2.S | n/a — catalog entries expose already-public pack documentation and do not confer privileges | N/A per approved spec |
| RF-3.H1 | `site/test/browser.test.mjs:32` | PASS — user-run log, 2026-10-23 |
| RF-3.E1 | `site/test/browser.test.mjs:41` | PASS — user-run log, 2026-10-23 |
| RF-3.F1 | `site/test/source.test.mjs:38` | PASS — user-run final log, 2026-10-23 |
| RF-3.S1 | `site/test/browser.test.mjs:47` | PASS — user-run log, 2026-10-23 |
| RF-4.H1 | `site/test/browser.test.mjs:52` | PASS — user-run log, 2026-10-23 |
| RF-4.E1 | `site/test/browser.test.mjs:61` | PASS — user-run log, 2026-10-23 |
| RF-4.F1 | `site/test/browser.test.mjs:68` | PASS — user-run log, 2026-10-23 |
| RF-4.S | n/a — content inclusion boundaries and rendering safety are specified by RF-5/RF-6 | N/A per approved spec |
| RF-5.H1 | `site/test/source.test.mjs:49` | PASS — user-run final log, 2026-10-23 |
| RF-5.E1 | `site/test/browser.test.mjs:78` | PASS — user-run log, 2026-10-23 |
| RF-5.F1 | `site/test/source.test.mjs:57` | PASS — user-run final log, 2026-10-23 |
| RF-5.S1 | `site/test/source.test.mjs:63` | PASS — user-run final log, 2026-10-23 |
| RF-6.H1 | `site/test/browser.test.mjs:85` | PASS — user-run log, 2026-10-23 |
| RF-6.E1 | `site/test/browser.test.mjs:94` | PASS — user-run log, 2026-10-23 |
| RF-6.F1 | `site/test/source.test.mjs:70` | PASS — user-run final log, 2026-10-23 |
| RF-6.S1 | `site/test/browser.test.mjs:101` | PASS — user-run log, 2026-10-23 |
| RF-7.H1 | `site/test/browser.test.mjs:106` | PASS — user-run log, 2026-10-23 |
| RF-7.E1 | `site/test/browser.test.mjs:117` | PASS — user-run log, 2026-10-23 |
| RF-7.F1 | `site/test/source.test.mjs:78` | PASS — user-run final log, 2026-10-23 |
| RF-7.S | n/a — URL navigation does not introduce authenticated routes or tenant permissions | N/A per approved spec |
| RF-8.H1 | `site/test/browser.test.mjs:127` | PASS — user-run log, 2026-10-23 |
| RF-8.E1 | `site/test/browser.test.mjs:134` | PASS — user-run log, 2026-10-23 |
| RF-8.F1 | `site/test/source.test.mjs:86` | PASS — user-run final log, 2026-10-23 |
| RF-8.S | n/a — public missing-page recovery grants no access to protected data | N/A per approved spec |
| RF-9.H1 | `site/test/browser.test.mjs:142` | PASS — user-run log, 2026-10-23 |
| RF-9.E1 | `site/test/browser.test.mjs:147` | PASS — user-run log, 2026-10-23 |
| RF-9.F1 | `site/test/browser.test.mjs:155` | PASS — user-run log, 2026-10-23 |
| RF-9.S1 | `site/test/browser.test.mjs:160` | PASS — user-run log, 2026-10-23 |
| RF-10.H1 | `site/test/browser.test.mjs:167` | PASS — user-run log, 2026-10-23 |
| RF-10.E1 | `site/test/browser.test.mjs:174` | PASS — user-run log, 2026-10-23 |
| RF-10.F1 | `site/test/browser.test.mjs:179` | PASS — user-run log, 2026-10-23 |
| RF-10.S | n/a — executable query text is covered by RF-9.S1; search introduces no accounts or permissions | N/A per approved spec |
| RF-11.H1 | Manual observation | PENDING |
| RF-11.E1 | `site/test/workflow.test.mjs:7` | PASS — user-run final log, 2026-10-23 |
| RF-11.F1 | `site/test/workflow.test.mjs:13` | PASS — user-run final log, 2026-10-23 |
| RF-11.S1 | `site/test/workflow.test.mjs:20` | PASS — user-run final log, 2026-10-23 |
| RF-12.H1 | `site/test/workflow.test.mjs:32` | PASS — user-run final log, 2026-10-23 |
| RF-12.E1 | `site/test/workflow.test.mjs:42` | PASS — user-run final log, 2026-10-23 |
| RF-12.F1 | Manual observation | PENDING |
| RF-12.S | n/a — protection against untrusted production publication is covered by RF-11.S1 | N/A per approved spec |
