# PostgreSQL migrations and deployment

## Choose one ownership model

Code-first: schema changes produce reviewed migration artifacts using the project-local v1 Kit. Database-first: `pull` introspects an existing PostgreSQL schema; decide how the existing state is baselined before future migrations. Preserve an external migration tool if that is the established owner. Do not combine independent history owners casually.

Use [example/drizzle.config.ts](example/drizzle.config.ts) for a connection-free schema import and explicit PostgreSQL config. Environment loading must precede config evaluation. Keep credentials in environment/configuration appropriate to the repository. Different application and migration roles/URLs may be required.

RC4 accepts `strict` in config, but the verified RC5 snapshot's `defineConfig` type does not. The shared example omits it. Inspect local CLI help and types for options instead of assuming every RC supports the same config fields.

Source: [migration fundamentals](https://orm.drizzle.team/docs/migrations), [Kit config](https://orm.drizzle.team/docs/drizzle-config-file).

## Generate and review

```sh
npx --no-install drizzle-kit generate --name=add-projects
npx --no-install drizzle-kit generate --custom --name=backfill-projects
```

Use the repository's local commands. v1 generation produces timestamped folders containing `migration.sql` and `snapshot.json`; preserve the generator's complete output and any generated migration module/index. Do not hand-author a historical journal layout. Inspect the installed Kit output rather than assuming file names.

Review rename resolution, defaults, not-null additions, enum changes, FK actions, indexes, destructive changes, and lock implications. A schema-only relation edit may require no SQL migration. Custom SQL covers triggers, extension installation, backfills, and unsupported DDL; keep schema declarations/snapshots coherent for later diffs. Reconcile parallel migration histories using v1 Kit behavior; do not suppress conflict checks merely to make generation pass.

Sources: [generate](https://orm.drizzle.team/docs/drizzle-kit-generate), [custom migrations](https://orm.drizzle.team/docs/kit-custom-migrations), [RC4 Kit source](https://github.com/drizzle-team/drizzle-orm/tree/v1.0.0-rc.4/drizzle-kit/src).

## Apply and baseline

`drizzle-kit migrate` applies pending migrations through the configured PostgreSQL connection. Runtime `migrate` uses the driver-specific `/migrator` import and its exact RC return/error contract; see [example/migrate.ts](example/migrate.ts). Ordinary SQL/history errors throw. The return type also includes structured initialization failure used internally by `pull --init`; handle non-void failure instead of treating any resolved Promise as success. Prefer the local CLI for a dedicated deployment job unless runtime migration is required.

Run one coordinated migration job before compatible application rollout; do not race every replica at startup. Test a clean database and an upgrade from the prior schema/data. Verify history and repeat execution without reapplication.

`pull` generates declarations from existing database objects. Review ownership filters, renamed properties, nullability, defaults, constraints, views, and external objects. Its generated relations are query metadata, not a replacement for constraint review. Baselining must establish actual existing migration state; never apply a full create migration blindly to a populated database.

Sources: [migrate](https://orm.drizzle.team/docs/drizzle-kit-migrate), [pull](https://orm.drizzle.team/docs/drizzle-kit-pull), [RC4 migrator contract](https://github.com/drizzle-team/drizzle-orm/blob/v1.0.0-rc.4/drizzle-orm/src/migrator.ts).

## Push, check, and Studio

`push` applies a schema diff directly and fits disposable development databases when history is unnecessary. Use reviewed migrations for shared/release environments that require reproducibility. `check` validates migration consistency supported by that Kit release; it does not prove a live database has no drift. `up` updates migration metadata when the selected Kit requires it, not business data. `export` emits schema SQL relative to an empty state; it is not an incremental migration or a live database backup. Studio is a development inspection tool with real database access; use the intended environment and role.

Sources: [push](https://orm.drizzle.team/docs/drizzle-kit-push), [check](https://orm.drizzle.team/docs/drizzle-kit-check), [up](https://orm.drizzle.team/docs/drizzle-kit-up), [export](https://orm.drizzle.team/docs/drizzle-kit-export), [Studio](https://orm.drizzle.team/docs/drizzle-kit-studio).

## Release-safe changes

Use expand → backfill → switch readers/writers → constrain → contract for incompatible live changes. Keep new columns nullable/compatible until existing rows and old application versions are handled. Chunk resumable backfills, observe lock/statement timeouts, and retain recovery steps for partial completion.

`CREATE INDEX CONCURRENTLY` cannot run in a transaction block. Check whether the selected migrator executes statements transactionally before including it; use a separate controlled DDL job if needed. Decide restoration/forward-fix behavior for irreversible data changes; do not assume generated down migrations exist.

Sources: [PostgreSQL ALTER TABLE](https://www.postgresql.org/docs/current/sql-altertable.html), [CREATE INDEX](https://www.postgresql.org/docs/current/sql-createindex.html). These deployment choices are this skill's engineering recommendations, not automatic behavior provided by Drizzle.
