#!/bin/sh
# rigorkit notices (010 RF-1–RF-9, RF-31): reads the configuration, starts a due check, keeps the agent
# notice file and prints the notice line or asks the update question.
# Usage: notice.sh --shell             (from lib/startup.sh)
#        notice.sh --run <cmd> [args]  (from bin/rigorkit, interactive runs only)
# Silent on every error; never changes the caller's exit status.
set -u
CLONE=$HOME/.rigorkit
STATE=$HOME/.local/state/rigorkit
CONF=$HOME/.config/rigorkit/config
DAY=86400

valid() { printf '%s\n' "$1" | LC_ALL=C grep -Eqx '(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)'; }
newer() { # a b -> status 0 when version a > version b
  awk -v a="$1" -v b="$2" 'BEGIN { split(a, x, "."); split(b, y, ".")
    for (i = 1; i <= 3; i++) { if (length(x[i]) != length(y[i])) exit !(length(x[i]) > length(y[i]))
      if (x[i] "" != y[i] "") exit !(x[i] "" > y[i] "") }
    exit 1 }'
}
conf() { # key -> value (empty when absent)
  [ -r "$CONF" ] || return 0
  awk -v k="$1" 'function t(x) { gsub(/^[ \t]+|[ \t]+$/, "", x); return x }
    /^[ \t]*#/ { next }
    { i = index($0, "="); if (!i) next; if (t(substr($0, 1, i - 1)) == k) { print t(substr($0, i + 1)); exit } }' "$CONF" 2>/dev/null
}
st() { # key -> value from the check state (empty when absent or unreadable)
  [ -f "$STATE/check" ] && [ ! -L "$STATE/check" ] && [ -r "$STATE/check" ] || return 0
  awk -v k="$1" 'index($0, k "=") == 1 { print substr($0, length(k) + 2); exit }' "$STATE/check" 2>/dev/null
}
digits() { case $1 in ''|*[!0-9]*) return 1 ;; esac; }
write_state() { # checked newest declined: atomic rewrite, silent on failure
  [ -L "$STATE" ] && return 1
  ( umask 077; mkdir -p "$STATE" ) 2>/dev/null || return 1
  t=$( (umask 077; mktemp "$STATE/check.XXXXXX") 2>/dev/null ) || return 1
  if printf 'checked=%s\nnewest=%s\ndeclined=%s\n' "$1" "$2" "$3" > "$t" 2>/dev/null && mv -f "$t" "$STATE/check" 2>/dev/null; then return 0; fi
  rm -f "$t" 2>/dev/null; return 1
}

kind=${1-}; [ $# -gt 0 ] && shift
# Only the clone at ~/.rigorkit checks and notifies (a development clone does nothing).
self=$(cd "$(dirname "$0")/.." 2>/dev/null && pwd -P) || exit 0
clone=$(cd "$CLONE" 2>/dev/null && pwd -P) || exit 0
[ "$self" = "$clone" ] || exit 0
[ -L "$STATE" ] && exit 0

cmd=; check=1; line=1; dry=0
if [ "$kind" = --run ]; then
  [ -t 0 ] && [ -t 2 ] || exit 0
  cmd=${1-}
  for a in "$@"; do case $a in --dry-run) dry=1 ;; --help|-h) [ "$cmd" = script ] || cmd=help ;; esac; done
  [ "$cmd" = script ] && dry=0   # script arguments belong to the script
  case $cmd in
    update) exit 0 ;;
    ''|help|--help|-h) line=0 ;;
  esac
  [ "$dry" -eq 1 ] && check=0
elif [ "$kind" != --shell ]; then exit 0
fi

mode=$(conf update_mode); days=$(conf update_days)
warn() { [ "$kind" = --run ] && printf 'rigorkit: warning: invalid %s in %s; using %s\n' "$1" "$CONF" "$2" >&2; }
case $mode in
  ''|prompt) mode=prompt ;;
  reminder|disabled) ;;
  *) warn update_mode prompt; mode=prompt ;;
esac
case $days in
  '') days=1 ;;
  0*|*[!0-9]*) warn update_days 1; days=1 ;;
esac
if [ "$mode" = disabled ]; then rm -f "$STATE/notice" 2>/dev/null; exit 0; fi

now=$(date +%s)
checked=$(st checked); newest=$(st newest); declined=$(st declined)
digits "$checked" || checked=
digits "$declined" || declined=
valid "$newest" || newest=

if [ "$check" -eq 1 ]; then
  if [ -z "$checked" ] || [ "$checked" -gt "$now" ] || [ $((now - checked)) -ge $((days * DAY)) ]; then
    ( nohup sh "$clone/lib/check.sh" </dev/null >/dev/null 2>&1 & ) 2>/dev/null
  fi
fi

version=$(tr -d ' \t\r\n' < "$clone/VERSION" 2>/dev/null)
if valid "$version" && [ -n "$newest" ] && newer "$newest" "$version"; then
  msg="rigorkit $newest is available (you have $version)"
  t=$( (umask 077; mkdir -p "$STATE" && mktemp "$STATE/notice.XXXXXX") 2>/dev/null ) &&
    { printf '%s; run: rigorkit update\n' "$msg" > "$t" && mv -f "$t" "$STATE/notice"; } 2>/dev/null || rm -f "$t" 2>/dev/null
else
  rm -f "$STATE/notice" 2>/dev/null
  exit 0
fi

if [ "$kind" = --run ]; then
  [ "$line" -eq 1 ] && printf '%s; run: rigorkit update\n' "$msg" >&2
  exit 0
fi
if [ "$mode" = reminder ]; then printf '%s; run: rigorkit update\n' "$msg"; exit 0; fi
[ -n "$checked" ] && [ "$declined" = "$checked" ] && exit 0   # RF-3: no again until the next check
printf '%s. Update now? [y/N] ' "$msg"
answer=
read -r answer || answer=
case $answer in
  [yY]|[yY][eE][sS]) exec "$clone/bin/rigorkit" update ;;
esac
[ -n "$checked" ] && write_state "$checked" "$newest" "$checked"
exit 0
