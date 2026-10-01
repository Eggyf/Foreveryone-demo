# Project Memory

Curated, durable context for future OpenCode sessions. This file is not an automatic transcript database: `AGENTS.md` instructs agents to read it at session startup and to keep it current when durable project context changes.

Last verified: 2026-10-01

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
- Local PostgreSQL was replaced by Docker on 2026-10-01: `docker-compose.yml` at the repo root runs the four databases and the four APIs. The frontend stays local on Vite.
- The frontend calls the service APIs directly; there is currently no API gateway.
- The authoritative setup and architecture document is `readme.md`.

## Established decisions

- **Docker owns PostgreSQL and the backend APIs; the frontend stays local.** `docker-compose.yml` runs four `postgres:17-alpine` containers, one per service (`identity-db` 5432, `heroes-db` 5433, `kingdom-db` 5434, `shop-db` 5435), each with its own named volume, so the per-service data isolation is preserved. Four API containers publish the original ports, so `foreveryone-frontend/.env` needs no change.
- All four APIs share one parameterized `ForEveryone - backend/docker/Dockerfile`, selecting the project via the `PROJECT` build arg and the entry assembly via `APP_DLL` from compose. One Dockerfile instead of four that drift apart.
- Credentials live in a root `.env`, ignored by an anchored `/.env` rule. Anchoring matters: a bare `.env` pattern would also match the tracked `foreveryone-frontend/.env`. Compose uses `:?` guards on every secret so it refuses to start rather than creating databases with a shared default password.
- `ASPNETCORE_ENVIRONMENT=Development` is set on all four API containers, and is not optional: the services only run `Database.Migrate()` in Development, so without it they start against an empty schema.
- **MediatR is pinned to 14.2.0 in all four services and in `SharedKernel`.** It was inconsistent (12.4.1 in `Identity.Application` and `SharedKernel`, 14.2.0 elsewhere) and that broke Identity only when compiled in Release: a clean restore resolves the highest version in the graph and overwrites the 12.4.1 that Identity compiled against, so it died with `TypeLoadException` on `ServiceCollectionExtensions`, a type MediatR 14 moved. It went unnoticed because Debug builds had a pinned local resolution. Symptom to recognize: Identity restarting with exit 139 while the other three start fine.
- **Shop listens on 4136, not 5136.** Windows reserves `5071-5170` on this machine (`netsh interface ipv4 show excludedportrange protocol=tcp`), and neither Docker nor ASP.NET can use an excluded port. `foreveryone-frontend/.env` points at `http://localhost:4136` to match. To go back to 5136, free that range and change both files.
- Every API waits on `service_healthy` before starting, using `pg_isready`, because migration at startup otherwise races PostgreSQL initialization.
- Compose injects `IdentityServiceUrl`/`ShopServiceUrl` as service names (`http://identity-api:5045/`). Inside a container `localhost` would be the API itself. These are not optional: the code reads them with `!`, which only silences the compiler, so a missing value throws `ArgumentNullException` from `new Uri(null)` at startup.
- `start-all.ps1` no longer builds or launches the APIs; it validates Docker and the `.env`, runs `docker compose up -d` (with `-Rebuild` to force a rebuild), waits for the API ports, and opens only the frontend. It kept the port-owner diagnostics.
- Component and page styles are co-located with their React files.
- The visual system lives as design tokens in `App.css`: gold accents on near-black stone, translucent surfaces, soft shadows, and a `Cinzel` display face for headings with `Inter` for body text. Keep the medieval tone through the gold palette and serif headings, not through heavy borders and inset shadows.
- `foreveryone-frontend/src/App.css` holds the design tokens, the body reset, and the application root layout.
- Shared card rules live in `foreveryone-frontend/src/components/GameCard.css`; component-specific rules live in their respective CSS files.
- `foreveryone-frontend/src/index.css` must stay minimal. It once carried the Vite starter template, which redefined `--border` and fixed `#root` to a 1126px width, fighting the theme in `App.css`.
- TypeScript `strict` is enabled in both `tsconfig.app.json` and `tsconfig.node.json`. It was off originally; enabling it produced zero new errors, so keep it on to stop the drift coming back.
- API base URLs come from `VITE_IDENTITY_URL`, `VITE_HEROES_URL`, `VITE_KINGDOM_URL` and `VITE_SHOP_URL` in `foreveryone-frontend/.env`, read through `import.meta.env` in `src/api/api.ts` and typed in `src/vite-env.d.ts`. Missing variables fall back to the local ports, so `.env` is optional.
- The four services do not share one error body: Identity returns `ProblemDetails` (`detail` Spanish text, `title` = error code), while Heroes, Kingdom and Shop return `{ "message": ... }`. A bare `NotFound()` gets rewritten by ASP.NET Core into a generic `ProblemDetails` with no `message` and no `detail`, so "no hero yet" and "no kingdom yet" must be detected by status code, never by body. `src/api/errors.ts` is the single place that normalizes all of it, suppresses 500 `text/plain` stack traces, and never shows a raw HTTP reason phrase. Do not add per-component `error.response.data.message` reads.
- `localStorage` holds the token under the key `token`. `src/auth/token.ts` is the only accessor; `App.tsx` is the only writer and the Axios interceptor only reads. A token that cannot be decoded, or whose `exp` has passed, is discarded at startup and treated as logged out.
- Client-side presentation data (icons, Spanish labels, descriptions) lives apart from the backend contract: `src/components/buildings.ts` holds the buildable-building catalog, and race/class/enemy names are requested from the API. Do not merge these into component files; `react-refresh/only-export-components` forbids exporting constants from a file that also exports a component.
- `src/components/Message.tsx` is the shared inline notice with a tone (`error`/`success`/`info`/`neutral`) and the matching ARIA role. It replaced a single red-only `.message` rule that was being reused in green for confirmations and in red for successes. New pages should use it instead of a raw `<p className="message">`.
- Castle and Shop are the only screens that ever had a "not found yet" state distinct from a real failure, and both now branch on 404 to offer the creation action instead of an error. Castle and Shop both re-read after a mutation, and every mutating control is disabled while a request is in flight, because a double click otherwise built or bought twice.
- Cantera (`BuildingType.Quarry`, 4) and Mercado (`BuildingType.Market`, 5) existed in the Kingdom domain and had costs, but the build menu only offered Granja, Aserradero and Cuartel, so they could not be built from the UI. The build menu is now generated from the shared catalog and disables a type once built.
- `App` is wrapped in `ErrorBoundary` and the authenticated routes include a `*` route rendering `NotFoundPage`. Before this, a render crash left a blank page and an unknown URL rendered nothing.
- The frontend `README.md` documents the real project (commands, env vars, structure, error-handling rules); it used to be the untouched Vite template.
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
- Turn-based combat lives in Heroes, not in a separate microservice: it is pure domain logic over stats Heroes already owns. Enemies are static data in `EnemyCatalog` (Goblin, Wolf, Ogre), exposed via `GET /api/heroes/enemies` so the client never duplicates the balance.
- Each class has its own three-slot combat kit, and `ClassAbilities` in the domain is the only source of that balance, exactly as `ClassBonus` is for base stats. `BattleAction` holds *slots* (`Attack`, `PowerStrike`, `Special`), not abilities: the same slot means "this class's signature move" and the player-visible name comes from the catalog. The enum values were never renamed because `Battle.ActionsCsv` persists them as text. `AbilityEffect` adds behaviour beyond damage (`Pierce`, `Guard`, `Heal`, `Drain`).
- Mana is a percentage of the max stat, not an absolute cost, because the pools differ wildly (Warrior 10, Wizard 50): an absolute cost would make the Warrior's ability unusable and the Wizard's free. It regenerates 20% of the max at the start of each turn, before paying, and the free basic attack means the pool never jams at zero.
- `BattleEngine.Unavailability(action, class, stats, mana, played)` returns the reason a slot is blocked as text, so the client renders the exact cause instead of guessing, and a slot outside the class kit is rejected as an invalid request. The response carries a full `actions` array (name, description, damage against that enemy, mana cost, uses left, limit, blocked reason), so the frontend hardcodes no balance.
- Support abilities (`Guard`, `Heal`) deal no damage, so they cannot finish the enemy: on those turns the enemy does not counterattack, which is why healing happens before the counterattack instead of instead of it.
- Battle state is never stored turn by turn. Because combat is deterministic, the action sequence IS the state: the `Battles` table holds only the id, hero, enemy, the action sequence as a CSV column (`Battle.ActionsCsv`, internal, mapped via `InternalsVisibleTo` from Heroes.Domain to Infrastructure), the starting hero health and mana, and the final status. `BattleEngine.Replay(class, stats, healthAtStart, manaAtStart, enemy, actions)` is therefore a pure function. Hero damage is committed per turn, not at battle end, so abandoning a fight still costs health. One open battle per hero. Unknown entries in the CSV are skipped instead of throwing, so a corrupt row cannot make the fight unreadable. Migration `AddManaToBattles` added `HeroManaAtStart` and widened `Actions` from 64 to 512 characters, because three slots make the sequence longer.
- `start-all.ps1` builds the solution once, then launches each API with `dotnet <dll> --urls http://localhost:<port>` plus `ASPNETCORE_ENVIRONMENT=Development` (replicating the `http` launch profile), and the frontend with `npm run dev`. It waits for each port, and if a port is already occupied it reports the owning process with its PID and reuses it instead of waiting. Launching via `.dll` rather than `dotnet run` is deliberate: `dotnet run` executes the generated `.exe` and fails when another process locks it. The legacy `POST /api/heroes/{id}/adventure` route still exists and delegates to `BattleEngine` with the goblin.
- On 2026-09-26 an unsigned, randomly named executable appeared in `%TEMP%` (`heyzhcpi.exe`, SHA256 `6F5AEB2A18F7A3B5956F8711BC388839044803DA50CC5D13EC38370A4BCF4AD2`) and held a lock on a freshly built API `.exe`. Defender reported no threats on it. It was never executed and not deleted; the user was told to check the hash on VirusTotal. Treat any reappearance as a security concern rather than a build problem.

## Durable validation requirements

- Frontend: run `npm run lint` and `npm run build` from `foreveryone-frontend/`.
- Backend: run `dotnet build ForEveryone.slnx --no-restore` from `ForEveryone - backend/` after restoring when needed.
- Do not weaken or skip checks merely to hide known failures.
- Report known baseline failures separately from regressions introduced by new work.

## Known blockers and risks

### Frontend

Verified on 2026-09-27:

- `npm run lint` passes with zero errors. The six pre-existing `no-explicit-any` and unused-error-variable violations in `src/api/api.ts` and `src/pages/CastlePage.tsx` were fixed by typing the Axios interceptor and moving error handling to `src/api/errors.ts`.
- `npm run build` passes, including `tsc -b` under `strict` and the Vite production bundle.
- The repository still has no automated frontend test suite. `resolveStats`, `getErrorMessage`, `formatDisplayName` and `isTokenExpired` are pure and would be the natural first tests, but that needs new dev dependencies (vitest and friends), which was not done.
- The full flow was verified in a real browser against the four live APIs: register, login, character creation, battle, castle, shop, and the 404 route.

### Backend and security

Documented project risks that still require verification before production use:

- Identity issues JWTs, but downstream APIs do not yet consistently validate JWTs or enforce authorization.
- The internal Identity existence endpoint is not protected between services.
- Do not trust a `userId` supplied by the browser; eventually derive it from validated claims.
- No CI/CD, distributed tracing, or comprehensive automated test suite exists yet. Containers landed on 2026-10-01 (PostgreSQL plus the four APIs), but the API containers still have no healthcheck endpoint, only the databases have `pg_isready` checks.
- Concurrency protection and global domain-error handling are incomplete.

## Recent durable work

- 2026-09-23: split the former monolithic `App.css` rules into co-located component/page stylesheets and shared `GameCard.css`.
- 2026-09-23: redesigned the Castle and Hero views, added individual building cards and a local hero profile avatar, and replaced duplicate route props with typed outlet context.
- 2026-09-25: added `Username` to Identity, made login accept email or username, and added the username field to the registration form. Migration `AddUsernameToUsers` backfills existing rows from the email local part, falling back to `user_<id prefix>` when the candidate is invalid or taken; it was applied to the local dev database and the five pre-existing accounts kept their local part as username.
- 2026-09-25: purged all dev users and their heroes and kingdoms at the user's request, keeping the `ShopItems` catalog. Added races and classes, plus a blocking character-creation wizard. Migration `AddRaceAndRebalanceClasses` renames Mage to Wizard, Archer to Hunter, and deletes rows still holding the removed Priest class.
- 2026-09-25: made CORS origins configurable per API (`Cors:AllowedOrigins`), pinned Vite to port 5173 with `strictPort`, and simplified `GameGate` to query only Heroes so login no longer depends on two services.
- 2026-09-25: renamed the user-facing game to `Foreveryone` and replaced "Eldoria" everywhere; rebuilt the visual system as design tokens in `App.css`.
- 2026-09-25: verified the full flow in a real browser (register, login by username, race and class creation, hero page, shop). Fixed a 4-column grid in the creation wizard that left the last class card stranded on its own row.
- 2026-09-26: added turn-based battles against three enemies (Goblin, Wolf, Ogre) with a `BattlePanel` on the hero page, and rewrote `start-all.ps1` to launch every service and the frontend with port waits.
- 2026-09-27: turned the automatic battle into real turn-based play. The player now chooses an action every turn; the battle is persisted in a new `Battles` table and replayed deterministically from the action sequence. Added `Battle`, `BattleAction`, `BattleStatus`, `BattleError`, `BattleStateBuilder`, and the `StartBattle`, `PlayBattleTurn` and `GetCurrentBattle` endpoints, plus a rewritten interactive `BattlePanel`.
- 2026-09-27: full frontend review and improvement pass. Enabled TypeScript `strict` (zero new errors), wired the API URLs to `VITE_*` env variables, extracted `src/api/errors.ts` to normalize the four different error body shapes, added `ErrorBoundary` and a 404 route, added a toned `Message` component, gave Castle and Shop real loading/error/404 states plus submit guards, unified the building catalog so Cantera and Mercado are buildable, switched the login/register toggle to real tab semantics, added a global focus ring, fixed the green-styled error messages, and replaced the Vite template README.
- 2026-09-27: class combat kits and mana. Replaced the two fixed actions with a three-slot kit per class in `ClassAbilities` (basic, signature, exclusive), added `AbilityEffect` (Pierce/Guard/Heal/Drain), mana as a per-turn regenerating resource with percentage costs, `Special` as the third slot, migration `AddManaToBattles`, and a `BattlePanel` that renders the mana bar, the real per-slot name/description/damage/cost and the server's blocked reason.
- 2026-10-01: unified MediatR to 14.2.0 across all services and `SharedKernel`, fixing a `TypeLoadException` in Identity that only appeared on a clean Release restore, and moved Shop to port 4136 because Windows reserves 5071-5170.
- 2026-10-01: replaced the local PostgreSQL setup with Docker. Added `docker-compose.yml` (four databases + four APIs), the shared `docker/Dockerfile`, `.dockerignore`, `.env.example`, an anchored `/.env` ignore, a Docker-based `start-all.ps1`, and rewrote the `readme.md` setup and troubleshooting sections. The previous User Secrets instructions now apply only to running the APIs outside Docker.
- 2026-09-23: pushed commit `f1e06cd` (`refactor: split component styles into dedicated files`) to branch `Eggyfh-dev`.

Git history is the source of truth for older changes; only add future entries here when they provide persistent context that is not already obvious from the repository.

## Maintenance rules

- Record only verified, durable decisions, preferences, blockers, and state.
- Do not store raw conversation transcripts, temporary logs, secrets, tokens, passwords, or connection strings.
- Keep this file concise enough to read at the start of every session.
- Update `Last verified` whenever the content is maintained.
- If an item is resolved or obsolete, remove or replace it instead of accumulating contradictory notes.
