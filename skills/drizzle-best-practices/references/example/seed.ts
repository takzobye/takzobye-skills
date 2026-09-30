import { seed } from 'drizzle-seed';
import type { Database } from './db.js';
import { users } from './schema.js';

// Caller owns the disposable database and fixture cleanup.
export function seedUsers(db: Database) {
  return seed(db, { users }, { count: 4, seed: 20261001, version: '4' })
    .refine((f) => ({
      users: { columns: { referredById: f.default({ defaultValue: null }), email: f.email() } },
    }));
}
