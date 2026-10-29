# NOTICE

Parts of this pack derive from **hello-sdd** by Brais Moure (MoureDev),
https://github.com/mouredev/hello-sdd, licensed under Apache License 2.0
(https://www.apache.org/licenses/LICENSE-2.0).

Derived and modified material:
- skills/sdd-init/templates/spec.md, ears.md, plan.md, tasks.md, validation.md, clarification.md and AGENTS.md: spec structure, EARS, plan/task/validation formats.
- Prompts for sdd-spec, sdd-clarify, sdd-plan, sdd-tasks, sdd-implement, sdd-verify and sdd-change.

Adapted into a staged process with approval gates, two-level Definition of Done,
multi-repo support, baselines and roles; agents run only scoped unit/integration tests unless the owner requests other execution. The adapted
material is now in English, compacted while retaining its procedural invariants,
and supports project-language prose and legacy Spanish artifact structures.


## agency-agents adaptation

Selected handoff, review and evidence practices adapted from agency-agents,
https://github.com/msitarzewski/agency-agents at b37b5bb33b78f2c1d6567d98e25ca818e3259219:
- specialized/agents-orchestrator.md: bounded handoffs, state and escalation.
- engineering/engineering-code-reviewer.md: specific, prioritized consolidated feedback.
- testing/testing-evidence-collector.md: observable evidence and honest untested scope.
- testing/testing-reality-checker.md: verify claims against implementation.
- testing/testing-test-results-analyzer.md: results and gaps inform the delivery decision.

These are compact role adaptations, not installed upstream agents or assumed persistent memory. Mandatory screenshots, autonomous tool execution, ratings, issue quotas, premium features and unbounded iteration are not adopted. User/repository permissions and approval gates govern.

MIT License

Copyright (c) 2025 AgentLand Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
