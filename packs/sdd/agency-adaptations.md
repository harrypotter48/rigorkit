# agency-agents adaptations
Source: [agency-agents at b37b5bb](https://github.com/msitarzewski/agency-agents/tree/b37b5bb33b78f2c1d6567d98e25ca818e3259219), MIT; see [NOTICE](NOTICE.md).

| Source role | rigorkit consumer | Adapted practice |
|---|---|---|
| agents-orchestrator | implement/resume/tasks | Bounded input/output, state, return gate and one correction round |
| engineering-code-reviewer | sdd-reviewer | One specific, prioritized report against agreed behavior |
| testing-evidence-collector | tests/verify/reviewer | Assertions prove behavior; visual captures alone do not prove persistence |
| testing-reality-checker | sdd-approver | Confirm claims against original evidence; no automatic production certification |
| testing-test-results-analyzer | verify/approver | Separate executed failures, missing evidence and accepted risk |

No upstream personas, fabricated memory, required browser commands, default failing grades, quotas, extra features or automatic deployment are imported. Ordinary review starts from supplied references; source playbooks are not loaded into each task. New technical choices still require owner approval and reused decisions report their real repo/vault source. Agents remain tool-neutral and retain existing rigorkit names.
