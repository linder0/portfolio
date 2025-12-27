import { useState } from 'react'

export default function Footer() {
  const [selectedIndex, setSelectedIndex] = useState(4) // Default to last item selected

  const skills = [
    {
      name: 'Web Design',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <line x1="3" y1="9" x2="21" y2="9"/>
          <line x1="9" y1="21" x2="9" y2="9"/>
        </svg>
      )
    },
    {
      name: 'Digital Design',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2"/>
          <polyline points="2 17 12 22 22 17"/>
          <polyline points="2 12 12 17 22 12"/>
        </svg>
      )
    },
    {
      name: 'Music Production',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l12-2v13"/>
          <circle cx="6" cy="18" r="3"/>
          <circle cx="18" cy="16" r="3"/>
        </svg>
      )
    },
    {
      name: 'Video Editing',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="23 7 16 12 23 17 23 7"/>
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
        </svg>
      )
    },
    {
      name: 'Creative Direction',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="22" y1="12" x2="18" y2="12"/>
          <line x1="6" y1="12" x2="2" y2="12"/>
          <line x1="12" y1="6" x2="12" y2="2"/>
          <line x1="12" y1="22" x2="12" y2="18"/>
        </svg>
      )
    },
  ]

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40">
      {/* Background blur layer */}
      <div className="footer-bg-blur absolute inset-0 pointer-events-none" />

      {/* Content layer */}
      <div className="relative py-4 flex justify-center">
        <div className="flex items-center justify-between gap-3 p-2 rounded-full bg-theme-accent/50 backdrop-blur-sm w-[580px]">
          {skills.map((skill, index) => {
            const isSelected = selectedIndex === index
            return (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                aria-label={skill.name}
                className={`
                  footer-tab cursor-pointer
                  flex items-center justify-center gap-2.5 rounded-full transition-all duration-300 ease-out
                  ${isSelected
                    ? 'bg-inverse text-inverse px-5 py-3'
                    : 'text-theme px-4 py-3 hover:opacity-70'
                  }
                `}
              >
                <span className="shrink-0 pointer-events-none">{skill.icon}</span>
                <span
                  className={`
                    text-xs font-medium uppercase tracking-wide whitespace-nowrap pointer-events-none
                    transition-all duration-300 ease-out overflow-hidden
                    ${isSelected ? 'max-w-[150px] opacity-100' : 'max-w-0 opacity-0'}
                  `}
                >
                  {skill.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </footer>
  )
}
