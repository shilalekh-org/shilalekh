import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { supabase } from './supabase'
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
import ResetPassword from './pages/ResetPassword'
import Account from './pages/Account'
import CompleteProfile from './pages/CompleteProfile'
import ProfilePage from './pages/ProfilePage'

const EXEMPT = ['/complete-profile', '/signin', '/reset-password']

function ProfileGate() {
  const navigate = useNavigate()
  const location = useLocation()
  const completedRef = useRef<boolean | null>(null)

  async function check(userId: string) {
    if (completedRef.current === true) return
    const { data } = await supabase
      .from('profiles').select('profile_completed').eq('id', userId).single()
    const done = data?.profile_completed ?? false
    completedRef.current = done
    if (!done) navigate('/complete-profile')
  }

  // Check on every navigation (skips exempt pages)
  useEffect(() => {
    if (EXEMPT.some(p => location.pathname.startsWith(p))) return
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) check(session.user.id)
    })
  }, [location.pathname])

  // Reset cache on sign-in so fresh users are always checked
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        completedRef.current = null
        if (!EXEMPT.some(p => location.pathname.startsWith(p))) check(session.user.id)
      }
      if (event === 'SIGNED_OUT') completedRef.current = null
    })
    return () => subscription.unsubscribe()
  }, [])

  return null
}

export default function App() {
  return (
    <>
      <ProfileGate />
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
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/account" element={<Account />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/@:handle" element={<ProfilePage />} />
      </Routes>
    </>
  )
}