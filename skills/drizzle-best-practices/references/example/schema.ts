import { sql } from 'drizzle-orm';
import {
  type AnyPgColumn, check, index, integer, jsonb, pgEnum,
  primaryKey, snakeCase, text, timestamp,
} from 'drizzle-orm/pg-core';

export const projectStatus = pgEnum('project_status', ['draft', 'active', 'archived']);

export const users = snakeCase.table('users', {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  email: text().notNull().unique(),
  referredById: integer().references((): AnyPgColumn => users.id, { onDelete: 'set null' }),
});

export const profiles = snakeCase.table('profiles', {
  userId: integer().primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  displayName: text().notNull(),
  preferences: jsonb().$type<{ theme: 'light' | 'dark' }>().notNull().default({ theme: 'light' }),
});

export const projects = snakeCase.table('projects', {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  ownerId: integer().notNull().references(() => users.id, { onDelete: 'restrict' }),
  reviewerId: integer().references(() => users.id, { onDelete: 'set null' }),
  title: text().notNull(),
  status: projectStatus().notNull().default('draft'),
  version: integer().notNull().default(1),
  createdAt: timestamp({ withTimezone: true, precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true, precision: 3 }).notNull().defaultNow(),
}, (t) => [
  check('projects_title_nonempty', sql`length(trim(${t.title})) > 0`),
  check('projects_version_positive', sql`${t.version} > 0`),
  index('projects_owner_id_id_idx').on(t.ownerId, t.id),
  index('projects_reviewer_id_idx').on(t.reviewerId),
]);

export const memberships = snakeCase.table('memberships', {
  userId: integer().notNull().references(() => users.id, { onDelete: 'cascade' }),
  projectId: integer().notNull().references(() => projects.id, { onDelete: 'cascade' }),
  role: text({ enum: ['owner', 'member'] }).notNull(),
}, (t) => [
  primaryKey({ columns: [t.userId, t.projectId] }),
  index('memberships_project_id_user_id_idx').on(t.projectId, t.userId),
  check('memberships_role_valid', sql`${t.role} in ('owner', 'member')`),
]);

export type ProjectRow = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
