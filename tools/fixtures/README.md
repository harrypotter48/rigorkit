# Fixtures for change 001-english-and-compact

These are synthetic inputs, not the repository's baseline or executable implementation.
Tests copy each fixture into a fresh temporary directory and remove it after the test.

## Measurement

`measurement/baseline.txt` follows the approved version-1 schema. Its values are
deliberately synthetic; `commit: edad002` labels the baseline contract, not proof
that these files were captured from that commit. The real change baseline remains
pending T7.

| Entry | Baseline tokens | Current loaded tokens |
|---|---:|---:|
| sdd-sample | 100 | 70 (60 body + 10 guide) |
| sdd-reader | 100 | 70 |
| architecture-sample | 100 | 70 |
| frontend-sample | 100 | 70 |
| core rules | 400 | 300 |

Each target pack starts at exactly 30% reduction. The long NOTICE is excluded
from loaded content. Descriptions and frontmatter are also excluded from body
measurement. Bodies, guide and rules intentionally have no trailing newline, so
their sizes are exact boundary inputs. They are numeric fixtures, not usable skills.
The escaped description `Read a project''s state.` has 23 decoded characters;
`Review the change.` has 18.

`measurement/baseline-ratchet.txt` is the same baseline with the optional
`targetReductionPercent: 0` field: it exercises the ratchet policy, where every pack
in the baseline must hold that target (0% means no growth) instead of the original
30% policy in three packs. A baseline without the field keeps the original policy.

Tests mutate only temporary copies to exercise one boundary at a time. Report
assertions use readable file/pack rows and values without fixing spacing or columns.

## Scenario checker

Each subdirectory in `scenarios/` is a separate change, with its own `spec.md` and
test-search directory. `tests/coverage.test.txt` contains source-search input for
the existing checker; it is not an executable test or evidence of actual assertions.
The marker filenames use `.test.txt`, which the checker's test-file pattern accepts.
When a `tests` directory is passed directly as the search root, its files are matched
by filename: the directory-name heuristic applies only to nested directories.

- `fixture-english` and `fixture-spanish` differ in their section heading.
- `fixture-no-heading` lacks either recognized heading.
- `fixture-manual` requires no automated test for its manual row.
- `fixture-missing-test` keeps another change's scenario ID and this change's
  longer scenario ID in separate source files. Neither file satisfies both the
  change ID and the exact scenario ID required by the checker. Keeping them in
  one file would incorrectly make this negative fixture covered by design.

The executable tests and their assertions live in `tools/test/`. The integration
test of the actual change passes only that directory to the checker, keeping
synthetic coverage markers out of the change's coverage search.
