#!/bin/sh
# rigorkit one-line installer (POSIX sh). Run it as:
#   sh -c "$(curl -fsSL https://raw.githubusercontent.com/harrypotter48/rigorkit/main/tools/install-remote.sh)"
# It clones rigorkit into ~/.rigorkit at the newest vX.Y.Z tag (or RIGORKIT_REF) from RIGORKIT_REMOTE
# (default https://github.com/harrypotter48/rigorkit.git), creates ~/.rigorkit/custom/{packs,scripts}
# and adds a marked startup block to .zshrc / .bashrc / .bash_profile so new shells find `rigorkit`
# and `man rigorkit`. It installs no pack and never runs anything from the clone.
# With an existing ~/.rigorkit clone it only adds missing startup blocks (no git call).
# Everything runs from main(), called on the last line: a truncated download runs nothing.

say() { printf '%s\n' "$*"; }
warn() { printf 'warning: %s\n' "$*" >&2; }
err() { printf 'error: %s\n' "$*" >&2; }
die() { err "$*"; exit 1; }

cleanup_tmp() { # removes the temporary clone folder, only when it is ours
  case ${RK_TMP:-} in
    "$HOME"/.rigorkit-install.?*) rm -rf "$RK_TMP" ;;
  esac
}

print_block() { # the startup block, byte-exact; $HOME stays literal (expanded by the shell that reads it)
  cat <<'EOF'
# rigorkit:start
case ":$PATH:" in *":$HOME/.rigorkit/bin:"*) ;; *) export PATH="$PATH:$HOME/.rigorkit/bin" ;; esac
case ":${MANPATH-}:" in *":$HOME/.rigorkit/man:"*) ;; *) export MANPATH="${MANPATH-}:$HOME/.rigorkit/man" ;; esac
# rigorkit:end
EOF
}

resolve_link() { # path -> final target of its chain of symbolic links (status 1 after 40 links)
  rl_f=$1; rl_n=0
  while [ -L "$rl_f" ]; do
    rl_n=$((rl_n + 1))
    [ "$rl_n" -le 40 ] || return 1
    rl_l=$(readlink "$rl_f") || return 1
    case $rl_l in
      /*) rl_f=$rl_l ;;
      *) rl_f=$(dirname "$rl_f")/$rl_l ;;
    esac
  done
  printf '%s\n' "$rl_f"
}

backup() { # real-file -> <real-file>.rigorkit.bak with the original mode, never more readable meanwhile
  bk_t=$1.rigorkit.bak.tmp.$$
  if ( umask 077 && cp -p "$1" "$bk_t" ) 2>/dev/null && mv -f "$bk_t" "$1.rigorkit.bak" 2>/dev/null; then
    say "  backup $1.rigorkit.bak"
    return 0
  fi
  rm -f "$bk_t" 2>/dev/null
  return 1
}

loads_bashrc() { # file -> status 0 when a non-comment line sources ~/.bashrc, $HOME/.bashrc or ${HOME}/.bashrc
  [ -f "$1" ] && [ -r "$1" ] || return 1
  sed 's/#.*//' "$1" | tr -d "\"'" |
    grep -Eq '(^|[;&|({[:space:]])(\.|source)[[:space:]]+(~|\$HOME|\$\{HOME\})/\.bashrc([;&|)}[:space:]]|$)'
}

exists() { [ -e "$1" ] || [ -L "$1" ]; }

add_block() { # startup-file -> appends the block to the file's real target, after a backup
  ab_f=$1
  if ! ab_real=$(resolve_link "$ab_f"); then
    err "cannot follow the symbolic links of $ab_f; no block written there"; RK_FAILED=1; return
  fi
  if [ -L "$ab_f" ] && [ ! -e "$ab_real" ]; then
    err "$ab_f is a broken symbolic link (to $ab_real); no block written there"; RK_FAILED=1; return
  fi
  if [ ! -e "$ab_real" ]; then
    # New startup file: never group/other-writable, whatever the umask (stricter umasks kept).
    if ( umask "$(printf '%04o' $(( $(umask) | 022 )))"; print_block > "$ab_real" ); then
      say "  block  $ab_f (created)"; RK_WROTE=1
    else
      err "cannot create $ab_f"; RK_FAILED=1
    fi
    return
  fi
  if [ ! -f "$ab_real" ] || [ ! -r "$ab_real" ]; then
    err "cannot read $ab_f as a regular file; no block written there"; RK_FAILED=1; return
  fi
  if grep -qxF '# rigorkit:start' "$ab_real"; then
    grep -qxF '# rigorkit:end' "$ab_real" && return
    err "$ab_f has '# rigorkit:start' without '# rigorkit:end'; fix it by hand"; RK_FAILED=1; return
  fi
  if [ ! -w "$ab_real" ]; then
    err "cannot write $ab_f; no block written there"; RK_FAILED=1; return
  fi
  if ! backup "$ab_real"; then
    err "cannot write the backup $ab_real.rigorkit.bak; $ab_f left unchanged"; RK_FAILED=1; return
  fi
  ab_nl=0; ab_sep=0
  if [ -s "$ab_real" ]; then
    ab_sep=1
    [ -n "$(tail -c 1 "$ab_real")" ] && ab_nl=1
  fi
  if {
    [ "$ab_nl" -eq 0 ] || printf '\n'
    [ "$ab_sep" -eq 0 ] || printf '\n'
    print_block
  } >> "$ab_real"; then
    say "  block  $ab_f"; RK_WROTE=1
  else
    err "cannot write $ab_f"; RK_FAILED=1
  fi
}

write_blocks() { # adds the block to every applicable startup file (zsh: .zshrc; bash: .bashrc, .bash_profile)
  if command -v zsh >/dev/null 2>&1; then
    wb_f=${ZDOTDIR:-$HOME}/.zshrc
    if exists "$wb_f" || [ "$RK_DEFAULT" = zsh ]; then add_block "$wb_f"; fi
  fi
  if command -v bash >/dev/null 2>&1; then
    wb_f=$HOME/.bashrc
    if exists "$wb_f" || [ "$RK_DEFAULT" = bash ]; then add_block "$wb_f"; fi
    wb_f=$HOME/.bash_profile
    if exists "$wb_f" && ! loads_bashrc "$wb_f"; then add_block "$wb_f"; fi
  fi
}

shell_notes() { # unsupported default shell; login bash shells that will not read .bashrc
  case $RK_DEFAULT in
    zsh) ;;
    bash)
      if ! exists "$HOME/.bash_profile" && ! loads_bashrc "$HOME/.profile"; then
        say "hint: login bash shells read ~/.bash_profile or ~/.profile, not ~/.bashrc; to load it there, add: . ~/.bashrc"
      fi ;;
    *) say "note: your default shell is ${SHELL:-unset}; rigorkit supports only zsh and bash startup files" ;;
  esac
}

classify() { # sets RK_STATE: absent | clone | custom_only | other (file tests only: never runs git there)
  if ! exists "$T"; then RK_STATE=absent; return; fi
  if [ -d "$T" ] && [ -e "$T/.git" ] && [ -f "$T/VERSION" ] && [ -f "$T/install.sh" ]; then
    RK_STATE=clone; return
  fi
  RK_STATE=other
  [ -d "$T" ] || return
  cl_n=0; cl_custom=0
  for cl_e in "$T"/* "$T"/.[!.]* "$T"/..?*; do
    exists "$cl_e" || continue
    cl_n=$((cl_n + 1))
    [ "$cl_e" = "$T/custom" ] && [ -d "$cl_e" ] && cl_custom=1
  done
  if [ "$cl_n" -eq 1 ] && [ "$cl_custom" -eq 1 ]; then RK_STATE=custom_only; fi
}

dash_part() { # value part -> refuses when the part is empty or starts with -
  case $2 in
    ''|-*) die "RIGORKIT_REMOTE refused: '$1' has an empty part or a part starting with -" ;;
  esac
}

validate_remote() { # sets RK_REMOTE (what git gets) and RK_REMOTE_NAME (what messages name)
  if [ -z "${RIGORKIT_REMOTE+x}" ]; then
    RK_REMOTE=https://github.com/harrypotter48/rigorkit.git; RK_REMOTE_NAME=$RK_REMOTE; return
  fi
  vr=$RIGORKIT_REMOTE; RK_REMOTE_NAME=$vr
  [ -n "$vr" ] || die "RIGORKIT_REMOTE is set but empty; unset it or give an https://, SSH or local path remote"
  dash_part "$vr" "$vr"
  case $vr in
    https://*|ssh://*)
      vr_rest=${vr#*://}
      case $vr_rest in */?*) ;; *) die "RIGORKIT_REMOTE refused: '$vr' has no repository path" ;; esac
      vr_auth=${vr_rest%%/*}; vr_path=${vr_rest#*/}
      case $vr_auth in *@*) dash_part "$vr" "${vr_auth%@*}"; vr_auth=${vr_auth##*@} ;; esac
      dash_part "$vr" "$vr_auth"; dash_part "$vr" "$vr_path"
      RK_REMOTE=$vr ;;
    *://*)
      die "RIGORKIT_REMOTE refused: '$vr' (only https://, SSH or an existing local path)" ;;
    *)
      if [ -d "$vr" ]; then
        RK_REMOTE=$(CDPATH='' cd -P "$vr" && pwd -P) || die "RIGORKIT_REMOTE refused: cannot open '$vr'"
        return
      fi
      vr_pre=${vr%%:*}
      case $vr in
        *:*) ;;
        *) die "RIGORKIT_REMOTE refused: '$vr' is not an https://, SSH or existing local path remote" ;;
      esac
      case $vr_pre in
        */*|'') die "RIGORKIT_REMOTE refused: '$vr' is not an https://, SSH or existing local path remote" ;;
        *@*) ;;
        *) die "RIGORKIT_REMOTE refused: '$vr' is not an https://, SSH (user@host:path) or existing local path remote" ;;
      esac
      dash_part "$vr" "${vr_pre%%@*}"; dash_part "$vr" "${vr_pre#*@}"; dash_part "$vr" "${vr#*:}"
      RK_REMOTE=$vr ;;
  esac
}

resolve_ref() { # sets RK_REF: RIGORKIT_REF (checked) or the newest vX.Y.Z tag of the remote
  if [ -n "${RIGORKIT_REF+x}" ]; then
    rr=$RIGORKIT_REF
    [ -n "$rr" ] || die "RIGORKIT_REF is set but empty; unset it or name a tag or branch"
    case $rr in -*) die "RIGORKIT_REF refused: '$rr' starts with -" ;; esac
    git check-ref-format --allow-onelevel "$rr" || die "RIGORKIT_REF refused: '$rr' is not a valid ref name"
  fi
  RK_REFS=$(git ls-remote --refs -- "$RK_REMOTE") || die "cannot read the remote $RK_REMOTE_NAME"
  if [ -n "${RIGORKIT_REF+x}" ]; then
    printf '%s\n' "$RK_REFS" | cut -f2 | grep -qxF -e "refs/heads/$rr" -e "refs/tags/$rr" ||
      die "RIGORKIT_REF '$rr' is not a branch or tag of $RK_REMOTE_NAME"
    RK_REF=$rr; return
  fi
  RK_REF=$(printf '%s\n' "$RK_REFS" | cut -f2 |
    sed -n 's|^refs/tags/v\([0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*\)$|\1|p' |
    sort -t. -k1,1n -k2,2n -k3,3n | tail -n 1)
  [ -n "$RK_REF" ] || die "no release exists in $RK_REMOTE_NAME (no vX.Y.Z tag); set RIGORKIT_REF to a tag or branch"
  RK_REF=v$RK_REF
}

loose() { # dir -> prints paths under it (symbolic links excluded) writable by group or others
  find "$1" ! -type l \( -perm -020 -o -perm -002 \) -print
}

fix_clone_modes() { # removes group/other write from the temporary clone (symbolic links never followed)
  [ -n "$(loose "$RK_C" | head -n 1)" ] || return 0
  find "$RK_C" ! -type l \( -perm -020 -o -perm -002 \) -exec chmod go-w {} + 2>/dev/null
  fc_left=$(loose "$RK_C" | head -n 1)
  [ -z "$fc_left" ] || die "cannot remove group/other write permission from $fc_left; nothing installed"
  say "removed group/other write permission from the new clone's files"
}

prepare_custom_only() { # RF-51: ~/.rigorkit holds only custom/; checks and fixes before the move
  for pc_e in "$RK_C"/* "$RK_C"/.[!.]* "$RK_C"/..?*; do
    exists "$pc_e" || continue
    pc_n=${pc_e##*/}
    exists "$T/$pc_n" && die "rigorkit $RK_REF tracks $pc_n, which already exists in $T; nothing was moved (custom/ is left unchanged)"
  done
  if [ -n "$(find "$T" -prune \( -perm -020 -o -perm -002 \) -print)" ]; then
    chmod go-w "$T" || die "cannot remove group/other write permission from $T; nothing installed"
    say "removed group/other write permission from $T"
  fi
  find "$T/custom" ! -type l \( -perm -020 -o -perm -002 \) -print 2>/dev/null > "$RK_TMP/loose.txt"
  while IFS= read -r pc_p; do
    warn "$pc_p is writable by group or others; rigorkit leaves custom/ unchanged; to fix it run: chmod go-w '$pc_p'"
  done < "$RK_TMP/loose.txt"
  find "$T/custom" ! -type l -print 2>"$RK_TMP/find.err" > "$RK_TMP/all.txt"
  while IFS= read -r pc_p; do
    [ -r "$pc_p" ] || warn "cannot read $pc_p; left unchanged"
  done < "$RK_TMP/all.txt"
  while IFS= read -r pc_p; do
    warn "custom/ scan: $pc_p"
  done < "$RK_TMP/find.err"
}

move_clone() { # moves the temporary clone into ~/.rigorkit; a failed RF-51 move is rolled back
  if [ "$RK_STATE" = absent ]; then
    exists "$T" && die "$T appeared during the installation; nothing was moved"
    mv "$RK_C" "$T" || die "cannot move the new clone into $T"
    return
  fi
  for mc_e in "$RK_C"/* "$RK_C"/.[!.]* "$RK_C"/..?*; do
    exists "$mc_e" || continue
    mv "$mc_e" "$T/${mc_e##*/}" && continue
    for mc_b in "$T"/* "$T"/.[!.]* "$T"/..?*; do
      exists "$mc_b" || continue
      [ "$mc_b" = "$T/custom" ] && continue
      mv "$mc_b" "$RK_C/${mc_b##*/}" || err "cannot move $mc_b back"
    done
    die "cannot move the new clone into $T; it holds only its custom/ again"
  done
}

create_custom() { # RF-65: missing custom folders, mode 755 whatever the umask
  for cc_d in custom custom/packs custom/scripts; do
    [ -d "$T/$cc_d" ] && continue
    mkdir -m 755 "$T/$cc_d" 2>/dev/null ||
      { err "cannot create $T/$cc_d; create it with: mkdir -m 755 '$T/$cc_d'"; RK_FAILED=1; }
  done
}

existing_clone() { # RF-2, RF-44, RF-53, RF-58: leaves ~/.rigorkit as it is (no version-control call)
  [ -n "${RIGORKIT_REF+x}" ] && warn "RIGORKIT_REF is ignored for an existing clone ($T)"
  [ -n "${RIGORKIT_REMOTE+x}" ] && warn "RIGORKIT_REMOTE is ignored for an existing clone ($T)"
  [ -f "$T/bin/rigorkit" ] ||
    die "$T has no bin/rigorkit (it predates the rigorkit command); no startup block added"
  write_blocks
  if [ "$RK_WROTE" -eq 0 ] && [ "$RK_FAILED" -eq 0 ]; then
    say "rigorkit is already installed in $T"
  elif [ "$RK_WROTE" -eq 1 ]; then
    say "added the missing startup blocks; open a new shell to use rigorkit"
  fi
}

new_clone() { # RF-1, RF-48, RF-51, RF-53, RF-56, RF-60, RF-63, RF-64, RF-65
  validate_remote
  command -v git >/dev/null 2>&1 || die "git is required: install git and run the installer again"
  resolve_ref
  RK_TMP=$(mktemp -d "$HOME/.rigorkit-install.XXXXXX") || die "cannot create a temporary folder in $HOME"
  RK_C=$RK_TMP/rigorkit
  say "downloading rigorkit $RK_REF from $RK_REMOTE_NAME"
  git -c advice.detachedHead=false clone --quiet --no-hardlinks --branch "$RK_REF" -- "$RK_REMOTE" "$RK_C" ||
    die "cannot download rigorkit $RK_REF from $RK_REMOTE_NAME; nothing installed"
  [ -f "$RK_C/bin/rigorkit" ] ||
    die "rigorkit $RK_REF has no bin/rigorkit, so it cannot be installed this way; nothing installed"
  fix_clone_modes
  [ "$RK_STATE" = custom_only ] && prepare_custom_only
  move_clone
  rm -rf "$RK_TMP"; RK_TMP=''
  create_custom
  write_blocks
  say "rigorkit $RK_REF is installed in $T"
  say "next: open a new shell, then run: rigorkit install --pack core --agent <agent> --global"
  say "agents: claude, codex, cursor, opencode"
}

main() {
  set -u
  GIT_ALLOW_PROTOCOL=https:ssh:file; export GIT_ALLOW_PROTOCOL
  RK_TMP=''; RK_FAILED=0; RK_WROTE=0
  trap cleanup_tmp EXIT
  trap 'exit 130' INT TERM HUP
  [ -n "${HOME:-}" ] || die "HOME is not set"
  T=$HOME/.rigorkit
  RK_DEFAULT=${SHELL:-}; RK_DEFAULT=${RK_DEFAULT##*/}
  classify
  case $RK_STATE in
    other) die "$T exists and is not a rigorkit clone (a git work tree with VERSION and install.sh) nor a folder holding only custom/; nothing changed" ;;
    clone) existing_clone ;;
    *) new_clone ;;
  esac
  shell_notes
  exit "$RK_FAILED"
}

main "$@"
