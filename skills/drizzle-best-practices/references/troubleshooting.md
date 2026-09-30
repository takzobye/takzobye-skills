# Troubleshooting v1 PostgreSQL implementations

Read when compilation, generated SQL, result mapping or deployment differs from the intended behavior. Reproduce the failing path against the exact installed RC and driver; inspect its types/source rather than introducing assertions that hide the mismatch.

## Symptom to evidence

| Symptom | What to inspect and verify |
| --- | --- |
| `db.query` has missing tables/relations | Exact v1 imports, `defineRelations` graph, `relations` passed to driver, and complete graph composition. Core schema imports alone do not configure relational reads. See [relations.md](relations.md). |
| Wrong owner/reviewer or self-relation result | Role aliases, from/to direction and junction mapping; compare actual IDs in both directions. See [relations.md](relations.md). |
| Nested SQL refers to the wrong alias | Current-table callback expressions in RAW/extras/orderBy, correlated subquery scope and `.toSQL()`. See [queries.md](queries.md). |
| Unexpected number/date/JSON/array runtime value | Column mode, ordinary vs JSON codec path, driver parser settings, defaults-preserving codec refinement and explicit decoder/serialization. See [codecs-and-mapping.md](codecs-and-mapping.md). |
| Empty returning / mutation affects no row | Conflict-no-op, conditional upsert/update, scope and expected version/state. Preserve the chosen missing/denied/conflict contract. See [writes.md](writes.md). |
| A later failure leaves an earlier write committed | Every query's actual handle/connection, driver transaction support, caught errors and external effects. See [transactions.md](transactions.md). |
| Transaction remains aborted after a caught SQL error | PostgreSQL transaction state; recover with a deliberately scoped savepoint or roll back/retry the whole transaction. Catching the error does not repair it. See [transactions.md](transactions.md). |
| Reused column fields have surprising configuration | Shared mutable builders; instantiate fresh builders with a factory. See [schema.md](schema.md). |
| Generated SQL unexpectedly renames/drops objects | Automatic casing/property rename, schema glob exports, working directory, config, namespace filters, snapshots and migration history. See [migrations.md](migrations.md). |
| Migration history conflicts or live state differs | The selected environment and history owner, applied artifacts, parallel branches and actual DDL. Preserve applied history and add reviewed repair migrations. `check` alone does not establish live consistency. See [migrations.md](migrations.md). |
| Prepared execution fails only behind a pooler | Exact driver preparation mode, statement names/shapes and provider/pooler capabilities. See [versions-and-drivers.md](versions-and-drivers.md). |
| Seed compiles but fails at runtime | Exact v1 Seed version, generator refinements, self/composite FKs, identity behavior and supported skip/default handling. See [testing-and-operations.md](testing-and-operations.md). |
| Slow query despite apparently suitable indexes | Actual plan, predicates/operator classes, row estimates, fan-out, sort, nested result volume, lock waits and pool acquisition. Mapper/JIT tuning cannot repair a poor plan. See [testing-and-operations.md](testing-and-operations.md). |

The table routes to versioned sources and official Drizzle documentation in the relevant reference; it is a diagnostic guide, not a promise that each symptom has a single cause.

## PostgreSQL server feature gates

Establish the actual server version before adopting a newer PostgreSQL feature. A server capability and a Drizzle builder capability are separate checks.

PostgreSQL 18 provides `uuidv7()` and virtual generated columns. `uuid().defaultRandom()` does not select UUIDv7. A chosen server function can be represented through a verified SQL default; Kit must generate the intended DDL. RC4's PostgreSQL `generatedAlwaysAs` signature only accepts the expression and emits stored generation; it has no virtual-mode argument. Do not copy another dialect's configuration into a PostgreSQL builder. Use reviewed custom DDL with coherent introspection/migration ownership when a desired server feature is not representable by the installed v1 API.

Sources: [Drizzle generated columns](https://orm.drizzle.team/docs/generated-columns), [RC4 PostgreSQL builder](https://github.com/drizzle-team/drizzle-orm/blob/v1.0.0-rc.4/drizzle-orm/src/pg-core/columns/common.ts), [PostgreSQL 18 UUID functions](https://www.postgresql.org/docs/18/functions-uuid.html), [PostgreSQL 18 generated columns](https://www.postgresql.org/docs/18/ddl-generated-columns.html).
