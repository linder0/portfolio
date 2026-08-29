export type ProjectLink = {
  label: string;
  url: string;
};

export type ProjectMedia =
  | {
      type: "image" | "video";
      src: string;
      // Intrinsic pixel dimensions, so media renders without layout shift.
      width: number;
      height: number;
      label?: string;
      // Video-only: still frame shown before playback.
      poster?: string;
      // Video-only: play silently on a loop with no controls (a GIF stand-in).
      autoplay?: boolean;
    }
  | {
      // Sound work, rendered as a bare audio player (no aspect box).
      type: "audio";
      src: string;
      label?: string;
    }
  | {
      // A hosted demo video, embedded as a 16:9 iframe.
      type: "youtube";
      id: string;
      label?: string;
    }
  | {
      // An X/Twitter demo post, embedded via widgets.js (see TweetEmbed).
      type: "tweet";
      id: string;
      label?: string;
    };

export type Project = {
  // Stable identity for stored edits — the slug as authored in this file.
  // The URL slug may differ if renamed inline. Set when resolving from the
  // project store; static entries use `slug`.
  id?: string;
  slug: string;
  title: string;
  tagline: string;
  year: string;
  category: string[];
  description: string;
  role: string;
  client?: string;
  duration?: string;
  collaborators?: string[];
  tools: string[];
  links: ProjectLink[];
  // Small square image for the index row (same convention as post thumbnails).
  thumbnail?: string;
  // Dark-theme mark. With `thumbnailKind: "mark"`, light shows `thumbnail`
  // and dark shows this (ThemedMark). The two files need the same glyph
  // padding or the index mark will jump size across themes. Omit and a
  // white-on-black plate is inverted on paper.
  thumbnailDark?: string;
  // "mark" = a logo sitting on the page (no rounded plate). "photo" (default)
  // = the small rounded crop.
  thumbnailKind?: "mark" | "photo";
  // Marks default to knocking out a baked-in white/black plate. Transparent
  // or colored SVGs should set this false.
  thumbnailKnockout?: boolean;
  media?: ProjectMedia[];
  // Spacing between gallery items in px — both the vertical stack and the
  // gap inside paired embed rows. The owner adjusts it by dragging the space
  // between items on the project page; omitted = the 24px gutter.
  mediaGap?: number;
  // Optional long-form case study, same plain-text conventions as post bodies
  // (see `lib/writing`): blank lines split paragraphs, "# " headings, image
  // and video lines with captions (two URLs on one line, joined by ` | `,
  // sit side by side), lists, quotes, ``` code fences. Rendered on the
  // project page below the description.
  body?: string;
  // Drafts are only visible to the signed-in owner — hidden from the index
  // and a 404 on the detail page for everyone else.
  draft?: boolean;
};

export const projects: Project[] = [
  // FloatPlay screenshots — drop into public/images/projects/floatplay/, then
  // insert matching body lines (path + caption) where marked below:
  //   over-work.png      — player floating over Docs/Slack/code
  //   pill.png           — control pill on hover
  //   tray.png           — menu-bar ▶ dropdown
  //   open-link.png      — Spotlight-style open prompt
  //   audio-only.png     — collapsed audio-only bar
  //   resize.png         — edge resize / aspect lock
  //   thumbnail.png      — already set (app icon); replace anytime
  {
    slug: "floatplay",
    title: "FloatPlay",
    tagline: "A floating always-on-top mini player for any URL",
    year: "2026",
    category: ["software", "design"],
    description:
      "Paste a link, watch it float over whatever you're doing — like Arc's picture-in-picture, but for anything with a URL. Menu-bar-only on macOS, global hotkeys from the clipboard, and non-activating panels so play/pause never steals keyboard focus from your work.",
    role: "Designer & Developer",
    tools: ["Electron", "TypeScript", "React", "electron-vite"],
    links: [{ label: "GitHub", url: "https://github.com/linder0/floatplay" }],
    thumbnail: "/images/projects/floatplay/thumbnail.png",
    thumbnailKind: "mark",
    body: [
      "I wanted picture-in-picture that wasn't locked to one browser or one site. FloatPlay is a menu-bar macOS app: copy a URL, hit a hotkey, and a small always-on-top player appears over your work — YouTube, Vimeo, Twitch, Loom, a direct MP4, or basically any http(s) page as a tiny floating browser.",
      // → /images/projects/floatplay/over-work.png
      // The player sitting over a real workspace — always on top, including fullscreen Spaces.
      "# Open from anywhere",
      "**⌘⇧Y** (Ctrl+Shift+Y on Windows/Linux) reads the clipboard. If it's a URL, a player opens immediately. If it isn't, a Spotlight-style prompt appears so you can paste or type a link. **⌘⇧H** hides or shows every open player without stopping playback — useful when you need the whole screen back for a minute.",
      // → /images/projects/floatplay/open-link.png
      // The open-link prompt — centered, dismisses on blur, same energy as Spotlight.
      "# Menu bar, no Dock",
      "FloatPlay runs as a macOS accessory app (`LSUIElement` + accessory activation policy): no Dock icon, just a **▶** in the menu bar. The tray menu covers Play from Clipboard, Open Link…, Hide/Show Players, and — for each open window — Ghost, Passive, Audio only, Reload, and Close. Quit lives at the bottom like a normal tray app.",
      // → /images/projects/floatplay/tray.png
      // Menu bar ▶ — global actions plus per-player toggles so you never have to hunt for a hovered pill.
      "# Panels that don't steal focus",
      "Each player is a frameless, transparent, always-on-top panel (`type: 'panel'` on macOS). It floats above every app, including native-fullscreen Spaces, and is *non-activating*: clicking the chrome or the embed doesn't yank keyboard focus away from the doc or editor you're in. Multiple players cascade so they don't stack invisibly on top of each other.",
      "# The control pill",
      "Hover a player and a floating pill appears above the video. From left to right: drag handle (move the window), Ghost (dim the whole window to ~45% opacity so it reads as ambience), Passive (fade out while the cursor is over the player so it gets out of the way), Audio only (collapse to a thin bar — video hidden, sound keeps going), Reload, and Close. The pill stays in sync with the tray menu, whichever place you toggle from.",
      // → /images/projects/floatplay/pill.png
      // Hover chrome — ghost, passive, audio-only, reload, close.
      // → /images/projects/floatplay/audio-only.png
      // Audio-only mode — window collapsed to the pill strip, playback still alive.
      "# Resize without fighting the aspect ratio",
      "Players keep a 16:9 video area. Edge grips on the left, right, and bottom drive a custom aspect-locked resize from the main process (cursor-follow timers), because Cocoa's built-in ratio lock fights frameless transparent windows. A small gutter around the embed keeps the grips clickable without covering the video.",
      // → /images/projects/floatplay/resize.png
      // Edge grips and the 16:9 lock — drag a side or the bottom, the video area stays clean.
      "# What links do",
      "Full sites at 480px are miserable, so known providers get converted to their bare embed player before load:",
      [
        "- **YouTube** — watch, Shorts, live, youtu.be; preserves `t=` start times and playlist `list=`",
        "- **Vimeo** — numeric video IDs → player.vimeo.com embed",
        "- **Twitch** — channels and VODs, with the required `parent=` param",
        "- **Loom** — share links → embed",
        "- **Direct media** — `.mp4`, `.webm`, `.mov`, `.mp3`, and friends play in a minimal built-in `<video>` page",
        "- **Anything else** — loaded as-is in the sandboxed view (tiny floating browser)",
      ].join("\n"),
      "DRM services (Netflix, Disney+, etc.) won't play — stock Electron has no Widevine. YouTube embeds also need an HTTP Referer or they fail with Error 153; FloatPlay attaches a neutral third-party Referer for YouTube requests so the embed player actually starts.",
      "# Security model",
      "FloatPlay is intentionally a mini browser for URLs *you* paste — treat it like opening a link in Chrome. The important split is architectural:",
      [
        "```",
        "trusted chrome  →  preload + IPC",
        "                (pill, grips, open prompt)",
        "",
        "content view    →  sandboxed WebContentsView",
        "                (remote / embed / <video>, no preload)",
        "",
        "popups          →  system browser",
        "                (shell.openExternal)",
        "```",
      ].join("\n"),
      "Pasted sites never get the app's IPC surface. Navigation in the content view is limited to http(s). No analytics, no telemetry.",
      "# Shipping",
      "Built with electron-vite; packaged with electron-builder into a macOS `.dmg` / `.zip` (plus Windows and Linux targets). Tag a version and GitHub Actions builds draft release artifacts. Open source under MIT.",
    ].join("\n\n"),
  },
  {
    slug: "vtix",
    title: "Vroom",
    tagline: "A better platform for events",
    year: "2026",
    category: ["software"],
    description:
      "An event ticketing platform built as a thin Stripe wrapper — near-zero fees, Apple Wallet tickets with live updates and Dynamic Island integration, and an iMessage-native AI concierge that answers questions and books tickets for attendees. Organizers get flexible ticketing, dynamic pricing, waitlists, RSVPs, message blasts, and real-time analytics; attendees get a native mobile app with at-door QR scanning.",
    role: "Full-Stack Developer",
    tools: [
      "Next.js",
      "Supabase",
      "Stripe",
      "React Native",
      "Apple Wallet",
      "Photon",
      "Twilio",
    ],
    links: [{ label: "Visit Vroom", url: "https://usevroom.com" }],
    thumbnail: "/images/projects/vtix/mark.png",
    thumbnailKind: "mark",
    body: [
      "Vroom (codename *vtix*) is an event ticketing platform with a simple pitch: near-zero fees, tickets that live in Apple Wallet, and an AI concierge that handles booking over iMessage. Under the hood it's deliberately a thin wrapper around Stripe — Checkout Sessions for payment, webhooks for fulfillment, first-class refunds and transfers — so the platform charges just enough to offset software costs instead of taking a checkout cut.",
      "# For organizers",
      "Organizers create and edit events with flexible ticket tiers, dynamic pricing, and waitlists — people can be promoted off a waitlist with reserved claim links. Free events run on RSVPs with email and SMS confirmations that include calendar links. The dashboard covers attendee rosters with CSV export, donations, message blasts to attendees, appearance theming, embeds for external sites, and real-time sales analytics. Age-gated events verify IDs at purchase.",
      "# For attendees",
      "Tickets save straight to Apple Wallet as live-updating passes with QR codes and Dynamic Island integration. A React Native app for iOS and Android carries the rest: push notifications, your upcoming events, shared photo drives after the event, and — for organizers — fast at-door ticket scanning and check-in that works for both paid tickets and RSVPs.",
      "# The AI concierge",
      "Every event gets an iMessage-native agent, built on Photon's iMessage transport, that answers repetitive attendee questions and can handle booking on someone's behalf — text it like a person and it sends back a checkout link or confirms your RSVP. Purchase and RSVP confirmations flow back over the same channels, email and SMS included.",
      "# Under the hood",
      "Next.js 16 and Supabase with row-level security, pg-boss for background jobs, Resend for email, Twilio for SMS, PostHog for product analytics, and OpenTelemetry for tracing. One odd delight in the repo: a headless RIMS II economic-impact report generator, so an event can show a venue or city what it's actually worth.",
    ].join("\n\n"),
  },
  {
    slug: "dolly",
    title: "Dolly",
    tagline: "An opinionated cinematography engine for UI",
    year: "2026",
    draft: true,
    category: ["software", "design"],
    description:
      "A Screen Studio-style macOS recorder that grew into a multi-clip video IDE. Record your screen and Dolly procedurally generates the cinematography afterwards — automatic zooms toward where you click, a smoothed synthetic cursor with click ripples, and a styled card framing. Everything stays editable until export; nothing is baked into pixels until the MP4 renders.",
    role: "Designer & Developer",
    tools: [
      "Electron",
      "TypeScript",
      "Swift",
      "ScreenCaptureKit",
      "WebCodecs",
      "Whisper",
      "Remotion",
    ],
    links: [{ label: "GitHub", url: "https://github.com/linder0/screenlabs" }],
    thumbnail: "/images/projects/dolly/thumbnail.png",
    thumbnailKind: "mark",
    body: [
      "Screen recordings are flat: the camera never moves, the cursor jitters, and the viewer has to find the action themselves. Tools like Screen Studio fix this with beautiful auto-zooms — so I built my own engine to understand how, and then kept going until it became a small video editor. Dolly's premise is that cinematography is a *function of telemetry*: record first, and let the camera work be computed afterwards, from what actually happened on screen.",
      "/videos/projects/dolly/dolly-demo.mp4\nThe demo — itself written as code and rendered with Remotion.",
      "# Record, then direct",
      "Recording starts from a floating always-on-top widget: pick a display, window, or area, and optionally enable the webcam, mic, and system audio. A Swift sidecar built on ScreenCaptureKit captures the screen with the cursor hidden, while a CGEventTap logs every mouse move, click, and keystroke into an events.jsonl beside the video. That telemetry file is the whole trick — the recording keeps the raw pixels, and everything cinematic is derived from the event log later.",
      "/images/projects/dolly/widget.png\nThe recorder widget — display, window, or area capture, plus camera, mic, and system audio tracks.",
      "# Cinematography as a function of telemetry",
      "After a recording lands, a chain of pure engines turns events into camera work. An analyzer clusters clicks and typing into attention segments; a camera planner converts those segments into a deterministic, eased camera path; and a cursor engine redraws the pointer from recorded motion as a zero-lag smoothed vector cursor — scaled with the zoom, crisp at any size, with ripples on every click.",
      "/images/projects/dolly/editor-cursor.png\nThe recorded cursor is never shown — it's redrawn from motion data, so smoothing, sizing, and click effects stay adjustable forever.",
      "# The compositor never decides anything",
      [
        "```",
        "event analyzer  -> attention segments (click clustering, typing extension)",
        "camera planner  -> deterministic eased camera path per clip",
        "cursor engine   -> zero-lag smoothed path, vector cursor, click ripples",
        "sequence        -> global timeline: evaluate(t) resolves clip -> camera/cursor",
        "edits           -> pure clip ops: split, cut range, trim, reorder",
        "compositor      -> background -> shadow -> card -> video -> cursor -> webcam",
        "exporter        -> WebCodecs H.264 + AAC, same evaluation as preview",
        "```",
      ].join("\n"),
      "Every frame the compositor draws `evaluate(t)` — a fully described scene computed from the project document, the event logs, and the current settings. There is no hidden state and no baked-in decision: change the background, the padding, the zoom curve, or the cursor size, and the same recording re-renders differently. Preview and export share the exact same evaluation, so what you scrub is what you ship.",
      "/images/projects/dolly/editor.png\nThe editor — styled card framing over the project background, a media shelf on the left, and a multi-clip timeline below.",
      "# A video IDE",
      "Recordings live inside projects. Record again and the new clip appends to the open timeline; split with S, trim clip edges, drag to reorder, set per-clip volume and zooms. Paste (⌘V) or drop any video or image and it lands in the project instantly — ⌘⇧V grabs clipboard media from anywhere, even when the app isn't focused. The webcam composites as a floating bubble, and the mic mixes into both preview and export.",
      "# The AI layer",
      "Whisper transcribes the timeline audio, and the transcript is synced both ways — click a sentence to seek, cut a sentence to cut the video. A local silence-remover finds dead air and trims it, and a chat agent edits the project in plain language: \"zoom in on the top right from 5s to 9s\", \"cut the first 3 seconds\", \"switch to a dark background and add padding\".",
      "/images/projects/dolly/editor-ai.png\nThe AI tab — one-click silence removal and an editing agent that operates on the project document.",
      "# Nothing baked until export",
      "Export runs entirely in the renderer: WebCodecs encodes H.264 while the audio graph mixes to AAC, muxed into an MP4 (or a GIF, for short loops). Because the exporter walks the same evaluate(t) as the preview, the render is just the timeline played carefully — every zoom, ripple, and crossfade lands exactly where the scrubber showed it.",
      "/images/projects/dolly/export-dialog.png\nExport — format, resolution, and compression presets, straight to a file, the clipboard, or a shareable link.",
    ].join("\n\n"),
  },
  {
    slug: "gemini-clone",
    title: "Gemini Clone",
    tagline: "Recreation of Google's Gemini AI interface",
    year: "2025",
    category: ["software"],
    description:
      "A faithful recreation of Google's Gemini AI chat interface, featuring conversation management, user authentication, and a clean modern UI. Frustrated with native Gemini image generation, I built a LangGraph agent for improved image generation with better chat memory and context retention.",
    role: "Developer",
    duration: "2025",
    tools: ["SvelteKit", "LangGraph"],
    links: [
      { label: "Try it", url: "https://geminiclone-blue-sigma.vercel.app" },
      { label: "GitHub", url: "https://github.com/linder0/geminiclone" },
    ],
    thumbnail: "/images/projects/gemini-clone/mark.svg",
    thumbnailKind: "mark",
    thumbnailKnockout: false,
    media: [
      {
        type: "video",
        src: "/videos/projects/gemini-clone/demo.mp4",
        width: 1280,
        height: 826,
        label: "Demo",
        // First second of the demo video itself, ripped via ffmpeg.
        poster: "/images/projects/gemini-clone/demo-poster.jpg",
      },
    ],
  },
  {
    slug: "monography",
    title: "Monography",
    tagline: "AI-powered research paper copilot",
    year: "2025",
    category: ["software", "design"],
    description:
      "A full-stack web app for managing, annotating, and analyzing research papers with AI assistance. Features a LangGraph agent with autonomous multi-step reasoning, semantic search via pgvector, PDF viewing with text extraction, arXiv integration, and real-time streaming chat. Built with SvelteKit 5, Supabase, and integrations with OpenAI, Anthropic, Tavily, and ElevenLabs.",
    role: "Full-Stack Developer",
    duration: "2025",
    tools: ["SvelteKit", "LangGraph", "pgvector", "Supabase", "OpenAI", "Stripe", "Vercel"],
    links: [{ label: "Visit Monography", url: "https://monography.io" }],
    thumbnail: "/images/projects/monography/logo-inverse.png",
    thumbnailDark: "/images/projects/monography/logo.png",
    thumbnailKind: "mark",
    body: [
      "/images/projects/monography/logo-inverse.png 160 knockout",
      "/images/projects/monography/logo.png",
      "Logo",
    ].join("\n"),
    media: [
      {
        type: "image",
        src: "/images/projects/monography/homepage.png",
        width: 1920,
        height: 1080,
        label: "App interface",
      },
      { type: "youtube", id: "3DlT9cj70Dc", label: "AI Sidebar" },
      { type: "youtube", id: "TABd8xRLewE", label: "Semantic paper search" },
      { type: "tweet", id: "1995546938557825183", label: "Demo 1" },
      { type: "tweet", id: "1994080526085374168", label: "Demo 2" },
    ],
  },
  {
    slug: "chameleon-gradient",
    title: "Chameleon Gradient",
    tagline: "Color-sensing device that creates gradients from real-world colors",
    year: "2025",
    category: ["hardware", "research", "design"],
    description:
      "Digital Metaphors bring digital concepts into the real world. The Chameleon Gradient uses a color sensor to capture colors, and a gyroscope to translate angle into a gradient. In progress as UROP with Tangible Media Group @ MIT Media Lab.",
    role: "UROP Researcher",
    client: "MIT Media Lab — Tangible Media Group",
    duration: "Ongoing",
    tools: ["CAD", "Electronics", "Color Sensor", "Gyroscope", "Silicone Molding"],
    links: [
      { label: "Assembly video", url: "https://youtube.com/shorts/qjFmz_p_eiM" },
    ],
    thumbnail: "/images/projects/chameleon-gradient/chameleon-thumb.jpeg",
    media: [
      {
        type: "image",
        src: "/images/projects/chameleon-gradient/render.png",
        width: 1647,
        height: 547,
        label: "Render",
      },
      {
        type: "image",
        src: "/images/projects/chameleon-gradient/chameleon-thumb.jpeg",
        width: 480,
        height: 360,
        label: "Detail",
      },
      {
        type: "image",
        src: "/images/projects/chameleon-gradient/chameleon-3.jpeg",
        width: 480,
        height: 360,
        label: "Detail",
      },
      {
        type: "image",
        src: "/images/projects/chameleon-gradient/chameleon-4.jpeg",
        width: 480,
        height: 360,
        label: "Detail",
      },
      {
        type: "image",
        src: "/images/projects/chameleon-gradient/chameleon-6.jpeg",
        width: 480,
        height: 360,
        label: "Detail",
      },
    ],
  },
  {
    slug: "inflatable-chimes",
    title: "Inflatable Chimes",
    tagline: "Modular roly-poly controllers for interactive soundscapes",
    year: "2025",
    category: ["hardware", "design"],
    description:
      "Inspired by Budaoweng (Chinese roly-poly dolls), I designed modular bases with Bluetooth/gyroscope components that serve as controllers for a soundscape. Final project for 4.021 MIT Intro to Design. Exhibited in the lobby of Stratton Student Center.",
    role: "Designer & Developer",
    client: "MIT 4.021 Intro to Design",
    duration: "1 semester",
    tools: ["CAD", "3D Printing", "Bluetooth", "Gyroscope", "Sound Design"],
    links: [],
    thumbnail: "/images/projects/inflatable-chimes/chimes-thumbnail.jpeg",
    media: [
      {
        type: "video",
        src: "/videos/projects/inflatable-chimes/chimes-demo.mp4",
        width: 1280,
        height: 776,
        label: "Demo",
        poster: "/images/projects/inflatable-chimes/chimes-thumb.jpg",
      },
      {
        type: "image",
        src: "/images/projects/inflatable-chimes/chimes-thumbnail.jpeg",
        width: 480,
        height: 360,
        label: "Overview",
      },
      {
        type: "image",
        src: "/images/projects/inflatable-chimes/chimes-sideview.jpeg",
        width: 480,
        height: 360,
        label: "Side view",
      },
      {
        type: "image",
        src: "/images/projects/inflatable-chimes/chimes-topview.jpeg",
        width: 480,
        height: 360,
        label: "Top view",
      },
      {
        // Converted from the original GIF (half the bytes, hardware-decoded).
        type: "video",
        src: "/videos/projects/inflatable-chimes/chimes-gallery.mp4",
        width: 800,
        height: 800,
        label: "Gallery",
        autoplay: true,
      },
    ],
  },
  {
    slug: "magnetic-petri-dishes",
    title: "Magnetic Petri Dishes",
    tagline: "Automated cotton subculturing system for Galy Co.",
    year: "2024",
    category: ["hardware"],
    description:
      "Designed a magnetic petri dish system to automate cotton subculturing. Features magnetic fittings for alignment, a silicone ring for airtight seal, and ridges for lid stability. Completed for Galy Co. through MIT Consulting Group.",
    role: "Product Designer",
    client: "Galy Co. / MIT Consulting Group",
    duration: "1 semester",
    tools: ["CAD", "3D Printing", "UR Arms"],
    links: [{ label: "Watch demo", url: "https://youtu.be/Y2sF_TRmMb8" }],
    thumbnail: "/images/projects/magnetic-petri-dishes/petri-dishes-thumb.jpg",
    media: [
      {
        type: "image",
        src: "/images/projects/magnetic-petri-dishes/petri-dishes-thumb.jpg",
        width: 2066,
        height: 2066,
        label: "Overview",
      },
      {
        type: "image",
        src: "/images/projects/magnetic-petri-dishes/petri-dishes.png",
        width: 942,
        height: 1232,
        label: "Prototype",
      },
    ],
  },
  {
    slug: "nanostalgia",
    title: "Nanostalgia",
    tagline: "iPod Nano shaped mirror with playlists on USB sticks",
    year: "2025",
    category: ["hardware", "design"],
    description:
      "A nostalgic hardware project reimagining the iconic iPod Nano as a mirror device that plays curated playlists from USB sticks. Combining electronics and CAD design to create a functional art piece that bridges past and present music experiences. Built during the 2025 Formlabs Harvard/MIT IAP Hackathon.",
    role: "Electronics, CAD",
    client: "Formlabs 2025 Harvard & MIT Hackathon",
    duration: "Hackathon",
    collaborators: ["Emily Pan", "Pria Sawhney", "Layla Stanton"],
    tools: ["Electronics", "CAD", "3D Printing"],
    links: [
      { label: "Watch demo", url: "https://youtu.be/Tnka10wFpD8" },
      {
        label: "View Presentation",
        url: "https://docs.google.com/presentation/d/1nSg1uNUub7X9DMToT73ELBfUN78l4MJth-KzaMByAMc/edit?usp=drive_link",
      },
    ],
    thumbnail: "/images/projects/nanostalgia/nanostalgia-thumb.jpg",
    media: [
      {
        type: "image",
        src: "/images/projects/nanostalgia/nanostalgia-render.png",
        width: 960,
        height: 540,
        label: "Render",
      },
      {
        type: "image",
        src: "/images/projects/nanostalgia/nanostalgia-thumb.jpg",
        width: 1080,
        height: 1080,
        label: "Overview",
      },
    ],
  },
  {
    slug: "madagascar-hissing-cockroaches",
    title: "Social Isolation in Madagascar Hissing Cockroaches",
    tagline: "Behavioral and physiological effects of isolation on G. Portentosa",
    year: "2023",
    category: ["research"],
    description:
      "Using Gromphadorhina Portentosa (Madagascar Hissing Cockroach) as a model organism, this independent research examines how social isolation affects exploratory behavior (via AI video analysis) and glucose metabolism (via hemolymph glucose levels). A 2x2 randomized design with four treatment groups revealed that social isolation reduced exploratory behavior—with early instars affected more than late instars—and increased glucose levels while causing weight loss in early instars. These findings highlight the behavioral and biological impacts of social isolation, with implications for understanding pandemic-era health disparities.",
    role: "Independent Researcher",
    client: "MIT",
    duration: "1 semester",
    tools: ["AI Video Analysis", "Statistical Analysis"],
    links: [
      {
        label: "Read Paper",
        url: "https://docs.google.com/document/d/1MbZcIGNLB-VMer3fTyWKVkRW79Zilmhvg813xIlSiYE/edit?tab=t.0",
      },
    ],
    thumbnail:
      "/images/projects/madagascar-hissing-cockroaches/roach.jpeg",
    media: [
      {
        type: "image",
        src: "/images/projects/madagascar-hissing-cockroaches/roach.jpeg",
        width: 1024,
        height: 768,
        label: "Model organism",
      },
    ],
  },
  {
    slug: "gaze-to-the-stars",
    title: "Gaze to the Stars",
    tagline: "Interactive eye projections on the MIT Dome",
    year: "2025",
    category: ["design", "research"],
    description:
      "The eyes are a window to the soul. By documenting them, this project tells untold stories by projecting them onto the MIT Dome. I created the scheduling program and sound design for the experience, and worked with UR arms for visual presentations. Awarded the MIT first-year award in performance and fine arts.",
    role: "Sound Designer & Developer",
    client: "MIT Media Lab — Critical Media Group",
    duration: "1 semester",
    tools: ["Sound Design", "Python", "UR Arms", "Projection Mapping"],
    links: [{ label: "View Project", url: "https://gazetothestars.com" }],
    thumbnail: "/images/projects/gaze-to-the-stars/gaze-stars.jpg",
    media: [
      {
        type: "image",
        src: "/images/projects/gaze-to-the-stars/gaze-stars.jpg",
        width: 6000,
        height: 3375,
        label: "Projection on the MIT Dome",
      },
      {
        type: "audio",
        src: "/audio/projects/gaze-to-the-stars/gaze.m4a",
        label: "Gaze — sound design",
      },
      {
        type: "audio",
        src: "/audio/projects/gaze-to-the-stars/struggle.m4a",
        label: "Struggle — sound design",
      },
      {
        type: "video",
        src: "/videos/projects/gaze-to-the-stars/eye-display.mp4",
        width: 720,
        height: 1280,
        label: "Eye display",
      },
      {
        type: "video",
        src: "/videos/projects/gaze-to-the-stars/braille-machine.mp4",
        width: 720,
        height: 1280,
        label: "Braille machine",
      },
      {
        type: "video",
        src: "/videos/projects/gaze-to-the-stars/gaze-dj.mp4",
        width: 538,
        height: 960,
        label: "DJ performance",
      },
    ],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
