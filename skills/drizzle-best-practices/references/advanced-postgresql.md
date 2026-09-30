# Advanced PostgreSQL features

Read only the sections required by the feature. Confirm PostgreSQL server support, provider permissions, v1 builder signatures, and Kit's generated SQL before adopting advanced DDL.

## Namespaces, views, and sequences

Use `pgSchema` or the cased schema builder for a managed namespace. Keep SQL names explicit when importing an existing schema. Fully qualified entities reduce reliance on mutable search paths; `schemasFilter` controls Kit's inspected/managed scope, not runtime authorization. Preserve externally managed schemas.

Use `pgView` for query-backed or SQL-backed views, and `.existing()` when another system owns the view. Declare raw view column types accurately. Materialized views store data: define refresh ownership and freshness requirements. Concurrent refresh requires PostgreSQL's qualifying unique index and other prerequisites. Relations can include supported views, but read-only views are not automatically writable tables.

`pgSequence` declares a sequence with deliberate bounds/increment/cycle options. Prefer identity for ordinary generated keys unless a shared/explicit sequence is needed. Sequence allocation is not a gapless counter and is not rolled back with ordinary failed transactions.

Sources: [schemas](https://orm.drizzle.team/docs/schemas), [views](https://orm.drizzle.team/docs/views), [sequences](https://orm.drizzle.team/docs/sequences), [PostgreSQL materialized refresh](https://www.postgresql.org/docs/current/sql-refreshmaterializedview.html).

## Generated columns and custom types

`generatedAlwaysAs` describes database-computed columns where supported. Expressions must follow the server's generated-column restrictions. Keep them out of public writes and verify SQL changes through migrations; altering a generated expression may require a staged operation.

Use built-in PostgreSQL types first. `customType` defines SQL type plus driver conversions for a genuinely unsupported representation; test round trips, nulls, defaults, arrays, core/RQB results, and SQL decoder usage. RC codecs operate in several query contexts; preserve the selected driver's codecs when specializing behavior. A `$type` assertion alone does not transform data.

RC4 `customType` exposes `codec` to select a known PostgreSQL codec. Its `driverOutput`/`jsonData` type hints and `fromJson`/`forJsonSelect` hooks are marked deprecated in favor of codecs; the JSON hooks bypass JSON codecs. Prefer the codec path for new customization and inspect the exact types before adapting old-looking snippets.

Read [codecs-and-mapping.md](codecs-and-mapping.md) when implementing these transforms; supplying a partial driver codec map can silently remove normalization for unrelated types.

Sources: [generated columns](https://orm.drizzle.team/docs/generated-columns), [custom types](https://orm.drizzle.team/docs/custom-types), [RC4 codecs](https://github.com/drizzle-team/drizzle-orm/blob/v1.0.0-rc.4/drizzle-orm/src/pg-core/codecs.ts), [RC4 custom-type contract](https://github.com/drizzle-team/drizzle-orm/blob/v1.0.0-rc.4/drizzle-orm/src/pg-core/columns/custom.ts).

## Extensions and search

Install required extensions through reviewed custom migrations with appropriate privileges. Availability depends on the PostgreSQL server/provider, not the TypeScript import. Extension removal can affect dependencies and data; define lifecycle ownership.

For vector search, verify extension version, dimensions, index operator class, distance function, and approximate-search recall settings. Drizzle PostgreSQL builders include vector-related types; do not assume type declaration installs the extension. Test representative data and query plans.

Full-text search uses PostgreSQL `tsvector`/`tsquery`, a defined language configuration, suitable indexes, and a safe query parser. Use fixed SQL for generated/search expressions and parameterized search text. Choose custom types/SQL where a built-in v1 builder does not cover the representation.

Sources: [PostgreSQL extensions](https://orm.drizzle.team/docs/extensions), [vector guide](https://orm.drizzle.team/docs/guides/vector-similarity-search), [full-text guide](https://orm.drizzle.team/docs/guides/postgresql-full-text-search), [CREATE EXTENSION](https://www.postgresql.org/docs/current/sql-createextension.html).

## Roles, policies, and tenant isolation

`pgRole`, `pgPolicy`, and table `.enableRLS()` express managed role/policy intent. Use `.existing()` for externally owned roles and scope Kit's role management to intended resources. Policies distinguish USING (visible/existing rows) from WITH CHECK (new row values). Check operation-specific policies and permissive/restrictive composition.

RLS identity must come from trusted authentication. With pool reuse, apply request claims/role through transaction-local settings on the same connection as the queries; avoid session state leaking between requests. RLS may be bypassed by privileged roles and table owners; test using the real application role, including FORCE RLS requirements when relevant. Application WHERE predicates remain useful, but are not proof of database isolation.

Exercise allowed and denied SELECT/INSERT/UPDATE/DELETE, cross-tenant joins, background jobs, and connection reuse. Do not rely on a relation filter as a substitute for policies. Source: [Drizzle RLS](https://orm.drizzle.team/docs/rls), [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html).

## Additional SQL capabilities

Window functions, recursive CTEs, advisory locks, partitioning, triggers, procedures, exclusion constraints, range operations, and LISTEN/NOTIFY can use parameterized SQL or custom migrations when no verified v1 builder exists. Keep generated schema state and externally owned objects coherent. Driver-specific APIs are appropriate for session streaming, COPY, or notifications when needed; retain the owning connection for their lifetime.

Choose these features for concrete invariants/performance needs and test on the target server. A raw-SQL escape hatch is not a license to invent a Drizzle method. Sources: [SQL composition](https://orm.drizzle.team/docs/sql), [PostgreSQL SQL reference](https://www.postgresql.org/docs/current/sql.html).

For tenancy topology and JSONB read/patch semantics read [application-patterns.md](application-patterns.md). For server-version capabilities that differ from available v1 builder support, including UUIDv7 and virtual generated columns, read [troubleshooting.md](troubleshooting.md).
