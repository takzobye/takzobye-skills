# PostgreSQL codecs and runtime mapping

Read this when a value differs between drivers, ordinary SELECT and relational reads, or when adding custom types. Built-in driver codecs are enabled automatically. Preserve their precision and serialization behavior before adding overrides.

## Mapping contexts

| Context | SQL transformation | JavaScript transformation |
| --- | --- | --- |
| Scalar SELECT | `cast` | `normalize` |
| Array SELECT | `castArray` | `normalizeArray` |
| Scalar within JSON/RQB | `castInJson` | `normalizeInJson` |
| Array within JSON/RQB | `castArrayInJson` | `normalizeArrayInJson` |
| Scalar parameter | `castParam` | `normalizeParam` |
| Array parameter | `castArrayParam` | `normalizeParamArray` |

A custom read transform needs matching behavior in every used context. A raw JSON aggregate can lose large-integer precision before JavaScript sees it; inspect generated casts and decoded results. Source: [codecs](https://orm.drizzle.team/docs/codecs).

## Preserve driver defaults

RC4 node-postgres chooses `config.codecs ?? nodePgCodecs`. A supplied partial map replaces the default collection. Use `refineCodecs` to preserve other type entries and unmodified methods within an entry:

```ts
import { refineCodecs } from 'drizzle-orm/codecs';
import { nodePgCodecs } from 'drizzle-orm/node-postgres/codecs';
import { drizzle } from 'drizzle-orm/node-postgres';

// pool and relations come from the application's existing wiring.
const codecs = refineCodecs(nodePgCodecs, {
  numeric: { normalize: (value) => String(value) },
});
const db = drizzle({ client: pool, relations, codecs });
```

This illustrates preserving a decimal-string contract; the defaults normally suffice. Test regular, JSON, array and parameter paths on the selected driver. A codec override does not change the inferred column data type. Do not return bigint for a column inferred as number. Use the appropriate column mode or a correctly typed custom column for a different public representation.

Evidence: RC4 [driver](https://github.com/drizzle-team/drizzle-orm/blob/v1.0.0-rc.4/drizzle-orm/src/node-postgres/driver.ts), [codec refinement](https://github.com/drizzle-team/drizzle-orm/blob/v1.0.0-rc.4/drizzle-orm/src/codecs.ts), and [driver defaults](https://github.com/drizzle-team/drizzle-orm/blob/v1.0.0-rc.4/drizzle-orm/src/node-postgres/codecs.ts).

## Custom columns and expressions

`customType` transforms are per column; codecs are per driver/type identifier. On reads, codec normalization precedes `fromDriver`; on writes, `toDriver` precedes parameter normalization. Match `driverData` to the value at that boundary and avoid applying the same conversion twice. The custom column's `codec` can be an identifier, a config-dependent function, or absent.

For one computed expression use `.mapWith` when a decoder is needed. `sql<T>` and `$type<T>` only assert TypeScript shapes. API serialization is a further boundary: bigint, decimal strings, binary data and timestamp precision need an explicit response contract. See [schema.md](schema.md), [validation.md](validation.md), and [custom types](https://orm.drizzle.team/docs/custom-types).
