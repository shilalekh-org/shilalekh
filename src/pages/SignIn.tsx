import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useTheme } from '../theme'

type Mode = 'signin' | 'signup' | 'forgot'

export default function SignIn() {
  const navigate = useNavigate()
  const { c } = useTheme()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
  }

  const handleSubmit = async () => {
    setMessage(null)
    if (!email.trim()) { setMessage({ type: 'error', text: 'Please enter your email.' }); return }

    if (mode === 'forgot') {
      setLoading(true)
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/signin`
      })
      setLoading(false)
      if (error) setMessage({ type: 'error', text: error.message })
      else setMessage({ type: 'success', text: 'Password reset email sent. Please check your inbox.' })
      return
    }

    if (!password) { setMessage({ type: 'error', text: 'Please enter your password.' }); return }

    if (mode === 'signup') {
      if (password.length < 6) { setMessage({ type: 'error', text: 'Password must be at least 6 characters.' }); return }
      if (password !== confirmPassword) { setMessage({ type: 'error', text: 'Passwords do not match.' }); return }
      setLoading(true)
      const { error } = await supabase.auth.signUp({ email: email.trim(), password })
      setLoading(false)
      if (error) setMessage({ type: 'error', text: error.message })
      else setMessage({ type: 'success', text: 'Account created! Please check your email to confirm your account.' })
      return
    }

    // Sign in
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setLoading(false)
    if (error) setMessage({ type: 'error', text: 'Incorrect email or password.' })
    else navigate('/')
  }

  const switchMode = (m: Mode) => {
    setMode(m)
    setMessage(null)
    setPassword('')
    setConfirmPassword('')
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

  return (
    <div style={{ minHeight: '100vh', background: c.bg, color: c.text, fontFamily: 'Georgia, serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

      {/* Logo */}
      <div style={{ cursor: 'pointer', textAlign: 'center', marginBottom: '48px' }} onClick={() => navigate('/')}>
        <p style={{ fontSize: '32px', color: c.gold, letterSpacing: '.05em', marginBottom: '4px' }}>शिलालेख</p>
        <p style={{ fontSize: '11px', color: c.textDim, letterSpacing: '.3em' }}>SHILALEKH</p>
      </div>

      <div style={{ background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: '8px', padding: '40px', width: '100%', maxWidth: '380px' }}>

        {/* Header */}
        <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '8px', textAlign: 'center' }}>
          {mode === 'signin' ? 'WELCOME BACK' : mode === 'signup' ? 'CREATE ACCOUNT' : 'RESET PASSWORD'}
        </p>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 300, color: c.text, marginBottom: '0', textAlign: 'center' }}>
          {mode === 'signin' ? 'Sign in to Shilalekh' : mode === 'signup' ? 'Join Shilalekh' : 'Forgot your password?'}
        </h2>
        <div style={{ width: '30px', height: '0.5px', background: c.gold, margin: '16px auto 24px', opacity: .5 }} />

        {/* Message banner */}
        {message && (
          <div style={{ background: message.type === 'error' ? 'rgba(196,98,45,0.1)' : 'rgba(212,168,67,0.1)', border: `0.5px solid ${message.type === 'error' ? c.orange : c.gold}`, borderRadius: '4px', padding: '10px 14px', marginBottom: '16px' }}>
            <p style={{ fontSize: '12px', color: message.type === 'error' ? c.orange : c.gold, lineHeight: 1.5 }}>{message.text}</p>
          </div>
        )}

        {/* Email field — always shown */}
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          style={inputStyle}
        />

        {/* Password fields — not shown on forgot */}
        {mode !== 'forgot' && (
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={inputStyle}
          />
        )}

        {mode === 'signup' && (
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={{ ...inputStyle, marginBottom: '0' }}
          />
        )}

        {/* Forgot password link */}
        {mode === 'signin' && (
          <div style={{ textAlign: 'right', marginTop: '6px', marginBottom: '6px' }}>
            <span
              onClick={() => switchMode('forgot')}
              style={{ fontSize: '11px', color: c.textDim, cursor: 'pointer', letterSpacing: '.03em' }}
            >Forgot password?</span>
          </div>
        )}

        {/* Primary button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: '100%', background: c.gold, border: 'none', color: '#0a0a0a', padding: '12px 24px', borderRadius: '4px', fontSize: '12px', letterSpacing: '.1em', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600, marginTop: '16px', marginBottom: '16px', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'PLEASE WAIT...' : mode === 'signin' ? 'SIGN IN' : mode === 'signup' ? 'CREATE ACCOUNT' : 'SEND RESET EMAIL'}
        </button>

        {/* Divider + Google — not shown on forgot */}
        {mode !== 'forgot' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ flex: 1, height: '0.5px', background: c.border }} />
              <span style={{ fontSize: '11px', color: c.textFaint, letterSpacing: '.05em' }}>or</span>
              <div style={{ flex: 1, height: '0.5px', background: c.border }} />
            </div>

            <button
              onClick={signInWithGoogle}
              style={{ width: '100%', background: '#fff', border: 'none', color: '#1a1a1a', padding: '12px 24px', borderRadius: '4px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: 500, marginBottom: '24px' }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
                <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
              </svg>
              Continue with Google
            </button>
          </>
        )}

        {/* Mode switcher */}
        <div style={{ textAlign: 'center' }}>
          {mode === 'signin' && (
            <p style={{ fontSize: '12px', color: c.textDim }}>
              Don't have an account?{' '}
              <span onClick={() => switchMode('signup')} style={{ color: c.gold, cursor: 'pointer' }}>Sign up</span>
            </p>
          )}
          {mode === 'signup' && (
            <p style={{ fontSize: '12px', color: c.textDim }}>
              Already have an account?{' '}
              <span onClick={() => switchMode('signin')} style={{ color: c.gold, cursor: 'pointer' }}>Sign in</span>
            </p>
          )}
          {mode === 'forgot' && (
            <p style={{ fontSize: '12px', color: c.textDim }}>
              Remembered it?{' '}
              <span onClick={() => switchMode('signin')} style={{ color: c.gold, cursor: 'pointer' }}>Back to sign in</span>
            </p>
          )}
        </div>

      </div>

      <p style={{ fontSize: '11px', color: c.textFaint, marginTop: '24px', cursor: 'pointer' }} onClick={() => navigate('/')}>← Back to Shilalekh</p>
    </div>
  )
}