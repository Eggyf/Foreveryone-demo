---
version: 1
slug: "foreveryone-frontend-src-pages-castlepage-tsx"
primary_target: "ForEveryone - frontend/src/pages/CastlePage.tsx"
related_targets: []
---

# Surface brief — Castle (and the app shell it belongs to)

Scope: the whole authenticated app shell plus the Castle page as the first surface.
Visitor mode: **Operate** (the player completes a task: manage a kingdom).
Build path: **code-led** (operate surfaces build in code; no image generation in this harness).

Audience, job, action: a strategy-RPG player who opens the app to spend the
resources their kingdom accumulated. On Castle they read what is built, what is
being built, what is queued, and what it costs, then start one thing. They return
often and briefly, so density and scanability outrank expression.

Constraints that bind: Spanish and English ship complete or not at all; light and
dark are both first-class (confirmed by the user); the backend owns all balance,
so the client renders server values and hardcodes none; content and routing are
untouched by this redesign.

## Direction contract

**THESIS.** The game is a guild's engineering ledger: every panel is a cell on a
visible construction grid, and the fantasy lives in the data channel rather than
in ornament. It refuses the same-size-cards-of-icon-plus-heading page structure and
the beveled, glowing fantasy panel that a category-plus-word prompt ships for.

**OWN-WORLD.** Paper in light (`#f2eee3`), soot in dark (`#14151a`), both carrying a
visible construction grid of 8px cells (`--cell`) with a heavier column rule every
64px (`--grid-size`). Ink is near-black on paper and warm-white on soot. One accent
plane, gold, earned by the active cell and the primary action. The fantasy arrives
as a **quality ramp** borrowed from loot: common, uncommon, rare, epic, legendary,
used only where it means rarity of a thing. Depth is
**engraved bevel, never blurred glow**: a panel is one hairline rule plus an inset
top highlight and an inset bottom shade. Radii stay at 4px so panels read as
plate, not pill.

**STORY.** The player reads a ledger of their house's holdings. Castle shows the
roster of structures, what each costs, and one active build; the queue is a
register with a position, not an animation.

**FIRST VIEWPORT.** Castle at 1440 wide. A single row of grid cells at the top is
the nav, each a cell, the active one filled gold. Below it one wide focal plate
carries the kingdom's holdings as a register table — this is the one element in
the viewport with the strongest plate treatment, and everything else is quieter.
The primary action, starting a build, sits at the right end of that register's
header row, in the accent plane. Nothing in the viewport floats free of the grid.

**FORM.** Chosen from the rolled hand: challenger `crouwel-grid-specimen`, which
won the user's choice over the assigned grounded direction (index 4, the engraved
brass ledger). The challenger supplies the form and the system grammar; the
product supplies every fact. `seed: f4c3d261`.

**SIGNATURE INTERACTION.** The grid is a real state, not a texture. A control
lights the exact cell it occupies on hover and keyboard focus, so the armature is
visible under the hand, and a toggle in the settings bar switches the construction
grid off for players who want it out of the way. The toggle persists.

**FINISH.** unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Built state (recorded at finish, 2026-10-15)

Built code-led and validated: `npm run lint` and `npm run build` pass in
`ForEveryone - frontend/`; `impeccable detect` on `src` returns zero findings.

What shipped: the token system rewritten in `App.css` around `--cell`,
`--grid-size` and `--grid-hair`; the construction grid drawn as a fixed plane on
the body and toggled off by `.grid-off` on `<html>`; bevel elevation
(`--bevel-hi`/`--bevel-lo`/`--plate`) replacing blurred glow; Archivo for display
(using its width axis) and Barlow for data; `Icon.tsx` replacing every emoji with
40 drawn glyphs at one stroke weight; buttons rebuilt as grid cells; nav rebuilt
as a row of cells with an inset accent on the active one; gauges rebuilt as
engraved scales with a hairline and a straight fill.

Contrast: every text token, all five quality tiers, and `--on-gold` verified
at or above 4.5:1 against the worst of the three planes in both themes.

## Unresolved

- The quality ramp needs a mapping from the server's item values to the five
  tiers; until the backend exposes an explicit rarity, tier is derived in the
  client and that derivation must not invent data it does not have. The five
  tokens are declared and contrast-verified but no screen consumes them yet.
- The design detector has never been run with a browser attached in this
  session, so the layout claims above are from the code, not from a render. The
  grid plane, the bevel and the cell snapping in particular want one look in a
  real browser in both themes before the run is called finished.
