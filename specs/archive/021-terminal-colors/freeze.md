# Frozen test boundary — 021-terminal-colors
> Owner-approved: 2026-11-15 · Status: frozen; exact integrity checked 2026-11-15.

- Confirmed base: `a812f2eefce1765eca00f98e84fe2fa4e03aeec8`.
- Approved red: `8d29670e69b88ffbbb91f72ce4a85fa5c8c84b17`.
- Owner explicitly approved test(red), freezing the four paths below and implementing B1 autonomously.
- Owner separately approved exact red/index/worktree comparison as the change-local integrity exception because Test paths is absent from the red constitution. No checker was bypassed without approval; the standard frozen checker is not reported as run/passing.

| Path | SHA-256 in approved red | Index and working tree |
|---|---|---|
| `tools/test/021-terminal-colors.test.mjs` | `35f4bd157b106312bd97610c6c5ebdee4d257706fa38b2c18649dd94d6d3228a` | equal |
| `tools/test/021-terminal-colors-fixture.mjs` | `0b727c5c63f920390bf8b7fe0ca27806e4b152e0d70a545328b8072bb1a19e82` | equal |
| `tools/test/021-pty-run.py` | `8569167c4d95a49249f11e222cde8596a17ae50d46c6622665fc2d98faa78c27` | equal |
| `tools/test/fixtures/021-terminal-colors/plain.json` | `10ea7c32dba3ecd2f65d0aad6e43303cf07a951fedf9430f9b4a438095624d89` | equal |

These exact bytes are immutable for B1 implementation. A required amendment returns to the owner and needs separate approved test(amend) evidence; builder never edits the frozen paths. Recheck after any subsequent edits or external changes. Branch trace and all behavioral/regression/live checks remain required independently.

## AMEND-1 — owner-approved 2026-11-16
- Separate approved amendment commit: `77fe85573bb795cf8f2a63da0572acd5da1d339c`. Only two RF-reference comment lines were added to the shared fixture; no production code, test code, assertions or data are in that commit.
- Removing exactly the two approved comment lines recovers the original red fixture bytes. All four current index/worktree files equal their pinned versions below; the other three remain pinned to original red.
- The owner-approved exact-comparison integrity exception remains scoped to this boundary. Branch trace rerun is still pending; its success is not inferred from the amendment.

| Frozen path | Pinned commit | SHA-256 |
|---|---|---|
| `tools/test/021-terminal-colors.test.mjs` | `8d29670e69b88ffbbb91f72ce4a85fa5c8c84b17` | `35f4bd157b106312bd97610c6c5ebdee4d257706fa38b2c18649dd94d6d3228a` |
| `tools/test/021-terminal-colors-fixture.mjs` | `77fe85573bb795cf8f2a63da0572acd5da1d339c` | `93718e13e95c5956f082e6292d5d21e60ecc785a6726455bcf2b612aa6f7aaf6` |
| `tools/test/021-pty-run.py` | `8d29670e69b88ffbbb91f72ce4a85fa5c8c84b17` | `8569167c4d95a49249f11e222cde8596a17ae50d46c6622665fc2d98faa78c27` |
| `tools/test/fixtures/021-terminal-colors/plain.json` | `8d29670e69b88ffbbb91f72ce4a85fa5c8c84b17` | `10ea7c32dba3ecd2f65d0aad6e43303cf07a951fedf9430f9b4a438095624d89` |
