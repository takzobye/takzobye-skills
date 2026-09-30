# Configuration and OpenAPI

## Configuration

Current `@nestjs/config` accepts Standard Schema validation. Validate/coerce environment values during startup and inject `ConfigService` where needed:

```ts
import { ConfigModule } from '@nestjs/config';
import { z } from 'zod';

ConfigModule.forRoot({
  validationSchema: z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  }),
});
```

Choose `isGlobal`, namespaced `registerAs` configuration, and async module factories according to consumers. Use module APIs instead of repeated environment parsing. Validate real environment strings, not just typed mocks.

Joi remains supported at 18+, implementing Standard Schema. Library flags belong under `validationOptions.libraryOptions`; handle unrelated environment keys intentionally. Custom configuration factories need validation where root environment validation does not cover them. [Configuration](https://docs.nestjs.com/techniques/configuration).

## Schema-backed OpenAPI

Swagger discovers schemas attached to route input decorators. Document response contracts explicitly using the installed Swagger API. Standard Schema compatibility alone does not guarantee JSON Schema conversion.

- Schemas exposing `~standard.jsonSchema` convert natively; checked docs identify Zod 4.2+ as an example.
- Otherwise supply `standardSchemaConverter` in `SwaggerDocumentOptions`. Respect `schemaType: 'input' | 'output'`, return `{ schema, components? }`, and preserve reusable components. Returning `undefined` falls back to native conversion.
- Match `openapi-3.0` conversion to the document; inspect transforms/coercions and schemas that cannot be represented faithfully.

For class DTOs, retain Swagger decorators/plugin and the mapped-type package appropriate to Swagger or GraphQL. Check generated request/response definitions, required fields, and status codes against route behavior. Swagger declarations do not install runtime validation/serialization. [OpenAPI and Standard Schema](https://docs.nestjs.com/openapi/introduction).
