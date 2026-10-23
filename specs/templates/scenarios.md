# Test scenarios

The test plan lives in the spec: each RF has scenarios with unique IDs and given / when / then. `sdd-spec` writes them, `sdd-clarify` audits them, the user approves them, and `sdd-tests` writes one test per scenario.

## Types
| Type | Letter | What it tests | Example (apply coupon) |
|---|---|---|---|
| Happy path | `H` | Normal use, everything works | Valid coupon → 10% discount |
| Edge | `E` | Boundary or unusual but valid values | Total exactly at the minimum; coupon expires today |
| Failure | `F` | Invalid input or a failure, and the system's response | Unknown coupon → error, order unchanged |
| Security | `S` | Who may act and other users' or tenants' data | Another tenant's coupon → rejected |

## Rule
- Every RF needs all 4 types, for normal and critical changes. Never test only the happy path.
- Omit a type only with an `n/a — <reason>` row. This distinguishes inapplicable from forgotten; `sdd-clarify` checks that the reason holds.
- Critical: `S` cannot be `n/a` when the RF touches tenants or permissions. The level changes the extra evidence required, not what is tested (see the reinforced Definition of Done in `sdd-verify`).

## IDs
- Scenario: `RF-<n>.<type><k>`, e.g. `RF-3.H1`, `RF-3.E2`.
- Inapplicable: `RF-<n>.<type>` without a number, with `n/a — <reason>` in its row.
- Every test title starts with its scenario ID: `RF-3.F2: does not duplicate the discount when applied twice`.
- RFs are numbered per change, so the test file must also mention the change `<id>`, usually in `describe` (`describe('007-coupons', …)`). Otherwise another change's `RF-1.H1` could count by mistake.
- A manually verified scenario (purely visual UI) carries `[manual]` in its row: no test is required, but it must appear in live verification.

## Spec format
```md
### RF-3
| ID | Type | Given | When | Then |
|---|---|---|---|---|
| RF-3.H1 | happy | an order of 120 and a valid 10% coupon | apply coupon | total is 108 |
| RF-3.E1 | edge | an order exactly at the coupon minimum | apply coupon | discount applies |
| RF-3.F1 | failure | an unknown coupon code | apply coupon | rejected, order unchanged |
| RF-3.F2 | failure | a coupon already applied to the order | apply again | discount is not duplicated |
| RF-3.S | security | n/a — the coupon depends on neither user nor tenant | | |
```

## Checklist for edges and failures
- Boundaries: 0, minimum, maximum, just below and above.
- Empty: `null`, empty text/list, missing field.
- Duplicates and idempotency: repeat an action, double click, retry.
- Concurrency: two users or requests act on the same thing at once.
- Permissions and tenants: unauthorized user, another tenant's resource, expired session.
- Invalid input: format, type, length, special characters.
- External dependencies: timeout, error, unexpected service or database response.
- Dates and times: timezone, day boundary, expiration, leap years.
- State: acting on something already canceled, deleted, closed or partly created.

## Automated check
`specs/scripts/check-scenarios.mjs` checks all 4 types per RF (or `n/a` with a reason), and a test per scenario except `[manual]`. The test file must contain its scenario ID and change `<id>`. It checks existence, not whether assertions test the right behavior: title review and test lint cover that.

```bash
node specs/scripts/check-scenarios.mjs specs/changes/<id>/spec.md
```

Without arguments it checks every change in `specs/changes/`. A change with no tests yet gets a warning rather than a failure, unless `--strict` is used, so it can run in a `pre-push` hook or CI. `--tests <dir>` limits the test search.
