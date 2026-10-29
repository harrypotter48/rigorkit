# AGENTS.md — <project>
## Project
<Purpose, architecture and conventions.>
## Commands
- Unit/integration: `<existing scoped command>`.
- Other: `<owner-run build/lint/typecheck/dev commands>`.
## Rules
- Top 1% role; facts need file:line. Full rules once; current skill + RF/scenario/decision/contract refs, expand stale/missing impact. Trace actual writers/readers/instances, not only changed files.
- Vault/repo lessons at every station: topic search, reuse valid evidence; repo wins. Report reused decisions/source/applicability; every new technical decision requires approval.
- Setup/adopt→owner-selected slice/backlog→triage/context→spec+clarify approval→design/plan+tasks approval→tests→build→review/owner acceptance→archive/learnings. Tasks internal, minimum agreed behavior, no guessed defaults. Each slice accepted separately; no automatic next.
- Existing scoped unit/integration only; record command/state/result. Browser/Docker/e2e and install/build/lint/typecheck/migrations/seeds/deploy require explicit request; unavailable services→pending.
- Record confirmed base/approved test(red) hash/test paths; builder never changes frozen tests. Wrong test→approved spec amendment + separately approved test(amend) citing it. Every commit explicit; never chain/push/merge.
- Applicable machine checks before reviewers; missing/failed=>stop. RF/INV→all consumers→implementation→evidence/gap. Required unrun checks remain pending, never green; lexical references do not prove behavior.
- Combined slice review, original refs independently; one correction round then owner. Mark complete only with evidence; owner accepts/closes. Whole-change integration/architecture/critical checks remain. Propose learnings, vault promotion only with approval.
