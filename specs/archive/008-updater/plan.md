# Technical plan — 008-updater (HU-1 Install rigorkit with one line)
Date: 2026-11-11 · Status: approved by the owner on 2026-11-11 (plan + tasks, D1–D12). Inputs: `spec.md` (34 RFs, INV-1/3/4, 151 executable scenarios + 17 n/a rows), `threat-model.md` (SR-1–SR-4 → RF-60–RF-63; PC-1–PC-4), `clarification.md` round 14 ready; owner approved WHAT + threat model on 2026-11-11. Spec, clarification and threat model are not edited here.

## Current context
- `install.sh` (bash, 287 lines) is the only writer of user files today and a constitutional critical path (`specs/constitution.md:19`).
  - Root and globals `install.sh:17-20`; `SCRIPTS_DIR=$HOME/.local/share/rigorkit/scripts` `:20`; `usage()` prints the header comment `:2-14` via `:22`.
  - Argument loop `:34-58`: `--list` prints official packs only `:44-54`; `-h|--help` handled in order `:55`, so `--bogus --help` dies first `:56`.
  - `--pack all` expands to official folders only `:61-64`; unknown pack check `:258`; agents validated `:71-73`.
  - Rules: `rules_file` `:115-122`; `apply_rules` writes `$dst.bak` with plain `cp` `:134` (new backup keeps the source mode, an existing one keeps its own: threat T10), then `cat > "$dst"` `:135`, which already writes through a symbolic link; `merge_rules` `:139-152` copies raw `rules.md` (no rendering); `remove_rules` `:154-167`.
  - Scripts copied to `SCRIPTS_DIR` by `install_script` `:169-175`, called `:276`; uninstall message names that folder `:186`; uninstall iterates official `rules.md` only `:179`.
  - Cursor (no rules file) gets "paste $P/rules.md" `:273`. `mktemp` temp files leak if `die` runs inside `merge_rules` `:141-143`.
- `packs/core/rules.md:8` names `~/.local/share/rigorkit/scripts/`; measured 278 tokens (1,109 code points) by `node tools/measure-content.mjs --root . --baseline specs/changes/007-project-processes/baseline.txt` (read-only run, 2026-11-11: 0 errors). `tools/measure-content.mjs:120-121` caps every `rules.md` at 300; rules are not part of pack totals.
- Only `packs/core` has `rules.md` and `scripts/` (`first-error`, `json-peek`, `test-summary`).
- Repository checks: `node --test tools/test/*.test.mjs` (node:test, no package.json at root) is wired into CI at `.github/workflows/pages.yml` step "Existing toolkit regression" (ubuntu-latest, `actions/checkout@v6` shallow). Fixture helpers precedent: `tools/test/factory-fixture.mjs` (temp git repos via `execFileSync('git', …)`), `tools/fixtures/fixture-tools.mjs`. Scenario checker: `packs/sdd/skills/sdd-init/scripts/check-scenarios.mjs <spec> --tests <dir>` requires each non-`[manual]` scenario ID in a test file.
- No `bin/`, `man/`, `help/`, `tools/install-remote.sh` or `custom/` exist; `.gitignore` has no `custom/`. `install.sh` is mode 755.
- Consumers of the old script folder / `.bak` / raw rules: `AGENTS.md:4,26-29,65-66`, `specs/constitution.md:13,16-20`, `packs/core/README.md:10-13,22-29`, `README.md:91-124` (install section). Capability specs that describe installer behavior and get updated at archive time: `specs/capabilities/factory-lanes/spec.md:44`, `specs/capabilities/english-and-compact/spec.md:40`. The website imports `packs/**/*.md` (`site/scripts/prepare-docs.mjs:165`), so `rules.md` with `{{RIGORKIT}}` becomes a public reference page.
- Reused decisions: vault "2026-10-06 Toolkit de agentes multi-herramienta" (installer copies packs; `git pull` update path — still valid for development clones); repo learning `specs/learnings/003-budget-that-measures-the-past.md` (ratchet growth is a decision: none needed here). Precedent formats: `specs/changes/007-project-processes/{plan,tasks}.md`.

## Structure by layer / module
| Module | Change | RFs |
|---|---|---|
| `tools/install-remote.sh` (new, POSIX `sh`) | One-line installer: env validation, ref resolution, temp clone under `$HOME`, permission fix, RF-51 move, custom folders, startup blocks with backups, messages, exit status. Body in `main()` called on the last line | RF-1, 2, 42–45, 48, 50–56, 58, 60–65, INV-1, INV-3, INV-4 |
| `bin/rigorkit` (new, POSIX `sh`, 755) | Dispatch `install` → `exec install.sh`, `script`, `help`; `--help`/`-h`; resolves its clone through symlinks; `LC_ALL=C` | RF-25, 26, 46, 47, 61 |
| `help/rigorkit.txt`, `help/install.txt`, `help/script.txt`, `help/help.txt` (new) | Single help source, printed verbatim by `bin/rigorkit` and `install.sh --help` | RF-25, 26, 27, 28 |
| `tools/generate-man.mjs` (new, maintainer-run) | Generates `man/man1/rigorkit.1` from `help/*.txt`; `--check` mode | RF-27, 28 |
| `man/man1/rigorkit.1` (new, committed, generated) | Manual page | RF-27 |
| `install.sh` | Custom area discovery, `--list`/`all`/uninstall with custom packs, RF-59 warnings, shadow report, rules rendering, Cursor printed block, no script copy, `.rigorkit.bak` with mode via the real file, `--help` pre-scan from help source, temp-file trap | RF-3, 19, 29, 33, 46, 49, 57, 59, 62, INV-1, INV-3, INV-4 |
| `packs/core/rules.md` | Script line uses `{{RIGORKIT}} script <name>`; text shortened (budget below) | RF-29, 47, 49, NFR |
| `.gitignore` | `/custom/` | Definitions (custom area ignored), RF-1.H1/RF-51.H1 clean status, Q9 |
| `tools/test/rigorkit-fixture.mjs` (new) + 5 test files (Test strategy) | Temp HOME, toolbox PATH, stubs, local bare remote, baseline runner | all |
| `tools/fixtures/baseline-0.1.0/install.sh` (new, D8) | Byte copy of `install.sh` at `3ee339e` for regression | RF-3, RF-46 |
| `specs/constitution.md` | §7 `.rigorkit.bak` wording; critical-path rows for `tools/install-remote.sh` and `bin/rigorkit` | NFR Constitution |
| `AGENTS.md`, `packs/core/README.md`, `README.md` (D11) | New script call, rendered rules, Cursor printed block, `.rigorkit.bak`, layout (`bin/`, `help/`, `man/`, `custom/`), one-line install | NFR docs |

## Data model
No persistent data. File-system contracts:
- Clone: `~/.rigorkit` = git work tree with `VERSION`, `install.sh`, `bin/rigorkit`, `help/`, `man/man1/rigorkit.1`, `packs/`. Custom area `~/.rigorkit/custom/{packs,scripts}/` (git-ignored; identical for every clone, answer 31). Custom pack layout = official pack layout.
- Temporary clone: `mktemp -d "$HOME/.rigorkit-install.XXXXXX"` (mode 700, same file system as `~/.rigorkit`, so the move is a rename), clone into `<tmp>/rigorkit`.
- Startup block (written byte-exact from a quoted heredoc; `$HOME` stays literal, PC-3):
```sh
# rigorkit:start
case ":$PATH:" in *":$HOME/.rigorkit/bin:"*) ;; *) export PATH="$PATH:$HOME/.rigorkit/bin" ;; esac
case ":${MANPATH-}:" in *":$HOME/.rigorkit/man:"*) ;; *) export MANPATH="${MANPATH-}:$HOME/.rigorkit/man" ;; esac
# rigorkit:end
```
  Appends `bin` last (RF-61); idempotent per shell (RF-42.E5, RF-61.E1); no subprocess; safe under `set -u`. When `MANPATH` was unset the value starts with `:`, which man-db and the BSD `man` used by macOS read as "system path here" (RF-27.E2; verified by test on both, contingency in Risks). Preceded by one blank line when the file is non-empty; a missing final newline is completed first.
- Backup: `<real file>.rigorkit.bak`, where real file = final target of a symbolic-link chain; mode = original mode; never `<file>.bak`.
- Rendered rules: every `{{RIGORKIT}}` (Q8) → `'<ROOT>/bin/rigorkit'` (single quotes, RF-49), `ROOT` = clone `install.sh` ran from.

## Algorithms
### `tools/install-remote.sh` — `main()` (PC-1: file = header comments, function definitions, `main "$@"` as last line)
```
set -u; umask unchanged (RF-63 fixes modes instead); export GIT_ALLOW_PROTOCOL=https:ssh:file   # PC-2
trap 'cleanup_tmp' EXIT; trap 'exit 130' INT TERM HUP; T=$HOME/.rigorkit; failed=0
state = classify(T):  # never runs git inside an existing folder (its config could run code)
   absent | clone (-e T/.git && -f T/VERSION && -f T/install.sh) | custom_only (dir whose only entry, dotfiles included, is custom/) | other (file, empty dir, anything else)
other        -> RF-45 refuse naming T, exit 1 (nothing written)
clone        -> [RIGORKIT_REF set] or [RIGORKIT_REMOTE set] -> warn "ignored for an existing clone" (RF-58; values never validated or used, Q1/Q2)
                no T/bin/rigorkit -> RF-53 refuse, no block, exit 1 (RF-53.E1)
                -> write_blocks (no custom folders: RF-44, RF-44.E2); none missing -> "already installed" (RF-2)
absent | custom_only (new clone):
  1 remote = validate_remote()  # RF-48 + RF-60, pure string checks, before git
      unset -> https://github.com/harrypotter48/rigorkit.git; set-but-empty -> refuse
      https://H/P | ssh://[U@]H[:port]/P | U@H:P (no '/' before ':') -> refuse if value, U, H or P starts with '-'
      existing local directory -> refuse if value starts with '-'; pass as absolute physical path (cd && pwd -P)
      anything else (http://, git://, file://, missing path...) -> refuse naming it
  2 command -v git || RF-56 "git is required", exit 1
  3 ref: RIGORKIT_REF set -> refuse if empty, '-'*, or ! git check-ref-format --allow-onelevel "$ref" (RF-60)
  4 refs = git ls-remote --refs -- "$remote"          || RF-56 naming the remote (RF-1.F1)
      explicit ref: must be refs/heads/$ref or refs/tags/$ref || RF-56 naming it (RF-1.F3)
      default: newest of tags matching ^v[0-9]+\.[0-9]+\.[0-9]+$ (sort -t. -k1,1n -k2,2n -k3,3n on the stripped number) || RF-56 "no release exists" (RF-1.E1)
  5 tmp = mktemp -d "$HOME/.rigorkit-install.XXXXXX" || RF-56
  6 git -c advice.detachedHead=false clone --quiet --no-hardlinks --branch "$ref" -- "$remote" "$tmp/rigorkit" || RF-56 (remove tmp)
      (no --recurse-submodules; --no-hardlinks keeps a local remote's object files out of the chmod below)
  7 [ -f "$tmp/rigorkit/bin/rigorkit" ] || RF-53 refuse naming ref; tmp removed (X1)
  8 RF-63 fix in tmp: find "$tmp/rigorkit" ! -type l \( -perm -020 -o -perm -002 \) -> chmod go-w each (symlinks never followed);
      any chmod failure -> name path, remove tmp, no block, exit 1 (RF-63.F1); fixed any -> say so
  9 custom_only only, after step 7 (X2):
      T writable by group/other -> chmod go-w "$T" only; failure -> RF-63 failure (RF-63.F2); success -> say so (RF-63.E3)
      RF-64 scan of T/custom (read-only): each path with g/o write -> warn with "chmod go-w <path>"; each path ! -r or listed in find's stderr -> warn naming it; continue
      clone has a top entry that already exists in T (only possible: a tracked custom/) -> RF-56 (D7)
 10 move: absent -> mv "$tmp/rigorkit" "$T"; custom_only -> mv each top entry (incl. .git, dotfiles) into T;
      any mv failure -> move back what moved, remove tmp, RF-56 naming the cause (round-13 note); tmp removed after success
 11 custom folders (new clone only): for d in custom custom/packs custom/scripts: [ -d ] || mkdir -m 755 (RF-65, umask-independent);
      failure -> "cannot create <p>: run mkdir -m 755 <p>", failed=1, continue (RF-50, RF-65.F1)
 12 write_blocks
 13 print next step "open a new shell, then: rigorkit install --pack core --agent <agent> --global (agents: claude, codex, cursor, opencode)" (RF-1);
      RF-52 message if default shell not zsh/bash; RF-54 hint; exit failed (RF-50)
write_blocks:
  default = basename "${SHELL:-}"; files = []
  zsh installed (command -v): Z=${ZDOTDIR:-$HOME}/.zshrc -> add if exists-or-link, or create if default=zsh (RF-43), else skip
  bash installed: $HOME/.bashrc same rule with default=bash; $HOME/.bash_profile only if exists-or-link and !loads_bashrc (never created)
  for f in files: real = resolve_link(f) (readlink loop, max 40; broken -> error naming f, failed=1, next) (RF-55)
     has block (grep -qxF '# rigorkit:start' real; start without end -> error naming it) -> skip
     exists -> backup(real) || {error naming backup, failed=1, next} (RF-62.F1: original unchanged)
     append block to real (>>, keeps inode, mode, link) || {error naming f, failed=1}
  none written and all present -> "rigorkit is already installed" (RF-2)
loads_bashrc(file): strip comments (sed 's/#.*//'), delete quotes (tr -d "\"'"), grep -E
  '(^|[;&|({[:space:]])(\.|source)[[:space:]]+(~|\$HOME|\$\{HOME\})/\.bashrc([;&|)}[:space:]]|$)'
RF-54: default=bash && ! exists .bash_profile && !(exists .profile && loads_bashrc .profile) -> hint
backup(f): ( umask 077; cp -p "$f" "$f.rigorkit.bak.tmp.$$" ) && mv -f "$f.rigorkit.bak.tmp.$$" "$f.rigorkit.bak"
   (content never sits in a file looser than the original; an older looser backup is replaced, R10/RF-62.E1)
```
### `bin/rigorkit`
```
LC_ALL=C; resolve own path through symlinks -> ROOT=<clone>; CUSTOM=$HOME/.rigorkit/custom
case $1: ''|help|--help|-h -> (help with 0 args or these) cat help/rigorkit.txt, exit 0
         help: help <cmd> -> cat help/<cmd>.txt; unknown cmd or extra args -> error + list, exit 2 (RF-25.F1, RF-26.F1)
         install -> exec "$ROOT/install.sh" "$@"     (install.sh owns --help handling: one behavior, RF-46/Q6)
         script  -> [ "$2" = --help ] && only as first arg -> cat help/script.txt, exit 0 (RF-26.E3)
                    name: ''|-*|*/*|*..* -> error naming it, exit 2 (RF-47.F3, RF-47.S1)
                    first existing regular file among: $CUSTOM/scripts/$name; $CUSTOM/packs/*/scripts/$name (glob = byte order);
                       $ROOT/packs/*/scripts/$name where ! -d $CUSTOM/packs/<pack>
                    none -> "no script named <name>", exit 127; first match ! -x -> error naming it, exit 126 (no fallback, RF-47.F1)
                    shift 2; exec "$path" "$@"     (PC-4; no eval anywhere)
         *        -> --help/-h anywhere after a non-script command wins (RF-26.E2) else "unknown command" + list, exit 2
```
### `install.sh` deltas
```
trap 'rm -f "$TMPS"' EXIT (Q10: dry-run temp files only in $TMPDIR, always removed)
pre-scan "$@": any -h|--help (including as an option value, Q5) -> cat "$ROOT/help/install.txt"; exit 0   (RF-26.E1/E2, RF-46, Q6)
CUSTOM=$HOME/.rigorkit/custom; RENDER="'$ROOT/bin/rigorkit'"
custom_names: LC_ALL=C glob "$CUSTOM"/packs/*/ ; name = all | *,* | *[[:space:]]* -> warn to stderr once, drop (RF-59)
pack_dir(n): valid custom n -> $CUSTOM/packs/n else $ROOT/packs/n
all_names: official ∪ valid custom, LC_ALL=C sort -u (RF-33 `all`); --list prints all_names with contents of pack_dir;
   custom -> "<n>  (custom)"; shadowing -> "<n>  (custom, replaces the official pack)" (Q7: listed once); baseline output when no custom (RF-3.E2)
pack loop (:257): P=pack_dir; shadowing -> "  shadow custom pack <n> replaces the official one" (RF-19)
   official pack with scripts/: each name also in $CUSTOM/scripts -> "  shadow custom script <s> replaces the official one" (RF-57)
   scripts: never copied (RF-29); global scope -> "  scripts run from <ROOT> with rigorkit script <name>"
before any write: global scope and a selected pack has rules.md -> ROOT contains ' or newline -> die naming it (RF-49, Q3: also with --dry-run and Cursor; project scope and --uninstall-rules unaffected)
merge_rules: render src via awk with ENVIRON (no regex, no escape processing; $ ` \ safe, RF-49.E3) -> temp -> existing merge
cursor: print "  note   cursor has no global rules file: paste this block into Settings → Rules → User Rules:" + rendered text + "  end of block" (RF-49.E1, D10)
apply_rules: real = resolve_link(dst); existing real -> backup(real) (same algorithm as above) || die naming it; then cat > dst (write-through)
uninstall: names = official ∪ valid custom with rules.md in either; message "done. Scripts stay in the clone (<ROOT>)." (RF-3.E3/E4)
```

## Contracts
- CLI (help order): `rigorkit install [options]`, `rigorkit script <name> [args]`, `rigorkit help [<command>]`; `rigorkit`, `help`, `--help`, `-h` = same list, exit 0. Exit: 0 ok; 1 install/installer failures (as `install.sh` `die`); 2 usage errors in `bin/rigorkit`; 126/127 script not executable / not found; otherwise the script's own status (D6).
- `install.sh` options unchanged (RF-3); `rigorkit install` and `install.sh` share every byte of behavior because the former `exec`s the latter.
- Help source (D1): `help/<command>.txt`, English, sections in order `Usage:`, `Options:` (lines `  --opt[, -x] [ARG]  text`), `Examples:`, `Writes:`; `help/rigorkit.txt` holds `Commands:` lines `  <command> <args>  <purpose>` in Definitions order.
- Drift check (RF-28): commands = arms of the single dispatch `case` in `bin/rigorkit` (one arm per line, convention enforced by the test); install options = arms of the `case "$1"` loop in `install.sh`; documented = `Commands:`/`Options:` lines; man = `tools/generate-man.mjs --check` byte comparison. Failure names the command, option or `man/man1/rigorkit.1`.
- Rendered rules contract: `'<abs clone>/bin/rigorkit' script <name> [args]` inside a Markdown code span.
- Repo invariant (RF-61): `bin/` contains exactly `rigorkit`.

## Decisions
Derived from approved spec/threat model (no new approval needed):
- D-PC1 `main()` + last-line call over top-level statements: truncated download runs nothing (T2). Check: static test.
- D-PC2 `--` before every remote/path argument, `GIT_ALLOW_PROTOCOL=https:ssh:file`, no submodule flags; values starting with `-` refused earlier (RF-60). Check: static test + RF-60/RF-48.S1.
- D-PC3 quoted heredoc block with literal `$HOME` over the expanded path: no quoting/injection of a path with spaces or `$` (T6, R6). Check: HOME with a space.
- D-PC4 `exec "$path" "$@"`, no `eval` in `bin/rigorkit` (T8). Check: static grep test.
- D-R10 backup via `umask 077` + `cp -p` + `mv -f` over `chmod` after copy or GNU/BSD `stat`: mode set before content is exposed, portable. Check: RF-62.*.
- D-sym `--no-hardlinks` and `find ! -type l` for RF-63: chmod never reaches a local remote's objects or a symlink target outside the clone. Check: remote fixture modes unchanged; tag with a symlink to a HOME file.
- D-noGit `classify` uses file tests, never `git -C ~/.rigorkit`: an existing folder's git config cannot run code (`core.fsmonitor`). Check: RF-45/RF-53.E1 with a hostile `.git/config` fixture.
- D-order RF-53 check (step 7) precedes the top-folder fix (step 9, X2) and every refusal removes tmp (X1). Check: RF-53.H1 + RF-51 variant asserting `~/.rigorkit` mode `777` kept and no `.rigorkit-install.*` left.
- Bash 3.2 compatibility kept in `install.sh` (macOS default); no `readlink -f`, `stat`, `sed -i`, `realpath`, GNU `find` predicates anywhere (NFR platform).

New technical choices — **needs owner approval** (recommendation first):
- D1 Help source = plain-text `help/<command>.txt` printed with `cat` over: embedding help in `bin/rigorkit` (two shells would duplicate it, `install.sh` must print the same text), Markdown/roff as source (needs a renderer at runtime), a JSON/YAML spec (needs a parser in sh).
- D2 Man generator = `tools/generate-man.mjs` (Node, already the repo's tool runtime; maintainer only, never a user runtime) over `help2man`/`pandoc`/`ronn` (new dependencies) and a shell generator (roff escaping hard to test). Man header carries no date or version, so the check is deterministic.
- D3 Test harness = node:test integration tests in `tools/test/` that spawn `sh`/`bash`/`zsh` with a temp `HOME`/`TMPDIR`, `GIT_CONFIG_GLOBAL=/dev/null`, `GIT_CONFIG_NOSYSTEM=1`, a toolbox `PATH` of symlinks (to hide `git`, `zsh`, `bash`, `man`) and stubs (`chmod`, `git` wrappers), umask via `sh -c 'umask 000; exec …'`, and local bare remotes built per test. Runs in the existing CI step. Over bats/shellspec (new dependency). These tests execute `install.sh` and the installer in temp HOMEs: per `AGENTS.md:16` and the 007 precedent, running them needs owner authorization (or the owner runs them).
- D4 Platform-dependent tests skip with a printed reason when `zsh`, `man` or non-root are unavailable (ubuntu CI lacks zsh; root ignores modes); live evidence on the owner's macOS. Alternative: add `apt-get install zsh` to `pages.yml` (workflow change) — recommended later, not in HU-1.
- D5 `bin/rigorkit` in POSIX `sh` (same choice as the installer, answer 38) over bash.
- D6 `bin/rigorkit` exit codes 2/126/127 (shell conventions) over a single 1.
- D7 A checked-out ref that tracks a top-level entry already present in `~/.rigorkit` (only `custom/` is possible) is an RF-56 clone failure, checked before any move; a failed move is rolled back (round-13 note). Alternative "merge into custom/" violates INV-3.
- D8 Baseline 0.1.0 = byte copy `tools/fixtures/baseline-0.1.0/install.sh`, verified against `git show 3ee339e:install.sh` when that commit is available, over `fetch-depth: 0` in CI (workflow change, slower). Runs against the current `packs/` so only installer behavior is compared.
- D9 `packs/core/rules.md` text (below) and the budget interpretation: the 300 limit applies to the rendered `rules.md` content (what sits between the markers), markers excluded as in `tools/measure-content.mjs` today.
- D10 Cursor printed block format: one note line, rendered text verbatim (no markers, no indent, pasteable), closing line.
- D11 Update `README.md` install section with the one line and `rigorkit` (not named in the spec NFR; needed so users find the entry point). Minimal; no other README rewrite.
- D12 R9 (an older `rigorkit` earlier in `PATH` wins): document in `help/rigorkit.txt` and README only, no new runtime warning (a warning would be new observable behavior → spec gate).

Rejected alternatives worth recording: `curl | sh` piping (spec fixes `sh -c "$(curl …)"`); copying scripts and rewriting paths (answer 27); `.git/info/exclude` for `custom/` (not shipped with the clone); `sed` for rendering (`&`, `\`, delimiter escaping); `awk -v` (processes backslashes; `ENVIRON` used); creating `.bash_profile` (answer 30); prepending to `PATH` (T7).

### Rules text and budget (D9, NFR §8, RF-29.S1)
Estimator `ceil(NFC code points / 4)` (`tools/measure-content.mjs:9-10`). Rendering replaces 12 characters with `'<100-char clone>/bin/rigorkit'` = 115 characters (+103). Proposed edits to `packs/core/rules.md`:
- line 2 → `User/repo instructions override these.`
- line 8 → ``**Commands** Filter to errors/summary (`| tail -30`, `--silent`, `--quiet`). Before writing output-summary scripts run `{{RIGORKIT}} script <name>`: `test-summary <cmd>`, `first-error <cmd>`, `json-peek <file> [depth] [jq-path]`.``
- line 10 → `(spec → build → review)` instead of `(spec → implementation → review)`.

| Measure | Code points | Tokens | Limit |
|---|---:|---:|---:|
| Today committed | 1,109 | 278 | 300 |
| Proposed committed | 1,081 | 271 | 300 |
| Proposed rendered, 100-char clone path | 1,184 | 296 | 300 |
| (info) rendered incl. both markers | 1,240 | 310 | not measured today |
Margin: clone paths up to 116 characters stay ≤ 300. Placeholder inside a code span keeps the public site page literal. Check: `tools/test/008-repo-checks.test.mjs` renders through the real `install.sh` from a copy at a 100-character path and measures with `measureRepository` from `tools/measure-content.mjs` (reused estimator); `measure-content` keeps the committed cap.

### Content ratchet (§8)
No skill or agent Markdown changes; pack totals stay equal to the 007 baseline (architecture 1,623; core 1,134; design 1,839; frontend 1,208; sdd 14,401; security 1,254), identities unchanged, 0 errors expected; no new baseline. `rules.md` 278 → 271 (rules are capped, not ratcheted). `help/`, `man/`, README files are not measured content.

## Constitution
- §1–§6: unaffected (no members added/renamed; no tool-specific variants; rules stay self-contained).
- §7: amended as the approved NFR requires: "installer writes only between markers and keeps `<file>.rigorkit.bak` with the original's mode; never writes a user's own `.bak`; never replaces user instructions". Startup blocks use `# rigorkit:start/end` markers.
- §8: met with numbers above.
- Critical paths: add rows `tools/install-remote.sh` (writes `~/.rigorkit` and startup files; regression: one-line install in a temp HOME — new clone, RF-51, existing clone — and none of: change outside markers, second block on re-run, user `.bak` changed) and `bin/rigorkit` (runs `install.sh` and scripts; regression: `rigorkit install` project/global dry-runs + real install in a temp HOME, same three regressions). Existing `install.sh` row kept.
- Violations: none.

## Test strategy
All levels are automated integration tests through real `sh`/`bash`/`zsh`, real `git` and real files, unless marked static/unit. Harness (`tools/test/rigorkit-fixture.mjs`): `home()` temp HOME with `TMPDIR` inside the test root but outside HOME; `toolbox({without, stubs})`; `remote({tags, mainBin, withoutBin})` builds a bare repo from a copy of the working tree (`VERSION`, `install.sh`, `bin/`, `help/`, `man/`, `packs/`, `.gitignore`); `snapshot(dir)` = bytes + modes + link targets for INV checks; `run(cmd, {umask, env})`; `nonRoot`/`has('zsh')`/`has('man')` skip guards. Real HOME, real `~/.gitconfig` and network are never used (`RIGORKIT_REMOTE` is always a local path, `https://127.0.0.1:9/…` for "network down", or a stubbed git for SSH acceptance).

| Test file | Scenario IDs | Needs |
|---|---|---|
| `tools/test/008-install-remote.test.mjs` | RF-1.H1/E1/E2/F1/F2/F3/S1; RF-48.H1/E1/F1/S1; RF-60.H1/E1/F1/S1; RF-63.H1/E1/E2/E3/F1/F2/S1; RF-64.H1/E1/E2/F1/S1; RF-65.H1/E1/F1/S1; RF-51.H1/E1/F1/S1; RF-53.H1/E1/F1; RF-56.H1/E1/F1/S1; RF-58.H1/E1/E2/F1; RF-2.H1/E1; RF-44.H1/E1/E2/F1; RF-45.H1/E1/E2/F1/S1; plan checks X1, X2, round-13 failed move, D7, D-sym, D-noGit, INV-1 HOME diff | temp HOME, local bare remote with tags `v0.1.0` (no `bin/`), `v0.2.0`, `v0.10.0`, `main` with a marker-writing `bin/rigorkit`; toolbox without git (RF-1.F2); git stub that fails after a partial clone (RF-56.F1) and one that records argv (RF-48.E1); stubbed `chmod` always/only-on-`~/.rigorkit` (RF-63.F1/E2/F2); umask `000`/`022`; non-root for RF-64.F1, RF-65.F1, RF-44.F1 |
| `tools/test/008-startup-files.test.mjs` | RF-42.H1/E1/E2/E3/E4/E5/F1/S1/S2; RF-55.H1/E1/F1/S1; RF-61.H1/E1/S1; RF-43.H1/E1/E2; RF-62.H1/E1/F1; RF-50.H1/E1/F1; RF-52.H1/E1; RF-54.H1/E1; RF-27.E2; PC-3 (HOME with a space); block under `set -u` | toolbox controlling installed `zsh`/`bash` (stubs for "installed", real shells for "open a new shell"); `zsh -i -c`, `bash -i -c`, `bash -l -c`; `man -w`; non-root for F1 cases; skip guards (D4) |
| `tools/test/008-rigorkit-install.test.mjs` | RF-3.H1/E1/E2/E3/E4/F1/S1; RF-46.H1/E1/F1; RF-33.H1/E1/E2/E3/F1/S1; RF-59.H1/E1/F1/S1; RF-19.H1/E1/F1/S1; RF-57.H1/E1/F1/S1; RF-29.H1/E1/F1; RF-49.H1/E1/E2/E3/F1/S1; RF-62.S1; INV-1 dry-run tree diff | temp HOME and project; clone copies at paths with space, `$`/backtick/`\`, `'`, newline; baseline runner (D8) with normalization of stamps/`.rigorkit-version`/version and rendered path → placeholder |
| `tools/test/008-rigorkit-cli.test.mjs` | RF-47.H1/E1/E2/E3/E4/F1/F2/F3/S1; RF-25.H1/E1/F1; RF-26.H1/E1/E2/E3/F1; RF-27.H1/E1/F1 | fixture clone + custom area; `man -l` (skip guard); toolbox without `man` for RF-27.F1; generator run on a temp copy for RF-27.E1 |
| `tools/test/008-repo-checks.test.mjs` (static/unit) | RF-28.H1/E1/E2/F1 (on temp copies with mutated help/dispatch/man); RF-61.F1; RF-29.S1; PC-1, PC-2, PC-4 static; agent list in the installer's final message = `install.sh:72` list | none |

- Manual (live, Completion criteria): one-line install in a temp HOME on the owner's macOS (zsh 5.9, bash 3.2, BSD `man`) with new zsh and bash shells running `rigorkit help` and `man rigorkit`; plus the Critical DoD runs below. Automated tests skipped by D4 guards are reported as pending, never green.
- Scenario checker: `node packs/sdd/skills/sdd-init/scripts/check-scenarios.mjs specs/changes/008-updater/spec.md --tests tools/test` must report none missing (every executable scenario automated; no `[manual]` marker needed, so the spec stays unedited).
- Test-first: each block's tests are written first, run red for behavioral reasons (missing behavior, not import/harness errors), committed as `test(red): HU-1 …` only with owner approval; paths frozen: `tools/test/008-*.test.mjs`, `tools/test/rigorkit-fixture.mjs`, `tools/fixtures/baseline-0.1.0/`.
- Critical DoD (constitution table; regression against Baseline 0.1.0 `3ee339e`):
  1. `install.sh --dry-run` and `rigorkit install --dry-run` with `--project <tmp>` and `--global` (temp HOME): planned writes and rendered diff printed; HOME/project snapshots unchanged (INV-1, RF-3.E1, RF-49.S1).
  2. Real `--pack all --agent claude,codex,cursor,opencode` in `--project <tmp>` and `--global` (temp HOME): same files as the baseline fixture except RF-3 exceptions (no `~/.local/share/rigorkit/scripts`, rendered rules, `.rigorkit.bak` with mode, custom-pack lines) (RF-3.H1, RF-46.H1).
  3. Same output for `--version`, `--list` (no custom), unknown agent/option errors (RF-3.E2/F1, RF-46.F1).
  4. One-line install in a temp HOME: new clone, RF-51 case, existing clone; for each, no byte outside markers changes in any startup or rules file, a re-run adds no second block, a user's own `<file>.bak` stays byte-equal (RF-42.S1/S2, RF-2.E1, RF-3.S1, RF-55.S1).
  5. Rules budget committed and rendered (RF-29.S1) + content ratchet 0 errors.
- Commands are run by the owner or with explicit authorization (installation category); agents may run `node tools/measure-content.mjs` and the static/unit file.

## Risks and cross-layer
| Risk | Producer → consumer | Check / tasks |
|---|---|---|
| Startup file damaged outside markers or block duplicated | installer → user shells | Append-only write, `grep -qxF` marker detection; RF-42.S1, RF-55.S1, RF-2.E1 (3 runs); T13, T15 |
| Secrets exposed in backups | backup → other local users | D-R10; RF-62.H1/E1/S1; T9, T14 |
| Option injection / transport downgrade | env → git/ssh | RF-60 pure-string checks before git, `--`, `GIT_ALLOW_PROTOCOL`; RF-60.*, RF-48.S1, static PC-2; T16 |
| chmod reaches outside the clone (hardlinks, symlinks) | RF-63 fix → local remote / HOME files | D-sym tests; T16 |
| Partial state after failure (tmp left, half-moved clone, block without clone) | ordered steps 1–13 | RF-56.*, RF-63.F1/E2/F2, RF-53.H1 + X1/X2/round-13 tests assert HOME listing; T13, T16 |
| Custom area modified | installer, `install.sh`, `rigorkit script` → `custom/` | `snapshot` equality in every custom scenario (RF-51.S1, RF-64.S1, RF-33.S1, RF-19.S1, RF-57.S1, RF-59.S1); B2/B3 |
| Regression of `install.sh` output/files | `install.sh` → agent folders | Baseline runner D8; Critical DoD 1–3; T6, T12 |
| `rules.md` over budget when rendered | `rules.md` → every agent turn | 008-repo-checks budget test + measure-content; T10 |
| Help/man drift | `bin/rigorkit`, `install.sh` ↔ `help/`, `man/` | RF-28 tests in CI step; T2–T4 |
| GNU vs BSD differences (mktemp, find -perm, readlink, sort, man MANPATH semantics, bash 3.2) | scripts → macOS/Linux | Tests on Linux CI + owner macOS run; banned-construct static grep (`readlink -f`, `stat -`, `sed -i`, `realpath`, `mapfile`, `declare -A`); B1–B3 |
| Leading-colon `MANPATH` not honored by some `man` | startup block → `man ls` | RF-27.E2 on both platforms; contingency (within spec): set `MANPATH` only when already set and rely on `PATH`-derived `bin/../man`, which both man implementations search; T15 |
| Locale changes pack/script order | glob order → RF-47 resolution, `--list` | `LC_ALL=C` in `bin/rigorkit` and sorted union in `install.sh`; RF-47.E4; B1/B2 |
| `{{RIGORKIT}}` on the public website | `packs/core/rules.md` → `site/scripts/prepare-docs.mjs` | placeholder inside a code span; owner runs existing `site` `test:unit` (website check/build stay with the owner, `AGENTS.md:72`); T10, T12 |
| Tests touch the real HOME or network | harness → developer machine | explicit env (`HOME`, `TMPDIR`, `GIT_CONFIG_*`, `SHELL`, `ZDOTDIR` unset, `CODEX_HOME` unset); local remotes only; T1 |
| CI shallow clone lacks `3ee339e` | baseline test | D8 vendored fixture with optional hash check; T6 |
| Concurrent install creates `~/.rigorkit` between check and move | installer | accepted residual (single interactive user); `mv` target re-checked right before the move; T16 |
| Existing 0.1.0 installs keep old rules/scripts until reinstall | old rules → `~/.local/share/...` | unchanged and still working (out of scope, HU-2); README note; T17 |
| Capability specs describe old installer behavior | `specs/capabilities/*` | updated by sdd-archive at close; T17 |

Plan-note resolutions (decision + check):
| Note | Resolution | Check |
|---|---|---|
| PC-1 | `main "$@"` last line, nothing else top-level | static test (008-repo-checks) |
| PC-2 | `--`, `GIT_ALLOW_PROTOCOL=https:ssh:file`, no submodules | static test + RF-48.S1, RF-60.* |
| PC-3 | quoted heredoc, literal `$HOME` | HOME with a space + static assertion of block bytes |
| PC-4 | `exec "$path" "$@"`; no `eval` | static test |
| Q1 | RF-48/RF-60 validation only on the new-clone path; existing clone → RF-58 warning | RF-58.F1/E2 |
| Q2 | RF-56 only on the new-clone path | RF-58.H1 (no git calls with an existing clone; git stub records none) |
| Q3 | RF-49 refusal only when the run would render rules (global + pack with `rules.md`, Cursor included, dry-run included) | RF-49.F1 + project-scope install from a `'` path succeeds |
| Q4 | block quotes `$PATH`/`$HOME` expansions; literal `$HOME` | PC-3 test |
| Q5 | `--help`/`-h` anywhere in `install` args wins, also as an option value | RF-26.E1/E2 + `--pack --help` test |
| Q6 | `install.sh --help` and `rigorkit install --help` print the same `help/install.txt` | RF-46 parity test |
| Q7 | shadowed name listed once with "(custom, replaces the official pack)"; `all` includes it once | RF-33.E2, RF-19.H1 |
| Q8 | replace every occurrence | unit test with two placeholders |
| Q9 | `/custom/` in `.gitignore` | RF-1.H1, RF-51.H1 `git status` clean |
| Q10 | dry-run temp files only in `$TMPDIR`, removed by trap | INV-1 dry-run snapshot + empty test TMPDIR after run |
| R6 | = PC-3 | HOME with a space |
| R9 | D12 (documentation only) | help text review |
| R10 | D-R10 | RF-62.E1 |
| S-round | `chmod` stubbed through toolbox PATH; tmp via `mktemp -d` under `$HOME` | RF-63.F1/E2/F2; tmp-name assertion |
| V5 | tmp clone has no `custom/` (D7 guarantees), so RF-63 fixes the whole tmp clone; RF-65.F1 and other mode-denial scenarios skip as root | RF-63.S1; skip guard |
| Round 13 | failed move = RF-56 with rollback | `~/.rigorkit` mode 555 test |
| X1 | RF-53 refusal removes tmp | RF-53.H1 asserts no `.rigorkit-install.*` |
| X2 | top-folder fix after RF-53 | RF-51 + `v0.1.0` test keeps mode 777 |

## Review profile
`sdd-reviewer` + `architecture-reviewer` + `security-reviewer` (approved, threat-model.md §6), each on the same spec/plan/full diff/results without peer reports.

## Approval boundary
Owner approval of this plan + tasks authorizes only the listed blocks and D1–D12 as approved. Running installation-type tests, red/green commits, CI workflow changes, push and merge each keep their own authorization.
