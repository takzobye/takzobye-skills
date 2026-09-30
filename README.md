# takzobye-skills

Agent skills for NestJS development, ElysiaJS-to-NestJS migrations, and Drizzle v1 PostgreSQL implementation.

## Layout

Skills live under `skills/`, with one directory per skill:

```text
skills/
├── nestjs-best-practices/
│   ├── SKILL.md
│   └── references/
├── elysia-to-nestjs/
│   ├── SKILL.md
│   └── references/
└── drizzle-best-practices/
    ├── SKILL.md
    └── references/
```

Each skill contains a `SKILL.md` with YAML frontmatter (`name` and `description`) and bundled reference files. The main file defines the workflow; references provide details for specific tasks.

## Install

### With `npx skills`

```bash
npx skills add takzobye/takzobye-skills
```

### Alternative — Local symlinks for Claude Code

Clone the repository, then run these commands from its root:

```bash
mkdir -p ~/.claude/skills
ln -s "$PWD/skills/nestjs-best-practices" ~/.claude/skills/nestjs-best-practices
ln -s "$PWD/skills/elysia-to-nestjs" ~/.claude/skills/elysia-to-nestjs
ln -s "$PWD/skills/drizzle-best-practices" ~/.claude/skills/drizzle-best-practices
```

Symlinks let local edits take effect without reinstalling the skills.

List every `SKILL.md` in the repository:

```bash
find skills -name SKILL.md -type f | sort
```

## Reference

### Engineering

- **[drizzle-best-practices](./skills/drizzle-best-practices/SKILL.md)** — Implement PostgreSQL data layers end to end with Drizzle ORM v1 RC: schema, relations, migrations, reads, mutations, transactions, validation, advanced PostgreSQL features, testing, and operations. Includes connected TypeScript examples checked against RC4 and the verified RC5 snapshot.
- **[nestjs-best-practices](./skills/nestjs-best-practices/SKILL.md)** — Build, change, or review NestJS v12 applications using official documentation for modules, dependency injection, HTTP contracts, validation, configuration, testing, and v11-to-v12 upgrades. Starts by inspecting the project's installed versions and conventions, then loads references relevant to the task.
- **[elysia-to-nestjs](./skills/elysia-to-nestjs/SKILL.md)** — Rebuild ElysiaJS features in a separate NestJS v12 repository. Uses source requests and responses to understand functionality, supports redesigning internals and API contracts around NestJS conventions, and records intentional changes and client impact. Keeps the source repository read-only by default and verifies the chosen target behavior.
