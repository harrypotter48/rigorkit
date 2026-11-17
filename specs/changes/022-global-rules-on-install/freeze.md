# Frozen test boundary — 022-global-rules-on-install B1
> Owner-approved: 2026-11-17 ("Apruebo y congelo") · Status: frozen; B1 only.

- Confirmed base: `8fedd1ee5991860cefa74a899d68ce336ce4aaaf` (main, 021 merged).
- Approved red: `90e62cbb662db618364450d7d426d40d0c9ecbba` (`test(red): 022-global-rules-on-install B1 rules-only install from the CLI`).
- The red is the owner's report ("Ya los corrí, falla en rojo"); the agent did not see the output.
- The standard frozen checker (`check-frozen-tests`) is not reported as run or passing.

| Path | SHA-256 in approved red | Index and working tree |
|---|---|---|
| `tools/test/022-rules-only.test.mjs` | `4b459dc06f05fcc02d18d4bcce236441f1a0a00d98d89f955c468edbcc2afda6` | equal at the commit |

These exact bytes are immutable for B1 implementation. A required amendment returns to the owner and needs a separate approved test(amend); the builder never edits the frozen path. Tests for B2 and B3 are prepared and frozen separately.

## B2 — owner-approved 2026-11-17 ("Apruebo y congelo")
- Approved red: `8622db92cade5f991911dfe9f0beee517e48f0a3` (`test(red): 022-global-rules-on-install B2 rules-only entries in update`), on top of the B1 implementation commit `c540f96`.
- Red observed from the owner's pasted output: RF-11.H1 and RF-11.F1 fail; RF-11.E1, E2 and S1 pass by reuse.

| Path | SHA-256 in approved red | Index and working tree |
|---|---|---|
| `tools/test/022-update-rules-only.test.mjs` | `fcac85e8c540ad48147a1e6eb54b3ae1b85b5f2b0d69ae925119914c59891900` | equal at the commit |

Immutable for B2 implementation; an amendment needs a separate owner-approved test(amend). The B1 boundary above stays frozen.

## B3 — owner-approved 2026-11-17 ("Apruebo y congelo")
- Approved red: `95878763eeb4f1974b58edbdddf187db95489ea8` (`test(red): 022-global-rules-on-install B3 one-line installer offers the global rules`), on top of the B2 implementation commit `61dcf93`.
- Red per the owner's report only; the agent did not see the output. The owner's approval also confirms the message contracts listed in test-preparation.md (B3).

| Path | SHA-256 in approved red | Index and working tree |
|---|---|---|
| `tools/test/022-one-line-rules.test.mjs` | `68df0b728214d80e80ddc90c540393a8ab722f91d64ce4d08018d550ff4d66f5` | equal at the commit |

Immutable for B3 implementation; an amendment needs a separate owner-approved test(amend). The B1 and B2 boundaries above stay frozen. The existing 008 test `RF-1.H1` asserts the old closing lines of the installer and will need its own owner-approved test(amend) when B3 changes them.

## Amendments — owner-approved 2026-11-17
- AMEND-2: `tools/test/008-install-remote.test.mjs` RF-1.H1 names the later command and checks claude, codex and opencode (existing test, not part of the frozen 022 paths). Commit `1f63c4e9676c5fd0143b966774d9996b54c27014`.
- AMEND-3: `tools/test/022-one-line-rules.test.mjs` Twin equality checks the marker templates of `install.sh` and the core literals of the one-line installer. Commit `23f4e8659d49546d1e6efefd4b33727db64e2f5f`. Only that assertion changed; the B3 boundary now pins SHA-256 `64564a46f4b76885f4b3222436af91663c1229941b9091c593303647ae6d8372`.
- B3 implementation commit: `5d42a8aca82bf20270dc95a3f735d8f655d90cf6` (`tools/install-remote.sh`).
- AMEND-4: `tools/test/fixtures/021-terminal-colors/plain.json` gains the `--rules-only` help line (existing 021 fixture). Commit `3024d584364032fbb68f03fafe423fbbb17794e5`.
- AMEND-5: `tools/test/022-one-line-rules.test.mjs` `scene()` appends a temp folder with a `zsh` stub (`exit 0`) to PATH, so a runner without zsh (GitHub CI) still gets the `.zshrc` startup block that RF-3.F2 and RF-8.F1 read. No assertion changed. Commit `e74d2d79d9a620bc1ab30481ef06d36fa4cd714d`; the B3 boundary now pins SHA-256 `35ef755c66a5fffb47c182a1bdbdb4956cfbe4c82474b55fec6c2d0b3743b8b7`.
