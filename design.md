# Linda Xue — Colors & Type

The core of the site's look: three colors and two typefaces. Warm paper, deep
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

### Surfaces

`background-100` is the page, `background-200` the raised surface (used as the
well behind project media). In dark mode the page goes to ink and text goes to
paper:

```css
/* light */
--background-100: #f6f5f2; /* page — paper */
--background-200: #ffffff; /* raised — lifts clean off the warm page */

/* dark */
--background-100: #0b0b0b; /* page — ink */
--background-200: #141413; /* raised */
```

Borders stay a low-alpha tint of the text color in both themes
(`color-mix(in srgb, var(--foreground) 12%, transparent)` on paper, 16% on
ink), so hairlines track whatever ink is in use.

On a dark surface the accent reads better one step lighter (`pine-400`/`pine-500`)
than `pine-700`.

---

## Type — two families, three sizes

Two families: serif for titles (two tiers), Helvetica for everything else:

| role | family | size / line-height | used for |
|------|--------|--------------------|----------|
| **Large** | Newsreader (serif) | 28 / 34, tracking -0.01em | the name and page titles — the masthead, post/project titles, Writing, Playground |
| **Medium** | Newsreader (serif) | 22 / 28, tracking -0.01em | subtitles — index row titles, post section headings |
| **Body** | Helvetica (sans) | 15 / 22 | everything else — copy, labels, nav, metadata, links |

```css
--font-sans:  Helvetica, "Helvetica Neue", Arial, sans-serif;   /* Body */
--font-serif: var(--font-serif-google), Georgia, serif;         /* Newsreader — titles */
```

Rules:
- **Serif is for titles, Helvetica is for body.** Nothing else.
- **Three display sizes** — 28 (large), 22 (medium), 15 (body). No other
  steps and no uppercase eyebrow. The lone exception is **fenced code in post
  bodies**, which renders monospace at 13px (`font-mono`, `text-[13px]`) — a
  verbatim device, like the credits table is for boxes.
- Weight is Regular (400) almost everywhere; hierarchy comes from family +
  size + the layout (rules, columns, whitespace), not weight or color. Bold is
  used only inside post bodies: inline `**bold**`, and the in-body **h3
  subheading**, which is a bold Body paragraph (`copy-18 font-bold`) rather
  than a third serif tier.

### Class aliases

The old scale class names are kept purely as **aliases** so existing markup keeps
working — they collapse onto the tiers by number:

- `heading-32` and up (`heading-48`, `heading-72`, …) → **Large** (serif 28).
- `heading-24` and below → **Medium** (serif 22).
- `copy-*`, `label-*`, `label-eyebrow`, `mono-*` → **Body** (Helvetica 15).

So `<h1 className="heading-48">` renders a page title (the masthead uses the
same tier), `heading-24` a subtitle, and `<p className="copy-16">` (or
`mono-13`, `label-eyebrow`, …) the Body style. Prefer `heading-48` for page
titles, `heading-24` for subtitles, `copy-16` for body.

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

- **Rail** (`Sidebar`, `w-rail` = margin + grid columns 1–2 = 13rem): name
  (Title style), primary nav, socials pinned to the bottom. On `lg+` it is
  fixed full-height and doesn't scroll. No fill, no divider — it sits on the
  same paper as everything else.
- **Content pane**: `lg:h-dvh lg:overflow-y-auto` — the page itself doesn't
  scroll; only this pane does. It's cleared past the rail on the left
  (`lg:pl-rail`) and inset on the right by the marginalia region
  (`lg:pr-margin-pane` = panel + the page margin = 19.5rem). Its text opens
  on grid column 3.
- **Marginalia** (`w-panel` = 3 grid columns = 18rem, desktop-only): the
  fixed lower-right panel where hovered rows, links, and footnotes push
  their notes. The home page moves it to the content column's bottom-left
  because the photo owns that corner.
- **Signature tag**: the masked logo shape in the top-right; it is the theme
  toggle. Fixed on `lg+` (`6rem` square); on mobile it's smaller (`4rem`) and
  absolutely positioned so it scrolls away with the page.
- **Mobile (`<lg`)**: masthead (name) up top, page scrolls normally, primary
  nav lives in a fixed bar along the bottom edge (`3rem` + safe-area). The
  marginalia panel doesn't exist (no hover). Socials appear only on the home
  page, above the photo.

## Layout & taste — editorial

Within the content pane it reads like a printed index, not a dashboard. One
column, left-aligned, lots of air. Structure comes from **hairline rules and
whitespace**, never from cards, fills, or shadows (the credits table is the
one boxed exception — see below).

Interaction has one voice: the **glow**. Every letter carries a faint ink
bloom (`--text-glow` on `body`); interactive text brightens it on hover/focus
(`.link-glow` → `--text-glow-strong`), and masked shapes bloom via
`.shape-glow`. Color never changes on interaction — pine stays a reserved
accent token (currently defined in the palette but unused by any markup).

### Grid — one fixed column unit

Every fixed width on the page derives from a single column unit, defined in
`globals.css`:

```css
--grid-col:    5rem;   /* column, 80px */
--grid-gutter: 1.5rem; /* gutter, 24px — doubles as the lg page inset */
```

The grid starts one gutter in from the left edge (the page inset **is** a
gutter). Columns 1–2 are the rail, column 3 opens the content pane's text.
The pane itself is fluid — it absorbs the viewport — so the right flank
(marginalia) keeps the unit (3 columns hung from the right edge) but not the
left-origin column lines. That's inherent to a fixed-flank/fluid-center
shell and is by design: the measure stays a fixed, print-like width on any
monitor.

Markup references **role tokens**, never raw rems and never column counts:
`w-rail` / `pl-rail` (margin + 2 cols = 13rem), `pr-margin-pane` (panel +
margin = 19.5rem), `max-w-measure` (prose, 6 cols = 37.5rem), `max-w-cap-md`
(4 cols = 24.5rem), `max-w-cap-sm` (3 cols = 18rem), `w-panel` (marginalia,
3 cols = 18rem), `gap-x-6` / `px-gutter` etc. for gutter-sized gaps.

**Grid overlay**: press `g` to toggle the column overlay (available to
everyone in development, and to the signed-in owner in production), drawn from
the live tokens — everything should land on it (rose = the left-origin
columns, green = the right-flank panel region).

### Frame & measure

A single inset is shared by **everything, on every edge** — the rail, every
page `main` (via `PageMain`), the theme toggle, and the marginalia panel:
`p-4` (16px) mobile → `lg:p-6` (24px). On `lg` this inset equals the grid
gutter. Keep this in lockstep; if it changes, change it everywhere
(`Sidebar`, `PageMain`, `SignatureTag`, `Marginalia`, and the grid tokens in
`globals.css`).

| Role | Width |
|------|-------|
| Reading measure (post/project body, home bio) | `max-w-measure` (37.5rem) |
| Credits table, admin column, newsletter form | `max-w-cap-md` (24.5rem) |
| Inline subscribe (writing heading row) | `max-w-cap-sm` (18rem) |
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
gray. Index rows get a rule between items; a project's media gallery opens
under one; the credits table and underline forms are built entirely from them.

### Index pattern (`IndexRow` — /projects and /writing)

One shared row component for every list page:

```
Hangful                                        2025
Replace ads with real-world hangouts
────────────────────────────────────────────────────
Gemini Clone                                   2025
...
```

- Two lines only: title in the Medium title style (`heading-24`), tagline in
  Body (`copy-14`). No category/eyebrow line — project tags were dropped.
- Right column (year / date), right-aligned, top-aligned with the title,
  tabular numerals. On `lg` it's a real grid slot — two columns wide
  (11.5rem), not shrink-wrapped — so every row's meta starts on the same
  line; gaps within the row are gutter-sized (`gap-x-6`).
- Writing rows may add a small square thumbnail (`3.5rem`, top-aligned,
  square-cropped) before the text, and drafts get a boxed `mono-13` badge
  inline after the title.
- Rows are `py-6` with a hairline rule between items (first row drops its
  top padding so the list opens flush with the frame).
- Hover brightens the glow (`link-glow`); nothing else animates.
- Hovering a row pushes its note into the marginalia panel.

The writing index puts the newsletter subscribe on the heading's baseline row,
right-aligned (see underline forms below).

### Credits table (project pages)

Borrowed from a film or magazine masthead — now an actual `<table>`
(`CreditsTable`), a compact self-contained unit rather than open rows:

- Capped at `max-w-cap-md`, fully boxed with a hairline grid (`border-border`
  on the outer frame, row rules, and the label/value column divider).
- Label column is a fixed `w-24`, `label-eyebrow` alias, with a whisper of
  fill behind it (`bg-foreground/[0.03]`) so the block reads as one piece.
- Values are `copy-16`; cells are `px-3 py-1.5`, baseline-aligned.
- Keys, in order: **Role · Year · For · Duration · With · Stack**. Omit any
  key with no value (some projects show only Year · Stack).
- Multi-value fields (collaborators, tools) run inline separated by middots.

This is the one exception to "no boxes" — a table is a print device, not a
card.

### Project page structure

1. Header row — title (Title style, `heading-48` alias) on the left and the
   external links right-aligned on the same baseline row: `mono-13` alias,
   `↗` suffix, opening in a new tab; each link's note appears in the margin
   on hover.
2. Lede — tagline in `copy-20`, capped to the reading measure.
3. Credits table.
4. Body — description in `copy-18`, capped to the reading measure.
5. Media — a single-column gallery under a hairline rule (`border-t` +
   generous `pt-12`, items `gap-12`): images and videos sit in an
   aspect-ratio box filled with `background-200` (so letterboxing reads as a
   raised well), audio is a bare player. Captions are the `label-eyebrow`
   alias. Everything is capped to the reading measure.

There is no eyebrow/category line — the page opens straight on the title.

### Post page structure (writing)

1. Eyebrow — date (plus ` · draft` for the owner), Body style.
2. Title — Title style (`heading-48` alias).
3. Lede — the tagline in `copy-20` (same voice as the project lede), when the
   post has one.
4. Optional banner — the post thumbnail cropped to `3:1`, hairline-bordered,
   capped to the reading measure.
5. Body — a stack of blocks (`space-y-6`), capped to the reading measure. The
   text is written in a small markdown-ish syntax parsed in `lib/writing.ts`
   (`postBlocks`); the editor's ⌘B/⌘I/⌘K toggle the inline markers.

**Block types** (a chunk's leading marker decides which):

| syntax | block | renders as |
|--------|-------|------------|
| (plain paragraph) | text | `copy-18` |
| `# ` | section heading (level 2) | Medium serif (`heading-24`) with extra air above |
| `## `+ | subheading (level 3) | bold Body (`copy-18 font-bold`) — not a serif tier |
| `- ` / `* ` / `1. ` | list (unordered / ordered) | `copy-18`, `list-disc`/`list-decimal`; ordered lists keep their start number |
| `> ` | blockquote | italic, left hairline rule (`border-l`), `whitespace-pre-line` |
| ```` ``` ```` fence | code | monospace 13px in a hairline box (`bg-gray-alpha-100`) — the one monospace + fourth size |
| `---` | rule | `<hr>` hairline |
| image URL line | image | aspect-boxed; a line under the URL in the same paragraph is its caption — Body (`copy-14`) at 60% opacity |

There are **two** in-body heading styles (the serif section heading and the
bold-body subheading); the two serif *display* tiers stay reserved for the
page title and the section heading.

**Inline markers** (in text, headings, list items, captions): `**bold**`,
`*italic*`, `***both***` (nesting works), `~~strike~~`, `` `code` ``, and
`[text](url)` plus bare URLs. Bold is the one place weight is used in body
copy.

### Forms — two voices

All form chrome draws from one shared set of classes (`form-classes.ts`):

- **Underline forms** (public: newsletter, login) — a bare `copy-16` input
  and a text button sitting on one shared hairline (`border-b border-border`,
  darkening to the foreground on focus). No boxes, no fills; placeholders are
  the foreground at 40%.
- **Editor chrome** (owner-only inline editing) — hairline-boxed transparent
  fields, and lowercase `mono-13` dotted-underline text buttons (the same
  dotted underline as note links).

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
