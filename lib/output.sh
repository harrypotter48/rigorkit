# Rigorkit terminal presentation (021 RF-1–RF-7). POSIX sh; sourced, never run.
# Apply only at explicit display sites, after their existing safe-print filter.
# No flags, exports, file writes or output when this file is sourced.

rk_color_enabled() {
  [ -t 1 ] && [ -z "${NO_COLOR-}" ] || return 1
  [ "${TERM-}" = dumb ] || return 0
  # RF-2.E2/F1: Bash can create an unexported TERM=dumb when the caller
  # supplied no TERM. Only an actual environment opt-out disables colors.
  # Read the complete stream: an early grep -q could SIGPIPE env under pipefail.
  env | LC_ALL=C awk '$0 == "TERM=dumb" { dumb = 1 } END { exit dumb ? 1 : 0 }'
}

rk_present() (
  # stdout is the final destination, including when this function is redirected
  # to stderr. Never cache the parent's terminal state across pipes or captures.
  if ! rk_color_enabled; then cat; return; fi
  case "$1" in
    success) rk_code=32 ;;
    error) rk_code=31 ;;
    warning|question) rk_code=33 ;;
    heading) rk_code=36 ;;
    *) cat; return ;;
  esac
  printf '\033[%sm' "$rk_code"
  rk_status=0
  cat || rk_status=$?
  printf '\033[0m'
  return "$rk_status"
)

rk_present_diff() (
  if ! rk_color_enabled; then cat; return; fi
  # Only actual hunk records carry +/- semantics. Counts prevent a subsequent
  # file header (or a payload starting with ++/--) from forging a category.
  LC_ALL=C awk '
    BEGIN { esc = sprintf("%c", 27); old_left = 0; new_left = 0 }
    {
      line = $0; code = 0
      if (substr(line, 1, 4) == "    ") line = substr(line, 5)
      if (!old_left && !new_left && line ~ /^@@ -[0-9]+(,[0-9]+)? [+][0-9]+(,[0-9]+)? @@/) {
        split(line, fields, " ")
        n = split(substr(fields[2], 2), range, ","); old_left = n == 2 ? range[2] + 0 : 1
        n = split(substr(fields[3], 2), range, ","); new_left = n == 2 ? range[2] + 0 : 1
        code = 36
      } else if (old_left || new_left) {
        marker = substr(line, 1, 1)
        if (marker == "+") { code = 32; new_left-- }
        else if (marker == "-") { code = 31; old_left-- }
        else if (marker == " ") { old_left--; new_left-- }
      }
      if (code) printf "%s[%sm%s%s[0m\n", esc, code, $0, esc
      else print
    }'
)

rk_present_help() (
  if ! rk_color_enabled; then cat; return; fi
  LC_ALL=C awk '
    BEGIN { esc = sprintf("%c", 27) }
    /^Usage:/ || /^[A-Za-z][^\t]*:$/ { printf "%s[36m%s%s[0m\n", esc, $0, esc; next }
    { print }'
)

rk_present_changelog() (
  if ! rk_color_enabled; then cat; return; fi
  LC_ALL=C awk '
    BEGIN { esc = sprintf("%c", 27) }
    /^##? / { printf "%s[36m%s%s[0m\n", esc, $0, esc; next }
    { print }'
)

rk_helpfile() { rk_present_help < "$1"; }
