import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import LampToggle from './components/LampToggle'
import Home from './pages/Home'
import Gallery from './pages/Gallery'
import About from './pages/About'

export default function App() {
  return (
    <>
      <LampToggle />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </>
  )
}
