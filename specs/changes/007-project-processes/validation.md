# Validation — 007-project-processes
Date: 2026-11-06 · Branch: feature/project-processes · Base: 2156383005754118b0f06b35dded47228a8720f8.
Verdict: source implementation reviewed and immutable baseline registered; owner delivery/adoption acceptance and recorded unrun checks remain pending.

## Approved scope
Owner approved software-first spec, then plan D1–D6/B1 with "adelante". Two new core members and <=1,200 estimated loaded tokens approved; other pack limits stay unchanged. The owner subsequently explicitly approved both named local delivery commits with "adelante". No target-project migration, installation/build/browser/infrastructure/push/merge approval was inferred.

## Implementation and RF trace
| Requirement | Actual source consumers |
|---|---|
| RF-1 | core-context department mapping, all 17 SDD entry headings, project AGENTS template, public software lane docs |
| RF-2 | core-init grounded interview/proposal and configuration-only/default modes; direct sdd-init preserved |
| RF-3 | core-init local project.yaml, core-context schema/additive context contract, mirrored project instruction pointer |
| RF-4 | sdd-init/adopt legacy fallback, every SDD entry's context hook, current resume/handoff, four named agents |
| RF-5 | core-init exact diff/approval/idempotence/custom-state protection; sdd-adopt ongoing work guard |
| RF-6 | core-context inventory/references/ambiguity/fallback/independence; caller applies relevant additions under its own authority |
| RF-7 | software defaults and existing tests/build/verify permissions, frozen boundaries and actual-evidence requirements |
| RF-8 | core/sdd context, optional user-local vault, reused-source decisions and approved learning promotion |

No new parser, engine or executable command behavior was added. New configuration is agent-interpreted. Existing installer glob discovery supplies the new skills; install.sh is unchanged. No new wording/snapshot tests were written for prose, and no retrospective red commit was fabricated. Existing executable tests were reused; no frozen test source was edited. Source implementation is distinct from arbitrary YAML/model compliance.

## Executable and artifact evidence
| Check | Result |
|---|---|
| Toolkit `node --test --test-reporter=spec tools/test/*.test.mjs` | PASS: 53 tests, 0 fail; separate log /private/tmp/rigorkit-007-toolkit-tests.log |
| Website `node --test --test-reporter=spec test/source.test.mjs test/workflow.test.mjs` | PASS: 15 tests, 0 fail; separate log /private/tmp/rigorkit-007-site-tests.log |
| All mirrored project templates | PASS: 14 files byte-equal |
| Real documentation import to temporary output | PASS: 62 source documents, 6 packs; generated repository content not edited |
| Branch trace from confirmed base | PASS: 0 issues; no new executable JS/TS branches |
| Whitespace check | PASS |
| Strict scenario structure checker | PASS structure only; all 32 requirements scenarios remain manual, not 32 executed passes |
| Historical 006 ratchet before registration | Expected FAIL on two approved new identities/unpopulated core; preserved historical evidence |
| Active 007 ratchet after immutable capture | PASS: all 33 member identities, pack budgets and global-rule limits; no errors |

The shared existing test-summary helper uses one log path: concurrent initial suite invocations collided in that summary log. Both suites were rerun sequentially into separate logs; counts/results above use those clean runs, not the colliding log.

## Token evidence
Core: 1,134 estimated loaded tokens across both new skills, below approved 1,200. SDD: 14,401 <= unchanged 14,404. Architecture 1,623; design 1,839; frontend 1,208; security 1,254: unchanged. Global core rules 278 <=300, unchanged.
Compaction removed repeated prose and duplicate example layouts while preserving project-template fields, four scenario types, language aliases, mandatory review, test and command/approval gates. All measured auxiliary Markdown is included. These are static NFC-codepoint estimates, not measured runtime savings.
Immutable baseline.txt was captured with --target 0 from approved real source commit a192a3afa91c39ed7fa56684826e3774d1864c2b. AGENTS.md now points to 007; the complete identity/content ratchet passes. Core stays below its approved 1,200 allocation, SDD tightens by 3 tokens and other budgets/global rules remain unchanged. Historical 006 was not edited; no baseline/commit was forged.

## Independent review and bounded behavior
Conformance and architecture agents reviewed the same original spec/plan/current sources and full tracked diff with new files supplied separately, without peer reports. Both source verdicts: no introduced high/medium findings in reviewed scope. They did not run tests or certify model behavior/release. Final narrow re-review covered the two clarifications below.

A separate agent applied the real skill instructions in three isolated contexts under /private/tmp/rigorkit-007-forward, with file reads only:
- A: configuration-only adoption proposed minimal YAML and preserved custom instructions/notes and change 012's actual state. Initial response summarized an optional AGENTS edit without showing its exact diff. Clarified core-init to exclude unshown edits from approval, then repeated A: actual config and AGENTS diffs shown before requesting approval. No writes or sdd-init call.
- B: explicit automatic approval conflicts with configuration/project policy; stopped affected routing, did not infer permission, listed unavailable capability as a gap.
- C: a missing required independent reviewer and missing acceptance evidence stayed pending; main agent did not substitute its own review.
These are bounded observed model responses, not native OpenCode/Codex/Claude discovery, actual installation, all 32 manual scenarios or general instruction-following proof. Caller invocation of a real custom skill was source-reviewed but not executed in a native host.

## Scenario observations
All rows have source support from the RF trace above. Observations below distinguish actual bounded responses from unexecuted cases.
| Scenario | Observation / gap |
|---|---|
| RF-1.H1 | Observed in bounded A: proposal maps all five departments; no native host/install trial. |
| RF-1.E1 | Source-reviewed; behavioral/native-host execution pending. No pass inferred. |
| RF-1.F1 | Source-reviewed; behavioral/native-host execution pending. No pass inferred. |
| RF-1.S | n/a — department labels introduce no trust boundary |
| RF-2.H1 | Partial bounded A: existing software context produces proposal; full novel-project interview pending. |
| RF-2.E1 | Source-reviewed; behavioral/native-host execution pending. No pass inferred. |
| RF-2.F1 | Source-reviewed; behavioral/native-host execution pending. No pass inferred. |
| RF-2.S1 | Source-reviewed; behavioral/native-host execution pending. No pass inferred. |
| RF-3.H1 | Partial bounded A: exact minimal config diff; department-specific customization execution pending. |
| RF-3.E1 | Source-reviewed; behavioral/native-host execution pending. No pass inferred. |
| RF-3.F1 | Source-reviewed; behavioral/native-host execution pending. No pass inferred. |
| RF-3.S1 | Observed in bounded B: automatic approval rejected; no partial routing or commands. |
| RF-4.H1 | Partial bounded A: software adoption proposal preserves work; real migrated execution pending. |
| RF-4.E1 | Source-reviewed; behavioral/native-host execution pending. No pass inferred. |
| RF-4.F1 | Source-reviewed; behavioral/native-host execution pending. No pass inferred. |
| RF-4.S1 | Observed in bounded A/B: no edits/commands/commits inferred from configuration/proposal. |
| RF-5.H1 | Observed in repeated bounded A: exact config/optional AGENTS diffs; original rules/notes untouched. |
| RF-5.E1 | Observed in bounded A: change 012 remains Design/WHAT-only/no red boundary. |
| RF-5.F1 | Source-reviewed; behavioral/native-host execution pending. No pass inferred. |
| RF-5.S1 | Source-reviewed; behavioral/native-host execution pending. No pass inferred. |
| RF-6.H1 | Source-reviewed; behavioral/native-host execution pending. No pass inferred. |
| RF-6.E1 | Source-reviewed; behavioral/native-host execution pending. No pass inferred. |
| RF-6.F1 | Observed in bounded C: missing independent reviewers/evidence blocks acceptance; no self-certification. |
| RF-6.S1 | Source-reviewed; behavioral/native-host execution pending. No pass inferred. |
| RF-7.H1 | Source-reviewed; behavioral/native-host execution pending. No pass inferred. |
| RF-7.E1 | Source-reviewed; behavioral/native-host execution pending. No pass inferred. |
| RF-7.F1 | Observed in bounded C: absent acceptance evidence stays pending. |
| RF-7.S1 | Source-reviewed; behavioral/native-host execution pending. No pass inferred. |
| RF-8.H1 | Source-reviewed; behavioral/native-host execution pending. No pass inferred. |
| RF-8.E1 | Source-reviewed; behavioral/native-host execution pending. No pass inferred. |
| RF-8.F1 | Source-reviewed; behavioral/native-host execution pending. No pass inferred. |
| RF-8.S1 | Source-reviewed; behavioral/native-host execution pending. No pass inferred. |

## Remaining owner gates
- Native-host project setup/adoption, actual custom-capability execution, missing-core/no-config distribution and all unobserved manual scenarios remain explicitly unexecuted. No real project instructions, installed copies or work were changed.
- Installer project/global dry-runs or temporary real installs were NOT requested/run. Public docs explain existing discovery, not proof of those executions. No installer source change.
- Full website build/typecheck/rendered browser verification, Docker/e2e and deployment were NOT requested/run. Source import and unit suites do not substitute for them.
- Both local delivery commits explicitly authorized: a192a3a contains reviewed source; the second packages its immutable baseline, active reference and current evidence. The full 007 ratchet is green. Commit approval does not imply native/adoption evidence, push/merge or release acceptance.
- Owner accepts this software slice after reviewing evidence/gaps. No archive, next prompt slice, push, merge or release is automatic.
