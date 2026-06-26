import { motion } from 'framer-motion'
import { fadeUp, fadeUpSmall, transition } from '../utils/motion'
import { bio, contacts } from '../data/about'

export default function About() {
  return (
    <main className="min-h-screen content-container">
      {/* Desktop layout: side by side */}
      <div className="lg:h-screen lg:grid lg:grid-cols-2 lg:items-center">
        {/* Bio */}
        <section className="page-padding pt-28 pb-8 lg:py-0">
          <motion.div {...fadeUpSmall} transition={transition}>
            <div className="space-y-5 md:space-y-6 text-base md:text-lg leading-relaxed opacity-80 lg:max-w-lg">
              {bio.map((p, i) => <p key={i}>{p}</p>)}
            </div>

            <nav className="mt-10 md:mt-12 pt-6 border-t border-current/10 flex flex-wrap items-center gap-4 md:gap-8">
              {contacts.map((c) => (
                <motion.a
                  key={c.label}
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="label"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {c.label}
                </motion.a>
              ))}
            </nav>
          </motion.div>
        </section>

        {/* Portrait - desktop: centered horizontally, aligned to bottom */}
        <div className="lg:h-full lg:flex lg:items-end lg:justify-center">
          <motion.img
            src="/images/site/linda.png"
            alt="Linda"
            width={1000}
            height={1000}
            className="block w-auto max-w-[80vw] mx-auto lg:max-w-none lg:mx-0 lg:h-[75vh] object-contain"
            {...fadeUp}
            transition={transition}
          />
        </div>
      </div>
    </main>
  )
}
