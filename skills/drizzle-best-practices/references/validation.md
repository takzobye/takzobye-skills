# Runtime validation and application contracts

## Separate persistence and public contracts

`$inferSelect`, `$inferInsert`, and inferred query results describe TypeScript persistence values. They do not parse requests, authorize fields, enforce lengths, validate JSON, or serialize dates/bigints. Accept untrusted input as unknown at an application boundary and parse before querying.

Allowlist public insert/PATCH fields. Derive owner/tenant/user identity from authenticated context, not request body. Select response fields deliberately and serialize dates, bigint, decimal, and binary representations. A partial projection requires a matching response schema; a full-table validator will reject missing columns.

## v1 validators

For Zod import `createInsertSchema`, `createUpdateSchema`, and `createSelectSchema` from `drizzle-orm/zod`. [example/validation.ts](example/validation.ts) refines title, picks public fields, rejects unknown properties, and rejects empty patches. Generated DB schemas are starting points for contracts, not automatically appropriate public DTOs.

Callbacks extend/refine column schemas before nullability/optionality wrapping; direct supplied validators replace the field schema, so explicitly preserve null/omission behavior. Use `createSchemaFactory` for an extended Zod instance or selected coercion. Broad coercion can turn unwanted strings into valid values; define input semantics first.

Sources: [v1 Zod integration](https://orm.drizzle.team/docs/zod), [RC4 Zod implementation](https://github.com/drizzle-team/drizzle-orm/tree/v1.0.0-rc.4/drizzle-orm/src/zod).

Keep an existing validator when it supports the boundary: v1 also exposes [Valibot](https://orm.drizzle.team/docs/valibot), [TypeBox](https://orm.drizzle.team/docs/typebox), [ArkType](https://orm.drizzle.team/docs/arktype), and [Effect schema](https://orm.drizzle.team/docs/effect-schema) integrations. Check export paths/peer versions for the exact RC, especially Effect v4 compatibility. Read [integrations.md](integrations.md) for Effect decoding and GraphQL boundaries. Do not introduce several validators for one feature.

## Domain and database errors

Map errors by verified driver structure and SQLSTATE/constraint name, not by brittle message text. A wrapped query error may expose the underlying `cause`; keep SQL/params/credentials out of public error messages. Unique (`23505`), FK (`23503`), check (`23514`), and not-null (`23502`) failures need contract-specific outcomes. A conflict might be expected domain behavior; an unexplained constraint failure may expose an implementation bug.

Tests should cover missing/unknown fields, empty PATCH, null vs omission, bounds, generated-field attempts, invalid JSON, duplicate keys, and output serialization. Preserve the framework's normal validation/error mechanism. Source: [PostgreSQL SQLSTATE codes](https://www.postgresql.org/docs/current/errcodes-appendix.html), [RC4 errors](https://github.com/drizzle-team/drizzle-orm/blob/v1.0.0-rc.4/drizzle-orm/src/errors.ts).
