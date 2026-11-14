#!/usr/bin/env bash
# rigorkit doctor (018, HU-12). Help: help/doctor.txt.
# Read-only health report of the clone, the global record and every registered project. The only write is
# `chmod u+x` on official helper scripts of the clone (008 answer 24). Exit 0 = nothing needs attention, 1 otherwise.
set -uo pipefail
CODE="$(cd "$(dirname "$0")/.." && pwd -P)"
. "$CODE/lib/common.sh"
STATE="$HOME/.local/state/rigorkit"
REC="$STATE/global"
ISSUES=0

case "${1-}" in
  -h|--help) cat "$CODE/help/doctor.txt"; exit 0 ;;
  '') ;;
  *) echo "usage: rigorkit doctor" >&2; exit 2 ;;
esac
say() { say_safe "$*"; }
issue() { say "$*"; ISSUES=1; }
G() { git --no-pager -C "$CODE" -c core.hooksPath=/dev/null -c core.fsmonitor=false -c core.fileMode=false "$@"; }

# --- clone (RF-1, RF-2) ------------------------------------------------------------------------------------
say "clone $(tr -d ' \t\r\n' < "$CODE/VERSION" 2>/dev/null) ($CODE)"
if G rev-parse --git-dir >/dev/null 2>&1; then   # mode-only changes are ignored: official script bits are repaired below
  [ -z "$(G status --porcelain --untracked-files=no -- . ':(exclude)custom' 2>/dev/null)" ] ||
    issue "local changes in $CODE (move your edits to $CODE/custom; rigorkit update refuses them)"
fi
for f in "$CODE"/packs/*/scripts/*; do
  [ -f "$f" ] && [ ! -L "$f" ] && [ ! -x "$f" ] || continue
  if chmod u+x "$f" 2>/dev/null; then say "made executable: ${f#"$CODE"/}"; else issue "cannot make ${f#"$CODE"/} executable"; fi
done
c="$CODE/custom"
if [ -d "$c" ]; then
  for f in "$c"/scripts/*; do
    [ -e "$f" ] || continue
    n="$(basename "$f")"
    ls "$CODE"/packs/*/scripts/"$n" >/dev/null 2>&1 && issue "custom script $n shadows the official one"
    [ -f "$f" ] && [ ! -x "$f" ] && issue "custom/scripts/$n is not executable (custom scripts are only reported)"
  done
  for f in "$c"/packs/*/; do
    [ -d "$f" ] || continue
    n="$(basename "$f")"
    [ -d "$CODE/packs/$n" ] && issue "custom pack $n shadows the official one"
  done
fi

shipped() { [ -d "$CODE/packs/$1" ] || [ -d "$c/packs/$1" ]; }
copies() { # record -> "edited: <path>" / "missing: <path>" lines for its copies with a recorded fingerprint
  awk -F'\t' '$1=="copy" && $6!="-" && $6!="" { print $2 "\t" $5 "\t" $6 }' "$1" | awk -F'\t' '!s[$2]++' |
    while IFS="$TAB" read -r kind path fp; do
      if [ ! -e "$path" ] && [ ! -L "$path" ]; then echo "missing: $path"
      elif [ "$(fp_path "$kind" "$path")" != "$fp" ]; then echo "edited: $path"; fi
    done
}

# --- global record (RF-3) ------------------------------------------------------------------------------------
if [ -e "$REC" ]; then
  if ! record_valid "$REC"; then issue "the global record $REC cannot be read (rigorkit install --global starts a new one)"
  else
    say "global $(awk -F'\t' '$1=="version"{print $2; exit}' "$REC")"
    while IFS= read -r l; do issue "  $l"; done < <(copies "$REC")
    while IFS="$TAB" read -r pack agent; do
      shipped "$pack" || issue "  pack $pack ($agent) is recorded but no longer shipped"
    done < <(awk -F'\t' -v OFS='\t' '$1=="pair"{print $2, $3}' "$REC" | awk '!s[$0]++')
  fi
else
  say "global: no record (rigorkit install --global records it)"
fi

# --- projects (RF-4) -----------------------------------------------------------------------------------------
cur="$(tr -d ' \t\r\n' < "$CODE/VERSION" 2>/dev/null)"
if [ -d "$STATE/projects" ] && [ ! -L "$STATE/projects" ]; then
  for f in "$STATE/projects"/*; do
    n="${f##*/}"; [[ $n =~ ^[0-9a-f]{16}$ ]] && [ -f "$f" ] && [ ! -L "$f" ] || continue
    record_valid "$f" "rigorkit-project-record 1" || { issue "project record $f cannot be read"; continue; }
    p="$(awk -F'\t' '$1=="path"{print $2; exit}' "$f")"; v="$(awk -F'\t' '$1=="version"{print $2; exit}' "$f")"
    dev="$(awk -F'\t' '$1=="dev"{print $2; exit}' "$f")"
    line="project $p $v"
    if [ ! -d "$p" ]; then issue "$line missing (rigorkit update offers to remove its record)"; continue; fi
    attn=0
    valid_version "$cur" && newer "$cur" "$v" && { line="$line outdated"; attn=1; }
    [ -n "$dev" ] && line="$line dev $dev"
    ne="$(copies "$f" | grep -c . || true)"
    [ "$ne" -gt 0 ] && { line="$line $ne edited"; attn=1; }
    if [ "$attn" -eq 1 ]; then issue "$line"; else say "$line"; fi
  done
fi

exit "$ISSUES"
