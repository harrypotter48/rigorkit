# Technical plan — 004-factory-lanes
## Current context
- `packs/architecture/agents/arch-reviewer.md:2` and `packs/architecture/skills/arch-boundaries/SKILL.md:2` use the `arch-` prefix inside the `architecture` pack; every other pack member already carries its pack name (`sdd-`, `frontend-`).
- `packs/sdd/skills/sdd-implement/SKILL.md:11` and `packs/sdd/skills/sdd-verify/SKILL.md:14-15` call the architecture and frontend reviewers by name and pass the diff; `packs/sdd/README.md:44` documents the same in public text.
- `packs/sdd/skills/sdd-triage/SKILL.md:12-14` classifies critical DoD and emits the output table where a review profile can be added.
- `packs/sdd/skills/sdd-tests/SKILL.md:6` already owns the tests-first stage; no test-writing agent exists and none is required by this change.
- `packs/sdd/skills/sdd-init/templates/tasks.md:3-8` holds the resume state; `packs/sdd/skills/sdd-init/templates/half-wired.md:7-9` defines the stable `HW-NN` register for unfinished items.
- `packs/frontend/agents/frontend-reviewer.md:21` and `packs/architecture/agents/arch-reviewer.md:23` define the reviewer report shape with severity and verdict; `packs/sdd/agents/sdd-reviewer.md:15` uses a compliance verdict instead.
- `AGENTS.md:21` states the prefix rule loosely, `:23` requires a top 1% role, `:39` fixes readonly reviewers and the caller-provided diff, `:45` forbids copying third-party skills.
- `tools/measure-content.mjs:140-147` validates the member identity against its folder, `:177` fails on added or removed identities, `:7` limits the reduction target to three packs.
- `site/test/browser.test.mjs:25-26` pins the four published packs; `install.sh:185-217` reads only name, description, readonly and tier.
References describe the inspected pre-change source, not post-edit line positions.
## Structure by layer / module
| Layer / module | Change | RFs covered |
|---|---|---|
| Root governance (`AGENTS.md`, root `README.md`) | Pack-name prefix rule, top 1% role rule, published pack table | RF-1, RF-2 |
| `architecture` pack (members renamed, README) | Member names follow the pack name | RF-1 |
| New `design` pack (README, two references, one reviewer agent) | UX flow criteria, UI criteria with accessibility level, advisory UI reviewer | RF-3–RF-7 |
| New `security` pack (README, one reference, one reviewer agent) | Threat modeling and secure code reference, security reviewer | RF-8, RF-9 |
| SDD skills (triage, implement, verify, archive) | Review profile proposal, parallel reviewer launch with independent inputs, threat model before plan, station state | RF-9, RF-10, RF-13–RF-16 |
| New SDD agents (approver, builder) | Aggregate verdict decision after every reviewer reported; fresh-context block implementation | RF-11, RF-12 |
| Init templates (tasks, half-wired) | Station and accepted-item state with stable identifiers | RF-13 |
| Content measurement tool | Prefix and role validation | RF-2 |
| Website source copy and site tests | Published packs table and pack list in the browser test | RF-1, RF-3, RF-8 |
## Data model
No runtime model. The tasks template gains per-station state and accepted-item identifiers; the half-wired template gains the accepted finding entry shape while keeping `HW-NN` semantics unchanged. Existing installed projects keep their own templates until reinstalled.
## Algorithms
Review profile selection reads the change scope and the constitution, proposes the optional reviewers, and never guesses when the scope cannot be classified. The review station launches the enabled reviewers together after the builder finishes, giving each the same approved references and none of the other reports, so the fan-out stays bounded and the reviewers stay independent. Verdict aggregation runs only after every enabled reviewer has reported, and applies the policy: introduced high findings or missing required evidence produce needs human or failed; interface warnings never block; the decision is reported once with its pending list. Corrections are collected and re-reviewed together, one round per reviewer, and then escalate to the human. Station state is appended to the resume state after each lane, with one entry per reviewer.
## Contracts
Member names are the public contract: `architecture-reviewer`, `architecture-boundaries`, `design-ux-flow`, `design-ui-criteria`, `design-ui-reviewer`, `security-baselines`, `security-reviewer`, `sdd-approver`, `sdd-builder`. Skill and agent folders keep the pack layout and the installer keeps its current fields. Renamed members leave a previously installed copy in place; the change documents the manual removal instead of extending the installer.
## Decisions
- One `design` pack with two references and one reviewer: accessibility and UX are criteria of the same lane, and one agent per lane keeps the installed context small.
- Advisory interface lane: interface findings block only as defects not corrected in the same change, because the owner decided interface quality never blocks by itself.
- Human-produced live evidence: the tool-neutral kit cannot drive a browser, so the reference defines the captures and the human runs them.
- Dynamic review profile at triage, with the constitution able to force reviewers: the profile follows the risk of each change instead of a fixed matrix.
- Approver as an agent that decides but never closes: it aggregates verdicts and names the pending items; the owner keeps the closing gate.
- Reviewers run concurrently after the builder: the dynamic profile bounds the fan-out, each reviewer receives the same approved references without the other reports, and the approver runs last.
- Builder with a fresh context per approved block: implementation separated from the discussion that produced the plan.
- No copy of third-party agents: the profiles are rewritten in the neutral format with the useful criteria only.
- Phase 2 stays outside this change: the `operation` lane, product outcome metrics and a dedicated test-writing agent.
## Constitution
Preserves tool-neutrality, self-contained folders, soft dependencies by name, valid YAML and 300-character descriptions, generic content, reference-don't-copy, context economy, the top 1% role rule and user-run commands. No critical installer or global-rule source is edited; the install critical path is exercised by user-run dry-runs and a temporary-folder installation.
## Test strategy
Manual instruction-following validation for every scenario, as the content check only proves naming and role. The user runs the content measurement tool, the scenario checker, the website checks and the installer dry-runs plus a temporary-folder installation; their output is pending evidence. No automated execution, no claimed savings and no claimed live result.
## Risks and cross-layer
- Renaming the architecture members touches every caller (`sdd-implement`, `sdd-verify`, the SDD README, the architecture README, the root README and the published docs): B1 updates all active producers; archived artifacts keep their historical names.
- The measurement baseline fails on added or removed identities (`tools/measure-content.mjs:177`): the baseline is recaptured by the user after the commit that includes the new names; the step is listed as a pending user action.
- Previously installed copies of the old names survive an update because the installer overwrites without deleting: the change documentation states the manual removal; extending the installer stays out of scope until the user decides.
- An advisory interface lane could hide real defects: the defect classification and the pending register keep unresolved defects visible and blocking.
- The approver could report approved while a required verdict is missing: the aggregation treats a missing required verdict as needs human.
- A parallel fan-out could inflate the token cost of a change: only the reviewers enabled by the approved profile launch, and the profile is decided at triage.
- A reviewer could anchor on another reviewer's findings: the parallel launch gives each reviewer the same references and no other report; only the approver reads all of them.
- The builder could widen scope: it receives only approved references and stops on decisions outside them.
- The new packs increase the installed context: one agent per lane, compact descriptions and a measured baseline keep the cost visible.
- Accessibility level and interface warnings depend on project declarations that may be missing: unknown levels fall back to AA and are reported.
- The sdd loaded-token reduction gate failed before this change (18.95% against a 30% target) and reaches 11.71% with the new stations, 14530 tokens against a 11519 limit: meeting it needs a dedicated compaction change or a baseline refresh, and `tools/capture-baseline.mjs` is pinned to a fixed source commit and refuses overwrite. This change reports the gate instead of weakening it.
