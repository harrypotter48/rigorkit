---
type: learning
status: current
tags: [testing]
source: "specs/archive/010-update/"
updated: 2026-11-12
---
# A timestamp in seconds is not the identity of an event

> Remembering "the user declined the result of the check at time T" by storing T in seconds fails when the next check finishes in the same second: it looks like the declined one. Reset the remembered answer when a new event happens instead of comparing timestamps.

## Symptom
A question that should come back after the next check never does, only on fast machines (CI), and only when the test runs the steps back to back.

## Cause
Two different events (the declined check and the next one) get the same second-resolution timestamp, so "declined == last check" stays true.

## Solution
Make the writer of the new event clear the old answer (a successful check sets `declined=` empty), or use an identifier that cannot repeat (a counter or random id), never a coarse clock value.

## How to detect it
A state machine keyed by `date +%s` and a test that runs the steps in under one second.
