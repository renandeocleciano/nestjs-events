## Financial Events API

NestJS + Fastify service implementing CQRS with an Event Store. The write model persists to Postgres, emits domain events to MongoDB, and publishes them to Redis Pub/Sub. The read model is served via REST controllers.

### Why this exists
- Demonstrate a clean, modular NestJS architecture
- Exercise CQRS + event-sourcing (append-only store)
- Provide a ready-to-run stack with Docker

---

## Architecture

- Framework: NestJS (App Router) + Fastify 5
- Transport: HTTP (REST) and Redis microservice
- Patterns: CQRS (commands + queries), Event Sourcing (append domain events)
- Datastores:
  - Postgres: primary persistence for CardEntity and HolderEntity via TypeORM
  - MongoDB: stored_events append-only event store
  - Redis: internal Pub/Sub bus and Nest microservice transport
- Validation: class-validator + class-transformer
- Config: @nestjs/config with ENV variables
- Logging: Pino (pretty in dev) with correlation ID

### Modules overview
- src/modules/cards: entities, DTOs, commands/queries, handlers, controller
- src/modules/holders: mirrors cards
- src/events: TypeORM Mongo entity and repository/service for event store
- src/messaging: Redis event bus (ioredis) and sample microservice handler
- src/database: multi-datasource registration (Postgres + Mongo) and migrations
- src/common: response envelope interceptor, correlation ID middleware, exception filter

### Request lifecycle
1) Controller receives request → validated DTO
2) CommandBus executes a command handler
3) Handler enforces invariants, persists to Postgres
4) Event appended to Mongo (stored_events)
5) Event published to Redis channel financial.domain.events
6) Response wrapped in a standard JSON envelope

---

## Data model

### Postgres entities
- CardEntity: { id (uuid), document (unique), createdAt, updatedAt }
- HolderEntity: { id (uuid), document (unique), cardId (uuid FK), createdAt, updatedAt }

### Mongo event store (stored_events)
```
{
  _id: ObjectId,
  aggregateId: "uuid",
  aggregateType: "Card" | "Holder",
  type: "CardCreated" | "HolderUpdated" | ...,
  payload: { /* event data */ },
  metadata: { /* correlation/user/etc */ },
  occurredAt: "ISO timestamp"
}
```

---

## API

- Base prefix: /api
- Health: /health (not prefixed for convenience)

### Cards
- POST /api/cards body { document: string }
- PATCH /api/cards/:id body { document?: string }
- GET /api/cards/:id
- GET /api/cards?{page,pageSize}

### Holders
- POST /api/holders body { document: string, cardId: string }
- PATCH /api/holders/:id body { document?: string, cardId?: string }
- GET /api/holders/:id
- GET /api/holders?{page,pageSize}

Responses envelope:
```
{ success: true, data, requestId, timestamp }
```

Errors envelope:
```
{ success: false, error: { message, code }, requestId, timestamp }
```

Common error codes:
- UniqueViolation (Postgres 23505)
- SchemaNotInitialized (Postgres 42P01 → run migrations)
- DatabaseUnavailable (08001)
- MongoUnavailable (network/connection issues)

---

## Messaging

- Internal Redis Pub/Sub channel: financial.domain.events
- Microservice pattern example: financial.notifications.ping

---

## Getting started

### Prerequisites
- Node 20+
- pnpm or npm
- Docker (Compose) for infra

### Environment
```
cp env.example .env
```

### Start infrastructure
```
docker compose up -d postgres mongo redis
```

### Install dependencies
```
pnpm install
```

### Run database migrations
```
pnpm run migration:run
```

### Start the API (dev)
```
pnpm run dev
```

### Smoke tests
```
# Health (no prefix)
curl -s http://localhost:3000/health

# Create card
curl -s -X POST http://localhost:3000/api/cards \
  -H 'content-type: application/json' \
  -d '{"document":"12345"}'

# List cards
curl -s http://localhost:3000/api/cards
```

### Tests
```
pnpm test
```

---

## Development notes

- The server prints the route table in development.
- x-correlation-id is respected or generated for each request and returned in the response header.
- Helmet is currently commented in src/main.ts for Fastify 5 migration; uncomment if desired.
- Global prefix is /api, but /health is excluded.

---

## Project layout (high level)

- src/main.ts: bootstrap (Fastify, pipes, filters, interceptors, microservice)
- src/app.module.ts: root module
- src/common/: middlewares, interceptors, filters
- src/database/: datasource registration + migrations
- src/events/: event store entity/repository/service
- src/messaging/: Redis event bus + microservice handler
- src/modules/cards and src/modules/holders: domain modules

---

## Troubleshooting

- 500 with SchemaNotInitialized: run pnpm run migration:run
- 503/DatabaseUnavailable: verify Postgres connection in .env and docker compose ps
- MongoUnavailable: verify MONGO_URI and that Mongo container is running
- Route not found: remember /api prefix (except /health)

---

## License

MIT

