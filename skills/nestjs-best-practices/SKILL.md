---
name: nestjs-best-practices
description: Build, change, review, or diagnose NestJS v12 applications using official documentation for architecture, dependency injection, request handling, security, persistence, performance, background work, and testing. Use for Nest-specific implementation decisions and v11-to-v12 upgrades.
---

# NestJS Best Practices

Implement the requested behavior using the project's actual Nest version and conventions. This skill captures official v12 documentation checked on **2026-10-01**, with framework release **12.1.1**. It is a dated baseline, not a promise that these versions remain latest.

Best practices here means choosing documented patterns that fit the application. Treat scaffold defaults and optional capabilities as context, and choose module format, validation, and tooling according to project requirements.

## Establish the baseline

Inspect `package.json`, the lockfile, Node/CI versions, `tsconfig*`, `nest-cli.json`, bootstrap, and nearby features/tests. Identify the adapter, module format, validation approach, and test runner before proposing code. Keep the user's package manager, data layer, and existing architecture unless the task requires changing them.

For new applications, use the current v12 CLI scaffold and verify installed versions. For existing applications, match the installed API; an ordinary feature request does not imply a framework or tooling upgrade. Read the runtime reference when scaffolding or upgrading.

When the user asks for latest guidance, dependencies change, or an API is unavailable, recheck the relevant official page and package release/peer dependencies. Docs are unversioned; companion packages need their own compatibility checks. If sources disagree, inspect installed package types/source or a versioned official tag and state the discrepancy. Avoid inventing an API to reconcile them.

## Read the relevant reference

- Scaffolding, runtime compatibility, module format, or upgrading: [runtime-and-upgrades.md](references/runtime-and-upgrades.md).
- Feature modules, custom/async providers, dynamic modules, circular dependencies, or scopes: [modules-and-di.md](references/modules-and-di.md).
- HTTP routes, input validation, response shaping, or errors: [http-contracts.md](references/http-contracts.md).
- Middleware, guard/pipe/interceptor ordering, custom filters, or request context: [request-pipeline.md](references/request-pipeline.md).
- Authentication, authorization, CORS, security headers, CSRF, or rate limiting: [security.md](references/security.md).
- Environment configuration or Swagger generation: [config-and-openapi.md](references/config-and-openapi.md).
- Database injection, transactions/migrations, caching, or performance: [data-and-performance.md](references/data-and-performance.md).
- In-process events, durable queues/workers, or scheduled jobs: [background-work.md](references/background-work.md).
- Tests, shutdown, logs, or optional observability: [testing-and-operations.md](references/testing-and-operations.md).
- GraphQL, microservices, WebSockets, health indicators, or other integrations: [integrations.md](references/integrations.md).
- Code review, unresolved DI, or runtime/test failures: [review-and-diagnostics.md](references/review-and-diagnostics.md).

Load only references relevant to the request. Examples show focused wiring fragments, not complete applications; supply feature imports, providers, schemas, and dependencies appropriate to the repository.

## Complete the change

Keep bootstrap configuration consistent between the running application and integration tests. Verify observable behavior at the affected boundary: accepted/rejected inputs, authorization when relevant, and response shape/status. Run applicable repository build, type checking, lint, and tests; explain checks that could not run. Report intentional contract changes and versions used.

References distinguish official capabilities from this skill's implementation choices. Select optional features for a concrete requirement; preserve user scope and existing authorization for external services.
