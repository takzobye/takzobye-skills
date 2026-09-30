import { and, count, eq, gt, sql } from 'drizzle-orm';
import type { DataAccess } from './db.js';
import { memberships, projects } from './schema.js';

export function readOwnedProject(db: DataAccess, actorId: number, projectId: number) {
  return db.query.projects.findFirst({
    where: { id: projectId, ownerId: actorId },
    columns: { id: true, title: true, status: true, version: true, createdAt: true },
    with: {
      owner: { columns: { id: true, email: true } },
      reviewer: { columns: { id: true, email: true } },
      members: { columns: { id: true }, orderBy: { id: 'asc' }, limit: 20 },
    },
    extras: { normalizedTitle: (t) => sql<string>`lower(${t.title})` },
  });
}

export function listOwnedProjects(db: DataAccess, actorId: number, afterId: number, limit = 20) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error('Invalid page size');
  return db.select({ id: projects.id, title: projects.title }).from(projects)
    .where(and(eq(projects.ownerId, actorId), gt(projects.id, afterId)))
    .orderBy(projects.id).limit(limit);
}

export function ownedProjectCounts(db: DataAccess, actorId: number) {
  return db.select({ id: projects.id, memberCount: count(memberships.userId) })
    .from(projects).leftJoin(memberships, eq(memberships.projectId, projects.id))
    .where(eq(projects.ownerId, actorId)).groupBy(projects.id).orderBy(projects.id);
}

export function prepareOwnedLookup(db: DataAccess) {
  return db.select({ id: projects.id, title: projects.title }).from(projects)
    .where(and(
      eq(projects.ownerId, sql.placeholder('actorId')),
      eq(projects.id, sql.placeholder('projectId')),
    )).prepare('owned_project_lookup');
}
