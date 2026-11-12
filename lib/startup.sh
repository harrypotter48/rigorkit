# rigorkit startup hook (010 RF-1–RF-4), sourced by the startup block in zsh and bash.
# Starts lib/notice.sh as a child process, only at an interactive start that runs no command string
# and has terminal input and output (SR-4), so editors' `zsh -i -c` probes see nothing. Sets nothing here.
case $- in
  *i*)
    if [ -z "${ZSH_EXECUTION_STRING-}" ] && [ -z "${BASH_EXECUTION_STRING-}" ] && [ -t 0 ] && [ -t 1 ] && [ -r "$HOME/.rigorkit/lib/notice.sh" ]; then
      sh "$HOME/.rigorkit/lib/notice.sh" --shell
    fi ;;
esac
