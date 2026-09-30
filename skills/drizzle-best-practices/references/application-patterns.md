# Application data-access patterns

Read when connecting schema/query code to application services, adding lifecycle behavior, or choosing tenancy boundaries. These are engineering patterns built from v1 PostgreSQL APIs; Drizzle does not automatically supply repositories, soft-delete visibility or audit policy.

## Model first, then connect the feature

Establish entities, business keys, ownership/tenant identity, cardinalities, nullability, deletion/retention behavior and the access paths needed by the feature. Translate enforceable invariants into constraints and representational choices before query relations. Record non-obvious choices near declarations, such as decimal units, timestamp precision, unusual FK actions or partial uniqueness. Use the repository's existing schema documentation when it exists; a new documentation generator is optional.

Follow [end-to-end.md](end-to-end.md) for connected code and [migrations.md](migrations.md) for rollout. Reuse shared column factories when fields have the same semantics, returning new builders per invocation. `lifecycleTimestamps()` in [example/lifecycle-patterns.ts](example/lifecycle-patterns.ts) demonstrates this. Share database structure without assuming every table has identical ownership or retention rules. Source: [schema declarations](https://orm.drizzle.team/docs/sql-schema-declaration).

## Query/repository and service boundaries

Use the application's established functions/classes/DI shape. Query functions or repositories own reusable query construction, access predicates and the required projection. Services combine domain validation and atomic steps; handlers/resolvers translate request contracts and authenticated context. A repository per table is optional, and a service can directly use Drizzle when another abstraction adds no useful boundary.

Pass the db/tx handle into participating data-access functions. Helpers that capture the global pool can escape a caller's transaction. Preserve inferred results and expose the capabilities a helper needs; see [transactions.md](transactions.md) for v1 async types. Give side effects an explicit post-commit/outbox boundary. For tests, exercise the service through migrations and observable PostgreSQL behavior. Sources: [queries](https://orm.drizzle.team/docs/data-querying), [transactions](https://orm.drizzle.team/docs/transactions).

## Soft delete and restore

The optional [lifecycle example](example/lifecycle-patterns.ts) has owner-scoped saved filters, a nullable `deletedAt`, a unique index on `(ownerId, slug)` for live rows, and atomic delete/restore audit writes. Include its file in Kit's schema paths when adopting it; the base fixture does not manage these optional tables. Core queries work with imported tables; define v1 relations if nested reads are added.

Carry `deletedAt IS NULL` through lists, detail reads, joins, nested relations, aggregates, mutations and cache semantics that expose live records. Foreign keys still refer to physically present deleted rows; enforce any rule forbidding new associations to deleted parents in the workflow or database mechanism that needs it. Soft deletion does not invoke FK `ON DELETE` actions. Define whether children remain visible and how administrative reads/purges differ.

A partial unique index permits reusing a deleted slug. Restore can conflict with a newer live row; let the constraint arbitrate concurrent writes and map the error to a domain conflict. Include the expected lifecycle state in mutation WHERE, and choose repeat-request behavior deliberately. Test visibility, access denial, deletion without physical cascade, live uniqueness, successful restore and restore conflict. Sources: [indexes/constraints](https://orm.drizzle.team/docs/indexes-constraints), [operators](https://orm.drizzle.team/docs/operators), [update](https://orm.drizzle.team/docs/update).

## Audit trail

Insert the audit event using the same transaction as the change. Derive actor/tenant identity from trusted context; define the recorded action, subject, time and permitted snapshot fields. Avoid credentials or unnecessary personal data. Choose whether identifiers must survive hard deletion; the example intentionally keeps historical IDs without FKs.

Application audit covers only writers using that service. Database triggers/custom migrations can cover other writers when required. Append-only retention needs appropriate permissions and maintenance policy; a Drizzle declaration alone does not enforce immutable history. If an audit insert fails, the feature's mutation should roll back when auditing is mandatory. Sources: [transactions](https://orm.drizzle.team/docs/transactions), [custom migrations](https://orm.drizzle.team/docs/kit-custom-migrations).

## Tenant topology

For shared tables, include tenant ownership in authorization predicates, appropriate unique keys and composite FKs; add RLS when the chosen access model requires it. Schema-per-tenant requires trusted routing, controlled namespaces, migrations for each tenant, and connection/search-path lifecycle handling. Neither a `pgSchema` namespace nor relation metadata proves isolation. Preserve the application's established topology and test cross-tenant reads, writes, joins and reused connections. See [advanced-postgresql.md](advanced-postgresql.md). Sources: [PostgreSQL schemas](https://orm.drizzle.team/docs/schemas), [RLS](https://orm.drizzle.team/docs/rls).

## JSONB operations

For PostgreSQL extraction, `->` returns JSON and `->>` returns text; missing paths can yield SQL null. Containment `@>` and key/path operators have different semantics. Use parameterized `sql` expressions and select a result decoder/nullable type from actual SQL behavior. `$type` does not validate stored JSON.

The lifecycle example reads a profile's theme and uses `jsonb_set` for a validated single-field change, preserving other keys. SQL changes to the stored value avoid an application read-modify-write overwriting unrelated concurrent changes; same-field conflict semantics may still need optimistic versioning. Distinguish SQL null, JSON null and absent keys. Nested updates require existing intermediate path components or an explicit construction policy. Index by the actual containment/path query and operator class. Sources: [column types](https://orm.drizzle.team/docs/column-types), [SQL composition](https://orm.drizzle.team/docs/sql), [PostgreSQL JSON operators/functions](https://www.postgresql.org/docs/18/functions-json.html).
