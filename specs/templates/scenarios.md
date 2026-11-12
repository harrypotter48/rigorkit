# Test scenarios
Spec scenarios: ID+given/when/then. sdd-spec writes, clarify audits, user approves, sdd-tests: one/scenario.
## Types
| Type | Letter | What it tests | Example (apply coupon) |
|---|---|---|---|
| Happy | H | Normal use | Valid coupon: 10% off |
| Edge | E | Unusual/boundary valid values | Exact minimum; expires today |
| Failure | F | Invalid input/failure response | Unknown coupon: error, order unchanged |
| Security | S | Permission/user/tenant isolation | Other tenant's coupon rejected |
## Rule
ALL 4 types/RF, normal/critical; never happy-only. Only justified n/a, audited by sdd-clarify (inapplicable≠forgotten). Critical tenant/permission security CANNOT be n/a. Level changes extra evidence, not coverage (sdd-verify reinforced DoD).
## IDs
Scenario RF-<n>.<type><k> (RF-3.H1/RF-3.E2); n/a: no k, reason required. Test title STARTS ID: RF-3.F2: no duplicate discount. File needs change ID (describe('007-coupons',…)); no cross-change RF-1.H1 matches. Pure-visual [manual]: no test, mandatory live check.
## Spec format
RF-n heading, ID | Type | Given | When | Then table, four typed rows; n/a reason goes in Type.
## Checklist for edges and failures
- Boundaries: 0/min/max/just below/above.
- Empty: null/text/list/missing field.
- Duplicate/idempotent: repeat/double-click/retry.
- Concurrent users/requests, same resource.
- Unauthorized user/other tenant/expired session.
- Invalid format/type/length/special characters.
- External service/DB timeout/error/unexpected response.
- Timezone/day boundary/expiration/leap year.
- Already canceled/deleted/closed/partly created state.
## Automated check
specs/scripts/check-scenarios.mjs: 4 types/n/a reasons, test file with scenario+change ID (not [manual]). Existence only; assertions need title review/test lint.
```bash
node specs/scripts/check-scenarios.mjs specs/changes/<id>/spec.md
```
No args: all changes; zero tests warn, fail only with --strict (pre-push/CI); --tests <dir> scopes search.
