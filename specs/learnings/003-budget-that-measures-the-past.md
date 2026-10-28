---
type: learning
status: current
tags: [tooling]
source: "specs/archive/005-content-ratchet/"
updated: 2026-10-26
---
# A content budget that measures a past optimisation stops being a budget

> When a size target is written to prove one past change, it blocks every later change; let the baseline declare its own target instead.

## Symptom
A quality gate that was green after a big cleanup turns red with approved, deliberate additions, and the only way to pass it is to delete content the product needs. The team starts arguing about the target instead of about the content.

## Cause
The gate compares the current state with a snapshot taken before the cleanup, with a fixed percentage. Every feature approved after that snapshot moves the current state away from the snapshot, so the gate measures the history of one decision instead of the present.

## Solution
Keep the historical snapshot as the evidence of the cleanup, and give the live baseline its own target. A target of 0% means the current content may not grow without a new captured baseline, and capturing one is the explicit decision to accept that growth. A new pack without a baseline is reported instead of ignored.

## How to detect it
The gate fails on content the owner already approved; the error names a target that belongs to a closed change; the fix proposed is "delete something" rather than "decide". The moment the remedy is always deletion, the target has stopped measuring what it was written for.
