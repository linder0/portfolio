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
    };

export type Project = {
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
  media?: ProjectMedia[];
};

export const projects: Project[] = [
  {
    slug: "hangful",
    title: "Hangful",
    tagline: "Replace ads with real-world hangouts",
    year: "2025",
    category: ["software", "design"],
    description:
      "A platform that sponsors real-world social experiences for brands targeting college communities. Brands create campaigns, students participate in verified hangouts, and track results with real-time analytics. Features identity verification, viral multiplier tracking, and campus reach across UCLA and USC.",
    role: "Co-founder",
    duration: "2025",
    tools: ["React"],
    links: [{ label: "GitHub", url: "https://github.com/linder0/hangful" }],
    media: [
      {
        type: "image",
        src: "/images/projects/hangful/thumbnail.png",
        width: 2704,
        height: 1684,
        label: "Overview",
      },
      {
        type: "image",
        src: "/images/projects/hangful/demo.png",
        width: 2704,
        height: 1682,
        label: "App demo",
      },
    ],
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
      {
        type: "image",
        src: "/images/projects/gemini-clone/home.png",
        width: 2704,
        height: 1685,
        label: "Home",
      },
      {
        type: "image",
        src: "/images/projects/gemini-clone/library.png",
        width: 2704,
        height: 1685,
        label: "My stuff",
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
    links: [
      { label: "Visit Monography", url: "https://monography.io" },
      { label: "AI Sidebar", url: "https://youtu.be/3DlT9cj70Dc" },
      { label: "Semantic Paper Search", url: "https://youtu.be/TABd8xRLewE" },
      { label: "Demo 1", url: "https://x.com/i/status/1995546938557825183" },
      { label: "Demo 2", url: "https://x.com/i/status/1994080526085374168" },
    ],
    media: [
      {
        type: "image",
        src: "/images/projects/monography/logo.png",
        width: 1200,
        height: 1200,
        label: "Logo",
      },
      {
        type: "image",
        src: "/images/projects/monography/homepage.png",
        width: 1920,
        height: 1080,
        label: "App interface",
      },
    ],
  },
  {
    slug: "pookie",
    title: "Pookie",
    tagline: "AI unified inbox for all your messages",
    year: "2025",
    category: ["software", "design"],
    description:
      "Every message in one place. Pookie combines emails, texts, and DMs with semantic search, AI autodrafting that learns your tone, vim keyboard shortcuts, and custom smart-tagging. Native integrations for Gmail, Outlook, WhatsApp, and LinkedIn. Original idea accepted into Y Combinator F25, garnering 500k+ impressions and 2.5k waitlist signups.",
    role: "Co-founder",
    client: "Y Combinator F25",
    collaborators: ["Mathias"],
    tools: ["SvelteKit", "Semantic Search"],
    links: [
      { label: "Visit Pookie", url: "https://pookie.work" },
      { label: "Demo 1", url: "https://x.com/i/status/1985801327310778541" },
      { label: "Demo 2", url: "https://x.com/i/status/1968329094208381154" },
      { label: "Demo 3", url: "https://x.com/i/status/1947680537746845954" },
    ],
    media: [
      {
        type: "image",
        src: "/images/projects/pookie/thumbnail.png",
        width: 948,
        height: 597,
        label: "Overview",
      },
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
