# Coverage and verification boundary

Use this when selecting material for a complete implementation or checking whether an optional feature has a verified example. Audited on **2026-10-01** against the PostgreSQL sections linked from the [official overview](https://orm.drizzle.team/docs/overview), then reconciled with exact v1 RC types/source. Coverage means actionable implementation guidance and authoritative lookup routes; it does not mean every API, provider or deployment condition was executed.

## Implementation coverage

| Official topic group | Skill material and implementation decisions |
| --- | --- |
| Overview, getting started, connection fundamentals | [Versions/drivers](versions-and-drivers.md): exact versions, dependency selection, connection ownership and `{ client, relations }` wiring. |
| PostgreSQL drivers/providers | [Versions/drivers](versions-and-drivers.md): TCP/HTTP/WebSocket/runtime adapters, provider setup routes, session/transaction capabilities, TLS, poolers and migration URLs. |
| Schema declaration and column types | [Schema](schema.md): module organization, SQL naming/casing, PostgreSQL representations, inferred types, defaults, identity and runtime vs database behavior. |
| Indexes and constraints | [Schema](schema.md): primary/composite/unique keys, FK actions, checks, partial/expression indexes, operator classes and access-pattern order. |
| Schemas, views, sequences | [Advanced PostgreSQL](advanced-postgresql.md): namespaces, existing objects, materialized refresh and sequence behavior. |
| Generated columns and custom types | [Advanced PostgreSQL](advanced-postgresql.md) and [codecs](codecs-and-mapping.md): computed columns, typed transforms, driver/JSON contexts and round trips. |
| Relations and relation declaration | [Relations](relations.md), [relation example](example/relations.ts): `defineRelations`, cardinality, role aliases, self-relations, junctions, direct many-to-many, filters and graph parts. |
| Relational queries | [Queries](queries.md), [connected reads](example/queries.ts), [recipes](example/query-recipes.ts): projection, nested graphs, object/RAW filters, parent vs child filtering and alias-safe expressions. |
| Select, filters/operators, joins | [Queries](queries.md): composition, nulls, explicit joins, lateral/self joins, aggregation and deterministic pagination. |
| Aliases, query utilities | [Queries](queries.md), [recipes](example/query-recipes.ts): table/column/expression/CTE aliases and correlated `$count`. |
| SQL, set operations, dynamic builders | [Queries](queries.md): parameterized templates, decoders, CTE/subquery scope, set semantics and `$dynamic()` limitations. |
| Insert, update, delete | [Writes](writes.md), [service](example/service.ts): returning/defaults, public fields, scoped mutations, omitted/null PATCH, optimistic versioning, bulk writes and upsert conflicts. |
| Transactions | [Transactions](transactions.md), [service](example/service.ts): tx handle propagation, nested savepoints, isolation, row/advisory locking, retries, idempotency and external effects. |
| ORM/Kit migrations and configuration | [Migrations](migrations.md), [Kit config](example/drizzle.config.ts), [runtime migrator](example/migrate.ts): ownership, generate/migrate/pull/push/check/up/export/Studio, custom SQL, baselines, filters and v1 artifact format. |
| Migration collaboration and deployment | [Migrations](migrations.md): conflict review, single migration owner/job, staged changes, backfills, locking and recovery. The official teams page is presently a placeholder; guidance is an explicit engineering recommendation. |
| Seeding, generators, versioning | [Testing/operations](testing-and-operations.md), [seed fixture](example/seed.ts): count/seed/generator version, refinements, uniqueness, FK dependencies, skip/default behavior and reset boundary. |
| Prepared execution and batch API | [Queries](queries.md), [testing/operations](testing-and-operations.md): reusable prepared bindings, driver-specific batch support and atomicity. |
| JIT mappers and serverless performance | [Testing/operations](testing-and-operations.md): opt-in mapping, runtime fallback, representative benchmarks and aggregate connection usage. |
| Codecs | [Codecs/mapping](codecs-and-mapping.md): defaults-preserving refinement, scalar/array/JSON/parameter contexts and custom-type layering. |
| Cache, replicas, SQL comments, logging and utilities | [Testing/operations](testing-and-operations.md) and [queries](queries.md): staleness/invalidation, primary consistency, tracing, result decoding and lifecycle. |
| Extensions, vector and full-text search | [Advanced PostgreSQL](advanced-postgresql.md): installation ownership, provider/version support, dimensions/operator classes and query plans. |
| Roles, policies, row-level security | [Advanced PostgreSQL](advanced-postgresql.md): USING/WITH CHECK, managed/existing roles, trusted transaction-local identity, bypass conditions and actual-role tests. |
| Zod, Valibot, TypeBox, ArkType, Effect schema | [Validation](validation.md), [integrations](integrations.md), [validator example](example/validation.ts): current v1 entrypoints, public DTOs, refinements, coercion, serialization and errors. |
| GraphQL and ESLint integrations | [Integrations](integrations.md): generator compatibility finding, direct v1 service resolvers, mutation lint rules and their limits. |
| PostgreSQL capabilities outside builder APIs | [Advanced PostgreSQL](advanced-postgresql.md): SQL/custom migrations for triggers, partitions, recursive/window queries, notifications and driver-native operations. |
| End-to-end application implementation and verification | [Connected implementation](end-to-end.md): schema → migration → wiring → validation → queries → atomic services → meaningful tests. |
| Application lifecycle and data-access patterns | [Application patterns](application-patterns.md): model-first decisions, shared factories, query/service boundaries, soft delete/restore, atomic audit, tenancy topology and JSONB field changes. |
| Troubleshooting and server diagnostics | [Troubleshooting](troubleshooting.md) and [testing/operations](testing-and-operations.md): API/result/migration failure routes, server feature gates, waits/statistics and evidence-driven tuning. |

Historical upgrade/API comparison pages are not implementation material for this skill. General guide/tutorial indexes are lookup routes, not additional mandatory architectures. Product announcements, marketing and examples outside PostgreSQL are outside the requested scope. Placeholder pages do not justify inventing an API or asserting tested support.

## Topic audit of the requested skills

Compared the five entrypoints and their 22 Markdown references on 2026-10-01. The comparison used headings and intended topics to identify coverage gaps. Their code, prose, repository conventions, package-version labels and runtime-specific limits are not implementation authority for this skill. Implementation guidance remains grounded in current official Drizzle documentation, exact v1 types/source and PostgreSQL documentation where server behavior matters.

| Requested comparison | Topic emphasis | Coverage outcome |
| --- | --- | --- |
| [lobehub/lobehub](https://www.skills.sh/lobehub/lobehub/drizzle) | Schema consistency, reusable helpers, naming, field semantics, types and query style. | Expanded fresh-builder examples and field rationale in [schema](schema.md) and [application patterns](application-patterns.md); existing relations, queries and tests already cover the shared core. |
| [bobmatnyc/claude-mpm-skills](https://www.skills.sh/bobmatnyc/claude-mpm-skills/drizzle-orm) | Setup through advanced schema/query patterns, pooling, serverless execution, cache and performance. | Existing references cover the implementation path; added actionable JSONB operations and server diagnostic routes. Tool comparisons and unrelated deployment patterns do not define this skill's architecture. |
| [giuseppe-trisciuoglio/developer-kit](https://www.skills.sh/giuseppe-trisciuoglio/developer-kit/drizzle-orm-patterns) | Reusable CRUD/transaction patterns, repositories, soft delete, audit and common lifecycle behavior. | Added [application patterns](application-patterns.md) and the optional [lifecycle fixture](example/lifecycle-patterns.ts), including restore conflicts and atomic audit behavior. |
| [jezweb/claude-skills](https://www.skills.sh/jezweb/claude-skills/d1-drizzle-schema) | Model-first workflow, schema/relations/type exports, migration setup, runtime capability differences and bulk limits. | Applied the portable topic structure to PostgreSQL model decisions and capability checks. The source platform's builders, SQL types, result methods and limits are excluded. |
| [ccheney/robust-skills](https://www.skills.sh/ccheney/robust-skills/postgres-drizzle) | PostgreSQL-focused contract, constraints, migration recovery, plan-driven optimization, server capabilities and troubleshooting. | Added [troubleshooting](troubleshooting.md), PostgreSQL feature gates and server monitoring routes; existing references cover schema, query, isolation, RLS and deployment decisions. |

This audit expands useful implementation branches; it does not require copying every heading, choosing a new ORM, or imposing another repository's conventions.

## What was verified

All 11 bundled TypeScript files passed strict application compilation for ORM/Kit **1.0.0-rc.4** and **1.0.0-rc.5-5935859**. Seed uses the matching v1 package. Both Kit versions generated PostgreSQL migrations and passed migration consistency checks.

Disposable PGlite runs applied/reran migrations and exercised role/self/junction relations, optional rows, JSON/date decoding, request validation, scoped CRUD, optimistic conflicts, core/relational preparation, cursor reads, aggregates, conflict handling, rollback after a later write fails and FK cascade. Added recipes exercised correlated counts including zero, parent/child filters, column/CTE aliases, nullable self-joins, DISTINCT ON ties and UNION deduplication; deterministic generator refinement was exercised on fresh fixture state.

The optional lifecycle fixture generated/applied migrations on both exact RCs and exercised partial live uniqueness, scoped soft delete/restore, restore conflict rollback, audit failure rollback, retained historical identifiers after physical deletion, JSONB absent-path null and validated field changes that preserve unrelated keys.

An independent implementation pass used this skill for a tenant-scoped model with composite FKs, relation roles, atomic audit writes, precision-aware cursor pagination and optimistic PATCH. Its strict RC4 compilation and local PostgreSQL semantic checks passed.

Real node-postgres connections, multi-session concurrency, production poolers, every provider, cache/replica deployments, GraphQL generation, alternative validators and advanced extension/RLS execution were not tested here. Their instructions specify checks on the chosen environment. The published GraphQL generator has a concrete v1 incompatibility at this baseline; follow the direct resolver route or verify a compatible later release.
