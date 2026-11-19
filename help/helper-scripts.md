# Helper scripts

## Find code references

```sh
rigorkit script code-context find createOrder src
```

Uses ripgrep to find literal whole-word matches. Output is one `path:line[,line...]` row per matching file. Omit the path to search the current directory. Exit status 1 means no matches, and 2 means invalid usage or a search error.

## Show change status

```sh
rigorkit script spec-status .
```

Prints each change ID, state and completed/total tasks. A completed two-file story is validated when its spec contains the exact `Artifacts: spec+tasks` line and its tasks contain `Validation: done`. Existing `validation.md` files still count for completed changes.
