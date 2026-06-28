# Linda Xue — Portfolio

This repo is mid-migration from a Vite/React app to Next.js. It currently
contains two folders:

```
portfolioremake/
├── web/      ← the new Next.js + shadcn + Tailwind app (active rebuild)
└── legacy/   ← the original Vite app, kept as a temporary visual reference
```

The `web/` app is a faithful port of `legacy/` (Home hero, 3D gallery, and
About all reach parity). Once you're happy with the rebuild, `legacy/` can be
deleted and `web/` promoted to the repo root.

## New app (`web/`)

- **Next.js 16** (App Router) + **React 19**
- **Tailwind CSS v4** + **shadcn/ui**
- **Framer Motion** (animations)
- **three / @react-three/fiber / @react-three/drei** (3D project network)
- **@mediapipe/tasks-vision** (hand-tracking hero on the home page)
- Fonts: **Cinema** (local display face) + **Source Sans 3** (body, via `next/font`)

```bash
cd web
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
```

### Routes

| Route      | View                              |
| ---------- | --------------------------------- |
| `/`        | MediaPipe hero + project marquee  |
| `/gallery` | 3D spherical node network         |
| `/about`   | Bio + contacts + portrait         |

### Structure

```
web/src/
├── app/                 # App Router routes + layout + globals.css
├── components/
│   ├── views/           # HomeView / AboutView / GalleryView
│   ├── NodeNetwork/      # 3D gallery (react-three-fiber)
│   ├── Header.tsx, FeaturedCard.tsx, MediaPipeCanvas.tsx, ...
│   └── ui/              # shadcn components
├── lib/                 # theme/panel contexts, motion, media, graphLayout
├── hooks/               # useMediaQuery, useScrollLock
└── data/                # projects, about, mediaDimensions
```

The 3D network and MediaPipe hero are loaded as client-only islands via
`next/dynamic` with `ssr: false`. The theme system uses a `dark` class on
`<html>`, set before first paint by an inline script in the root layout.

## Legacy app (`legacy/`)

The original Vite app, preserved for reference. To run it:

```bash
cd legacy
npm install
npm run dev
```

## Color palette

| Token      | Light     | Dark      |
| ---------- | --------- | --------- |
| Background | `#FAFAFA` | `#1A1A1A` |
| Text       | `#1A1A1A` | `#FAFAFA` |
| Accent     | `#E5E5E5` | `#2A2A2A` |
