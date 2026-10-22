#!/usr/bin/env bash
# rigorkit installer — copies packs (skills, agents, rules, scripts) to each coding agent's folders.
#
#   ./install.sh --pack sdd --agent claude,codex,cursor,opencode [--project DIR | --global] [--force] [--dry-run]
#   ./install.sh --pack all --agent claude --force    (every pack; --force overwrites what exists)
#   ./install.sh --pack core --agent claude,codex,opencode --global   (rules + scripts: --global only)
#   ./install.sh --uninstall-rules --agent claude,codex,opencode [--dry-run]
#   ./install.sh --list
#
# Skills use the Agent Skills format (<name>/SKILL.md) and are COPIED, not symlinked
# (symlinked skills are unreliable in Cursor and Codex). Agents are written in a neutral
# Markdown format in packs/<pack>/agents/ and converted here to each tool's format.
# Agent tiers map to models per tool in ~/.config/rigorkit/models (optional, see README).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
PACKS=""; AGENTS=""; SCOPE="project"; DEST="$PWD"; FORCE=0; DRY=0; UNINSTALL=0
MODELS="${RIGORKIT_MODELS:-$HOME/.config/rigorkit/models}"
SCRIPTS_DIR="$HOME/.local/share/rigorkit/scripts"

usage() { sed -n '2,13p' "$0" | sed 's/^# \{0,1\}//'; exit "${1:-0}"; }
die() { echo "error: $*" >&2; exit 1; }
say() { echo "$*"; }

while [ $# -gt 0 ]; do
  case "$1" in
    --pack) PACKS="${2:-}"; shift 2 ;;
    --agent) AGENTS="${2:-}"; shift 2 ;;
    --project) SCOPE="project"; DEST="${2:-}"; shift 2 ;;
    --global) SCOPE="global"; shift ;;
    --force) FORCE=1; shift ;;
    --dry-run) DRY=1; shift ;;
    --uninstall-rules) UNINSTALL=1; SCOPE="global"; shift ;;
    --list)
      echo "all  (every pack below)"
      for p in "$ROOT"/packs/*/; do
        p="$(basename "$p")"; echo "$p"
        for s in "$ROOT/packs/$p"/skills/*/; do [ -d "$s" ] && echo "  skill  $(basename "$s")"; done
        for a in "$ROOT/packs/$p"/agents/*.md; do [ -f "$a" ] && echo "  agent  $(basename "$a" .md)"; done
        [ -f "$ROOT/packs/$p/rules.md" ] && echo "  rules  (global only)"
        for x in "$ROOT/packs/$p"/scripts/*; do [ -f "$x" ] && echo "  script $(basename "$x")"; done
      done; exit 0 ;;
    -h|--help) usage 0 ;;
    *) die "unknown option: $1 (see --help)" ;;
  esac
done

[ -n "$PACKS" ] || [ "$UNINSTALL" -eq 1 ] || usage 1
case ",$PACKS," in
  ",all,") PACKS="$(for p in "$ROOT"/packs/*/; do basename "$p"; done | paste -sd, -)" ;;
  *",all,"*) die "--pack all cannot be combined with other packs" ;;
esac
[ -n "$AGENTS" ] || die "--agent is required (claude,codex,cursor,opencode)"
[ "$SCOPE" = "global" ] || [ -d "$DEST" ] || die "project dir not found: $DEST"
[ "$SCOPE" = "global" ] && BASE="$HOME" || BASE="$(cd "$DEST" && pwd)"

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
  printf 'installed-by: rigorkit\nsource: %s\ndate: %s\n' "$1" "$(date +%Y-%m-%d)" > "$2/.rigorkit"
}

write_file() { # dst (content on stdin)
  if [ -e "$1" ] && [ "$FORCE" -eq 0 ]; then say "  skip   $1 (exists; --force to overwrite)"; cat >/dev/null; return; fi
  say "  write  $1"
  if [ "$DRY" -eq 1 ]; then cat >/dev/null; return; fi
  mkdir -p "$(dirname "$1")"; cat > "$1"
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

apply_rules() { # dst new-content-file: shows the diff on --dry-run, keeps a .bak otherwise
  local dst="$1" tmp="$2" old="/dev/null"
  if [ -f "$dst" ] && cmp -s "$dst" "$tmp"; then say "  same   $dst"; rm -f "$tmp"; return; fi
  say "  rules  $dst"
  if [ "$DRY" -eq 1 ]; then
    [ -f "$dst" ] && old="$dst"
    diff -u "$old" "$tmp" | tail -n +3 | sed 's/^/    /' || true
    rm -f "$tmp"; return
  fi
  mkdir -p "$(dirname "$dst")"
  if [ -f "$dst" ]; then cp "$dst" "$dst.bak"; say "  backup $dst.bak"; fi
  cat "$tmp" > "$dst"; rm -f "$tmp"
}

merge_rules() { # pack rules-file dst: replaces the block if present, appends it otherwise
  local s="<!-- rigorkit:$1:start -->" e="<!-- rigorkit:$1:end -->" src="$2" dst="$3" tmp
  tmp="$(mktemp)"
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
  tmp="$(mktemp)"
  awk -v s="$s" -v e="$e" '
    $0==s { skip=1; held=0; next }
    skip  { if ($0==e) skip=0; next }
    { if (held) print ""; held=0 }
    /^$/  { held=1; next }
    { print }
    END   { if (held) print "" }' "$dst" > "$tmp"
  apply_rules "$dst" "$tmp"
}

install_script() { # src: always kept in sync, since the rules point to it
  local dst="$SCRIPTS_DIR/$(basename "$1")"
  if [ -f "$dst" ] && cmp -s "$1" "$dst"; then say "  same   $dst"; return; fi
  say "  script $dst"
  [ "$DRY" -eq 1 ] && return
  mkdir -p "$SCRIPTS_DIR"; cp "$1" "$dst"; chmod +x "$dst"
}

if [ "$UNINSTALL" -eq 1 ]; then
  [ "$DRY" -eq 1 ] && say "(dry run: nothing is written)"
  for r in "$ROOT"/packs/*/rules.md; do
    [ -f "$r" ] || continue
    pack="$(basename "$(dirname "$r")")"; say "rules $pack"
    for a in $(echo "$AGENTS" | tr ',' ' '); do
      dst="$(rules_file "$a")"; [ -n "$dst" ] && remove_rules "$pack" "$dst"
    done
  done
  say "done. Scripts stay in $SCRIPTS_DIR (delete the folder to remove them)."
  exit 0
fi

# --- neutral agent parsing -----------------------------------------------------
# Frontmatter value (one line); strips YAML single quotes and unescapes ''.
fm()   { awk -v k="$2" 'NR==1&&/^---$/{f=1;next} f&&/^---$/{exit} f&&index($0,k": ")==1{sub("^"k": ","");print;exit}' "$1" \
           | sed -e "s/^'\(.*\)'$/\1/" -e "s/''/'/g"; }
body() { awk 'NR==1&&/^---$/{f=1;next} f==1&&/^---$/{f=2;next} f==2{print}' "$1" | sed '1{/^$/d;}'; }
# Model for a tier in a tool, from $MODELS ("tool.tier=model" lines); empty = inherit the session's.
model_for() {
  [ -n "$2" ] && [ -f "$MODELS" ] || return 0
  awk -v k="$1.$2" '
    function trim(x) { gsub(/^[ \t]+|[ \t]+$/, "", x); return x }
    /^[ \t]*#/ { next }
    { i = index($0, "="); if (i && trim(substr($0, 1, i - 1)) == k) { print trim(substr($0, i + 1)); exit } }' "$MODELS"
}
toml_str() { printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'; }
yaml_str() { printf "'%s'" "$(printf '%s' "$1" | sed "s/'/''/g")"; }

install_agent() { # neutral agent file
  local f="$1" name desc ro tier m b
  name="$(fm "$f" name)"; desc="$(fm "$f" description)"; ro="$(fm "$f" readonly)"; tier="$(fm "$f" tier)"; b="$(body "$f")"
  [ -n "$name" ] && [ -n "$desc" ] || die "agent without name/description: $f"
  case "$tier" in ""|barato|fuerte) ;; *) die "agent $f: tier must be barato or fuerte" ;; esac

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
[ "$DRY" -eq 1 ] && say "(dry run: nothing is written)"
say "scope: $SCOPE ($BASE) · agents: $AGENTS"
for pack in $(echo "$PACKS" | tr ',' ' '); do
  P="$ROOT/packs/$pack"; [ -d "$P" ] || die "unknown pack: $pack (see --list)"
  say "pack $pack"
  for s in "$P"/skills/*/; do
    [ -f "$s/SKILL.md" ] || continue
    for d in "${SKILL_DIRS[@]}"; do copy_dir "${s%/}" "$d/$(basename "$s")"; done
  done
  for a in "$P"/agents/*.md; do [ -f "$a" ] && install_agent "$a"; done
  if [ -f "$P/rules.md" ] || [ -d "$P/scripts" ]; then
    if [ "$SCOPE" != "global" ]; then
      say "  note   rules and scripts install only with --global (a repo's AGENTS.md may be shared)"
    else
      if [ -f "$P/rules.md" ]; then
        for a in $(echo "$AGENTS" | tr ',' ' '); do
          dst="$(rules_file "$a")"
          if [ -n "$dst" ]; then merge_rules "$pack" "$P/rules.md" "$dst"
          else say "  note   $a has no global rules file: paste $P/rules.md into its user rules"; fi
        done
      fi
      for x in "$P"/scripts/*; do [ -f "$x" ] && install_script "$x"; done
    fi
  fi
done

if has_agent claude && { has_agent cursor || has_agent opencode; }; then
  say "note: Cursor and OpenCode also read .claude/skills; with both folders present they may list each skill twice."
fi
case ",$PACKS," in
  *",sdd,"*) say "done. Next, in your repo: ask your agent to run the sdd-init skill." ;;
  *) say "done." ;;
esac
