# Connected PostgreSQL implementation

This fixture implements users, optional profiles, projects with owner/reviewer roles, and project memberships. It demonstrates v1 wiring rather than prescribing a framework or folder layout.

| File | Purpose |
| --- | --- |
| [schema.ts](example/schema.ts) | Identity, self-FK, enum, checks, unique FK, junction key, reverse index, timestamps. |
| [relations.ts](example/relations.ts) | Optional one-to-one, role aliases, self-reference, one-to-many, direct many-to-many. |
| [db.ts](example/db.ts) | Owned node-postgres pool, complete graph, concrete inferred DB type. |
| [validation.ts](example/validation.ts) | v1 Zod integration with public field allowlists. |
| [queries.ts](example/queries.ts) | Relational read with aliased extras, cursor read, core join/aggregate, prepared lookup. |
| [query-recipes.ts](example/query-recipes.ts) | Correlated count, relation filters, relational preparation, aliases/CTE, DISTINCT ON, union. |
| [service.ts](example/service.ts) | Atomic create/membership, owner-scoped optimistic update, scoped delete, upsert. |
| [drizzle.config.ts](example/drizzle.config.ts) | PostgreSQL-only Kit configuration. |
| [migrate.ts](example/migrate.ts) | Dedicated runtime migration function with failure handling and pool cleanup. |
| [seed.ts](example/seed.ts) | Optional v1 deterministic generator refinement for disposable fixtures. |
| [lifecycle-patterns.ts](example/lifecycle-patterns.ts) | Optional tables and services for soft delete/restore with audit, fresh shared builders, and scoped JSONB updates. |

## Use the example

Adapt files into the repository rather than creating a second data layer. Relative TypeScript imports use `.js` for Node ESM compilation; match the target project's module conventions. Use strict TypeScript. Install exact v1 ORM/Kit as shown in [versions-and-drivers.md](versions-and-drivers.md), `pg`, its types, and `zod` if using this validator. Use the project's env loader before evaluating config.

Point Kit to the adapted schema, generate a migration, inspect SQL, and apply it to a disposable PostgreSQL database. The bundled files are references, so their default config path assumes they have been placed at `src/db/schema.ts`. Migration application is a separate lifecycle step.

When adopting the optional lifecycle extension, include `src/db/lifecycle-patterns.ts` alongside `src/db/schema.ts` in Kit's schema array. Its schema declarations import only types from database wiring and use core queries; add `defineRelations` entries when the feature needs nested reads.

```ts
import { createDatabase } from './db.js';
import { createProject, updateProject } from './service.js';
import { readOwnedProject } from './queries.js';

// These IDs come from authenticated context / existing database records.
async function workflow(databaseUrl: string, actorId: number) {
  const { db, pool } = createDatabase(databaseUrl);
  try {
    const created = await createProject(db, actorId, { title: 'Release plan' });
    const changed = await updateProject(db, actorId, created.id, created.version, {
      title: 'Reviewed release plan',
    });
    return await readOwnedProject(db, actorId, changed.id);
  } finally {
    await pool.end();
  }
}
```

In a web application, pool lifecycle belongs to the application; do not run this close-per-workflow wrapper for each request. The example authorizes owner-only access. Membership-based authorization needs an additional verified membership predicate; it is not granted merely because a relation exists.

## Verification scenarios

Create two users and one profile. Give a project distinct owner/reviewer IDs and multiple memberships. Check owner and reviewer paths separately, the self-referral direction, optional profile absence, both direct many-to-many directions, and junction metadata.

Generate and apply SQL, then exercise create → nested read → optimistic update → stale-version failure → upsert → scoped delete. Force owner-membership insertion failure and prove the project insert rolls back. Verify duplicate profile/membership rejection, FK/check behavior, timestamp update, JSON decoding, and page boundaries.

These checks prove more than compilation. For network pooling and concurrent isolation use real PostgreSQL sessions. See [testing-and-operations.md](testing-and-operations.md) for test selection.

## Verified baseline

On 2026-10-01, the connected examples passed strict application TypeScript compilation against ORM/Kit `1.0.0-rc.4` and `1.0.0-rc.5-5935859`. Kit generated PostgreSQL migration SQL for both. PGlite checks applied/reran migrations and exercised role/self/junction relations, JSON/date decoding, validation, scoped CRUD, prepared lookup, paging, aggregates, upsert, rollback after a second-write failure, and FK cascade. This is local PostgreSQL semantic verification; real node-postgres networking, production poolers, concurrent sessions, and advanced extension/RLS paths were not exercised by that fixture.

The added query recipes and seed fixture also passed compilation and PGlite execution on both exact RCs. The codec refinement snippet passed application compilation on both; custom codec execution against a live node-postgres connection was not tested. See [coverage.md](coverage.md) for topic coverage and optional-integration limits.

The optional lifecycle extension passed both RC compilations and generated/applied migrations. PGlite checks exercised live-row partial uniqueness, owner visibility/denial, soft deletion, successful restore, conflicting restore rollback, mutation rollback after audit failure, retained audit IDs after physical deletion, JSONB missing-path null and validated field updates preserving unrelated keys.
