# Review and diagnosis

Read this when reviewing Nest changes or investigating a failing application/test. The workflow below is this skill's implementation choice; Nest's documented behavior supplies the technical criteria.

## Review the affected behavior

Inspect the requested behavior and the changed entrypoints, their modules/providers, bootstrap setup, and tests. Follow imports/exports and the dependency/transport boundaries touched by the change. Use the relevant references instead of treating every optional pattern as a mandatory standard.

| Boundary | Review question | Reference |
| --- | --- | --- |
| Modules/DI | Can consumers resolve the intended provider and lifetime without unintended duplicate instances or cycles? | [Modules and DI](modules-and-di.md) |
| Request/response | Do validation, status, serialization, filters, and execution order preserve the contract? | [HTTP contracts](http-contracts.md), [Request pipeline](request-pipeline.md) |
| Access | Are identity and resource permissions enforced, including rejected cases? | [Security](security.md) |
| Data/performance | Are connection ownership, transaction failure, migrations, and cache isolation correct? | [Data and performance](data-and-performance.md) |
| Background/transports | Do delivery, error, retry, context, and shutdown behavior fit the selected mechanism? | [Background work](background-work.md), [Integrations](integrations.md) |
| Verification/operations | Do tests use real bootstrap behavior, and are configuration/startup/cleanup changes exercised? | [Configuration](config-and-openapi.md), [Testing and operations](testing-and-operations.md) |

Report concrete findings with file/line, trigger, observable impact, and a proportionate fix. Distinguish demonstrated failures from design suggestions. A local architecture preference is not a framework violation. State which checks ran and where evidence is incomplete.

## Unresolved dependency or module

Reproduce the failing bootstrap/test, then identify the missing token and the module context named by Nest. Check the provider's registration, its owner's exports, and the consumer's imports; check named-connection tokens for repositories/models. Inspect runtime imports/metadata: an interface or type-only class import cannot act as a runtime class token. Check file-import cycles as well as actual provider cycles. Use `NEST_DEBUG` with a non-empty value for additional resolution logs when needed. [Common errors](https://docs.nestjs.com/faq/common-errors).

When failure exists only in tests, compare module imports/overrides and decorator metadata transforms with application bootstrap. Override the same token that the application injects and resolve scoped providers with their context. A successful `nest info` command describes the environment; proving resolution requires compiling/initializing the affected module/application. [Testing](https://docs.nestjs.com/fundamentals/testing), [CLI commands](https://docs.nestjs.com/cli/usages).

## Runtime, connection, and regression failures

Preserve the first useful error and trace the failing boundary before changing architecture. For a database/transport failure, separate DI resolution from missing configuration, connectivity, credentials, and driver/package compatibility. For a suspected version regression, compare the installed lockfile/types or versioned official release with the reproduction. Make the narrow correction, exercise the previously failing behavior and a relevant neighboring case, and document any remaining external-service limitation. [Common errors](https://docs.nestjs.com/faq/common-errors), [Runtime and upgrades](runtime-and-upgrades.md).
