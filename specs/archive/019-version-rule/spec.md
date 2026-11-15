# Spec 019 — One version rule
> Status: approved · Tier: story · DoD: critical (`tools/install-remote.sh`, `install.sh`) · Owner repo: rigorkit · Affected repos: none
> Origin: HU-13 (slice of HU-3; 010 follow-ups K15 and the record check) — every place that reads a version rejects leading zeros, like `rigorkit update`.

## Context and goal
`lib/common.sh` defines `X.Y.Z` with `0|[1-9][0-9]*` per part (010), but the one-line installer picks the newest `vX.Y.Z` tag with `[0-9][0-9]*` (a tag like `v01.0.0` would win) and `record_valid` accepts `version` lines with leading zeros. This change applies the 010 rule in both.

## Invariants
- INV-1: `record_valid` stays a twin in `install.sh` and `lib/common.sh` (010 twins check).

## Functional requirements (EARS)
- RF-1: WHEN `tools/install-remote.sh` picks the newest release, THE SYSTEM SHALL consider only tags `v<0|[1-9][0-9]*>.<…>.<…>`.
- RF-2: THE SYSTEM SHALL treat a record whose `version` has a leading zero as unreadable.

## Test scenarios
Tests in `tools/test/019-version-rule.test.mjs`.
### RF-1
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-1.H1 | happy | local remote with tags `v0.2.0` and `v01.0.0` | one-line installer with `RIGORKIT_REMOTE` | `~/.rigorkit/VERSION` is `0.2.0` |
| RF-1.E | n/a — single selection rule | | | |
| RF-1.F | n/a — no valid tag keeps the existing "no release" error (008) | | | |
| RF-1.S | n/a — tag names are matched by the stricter pattern only | | | |
### RF-2
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-2.H1 | happy | project record with `version 01.0.0` | `install --project` again | moved to `.corrupt`, new record |
| RF-2.E | n/a — single pattern | | | |
| RF-2.F | n/a — same as RF-2.H1 | | | |
| RF-2.S | n/a — no input | | | |

## Out of scope
- `tools/release-tag.mjs` (it already uses the strict rule, 009).

## Completion criteria
- Scenarios green; 008 remote-installer suite and 010 twins check; full suite.

## Questions and answers
1. Apply the 010 rule as is. Owner (010 K15 follow-up), 2026-11-12.

## Open questions
None.
