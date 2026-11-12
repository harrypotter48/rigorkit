---
type: learning
status: current
tags: [git, tooling, releases]
source: "specs/archive/010-update/"
updated: 2026-11-12
---
# `git checkout` can exit 0 without writing a file: check the work tree is clean

> When git cannot unlink or write a file during a checkout (a read-only folder, an immutable file), it prints `error: unable to unlink old …`, moves `HEAD` and still exits 0. A tool that moves a clone must treat "work tree clean after the checkout" as success, not the exit status.

## Symptom
An updater reports success, `HEAD` points at the new tag, but some files still hold the old content and `git status` shows them modified.

## Cause
Checkout updates `HEAD` and the index and reports per-file write failures on standard error without failing the command.

## Solution
After the checkout, check `git status --porcelain` (ignoring changes you allow, such as mode-only changes you repair). If anything is left, check out the previous commit with `--force`, `reset --hard` to it and `clean -fd` the files the failed move added (safe only when the tree was clean before the move), then report the error.

## How to detect it
Make a folder that the new release changes read-only in a test clone and run the update: the exit status is 0 while `git status` is not clean.
