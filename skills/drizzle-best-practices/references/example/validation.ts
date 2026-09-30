import { createInsertSchema, createUpdateSchema } from 'drizzle-orm/zod';
import { projects } from './schema.js';

export const createProjectInput = createInsertSchema(projects, {
  title: (field) => field.trim().min(1).max(200),
}).pick({ title: true }).strict();

export const updateProjectInput = createUpdateSchema(projects, {
  title: (field) => field.trim().min(1).max(200),
}).pick({ title: true, status: true }).strict()
  .refine((value) => value.title !== undefined || value.status !== undefined, {
    message: 'At least one change is required',
  });
