# Read queries and SQL composition

Contents: relational reads; core reads; pagination; composition; SQL and preparation.

## Relational reads

Use `db.query.<table>.findMany/findFirst` for nested objects; [example/queries.ts](example/queries.ts) supplies connected v1 code. `findFirst` may return undefined. Bound root and nested collections and project fields needed by the contract.

Use object filters (`{ id: value }`, `{ id: { gt: cursor } }`), `AND`/`OR`/`NOT`, and `RAW` callbacks for SQL. Relation filters constrain parent existence; a nested `with` filter trims loaded children. Use both when both effects are needed; test parents with no matching children.

Use consistent include/exclude projections: including any true field makes exclusions redundant. v1 supports root and nested ordering, limits, and offsets. Give pagination a deterministic order.

In relational `RAW`, `orderBy`, and `extras` expressions, reference the callback's current table. Imported outer columns bypass aliases and can break nested/self queries. Imported subquery tables are fine when correlated to callback outer columns. Use core builders for complex grouped result sets.

Sources: [relational query guide](https://orm.drizzle.team/docs/rqb), [RC4 types/compiler](https://github.com/drizzle-team/drizzle-orm/blob/v1.0.0-rc.4/drizzle-orm/src/relations.ts).

## Core reads

Use `db.select({ ... }).from(table)` for projections, explicit joins, aggregates, and reports. Assemble optional predicates once with `and`/`or`, retaining tenant/authorization filters. Use `isNull`/`isNotNull` for SQL nulls. Operators parameterize values; escape LIKE wildcards when user input should be literal.

Joins require explicit conditions. Left-joined entities may be null; one-to-many joins fan out parent rows, affecting aggregation. Use `alias(table, name)` for core self-joins and lateral joins for correlated per-parent selections. Core joins do not automatically aggregate nested objects.

Choose nested RQB results, SQL-shaped joins, or a bounded parent read plus a batched child read from the required projection and SQL plan. For separate child reads, handle an empty parent set, preserve access scope, bound/chunk the ID set and assemble empty collections deliberately. Per-parent queries can cause N+1 work, and separate statements may need a transaction snapshot when consistency across the pair matters.

Group nonaggregate selected expressions and use `having` for grouped conditions. Count via `db.$count`, `count`, or a decoded expression. PostgreSQL aggregate values may be strings: `sql<number>` only asserts a type; `.mapWith` decodes at runtime. Bound numeric conversions.

PostgreSQL `selectDistinctOn` expressions must lead ORDER BY, followed by deterministic tie-breakers. Ordinary distinct deduplicates the complete projection.

Sources: [select](https://orm.drizzle.team/docs/select), [joins](https://orm.drizzle.team/docs/joins), [operators](https://orm.drizzle.team/docs/operators), [RC4 core builders](https://github.com/drizzle-team/drizzle-orm/tree/v1.0.0-rc.4/drizzle-orm/src/pg-core/query-builders).

For concrete v1 recipes use [example/query-recipes.ts](example/query-recipes.ts): `$count` in aliased relational extras, parent-existence plus child filters, a prepared relational lookup, column/computed-field aliases in a CTE, a nullable self-join, latest-per-status `DISTINCT ON`, and a deduplicated ownership/review union. Each preserves the demonstrated access scope. `$count` can also be awaited directly or selected as a correlated core expression; do not count joined fan-out accidentally. Sources: [query utilities](https://orm.drizzle.team/docs/query-utils), [aliases](https://orm.drizzle.team/docs/aliases).

## Pagination

Validate/cap page sizes. Order by a stable unique key or a sort with unique tie-breaker. Offset suits bounded lists; keyset avoids increasingly deep offset scans.

For ascending `(createdAt, id)` filter `createdAt > cursor.time OR (createdAt = cursor.time AND id > cursor.id)`; reverse comparisons for descending order. Preserve database precision and every sort component in the cursor. Date milliseconds can lose equality for microsecond timestamps: use string precision or a compatible column precision. Filter authorization before paging. Test ties, deletion, and final/empty pages.

An opaque cursor is not authorization. Validate structure/scope. Count and list can diverge under concurrent writes; use an appropriate transaction snapshot if a consistent pair is required. Source: [PostgreSQL SELECT](https://www.postgresql.org/docs/current/sql-select.html).

## Composition

Alias computed fields before consuming them from subqueries/CTEs. Use `db.$with(name).as(...)` and `db.with(...)` for reusable named statements. Maintain correlation scope. Set operations require compatible projection shapes/order; choose `unionAll` vs `union` based on duplicate semantics, and use `intersect`/`except` when they fit the requirement.

`$dynamic()` removes core-builder one-call type restrictions for reusable helpers; it does not merge WHERE clauses. Combine predicates explicitly. RC4 separates executable async query types (`PgAsyncSelect`) from base builders; infer from concrete builders or inspect the v1 types for generic helpers.

Sources: [set operations](https://orm.drizzle.team/docs/set-operations), [dynamic building](https://orm.drizzle.team/docs/dynamic-query-building), [RC4 async builders](https://github.com/drizzle-team/drizzle-orm/tree/v1.0.0-rc.4/drizzle-orm/src/pg-core/async).

## SQL and preparation

Use `sql` templates with values, table/column objects, and `sql.join`. Reserve `sql.raw` for trusted fixed SQL. Map user-controlled sort/identifier choices to an allowlist of actual columns; placeholders cannot stand for identifiers. Raw `execute` containers vary by driver, so normalize the verified driver shape.

`sql<T>` neither validates nor casts/decodes values. SQL casts convert in the database; `.mapWith(column/decoder)` maps runtime results. Test custom expressions through every pipeline that uses them.

Prepare frequent queries at a reusable scope; supply `sql.placeholder` bindings at execution. Names must not collide between different SQL shapes. Verify pooler compatibility. v1 JIT mappers are opt-in (`jit: true`); benchmark and check runtime dynamic-code permissions before enabling.

Batch support is driver-specific: node-postgres has no general `db.batch` method. Verify the selected PostgreSQL adapter and whether its batch is atomic; use a transaction for dependent writes and `Promise.all` only for deliberately independent work. Core builders expose `.comment(...)` and relational query configs expose `comment` in these RCs; use bounded nonsensitive metadata for tracing rather than changing query values or leaking request content.

Sources: [SQL](https://orm.drizzle.team/docs/sql), [prepared queries](https://orm.drizzle.team/docs/perf-queries), [RC1 mapper change record](https://github.com/drizzle-team/drizzle-orm/blob/v1.0.0-rc.4/changelogs/drizzle-orm/1.0.0-rc.1.md).

For mismatches between core SELECT, relational JSON, arrays and write parameters read [codecs-and-mapping.md](codecs-and-mapping.md). Mapper optimization cannot correct a lossy representation or a decoder returning the wrong runtime type.
