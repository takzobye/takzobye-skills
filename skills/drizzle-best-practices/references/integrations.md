# Optional v1 PostgreSQL integrations

Use integrations when the application needs them. An official integration page or broad peer dependency range is not proof that its current package works with an exact v1 RC.

## GraphQL

The [GraphQL documentation](https://orm.drizzle.team/docs/graphql) currently contains API shapes unsuitable for this v1 baseline. On 2026-10-01, published `drizzle-graphql` **0.8.5** imports `PgDatabase` from `drizzle-orm/pg-core` and accesses `db._.fullSchema`. ORM RC4 exports `PgAsyncDatabase` instead and the configured relational model has changed. Treat the generator as incompatible with this baseline until a newer package is independently verified. The companion package's version is not an ORM version.

Implement resolvers using verified v1 queries/services, and derive actor/tenant context outside GraphQL input. For the connected example:

```ts
import type { Database } from './db.js';
import { readOwnedProject } from './queries.js';
import { createProject } from './service.js';

type Context = { db: Database; actorId: number };
const resolvers = {
  Query: {
    project: (_: unknown, args: { id: number }, ctx: Context) =>
      readOwnedProject(ctx.db, ctx.actorId, args.id),
  },
  Mutation: {
    createProject: (_: unknown, args: { input: unknown }, ctx: Context) =>
      createProject(ctx.db, ctx.actorId, args.input),
  },
};
```

Use the GraphQL server's ID parsing, nullability, error mapping, field projection and scalar serializers. Batch per-request loaders where resolvers would otherwise cause N+1 queries; preserve access predicates within every loader. A generated schema would still need authorization and query-cost limits.

Evidence: [published generator source](https://registry.npmjs.org/drizzle-graphql/-/drizzle-graphql-0.8.5.tgz), [RC4 PostgreSQL exports](https://github.com/drizzle-team/drizzle-orm/blob/v1.0.0-rc.4/drizzle-orm/src/pg-core/index.ts).

## ESLint

The optional `eslint-plugin-drizzle` rules check for `.where()` on updates/deletes. Add them to the existing ESLint setup. For flat configuration, combine this fragment with the project's TypeScript parser configuration:

```js
import drizzle from 'eslint-plugin-drizzle';
export default [{
  plugins: { drizzle },
  rules: {
    'drizzle/enforce-delete-with-where': ['error', { drizzleObjectName: ['db', 'tx'] }],
    'drizzle/enforce-update-with-where': ['error', { drizzleObjectName: ['db', 'tx'] }],
  },
}];
```

Names must match actual data-access variables. Check wrappers/aliases and deliberate maintenance operations. A `.where()` can still be always true or lack ownership constraints; lint cannot prove authorization or mutation correctness. Source: [ESLint plugin](https://orm.drizzle.team/docs/eslint-plugin).

## Runtime validators and Effect

The supported validator entrypoints and contract decisions belong in [validation.md](validation.md). For an existing Effect v4 application, use `drizzle-orm/effect-schema`'s `createInsertSchema`, `createUpdateSchema`, and `createSelectSchema`. Decode unknown input through `Schema.decodeUnknownEffect` within the existing Effect program. Apply public-field allowlists and domain refinements rather than accepting the complete insert schema. Keep database layer ownership scoped to the application's Effect lifecycle. Verify matching Effect v4 package versions before copying signatures. Source: [Effect schema](https://orm.drizzle.team/docs/effect-schema).
