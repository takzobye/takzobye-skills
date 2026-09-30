# Integration-specific routing

Consult these only when the feature/upgrade touches the integration. Verify companion package versions and peers before adapting examples.

- **GraphQL:** when a development IDE is needed, configure GraphiQL with `graphiql` options. Subscriptions use `graphql-ws`; review server/client protocols and authentication together. [Quick start](https://docs.nestjs.com/graphql/quick-start), [Subscriptions](https://docs.nestjs.com/graphql/subscriptions).
- **NATS v3:** replace `nats` with `@nats-io/transport-node`; direct helpers may need `@nats-io/nats-core`. Review custom serializers/deserializers: the full message exposes `msg.json()`. [NATS](https://docs.nestjs.com/microservices/nats).
- **Terminus v12:** inject `HealthIndicatorService`; return `check(key).up()`/`.down()`, or `.attempt(...).withTimeout(...)`. Legacy `HealthIndicator`/`HealthCheckError` patterns were removed. [Health checks](https://docs.nestjs.com/recipes/terminus).
- **Other transports/persistence:** use the relevant chapter on the [official docs](https://docs.nestjs.com/). Preserve the chosen adapter, ORM, and transport; check their own compatibility rather than applying HTTP examples universally.

Docs can lag release patches. Keep resolved discrepancies local to the affected version instead of making a workaround a permanent framework rule.
