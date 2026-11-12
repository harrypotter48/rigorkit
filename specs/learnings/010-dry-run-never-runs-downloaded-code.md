---
type: knowledge
status: current
tags: [tooling, seguridad, releases]
source: "specs/archive/010-update/"
updated: 2026-11-12
---
# A dry run never runs the code it just downloaded

> An updater's `--dry-run` reads the downloaded release as data with the code already installed. If it handed control to the new release's code, "writes nothing" would depend on the code being vetted, and a compromised release would run when the user only wanted to look.

## Why
People and agents use a dry run precisely to inspect an unknown release before trusting it. Executing that release's scripts during the inspection turns the safe path into the attack path. The real update may run the new code (that is the point of updating); the preview must not.

## Example
Extract the release to a temporary folder with `git archive <tag> | tar -x`, then let the installed updater read its changelog, packs and templates from there and stage the result with the installed installer pointed at the extracted content. Pin it with a test: a release whose scripts would create a marker file leaves no marker after `--dry-run`.
