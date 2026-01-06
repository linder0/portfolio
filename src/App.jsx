import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import { PanelProvider } from './context/PanelContext'
import Header from './components/Header'

// Lazy load pages for better initial bundle size
const Home = lazy(() => import('./pages/Home'))
const Gallery = lazy(() => import('./pages/Gallery'))
const About = lazy(() => import('./pages/About'))

// Prefetch Gallery after initial load (it's the heaviest page)
const prefetchGallery = () => import('./pages/Gallery')

// Minimal loading fallback - just empty space to avoid layout shift
const PageFallback = () => <div className="min-h-screen bg-theme" />

export default function App() {
  // Prefetch Gallery after initial page load for faster navigation
  useEffect(() => {
    // Wait for page to be interactive, then prefetch heavy chunks
    const timer = setTimeout(() => {
      prefetchGallery()
    }, 2000) // 2s after mount
    return () => clearTimeout(timer)
  }, [])

  return (
    <PanelProvider>
      <Header onGalleryHover={prefetchGallery} />
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
