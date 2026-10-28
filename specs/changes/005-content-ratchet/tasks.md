# Tasks — 005-content-ratchet
## Resume state
Stage: spec, plan and tasks drafted; implementation in the working tree, pending verification.
Approvals: the owner chose the ratchet over compaction and a relaxed target; spec, plan and block approval pending.
Authorized blocks: none · Current block: none · Current task: user review of spec.md, plan.md and the diff.
Pending/blockers: two open questions in spec.md (where the ratchet baseline lives after the archive and whether a later compaction of the `sdd` pack is a separate change); the user-run content measurement and tool tests are pending.
Next step: user approves the spec, plan and blocks; implementation is already written and waits for that approval and the checks.
References: spec.md RF-1–RF-8 and clarification round 1; plan.md decisions and risks; the working tree diff is the current source evidence.
Dependencies checked: measurement tool → capture tool → ratchet baseline → fixtures and tests → governance and capability documentation; the archived baseline of change 001 stays untouched.
## Functional blocks
### B1 — Baseline-driven target (RF-1–RF-3, RF-7)
Tasks: T1–T3 · Depends on: none.
Done when: the comparison CLI applies the target declared by the baseline over every pack the baseline contains, keeps the original 30% policy for a baseline without a target, reports growth with both totals, reports a pack without baseline, and reads the archived baseline of change 001 exactly as before.
Read: spec.md RF-1–RF-3 and RF-7; plan.md algorithms and contracts; `tools/measure-content.mjs`; the archived baseline.
Preserve: the estimator, the per-file and per-pack measurement, the description and role checks, the legacy target set and the archived file byte for byte.
Verify: RF-1.H1–RF-3.F1 manual scenarios; the fixture measurement and the tool tests run by the user.
- [x] T1. Resolve the target and the covered packs from the baseline, keeping the legacy policy when the target is absent. (RF-1, RF-7) [tooling · rigorkit]
- [x] T2. Report the growth of a ratcheted pack with both totals and fail the check. (RF-2) [tooling · rigorkit]
- [x] T3. Report a pack present only in the repository as having no baseline. (RF-3) [tooling · rigorkit]
### B2 — Capture with explicit source, output and target (RF-4–RF-6)
Tasks: T4–T6 · Depends on: none.
Done when: the capture tool takes the source commit, the output path and an optional target, records the commit, the estimator, every member and the target, refuses to overwrite an existing file, and writes no file when the commit or the target is invalid.
Read: spec.md RF-4–RF-6; plan.md algorithms and contracts; `tools/capture-baseline.mjs`.
Preserve: the immutable capture, the estimator, the name and folder consistency check and the dependency-free implementation.
Verify: RF-4.H1–RF-6.F1 manual scenarios; the tool tests run by the user.
- [x] T4. Replace the fixed source and output with arguments and keep the overwrite refusal. (RF-4, RF-5) [tooling · rigorkit]
- [x] T5. Validate the commit and the target percentage and write no file on invalid input. (RF-6) [tooling · rigorkit]
- [x] T6. Record the target in the captured baseline. (RF-4) [tooling · rigorkit]
### B3 — Live ratchet baseline and evidence (RF-1, RF-4, RF-8)
Tasks: T7–T10 · Depends on: B1, B2.
Done when: a ratchet baseline captured from the commit that closes change 004 holds every current member and a target of 0%, the current repository passes the check against it, the archived baseline of change 001 is unchanged, and the governance and the capability name the live baseline, the command that applies it and the historical reference.
Read: spec.md RF-1, RF-4 and RF-8; plan.md contracts; `AGENTS.md`; `specs/capabilities/english-and-compact/spec.md`.
Preserve: the archived baseline, the estimator, the public wording of the capability and the user-run commands.
Verify: RF-1.H1, RF-4.H1 and RF-8.H1 manual scenarios; the content measurement against the live baseline, run by the user.
- [x] T7. Capture the ratchet baseline from the commit that closes change 004 with a target of 0%. (RF-1, RF-4) [tooling · rigorkit]
- [x] T8. Add the fixture baseline with the target field and the executable coverage of the ratchet policy, the growth report and the missing baseline. (RF-1, RF-2, RF-3) [tooling · rigorkit]
- [x] T9. Add the executable coverage of the capture arguments, the overwrite refusal and the invalid input. (RF-4, RF-5, RF-6) [tooling · rigorkit]
- [x] T10. Document the live baseline, the check command, the capture command and the historical reference in the governance and the capability. (RF-8) [documentation · rigorkit]
Tasks are implemented in the working tree; their verification waits for the user-run checks. No completion, green check or live result is inferred from written instructions.
