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
RENDER="'$ROOT/bin/rigorkit'"   # rules placeholder {{RIGORKIT}} -> this clone's rigorkit, single-quoted

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
pack_dir() { if is_custom "$1"; then echo "$CUSTOM/packs/$1"; else echo "$ROOT/packs/$1"; fi; }
all_packs() { # official (glob order), then custom-only names
  local p n
  for p in "$ROOT"/packs/*/; do basename "$p"; done
  for n in $CUSTOM_PACKS; do [ -d "$ROOT/packs/$n" ] || echo "$n"; done
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
        elif [ -d "$ROOT/packs/$p" ]; then echo "$p  (custom, replaces the official pack)"
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
  if [ -e "$2" ] && [ "$FORCE" -eq 0 ]; then say "  skip   $2 (exists; --force to overwrite)"; return; fi
  say "  copy   $2"
  [ "$DRY" -eq 1 ] && return
  rm -rf "$2"; mkdir -p "$(dirname "$2")"; cp -R "$1" "$2"
  printf 'installed-by: rigorkit\nsource: %s\ndate: %s\nversion: %s\n' "$1" "$(date +%Y-%m-%d)" "$VERSION" > "$2/.rigorkit"
  mark_installed_version
}

write_file() { # dst (content on stdin)
  if [ -e "$1" ] && [ "$FORCE" -eq 0 ]; then say "  skip   $1 (exists; --force to overwrite)"; cat >/dev/null; return; fi
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
    [ -f "$(pack_dir "$pack")/rules.md" ] || [ -f "$ROOT/packs/$pack/rules.md" ] || continue
    say "rules $pack"
    for a in $(echo "$AGENTS" | tr ',' ' '); do
      dst="$(rules_file "$a")"; [ -n "$dst" ] && remove_rules "$pack" "$dst"
    done
  done
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
  fi
  # Cursor also reads .claude/agents: only write its own copy when Claude is not selected.
  if has_agent cursor && ! has_agent claude; then
    { echo "---"; echo "name: $name"; echo "description: $(yaml_str "$desc")"
      [ "$ro" = "true" ] && echo "readonly: true"
      m="$(model_for cursor "$tier")"; [ -n "$m" ] && echo "model: $m"
      echo "---"; echo; echo "$b"; } | write_file "$BASE/.cursor/agents/$name.md"
  fi
  if has_agent codex; then
    { echo "name = \"$name\""; echo "description = \"$(toml_str "$desc")\""
      [ "$ro" = "true" ] && echo 'sandbox_mode = "read-only"'
      m="$(model_for codex "$tier")"; [ -n "$m" ] && echo "model = \"$(toml_str "$m")\""
      echo "developer_instructions = '''"; echo "$b"; echo "'''"; } | write_file "$BASE/.codex/agents/$name.toml"
  fi
  if has_agent opencode; then
    local od="$BASE/.opencode/agents"; [ "$SCOPE" = "global" ] && od="$HOME/.config/opencode/agents"
    { echo "---"; echo "description: $(yaml_str "$desc")"; echo "mode: subagent"
      m="$(model_for opencode "$tier")"; [ -n "$m" ] && echo "model: $m"
      [ "$ro" = "true" ] && printf 'permission:\n  edit: deny\n  bash: deny\n'
      echo "---"; echo; echo "$b"; } | write_file "$od/$name.md"
  fi
}

# --- install -------------------------------------------------------------------
# Rendered rules hold this clone's path in single quotes: refuse a path that would break them (RF-49).
if [ "$SCOPE" = "global" ]; then
  for pack in $(echo "$PACKS" | tr ',' ' '); do
    [ -f "$(pack_dir "$pack")/rules.md" ] || continue
    case "$ROOT" in *"'"*|*"
"*) die "clone path contains a quote or a newline, so rules cannot name it: $ROOT" ;; esac
  done
fi
[ "$DRY" -eq 1 ] && say "(dry run: nothing is written)"
say "scope: $SCOPE ($BASE) · agents: $AGENTS"
[ "$FORCE" -eq 0 ] && report_version_difference
for pack in $(echo "$PACKS" | tr ',' ' '); do
  P="$(pack_dir "$pack")"; [ -d "$P" ] || die "unknown pack: $pack (see --list)"
  say "pack $pack"
  if is_custom "$pack" && [ -d "$ROOT/packs/$pack" ]; then say "  shadow custom pack $pack replaces the official one"; fi
  if ! is_custom "$pack"; then
    for x in "$P"/scripts/*; do
      [ -f "$x" ] && [ -f "$CUSTOM/scripts/$(basename "$x")" ] && say "  shadow custom script $(basename "$x") replaces the official one"
    done
  fi
  for s in "$P"/skills/*/; do
    [ -f "$s/SKILL.md" ] || continue
    for d in "${SKILL_DIRS[@]}"; do copy_dir "${s%/}" "$d/$(basename "$s")"; done
  done
  for a in "$P"/agents/*.md; do [ -f "$a" ] && install_agent "$a"; done
  if [ -f "$P/rules.md" ]; then
    if [ "$SCOPE" != "global" ]; then
      say "  note   rules install only with --global (a repo's AGENTS.md may be shared)"
    else
      for a in $(echo "$AGENTS" | tr ',' ' '); do
        dst="$(rules_file "$a")"
        if [ -n "$dst" ]; then merge_rules "$pack" "$P/rules.md" "$dst"
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

if has_agent claude && { has_agent cursor || has_agent opencode; }; then
  say "note: Cursor and OpenCode also read .claude/skills; with both folders present they may list each skill twice."
fi
case ",$PACKS," in
  *",sdd,"*) say "done. Next, in your repo: ask your agent to run the sdd-init skill." ;;
  *) say "done." ;;
esac
