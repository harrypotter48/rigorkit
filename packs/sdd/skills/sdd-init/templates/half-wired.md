# Half-wired features

What seems finished but has no real effect: UI without backend, unenforced permissions,
emails never sent, unreachable flows whose code remains. This differs from `@legacy`
(code confirmed unused).

Every entry has a stable `HW-NN`: never reuse or renumber it, even after moving it to
"Resolved". Code and specs reference that ID. Do not delete a closed entry: move it
to "Resolved" with its resolution date and the same ID.

## Active

### HW-01 · <Feature> (`<module>`)
- Where: <file(s)>
- What it seems to do: <what the user or code suggests>
- What is actually missing: <the absent or disconnected piece>
- Decision: <who left it this way, when and why, or "undecided">

### HW-NN · Accepted finding · <screen, endpoint or rule> (`<module>`)
- Where: <file(s) or screen>
- Finding: <defect or improvement, with severity and the evidence>
- Accepted by: <who, when, and why it is not corrected in this change>

## Resolved

### HW-NN · <Feature> — resolved on <YYYY-MM-DD>
- <What was done and in which change (<id>)>
