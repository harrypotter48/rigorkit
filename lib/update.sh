#!/usr/bin/env bash
# rigorkit update (010-update, HU-2). Help: help/update.txt.
# Phase 1 (the running code): one update at a time, refuse local changes, fetch release tags, check the
# newest tag (VERSION, ancestry), repair execute bits, move ~/.rigorkit, then exec phase 2 of the NEW code.
# Phase 2: changelog, state, shadows, startup blocks, global refresh, new packs, old scripts, record version.
# The body runs from main(), called on the last line, so a checkout that replaces this file mid-run is safe.
set -u

CODE="$(cd "$(dirname "$0")/.." && pwd -P)"   # the running code (install.sh, lib/)
ROOT="$CODE"   # the release content read by phase 2: the staged release in a dry run (never executed)
CLONE="$HOME/.rigorkit"
STATE="$HOME/.local/state/rigorkit"
REC="$STATE/global"
OLDDIR="$HOME/.local/share/rigorkit/scripts"
. "$CODE/lib/common.sh"

DRY=0; IA=0; NO=0; FAILED=0; UNANSWERED=0; ASKED=0; REFRESH=0; LOCKED=0; STAGE=""; DRYTMP=""
SKIPPED=(); PENDING=()
[ -t 0 ] && [ -t 2 ] && IA=1

err() { say_safe "rigorkit: $*" >&2; }
git_safe() { # git with the check's hardening (SR-3, PC-2)
  GIT_TERMINAL_PROMPT=0 GIT_ASKPASS=false SSH_ASKPASS=false GIT_SSH_COMMAND='ssh -o BatchMode=yes' \
    GIT_ALLOW_PROTOCOL=https:ssh:file git -C "$CLONE" "$@" </dev/null
}
ask() { # question key -> status 0 on yes (y/yes); records no, skips or prints in a dry run
  ASKED=1
  if [ "$DRY" -eq 1 ]; then say_safe "would ask: $1"; return 1; fi
  # Only refresh questions decide the recorded global version (RF-19); an unanswered one counts (RF-30).
  if [ "$IA" -eq 0 ]; then SKIPPED+=("$2"); [ "$REFRESH" -eq 1 ] && UNANSWERED=1; return 1; fi
  local a=""
  printf '%s [y/N] ' "$1" | print_safe | tr -d '\n' >&2
  read -r a || a=""
  case "$a" in [yY]|[yY][eE][sS]) return 0 ;; esac
  [ "$REFRESH" -eq 1 ] && NO=1; PENDING+=("$2"); return 1
}
ask_ok() { # question key -> 0 overwrite, 1 keep, 2 unanswered
  ASKED=1
  if [ "$DRY" -eq 1 ]; then say_safe "would ask: $1"; return 2; fi
  if [ "$IA" -eq 0 ]; then SKIPPED+=("$2"); UNANSWERED=1; return 2; fi
  local a=""
  printf '%s [o/k] ' "$1" | print_safe | tr -d '\n' >&2
  read -r a || a=""
  case "$a" in [oO]|[oO][vV][eE][rR][wW][rR][iI][tT][eE]) return 0 ;; [kK]|[kK][eE][eE][pP]) return 1 ;; esac
  UNANSWERED=1; PENDING+=("$2"); return 2
}
show_diff() { diff -ru -x .rigorkit "$1" "$2" 2>/dev/null | tail -n +3 | sed 's/^/    /' | print_safe; }

write_state() { # newest: checked now, declined cleared; agent notice removed
  [ -L "$STATE" ] && return 0
  ( umask 077; mkdir -p "$STATE" ) 2>/dev/null || return 0
  local t
  t="$( (umask 077; mktemp "$STATE/check.XXXXXX") 2>/dev/null )" || return 0
  printf 'checked=%s\nnewest=%s\ndeclined=\n' "$(date +%s)" "$1" > "$t" && mv -f "$t" "$STATE/check" || rm -f "$t"
  rm -f "$STATE/notice"
}

# --- phase 1 -------------------------------------------------------------------------------------------
lock() { # one update at a time (RF-32): a folder with the owner's pid; a dead or old empty lock is taken over
  local L="$STATE/update.lock" pid moved
  [ -L "$STATE" ] && { err "$STATE is a symbolic link; not updating"; exit 1; }
  ( umask 077; mkdir -p "$STATE" ) 2>/dev/null
  if ! ( umask 077; mkdir "$L" ) 2>/dev/null; then
    pid="$(cat "$L/pid" 2>/dev/null)"
    if [[ "$pid" =~ ^[0-9]+$ ]] && kill -0 "$pid" 2>/dev/null; then err "another rigorkit update is running (pid $pid)"; exit 1; fi
    if [ -z "$pid" ] && [ -z "$(find "$L" -prune -mmin +1 2>/dev/null)" ]; then err "another rigorkit update is running"; exit 1; fi
    moved="$STATE/update.lock.stale.$$"
    mv "$L" "$moved" 2>/dev/null || { err "another rigorkit update is running"; exit 1; }
    if [ "$(cat "$moved/pid" 2>/dev/null)" != "$pid" ]; then   # someone else took it meanwhile: give it back
      [ -e "$L" ] || mv "$moved" "$L" 2>/dev/null; err "another rigorkit update is running"; exit 1
    fi
    rm -rf "$moved"
    ( umask 077; mkdir "$L" ) 2>/dev/null || { err "another rigorkit update is running"; exit 1; }
  fi
  echo $$ > "$L/pid"; LOCKED=1
}
owns_lock() { [ "$(cat "$STATE/update.lock/pid" 2>/dev/null)" = "$$" ]; }
unlock() { if [ "$LOCKED" -eq 1 ] && owns_lock; then rm -rf "$STATE/update.lock"; fi; return 0; }
cleanup() { [ -n "$STAGE" ] && rm -rf "$STAGE"; [ -n "$DRYTMP" ] && rm -rf "$DRYTMP"; unlock; }

local_changes() { # porcelain paths except execute-bit-only changes of official helper scripts
  local line p
  git -C "$CLONE" status --porcelain=v1 --untracked-files=all 2>/dev/null | while IFS= read -r line; do
    p="${line:3}"
    case "$p" in
      packs/*/scripts/*)
        if [ "$(git -C "$CLONE" diff --numstat -- "$p")" = "0	0	$p" ] && git -C "$CLONE" diff --summary -- "$p" | grep -q 'mode change'; then continue; fi ;;
    esac
    printf '%s\n' "$p"
  done
}
fix_exec_bits() { # official helper scripts without the user execute bit (RF-26)
  local f rel
  for f in "$CLONE"/packs/*/scripts/*; do
    [ -f "$f" ] && [ ! -L "$f" ] && [ ! -x "$f" ] || continue
    rel="${f#"$CLONE"/}"
    if [ "$DRY" -eq 1 ]; then say_safe "would make executable: $rel"
    elif chmod u+x "$f" 2>/dev/null; then say_safe "made executable: $rel"
    else err "cannot make $rel executable"; fi
  done
}

phase1() {
  local current newest out remote changes tagged old
  [ -d "$CLONE/.git" ] || { err "$CLONE is not a git clone; reinstall rigorkit"; exit 1; }
  [ "$DRY" -eq 1 ] || lock
  current="$(tr -d ' \t\r\n' < "$CLONE/VERSION" 2>/dev/null)"
  changes="$(local_changes)"
  if [ -n "$changes" ]; then
    err "local changes in $CLONE; move them to $CLONE/custom and run rigorkit update again:"
    printf '%s\n' "$changes" | sed 's/^/  /' | print_safe >&2
    exit 1
  fi
  remote="$(git -C "$CLONE" remote get-url origin 2>/dev/null)"
  if ! out="$(git_safe fetch --quiet --no-recurse-submodules -- origin 'refs/tags/*:refs/tags/*' 2>&1)"; then
    err "cannot read the remote $remote:"; printf '%s\n' "$out" | sed 's/^/  /' | print_safe >&2; exit 1
  fi
  newest="$(git -C "$CLONE" tag -l 'v*' | sed 's/^v//' | sort_versions | tail -1)"
  if [ -z "$newest" ] || ! valid_version "$current" || ! newer "$newest" "$current"; then
    if ! valid_version "$current"; then say_safe "the VERSION of $CLONE is not a valid version; not moving it"
    elif [ -z "$newest" ]; then echo "no release found on $remote"
    elif [ "$newest" = "$current" ]; then echo "rigorkit is up to date ($current)"
    else say_safe "rigorkit $current is newer than the newest release $newest"; fi
    fix_exec_bits
    [ "$DRY" -eq 1 ] || write_state "${newest:-}"
    phase2 "$current"
    return
  fi
  tagged="$(git -C "$CLONE" show "v$newest:VERSION" 2>/dev/null | head -c 64 | tr -d ' \t\r\n')"
  if [ "$tagged" != "$newest" ]; then
    valid_version "$tagged" || tagged=invalid
    err "release v$newest declares version $tagged; not updating"; exit 1
  fi
  if ! git -C "$CLONE" merge-base --is-ancestor HEAD "v$newest^{commit}" 2>/dev/null; then
    err "release v$newest does not descend from your clone (rewritten history?); not updating"; exit 1
  fi
  if [ -n "$(git -C "$CLONE" ls-tree -r --name-only "v$newest" -- custom 2>/dev/null)" ]; then   # INV-3
    err "release v$newest tracks files under custom/, which updates never touch; not updating"; exit 1
  fi
  fix_exec_bits
  echo "rigorkit $current -> $newest"
  if [ "$DRY" -eq 1 ]; then   # this code reads the staged release; nothing from it runs (threat model M1)
    DRYTMP="$(mktemp -d)"
    mkdir "$DRYTMP/new" && git -C "$CLONE" archive "v$newest" | tar -x -C "$DRYTMP/new" || { err "cannot read release v$newest"; exit 1; }
    ROOT="$DRYTMP/new"
    phase2 "$current"
    exit $?
  fi
  old="$(git -C "$CLONE" rev-parse HEAD)"
  # git can report a file it could not write and still exit 0: a clean work tree is the real success test.
  if ! out="$(git -C "$CLONE" -c advice.detachedHead=false checkout --quiet --detach "v$newest" 2>&1)" ||
     [ -n "$(local_changes)" ]; then
    git -C "$CLONE" -c advice.detachedHead=false checkout --quiet --force --detach "$old" >/dev/null 2>&1
    git -C "$CLONE" reset --quiet --hard "$old" >/dev/null 2>&1
    git -C "$CLONE" clean -fdq >/dev/null 2>&1   # only files the failed move added: RF-13 left none before it
    err "cannot move $CLONE to v$newest:"; printf '%s\n' "$out" | sed 's/^/  /' | print_safe >&2; exit 1
  fi
  # Phase-2 contract (kept by every release): the clone's lib/update.sh, run by the lock owner (same pid,
  # exec) with RK_UPDATE_FROM=<previous version> and no arguments.
  exec env RK_UPDATE_FROM="$current" bash "$CLONE/lib/update.sh"
}

# --- phase 2 -------------------------------------------------------------------------------------------
changelog() { # from to: sections of released versions in (from, to] from this code's changelog (RF-11)
  local v
  git -C "$CLONE" tag -l 'v*' | sed 's/^v//' | sort_versions | while IFS= read -r v; do
    if valid_version "$1" && ! newer "$v" "$1"; then continue; fi
    newer "$v" "$2" && continue
    if grep -qxF "## $v" "$ROOT/CHANGELOG.md" 2>/dev/null; then
      awk -v h="## $v" '$0==h{f=1; print; next} f && /^## /{exit} f' "$ROOT/CHANGELOG.md" | print_safe
    else
      echo "no changelog entry for $v"
    fi
  done
}
shadows() { # RF-25, RF-26 (custom scripts)
  local c="$CLONE/custom" f n
  [ -d "$c" ] || return 0
  if [ ! -r "$c" ] || [ ! -x "$c" ]; then say_safe "warning: cannot read the custom area $c"; return 0; fi
  for f in "$c"/scripts/*; do
    [ -e "$f" ] || continue
    n="$(basename "$f")"
    ls "$ROOT"/packs/*/scripts/"$n" >/dev/null 2>&1 && say_safe "custom script $n shadows the official one"
    [ -f "$f" ] && [ ! -x "$f" ] && say_safe "custom/scripts/$n is not executable (custom scripts are only reported)"
  done
  for f in "$c"/packs/*/; do
    [ -d "$f" ] || continue
    n="$(basename "$f")"
    [ -d "$ROOT/packs/$n" ] && say_safe "custom pack $n shadows the official one"
  done
  return 0
}

startup_blocks() { # RF-17
  local new="$ROOT/lib/startup-block.txt" f r seen="" cur tmp
  [ -f "$new" ] || return 0
  for f in "${ZDOTDIR:-$HOME}/.zshrc" "$HOME/.zshrc" "$HOME/.bashrc" "$HOME/.bash_profile"; do
    [ -f "$f" ] || continue
    r="$(real_file "$f")" || continue
    case "$seen" in *"|$r|"*) continue ;; esac
    seen="$seen|$r|"
    grep -qxF '# rigorkit:start' "$r" || continue
    if ! grep -qxF '# rigorkit:end' "$r"; then say_safe "$f has '# rigorkit:start' without '# rigorkit:end'; skipped"; continue; fi
    cur="$(mktemp)"; awk '$0=="# rigorkit:start"{f=1} f{print} $0=="# rigorkit:end"{f=0}' "$r" > "$cur"
    if cmp -s "$cur" "$new"; then rm -f "$cur"; continue; fi
    diff -u "$cur" "$new" | tail -n +3 | sed 's/^/    /' | print_safe
    rm -f "$cur"
    if ask "Rewrite the rigorkit startup block in $f?" "$f"; then
      tmp="$(mktemp)"
      awk -v nf="$new" '$0=="# rigorkit:start"{while ((getline l < nf) > 0) print l; skip=1; next}
        skip && $0=="# rigorkit:end"{skip=0; next} !skip' "$r" > "$tmp"
      if backup "$r" && replace_file "$r" "$tmp"; then say_safe "  rewrote $f"; else err "cannot rewrite $f"; fi
      rm -f "$tmp"
    fi
  done
}

# Global refresh (RF-19–RF-23, RF-27, RF-28). Record edits go to $EDITS and are applied at once.
rules_file() { # home codex-home agent -> global instructions file
  case "$3" in claude) echo "$1/.claude/CLAUDE.md" ;; codex) echo "$2/AGENTS.md" ;; opencode) echo "$1/.config/opencode/AGENTS.md" ;; *) echo "" ;; esac
}
rec_field() { # path field -> value of the first copy line for path
  awk -F'\t' -v p="$1" -v n="$2" '$1=="copy" && $5==p { print $n; exit }' "$REC"
}
pack_dir() { # pack -> its folder (a valid custom pack wins), empty when none
  local n="$1"
  case "$n" in ''|all|-*|*/*|*..*|*,*|*[[:space:]]*) return 0 ;; esac
  if [ -d "$CLONE/custom/packs/$n" ]; then echo "$CLONE/custom/packs/$n"; elif [ -d "$ROOT/packs/$n" ]; then echo "$ROOT/packs/$n"; fi
}
write_copy() { # kind staged real -> status; the old entry is renamed aside first (never written through a
  # link, never half-deleted: INV-6), the new one renamed in, then the old one removed
  local t="$3.rigorkit-new.$$" o="$3.rigorkit-old.$$"
  rm -rf "$t" 2>/dev/null
  if ! mkdir -p "$(dirname "$3")" 2>/dev/null || ! cp -R "$2" "$t" 2>/dev/null; then rm -rf "$t" 2>/dev/null; return 1; fi
  if [ -L "$3" ] || [ -e "$3" ]; then mv "$3" "$o" 2>/dev/null || { rm -rf "$t"; return 1; }; fi
  if ! mv "$t" "$3" 2>/dev/null; then rm -rf "$t"; [ -L "$o" ] || [ -e "$o" ] && mv "$o" "$3" 2>/dev/null; return 1; fi
  if [ -L "$o" ] || [ -e "$o" ]; then rm -rf "$o" 2>/dev/null || say_safe "warning: could not remove $o"; fi
  return 0
}
replace_file() { # real-file content-file: a temporary file in the same folder with the original mode, renamed in
  local t="$1.rigorkit-new.$$"
  if [ -f "$1" ]; then cp -p "$1" "$t" 2>/dev/null || return 1; fi
  if cat "$2" > "$t" 2>/dev/null && mv -f "$t" "$1" 2>/dev/null; then return 0; fi
  rm -f "$t"; return 1
}
apply_edits() { # EDITS lines: fp <path> <fp> <declined> | add <copy line fields...> | rules <file> <pack> <fp>
  [ -s "$EDITS" ] || return 0
  local t
  t="$( (umask 077; mktemp "$STATE/global.XXXXXX") 2>/dev/null )" || { err "cannot update the global record"; FAILED=1; return; }
  if { cat "$EDITS"; echo '@@record@@'; cat "$REC"; } | awk -F'\t' -v OFS='\t' '
      $0=="@@record@@" { rec=1; next }
      !rec && $1=="fp" { FP[$2]=$3; DC[$2]=$4; next }
      !rec && $1=="add" { k=$6 FS $5; if (!(k in A)) ao[++na]=k; A[k]="copy" OFS $3 OFS $4 OFS $5 OFS $6 OFS $7 OFS $8; next }
      !rec && $1=="rules" { R[$2 FS $3]=$4; next }
      rec && $1=="copy" { k=$5 FS $4; if (k in A) { print A[k]; delete A[k]; next }
        if ($5 in FP) { if (FP[$5]!="=") $6=FP[$5]; if (DC[$5]!="=") $7=DC[$5] } print; next }
      rec && $1=="rules" { if (($4 FS $2) in R) $5=R[$4 FS $2]; print; next }
      rec { print }
      END { for (i=1;i<=na;i++) if (ao[i] in A) print A[ao[i]] }' > "$t" && mv -f "$t" "$REC"; then : > "$EDITS"; return 0; fi
  rm -f "$t"; err "cannot update the global record"; FAILED=1
}

refresh() {
  local from="$1" to="$2"
  if [ ! -e "$REC" ]; then
    if [ -f "$HOME/.rigorkit-version" ]; then
      echo "Your global scope has no rigorkit record, so updates cannot manage it. Record it once with:"
      echo "  rigorkit install --global --pack <packs> --agent <agents>"
      echo "without --force: copies that differ are kept and asked one by one at the next update."
    fi
    return 0
  fi
  if ! record_valid "$REC"; then
    say_safe "The global record $REC cannot be read, so updates cannot manage your global scope."
    echo "Run rigorkit install --global --pack <packs> --agent <agents>: it moves the record aside and starts a new one."
    return 0
  fi
  REFRESH=1
  if ! command -v shasum >/dev/null 2>&1 && ! command -v sha256sum >/dev/null 2>&1; then
    err "neither shasum nor sha256sum is installed; the global scope cannot be compared"; FAILED=1; return 0
  fi
  local recver pairs packs p agents stage models d path rel staged kind fp
  recver="$(awk -F'\t' '$1=="version"{print $2; exit}' "$REC")"
  pairs="$(awk -F'\t' '$1=="pair"{print $2 "\t" $3}' "$REC")"
  packs="$(printf '%s\n' "$pairs" | cut -f1 | awk 'NF && !s[$0]++')"
  stage="$(mktemp -d)"; STAGE="$stage"; EDITS="$stage/edits"; : > "$EDITS"; : > "$stage/failed"
  mkdir -p "$stage/h/.rigorkit"
  [ -d "$CLONE/custom" ] && ln -s "$CLONE/custom" "$stage/h/.rigorkit/custom"
  models="${RIGORKIT_MODELS:-$HOME/.config/rigorkit/models}"
  # install.sh is the one writer of copy content: each recorded pack is installed into a staging HOME,
  # and the staging record lists every copy it ships with its fingerprint.
  while IFS= read -r p <&3; do
    agents="$(printf '%s\n' "$pairs" | awk -F'\t' -v p="$p" '$1==p{print $2}' | paste -sd, -)"
    d="$(pack_dir "$p")"
    if [ -z "$d" ]; then say_safe "pack $p is no longer shipped; its copies are left as they are"; continue; fi
    if ! HOME="$stage/h" CODEX_HOME="$stage/h/.codex-home" RIGORKIT_MODELS="$models" RK_RENDER_ROOT="$CLONE" RK_PACKS_ROOT="$ROOT" RK_STAGE=1 \
        bash "$CODE/install.sh" --global --force --pack "$p" --agent "$agents" > "$stage/log" 2>&1 </dev/null; then
      err "cannot prepare pack $p:"; sed 's/^/  /' "$stage/log" | print_safe >&2
      echo "$p" >> "$stage/failed"; FAILED=1
    fi
  done 3<<< "$packs"
  : > "$stage/items"   # kind <tab> pack <tab> agent <tab> real path <tab> new fingerprint
  if [ -f "$stage/h/.local/state/rigorkit/global" ]; then
    awk -F'\t' -v OFS='\t' -v h="$stage/h/" -v home="$HOME/" '$1=="copy" && index($5, h)==1 { print $2, $3, $4, home substr($5, length(h) + 1), $6 }' \
      "$stage/h/.local/state/rigorkit/global" > "$stage/items"
  fi

  # Recorded copies of recorded pairs that the clone no longer ships (RF-28).
  local k
  awk -F'\t' 'FNR==NR { have[$4]=1; next } $1=="copy" && !($5 in have) && !seen[$5]++ { print $5 "\t" $3 }' "$stage/items" "$REC" > "$stage/notshipped"
  while IFS="$TAB" read -r path p <&3; do
    grep -q "^$p	" <<< "$pairs" || continue
    grep -qxF -- "$p" "$stage/failed" && continue
    say_safe "$path: no longer shipped by pack $p; left as it is"
  done 3< "$stage/notshipped"

  # Classify each path once (RF-20, RF-22).
  : > "$stage/group"; : > "$stage/edited"
  local recfp declined newfp curfp ref
  while IFS="$TAB" read -r kind p a path fp <&3; do
    grep -qxF "$path" "$stage/done" 2>/dev/null && continue
    echo "$path" >> "$stage/done"
    newfp="$fp"
    recfp="$(rec_field "$path" 6)"; declined="$(rec_field "$path" 7)"
    if [ ! -e "$path" ] && [ ! -L "$path" ]; then
      [ -n "$recfp" ] && say_safe "$path is missing"
      printf '%s\t%s\t%s\n' "$kind" "$path" "$newfp" >> "$stage/group"; continue
    fi
    curfp="$(fp_path "$kind" "$path")"
    if [ -n "$recfp" ] && [ "$recfp" != - ] && [ "$curfp" = "$recfp" ]; then
      [ "$newfp" != "$curfp" ] && printf '%s\t%s\t%s\n' "$kind" "$path" "$newfp" >> "$stage/group"
      continue
    fi
    if [ "$newfp" = "$curfp" ]; then [ -n "$recfp" ] && printf 'fp\t%s\t%s\t-\n' "$path" "$newfp" >> "$EDITS"; continue; fi
    ref="-"; [ -n "$declined" ] && [ "$declined" != - ] && ref="$declined"
    [ "$ref" = - ] && [ -n "$recfp" ] && ref="$recfp"
    [ "$ref" != - ] && [ "$newfp" = "$ref" ] && continue
    printf '%s\t%s\t%s\n' "$kind" "$path" "$newfp" >> "$stage/edited"
  done 3< "$stage/items"

  add_lines() { # path fp declined -> record lines for every recorded pair that ships path, when new
    [ -n "$(rec_field "$1" 5)" ] && { printf 'fp\t%s\t%s\t%s\n' "$1" "$2" "$3" >> "$EDITS"; return; }
    awk -F'\t' -v OFS='\t' -v p="$1" -v fp="$2" -v dc="$3" '$4==p { print "add", "", $1, $2, $3, $4, fp, dc }' "$stage/items" >> "$EDITS"
  }
  local n; n="$(wc -l < "$stage/group" | tr -d ' ')"
  if [ "$n" -gt 0 ]; then
    while IFS="$TAB" read -r kind path newfp <&3; do say_safe "  $path"; done 3< "$stage/group"
    if ask "Update $n unedited global copies?" "$n unedited global copies"; then
      while IFS="$TAB" read -r kind path newfp <&3; do
        rel="${path#"$HOME"/}"
        if write_copy "$kind" "$stage/h/$rel" "$path"; then add_lines "$path" "$newfp" -
        else err "cannot write $path"; FAILED=1; fi
      done 3< "$stage/group"
    fi
  fi

  # Rules blocks (RF-21).
  local file pack agent stagedfile old new tmp s e
  while IFS="$TAB" read -r pack agent file <&3; do
    grep -q "^$pack	$agent\$" <<< "$pairs" || continue
    stagedfile="$(rules_file "$stage/h" "$stage/h/.codex-home" "$agent")"
    new="$stage/new.block"; block_of "$pack" "$stagedfile" > "$new" || continue
    s="<!-- rigorkit:$pack:start -->"; e="<!-- rigorkit:$pack:end -->"
    if [ -f "$file" ] && grep -qxF "$s" "$file" && ! grep -qxF "$e" "$file"; then
      say_safe "$file has '$s' without '$e'; skipped"; FAILED=1; continue
    fi
    old="$stage/old.block"
    if block_of "$pack" "$file" > "$old"; then cmp -s "$old" "$new" && continue
    else : > "$old"; fi
    diff -u "$old" "$new" | tail -n +3 | sed 's/^/    /' | print_safe
    if ask "Rewrite the rigorkit block in $file?" "$file"; then
      local r; r="$(real_file "$file")" || r="$file"
      tmp="$stage/rules.tmp"
      if [ -s "$old" ] || { [ -f "$r" ] && grep -qxF "$s" "$r"; }; then
        awk -v s="$s" -v e="$e" -v f="$new" '$0==s { print; while ((getline l < f) > 0) print l; skip=1; next }
          $0==e { skip=0 } !skip' "$r" > "$tmp"
      else
        { if [ -s "$r" ]; then cat "$r"; echo; fi; echo "$s"; cat "$new"; echo "$e"; } > "$tmp"
      fi
      if { [ ! -f "$r" ] || backup "$r"; } && mkdir -p "$(dirname "$r")" && replace_file "$r" "$tmp"; then
        printf 'rules\t%s\t%s\t%s\n' "$file" "$pack" "$(fp_text < "$new")" >> "$EDITS"
      else err "cannot rewrite $file"; FAILED=1; fi
    fi
  done 3< <(awk -F'\t' -v OFS='\t' '$1=="rules"{print $2, $3, $4}' "$REC")

  # Edited copies, one by one (RF-22).
  local rc
  while IFS="$TAB" read -r kind path newfp <&3; do
    rel="${path#"$HOME"/}"; staged="$stage/h/$rel"
    if [ -L "$path" ]; then say_safe "$path is a symbolic link to $(readlink "$path")"; fi
    if [ "$kind" = skill ]; then show_diff "$path" "$staged"; else diff -u "$path" "$staged" 2>/dev/null | tail -n +3 | sed 's/^/    /' | print_safe; fi
    ask_ok "$path was edited. Overwrite or keep?" "$path"; rc=$?
    if [ "$rc" -eq 0 ]; then
      if write_copy "$kind" "$staged" "$path"; then add_lines "$path" "$newfp" -
      else err "cannot write $path"; FAILED=1; fi
    elif [ "$rc" -eq 1 ]; then
      add_lines "$path" "=" "$newfp"
    fi
  done 3< "$stage/edited"
  # A kept new copy without a record line gets fingerprint "-" (never an "=" in the record).
  awk -F'\t' -v OFS='\t' '$1=="add" && $7=="=" { $7="-" } { print }' "$EDITS" > "$EDITS.t" && mv "$EDITS.t" "$EDITS"
  [ "$DRY" -eq 1 ] || apply_edits

  # New packs named in the changelog since the recorded version (RF-23).
  local v names nm agentsall
  agentsall="$(printf '%s\n' "$pairs" | cut -f2 | awk 'NF && !s[$0]++' | paste -sd, -)"
  names="$(git -C "$CLONE" tag -l 'v*' | sed 's/^v//' | sort_versions | while IFS= read -r v; do
      newer "$v" "$recver" || continue; newer "$v" "$to" && continue
      awk -v h="## $v" '$0==h{f=1; next} f && /^## /{exit} f && index($0, "New packs: ")==1 { print substr($0, 12) }' "$ROOT/CHANGELOG.md"
    done | tr ',' '\n' | sed 's/^[[:space:]]*//; s/[[:space:]]*$//' | awk 'NF && $0 != "none" && !s[$0]++')"
  while IFS= read -r nm <&3; do
    [ -n "$nm" ] || continue
    printf '%s\n' "$packs" | grep -qxF -- "$nm" && continue
    d="$(pack_dir "$nm")"
    if [ -z "$d" ]; then say_safe "new pack '$nm' named in the changelog is not available; not offered"; continue; fi
    case "$d" in "$CLONE/custom/"*) say_safe "the custom pack in $d would be installed instead of the official one" ;; esac
    if ask "Install new pack $nm globally for $agentsall?" "new pack $nm"; then
      if ! bash "$CLONE/install.sh" --global --pack "$nm" --agent "$agentsall" </dev/null; then err "installing pack $nm failed"; FAILED=1; fi
    fi
  done 3<<< "$names"

  old_scripts "$pairs"

  # Recorded global version (RF-19).
  if [ "$DRY" -eq 0 ] && [ "$NO" -eq 0 ] && [ "$FAILED" -eq 0 ] && [ "$UNANSWERED" -eq 0 ] && [ -f "$REC" ]; then
    tmp="$( (umask 077; mktemp "$STATE/global.XXXXXX") 2>/dev/null )" &&
      awk -F'\t' -v OFS='\t' -v v="$to" '$1=="version"{$2=v} {print}' "$REC" > "$tmp" && mv -f "$tmp" "$REC" || rm -f "$tmp"
  fi
}

old_scripts() { # RF-27
  [ -d "$OLDDIR" ] || return 0
  local pairs="$1" blobs e f candidates=() others=() file pack agent
  while IFS="$TAB" read -r pack agent file <&3; do
    block_of "$pack" "$file" 2>/dev/null | grep -qF '.local/share/rigorkit/scripts' && return 0
  done 3< <(awk -F'\t' -v OFS='\t' '$1=="rules"{print $2, $3, $4}' "$REC")
  blobs="$(git -C "$CLONE" log --all --format= --raw --no-abbrev -- 'packs/*/scripts/*' 2>/dev/null | awk '{print $3; print $4}' | grep -v '^0*$' | sort -u)"
  for f in "$OLDDIR"/* "$OLDDIR"/.[!.]*; do
    [ -e "$f" ] || [ -L "$f" ] || continue
    if [ -f "$f" ] && [ ! -L "$f" ] && grep -qxF "$(git hash-object "$f" 2>/dev/null)" <<< "$blobs"; then candidates+=("$f"); else others+=("$f"); fi
  done
  [ "${#candidates[@]}" -gt 0 ] || return 0
  if [ "${#others[@]}" -gt 0 ]; then
    echo "left as they are in $OLDDIR (not rigorkit scripts):"
    for e in "${others[@]}"; do say_safe "  $(basename "$e")"; done
  fi
  printf '%s\n' "$pairs" | cut -f2 | grep -qx cursor &&
    echo "Cursor's rules were pasted by hand: paste them again (rigorkit install --global --agent cursor prints them) before removing these scripts."
  if ask "Remove ${#candidates[@]} old rigorkit scripts from $OLDDIR?" "old rigorkit scripts in $OLDDIR"; then
    for e in "${candidates[@]}"; do rm -f "$e" 2>/dev/null && [ ! -e "$e" ] || err "cannot remove $e"; done   # reported; the update goes on
  fi
}

phase2() {
  local from="$1" to
  to="$(tr -d ' \t\r\n' < "$ROOT/VERSION" 2>/dev/null)"
  [ "$from" != "$to" ] && changelog "$from" "$to"
  shadows
  startup_blocks
  refresh "$from" "$to"
  if [ "${#PENDING[@]}" -gt 0 ]; then echo "pending (answered no; asked again at the next update):"; for e in "${PENDING[@]}"; do say_safe "  $e"; done; fi
  if [ "${#SKIPPED[@]}" -gt 0 ]; then echo "skipped (no terminal; run rigorkit update in a terminal to answer):"; for e in "${SKIPPED[@]}"; do say_safe "  $e"; done; fi
  if [ "$DRY" -eq 1 ] && [ "$ASKED" -eq 0 ] && [ "$from" = "$to" ]; then echo "nothing to do"; fi
  [ "$FAILED" -eq 0 ]
}

main() {
  while [ $# -gt 0 ]; do
    case "$1" in
      --dry-run) DRY=1; shift ;;
      -h|--help) cat "$ROOT/help/update.txt"; return 0 ;;
      *) err "unknown option: $1 (see rigorkit help update)"; return 2 ;;
    esac
  done
  trap cleanup EXIT
  if [ -n "${RK_UPDATE_FROM-}" ] && [ "$DRY" -eq 0 ] && owns_lock; then   # phase 2 of the new code, after the move
    LOCKED=1
    write_state "$(tr -d ' \t\r\n' < "$ROOT/VERSION")"
    phase2 "$RK_UPDATE_FROM"
    return $?
  fi
  unset RK_UPDATE_FROM   # not the lock owner: an inherited variable never skips phase 1
  if [ "$ROOT" != "$(cd "$CLONE" 2>/dev/null && pwd -P)" ]; then
    err "rigorkit update updates $CLONE; run $CLONE/bin/rigorkit update"; return 1
  fi
  phase1
}
main "$@"; exit $?
