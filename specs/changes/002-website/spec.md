# Spec 002 — Public website and Markdown documentation

> Status: approved by user on 2026-10-23 ("go ahead") · DoD: normal (no installer or global-rule behavior changes) · Owner repo: rigorkit · Affected repos: none

## Context and goal
Visitors need one public entry point to understand rigorkit, choose packs, install them and read their documentation. Publish an English landing page, pack catalog and complete navigable documentation on the repository's GitHub Pages site. Repository Markdown remains the content source of truth; internal specifications stay outside the website. Documentation is searchable and updates automatically when accepted changes reach the primary branch. A failed publication preserves the previously published site.

## Users / actors
- New visitors discovering rigorkit and its supported coding tools.
- Users choosing packs, reading skills/agents and installing or updating them.
- Maintainers editing repository Markdown and publishing accepted changes.

## User stories
- H1: As a visitor I want to understand rigorkit and reach installation instructions or a pack without browsing the source tree.
- H2: As a user I want browsable, searchable documentation matching the current repository content.
- H3: As a maintainer I want accepted Markdown changes published automatically, without maintaining a second documentation copy or replacing a working site with a failed release.

## Definitions
- **Public documentation**: the repository's main README and every Markdown document belonging to a pack, including its README, skills, agents, local templates, checklists, references and notices.
- **Internal specifications**: the repository's specs, plans, tasks, baselines, capabilities, validations, learnings and archived change records. These stay out of the website and its search corpus; this does not make them private in a public GitHub repository.
- **Primary branch**: the repository's designated default integration branch. Its actual name is resolved during planning, not assumed from the current feature branch.
- **Successful publication**: the new generated site has passed the agreed checks and the hosting platform reports deployment success.
- **Current site**: the most recent successfully published version; edits in an unmerged branch are not public documentation updates.

## Functional requirements (EARS)

### Discovery and installation (H1)
- RF-1: THE SYSTEM SHALL provide an English landing page identifying rigorkit's purpose and the four supported tools, with links to the pack catalog, installation instructions, documentation and GitHub repository.
- RF-2: THE SYSTEM SHALL provide a catalog containing every available pack with its name, source-derived summary and link to its documentation.
- RF-3: THE SYSTEM SHALL present the installation and update instructions from the repository documentation, preserving the commands and their stated options without introducing a separate installation wizard.

### Source of truth and documentation (H2)
- RF-4: WHEN public Markdown is added, changed or removed, THE SYSTEM SHALL reflect that change in the next successful site publication without requiring a second editable copy of its prose.
- RF-5: THE SYSTEM SHALL exclude internal specifications and development-tool content from the published documentation, navigation and search corpus.
- RF-6: THE SYSTEM SHALL render public documentation headings, lists, tables, code blocks and links while preserving code text, notices, attribution and Spanish compatibility examples.
- RF-7: THE SYSTEM SHALL provide documentation navigation and directly addressable document and heading links that work under the repository's GitHub Pages project address, including a direct page load or reload.
- RF-8: IF a requested documentation page does not exist, THEN THE SYSTEM SHALL display a not-found state with a working route back to the site or documentation entry point.

### Search (H2)
- RF-9: WHEN a visitor submits a nonempty search query, THE SYSTEM SHALL search titles and body text across all public documentation without case sensitivity and show matching document links or an explicit no-results state.
- RF-10: IF a search query is empty or search data cannot be loaded, THEN THE SYSTEM SHALL respectively clear prior results or report search unavailability while keeping documentation navigation usable.

### Publication (H3)
- RF-11: WHEN accepted changes reach the primary branch, THE SYSTEM SHALL automatically publish the updated website to the repository's GitHub Pages site after the agreed checks pass.
- RF-12: IF site generation, required checks or deployment fails, THEN THE SYSTEM SHALL report the publication failure without replacing the previous successfully published site.

## Non-functional requirements
- **Language:** site navigation, controls and original landing copy are English. Public Markdown remains faithful to its source, including allowed Spanish aliases and quoted examples; no new translation system.
- **Responsive reading:** at 360 and 1280 CSS pixels viewport width, navigation and body text remain usable without page-wide horizontal overflow; wide code blocks and tables may scroll within their own area.
- **Keyboard access:** visitors can reach and operate navigation, search and result links with a keyboard, with visible focus and a programmatic label for the search field.
- **Readable without search:** a search outage must not prevent opening and reading documentation.
- **Safe rendering:** code examples and search input are content, not executable instructions; they must not execute embedded script when displayed.
- **No product regression:** website work must not change installed pack names, paths, tier/model behavior, installer destinations, global rules or user-file protection.
- **Maintainability:** no manually maintained duplicate prose for Markdown documentation. Generated navigation/search data is derived output, not another editorial source.
- **Publication evidence:** local generation or a configured workflow alone does not prove that the public site is available. The public address must be checked after the user enables/publishes it.

## Test scenarios

### RF-1
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-1.H1 | happy | a first-time visitor | the landing page opens | purpose and Claude Code, Codex, Cursor and OpenCode are identified, with the required destination links |
| RF-1.E1 | edge [manual] | a keyboard user at a 360-pixel viewport | the visitor navigates the landing page | required destinations are reachable and focus is visible without page-wide overflow |
| RF-1.F1 | failure | a required landing destination has no generated page | the site is checked before publication | the invalid internal link is reported and publication does not proceed |
| RF-1.S | security | n/a — this requirement provides public navigation, not authentication or permission changes | | |

### RF-2
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-2.H1 | happy | the available packs | the catalog opens | core, sdd, architecture and frontend each have their source-derived summary and documentation link |
| RF-2.E1 | edge | an additional valid pack with public Markdown and a summary | the site is generated | the pack appears without manually duplicating its documentation prose |
| RF-2.F1 | failure | a catalog pack without a usable documentation target | the site is checked | the missing target is reported rather than publishing a broken catalog link |
| RF-2.S | security | n/a — catalog entries expose already-public pack documentation and do not confer privileges | | |

### RF-3
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-3.H1 | happy | installation and update examples in public Markdown | the visitor opens installation instructions | rendered commands and stated options match the source text |
| RF-3.E1 | edge | a command containing quotes, angle brackets or multiple lines | it is rendered | its characters and line boundaries are preserved |
| RF-3.F1 | failure | a rendered command differing from the source | source fidelity is checked | the mismatch is reported |
| RF-3.S1 | security | an installation command displayed in documentation | the visitor opens the page | the website does not execute that command on the visitor's computer |

### RF-4
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-4.H1 | happy | an edited pack document | the new version is successfully published | its page and searchable text contain the edit without a separately maintained prose copy |
| RF-4.E1 | edge | a new nested skill, agent, template, checklist, reference or notice document | the site is generated | the document is reachable through the documentation hierarchy |
| RF-4.F1 | failure | a previously published document removed from the source | a new version is successfully published | it is absent from navigation and search and its old route no longer serves stale document content |
| RF-4.S | security | n/a — content inclusion boundaries and rendering safety are specified by RF-5/RF-6 | | |

### RF-5
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-5.H1 | happy | internal specs and public pack Markdown in the same repository | the website is generated | only public documentation is included in the documentation/navigation/search corpus |
| RF-5.E1 | edge | an internal spec mentioning a public pack name | that name is searched on the site | the internal spec is not a result |
| RF-5.F1 | failure | a development-tool document placed outside the public documentation sources | the site is generated | it is not accidentally published through broad repository traversal |
| RF-5.S1 | security | a distinctive string present only in an internal specification | generated site and search data are inspected | the internal document and its text are absent; repository visibility itself remains unchanged |

### RF-6
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-6.H1 | happy | Markdown with headings, a list, a table, code and a relative link | its page is rendered | each structure is readable and the link resolves to the corresponding public document or source destination |
| RF-6.E1 | edge | a notice, attribution URL or Spanish compatibility example | its page is rendered | its text and reference destination remain intact |
| RF-6.F1 | failure | a relative document link with no public page or valid source destination | internal links are checked | the unresolved link is reported before publication |
| RF-6.S1 | security | script-like text inside a fenced code example | the page is displayed | the example remains text and does not execute |

### RF-7
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-7.H1 | happy | a nested documentation page | a visitor follows its navigation entry and heading link | the intended page and heading are reached |
| RF-7.E1 | edge | a copied deep document URL under the GitHub Pages project address | the visitor opens or reloads it directly | the same document loads with working site resources and navigation |
| RF-7.F1 | failure | a generated link missing the project's address prefix | public-address link checks run | the invalid destination is reported |
| RF-7.S | security | n/a — URL navigation does not introduce authenticated routes or tenant permissions | | |

### RF-8
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-8.H1 | happy | a document URL that does not exist | the visitor opens it | a not-found state and working recovery link are shown |
| RF-8.E1 | edge | an old URL for a removed document | the visitor opens it after publication | removed content is not shown and the visitor can return to documentation |
| RF-8.F1 | failure | a not-found recovery link targeting a missing page | the site is checked | the invalid recovery destination is reported |
| RF-8.S | security | n/a — public missing-page recovery grants no access to protected data | | |

### RF-9
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-9.H1 | happy | a word occurring in a public document title or body | the visitor searches for it | the matching document appears with a working link |
| RF-9.E1 | edge | the same query with different letter case and surrounding whitespace | the visitor searches | case and surrounding whitespace do not change the matching documents |
| RF-9.F1 | failure | a query absent from all public documents | the visitor searches | an explicit no-results state is shown with no stale prior results |
| RF-9.S1 | security | a query containing script-like characters | the results are shown | the query is treated as text and does not execute |

### RF-10
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-10.H1 | happy | visible results from a prior search | the visitor clears the query | prior results are cleared and documentation remains navigable |
| RF-10.E1 | edge | a whitespace-only query | it is submitted | it behaves as an empty query |
| RF-10.F1 | failure | unavailable or invalid search data | a visitor attempts search | an explicit search-unavailable state appears and document links still work |
| RF-10.S | security | n/a — executable query text is covered by RF-9.S1; search introduces no accounts or permissions | | |

### RF-11
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-11.H1 | happy [manual] | accepted changes reach the primary branch and hosting is enabled | publication finishes successfully | the public GitHub Pages site shows the updated content |
| RF-11.E1 | edge | changes exist only in a feature branch or unmerged pull request | its checks run | it does not replace the published site |
| RF-11.F1 | failure | generation or a required check fails | automatic publication is evaluated | deployment of that version is not attempted |
| RF-11.S1 | security | an unmerged external contribution | its checks run | it cannot publish to the production site |

### RF-12
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-12.H1 | happy | a previously published version and a failed generation/check | publication is evaluated | the previous version remains the publication target and the failure is visible |
| RF-12.E1 | edge | the first publication fails and no previous version exists | the failure is reported | no successful public deployment is claimed |
| RF-12.F1 | failure [manual] | an existing working site and a failed deployment attempt | the public site is opened | the last successfully published version remains available and the failed attempt is identifiable |
| RF-12.S | security | n/a — protection against untrusted production publication is covered by RF-11.S1 | | |

## Out of scope
- Publishing internal specifications, development scripts or the full repository tree as website documentation.
- Separate hand-maintained documentation prose or a multilingual website/translation system.
- Custom domains, accounts, payments, analytics, feedback forms, comment systems or a documentation backend.
- An interactive installer, new packs/skills/agents, installer changes, or migration of other repositories.
- Altering completed change 001's content, accepted verification exceptions or baseline.
- Deploying unmerged feature-branch content to production.

## Completion criteria
- Landing, catalog, installation and full public Markdown documentation meet RF-1–RF-10.
- Every RF has its four scenario types or a justified n/a; all scripted scenarios have identified tests and user-supplied passing results.
- Manual responsive/keyboard behavior is checked in a real browser.
- The published GitHub Pages project address is opened directly, including a nested page, and search/navigation/source fidelity are verified.
- Automatic publication from the primary branch and preservation of the previous version on failure have recorded evidence; configuration alone is not deployment evidence.
- Existing pack identity, installation behavior and global-rule constraints are preserved; website checks are scoped separately from existing toolkit checks.
- No completion or publication claim is made for checks that have not run. Change 001's accepted smoke deferral does not automatically waive this change's website checks.

## Questions and answers
1. Landing/catalog/installation only, or also complete navigable documentation? → User chose complete navigable documentation.
2. Generate documentation from repository Markdown or maintain separate explanatory content? → User chose Markdown as the source.
3. Include internal specs/plans/tasks or only the main README and pack content, including skills and agents? → Recommended excluding internal specifications; user accepted. Public repository access to specs is unaffected.
4. Include a search over all public documentation in the first version? → Recommended including it; user accepted.
5. Automatically update after changes reach the primary branch, preserving the last valid site on failure? → Recommended this behavior; user accepted.
6. Website language? → English, retained from the previously approved agreement in change 001. Technical architecture, visual details and branch configuration are resolved in the plan, not implementation claims here.

## Open questions
- None at product-scope level. Product scope approved on 2026-10-23; clarification recorded below. Technical plan and implementation are not yet approved.


## Clarification — 002-website, round 1 (2026-10-23) · Verdict: ready for plan
1. Ambiguities: no unresolved high/medium findings. Public corpus is defined by source rule, primary-branch name is a planning/configuration concern, and preservation of the old site concerns publication failures rather than a promise of hosting-provider uptime.
2. Conflicting requirements: none identified. Internal specs remain accessible in a public GitHub repository while being absent from site content/search. Generated output is allowed; a second hand-maintained prose copy is not.
3. Missing test scenarios (type without a scenario, unsupported `n/a` reason, uncovered checklist edges): none identified in this pass. All 12 RFs have H/E/F/S rows; case/whitespace/empty/no-results/search-outage, removed/nested pages, base paths, first publication failure and unmerged contributions are covered. Responsive/keyboard and actual publication observations remain manual, not inferred from unit tests.
4. Conflicts with the constitution: none identified for the proposed website-only scope. Installer/global-rule behavior, pack names/self-containment, attribution and no-secrets rules remain protected. This was same-session clarification, not an independent review or runtime verification.
