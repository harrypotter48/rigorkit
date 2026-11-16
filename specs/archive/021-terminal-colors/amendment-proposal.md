# AMEND-1 proposal — 021-terminal-colors
> Date: 2026-11-16 · Status: owner-approved and applied; commit 77fe855; trace rerun pending.

## Observed check
The owner-run global suite has 622 tests: 620 pass, 0 fail, 0 skipped, 2 TODO. Manual check: cli checks PASS. Branch trace: FAIL with 24 entries, consisting of the same 12 source locations reported for both base-to-worktree and base-to-index comparisons. All point to tools/test/021-terminal-colors-fixture.mjs.

The new fixture file lacks an RF scenario/INV citation in its added hunk. The branch checker therefore rejects its branches. This is trace metadata, not a failing runtime assertion or a product defect. The fixture is inside the owner-approved four-path freeze.

## Exact proposed delta
Insert only these two comment lines after its existing first comment:

```js
// RF-1.H1, RF-2.E2, RF-4.H1, RF-6.H1, RF-7.S1: shared real-CLI fixture for
// terminal eligibility, exact bytes, script ownership and safe release display.
```

No imports, executable statements, assertions, fixtures, data, scenarios or test outcomes change. These references name the existing scenarios using the shared fixture; the checker itself stays unchanged. No broad bypass or extra scope is proposed.

## Requested authority and gate
Approve AMEND-1 as a comment-only frozen-test amendment and one separate commit:
`test(amend): 021-terminal-colors cite fixture scenario trace`
The commit will cite AMEND-1 and Refs: HU-15. Record the approved amendment and exact path/hash alongside the original red; the other three frozen files remain byte-equal to red. Do not include production working changes in that commit.

After the approved amendment commit, owner reruns only branch trace; existing behavioral/regression evidence remains applicable because executable bytes are unchanged. Independent reviewers remain pending until this check is resolved. No test edits or amendment commit have been performed by this proposal.

## Approval and application
- Owner approved AMEND-1 and its separate test(amend) commit on 2026-11-16, explicitly limiting it to the two comments.
- Applied exactly that delta in commit 77fe85573bb795cf8f2a63da0572acd5da1d339c. Production working changes were excluded; executable fixture bytes and assertions are unchanged.
- Exact updated frozen boundary and equivalence proof are recorded in freeze.md. Branch trace must be rerun by the owner before independent reviewers.
