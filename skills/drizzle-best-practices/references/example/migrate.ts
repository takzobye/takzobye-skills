import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { createDatabase } from './db.js';

// Invoke once from a coordinated deployment job, with the intended migration role/URL.
export async function runMigrations(databaseUrl: string, migrationsFolder = './drizzle') {
  const { db, pool } = createDatabase(databaseUrl);
  try {
    const result = await migrate(db, { migrationsFolder });
    if (result !== undefined) throw new Error(`Migration initialization failed: ${result.exitCode}`);
  } finally {
    await pool.end();
  }
}
