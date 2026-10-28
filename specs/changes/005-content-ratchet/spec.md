# Spec 005 — Content ratchet
> Status: draft · DoD: normal · Owner repo: rigorkit · Affected repos: rigorkit
## Context and goal
The content measurement compares the current packs with a fixed baseline captured before the English compaction of change 001 and requires at least 30% fewer loaded tokens in `sdd`, `architecture` and `frontend`. The `sdd` pack reached 11507 tokens after that compaction, 12 tokens below the limit, and then grew with two approved feature changes: the functional blocks of change 003 (+1831 tokens) and the factory stations of change 004 (+1192 tokens). The gate has been red on main since change 003 and reports 11.71% for `sdd` plus 13 identity differences, because the baseline still lists the members that change 004 renamed and does not know the `design` and `security` packs. The gate no longer measures the compaction it was written for: it blocks every legitimate addition to the pack. This change replaces it with a ratchet. The baseline declares its own target and the current content must not grow without a new captured baseline and an owner decision, while the archived baseline of change 001 stays as the historical evidence of the 30% compaction.
## Users / actors
The owner who decides what enters the toolkit, and the agents that report growth before a commit.
## User stories
- H1: As the owner, I want the content check to fail only on real growth so that a reviewed feature is not blocked by an obsolete target.
- H2: As the owner, I want the compaction evidence preserved so that the historical target is not lost.
- H3: As the owner, I want to capture a new baseline from any commit so that accepting growth is an explicit and reproducible decision.
## Functional requirements (EARS)
### Ratchet policy (H1)
- RF-1: WHEN the baseline declares a target reduction, THEN THE SYSTEM SHALL enforce that target independently for every pack contained in the baseline; WHEN the baseline declares no target, THEN THE SYSTEM SHALL keep the original policy of 30% reduction in `sdd`, `architecture` and `frontend`.
- RF-2: WHEN the current loaded tokens of a ratcheted pack exceed its baseline, THEN THE SYSTEM SHALL report the growth with both totals and SHALL fail the check.
- RF-3: WHEN the repository contains a pack that the baseline does not contain, THEN THE SYSTEM SHALL report that the pack has no baseline and SHALL fail the check.
### Capture (H3)
- RF-4: WHEN the owner asks to capture a baseline, THE SYSTEM SHALL read the packs tree of the given commit, SHALL measure it with the same estimator and SHALL write a baseline file that records the commit, the estimator, every member and the target.
- RF-5: WHEN the baseline file already exists, THEN THE SYSTEM SHALL refuse to overwrite it.
- RF-6: WHEN the source commit or the target percentage is invalid, THEN THE SYSTEM SHALL report the error and SHALL NOT write a baseline.
### Evidence and documentation (H2)
- RF-7: THE SYSTEM SHALL keep the archived baseline of change 001 untouched as the historical evidence of the 30% compaction.
- RF-8: THE SYSTEM SHALL document the live baseline and the command that applies it, and SHALL name the archived baseline as the historical reference.
## Non-functional requirements
Dependency-free Node scripts; the same estimator as change 001 (`nfc-codepoints-ceil-div4`); no change to the per-file, per-pack or rules measurement, nor to the description and role checks; the archived baseline stays readable by the comparison CLI; English content; no third-party service and no network access.
## Test scenarios
All behavior below is manual instruction-following validation; the executable coverage lives in `tools/test/`.
### RF-1
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-1.H1 | happy [manual] | baseline with a target of 0% | content check runs | every pack in the baseline reports that target and passes when its tokens do not grow |
| RF-1.E1 | edge [manual] | baseline without a target | content check runs | the original 30% policy in sdd, architecture and frontend applies |
| RF-1.F1 | failure [manual] | baseline with an invalid target | content check runs | the baseline is rejected with the reason |
| RF-1.S | security | n/a — a measurement target carries no trust boundary | content check runs | n/a |
### RF-2
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-2.H1 | happy [manual] | ratcheted pack unchanged | content check runs | it passes and reports both totals |
| RF-2.E1 | edge [manual] | ratcheted pack smaller than its baseline | content check runs | it passes and reports the reduction |
| RF-2.F1 | failure [manual] | ratcheted pack with more tokens than its baseline | content check runs | the growth is reported with both totals and the check fails |
| RF-2.S | security | n/a — token growth carries no trust boundary | content check runs | n/a |
### RF-3
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-3.H1 | happy [manual] | every pack present in the baseline | content check runs | no missing baseline is reported |
| RF-3.E1 | edge [manual] | pack with only a rules file | content check runs | it is reported as a pack without baseline entries |
| RF-3.F1 | failure [manual] | new pack added to the repository | content check runs | the pack without baseline is reported and the check fails |
| RF-3.S | security | n/a — a missing baseline carries no trust boundary | content check runs | n/a |
### RF-4
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-4.H1 | happy [manual] | commit with consistent member names | capture runs | the baseline records the commit, the estimator, every member and the target |
| RF-4.E1 | edge [manual] | commit with packs but no members | capture runs | the capture reports that there is nothing to measure and writes no baseline |
| RF-4.F1 | failure [manual] | commit with a member whose name does not match its folder | capture runs | the mismatch is reported and no baseline is written |
| RF-4.S1 | security [manual] | commit contains no credential | capture runs | the baseline holds only member names, paths, description lengths and token counts |
### RF-5
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-5.H1 | happy [manual] | target file absent | capture runs | the baseline is created |
| RF-5.E1 | edge [manual] | target file exists from a previous capture | capture runs | the capture refuses and the existing file is unchanged |
| RF-5.F1 | failure [manual] | capture repeated with the same target | capture runs | the refusal is reported with the path |
| RF-5.S | security | n/a — an immutable artifact carries no trust boundary | capture runs | n/a |
### RF-6
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-6.H1 | happy [manual] | valid commit and target | capture runs | it proceeds without error |
| RF-6.E1 | edge [manual] | missing arguments | capture runs | the usage is reported |
| RF-6.F1 | failure [manual] | unknown commit or target outside 0-100 | capture runs | the error is reported and no file is written |
| RF-6.S | security | n/a — an invalid argument carries no trust boundary | capture runs | n/a |
### RF-7
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-7.H1 | happy [manual] | archived baseline of change 001 | content check runs with it | the historical 30% policy applies and the file is read as before |
| RF-7.E1 | edge [manual] | archived baseline | change 005 diff | the archived file is not modified |
| RF-7.F1 | failure [manual] | archived baseline modified | diff is reviewed | the change is rejected |
| RF-7.S | security | n/a — a historical artifact carries no trust boundary | diff is reviewed | n/a |
### RF-8
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-8.H1 | happy [manual] | repository documentation | it is read | the live baseline, the command that applies it and the capture command are named |
| RF-8.E1 | edge [manual] | archived baseline referenced in the capability | it is read | it is named as the historical reference |
| RF-8.F1 | failure [manual] | documentation names a baseline path that does not exist | it is reviewed | the stale reference is reported |
| RF-8.S | security | n/a — documentation carries no trust boundary | it is reviewed | n/a |
## Out of scope
Reducing the size of the `sdd` pack to meet the historical 30% target; changing the estimator or the per-file measurement; removing the archived baseline of change 001; capturing a baseline from a commit whose packs are not self-consistent; publishing a new npm version for this change.
## Completion criteria
The comparison CLI applies the target declared by the baseline and keeps the original policy for a baseline without one; the capture tool takes the commit, the output and the target, refuses to overwrite and writes no file on invalid input; the ratchet baseline is captured from the commit that closes change 004 and the current repository passes the check against it; the archived baseline of change 001 is unchanged; the governance and the capability name the live baseline and the historical one; the user-run content measurement and tool tests are supplied as commands and their output is pending evidence.
## Questions and answers
1. Compact the `sdd` pack back to the 30% target, or replace the target? → Replace it: the pack grew for two approved feature changes, and cutting ~3000 tokens would remove instructions the factory lanes need.
2. Which reference stays? → Both: the ratchet baseline is the live reference and the archived baseline of change 001 remains the historical evidence of the compaction.
3. What target does the new baseline declare? → 0%, meaning no growth of any pack it contains without a new captured baseline.
4. Which packs does it cover? → Every pack in the baseline: sdd, architecture, frontend, design and security.
5. Does the capture tool keep a fixed source commit? → No: it takes the commit, the output path and the optional target, and keeps refusing to overwrite.
6. Is a new pack an error? → Yes: a pack with no baseline is reported, because accepting it is an owner decision that a new baseline records.
## Open questions
- [NEEDS CLARIFICATION] The ratchet baseline lives in the change folder and moves to `specs/archive/005-content-ratchet/` when the change is archived. Confirm that the archive step updates the documented command paths, or choose a stable path outside the change folders.
- [NEEDS CLARIFICATION] The `sdd` pack already sits at 14530 loaded tokens with the ratchet at that value. Confirm whether the next compaction is a separate change with its own target, or whether this ratchet is the final answer for the pack.
## Clarification — round 1 (2026-10-26) · Verdict: ready for plan
1. Ambiguities: the ratchet target lives in the baseline file, not in the tool; a baseline without the field keeps the original policy; the packs covered are the ones the baseline contains.
2. Conflicting requirements: the historical 30% requirement of change 001 stays as evidence while the live check stops enforcing it; the same tool reads both.
3. Missing test scenarios: a pack without baseline, an invalid target percentage, a repeated capture and a missing argument are covered.
4. Conflicts with constitution: the content checks stay dependency-free, the tools stay generic and no global rule changes.
Approval evidence: the user chose the ratchet over compaction and a relaxed target after seeing the measured numbers for sdd, architecture and frontend.
