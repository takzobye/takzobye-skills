---
name: drizzle-best-practices
description: Implement or review PostgreSQL data layers with Drizzle ORM v1, including schema, relations, migrations, queries, transactions, validation, and testing. Use for Drizzle-specific implementation decisions on the v1 release line.
---

# Drizzle Best Practices

Deliver the requested PostgreSQL behavior end to end using **Drizzle ORM v1 only**. The verified baseline is ORM and Kit **1.0.0-rc.4**, checked **2026-10-01**; the registry also exposes an RC5 snapshot. Read [versions-and-drivers.md](references/versions-and-drivers.md) for version selection and driver capabilities.

Sources start at the [official overview](https://orm.drizzle.team/docs/overview); each reference links its relevant documentation and versioned implementation.

## Establish the boundary

Inspect manifests and lockfiles, runtime, PostgreSQL server version, provider, schema exports, relation definitions, Kit config, migration history, validation boundaries, and nearby tests. Preserve the project's package manager, framework, architecture, and driver when they support the feature.

Use installed v1 types/source as the API authority. Official web documentation is unversioned: verify uncertain signatures against the exact RC. If the repository has a different major version, explain the mismatch and keep proposed implementation on v1; resolve the dependency change within the user's scope before executing it. This skill provides guidance only for v1 and PostgreSQL.

## Read by task

Load only relevant references. An end-to-end feature normally needs schema, relations, migrations, queries, writes, and testing.

| Task | Reference |
| --- | --- |
| Dependencies, drivers, pools, runtime wiring | [versions-and-drivers.md](references/versions-and-drivers.md) |
| Tables, naming, types, defaults, keys, indexes | [schema.md](references/schema.md) |
| Cardinality, junctions, self-relations, graph parts | [relations.md](references/relations.md) |
| Nested reads, joins, pagination, aggregation, SQL | [queries.md](references/queries.md) |
| CRUD, upsert, bulk mutations | [writes.md](references/writes.md) |
| Repository/service boundaries, soft delete, audit, tenancy, JSONB | [application-patterns.md](references/application-patterns.md) |
| Atomic workflows, isolation, locking, retries | [transactions.md](references/transactions.md) |
| Generate, migrate, pull, push, custom SQL, deployment | [migrations.md](references/migrations.md) |
| Inferred types, runtime validation, API contracts | [validation.md](references/validation.md) |
| Driver normalization, JSON/array mapping, custom codecs | [codecs-and-mapping.md](references/codecs-and-mapping.md) |
| Views, sequences, extensions, generated/custom types, RLS | [advanced-postgresql.md](references/advanced-postgresql.md) |
| Tests, seed data, performance, cache, lifecycle | [testing-and-operations.md](references/testing-and-operations.md) |
| GraphQL, ESLint, optional integration compatibility | [integrations.md](references/integrations.md) |
| API/result failures, migration drift, PostgreSQL feature gates | [troubleshooting.md](references/troubleshooting.md) |
| Connected implementation from schema to service | [end-to-end.md](references/end-to-end.md) and [example files](references/example/schema.ts) |
| Documentation coverage and verification limits | [coverage.md](references/coverage.md) |

## Implement and finish

Translate the feature into database invariants, runtime contracts, and query behavior. Define constraints separately from query relations. Choose core builders for SQL-shaped results and `db.query` for nested results. Carry authorization/tenant predicates through reads, mutations, and transactions.

For v1 PostgreSQL, initialize with `{ client, relations }`, define relationships with `defineRelations`, and use schema-level `snakeCase`/`camelCase` builders or explicit SQL names. Follow callback alias rules for relational expressions. Resolve API uncertainty with types/source and a reproduction instead of casting away errors.

Complete affected schema and migration artifacts, application wiring, input/output handling, and meaningful verification. Type-check against the selected RC and run PostgreSQL integration tests for changed constraints, relations, and atomic behavior. Review generated SQL and migration deployment implications. Report versions, verified behavior, and checks that could not run; compilation and mocks alone cannot prove database behavior.

Examples are implementation choices, not mandatory architecture. Adapt identities, constraints, DTOs, index order, and pool settings to the feature. Use optional capabilities when the task needs them.
