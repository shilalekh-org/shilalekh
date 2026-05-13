import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../supabase'
import { useTheme } from '../theme'
import { AvatarDisplay } from '../lib/avatars'
import Nav from '../components/Nav'

type Tab = 'contributions' | 'bookmarks'

function InscriptionRow({ ins, onClick, c }: { ins: any; onClick: () => void; c: any }) {
  return (
    <div onClick={onClick} style={{
      background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: '8px',
      padding: '16px 20px', marginBottom: '8px', cursor: 'pointer',
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      transition: 'border-color 0.15s',
    }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = c.gold)}
      onMouseLeave={e => (e.currentTarget.style.borderColor = c.border)}>
      <div>
        <p style={{ fontSize: '14px', color: c.text, marginBottom: '4px' }}>{ins.title}</p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {ins.state_province && <span style={{ fontSize: '10px', color: c.textDim }}>{ins.state_province}</span>}
          {ins.material_type && <span style={{ fontSize: '10px', color: c.textDim }}>· {ins.material_type}</span>}
        </div>
      </div>
      {ins.year && <p style={{ fontSize: '12px', color: c.gold, flexShrink: 0, marginLeft: '16px' }}>{ins.year}</p>}
    </div>
  )
}

export default function ProfilePage() {
  const { handle } = useParams()
  const navigate = useNavigate()
  const { c } = useTheme()

  const [profile, setProfile]             = useState<any>(null)
  const [contributions, setContributions] = useState<any[]>([])
  const [bookmarks, setBookmarks]         = useState<any[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [activeTab, setActiveTab]         = useState<Tab>('contributions')
  const [loading, setLoading]             = useState(true)
  const [notFound, setNotFound]           = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUserId(session?.user?.id ?? null)
    })
  }, [])

  useEffect(() => {
    if (!handle) return
    loadProfile()
  }, [handle])

  async function loadProfile() {
    setLoading(true)

    // Fetch profile
    const { data: prof } = await supabase
      .from('profiles')
      .select('id, handle, display_name, bio, avatar_id, is_anonymous, profile_completed, created_at')
      .eq('handle', handle!.toLowerCase())
      .single()

    if (!prof || !prof.profile_completed) { setNotFound(true); setLoading(false); return }
    setProfile(prof)

    // Fetch approved contributions
    const { data: contribs } = await supabase
      .from('inscriptions')
      .select('id, shila_id, title, material_type, state_province, year')
      .eq('submitted_by', prof.id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
    setContributions(contribs || [])

    // Fetch bookmarks
    const { data: bIds } = await supabase
      .from('bookmarks')
      .select('inscription_id')
      .eq('user_id', prof.id)
    const ids = (bIds || []).map((b: any) => b.inscription_id)
    if (ids.length > 0) {
      const { data: bIns } = await supabase
        .from('inscriptions')
        .select('id, shila_id, title, material_type, state_province, year')
        .in('id', ids)
        .eq('status', 'approved')
      setBookmarks(bIns || [])
    }

    setLoading(false)
  }

  const isOwnProfile = currentUserId && profile?.id === currentUserId
  const displayName  = profile?.is_anonymous ? 'Anonymous Researcher' : (profile?.display_name || `@${profile?.handle}`)
  const showBio      = !profile?.is_anonymous && profile?.bio

  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : null

  if (loading) return (
    <div style={{ minHeight: '100vh', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontSize: '12px', color: c.textDim, letterSpacing: '.1em' }}>LOADING…</p>
    </div>
  )

  if (notFound) return (
    <div style={{ minHeight: '100vh', background: c.bg, color: c.text, fontFamily: 'Georgia, serif' }}>
      <Nav />
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '140px 32px', textAlign: 'center' }}>
        <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '16px' }}>NOT FOUND</p>
        <h1 style={{ fontSize: '2rem', fontWeight: 300, color: c.gold, marginBottom: '16px' }}>@{handle}</h1>
        <p style={{ fontSize: '13px', color: c.textDim, marginBottom: '32px' }}>This profile doesn't exist or hasn't been set up yet.</p>
        <button onClick={() => navigate('/inscriptions')} style={{ background: 'transparent', border: `0.5px solid ${c.gold}`, color: c.gold, padding: '10px 24px', borderRadius: '4px', fontSize: '11px', letterSpacing: '.1em', cursor: 'pointer' }}>
          BROWSE INSCRIPTIONS
        </button>
      </div>
    </div>
  )

  const tabStyle = (tab: Tab): React.CSSProperties => ({
    fontSize: '11px', letterSpacing: '.1em', color: activeTab === tab ? c.gold : c.textDim,
    cursor: 'pointer', padding: '10px 0', fontFamily: 'Arial, sans-serif',
    borderBottom: `1.5px solid ${activeTab === tab ? c.gold : 'transparent'}`,
    transition: 'color 0.15s, border-color 0.15s',
  })

  return (
    <div style={{ minHeight: '100vh', background: c.bg, color: c.text, fontFamily: 'Georgia, serif' }}>
      <Nav />
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '100px 32px 60px' }}>

        {/* Back */}
        <p style={{ fontSize: '10px', letterSpacing: '.15em', color: c.textDim, marginBottom: '32px', cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}
          onClick={() => navigate(-1)}>← BACK</p>

        {/* ── Profile header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', marginBottom: '36px', flexWrap: 'wrap' }}>
          <AvatarDisplay avatarId={profile.avatar_id} size={80} fallbackLetter={displayName[0]} />
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 300, color: c.gold, marginBottom: '4px' }}>{displayName}</h1>
            <p style={{ fontSize: '12px', color: c.textDim, fontFamily: '"Courier New", monospace', marginBottom: '8px' }}>@{profile.handle}</p>
            {showBio && <p style={{ fontSize: '13px', color: c.textDim, lineHeight: 1.7, marginBottom: '8px', maxWidth: '480px' }}>{profile.bio}</p>}
            {joinDate && <p style={{ fontSize: '10px', color: c.textFaint, letterSpacing: '.08em', fontFamily: 'Arial, sans-serif' }}>MEMBER SINCE {joinDate.toUpperCase()}</p>}
            {profile.is_anonymous && (
              <p style={{ fontSize: '10px', color: c.textFaint, letterSpacing: '.08em', fontFamily: 'Arial, sans-serif', marginTop: '6px', fontStyle: 'italic' }}>This researcher prefers to stay anonymous.</p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {isOwnProfile && (
              <button onClick={() => navigate('/account')} style={{ background: 'transparent', border: `0.5px solid ${c.border}`, color: c.textDim, padding: '7px 16px', borderRadius: '4px', fontSize: '10px', letterSpacing: '.1em', cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
                EDIT PROFILE
              </button>
            )}
          </div>
        </div>

        <div style={{ width: '40px', height: '0.5px', background: c.gold, marginBottom: '24px', opacity: .5 }} />

        {/* ── Stats row ── */}
        <div style={{ display: 'flex', gap: '32px', marginBottom: '32px' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '20px', fontWeight: 300, color: c.gold, fontFamily: 'Georgia, serif' }}>{contributions.length}</p>
            <p style={{ fontSize: '9px', color: c.textDim, letterSpacing: '.12em', fontFamily: 'Arial, sans-serif' }}>CONTRIBUTIONS</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '20px', fontWeight: 300, color: c.gold, fontFamily: 'Georgia, serif' }}>{bookmarks.length}</p>
            <p style={{ fontSize: '9px', color: c.textDim, letterSpacing: '.12em', fontFamily: 'Arial, sans-serif' }}>BOOKMARKS</p>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: '28px', borderBottom: `0.5px solid ${c.borderLight}`, marginBottom: '24px' }}>
          <span onClick={() => setActiveTab('contributions')} style={tabStyle('contributions')}>CONTRIBUTIONS</span>
          <span onClick={() => setActiveTab('bookmarks')} style={tabStyle('bookmarks')}>BOOKMARKS</span>
        </div>

        {/* ── Contributions tab ── */}
        {activeTab === 'contributions' && (
          <>
            {contributions.length === 0 ? (
              <p style={{ fontSize: '13px', color: c.textFaint, textAlign: 'center', padding: '48px 0', fontStyle: 'italic' }}>
                No approved contributions yet.
              </p>
            ) : (
              contributions.map(ins => (
                <InscriptionRow key={ins.id} ins={ins} c={c}
                  onClick={() => navigate(`/inscription/${ins.shila_id || ins.id}`)} />
              ))
            )}
          </>
        )}

        {/* ── Bookmarks tab ── */}
        {activeTab === 'bookmarks' && (
          <>
            {bookmarks.length === 0 ? (
              <p style={{ fontSize: '13px', color: c.textFaint, textAlign: 'center', padding: '48px 0', fontStyle: 'italic' }}>
                No bookmarked inscriptions yet.
              </p>
            ) : (
              bookmarks.map(ins => (
                <InscriptionRow key={ins.id} ins={ins} c={c}
                  onClick={() => navigate(`/inscription/${ins.shila_id || ins.id}`)} />
              ))
            )}
          </>
        )}

      </div>

      {/* Footer */}
      <div style={{ borderTop: `0.5px solid ${c.borderLight}`, padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '16px', color: c.gold, fontFamily: 'Georgia, serif' }}>शिलालेख</span>
          <span style={{ fontSize: '10px', color: c.textFaint, letterSpacing: '.15em' }}>SHILALEKH</span>
        </div>
        <p style={{ fontSize: '10px', color: c.textFaint, fontFamily: 'Georgia, serif' }}>यावच्चन्द्रदिवाकरौ</p>
        <p style={{ fontSize: '10px', color: c.textFaint, letterSpacing: '.08em' }}>© 2026 SHILALEKH.ORG</p>
      </div>
    </div>
  )
}