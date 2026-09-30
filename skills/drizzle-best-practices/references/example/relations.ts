import { defineRelations } from 'drizzle-orm';
import { memberships, profiles, projects, users } from './schema.js';

export const relations = defineRelations({ users, profiles, projects, memberships }, (r) => ({
  users: {
    profile: r.one.profiles({ from: r.users.id, to: r.profiles.userId }),
    referrer: r.one.users({ from: r.users.referredById, to: r.users.id, alias: 'referral' }),
    referrals: r.many.users({ alias: 'referral' }),
    ownedProjects: r.many.projects({ alias: 'ownership' }),
    reviewedProjects: r.many.projects({ alias: 'review' }),
    memberships: r.many.memberships(),
    joinedProjects: r.many.projects({
      from: r.users.id.through(r.memberships.userId),
      to: r.projects.id.through(r.memberships.projectId),
      alias: 'participation',
    }),
  },
  profiles: {
    user: r.one.users({ from: r.profiles.userId, to: r.users.id, optional: false }),
  },
  projects: {
    owner: r.one.users({
      from: r.projects.ownerId, to: r.users.id, alias: 'ownership', optional: false,
    }),
    reviewer: r.one.users({ from: r.projects.reviewerId, to: r.users.id, alias: 'review' }),
    memberships: r.many.memberships(),
    members: r.many.users({ alias: 'participation' }),
  },
  memberships: {
    user: r.one.users({ from: r.memberships.userId, to: r.users.id, optional: false }),
    project: r.one.projects({ from: r.memberships.projectId, to: r.projects.id, optional: false }),
  },
}));
