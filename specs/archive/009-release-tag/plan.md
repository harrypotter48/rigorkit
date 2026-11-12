# Technical plan — 009-release-tag (HU-4 Release tag on merge)
Date: 2026-11-12 · Status: approved by the owner on 2026-11-12. Inputs: `spec.md` (RF-1–RF-8, INV-1–3; clarify round 3 ready, owner approved), `clarification.md` round-3 lows C1–C6 and the C3 choice (bump to 0.2.0).

## Current context
- CI: `.github/workflows/pages.yml` runs on every push/PR; its "Existing toolkit regression" step runs `node --test ../tools/test/*.test.mjs` (`pages.yml:46-47`); `site/test/helpers.mjs:122-124` reads only `pages.yml`.
- `VERSION` = `0.1.0`, no remote tags (`git ls-remote --tags --refs` on the public repo returns nothing, anonymous read works).
- 008 installer resolves the newest valid `vX.Y.Z` with numeric sort (`tools/install-remote.sh` `resolve_ref`); the same rule is reused here in JS.

## Structure
| File | Responsibility | RF |
|---|---|---|
| `tools/release-tag.mjs` (new, Node, no deps) | Read/validate Version; read remote tags (`git ls-remote --tags --refs -- <remote>`, anonymous); decide released / lower / publish; create annotated tag with the bot identity; push only `refs/tags/v<V>` | RF-1, 3, 4, 6, 8; INV-1, 2 |
| `.github/workflows/release-tag.yml` (new; amended by answer 9) | Trigger `push` on `main`; default `contents: read`; workflow-level concurrency `release-tag` without cancel-in-progress. Job `test` (read-only, `ubuntu-latest`): checkout and setup-node pinned by commit SHA (`persist-credentials: false`, no `ref:`), Node 24, toolkit tests. Job `tag` (`needs: test`, `contents: write`, `ubuntu-latest`, no `uses:`): `git init` + anonymous `git fetch --depth 1` of `$GITHUB_SHA` from `https://github.com/$GITHUB_REPOSITORY.git` + checkout `FETCH_HEAD`; then `node tools/release-tag.mjs --remote https://github.com/$GITHUB_REPOSITORY.git` with the token only in that step's `env:` | RF-1, 2, 5, 7; INV-3 |
| `tools/test/009-release-tag.test.mjs` (new) | Logic against local repos + bare remote; dependency-free static checks of the workflow | all |
| `VERSION` | `0.2.0` (C3) | first release |
| `README.md`, `AGENTS.md`, `specs/constitution.md` | Version line, release process (bump `VERSION` in a PR), critical-path row | NFR |

## Algorithm — `tools/release-tag.mjs`
```
args: [--root <dir>] [--remote <url|path>]   (defaults: cwd, origin's URL)
v = read VERSION (missing/empty -> fail "VERSION missing or empty"); trim
valid(v) = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/ else fail "invalid version: <v>"          RF-3
tags = git ls-remote --tags --refs -- <remote> (GIT_TERMINAL_PROMPT=0, no credentials)             C4
names = refs/tags/v<x> with valid(x)                                                               (invalid names ignored)
if names has v -> print "rigorkit <v> is already released"; exit 0                                 RF-6
highest = max(names, numeric compare); if highest and v <= highest -> fail "version <v> is not greater than <highest>"   RF-4
git -c user.name='github-actions[bot]' -c user.email='41898282+github-actions[bot]@users.noreply.github.com' tag -a v<v> -m "rigorkit <v>" HEAD
push = git push <pushTarget> refs/tags/v<v>   (no --force; pushTarget = remote; when RK_PUSH_TOKEN is set, auth via
       -c http.extraheader="AUTHORIZATION: basic base64(x-access-token:<token>)"; token never on argv of logs)   RF-1, RF-8
push fails -> fail "cannot push tag v<v>: <git stderr>"                                            RF-8
print "published v<v>"
```
All git calls use `execFileSync` with argument arrays (no shell): Version text is never parsed by a shell (RF-3.S1). The script never runs `git commit`, `git push` of a branch, `--force` or `tag -d/-f` (INV-1, INV-2).

## Decisions (derived from spec; no new technical choice)
- D1 Logic in a Node script (repo tool runtime, testable with local git) rather than inline shell in YAML; keeps `run:` free of expressions (RF-1.S2).
- D2 Anonymous `ls-remote` for tags (public repo, C4); token only for the push step through `env:` + `http.extraheader` (same mechanism `actions/checkout` uses); `persist-credentials: false` (B3).
- D3 (amended, answer 9) Tests in a read-only job, tag in a job that `needs` it and runs no action or test code; C1: RF-6 is reached only after `test` passed. Token never in the remote URL, argv or log: `GIT_CONFIG_COUNT/KEY/VALUE` env header, masked and redacted (E3). The tag job uses the runner's preinstalled Node (script needs >= 18).
- D4 Static checks parse the YAML as text lines (no `yaml` dependency, A8).
- Rejected: `actions/github-script` / third-party tag actions (NFR), tag in `pages.yml` (must stay unchanged), PAT (answer 4).

## Contracts
- CLI: exit 0 = published or already released; exit 1 = refusal/failure, message on stderr naming the value/tag.
- Workflow: name `Release tag`; `on: push: branches: [main]`; top-level `permissions: contents: read`; job `tag`: `permissions: contents: write`, `concurrency: { group: release-tag, cancel-in-progress: false }`.

## Test strategy (`tools/test/009-release-tag.test.mjs`, header contains `009-release-tag`)
- Fixture: temp dir with a bare remote and a work clone (`GIT_CONFIG_GLOBAL=/dev/null`, no identity for RF-1.H1), helper to add remote tags (annotated/lightweight, on other commits), run the script with `--remote <bare>`.
- Logic: RF-1.H1/E1/E2/F1, RF-3.*, RF-4.*, RF-6.*, RF-8.H1/E1 (race: pre-create the tag on the bare remote after the read by a git wrapper on PATH, or push it from another clone between ls-remote and push via a stub), RF-8.F1 (read-only bare remote: `chmod -w` refs, non-root guard), INV-1 (snapshot of `git ls-remote` before/after: pre-existing tags unchanged, C2).
- Static: RF-1.S1/S2/S3, RF-2.H1, RF-5.H1/F1, RF-7.H1, C5 (every `git push` in the script pushes only `refs/tags/`; no `commit`), C6/E1/E2 (only `actions/checkout` and `actions/setup-node`, pinned by 40-hex SHA, in job `test`; Node 24 there; `runs-on: ubuntu-latest` for both jobs).
- Manual (GitHub): RF-2.E1, RF-2.F1, RF-7.E1, RF-7.F1; live: merge of this change publishes `v0.2.0`; the one-line installer installs it (HW-01).
- Existing suites stay green; `pages.yml` untouched (`git diff` check).

## Risks
| Risk | Check |
|---|---|
| Token leak in logs | token only in `env:` of the push step; extraheader, never in a URL or argv echo; static test |
| Tests pass locally with a git identity, fail on the runner | RF-1.H1 runs with an empty config |
| Ruleset missing → anyone pushes tags | owner precondition before merge (answer 5) |
| A merged PR without bump | RF-6: already released, green |

## Constitution
New critical-path row for `.github/workflows/release-tag.yml` + `tools/release-tag.mjs`: "009 tag-logic tests against local git repositories plus the static workflow checks". Violations: none.

## Review profile
sdd-reviewer + architecture-reviewer (required) + security-reviewer (credentials, CI permissions, input parsing).
