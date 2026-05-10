import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useTheme } from '../theme'
import Nav from '../components/Nav'

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

type Msg = { type: 'success' | 'error'; text: string } | null

export default function Account() {
  const navigate = useNavigate()
  const { c } = useTheme()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isGoogleUser, setIsGoogleUser] = useState(false)

  // Profile
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [institution, setInstitution] = useState('')
  const [role, setRole] = useState('')
  const [country, setCountry] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState<Msg>(null)

  // Email
  const [newEmail, setNewEmail] = useState('')
  const [emailSaving, setEmailSaving] = useState(false)
  const [emailMsg, setEmailMsg] = useState<Msg>(null)

  // Password
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState<Msg>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { navigate('/signin'); return }
      setUser(user)
      setIsGoogleUser(user.app_metadata?.provider === 'google')
      const m = user.user_metadata || {}
      setFullName(m.full_name || '')
      setPhone(m.phone || '')
      setInstitution(m.institution || '')
      setRole(m.role || '')
      setCountry(m.country || '')
      setLoading(false)
    })
  }, [navigate])

  const saveProfile = async () => {
    setProfileSaving(true)
    setProfileMsg(null)
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: fullName.trim(),
        phone: phone.trim(),
        institution: institution.trim(),
        role,
        country,
      }
    })
    setProfileSaving(false)
    if (error) setProfileMsg({ type: 'error', text: error.message })
    else setProfileMsg({ type: 'success', text: 'Profile updated successfully.' })
  }

  const saveEmail = async () => {
    if (!newEmail.trim()) { setEmailMsg({ type: 'error', text: 'Please enter a new email address.' }); return }
    setEmailSaving(true)
    setEmailMsg(null)
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() })
    setEmailSaving(false)
    if (error) setEmailMsg({ type: 'error', text: error.message })
    else {
      setEmailMsg({ type: 'success', text: 'Confirmation sent to your new address. Your email will not change until you click the link.' })
      setNewEmail('')
    }
  }

  const savePassword = async () => {
    if (!newPassword) { setPasswordMsg({ type: 'error', text: 'Please enter a new password.' }); return }
    if (newPassword.length < 6) { setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters.' }); return }
    if (newPassword !== confirmPassword) { setPasswordMsg({ type: 'error', text: 'Passwords do not match.' }); return }
    setPasswordSaving(true)
    setPasswordMsg(null)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setPasswordSaving(false)
    if (error) setPasswordMsg({ type: 'error', text: error.message })
    else {
      setPasswordMsg({ type: 'success', text: 'Password updated successfully.' })
      setNewPassword('')
      setConfirmPassword('')
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

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
    appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23888' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 14px center',
    paddingRight: '36px',
  }

  const card: React.CSSProperties = {
    background: c.bgCard,
    border: `0.5px solid ${c.border}`,
    borderRadius: '8px',
    padding: '32px 36px',
    marginBottom: '20px',
  }

  const MsgBox = ({ msg }: { msg: Msg }) => msg ? (
    <div style={{
      background: msg.type === 'error' ? 'rgba(196,98,45,0.1)' : 'rgba(212,168,67,0.1)',
      border: `0.5px solid ${msg.type === 'error' ? c.orange : c.gold}`,
      borderRadius: '4px', padding: '10px 14px', marginBottom: '16px'
    }}>
      <p style={{ fontSize: '12px', color: msg.type === 'error' ? c.orange : c.gold, lineHeight: 1.5, margin: 0 }}>{msg.text}</p>
    </div>
  ) : null

  const SaveBtn = ({ onClick, saving, label, saveLabel }: { onClick: () => void, saving: boolean, label: string, saveLabel: string }) => (
    <button onClick={onClick} disabled={saving} style={{
      background: c.gold, border: 'none', color: '#0a0a0a',
      padding: '10px 24px', borderRadius: '4px', fontSize: '12px',
      letterSpacing: '.1em', cursor: saving ? 'not-allowed' : 'pointer',
      fontWeight: 600, opacity: saving ? 0.5 : 1, marginTop: '4px',
    }}>
      {saving ? saveLabel : label}
    </button>
  )

  if (loading) return (
    <div style={{ minHeight: '100vh', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontSize: '12px', color: c.textDim, letterSpacing: '.1em', fontFamily: 'Arial, sans-serif' }}>LOADING…</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: c.bg, color: c.text, fontFamily: 'Georgia, serif' }}>
      <Nav />
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '100px 24px 60px' }}>

        {/* Header */}
        <div style={{ marginBottom: '36px' }}>
          <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '6px' }}>SETTINGS</p>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 300, color: c.text, margin: '0 0 12px' }}>My account</h1>
          <div style={{ width: '30px', height: '0.5px', background: c.gold, opacity: 0.5, marginBottom: '12px' }} />
          <p style={{ fontSize: '13px', color: c.textDim, margin: 0 }}>
            Signed in as <span style={{ color: c.gold }}>{user?.email}</span>
            {isGoogleUser && (
              <span style={{ marginLeft: '10px', fontSize: '11px', background: 'rgba(212,168,67,0.1)', border: `0.5px solid ${c.gold}`, color: c.gold, padding: '2px 8px', borderRadius: '20px', letterSpacing: '.05em' }}>
                Google account
              </span>
            )}
          </p>
        </div>

        {/* ── Section 1: Profile ── */}
        <div style={card}>
          <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, margin: '0 0 6px' }}>PROFILE</p>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 300, color: c.text, margin: 0 }}>Personal information</h2>
          <div style={{ width: '30px', height: '0.5px', background: c.gold, opacity: 0.5, margin: '14px 0 22px' }} />

          <MsgBox msg={profileMsg} />

          <input type="text" placeholder="Full name" value={fullName}
            onChange={e => setFullName(e.target.value)} style={inputStyle} />
          <input type="tel" placeholder="Phone number (optional)" value={phone}
            onChange={e => setPhone(e.target.value)} style={inputStyle} />
          <input type="text" placeholder="Institution / affiliation (optional)" value={institution}
            onChange={e => setInstitution(e.target.value)} style={inputStyle} />

          <select value={role} onChange={e => setRole(e.target.value)}
            style={{ ...selectStyle, color: role ? c.text : c.textDim }}>
            <option value="">Role / interest (optional)</option>
            {ROLES.map(r => <option key={r} value={r} style={{ background: c.bgCard, color: c.text }}>{r}</option>)}
          </select>

          <select value={country} onChange={e => setCountry(e.target.value)}
            style={{ ...selectStyle, color: country ? c.text : c.textDim }}>
            <option value="">Country (optional)</option>
            {COUNTRIES.map(co => <option key={co} value={co} style={{ background: c.bgCard, color: c.text }}>{co}</option>)}
          </select>

          <SaveBtn onClick={saveProfile} saving={profileSaving} label="SAVE PROFILE" saveLabel="SAVING…" />
        </div>

        {/* ── Section 2: Email ── */}
        <div style={card}>
          <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, margin: '0 0 6px' }}>EMAIL ADDRESS</p>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 300, color: c.text, margin: 0 }}>Change your email</h2>
          <div style={{ width: '30px', height: '0.5px', background: c.gold, opacity: 0.5, margin: '14px 0 22px' }} />

          {isGoogleUser ? (
            <p style={{ fontSize: '13px', color: c.textDim, lineHeight: 1.6, margin: 0 }}>
              Your email is managed by Google and cannot be changed here. To update it, visit your Google account settings.
            </p>
          ) : (
            <>
              <p style={{ fontSize: '13px', color: c.textDim, marginBottom: '16px', lineHeight: 1.6 }}>
                Current: <span style={{ color: c.text }}>{user?.email}</span>
              </p>
              <MsgBox msg={emailMsg} />
              <input type="email" placeholder="New email address" value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveEmail()}
                style={inputStyle} />
              <p style={{ fontSize: '11px', color: c.textFaint, marginBottom: '14px', lineHeight: 1.5 }}>
                A confirmation link will be sent to your new address. Your email will not change until you click it.
              </p>
              <SaveBtn onClick={saveEmail} saving={emailSaving} label="UPDATE EMAIL" saveLabel="SENDING…" />
            </>
          )}
        </div>

        {/* ── Section 3: Password ── */}
        <div style={card}>
          <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, margin: '0 0 6px' }}>PASSWORD</p>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 300, color: c.text, margin: 0 }}>Change your password</h2>
          <div style={{ width: '30px', height: '0.5px', background: c.gold, opacity: 0.5, margin: '14px 0 22px' }} />

          {isGoogleUser ? (
            <p style={{ fontSize: '13px', color: c.textDim, lineHeight: 1.6, margin: 0 }}>
              Your account uses Google Sign-In, so no password is set. To add a password, sign out and use "Forgot password?" with your email address.
            </p>
          ) : (
            <>
              <MsgBox msg={passwordMsg} />
              <input type="password" placeholder="New password" value={newPassword}
                onChange={e => setNewPassword(e.target.value)} style={inputStyle} />
              <input type="password" placeholder="Confirm new password" value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && savePassword()}
                style={inputStyle} />
              <p style={{ fontSize: '11px', color: c.textFaint, marginBottom: '14px', lineHeight: 1.5 }}>
                Minimum 6 characters.
              </p>
              <SaveBtn onClick={savePassword} saving={passwordSaving} label="UPDATE PASSWORD" saveLabel="UPDATING…" />
            </>
          )}
        </div>

        {/* ── Section 4: 2FA (placeholder) ── */}
        <div style={{ ...card, opacity: 0.65 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px' }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, margin: '0 0 6px' }}>SECURITY</p>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 300, color: c.text, margin: 0 }}>Two-factor authentication</h2>
              <div style={{ width: '30px', height: '0.5px', background: c.gold, opacity: 0.5, margin: '14px 0 16px' }} />
              <p style={{ fontSize: '13px', color: c.textDim, lineHeight: 1.6, margin: '0 0 10px' }}>
                Add an extra layer of security to your account. When enabled, you'll need your phone to sign in.
              </p>
              <p style={{ fontSize: '11px', color: c.textFaint, fontStyle: 'italic', margin: 0 }}>
                Coming soon — 2FA will be available in a future update.
              </p>
            </div>
            {/* Placeholder toggle */}
            <div style={{ flexShrink: 0, marginTop: '32px' }}>
              <div style={{
                width: '44px', height: '24px', borderRadius: '20px',
                background: c.border, position: 'relative', cursor: 'not-allowed',
              }}>
                <div style={{
                  position: 'absolute', top: '3px', left: '3px',
                  width: '18px', height: '18px', borderRadius: '50%',
                  background: c.textDim,
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* Back link */}
        <p style={{ fontSize: '11px', color: c.textFaint, marginTop: '8px', cursor: 'pointer', textAlign: 'center' }}
          onClick={() => navigate('/')}>
          ← Back to Shilalekh
        </p>

      </div>
    </div>
  )
}