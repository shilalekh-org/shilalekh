import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Inscription from './pages/Inscription'
import About from './pages/About'
import SignIn from './pages/SignIn'
import Inscriptions from './pages/Inscriptions'
import MapPage from './pages/MapPage'
import Submit from './pages/Submit'
import Admin from './pages/Admin'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Help from './pages/Help'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/inscription/:id" element={<Inscription />} />
      <Route path="/about" element={<About />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/inscriptions" element={<Inscriptions />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/submit" element={<Submit />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/help" element={<Help />} />
    </Routes>
  )
}
