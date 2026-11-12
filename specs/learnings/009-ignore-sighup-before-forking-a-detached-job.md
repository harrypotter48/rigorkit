---
type: learning
status: current
tags: [testing, tooling]
source: "specs/archive/010-update/"
updated: 2026-11-12
---
# A detached job started by a short-lived process must ignore SIGHUP before the fork

> `( nohup cmd & )` leaves a window between the fork and `nohup` ignoring SIGHUP. If the parent is a session leader that exits right away (a fresh terminal, a pty in tests), the hangup can kill the job in that window. Ignore SIGHUP in the parent before forking; the child inherits it.

## Symptom
A background job started at shell start sometimes never finishes: a test that waits for its output passes on macOS and fails intermittently on Linux CI.

## Cause
When a session leader exits, the kernel sends SIGHUP to the session's processes. The forked subshell has not yet run `nohup`, so it still has the default action and dies.

## Solution
`trap '' HUP` in the launching process right before `( nohup cmd </dev/null >/dev/null 2>&1 & )`, then `trap - HUP`; also `trap '' HUP` at the top of the job itself. Ignored dispositions survive fork and exec.

## How to detect it
A detached job's result is missing only sometimes, more often on fast Linux runners, and never when the launcher stays alive for a moment.
