#!/usr/bin/env python3
# 010-update test helper: run a command in a pseudo-terminal (stdin, stdout and stderr are the terminal).
# Usage: pty-run.py [--timeout S] [--expect TEXT --send LINE]... [--eof] -- cmd [args]
# Each --expect waits until TEXT appears in the output after the previous match, then types LINE + newline.
# --eof sends end of input (Ctrl-D) after the last answer. Prints everything the command wrote; exits with its status
# (124 on timeout). Only for tests: never used by rigorkit itself.
import os, pty, select, sys, time

def main(argv):
    timeout, steps, eof = 20.0, [], False
    i = 0
    while i < len(argv) and argv[i] != '--':
        a = argv[i]
        if a == '--timeout': timeout = float(argv[i + 1]); i += 2
        elif a == '--expect': steps.append([argv[i + 1], None]); i += 2
        elif a == '--send': steps[-1][1] = argv[i + 1]; i += 2
        elif a == '--eof': eof = True; i += 1
        else: sys.stderr.write('pty-run: unknown option %s\n' % a); return 2
    cmd = argv[i + 1:]
    if not cmd: sys.stderr.write('pty-run: missing command\n'); return 2
    pid, fd = pty.fork()
    if pid == 0:
        os.execvp(cmd[0], cmd)
    out, seen, deadline, sent_eof = b'', 0, time.time() + timeout, False
    while True:
        if steps and steps[0][0].encode() in out[seen:]:
            seen = out.index(steps[0][0].encode(), seen) + len(steps[0][0])
            os.write(fd, (steps.pop(0)[1] or '').encode() + b'\n')
        elif not steps and eof and not sent_eof:
            os.write(fd, b'\x04'); sent_eof = True
        left = deadline - time.time()
        if left <= 0:
            os.kill(pid, 9); os.waitpid(pid, 0)
            sys.stdout.write(out.replace(b'^D\x08\x08', b'').decode('utf-8', 'replace')); return 124
        r, _, _ = select.select([fd], [], [], min(left, 0.2))
        if r:
            try: chunk = os.read(fd, 4096)
            except OSError: chunk = b''
            if not chunk: break
            out += chunk
    _, status = os.waitpid(pid, 0)
    out = out.replace(b'^D\x08\x08', b'')   # the terminal's echo of the end-of-input we typed
    sys.stdout.write(out.decode('utf-8', 'replace'))
    return os.waitstatus_to_exitcode(status) if hasattr(os, 'waitstatus_to_exitcode') else (status >> 8)

if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
