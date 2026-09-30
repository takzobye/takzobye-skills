# Verification of the new implementation

Test the chosen NestJS v12 contract and intended functionality. Source tests and observed responses provide scenarios, not immutable expectations. Exact source/target equality is required only for explicitly compatible surfaces.

## Source evidence and target expectations

Read source integration tests and representative requests/responses. Record intended outcomes and observable state changes. When source code and intended behavior disagree, explain the evidence and select the target behavior; do not copy a defect automatically.

Create target tests for the new request/response contract. Mark intentional differences with before/after examples and client impact. Differential tests are useful for retained behavior, but a documented change is not a regression. Avoid normalizing broad response/status differences to make an equality test pass.

Keep the source read-only. If baseline execution creates files or effects, use an isolated copy and controlled dependencies. Source and target writes require separate/reset test data so comparisons remain meaningful. Run commands with explicit repository working directories.

## Meaningful cases

| Target surface | Verification evidence |
| --- | --- |
| Route contract | Accepted request, expected status/body/content type, chosen path/versioning. |
| Validation | Invalid/missing values, coercion, optional/null, defaults, unknown fields, nested boundaries as relevant. |
| Access | Intended public/protected coverage, absent/invalid credentials, denied permissions, authorized request. |
| Business/persistence logic | Expected state transitions, failure paths, transaction/concurrency boundaries, relevant invariants. |
| Errors and output | Chosen validation/domain/unexpected errors, serialized shape, sensitive-field exclusion. |
| Integration/consumer | Relevant cookies, CORS, raw body, files, client compilation or documented client changes. |
| Runtime/transport | Target boot/build and any changed streaming or protocol behavior. |

Choose cases for the feature's actual risks; do not assert old SQL, provider-call order, hook structure, or framework filenames. Add exact-contract comparisons only for requested compatibility and retained boundaries that need them.

## Build, boot, and finish

Run target build/typecheck, focused integration tests, and configured lint. Verify module/provider resolution and startup under the configured production runtime, then close resources. Check current official v12 documentation when APIs/tooling are uncertain. Report unavailable checks with their cause; static review alone does not establish runtime correctness.

Reconcile every in-scope feature with an implementation and verification result or named blocker. Report request/response differences, reasons, client transition work, unimplemented source features, documentation used, and how to run the target. Compare source state with the initial snapshot and confirm it remained unchanged. Clean up only obsolete target code whose callers are accounted for.

Deployment, live traffic changes, production database mutations, and third-party messages remain governed by the user's authorization. Successful local tests do not authorize those actions.
