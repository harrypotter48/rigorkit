---
type: learning
status: current
tags: [sdd, proceso, seguridad]
source: "specs/archive/008-updater/"
updated: 2026-11-12
---
# When clarification does not converge, slice the spec; and model threats before freezing it

> If two review rounds of a large spec still leave many medium findings, split it into vertical slices instead of patching it. Run the threat model while the spec is still open, not after it is approved.

## Symptom
Each clarification round fixes findings and creates new ones; the count stays high. Later, a threat model done after approval adds requirements that need many more review rounds.

## Cause
A spec covering several user-visible outcomes has too many interacting rules to stabilize at once. Security requirements added late touch failure paths that were already settled, and each edit reopens them.

## Solution
Keep the full draft as reference, cut one vertical slice that delivers a usable result and re-run clarification on it alone. For anything that downloads code, runs commands or writes user files, run the threat model before the spec is approved so its requirements are reviewed together with the rest.

## How to detect it
Findings per round do not drop after two corrective rounds, or a security review adds new failure paths to an already approved spec.
