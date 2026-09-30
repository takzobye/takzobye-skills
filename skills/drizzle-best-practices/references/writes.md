# PostgreSQL mutations

See [example/service.ts](example/service.ts) for atomic creation and a conditional update. Map validated public input to deliberately allowed fields; inferred persistence types do not authorize fields.

## Insert and return

Use `.insert(table).values(...)`, arrays for multi-row statements, and `.returning({ ... })` for generated identities/defaults and needed response fields. Empty input needs an explicit no-op policy. Keep server-owned fields out of public input. Omission can use a default; explicit null is different. Insert-from-select avoids transferring rows through application memory when the workflow is server-side.

Sources: [insert](https://orm.drizzle.team/docs/insert), [RC4 async insert](https://github.com/drizzle-team/drizzle-orm/blob/v1.0.0-rc.4/drizzle-orm/src/pg-core/async/insert.ts).

## Conflict handling

`onConflictDoNothing({ target })` handles a specific uniqueness policy and may return no rows. `onConflictDoUpdate({ target, set, targetWhere, setWhere })` implements upsert. Match target to a real unique/primary key; partial indexes may need `targetWhere`. `setWhere` makes the update conditional. Refer to `excluded` through trusted SQL identifiers when using the proposed row, and parameterize ordinary values.

Uniqueness alone does not make a whole workflow idempotent. Store a scoped key, request fingerprint, and outcome atomically when required; reject incompatible key reuse. Verify repeated/concurrent requests and partial failure. Broad conflict-ignore can hide unrelated uniqueness mistakes.

Sources: [RC4 conflict config](https://github.com/drizzle-team/drizzle-orm/blob/v1.0.0-rc.4/drizzle-orm/src/pg-core/query-builders/insert.ts), [PostgreSQL INSERT](https://www.postgresql.org/docs/current/sql-insert.html).

## Update and delete

Put resource identity and tenant/authorization predicates into WHERE. Validate required keys before building: undefined predicates must not turn a scoped mutation into a whole-table change. `.set` ignores undefined, while null writes SQL null; define PATCH semantics and empty-patch behavior.

Use SQL arithmetic plus a sufficient-value predicate for counters/balances, avoiding read-modify-write races. Optimistic concurrency compares expected version in WHERE and increments it atomically; inspect returned rows. Zero rows can mean missing, unauthorized, or stale: choose a public outcome without leaking inaccessible data.

PostgreSQL update/delete support returning. A soft delete needs consistent visibility predicates, unique-index semantics, restore rules, and retention behavior. Sources: [update](https://orm.drizzle.team/docs/update), [delete](https://orm.drizzle.team/docs/delete), [PostgreSQL UPDATE](https://www.postgresql.org/docs/current/sql-update.html).

For live-row uniqueness, scoped restore, atomic audit and JSONB field updates, read [application-patterns.md](application-patterns.md) and its optional [lifecycle example](example/lifecycle-patterns.ts).

## Bulk writes

Chunk by parameters, width, memory, and latency. Decide whole-import vs per-chunk atomicity; use [transactions.md](transactions.md). Duplicate conflict targets within one upsert batch can fail; normalize deliberately. Returning output can skip conflicting rows, so avoid matching input/output solely by position. For very large imports, consider driver COPY and a staging merge; COPY is not a generic Drizzle method. Source: [PostgreSQL COPY](https://www.postgresql.org/docs/current/sql-copy.html).
