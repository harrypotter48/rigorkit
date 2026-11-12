## Clarification — 008-updater, round 1 (2026-11-11) · Verdict: not ready
Independent sdd-reviewer; 1 high, 15 medium, 9 low (F1–F25).

Resolved from recorded answers (spec edited; next round re-audits):
- F1: INV-1 now separates `rigorkit update` (confirmation) from commands that name their own writes; unedited-copy overwrite moved to Q-J.
- F3: definitions of clone version and installed version of a location; RF-4/6/10 use clone version.
- F5: RF-20 adds packs/agents to the existing entry.
- F6: RF-34 records a content fingerprint (answer 7); RF-20.S1 allows fingerprints.
- F8: [NEEDS CLARIFICATION] markers on RF-3 (Q-G), RF-10 (Q-E), RF-31 (Q-F).
- F9: custom area defined (answer 5); RF-33 installs custom packs.
- F11: startup line between rigorkit markers (constitution §7).
- F12: RF-30.E2 added, depends on Q-A.
- F13: RF-18.E1 real edge; tag format to Q-H.
- F14: RF-4.E4 exact boundary; frequency format and clock to Q-I.
- F15: RF-12.E2 and RF-14 cover edits inside a marked block.
- F16: RF-1.F2 git absent; `.bash_profile` added to Q-B.
- F17: RF-21 also runs with `--scan`. F19: INV-5 measurable. F21: RF-4.E5, no state with `--dry-run`. F22: RF-13.S, RF-23.F1, RF-29.S1 fixed. F23: RF-24.F2. F24: config location defined.
- F11 split: RF-11 (update clone) and RF-31 (show changes); new ids appended, none renumbered.

Owner decisions Q-A–Q-K answered (spec answers 13–24).
Accepted low: F18 (conditional "only on yes" clauses kept in one RF), F20 (update skips a broken file; install still stops), F25 (ratchet growth decided in Q-E).

## Clarification — 008-updater, round 2 (2026-11-11) · Verdict: not ready
Independent sdd-reviewer; 1 high (G1), 22 medium (G2–G23), 8 low (G24–G31). Round-1 resolutions hold except F3 wording leftovers (G24), F1 broken by RF-30 (G1) and F15 creating RF-12/RF-32 overlap (G2).
Owner choices raised: G1 (old scripts replaced without confirmation; edited old script), G4 (scope of a copy moved to custom), G7 (ref the installer checks out; clone ahead of newest tag), G9 (0.1.0 content differs across commits), G13 (reference skills carry the notice), G14/G15 (question during update/--help/--dry-run, non-interactive runs, empty answer), G18 (does --dry-run fetch), G21 (Cursor rules pasted by hand), G23 (new pack: per location or per pack).
Fixable from recorded answers: G2, G3, G5, G6, G8, G10, G11, G12, G16, G17, G19, G20, G22, G24–G30.
Not edited yet: pending owner decision on how to proceed (whole spec vs vertical slices).

## Slicing (2026-11-11)
Owner chose vertical slices (answer 25). `spec.md` now covers HU-1 only; the pre-slicing spec is kept in `full-draft.md` for HU-2/HU-3 (see `specs/backlog.md`). HU-1 owner questions Q-1–Q-4 answered (spec answers 26–29). Round 3 audits the HU-1 spec.

## Clarification — 008-updater HU-1, round 3 (2026-11-11) · Verdict: not ready
Independent sdd-reviewer on the sliced spec; 1 high (H1), 13 medium (H2–H14), 8 low (L1–L8). Out-of-scope split verified: all 41 draft RFs accounted for.
Owner choices raised: H1 (creating `.bash_profile` hides `~/.profile`), H2 (custom area of a development clone), H3 (`--pack all` with custom packs; whole vs partial shadowing), H4 (what counts as a rigorkit clone; remote/ref override for tests), H5 (installer transport integrity), H6 (Cursor pasted rules with a per-machine path), H7 (`.bak` overwriting the user's own backup).
Fixable from recorded answers: H8–H14, L1–L8.
Owner answered H1–H7 (spec answers 30–36). Spec edited for all findings; new RF-48 (remote override), RF-49 (rendered rules), RF-50 (exit status). Agent-chosen defaults for owner review: unsupported default shell exits 0; `--help` wins over invalid options; rendered-rules bound uses a 100-character path; manual page committed as `man/rigorkit.1`.

## Clarification — 008-updater HU-1, round 4 (2026-11-11) · Verdict: not ready
Independent sdd-reviewer; 0 high, 15 medium (K1–K15), 11 low. Round-3 owner findings H1–H7 resolved; H8–H14/L1–L8 lacked per-finding records (K-L11).
Fixable from recorded answers: K1 (man path `man/man1/`), K2 (`--help` only before the script name), K3 (RF-44.F1 vs RF-50), K4 (custom folders only with a new clone), K5 (answer 34 into RF text), K6 (bad ref scenario), K7 (pin regression baseline to 3ee339e), K8 (non-executable custom script clause), K9 (define "loads `.bashrc`"), K10 (failure always non-zero; split RF-50), K11 (shadowing script scenario), K12 (symlinked startup files), K13 (MANPATH keeps system pages); lows L3–L11.
Owner choices raised: K14 (one-line installer: file, line, served ref, interpreter, success message), K15 (`rigorkit --help`/`-h`), L1 (`ZDOTDIR`), L2 (`~/.rigorkit` holding only `custom/`).
Two corrective rounds on the sliced spec with medium findings remaining: stopped and reported to the owner (sdd-clarify rule).
Owner answered K14, K15, L1, L2 (spec answers 38–41) and approved the round-3 agent defaults (answer 37). Per-finding resolutions:
- Round 3: H8 Commands definition; H9 manual page definition + RF-28 man drift; H10 RF-3 exceptions + RF-33 `--list`; H11 RF-47 name check + RF-47.S1; H12 RF-50; H13 NFR regression + INV-1 scope; H14 RF-29.S1 + NFR bound; L1 newest release tag definition; L2 default/installed shell definitions; L3 INV-3; L4 RF-3.E3; L5 RF-25 text; L6 RF-26.E2; L7 Baseline 0.1.0; L8 INV-2 note.
- Round 4: K1 `man/man1/`; K2 Definitions + RF-26 + RF-47.E3; K3 RF-44.F1; K4 INV-3, RF-44, RF-44.E2; K5 RF-1, RF-48; K6 RF-1.F3; K7 Baseline 0.1.0 = `3ee339e`; K8 RF-47 clause; K9 "Loads `.bashrc`" + RF-42.E2/E3; K10 RF-50 split into RF-50/RF-52; K11 RF-19.E3; K12 RF-42 + RF-42.S3; K13 RF-27 + RF-27.E2; K14 One-line installer definition + RF-1; K15 Commands definition + RF-25.E1; L1 `.zshrc` definition + RF-42.E4; L2 RF-51; L3 Acceptance + RF-52; L4 NFR Constitution; L5 Definitions; L6 Startup block markers; L7 Rules placeholder once; L8 Baseline normalization; L9 RF-48; L10 RF-25.H1; L11 this record.

## Clarification — 008-updater HU-1, round 5 (2026-11-11) · Verdict: not ready
Independent sdd-reviewer; 0 high, 5 medium (M1–M5), 9 low. All round-3/4 resolutions hold; K4, K9, K14 left adjacent gaps (M2, M3, M1).
Fixable: M1 (next-step command lacks `--agent`; check message and exit in RF-1.H1), M2 (RF-1 custom folders vs RF-51 byte-equal), M3 ("Loads `.bashrc`" for any file, quoted paths); lows L1–L10.
Owner choices raised: M4 (checked-out ref without `bin/rigorkit`), M5 (custom-pack scripts and shadowed official pack scripts in `rigorkit script`).
Owner had chosen to continue after round 4 (option A); continuing.
Owner answered M4, M5 (spec answers 42–43). Per-finding resolutions: M1 RF-1 message with `--agent` + RF-1.H1; M2 INV-3, RF-1, RF-51, RF-51.H1/S1; M3 "Loads `.bashrc`" + RF-54.E1; M4 RF-53 + RF-48.H1; M5 RF-47 order + RF-47.E4; L1 RF-43.F1 n/a; L2 RF-1.S1 marker via `bin/rigorkit`; L3 NFR note; L4 `git status` clean in RF-1.H1/RF-51.H1; L5 RF-3 exception + RF-3.E4; L6 Baseline normalization; L7 RF-52 split (RF-54), symlink as RF-55; L8 RF-47 name checks + RF-47.F3, RF-49.E2/F1; L9 idempotent startup block + RF-42.E5; L10 INV-4 backup next to the target.

## Clarification — 008-updater HU-1, round 6 (2026-11-11) · Verdict: not ready
Independent sdd-reviewer; 0 high, 2 medium (P1, P2), 9 low. All round-5 resolutions hold.
Resolutions: P1 RF-47 `--help` exception + RF-26.E3; P2 single-quoted path, RF-49 refuses `'`/newline + RF-49.E3; P3 RF-56; P4 byte order in RF-47; P5 RF-47 any first match; P6 RF-19 split (RF-57); P7 NFR lists `AGENTS.md` and `packs/core/README.md`; P8 RF-49 wording and whole-install refusal; P9 RF-1.H1; P10 RF-42 wording + RF-42.E5; P11 definition widened, indirect loading and `.bash_login` accepted limits.
Owner choices raised (low): P12 (warn when `RIGORKIT_REF`/`RIGORKIT_REMOTE` are ignored for an existing clone), P13 (custom pack named `all` or with `,`/space).
Owner answered P12, P13 (spec answers 44–45): RF-58, RF-59.

## Clarification — 008-updater HU-1, round 7 (2026-11-11) · Verdict: ready
Independent sdd-reviewer; 0 high, 0 medium, 10 low (Q1–Q10). All round-6 resolutions (P1–P13) hold. No owner decisions raised.
Lows carried to the plan without editing the spec (an edit would need a new round): Q1 scope RF-48 to new clones; Q2 scope RF-56 to the new-clone path; Q3 RF-49 refusal scope; Q4 quoting inside the startup block; Q5 `--help` as an option value; Q6 `install.sh --help` vs `rigorkit install --help`; Q7 `--list`/`--pack all` with a shadowed name; Q8 replace every placeholder occurrence; Q9 add `custom/` to `.gitignore`; Q10 dry-run temp files.
Pending: owner approval before plan.
Owner approved the HU-1 spec (WHAT) on 2026-11-11. Next: threat model before plan (security lane, packs/security/README.md:13).

## Clarification — round 8 trigger (2026-11-11)
Threat model approved (answer 46); spec edited with RF-60–RF-63 and INV-4 backup mode. Round 8 audits these edits and their consistency.

## Clarification — round 8 (2026-11-11) · Verdict: not ready
Independent sdd-reviewer; 0 high, 4 medium (R1–R4), 7 low. Fixed: R1 RF-60 user part; R2 RF-60 scoped to no clone + RF-58.E2; R3 RF-63 every file/folder; R5 RF-3 exception; R7 RF-63.F1; R8 empty ref and check-ref-format. Plan notes: R6 (HOME with a space, PC-3), R9 (older rigorkit earlier in PATH), R10 (set backup mode before writing). Owner choices raised: R4 (RF-63 vs existing custom/ and INV-3), R11 (existing and development clones not checked).
Owner answered R4, R11 (spec answers 47–48): RF-63 excludes existing custom/, RF-64 warns; residual recorded in threat-model.md.

## Clarification — round 9 (2026-11-11) · Verdict: not ready
Independent sdd-reviewer; 0 high, 2 medium (S1, S2), 5 low. All round-8 resolutions hold. Fixed: S2 RF-64 trigger + RF-64.E2; S3 RF-65; S4 RF-60 precedence; S5 RF-60.H1; S6 RF-64 unreadable path + RF-64.F1. Accepted: S7 (RF-61 keeps two behaviors). Plan notes: stub chmod for RF-63.F1; RF-51 temp folder via mktemp -d under $HOME. Owner choice raised: S1 (outcome when chmod fails in RF-63).
Owner answered S1 (spec answer 49): RF-63 failure leaves no clone and no block; RF-63.F1/E2.

## Clarification — round 10 (2026-11-11) · Verdict: not ready
Independent sdd-reviewer; 0 high, 1 medium (T1), 5 low. Fixed: T1 RF-50 covers custom-folder creation (clone kept, as for startup blocks) + RF-65.F1; T2 RF-65 'one-line installer'; T3 RF-64 scope; T4 RF-63 ordering; T5 INV-3 + RF-65.S1; T6 status header.

## Clarification — round 11 (2026-11-11) · Verdict: not ready
Independent sdd-reviewer; 0 high, 1 medium (U1), 4 low. Fixed: U1 RF-50 keeps the clone and other writes (except RF-56/RF-63) + RF-65.F1; U2/U3 RF-63 temporary folder for every new clone, own sentence; U4 RF-65.F1 Given; U5 message to create the folder by hand.

## Clarification — round 12 (2026-11-11) · Verdict: not ready
Independent sdd-reviewer; 0 high, 1 medium (V1, owner), 4 low. Round-11 resolutions hold. Fixed: V2 temporary folder removed in RF-63.F1/E2, RF-56.F1; V3/V4 RF-50 continue-and-keep wording, exception reworded, `mkdir -m 755` in the message. Plan notes: V5 (RF-63 'outside custom/' clause never matches in the temp folder; RF-65.F1 not valid as root). Owner choice raised: V1 (existing group/other-writable `~/.rigorkit` top folder in the RF-51 case).
Owner answered V1 (spec answer 50): RF-63 fixes the existing ~/.rigorkit folder in the RF-51 case + RF-63.E3.

## Clarification — round 13 (2026-11-11) · Verdict: not ready
Independent sdd-reviewer; 0 high, 1 medium (W1), 5 low. Round-12 resolutions hold. Fixed: W1 RF-63.F2 + folder fix before the move; W2 WHERE wording; W3 temporary folder removal in RF-56/RF-63 text; W4 RF-65.F1; W5 RF-64 covers custom/ itself; W6 threat-model residual. Plan note: a failed move into a non-writable existing ~/.rigorkit is handled as RF-56.

## Clarification — round 14 (2026-11-11) · Verdict: ready
Independent sdd-reviewer; 0 high, 0 medium, 3 low. All round-13 resolutions hold. Plan notes (spec not edited): X1 RF-53 refusal also removes the temporary folder (and RF-53.H1 checks it); X2 top-folder fix runs only after the RF-53 check passes. X3 fixed in threat-model.md wording.
Pending: owner approval of the spec with the threat-model additions before plan.
Owner approved the HU-1 spec with threat-model additions on 2026-11-11. Next: plan.
