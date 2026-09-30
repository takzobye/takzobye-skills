# Testing, performance, and operations

## Test observable PostgreSQL behavior

Use a disposable PostgreSQL database with the actual migrations. PGlite can cover local PostgreSQL semantics; use a server and the production driver for network/pool behavior, concurrent sessions, RLS roles, provider-specific extensions, and SQL-version differences. Mocks verify application decisions, not constraints or generated SQL execution.

Select cases from the change:

| Changed behavior | Meaningful verification |
| --- | --- |
| Schema / migration | Fresh install, upgrade from prior data, constraints/defaults, rerun behavior. |
| Relations | Both directions, optional/empty targets, role alias correctness, junction uniqueness. |
| Query | Filters, nulls, fan-out, aggregate decoding, projection, ordering/cursor ties. |
| Mutation | Returning/defaults, omitted/null patches, scoped WHERE, upsert conflict/no-return. |
| Atomic workflow | Failure in a later step rolls back earlier writes; competing connections preserve invariants. |
| Serialization | Big integers, numeric precision, timestamp timezone/precision, JSON/arrays/custom codecs. |
| Authorization | Denied and cross-tenant paths across reads and writes, using the actual application role. |

Keep schema/relations shared with runtime. Clean fixtures between tests and close pools even on failure. Run selected-RC TypeScript compilation and the repository's applicable tests. Avoid helper mocks that simply restate builder chains.

## Fixtures and seeding

Use small deterministic fixtures for behavior tests, with explicit identities when ordering matters. `drizzle-seed` is optional for realistic volume/generator-based fixtures; pin a compatible v1 release. Inspect its relation/FK handling: ORM graph declarations and seed dependency inference are different concerns. Seed reproducibility requires fixed seed, version, and generator config.

Use [example/seed.ts](example/seed.ts) for RC4/5 `seed(..., { count, seed, version: '4' }).refine(...)`. The generator `version` is independent of the ORM/package major: `'4'` selects generator behavior, while the package remains v1. Pin the package, generator version, seed, table set and refinements together. The fixture assigns explicit nulls to the nullable self-reference and generates unique emails; it expects fresh disposable fixture state.

RC4's types allow `false` to skip a column, but this nullable self-FK fixture failed at runtime with an undefined generator when using it. Use `f.default({ defaultValue: null })` for this fixture instead. Type acceptance alone does not establish seed runtime support; reproduce skip/default behavior on the selected RC.

Refinements can set table counts, individual column generators and dependent-table multiplicities (`with`). Include required FK targets in the seed schema. With cyclic or composite keys, identity columns, domain CHECKs and partially existing data, verify generated values and dependency order rather than assuming all invariants are inferred. Use `valuesFromArray` for controlled enum/domain values, explicit uniqueness where needed, and bounded numeric/date ranges; large array cardinality or requested uniqueness can exhaust the value space. Array generator uniqueness applies to elements rather than necessarily to complete arrays. Keep large-volume generators out of ordinary unit tests.

Reset/truncate targets only in a verified disposable database; resets can cascade beyond the selected tables. Repeated seed insertion is not an idempotent production backfill. Production reference-data insertion should have a reviewed/idempotent migration or deployment workflow, not a test reset.

Sources: [seed overview](https://orm.drizzle.team/docs/seed-overview), [seed functions](https://orm.drizzle.team/docs/seed-functions), [generator versioning](https://orm.drizzle.team/docs/seed-versioning), [RC4 Seed source](https://github.com/drizzle-team/drizzle-orm/tree/v1.0.0-rc.4/drizzle-seed/src).

## Performance and prepared execution

Inspect `.toSQL()` for SQL shape and bound params, then inspect query plans with representative data. `EXPLAIN ANALYZE` executes the statement; use it on a suitable environment. Look for rows scanned, fan-out, sort/spill, missing index support, pool waits, and overlarge nested results before changing mappers.

Avoid N+1 loops by relational reads, joins, or deliberate batches. Project needed fields, cap collections, and prefer keyset for deep paging. Index changes need query evidence and write-cost consideration. Prepared statements and opt-in JIT target repeated parsing/mapping work, not poor SQL plans.

Sources: [prepared queries](https://orm.drizzle.team/docs/perf-queries), [PostgreSQL EXPLAIN](https://www.postgresql.org/docs/current/sql-explain.html), [RC1 mapper record](https://github.com/drizzle-team/drizzle-orm/blob/v1.0.0-rc.4/changelogs/drizzle-orm/1.0.0-rc.1.md).

With `drizzle({ client, relations, jit: true })`, JIT compiles reusable result mappers. It is disabled by default; v1 checks support for the `Function` constructor and warns/falls back when unavailable. Compare representative result sizes and warm execution, including memory/cold-start cost, before enabling. It does not reduce database execution time or network transfer. Source: [JIT mappers](https://orm.drizzle.team/docs/jit-mappers).

For serverless functions, reuse clients/prepared statements at module scope only where the runtime preserves that lifecycle. Calculate aggregate connection usage across concurrent invocations. Edge/HTTP adapters have different session/transaction semantics; do not assume TCP pooling or persistent prepared state. Use an application endpoint compatible with the pooler and a migration endpoint supporting required DDL. Source: [serverless performance](https://orm.drizzle.team/docs/perf-serverless).

## Cache and replicas

Drizzle does not implicitly cache all queries. Configure caching only when staleness, key scope, TTL, and invalidation are defined. v1 exposes cache configuration and per-query `$withCache`; inspect exact RC support. Include tenant/auth scope in application keys, and verify behavior for ORM mutations, raw SQL, external writers, and transaction rollback/commit. An invalidation fired before commit can still race readers; prove the required consistency.

Read replicas introduce lag. `withReplicas` can route supported reads but does not guarantee read-your-writes. Keep transactions and consistency-sensitive reads on primary and define failover expectations. Verify actual async v1 types rather than reusing generic declarations from another release.

Sources: [cache](https://orm.drizzle.team/docs/cache), [read replicas](https://orm.drizzle.team/docs/read-replicas), [RC4 async replica helper](https://github.com/drizzle-team/drizzle-orm/blob/v1.0.0-rc.4/drizzle-orm/src/pg-core/async/db.ts).

## Runtime lifecycle

Initialize the pool/client once per owned lifecycle. Account for replicas/workers and serverless invocation behavior. Listen for idle pool errors, close on graceful shutdown, and use a timeout budget across acquisition, query, and transaction. Do not hold database transactions while awaiting slow unrelated network calls.

Log query duration/outcome and request correlation with redacted parameters; SQL logs may contain secrets or personal data. A custom Drizzle logger exposes SQL/params but is not automatically a duration monitor. Health probes should distinguish process readiness from optional deep dependency checks. Investigate errors via cause/SQLSTATE while keeping raw errors internal.

Sources: [logging](https://orm.drizzle.team/docs/goodies#logging), [node-postgres pool lifecycle](https://node-postgres.com/apis/pool), [RC4 logger](https://github.com/drizzle-team/drizzle-orm/blob/v1.0.0-rc.4/drizzle-orm/src/logger.ts).

## PostgreSQL diagnostics

When workload evidence points to the server, inspect `pg_stat_activity` for sessions/waits, `pg_locks` for blocking, and table/index statistics for scan and maintenance behavior. `pg_stat_statements` can identify frequently executed/expensive statement shapes when the extension and required server configuration are available. Distinguish execution latency from connection acquisition and lock waiting; preserve parameter redaction when collecting evidence.

Check statistics freshness, vacuum/bloat, data distribution and workload before changing indexes or memory/connection settings. Configuration effects depend on concurrent queries and the provider's available controls; this skill does not prescribe universal tuning numbers. Use [troubleshooting.md](troubleshooting.md) for API/SQL/migration symptom routing. Sources: [PostgreSQL statistics](https://www.postgresql.org/docs/current/monitoring-stats.html), [pg_stat_statements](https://www.postgresql.org/docs/current/pgstatstatements.html).
