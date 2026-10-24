# 002-website test contracts

These tests are written before website implementation. Tests run only when the user invokes them. The first Node run requires no installed website packages: every test fails at an explicit missing-implementation/artifact guard before importing optional browser/YAML dependencies. Expected red is missing production code, not a missing test import.

## Layers

- source.test.mjs: 10 CLI/import/output-check contracts against isolated source fixtures.
- browser.test.mjs: 23 real production-renderer/browser/Pagefind interactions. Uses the actual application with real source plus a separate generic fixture corpus, never a replacement mock search engine.
- workflow.test.mjs: 5 tests of the actual workflow's strict YAML, event/ref/needs gates, failure visibility and publishing permissions. This proves workflow policy, not provider uptime or an actual public deployment.

Every scripted test starts with its approved RF scenario ID; all files mention change 002-website. The 3 explicit manual rows and 7 justified n/a rows remain in the spec. The published-site and deployment-failure observations require separate human/provider evidence.

## Import/output CLI

Planned production CLI: `site/scripts/prepare-docs.mjs --root <source> --output <generated> --base /rigorkit/ --repository <url> --ref <source-ref>`.

Output `manifest.json`: `{ documents, packs }`. Each document has `sourcePath`, `route` (without project base), `generatedPath` (safe path relative to output), `title`, `headings: [{ id, text }]`, `codeBlocks: [string]`, original metadata and source classification. Each pack has `name`, `summary` and `documentRoute`.

Paths follow the plan's route examples. Headings and code blocks come from the real source parser. The test does not supply manufactured expected source metadata to production code.

Planned validation CLI: `site/scripts/check-site.mjs --dist <output> --manifest <manifest> --base /rigorkit/`. Missing/malformed links, missing base, broken recovery and corrupt source commands exit 1 with source/destination diagnostics. Valid generation/checking exits 0. The small HTML output fixtures exercise checker failures; the browser suite separately exercises the real renderer.

## Browser artifacts

After toolchain implementation, `node site/test/run-browser.mjs` is the user-run integration driver. It builds the actual production application, then builds a disposable source corpus, edits/removes/adds source documents and rebuilds into a separate fixture output. A before-state record is read from real initial build output. Individual browser tests then serve these outputs under `/rigorkit/` and launch Chromium. A final normal build restores generated production content, including after browser failure.

Build accepts `RIGORKIT_DOCS_ROOT` for a test source root and `RIGORKIT_SITE_OUT_DIR` for a separate test output. Default values remain real repository source and site/dist. Neither source selection is a published runtime setting. No fixture output is deployed. The caller must gate artifact upload on a final normal production build and its output checks.

Browser prerequisites (installed by user during the toolchain task): Playwright library, Chromium and compatible Astro/Starlight dependencies. Workflow tests additionally need the `yaml` library. Tests must not skip missing prerequisites or report them as PASS.

## Publication policy

The approved primary branch is provisionally main pending GitHub settings confirmation. The workflow has `build` and `deploy` jobs. Deploy requires build success and the explicit conjunction `github.event_name == 'push' && github.ref == 'refs/heads/main'`. The test evaluator reads that actual guard and supports only this simple equality/AND grammar; it does not execute arbitrary workflow text. Production Pages/OIDC permissions exist only on deploy, in the github-pages environment. A successful URL comes from the actual deploy action output.

If external default-branch information changes this assumption, update the plan/contract deliberately before implementation; do not change tests merely to silence an introduced failure.
