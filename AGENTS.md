<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# The `legacy/` folder

`legacy/` holds the original Vite/React portfolio. It is **reference-only** — a
redesign attic, not the live app.

- **This is a redesign, not a port.** Do not copy legacy code/structure/styling
  into the new app. Build fresh against the current stack and the design system.
- **Pull in sparingly.** It's fine to lift specific *content* (project copy,
  asset files like images/videos under `legacy/public/`) or take *inspiration*
  from a layout — but selectively, and reworked to fit the new design.
- **Never edit `legacy/`** as part of new work, and don't wire it into the build.
  The live app is everything outside `legacy/`.
