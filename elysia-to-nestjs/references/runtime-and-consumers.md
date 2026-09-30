# Runtime and consumers

Read the sections relevant to the feature. Source dependencies explain the old implementation; choose target dependencies for the new design.

## Runtime, tooling, and persistence

Keep package manager, runtime, module format, and test tooling distinct. Preserve the target setup unless a justified change is needed. Inventory source `Bun.*` APIs, Web Request/Response usage, environment access, and import aliases only where they affect the requested functionality. Reimplement those boundaries for the target instead of importing the Elysia bootstrap.

Check current [NestJS v12 runtime/tooling requirements](https://docs.nestjs.com/migration-guide): application, CLI generation, and test runner requirements can differ. v12 core packages are ESM; compatible CommonJS applications remain possible. Follow the target's chosen module setup and verify emitted imports, decorators, and production startup. Use its test runner and lint tooling rather than an older starter's defaults.

Rework source business logic, database queries, repositories, and transaction strategy as needed. Verify intended state changes, error cases, concurrency, and data relationships rather than SQL text or call order. Existing data encodings, password hashes, or external protocols may constrain a redesign; identify them explicitly. Designing new code does not authorize mutating production data or changing source schemas.

Configure target environment loading, health checks, listener, and resource lifecycle according to its design. Keep source scripts, dependencies, and lockfiles unchanged.

## Adapter and integrations

Choose integrations compatible with the configured target adapter. Express and Fastify have different request/response APIs and plugins; consult current [Nest Fastify guidance](https://docs.nestjs.com/techniques/performance) if applicable.

For features actually present, decide target CORS, cookie/session/JWT behavior, body/file limits, raw-body requirements, and OpenAPI contracts. Original values are useful context, not mandatory settings. Preserve intended security properties and document client-visible changes. Raw-body signatures and third-party protocols may require exact bytes; test those boundaries before claiming correctness.

## Eden and clients

Search source exports and known Project consumers for `@elysia/eden`, `treaty`, `edenFetch`, and Elysia `App` imports. Eden derives client types from the Elysia server shape; a Nest module export does not replace that type source. See [Elysia Eden](https://elysiajs.com/eden/overview).

Define an appropriate target contract source, such as OpenAPI generation or shared schemas. Plan caller updates for changed fields, paths, statuses, errors, encoding, cookies, and auth. Do not retain an Elysia-shaped API solely to keep Eden inference under the default rewrite. Edit client repositories only within the requested scope; otherwise report concrete transition work. Leave source clients intact.

## Other transports

For SSE, WebSockets, or file downloads, choose the target integration and contract deliberately. Identify framing, handshake/auth, disconnect behavior, headers, and client changes. Socket.IO and raw WebSockets use different protocols; switching requires a corresponding client plan. Verify these transports independently from JSON HTTP tests.
