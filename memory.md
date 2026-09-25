# Project Memory

Curated, durable context for future OpenCode sessions. This file is not an automatic transcript database: `AGENTS.md` instructs agents to read it at session startup and to keep it current when durable project context changes.

Last verified: 2026-09-25

## User preferences

- Communicate in Spanish unless the user requests another language.
- Prefer direct execution over long planning when the requested outcome is clear.
- Expect a concise final report with files changed, commands run, results, and remaining problems.
- Git commits and pushes require explicit authorization for each task unless the user clearly includes them in the request.
- When push is authorized, push the current work to the current branch and report the branch and commit.

## Stable project facts

- The product is an RPG management/idle game. The user-facing name is `Foreveryone` (set in `App.tsx` and `index.html`); the backend namespaces and issuer still use `ForEveryone`.
- The frontend is a Vite SPA in `foreveryone-frontend/`, using React, TypeScript, React Router, Axios, and plain CSS.
- The backend is a .NET 10 solution in `ForEveryone - backend/ForEveryone.slnx`.
- Backend services are Identity (port 5045), Heroes (5281), Kingdom (5256), and Shop (5136).
- Each service has its own PostgreSQL database and normally follows `Api`, `Application`, `Domain`, and `Infrastructure` layers.
- The frontend calls the service APIs directly; there is currently no API gateway.
- The authoritative setup and architecture document is `readme.md`.

## Established decisions

- Component and page styles are co-located with their React files.
- The visual system lives as design tokens in `App.css`: gold accents on near-black stone, translucent surfaces, soft shadows, and a `Cinzel` display face for headings with `Inter` for body text. Keep the medieval tone through the gold palette and serif headings, not through heavy borders and inset shadows.
- `foreveryone-frontend/src/App.css` holds the design tokens, the body reset, and the application root layout.
- Shared card rules live in `foreveryone-frontend/src/components/GameCard.css`; component-specific rules live in their respective CSS files.
- `foreveryone-frontend/src/index.css` must stay minimal. It once carried the Vite starter template, which redefined `--border` and fixed `#root` to a 1126px width, fighting the theme in `App.css`.
- Stale API binaries are a recurring source of confusion locally: `dotnet run --no-build` serves whatever was last built, so a fix can appear not to work until the service is rebuilt and restarted.
- CORS origins are configured per API in `Cors:AllowedOrigins` in each `appsettings.json`, defaulting to `localhost` and `127.0.0.1` on ports 5173 and 5174. Vite is pinned to 5173 with `strictPort` in `vite.config.ts`, so a busy port produces a warning instead of silently moving to 5174 and breaking CORS.
- The shop is presented as a separate frontend route/page rather than only a hero-page modal.
- The Castle view treats the castle as its primary section and renders every additional constructed building with `BuildingCard`; construction and army training remain dedicated sections.
- The Hero view uses a profile-card layout with a local illustrated avatar, the user's derived display name, class, health, level, and combat stats.
- Authenticated page identity is decoded from the JWT into a typed `UserSession` and provided through React Router outlet context; avoid reintroducing duplicate page props.
- Identity stores a `Username` next to the email. `Username` is a `ValueObject` in the domain with a 3-24 character rule set (alphanumerics plus `.`, `_`, `-`, must start and end alphanumeric) and is always normalized to lowercase; the column has a unique index.
- Login accepts a single `identifier`: values containing `@` are looked up as email, everything else as username. Invalid formats return `null` instead of a specific error so login does not reveal which field failed.
- The JWT carries the standard OIDC `preferred_username` claim. `JwtRegisteredClaimNames` has no `PreferredUserName` member, so the literal is declared as `JwtTokenGenerator.PreferredUserNameClaim`.
- Because Identity provides a real username claim, the frontend derives the display name from `preferred_username` and falls back to the email local part only for tokens issued before this change.
- Backend and frontend share the username rules; keep `Username.MinLength`/`MaxLength` and the `UserConfiguration` column length plus both `RegisterUserCommandValidator` and `Username` validation in sync when the rules change.
- Heroes owns character creation: a `Hero` has a `Race` and a `HeroClass`. The two balance tables live only in the domain, `ClassBonus.For(heroClass)` and `RaceBonus.For(race)`; the race percentage is applied once inside the `Hero` constructor so no hero can exist without it.
- Races are Humano, Elfo, Enano, Orco. Classes are Warrior, Hunter, Wizard, Rogue; Mage became Wizard, Archer became Hunter, and Priest was removed with no successor.
- `GET /api/heroes/options` is the single source of truth for the creation wizard; the frontend never hardcodes stats.
- The frontend `GameGate` blocks the game until a hero exists, querying only `GET /api/heroes/{userId}` on Heroes. `404` means "no hero yet" and routes to `CharacterCreation`. Do not add a second Identity call to `GameGate`: it made login depend on two services, and any transient failure there blocked the game with a misleading "session invalid" message right after logging in.
- A stale token is detected where it actually matters: `POST /api/heroes` returns `404` with "El usuario no existe en el sistema de Identity", and `CharacterCreation` shows a logout button instead of a generic error.
- Heroes registers FluentValidation validators but had no `ValidationBehavior`, so they never ran and invalid input produced a `500` with a stack trace. A behavior was added on 2026-09-25; any new service needs the same pipeline registration.
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
- `npm run lint` reports six pre-existing `no-explicit-any` and unused error-variable violations in `src/api/api.ts` and `src/pages/CastlePage.tsx`. `src/components/Auth.tsx` was cleaned up on 2026-09-25.
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
- 2026-09-25: added `Username` to Identity, made login accept email or username, and added the username field to the registration form. Migration `AddUsernameToUsers` backfills existing rows from the email local part, falling back to `user_<id prefix>` when the candidate is invalid or taken; it was applied to the local dev database and the five pre-existing accounts kept their local part as username.
- 2026-09-25: purged all dev users and their heroes and kingdoms at the user's request, keeping the `ShopItems` catalog. Added races and classes, plus a blocking character-creation wizard. Migration `AddRaceAndRebalanceClasses` renames Mage to Wizard, Archer to Hunter, and deletes rows still holding the removed Priest class.
- 2026-09-25: made CORS origins configurable per API (`Cors:AllowedOrigins`), pinned Vite to port 5173 with `strictPort`, and simplified `GameGate` to query only Heroes so login no longer depends on two services.
- 2026-09-25: renamed the user-facing game to `Foreveryone` and replaced "Eldoria" everywhere; rebuilt the visual system as design tokens in `App.css`.
- 2026-09-25: verified the full flow in a real browser (register, login by username, race and class creation, hero page, shop). Fixed a 4-column grid in the creation wizard that left the last class card stranded on its own row.
- 2026-09-23: pushed commit `f1e06cd` (`refactor: split component styles into dedicated files`) to branch `Eggyfh-dev`.

Git history is the source of truth for older changes; only add future entries here when they provide persistent context that is not already obvious from the repository.

## Maintenance rules

- Record only verified, durable decisions, preferences, blockers, and state.
- Do not store raw conversation transcripts, temporary logs, secrets, tokens, passwords, or connection strings.
- Keep this file concise enough to read at the start of every session.
- Update `Last verified` whenever the content is maintained.
- If an item is resolved or obsolete, remove or replace it instead of accumulating contradictory notes.
