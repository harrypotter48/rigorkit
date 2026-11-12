## Clarification — 009-release-tag, round 1 (2026-11-12) · Verdict: not ready
Independent sdd-reviewer; 0 high, 4 medium (A1–A4), 5 low (A5–A9).
Owner choices raised: A1 (how a VERSION change is detected: diff vs state-based), A2 (GitHub concurrency keeps one pending run; RF-7 scope), A3 (ruleset bypass for Actions narrows but does not close T3).
Fixable: A4 (read remote tags, checkout has none), A5 (ignore non-X.Y.Z tags), A6 (lightweight tag on re-run), A7 (more static workflow checks), A8 (test location, no-dependency parsing), A9 (critical-path regression cell).
Owner answered A1–A3 (spec answers 6–8). Resolutions: A1 state-based RF-1/RF-6 + RF-1.E2; A2 RF-7 narrowed, E1/F1 manual; A3 residual in NFR; A4 remote tags definition + RF-1.F1; A5 invalid tag names ignored + RF-4.E1; A6 lightweight released tag accepted (RF-6.F1); A7 RF-1.S2, RF-2.H1, RF-5.H1 static checks; A8 test location and dependency-free parsing; A9 critical-path regression text. New RF-8 (push failure, race).
Round 2 (2026-11-12): not ready, 0 high, 1 medium (B1), 6 low. Fixed: B1 RF-5 static checks (F1) and n/a E; B2 tagger identity; B3 persist-credentials false + token only in push step; B4 missing/empty VERSION invalid; B5 observable remote-tag invariant; B6 acceptance wording; B7 RF-7 before RF-8.

## Clarification — round 3 (2026-11-12) · Verdict: ready
Independent sdd-reviewer; 0 high, 0 medium, 6 low. All round-2 resolutions hold. Lows carried to the plan (spec not edited): C1 RF-6 only after tests pass (tests run first in the job); C2 race: pre-existing tags unchanged, competing v<Version> not replaced; C3 merging 009 with VERSION 0.1.0 would publish v0.1.0 (owner decision on bumping); C4 remote tags read anonymously (public repo); C5 static: only refs/tags/v<Version> pushed, no git commit; C6 only checkout/setup-node v6, Node 24.
Pending: owner approval before plan.
Owner approved the spec on 2026-11-12 (round 3 ready) and chose (C3) to bump VERSION to 0.2.0 in this change, so the first release is v0.2.0.

## Amendment — answer 9 (2026-11-12)
Security review of the implementation found M1 (actions in the write job get the token; pinned by @v6) and M2 (test code runs before the push step in the same job). Owner chose A: split into a read-only test job and a tag job without actions. Spec edited: INV-3, RF-5, RF-1.S1, RF-5.H1/F1, NFR credentials and actions. Round 4 audits the amendment.
Round 4 (2026-11-12): not ready, 0 high, 2 medium (D1, D2), 3 low. Fixed: D1 RF-1.S3 same commit; D2 workflow-level concurrency (RF-7, RF-7.H1); D3 Node: preinstalled for tag (>= 18), 24 for test; D4 RF-1.S1 scoped + SHA pinning; D5 to plan (remote passed explicitly, work tree at the fetched commit).
Round 5 (2026-11-12): ready, 0 high, 0 medium, 3 low (E1 only checkout/setup-node, E2 Node versions, E3 token never in URL/argv/log) carried to the plan and the amended static tests. Owner pre-approved this amendment (answer 9, autonomous work).
