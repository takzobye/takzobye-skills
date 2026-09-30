# HTTP contracts

## Input validation

v12 supports Standard Schema libraries such as Zod, Valibot, and ArkType. Route schema metadata needs `StandardSchemaValidationPipe`; TypeScript types alone do not validate. Default `transform: true` passes schema output. Custom parameter decorators require `validateCustomDecorators: true`. [Validation](https://docs.nestjs.com/techniques/validation).

Focused wiring for a project using Zod 4:

```ts
import { Body, Controller, Post, StandardSchemaValidationPipe } from '@nestjs/common';
import { z } from 'zod';

const inputSchema = z.object({ title: z.string().min(1) });
type Input = z.output<typeof inputSchema>;

@Controller('notes')
export class NotesController {
  @Post()
  create(@Body({ schema: inputSchema }) input: Input) {
    return { title: input.title };
  }
}

// After NestFactory.create(), in bootstrap:
app.useGlobalPipes(new StandardSchemaValidationPipe());
```

The schema pipe passes parameters without schemas through unchanged. With `transform: false`, type the parameter as schema input (`z.input`), since parsed output is discarded. Choose unknown-field handling/coercion intentionally. Exercise invalid payloads and transformed values. Keep existing class-based validation where appropriate.

For class DTOs, use concrete runtime classes with `class-validator` decorators and `ValidationPipe`. Choose `transform`, `whitelist`, and `forbidNonWhitelisted` to match the contract. Interfaces/type-only DTO imports cannot supply runtime metadata. Use explicit `ParseIntPipe`, `ParseBoolPipe`, or `ParseUUIDPipe` for scalar boundaries; annotations alone do not parse query/route strings. [Pipes](https://docs.nestjs.com/pipes).

For incremental schema adoption, `@UsePipes(StandardSchemaValidationPipe)` can bind validation to the new handler while existing class DTO routes keep their global pipe. Exercise both routes with the actual global/custom pipeline. [Pipes](https://docs.nestjs.com/pipes).

## Response shaping

For response DTOs using class-transformer decorators, use `ClassSerializerInterceptor` with runtime class instances. For schema contracts, bind the interceptor:

```ts
import {
  Get, SerializeOptions, StandardSchemaSerializerInterceptor, UseInterceptors,
} from '@nestjs/common';
import { z } from 'zod';

const publicNote = z.object({ id: z.number(), title: z.string() });

// Inside a controller with a feature-provided notesService:
@Get()
@UseInterceptors(StandardSchemaSerializerInterceptor)
@SerializeOptions({ schema: publicNote })
findAll() {
  return this.notesService.findAll();
}
```

For a top-level array, provide the item schema: the interceptor handles each element. For an envelope, describe the envelope with its nested array. Global manual registration needs `new StandardSchemaSerializerInterceptor(app.get(Reflector))`; `APP_INTERCEPTOR` allows DI. Routes without schemas remain unaffected unless constructor defaults provide one. Check sensitive-field exclusion and invalid service output. [Serialization](https://docs.nestjs.com/techniques/serialization).

The schema serializer passes top-level `null`, `undefined`, primitive values, and `StreamableFile` responses through unchanged even when a schema is configured. It therefore does not enforce every possible response contract. If a route must reject these outputs, check that invariant in the service/handler or a dedicated interceptor, or use an object envelope that the schema can validate. An invalid object response causes a server error (HTTP 500 through the default exception filter); handle missing resources explicitly when the contract requires 404. Cover these boundaries in response tests. [Serialization behavior and errors](https://docs.nestjs.com/techniques/serialization).

## Routing and errors

For a global path prefix or API versioning change, configure bootstrap and route/controller metadata together. Select URI/header/media-type/custom versioning according to clients; when versioning is enabled, a route without a version or global default can return 404. Use `VERSION_NEUTRAL` for intentional unversioned routes. Check the existing and new route URLs, prefixes, default version, and OpenAPI output. [Versioning](https://docs.nestjs.com/techniques/versioning), [Global prefix](https://docs.nestjs.com/faq/global-prefix).

Return values through Nest's response pipeline. Use `@Res({ passthrough: true })` for headers/cookies while retaining it; full `@Res()` handling requires the handler to send responses. Default status is 201 for POST and 200 otherwise; set explicit codes when required. [Controllers](https://docs.nestjs.com/controllers).

Express route order matters. v12 offers optional `routeConflictPolicy: { duplicate: 'error', shadow: 'warn' }` and `routeResolutionStrategy: 'specificity'`. Fastify already ranks specificity; shadow diagnostics/sorting do not apply there. Enable deliberately and exercise static versus parameter routes. [Controllers](https://docs.nestjs.com/controllers).

Use built-in HTTP exceptions unless the contract requires custom handling. v12 supports stable client-facing codes:

```ts
throw new BadRequestException('Invalid note title', {
  errorCode: 'INVALID_NOTE_TITLE',
});
```

`cause` is internal; `errorCode` is serialized. Preserve codes in custom error filters. [Exception filters](https://docs.nestjs.com/exception-filters). For WebSocket/microservice validation, choose transport-appropriate exceptions through `exceptionFactory`. [Validation](https://docs.nestjs.com/techniques/validation).

For custom middleware/interceptors/filters or order-dependent failures, read [request-pipeline.md](request-pipeline.md).
