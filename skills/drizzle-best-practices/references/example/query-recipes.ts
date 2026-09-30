import { and, desc, eq, sql } from 'drizzle-orm';
import { alias, union } from 'drizzle-orm/pg-core';
import type { Database } from './db.js';
import { memberships, projects, users } from './schema.js';

export function correlatedMemberCounts(db: Database, actorId: number) {
  return db.query.projects.findMany({
    where: { ownerId: actorId },
    columns: { id: true },
    orderBy: { id: 'asc' },
    extras: {
      memberCount: (t) => db.$count(memberships, eq(memberships.projectId, t.id)),
    },
  });
}

export function ownedProjectsWithMember(db: Database, actorId: number, memberId: number) {
  return db.query.projects.findMany({
    where: { ownerId: actorId, members: { id: memberId } },
    columns: { id: true },
    orderBy: { id: 'asc' },
    with: {
      members: { where: { id: memberId }, columns: { id: true }, limit: 1 },
    },
    comment: 'owned-projects-with-member',
  });
}

export function prepareRelationalOwnedLookup(db: Database) {
  return db.query.projects.findFirst({
    where: { RAW: (t) => and(
      eq(t.ownerId, sql.placeholder('actorId')),
      eq(t.id, sql.placeholder('projectId')),
    )! },
    columns: { id: true, title: true },
    with: { reviewer: { columns: { id: true } } },
  }).prepare('relational_owned_project_lookup');
}

export function ownedTitlesThroughCte(db: Database, actorId: number) {
  const owned = db.$with('owned_titles').as(db.select({
    projectId: projects.id.as('project_id'),
    normalizedTitle: sql<string>`lower(${projects.title})`.as('normalized_title'),
  }).from(projects).where(eq(projects.ownerId, actorId)));
  return db.with(owned).select().from(owned).orderBy(owned.projectId);
}

export function readUserReferrer(db: Database, userId: number) {
  const referrer = alias(users, 'referrer');
  return db.select({ id: users.id, referrerEmail: referrer.email }).from(users)
    .leftJoin(referrer, eq(users.referredById, referrer.id)).where(eq(users.id, userId));
}

export function latestOwnedProjectPerStatus(db: Database, actorId: number) {
  return db.selectDistinctOn([projects.status], {
    id: projects.id, status: projects.status,
  }).from(projects).where(eq(projects.ownerId, actorId))
    .orderBy(projects.status, desc(projects.createdAt), desc(projects.id))
    .comment('latest-owned-project-per-status');
}

export function ownedOrReviewedIds(db: Database, actorId: number) {
  const owned = db.select({ id: projects.id }).from(projects)
    .where(eq(projects.ownerId, actorId));
  const reviewed = db.select({ id: projects.id }).from(projects)
    .where(eq(projects.reviewerId, actorId));
  return union(owned, reviewed).orderBy(sql`id`);
}
