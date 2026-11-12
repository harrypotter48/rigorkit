#!/usr/bin/env bash
# rigorkit installer — copies packs (skills, agents, rules) to each coding agent's folders.
# Help: help/install.txt (also `rigorkit help install`). Helper scripts are not copied: rules call
# them through this clone's bin/rigorkit. Packs in ~/.rigorkit/custom/packs replace official ones.
#
#   ./install.sh --pack sdd --agent claude,codex,cursor,opencode [--project DIR | --global] [--force] [--dry-run]
#   ./install.sh --pack all --agent claude --force    (every pack; --force overwrites what exists)
#   ./install.sh --pack core --agent claude,codex,opencode --global   (rules: --global only)
#   ./install.sh --uninstall-rules --agent claude,codex,opencode [--dry-run]
#   ./install.sh --list
#   ./install.sh --version
#
# Skills use the Agent Skills format (<name>/SKILL.md) and are COPIED, not symlinked
# (symlinked skills are unreliable in Cursor and Codex). Agents are written in a neutral
# Markdown format in packs/<pack>/agents/ and converted here to each tool's format.
# Agent tiers map to models per tool in ~/.config/rigorkit/models (optional, see README).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd -P)"
PACKS=""; AGENTS=""; SCOPE="project"; DEST="$PWD"; FORCE=0; DRY=0; UNINSTALL=0
MODELS="${RIGORKIT_MODELS:-$HOME/.config/rigorkit/models}"
CUSTOM="$HOME/.rigorkit/custom"
RENDER_ROOT="${RK_RENDER_ROOT:-$ROOT}"   # internal: rigorkit update stages an install that names the real clone
RENDER="'$RENDER_ROOT/bin/rigorkit'"   # rules placeholder {{RIGORKIT}} -> this clone's rigorkit, single-quoted
PACKS_ROOT="${RK_PACKS_ROOT:-$ROOT}"   # internal: rigorkit update --dry-run stages a release's packs with this code

usage() { cat "$ROOT/help/install.txt"; exit "${1:-0}"; }
die() { echo "error: $*" >&2; exit 1; }
say() { echo "$*"; }

read_version() { if [ -f "$1" ]; then tr -d ' \t\r\n' < "$1"; fi; }
version_or_none() { local v; v="$(read_version "$1")"; if [ -n "$v" ]; then printf '%s' "$v"; else printf 'none'; fi; }
VERSION="$(read_version "$ROOT/VERSION")"
case "$VERSION" in
  [0-9]*.[0-9]*.[0-9]*) ;;
  *) die "invalid VERSION file: $ROOT/VERSION" ;;
esac

# --- custom packs (~/.rigorkit/custom/packs) ----------------------------------------
# Valid custom names: not `all`, no comma, no whitespace (RF-59). Invalid ones are warned about once.
CUSTOM_PACKS=""; CUSTOM_SCANNED=0
scan_custom() {
  [ "$CUSTOM_SCANNED" -eq 1 ] && return 0
  CUSTOM_SCANNED=1
  local d n
  for d in "$CUSTOM"/packs/*/; do
    [ -d "$d" ] || continue
    n="$(basename "$d")"
    case "$n" in
      all|*,*|*[[:space:]]*) echo "warning: custom pack '$n' ignored: a pack name cannot be all or contain a comma or space" >&2 ;;
      *) CUSTOM_PACKS="$CUSTOM_PACKS $n" ;;
    esac
  done
  return 0
}
is_custom() { case " $CUSTOM_PACKS " in *" $1 "*) return 0 ;; *) return 1 ;; esac; }
pack_dir() { if is_custom "$1"; then echo "$CUSTOM/packs/$1"; else echo "$PACKS_ROOT/packs/$1"; fi; }
all_packs() { # official (glob order), then custom-only names
  local p n
  for p in "$PACKS_ROOT"/packs/*/; do basename "$p"; done
  for n in $CUSTOM_PACKS; do [ -d "$PACKS_ROOT/packs/$n" ] || echo "$n"; done
}

# --help wins in any position, also as an option value (RF-26).
for arg in "$@"; do case "$arg" in -h|--help) usage 0 ;; esac; done

while [ $# -gt 0 ]; do
  case "$1" in
    --pack) PACKS="${2:-}"; shift 2 ;;
    --agent) AGENTS="${2:-}"; shift 2 ;;
    --project) SCOPE="project"; DEST="${2:-}"; shift 2 ;;
    --global) SCOPE="global"; shift ;;
    --force) FORCE=1; shift ;;
    --dry-run) DRY=1; shift ;;
    --uninstall-rules) UNINSTALL=1; SCOPE="global"; shift ;;
    --version) echo "$VERSION"; exit 0 ;;
    --list)
      echo "rigorkit $VERSION (local)"
      echo "installed  project: $(version_or_none "$PWD/.rigorkit-version")  global: $(version_or_none "$HOME/.rigorkit-version")"
      echo "all  (every pack below)"
      scan_custom
      for p in $(all_packs); do
        d="$(pack_dir "$p")"
        if ! is_custom "$p"; then echo "$p"
        elif [ -d "$PACKS_ROOT/packs/$p" ]; then echo "$p  (custom, replaces the official pack)"
        else echo "$p  (custom)"; fi
        for s in "$d"/skills/*/; do [ -d "$s" ] && echo "  skill  $(basename "$s")"; done
        for a in "$d"/agents/*.md; do [ -f "$a" ] && echo "  agent  $(basename "$a" .md)"; done
        [ -f "$d/rules.md" ] && echo "  rules  (global only)"
        for x in "$d"/scripts/*; do [ -f "$x" ] && echo "  script $(basename "$x")"; done
      done; exit 0 ;;
    -h|--help) usage 0 ;;
    *) die "unknown option: $1 (see --help)" ;;
  esac
done

[ -n "$PACKS" ] || [ "$UNINSTALL" -eq 1 ] || usage 1
case ",$PACKS," in
  ",all,") scan_custom; PACKS="$(all_packs | paste -sd, -)" ;;
  *",all,"*) die "--pack all cannot be combined with other packs" ;;
esac
[ -n "$AGENTS" ] || die "--agent is required (claude,codex,cursor,opencode)"
[ "$SCOPE" = "global" ] || [ -d "$DEST" ] || die "project dir not found: $DEST"
[ "$SCOPE" = "global" ] && BASE="$HOME" || BASE="$(cd "$DEST" && pwd)"
MARKER="$BASE/.rigorkit-version"
scan_custom
WORK="$(mktemp -d)"; trap 'rm -rf "$WORK"' EXIT   # temp files only here, always removed (Q10)

# --- global record (010 RF-18, RF-35, RF-36): what a global install wrote, for rigorkit update ------
# Format and fingerprints are twins of lib/common.sh (tools/test/010-twins.test.mjs). Recorded only for the
# clone at ~/.rigorkit (a development clone is HU-3) or a staging run of rigorkit update (RK_STAGE=1, internal);
# RK_NO_RECORD=1 (internal) turns it off.
REC_DIR="$HOME/.local/state/rigorkit"; REC="$REC_DIR/global"; REC_ON=0; REC_NEW="$WORK/record.new"; : > "$REC_NEW"
TAB="$(printf '\t')"
sha256() { if command -v shasum >/dev/null 2>&1; then shasum -a 256 | cut -d' ' -f1; else sha256sum | cut -d' ' -f1; fi; }
fp_text() { LC_ALL=C sed -e 's/[[:space:]]*$//' | sha256; }   # stdin; CR and trailing blanks ignored
fp_file() { fp_text < "$1"; }
fp_skill() { # folder -> fingerprint of its regular files except .rigorkit
  ( cd "$1" && find . -type f ! -name .rigorkit | LC_ALL=C sort | while IFS= read -r f; do printf '%s %s\n' "${f#./}" "$(fp_file "$f")"; done ) | sha256
}
fp_block() { # pack file -> fingerprint of the lines between its markers, "-" when absent
  local s="<!-- rigorkit:$1:start -->" e="<!-- rigorkit:$1:end -->"
  if [ -f "$2" ] && grep -qxF "$s" "$2" && grep -qxF "$e" "$2"; then
    awk -v s="$s" -v e="$e" '$0==e{f=0} f{print} $0==s{f=1}' "$2" | fp_text
  else echo -; fi
}
record_valid() { # file: header line plus known lines only
  awk -F'\t' 'NR==1 { if ($0 != "rigorkit-global-record 1") bad=1; next }
    $1=="version" && NF==2 && $2 ~ /^[0-9]+\.[0-9]+\.[0-9]+$/ { next }
    $1=="pair" && NF==3 { next }
    $1=="copy" && NF==7 && ($2=="skill" || $2=="agent") { next }
    $1=="rules" && NF==5 { next }
    { bad=1 } END { exit (bad || NR == 0) }' "$1" 2>/dev/null
}
rec_warn() { echo "warning: cannot write the global record ($REC); updates cannot manage the global scope" >&2; REC_ON=0; }
rec_line() { # fields... -> one tab-separated record line
  [ "$REC_ON" -eq 1 ] || return 0
  local IFS="$TAB"; printf '%s\n' "$*" >> "$REC_NEW"
}
rec_path_ok() { case "$1" in *"$TAB"*|*"
"*) echo "warning: a path with a tab or a newline is not recorded" >&2; return 1 ;; esac; }
dir_agents() { # skill folder -> agents that read it
  case "$1" in */.claude/skills) echo claude ;; *) for a in codex cursor opencode; do has_agent "$a" && echo "$a"; done ;; esac
}
LAST=""   # written | same | differs, set by copy_dir and write_file
rec_copy() { # kind pack agent dst: after copy_dir/write_file
  [ "$REC_ON" -eq 1 ] || return 0
  rec_path_ok "$4" || return 0
  local fp declined="-"
  case "$LAST" in
    written|same)
      if [ "$1" = skill ]; then fp="$(fp_skill "$4")"; else fp="$(fp_file "$4")"; fi
      [ "$LAST" = same ] && declined="=" ;;
    *) fp="="; declined="=" ;;   # skipped differing copy: keep what the record had, else none
  esac
  rec_line copy "$1" "$2" "$3" "$4" "$fp" "$declined"
}
rec_rules() { # pack agent file: after merge_rules
  [ "$REC_ON" -eq 1 ] || return 0
  rec_path_ok "$3" || return 0
  rec_line rules "$1" "$2" "$3" "$(fp_block "$1" "$3")"
}
rec_write() { # merge REC_NEW into the record: new copies replace old ones, "=" keeps the old value
  [ "$REC_ON" -eq 1 ] || return 0
  local old=/dev/null tmp
  [ -f "$REC" ] && old="$REC"
  ( umask 077; mkdir -p "$REC_DIR" ) 2>/dev/null
  tmp="$( ( umask 077; mktemp "$REC_DIR/global.XXXXXX" ) 2>/dev/null )" || { rec_warn; return 0; }
  if { cat "$old"; echo '@@new@@'; cat "$REC_NEW"; } | awk -F'\t' -v OFS='\t' -v ver="$VERSION" '
      $0 == "@@new@@" { neu = 1; next }
      $1 == "version" { if (!neu) v = $2; next }
      $1 == "pair" { k = $2 FS $3; if (!(k in P)) { P[k] = 1; po[++np] = k }; next }
      $1 == "copy" { k = $5 FS $4; fp = $6; dc = $7
        if (fp == "=") fp = (k in F) ? F[k] : "-"
        if (dc == "=") dc = (k in D) ? D[k] : "-"
        if (!(k in C)) co[++nc] = k
        C[k] = $1 OFS $2 OFS $3 OFS $4 OFS $5 OFS fp OFS dc; F[k] = fp; D[k] = dc; next }
      $1 == "rules" { k = $4 FS $3 FS $2; if (!(k in R)) ro[++nr] = k; R[k] = $0; next }
      END { print "rigorkit-global-record 1"; print "version", (v != "" ? v : ver)
        for (i = 1; i <= np; i++) { split(po[i], a, FS); print "pair", a[1], a[2] }
        for (i = 1; i <= nc; i++) print C[co[i]]
        for (i = 1; i <= nr; i++) print R[ro[i]] }' > "$tmp" && mv -f "$tmp" "$REC"; then return 0; fi
  rm -f "$tmp"; rec_warn
}
rec_drop_rules() { # agents...: --uninstall-rules removes their rules lines (RF-36)
  [ "$DRY" -eq 0 ] && [ "${RK_NO_RECORD-}" != 1 ] && [ -e "$REC" ] && [ ! -L "$REC_DIR" ] || return 0
  if ! record_valid "$REC"; then echo "warning: the global record $REC is unreadable; it was left as it is" >&2; return 0; fi
  local tmp
  tmp="$( ( umask 077; mktemp "$REC_DIR/global.XXXXXX" ) 2>/dev/null )" || { rec_warn; return 0; }
  if awk -F'\t' -v drop=",$AGENTS," '$1 == "rules" && index(drop, "," $3 ",") { next } { print }' "$REC" > "$tmp" && mv -f "$tmp" "$REC"; then return 0; fi
  rm -f "$tmp"; rec_warn
}
rec_home_clone() { [ "${RK_STAGE-}" = 1 ] || [ "$(cd "$RENDER_ROOT" 2>/dev/null && pwd -P)" = "$(cd "$HOME/.rigorkit" 2>/dev/null && pwd -P)" ]; }
if [ "$SCOPE" = "global" ] && [ "$DRY" -eq 0 ] && [ "$UNINSTALL" -eq 0 ] && [ "${RK_NO_RECORD-}" != 1 ] && rec_home_clone; then
  REC_ON=1
  if [ -L "$REC_DIR" ] || ! { command -v shasum >/dev/null 2>&1 || command -v sha256sum >/dev/null 2>&1; }; then rec_warn; fi
  if [ "$REC_ON" -eq 1 ] && [ -e "$REC" ] && ! record_valid "$REC"; then   # RF-35: moved aside, never printed
    if mv -f "$REC" "$REC.corrupt" 2>/dev/null; then say "note: unreadable global record moved to $REC.corrupt; a new record starts with this install"
    else rec_warn; fi
  fi
fi

has_agent() { case ",$AGENTS," in *",$1,"*) return 0 ;; *) return 1 ;; esac; }
for a in $(echo "$AGENTS" | tr ',' ' '); do
  case "$a" in claude|codex|cursor|opencode) ;; *) die "unknown agent: $a" ;; esac
done

# --- skill destinations --------------------------------------------------------
# Claude Code reads .claude/skills. Codex, Cursor and OpenCode read .agents/skills.
SKILL_DIRS=()
has_agent claude && SKILL_DIRS+=("$BASE/.claude/skills")
if has_agent codex || has_agent cursor || has_agent opencode; then
  SKILL_DIRS+=("$BASE/.agents/skills")
fi

copy_dir() { # src dst
  if [ -e "$2" ] && [ "$FORCE" -eq 0 ]; then
    say "  skip   $2 (exists; --force to overwrite)"
    LAST=differs; if [ "$REC_ON" -eq 1 ] && [ -d "$2" ] && [ ! -L "$2" ] && [ "$(fp_skill "$2")" = "$(fp_skill "$1")" ]; then LAST=same; fi
    return
  fi
  say "  copy   $2"
  LAST=written
  [ "$DRY" -eq 1 ] && return
  rm -rf "$2"; mkdir -p "$(dirname "$2")"; cp -R "$1" "$2"
  printf 'installed-by: rigorkit\nsource: %s\ndate: %s\nversion: %s\n' "$1" "$(date +%Y-%m-%d)" "$VERSION" > "$2/.rigorkit"
  mark_installed_version
}

write_file() { # dst (content on stdin)
  if [ -e "$1" ] && [ "$FORCE" -eq 0 ]; then
    say "  skip   $1 (exists; --force to overwrite)"
    local new; new="$(mktemp "$WORK/new.XXXXXX")"; cat > "$new"
    LAST=differs; if [ "$REC_ON" -eq 1 ] && [ -f "$1" ] && [ ! -L "$1" ] && [ "$(fp_file "$1")" = "$(fp_file "$new")" ]; then LAST=same; fi
    rm -f "$new"; return
  fi
  LAST=written
  say "  write  $1"
  if [ "$DRY" -eq 1 ]; then cat >/dev/null; return; fi
  mkdir -p "$(dirname "$1")"; cat > "$1"
  mark_installed_version
}

mark_installed_version() { # records the rigorkit version that last wrote into this scope
  [ "$DRY" -eq 1 ] && return
  [ -n "$MARKER" ] || return
  if [ "$FORCE" -eq 0 ] && [ -f "$MARKER" ]; then return; fi
  printf '%s\n' "$VERSION" > "$MARKER"
}

report_version_difference() {
  local current; current="$(read_version "$MARKER")"
  [ -n "$current" ] || return 0
  [ "$current" = "$VERSION" ] && return 0
  say "note: installed version $current differs from local $VERSION; reinstall with --force to update."
}

# --- global rules (between markers, never overwriting the rest of the file) -------
rules_file() { # agent -> its global instructions file ("" if the tool has none)
  case "$1" in
    claude) echo "$HOME/.claude/CLAUDE.md" ;;
    codex) echo "${CODEX_HOME:-$HOME/.codex}/AGENTS.md" ;;
    opencode) echo "$HOME/.config/opencode/AGENTS.md" ;;
    *) echo "" ;;
  esac
}

real_file() { # path -> the file a chain of symbolic links points to (twin of install-remote.sh resolve_link)
  local f="$1" l n=0
  while [ -L "$f" ]; do
    n=$((n + 1)); [ "$n" -le 40 ] || die "too many symbolic links: $1"
    l="$(readlink "$f")"
    case "$l" in /*) f="$l" ;; *) f="$(dirname "$f")/$l" ;; esac
  done
  printf '%s\n' "$f"
}

backup() { # real-file -> <real-file>.rigorkit.bak with the original mode, never more readable (RF-62, INV-4)
  # Twin of install-remote.sh backup(); keep both equal. mktemp: new 600 file, no planted link followed.
  local b="$1.rigorkit.bak" t
  t="$( umask 077; mktemp "$1.rigorkit.bak.XXXXXX" )" || return 1
  ( umask 077; cp -p "$1" "$t" ) && mv -f "$t" "$b" || { rm -f "$t"; return 1; }
  say "  backup $b"
}

render() { # rules-file -> stdout with every {{RIGORKIT}} replaced by $RENDER (no regex, no escapes)
  RK_RENDER="$RENDER" awk 'BEGIN { r = ENVIRON["RK_RENDER"]; k = "{{RIGORKIT}}" }
    { out = ""; s = $0; while ((i = index(s, k)) > 0) { out = out substr(s, 1, i - 1) r; s = substr(s, i + length(k)) } print out s }' "$1"
}

apply_rules() { # dst new-content-file: shows the diff on --dry-run, keeps a .rigorkit.bak otherwise
  local dst="$1" tmp="$2" old="/dev/null"
  if [ -f "$dst" ] && cmp -s "$dst" "$tmp"; then say "  same   $dst"; rm -f "$tmp"; return; fi
  say "  rules  $dst"
  if [ "$DRY" -eq 1 ]; then
    [ -f "$dst" ] && old="$dst"
    diff -u "$old" "$tmp" | tail -n +3 | sed 's/^/    /' || true
    rm -f "$tmp"; return
  fi
  mkdir -p "$(dirname "$dst")"
  if [ -f "$dst" ]; then backup "$(real_file "$dst")" || die "cannot back up $(real_file "$dst"); $dst left unchanged"; fi
  cat "$tmp" > "$dst"; rm -f "$tmp"   # writes through a symbolic link
  mark_installed_version
}

merge_rules() { # pack rules-file dst: replaces the block if present, appends it otherwise
  local s="<!-- rigorkit:$1:start -->" e="<!-- rigorkit:$1:end -->" src dst="$3" tmp
  src="$(mktemp "$WORK/rules.XXXXXX")"; render "$2" > "$src"
  tmp="$(mktemp "$WORK/merge.XXXXXX")"
  if [ -f "$dst" ] && grep -qxF "$s" "$dst"; then
    grep -qxF "$e" "$dst" || die "$dst has '$s' without '$e': fix it by hand"
    awk -v s="$s" -v e="$e" -v f="$src" '
      $0==s { print; while ((getline l < f) > 0) print l; skip=1; next }
      $0==e { skip=0 }
      !skip' "$dst" > "$tmp"
  else
    { if [ -s "$dst" ]; then cat "$dst"; echo; fi; echo "$s"; cat "$src"; echo "$e"; } > "$tmp"
  fi
  apply_rules "$dst" "$tmp"
}

remove_rules() { # pack dst: drops the block (and the blank line before it)
  local s="<!-- rigorkit:$1:start -->" e="<!-- rigorkit:$1:end -->" dst="$2" tmp
  if ! { [ -f "$dst" ] && grep -qxF "$s" "$dst"; }; then say "  none   $dst"; return; fi
  grep -qxF "$e" "$dst" || die "$dst has '$s' without '$e': fix it by hand"
  tmp="$(mktemp "$WORK/remove.XXXXXX")"
  awk -v s="$s" -v e="$e" '
    $0==s { skip=1; held=0; next }
    skip  { if ($0==e) skip=0; next }
    { if (held) print ""; held=0 }
    /^$/  { held=1; next }
    { print }
    END   { if (held) print "" }' "$dst" > "$tmp"
  apply_rules "$dst" "$tmp"
}

if [ "$UNINSTALL" -eq 1 ]; then
  [ "$DRY" -eq 1 ] && say "(dry run: nothing is written)"
  for pack in $(all_packs); do
    [ -f "$(pack_dir "$pack")/rules.md" ] || [ -f "$PACKS_ROOT/packs/$pack/rules.md" ] || continue
    say "rules $pack"
    for a in $(echo "$AGENTS" | tr ',' ' '); do
      dst="$(rules_file "$a")"; [ -n "$dst" ] && remove_rules "$pack" "$dst"
    done
  done
  rec_drop_rules
  say "done. Scripts stay in the clone ($ROOT)."
  exit 0
fi

# --- neutral agent parsing -----------------------------------------------------
# Frontmatter value (one line); strips YAML single quotes and unescapes ''.
fm()   { awk -v k="$2" 'NR==1&&/^---$/{f=1;next} f&&/^---$/{exit} f&&index($0,k": ")==1{sub("^"k": ","");print;exit}' "$1" \
           | sed -e "s/^'\(.*\)'$/\1/" -e "s/''/'/g"; }
body() { awk 'NR==1&&/^---$/{f=1;next} f==1&&/^---$/{f=2;next} f==2{print}' "$1" | sed '1{/^$/d;}'; }
# English model keys take precedence over legacy aliases, including an empty value.
model_for() {
  [ -n "$2" ] && [ -f "$MODELS" ] || return 0
  local legacy
  case "$2" in cheap) legacy=barato ;; strong) legacy=fuerte ;; *) return 0 ;; esac
  awk -v k="$1.$2" -v old_key="$1.$legacy" '
    function trim(x) { gsub(/^[ \t]+|[ \t]+$/, "", x); return x }
    /^[ \t]*#/ { next }
    {
      i = index($0, "="); if (!i) next
      key = trim(substr($0, 1, i - 1)); value = trim(substr($0, i + 1))
      if (key == k) { print value; found = 1; exit }
      if (key == old_key && !fallback_seen) { fallback = value; fallback_seen = 1 }
    }
    END { if (!found && fallback_seen) print fallback }' "$MODELS"
}
toml_str() { printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'; }
yaml_str() { printf "'%s'" "$(printf '%s' "$1" | sed "s/'/''/g")"; }

install_agent() { # neutral agent file
  local f="$1" name desc ro tier m b
  name="$(fm "$f" name)"; desc="$(fm "$f" description)"; ro="$(fm "$f" readonly)"; tier="$(fm "$f" tier)"; b="$(body "$f")"
  [ -n "$name" ] && [ -n "$desc" ] || die "agent without name/description: $f"
  case "$tier" in
    "") ;;
    barato|cheap) tier=cheap ;;
    fuerte|strong) tier=strong ;;
    *) die "agent $f: tier must be cheap or strong (aliases: barato, fuerte)" ;;
  esac

  if has_agent claude; then
    { echo "---"; echo "name: $name"; echo "description: $(yaml_str "$desc")"
      [ "$ro" = "true" ] && echo "tools: Read, Grep, Glob"
      m="$(model_for claude "$tier")"; [ -n "$m" ] && echo "model: $m"
      echo "---"; echo; echo "$b"; } | write_file "$BASE/.claude/agents/$name.md"
    rec_copy agent "$CUR_PACK" claude "$BASE/.claude/agents/$name.md"
  fi
  # Cursor also reads .claude/agents: only write its own copy when Claude is not selected.
  if has_agent cursor && ! has_agent claude; then
    { echo "---"; echo "name: $name"; echo "description: $(yaml_str "$desc")"
      [ "$ro" = "true" ] && echo "readonly: true"
      m="$(model_for cursor "$tier")"; [ -n "$m" ] && echo "model: $m"
      echo "---"; echo; echo "$b"; } | write_file "$BASE/.cursor/agents/$name.md"
    rec_copy agent "$CUR_PACK" cursor "$BASE/.cursor/agents/$name.md"
  fi
  if has_agent codex; then
    { echo "name = \"$name\""; echo "description = \"$(toml_str "$desc")\""
      [ "$ro" = "true" ] && echo 'sandbox_mode = "read-only"'
      m="$(model_for codex "$tier")"; [ -n "$m" ] && echo "model = \"$(toml_str "$m")\""
      echo "developer_instructions = '''"; echo "$b"; echo "'''"; } | write_file "$BASE/.codex/agents/$name.toml"
    rec_copy agent "$CUR_PACK" codex "$BASE/.codex/agents/$name.toml"
  fi
  if has_agent opencode; then
    local od="$BASE/.opencode/agents"; [ "$SCOPE" = "global" ] && od="$HOME/.config/opencode/agents"
    { echo "---"; echo "description: $(yaml_str "$desc")"; echo "mode: subagent"
      m="$(model_for opencode "$tier")"; [ -n "$m" ] && echo "model: $m"
      [ "$ro" = "true" ] && printf 'permission:\n  edit: deny\n  bash: deny\n'
      echo "---"; echo; echo "$b"; } | write_file "$od/$name.md"
    rec_copy agent "$CUR_PACK" opencode "$od/$name.md"
  fi
}

# --- install -------------------------------------------------------------------
# Rendered rules hold this clone's path in single quotes: refuse a path that would break them (RF-49).
if [ "$SCOPE" = "global" ]; then
  for pack in $(echo "$PACKS" | tr ',' ' '); do
    [ -f "$(pack_dir "$pack")/rules.md" ] || continue
    case "$RENDER_ROOT" in *"'"*|*"
"*) die "clone path contains a quote or a newline, so rules cannot name it: $RENDER_ROOT" ;; esac
  done
fi
[ "$DRY" -eq 1 ] && say "(dry run: nothing is written)"
say "scope: $SCOPE ($BASE) · agents: $AGENTS"
[ "$FORCE" -eq 0 ] && report_version_difference
for pack in $(echo "$PACKS" | tr ',' ' '); do
  P="$(pack_dir "$pack")"; [ -d "$P" ] || die "unknown pack: $pack (see --list)"
  CUR_PACK="$pack"
  for a in $(echo "$AGENTS" | tr ',' ' '); do rec_line pair "$pack" "$a"; done
  say "pack $pack"
  if is_custom "$pack" && [ -d "$PACKS_ROOT/packs/$pack" ]; then say "  shadow custom pack $pack replaces the official one"; fi
  if ! is_custom "$pack"; then
    for x in "$P"/scripts/*; do
      [ -f "$x" ] && [ -f "$CUSTOM/scripts/$(basename "$x")" ] && say "  shadow custom script $(basename "$x") replaces the official one"
    done
  fi
  for s in "$P"/skills/*/; do
    [ -f "$s/SKILL.md" ] || continue
    for d in "${SKILL_DIRS[@]}"; do
      copy_dir "${s%/}" "$d/$(basename "$s")"
      for a in $(dir_agents "$d"); do rec_copy skill "$pack" "$a" "$d/$(basename "$s")"; done
    done
  done
  for a in "$P"/agents/*.md; do [ -f "$a" ] && install_agent "$a"; done
  if [ -f "$P/rules.md" ]; then
    if [ "$SCOPE" != "global" ]; then
      say "  note   rules install only with --global (a repo's AGENTS.md may be shared)"
    else
      for a in $(echo "$AGENTS" | tr ',' ' '); do
        dst="$(rules_file "$a")"
        if [ -n "$dst" ]; then merge_rules "$pack" "$P/rules.md" "$dst"; rec_rules "$pack" "$a" "$dst"
        else
          say "  note   $a has no global rules file: paste this block into its user rules:"
          render "$P/rules.md"
          say "  end of block"
        fi
      done
    fi
  fi
  if [ -d "$P/scripts" ] && [ "$SCOPE" = "global" ]; then say "  scripts run from $ROOT with rigorkit script <name>"; fi
done

rec_write

if has_agent claude && { has_agent cursor || has_agent opencode; }; then
  say "note: Cursor and OpenCode also read .claude/skills; with both folders present they may list each skill twice."
fi
case ",$PACKS," in
  *",sdd,"*) say "done. Next, in your repo: ask your agent to run the sdd-init skill." ;;
  *) say "done." ;;
esac
