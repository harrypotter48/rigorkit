# Closure — 021-terminal-colors
> Date: 2026-11-16 · Owner-accepted B1 · Archive/close explicitly authorized.

## Outcome
Terminal-only semantic output across the CLI is accepted. Complete scope remains in spec.md; current behavior belongs to installer capability RF-17 and specs/baselines/cli-output.md. HU-15 is done. No runtime source or frozen test is changed by archival.

## Validation
- Owner-run scoped integration: 34/34, zero failures/skips; full suite: 620 pass, zero failures/skips, 2 pre-existing TODO. Strict scenario trace: 35 rows. Branch trace and manual/repository checks: PASS.
- Owner confirmed both live terminal cases. Independent SDD/architecture/security reviews: no findings; independent delivery recommendation approved. Evidence and accepted limitations are preserved in validation.md, review-reports.md, approval.md and dod-critical.md.
- Approved base a812f2eefce1765eca00f98e84fe2fa4e03aeec8; red 8d29670e69b88ffbbb91f72ce4a85fa5c8c84b17; comment-only AMEND-1 77fe85573bb795cf8f2a63da0572acd5da1d339c; accepted green c020de4bdcbc0373eeb8147b08e42242d9d59b37.
- The exact frozen-integrity comparison exception and AMEND-1 remain documented in freeze.md. Two legacy TODO are not counted as passes.
- No test, generator, installation or live check rerun for documentation-only archive. Existing accepted evidence is reused, not presented as fresh execution.

## Deferred
No change-specific rows found in the local deferred file; no deferred file was created, cleared or moved to the vault. No known half-wired entry changed.

## Follow-ups and learning proposal
- Generic learning proposal, not promoted or implemented: declare the frozen test-path policy before the red checkpoint so integrity checks can validate the pinned constitution. Existing repo testing learnings were checked; none duplicates this process prerequisite. A standalone team learning or vault promotion needs separate approval.
- No new implementation, process setup, push, merge, release or deployment is authorized by this closure.

## Locations and retained history
This archive is `specs/archive/021-terminal-colors/`. Earlier references/commands containing `specs/changes/021-terminal-colors/` identify their pre-archive execution state; use the archive path for future reads/scenario checks. Internal relative links stay valid.

The personal backlog's converted-spec entry remains a pointer; it does not duplicate the archived task state. The close identity is the owner-authorized `[close]` commit containing this record.
