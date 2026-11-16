# Implementation evidence — 021-terminal-colors B1
> Updated: 2026-11-16 · Status: scoped suite green; critical regressions, machine results, manual evidence and independent review pending.

## Authority and immutable boundary
- Owner approved the red commit, freezing the four test files and autonomous B1 implementation on 2026-11-15.
- Base: `a812f2eefce1765eca00f98e84fe2fa4e03aeec8`.
- Approved red: `8d29670e69b88ffbbb91f72ce4a85fa5c8c84b17` (`test(red): 021-terminal-colors preserve plain bytes and style terminal output`).
- Frozen paths: `tools/test/021-terminal-colors.test.mjs`, `tools/test/021-terminal-colors-fixture.mjs`, `tools/test/021-pty-run.py`, `tools/test/fixtures/021-terminal-colors/plain.json`.
- Tests have not been edited during implementation. Exact red/index/worktree hashes are recorded in `freeze.md`.

## Approved integrity exception
Readonly inspection of `packs/sdd/skills/sdd-init/scripts/factory-checks.mjs:26–31,50–63` shows that the frozen-test checker requires a `Test paths` section in the red commit's constitution. That constitution has no such section. The checker was not run and is not reported as passing.

The owner explicitly approved a change-local exception on 2026-11-15: compare the four exact frozen files with the approved red, in both the index and the working tree. This does not change the checker, constitution or frozen red. The exact comparison is performed and recorded in `freeze.md`; future edits invalidate it. Required branch-trace, scenarios, behavioral/regression and manual checks remain separate pending gates. No process setup is included in B1.

## RF to production consumers and current evidence
| RF / invariant | Implementation | Evidence / pending |
|---|---|---|
| RF-1, RF-2 | `lib/output.sh:5` checks its final stdout destination with non-empty NO_COLOR and TERM=dumb opt-outs; callers redirect the final writer to stderr when appropriate | New frozen suite covers split destinations and opt-outs; green run pending |
| RF-3 | `lib/output.sh:13,31,56,64` fixed semantic spans and explicit diff/help/changelog adapters; producer roles in entry point, installer, updater, scan, doctor and CLI notices | Own combined source diff reviewed; palette/neutral-context live evidence and green run pending |
| RF-4 / INV-1, INV-2 | Existing formatters, print_safe, artifact writers, record/fingerprint helpers and script exec preserved; only root help gains the approved single note | Fixed references and side-effect assertions are frozen; green and legacy integration pending |
| RF-5 | `lib/output.sh:13` resets after spans; update strips its original sanitizer newline before presentation; scan preserves its original space+newline prompt | Reset/input assertions frozen; green and live typed-answer check pending |
| RF-6 | `bin/rigorkit` retains direct script exec, unchanged args and status; no transcript wrapper or new environment exports | Four script-ownership scenarios frozen; green run pending |
| RF-7 / INV-3 | `lib/common.sh:24` styles only after unchanged safe printing; update diffs/changelog and scan one-line output use their existing filters | Untrusted ANSI/OSC/C0/C1 and Unicode assertions frozen; green and security review pending |
| INV-4 | No style adapter on installed templates, fingerprints, records, manual-paste rules or agent notice writes; only notice `--run` display is styled | Artifact/notice assertions frozen; green and legacy record/notice regressions pending |

## Source work prepared
- Added `lib/output.sh`, sourced POSIX presentation functions with no output or exported state during sourcing. Production has no Python dependency.
- Integrated semantic display in `bin/rigorkit`, `install.sh`, `lib/common.sh`, `lib/update.sh`, `lib/scan.sh`, `lib/doctor.sh` and `lib/notice.sh`. Project update headings use cyan while their choice markers stay yellow.
- Displayed unified diffs track real hunk counts rather than coloring arbitrary plus/minus paths or file headers. All four existing updater display pipelines and the installer's dry-run diff use the adapter.
- Updater presentation is loaded from executing CODE; staged release data is never sourced during dry-run. Real release re-exec remains unchanged.
- README, core README and the approved root-help note are written. Other help source text is unchanged. Generated manual still requires the owner-run generator before documentation is complete.
- No VERSION bump, green commit, push, merge or 021 closure has been performed.

## Checks and review state
- Agent read-only `git diff --check`: passed with no output before handoff.
- Agent checked frozen file differences against red in both index and working tree: no differences; exact byte hashes recorded in `freeze.md` under the approved exception.
- Agent reviewed the combined current production diff and the new helper's authored content against approved roles, writer ownership, safe-print ordering and red/phase-2 contracts. This is author review, not an independent verdict.
- Owner-run green/scoped regressions, strict scenarios after implementation, branch trace, manual generation/drift, critical install dry-runs and live terminal scenarios: pending. No tests, generators, syntax/lint checks or production commands were run by the agent.
- Independent SDD, architecture and security reviewers: pending applicable owner-run machine evidence. No independent reviewer has been dispatched or claimed green.

## Immediate owner-run validation
```sh
node tools/generate-man.mjs
node --test tools/test/021-terminal-colors.test.mjs > /tmp/rigorkit-021-tests.log 2>&1
node tools/check-branch-trace.mjs --base a812f2eefce1765eca00f98e84fe2fa4e03aeec8
node tools/generate-man.mjs --check
```

Then retain the current strict scenario check and scoped legacy/critical suites from `plan.md`. The explicit integrity exception replaces only the unusable frozen checker, not any other evidence. Inspect owner logs before choosing corrective work; keep the frozen test boundary unchanged.

## Next gate
Read the owner-run new-suite log and machine results, fix introduced in-scope defects without changing frozen tests, then collect the remaining critical/regression/live evidence and required independent reviews. Propose a green commit only after current green evidence and owner approval. B1 is not accepted or complete at this handoff.


## First owner-run implementation suite — 2026-11-15
- Agent reviewed owner log `/tmp/rigorkit-021-tests.log`, SHA-256 `442038282ad592fc7c8c6dc014f69653d6964299329a4d58fb3ded9a57ab243a`: 34 tests, 32 pass, 2 fail, zero skips/cancellations, 27,978.236041 ms.
- RF-2.E2 failed because the unset-TERM case was treated as a dumb-terminal opt-out. Corrected production eligibility to distinguish Bash's implicit unexported TERM=dumb from an actual environment TERM=dumb. The helper checks the exported environment only in the dumb-value branch using existing env/awk tools; it reads the complete pipe to preserve pipefail correctness. NO_COLOR and per-channel behavior stay unchanged.
- RF-3.E2 failed at the direct command --help loop. Readonly tracing found update's early help return still called cat; replaced it with the same presentation helper used by all other help routes. Help bytes and docs remain unchanged.
- No frozen tests changed. Readonly red-to-worktree and red-to-index comparisons for all four paths remain empty; git diff --check passed after these corrections.
- Current production revision is newer than the reviewed log; a new owner-run suite is pending. Do not relabel this run as green. The previously failing test may expose later assertions once these first failures are removed.
- Manual source is generated in the current worktree. Branch-trace and manual --check output was not captured in the suite log; owner confirmation requested separately. No independent reviewer dispatched yet.


## Current owner-run scoped green — 2026-11-16
- Agent read the new owner-run `/tmp/rigorkit-021-tests.log`; SHA-256 `da383390580ccbaa9999448125fb9bedf67e1f59256810f01b218c4f9675717b`.
- Result: 34 tests, 34 pass, 0 fail, 0 skipped/cancelled; duration 29,089.951792 ms. Both previous failures now pass, including later assertions in those test cases. All 32 automated scenario IDs have passing tests; two additional tests cover the harness and the second RF-7.S1 safety case.
- This is real temporary-home CLI/PTY integration evidence for the current implementation, not an agent-executed rerun and not a live visual acceptance claim.
- Exact frozen bytes red = index = worktree rechecked on 2026-11-16 for the four approved paths; git diff --check also passed. The owner-approved scoped integrity exception remains in force.
- RF-3.E3 and RF-5.E2 remain manual and pending; RF-5.S is justified n/a. Existing user approvals and strict scenario-trace evidence are unchanged.
- Advance to Verify preparation: critical/legacy CLI regression suite, branch-trace and manual check outputs still required before independent SDD/architecture/security review. The manual file is generated in worktree; machine success is not inferred from the owner saying the commands finished.
- No green commit, final acceptance, archive or independent green verdict is recorded.


## Owner-run global checks — 2026-11-16
- Global suite reviewed from `/tmp/rigorkit-021-regression.log`: 622 tests, 620 pass, 0 fail, 0 skipped/cancelled, 2 TODO; duration 247,625.389833 ms. TODO results are not counted as passes.
- Generated manual/repository checker reviewed from `/tmp/rigorkit-021-manual.log`: `cli checks: PASS`.
- Branch trace reviewed from `/tmp/rigorkit-021-trace.log`: FAIL, 24 reported entries (12 unique fixture locations repeated for worktree/index). All concern missing RF scenario/INV hunk citations in the frozen 021 shared fixture.
- Log SHA-256: regression `394632bdd3eaf03e6a1c4d1d31317d2a8edfa98c4ccddfbd39dc43887ceb41bc`; trace `a3a15dda57fe23008d0c219325ddfaf6d4edb2d32bbed82814b8bee85ab9202c`; manual `e60e3905ccb252d374a188569e603b86fe48111c2cf33ec19f0dc6b9b19dc1ce`.
- No code or frozen-test file changed while reviewing logs. Exact worktree/index diff for the fixture against approved red remains empty. Whitespace diff check passed.
- Required independent reviewers have not been dispatched because trace has not passed. See amendment-proposal.md for the exact two-comment-line AMEND-1 proposal and separate test(amend) commit request. Frozen-test modification requires owner approval; it is not inferred from the request to continue reviews.

## Approved trace amendment — 2026-11-16
- AMEND-1 explicitly approved by the owner and committed separately as `77fe85573bb795cf8f2a63da0572acd5da1d339c`. Only the proposed two fixture comments were committed; no product source or executable test changes.
- Exact binary comparison confirms the fixture is original red plus exactly those comments; the other three frozen paths match original red. Index and worktree match the updated pins in freeze.md.
- Existing scoped/full regression/manual evidence is retained; no unchanged behavioral suite rerun is requested for comments. Branch-trace rerun remains pending and independent reviews have not started.

## Trace amendment verified — 2026-11-16
- Owner-rerun branch trace reviewed from /tmp/rigorkit-021-trace.log: trace PASS, 0 issues, after approved AMEND-1 commit 77fe855.
- Required machine prerequisites for independent review now have evidence: scoped 34/34; full suite 620 pass/0 fail/2 TODO; manual/repository checker PASS; trace PASS; exact frozen boundary under the approved exception.
- The two TODO markers are pre-existing tools/test/008-rigorkit-cli.test.mjs RF-26.E1/E2, not 021 cases; retain TODO status rather than counting them as passing.
- RF-3.E3 and RF-5.E2 still await owner live terminal observation. They are carried as pending evidence, not asserted product defects or green live checks.
- Independent SDD, architecture and security review packet prepared from confirmed base through current tracked/untracked worktree. No peer verdict is supplied to another reviewer.

## Independent review and live evidence — 2026-11-16
- All three required independent reports returned no findings; originals and limitations preserved in review-reports.md.
- Owner confirmed both live checks using the temporary real-CLI preview: correct palette and default typed-answer color. RF-3.E3 and RF-5.E2 are now owner-observed PASS.
- Current production source hashes equal the review packet manifest, so no source correction invalidates reviews or green execution evidence. Consolidated evidence is in validation.md; final acceptance/green commit approval remain owner gates.

## Owner acceptance — 2026-11-16
- Owner accepted B1 and authorized this separate test(green) commit. All technical/independent/live evidence is complete; current production and frozen bytes remain verified.
- This green commit is authorized; archive/close, any further commit, push, merge and deployment are not inferred.
