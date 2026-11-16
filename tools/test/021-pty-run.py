#!/usr/bin/env python3
"""021-terminal-colors: independent real terminal/pipe destinations, test-only.

Usage: python3 021-pty-run.py capture-config.json -- command [args...]
Emits JSON with base64-encoded raw bytes; never runs a shell or touches real HOME.
The caller's environment and command arguments are passed through unchanged.
"""
import base64
import errno
import json
import os
import pty
import re
import select
import signal
import subprocess
import sys
import termios
import time


def encoded(data):
    return base64.b64encode(data).decode('ascii')


def main():
    if len(sys.argv) < 4 or sys.argv[2] != '--':
        raise ValueError('expected config-file -- command [args]')
    with open(sys.argv[1], encoding='utf-8') as source:
        config = json.load(source)
    masters, slaves = {}, []
    streams = {}
    for number, name in enumerate(('stdin', 'stdout', 'stderr')):
        mode = config.get(name, 'tty')
        if mode not in ('tty', 'pipe'):
            raise ValueError('unknown destination mode: ' + mode)
        if mode == 'tty':
            master, slave = pty.openpty()
            attrs = termios.tcgetattr(slave)
            attrs[1] &= ~termios.OPOST  # no LF -> CRLF transport conversion
            attrs[3] &= ~termios.ECHO  # synthetic answers are not command output
            termios.tcsetattr(slave, termios.TCSANOW, attrs)
            masters[name] = master
            slaves.append(slave)
            streams[name] = slave
        else:
            streams[name] = subprocess.PIPE

    process = subprocess.Popen(sys.argv[3:], start_new_session=True, **streams)
    for slave in slaves:
        os.close(slave)
    captures = {'stdout': bytearray(), 'stderr': bytearray()}
    readers = {}
    for name in captures:
        stream = getattr(process, name)
        fd = masters[name] if name in masters else stream.fileno()
        readers[fd] = (name, stream)
    if 'stdin' not in masters:
        process.stdin.write(base64.b64decode(config.get('input', '')))
        process.stdin.close()

    steps = list(config.get('steps', []))
    sent, eof_sent, timed_out = [], False, False
    last_output = time.monotonic()
    deadline = time.monotonic() + config.get('timeout', 45)
    owned_sgr = re.compile(rb'\x1b\[(?:0|31|32|33|36)m')
    matched_until = {'stdout': 0, 'stderr': 0}
    while readers or process.poll() is None:
        if steps:
            step = steps[0]
            name = step.get('channel', 'stderr')
            plain = owned_sgr.sub(b'', bytes(captures[name]))
            needle = step['expect'].encode('utf-8')
            found = plain.find(needle, matched_until[name])
            # Wait for a quiet write boundary so a prompt's immediately following
            # reset is captured even when separate OS writes arrive separately.
            if found >= 0 and time.monotonic() - last_output >= 0.04:
                if 'stdin' not in masters:
                    raise ValueError('interactive step needs terminal stdin')
                # Keep what was visible BEFORE supplying the answer. Assertions
                # can verify reset timing, not just the final transcript state.
                sent.append({name: encoded(value) for name, value in captures.items()})
                os.write(masters['stdin'], step.get('send', '').encode('utf-8') + b'\n')
                matched_until[name] = found + len(needle)
                steps.pop(0)
        elif 'stdin' in masters and not eof_sent:
            os.write(masters['stdin'], b'\x04')
            eof_sent = True

        if time.monotonic() >= deadline:
            timed_out = True
            try:
                os.killpg(process.pid, signal.SIGKILL)
            except ProcessLookupError:
                pass
            break
        ready, _, _ = select.select(list(readers), [], [], 0.02)
        for fd in ready:
            name, stream = readers[fd]
            try:
                chunk = os.read(fd, 65536)
            except OSError as error:
                if error.errno != errno.EIO:
                    raise
                chunk = b''
            if chunk:
                captures[name].extend(chunk)
                last_output = time.monotonic()
            else:
                if stream is None:
                    os.close(fd)
                else:
                    stream.close()
                del readers[fd]

    process.wait()
    for fd, (_, stream) in readers.items():
        if stream is None:
            os.close(fd)
        else:
            stream.close()
    if 'stdin' in masters:
        os.close(masters['stdin'])
    result = {name: encoded(value) for name, value in captures.items()}
    result.update(status=124 if timed_out else process.returncode,
                  timedOut=timed_out, unmatchedSteps=steps, sent=sent)
    print(json.dumps(result))


if __name__ == '__main__':
    main()
