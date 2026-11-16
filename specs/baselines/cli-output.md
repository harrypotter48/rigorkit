# Baseline — CLI output (2026-11-16)

## What it does today
The CLI decorates only eligible final terminal display. Current observable behavior is owned by `specs/capabilities/installer/spec.md` RF-17; accepted evidence is in `specs/archive/021-terminal-colors/validation.md`.

## Actual contract
| Field | Entity | Migration | DTO | Shared type | Producers | Consumers |
|---|---|---|---|---|---|---|
| Channel terminal attachment | — | none | — | final output descriptor | `lib/output.sh:5` | stdout or redirected-to-stderr display adapters |
| `NO_COLOR`, environment `TERM` | — | none | — | process environment, no persistent key | calling process; `lib/output.sh:5` | terminal eligibility; no exported override to scripts |
| Explicit display role | — | none | — | plain/success/error/warning/question/heading | CLI/installer/update/scan/doctor/notice display sites | `lib/output.sh:14`; script exec is outside this adapter |
| Displayed structured text | — | none | — | existing unified diff/help/changelog text | existing producers and sanitizer | `lib/output.sh:32,57,65,73` |
| Safe display text | — | none | — | existing safe-print contract | `lib/common.sh:19–24`; scan one-line formatter | fixed SGR after sanitization, never artifact/record writers |

## Known mismatches
- None observed within accepted 021 scope. Archived validation retains two legacy TODO and explicitly approved process exceptions; these are not hidden runtime mismatches.

## Detected half-wired features
- None introduced or resolved by 021; existing `specs/half-wired.md` entries remain unchanged.

## Critical path?
Yes: entry point, installer, updater and CLI notices are critical paths under the constitution. Runtime/fingerprint/record/release authority remains unchanged. Review/update this baseline only for an accepted change to the output contract.
