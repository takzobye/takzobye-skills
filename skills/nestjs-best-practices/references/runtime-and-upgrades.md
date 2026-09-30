# Runtime and upgrades

Verified 2026-10-01. [Framework release: 12.1.1](https://github.com/nestjs/nest/releases/tag/v12.1.1); [CLI releases](https://github.com/nestjs/nest-cli/releases). Resolve current versions again when installing.

## Runtime versus generators

[First steps](https://docs.nestjs.com/first-steps) distinguishes application runtime from CLI/schematics requirements:

| Use | Documented baseline |
| --- | --- |
| Run framework | Node 20.19+, or 22.12+ on 22.x; consult migration guide for excluded lines |
| Generate or upgrade | Node 22.22.3+, 24.15+, or 26+; 23.x and 25.x are excluded |
| Jest consuming v12 ESM packages | Node 24.9+; see migration guide |

Prefer latest active LTS satisfying the installed toolchain. Check CI and containers too.

New projects default to ESM/Vitest, support CommonJS/Jest, enable TypeScript strict mode, and use oxlint/Prettier. Express is the default adapter. Preserve deliberate alternatives.

## Upgrade scope

[Migration guide](https://docs.nestjs.com/migration-guide): core packages ship ESM; CommonJS applications consume them through `require(esm)`. Converting application code to ESM is optional. Existing lint/test tooling can stay.

Update CLI/schematics compatibly, then preview using the project's package manager:

```sh
nest upgrade --dry-run
```

Review the report and apply when upgrading is requested. It updates recognized Nest packages and mechanical migrations, including TypeScript 6 and Jest 30; review manual steps and lockfile changes. Companion versions follow compatibility, not an assumed identical version string.

Inspect lifecycle ordering after upgrades. The guide's `@Optional()` inheritance warning differs from the later 12.1.0 fix for inherited optional constructor parameters; check the installed patch and a focused DI reproduction before rewriting subclasses. [Versioned release](https://github.com/nestjs/nest/releases/tag/v12.1.0).

## ESM and builders

For ESM, follow generated configuration: runtime-resolvable `.js` relative imports in TypeScript, decorator metadata, and emitted output/test loading. Keep CommonJS import conventions for CommonJS applications. [First steps](https://docs.nestjs.com/first-steps).

Rspack is the documented default bundler for monorepos; use documented builder options when changing builds. Read actual CLI help before scripting non-interactive creation. Select Observe deliberately because scaffolding may prompt to add it. [CLI usage](https://docs.nestjs.com/cli/usages), [CLI releases](https://github.com/nestjs/nest-cli/releases).
