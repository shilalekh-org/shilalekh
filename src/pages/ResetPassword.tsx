import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useTheme } from '../theme'

export default function ResetPassword() {
  const navigate = useNavigate()
  const { c } = useTheme()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [sessionReady, setSessionReady] = useState(false)
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    // Only PASSWORD_RECOVERY unlocks the form — not SIGNED_IN.
    // SIGNED_IN fires on normal logins and must not show this form to regular users.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true)
      }
    })

    // If there is no reset code in the URL, the user didn't arrive via a reset email.
    // Fall back to checking for an existing session (e.g. a logged-in user who typed
    // this URL manually — we'll still let them change their password).
    const hasResetCode = new URLSearchParams(window.location.search).has('code')
    if (!hasResetCode) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) setSessionReady(true)
      })
    }

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (sessionReady) return
    const t = setTimeout(() => setExpired(true), 6000)
    return () => clearTimeout(t)
  }, [sessionReady])

  const handleReset = async () => {
    setErrorMsg('')
    if (!password) { setErrorMsg('Please enter a new password.'); return }
    if (password.length < 6) { setErrorMsg('Password must be at least 6 characters.'); return }
    if (password !== confirmPassword) { setErrorMsg('Passwords do not match.'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) {
      setErrorMsg(error.message)
    } else {
      setDone(true)
      setTimeout(() => navigate('/'), 3000)
    }
  }

  const inputStyle = {
    width: '100%',
    background: c.bg,
    border: `0.5px solid ${c.border}`,
    borderRadius: '4px',
    padding: '11px 14px',
    color: c.text,
    fontSize: '13px',
    fontFamily: 'Georgia, serif',
    outline: 'none',
    marginBottom: '10px',
    boxSizing: 'border-box' as const,
  }

  if (done) return (
    <div style={{ minHeight: '100vh', background: c.bg, color: c.text, fontFamily: 'Georgia, serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <div style={{ cursor: 'pointer', textAlign: 'center', marginBottom: '48px' }} onClick={() => navigate('/')}>
        <p style={{ fontSize: '32px', color: c.gold, letterSpacing: '.05em', marginBottom: '4px' }}>शिलालेख</p>
        <p style={{ fontSize: '11px', color: c.textDim, letterSpacing: '.3em' }}>SHILALEKH</p>
      </div>
      <div style={{ background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: '8px', padding: '48px 40px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', margin: '0 auto 24px', border: `0.5px solid ${c.gold}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={c.gold} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
        <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '8px' }}>PASSWORD UPDATED</p>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 300, color: c.text, marginBottom: '16px' }}>You're all set</h2>
        <div style={{ width: '30px', height: '0.5px', background: c.gold, margin: '0 auto 24px', opacity: .5 }} />
        <p style={{ fontSize: '13px', color: c.textDim, lineHeight: 1.7 }}>
          Your password has been updated. Redirecting you to the homepage…
        </p>
      </div>
    </div>
  )

  if (expired && !sessionReady) return (
    <div style={{ minHeight: '100vh', background: c.bg, color: c.text, fontFamily: 'Georgia, serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <div style={{ cursor: 'pointer', textAlign: 'center', marginBottom: '48px' }} onClick={() => navigate('/')}>
        <p style={{ fontSize: '32px', color: c.gold, letterSpacing: '.05em', marginBottom: '4px' }}>शिलालेख</p>
        <p style={{ fontSize: '11px', color: c.textDim, letterSpacing: '.3em' }}>SHILALEKH</p>
      </div>
      <div style={{ background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: '8px', padding: '48px 40px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '8px' }}>LINK EXPIRED</p>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 300, color: c.text, marginBottom: '16px' }}>Reset link is invalid</h2>
        <div style={{ width: '30px', height: '0.5px', background: c.gold, margin: '0 auto 24px', opacity: .5 }} />
        <p style={{ fontSize: '13px', color: c.textDim, lineHeight: 1.7, marginBottom: '28px' }}>
          Password reset links expire after 1 hour or if they have already been used. Please request a new one.
        </p>
        <button onClick={() => navigate('/signin')}
          style={{ background: c.gold, border: 'none', color: '#0a0a0a', padding: '11px 28px', borderRadius: '4px', fontSize: '12px', letterSpacing: '.1em', cursor: 'pointer', fontWeight: 600 }}>
          REQUEST NEW LINK
        </button>
      </div>
    </div>
  )

  if (!sessionReady) return (
    <div style={{ minHeight: '100vh', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontSize: '12px', color: c.textDim, letterSpacing: '.1em', fontFamily: 'Arial, sans-serif' }}>VERIFYING RESET LINK…</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: c.bg, color: c.text, fontFamily: 'Georgia, serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>

      <div style={{ cursor: 'pointer', textAlign: 'center', marginBottom: '48px' }} onClick={() => navigate('/')}>
        <p style={{ fontSize: '32px', color: c.gold, letterSpacing: '.05em', marginBottom: '4px' }}>शिलालेख</p>
        <p style={{ fontSize: '11px', color: c.textDim, letterSpacing: '.3em' }}>SHILALEKH</p>
      </div>

      <div style={{ background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: '8px', padding: '40px', width: '100%', maxWidth: '420px' }}>

        <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '8px', textAlign: 'center' }}>SET NEW PASSWORD</p>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 300, color: c.text, marginBottom: '0', textAlign: 'center' }}>
          Choose a new password
        </h2>
        <div style={{ width: '30px', height: '0.5px', background: c.gold, margin: '16px auto 24px', opacity: .5 }} />

        {errorMsg && (
          <div style={{ background: 'rgba(196,98,45,0.1)', border: `0.5px solid ${c.orange}`, borderRadius: '4px', padding: '10px 14px', marginBottom: '16px' }}>
            <p style={{ fontSize: '12px', color: c.orange, lineHeight: 1.5 }}>{errorMsg}</p>
          </div>
        )}

        <input
          type="password"
          placeholder="New password *"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleReset()}
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Confirm new password *"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleReset()}
          style={inputStyle}
        />

        <p style={{ fontSize: '11px', color: c.textFaint, marginBottom: '16px', lineHeight: 1.5 }}>
          Minimum 6 characters.
        </p>

        <button
          onClick={handleReset}
          disabled={loading}
          style={{ width: '100%', background: c.gold, border: 'none', color: '#0a0a0a', padding: '12px 24px', borderRadius: '4px', fontSize: '12px', letterSpacing: '.1em', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: loading ? 0.5 : 1 }}>
          {loading ? 'UPDATING...' : 'SET NEW PASSWORD'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <span onClick={() => navigate('/signin')}
            style={{ fontSize: '12px', color: c.textDim, cursor: 'pointer' }}>
            Back to sign in
          </span>
        </div>

      </div>

      <p style={{ fontSize: '11px', color: c.textFaint, marginTop: '24px', cursor: 'pointer' }} onClick={() => navigate('/')}>
        ← Back to Shilalekh
      </p>
    </div>
  )
}