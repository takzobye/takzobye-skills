---
name: elysia-to-nestjs
description: Rebuild ElysiaJS features in a separate NestJS v12 repository within one Project, using source requests/responses as reference and current official NestJS v12 docs. Use for cross-repository migration planning, implementation, or review with freedom to redesign internals and API contracts for NestJS conventions.
---

# ElysiaJS to NestJS v12

Use ElysiaJS requests and responses to understand the intended functionality, then implement it anew in the separate NestJS v12 repository. Favor idiomatic NestJS design over reproducing the old process. The two repositories share a Project, not a Git history or necessarily a folder root.

The default is an idiomatic rewrite: business logic, database queries, algorithms, hook sequences, and internal structure may be redesigned. Input and output contracts may also change to fit documented NestJS conventions. This freedom is already authorized; do not ask for approval for every such change. Make concrete design choices, document their reason and client impact, and test the chosen target behavior. Exact compatibility is a special mode only when the user explicitly requests it for a surface.

## Establish the migration boundary

Identify and record the absolute paths of the Elysia source and NestJS target repositories before editing. Inspect each repository's applicable instructions, Git status, manifests, and lockfiles independently. If paths are ambiguous, request the missing identity before writing. Keep the Elysia repository read-only unless the user explicitly authorizes a source change. Run mutation, install, generator, build, and test commands with an explicit working directory; source baseline execution needs an isolated copy when it could create files or side effects.

Inspect source routes, input/output schemas, observed responses, tests, and consumers first. Read source services, hooks, and queries only as needed to understand observable behavior, side effects, and unclear cases. Source implementation quality is unproven; its process is evidence, not a specification to copy. Independently inspect target modules, build/runtime setup, validation conventions, and tests. Preserve target work already present.

Respect the requested mode: a plan produces an actionable plan, implementation writes the requested features in the target, and review reports evidenced defects. When repositories are unavailable, request their paths or relevant source. Redesign implementation within the requested feature scope, including business logic and database queries. Actual production database/schema mutations and deployment require their own authorization.

## Use current NestJS v12 documentation

Treat the latest official website at [docs.nestjs.com](https://docs.nestjs.com/) as the Nest implementation authority. Browse the relevant current chapters before selecting APIs or tooling; use the [v12 migration guide](https://docs.nestjs.com/migration-guide) to confirm version context. Use the unversioned current v12 pages, not archived v10/v11 pages or remembered older templates. If the website later defaults to a newer major, select official v12 documentation instead of changing the target major.

Record relevant official links and access date in the plan or target migration notes. Read installed package declarations/source to confirm compatibility with the target's exact v12 release. If documentation and installed packages differ, explain and resolve that mismatch while keeping v12; never silently downgrade or invent an API. When live documentation is unavailable, state the limitation and keep API-dependent decisions unverified.

Keep target package manager, runtime, adapter, module format, and test tooling unless the rewrite needs a documented change. Use v12-compatible package versions; check companion-package compatibility individually. Choose current v12 schema-first facilities or class-based DTOs according to the target design and documented tradeoffs.

## Record source behavior and target ownership

Create a compact migration inventory in target documentation or work notes. For each in-scope route or transport, capture:

- Method and effective path after groups, prefixes, versioning, and plugin registration.
- Source request examples, accepted inputs, authentication, and observable side effects.
- Success and failure status, response shape, content type, headers, and cookies.
- Proposed target request/response contract, intentional differences and client impact.
- Source evidence, target module/controller/service, verification case, and uncertainty.

Include dynamically registered routes and plugin-provided endpoints. Trace hook coverage only where needed to explain auth, validation, response shaping, or other observable behavior. Distinguish intended functionality from demonstrated source bugs; choose and explain the target behavior instead of preserving a defect by default.

## Implement anew in the NestJS repository

Read [references/behavior-mapping.md](references/behavior-mapping.md) when designing target contracts, validation, auth, context, or responses. It distinguishes NestJS conventions from optional compatibility work.

Build modules around target feature boundaries, with controllers for transport, services for application/business logic, and suitable injectable persistence/integration providers. Rework queries, transactions, algorithms, and error handling when it improves the target implementation. Reuse source code only when its quality and suitability justify it. Register provider imports/exports, establish initialization/teardown, and keep request data out of singleton state.

Use a feature or route family as a working slice: decide the target contract, implement providers/controllers and validation/auth/errors, then verify. Integrate with existing target bootstrap/configuration. Do not reinitialize the Nest repository or upgrade the Elysia repository in place. Prepare coexistence or traffic routing only when requested.

Read [references/runtime-and-consumers.md](references/runtime-and-consumers.md) when the application uses Bun-specific APIs, platform plugins, deployment integrations, Eden clients, or non-JSON transports. Resolve observed dependencies; ordinary migrations do not require adding unused transport infrastructure.

Record retained behavior and deliberate changes explicitly. Nest defaults may be appropriate target choices, including request validation, error format, serialization, and status codes; they are not evidence of source compatibility. Explain what changes for callers. Keep intended access controls and feature outcomes in view without requiring the original auth or validation sequence.

## Verify and finish

Read [references/verification.md](references/verification.md) when implementing or reviewing a migration. Build/typecheck and application boot must succeed under the chosen runtime, and each migrated route needs evidence for its relevant success and failure contracts.

Leave source entrypoints, dependencies, lockfiles, and clients intact. Remove obsolete code only inside the target when callers are accounted for. Test target contracts; reuse source test scenarios as functional evidence and update expectations for intentional changes. Keep client changes in other repositories within explicitly requested scope and report outside-scope transition work.

Finish with repository identities, implemented scope, target v12 runtime/adapter, official docs used, request/response changes and client impact, verification, and blockers. Claim completion only for covered scope; distinguish target correctness from compatibility evidence and verify the source remained unchanged.
