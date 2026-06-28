# Linda Xue — Portfolio

The Next.js rebuild now lives at the repo root. The original Vite app is kept
in `legacy/` as a reference while the new site is rebuilt from scratch.

```
portfolioremake/
├── src/, public/, package.json, ...   ← Next.js app (deployed to Vercel)
└── legacy/                            ← original Vite app (reference only)
```

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui**
- **react-icons** (social brand logos)

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
```

The site currently shows a minimal "rebuilding in progress" landing page with
links to all socials. Deployed via Vercel (builds from the repo root).

## Legacy app

The original Vite/React app is preserved in `legacy/` for reference:

```bash
cd legacy
npm install
npm run dev
```
