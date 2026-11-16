#!/usr/bin/env bash
# rigorkit scan (016, HU-11). Help: help/scan.txt.
# Finds project installs (folders holding .rigorkit-version) below the given folders or `scan_paths`, asks which
# tools each new one serves and writes its 015 project record. Copies matching a commit of this clone whose
# VERSION was 0.1.0 keep their fingerprint (G9 option c); edited or unknown copies get "-". Writes only new
# project records (and scan_paths with --save); never writes in a project and never runs git there.
set -uo pipefail
CODE="$(cd "$(dirname "$0")/.." && pwd -P)"
. "$CODE/lib/common.sh"
CONF="$HOME/.config/rigorkit/config"
STATE="$HOME/.local/state/rigorkit"
PROJ="$STATE/projects"
TOOLS_ALL="claude codex cursor opencode"

usage() { echo "usage: rigorkit scan [--dry-run] [--save] [--tools <list>] [<folder>...]" | rk_present error >&2; exit 2; }
say() { printf '%s\n' "$*" | tr '\t' ' ' | awk 'NR > 1 { printf "?" } { printf "%s", $0 } END { print "" }' | print_safe; }   # one line: tabs and newlines in names never forge lines
# 021: retain the exact one-line safe output before semantic presentation.
display() { local role=$1; shift; say "$*" | rk_present "$role"; }
conf() { # key -> value (empty when absent); same reader as lib/notice.sh
  [ -r "$CONF" ] || return 0
  awk -v k="$1" 'function t(x) { gsub(/^[ \t]+|[ \t]+$/, "", x); return x }
    /^[ \t]*#/ { next }
    { i = index($0, "="); if (!i) next; if (t(substr($0, 1, i - 1)) == k) { print t(substr($0, i + 1)); exit } }' "$CONF" 2>/dev/null
}
tools_ok() { # comma list -> status 0 when every item is a known tool
  local t; [ -n "$1" ] || return 1
  for t in ${1//,/ }; do case " $TOOLS_ALL " in *" $t "*) ;; *) return 1 ;; esac; done
}

DRY=0 SAVE=0 TOOLS="" FOLDERS=()
while [ $# -gt 0 ]; do
  case "$1" in
    -h|--help) rk_helpfile "$CODE/help/scan.txt"; exit 0 ;;
    --dry-run) DRY=1; shift ;;
    --save) SAVE=1; shift ;;
    --tools) [ $# -ge 2 ] && tools_ok "$2" || usage; TOOLS=$2; shift 2 ;;
    --) shift; for f in "$@"; do case $f in -*) usage ;; esac; FOLDERS+=("$f"); done; break ;;
    -*) usage ;;
    *) FOLDERS+=("$1"); shift ;;
  esac
done

expand() { case "$1" in "~") printf '%s\n' "$HOME" ;; "~/"*) printf '%s\n' "$HOME/${1#\~/}" ;; *) printf '%s\n' "$1" ;; esac; }
split() { printf '%s' "$1" | tr ',' '\n' | sed 's/^[[:space:]]*//; s/[[:space:]]*$//' | grep -v '^$' || true; }
ROOTS=()
if [ ${#FOLDERS[@]} -gt 0 ]; then ROOTS=("${FOLDERS[@]}")
else while IFS= read -r r; do ROOTS+=("$(expand "$r")"); done < <(split "$(conf scan_paths)"); fi
if [ ${#ROOTS[@]} -eq 0 ]; then
  echo "rigorkit scan: no folder given and no scan_paths in $CONF (for example: scan_paths=~/workspace)" | rk_present error >&2; exit 2
fi
for r in "${ROOTS[@]}"; do case $r in -*) usage ;; esac; done
EXCL=(-name .git -o -name node_modules)
while IFS= read -r e; do EXCL+=(-o -name "$e"); done < <(split "$(conf scan_exclude)")

# --- 0.1.0 content of this clone (G9 option c): fingerprint of each skill folder at every 0.1.0 commit ------
G() { git --no-pager -C "$CODE" -c core.hooksPath=/dev/null -c core.fsmonitor=false -c log.showSignature=false "$@"; }
WORK="$(mktemp -d)"; trap 'rm -rf "$WORK"' EXIT
OLD="$WORK/commits"; : > "$OLD"
if G rev-parse --git-dir >/dev/null 2>&1; then
  G rev-list --all 2>/dev/null | while read -r c; do
    [ "$(G cat-file -p "$c:VERSION" 2>/dev/null)" = 0.1.0 ] && echo "$c"
  done > "$OLD"
fi
fp_tree() { # commit path -> fingerprint like fp_skill, "-" when the folder is absent
  local c=$1 p=$2
  G cat-file -e "$c:$p" 2>/dev/null || { echo -; return; }
  G ls-tree -r --name-only "$c" -- "$p/" | LC_ALL=C sort | while IFS= read -r f; do
    [ "${f##*/}" = .rigorkit ] && continue
    printf '%s %s\n' "${f#"$p"/}" "$(G cat-file -p "$c:$f" | fp_text)"
  done | sha256
}
old_fps() { # pack name -> fingerprints of that skill at every 0.1.0 commit (cached per skill and per tree id)
  local c t f memo="$WORK/fps.$1.$2"
  [ -f "$memo" ] && { cat "$memo"; return; }
  while read -r c; do
    t=$(G rev-parse "$c:packs/$1/skills/$2" 2>/dev/null) || continue
    f=$(awk -v t="$t" '$1 == t { print $2; exit }' "$WORK/cache" 2>/dev/null)
    [ -n "$f" ] || { f=$(fp_tree "$c" "packs/$1/skills/$2"); echo "$t $f" >> "$WORK/cache"; }
    echo "$f"
  done < "$OLD" > "$memo.tmp" && mv "$memo.tmp" "$memo" && cat "$memo"
}
pack_of() { # kind name -> pack shipping it now or in a 0.1.0 commit (empty when none; cached per name)
  local d sub memo="$WORK/pack.$1.$2"; [ "$1" = skill ] && sub="skills/$2" || sub="agents/$2.md"
  [ -f "$memo" ] && { cat "$memo"; return; }
  pack_find "$1" "$sub" > "$memo"; cat "$memo"
}
pack_find() {
  local d sub=$2
  for d in "$CODE"/packs/*/; do [ -e "$d$sub" ] && { basename "$d"; return; }; done
  [ "$1" = skill ] || return 0
  while read -r c; do
    d=$(G ls-tree --name-only "$c" -- packs/ 2>/dev/null | while read -r p; do G cat-file -e "$c:$p/$sub" 2>/dev/null && { echo "${p#packs/}"; break; }; done)
    [ -n "$d" ] && { echo "$d"; return; }
  done < "$OLD"
}

# --- phase 1: find new projects (020: list everything before any question or fingerprint) ---------------------
FOUND=0 REG=0 ALREADY=0 SKIPPED=() MISSING=() NP=() NV=() NS=()
check() { # real project path -> appends to NP/NV/NS when it is new and recordable
  local p=$1 key rec ver sugg d a
  FOUND=$((FOUND + 1))
  case "$p" in *[[:cntrl:]]*) display warning "not recorded (control characters in the path): $p"; return ;; esac
  for d in .claude .agents .codex .cursor .opencode .claude/skills .claude/agents .agents/skills; do
    [ -L "$p/$d" ] && { display warning "not recorded ($d is a symbolic link): $p"; SKIPPED+=("$p"); return; }
  done
  key=$(printf '%s' "$p" | sha256 | cut -c1-16); rec="$PROJ/$key"
  if [ -e "$rec" ]; then
    if record_valid "$rec" "rigorkit-project-record 1" && [ "$(awk -F'\t' '$1 == "path" { print $2; exit }' "$rec")" = "$p" ]; then
      say "already registered: $p"; ALREADY=$((ALREADY + 1))
    else display warning "not recorded (another record uses its key): $p"; SKIPPED+=("$p"); fi
    return
  fi
  ver=$(head -n 1 "$p/.rigorkit-version" 2>/dev/null | tr -d '[:space:]')
  valid_version "$ver" || { display warning "not recorded (unreadable .rigorkit-version): $p"; SKIPPED+=("$p"); return; }
  sugg=""
  for a in claude codex cursor opencode; do [ -d "$p/.$a" ] && sugg="${sugg:+$sugg,}$a"; done
  NP+=("$p"); NV+=("$ver"); NS+=("$sugg")
}

for r in "${ROOTS[@]}"; do
  [ -d "$r" ] || { MISSING+=("$r"); display error "missing folder: $r"; continue; }
  while IFS= read -r -d '' f; do
    check "$(cd -- "$(dirname "$f")" && pwd -P)"
  done < <(find -H "$r" -maxdepth 5 \( "${EXCL[@]}" \) -prune -o -name .rigorkit-version -type f -print0 2>/dev/null)
done

# --- phase 2: one question (y = all with the suggested tools, e = each, n = none) ------------------------------
NT=()
if [ ${#NP[@]} -gt 0 ]; then
  display heading "found ${#NP[@]} new projects:"
  for i in "${!NP[@]}"; do say "  $((i + 1)). ${NP[$i]} (${NV[$i]}) -> ${NS[$i]:-none}"; done
  Q="Register them with the suggested tools? [y = all / e = choose each / n = none]"
  mode=n
  if [ -n "$TOOLS" ]; then mode=tools
  elif [ "$DRY" -eq 1 ] && [ -t 0 ] && [ -t 2 ]; then display question "would ask: $Q"; mode=y
  elif [ -t 0 ] && [ -t 2 ]; then
    printf '%s ' "$Q" | print_safe | rk_present question >&2; read -r ans || ans=""
    case "$ans" in [yY]|[yY][eE][sS]) mode=y ;; [eE]|[eE][aA][cC][hH]) mode=e ;; esac
  fi
  for i in "${!NP[@]}"; do
    p=${NP[$i]}; sugg=${NS[$i]}; t=""
    case $mode in
      tools) t=$TOOLS ;;
      y) t=$sugg ;;
      e)
        printf 'tools for %s (comma list; Enter = %s; - = skip): ' "$p" "${sugg:-none}" | print_safe | rk_present question >&2
        read -r ans || ans=""
        ans=$(printf '%s' "$ans" | tr -d '[:space:]')
        case "$ans" in "") t=$sugg ;; -) t="" ;; *) t=$ans ;; esac
        if [ -n "$t" ] && ! tools_ok "$t"; then display warning "unknown tool in '$t'; skipped"; t=""; fi ;;
    esac
    NT+=("$t")
  done
fi

# --- phase 3: register with progress; copies only for the chosen tools ------------------------------------------
write_project() { # path version tools
  local p=$1 ver=$2 tools=$3 key rec d n pack a fp edited=0 copies=0 tmp dirs=()
  key=$(printf '%s' "$p" | sha256 | cut -c1-16); rec="$PROJ/$key"
  case ",$tools," in *,claude,*) dirs+=("$p"/.claude/skills/*/) ;; esac
  case ",$tools," in *,codex,*|*,cursor,*|*,opencode,*) dirs+=("$p"/.agents/skills/*/) ;; esac
  : > "$WORK/pairs"; : > "$WORK/copies"
  for d in ${dirs[@]+"${dirs[@]}"}; do
    [ -f "$d.rigorkit" ] && grep -q '^installed-by: rigorkit' "$d.rigorkit" 2>/dev/null || continue
    d=${d%/}; n=${d##*/}
    case "$d" in *[[:cntrl:]]*) display warning "not recorded (control characters): $d"; continue ;; esac
    [ -L "$d" ] && { display warning "not recorded (symbolic link): $d"; continue; }
    pack=$(pack_of skill "$n")
    [ -n "$pack" ] || { display warning "not shipped by any pack, not recorded: $d"; continue; }
    fp=$(fp_skill "$d")
    # A file, not a pipe: with pipefail an early grep exit would make the producer's SIGPIPE a "no match".
    old_fps "$pack" "$n" > "$WORK/fps"; grep -qxF "$fp" "$WORK/fps" || fp=-
    if [[ $d == */.claude/skills/* ]]; then set -- claude; else set -- codex cursor opencode; fi
    for a in "$@"; do case ",$tools," in *",$a,"*)
      printf 'copy\tskill\t%s\t%s\t%s\t%s\t-\n' "$pack" "$a" "$d" "$fp" >> "$WORK/copies"; echo "$pack" >> "$WORK/pairs"
      copies=$((copies + 1)); [ "$fp" = - ] && edited=$((edited + 1)) ;; esac; done
  done
  for d in "$p"/.claude/agents/*.md "$p"/.cursor/agents/*.md "$p"/.opencode/agent/*.md "$p"/.opencode/agents/*.md "$p"/.codex/agents/*.toml; do
    [ -f "$d" ] && [ ! -L "$d" ] || continue
    case "$d" in */.claude/*) a=claude ;; */.cursor/*) a=cursor ;; */.opencode/*) a=opencode ;; *) a=codex ;; esac
    case ",$tools," in *",$a,"*) ;; *) continue ;; esac
    case "$d" in *[[:cntrl:]]*) display warning "not recorded (control characters): $d"; continue ;; esac
    n=${d##*/}; n=${n%.*}; pack=$(pack_of agent "$n")
    [ -n "$pack" ] || { display warning "not shipped by any pack, not recorded: $d"; continue; }
    printf 'copy\tagent\t%s\t%s\t%s\t-\t-\n' "$pack" "$a" "$d" >> "$WORK/copies"; copies=$((copies + 1)); edited=$((edited + 1))
  done

  if [ "$DRY" -eq 1 ]; then
    say "would register $p ($tools) · $ver · $copies copies, $edited without a 0.1.0 match"; REG=$((REG + 1)); return
  fi
  if [ -L "$STATE" ] || [ -L "$PROJ" ]; then display warning "warning: $PROJ is a symbolic link; nothing recorded"; SKIPPED+=("$p"); return; fi
  ( umask 077; mkdir -p "$PROJ" ) 2>/dev/null || true
  tmp=$( (umask 077; mktemp "$rec.XXXXXX") 2>/dev/null ) || { display warning "warning: cannot write the project record ($rec)"; SKIPPED+=("$p"); return; }
  {
    echo "rigorkit-project-record 1"; printf 'path\t%s\nversion\t%s\n' "$p" "$ver"
    sort -u "$WORK/pairs" | while read -r pack; do for a in ${tools//,/ }; do printf 'pair\t%s\t%s\n' "$pack" "$a"; done; done
    cat "$WORK/copies"
  } > "$tmp" && record_valid "$tmp" "rigorkit-project-record 1" && mv -f "$tmp" "$rec" \
    || { rm -f "$tmp"; display warning "warning: cannot write the project record ($rec)"; SKIPPED+=("$p"); return; }
  display success "registered $p ($tools) · $ver · $copies copies, $edited without a 0.1.0 match"; REG=$((REG + 1))
}

TOREG=0; for t in ${NT[@]+"${NT[@]}"}; do [ -n "$t" ] && TOREG=$((TOREG + 1)); done
k=0
for i in "${!NP[@]}"; do
  [ -n "${NT[$i]-}" ] || { SKIPPED+=("${NP[$i]}"); continue; }
  k=$((k + 1)); say "[$k/$TOREG] ${NP[$i]}"
  write_project "${NP[$i]}" "${NV[$i]}" "${NT[$i]}"
done

if [ "$SAVE" -eq 1 ] && [ ${#FOLDERS[@]} -gt 0 ] && [ "$DRY" -eq 0 ]; then
  cur=$(conf scan_paths)
  for f in "${FOLDERS[@]}"; do
    f=$(cd -- "$f" 2>/dev/null && pwd -P) || continue
    case "$f" in *[[:cntrl:]]*|*,*) display warning "not saved (control character or comma): $f"; continue ;; esac
    case ",$cur," in *",$f,"*) ;; *) cur="${cur:+$cur,}$f" ;; esac
  done
  ( umask 077; mkdir -p "$(dirname "$CONF")" ) 2>/dev/null || true
  if [ -L "$CONF" ]; then display warning "warning: $CONF is a symbolic link; scan_paths not saved (add scan_paths=$cur yourself)"
  else tmp=$( (umask 077; mktemp "$CONF.XXXXXX") 2>/dev/null ) && {
    { [ -r "$CONF" ] && awk '{ i = index($0, "="); k = substr($0, 1, i - 1); gsub(/^[ \t]+|[ \t]+$/, "", k); if (i && k == "scan_paths") next; print }' "$CONF"
      printf 'scan_paths=%s\n' "$cur"; } > "$tmp" && chmod 600 "$tmp" && mv -f "$tmp" "$CONF" && display success "saved scan_paths=$cur"
  } || display warning "warning: cannot write $CONF"
  fi
fi

[ ${#SKIPPED[@]} -eq 0 ] || { display warning "skipped (no tools confirmed or not recordable):"; for p in "${SKIPPED[@]}"; do say "  $p"; done; }
scan_role=success
[ ${#SKIPPED[@]} -eq 0 ] || scan_role=warning
[ ${#MISSING[@]} -eq 0 ] || scan_role=error
display "$scan_role" "scan: $FOUND found, $REG $([ "$DRY" -eq 1 ] && echo 'would be registered' || echo registered), $ALREADY already registered, ${#SKIPPED[@]} skipped"
[ ${#MISSING[@]} -eq 0 ] || exit 3
