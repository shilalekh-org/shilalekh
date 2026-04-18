import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Inscription from './pages/Inscription'
import About from './pages/About'
import SignIn from './pages/SignIn'
import Inscriptions from './pages/Inscriptions'
import MapPage from './pages/MapPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/inscription/:id" element={<Inscription />} />
      <Route path="/about" element={<About />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/inscriptions" element={<Inscriptions />} />
      <Route path="/map" element={<MapPage />} />
    </Routes>
  )
}