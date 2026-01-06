export const projects = [
  {
    id: 22,
    title: "Hangful",
    tagline: "Replace ads with real-world hangouts",
    description: "A platform that sponsors real-world social experiences for brands targeting college communities. Brands create campaigns, students participate in verified hangouts, and track results with real-time analytics. Features identity verification, viral multiplier tracking, and campus reach across UCLA and USC.",
    category: ["software", "design"],
    tags: ["startup", "product", "full-stack"],
    media: { type: "image", url: "/images/hangful/thumbnail.png" },
    images: [
      { url: "/images/hangful/demo.png", label: "App Demo" }
    ],
    links: [
      { type: "live", url: "https://hangful.com", label: "Visit Hangful" }
    ],
    tools: ["React", "Full-Stack", "Product Design", "Analytics"],
    role: "Co-founder",
    duration: "2025",
    year: "2025",
    featured: true
  },
  {
    id: 21,
    title: "Gemini Clone",
    tagline: "Recreation of Google's Gemini AI interface",
    description: "A faithful recreation of Google's Gemini AI chat interface, featuring conversation management, user authentication, and a clean modern UI. Frustrated with native Gemini image generation, I built a LangGraph agent for improved image generation with better chat memory and context retention.",
    category: "software",
    tags: ["ai", "full-stack", "clone"],
    media: { type: "video", url: "/videos/gemini/demo.mp4", thumbnail: "/images/gemini/monkeyyy.png" },
    images: [
      { url: "/images/gemini/home.png", label: "Home" },
      { url: "/images/gemini/library.png", label: "My Stuff" }
    ],
    links: [
      { type: "live", url: "https://geminiclone-blue-sigma.vercel.app", label: "Try it" },
      { type: "github", url: "https://github.com/linder0/geminiclone", label: "GitHub" }
    ],
    tools: ["React", "LangGraph", "AI Integration"],
    role: "Developer",
    duration: "2025",
    year: "2025",
    featured: false
  },
  {
    id: 20,
    title: "Monography",
    tagline: "AI-powered research paper copilot",
    description: "A full-stack web app for managing, annotating, and analyzing research papers with AI assistance. Features a LangGraph agent with autonomous multi-step reasoning, semantic search via pgvector, PDF viewing with text extraction, arXiv integration, and real-time streaming chat. Built with SvelteKit 5, Supabase, and integrations with OpenAI, Anthropic, Tavily, and ElevenLabs.",
    category: ["software", "design"],
    tags: ["ai", "full-stack", "startup", "product"],
    media: { type: "image", url: "/images/monography/logo.png" },
    images: [
      { url: "/images/monography/homepage.png", label: "App Interface" }
    ],
    tweets: [
      { id: "1995546938557825183", label: "Demo 1" },
      { id: "1994080526085374168", label: "Demo 2" }
    ],
    links: [
      { type: "live", url: "https://monography.io", label: "Visit Monography" }
    ],
    tools: ["SvelteKit", "LangGraph", "pgvector", "Supabase", "OpenAI", "Stripe", "Vercel"],
    role: "Full-Stack Developer",
    duration: "2025",
    year: "2025",
    featured: true
  },
  {
    id: 19,
    title: "Pookie",
    tagline: "AI unified inbox for all your messages",
    description: "Every message in one place. Pookie combines emails, texts, and DMs with semantic search, AI autodrafting that learns your tone, vim keyboard shortcuts, and custom smart-tagging. Native integrations for Gmail, Outlook, WhatsApp, and LinkedIn. Original idea accepted into Y Combinator F25, garnering 500k+ impressions and 2.5k waitlist signups.",
    category: ["software", "design"],
    tags: ["startup", "ai", "yc-f25", "product"],
    media: { type: "image", url: "/images/pookie/thumbnail.png" },
    tweets: [
      { id: "1985801327310778541", label: "Demo 1" },
      { id: "1968329094208381154", label: "Demo 2" },
      { id: "1947680537746845954", label: "Demo 3" }
    ],
    links: [
      { type: "live", url: "https://pookie.work", label: "Visit Pookie" }
    ],
    tools: ["Svelte", "AI/ML", "Semantic Search", "Product Design"],
    role: "Co-founder",
    client: "Y Combinator F25",
    collaborators: ["Mathias"],
    duration: "2025",
    year: "2025",
    featured: true
  },
  {
    id: 18,
    title: "Chameleon Gradient",
    tagline: "Color-sensing device that creates gradients from real-world colors",
    description: "Digital Metaphors bring digital concepts into the real world. The Chameleon Gradient uses a color sensor to capture colors, and a gyroscope to translate angle into a gradient. In progress as UROP with Tangible Media Group @ MIT Media Lab.",
    category: ["hardware", "research", "design"],
    tags: ["hardware", "electronics", "mit-media-lab", "in-progress"],
    media: { type: "image", url: "/images/chameleon/render.png" },
    images: [
      { url: "/images/chameleon/chameleon-thumb.jpeg", label: "Detail 1" },
      { url: "/images/chameleon/chameleon-3.jpeg", label: "Detail 2" },
      { url: "/images/chameleon/chameleon-4.jpeg", label: "Detail 3" },
      { url: "/images/chameleon/chameleon-6.jpeg", label: "Detail 4" }
    ],
    // TODO: Add YouTube embed for assembly video
    videos: [],
    links: [],
    tools: ["CAD", "Electronics", "Color Sensor", "Gyroscope", "Silicone Molding"],
    role: "UROP Researcher",
    client: "MIT Media Lab — Tangible Media Group",
    duration: "Ongoing",
    year: "2025",
    featured: true
  },
  {
    id: 17,
    title: "Inflatable Chimes",
    tagline: "Modular roly-poly controllers for interactive soundscapes",
    description: "Inspired by Budaoweng (Chinese roly-poly dolls), I designed modular bases with Bluetooth/gyroscope components that serve as controllers for a soundscape. Final project for 4.021 MIT Intro to Design. Exhibited in the lobby of Stratton Student Center.",
    category: ["hardware", "design"],
    tags: ["hardware", "sound-design", "interactive", "3d-printing"],
    media: { type: "video", url: "/videos/chimes/chimes-demo.mp4", thumbnail: "/images/chimes/chimes-thumb.jpg" },
    images: [
      { url: "/images/chimes/chimes-thumbnail.jpeg", label: "Overview" },
      { url: "/images/chimes/chimes-sideview.jpeg", label: "Side View" },
      { url: "/images/chimes/chimes-topview.jpeg", label: "Top View" },
      { url: "/images/chimes/chimes-gallery.gif", label: "Gallery" }
    ],
    links: [],
    tools: ["CAD", "3D Printing", "Bluetooth", "Gyroscope", "Sound Design"],
    role: "Designer & Developer",
    client: "MIT 4.021 Intro to Design",
    duration: "1 semester",
    year: "2025",
    featured: true
  },
  {
    id: 16,
    title: "Magnetic Petri Dishes",
    tagline: "Automated cotton subculturing system for Galy Co.",
    description: "Designed a magnetic petri dish system to automate cotton subculturing. Features magnetic fittings for alignment, a silicone ring for airtight seal, and ridges for lid stability. Completed for Galy Co. through MIT Consulting Group.",
    category: "hardware",
    tags: ["hardware", "cad", "consulting"],
    media: { type: "video", url: "/videos/petri-dishes/petri-dishes.mp4", thumbnail: "/images/petri-dishes/petri-dishes-thumb.jpg" },
    images: [
      { url: "/images/petri-dishes/petri-dishes.png", label: "Prototype" }
    ],
    links: [],
    tools: ["CAD", "3D Printing", "UR Arms", "Prototyping"],
    role: "Product Designer",
    client: "Galy Co. / MIT Consulting Group",
    duration: "1 semester",
    year: "2024",
    featured: true
  },
  {
    id: 15,
    title: "Nanostalgia",
    tagline: "iPod Nano shaped mirror with playlists on USB sticks",
    description: "A nostalgic hardware project reimagining the iconic iPod Nano as a mirror device that plays curated playlists from USB sticks. Combining electronics and CAD design to create a functional art piece that bridges past and present music experiences. Built during the 2025 Formlabs Harvard/MIT IAP Hackathon.",
    category: ["hardware", "design"],
    tags: ["hardware", "electronics", "cad", "hackathon"],
    media: { type: "video", url: "/videos/nanostalgia/nanostalgia.mp4", thumbnail: "/images/nanostalgia/nanostalgia-thumb.jpg" },
    images: [
      { url: "/images/nanostalgia/nanostalgia-render.png", label: "Render" }
    ],
    links: [
      { type: "case-study", url: "https://docs.google.com/presentation/d/1nSg1uNUub7X9DMToT73ELBfUN78l4MJth-KzaMByAMc/edit?usp=drive_link", label: "View Presentation" }
    ],
    tools: ["Electronics", "CAD", "3D Printing"],
    role: "Electronics, CAD",
    client: "Formlabs 2025 Harvard & MIT Hackathon",
    collaborators: ["Emily Pan", "Pria Sawhney", "Layla Stanton"],
    duration: "Hackathon",
    year: "2025",
    featured: true
  },
  {
    id: 13,
    title: "Social Isolation in Madagascar Hissing Cockroaches",
    tagline: "Behavioral and physiological effects of isolation on G. Portentosa",
    description: "Using Gromphadorhina Portentosa (Madagascar Hissing Cockroach) as a model organism, this independent research examines how social isolation affects exploratory behavior (via AI video analysis) and glucose metabolism (via hemolymph glucose levels). A 2x2 randomized design with four treatment groups revealed that social isolation reduced exploratory behavior—with early instars affected more than late instars—and increased glucose levels while causing weight loss in early instars. These findings highlight the behavioral and biological impacts of social isolation, with implications for understanding pandemic-era health disparities.",
    category: "research",
    tags: ["neuroscience", "behavior", "independent-research"],
    media: { type: "image", url: "/images/roach/roach.jpeg" },
    links: [
      { type: "case-study", url: "https://docs.google.com/document/d/1MbZcIGNLB-VMer3fTyWKVkRW79Zilmhvg813xIlSiYE/edit?tab=t.0", label: "Read Paper" }
    ],
    tools: ["AI Video Analysis", "Statistical Analysis", "Lab Equipment"],
    role: "Independent Researcher",
    client: "MIT",
    duration: "1 semester",
    year: "2023",
    featured: true
  },
  {
    id: 14,
    title: "Gaze to the Stars",
    tagline: "Interactive eye projections on the MIT Dome",
    description: "The eyes are a window to the soul. By documenting them, this project tells untold stories by projecting them onto the MIT Dome. I created the scheduling program and sound design for the experience, and worked with UR arms for visual presentations. Awarded the MIT first-year award in performance and fine arts.",
    category: ["design", "research"],
    tags: ["installation", "sound-design", "mit-media-lab"],
    media: { type: "image", url: "/images/gaze/gaze-stars.jpg" },
    audio: [
      { url: "/audio/gaze.wav", label: "Gaze" },
      { url: "/audio/struggle.wav", label: "Struggle" }
    ],
    videos: [
      { url: "/videos/gaze/braille-machine.mp4", label: "Braille Machine" },
      { url: "/videos/gaze/eye-display.mp4", label: "Eye Display" },
      { url: "/videos/gaze/gaze-dj.mp4", label: "DJ Performance" }
    ],
    links: [
      { type: "live", url: "https://gazetothestars.com", label: "View Project" }
    ],
    tools: ["Sound Design", "Python", "UR Arms", "Projection Mapping"],
    role: "Sound Designer & Developer",
    client: "MIT Media Lab — Critical Media Group",
    duration: "1 semester",
    year: "2025",
    featured: true
  }
];

export const categories = ['all', 'research', 'design', 'software', 'hardware'];
