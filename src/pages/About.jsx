import { motion } from 'framer-motion'
import { fadeUp, ease } from '../utils/motion'

const disciplines = [
  { id: '01', name: 'Web Design' },
  { id: '02', name: 'Digital Design' },
  { id: '03', name: 'Music Production' },
  { id: '04', name: 'Video Editing' },
  { id: '05', name: 'Creative Direction' },
  { id: '06', name: 'Brand Strategy' },
]

const contacts = [
  { label: 'Email', href: 'mailto:hello@lindaxue.com', display: 'hello@lindaxue.com' },
  { label: 'Twitter', href: 'https://twitter.com/lindaxue', display: '@lindaxue' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/lindaxue', display: '/in/lindaxue' },
]

export default function About() {
  return (
    <main className="min-h-screen pt-32 pb-24 content-container">
      <section className="page-padding">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left Column - Bio */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.8, ease }}
          >
            <h1 className="font-display text-4xl md:text-5xl mb-12">About</h1>

            <div className="space-y-6 text-lg leading-relaxed opacity-80">
              <p>
                I'm a multi-disciplinary creative designer based in New York, crafting
                experiences that span digital and physical mediums. My work sits at
                the intersection of design, technology, and art.
              </p>
              <p>
                With a background in both visual design and music production, I bring
                a unique perspective to every project — understanding rhythm, composition,
                and emotional resonance across all creative disciplines.
              </p>
              <p>
                I believe in minimal aesthetics with maximum impact. Every element
                should serve a purpose, every interaction should feel intentional,
                and every experience should leave a lasting impression.
              </p>
            </div>

            {/* Contact Links */}
            <div className="mt-16 pt-8 border-t border-current/10">
              <h2 className="label opacity-50 mb-6">
                Get in Touch
              </h2>
              <div className="space-y-3">
                {contacts.map((contact) => (
                  <a
                    key={contact.label}
                    href={contact.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-lg hover:opacity-70 transition-opacity"
                  >
                    <span className="opacity-50 mr-4">{contact.label}</span>
                    {contact.display}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column - Disciplines */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.8, delay: 0.2, ease }}
          >
            <div className="space-y-0">
              {disciplines.map((discipline, index) => (
                <motion.div
                  key={discipline.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.3 + index * 0.1,
                    ease
                  }}
                  className={`group py-6 cursor-default ${index < disciplines.length - 1 ? 'border-b border-current/10' : ''}`}
                >
                  <div className="flex items-center gap-6 transition-transform duration-300 group-hover:translate-x-4">
                    <span className="text-sm opacity-30 font-mono">
                      {discipline.id}
                    </span>
                    <span className="font-display text-2xl md:text-3xl">
                      {discipline.name}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
