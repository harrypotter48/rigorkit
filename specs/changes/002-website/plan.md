# Technical plan — 002-website

## Current context

Status: approved by user on 2026-10-23 ("go ahead") for task/test preparation. Spec approved and clarification round 1 ready for plan. Website implementation has not begun. No install/build/test/deploy has run.

- `README.md:1-9` already supplies product purpose, supported tools and four pack summaries. `README.md:11` starts installation; its later sections define update/options/destinations and tier compatibility. Use these documents, not a second installation guide.
- The tracked public corpus currently contains 46 pack Markdown files plus the main README. Derive this set on each build; do not maintain 47 hand-entered routes. `packs/` also contains executable scripts, which are not documentation input.
- There is no tracked site application, package manifest or Pages workflow. `AGENTS.md:3` describes the present toolkit as Markdown/Bash without a build. Add site-only commands/layout documentation without changing toolkit rules or pretending an existing build exists.
- `install.sh:223-240` reads packs for installation. Keep site code, dependencies and generated output outside packs so the installed set stays unchanged. Archived change 001, its baseline and accepted verification exceptions remain untouched.
- Local and remote-tracking refs include main and feat/web-github-pages. The remote default-branch symbolic ref is absent. Target main provisionally based on the existing integration ref; confirm GitHub's default branch before enabling publication. Never deploy this feature branch by default.
- Consulted the vault note "Definiciones operativas en vez de listas a mano": derive sets from operational source rules. No vault writes. Repo rules prevail.
- Context7 connector is unavailable in this session; official Astro, Starlight and GitHub documentation was consulted directly. Runtime/package compatibility is checked against the supported Starlight starter and recorded in the lockfile during implementation, not invented here.

## Structure by layer / module

This is a static content application; no application backend, database or artificial domain layer.

| Layer / module | Change | RFs covered |
|---|---|---|
| `site/` tooling/config | Isolated Astro + Starlight application; npm package/lockfile; generated paths ignored | RF-4, RF-7, RF-11 |
| `site/scripts/` source import | Allowlisted Markdown discovery, source manifest, derived summaries and route/link mapping | RF-2–RF-6 |
| `site/src/content/docs/` | Original landing wrapper plus generated public documentation; generated subtrees never hand-edited | RF-1–RF-8 |
| `site/src/components/`, `site/src/styles/` | Pack catalog, source metadata rendering, search resilience, restrained visual customization | RF-1–RF-3, RF-6–RF-10 |
| Content/search integration | Starlight document hierarchy and built-in Pagefind index; narrow error/empty-state handling | RF-7, RF-9, RF-10 |
| `site/scripts/check-site.mjs` | Check generated links/anchors/base paths, source fidelity, exclusions and expected documents against built output | RF-1–RF-8, RF-11, RF-12 |
| `site/test/` | Node tests for source/policy contracts, browser tests against production output, controlled publication-policy fixtures | All scripted RFs |
| `.github/workflows/pages.yml` | Readonly checks/build job; production deployment job gated on successful checks and primary-branch push | RF-11, RF-12 |
| Repository instructions | Document site commands/generated boundaries and publication prerequisites; no installed-pack changes | RF-3, RF-11, RF-12 |

## Data model

No persistence or migrations. Build data has one producer and explicit consumers:

- `Document`: `{ sourcePath, generatedPath, title, pack, kind, route, headings: [{ id, text }], codeBlocks: [string], originalMetadata }`. Kind is readme/skill/agent/template/checklist/reference/notice. Source body is read from the allowlisted file, never authored in the manifest.
- `Pack`: `{ name, summary, documentRoute }`. Derive name from its folder, summary from the existing main README pack table, and documentation target from the pack README. Missing summaries/targets produce actionable build errors.
- A source-to-route manifest feeds generated pages, sidebar, relative-link rewriting, catalog and output checks. Pagefind consumes the rendered public pages; there is no parallel manually maintained search corpus.

Examples (routes include the project prefix only when rendered as public URLs):

| Source | Document route |
|---|---|
| `README.md` | `/docs/overview/` |
| `packs/sdd/README.md` | `/docs/packs/sdd/` |
| `packs/sdd/skills/sdd-init/SKILL.md` | `/docs/packs/sdd/skills/sdd-init/` |
| `packs/sdd/agents/sdd-reviewer.md` | `/docs/packs/sdd/agents/sdd-reviewer/` |
| `packs/sdd/skills/sdd-init/templates/constitution.md` | `/docs/packs/sdd/skills/sdd-init/templates/constitution/` |

Reserve `/` for the landing and `/packs/` for the catalog. Normalize separators and extension/case consistently; reject route collisions rather than dropping a document. Stable mapping also supplies removal detection.

## Algorithms

### Source import and clean generation
1. Input allowlist: the main README plus regular Markdown files recursively under packs. Do not scan the repository root for arbitrary content. Reject escaping symlinks or invalid relative paths.
2. Derive manifest, pack summaries and all routes before rendering; reject missing required source, missing summaries/targets and collisions.
3. Remove ONLY the importer-owned generated subtree, then recreate it from this manifest. Do not delete the whole content directory or original landing. Rebuilding must remove previously generated pages for deleted sources.
4. Separate source YAML metadata from its body. Generate the Starlight title/schema wrapper; display original skill/agent metadata as escaped data, not executable configuration. Preserve source code text, prose, notice and attribution. Avoid duplicate visible titles without silently losing the original heading anchor.
5. Resolve Markdown links against their SOURCE directory. Mapped Markdown goes to its generated route plus valid fragment. Existing non-public repository targets (e.g. LICENSE) link to their GitHub source, without copying them into the corpus. Missing targets fail the check. External URLs are preserved; external service availability is not a per-build network dependency.
6. Prefix site URLs through one base-aware helper; never concatenate absolute-root links separately in catalog/sidebar/search/recovery.

### Render, verify and search
- Use Starlight's loader/schema for generated Markdown; explicit generated IDs must follow the manifest, rather than relying on implicit filename normalization. Starlight's documented defaults and ID customization are described in [configuration](https://starlight.astro.build/reference/configuration/).
- Render content as documentation; never run imported code examples or interpret skill frontmatter as site directives. Escape code/query text. Use the renderer's established AST hooks for link rewriting, not regex substitutions inside fenced code.
- Build and index the final rendered corpus. Starlight's default search is Pagefind and is available after build/deploy, per its [search guide](https://starlight.astro.build/guides/site-search/). Test production output, not only the development server.
- Keep framework navigation independent of the search module. Catch search initialization/query failures and show an English unavailable state; empty/whitespace input clears results. Preserve Pagefind's normal case-insensitive matching and document links. Use a narrow component override only if the built-in component cannot meet those explicit states; do not implement a second search engine.
- Validate output links/heading anchors and source-derived destinations, including the 404 recovery route. Confirm that internal-spec/development sentinel text never enters pages/index inputs. Do not compare copied generated prose as a substitute for exercising the actual renderer.

### Publication gate
- Checks run for pull requests and pushes. A production deploy runs only for a push to the confirmed primary branch after build, scenario tests and output checks succeed. PRs, including external contributions, receive no production deployment authority.
- Upload only the checked `site/dist/` artifact, never a repository-wide archive. Separate build and deploy jobs; build requires read access, deploy alone receives the GitHub Pages/OIDC permissions and github-pages environment. This job dependency/environment structure follows [GitHub's custom workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
- A failed generation/check cannot reach deploy. Do not delete, overwrite via branch pushes, or clear the previous hosted version during preparation. Deployment failure stays visible in Actions; distinguish it from first-publication failure. Existing public availability after a failed deployment requires the manual RF-12.F1 observation.
- Serialize production publications; keep PR checks in separate concurrency groups so a PR cannot cancel an active publication. Prefer completing an in-flight deploy rather than canceling it midway.

## Contracts

- Public address: `https://harrypotter48.github.io/rigorkit/`. Astro `site` is the origin, `base` is `/rigorkit`; all navigation/assets/search routes obey that prefix. Project-base setup follows [Astro's GitHub Pages guide](https://docs.astro.build/en/guides/deploy/github/).
- Source contract: only main README and pack Markdown feed pages and search. Links to GitHub source outside that corpus do not mean publishing its content on the website.
- Route contract: manifest mapping is authoritative; direct static URLs and heading IDs survive reload under the real base. Removed routes must stop serving removed content; unknown routes recover to home/docs.
- Generated files live inside site and are ignored, reproducible and explicitly marked. All authoring remains in original Markdown except original landing/UI copy. Never modify pack files to satisfy a website loader schema.
- Package contract: site owns its dependencies and lockfile; toolkit use/install does not require npm. Choose versions compatible with the official Starlight starter; pin the supported even-numbered Node runtime used locally and in CI. User runs dependency resolution/install/build/tests. No guessed lockfile and no agent-run scaffold installer.
- User prerequisite: GitHub Pages must use GitHub Actions as publishing source, and the primary branch/environment must be confirmed. Repository settings and a successful public deployment have not been verified. No automatic push/merge/settings mutation is authorized by this plan.

Test-interface refinement approved within task/test preparation: `site/test/README.md` specifies the prepare/check CLI flags and manifest fields, actual-workflow guard grammar and separate before/after browser fixture builds. This narrows testable contracts without changing product RFs. Build accepts RIGORKIT_DOCS_ROOT/RIGORKIT_SITE_OUT_DIR only as local/CI test inputs; production defaults use repository source and site/dist. The importer owns only its generated subtree; original landing remains untouched. Build/CI restores and validates normal production output before upload.

## Decisions

- D1 — Astro + Starlight over a custom documentation renderer or a larger application framework: established Markdown documentation layout/navigation/search and static output; keep custom code focused on importing this repository and required failure states. Official supported setup: [Starlight getting started](https://starlight.astro.build/getting-started/).
- D2 — Isolated site application over adding website files under packs: preserve installation identity and avoid imposing website dependencies on toolkit consumers.
- D3 — Generated importer subtree over hand-maintained Markdown copies or forcing repo frontmatter into a website schema: one source, controlled metadata adaptation and predictable deletion handling. Derived output is not another editable documentation source.
- D4 — Manifest + renderer-aware link mapping over broad copy or text replacements: nested links, fragments and repeated SKILL/README names need source context and collision checks.
- D5 — Pagefind over hosted search or a bespoke substring engine: reuse the theme's static corpus integration; no search account, remote credentials or backend. Add only the failure/empty-state behavior demanded by RF-10.
- D6 — Restrained landing/catalog with Starlight documentation shell over a custom design system: prioritize usable reading/search/installation. Use the theme's responsive navigation, readable typography, visible focus and source links; do not add a visual redesign to toolkit content.
- D7 — Checked artifact deployment through GitHub Actions over a generated gh-pages branch: explicit build/deploy separation, primary-branch gate and provider deployment status. Enabling Pages and final publishing remain user actions.
- D8 — Browser integration against built output over unit-only/HTML-string assertions: actual base URLs, Pagefind, failed search loading and direct reload are cross-component behaviors. Keep pure importer/policy cases in fast Node tests.
- D9 — No installer/global-rule edits and no migration of change 001: verify file boundaries and reuse valid existing toolkit evidence unless those boundaries change; don't rerun the old 50-case matrix merely for new website code.

## Constitution

All eight principles apply where relevant: the installed toolkit stays neutral/self-contained; website-only dependencies live outside packs; source metadata remains valid; generic data only, no secrets; no third-party documentation copied; user files/installer paths unchanged; existing rules budgets unchanged.

No proposed principle violation. Update AGENTS layout/commands to distinguish the website build from the unchanged toolkit. This static-website scope does not change the constitution's existing critical installer/rules paths. Production deployment authority is bounded by the RF-11 gate and reviewed as a security contract. Never use deployment configuration as proof that the site is public.

## Test strategy

Write scenario tests BEFORE implementation, named by RF scenario ID and mentioning 002-website. Preserve approved n/a reasons, and retain explicit manual observations. Match plan level to behavior:
- Importer fixtures: source add/edit/delete, nested docs, metadata/code fidelity, source-based links, pack summaries, collisions and denylisted sentinels.
- Production build + browser: landing/catalog/installation, renderer fidelity, deep links/reloads/404, search case/whitespace/no results/query escaping/unavailable module. Block search asset requests to exercise the failure state; avoid tests that merely assert config strings.
- Workflow policy fixtures: allow primary push after passed checks; reject PR/feature/external contexts and failed builds. Inspect the actual workflow structure/permissions, not a separate unconnected mock policy.
- Manual: 360/1280 responsive reading and keyboard; real public primary-branch publication, deep links and last-valid-version observation after a controlled failed attempt. Do not create a destructive production failure to simulate a test; use an agreed provider-safe failed-attempt procedure and record its actual outcome.

| RF | Scripted scenarios | Explicit manual rows | Approved n/a rows |
|---|---|---|---|
| RF-1 | RF-1.H1, RF-1.F1 | RF-1.E1 | RF-1.S |
| RF-2 | RF-2.H1, RF-2.E1, RF-2.F1 | — | RF-2.S |
| RF-3 | RF-3.H1, RF-3.E1, RF-3.F1, RF-3.S1 | — | — |
| RF-4 | RF-4.H1, RF-4.E1, RF-4.F1 | — | RF-4.S |
| RF-5 | RF-5.H1, RF-5.E1, RF-5.F1, RF-5.S1 | — | — |
| RF-6 | RF-6.H1, RF-6.E1, RF-6.F1, RF-6.S1 | — | — |
| RF-7 | RF-7.H1, RF-7.E1, RF-7.F1 | — | RF-7.S |
| RF-8 | RF-8.H1, RF-8.E1, RF-8.F1 | — | RF-8.S |
| RF-9 | RF-9.H1, RF-9.E1, RF-9.F1, RF-9.S1 | — | — |
| RF-10 | RF-10.H1, RF-10.E1, RF-10.F1 | — | RF-10.S |
| RF-11 | RF-11.E1, RF-11.F1, RF-11.S1 | RF-11.H1 | — |
| RF-12 | RF-12.H1, RF-12.E1 | RF-12.F1 | RF-12.S |

Website package scripts to expose after implementation: prepare docs, test (Node + production browser coverage), check (types/output/links), build (prepare + Astro/Pagefind) and preview. Exact scoped user commands are finalized with tasks after approval; they do not exist yet. Check the real change spec with the existing scenario checker and `--tests site/test`. Browser/hosting evidence remains distinct from green unit tests.

## Risks and cross-layer

| Boundary / risk | Preservation and check |
|---|---|
| Repository source → importer → manifest → generated Markdown | Operational allowlist, temp fixture roots, add/edit/delete tests; never publish internal specs or copy arbitrary repository files |
| Metadata → Starlight schema/rendering | Preserve readonly/tier/name/description as data without mutating source or letting imported metadata control deployment/site routing |
| Markdown links/headings → renderer → public route | Source-relative resolution plus shared route/base helpers; validate fragments and directly reload nested built pages |
| Landing/catalog/sidebar → manifest | Names/summaries/targets source-derived; missing summaries/targets fail explicitly, no hidden manual catalog |
| Rendered pages → Pagefind → browser | Real built search corpus; test title/body matching, case/whitespace/empty/no results, special text and asset outage with docs navigation intact |
| CI build → checked artifact → deployment | Explicit needs/branch/event/permission gates, production concurrency and Pages environment; real publishing cannot be claimed from a local build |
| Production failure → previous version | Never delete hosting state during build; observe actual public outcome after a provider-safe failed attempt, keeping first publication distinct |
| Website → existing toolkit | No files in packs or installer changes; dependencies/output remain in site; existing 001 baseline/test paths remain valid |
| Local refs → GitHub settings | Confirm default branch/source/environment before publication; no guessing that remote hosting is enabled |

Unverified external state: GitHub Pages enablement, actual remote default-branch setting, dependency resolution/lockfile and public deployment. These do not block reviewing this plan, but block claiming implementation or publication complete.
