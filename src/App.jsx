import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { PanelProvider } from './context/PanelContext'
import Header from './components/Header'

// Lazy load pages for better initial bundle size
const Home = lazy(() => import('./pages/Home'))
const Gallery = lazy(() => import('./pages/Gallery'))
const About = lazy(() => import('./pages/About'))

// Minimal loading fallback - just empty space to avoid layout shift
const PageFallback = () => <div className="min-h-screen bg-theme" />

export default function App() {
  return (
    <PanelProvider>
      <Header />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Suspense>
    </PanelProvider>
  )
}
