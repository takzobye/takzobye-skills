# v1 relations

Use `defineRelations` from `drizzle-orm` with the complete set of queryable entities. The [example graph](example/relations.ts) covers one-to-one, one-to-many, multiple role paths, self-reference, and many-to-many traversal.

## Cardinality

Use `r.one.target({ from, to })` for one record and `r.many.target({ from, to })` for a collection. `one` defaults to optional in RC4; select `optional: false` only when a matching target is guaranteed. This is a result-type promise, not an existence constraint. Enforce one-to-one with a unique FK/shared PK. Reverse join inference works only with an unambiguous matching relation.

Many-to-many needs a real junction table. Apply `.through(...)` to source and target join columns for direct traversal; query the junction when membership metadata matters. Composite joins use aligned arrays of columns; check the exact RC's types and SQL.

Use matching `alias` values on both directions of role paths, and the correct distinct foreign key for each role. Self-relations benefit from explicit joins. Verify illustrative docs snippets before adapting them; a reviewer path must use the reviewer column.

Constraints govern integrity/deletion; relation declarations govern query navigation. Keep both when both are needed. Sources: [relations guide](https://orm.drizzle.team/docs/relations), [RC4 relation types and compiler](https://github.com/drizzle-team/drizzle-orm/blob/v1.0.0-rc.4/drizzle-orm/src/relations.ts).

## Filters and composition

Predefined relation `where` filters the target table. It can expose a meaningful named collection, but callers can access the table through other paths: it is not a universal authorization boundary. Apply authorization to every data-access path.

Compose complete `defineRelations` first and `defineRelationsPart` results afterwards. Spreads are shallow: parts sharing a table key can overwrite that table's graph. Consolidate or merge deliberately and verify all routes. Include every table needed by `db.query`.

Share the final graph between runtime and tests. Core joins remain explicit. Before finishing, verify both directions, missing optional targets, empty collections, correct role aliases, duplicate junction rejection, and deletion actions. Source: [RC4 relation builders](https://github.com/drizzle-team/drizzle-orm/blob/v1.0.0-rc.4/drizzle-orm/src/relations.ts).
