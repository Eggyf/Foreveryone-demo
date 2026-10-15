# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary user: a player who opens the app to grow a hero and a kingdom across
repeated sessions, checking in after time away and deciding what to do next.

The product is being built with **commercial launch intent** (confirmed
2026-10-14). The interface is therefore held to a public-product standard, not a
prototype one.

There are no real players yet. Development accounts were purged on 2026-09-25
and the application has never been exposed publicly.

## Product Purpose

An idle management RPG: create a hero by choosing a race and a class, fight
turn-based battles, found a kingdom, produce resources, build and upgrade
buildings, train troops, and buy equipment that changes the hero.

Success means a returning player can open the app, immediately see what their
hero and kingdom gained while they were away, and make the next meaningful
decision.

## Positioning

Undecided. No confirmed claim about how this differs from neighbouring idle
management RPGs has been made. Do not infer one from the feature list.

## Operating Context

- Local development runs from the repository root: `start-all.cmd` (double-click
  launcher) or `start-all.ps1`. Docker Compose runs the four PostgreSQL databases
  and the four .NET 10 APIs; Vite runs locally in its own window on port 5173.
- The player-facing language is Spanish or English, complete in both, and
  dictionary parity is enforced by the compiler rather than by convention.
- Light and dark themes are both shipped and both are treated as required.
- Each backend service owns its own PostgreSQL database. The frontend calls the
  four service APIs directly; there is no API gateway.

## Capabilities and Constraints

Confirmed capabilities: JWT registration and login by username or email; a
blocking race-and-class creation wizard; heroes across four races and four
classes; deterministic turn-based combat against nine enemies in three zones;
levels, experience, and permanent stats; resting to recover health; kingdoms with
time-based resource production capped at two hours of accumulation; building and
upgrading construction; troop training and military power; a shop whose items
modify the hero.

Confirmed constraints and unresolved risks that must not be presented as solved:

- JWTs are issued, but downstream APIs do not yet consistently validate them or
  enforce authorization.
- The internal Identity existence endpoint is not protected between services.
- The browser-supplied `userId` is not yet trusted from validated claims.
- There is no CI/CD and no comprehensive automated test suite. The frontend has
  no automated test suite at all.
- There is no production configuration; the application must not be exposed
  publicly until the above are resolved.

Open product decisions:

- **Brand name.** The confirmed brand is `ForEveryone`. The repository currently
  ships `Foreveryone` in the frontend title, meta description, and noscript copy,
  plus `readme.md`, both launcher scripts, and the Compose and Dockerfile
  comments. The backend namespaces already use `ForEveryone`. The rename is not
  yet applied anywhere; see Brand Commitments.
- **Accessibility standard.** No product-specific requirement has been
  confirmed. WCAG AA is the working assumption but is not a stated commitment.

## Brand Commitments

- The name is **ForEveryone**: one word, capital `F` and capital `E`. The
  `Foreveryone` spelling was corrected across the repo on 2026-10-14 and must not
  come back.
- **The visual world is an engineering ledger, not medieval fantasy.** This
  replaced the original medieval-gold tone on 2026-10-15 at the user's request:
  the style is World of Warcraft's, but the castle, buildings, units and upgrade
  economy are StarCraft's concepts. It is a translation of genre, not borrowed
  assets: no logo, emblem or artwork from either game, and the two franchises are
  never named to the player. See `DESIGN.md`.
- Voice: the interface speaks Spanish first with complete English parity, and
  never hardcodes prose. Every user-visible string is a translation key resolved
  against a dictionary; the backend returns keys, not sentences.
- Assets actually in hand: `ForEveryone - frontend/public/favicon.svg` and
  `ForEveryone - frontend/src/assets/hero-avatar.svg`. There is no logo lockup, no
  app icon set, and no store or promotional assets.
- **No emblem tied to militarism, supremacy, or hate movements may be used as
  decoration, motif, or badge.** This is a standing product constraint and applies
  to every visual world the app adopts.

## Evidence on Hand

- A working full-stack product: four Dockerised .NET 10 APIs behind a React SPA,
  runnable locally end to end.
- `readme.md`, the authoritative setup, architecture, endpoint, and limitations
  document; `ForEveryone - frontend/README.md`; and `memory.md`, the curated
  durable project context.
- Verified flows as of 2026-10-02: registration, hero creation, combat against all
  nine enemies, castle, shop, and the 404 route.

Absent, and therefore not to be fabricated by any future work: real players or
playtest data, analytics or telemetry, testimonials, reviews, press, pricing or
licensing decisions, marketing or store copy, and promotional screenshots or
illustrations.

## Product Principles

1. **Combat and kingdom management carry equal weight.** Neither is a secondary
   mode of the other, and the interface must not visually subordinate one to the
   other.
2. **The backend owns balance.** The client renders what the server sends — class
   kits, per-action damage and mana cost, race and class stats, shop effects — and
   hardcodes none of it.
3. **Both languages ship together, or neither.** Adding a key to one dictionary
   and not the other fails the build; a missing translation is a defect, not
   noise.
4. **A missing hero or kingdom is a first-run state, not an error.** The interface
   offers the creation action instead of showing a failure.
5. **Double actions are data corruption.** Every mutating control is disabled
   while its request is in flight, because a double click otherwise builds or
   buys twice.

## Accessibility & Inclusion

No product-specific accessibility requirement has been confirmed.

Two accessibility commitments are already established by the product itself and
must be preserved: the interface ships complete Spanish and English, and it ships
both a light and a dark theme. Neither may be dropped as optional.