import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useTheme } from '../theme'

function LogoIcon({ theme = 'dark' }: { theme?: string }) {
  const gold = theme === 'dark' ? '#d4a843' : '#8a6c28'
  const fill = theme === 'dark' ? '#1a1500' : '#f5f0e0'
  return (
    <svg width="28" height="44" viewBox="0 0 58 92" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 7 Q3 2 8 2 L50 2 Q55 2 55 7 L55 85 Q55 90 50 90 L8 90 Q3 90 3 85 Z"
        fill={fill} stroke={gold} strokeWidth="1"/>
      <circle cx="29" cy="26" r="13" fill="none" stroke={gold} strokeWidth="1.2"/>
      <circle cx="29" cy="26" r="5.5" fill={gold}/>
      <line x1="29" y1="9"  x2="29" y2="5"   stroke={gold} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="12" y1="26" x2="8"  y2="26"  stroke={gold} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="46" y1="26" x2="50" y2="26"  stroke={gold} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="19.8" y1="16.8" x2="17.4" y2="14.4" stroke={gold} strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="38.2" y1="35.2" x2="40.6" y2="37.6" stroke={gold} strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="38.2" y1="16.8" x2="40.6" y2="14.4" stroke={gold} strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="19.8" y1="35.2" x2="17.4" y2="37.6" stroke={gold} strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="8" y1="46" x2="50" y2="46" stroke={gold} strokeWidth="0.5" opacity="0.4"/>
      <circle cx="29" cy="66" r="13" fill="none" stroke={gold} strokeWidth="1.2"/>
      <circle cx="34" cy="62" r="11" fill={fill}/>
      <circle cx="18" cy="56" r="1"   fill={gold}/>
      <circle cx="43" cy="58" r="0.9" fill={gold} opacity="0.7"/>
      <circle cx="16" cy="73" r="0.9" fill={gold} opacity="0.6"/>
      <circle cx="45" cy="75" r="1"   fill={gold} opacity="0.8"/>
      <circle cx="51" cy="85" r="3"   fill="#c4622d"/>
    </svg>
  )
}

export default function Nav() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const navBg = theme === 'dark' ? 'rgba(10,10,10,0.97)' : 'rgba(250,248,243,0.97)'
  const navBorder = theme === 'dark' ? '#2a2a2a' : '#e0ddd5'
  const linkColor = theme === 'dark' ? '#888780' : '#6a6860'
  const logoLatinColor = theme === 'dark' ? '#e8e4d9' : '#1a1a18'
  const menuBg = theme === 'dark' ? '#0a0a0a' : '#faf8f3'

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
    { label: 'CONTRIBUTE', path: '/submit' },
    { label: 'ABOUT', path: '/about' },
  ]

  return (
    <>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: navBg, borderBottom: `0.5px solid ${navBorder}` }}>
        <div style={{ padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flexShrink: 0 }}
            onClick={() => { navigate('/'); setMenuOpen(false) }}>
            <LogoIcon theme={theme} />
            <div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '14px', color: '#d4a843', letterSpacing: '2px', opacity: .85, lineHeight: 1 }}>शिलालेख</div>
              <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: logoLatinColor, letterSpacing: '3px', fontWeight: 300, lineHeight: 1.3 }}>SHILALEKH</div>
            </div>
          </div>

          {/* Desktop links */}
          <div className="desktop-nav">
            {links.map(link => (
              <span key={link.path} onClick={() => navigate(link.path)}
                style={{ fontSize: '11px', color: linkColor, letterSpacing: '.1em', cursor: 'pointer' }}>
                {link.label}
              </span>
            ))}
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '11px', color: '#d4a843', letterSpacing: '.05em' }}>
                  {user.email?.split('@')[0].toUpperCase()}
                </span>
                <button onClick={signOut} style={{ background: 'transparent', border: `0.5px solid ${linkColor}`, color: linkColor, padding: '6px 16px', borderRadius: '4px', fontSize: '11px', letterSpacing: '.1em', cursor: 'pointer' }}>
                  SIGN OUT
                </button>
              </div>
            ) : (
              <button onClick={() => navigate('/signin')} style={{ background: 'transparent', border: '0.5px solid #d4a843', color: '#d4a843', padding: '6px 16px', borderRadius: '4px', fontSize: '11px', letterSpacing: '.1em', cursor: 'pointer' }}>
                SIGN IN
              </button>
            )}

            {/* Theme toggle */}
            <button onClick={toggleTheme} title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center' }}>
              {theme === 'dark' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888780" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6a6860" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>
          </div>

          {/* Hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="hamburger">
            <span style={{ display: 'block', width: '22px', height: '1px', background: menuOpen ? '#d4a843' : linkColor }}></span>
            <span style={{ display: 'block', width: '22px', height: '1px', background: menuOpen ? '#d4a843' : linkColor }}></span>
            <span style={{ display: 'block', width: '22px', height: '1px', background: menuOpen ? '#d4a843' : linkColor }}></span>
          </button>

        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ position: 'fixed', top: '60px', left: 0, right: 0, zIndex: 999, background: menuBg, borderBottom: `0.5px solid ${navBorder}`, padding: '16px 24px', display: 'flex', flexDirection: 'column' }}>
          {links.map(link => (
            <span key={link.path} onClick={() => { navigate(link.path); setMenuOpen(false) }}
              style={{ fontSize: '12px', color: linkColor, letterSpacing: '.1em', cursor: 'pointer', padding: '14px 0', borderBottom: `0.5px solid ${navBorder}` }}>
              {link.label}
            </span>
          ))}
          {user ? (
            <>
              <span style={{ fontSize: '11px', color: '#d4a843', letterSpacing: '.05em', padding: '14px 0', borderBottom: `0.5px solid ${navBorder}` }}>
                {user.email?.split('@')[0].toUpperCase()}
              </span>
              <span onClick={signOut} style={{ fontSize: '12px', color: linkColor, letterSpacing: '.1em', cursor: 'pointer', padding: '14px 0', borderBottom: `0.5px solid ${navBorder}` }}>
                SIGN OUT
              </span>
            </>
          ) : (
            <span onClick={() => { navigate('/signin'); setMenuOpen(false) }}
              style={{ fontSize: '12px', color: '#d4a843', letterSpacing: '.1em', cursor: 'pointer', padding: '14px 0', borderBottom: `0.5px solid ${navBorder}` }}>
              SIGN IN
            </span>
          )}
          <span onClick={toggleTheme} style={{ fontSize: '12px', color: linkColor, letterSpacing: '.1em', cursor: 'pointer', padding: '14px 0' }}>
            {theme === 'dark' ? '☀ LIGHT MODE' : '☾ DARK MODE'}
          </span>
        </div>
      )}
    </>
  )
}