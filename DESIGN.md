# Design system

<!-- impeccable:design-schema 1 -->

Generated from the built code on 2026-10-15. This file describes what shipped,
not what was planned. Tokens live in `ForEveryone - frontend/src/App.css`.

## World

The game is a guild's engineering ledger. Every panel is a cell on a visible
construction grid, and the fantasy arrives through the data channel rather than
through ornament. Depth is engraved bevel, never blurred glow.

## Grid

The load-bearing unit. `--cell: 8px` is the rhythm; `--grid-size: 64px` is eight
cells and the spacing of the heavier column rule. Panels and rows are laid out on
the cell, and the grid is drawn on the body as a fixed plane.

The grid is a real state, not a texture: `html.grid-off` removes it, and the
settings bar toggles it. `applyInitialGrid()` runs in `main.tsx` before React
mounts, so a player who has chosen to hide it never sees it flash.

## Palette

Committed shell palette, one accent. Dark is soot, light is paper. Both carry the
same construction grid, so neither is the degraded version of the other.

| Role | Dark | Light |
| --- | --- | --- |
| Page | `#14151a` | `#f2eee3` |
| Plate | `#1c1e25` | `#fbf9f3` |
| Well | `#0e0f13` | `#e7e1d2` |
| Ink | `#eceae4` | `#1a1915` |
| Muted ink | `#9b9da4` | `#4c4a42` |
| Faint ink | `#83868e` | `#625f58` |
| Accent (gold) | `#c9a227` | `#755b19` |

Gold is the only accent plane, and it is spent on exactly two things: the active
cell and the primary action. Semantic colours carry resource state only
(`--health`, `--mana`, `--success`, `--danger`, `--info`).

The quality ramp (`--q-common` through `--q-legendary`) is declared and
contrast-verified but not yet consumed: the backend exposes no rarity per item.

## Elevation

A panel declares its elevation once, as `--plate`: `--bevel-hi` (a one-pixel
inset top light) plus `--bevel-lo` (a one-pixel inset bottom shade) plus
`--shadow-sm`. Never a coloured halo and never a border under a wide soft shadow.

Well elements invert this: inputs and gauges use `--bevel-lo` alone over
`--bg-deep`, which reads as a hole rather than a raised plate.

## Type

Archivo for display, Barlow for body and data. Archivo is chosen because it is
drawn on a grid and ships a width axis, so a monumental heading is the same
letterforms stretched rather than a second face. Barlow is a plain workhorse
grotesk whose figures are tabular, which is what the stat grids and the gauge
readings need.

The scale is weight and width, not size alone: headings take
`font-stretch: 115–125%` and heavy weights, labels take small sizes with wide
tracking, numbers take `font-variant-numeric: tabular-nums`.

## Icons

`components/Icon.tsx` is the only icon source: 40 glyphs, one 24-unit box, one
1.6 stroke, square caps and mitred joins. Emoji are not an icon system — they
change between platforms, ignore the theme, and share no stroke with anything.

## States

`Button.css` owns button shape for the whole app; components add only their own
size. Primary takes the accent plane, quiet is a plain cell, danger derives from
`--danger` with `color-mix` so the light theme recalculates without its own rule.

Every meter is an engraved gauge: a hairline well, a straight fill, and the
number set in tabular figures beside it. Glow behind a fill was decoration; the
figure is the reading.

## Browser surfaces

Selection colour, focus ring, and scrollbar are themed from the palette. These
ship with browser defaults that belong to no design system, and theming them is
the cheapest signal that a page was built rather than assembled.

## Rules

- No literal colour in any component stylesheet: either a token, or derived from
  one with `color-mix`.
- No emoji as interface.
- No gradient text, and no thick one-sided border on a card.
- No kicker or eyebrow above a heading.
- Radii stay at 3–4px, so panels read as plate rather than pill.