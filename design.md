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

Two families: Helvetica for titles (two tiers) and UI labels, Space Grotesk
for prose:

| role | family | size / line-height | used for |
|------|--------|--------------------|----------|
| **Large** | Helvetica | 22 / 28, tracking -0.01em | the name and page titles — the masthead, post/project titles |
| **Medium** | Helvetica | 18 / 24, tracking -0.01em | subtitles — index row titles, post section headings |
| **Body** | Space Grotesk | 15 / 22 | prose — copy, taglines, post bodies |
| **Label** | Helvetica | 15 / 22 | UI text — nav, buttons, social links, metadata eyebrows |

```css
--font-sans:    var(--font-grotesk-google), Helvetica, sans-serif; /* Space Grotesk — Body */
--font-display: Helvetica, "Helvetica Neue", Arial, sans-serif;    /* titles + labels */
```

Rules:
- **Helvetica is for titles and UI labels, Space Grotesk is for prose.**
  Nothing else.
- **Three display sizes** — 22 (large), 18 (medium), 15 (body). No other
  steps and no uppercase eyebrow. The lone exception is **fenced code in post
  bodies**, which renders monospace at 13px (`font-mono`, `text-[13px]`) — a
  verbatim device, like the credits table is for boxes.
- Weight is Regular (400) everywhere; hierarchy comes from family + size +
  the layout (rules, columns, whitespace), never color. Bold appears only
  inside post bodies: inline `**bold**` and the in-body **h3 subheading**, a
  bold Body paragraph (`copy-18 font-bold`) rather than a third title tier.

### Class aliases

The old scale class names are kept purely as **aliases** so existing markup keeps
working — they collapse onto the tiers by number:

- `heading-32` and up (`heading-48`, `heading-72`, …) → **Large** (22).
- `heading-24` and below → **Medium** (18).
- `copy-*`, `mono-*` → **Body** (15).
- `label-*`, `label-eyebrow` → **Label** (Helvetica 15).

So `<h1 className="heading-48">` renders a page title (the masthead uses the
same tier), `heading-24` a subtitle, and `<p className="copy-16">` (or
`mono-13`, `label-eyebrow`, …) the Body style. Prefer `heading-48` for page
titles, `heading-24` for subtitles, `copy-16` for body.

---

## Shell — fixed rail, scrolling pane

On `lg+`, a centered grid holds a fixed rail, a scrolling content pane,
and a margin column:

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

- **Rail** (`Sidebar`, `w-rail` = frame + grid column 1): name
  (Title style), primary nav, socials pinned to the bottom. On `lg+` it is
  fixed full-height and doesn't scroll. No fill, no divider — it sits on the
  same paper as everything else.
- **Content pane**: `lg:h-dvh lg:overflow-y-auto` — the page itself doesn't
  scroll; only this pane does. It's cleared past the rail on the left
  (`lg:pl-rail`) and inset on the right by the marginalia region
  (`lg:pr-margin-pane` = panel + the frame). `PageMain`'s
  own padding supplies the gutter after the rail, so its text opens on grid
  column 2.
- **Marginalia** (`w-panel` = 3 grid columns, desktop-only): the
  fixed lower-right panel where hovered rows, links, and footnotes push
  their notes. The home page moves it to the content column's bottom-left
  because the photo owns that corner.
- **Signature tag**: the masked logo at the top of the left rail links home.
  On desktop it fits the rail column. On mobile it is 4rem square, scrolls
  with the page, and has equal 16px spacing above and below.
- **Mobile (`<lg`)**: masthead (logo) up top, page scrolls normally, primary
  nav lives in a fixed bar along the bottom edge (`3rem` + safe-area). The
  marginalia panel doesn't exist (no hover). Socials appear only on the home
  page, above the photo.

## Layout & taste — editorial

Within the content pane it reads like a printed index, not a dashboard. One
column, left-aligned, lots of air. Structure comes from **hairline rules and
whitespace** on reading pages. Project and playground collections use
image cards with compact spacing.

Interaction has one voice: the **glow**. Every letter carries a faint ink
bloom (`--text-glow` on `body`); interactive text brightens it on hover/focus
(`.link-glow` → `--text-glow-strong`), and masked shapes bloom via
`.shape-glow`. Color never changes on interaction — pine stays a reserved
accent token (currently defined in the palette but unused by any markup).

### Grid — one centered system

Desktop uses 13 equal fluid columns between matching 16px screen margins.
Every structural gutter is 24px. The rail occupies column 1, and the content starts on
column 2. `--grid-col` is calculated from the viewport after subtracting the
two margins and twelve gutters; all width tokens derive from it.

Reading pages occupy columns 2–10. Margin notes occupy columns 11–13,
separated from the content by one gutter. Writing thumbnails start on column
2 and stay 44px square; titles and descriptions follow with a compact 12px internal gap, matching
the card collections. Dates occupy columns 9–10.
Dividers end at column 10. Prose uses a six-column reading measure; smaller
content caps span four or three columns.

Full-width projects and playground reclaim the note columns and occupy all
12 columns after the rail. Projects span four columns per card on wide
screens; playground clips span three. Collections use a nested 12-column
grid with 12px horizontal gaps and 32px row gaps. Their outer edges remain aligned to the page grid. The `g` overlay
shows the nested tracks within collections and the structural grid elsewhere.

On mobile, the outer frame is 16px. Cards occupy the full content width,
changing to two per row at 420px. The logo has 16px above and below it. On
desktop, the frame remains 16px and the logo fits the rail column.

Content is left-aligned within its assigned columns. Change the shared grid
tokens in `globals.css` to adjust the shell, content, notes, and overlay
together.

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

The steps are assigned by *relationship*, not position — closely related things
sit tighter than unrelated things, and each grouping level gets a visibly
bigger step. Concretely: title → lede is **xs** (`mt-4`); lede → credits table
is **md** (`mt-8`, it continues the intro); credits → body is **lg** (`mt-12`,
the intro → content break); body → media continues at the same **lg** step
(`mt-12`) — media is body content, not a separate chapter. Captions hang off
their media at a micro 8px (`mt-2`).

### Rules (dividers)

Hairlines are the primary structural device. Always `border-border` (a
foreground-tinted alpha, so it tracks the ink in both themes), never a solid
gray. Index rows get a rule between items; the credits table and underline
forms are built entirely from them. Media galleries get no rule — media flows
as part of the body, not as a separate section.

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
  (`--span-2`), so every row's metadata starts on the same line. The gap
  between the text group and metadata is 24px.
- Rows may add a thumbnail before the text (`gap-x-3` to the copy) — one
  shared style for index rows: a 44px square crop at every breakpoint,
  with 3px rounded corners and top alignment. Logos can use the "mark" variant
  instead (theme-responsive, no plate). Drafts get a boxed `mono-13` badge
  inline after the title.
- Rows are `py-6` with a hairline rule between items (first row drops its
  top padding so the list opens flush with the frame).
- Hover brightens the glow (`link-glow`); nothing else animates.
- Hovering a row pushes its note into the marginalia panel.


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

### Project cards (`ProjectCard` — /projects)

The index is a card grid. Each cover is authored (`coverMark`, else `cover`,
else the thumbnail) and never borrowed from the project page gallery — the
card and the page are independent surfaces.

### Project page structure

1. Header row — title (Title style, `heading-48` alias) on the left and the
   external links right-aligned on the same baseline row: `mono-13` alias,
   `↗` suffix, opening in a new tab; each link's note appears in the margin
   on hover.
2. Lede — tagline in `copy-20`, capped to the reading measure.
3. Credits table.
4. Body — description in `copy-18`, capped to the reading measure.
5. Media — a single-column gallery that flows straight on from the body
   (no rule, `mt-12`), like figures in a blog post. Images, videos, and
   YouTube embeds are flush **cards**: media clipped to the slight radius
   (`rounded-xl`) over the raised `background-200` well (letterboxing
   reads as the well). Tweets are their own card (widget chrome) and audio
   is an `AudioCard` — the same raised well holding a play button, the
   track label, elapsed/total time, and a hairline scrubber (the label
   lives inside the card, so audio gets no figcaption). Item spacing is
   the fixed 12px gutter (`gap-3`) the
   projects index grid uses between cards — both the vertical stack and
   the gap inside paired embed rows. Captions (`label`) are optional,
   rendered consistently as Body (`copy-14`) at 60% opacity. Everything is
   capped to the reading measure.

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
| `# ` | section heading (level 2) | Medium title (`heading-24`) with extra air above |
| `## `+ | subheading (level 3) | bold Body (`copy-18 font-bold`) — not a title tier |
| `- ` / `* ` / `1. ` | list (unordered / ordered) | `copy-18`, `list-disc`/`list-decimal`; ordered lists keep their start number |
| `> ` | blockquote | italic, left hairline rule (`border-l`), `whitespace-pre-line` |
| ```` ``` ```` fence | code | monospace 13px in a hairline box (`bg-gray-alpha-100`) — the one monospace + fourth size |
| `---` | rule | `<hr>` hairline |
| image URL line | image | aspect-boxed; a line under the URL in the same paragraph is its caption — Body (`copy-14`) at 60% opacity |
| two+ image URLs joined by ` \| ` | image-row | side by side (`rounded-xl`), resized as one locked group; captions joined by ` \| ` sit under their respective cards; a trailing `gap <px>` sets the spacing between them (default 24) — the owner drags a Figma-style handle in the gap itself to adjust it |
| image/video URL + `frame` | frame | full-pane showcase — breaks out of the reading measure to the pane's inner width (`PageMain` is a CSS container; the figure is `100cqw`), sitting in the raised `background-200` well with a slight radius (`rounded-xl`), a small mat of padding (`p-2`), and a tighter radius (`rounded-lg`) on the media itself. Never resizable. |

There are **two** in-body heading styles (the Medium section heading and the
bold-body subheading); the two *display* tiers stay reserved for the
page title and the section heading.

**Inline markers** (in text, headings, list items, captions): `**bold**`,
`*italic*`, `***both***` (nesting works), `~~strike~~`, `` `code` ``, and
`[text](url)` plus bare URLs. Bold is the one place weight is used in body
copy.

### Forms — two voices

All form chrome draws from one shared set of classes (`form-classes.ts`):

- **Underline forms** (public: login; the newsletter signup uses the same
  voice but is currently unmounted) — a bare `copy-16` input
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
