import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import Nav from '../components/Nav'
import { useTheme } from '../theme'
import { useBookmarks } from '../lib/useBookmarks'

export default function Inscription() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { c } = useTheme()
  const { bookmarked, toggle, isLoggedIn } = useBookmarks()

  const [inscription, setInscription]     = useState<any>(null)
  const [loading, setLoading]             = useState(true)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [copied, setCopied]               = useState(false)

  // Contributor profile
  const [contributorHandle, setContributorHandle]       = useState<string | null>(null)
  const [contributorAnonymous, setContributorAnonymous] = useState(false)

  // ── Fetch inscription ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return
    const isShilaId = id.toUpperCase().startsWith('SHILA-')
    const q = isShilaId
      ? supabase.from('inscriptions').select('*').eq('shila_id', id.toUpperCase()).single()
      : supabase.from('inscriptions').select('*').eq('id', id).single()
    q.then(({ data, error }) => {
      if (!error && data) setInscription(data)
      setLoading(false)
    })
  }, [id])

  // ── Fetch contributor handle ─────────────────────────────────────────────────
  useEffect(() => {
    if (!inscription?.submitted_by) return
    supabase.from('profiles')
      .select('handle, is_anonymous')
      .eq('id', inscription.submitted_by)
      .single()
      .then(({ data }) => {
        if (data) {
          setContributorAnonymous(data.is_anonymous || false)
          if (!data.is_anonymous && data.handle) setContributorHandle(data.handle)
        }
      })
  }, [inscription?.submitted_by])

  // ── Lightbox keyboard nav ────────────────────────────────────────────────────
  useEffect(() => {
    const photos = inscription?.photo_urls || []
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowRight' && lightboxIndex !== null)
        setLightboxIndex(i => i !== null && i < photos.length - 1 ? i + 1 : i)
      if (e.key === 'ArrowLeft' && lightboxIndex !== null)
        setLightboxIndex(i => i !== null && i > 0 ? i - 1 : i)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxIndex, inscription])

  // ── Share ────────────────────────────────────────────────────────────────────
  const handleShare = () => {
    const shareId = inscription?.shila_id || inscription?.id
    const url = `https://shilalekh.org/inscription/${shareId}`
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500) })
    } else {
      const el = document.createElement('textarea')
      el.value = url; document.body.appendChild(el); el.select()
      document.execCommand('copy'); document.body.removeChild(el)
      setCopied(true); setTimeout(() => setCopied(false), 2500)
    }
  }

  // ── Bookmark ─────────────────────────────────────────────────────────────────
  const handleBookmark = () => {
    if (!isLoggedIn) { navigate('/signin'); return }
    if (inscription?.id) toggle(inscription.id)
  }

  const isBookmarked = inscription ? bookmarked.has(inscription.id) : false

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const shortId = (uuid: string) => `${uuid.replace(/-/g, '').slice(0, 8)}`

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: '100vh', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontSize: '12px', color: c.textDim, letterSpacing: '.1em' }}>LOADING...</p>
    </div>
  )

  if (!inscription) return (
    <div style={{ minHeight: '100vh', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
      <p style={{ fontSize: '12px', color: c.textDim, letterSpacing: '.1em' }}>INSCRIPTION NOT FOUND</p>
      <button onClick={() => navigate('/inscriptions')}
        style={{ fontSize: '11px', color: c.gold, background: 'transparent', border: `0.5px solid ${c.gold}`, padding: '8px 20px', borderRadius: '4px', cursor: 'pointer', letterSpacing: '.1em' }}>
        BACK TO INSCRIPTIONS
      </button>
    </div>
  )

  const photos: string[]  = inscription.photo_urls || []
  const citations: any[]  = inscription.citation_credits || []
  const displayType       = inscription.material_type || inscription.type
  const displayPurpose    = inscription.purpose_category || inscription.purpose

  return (
    <div style={{ minHeight: '100vh', background: c.bg, color: c.text, fontFamily: 'Georgia, serif' }}>
      <Nav />

      {/* ── Lightbox ── */}
      {lightboxIndex !== null && (
        <div onClick={() => setLightboxIndex(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.93)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <img src={photos[lightboxIndex]} onClick={e => e.stopPropagation()}
            style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '4px' }} />
          <button onClick={() => setLightboxIndex(null)}
            style={{ position: 'absolute', top: '20px', right: '24px', background: 'transparent', border: 'none', color: '#fff', fontSize: '28px', cursor: 'pointer', lineHeight: 1 }}>×</button>
          {lightboxIndex > 0 && (
            <button onClick={e => { e.stopPropagation(); setLightboxIndex(i => i! - 1) }}
              style={{ position: 'absolute', left: '16px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', padding: '12px 16px', borderRadius: '4px' }}>‹</button>
          )}
          {lightboxIndex < photos.length - 1 && (
            <button onClick={e => { e.stopPropagation(); setLightboxIndex(i => i! + 1) }}
              style={{ position: 'absolute', right: '16px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', padding: '12px 16px', borderRadius: '4px' }}>›</button>
          )}
          <p style={{ position: 'absolute', bottom: '20px', color: 'rgba(255,255,255,0.5)', fontSize: '12px', letterSpacing: '.1em' }}>
            {lightboxIndex + 1} / {photos.length} · Press Esc to close
          </p>
        </div>
      )}

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '100px 32px 60px' }}>

        <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.textDim, marginBottom: '16px', cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}
          onClick={() => navigate('/inscriptions')}>← BACK TO INSCRIPTIONS</p>

        {/* ── Tags ── */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {displayType && (
            <span style={{ fontSize: '10px', padding: '3px 10px', border: `0.5px solid ${c.gold}`, color: c.gold, borderRadius: '99px', letterSpacing: '.05em' }}>
              {displayType.toUpperCase()}
            </span>
          )}
          {inscription.state_province && (
            <span style={{ fontSize: '10px', padding: '3px 10px', border: `0.5px solid ${c.border}`, color: c.textDim, borderRadius: '99px', letterSpacing: '.05em' }}>
              {inscription.state_province.toUpperCase()}
            </span>
          )}
          {inscription.year && (
            <span style={{ fontSize: '10px', padding: '3px 10px', border: `0.5px solid ${c.border}`, color: c.textDim, borderRadius: '99px', letterSpacing: '.05em' }}>
              {inscription.year}
            </span>
          )}
          {inscription.script && (
            <span style={{ fontSize: '10px', padding: '3px 10px', border: `0.5px solid ${c.border}`, color: c.textDim, borderRadius: '99px', letterSpacing: '.05em' }}>
              {inscription.script.toUpperCase()}
            </span>
          )}
        </div>

        {/* ── Title ── */}
        <h1 style={{ fontSize: '2.5rem', fontWeight: 300, color: c.gold, marginBottom: '16px', letterSpacing: '.05em' }}>
          {inscription.title}
        </h1>

        {/* ── ShilaID + Share + Bookmark ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          {inscription.shila_id && (
            <span style={{
              fontFamily: '"Courier New", Courier, monospace', fontSize: '11px',
              color: c.textDim, background: c.bgCard, border: `0.5px solid ${c.border}`,
              padding: '5px 12px', borderRadius: '4px', letterSpacing: '.1em',
              userSelect: 'all' as const,
            }}>
              {inscription.shila_id}
            </span>
          )}

          {/* Share button */}
          <button onClick={handleShare} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: copied ? 'rgba(212,168,67,0.1)' : 'transparent',
            border: `0.5px solid ${copied ? c.gold : c.border}`,
            color: copied ? c.gold : c.textDim,
            padding: '5px 14px', borderRadius: '4px',
            fontSize: '10px', letterSpacing: '.1em',
            cursor: 'pointer', fontFamily: 'Arial, sans-serif', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { if (!copied) { e.currentTarget.style.borderColor = c.gold; e.currentTarget.style.color = c.gold } }}
            onMouseLeave={e => { if (!copied) { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.color = c.textDim } }}>
            <span style={{ fontSize: '12px' }}>{copied ? '✓' : '⎘'}</span>
            {copied ? 'LINK COPIED' : 'SHARE'}
          </button>

          {/* Bookmark button */}
          <button onClick={handleBookmark} title={isLoggedIn ? (isBookmarked ? 'Remove bookmark' : 'Bookmark this inscription') : 'Sign in to bookmark'} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: isBookmarked ? 'rgba(212,168,67,0.1)' : 'transparent',
            border: `0.5px solid ${isBookmarked ? c.gold : c.border}`,
            color: isBookmarked ? c.gold : c.textDim,
            padding: '5px 14px', borderRadius: '4px',
            fontSize: '10px', letterSpacing: '.1em',
            cursor: 'pointer', fontFamily: 'Arial, sans-serif', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { if (!isBookmarked) { e.currentTarget.style.borderColor = c.gold; e.currentTarget.style.color = c.gold } }}
            onMouseLeave={e => { if (!isBookmarked) { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.color = c.textDim } }}>
            <svg width="10" height="13" viewBox="0 0 14 18" fill={isBookmarked ? c.gold : 'none'} stroke={isBookmarked ? c.gold : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 1h12v15l-6-4-6 4V1z"/>
            </svg>
            {isBookmarked ? 'BOOKMARKED' : 'BOOKMARK'}
          </button>
        </div>

        {/* ── Location ── */}
        <p style={{ fontSize: '13px', color: c.textDim, marginBottom: '32px', letterSpacing: '.05em' }}>
          {inscription.current_location}
          {inscription.latitude && inscription.longitude &&
            ` · ${inscription.latitude}° N, ${inscription.longitude}° E`}
        </p>

        <div style={{ width: '40px', height: '0.5px', background: c.gold, marginBottom: '32px', opacity: .5 }} />

        {/* ── PHOTOGRAPHS ── */}
        {photos.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '14px', fontFamily: 'Arial, sans-serif' }}>PHOTOGRAPHS</p>
            <div style={{ borderRadius: '8px', overflow: 'hidden', marginBottom: '8px', cursor: 'zoom-in', border: `0.5px solid ${c.border}` }}
              onClick={() => setLightboxIndex(0)}>
              <img src={photos[0]} alt={inscription.title}
                style={{ width: '100%', maxHeight: '480px', objectFit: 'cover', display: 'block' }} />
            </div>
            {photos.length > 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(photos.length - 1, 4)}, 1fr)`, gap: '8px' }}>
                {photos.slice(1).map((url, i) => (
                  <div key={i} style={{ borderRadius: '4px', overflow: 'hidden', aspectRatio: '4/3', cursor: 'zoom-in', border: `0.5px solid ${c.border}` }}
                    onClick={() => setLightboxIndex(i + 1)}>
                    <img src={url} alt={`${inscription.title} ${i + 2}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                ))}
              </div>
            )}
            <p style={{ fontSize: '10px', color: c.textFaint, marginTop: '8px', fontFamily: 'Arial, sans-serif', letterSpacing: '.05em' }}>
              {photos.length} photo{photos.length > 1 ? 's' : ''} · Click to enlarge
            </p>
          </div>
        )}

        {/* ── SHORT DESCRIPTION ── */}
        {inscription.short_description && (
          <div style={{ background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: '8px', padding: '24px', marginBottom: '32px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '12px', fontFamily: 'Arial, sans-serif' }}>SHORT DESCRIPTION</p>
            <p style={{ fontSize: '15px', color: c.text, lineHeight: 1.8 }}>{inscription.short_description}</p>
          </div>
        )}

        {/* ── KEY FIELDS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Type',      value: displayType },
            { label: 'Script',    value: inscription.script },
            { label: 'Language',  value: inscription.language },
            { label: 'Year',      value: inscription.year },
            { label: 'Dynasty',   value: inscription.dynasty },
            { label: 'Ruler',     value: inscription.reign_ruler },
            { label: 'Purpose',   value: displayPurpose },
            { label: 'Condition', value: inscription.condition },
            { label: 'Country',   value: inscription.country || inscription.current_country },
            { label: 'In Situ',   value: inscription.in_situ === true ? 'Yes' : inscription.in_situ === false ? 'No' : null },
            { label: 'Height',    value: inscription.height_cm ? `${inscription.height_cm} cm` : null },
            { label: 'Width',     value: inscription.width_cm  ? `${inscription.width_cm} cm`  : null },
            { label: 'Depth',     value: inscription.depth_cm  ? `${inscription.depth_cm} cm`  : null },
            { label: 'Accession No.', value: inscription.accession_number },
          ].filter(f => f.value).map((f, i) => (
            <div key={i} style={{ background: c.bgCard, border: `0.5px solid ${c.borderLight}`, borderRadius: '6px', padding: '12px 14px' }}>
              <p style={{ fontSize: '9px', letterSpacing: '.15em', color: c.textDim, marginBottom: '4px', fontFamily: 'Arial, sans-serif' }}>{f.label.toUpperCase()}</p>
              <p style={{ fontSize: '13px', color: c.text, fontWeight: 300 }}>{f.value}</p>
            </div>
          ))}
        </div>

        {/* ── ACTUAL TEXT ── */}
        {inscription.actual_text && (
          <div style={{ background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '12px', fontFamily: 'Arial, sans-serif' }}>ACTUAL TEXT</p>
            <p style={{ fontSize: '16px', color: c.text, lineHeight: 2, fontFamily: 'Georgia, serif' }}>{inscription.actual_text}</p>
          </div>
        )}

        {/* ── TRANSLITERATION ── */}
        {inscription.transliteration && (
          <div style={{ background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '12px', fontFamily: 'Arial, sans-serif' }}>TRANSLITERATION</p>
            <p style={{ fontSize: '14px', color: c.text, lineHeight: 1.8, fontStyle: 'italic' }}>{inscription.transliteration}</p>
          </div>
        )}

        {/* ── TRANSLATION ── */}
        {inscription.translation_english && (
          <div style={{ background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '12px', fontFamily: 'Arial, sans-serif' }}>TRANSLATION</p>
            <p style={{ fontSize: '14px', color: c.text, lineHeight: 1.8 }}>{inscription.translation_english}</p>
          </div>
        )}

        {/* ── IMPORTANCE ── */}
        {inscription.importance && (
          <div style={{ background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '12px', fontFamily: 'Arial, sans-serif' }}>IMPORTANCE</p>
            <p style={{ fontSize: '13px', color: c.textMuted, lineHeight: 1.8 }}>{inscription.importance}</p>
          </div>
        )}

        {/* ── DETAILED INFORMATION ── */}
        {inscription.detailed_information && (
          <div style={{ background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '12px', fontFamily: 'Arial, sans-serif' }}>DETAILED INFORMATION</p>
            <p style={{ fontSize: '13px', color: c.textMuted, lineHeight: 1.8 }}>{inscription.detailed_information}</p>
          </div>
        )}

        {/* ── CITATIONS & CREDITS ── */}
        {citations.length > 0 && (
          <div style={{ background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '16px', fontFamily: 'Arial, sans-serif' }}>CITATIONS & CREDITS</p>
            {citations.map((cite: any, i: number) => (
              <div key={i} style={{
                paddingBottom: i < citations.length - 1 ? '14px' : 0,
                marginBottom:  i < citations.length - 1 ? '14px' : 0,
                borderBottom:  i < citations.length - 1 ? `0.5px solid ${c.borderLight}` : 'none',
              }}>
                <p style={{ fontSize: '9px', letterSpacing: '.15em', color: c.textDim, marginBottom: '5px', fontFamily: 'Arial, sans-serif' }}>
                  {cite.type?.toUpperCase()}
                </p>
                {cite.url ? (
                  <a href={cite.url} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: '13px', color: c.gold, textDecoration: 'none', lineHeight: 1.6 }}
                    onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                    onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}>
                    {cite.value}
                  </a>
                ) : (
                  <p style={{ fontSize: '13px', color: c.text, lineHeight: 1.6 }}>{cite.value}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── RECORD ATTRIBUTION ── */}
        <div style={{ borderTop: `0.5px solid ${c.borderLight}`, paddingTop: '24px', marginTop: '8px' }}>
          <p style={{ fontSize: '9px', letterSpacing: '.15em', color: c.textDim, marginBottom: '12px', fontFamily: 'Arial, sans-serif' }}>
            RECORD ATTRIBUTION
          </p>
          {inscription.submitted_by ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', color: c.textDim, fontFamily: 'Arial, sans-serif' }}>Contributed by</span>
              {contributorHandle ? (
                // Has a public handle → link to profile
                <span
                  onClick={() => navigate(`/@${contributorHandle}`)}
                  style={{ fontSize: '12px', color: c.gold, fontFamily: '"Courier New", Courier, monospace', cursor: 'pointer', letterSpacing: '.05em' }}
                  onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                  onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}>
                  @{contributorHandle}
                </span>
              ) : (
                // Anonymous or no handle yet → show short ID as plain text
                <span style={{ fontSize: '12px', color: c.textDim, fontFamily: '"Courier New", Courier, monospace', letterSpacing: '.05em' }}>
                  {contributorAnonymous ? 'Anonymous Researcher' : shortId(inscription.submitted_by)}
                </span>
              )}
              {inscription.approved_at && (
                <span style={{ fontSize: '11px', color: c.textDim, fontFamily: 'Arial, sans-serif' }}>
                  · Verified {new Date(inscription.approved_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </span>
              )}
            </div>
          ) : (
            <p style={{ fontSize: '11px', color: c.textDim, fontFamily: 'Arial, sans-serif', fontStyle: 'italic' }}>
              Sourced from ASI records
            </p>
          )}
        </div>

      </div>

      {/* ── Footer ── */}
      <div style={{ borderTop: `0.5px solid ${c.borderLight}`, padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '16px', color: c.gold, fontFamily: 'Georgia, serif' }}>शिलालेख</span>
          <span style={{ fontSize: '10px', color: c.textFaint, letterSpacing: '.15em' }}>SHILALEKH</span>
        </div>
        <p style={{ fontSize: '10px', color: c.textFaint, letterSpacing: '.05em', fontFamily: 'Georgia, serif' }}>यावच्चन्द्रदिवाकरौ</p>
        <p style={{ fontSize: '10px', color: c.textFaint, letterSpacing: '.08em' }}>© 2026 SHILALEKH.ORG</p>
      </div>
    </div>
  )
}