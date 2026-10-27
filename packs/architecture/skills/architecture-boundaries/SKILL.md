---
name: architecture-boundaries
description: 'Reference for layered/hexagonal architecture: dependencies, ports/adapters and feature order. Use for "dónde va esto" or "arquitectura hexagonal" when planning or implementing.'
---
# architecture-boundaries — Layers and boundaries
**Type: reference.** No stage/stop of its own; caller skill or user controls approval.

## Project first
Constitution/AGENTS.md/repo architecture conventions win. Otherwise infer folders, import aliases and an end-to-end feature. Without layers, report it and follow existing structure; never impose layers incidentally.

## The 4 layers
| Layer | Contents | Imports |
|---|---|---|
| domain | Pure models/types, input/output DTOs, repository interfaces (ports) | No other layers or frameworks |
| application | Read queries/ and write mutations/ use cases | domain only |
| infrastructure | Port adapters (*-repository-impl), HTTP/DB/storage clients, controller/facade wiring use cases to implementations | domain, application |
| presentation | UI pages/components/hooks/stores | Infrastructure controllers for operations; domain types for props/state |
Dependencies point toward domain, never reverse; domain knows no other layer, application no implementations.

Hexagonal: outbound port = domain repository interface; outbound adapter = infrastructure implementation; inbound adapter = UI or backend framework HTTP controller, calling use cases, never repositories. Composition root = infrastructure controller/facade, injecting repository into use case and delegating; no business logic.

One use case per file, a function receiving its repository (`application/queries/order/getOrderById.ts`), testable with a fake. Existing entity classes (OrderQueries/OrderMutations with constructor injection) are valid; new code follows project conventions, never migrate existing code incidentally.
```
presentation → controller (infrastructure) → use case (application) → port (domain) ← repository impl (infrastructure) → network/DB
```

## New Order operation
1. Request/Response types and model in domain/entities/order/.
2. Repository interface method in domain.
3. Implementation in infrastructure/repositories/.
4. Use case in application/{queries|mutations}/order/.
5. Controller method in infrastructure/controllers/.
6. Presentation calls controller.

## Reject
Direct fetch/axios/data clients in pages/components/hooks (no small-screen exception); UI bypassing controllers for repositories/use cases; domain imports of frameworks/ORM/HTTP/env; use case instantiating an implementation instead of receiving its port; business rules/calculations/decisions in controller, repository implementation or component.

## Tests and checklist
Domain: pure unit; application: fake-repository unit; infrastructure: HTTP/DB integration; presentation: component/E2E.
- [ ] Domain imports no framework/other layer.
- [ ] Each use case imports domain only and receives port.
- [ ] Implementations satisfy port interfaces.
- [ ] UI calls controllers and uses domain types; no direct network.
- [ ] Entity naming consistent across layers with project conventions.
