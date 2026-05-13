import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useTheme } from '../theme'
import Nav from '../components/Nav'
import { AvatarPicker, AvatarDisplay } from '../lib/avatars'

const ROLES    = ['Researcher', 'Academic', 'Student', 'Museum / Heritage professional', 'Enthusiast', 'Other']
const COUNTRIES = [
  'India', 'Pakistan', 'Bangladesh', 'Sri Lanka', 'Nepal', 'Bhutan', 'Afghanistan',
  'Myanmar', 'Thailand', 'Cambodia', 'Vietnam', 'Indonesia', 'Malaysia',
  'Iran', 'Iraq', 'Turkey', 'Egypt',
  'United Kingdom', 'United States', 'Canada', 'Australia', 'Germany',
  'France', 'Italy', 'Spain', 'Netherlands', 'Sweden', 'Norway', 'Denmark',
  'Japan', 'China', 'South Korea', 'Singapore',
  'Brazil', 'Argentina', 'Mexico', 'South Africa', 'Nigeria', 'Kenya', 'Other',
]

const HANDLE_REGEX  = /^[a-z0-9_]{3,20}$/
const ORCID_REGEX   = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/
type Msg = { type: 'success' | 'error'; text: string } | null

export default function Account() {
  const navigate = useNavigate()
  const { c } = useTheme()
  const [user, setUser]       = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isGoogleUser, setIsGoogleUser] = useState(false)

  // ── Public profile ──
  const [avatar, setAvatar]           = useState('surya')
  const [handle, setHandle]           = useState('')
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio]                 = useState('')
  const [orcidId, setOrcidId]         = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg]   = useState<Msg>(null)
  const [handleStatus, setHandleStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle')
  const [originalHandle, setOriginalHandle] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Personal info ──
  const [fullName, setFullName]       = useState('')
  const [phone, setPhone]             = useState('')
  const [institution, setInstitution] = useState('')
  const [role, setRole]               = useState('')
  const [country, setCountry]         = useState('')
  const [infoSaving, setInfoSaving]   = useState(false)
  const [infoMsg, setInfoMsg]         = useState<Msg>(null)

  // ── Email ──
  const [newEmail, setNewEmail]       = useState('')
  const [emailSaving, setEmailSaving] = useState(false)
  const [emailMsg, setEmailMsg]       = useState<Msg>(null)

  // ── Password ──
  const [newPassword, setNewPassword]           = useState('')
  const [confirmPassword, setConfirmPassword]   = useState('')
  const [passwordSaving, setPasswordSaving]     = useState(false)
  const [passwordMsg, setPasswordMsg]           = useState<Msg>(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { navigate('/signin'); return }
      setUser(user)
      setIsGoogleUser(user.app_metadata?.provider === 'google')
      const m = user.user_metadata || {}
      setFullName(m.full_name || '')
      setPhone(m.phone || '')
      setInstitution(m.institution || '')
      setRole(m.role || '')
      setCountry(m.country || '')

      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (prof) {
        setAvatar(prof.avatar_id || 'surya')
        setHandle(prof.handle || '')
        setOriginalHandle(prof.handle || '')
        setDisplayName(prof.display_name || '')
        setBio(prof.bio || '')
        setOrcidId(prof.orcid_id || '')
        setIsAnonymous(prof.is_anonymous || false)
      }
      setLoading(false)
    })
  }, [navigate])

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) navigate('/')
    })
    return () => subscription.unsubscribe()
  }, [navigate])

  // Debounced handle check
  useEffect(() => {
    if (!handle || handle === originalHandle) { setHandleStatus('idle'); return }
    if (!HANDLE_REGEX.test(handle)) { setHandleStatus('invalid'); return }
    setHandleStatus('checking')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const { data } = await supabase.from('profiles').select('id').eq('handle', handle).neq('id', user?.id ?? '').maybeSingle()
      setHandleStatus(data ? 'taken' : 'available')
    }, 600)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [handle, user?.id, originalHandle])

  const handleStatusColor = { idle: c.textFaint, checking: c.textDim, available: '#4a9e6a', taken: c.orange, invalid: c.orange }[handleStatus]
  const handleStatusText  = {
    idle:      handle === originalHandle ? (handle ? `Your current handle is @${handle}` : '') : 'Letters a–z, numbers, underscores. 3–20 chars.',
    checking:  'Checking availability…',
    available: `@${handle} is available`,
    taken:     `@${handle} is already taken`,
    invalid:   'Use only a–z, 0–9, underscores. Min 3, max 20 characters.',
  }[handleStatus]

  // ORCID format validation (live)
  const orcidRaw    = orcidId.replace(/\s/g, '')
  const orcidValid  = orcidRaw === '' || ORCID_REGEX.test(orcidRaw)
  const orcidStatus = orcidRaw === '' ? null : orcidValid ? 'valid' : 'invalid'

  const savePublicProfile = async () => {
    setProfileMsg(null)
    if (!handle.trim()) { setProfileMsg({ type: 'error', text: 'Handle is required.' }); return }
    if (!HANDLE_REGEX.test(handle)) { setProfileMsg({ type: 'error', text: 'Invalid handle format.' }); return }
    if (handleStatus === 'taken') { setProfileMsg({ type: 'error', text: 'That handle is already taken.' }); return }
    if (handleStatus === 'checking') { setProfileMsg({ type: 'error', text: 'Please wait — checking handle.' }); return }
    if (orcidRaw && !ORCID_REGEX.test(orcidRaw)) { setProfileMsg({ type: 'error', text: 'ORCID iD format is invalid. Expected: 0000-0000-0000-0000' }); return }

    setProfileSaving(true)
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      handle: handle.trim().toLowerCase(),
      display_name: isAnonymous ? null : displayName.trim() || null,
      bio:          isAnonymous ? null : bio.trim() || null,
      orcid_id:     orcidRaw || null,
      avatar_id:    avatar,
      is_anonymous: isAnonymous,
      profile_completed: true,
    })
    setProfileSaving(false)
    if (error) {
      if (error.code === '23505') setProfileMsg({ type: 'error', text: 'That handle was just taken. Try another.' })
      else setProfileMsg({ type: 'error', text: error.message })
    } else {
      setOriginalHandle(handle.trim().toLowerCase())
      setHandleStatus('idle')
      setProfileMsg({ type: 'success', text: 'Public profile updated.' })
    }
  }

  const savePersonalInfo = async () => {
    setInfoSaving(true); setInfoMsg(null)
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName.trim(), phone: phone.trim(), institution: institution.trim(), role, country }
    })
    setInfoSaving(false)
    if (error) setInfoMsg({ type: 'error', text: error.message })
    else setInfoMsg({ type: 'success', text: 'Personal information updated.' })
  }

  const saveEmail = async () => {
    if (!newEmail.trim()) { setEmailMsg({ type: 'error', text: 'Please enter a new email.' }); return }
    setEmailSaving(true); setEmailMsg(null)
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() })
    setEmailSaving(false)
    if (error) setEmailMsg({ type: 'error', text: error.message })
    else { setEmailMsg({ type: 'success', text: 'Confirmation sent. Email changes after you click the link.' }); setNewEmail('') }
  }

  const savePassword = async () => {
    if (!newPassword) { setPasswordMsg({ type: 'error', text: 'Please enter a new password.' }); return }
    if (newPassword.length < 6) { setPasswordMsg({ type: 'error', text: 'Minimum 6 characters.' }); return }
    if (newPassword !== confirmPassword) { setPasswordMsg({ type: 'error', text: 'Passwords do not match.' }); return }
    setPasswordSaving(true); setPasswordMsg(null)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setPasswordSaving(false)
    if (error) setPasswordMsg({ type: 'error', text: error.message })
    else { setPasswordMsg({ type: 'success', text: 'Password updated.' }); setNewPassword(''); setConfirmPassword('') }
  }

  const inputStyle = {
    width: '100%', background: c.bg, border: `0.5px solid ${c.border}`, borderRadius: '4px',
    padding: '11px 14px', color: c.text, fontSize: '13px', fontFamily: 'Georgia, serif',
    outline: 'none', marginBottom: '10px', boxSizing: 'border-box' as const,
  }
  const selectStyle = {
    ...inputStyle, cursor: 'pointer', appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23888' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: '36px',
  }
  const card: React.CSSProperties = { background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: '8px', padding: '32px 36px', marginBottom: '20px' }

  const MsgBox = ({ msg }: { msg: Msg }) => msg ? (
    <div style={{ background: msg.type === 'error' ? 'rgba(196,98,45,0.1)' : 'rgba(212,168,67,0.1)', border: `0.5px solid ${msg.type === 'error' ? c.orange : c.gold}`, borderRadius: '4px', padding: '10px 14px', marginBottom: '16px' }}>
      <p style={{ fontSize: '12px', color: msg.type === 'error' ? c.orange : c.gold, lineHeight: 1.5, margin: 0 }}>{msg.text}</p>
    </div>
  ) : null

  const SaveBtn = ({ onClick, saving, label, saveLabel }: { onClick: () => void; saving: boolean; label: string; saveLabel: string }) => (
    <button onClick={onClick} disabled={saving} style={{ background: c.gold, border: 'none', color: '#0a0a0a', padding: '10px 24px', borderRadius: '4px', fontSize: '12px', letterSpacing: '.1em', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: saving ? 0.5 : 1, marginTop: '4px' }}>
      {saving ? saveLabel : label}
    </button>
  )

  if (loading) return (
    <div style={{ minHeight: '100vh', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontSize: '12px', color: c.textDim, letterSpacing: '.1em' }}>LOADING…</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: c.bg, color: c.text, fontFamily: 'Georgia, serif' }}>
      <Nav />
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '100px 24px 60px' }}>

        <div style={{ marginBottom: '36px' }}>
          <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '6px' }}>SETTINGS</p>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 300, color: c.text, margin: '0 0 12px' }}>My account</h1>
          <div style={{ width: '30px', height: '0.5px', background: c.gold, opacity: 0.5, marginBottom: '12px' }} />
          <p style={{ fontSize: '13px', color: c.textDim, margin: 0 }}>
            Signed in as <span style={{ color: c.gold }}>{user?.email}</span>
            {isGoogleUser && <span style={{ marginLeft: '10px', fontSize: '11px', background: 'rgba(212,168,67,0.1)', border: `0.5px solid ${c.gold}`, color: c.gold, padding: '2px 8px', borderRadius: '20px', letterSpacing: '.05em' }}>Google account</span>}
          </p>
        </div>

        {/* ── PUBLIC PROFILE ── */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, margin: 0 }}>PUBLIC PROFILE</p>
            {handle && (
              <span onClick={() => navigate(`/u/${handle}`)} style={{ fontSize: '10px', color: c.gold, cursor: 'pointer', letterSpacing: '.05em', fontFamily: 'Arial, sans-serif', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                VIEW PROFILE →
              </span>
            )}
          </div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 300, color: c.text, margin: 0 }}>Avatar & public identity</h2>
          <div style={{ width: '30px', height: '0.5px', background: c.gold, opacity: 0.5, margin: '14px 0 22px' }} />
          <MsgBox msg={profileMsg} />

          {/* Avatar preview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <AvatarDisplay avatarId={avatar} size={56} fallbackLetter={displayName[0] || '?'} />
            <div>
              <p style={{ fontSize: '12px', color: c.text, marginBottom: '2px' }}>{isAnonymous ? 'Anonymous Researcher' : (displayName || '—')}</p>
              {handle && <p style={{ fontSize: '11px', color: c.textDim, fontFamily: '"Courier New", monospace' }}>@{handle}</p>}
            </div>
          </div>

          <p style={{ fontSize: '10px', letterSpacing: '.12em', color: c.textDim, marginBottom: '14px', fontFamily: 'Arial, sans-serif' }}>CHOOSE AVATAR</p>
          <AvatarPicker selected={avatar} onChange={setAvatar} gold={c.gold} textDim={c.textDim} />

          {/* Handle */}
          <div style={{ marginTop: '22px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '.12em', color: c.textDim, marginBottom: '8px', fontFamily: 'Arial, sans-serif' }}>HANDLE *</p>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: c.textDim, fontSize: '13px', pointerEvents: 'none' }}>@</span>
              <input type="text" value={handle}
                onChange={e => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                style={{ ...inputStyle, paddingLeft: '28px', marginBottom: '4px' }} />
            </div>
            {handleStatus !== 'idle' && <p style={{ fontSize: '11px', color: handleStatusColor, marginBottom: '12px' }}>{handleStatusText}</p>}
          </div>

          {/* Display name + Bio */}
          <div style={{ opacity: isAnonymous ? 0.45 : 1, transition: 'opacity 0.2s' }}>
            <p style={{ fontSize: '10px', letterSpacing: '.12em', color: c.textDim, marginBottom: '8px', marginTop: '4px', fontFamily: 'Arial, sans-serif' }}>DISPLAY NAME</p>
            <input type="text" placeholder="Your name" value={displayName} onChange={e => setDisplayName(e.target.value)} disabled={isAnonymous} style={{ ...inputStyle, cursor: isAnonymous ? 'not-allowed' : 'text' }} />
            <p style={{ fontSize: '10px', letterSpacing: '.12em', color: c.textDim, marginBottom: '8px', fontFamily: 'Arial, sans-serif' }}>BIO (OPTIONAL)</p>
            <textarea placeholder="Research interests, institution, specialisation…" value={bio} onChange={e => setBio(e.target.value)} disabled={isAnonymous} maxLength={300} rows={3}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6, cursor: isAnonymous ? 'not-allowed' : 'text' }} />
            <p style={{ fontSize: '11px', color: c.textFaint, marginTop: '-4px', marginBottom: '14px' }}>{bio.length}/300</p>
          </div>

          {/* ORCID iD */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <p style={{ fontSize: '10px', letterSpacing: '.12em', color: c.textDim, margin: 0, fontFamily: 'Arial, sans-serif' }}>ORCID iD (OPTIONAL)</p>
              {/* ORCID logo */}
              <svg width="14" height="14" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                <circle cx="128" cy="128" r="128" fill="#A6CE39"/>
                <path d="M86.3 186.2H70.9V79.1h15.4v107.1zM108.9 79.1h41.6c39.6 0 57 28.3 57 53.6 0 27.5-21.5 53.6-56.8 53.6h-41.8V79.1zm15.4 93.3h24.5c34.9 0 42.9-26.5 42.9-39.7C191.7 111.2 178 93 148 93h-23.7v79.4zM88.7 56.8c0 5.5-4.5 9.9-10 9.9s-10-4.4-10-9.9c0-5.5 4.5-9.9 10-9.9s10 4.4 10 9.9z" fill="#fff"/>
              </svg>
            </div>
            <div style={{ position: 'relative' }}>
              <input type="text" placeholder="0000-0000-0000-0000" value={orcidId}
                onChange={e => setOrcidId(e.target.value)}
                style={{ ...inputStyle, marginBottom: '4px', fontFamily: '"Courier New", monospace', fontSize: '13px' }} />
            </div>
            {orcidStatus === 'valid' && (
              <p style={{ fontSize: '11px', color: '#4a9e6a', marginBottom: '4px' }}>
                ✓ Valid ORCID iD · <a href={`https://orcid.org/${orcidRaw}`} target="_blank" rel="noopener noreferrer" style={{ color: '#A6CE39', textDecoration: 'none' }}>view profile</a>
              </p>
            )}
            {orcidStatus === 'invalid' && (
              <p style={{ fontSize: '11px', color: c.orange, marginBottom: '4px' }}>Format must be: 0000-0000-0000-0000 (last character may be X)</p>
            )}
            <p style={{ fontSize: '11px', color: c.textFaint, lineHeight: 1.5 }}>
              ORCID provides a persistent identifier for researchers.{' '}
              <a href="https://orcid.org/register" target="_blank" rel="noopener noreferrer" style={{ color: c.gold, textDecoration: 'none' }}>Register free at orcid.org</a>
            </p>
          </div>

          {/* Anonymous toggle */}
          <div style={{ border: `0.5px solid ${c.border}`, borderRadius: '6px', padding: '16px', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <div>
                <p style={{ fontSize: '13px', color: c.text, marginBottom: '4px' }}>Stay anonymous</p>
                <p style={{ fontSize: '11px', color: c.textDim, lineHeight: 1.5 }}>Hide your name and bio from public view. Your contributions remain credited to your handle.</p>
              </div>
              <div onClick={() => setIsAnonymous(v => !v)} style={{ flexShrink: 0, width: 44, height: 24, borderRadius: 12, cursor: 'pointer', background: isAnonymous ? c.gold : c.border, position: 'relative', transition: 'background 0.2s' }}>
                <div style={{ position: 'absolute', top: 3, left: isAnonymous ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: isAnonymous ? '#0a0a0a' : c.textDim, transition: 'left 0.2s' }} />
              </div>
            </div>
          </div>

          <SaveBtn onClick={savePublicProfile} saving={profileSaving} label="SAVE PROFILE" saveLabel="SAVING…" />
        </div>

        {/* ── PERSONAL INFO ── */}
        <div style={card}>
          <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, margin: '0 0 6px' }}>PERSONAL INFORMATION</p>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 300, color: c.text, margin: 0 }}>Your details (private)</h2>
          <div style={{ width: '30px', height: '0.5px', background: c.gold, opacity: 0.5, margin: '14px 0 22px' }} />
          <p style={{ fontSize: '12px', color: c.textFaint, marginBottom: '18px', lineHeight: 1.5 }}>This information is not shown publicly.</p>
          <MsgBox msg={infoMsg} />
          <input type="text" placeholder="Full name" value={fullName} onChange={e => setFullName(e.target.value)} style={inputStyle} />
          <input type="tel" placeholder="Phone number (optional)" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} />
          <input type="text" placeholder="Institution / affiliation (optional)" value={institution} onChange={e => setInstitution(e.target.value)} style={inputStyle} />
          <select value={role} onChange={e => setRole(e.target.value)} style={{ ...selectStyle, color: role ? c.text : c.textDim }}>
            <option value="">Role / interest (optional)</option>
            {ROLES.map(r => <option key={r} value={r} style={{ background: c.bgCard, color: c.text }}>{r}</option>)}
          </select>
          <select value={country} onChange={e => setCountry(e.target.value)} style={{ ...selectStyle, color: country ? c.text : c.textDim }}>
            <option value="">Country (optional)</option>
            {COUNTRIES.map(co => <option key={co} value={co} style={{ background: c.bgCard, color: c.text }}>{co}</option>)}
          </select>
          <SaveBtn onClick={savePersonalInfo} saving={infoSaving} label="SAVE INFORMATION" saveLabel="SAVING…" />
        </div>

        {/* ── EMAIL ── */}
        <div style={card}>
          <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, margin: '0 0 6px' }}>EMAIL ADDRESS</p>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 300, color: c.text, margin: 0 }}>Change your email</h2>
          <div style={{ width: '30px', height: '0.5px', background: c.gold, opacity: 0.5, margin: '14px 0 22px' }} />
          {isGoogleUser ? (
            <p style={{ fontSize: '13px', color: c.textDim, lineHeight: 1.6, margin: 0 }}>Your email is managed by Google and cannot be changed here.</p>
          ) : (
            <>
              <p style={{ fontSize: '13px', color: c.textDim, marginBottom: '16px', lineHeight: 1.6 }}>Current: <span style={{ color: c.text }}>{user?.email}</span></p>
              <MsgBox msg={emailMsg} />
              <input type="email" placeholder="New email address" value={newEmail} onChange={e => setNewEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveEmail()} style={inputStyle} />
              <p style={{ fontSize: '11px', color: c.textFaint, marginBottom: '14px', lineHeight: 1.5 }}>A confirmation link will be sent to your new address.</p>
              <SaveBtn onClick={saveEmail} saving={emailSaving} label="UPDATE EMAIL" saveLabel="SENDING…" />
            </>
          )}
        </div>

        {/* ── PASSWORD ── */}
        <div style={card}>
          <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, margin: '0 0 6px' }}>PASSWORD</p>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 300, color: c.text, margin: 0 }}>Change your password</h2>
          <div style={{ width: '30px', height: '0.5px', background: c.gold, opacity: 0.5, margin: '14px 0 22px' }} />
          {isGoogleUser ? (
            <p style={{ fontSize: '13px', color: c.textDim, lineHeight: 1.6, margin: 0 }}>Your account uses Google Sign-In. No password is set.</p>
          ) : (
            <>
              <MsgBox msg={passwordMsg} />
              <input type="password" placeholder="New password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={inputStyle} />
              <input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && savePassword()} style={inputStyle} />
              <p style={{ fontSize: '11px', color: c.textFaint, marginBottom: '14px', lineHeight: 1.5 }}>Minimum 6 characters.</p>
              <SaveBtn onClick={savePassword} saving={passwordSaving} label="UPDATE PASSWORD" saveLabel="UPDATING…" />
            </>
          )}
        </div>

        {/* ── 2FA placeholder ── */}
        <div style={{ ...card, opacity: 0.65 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px' }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, margin: '0 0 6px' }}>SECURITY</p>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 300, color: c.text, margin: 0 }}>Two-factor authentication</h2>
              <div style={{ width: '30px', height: '0.5px', background: c.gold, opacity: 0.5, margin: '14px 0 16px' }} />
              <p style={{ fontSize: '13px', color: c.textDim, lineHeight: 1.6, margin: '0 0 10px' }}>Add an extra layer of security to your account.</p>
              <p style={{ fontSize: '11px', color: c.textFaint, fontStyle: 'italic', margin: 0 }}>Coming soon — 2FA will be available in a future update.</p>
            </div>
            <div style={{ flexShrink: 0, marginTop: '32px' }}>
              <div style={{ width: '44px', height: '24px', borderRadius: '20px', background: c.border, position: 'relative', cursor: 'not-allowed' }}>
                <div style={{ position: 'absolute', top: '3px', left: '3px', width: '18px', height: '18px', borderRadius: '50%', background: c.textDim }} />
              </div>
            </div>
          </div>
        </div>

        <p style={{ fontSize: '11px', color: c.textFaint, marginTop: '8px', cursor: 'pointer', textAlign: 'center' }} onClick={() => navigate('/')}>← Back to Shilalekh</p>
      </div>
    </div>
  )
}