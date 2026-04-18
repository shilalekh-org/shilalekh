import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.tsx'
import Inscription from './pages/Inscription.tsx'
import About from './pages/About.tsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/inscription/:id" element={<Inscription />} />
      <Route path="/about" element={<About />} />
    </Routes>
  )
}