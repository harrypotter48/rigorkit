---
type: learning
status: current
tags: [agentes, ia]
source: "specs/archive/004-factory-lanes/"
updated: 2026-10-26
---
# Independent reviewers need the same input and no other report

> When several reviewers judge the same change, each one must receive the same approved references and none of the other reports.

## Symptom
The reviewers converge on the same finding, repeat each other's wording, or one of them starts from a conclusion the others already published. The result looks like several opinions but is one opinion counted twice, and the parts nobody checked look covered.

## Cause
Each reviewer sees the reports of the others, so the first finding anchors the rest. The order in which they run also decides which finding survives.

## Solution
Launch the enabled reviewers together after the builder, with the same approved references for each of them and without the other reports. Their corrections are collected and re-reviewed together once, so no reviewer sees an intermediate answer either. A final judge reads every report and aggregates them into one decision, and that judge never closes the change.

## How to detect it
Two reports that name the same file, line and cause in the same words; a report that cites another reviewer's verdict; a reviewer that lists findings outside its own scope. The first two mean the inputs were not independent, and the third means the profile was wrong.
