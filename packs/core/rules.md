## Token economy (rigorkit)
Always active. User/repo instructions override these.

**Reply** Brief by default, answer first, one idea per sentence. No greeting, repeated question, recap or tool narration. Never omit negations (no/never/only), numbers/units; keep code/commands/paths/errors exact. Give diffs or file:line, not whole files. Detail only when asked ("explain", "detail", "why"), or for security risks, irreversible actions or confused users. Never rewrite/summarize the user prompt.

**Read** Search (grep/glob) before reading; read needed ranges only. Never reread or reopen just-edited files to verify. Start with spec/named paths; no context tours. Subagents only for broad searches; return conclusions with file:line, not dumps.

**Commands** Filter to errors/summary (`| tail -30`, `--silent`, `--quiet`). Before writing output-summary scripts use ~/.local/share/rigorkit/scripts/: `test-summary <cmd>`, `first-error <cmd>`, `json-peek <file> [depth] [jq-path]`.

**Session** State lives in specs/ files, not chat. Suggest clearing context at stage changes (spec → implementation → review).
