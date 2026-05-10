import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Turnstile } from '@marsidev/react-turnstile'
import { supabase } from '../supabase'
import { useTheme } from '../theme'

type Mode = 'signin' | 'signup' | 'forgot' | 'check-email'

const ROLES = ['Researcher', 'Academic', 'Student', 'Museum / Heritage professional', 'Enthusiast', 'Other']

const COUNTRIES = [
  'India', 'Pakistan', 'Bangladesh', 'Sri Lanka', 'Nepal', 'Bhutan', 'Afghanistan',
  'Myanmar', 'Thailand', 'Cambodia', 'Vietnam', 'Indonesia', 'Malaysia',
  'Iran', 'Iraq', 'Turkey', 'Egypt',
  'United Kingdom', 'United States', 'Canada', 'Australia', 'Germany',
  'France', 'Italy', 'Spain', 'Netherlands', 'Sweden', 'Norway', 'Denmark',
  'Japan', 'China', 'South Korea', 'Singapore',
  'Brazil', 'Argentina', 'Mexico',
  'South Africa', 'Nigeria', 'Kenya',
  'Other',
]

export default function SignIn() {
  const navigate = useNavigate()
  const { c, theme } = useTheme()
  const [mode, setMode] = useState<Mode>('signin')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [institution, setInstitution] = useState('')
  const [role, setRole] = useState('')
  const [country, setCountry] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [agreeAccuracy, setAgreeAccuracy] = useState(false)
  const [agreeMarketing, setAgreeMarketing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [signedUpEmail, setSignedUpEmail] = useState('')
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [turnstileKey, setTurnstileKey] = useState(0)

  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY

  const verifyTurnstile = async (token: string) => {
    const res = await fetch('/api/verify-turnstile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
    const data = await res.json()
    return data.success as boolean
  }

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
  }

  const handleSubmit = async () => {
    setMessage(null)
    if (!email.trim()) { setMessage({ type: 'error', text: 'Please enter your email.' }); return }

    if (mode === 'forgot') {
      setLoading(true)
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,  // ← FIXED
      })
      setLoading(false)
      if (error) setMessage({ type: 'error', text: error.message })
      else setMessage({ type: 'success', text: 'Password reset email sent. Please check your inbox.' })
      return
    }

    if (!turnstileToken) {
      setMessage({ type: 'error', text: 'Security check not complete. Please wait a moment.' })
      return
    }

    if (!password) { setMessage({ type: 'error', text: 'Please enter your password.' }); return }

    if (mode === 'signup') {
      if (!fullName.trim()) { setMessage({ type: 'error', text: 'Please enter your full name.' }); return }
      if (password.length < 6) { setMessage({ type: 'error', text: 'Password must be at least 6 characters.' }); return }
      if (password !== confirmPassword) { setMessage({ type: 'error', text: 'Passwords do not match.' }); return }
      if (!agreeTerms) { setMessage({ type: 'error', text: 'Please agree to the Privacy Policy, Terms of Service, and data processing consent.' }); return }
      if (!agreeAccuracy) { setMessage({ type: 'error', text: 'Please confirm the data accuracy agreement.' }); return }
    }

    setLoading(true)

    const verified = await verifyTurnstile(turnstileToken)
    if (!verified) {
      setLoading(false)
      setMessage({ type: 'error', text: 'Security check failed. Please refresh and try again.' })
      setTurnstileToken(null)
      setTurnstileKey(k => k + 1)
      return
    }

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone.trim(),
            institution: institution.trim(),
            role,
            country,
            marketing_opt_in: agreeMarketing,
          },
        },
      })
      setLoading(false)
      if (error) {
        setMessage({ type: 'error', text: error.message })
        setTurnstileToken(null)
        setTurnstileKey(k => k + 1)
      } else {
        setSignedUpEmail(email.trim())
        setMode('check-email')
        fetch('/api/send-welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), name: fullName.trim() }),
        }).catch(() => {})
      }
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setLoading(false)
    if (error) {
      setMessage({ type: 'error', text: 'Incorrect email or password.' })
      setTurnstileToken(null)
      setTurnstileKey(k => k + 1)
    } else {
      navigate('/')
    }
  }

  const switchMode = (m: Mode) => {
    setMode(m)
    setMessage(null)
    setPassword('')
    setConfirmPassword('')
    setFullName('')
    setPhone('')
    setInstitution('')
    setRole('')
    setCountry('')
    setAgreeTerms(false)
    setAgreeAccuracy(false)
    setAgreeMarketing(false)
    setTurnstileToken(null)
    setTurnstileKey(k => k + 1)
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

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
    appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23888' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 14px center',
    paddingRight: '36px',
  }

  const checkboxRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    marginBottom: '12px',
  }

  const checkboxStyle: React.CSSProperties = {
    width: '16px',
    height: '16px',
    marginTop: '1px',
    flexShrink: 0,
    accentColor: c.gold,
    cursor: 'pointer',
  }

  const checkboxLabelStyle: React.CSSProperties = {
    fontSize: '12px',
    color: c.textDim,
    lineHeight: 1.5,
    cursor: 'pointer',
  }

  // ── CHECK EMAIL SCREEN ──
  if (mode === 'check-email') {
    return (
      <div style={{ minHeight: '100vh', background: c.bg, color: c.text, fontFamily: 'Georgia, serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ cursor: 'pointer', textAlign: 'center', marginBottom: '48px' }} onClick={() => navigate('/')}>
          <p style={{ fontSize: '32px', color: c.gold, letterSpacing: '.05em', marginBottom: '4px' }}>शिलालेख</p>
          <p style={{ fontSize: '11px', color: c.textDim, letterSpacing: '.3em' }}>SHILALEKH</p>
        </div>

        <div style={{ background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: '8px', padding: '48px 40px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', margin: '0 auto 24px', border: `0.5px solid ${c.gold}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.8 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={c.gold} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="M2 7l10 7 10-7"/>
            </svg>
          </div>

          <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '8px' }}>ALMOST THERE</p>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 300, color: c.text, marginBottom: '16px' }}>Check your inbox</h2>
          <div style={{ width: '30px', height: '0.5px', background: c.gold, margin: '0 auto 24px', opacity: .5 }} />

          <p style={{ fontSize: '13px', color: c.textDim, lineHeight: 1.7, marginBottom: '8px' }}>
            We sent a confirmation link to
          </p>
          <p style={{ fontSize: '14px', color: c.gold, marginBottom: '24px', wordBreak: 'break-all' }}>
            {signedUpEmail}
          </p>
          <p style={{ fontSize: '12px', color: c.textDim, lineHeight: 1.7, marginBottom: '32px' }}>
            Click the link in the email to activate your account.
            The link expires in 24 hours.
          </p>

          <div style={{ borderTop: `0.5px solid ${c.borderLight}`, paddingTop: '24px' }}>
            <p style={{ fontSize: '11px', color: c.textFaint, marginBottom: '12px' }}>
              Didn't receive it? Check your spam folder or
            </p>
            <span
              onClick={() => switchMode('signup')}
              style={{ fontSize: '12px', color: c.gold, cursor: 'pointer', letterSpacing: '.05em' }}
            >
              try again with a different email
            </span>
          </div>
        </div>

        <p style={{ fontSize: '11px', color: c.textFaint, marginTop: '24px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          ← Back to Shilalekh
        </p>
      </div>
    )
  }

  // ── MAIN AUTH SCREEN ──
  return (
    <div style={{ minHeight: '100vh', background: c.bg, color: c.text, fontFamily: 'Georgia, serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>

      <div style={{ cursor: 'pointer', textAlign: 'center', marginBottom: '48px' }} onClick={() => navigate('/')}>
        <p style={{ fontSize: '32px', color: c.gold, letterSpacing: '.05em', marginBottom: '4px' }}>शिलालेख</p>
        <p style={{ fontSize: '11px', color: c.textDim, letterSpacing: '.3em' }}>SHILALEKH</p>
      </div>

      <div style={{ background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: '8px', padding: '40px', width: '100%', maxWidth: '420px' }}>

        <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '8px', textAlign: 'center' }}>
          {mode === 'signin' ? 'WELCOME BACK' : mode === 'signup' ? 'CREATE ACCOUNT' : 'RESET PASSWORD'}
        </p>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 300, color: c.text, marginBottom: '0', textAlign: 'center' }}>
          {mode === 'signin' ? 'Sign in to Shilalekh' : mode === 'signup' ? 'Join Shilalekh' : 'Forgot your password?'}
        </h2>
        <div style={{ width: '30px', height: '0.5px', background: c.gold, margin: '16px auto 24px', opacity: .5 }} />

        {message && (
          <div style={{ background: message.type === 'error' ? 'rgba(196,98,45,0.1)' : 'rgba(212,168,67,0.1)', border: `0.5px solid ${message.type === 'error' ? c.orange : c.gold}`, borderRadius: '4px', padding: '10px 14px', marginBottom: '16px' }}>
            <p style={{ fontSize: '12px', color: message.type === 'error' ? c.orange : c.gold, lineHeight: 1.5 }}>{message.text}</p>
          </div>
        )}

        {mode === 'signup' && (
          <input type="text" placeholder="Full name *" value={fullName}
            onChange={e => setFullName(e.target.value)} style={inputStyle} />
        )}

        <input type="email" placeholder="Email address *" value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          style={inputStyle} />

        {mode === 'signup' && (
          <input type="tel" placeholder="Phone number (optional)" value={phone}
            onChange={e => setPhone(e.target.value)} style={inputStyle} />
        )}

        {mode !== 'forgot' && (
          <input type="password" placeholder="Password *" value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={inputStyle} />
        )}

        {mode === 'signup' && (
          <input type="password" placeholder="Confirm password *" value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)} style={inputStyle} />
        )}

        {mode === 'signup' && (
          <>
            <input type="text" placeholder="Institution / affiliation (optional)"
              value={institution} onChange={e => setInstitution(e.target.value)} style={inputStyle} />

            <select value={role} onChange={e => setRole(e.target.value)}
              style={{ ...selectStyle, color: role ? c.text : c.textDim }}>
              <option value="" disabled>Role / interest (optional)</option>
              {ROLES.map(r => <option key={r} value={r} style={{ background: c.bgCard, color: c.text }}>{r}</option>)}
            </select>

            <select value={country} onChange={e => setCountry(e.target.value)}
              style={{ ...selectStyle, color: country ? c.text : c.textDim }}>
              <option value="" disabled>Country (optional)</option>
              {COUNTRIES.map(co => <option key={co} value={co} style={{ background: c.bgCard, color: c.text }}>{co}</option>)}
            </select>

            <div style={{ borderTop: `0.5px solid ${c.borderLight}`, paddingTop: '16px', marginTop: '6px', marginBottom: '4px' }}>

              <div style={checkboxRowStyle}>
                <input type="checkbox" id="agreeTerms" checked={agreeTerms}
                  onChange={e => setAgreeTerms(e.target.checked)} style={checkboxStyle} />
                <label htmlFor="agreeTerms" style={checkboxLabelStyle}>
                  I agree to the{' '}
                  <span onClick={() => navigate('/privacy')} style={{ color: c.gold, cursor: 'pointer', textDecoration: 'underline' }}>Privacy Policy</span>
                  {' '}and{' '}
                  <span onClick={() => navigate('/terms')} style={{ color: c.gold, cursor: 'pointer', textDecoration: 'underline' }}>Terms of Service</span>
                  , and consent to my personal data being processed and stored in India *
                </label>
              </div>

              <div style={checkboxRowStyle}>
                <input type="checkbox" id="agreeAccuracy" checked={agreeAccuracy}
                  onChange={e => setAgreeAccuracy(e.target.checked)} style={checkboxStyle} />
                <label htmlFor="agreeAccuracy" style={checkboxLabelStyle}>
                  I confirm that any inscription data I submit is accurate to the best of my knowledge *
                </label>
              </div>

              <div style={checkboxRowStyle}>
                <input type="checkbox" id="agreeMarketing" checked={agreeMarketing}
                  onChange={e => setAgreeMarketing(e.target.checked)} style={checkboxStyle} />
                <label htmlFor="agreeMarketing" style={checkboxLabelStyle}>
                  Send me occasional updates about new inscriptions and features (optional)
                </label>
              </div>

            </div>
          </>
        )}

        {mode === 'signin' && (
          <div style={{ textAlign: 'right', marginTop: '2px', marginBottom: '6px' }}>
            <span onClick={() => switchMode('forgot')}
              style={{ fontSize: '11px', color: c.textDim, cursor: 'pointer', letterSpacing: '.03em' }}>
              Forgot password?
            </span>
          </div>
        )}

        {mode !== 'forgot' && (
          <div style={{ margin: '16px 0 8px' }}>
            <Turnstile
              key={turnstileKey}
              siteKey={siteKey}
              onSuccess={token => setTurnstileToken(token)}
              onError={() => setTurnstileToken(null)}
              onExpire={() => setTurnstileToken(null)}
              options={{ theme: theme === 'dark' ? 'dark' : 'light', size: 'normal' }}
            />
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading || (mode !== 'forgot' && !turnstileToken)}
          style={{ width: '100%', background: c.gold, border: 'none', color: '#0a0a0a', padding: '12px 24px', borderRadius: '4px', fontSize: '12px', letterSpacing: '.1em', cursor: (loading || (mode !== 'forgot' && !turnstileToken)) ? 'not-allowed' : 'pointer', fontWeight: 600, marginTop: '8px', marginBottom: '16px', opacity: (loading || (mode !== 'forgot' && !turnstileToken)) ? 0.5 : 1 }}>
          {loading ? 'PLEASE WAIT...' : mode === 'signin' ? 'SIGN IN' : mode === 'signup' ? 'CREATE ACCOUNT' : 'SEND RESET EMAIL'}
        </button>

        {mode !== 'forgot' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ flex: 1, height: '0.5px', background: c.border }} />
              <span style={{ fontSize: '11px', color: c.textFaint, letterSpacing: '.05em' }}>or</span>
              <div style={{ flex: 1, height: '0.5px', background: c.border }} />
            </div>

            <button onClick={signInWithGoogle}
              style={{ width: '100%', background: '#fff', border: 'none', color: '#1a1a1a', padding: '12px 24px', borderRadius: '4px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: 500, marginBottom: '24px' }}>
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

      <p style={{ fontSize: '11px', color: c.textFaint, marginTop: '24px', cursor: 'pointer' }} onClick={() => navigate('/')}>
        ← Back to Shilalekh
      </p>
    </div>
  )
}