# EARS: writing requirements

Number each functional requirement `RF-n` and use one of these 5 patterns:

| Pattern | Form | When |
|---|---|---|
| Ubiquitous | THE SYSTEM SHALL \<action\> | Always holds |
| Event | WHEN \<trigger\>, THE SYSTEM SHALL \<action\> | Responds to an event |
| State | WHILE \<state\>, THE SYSTEM SHALL \<action\> | During a condition |
| Optional | WHERE \<feature\>, THE SYSTEM SHALL \<action\> | Only when the feature exists |
| Unwanted | IF \<condition\>, THEN THE SYSTEM SHALL \<action\> | Errors and edge cases |

## Rules
- One requirement per sentence: if "and" joins two behaviors, write two requirements.
- No unmeasurable adjectives ("fast", "intuitive", "robust"): give a threshold or omit the claim.
- If you cannot check a requirement, rewrite it.
- Mark unknowns `[NEEDS CLARIFICATION: <specific question>]`. Never invent an answer.

## Example
Good:
> RF-4: IF the name already exists (ignoring case and leading/trailing whitespace),
> THEN THE SYSTEM SHALL not create a duplicate and shall report the conflict.

Bad:
> ~~RF-4: The system must handle duplicates well and be fast.~~
> No EARS pattern, unverifiable, combines two ideas and uses an unmeasurable adjective.
