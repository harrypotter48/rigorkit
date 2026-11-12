---
type: knowledge
status: current
tags: [tooling, seguridad, releases]
source: "specs/archive/008-updater/"
updated: 2026-11-12
---
# A one-line remote installer validates everything before it runs anything

> A `curl … | sh`-style installer is remote code with the user's rights: run it only from a complete download, refuse inputs that could become options, work in a private temporary folder and touch user files only after every check passed.

## Why
The installer runs before any of the product exists on the machine, often from a pasted line. A truncated download, an environment value starting with `-`, a predictable temporary name or a backup that is more readable than its original turns a convenience into a way to run or leak code.

## Example
- The body lives in one function and the file's last line calls it, so a truncated download defines functions and runs nothing.
- Values that reach git or ssh (remote, ref, user, host, path) are refused when they start with `-`; commands get `--` before positional arguments and an allowlist of protocols.
- The clone goes to a new temporary folder in the user's home, is checked there (expected entry point present, no group/other write bits) and only then moved into place; any failure removes it.
- Backups of edited user files come from `mktemp` next to the file under a restrictive umask and keep the original mode; new files are never group/other-writable whatever the umask.
- The tool's `bin/` is appended to `PATH`, never prepended, so it cannot shadow system commands.
