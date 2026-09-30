# Versions and PostgreSQL drivers

## Verified baseline

Official registry values checked **2026-10-01**:

| Package | `rc` | `rc5` |
| --- | --- | --- |
| `drizzle-orm` | `1.0.0-rc.4` | `1.0.0-rc.5-5935859` |
| `drizzle-kit` | `1.0.0-rc.4` | `1.0.0-rc.5-5935859` |
| `drizzle-seed` | `1.0.0-rc.4` | `1.0.0-rc.5-5935859` |

This is a dated baseline, not a claim about future moving tags. Inspect resolved lockfile versions. Pin ORM and Kit to a verified compatible v1 release; the examples use matching exact RCs. Resolve tags before installation because the default channel may select a different major. An RC5 snapshot is distinct from a published unsuffixed RC5 release.

```sh
npm view drizzle-orm dist-tags --json
npm view drizzle-kit dist-tags --json
npm install --save-exact drizzle-orm@1.0.0-rc.4 pg
npm install --save-dev --save-exact drizzle-kit@1.0.0-rc.4 @types/pg
```

Use the repository's package-manager equivalents. Seed and validators are optional. v1 validator integrations use `drizzle-orm/zod`, `/valibot`, `/typebox`, or `/arktype`; verify their peer requirements separately. Effect has its own runtime/version requirements.

Evidence: npm metadata for [ORM](https://registry.npmjs.org/-/package/drizzle-orm/dist-tags), [Kit](https://registry.npmjs.org/-/package/drizzle-kit/dist-tags), [Seed](https://registry.npmjs.org/-/package/drizzle-seed/dist-tags), and [RC4 source](https://github.com/drizzle-team/drizzle-orm/tree/v1.0.0-rc.4).

## Driver selection

All entries target PostgreSQL. Choose by runtime and required session semantics; preserve an existing compatible driver.

| Capability | Drizzle entrypoint | Decision |
| --- | --- | --- |
| Node TCP and interactive transactions | `drizzle-orm/node-postgres` + `pg` | Reuse an application pool. |
| Existing Postgres.js application | `drizzle-orm/postgres-js` + `postgres` | Check automatic prepare behavior against the pooler. |
| Neon HTTP | `drizzle-orm/neon-http` | Independent queries and supported batch transactions; no interactive callback. |
| Neon WebSockets | `drizzle-orm/neon-serverless` | Sessions and interactive transactions; configure WebSocket support for the runtime. |
| Aurora Data API | `drizzle-orm/aws-data-api/pg` | Resource/secret/database configuration; verify transaction capabilities. |
| Bun SQL PostgreSQL | `drizzle-orm/bun-sql` | Inspect RC constructor types for the runtime-specific client. |
| Embedded PostgreSQL testing | `drizzle-orm/pglite` | PostgreSQL semantics; use a server for pool, networking, extension, and concurrency fidelity. |
| Existing Effect application | `drizzle-orm/effect-postgres` | RC4 needs compatible Effect v4 packages and scoped layer ownership. |
| Netlify-managed PostgreSQL | `drizzle-orm/netlify-db` + `@netlify/database` | Underlying transport depends on runtime; verify selected-client capabilities. |
| Custom PostgreSQL SQL transport | `drizzle-orm/pg-proxy` | Exact RC callback row shape, error propagation, authorization and transaction protocol must be implemented. |

Provider URLs can also use TCP drivers. Check application vs migration connection URLs, TLS, and pooler prepared-statement support. For Postgres.js select `prepare: false` when required by the actual pooler. Fix TLS configuration without disabling certificate verification to hide errors.

Sources: [PostgreSQL connection](https://orm.drizzle.team/docs/get-started-postgresql), [Neon](https://orm.drizzle.team/docs/connect-neon), [Supabase](https://orm.drizzle.team/docs/connect-supabase), [AWS PostgreSQL Data API](https://orm.drizzle.team/docs/connect-aws-data-api-pg), and [RC4 driver](https://github.com/drizzle-team/drizzle-orm/blob/v1.0.0-rc.4/drizzle-orm/src/node-postgres/driver.ts).

For provider-specific endpoints and authentication, consult the relevant PostgreSQL guide: [Appwrite](https://orm.drizzle.team/docs/connect-appwrite-postgres), [Netlify](https://orm.drizzle.team/docs/connect-netlify-db), [Nile](https://orm.drizzle.team/docs/connect-nile), [PlanetScale Postgres](https://orm.drizzle.team/docs/connect-planetscale-postgres), [Prisma Postgres](https://orm.drizzle.team/docs/connect-prisma-postgres), [Vercel Postgres](https://orm.drizzle.team/docs/connect-vercel-postgres), or [Xata](https://orm.drizzle.team/docs/connect-xata). Preserve provider-required tenancy/authentication settings on the actual connection. Verify its current adapter and exact RC types rather than copying an unversioned constructor blindly. Bun, PGlite and Effect have their own [Bun](https://orm.drizzle.team/docs/connect-bun-sql), [PGlite](https://orm.drizzle.team/docs/connect-pglite), and [Effect](https://orm.drizzle.team/docs/connect-effect-postgres) setup guides.

The [proxy guide](https://orm.drizzle.team/docs/connect-drizzle-proxy) explains the callback transport, but its snippets are not a production boundary. Preserve query errors rather than returning empty rows, verify row/codec representation, and authenticate/authorize the server operation. Do not expose unrestricted SQL execution to untrusted callers. RC4's basic PostgreSQL proxy session rejects interactive transactions; use a driver with the required transaction support for atomic services. Semicolon stripping does not establish a SQL permission boundary. Evidence: [RC4 proxy session](https://github.com/drizzle-team/drizzle-orm/blob/v1.0.0-rc.4/drizzle-orm/src/pg-proxy/session.ts).

## Runtime wiring

See [example/db.ts](example/db.ts). Fail early for missing config, initialize once per application lifecycle, register a pool error handler, and close the owned pool on shutdown. Size pools across process/worker/replica count, not just one instance. Choose bounded acquisition and statement timeouts from the service latency budget. Keep framework dependency injection where it already exists.

RC4 PostgreSQL configuration takes `relations`; core builders accept imported tables directly. `db.query` needs the complete relation graph. Use the explicit `{ client: pool, relations }` overload when owning pool lifecycle.

For explicit SQL names use `pgTable`; for automatic names use `snakeCase.table` or `camelCase.table`. Casing is a schema concern. A TypeScript key rename may change SQL names under automatic casing, so review migrations. The [RC1 change record](https://github.com/drizzle-team/drizzle-orm/blob/v1.0.0-rc.4/changelogs/drizzle-orm/1.0.0-rc.1.md) establishes the v1 RC naming and mapper APIs.
