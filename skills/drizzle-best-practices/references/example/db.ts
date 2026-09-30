import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { relations } from './relations.js';

export function createDatabase(
  databaseUrl: string,
  onPoolError: (error: Error) => void = (error) => console.error('PostgreSQL pool error', error),
) {
  if (!databaseUrl) throw new Error('DATABASE_URL is required');
  const pool = new Pool({
    connectionString: databaseUrl,
    max: 10,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 30_000,
  });
  pool.on('error', onPoolError);
  const db = drizzle({ client: pool, relations });
  return { db, pool };
}

export type Database = ReturnType<typeof createDatabase>['db'];
export type DataAccess = Pick<Database, 'select' | 'insert' | 'update' | 'delete' | 'query'>;
