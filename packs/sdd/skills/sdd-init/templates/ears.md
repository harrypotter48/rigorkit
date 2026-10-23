# EARS: writing requirements
Number RF-n; use ONE of 5 patterns:
| Pattern | Form | When |
|---|---|---|
| Ubiquitous | THE SYSTEM SHALL \<action\> | Always |
| Event | WHEN \<trigger\>, THE SYSTEM SHALL \<action\> | Event |
| State | WHILE \<state\>, THE SYSTEM SHALL \<action\> | Condition holds |
| Optional | WHERE \<feature\>, THE SYSTEM SHALL \<action\> | Feature exists |
| Unwanted | IF \<condition\>, THEN THE SYSTEM SHALL \<action\> | Errors/edges |
## Rules
One behavior/sentence; "and" joining behaviors => separate RFs. No unmeasurable "fast/intuitive/robust": threshold or omit. Uncheckable => rewrite. Unknown => [NEEDS CLARIFICATION: <specific question>], NEVER invent.
## Example
Good:
> RF-4: IF name exists (ignore case/leading/trailing spaces),
> THEN THE SYSTEM SHALL not duplicate it and shall report conflict.
Bad:
> ~~RF-4: Handle duplicates well and be fast.~~
> No EARS; unverifiable; two ideas; unmeasurable adjective.
