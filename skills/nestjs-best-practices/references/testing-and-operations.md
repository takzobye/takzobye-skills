# Testing and operations

## Testing

Use the installed runner; ESM scaffolds use Vitest and CommonJS scaffolds use Jest. Consult [runtime-and-upgrades.md](runtime-and-upgrades.md) for constraints.

Nest testing is runner-agnostic. Use `Test.createTestingModule(...).compile()` for DI; override providers with controlled substitutes. Resolve scoped providers with a suitable context rather than assuming `get()` works for all scopes. For overridable global enhancers, documented `useExisting` registration exposes the enhancer as its own provider.

Initialize HTTP tests with production-equivalent pipes, interceptors, filters, prefixes, and versioning. Use Supertest or the adapter's documented equivalent, then close the app. Fastify requires adapter readiness before injection. [Testing](https://docs.nestjs.com/fundamentals/testing).

Skill implementation choice: centralize shared app setup when tests would otherwise omit bootstrap behavior. Test outcomes and meaningful rejected cases rather than calls repeating implementation. With serialization, cover list/envelope shape and sensitive-field exclusion. If DI fails only in tests, inspect decorator metadata emission/runner transforms before changing application injection logic.

## Lifecycle and logging

Enable `app.enableShutdownHooks()` when deployment signals should trigger cleanup. Release pools, consumers, and timers in lifecycle hooks. `app.close()` runs cleanup without forcing exit; background tasks can keep processes alive. Avoid excessive listeners when creating many test apps. [Lifecycle events](https://docs.nestjs.com/fundamentals/lifecycle-events).

Use contextual Nest `Logger` and `ConsoleLogger({ json: true })` when structured stdout fits deployment. v12 attaches plain objects after a message as structured params; JSON nests them in `params`, or flattens with `flattenParams: true`. Other argument types behave differently. Preserve existing logger integrations and omit secrets. [Logger](https://docs.nestjs.com/techniques/logger).

## Optional Observe

`@nestjs/observe` is opt-in. When requested, follow SDK instructions: obtain `ObserveModule`/`ObserveInstrument` from `createObserveModule()`, configure the module, and pass `instrument: ObserveInstrument` to `NestFactory.create()`. Verify startup/credential requirements. Observability is not inherent to a feature or framework upgrade. [Observe SDK](https://docs.nestjs.com/observability/sdk).
