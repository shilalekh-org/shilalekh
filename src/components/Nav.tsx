import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export default function Nav() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setMenuOpen(false)
  }

  const links = [
    { label: 'EXPLORE', path: '/map' },
    { label: 'INSCRIPTIONS', path: '/inscriptions' },
    { label: 'CONTRIBUTE', path: '/contribute' },
    { label: 'ABOUT', path: '/about' },
  ]

  return (
    <>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: 'rgba(10,10,10,0.97)', borderBottom: '0.5px solid #2a2a2a', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flexShrink: 0 }} onClick={() => { navigate('/'); setMenuOpen(false) }}>
          <span style={{ fontSize: '20px', color: '#d4a843', letterSpacing: '.05em' }}>शिलालेख</span>
          <span style={{ fontSize: '11px', color: '#555250', letterSpacing: '.2em' }}>SHILALEKH</span>
        </div>

        {/* Desktop links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px', '@media(max-width:768px)': { display: 'none' } as any }}>
          <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            {links.map(link => (
              <span key={link.path} onClick={() => navigate(link.path)} style={{ fontSize: '12px', color: '#888780', letterSpacing: '.1em', cursor: 'pointer' }}>{link.label}</span>
            ))}
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '11px', color: '#d4a843', letterSpacing: '.05em' }}>{user.email?.split('@')[0].toUpperCase()}</span>
                <button onClick={signOut} style={{ background: 'transparent', border: '0.5px solid #555250', color: '#555250', padding: '6px 16px', borderRadius: '4px', fontSize: '11px', letterSpacing: '.1em', cursor: 'pointer' }}>SIGN OUT</button>
              </div>
            ) : (
              <button onClick={() => navigate('/signin')} style={{ background: 'transparent', border: '0.5px solid #d4a843', color: '#d4a843', padding: '6px 16px', borderRadius: '4px', fontSize: '11px', letterSpacing: '.1em', cursor: 'pointer' }}>SIGN IN</button>
            )}
          </div>
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="hamburger"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px', display: 'none', flexDirection: 'column', gap: '5px' }}
        >
          <span style={{ display: 'block', width: '22px', height: '1px', background: menuOpen ? '#d4a843' : '#888780' }}></span>
          <span style={{ display: 'block', width: '22px', height: '1px', background: menuOpen ? '#d4a843' : '#888780' }}></span>
          <span style={{ display: 'block', width: '22px', height: '1px', background: menuOpen ? '#d4a843' : '#888780' }}></span>
        </button>

      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ position: 'fixed', top: '60px', left: 0, right: 0, zIndex: 999, background: '#0a0a0a', borderBottom: '0.5px solid #2a2a2a', padding: '16px 32px', display: 'flex', flexDirection: 'column', gap: '0' }}>
          {links.map(link => (
            <span key={link.path} onClick={() => { navigate(link.path); setMenuOpen(false) }} style={{ fontSize: '12px', color: '#888780', letterSpacing: '.1em', cursor: 'pointer', padding: '14px 0', borderBottom: '0.5px solid #1e1e1e' }}>{link.label}</span>
          ))}
          {user ? (
            <>
              <span style={{ fontSize: '11px', color: '#d4a843', letterSpacing: '.05em', padding: '14px 0', borderBottom: '0.5px solid #1e1e1e' }}>{user.email?.split('@')[0].toUpperCase()}</span>
              <span onClick={signOut} style={{ fontSize: '12px', color: '#555250', letterSpacing: '.1em', cursor: 'pointer', padding: '14px 0' }}>SIGN OUT</span>
            </>
          ) : (
            <span onClick={() => { navigate('/signin'); setMenuOpen(false) }} style={{ fontSize: '12px', color: '#d4a843', letterSpacing: '.1em', cursor: 'pointer', padding: '14px 0' }}>SIGN IN</span>
          )}
        </div>
      )}
    </>
  )
}