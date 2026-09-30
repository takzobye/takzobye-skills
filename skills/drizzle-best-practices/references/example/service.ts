import { and, eq, sql } from 'drizzle-orm';
import type { Database, DataAccess } from './db.js';
import { memberships, projects } from './schema.js';
import { createProjectInput, updateProjectInput } from './validation.js';

// Trusted actor identity and validated route IDs are supplied by the application boundary.
export async function createProject(db: Database, actorId: number, input: unknown) {
  const parsed = createProjectInput.parse(input);
  return db.transaction(async (tx) => {
    const [project] = await tx.insert(projects).values({ ...parsed, ownerId: actorId })
      .returning({ id: projects.id, title: projects.title, version: projects.version });
    if (!project) throw new Error('Project insert returned no row');
    await tx.insert(memberships).values({ userId: actorId, projectId: project.id, role: 'owner' });
    return project;
  });
}

export async function updateProject(
  db: DataAccess, actorId: number, projectId: number, expectedVersion: number, input: unknown,
) {
  const patch = updateProjectInput.parse(input);
  const [project] = await db.update(projects).set({
    ...patch, version: sql`${projects.version} + 1`, updatedAt: sql`now()`,
  }).where(and(
    eq(projects.id, projectId), eq(projects.ownerId, actorId), eq(projects.version, expectedVersion),
  )).returning({ id: projects.id, title: projects.title, version: projects.version });
  if (!project) throw new Error('Project unavailable or version conflict');
  return project;
}

export async function deleteProject(db: DataAccess, actorId: number, projectId: number) {
  const [deleted] = await db.delete(projects)
    .where(and(eq(projects.id, projectId), eq(projects.ownerId, actorId)))
    .returning({ id: projects.id });
  return deleted;
}

export async function addMember(db: Database, actorId: number, projectId: number, userId: number) {
  return db.transaction(async (tx) => {
    // Lock to keep ownership/deletion stable while authorizing this mutation.
    const [owned] = await tx.select({ id: projects.id }).from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.ownerId, actorId)))
      .for('update');
    if (!owned) throw new Error('Project unavailable');
    await tx.insert(memberships).values({ userId, projectId, role: 'member' })
      .onConflictDoNothing({ target: [memberships.userId, memberships.projectId] });
  });
}

// Internal synchronization operation; caller must establish administrative scope.
export function syncMembership(db: DataAccess, userId: number, projectId: number, role: 'owner' | 'member') {
  return db.insert(memberships).values({ userId, projectId, role })
    .onConflictDoUpdate({
      target: [memberships.userId, memberships.projectId], set: { role },
    }).returning({ userId: memberships.userId, projectId: memberships.projectId, role: memberships.role });
}
