# Documentation validation — Factory follow-up
Date: 2026-10-28 · Status: documentation implemented; full change 006 remains pending.

## Scope
English root/pack READMEs, repository instructions, website source copy, agreed RF-17 execution boundary, practical examples and an embedded before/after image. Existing staged/unstaged Factory v2 skill/template work was preserved. This follow-up did not implement the draft frozen-test/branch-trace/tier automation or migrate installed skills.

## Evidence
| Check | Result |
|---|---|
| `git diff --check` | Pass: no whitespace errors |
| `node --test tools/test/*.test.mjs` | Pass, exit 0; executed through the existing test-summary helper |
| `node --test --test-reporter=spec test/source.test.mjs test/workflow.test.mjs` in site/ | Pass, exit 0; executed through test-summary |
| `node site/scripts/prepare-docs.mjs --output <fresh temporary directory>` | Pass: 59 source documents, 6 packs; actual links/image source resolved, internal specs/tools excluded |
| `node tools/measure-content.mjs --root . --baseline specs/archive/005-content-ratchet/baseline.txt` | Fail: added sdd-slice identity and SDD 15,800 vs 14,530 estimated loaded tokens (+8.74%) |
| README image | Generated using the built-in image tool, visually inspected, copied into site/public/images/factory-before-after.png; relative Markdown image reference added |

The loaded-entry ratchet covers skills/agents and their auxiliary Markdown, not root/pack README prose or the new pack-root examples page. The loaded skill/template edits and new sdd-slice were already present when this follow-up began; no baseline was changed or relaxed. Static token counts do not measure real session savings. The image illustrates the agreed workflow, not a performance benchmark or evidence that pending enforcement exists.

## Unrun / pending
- The illustrative CommonJS/Jest snippets were reviewed against the Jest matcher documentation; no Jest dependency was installed and they are not executed adoption/integration evidence.
- No browser, Docker or e2e was run. Website build/typecheck/rendered preview and public GitHub/Pages rendering remain unverified, per the execution boundary.
- GitHub displays the repository-relative PNG; the existing importer maps it to a raw GitHub source URL. The new image becomes remotely available when the owner publishes the asset and Markdown together.
- Required live behavior and cross-repo evidence for actual product slices remain separate from source documentation validation.
- No install, build, lint, typecheck, migration, seed, deployment, push or merge was performed. The owner subsequently requested one local commit of the current work; full Factory v2 implementation and validation remain pending.

## Sources
Local README, pack docs/agents, current draft 006 and the owner agreements in this session. Jest matchers: https://jestjs.io/docs/using-matchers . Image-generation prompt: site/public/images/factory-before-after.prompt.txt .
