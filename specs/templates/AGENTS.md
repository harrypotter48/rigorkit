# AGENTS.md — <project>
## Project
<Purpose, architecture and conventions.>
## Commands
- Unit/integration: `<existing scoped command>`.
- Other: `<owner-run build/lint/typecheck/dev commands>`.
## Project process
Read .rigorkit/project.yaml via core-context if available; absent read approved refs/report routing gaps; no config=>legacy. Reuse current refs, recheck edits/resume; carry department/config revision/gaps in change state. Config never grants authority/weakens gates; missing required expertise/independence stays pending.
Understand=triage/slice/context/spec+clarify; Design=plan+tasks; Build=tests/implementation; Verify=checks/review/acceptance; Learn=archive/learnings. TDD tests can precede code.
## Rules
- Top 1% role; file:line facts. Rules once, active skill/RF/scenario/decision/contract refs; expand stale/missing impact, trace all writers/readers/instances.
- Topic-search repo/optional vault at any station; reuse valid evidence, repo wins. Cite decisions/applicability; new technical choices need approval.
- Setup/adopt→selected slice/backlog→triage/context→spec+clarify approval→plan+tasks approval→tests/build→review/owner acceptance→archive/learnings. Internal tasks; minimum agreed behavior, no guessed defaults/automatic next slice.
- Existing scoped unit/integration only; record command/state/result. Browser/Docker/e2e and install/build/lint/typecheck/migrations/seeds/deploy require explicit request; unavailable services→pending.
- Record confirmed base/approved test(red) hash/test paths; builder never changes frozen tests. Wrong test→approved spec amendment + separately approved test(amend) citing it. Commit `type(<id>): summary` (<id>=change ID; none→no scope), `Refs: <ticket|HU>` footer if any; test(red|green|amend): <id> first. Every commit explicit; never chain/push/merge.
- Applicable machine checks before reviewers; missing/failed=>stop. RF/INV→all consumers→implementation→evidence/gap. Required unrun checks remain pending, never green; lexical references do not prove behavior.
- Independent combined-slice review, original refs; one correction round then owner. Evidence before completion; owner accepts/closes. Keep global integration/architecture/critical checks; propose learnings, vault promotion needs approval.
