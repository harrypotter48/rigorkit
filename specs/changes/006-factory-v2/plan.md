# Technical plan — 006-factory-v2
## Current context
- The stage flow lives in the pack `sdd`: `packs/sdd/skills/sdd-triage/SKILL.md` classifies the request and picks the review profile (`packs/sdd/skills/sdd-triage/SKILL.md:9`, `packs/sdd/skills/sdd-triage/SKILL.md:13`).
- The tests stage is `packs/sdd/skills/sdd-tests/SKILL.md`; it writes the tests of the approved block and currently ends with "Await user evidence/approval, never invent red or execute tests" (`packs/sdd/skills/sdd-tests/SKILL.md:14`), and it forbids implementing anything (`packs/sdd/skills/sdd-tests/SKILL.md:8`).
- The build stage is `packs/sdd/skills/sdd-implement/SKILL.md`; it already forbids editing tests ("No test edits; needed change => stop for sdd-change", `packs/sdd/skills/sdd-implement/SKILL.md:9`), asks the owner to execute the checks (`packs/sdd/skills/sdd-implement/SKILL.md:10`) and launches the enabled reviewers together (`packs/sdd/skills/sdd-implement/SKILL.md:11`).
- The delegated builder is `packs/sdd/agents/sdd-builder.md`; it must not edit tests unless the block says so (`packs/sdd/agents/sdd-builder.md:11`) and never claims green tests (`packs/sdd/agents/sdd-builder.md:12`).
- The verification stage is `packs/sdd/skills/sdd-verify/SKILL.md`; it launches the reviewers together (`packs/sdd/skills/sdd-verify/SKILL.md:15`) and records the suites the owner ran (`packs/sdd/skills/sdd-verify/SKILL.md:17`).
- Every stage ends with the same footer that forbids the agent to run install, build, lint, typecheck, tests, migrations, seeds or deploy (`packs/sdd/skills/sdd-triage/SKILL.md:17`, and the same line in the other fourteen skills of the pack).
- The repository templates are `specs/templates/spec.md` (header with the DoD at `specs/templates/spec.md:2`, scenarios at `specs/templates/spec.md:17`, completion criteria at `specs/templates/spec.md:28`) and `specs/templates/constitution.md` (critical paths at `specs/templates/constitution.md:11`).
- The scripts of the toolkit live in `tools/` with their tests in `tools/test/`: `tools/measure-content.mjs` exports `measureRepository` (`tools/measure-content.mjs:57`) and `tools/capture-baseline.mjs` writes the baselines; both are dependency-free Node scripts.
- The public documentation of the pack is `packs/sdd/README.md` (lane at `packs/sdd/README.md:4`, review stations at `packs/sdd/README.md:48`) and the root `AGENTS.md` documents the ratchet of change 005 (`AGENTS.md:57`).
- The site copies the pack documentation with `site/scripts/prepare-docs.mjs`; the pack members keep their names, so the installed copies keep working.
## Structure by layer / module
| Layer / module | Change | RFs covered |
|---|---|---|
| `packs/sdd/skills/sdd-slice/SKILL.md` | New entry stage that proposes the vertical slices and keeps the flat backlog | RF-1, RF-2, RF-3 |
| `specs/templates/backlog.md` | New template of the backlog index with the fields of an entry | RF-1, RF-2 |
| `packs/sdd/skills/sdd-triage/SKILL.md` | Tier classification and tier-aware review profile with the threshold trigger | RF-12, RF-14 |
| `packs/sdd/skills/sdd-tests/SKILL.md` | Red commit convention, behavioral red, amend rule and the unit-test run | RF-4, RF-5, RF-6, RF-7, RF-17 |
| `packs/sdd/skills/sdd-implement/SKILL.md` | Green commit convention, minimality, machine checks before the reviewers | RF-6, RF-10, RF-15, RF-16, RF-17 |
| `packs/sdd/agents/sdd-builder.md` | No test edits, minimality and no claimed green without the run | RF-6, RF-15, RF-16, RF-17 |
| `packs/sdd/skills/sdd-verify/SKILL.md` | Tier-aware verification set and the record of what did not run | RF-13, RF-14, RF-17 |
| `tools/check-frozen-tests.mjs` | New script that reads the test paths of the constitution and fails on an unamended modification | RF-6, RF-8 |
| `tools/check-branch-trace.mjs` | New script that reports the added branch points without a scenario or invariant reference | RF-9, RF-15 |
| `tools/test/check-frozen-tests.test.mjs` | Executable coverage of the frozen-test check | RF-8 |
| `tools/test/check-branch-trace.test.mjs` | Executable coverage of the branch-trace check | RF-9 |
| `specs/templates/constitution.md` | New fields: test paths and review threshold, with the defaults | RF-8, RF-12 |
| `specs/templates/spec.md` | Acceptance and invariants sections, tier in the header | RF-3, RF-14 |
| `packs/sdd/README.md`, `AGENTS.md` | Documentation of the new stages, the conventions and the command split | RF-18 |
## Data model
The backlog is a markdown index with one entry per story, without a separate data file:

```markdown
## Stories
| ID | Title | Why (value) | Feature | Size | Depends on | Status | Change |
|---|---|---|---|---|---|---|---|
| HU-3 | Create project | The owner can register a project and see it | project management | S | — | next | — |
```

- The status values are `backlog`, `ready`, `next`, `wip` and `done`; at most one entry is `next` and at most one is `wip`.
- The `Change` column holds the link to the change of `specs/changes/` once the story is selected.
- No migration: the backlog is a new file created empty by the template.

The constitution gains two sections:

```markdown
## Test paths (frozen tests)
<!-- Patterns of the files that the red commit freezes. -->
- `src/**/*.test.ts`

## Review thresholds
- review-lines: 150
```

## Algorithms
**Frozen-test check** (`tools/check-frozen-tests.mjs`):
1. Read the test paths of `specs/constitution.md`; when the section is absent, report that the repository does not declare them and exit 1.
2. Find the last commit of the branch whose message starts with `test(red):`; when there is none, report that the change has no frozen red and exit 1.
3. List the files changed between that commit and `HEAD` (plus the working tree) and keep the ones that match a test path.
4. For each of them, read the commit that changed it; when that commit starts with `test(amend):`, report it as amended; otherwise report it as a violation and exit 1.
5. Exit 0 with the summary of the amended paths when no violation exists.

**Branch-trace check** (`tools/check-branch-trace.mjs`):
1. Read the diff of the change against the base commit.
2. For every added line that opens a branch (`if`, `else if`, `switch`, `case`, `catch`, `&&`, `||`, `??`, ternary), look for a scenario reference (`RF-n.Xk`) or an invariant marker in the same hunk.
3. Report every branch without a reference with its location and exit 1; otherwise exit 0.

**Tier classification** (in the triage skill, not in a script): the agent proposes the tier and the owner confirms it. `trivial` has no observable behavior change, `story` is one vertical slice with its own contract, `feature` groups several stories.
## Contracts
- Backlog entry fields: id, title, why, feature, size, dependencies, status, change link.
- Commit messages: `test(red): <HU> <title>`, `test(green): <HU> <title>`, `test(amend): <HU> <reason>`, `refactor: <HU> <reason>`. Every commit that touches a test path carries the prefix `test(`.
- Constitution fields: `Test paths` (list of patterns) and `Review thresholds` (`review-lines`, default 150).
- Command split: the agent runs the unit tests of the affected module; the owner runs install, build, lint, typecheck, migrations, seeds, deploy and the container, browser and end-to-end suites.
## Decisions
- Vertical slice over CRUD decomposition: the unit of work must produce an observable result, otherwise the cycle has no feedback.
- The backlog in git over an external tracker: the repository is the source of truth and the tracker becomes a mirror.
- The specification as the navigator over continuous pair programming: the owner decides at three gates instead of at every step.
- The frozen tests over a review of the diff: a machine check is cheaper and more reliable than a reviewer looking for a modified test.
- The machine checks before the reviewers over the reverse order: the deterministic failures are found before the probabilistic ones are paid for.
- Two lenses in the base profile over one reviewer with three lenses: a reviewer with a single lens reviews deeper.
- The threshold in the constitution over a fixed value in the toolkit: 150 lines is a default without data and each repository measures its own.
- The agent running the unit tests over the owner running everything: the TDD loop needs the result of the test to continue.
## Constitution
No violation: the change adds stages and tools inside the existing pack and keeps the member names, the installer, the version file and the content measurement untouched. The rule that the agent does not run commands is narrowed by an explicit owner decision of 2026-10-26 to the unit tests of the affected module, and the rest of the footer stays.
## Test strategy
- `tools/check-frozen-tests.mjs`: unit tests in `tools/test/check-frozen-tests.test.mjs` with a temporary repository and a temporary constitution: no red commit, a clean diff, an amended path and a violation. Each test names the scenario id of RF-8.
- `tools/check-branch-trace.mjs`: unit tests in `tools/test/check-branch-trace.test.mjs` with a fixture diff: a branch with a scenario reference, a branch with an invariant marker and a branch without any. Each test names the scenario id of RF-9.
- The stages of the pack are instruction-following validation: their scenarios stay `[manual]` and are exercised by the first adopting repository.
- The content measurement keeps its own tests; the new members of the pack must stay inside the ratchet of change 005, which means the pack may not grow without a new baseline.
## Risks and cross-layer
- The pack `sdd` grows with the new stage, the new rules and the new documentation, and the ratchet of change 005 does not allow growth without a new baseline. Risk: the content check turns red after the implementation. Mitigation: the implementation measures the pack after every block with `node tools/measure-content.mjs --root . --baseline specs/archive/005-content-ratchet/baseline.txt` and proposes a new baseline to the owner, as the ratchet requires. Check: the content measurement in the validation of the change.
- The footer that forbids the agent to run commands appears in fourteen skills of the pack and only three of them change. Risk: two stages of the same pack disagree about who runs the unit tests. Mitigation: the change edits the three stages that need the result (`sdd-tests`, `sdd-implement`, `sdd-verify`) and states the split in `packs/sdd/README.md` and in the root `AGENTS.md`. Check: reading of the three stages in the review of the block.
- The `sdd-slice` stage writes to `specs/backlog.md`, a file that the other stages never read. Risk: the backlog and the changes drift apart. Mitigation: the entry of a selected story holds the link to its change and the status moves to `done` when the change is archived. Check: the manual scenario RF-3.H1 of the first adoption.
- The branch-trace check reads a diff and looks for references in the hunk. Risk: false positives on a branch whose scenario reference is in the previous line or in the commit message. Mitigation: the check reports the location and the reviewer or the owner confirms; the reference may sit in the same hunk or in the line above. Check: the unit tests of the check with the three fixtures.
- The site copies the documentation of the pack. Risk: the published site describes the old ceremony while the pack describes the new one. Mitigation: the documentation block regenerates the site content with `npm --prefix site run prepare:docs` and the site checks run. Check: the site check in the validation.
