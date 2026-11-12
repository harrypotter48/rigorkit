#!/bin/sh
# Background update check (010 RF-1, RF-6; SR-1, SR-3; PC-1–PC-3), started detached by lib/notice.sh.
# Reads the release tags of the clone's origin without prompting, keeps only X.Y.Z versions and records
# the newest one. One check at a time; a failure keeps the previous result and records only the time.
set -u
CLONE=$HOME/.rigorkit
STATE=$HOME/.local/state/rigorkit
LOCK=$STATE/check.lock
[ -L "$STATE" ] && exit 0
( umask 077; mkdir -p "$STATE" ) 2>/dev/null || exit 0
if ! mkdir "$LOCK" 2>/dev/null; then
  [ -n "$(find "$LOCK" -prune -mmin +1 2>/dev/null)" ] || exit 0   # held by a live check
  rmdir "$LOCK" 2>/dev/null; mkdir "$LOCK" 2>/dev/null || exit 0  # stale (older than 60 s)
fi
out=$STATE/ls.$$
trap 'rm -f "$out"; rmdir "$LOCK" 2>/dev/null' EXIT
trap 'exit 1' INT TERM

st() { awk -v k="$1" 'index($0, k "=") == 1 { print substr($0, length(k) + 2); exit }' "$STATE/check" 2>/dev/null; }
prev=$(st newest); declined=$(st declined)
printf '%s\n' "$prev" | LC_ALL=C grep -Eqx '(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)' || prev=
case $declined in ''|*[!0-9]*) declined= ;; esac

GIT_TERMINAL_PROMPT=0 GIT_ASKPASS=false SSH_ASKPASS=false GIT_SSH_COMMAND='ssh -o BatchMode=yes' \
  GIT_ALLOW_PROTOCOL=https:ssh:file git -C "$CLONE" ls-remote --tags --refs -- origin </dev/null >"$out" 2>/dev/null &
pid=$!
( sleep 30; kill "$pid" 2>/dev/null ) </dev/null >/dev/null 2>&1 &
watchdog=$!
wait "$pid"; rc=$?
kill "$watchdog" 2>/dev/null

newest=$prev
if [ "$rc" -eq 0 ]; then
  declined=   # RF-3: a successful check is a new chance to ask; a failed one keeps the previous answer
  newest=$(LC_ALL=C awk -F'\t' '
    $2 ~ /^refs\/tags\/v/ { v = substr($2, 12)
      if (v !~ /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$/) next
      if (best == "" || gt(v, best)) best = v }
    function gt(a, b,  x, y, i) { split(a, x, "."); split(b, y, ".")
      for (i = 1; i <= 3; i++) { if (length(x[i]) != length(y[i])) return length(x[i]) > length(y[i])
        if (x[i] "" != y[i] "") return x[i] "" > y[i] "" }
      return 0 }
    END { print best }' "$out")
fi
t=$( (umask 077; mktemp "$STATE/check.XXXXXX") 2>/dev/null ) || exit 0
if printf 'checked=%s\nnewest=%s\ndeclined=%s\n' "$(date +%s)" "$newest" "$declined" > "$t" && mv -f "$t" "$STATE/check"; then exit 0; fi
rm -f "$t"
