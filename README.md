# Linda Xue — Portfolio

## Tech Stack

- **React 19** + **Vite 6**
- **Tailwind CSS 4** (using `@tailwindcss/vite`)
- **Framer Motion** (animations)
- **React Router DOM** (client-side routing)
- **Google Fonts**: Fraunces (display) + Source Sans 3 (body)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Features

- **Responsive Design**: Works beautifully on all screen sizes
- **Dark/Light Theme**: Pull-cord lamp toggle with localStorage persistence
- **Animated Navigation**: Smooth underline transitions with Framer Motion
- **Glassmorphism Header**: Shrinks and blurs on scroll
- **Infinite Marquee Footer**: Scrolling text with CSS animation
- **Grid Size Toggle**: S/M/L options for gallery view
- **Project Cards**: Hover effects with category and year reveal

## Project Structure

```
src/
├── components/
│   ├── Header.jsx      # Sticky header with glassmorphism
│   ├── Footer.jsx      # Fixed marquee footer
│   ├── ProjectCard.jsx # Hover-revealing project cards
│   ├── GridToggle.jsx  # S/M/L grid size selector
│   └── LampToggle.jsx  # Pull-cord theme toggle
├── pages/
│   ├── Home.jsx        # Hero + featured projects
│   ├── Gallery.jsx     # Full project grid
│   └── About.jsx       # Bio + disciplines
├── data/
│   └── projects.js     # Project data
├── App.jsx             # Main app with routing
├── main.jsx            # Entry point
└── index.css           # Global styles + Tailwind
```

## Color Palette

| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| Background | `#FAFAFA` | `#1A1A1A` |
| Text | `#1A1A1A` | `#FAFAFA` |
| Accent | `#E5E5E5` | `#2A2A2A` |

---

Crafted with ❤️


