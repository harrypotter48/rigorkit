# security — Application security
Reference for threat modeling and secure defaults, plus a readonly security reviewer.

| Item | Purpose |
|---|---|
| security-baselines | Threat modeling, trust boundaries, secure defaults and verifiable security requirements |
| security-reviewer | Design and diff review: exploitable issues, authorization, input, crypto, secrets and dependencies |

References follow their caller's stage/stop. Project constitution/AGENTS.md and its existing security policies win; this pack never imposes a policy the project does not have, and it never stores credential values.

With sdd installed, a change that touches authentication, authorization, tenancy, permissions, input parsing, cryptography, secrets, uploads, webhooks, third-party integrations or dependencies gets the security reviewer in its review profile, and a change that introduces a trust boundary or a new data flow gets a threat model before the plan. The reviewer runs together with the other enabled reviewers after the builder. Without this pack, SDD reports the missing reviewer and performs its own checks.

Ask for "revisión de seguridad del diff" or "threat model del nuevo endpoint".
```bash
./install.sh --pack security,sdd --agent claude --project ~/code/my-repo
```
