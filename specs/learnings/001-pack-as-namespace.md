---
type: decision
status: current
tags: [agentes, skills]
source: "specs/archive/004-factory-lanes/"
updated: 2026-10-26
---
# The pack is the namespace of its members, and a lane is the track of work

> A member of a toolkit is named `<pack>-<role>`, and a lane names the track of work where a set of specialists works.

## Context
A toolkit that groups content by topic needs two different words: one for the group of specialists and one for the track of work they run in. Using the same word for both makes the hierarchy unreadable, and using a generic prefix hides which group a member belongs to.

## Decision
- The **pack** is the namespace of its members: every skill and agent is named `<pack>-<role>` (`design-ui-reviewer`, `security-reviewer`). A renamed member leaves its previously installed copy to the user.
- The **lane** is the track of work: an entry condition, its specialists, its output and its exit criterion. A pack can staff a lane or be called as a specialist from another lane.
- The name of the pack is the prefix, and the content check fails when a member does not carry it or when an agent body omits its top 1% role.

## Rejected alternatives
- Renaming the packs to lanes in folders, flags and member names: it breaks every installed copy for a distinction that the prefix already carries.
- One agent per framework: it repeats knowledge and adds a description to every session.
- A naming rule without a check: it decays silently until someone reads the whole folder tree.

## Example
A toolkit with a `design` pack and a `security` pack serves a `design` lane and a `security` lane inside a core `sdd` lane. The members are `design-ui-criteria`, `design-ui-reviewer`, `security-baselines` and `security-reviewer`: the prefix tells a reader which lane staffs them.
