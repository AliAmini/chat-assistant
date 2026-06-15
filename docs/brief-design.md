# AiChat — Brief Design Document

## Architecture

Three services communicating over HTTP REST, backed by a single PostgreSQL database.

```
Browser → Next.js Frontend (3000)
              ↓ REST
         NestJS Backend (4000)
           ↓         ↓
        Postgres    NestJS AI Service (4001)
```

All services are stateless and containerized via Docker.

---

## Services

| Service    | Tech                   | Port | Responsibility                   |
| ---------- | ---------------------- | ---- | -------------------------------- |
| Frontend   | Next.js 14, App Router | 3000 | UI, conversation list, chat view |
| Backend    | NestJS, Prisma         | 4000 | Business logic, persistence      |
| AI Service | NestJS                 | 4001 | Response generation              |
| Database   | PostgreSQL 17          | 5432 | Conversations + messages         |

---

## Main Data Flow

**Create conversation**

1. Frontend `POST /api/conversations` → Backend creates a DB record → returns `{ id, title }`
2. Frontend navigates to `/chat/{id}`

**Send message**

1. Frontend `POST /api/conversations/{id}/messages` with `{ content }`
2. Backend saves the user message
3. Backend fetches the last 20 messages as context
4. Backend calls `POST /generate` on the AI service
5. Backend saves the assistant reply
6. Both messages returned to frontend in one response
7. Frontend appends them to the chat view

**Data model (simplified)**

```
Conversation { id, title, createdAt, updatedAt }
Message      { id, conversationId, role (USER|ASSISTANT), content, createdAt }
```

---

## Key Technical Decisions

- **Separate AI service** — isolates the LLM/generation logic so it can be swapped, scaled, or rate-limited independently without touching business logic.
- **Backend as orchestrator** — the frontend never talks to the AI service directly; all persistence and sequencing is owned by the backend.
- **Prisma ORM** — type-safe DB access with schema-as-code; migrations are version-controlled.
- **Context window of 20 messages** — caps the payload sent to the AI service to keep latency predictable and avoid unbounded growth.
- **Polling over WebSockets** — the frontend re-fetches state after each send rather than maintaining a persistent connection, keeping the architecture simple.
- **Shared `@aichat/types` package** — `GenerateRequest` / `GenerateResponse` types are shared between backend and AI service, preventing contract drift.

---

## Tradeoffs

| Decision                               | Benefit                               | Cost                                                                  |
| -------------------------------------- | ------------------------------------- | --------------------------------------------------------------------- |
| Synchronous message flow               | Simple, easy to reason about          | User waits for the full AI response before the UI updates             |
| Hard-coded 20-message context          | Predictable latency and token cost    | Older context is silently dropped; no summarisation                   |
| Deterministic mock AI                  | No API key or cost during development | Not useful for real conversations; must be replaced before production |
| Hardcoded `localhost` URLs in frontend | Zero config for local dev             | Won't work in staging/production without env-var support              |
| No auth layer                          | Fast to build                         | Any user can read or write any conversation                           |

---

## Known Limitations

- **No real LLM** — the AI service returns template strings based on message length. It is a placeholder only.
- **No authentication or authorisation** — conversations are publicly accessible by ID.
- **No streaming** — responses are returned in full after the AI call completes; there is no token-by-token streaming.
- **Frontend uses hardcoded `http://localhost:4000`** — breaks in any non-local environment.
- **No error recovery UI** — failed sends silently restore the input; there is no user-facing error state.
- **Context truncation without summary** — dropping messages beyond the 20-message window can cause the AI to lose important earlier context.
- **No conversation deletion** — the UI and API have no delete endpoint.

---

## Production Improvements

- **Plug in a real LLM** — replace `GenerateService` with an OpenAI / Anthropic / Bedrock client; keep the same HTTP contract so the backend is unaffected.
- **Add streaming** — switch the AI service to SSE or WebSocket streaming and update the frontend to render tokens as they arrive.
- **Authentication** — add JWT-based auth (e.g., NextAuth on the frontend, a `@UseGuards` NestJS guard on the backend) and scope conversations to users.
- **Environment-aware config** — move all base URLs to environment variables; use Next.js `NEXT_PUBLIC_` vars for the frontend.
- **Conversation summarisation** — when history exceeds the context window, summarise older messages instead of dropping them.
- **Rate limiting & circuit breaking** — add a rate limiter on the backend's AI-service calls and a circuit breaker to handle AI service outages gracefully.
- **Observability** — structured logging (e.g., Pino), distributed tracing (OpenTelemetry), and health-check endpoints for each service.
- **Database connection pooling** — use PgBouncer or Prisma Accelerate in front of Postgres under load.
- **Delete & rename conversations** — expose PATCH/DELETE endpoints and wire them to the UI.
- **Message queue with RabbitMQ** — introduce RabbitMQ between the backend and the AI service so that message generation requests are decoupled from the HTTP request lifecycle. The backend publishes a `generate.requested` event to a queue after saving the user message, and the AI service consumes it asynchronously. This enables back-pressure handling, retry logic with dead-letter queues, and horizontal scaling of the AI service workers without changing the backend's public API. NestJS supports this pattern natively via `@nestjs/microservices` with the `RabbitMQ` transport.
