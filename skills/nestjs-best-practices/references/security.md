# Security

Read this when implementing authentication/authorization or changing browser-facing security configuration. Preserve the application's identity provider and session/token strategy. Confirm the installed Nest and companion-package versions before selecting APIs; the built-in headers and CSRF APIs below require Nest v12.1+.

## Authentication and authorization

Authenticate through a Nest guard before checking permissions. For JWTs, use the configured verifier (for example `JwtService.verifyAsync()`), validate expiry and the application's issuer/audience requirements, and attach verified identity to the request. Decoding a token or accepting a user ID/role from a body/header does not authenticate it. Load signing keys/secrets from validated configuration; use password hashing when the application owns password authentication. [Authentication](https://docs.nestjs.com/security/authentication), [Encryption and hashing](https://docs.nestjs.com/security/encryption-and-hashing).

Use global authentication when most routes are protected, with explicit public-route metadata and the guard's documented override policy. Keep permission checks tied to the requested operation/resource: a role alone does not establish ownership or tenant access. Return 401 for missing/invalid credentials and 403 for an authenticated identity without permission, according to the contract. Test public routes, expired/invalid credentials, denied permissions, and access to another user's or tenant's resource. For DI registration and metadata lookup, read [modules-and-di.md](modules-and-di.md). [Authorization](https://docs.nestjs.com/security/authorization).

## CORS

Configure `app.enableCors()` for the actual frontend origins, methods, and headers. A browser client using cookies needs explicit allowed origins and `credentials: true`; wildcard origins are incompatible with credentialed browser access. Decide how requests without an `Origin` header should behave when using an origin callback. CORS controls browser access to responses; enforce authentication/authorization separately. Exercise preflight requests as well as allowed/disallowed origins and credentialed requests. [CORS](https://docs.nestjs.com/security/cors).

## Security headers

In v12.1+, `app.useSecurityHeaders()` uses Helmet 8 defaults on Express and Fastify without an extra dependency. Call it once, immediately after application creation and before middleware that may send its own responses, `app.init()`, or `app.listen()`:

```ts
// After NestFactory.create(), before app.init()/app.listen():
app.useSecurityHeaders();
```

Check Content Security Policy against Swagger UI, GraphQL IDEs, and hosted assets; use the documented directives rather than disabling all headers to fix a blocked resource. Account for HTTPS and the application's embedding/resource-sharing needs. Existing Helmet integrations can stay; choose one coherent header configuration. For earlier Nest versions, use their documented adapter-compatible Helmet setup. Check headers on success, errors, and rejected requests. [Security headers](https://docs.nestjs.com/security/helmet).

## CSRF

For browser flows with automatically attached credentials such as cookies, choose a CSRF defense that fits the clients. Nest v12.1+ provides `app.enableCsrfProtection()` using Fetch Metadata and Origin checks on Express/Fastify; it is not a token scheme. Register it once immediately after creation, before response-producing middleware, `app.init()`, or `app.listen()`:

```ts
// Example: a cookie-authenticated API with a separate trusted frontend.
app.enableCsrfProtection({
  trustedOrigins: ['https://app.example.com'],
});
```

Trusted origins are exact origins without paths/wildcards. CORS origins are not trusted automatically. Keep GET/HEAD/OPTIONS free of state changes; requests with neither Fetch Metadata nor Origin pass this check, so authentication remains necessary. Behind proxies, preserve Host or configure the public origin intentionally; `X-Forwarded-Host` is ignored. Choose a token-based defense when the documented limitations do not fit the clients. Cookie-authenticated WebSocket handshakes need their own Origin check. Test cross-origin writes (403), trusted writes, and safe methods with browser-equivalent headers. [CSRF protection and limitations](https://docs.nestjs.com/security/csrf).

CSRF rejections reach global exception filters before route guards/controller filters. Check CORS headers on rejected browser requests: CORS registered after the protection may not run.

## Rate limiting

Use a compatible `@nestjs/throttler` release when an endpoint needs throttling. Register its module and a `ThrottlerGuard` at the intended scope; module configuration alone does not enforce limits. Current `ttl`/`blockDuration` values are milliseconds; use the package's time helpers when clearer. Set tighter policies for login and expensive operations according to product requirements.

The default store is process-local memory. For a limit shared across replicas, select a compatible shared storage implementation. Behind a trusted proxy, configure the adapter's proxy handling and tracker so clients are distinguished correctly; accepting arbitrary forwarded IP headers can bypass IP-based limits. Verify the allowed burst, 429 behavior, key separation, and the chosen storage/proxy setup. [Rate limiting](https://docs.nestjs.com/security/rate-limiting).
