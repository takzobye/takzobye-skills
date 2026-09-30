# Modules and dependency injection

## Feature boundaries

Organize providers/controllers in feature modules. Exports define the module's public dependency surface: consumers import that module rather than redeclaring its providers. Independently registering the same service in several modules can create independent instances. Use global modules deliberately for shared infrastructure. [Modules](https://docs.nestjs.com/modules).

Use Nest-managed injectable providers. Keep transport handling in controllers and reusable operations in services; follow existing boundaries rather than automatically adding layers. TypeScript interfaces have no runtime injection identity: provide a class or explicit token when abstracting dependencies. [Providers](https://docs.nestjs.com/providers).

## Custom and asynchronous providers

Choose a provider binding by ownership:

- `useValue`: an existing value or test substitute.
- `useClass`: let Nest construct an implementation for a token.
- `useFactory`: construct a value from dependencies listed in `inject`; an async factory is awaited before dependent providers initialize.
- `useExisting`: alias a registered provider; singleton consumers share its instance. A second `useClass` binding creates a separate registration. Resolve scoped providers within the appropriate context.

Share string/symbol tokens from one definition and inject them with `@Inject(TOKEN)`. Export the token from its owning module and import that module in consumers. Factory dependencies must be visible in that module's imports/providers. [Custom providers](https://docs.nestjs.com/fundamentals/custom-providers), [Asynchronous providers](https://docs.nestjs.com/fundamentals/async-providers).

Focused factory wiring; `NotesClient` is an application-defined client with `connect()` and cleanup:

```ts
import { ConfigService } from '@nestjs/config';

export const NOTES_CLIENT = Symbol('NOTES_CLIENT');

// Register in the owning module's providers, with ConfigService available:
export const notesClientProvider = {
  provide: NOTES_CLIENT,
  useFactory: async (config: ConfigService) => {
    const client = new NotesClient(config.getOrThrow<string>('NOTES_URL'));
    await client.connect();
    return client;
  },
  inject: [ConfigService],
};
```

Give the client an application-scoped lifecycle owner that closes it on shutdown. Verify startup failure and cleanup against the actual client API; an arbitrary object returned by a factory is not automatically a complete resource-management strategy.

## Dynamic modules and circular dependencies

Use a dynamic module when consumers need to configure reusable infrastructure. Its factory returns a `DynamicModule` with the required imports, providers, and exports. Conventionally, `forRoot()` configures shared infrastructure and `forFeature()` registers feature-specific resources; these names are conventions, not automatic behavior. For DI-backed options, expose `forRootAsync()`/`registerAsync()` with `imports`, `inject`, and `useFactory`, or use `ConfigurableModuleBuilder`. Keep the provider token stable and export only the consumer-facing providers. Reuse the configured module rather than repeatedly creating clients in feature modules. [Dynamic modules](https://docs.nestjs.com/fundamentals/dynamic-modules).

For a circular dependency, trace both the provider/module graph and file imports. Move shared tokens/contracts into independent files and prefer a clearer dependency boundary before adding `forwardRef()`. Barrel imports can create file cycles even when the intended DI graph is acyclic. If a provider cycle is necessary, both sides use `@Inject(forwardRef(() => OtherService))`; a module cycle needs `forwardRef()` in both modules' imports. Construction order is indeterminate, so constructor logic must not rely on the other instance already being initialized. `ModuleRef` is a documented alternative for resolving one side deliberately. Verify initialization, especially with request-scoped providers. [Circular dependency](https://docs.nestjs.com/fundamentals/circular-dependency).

## Scope and ownership

Singleton is the default. Request scope propagates to consumers and affects allocation; select it for a real per-request lifetime. Transient providers get an instance per consumer without automatically making singleton consumers transient. Keep request-specific mutable values out of shared service state. [Injection scopes](https://docs.nestjs.com/fundamentals/injection-scopes).

For dependency-injected global behavior, register framework tokens in a module:

```ts
import { APP_GUARD } from '@nestjs/core';

// Inside module providers; AccessGuard is a project-defined injectable.
{ provide: APP_GUARD, useClass: AccessGuard }
```

Bootstrap-created instances work when dependencies are supplied explicitly. Use module registration when Nest should resolve them. [Guards](https://docs.nestjs.com/guards).

For metadata-driven guards, use `Reflector` and `ExecutionContext` to access metadata and the active transport. Match handler/class override policy. [Execution context](https://docs.nestjs.com/fundamentals/execution-context). For identity verification, permissions, and denied-access cases, read [security.md](security.md).
