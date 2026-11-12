# Half-wired features

Features that **seem** finished but have no real effect: UI without a backend, unenforced permissions, emails never sent, or unreachable flows whose code remains. Distinct from `@legacy` (confirmed unused code).

Each entry has a stable `HW-NN` ID: **never reuse or renumber it**, even after resolution. Code and specs reference that ID. Never delete closed entries: move them to Resolved with their resolution date and original ID.

## Active

### HW-01 · One-line installer (`tools/install-remote.sh`)
- Where: `README.md` Install section, `tools/install-remote.sh`
- What it seems: `sh -c "$(curl …)"` installs rigorkit.
- What is actually missing: no `vX.Y.Z` tag exists and the installer is not on `main` yet, so the line answers "no release exists" (or 404 before merge).
- Decision: owner, 2026-11-12: resolved by merging 008 and the first release tag (HU-4, 009-release-tag).

## Resolved

_(none)_
