# rigorkit shared helpers for lib/update.sh (bash). Sourced, never run.
# Fingerprints and the record format are twins of install.sh ("global record"); keep both equal.

RK_VERSION_RE='^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$'
TAB="$(printf '\t')"

valid_version() { [[ "$1" =~ $RK_VERSION_RE ]]; }
newer() { # a b -> status 0 when version a > version b
  awk -v a="$1" -v b="$2" 'BEGIN { split(a, x, "."); split(b, y, ".")
    for (i = 1; i <= 3; i++) { if (length(x[i]) != length(y[i])) exit !(length(x[i]) > length(y[i]))
      if (x[i] "" != y[i] "") exit !(x[i] "" > y[i] "") }
    exit 1 }'
}
sort_versions() { # stdin versions -> ascending, valid ones only
  awk '/^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$/' | LC_ALL=C sort -t. -k1,1n -k2,2n -k3,3n | uniq
}
print_safe() { # stdin -> stdout; C0 controls other than tab and newline, DEL and UTF-8 C1 controls become "?" (SR-2)
  LC_ALL=C awk '{ gsub(/\302[\200-\237]/, "?"); gsub(/[\001-\010\013-\037\177]/, "?"); print }'
}
say_safe() { printf '%s\n' "$*" | print_safe; }

sha256() { if command -v shasum >/dev/null 2>&1; then shasum -a 256 | cut -d' ' -f1; else sha256sum | cut -d' ' -f1; fi; }
fp_text() { LC_ALL=C sed -e 's/[[:space:]]*$//' | sha256; }   # stdin; CR and trailing blanks ignored
fp_file() { fp_text < "$1"; }
fp_skill() { # folder -> fingerprint of its regular files except .rigorkit
  ( cd "$1" && find . -type f ! -name .rigorkit | LC_ALL=C sort | while IFS= read -r f; do printf '%s %s\n' "${f#./}" "$(fp_file "$f")"; done ) | sha256
}
fp_path() { # kind path -> fingerprint, "-" when missing or a link
  if [ -L "$2" ] || [ ! -e "$2" ]; then echo -; return; fi
  if [ "$1" = skill ]; then fp_skill "$2"; else fp_file "$2"; fi
}
block_of() { # pack file -> the lines between the pack's markers (status 1 when absent)
  local s="<!-- rigorkit:$1:start -->" e="<!-- rigorkit:$1:end -->"
  [ -f "$2" ] && grep -qxF "$s" "$2" && grep -qxF "$e" "$2" || return 1
  awk -v s="$s" -v e="$e" '$0==e{f=0} f{print} $0==s{f=1}' "$2"
}
record_valid() { # file: header line plus known lines only
  awk -F'\t' 'NR==1 { if ($0 != "rigorkit-global-record 1") bad=1; next }
    $1=="version" && NF==2 && $2 ~ /^[0-9]+\.[0-9]+\.[0-9]+$/ { next }
    $1=="pair" && NF==3 { next }
    $1=="copy" && NF==7 && ($2=="skill" || $2=="agent") { next }
    $1=="rules" && NF==5 { next }
    { bad=1 } END { exit (bad || NR == 0) }' "$1" 2>/dev/null
}

real_file() { # path -> the file a chain of symbolic links points to (twin of install.sh real_file)
  local f="$1" l n=0
  while [ -L "$f" ]; do
    n=$((n + 1)); [ "$n" -le 40 ] || return 1
    l="$(readlink "$f")"
    case "$l" in /*) f="$l" ;; *) f="$(dirname "$f")/$l" ;; esac
  done
  printf '%s\n' "$f"
}
backup() { # real-file -> <real-file>.rigorkit.bak with the original mode (twin of install.sh backup)
  local b="$1.rigorkit.bak" t
  t="$( umask 077; mktemp "$1.rigorkit.bak.XXXXXX" )" || return 1
  ( umask 077; cp -p "$1" "$t" ) && mv -f "$t" "$b" || { rm -f "$t"; return 1; }
  say_safe "  backup $b"
}
