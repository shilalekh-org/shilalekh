import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useTheme } from '../theme'
import { AvatarPicker } from '../lib/avatars'

const HANDLE_REGEX = /^[a-z0-9_]{3,20}$/

export default function CompleteProfile() {
  const navigate = useNavigate()
  const { c } = useTheme()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  // Form state
  const [avatar, setAvatar]           = useState('surya')
  const [handle, setHandle]           = useState('')
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio]                 = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)

  // Handle availability
  const [handleStatus, setHandleStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { navigate('/signin'); return }
      setUser(user)
      // Pre-fill display name from existing profile row (set by trigger)
      supabase.from('profiles').select('display_name, avatar_id').eq('id', user.id).single()
        .then(({ data }) => {
          if (data?.display_name) setDisplayName(data.display_name)
          if (data?.avatar_id) setAvatar(data.avatar_id)
          setLoading(false)
        })
    })
  }, [navigate])

  // Debounced handle availability check
  useEffect(() => {
    if (!handle) { setHandleStatus('idle'); return }
    if (!HANDLE_REGEX.test(handle)) { setHandleStatus('invalid'); return }
    setHandleStatus('checking')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const { data } = await supabase
        .from('profiles').select('id').eq('handle', handle).neq('id', user?.id ?? '').maybeSingle()
      setHandleStatus(data ? 'taken' : 'available')
    }, 600)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [handle, user?.id])

  const handleStatusColor = {
    idle: c.textFaint, checking: c.textDim, available: '#4a9e6a', taken: c.orange, invalid: c.orange,
  }[handleStatus]

  const handleStatusText = {
    idle: 'Letters a–z, numbers, underscores. 3–20 characters.',
    checking: 'Checking availability…',
    available: `@${handle} is available`,
    taken: `@${handle} is already taken`,
    invalid: 'Use only a–z, 0–9, underscores. Min 3, max 20 characters.',
  }[handleStatus]

  const handleSave = async () => {
    setMessage(null)
    if (!handle.trim()) { setMessage({ type: 'error', text: 'Please choose a handle.' }); return }
    if (!HANDLE_REGEX.test(handle)) { setMessage({ type: 'error', text: 'Handle must be 3–20 characters: a–z, numbers, underscores only.' }); return }
    if (handleStatus === 'taken') { setMessage({ type: 'error', text: 'That handle is already taken.' }); return }
    if (handleStatus === 'checking') { setMessage({ type: 'error', text: 'Please wait — checking handle availability.' }); return }
    if (!displayName.trim() && !isAnonymous) { setMessage({ type: 'error', text: 'Please enter a display name, or choose to stay anonymous.' }); return }

    setSaving(true)
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      handle: handle.trim().toLowerCase(),
      display_name: isAnonymous ? null : displayName.trim(),
      bio: isAnonymous ? null : bio.trim(),
      avatar_id: avatar,
      is_anonymous: isAnonymous,
      profile_completed: true,
    })
    setSaving(false)

    if (error) {
      if (error.code === '23505') setMessage({ type: 'error', text: 'That handle was just taken. Please try another.' })
      else setMessage({ type: 'error', text: error.message })
    } else {
      navigate(`/u/${handle.trim().toLowerCase()}`)
    }
  }

  const inputStyle = {
    width: '100%', background: c.bg, border: `0.5px solid ${c.border}`,
    borderRadius: '4px', padding: '11px 14px', color: c.text, fontSize: '13px',
    fontFamily: 'Georgia, serif', outline: 'none', boxSizing: 'border-box' as const,
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontSize: '12px', color: c.textDim, letterSpacing: '.1em' }}>LOADING…</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: c.bg, color: c.text, fontFamily: 'Georgia, serif', padding: '40px 16px 60px' }}>

      {/* Minimal header */}
      <div style={{ textAlign: 'center', marginBottom: '40px', cursor: 'pointer' }} onClick={() => navigate('/')}>
        <p style={{ fontSize: '28px', color: c.gold, letterSpacing: '.05em', marginBottom: '4px' }}>शिलालेख</p>
        <p style={{ fontSize: '10px', color: c.textDim, letterSpacing: '.3em' }}>SHILALEKH</p>
      </div>

      <div style={{ maxWidth: '560px', margin: '0 auto' }}>

        {/* Intro */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '8px' }}>ONE-TIME SETUP</p>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 300, color: c.gold, marginBottom: '12px' }}>Set up your public profile</h1>
          <div style={{ width: '30px', height: '0.5px', background: c.gold, margin: '0 auto 16px', opacity: .5 }} />
          <p style={{ fontSize: '13px', color: c.textDim, lineHeight: 1.7 }}>
            Your profile is where your contributions are credited publicly. This takes about 30 seconds and only happens once.
          </p>
        </div>

        {message && (
          <div style={{ background: message.type === 'error' ? 'rgba(196,98,45,0.1)' : 'rgba(212,168,67,0.1)', border: `0.5px solid ${message.type === 'error' ? c.orange : c.gold}`, borderRadius: '4px', padding: '10px 14px', marginBottom: '20px' }}>
            <p style={{ fontSize: '12px', color: message.type === 'error' ? c.orange : c.gold, lineHeight: 1.5, margin: 0 }}>{message.text}</p>
          </div>
        )}

        {/* ── Avatar ── */}
        <div style={{ background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: '8px', padding: '28px', marginBottom: '16px' }}>
          <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '6px' }}>AVATAR</p>
          <p style={{ fontSize: '13px', color: c.textDim, marginBottom: '20px', lineHeight: 1.5 }}>
            Choose a symbol from Indian epigraphic tradition.
          </p>
          <AvatarPicker selected={avatar} onChange={setAvatar} gold={c.gold} textDim={c.textDim} />
        </div>

        {/* ── Handle ── */}
        <div style={{ background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: '8px', padding: '28px', marginBottom: '16px' }}>
          <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '6px' }}>HANDLE *</p>
          <p style={{ fontSize: '13px', color: c.textDim, marginBottom: '16px', lineHeight: 1.5 }}>
            Your unique identifier. Your profile URL will be <span style={{ color: c.gold }}>shilalekh.org/@{handle || 'yourhandle'}</span>
          </p>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: c.textDim, fontSize: '13px', fontFamily: 'Georgia, serif', pointerEvents: 'none' }}>@</span>
            <input
              type="text"
              placeholder="yourhandle"
              value={handle}
              onChange={e => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              style={{ ...inputStyle, paddingLeft: '28px' }}
            />
          </div>
          <p style={{ fontSize: '11px', color: handleStatusColor, marginTop: '6px', lineHeight: 1.5 }}>
            {handleStatusText}
          </p>
        </div>

        {/* ── Display name + Bio ── */}
        <div style={{ background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: '8px', padding: '28px', marginBottom: '16px', opacity: isAnonymous ? 0.45 : 1, transition: 'opacity 0.2s' }}>
          <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '6px' }}>
            {isAnonymous ? 'NAME & BIO (hidden — anonymous mode on)' : 'NAME & BIO'}
          </p>
          <input
            type="text"
            placeholder="Display name"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            disabled={isAnonymous}
            style={{ ...inputStyle, marginBottom: '10px', cursor: isAnonymous ? 'not-allowed' : 'text' }}
          />
          <textarea
            placeholder="A short bio — your research interests, institution, specialisation (optional)"
            value={bio}
            onChange={e => setBio(e.target.value)}
            disabled={isAnonymous}
            maxLength={300}
            rows={3}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6, cursor: isAnonymous ? 'not-allowed' : 'text' }}
          />
          <p style={{ fontSize: '11px', color: c.textFaint, marginTop: '4px' }}>{bio.length}/300</p>
        </div>

        {/* ── Anonymous toggle ── */}
        <div style={{ background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: '8px', padding: '24px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '6px' }}>ANONYMITY</p>
              <p style={{ fontSize: '13px', color: c.text, marginBottom: '6px', fontWeight: 400 }}>
                Stay anonymous
              </p>
              <p style={{ fontSize: '12px', color: c.textDim, lineHeight: 1.6 }}>
                Hides your name and bio from public view. Your handle (@{handle || 'yourhandle'}) remains in your profile URL, and your inscription contributions remain credited. Use this if you prefer not to be publicly identified.
              </p>
            </div>
            {/* Toggle switch */}
            <div
              onClick={() => setIsAnonymous(v => !v)}
              style={{
                flexShrink: 0, marginTop: '22px',
                width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
                background: isAnonymous ? c.gold : c.border,
                position: 'relative', transition: 'background 0.2s',
              }}>
              <div style={{
                position: 'absolute', top: 3,
                left: isAnonymous ? 23 : 3,
                width: 18, height: 18, borderRadius: '50%',
                background: isAnonymous ? '#0a0a0a' : c.textDim,
                transition: 'left 0.2s',
              }} />
            </div>
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving || handleStatus === 'checking' || handleStatus === 'taken' || handleStatus === 'invalid'}
          style={{
            width: '100%', background: c.gold, border: 'none', color: '#0a0a0a',
            padding: '14px', borderRadius: '4px', fontSize: '12px', letterSpacing: '.12em',
            cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 600,
            opacity: saving ? 0.6 : 1,
          }}>
          {saving ? 'SAVING…' : 'SAVE AND CONTINUE →'}
        </button>

        <p style={{ fontSize: '11px', color: c.textFaint, textAlign: 'center', marginTop: '16px', lineHeight: 1.6 }}>
          You can change your handle, name, and avatar at any time from Account Settings.
        </p>

      </div>
    </div>
  )
}