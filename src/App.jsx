import { Routes, Route } from 'react-router-dom'
import { PanelProvider } from './context/PanelContext'
import Header from './components/Header'
import Home from './pages/Home'
import Gallery from './pages/Gallery'
import About from './pages/About'

export default function App() {
  return (
    <PanelProvider>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </PanelProvider>
  )
}
