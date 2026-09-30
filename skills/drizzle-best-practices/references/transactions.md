# Transactions and concurrency

## Atomic workflows

Use `db.transaction(async (tx) => { ... })` on a driver supporting interactive sessions. All participating queries use `tx`; the outer database can obtain a different connection and escape the transaction. Return after commit. [example/service.ts](example/service.ts) creates a project and membership atomically.

Infer transaction types from the concrete database or inspect `PgAsyncTransaction` for the driver. A helper needing a few methods can accept a narrow `Pick` of capabilities shared by db and tx; preserve relation inference instead of casting them to a universal handle.

A `Pick` of a node-postgres database still retains that driver's query-result types; it is compatible with that driver's transaction, not automatically with PGlite or another PostgreSQL adapter. When sharing service code across drivers is required, parameterize the handle's `PgQueryResultHKT` and preserve the concrete relation type, for example:

```ts
import type { PgAsyncDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import { relations } from './relations.js';

type DataAccess<Q extends PgQueryResultHKT> = Pick<
  PgAsyncDatabase<Q, typeof relations>,
  'select' | 'insert' | 'update' | 'delete' | 'query'
>;
```

Infer `Q` at each service call; a helper that owns transactions must also preserve the matching transaction callback signature. Keep a concrete driver type when portability is unnecessary.

Thrown exceptions roll back; `tx.rollback()` deliberately throws. Nested transactions use savepoints where supported. Catch outside the failed savepoint if the outer transaction should continue; a failed PostgreSQL statement otherwise leaves that transaction aborted.

Sources: [transactions](https://orm.drizzle.team/docs/transactions), [RC4 node-postgres session](https://github.com/drizzle-team/drizzle-orm/blob/v1.0.0-rc.4/drizzle-orm/src/node-postgres/session.ts).

## Isolation and locks

Choose `isolationLevel`, `accessMode`, and `deferrable` from the required invariant and driver support. Read committed takes statement snapshots; repeatable read provides a stable snapshot; serializable may reject conflicts. Deferrable is meaningful for read-only serializable work.

Use core `.for('update')` inside the transaction for pessimistic updates, acquire rows in consistent order, and keep locks short. `skipLocked` can fit queue workers; `noWait` supports immediate failure. Locks on existing rows cannot protect a missing-row invariant: choose a unique constraint, conditional insert, or appropriate serialization.

Prefer one conditional UPDATE for a local invariant. Cross-row invariants may need locks, constraints, or serializable retry. Concurrency tests require at least two actual connections.

Sources: [PostgreSQL isolation](https://www.postgresql.org/docs/current/transaction-iso.html), [locking](https://www.postgresql.org/docs/current/explicit-locking.html), [RC4 lock types](https://github.com/drizzle-team/drizzle-orm/blob/v1.0.0-rc.4/drizzle-orm/src/pg-core/query-builders/select.types.ts).

## Retries and external effects

Retry a complete transaction for classified transient failures with bounded attempts and jitter/backoff. SQLSTATE `40001` and `40P01` are common candidates; inspect driver errors and Drizzle cause chains. Validation/uniqueness errors normally need domain handling. Unknown commit outcomes need idempotency or reconciliation.

Keep replayable callbacks free of external payment/notification effects. Use a transactional outbox plus idempotent dispatcher when atomic data changes and eventual delivery are required. A post-commit direct call can fail after commit, so define recovery.

HTTP batch transactions cannot branch in application code on preceding results. Choose a session driver for that workflow. Sources: [SQLSTATE](https://www.postgresql.org/docs/current/errcodes-appendix.html), [Neon capabilities](https://orm.drizzle.team/docs/connect-neon).
