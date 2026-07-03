# Linda Xue — Colors & Type

The core of the site's look: three colors and one typeface. Warm paper, deep
ink, and a single pine accent — everything else is built from those.

> Source of truth is `src/app/globals.css`. This file is the readable summary.
> Hover the hex values below to preview each color in your editor.

---

## Roots

```css
--paper: #f6f5f2; /* page surface (warm off-white) */
--ink:   #0b0b0b; /* primary text + primary action */
--pine:  #324b34; /* the one accent */
```

These never change between light and dark. Dark mode just swaps which root is
the surface and which is the text.

---

## Color

Every scale runs `100`–`1000`. The step encodes intent, not just lightness:

| step | role |
|------|------|
| 100  | default background |
| 200  | hover background |
| 300  | active background |
| 400  | default border |
| 500  | hover border |
| 600  | active border |
| 700  | solid fill, high contrast |
| 800  | solid fill, hover |
| 900  | secondary text & icons |
| 1000 | primary text & icons |

The scales are **fixed** — `gray-100` is the same color in light and dark. Only
the semantic roles (background, text, border…) remap per theme.

### gray — warm neutrals (surfaces, borders, text)

```css
--gray-100:  #efede8;
--gray-200:  #e7e4dd;
--gray-300:  #dedad1;
--gray-400:  #d5d1c7;
--gray-500:  #bfbaad;
--gray-600:  #a39d8e;
--gray-700:  #837d6e;
--gray-800:  #6a6456;
--gray-900:  #4d4842;
--gray-1000: #0b0b0b;
```

### gray-alpha — translucent neutrals (borders, dividers, hovers)

```css
--gray-alpha-100:  #00000008;
--gray-alpha-200:  #0000000f;
--gray-alpha-300:  #00000017;
--gray-alpha-400:  #0000001f;
--gray-alpha-500:  #0000002e;
--gray-alpha-600:  #0000003d;
--gray-alpha-700:  #00000066;
--gray-alpha-800:  #00000099;
--gray-alpha-900:  #000000cc;
--gray-alpha-1000: #000000eb;
```

### pine — the one accent (links, focus, the important moment)

```css
--pine-100:  #eef2ee;
--pine-200:  #e0e8e1;
--pine-300:  #cdd9ce;
--pine-400:  #b3c4b5;
--pine-500:  #8aa38d;
--pine-600:  #5b7d5f;
--pine-700:  #324b34;
--pine-800:  #29402b;
--pine-900:  #203221;
--pine-1000: #101a11;
```

That's the whole palette — no other hues.

### Dark surfaces

In dark mode the page goes to ink and text goes to paper:

```css
--background-100: #0b0b0b; /* page */
--background-200: #141413; /* raised */
```

Borders stay a low-alpha tint of the text color in both themes
(`color-mix(in srgb, var(--foreground) 12%, transparent)` on paper, 16% on
ink), so hairlines track whatever ink is in use.

On a dark surface the accent reads better one step lighter (`pine-400`/`pine-500`)
than `pine-700`.

---

## Type — two families, two sizes

Two families, and only **two sizes** across the whole site:

| role | family | size / line-height | used for |
|------|--------|--------------------|----------|
| **Title** | Newsreader (serif) | 28 / 34, tracking -0.01em | every heading/title — the name, page titles, project titles |
| **Body** | Helvetica (sans) | 15 / 22 | everything else — copy, labels, nav, metadata, links |

```css
--font-sans:  Helvetica, "Helvetica Neue", Arial, sans-serif;   /* Body */
--font-serif: var(--font-serif-google), Georgia, serif;         /* Newsreader — Title */
```

Rules:
- **Serif is for titles, Helvetica is for body.** Nothing else.
- **Only two sizes** — 28px (title) and 15px (body). No intermediate steps, no
  uppercase eyebrow, no monospace. Everything is one of these two.
- Weight is Regular (400) everywhere; hierarchy comes from family + size + the
  layout (rules, columns, whitespace), not weight or color.

### Class aliases

The old scale class names are kept purely as **aliases** so existing markup keeps
working — they now collapse to just the two styles:

- `heading-*` → **Title** (serif 28).
- `copy-*`, `label-*`, `label-eyebrow`, `mono-*` → **Body** (Helvetica 15).

So `<h1 className="heading-48">` renders the Title style and `<p className="copy-16">`
(or `mono-13`, `label-eyebrow`, …) renders the Body style. New markup can use any
of these aliases; prefer `heading-24` for titles and `copy-16` for body.

---

## Shell — fixed rail, scrolling pane

The site is **not** a centered column. On `lg+` it's a fixed rail, a scrolling
content pane, and a margin column:

```
┌────────────┬─────────────────────────────┬──────────┐
│  RAIL      │  CONTENT                    │  MARGIN  │
│  (fixed)   │  (scrolls)                  │  (fixed) │
│            │                             │          │
│  Linda Xue │  Hangful               2025 │          │
│  nav       │  Gemini Clone          2025 │  note …  │
│            │  ...                        │          │
│  socials   │                             │   [tag]  │
└────────────┴─────────────────────────────┴──────────┘
```

- **Rail** (`Sidebar`, `13rem`): name (Title style), primary nav, socials
  pinned to the bottom. On `lg+` it is fixed full-height and doesn't scroll.
  No fill, no divider — it sits on the same paper as everything else.
- **Content pane**: `lg:h-dvh lg:overflow-y-auto` — the page itself doesn't
  scroll; only this pane does. It's cleared past the rail on the left
  (`lg:pl-[13rem]`) and inset on the right by the marginalia column
  (`lg:pr-[20.5rem]` = 19rem panel + the shared gutter).
- **Marginalia** (`19rem`, desktop-only): the fixed lower-right panel where
  hovered rows, links, and footnotes push their notes. The home page moves it
  to the content column's bottom-left because the photo owns that corner.
- **Signature tag**: the masked logo shape in the top-right; it is the theme
  toggle.
- **Mobile (`<lg`)**: masthead (name) up top, page scrolls normally, primary
  nav lives in a fixed bar along the bottom edge (`3rem` + safe-area). The
  marginalia panel doesn't exist (no hover). Socials appear only on the home
  page, above the photo.

## Layout & taste — editorial

Within the content pane it reads like a printed index, not a dashboard. One
column, left-aligned, lots of air. Structure comes from **hairline rules and
whitespace**, never from cards, fills, or shadows.

Interaction has one voice: the **glow**. Every letter carries a faint ink
bloom (`--text-glow` on `body`); interactive text brightens it on hover/focus
(`.link-glow` → `--text-glow-strong`), and masked shapes bloom via
`.shape-glow`. Color never changes on interaction — pine stays a reserved
accent token (currently only charts/focus tokens use it).

### Frame & measure

A single inset is shared by **everything, on every edge** — the rail, every
page `main` (via `PageMain`), the theme toggle, and the marginalia panel:
`p-4` (16px) mobile → `lg:p-6` (24px). Keep this in lockstep; if it changes,
change it everywhere (`Sidebar`, `PageMain`, `SignatureTag`, `Marginalia`,
and the layout's `lg:pr` inset).

| Role | Width |
|------|-------|
| Reading measure (post/project body) | `max-w-[38rem]` |
| Home bio | `max-w-[40rem]` |
| Index rows, headers, rules | full pane width |

Content is **left-aligned** within the pane (no `mx-auto`). Prose is capped to
the reading measure; headings and rules run the pane.

### Vertical rhythm

8px base. Lean on a few big steps rather than many small ones — editorial calm
comes from generous, consistent gaps.

| step | px | use |
|------|----|-----|
| xs | 16 | label → value, tight pairs |
| sm | 24 | within a block |
| md | 32 | block → block |
| lg | 48 | intro → content |
| xl | 64–96 | major section breaks |

### Rules (dividers)

Hairlines are the primary structural device. Always `border-border` (a
foreground-tinted alpha, so it tracks the ink in both themes), never a solid
gray. Index rows get a rule between items; the credits block sits under one.

### Index pattern (`IndexRow` — /projects and /writing)

One shared row component for every list page:

```
Hangful                                        2025
Replace ads with real-world hangouts
software · design
────────────────────────────────────────────────────
Gemini Clone                                   2025
...
```

- Title in the Title style (`heading-24`); tagline in Body (`copy-14`).
- Optional third line (`label-eyebrow` alias) — e.g. a project's categories.
- Right column (year / date), right-aligned, tabular numerals.
- Writing rows may add a small square thumbnail and a boxed `draft` badge.
- Hover brightens the glow (`link-glow`); nothing else animates.
- Hovering a row pushes its note into the marginalia panel.

### Credits block (project pages)

Borrowed from a film or magazine masthead. A definition list of hairline rows:
`label-eyebrow` keys in a fixed `7rem` column, `copy-16` values.

- Keys, in order: **Role · Year · Client · Duration · With · Built with**.
- Omit any key with no value.
- Multi-value fields (collaborators, tools) run inline separated by middots.

### Project page structure

1. Eyebrow — `category · year`.
2. Title — Title style (`heading-48` alias).
3. Lede — tagline in `copy-20`, capped to the reading measure.
4. Credits block (hairline rows).
5. Body — description in `copy-18`, capped to the reading measure.
6. Links — `mono-13` alias row above a hairline, `↗` suffix (external, new
   tab); each link's note appears in the margin on hover.

### Marginalia & annotations

The margin is the site's one "extra" surface: a fixed, chrome-less text panel
(no border, no fill) that holds whatever was last pointed at — a project's
description, a post preview, a link's destination, a pinned footnote. Notes
are plain text; bare URLs become dotted-underline links and an image URL on
its own line becomes the photo. Underlined phrases in body copy are stored
highlights (`cursor-help`, dotted underline) that feed the same panel.

### Grain

A fixed film-grain overlay sits above everything (`--grain-opacity`: 0.1
light / 0.15 dark), overshooting the viewport so mobile overscroll stays
textured.
