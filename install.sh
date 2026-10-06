#!/usr/bin/env bash
# rigorkit installer — copies packs (skills + agents) to each coding agent's folders.
#
#   ./install.sh --pack sdd --agent claude,codex,cursor,opencode [--project DIR | --global] [--force] [--dry-run]
#   ./install.sh --list
#
# Skills use the Agent Skills format (<name>/SKILL.md) and are COPIED, not symlinked
# (symlinked skills are unreliable in Cursor and Codex). Agents are written in a neutral
# Markdown format in packs/<pack>/agents/ and converted here to each tool's format.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
PACKS=""; AGENTS=""; SCOPE="project"; DEST="$PWD"; FORCE=0; DRY=0

usage() { sed -n '2,10p' "$0" | sed 's/^# \{0,1\}//'; exit "${1:-0}"; }
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
    --list)
      for p in "$ROOT"/packs/*/; do
        p="$(basename "$p")"; echo "$p"
        for s in "$ROOT/packs/$p"/skills/*/; do [ -d "$s" ] && echo "  skill  $(basename "$s")"; done
        for a in "$ROOT/packs/$p"/agents/*.md; do [ -f "$a" ] && echo "  agent  $(basename "$a" .md)"; done
      done; exit 0 ;;
    -h|--help) usage 0 ;;
    *) die "unknown option: $1 (see --help)" ;;
  esac
done

[ -n "$PACKS" ] || usage 1
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

# --- neutral agent parsing -----------------------------------------------------
# Frontmatter value (one line); strips YAML single quotes and unescapes ''.
fm()   { awk -v k="$2" 'NR==1&&/^---$/{f=1;next} f&&/^---$/{exit} f&&index($0,k": ")==1{sub("^"k": ","");print;exit}' "$1" \
           | sed -e "s/^'\(.*\)'$/\1/" -e "s/''/'/g"; }
body() { awk 'NR==1&&/^---$/{f=1;next} f==1&&/^---$/{f=2;next} f==2{print}' "$1" | sed '1{/^$/d;}'; }
toml_str() { printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'; }
yaml_str() { printf "'%s'" "$(printf '%s' "$1" | sed "s/'/''/g")"; }

install_agent() { # neutral agent file
  local f="$1" name desc ro b
  name="$(fm "$f" name)"; desc="$(fm "$f" description)"; ro="$(fm "$f" readonly)"; b="$(body "$f")"
  [ -n "$name" ] && [ -n "$desc" ] || die "agent without name/description: $f"

  if has_agent claude; then
    { echo "---"; echo "name: $name"; echo "description: $(yaml_str "$desc")"
      [ "$ro" = "true" ] && echo "tools: Read, Grep, Glob"
      echo "---"; echo; echo "$b"; } | write_file "$BASE/.claude/agents/$name.md"
  fi
  # Cursor also reads .claude/agents: only write its own copy when Claude is not selected.
  if has_agent cursor && ! has_agent claude; then
    { echo "---"; echo "name: $name"; echo "description: $(yaml_str "$desc")"
      [ "$ro" = "true" ] && echo "readonly: true"
      echo "---"; echo; echo "$b"; } | write_file "$BASE/.cursor/agents/$name.md"
  fi
  if has_agent codex; then
    { echo "name = \"$name\""; echo "description = \"$(toml_str "$desc")\""
      [ "$ro" = "true" ] && echo 'sandbox_mode = "read-only"'
      echo "developer_instructions = '''"; echo "$b"; echo "'''"; } | write_file "$BASE/.codex/agents/$name.toml"
  fi
  if has_agent opencode; then
    local od="$BASE/.opencode/agents"; [ "$SCOPE" = "global" ] && od="$HOME/.config/opencode/agents"
    { echo "---"; echo "description: $(yaml_str "$desc")"; echo "mode: subagent"
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
done

if has_agent claude && { has_agent cursor || has_agent opencode; }; then
  say "note: Cursor and OpenCode also read .claude/skills; with both folders present they may list each skill twice."
fi
say "done. Next, in your repo: ask your agent to run the sdd-init skill."
