# Critical DoD — 022-global-rules-on-install
> Updated: 2026-11-17 · Technical evidence complete except the owner's live demo; owner acceptance pending.

| Required evidence | State | Source / next action |
|---|---|---|
| Approved spec, plan, block references, base and reds | evidenced | spec/plan/tasks; base 8fedd1e; reds 90e62cb, 8622db9, 9587876 |
| Frozen test integrity | evidenced under the exact-comparison exception | freeze.md; B3 differs from its red only by AMEND-3 |
| Threat model before the plan, with verifiable requirements | evidenced | threat-model.md; V1–V12 tested |
| Scoped scenario tests, failure and security | green | 022 suites: 8 + 5 + 58 + twin guards |
| Strict scenario trace | PASS: 74 scenarios | `check-scenarios.mjs` |
| Branch trace | PASS: 0 issues | `check-branch-trace.mjs --base 8fedd1e` |
| Global regression of installers, updater, startup files, scan, doctor | 692 pass, 0 fail, 2 pre-existing todo | agent-run full `tools/test` on 416470c |
| Project and global dry-run, real temporary install, marker byte-safety, user `.bak` byte-equal | PASS in isolated fixtures | 008, 015, 022 suites; never the real HOME |
| Isolated update: refusals, consent, dry-run, startup | PASS | 010, 017, 022 update suites |
| Docs and manual drift | PASS | `generate-man.mjs --check` |
| Independent SDD, architecture and security reviews | done, no high findings open | review-reports.md |
| Live demo of the acceptance flow on a real terminal | pending | owner, temporary home |
| Owner acceptance, VERSION bump, archive | pending | owner |

No real-data or production migration is involved. Pending is not counted as passing.
