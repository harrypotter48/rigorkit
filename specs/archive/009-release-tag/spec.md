# Spec 009 — Release tag on merge (HU-4)
> Status: delivered 2026-11-12 (v0.2.0 published) · Tier: story · DoD: critical (publishes the version the one-line installer downloads) · Owner repo: rigorkit · Affected repos: rigorkit
> Origin: HU-4 — owner request of 2026-11-12: create the release tag automatically instead of by hand (follow-up of 008-updater, answer 26; resolves HW-01).

## Context and goal
The one-line installer clones the newest `vX.Y.Z` tag (`specs/archive/008-updater/spec.md` RF-1, answer 26), and no tag exists yet (HW-01). Today a release needs the owner to bump `VERSION`, merge, then create and push the tag by hand. This story makes the repository's CI publish `v<VERSION>` on `main` when that tag does not exist yet and the toolkit checks pass, so a release is just a reviewed version bump.

## Users / actors
- The owner, who bumps `VERSION` in a pull request and merges it.
- The repository CI (GitHub Actions) on pushes to `main`.

## User stories
- H1: As the owner, I want a merge that bumps `VERSION` to publish `v<VERSION>` automatically, so that I never tag by hand.

## Acceptance
After a pull request that sets `VERSION` to an unreleased `X.Y.Z` greater than every release tag is merged into `main`, and the toolkit tests pass on that commit, the annotated tag `v<VERSION>` exists on that commit. A push whose Version is already released creates nothing. A malformed or lower unreleased Version, or failing tests, create no tag and fail visibly; after failing tests, a later push with the fix publishes the same Version.

## Invariants
- INV-1: The CI never moves or deletes an existing tag.
- INV-2: The CI never pushes commits to any branch.
- INV-3: Only the tagging job has write access to the repository contents; every other job and the workflow default keep read-only access. The tagging job runs no third-party action and no toolkit test code (answer 9).

## Definitions
- **Release tag**: an annotated git tag `vX.Y.Z` whose message is `rigorkit X.Y.Z`, tagged by `github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>`.
- **Version**: the content of the `VERSION` file at the pushed commit with surrounding whitespace removed; a missing or empty file is not a valid version.
- **Valid version**: `X.Y.Z` where each part is `0` or digits without a leading zero.
- **Remote tags**: the tags of the GitHub repository (`origin`) at the time of the run, read from the remote, not from the checkout (which has none by default).
- **Highest release tag**: the remote tag `vX.Y.Z` (valid version only; any other tag name is ignored) with the highest semantic version (same rule as 008 "Newest release tag").
- **Toolkit tests**: `node --test tools/test/*.test.mjs`, as the existing CI step "Existing toolkit regression" runs them; skipped platform cases (008 D4) do not fail them.
- **Released**: a remote tag `v<Version>` exists, on any commit and of any type.

## Functional requirements (EARS)
- RF-1: WHEN a push to `main` has a valid Version that is not released, greater than the highest release tag (or no release tag exists), and the toolkit tests pass on that commit, THE SYSTEM SHALL create the release tag `v<Version>` on that commit and push it with the workflow's own token (answers 1–4, 6).
- RF-2: WHEN a push targets a branch other than `main`, or the event is a pull request, THE SYSTEM SHALL create no tag and grant no write permission (answer 1).
- RF-3: IF the Version is not a valid version, THEN THE SYSTEM SHALL create no tag and fail the job naming the value (answer 2).
- RF-4: IF the Version is valid, not released and not greater than the highest release tag, THEN THE SYSTEM SHALL create no tag and fail the job naming both versions (answer 2).
- RF-5: IF the toolkit tests fail on the pushed commit, THEN THE SYSTEM SHALL create no tag and fail the run; the tests run in a separate read-only job that the tagging job depends on (answers 2, 9).
- RF-6: WHEN a push to `main` has a released Version, THE SYSTEM SHALL change nothing and succeed, saying the Version is already released (answer 6).
- RF-7: THE SYSTEM SHALL never run two release runs (tests and tagging) at the same time; a pending run may be cancelled by a newer one, whose own run publishes its Version per RF-1 (answer 7).
- RF-8: IF pushing the tag fails, THEN THE SYSTEM SHALL fail the job naming the tag, and every remote tag SHALL still point to the same object as before the run.

## Non-functional requirements
- No new secrets or third-party actions beyond `actions/checkout` and `actions/setup-node` (read-only `test` job only, pinned by SHA); no new npm dependencies; the existing `pages.yml` workflow and its website tests stay unchanged.
- Version content never reaches a shell command as code: it is read as data and validated before any use.
- Credentials (answer 9): the toolkit tests run in a read-only job; the tagging job fetches the pushed commit anonymously with plain git and uses the runner's preinstalled Node, so no action receives its write token; the token reaches only the step that pushes the tag, through `env:`. Actions in the read-only job are pinned by full commit SHA. The tagging job runs `tools/release-tag.mjs` on the runner's preinstalled Node (the script needs Node 18 or later; Node 24 applies to the `test` job).
- Owner precondition (outside the repo, answers 5 and 10): a GitHub tag ruleset on `v*` blocks updating and deleting tags for everyone (personal repositories cannot add GitHub Actions to a bypass list, so creation stays allowed); `main` accepts changes only through pull requests. Residual (answers 8 and 10): anyone with push access, or any workflow with `contents: write`, can create a new `v*` tag; no one can move or delete a published one; today only the owner has push access.
- Constitution: the new workflow joins the critical-path table with the regression "009 tag-logic tests against local git repositories plus the static workflow checks".

## Test scenarios
Tag logic runs against local git repositories with a local bare remote; workflow checks read the workflow file without dependencies; tests live in `tools/test/009-*.test.mjs`. Rows marked `[manual]` need GitHub.
### RF-1
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-1.H1 | happy | remote tags `v0.1.0`; `VERSION` `0.2.0`; no git identity configured | tag logic runs | annotated `v0.2.0` on that commit, message `rigorkit 0.2.0`, tagger `github-actions[bot]`, pushed to the remote |
| RF-1.E1 | edge | remote has no tag; `VERSION` `0.2.0` | runs | `v0.2.0` created |
| RF-1.E2 | edge | a previous run failed its tests at `0.2.0`; a later fix commit keeps `VERSION` `0.2.0` | runs on the fix | `v0.2.0` created on the fix commit |
| RF-1.F1 | failure | checkout has no local tags; remote has `v0.10.0`; `VERSION` `0.9.0` | runs | no tag; fails naming `0.9.0` and `0.10.0` (remote tags are read) |
| RF-1.S1 | security | workflow file | inspect | workflow default `contents: read`; `contents: write` only inside the tagging job; the tagging job has no `uses:`; token is `GITHUB_TOKEN`, once, in the tag-push step's `env:`; no other secret; no branch push; job `test` checkout with `persist-credentials: false`; every `uses:` pinned to a 40-hex commit SHA (INV-2, INV-3) |
| RF-1.S2 | security | workflow file | inspect | no `${{ … }}` expression and no Version value inside `run:` scripts; no `continue-on-error` and no `|| true` on test or tag steps |
| RF-1.S3 | security | workflow file | inspect | job `test` checkout has no `ref:` override; job `tag` fetches exactly `$GITHUB_SHA` from `https://github.com/$GITHUB_REPOSITORY.git` through env vars and passes that URL as `--remote`; both jobs work on the pushed commit |
### RF-2
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-2.H1 | happy | workflow file | inspect | triggers only on `push` with `branches: [main]`; no `pull_request_target`, `workflow_run` or tag-push trigger |
| RF-2.E1 | edge [manual] | push to another branch with an unreleased `VERSION` | CI runs | no tagging run, no tag |
| RF-2.F1 | failure [manual] | pull request with an unreleased `VERSION` | CI runs | no tagging run, no write permission |
| RF-2.S | security | n/a — covered by RF-1.S1 and RF-2.H1 | | |
### RF-3
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-3.H1 | happy | `VERSION` `1.2.3` | runs | accepted |
| RF-3.E1 | edge | `VERSION` `1.2.3` with a trailing newline or spaces | runs | trimmed and accepted |
| RF-3.F1 | failure | `VERSION` `1.2`, `v1.2.3`, `01.2.3`, `1.2.3-rc1`, empty or missing | runs | no tag; fails naming the value (or the missing file) |
| RF-3.S1 | security | `VERSION` `1.2.3; touch x` or `$(touch x)` | runs | no tag; marker `x` absent; fails naming the value |
### RF-4
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-4.H1 | happy | remote tags `v0.9.0`, `v0.10.0`; `VERSION` `0.11.0` | runs | `v0.11.0` created (semantic, not text, order) |
| RF-4.E1 | edge | remote tags `v0.10.0`, `v1.0.0-rc1`, `vfoo`; `VERSION` `0.11.0` | runs | invalid tag names ignored; `v0.11.0` created |
| RF-4.F1 | failure | remote tag `v0.10.0`; `VERSION` `0.9.0` | runs | no tag; fails naming `0.9.0` and `0.10.0` |
| RF-4.S1 | security | existing remote tags | any run | every existing tag still points to the same object (INV-1) |
### RF-5
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-5.H1 | happy | workflow file | inspect | job `test` (read-only) runs the toolkit tests; job `tag` has `needs: test` and runs no tests |
| RF-5.E | edge | n/a — skipped cases already exit 0 in the toolkit tests (008 D4); this story adds no skip handling | | |
| RF-5.F1 | failure | workflow file | inspect | no `continue-on-error`; no `if:` using `always()`, `failure()` or `!cancelled()`, so a failed `test` job skips `tag` |
| RF-5.S | security | n/a — covered by RF-5.F1 | | |
### RF-6
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-6.H1 | happy | remote `v0.2.0` on this commit; `VERSION` `0.2.0` | runs | no change; succeeds saying `0.2.0` is already released |
| RF-6.E1 | edge | remote `v0.2.0` on an earlier commit; a later push keeps `VERSION` `0.2.0` | runs | no change; succeeds |
| RF-6.F1 | failure | remote `v0.2.0` is a lightweight tag | runs | no change; succeeds (released); tag not replaced |
| RF-6.S | security | n/a — covered by RF-4.S1 | | |
### RF-7
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-7.H1 | happy | workflow file | inspect | one fixed workflow-level concurrency group with `cancel-in-progress: false`, so each run's `test` and `tag` stay in push order |
| RF-7.E1 | edge [manual] | two merges bump `0.2.0` then `0.3.0` | both run | each published, or the later one only if the earlier pending run was cancelled |
| RF-7.F1 | failure [manual] | a run starts while another is tagging | runs | waits; never creates the same tag twice |
| RF-7.S | security | n/a — ordering only | | |
### RF-8
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-8.H1 | happy | remote accepts the push | runs | succeeds naming the new tag |
| RF-8.E1 | edge | the tag was created on the remote between the check and the push | runs | push refused; fails naming the tag; every remote tag points to the same object as before |
| RF-8.F1 | failure | remote rejects the push (read-only remote) | runs | fails naming the tag; every remote tag points to the same object as before |
| RF-8.S | security | n/a — covered by RF-4.S1 | | |

## Out of scope
- GitHub Releases, release notes and changelog (answer 3; changelog is HU-2).
- Automatic version bumps or commits from CI (answer 1).
- Personal tokens or GitHub Apps (answers 4, 8).
- Configuring the GitHub rulesets (owner action, answer 5).

## Completion criteria
- Every scenario tested or recorded as manual with live evidence; checker reports none missing.
- Critical DoD: tag logic tested against local git repositories; workflow file checked statically; live evidence: the first release on GitHub after a `VERSION` bump merge, and the one-line installer installing it (resolves HW-01).

## Questions and answers
1. When is the tag created (2026-11-12)? → On a push to `main`, when `v<VERSION>` is not released yet; bumping stays manual (A).
2. What must hold first? → Toolkit tests pass, `VERSION` is `X.Y.Z` and greater than the highest `v*` tag; otherwise no tag and a red job (A).
3. What is published? → An annotated `vX.Y.Z` tag, message `rigorkit X.Y.Z`; no GitHub Release (A).
4. Which credentials? → The workflow's `GITHUB_TOKEN` with `contents: write` only on that job (A).
5. Tag protection? → GitHub ruleset on `v*` allowing only GitHub Actions; owner configures it; `main` only through pull requests (A).
6. A1 how is an unreleased Version detected? → By state: on every push to `main`, publish `v<VERSION>` if it does not exist on the remote; a fix after red tests publishes the same Version (A).
7. A2 several merges close together? → Accept that GitHub cancels a pending run; never two tagging jobs at once; ordering cases are manual evidence (A).
8. A3 ruleset bypass for Actions? → Accepted residual: any workflow with write access can create a tag; only the owner has push access (A).
9. Security review M1/M2 (2026-11-12): write token reachable by actions and test code in one job? → Split: read-only `test` job (actions pinned by SHA) and `tag` job with `needs: test`, plain git fetch, no actions, token only in the push step (A).
10. Ruleset bypass not available for GitHub Actions in a personal repository (2026-11-12)? → Restrict only updates and deletions of `v*`; creation stays open to push access and the workflow (A).

## Open questions
- None.

## Delivery evidence
See `validation.md`: tests, three reviews, security re-review, live `v0.2.0`.
