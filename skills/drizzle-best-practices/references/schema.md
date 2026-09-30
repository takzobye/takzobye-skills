# PostgreSQL schema

## Organization and naming

Export all managed entities from files matched by Kit's schema glob. Keep connection side effects outside declarations so generation imports never open a database. Choose a single file or feature files to fit the application. Use `pgSchema` for actual PostgreSQL namespaces.

The [connected schema](example/schema.ts) uses `snakeCase.table`, mapping `createdAt` to `created_at`. Explicit names still suit existing databases. Builders are mutable configuration objects: shared columns should use factories returning fresh builders for each table.

For a reusable timestamp factory see [example/lifecycle-patterns.ts](example/lifecycle-patterns.ts). Keep important field semantics near declarations: units, precision, ownership, delete/restore policy and why a constraint/index exists. Model-first decisions and tenant topology are covered in [application-patterns.md](application-patterns.md).

Sources: [schema declarations](https://orm.drizzle.team/docs/sql-schema-declaration), [RC4 casing](https://github.com/drizzle-team/drizzle-orm/blob/v1.0.0-rc.4/drizzle-orm/src/pg-core/casing.ts).

## Representations

| PostgreSQL value | Implementation consequence |
| --- | --- |
| Surrogate identity | Database-owned `integer().generatedAlwaysAsIdentity().primaryKey()` or `uuid().defaultRandom().primaryKey()` according to the key policy. |
| Large integer | `bigint` mode for exact integral arithmetic or verified string mode. Number mode requires a safe-integer bound; serialize bigint explicitly to JSON. |
| Exact decimal / money | `numeric({ precision, scale })` normally preserves decimal strings. Number mode loses precision; use decimal arithmetic or integral minor units when required. |
| Instant | `timestamp({ withTimezone: true, mode: 'date' })`; use string mode when microsecond precision must survive. Serialize explicitly. |
| Local time / date | Timestamp without timezone, `time`, or `date` when the domain uses wall time/calendar dates; a timezone-free value is not automatically an instant. |
| Structured data | `jsonb().$type<Shape>()` refines TypeScript only. Validate runtime JSON; use relational columns for frequently constrained/joined data. |
| Enumeration | `pgEnum` enforces database values. A text builder's enum hints alone are not constraints; add a check when needed. |
| Lists / spatial / network | Choose arrays or PostgreSQL-specific builders, operators, codec modes, indexes, and extension prerequisites deliberately. |
| Binary | Built-in `bytea` in v1; verify transport and serialization with the selected driver. |

Verify constructors and modes against the exact RC. Test large numbers, dates, arrays, JSON, and custom decoders through core and relational reads. Source: [column types](https://orm.drizzle.team/docs/column-types), [RC4 column implementations](https://github.com/drizzle-team/drizzle-orm/tree/v1.0.0-rc.4/drizzle-orm/src/pg-core/columns).

## Constraints and indexes

Use not-null, primary/unique keys, foreign keys, and checks for invariants across every writer. Choose delete/update actions intentionally: cascade for owned rows, restrict/no action for protected references, set null only for nullable columns. Composite foreign keys can enforce tenant-scoped references. Unique constraints make uniqueness race-safe; application prechecks only improve messaging.

One-to-one needs a unique FK or shared PK. A junction needs a composite primary/unique key plus constraints on metadata. Query relations create none of these. For self-FKs annotate recursive callbacks with `AnyPgColumn`; table-level `foreignKey({ columns, foreignColumns })` expresses composite references. Examples return arrays from table extra-config callbacks.

For tenant-scoped `(tenantId, reviewerId)` references, ordinary `ON DELETE SET NULL` targets the entire referencing key, including a non-null tenant column. Use a suitable restrict/no-action policy, explicit reassignment, or PostgreSQL's selective set-null syntax through verified custom DDL where supported. A nullable reviewer alone does not make the composite set-null action valid.

Index according to filters, joins, ordering, and cardinality. PostgreSQL does not automatically index the referencing FK side. A PK/unique constraint already supplies an index: avoid duplicate indexes. A `(user_id, project_id)` primary key serves user-leading lookups; add a reverse project-leading index when needed. Select partial/expression/covering/GIN/GiST indexes from real plans and account for write cost.

Sources: [indexes and constraints](https://orm.drizzle.team/docs/indexes-constraints), [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html).

## Defaults and types

SQL defaults, `defaultNow`, identity, and generated columns participate in DDL. `$defaultFn`/`$onUpdateFn` are ORM runtime hooks; other writers do not inherit them. Use database defaults/triggers when all writers need consistent behavior. `defaultNow()` does not maintain updated timestamps; the example sets `updatedAt` explicitly.

Nullable values and optional insert properties are separate decisions. Verify omission, explicit null, and PATCH omission. Infer persistence shapes with `typeof table.$inferSelect` and `$inferInsert`; infer query projection results from the actual query. API contracts usually expose fewer fields and serialized representations. Source: [RC4 column builders](https://github.com/drizzle-team/drizzle-orm/blob/v1.0.0-rc.4/drizzle-orm/src/column-builder.ts).
