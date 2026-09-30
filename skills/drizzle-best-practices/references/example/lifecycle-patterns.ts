import { and, eq, isNotNull, isNull, sql } from 'drizzle-orm';
import { check, integer, snakeCase, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import type { Database, DataAccess } from './db.js';
import { profiles, users } from './schema.js';

// Optional extension: include this file in Kit's schema paths when adopting it.
// Each call returns fresh builders; SQL defaults do not maintain updatedAt.
export const lifecycleTimestamps = () => ({
  createdAt: timestamp({ withTimezone: true, precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true, precision: 3 }).notNull().defaultNow(),
});

export const savedFilters = snakeCase.table('saved_filters', {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  ownerId: integer().notNull().references(() => users.id, { onDelete: 'cascade' }),
  slug: text().notNull(),
  deletedAt: timestamp({ withTimezone: true, precision: 3 }),
  ...lifecycleTimestamps(),
}, (t) => [
  uniqueIndex('saved_filters_live_owner_slug_key').on(t.ownerId, t.slug)
    .where(isNull(t.deletedAt)),
  check('saved_filters_slug_nonempty', sql`length(trim(${t.slug})) > 0`),
]);

export const filterEvents = snakeCase.table('filter_events', {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  // Historical subject/actor IDs intentionally outlive physical row deletion.
  filterId: integer().notNull(),
  actorId: integer().notNull(),
  action: text({ enum: ['soft_delete', 'restore'] }).notNull(),
  ...lifecycleTimestamps(),
}, (t) => [check('filter_events_action_valid', sql`${t.action} in ('soft_delete', 'restore')`)]);

export type SavedFilterRow = typeof savedFilters.$inferSelect;

export function listLiveSavedFilters(db: DataAccess, actorId: number) {
  return db.select({ id: savedFilters.id, slug: savedFilters.slug }).from(savedFilters)
    .where(and(eq(savedFilters.ownerId, actorId), isNull(savedFilters.deletedAt)))
    .orderBy(savedFilters.id);
}

export function softDeleteSavedFilter(db: Database, actorId: number, filterId: number) {
  return db.transaction(async (tx) => {
    const [changed] = await tx.update(savedFilters)
      .set({ deletedAt: sql`now()`, updatedAt: sql`now()` })
      .where(and(
        eq(savedFilters.id, filterId), eq(savedFilters.ownerId, actorId),
        isNull(savedFilters.deletedAt),
      )).returning({ id: savedFilters.id });
    if (!changed) throw new Error('Filter unavailable');
    await tx.insert(filterEvents).values({ filterId, actorId, action: 'soft_delete' });
    return changed;
  });
}

export function restoreSavedFilter(db: Database, actorId: number, filterId: number) {
  return db.transaction(async (tx) => {
    const [changed] = await tx.update(savedFilters)
      .set({ deletedAt: null, updatedAt: sql`now()` })
      .where(and(
        eq(savedFilters.id, filterId), eq(savedFilters.ownerId, actorId),
        isNotNull(savedFilters.deletedAt),
      )).returning({ id: savedFilters.id });
    if (!changed) throw new Error('Filter unavailable');
    // A live-slug uniqueness conflict throws and rolls back the transaction.
    await tx.insert(filterEvents).values({ filterId, actorId, action: 'restore' });
    return changed;
  });
}

export function readOwnProfileTheme(db: DataAccess, actorId: number) {
  return db.select({ theme: sql<string | null>`${profiles.preferences}->>'theme'` })
    .from(profiles).where(eq(profiles.userId, actorId));
}

export function setOwnProfileTheme(db: DataAccess, actorId: number, input: unknown) {
  if (input !== 'light' && input !== 'dark') throw new Error('Invalid theme');
  return db.update(profiles).set({
    preferences: sql`jsonb_set(${profiles.preferences}, '{theme}', ${JSON.stringify(input)}::jsonb, true)`,
  }).where(eq(profiles.userId, actorId)).returning({ userId: profiles.userId });
}
