# Designing the NestJS v12 behavior

Use Elysia request/response evidence as a starting point. The default is an idiomatic rewrite, including changed contracts when useful. Enforce exact compatibility only where explicitly requested. Read current official NestJS v12 chapters when choosing APIs.

## Decide the target contract

For each feature, record representative source requests/responses and define the target method/path, input schema, success response, and failure responses. Choose NestJS conventions deliberately; a framework does not require one universal URL style, response envelope, DTO strategy, or database architecture. Explain changed fields, coercion, statuses, and error shapes with concrete before/after examples.

| Source evidence | Idiomatic target decision |
| --- | --- |
| Chained routes and grouped prefixes | Feature controllers and method decorators; select target paths and versioning. |
| Body, query, params, headers | Parameter decorators with DTOs or schema-first validation matching the target contract. |
| Shared context and service functions | Injectable providers, request-local context, or parameter decorators according to responsibility. |
| Access checks mixed into hooks | Guards for access decisions; services for business decisions; explicit input requirements. |
| Response hooks and per-status schemas | Appropriate output serialization and explicit status/error handling. |
| Source business logic and database queries | Newly designed services and persistence operations tested against intended feature outcomes. |

Nest uses 200 by default and 201 for POST. Keep these defaults when appropriate; use `@HttpCode` for a chosen different status. Prefer framework-managed responses. Use `@Res({ passthrough: true })` when setting cookies/headers while retaining that path, and direct adapter responses when the transport requires them. Returned primitives, objects, and Web `Response` instances need distinct handling. See [Nest controllers](https://docs.nestjs.com/controllers).

## Validation and serialization

In v12, schema metadata on parameter decorators with `StandardSchemaValidationPipe` supports compatible Standard Schema libraries; metadata alone does not validate. Class DTOs with `ValidationPipe` remain valid. Choose according to the target design, not source schema syntax. Elysia `t` schemas are not automatically interchangeable with Standard Schema. Explicitly design coercion, defaults, optional/null values, nested objects, unions, unknown properties, and errors. See [Nest validation](https://docs.nestjs.com/techniques/validation).

Use schema-first output handling such as `StandardSchemaSerializerInterceptor` and `@SerializeOptions({ schema })`, or suitable class serialization. Test response shaping, status-specific contracts, and sensitive-field exclusion. Input validation and Swagger metadata do not establish output correctness. See [Nest serialization](https://docs.nestjs.com/techniques/serialization).

Native validation errors and response statuses may replace source formats under the default rewrite. Document caller-visible differences and test the new contract; do not add compatibility filters automatically.

## Responsibilities and timing

Elysia `derive` occurs before validation; `resolve` and `beforeHandle` occur afterward. Hook scope and registration order help explain source behavior, without obligating the target to reproduce it. Consult [Elysia lifecycle](https://elysiajs.com/essential/life-cycle) and [plugin scope](https://elysiajs.com/essential/plugin) only when that evidence is needed.

Nest runs middleware, guards, inbound interceptors, pipes, and the handler, then outbound interceptors. A guard or inbound interceptor cannot assume ordinary DTO pipes already ran. Put validated-input business operations in the post-pipe controller/service path, or explicitly validate inputs needed for an earlier access decision. See [Nest request lifecycle](https://docs.nestjs.com/faq/request-lifecycle).

Choose middleware for early request setup, pipes for parsing/validation, guards for access, interceptors for suitable cross-cutting response work, and exception filters for the chosen error contract. Apply components at the intended route/controller/global scope, and use DI-aware registration for dependent global components. Test intended public/protected coverage, concurrent identity isolation, and unexpected errors. Source after-response work can be redesigned; if actual network completion matters, distinguish it from observable finalization.

## When exact compatibility is requested

Limit compatibility work to the specified surface. Compare effective paths, encoding, coercion, success/error status and body, headers, cookies, output transformations, and observable side effects. Add compatibility status overrides, filters, or sequencing only where needed. Include a request that fails both authentication and validation when original failure precedence matters. Preserve relevant plugin scope without translating every Elysia hook mechanically.
