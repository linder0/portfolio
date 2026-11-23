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
      // Share a gallery row with the adjacent paired item (two columns)
      // instead of running full-width. Consecutive paired items group in
      // twos, same as embeds.
      pair?: boolean;
      // Override the shared-row width for small media groups.
      columns?: 2 | 3;
      // Video-only: still frame shown before playback.
      poster?: string;
      // Video-only: play silently on a loop with no controls (a GIF stand-in).
      autoplay?: boolean;
    }
  | {
      // Sound work, rendered as an audio card (play button, label, scrubber).
      type: "audio";
      src: string;
      label?: string;
      // Share a gallery row with the adjacent paired item, same as images.
      pair?: boolean;
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
    }
  | {
      // A Google Slides deck, embedded as a 16:9 iframe.
      type: "slides";
      id: string;
      label?: string;
    };

export type Project = {
  // Hide the tagline lede on the project page (the index card and share
  // metadata still use `tagline`) — for showcase pages that open straight
  // on media.
  hideLede?: boolean;
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
  // Index-card cover, independent of the project page. The card never
  // borrows gallery/body media — set this (or `coverMark`) when the card
  // should be a photo; otherwise it uses the thumbnail.
  cover?: string;
  // object-position for the cover photo. Default is center; "bottom" pins
  // the photo to the well's bottom edge so a crop never insets the footer.
  coverPosition?: "center" | "bottom";
  // Logo centered on the index-card well. Wins over `cover`. Rendered as-is
  // by default (use a transparent asset); set `coverMarkKnockout` when the
  // file has a baked-in white/black plate that should blend away.
  coverMark?: string;
  coverMarkKnockout?: boolean;
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
  {
    slug: "vtix",
    title: "VROOM",
    tagline: "A better platform for events",
    year: "2026",
    category: ["software"],
    // No lede or description on purpose — the page goes straight from the
    // title to the banner and demos.
    hideLede: true,
    description: "",
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
    links: [{ label: "view events", url: "https://vroomevents.com" }],
    cover: "/images/projects/vtix/banner+logo.png",
    thumbnail: "/images/projects/vtix/mark.png",
    thumbnailKind: "mark",
    // Video demos — drop files into public/videos/projects/vtix/ and add
    // body lines below the banner. Two URLs joined by ` | ` sit in a
    // justified row (shared height, aspect-preserving, fills the pane).
    // landing.mp4 is already in the folder.
    body: [
      "/images/projects/vtix/banner+logo.png",
      "# Platform",
      "/videos/projects/vtix/vroomhome.mp4 | /videos/projects/vtix/sidebarvroom.mp4 gap 12\nThe event workspace | Sidebar",
      "/videos/projects/vtix/listsvroom.mp4 | /videos/projects/vtix/tasksvroom.mp4 gap 12\nProvider lists for venues, catering, and rentals | The AI planner generates task boards for each event",
      "# Ticketing",
      // Feature demos pulled from usevroom.com (landing-assets bucket).
      "/videos/projects/vtix/event-creation.mp4 | /videos/projects/vtix/ticket-scan.mp4 gap 12\nCreate an event with flexible ticketing in minutes | Scan tickets at the door from the mobile app",
      "/videos/projects/vtix/app-demo.mp4 | /videos/projects/vtix/agent-test.mp4 gap 12\nThe attendee app saves tickets to Apple Wallet with live updates | An iMessage agent answers questions and handles booking",
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
      "A Screen Studio-style macOS recorder that grew into a multi-clip video IDE. Record your screen and Dolly procedurally generates the cinematography afterwards: automatic zooms toward where you click, a smoothed synthetic cursor with click ripples, and a styled card framing. Everything stays editable until export; nothing is baked into pixels until the MP4 renders.",
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
  },
  {
    slug: "monography",
    title: "Monography",
    tagline: "AI-powered research paper copilot",
    year: "2025",
    category: ["software", "design"],
    description: "",
    role: "Full-Stack Developer",
    duration: "2025",
    tools: ["SvelteKit", "LangGraph", "pgvector", "Supabase", "OpenAI", "Stripe", "Vercel"],
    links: [{ label: "Visit Monography", url: "https://monography.io" }],
    thumbnail: "/images/projects/monography/logo-inverse.png",
    thumbnailDark: "/images/projects/monography/logo.png",
    thumbnailKind: "mark",
    coverMark: "/images/projects/monography/logo.png",
    coverMarkKnockout: true,
    media: [
      {
        type: "video",
        src: "/videos/projects/monography/demo.mp4",
        width: 1920,
        height: 1072,
        label: "App interface",
      },
      { type: "youtube", id: "3DlT9cj70Dc", label: "AI Sidebar" },
      { type: "youtube", id: "TABd8xRLewE", label: "Semantic paper search" },
    ],
  },
  {
    slug: "chameleon-gradient",
    title: "Chameleon Gradient",
    tagline: "Color-sensing device that creates gradients from real-world colors",
    year: "2025",
    draft: true,
    category: ["hardware", "research", "design"],
    description:
      "Digital Metaphors bring digital concepts into the real world. The Chameleon Gradient uses a color sensor to capture colors, and a gyroscope to translate angle into a gradient. In progress as UROP with Tangible Media Group @ MIT Media Lab.",
    role: "UROP Researcher",
    client: "MIT Media Lab, Tangible Media Group",
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
        pair: true,
      },
      {
        type: "image",
        src: "/images/projects/chameleon-gradient/chameleon-3.jpeg",
        width: 480,
        height: 360,
        label: "Detail",
        pair: true,
      },
      {
        type: "image",
        src: "/images/projects/chameleon-gradient/chameleon-4.jpeg",
        width: 480,
        height: 360,
        label: "Detail",
        pair: true,
      },
      {
        type: "image",
        src: "/images/projects/chameleon-gradient/chameleon-6.jpeg",
        width: 480,
        height: 360,
        label: "Detail",
        pair: true,
      },
    ],
  },
  {
    slug: "inflatable-chimes",
    title: "Inflatable Chimes",
    tagline: "Modular controllers for interactive soundscapes",
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
    cover: "/images/projects/inflatable-chimes/chimes-assembly-v3.gif",
    media: [
      {
        type: "video",
        src: "/videos/projects/inflatable-chimes/chimes-demo.mp4",
        width: 1280,
        height: 776,
        label: "Demo",
        poster: "/images/projects/inflatable-chimes/chimes-demo-poster.jpg",
      },
      {
        type: "image",
        src: "/images/projects/inflatable-chimes/chimes-thumbnail.jpeg",
        width: 480,
        height: 360,
        label: "Overview",
        pair: true,
      },
      {
        type: "image",
        src: "/images/projects/inflatable-chimes/chimes-sideview.jpeg",
        width: 480,
        height: 360,
        label: "Side view",
        pair: true,
      },
      {
        type: "image",
        src: "/images/projects/inflatable-chimes/chimes-topview.jpeg",
        width: 480,
        height: 360,
        label: "Top view",
        pair: true,
      },
      {
        // Video twin of chimes-assembly.gif (smaller bytes, hardware-decoded).
        type: "video",
        src: "/videos/projects/inflatable-chimes/chimes-assembly-v3.mp4",
        width: 800,
        height: 800,
        label: "Gallery",
        autoplay: true,
        pair: true,
      },
    ],
  },
  {
    slug: "magnetic-petri-dishes",
    title: "Magnetic Petri Dishes",
    tagline: "Automated subculturing system for Galy Co.",
    year: "2024",
    category: ["hardware"],
    description:
      "Designed a magnetic petri dish system to automate cotton subculturing. Features magnetic fittings for alignment, a silicone ring for airtight seal, and ridges for lid stability. Completed for Galy Co. through MIT Consulting Group.",
    role: "Product Designer",
    client: "Galy Co. / MIT Consulting Group",
    duration: "1 semester",
    tools: ["CAD", "3D Printing", "UR Arms"],
    links: [{ label: "Watch demo", url: "https://youtu.be/Y2sF_TRmMb8" }],
    coverMark: "/images/projects/magnetic-petri-dishes/galy.png",
    thumbnail: "/images/projects/magnetic-petri-dishes/petri-dishes-thumb.jpg",
    media: [
      {
        // Local rip of the YouTube demo so it can run as an autoplaying banner.
        type: "video",
        src: "/videos/projects/magnetic-petri-dishes/demo.mp4",
        width: 1280,
        height: 748,
        label: "Demo",
        poster: "/images/projects/magnetic-petri-dishes/demo-poster.jpg",
        autoplay: true,
      },
    ],
  },
  {
    slug: "nanostalgia",
    title: "Nanostalgia",
    tagline: "Huge iPod",
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
    // Authored card cover (the page demo is a separate asset). Sides
    // cropped to 4:3; bottom of the photo is the card's bottom edge.
    cover: "/images/projects/nanostalgia/nano-cover.jpg",
    coverPosition: "bottom",
    thumbnail: "/images/projects/nanostalgia/nanostalgia-thumb.jpg",
    media: [
      {
        // Local rip of the YouTube demo. Keep standard controls so visitors
        // can scrub the walkthrough and listen to its audio.
        type: "video",
        src: "/videos/projects/nanostalgia/demo.mp4",
        width: 1280,
        height: 720,
        label: "Demo",
        poster: "/images/projects/nanostalgia/demo-poster.jpg",
      },
      {
        type: "image",
        // High-res original pulled out of the hackathon deck's PDF export
        // (the old 960×540 PNG was a downscaled copy of this same drawing).
        src: "/images/projects/nanostalgia/nanostalgia-render.jpg",
        width: 2048,
        height: 1152,
        label: "Render",
        pair: true,
      },
      {
        // The hackathon deck, sharing the render's row (embeds pair up).
        type: "slides",
        id: "1nSg1uNUub7X9DMToT73ELBfUN78l4MJth-KzaMByAMc",
        label: "Presentation",
      },
    ],
  },
  {
    slug: "madagascar-hissing-cockroaches",
    title: "Social Isolation in Madagascar Hissing Cockroaches",
    tagline: "",
    year: "2023",
    category: ["research"],
    description:
      "This independent study used Madagascar hissing cockroaches as a model. I measured how social isolation changes exploratory behavior and glucose metabolism. Awarded Regeneron STS Semifinalist, American Junior Academy of Science Delegate, NC International Science Challenge Finalist, and NC ISEF 3rd Place.",
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
    client: "MIT Media Lab, Critical Media Group",
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
        label: "Gaze",
        pair: true,
      },
      {
        type: "audio",
        src: "/audio/projects/gaze-to-the-stars/struggle.m4a",
        label: "Struggle",
        pair: true,
      },
      {
        type: "video",
        src: "/videos/projects/gaze-to-the-stars/eye-display.mp4",
        width: 720,
        height: 1280,
        label: "Eye display",
        columns: 3,
      },
      {
        type: "video",
        src: "/videos/projects/gaze-to-the-stars/braille-machine.mp4",
        width: 720,
        height: 1280,
        label: "Braille machine",
        columns: 3,
      },
      {
        type: "video",
        src: "/videos/projects/gaze-to-the-stars/gaze-dj.mp4",
        width: 538,
        height: 960,
        label: "DJ performance",
        columns: 3,
      },
    ],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
