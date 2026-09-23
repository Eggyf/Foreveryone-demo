# Project Memory

Curated, durable context for future OpenCode sessions. This file is not an automatic transcript database: `AGENTS.md` instructs agents to read it at session startup and to keep it current when durable project context changes.

Last verified: 2026-09-23

## User preferences

- Communicate in Spanish unless the user requests another language.
- Prefer direct execution over long planning when the requested outcome is clear.
- Expect a concise final report with files changed, commands run, results, and remaining problems.
- Git commits and pushes require explicit authorization for each task unless the user clearly includes them in the request.
- When push is authorized, push the current work to the current branch and report the branch and commit.

## Stable project facts

- The product is an RPG management/idle game named ForEveryone.
- The frontend is a Vite SPA in `foreveryone-frontend/`, using React, TypeScript, React Router, Axios, and plain CSS.
- The backend is a .NET 10 solution in `ForEveryone - backend/ForEveryone.slnx`.
- Backend services are Identity (port 5045), Heroes (5281), Kingdom (5256), and Shop (5136).
- Each service has its own PostgreSQL database and normally follows `Api`, `Application`, `Domain`, and `Infrastructure` layers.
- The frontend calls the service APIs directly; there is currently no API gateway.
- The authoritative setup and architecture document is `readme.md`.

## Established decisions

- Component and page styles are co-located with their React files.
- `foreveryone-frontend/src/App.css` is limited to global theme variables, global body/reset concerns, and the application root layout.
- Shared card rules live in `foreveryone-frontend/src/components/GameCard.css`; component-specific rules live in their respective CSS files.
- The shop is presented as a separate frontend route/page rather than only a hero-page modal.
- The Castle view treats the castle as its primary section and renders every additional constructed building with `BuildingCard`; construction and army training remain dedicated sections.
- The Hero view uses a profile-card layout with a local illustrated avatar, the user's derived display name, class, health, level, and combat stats.
- Authenticated page identity is decoded from the JWT into a typed `UserSession` and provided through React Router outlet context; avoid reintroducing duplicate page props.
- Because Identity currently stores only an email, the frontend derives a readable display name from the email local part until a real name claim or profile field exists.
- Project-specific OpenCode subagents exist under `.opencode/agents/`: `code-explorer`, `reviewer`, `tester`, and `documentation-writer`.

## Durable validation requirements

- Frontend: run `npm run lint` and `npm run build` from `foreveryone-frontend/`.
- Backend: run `dotnet build ForEveryone.slnx --no-restore` from `ForEveryone - backend/` after restoring when needed.
- Do not weaken or skip checks merely to hide known failures.
- Report known baseline failures separately from regressions introduced by new work.

## Known blockers and risks

### Frontend

Observed on 2026-09-23:

- `npm run build` now passes, including `tsc -b` and the Vite production bundle.
- `npm run lint` still reports seven pre-existing `no-explicit-any` and unused error-variable violations in `src/api/api.ts`, `src/components/Auth.tsx`, and `src/pages/CastlePage.tsx`.
- The repository has no automated frontend test suite.
- API URLs remain fixed in `src/api/api.ts`; frontend environment variables are not yet consumed.

### Backend and security

Documented project risks that still require verification before production use:

- Identity issues JWTs, but downstream APIs do not yet consistently validate JWTs or enforce authorization.
- The internal Identity existence endpoint is not protected between services.
- Do not trust a `userId` supplied by the browser; eventually derive it from validated claims.
- No CI/CD, containers, health checks, distributed tracing, or comprehensive automated test suite exists yet.
- Concurrency protection and global domain-error handling are incomplete.

## Recent durable work

- 2026-09-23: split the former monolithic `App.css` rules into co-located component/page stylesheets and shared `GameCard.css`.
- 2026-09-23: redesigned the Castle and Hero views, added individual building cards and a local hero profile avatar, and replaced duplicate route props with typed outlet context.
- 2026-09-23: pushed commit `f1e06cd` (`refactor: split component styles into dedicated files`) to branch `Eggyfh-dev`.

Git history is the source of truth for older changes; only add future entries here when they provide persistent context that is not already obvious from the repository.

## Maintenance rules

- Record only verified, durable decisions, preferences, blockers, and state.
- Do not store raw conversation transcripts, temporary logs, secrets, tokens, passwords, or connection strings.
- Keep this file concise enough to read at the start of every session.
- Update `Last verified` whenever the content is maintained.
- If an item is resolved or obsolete, remove or replace it instead of accumulating contradictory notes.
