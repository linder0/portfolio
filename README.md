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
- **Tailwind CSS v4**
- **Upstash Redis** for editable content and subscribers
- **Vercel Blob** for private owner-uploaded images

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
```

Copy `.env.example` to `.env.local` and provide all five values before running
the app. Never commit the resulting `.env.local` file.

## Deploy

The app deploys from the repository root with Vercel's default Next.js build
settings. Provision an Upstash Redis integration and a private Vercel Blob
store, then configure:

- `ADMIN_PASSWORD`
- `AUTH_SECRET` (generate with `openssl rand -hex 32`)
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `BLOB_READ_WRITE_TOKEN`

Attach these domains to the same Vercel project:

- `lindaxue.com` and `www.lindaxue.com`
- `projects.lindaxue.com`
- `writing.lindaxue.com`
- `playground.lindaxue.com`

Section navigation falls back to `/projects`, `/writing`, and `/playground` on
Vercel preview URLs, where custom subdomains are unavailable.

## Legacy app

The original Vite/React app is preserved in `legacy/` for reference:

```bash
cd legacy
npm install
npm run dev
```
