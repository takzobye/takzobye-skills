# Request pipeline and context

Read this when choosing a Nest extension point or debugging execution order. For validation/serialization contracts, read [http-contracts.md](http-contracts.md); for identity and permissions, read [security.md](security.md).

## Choose the extension point

Use middleware for request preprocessing that does not require handler metadata; use guards for access decisions, pipes for parameter validation/transformation, interceptors for behavior around handler execution, and exception filters for the response to an uncaught error. A custom parameter decorator extracts a value; attach a pipe/schema when that value needs validation. Use `ExecutionContext`/`ArgumentsHost` for the active transport instead of assuming every request is HTTP. [Middleware](https://docs.nestjs.com/middleware), [Custom decorators](https://docs.nestjs.com/custom-decorators), [Execution context](https://docs.nestjs.com/fundamentals/execution-context).

## Execution order

The ordinary HTTP path runs middleware, guards, inbound interceptors, pipes, the handler/service, and outbound interceptors. Guards run before pipes, so authorization code must not assume a route/body value already has the pipe's validated type. Within guards/interceptors, global bindings run before controller bindings, then route bindings; interceptor responses unwind in the reverse order. Parameter-pipe execution has its own ordering; independent parameter validation should not depend on another parameter's pipe having run. [Request lifecycle](https://docs.nestjs.com/faq/request-lifecycle).

Keep custom interceptors in the Observable pipeline returned by `next.handle()`, using appropriate RxJS operators for mapping, timing, or errors. A manual subscription separates execution/errors from Nest's response pipeline. Response mapping also depends on retaining Nest's response handling; check native `@Res()` routes before introducing an envelope. [Interceptors](https://docs.nestjs.com/interceptors).

## Exception filters

Keep Nest's default exception handling when it meets the contract. When customizing, handle expected exceptions deliberately, keep status/error codes meaningful, and return a safe response for unexpected errors while preserving diagnostic detail in internal logs. Use `HttpAdapterHost` when a filter must work across Express/Fastify; register `APP_FILTER` in a module when the filter needs DI. Filters resolve from route to controller to global; a handled exception is not passed on to another filter. Check validation, guard, service, and unexpected-error responses at the affected scope. [Exception filters](https://docs.nestjs.com/exception-filters), [Request lifecycle](https://docs.nestjs.com/faq/request-lifecycle).

## Request context

When correlation IDs or other context must follow an asynchronous call chain, consider a Nest-managed `AsyncLocalStorage` provider and establish the store around the downstream request with `run()`. Keep each request's store separate and check isolation under concurrent requests. Request scope is another lifetime choice, described in [modules-and-di.md](modules-and-di.md); select by ownership rather than introducing mutable request state into a singleton. Pass needed correlation/identity data deliberately to queued jobs or remote services; a local async store is not distributed context. [Async local storage](https://docs.nestjs.com/recipes/async-local-storage).
