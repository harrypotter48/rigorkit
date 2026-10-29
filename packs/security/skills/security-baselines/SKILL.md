---
name: security-baselines
description: 'Reference for application security: threat modeling, trust boundaries, input, authorization, crypto, secrets and dependencies with verifiable requirements. Use for "threat model" or "requisitos de seguridad" when planning or reviewing.'
---
# security-baselines — Application security
**Type: reference.** No stage/stop of its own; caller skill or user controls approval.

## Project first
Constitution/AGENTS.md and the project's own security decisions win: existing threat models, permission model, data classification, secret locations and dependency policy. Reuse them; never restate or replace them, and never introduce an obligation the project has not accepted. Credential values never appear here: name where a secret lives, never its value.

## Threat model
Keep it short and verifiable.
1. Assets and data classification: what matters and how sensitive it is.
2. Trust boundaries: where untrusted input becomes trusted (public edge, service edge, queue, file, webhook, admin surface).
3. Flows: entry point, validation, processing, storage, output, and every producer and consumer of the data.
4. Abuse cases per boundary: who would try what, and what stops them today.
5. Requirements: each threat becomes one testable requirement, owned by a scenario or a check.

## Secure defaults by area
- Authentication: server-side verification, short-lived credentials with rotation, secure cookie or token storage, rate limits on credential endpoints, step-up where the project requires it.
- Authorization: deny by default, check at every boundary including server-side, resource ownership and tenant scope on each request, no client-side-only decision.
- Input: validate and allowlist at the boundary, size and shape limits, canonical parsing before comparison, no string-built queries or commands.
- Output and storage: context-correct encoding, no sensitive data in errors, logs, analytics or URLs.
- Cryptography: maintained libraries only, no homemade primitives, random nonces, key separation, and the key location stated without its value.
- Secrets: outside code, configuration and artifacts; rotation defined; absent from logs and error reports.
- Files and uploads: type, size and path control, isolated storage, no execution from user paths.
- Outbound calls: timeouts, allowlisted destinations where the project requires it, verified signatures and replay protection for webhooks.
- Dependencies: locked versions, known advisories checked, minimal dependency count, no unmaintained packages.

## Requirements and verification
Write each requirement as one verifiable statement with an owner check: a scenario, a test, a configuration assertion or a manual step. "Use encryption" is not a requirement; "the stored session token is encrypted with a key held outside the database, and the storage path is verified by an integration check" is.

## Severity guidance
Exploitable now, with a path from an untrusted input to the harm, is a blocker. A missing defense in depth without a path is a hardening item. Severity follows the project's scale and the affected data, not a generic score.

## Boundary
This reference produces requirements and checks. `security-reviewer` reports findings on a design or a diff; the project's scanners and pipelines stay the source of tool findings.
