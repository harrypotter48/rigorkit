---
type: learning
status: current
tags: [testing]
source: "specs/archive/008-updater/"
updated: 2026-11-12
---
# On macOS the temporary folder is a symlink: compare resolved paths in tests

> `os.tmpdir()` returns `/var/folders/…`, which is a symlink to `/private/var/folders/…`; any code that resolves paths (`pwd -P`, `realpath`) prints the other form, so path assertions fail only on macOS.

## Symptom
Tests that compare a path written by the program with the path the test created fail on macOS and pass on Linux, with diffs that differ only by a `/private` prefix.

## Cause
The test builds paths from the unresolved temporary folder, while the program under test resolves its own location physically (for example `cd "$(dirname "$0")" && pwd -P`).

## Solution
Resolve the temporary root once (`realpathSync`) and build every expected path from it; when comparing outputs, normalize both the resolved and the unresolved form.

## How to detect it
A path assertion fails only on macOS and the expected and actual values differ by `/private`.
