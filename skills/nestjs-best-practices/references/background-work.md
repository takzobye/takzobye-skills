# Events, queues, and scheduled work

Read this when work moves beyond a request handler. Choose the mechanism by delivery/ownership needs; introducing events or workers is optional, not a prerequisite for modular Nest code.

## In-process events

Use `EventEmitterModule` from `@nestjs/event-emitter` and `@OnEvent()` listeners for application events within the process. Startup emissions can precede listener registration; await `EventEmitterReadinessWatcher.waitUntilReady()` in `onApplicationBootstrap()` before emitting there. Define listener-error handling explicitly: `suppressErrors` defaults to `true`, logging failures instead of rethrowing them. Current docs support request-scoped listeners with the event payload as `REQUEST`; inspect `inheritRequestContextId` when reusing an incoming request's DI context. Test listener readiness and failure handling. [Events](https://docs.nestjs.com/techniques/events).

An in-process event emitter does not persist events or make a database write and listener side effect atomic. Skill implementation choice: if losing an event on process failure is unacceptable, select durable messaging; when publication must follow a committed write reliably, evaluate the documented [transactional outbox](https://docs.nestjs.com/reliability/outbox) pattern.

## Durable queues and workers

Nest wraps BullMQ with `@nestjs/bullmq` and Bull with `@nestjs/bull`. The current docs describe Bull as maintained and BullMQ as actively developed; preserve a working queue unless changing it is in scope. Both need Redis. Register shared connection configuration and named queues; inject the queue into producers and register processors as providers. BullMQ consumers extend `WorkerHost` and implement `process(job)`; Bull's decorator conventions are different. [Queues](https://docs.nestjs.com/techniques/queues).

Choose attempts/backoff, concurrency, retention of completed/failed jobs, and handling of terminal failures according to the operation. Skill implementation choice: make side effects safe under retries, test a repeated job and a partial failure, and keep CPU-heavy processing in a separate worker process when necessary. Carry correlation/tenant data explicitly and validate it at the worker boundary. Queue payloads are serialized; pass data/identifiers rather than live Nest objects. Verify shutdown of workers/connections and the Redis failure/recovery path. [Queue job options and separate processes](https://docs.nestjs.com/techniques/queues).

## Scheduled jobs

Register `ScheduleModule.forRoot()` from `@nestjs/schedule` and place decorated jobs in providers. Set timezone deliberately. `@Cron()`'s `waitForCompletion: true` skips new ticks while that job's current callback is running; it does not serialize work across replicas. Skill implementation choice: when only one replica may execute a business operation, choose a shared coordination/queue mechanism. Test overlap, failures, and cleanup of dynamic timers rather than assuming the scheduler provides durable delivery. [Task scheduling](https://docs.nestjs.com/techniques/task-scheduling).

## CQRS when needed

For applications already using CQRS or needing distinct command/query workflows, use the documented `@nestjs/cqrs` buses and handlers. Dispatch through the correct bus and test error handling at the handler boundary; background event-handler errors are outside the HTTP exception-filter path. Select this extra structure for an actual requirement, while preserving simpler service calls where they fit. [CQRS](https://docs.nestjs.com/recipes/cqrs).
