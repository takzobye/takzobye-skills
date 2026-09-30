# Modules and dependency injection

## Feature boundaries

Organize providers/controllers in feature modules. Exports define the module's public dependency surface: consumers import that module rather than redeclaring its providers. Independently registering the same service in several modules can create independent instances. Use global modules deliberately for shared infrastructure. [Modules](https://docs.nestjs.com/modules).

Use Nest-managed injectable providers. Keep transport handling in controllers and reusable operations in services; follow existing boundaries rather than automatically adding layers. TypeScript interfaces have no runtime injection identity: provide a class or explicit token when abstracting dependencies. [Providers](https://docs.nestjs.com/providers).

## Scope and ownership

Singleton is the default. Request scope propagates to consumers and affects allocation; select it for a real per-request lifetime. Transient providers get an instance per consumer without automatically making singleton consumers transient. Keep request-specific mutable values out of shared service state. [Injection scopes](https://docs.nestjs.com/fundamentals/injection-scopes).

For dependency-injected global behavior, register framework tokens in a module:

```ts
import { APP_GUARD } from '@nestjs/core';

// Inside module providers; AccessGuard is a project-defined injectable.
{ provide: APP_GUARD, useClass: AccessGuard }
```

Bootstrap-created instances work when dependencies are supplied explicitly. Use module registration when Nest should resolve them. [Guards](https://docs.nestjs.com/guards).

For metadata-driven guards, use `Reflector` and `ExecutionContext` to access metadata and the active transport. Match handler/class override policy. Authenticate identity before enforcing permissions and verify denied access. [Execution context](https://docs.nestjs.com/fundamentals/execution-context), [Authorization](https://docs.nestjs.com/security/authorization).
