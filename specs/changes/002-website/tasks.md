# Tasks — 002-website

## Resume state
Stage: T1–T14 complete; all scoped automated checks green, T15 accumulated review in progress. Approvals: spec approved by "go ahead", clarification round 1 ready, technical plan and task/test preparation approved by "go ahead", 2026-10-23. Current task: gather remaining type/unit/regression evidence, then local live review.
Pending/blockers: accumulated final review and public hosting checks remain pending. Local preview, screenshots at 360/1280, keyboard focus and search reviewed; latest browser suite 23/23 and output checker 0 errors. Final user-run log confirms types 0 errors/0 warnings, 15/15 source/workflow tests, 21/21 toolkit tests and coverage of 48 scenarios (3 manual). User-run log confirms 23/23 browser tests passing and final output validation of 47 documents / 50 HTML pages / 0 errors. No public deployment or independent review is claimed. Next step: finish accumulated review before closure; local responsive/keyboard evidence is recorded. Public hosting remains pending.
References: spec RF-1–RF-12; plan D1–D9; site/test/README.md for precise source/browser/workflow contracts. Tests: 38 scripted, 3 manual, 7 approved n/a. No tests/build/install/deploy run by the agent.

## Tasks
All tasks have a maximum 20–30-minute budget; split larger work without expanding scope or renumbering existing IDs. Dependencies guide grouping, not permission to bypass test/approval gates. The user previously requested grouped progress; independent tasks may be prepared together. Every task uses the spec RF/scenarios listed on its line. "Written" never means user-verified.

- [x] T1. Write source/import and output-checker tests. (RF-1, RF-2, RF-3, RF-5, RF-6, RF-7, RF-8) [tests · rigorkit]
      Done when: 10 ID-named tests and fixtures check real CLI contracts; user red output proves missing implementation.
      Depends on: none.
      Read: spec RF/scenarios above; plan D2–D4; Source import and clean generation; site/test/README.md.
      Preserve: No production implementation, no test-only source list or copied expected metadata.
      Verify: site/test/source.test.mjs; missing script guards, source/result assertions.

- [x] T2. Write real production-browser integration tests. (RF-1, RF-2, RF-3, RF-4, RF-5, RF-6, RF-7, RF-8, RF-9, RF-10) [tests · rigorkit]
      Done when: 23 ID-named tests cover actual renderer, deep routes, add/edit/delete, real search and asset failure.
      Depends on: T1.
      Read: spec RF/scenarios above; plan D5/D8; Render, verify and search; browser test contract.
      Preserve: Use real production output and separate generic fixture builds, never mocked search; no manual cases counted green.
      Verify: site/test/browser.test.mjs and run-browser.mjs; first-run missing-artifact red; later actual Chromium output.

- [x] T3. Write actual-workflow publication policy tests. (RF-11, RF-12) [tests · rigorkit]
      Done when: 5 ID-named tests parse actual workflow, evaluate its event/ref/needs guard and inspect error/permission paths.
      Depends on: none.
      Read: spec RF/scenarios above; plan D7; Publication gate; workflow test contract.
      Preserve: No arbitrary workflow eval, no unconnected duplicate policy; hosting observations remain manual.
      Verify: site/test/workflow.test.mjs; user red for missing workflow, not missing YAML imports.

- [x] T4. Establish isolated website and test toolchain. (RF-4, RF-6, RF-7, RF-9, RF-10, RF-11) [site tooling · rigorkit]
      Done when: Compatible Astro/Starlight, Playwright, strict YAML parser and runtime are declared; user installs and produces lockfile/Chromium.
      Depends on: T1, T2, T3.
      Read: spec RF/scenarios above; plan D1/D2/D5/D8; Package contract; official setup references.
      Preserve: Dependencies under site only; never guessed lockfile; user runs install/build/tests; no pack changes.
      Verify: User supplies scoped install/version evidence; first browser build requires actual production code.

- [x] T5. Implement source discovery and catalog manifest. (RF-2, RF-4, RF-5) [content import · rigorkit]
      Done when: Allowlist, source-derived summaries, safe paths, route map and clean owned-subtree generation satisfy fixture contracts.
      Depends on: T4.
      Read: spec RF/scenarios above; plan D2/D3; Data model; Source import steps 1–3.
      Preserve: All public pack Markdown, no specs/tools/site corpus; reject missing targets/collisions; source untouched.
      Verify: Source tests for added pack, missing README, allowlist and sentinel exclusion.

- [x] T6. Adapt metadata and preserve source rendering inputs. (RF-3, RF-6) [content import · rigorkit]
      Done when: Original metadata becomes safe display data; headings/code blocks are recorded without lost source text.
      Depends on: T5.
      Read: spec RF/scenarios above; plan D3/D4; Data model; Source import step 4.
      Preserve: No hand-edited duplicate prose or source schema edits; preserve notices, aliases, code whitespace.
      Verify: Source fidelity checks plus real renderer tests after site foundation.

- [x] T7. Implement source-aware links and heading mapping. (RF-6, RF-7) [content links · rigorkit]
      Done when: Public links/fragments map through manifest; existing non-public targets link to source; broken targets are actionable errors.
      Depends on: T5, T6.
      Read: spec RF/scenarios above; plan D4; Source import steps 5–6; route examples.
      Preserve: No substitutions inside code; shared base helper; no silent dropped docs or flattened collision-prone names.
      Verify: RF-6.F1 source test; later deep-route/anchor/browser cases.

- [x] T8. Configure Starlight content, base paths and documentation shell. (RF-4, RF-6, RF-7) [site presentation · rigorkit]
      Done when: Actual generated docs load under /rigorkit with heading anchors, usable sidebar and preserved metadata/code.
      Depends on: T4, T6, T7.
      Read: spec RF/scenarios above; plan D1/D2/D6; Contracts; render/search boundaries.
      Preserve: Astro/Starlight conventions, source fidelity, generated-only cleanup; no fabricated domain layers.
      Verify: User production build and browser routes/rendering; no dev-only search evidence.

- [x] T9. Build landing and source-derived pack catalog. (RF-1, RF-2, RF-3) [site presentation · rigorkit]
      Done when: English landing and catalog expose purpose/tools/destinations and source summaries with exact working links.
      Depends on: T5, T8.
      Read: spec RF/scenarios above; plan D6; discovery RFs; README purpose/catalog/install source.
      Preserve: No installer wizard; installation links use original README section; no repeated manual catalog prose.
      Verify: RF-1.H1/RF-2.H1/RF-3.H1 browser cases and invalid-link gate.

- [x] T10. Implement missing-page recovery and responsive reading. (RF-1, RF-7, RF-8) [site presentation · rigorkit]
      Done when: Unknown/removed static URLs recover to home/docs under project prefix; mobile/keyboard layout is operable.
      Depends on: T8, T9.
      Read: spec RF/scenarios above; plan D6; NFR keyboard/responsive; unknown route contract.
      Preserve: No SPA-only fallback serving stale content; visible focus and labels; wide blocks scroll locally.
      Verify: RF-8 browser/checker cases; RF-1.E1 and NFR widths require later real-browser observations.

- [x] T11. Integrate Pagefind and required search failure states. (RF-4, RF-5, RF-9, RF-10) [search integration · rigorkit]
      Done when: Actual public pages are indexed; case/whitespace/no-results/empty states and blocked search assets behave as specified.
      Depends on: T8, T10.
      Read: spec RF/scenarios above; plan D5/D8; Render, verify and search; browser contract.
      Preserve: No second search engine/account; document reading/navigation independent; query text never executable.
      Verify: All RF-9/RF-10 browser cases plus edited/removed/internal corpus cases.

- [x] T12. Implement output/link/source-fidelity publication checks. (RF-1, RF-2, RF-3, RF-5, RF-6, RF-7, RF-8, RF-11, RF-12) [build validation · rigorkit]
      Done when: Built HTML validation detects missing targets/base/recovery/anchors and corrupt code blocks before upload.
      Depends on: T5, T7, T10.
      Read: spec RF/scenarios above; plan D4/D8; check CLI contract; output fixtures.
      Preserve: Validate actual source manifest and real built output; explanatory diagnostics; no external availability as a per-build dependency.
      Verify: 10 source/checker tests plus user positive check on actual production build.

- [x] T13. Create primary-branch-only Pages workflow. (RF-11, RF-12) [publication · rigorkit]
      Done when: Readonly build/test/check job feeds only checked normal output to restricted deploy job; PRs cannot deploy.
      Depends on: T3, T4, T9, T11, T12.
      Read: spec RF/scenarios above; plan D7; Publication gate; GitHub primary-branch prerequisite.
      Preserve: Confirm actual default branch before enabling; no PR-target privileged event, no force-push/deletion, no destructive failure exercise.
      Verify: 5 actual-workflow tests; job gates/permissions/concurrency; no live deployment claim.

- [x] T14. Document website commands and generated boundaries. (RF-3, RF-4, RF-11, RF-12) [repository docs · rigorkit]
      Done when: AGENTS/layout, site maintenance commands, ignores and Pages setup instructions reflect actual implemented workflow.
      Depends on: T4, T13.
      Read: spec RF/scenarios above; plan D2/D9; Current context; Package/source contracts.
      Preserve: No archived 001 edits, installer/global-rule changes or accidental committed generated artifacts; no false live URL claim.
      Verify: Review diff/new files and source paths; existing toolkit evidence reused only if unchanged.

- [ ] T15. Integrate scripted coverage and review accumulated change. (RF-1, RF-2, RF-3, RF-4, RF-5, RF-6, RF-7, RF-8, RF-9, RF-10, RF-11, RF-12) [verification · rigorkit]
      Done when: User supplies passing scoped type/build/38 scenario results and coverage with no missing tests; fixes reviewed within scope.
      Depends on: T1, T2, T3, T8, T9, T10, T11, T12, T13, T14.
      Read: spec RF/scenarios above; plan D8/D9; full spec/plan/diff; test contract.
      Preserve: No changing assertions to hide introduced defects, unit-only publication claims, extra scope or agent-run commands.
      Verify: Check actual importer/renderer/search/workflow boundaries and all new files; independent review availability recorded honestly.

- [x] T16. Observe local responsive and keyboard behavior. (RF-1, RF-7, RF-8, RF-9, RF-10) [live verification · rigorkit]
      Done when: Real preview at 360/1280 widths shows usable reading/nav/search/focus and direct nested reloads.
      Depends on: T15.
      Read: spec RF/scenarios above; plan NFRs; RF-1.E1; production browser preview.
      Preserve: User starts preview; actual browser evidence, no string search substituting for observations.
      Verify: RF-1.E1 plus keyboard, visible focus, internal code/table overflow and search outage.

- [ ] T17. Verify actual public publication and deep URLs. (RF-7, RF-9, RF-11) [hosting verification · rigorkit]
      Done when: User confirms Pages settings/primary branch, publishes accepted change and provides Actions/public address evidence.
      Depends on: T15, T16.
      Read: spec RF/scenarios above; plan RF-11.H1; publication evidence contract.
      Preserve: No agent push/merge/settings change; no claiming URL live before opening it; feature branch never auto-deploys.
      Verify: Open real home/nested URL directly, search/navigation/source fidelity and primary-branch workflow result.

- [ ] T18. Observe previous site after a safe failed publication. (RF-12) [hosting verification · rigorkit]
      Done when: Actual recorded failed attempt leaves prior successful public content available.
      Depends on: T17.
      Read: spec RF/scenarios above; plan RF-12.F1; Publication gate; provider-safe failure procedure.
      Preserve: Agree non-destructive provider-safe procedure; do not break production to force a scenario; no fake smoke PASS.
      Verify: Record attempt/run status and unchanged publicly observed prior version, or keep this scenario pending.

- [ ] T19. Integrate validation and request final closure. (RF-1, RF-2, RF-3, RF-4, RF-5, RF-6, RF-7, RF-8, RF-9, RF-10, RF-11, RF-12) [sdd verification · rigorkit]
      Done when: All 48 scenarios have valid pass/n-a/manual evidence or explicit outstanding status; user receives accurate verdict.
      Depends on: T15, T16, T17, T18.
      Read: spec RF/scenarios above; plan Full spec/plan/tasks/diff and validation template.
      Preserve: Original completion criteria, review limits and explicit deployment evidence; no inherited 001 smoke waiver.
      Verify: User alone closes/archives; no chained commits, push/merge or vault writes.

References guide reading; expand to all actual writers/readers/boundaries before edits. One commit needs explicit approval; never chain commits, push or merge.
