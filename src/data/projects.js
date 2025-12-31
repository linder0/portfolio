export const projects = [
  {
    id: 1,
    title: "Ethereal Soundscapes",
    tagline: "Ambient audio experiences for immersive installations",
    description: "A collection of ambient soundscapes designed for immersive art installations. Each piece explores the boundaries between music and environmental sound, creating spaces where listeners can lose themselves in texture and atmosphere.",
    category: "music",
    tags: ["ambient", "installation", "sound-design"],
    thumbnail: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200",
      "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200"
    ],
    video: null,
    links: [
      { type: "live", url: "https://soundcloud.com", label: "Listen" }
    ],
    tools: ["Ableton Live", "Max/MSP", "Field Recording"],
    role: "Sound Designer & Composer",
    client: "Gallery Exhibition",
    duration: "2 months",
    year: "2024",
    featured: true
  },
  {
    id: 2,
    title: "Neon Dreams Editorial",
    tagline: "Bold visual identity for a digital-first magazine",
    description: "Complete visual identity system for a cutting-edge digital magazine focused on emerging technology and culture. The design language embraces bold colors and dynamic typography to capture the energy of the digital age.",
    category: "digital",
    tags: ["branding", "editorial", "identity"],
    thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200",
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200"
    ],
    video: null,
    links: [
      { type: "case-study", url: "#", label: "Read Case Study" }
    ],
    tools: ["Figma", "After Effects", "Illustrator"],
    role: "Art Director",
    client: "Neon Dreams Magazine",
    duration: "3 months",
    year: "2024",
    featured: true
  },
  {
    id: 3,
    title: "Minimal Commerce",
    tagline: "E-commerce platform with intentional simplicity",
    description: "A full-stack e-commerce platform built with a focus on performance and user experience. The minimal design puts products front and center while the React-based architecture ensures lightning-fast interactions.",
    category: "web",
    tags: ["e-commerce", "react", "full-stack"],
    thumbnail: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=1200",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200"
    ],
    video: null,
    links: [
      { type: "live", url: "#", label: "View Site" },
      { type: "github", url: "#", label: "Source Code" }
    ],
    tools: ["React", "Node.js", "Stripe", "PostgreSQL"],
    role: "Full-Stack Developer",
    client: "Independent Brand",
    duration: "4 months",
    year: "2024",
    featured: false
  },
  {
    id: 4,
    title: "Motion Reel 2024",
    tagline: "Compiled showcase of motion design work",
    description: "A curated compilation of motion design and animation projects from 2024. From kinetic typography to 3D product visualizations, this reel showcases versatility across styles and techniques.",
    category: "video",
    tags: ["motion", "animation", "showreel"],
    thumbnail: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200"
    ],
    video: { url: "https://vimeo.com", type: "vimeo" },
    links: [
      { type: "live", url: "https://vimeo.com", label: "Watch Reel" }
    ],
    tools: ["After Effects", "Cinema 4D", "Premiere Pro"],
    role: "Motion Designer",
    client: "Self-Initiated",
    duration: "Ongoing",
    year: "2024",
    featured: true
  },
  {
    id: 5,
    title: "Brand Identity System",
    tagline: "Comprehensive identity for a tech startup",
    description: "End-to-end brand identity development for an AI-focused startup. The system includes logo design, color palette, typography, iconography, and comprehensive brand guidelines for consistent application across all touchpoints.",
    category: "digital",
    tags: ["branding", "identity", "guidelines"],
    thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200"
    ],
    video: null,
    links: [
      { type: "case-study", url: "#", label: "View Project" }
    ],
    tools: ["Figma", "Illustrator", "Notion"],
    role: "Brand Designer",
    client: "AI Startup",
    duration: "2 months",
    year: "2023",
    featured: false
  },
  {
    id: 6,
    title: "Ambient Textures Vol. 2",
    tagline: "Second volume of textural sound explorations",
    description: "The follow-up to the original Ambient Textures collection, this volume explores deeper, darker sonic territories. Each track is designed to work both as standalone listening and as source material for other artists.",
    category: "music",
    tags: ["ambient", "electronic", "sample-pack"],
    thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200"
    ],
    video: null,
    links: [
      { type: "live", url: "https://bandcamp.com", label: "Listen & Buy" }
    ],
    tools: ["Ableton Live", "Analog Synths", "Tape Machines"],
    role: "Producer & Sound Designer",
    client: "Self-Released",
    duration: "6 months",
    year: "2023",
    featured: false
  },
  {
    id: 7,
    title: "Portfolio Redesign",
    tagline: "Personal portfolio with experimental interactions",
    description: "A complete redesign of my personal portfolio, featuring experimental interactions including webcam-based effects and 3D node networks. Built with React and Three.js with a focus on memorable user experiences.",
    category: "web",
    tags: ["portfolio", "react", "threejs", "experimental"],
    thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200"
    ],
    video: null,
    links: [
      { type: "live", url: "#", label: "You're Here!" },
      { type: "github", url: "#", label: "Source Code" }
    ],
    tools: ["React", "Three.js", "Framer Motion", "MediaPipe"],
    role: "Designer & Developer",
    client: "Self-Initiated",
    duration: "3 months",
    year: "2023",
    featured: true
  },
  {
    id: 8,
    title: "Documentary Short",
    tagline: "Personal documentary exploring urban solitude",
    description: "A short documentary exploring themes of solitude and connection in urban environments. Shot over three months in various cities, the film uses observational techniques to capture quiet moments of human experience.",
    category: "video",
    tags: ["documentary", "film", "personal"],
    thumbnail: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200"
    ],
    video: { url: "https://vimeo.com", type: "vimeo" },
    links: [
      { type: "live", url: "https://vimeo.com", label: "Watch Film" }
    ],
    tools: ["Sony A7III", "DaVinci Resolve", "Premiere Pro"],
    role: "Director & Editor",
    client: "Personal Project",
    duration: "3 months",
    year: "2023",
    featured: false
  },
  {
    id: 9,
    title: "Typography Exhibition",
    tagline: "Interactive type specimen for variable fonts",
    description: "An interactive digital exhibition showcasing the possibilities of variable fonts. Visitors can manipulate type in real-time, exploring the continuous design space between weight, width, and custom axes.",
    category: "digital",
    tags: ["typography", "interactive", "exhibition"],
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200"
    ],
    video: null,
    links: [
      { type: "live", url: "#", label: "Experience" }
    ],
    tools: ["WebGL", "GSAP", "Variable Fonts"],
    role: "Creative Developer",
    client: "Type Foundry",
    duration: "6 weeks",
    year: "2023",
    featured: false
  },
  {
    id: 10,
    title: "Studio Sessions",
    tagline: "Behind-the-scenes recording documentation",
    description: "A photo and audio documentation series capturing the creative process in various recording studios. The project pairs intimate photography with audio snippets, revealing the spaces and moments where music comes to life.",
    category: "music",
    tags: ["photography", "documentary", "behind-the-scenes"],
    thumbnail: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200"
    ],
    video: null,
    links: [
      { type: "case-study", url: "#", label: "View Series" }
    ],
    tools: ["Leica M10", "Ableton Live", "Lightroom"],
    role: "Photographer & Producer",
    client: "Various Artists",
    duration: "Ongoing",
    year: "2022",
    featured: false
  },
  {
    id: 11,
    title: "E-Commerce Platform",
    tagline: "Scalable marketplace for independent sellers",
    description: "A multi-vendor e-commerce platform designed for independent sellers and small businesses. Features include real-time inventory management, integrated payment processing, and a custom CMS for each vendor.",
    category: "web",
    tags: ["e-commerce", "marketplace", "full-stack"],
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200"
    ],
    video: null,
    links: [
      { type: "live", url: "#", label: "Visit Platform" }
    ],
    tools: ["Next.js", "Supabase", "Stripe Connect", "Tailwind"],
    role: "Lead Developer",
    client: "Startup",
    duration: "6 months",
    year: "2022",
    featured: false
  },
  {
    id: 12,
    title: "Music Video Direction",
    tagline: "Visual narrative for indie artist release",
    description: "Music video direction for an indie artist's lead single. The concept explores themes of memory and nostalgia through a combination of practical effects, 16mm film, and subtle digital compositing.",
    category: "video",
    tags: ["music-video", "direction", "film"],
    thumbnail: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200"
    ],
    video: { url: "https://youtube.com", type: "youtube" },
    links: [
      { type: "live", url: "https://youtube.com", label: "Watch Video" }
    ],
    tools: ["16mm Film", "After Effects", "DaVinci Resolve"],
    role: "Director & DP",
    client: "Indie Artist",
    duration: "2 months",
    year: "2022",
    featured: false
  }
];

export const categories = ['all', 'featured', 'web', 'digital', 'music', 'video'];
