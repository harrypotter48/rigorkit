# Technical plan — 005-content-ratchet
## Current context
- `tools/measure-content.mjs:7` holds the hardcoded target pack set and the 30% comparison; `:124-158` validates the baseline schema (version 1, commit, estimator, entries, rules); `:171-213` compares identities, limits and per-pack reductions.
- `tools/capture-baseline.mjs:10-11` pins the source commit to `edad002` and the output to `specs/archive/001-english-and-compact/baseline.txt`; `:20` refuses to overwrite.
- `specs/archive/001-english-and-compact/baseline.txt` holds the historical snapshot (30 entries, 5 packs measured in the current repository, rules for `core`).
- Measured history of the `sdd` pack: 16457 tokens at `edad002`, 11507 at `b828b4a` (30.08% reduction, 12 tokens of headroom), 13338 at `339fa69` (red on main) and 14530 at `23d193a` (11.71%).
- `tools/fixtures/measurement/baseline.txt` is the synthetic baseline of the executable tests; `tools/test/measure-content.test.mjs` covers the CLI behavior.
- `AGENTS.md:47` names the content check; `specs/capabilities/english-and-compact/spec.md:280` describes the live measurement behavior.
References describe the inspected pre-change source, not post-edit line positions.
## Structure by layer / module
| Layer / module | Change | RFs covered |
|---|---|---|
| `tools/measure-content.mjs` | Target declared by the baseline, ratchet over every pack it contains, legacy policy when absent, growth and missing-baseline messages | RF-1, RF-2, RF-3, RF-7 |
| `tools/capture-baseline.mjs` | Source commit, output path and optional target as arguments; refuses to overwrite; writes no file on invalid input | RF-4, RF-5, RF-6 |
| `specs/changes/005-content-ratchet/baseline.txt` | Ratchet baseline captured from the commit that closes change 004, with a target of 0% | RF-1, RF-4 |
| `tools/fixtures/measurement/baseline-ratchet.txt` and `tools/test/measure-content.test.mjs` | Executable coverage of the ratchet policy, the legacy policy, growth and a pack without baseline | RF-1, RF-2, RF-3 |
| `tools/test/capture-baseline.test.mjs` | Executable coverage of the capture arguments, the overwrite refusal and the invalid input | RF-4, RF-5, RF-6 |
| `AGENTS.md` and `specs/capabilities/english-and-compact/spec.md` | Live baseline, command and historical reference | RF-8 |
## Data model
The baseline file keeps the version-1 schema and gains one optional field, `targetReductionPercent`, an integer between 0 and 100. With the field, the target applies to every pack the baseline contains and 0% means no growth. Without it, the original policy applies: 30% reduction in `sdd`, `architecture` and `frontend`. The archived baseline of change 001 keeps its shape and is never rewritten.
## Algorithms
The comparison computes the per-pack totals for the baseline and the current repository, resolves the target and the covered packs from the baseline, and compares them with integer arithmetic: `current * 100 <= baseline * (100 - target)`. A pack above its limit is reported as growth when the target is 0% and as a reduction shortfall otherwise; a pack present only in the repository is reported as having no baseline. The capture reads the packs tree of the requested commit, measures it with the same estimator, checks that every member name matches its folder and writes the snapshot with the overwrite refusal.
## Contracts
The baseline file is the public contract of the measurement: a target field makes the file a ratchet, and its absence keeps the historical policy. The capture command is `node tools/capture-baseline.mjs --source <commit> --output <file> [--target <percent>]`, and the check command is `node tools/measure-content.mjs --root . --baseline <file>`. Both stay dependency-free and English.
## Decisions
- Replace the target instead of compacting the pack: the growth comes from two approved feature changes, and cutting ~3000 tokens would remove instructions the factory lanes need.
- Keep both baselines: the ratchet is the live reference and the archived one is the evidence of the 30% compaction.
- The target lives in the baseline file: the tool stays policy-free and any baseline declares its own rule.
- A pack without baseline fails the check: accepting a new pack is an owner decision that a new baseline records.
- The capture takes the commit as an argument and keeps refusing to overwrite: the previous pin existed only to capture one historical snapshot.
## Constitution
Preserves tool-neutrality, generic content, dependency-free content checks, context economy and the user-run commands. No pack content, installer or global rule changes; the archived baseline stays byte-identical.
## Test strategy
Manual instruction-following validation for every scenario, with executable coverage in `tools/test/` for the target resolution, the growth report, the missing baseline, the capture arguments, the overwrite refusal and the invalid input. The user runs `node --test tools/test/*.test.mjs` and the content measurement against the live baseline; their output is pending evidence.
## Risks and cross-layer
- The ratchet accepts the current size of the `sdd` pack (14530 tokens) as the reference: it protects against further growth but does not recover the historical 30% target; a compaction stays a possible later change.
- A new pack now fails the check until a baseline is captured: that is the intended decision point, and the message names the pack.
- The ratchet baseline lives in the change folder and moves at archive time: the documented command paths must be updated in the same archive step.
- The capture tool now runs against any commit: it reads the repository tree and writes one file, refusing to overwrite, and it never touches the working tree.
- The legacy baseline keeps failing against the current repository: that is the historical evidence, not a live gate, and the documentation names which one is live.
