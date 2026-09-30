# Data integration and performance

Read this for database wiring, caching, or an observed performance problem. Keep the project's driver/ORM and check its own APIs/peers; Nest is database-agnostic. [Database overview](https://docs.nestjs.com/techniques/database).

## Persistence boundaries

Expose clients, repositories, and models through Nest providers with the correct connection token. Configure shared connections centrally; import/export their owning modules instead of constructing a pool in each feature. Named connections must match their injection tokens and test overrides. Keep HTTP request/response handling in controllers and data operations in injectable application providers. A separate repository is useful when it provides a meaningful data-access boundary; it is a skill design choice, not a requirement for every service.

Use the integration chapter for the chosen stack: [TypeORM](https://docs.nestjs.com/data/typeorm), [Drizzle](https://docs.nestjs.com/data/drizzle), [Mongoose](https://docs.nestjs.com/data/mongodb), or [Prisma](https://docs.nestjs.com/data/prisma). Current Nest docs include `@nestjs/drizzle`, `DrizzleModule`, `@InjectDrizzle()`, and `getDrizzleToken()`; verify their compatibility before adopting them. Existing custom database providers can stay. Use the selected ORM's actual database types and transaction API rather than mixing examples from different ORMs.

## Transactions and migrations

When writes must succeed/fail together, use the database's transaction API and its transaction-scoped manager/client for all participating operations. For TypeORM `QueryRunner`, release it in `finally` after commit/rollback. Test a failure midway through the operation and verify rollback. [TypeORM transactions](https://docs.nestjs.com/data/typeorm).

Treat schema changes as reviewed migrations. TypeORM's `synchronize: true` is unsuitable for production. Drizzle Kit runs independently of Nest DI; check its environment and working directory separately from app configuration. With multiple app replicas, run migrations as a coordinated release step rather than letting each startup apply them concurrently. Validate the migration against representative data and confirm that the application can start with the resulting schema. [TypeORM](https://docs.nestjs.com/data/typeorm), [Drizzle migrations](https://docs.nestjs.com/data/drizzle).

## Caching

Current `@nestjs/cache-manager` uses Keyv-backed stores. Configure TTL explicitly in milliseconds; an omitted/zero TTL does not expire entries. A miss is currently `undefined` (older `cache-manager` v6 used `null`); handle the installed version. Stored values need to survive the store's serialization. [Caching](https://docs.nestjs.com/techniques/caching).

`CacheInterceptor` targets GET routes by default; explicit `@CacheKey()` changes that eligibility, so apply it only to read operations without business side effects. Native-response routes and GraphQL field resolvers need special care. When caching user/tenant-specific results, include the relevant identity/authorization dimensions in keys or use explicit service caching. Choose invalidation after writes and a shared store when replicas must see the same entries. These key/invalidation decisions are skill implementation choices. Check misses, hits, invalidation, and isolation; a URL-only key must not expose another user's data. [Caching options and tracking](https://docs.nestjs.com/techniques/caching).

## Diagnose before optimizing

Skill implementation choice: reproduce a slow workload and identify whether time/allocation comes from startup, request processing, queries, or external calls. For persistence-heavy routes, inspect query count (including repeated relation loads), result size, and pagination before changing framework structure. Evaluate indexes/batching/projections through the selected database's tooling and verify correctness as well as latency.

Fastify is an optional adapter choice; verify middleware/plugins, response handling, and actual workload results when changing adapters. Lazy loading can reduce startup work for optional providers, but lazy-loaded modules/services do not receive lifecycle hooks, and routing components have documented limitations. Use it only when measured startup cost justifies those constraints. [Fastify](https://docs.nestjs.com/techniques/performance), [Lazy loading](https://docs.nestjs.com/fundamentals/lazy-loading-modules).
