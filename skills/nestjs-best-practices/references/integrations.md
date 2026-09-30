# Integration-specific routing

Consult these only when the feature/upgrade touches the integration. Verify companion package versions and peers before adapting examples.

## Transport contracts

For microservices, put `@MessagePattern()`/`@EventPattern()` handlers in controllers; inject `ClientProxy` through the documented client module/token. Match request-response handlers to `send()` and event handlers to `emit()`. `send()` returns a cold Observable and needs a subscription (or an awaited conversion such as `firstValueFrom()`); `emit()` attempts delivery immediately, but its completion/error still needs handling when the caller depends on it. Bound request-response waits and close owned clients on shutdown. [Microservices](https://docs.nestjs.com/microservices/basics).

Verify payload validation, transport-appropriate exceptions, retries, and the transport's acknowledgement/reconnection behavior. Skill implementation choice: make repeated delivery safe according to that transport's guarantees. A hybrid application's microservice does not inherit global HTTP enhancers by default; use `inheritAppConfig: true` deliberately and register `useGlobal*()` enhancers before `connectMicroservice()`. Check that inherited guards/filters actually support the transport. [Hybrid applications](https://docs.nestjs.com/faq/hybrid-application). For durable jobs, read [background-work.md](background-work.md).

For GraphQL, preserve the chosen schema-first/code-first approach. Use `GqlExecutionContext` in guards/decorators instead of HTTP-only request access; verify resolver inputs, field-level authorization where required, and the public schema. Check repeated relation loads through the chosen data layer. For WebSockets, register gateways as module providers and use message/connection boundaries for validation and authorization; adapt response/errors to the selected adapter/protocol. [GraphQL execution context](https://docs.nestjs.com/graphql/other-features), [Gateways](https://docs.nestjs.com/websockets/gateways).

## Version-specific integration notes

- **GraphQL:** when a development IDE is needed, configure GraphiQL with `graphiql` options. Subscriptions use `graphql-ws`; review server/client protocols and authentication together. [Quick start](https://docs.nestjs.com/graphql/quick-start), [Subscriptions](https://docs.nestjs.com/graphql/subscriptions).
- **NATS v3:** replace `nats` with `@nats-io/transport-node`; direct helpers may need `@nats-io/nats-core`. Review custom serializers/deserializers: the full message exposes `msg.json()`. [NATS](https://docs.nestjs.com/microservices/nats).
- **Terminus v12:** inject `HealthIndicatorService`; return `check(key).up()`/`.down()`, or `.attempt(...).withTimeout(...)`. Legacy `HealthIndicator`/`HealthCheckError` patterns were removed. [Health checks](https://docs.nestjs.com/recipes/terminus).
- **Persistence:** read [data-and-performance.md](data-and-performance.md) for connection ownership, ORM integration, transactions, and migrations.

Docs can lag release patches. Keep resolved discrepancies local to the affected version instead of making a workaround a permanent framework rule.
