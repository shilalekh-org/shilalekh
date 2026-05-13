import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import Nav from '../components/Nav'
import { useTheme } from '../theme'
import { useBookmarks } from '../lib/useBookmarks'

// ─── Suggest-edit config ──────────────────────────────────────────────────────
const EDITABLE_FIELDS = [
  { key: 'title',               label: 'Title' },
  { key: 'script',              label: 'Script' },
  { key: 'language',            label: 'Language' },
  { key: 'year',                label: 'Year / Date' },
  { key: 'dynasty',             label: 'Dynasty' },
  { key: 'reign_ruler',         label: 'Ruler / Reign' },
  { key: 'condition',           label: 'Condition' },
  { key: 'short_description',   label: 'Short Description' },
  { key: 'actual_text',         label: 'Actual Text (original script)' },
  { key: 'transliteration',     label: 'Transliteration' },
  { key: 'translation_english', label: 'English Translation' },
  { key: 'importance',          label: 'Importance / Significance' },
  { key: 'detailed_information',label: 'Detailed Information' },
]

export default function Inscription() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { c } = useTheme()
  const { bookmarked, toggle, isLoggedIn } = useBookmarks()

  const [inscription, setInscription]     = useState<any>(null)
  const [loading, setLoading]             = useState(true)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [copied, setCopied]               = useState(false)

  // Contributor
  const [contributorHandle,   setContributorHandle]   = useState<string | null>(null)
  const [contributorAnonymous, setContributorAnonymous] = useState(false)

  // Suggest-edit modal
  const [editOpen,       setEditOpen]       = useState(false)
  const [editField,      setEditField]      = useState('')
  const [editSuggested,  setEditSuggested]  = useState('')
  const [editJustify,    setEditJustify]    = useState('')
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editMsg,        setEditMsg]        = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [editUser,       setEditUser]       = useState<any>(null)

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

  // ── Fetch auth user for suggest-edit ─────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setEditUser(user))
  }, [])

  // ── Fetch contributor handle ──────────────────────────────────────────────────
  useEffect(() => {
    if (!inscription?.submitted_by) return
    supabase.from('profiles').select('handle, is_anonymous').eq('id', inscription.submitted_by).single()
      .then(({ data }) => {
        if (data) {
          setContributorAnonymous(data.is_anonymous || false)
          if (!data.is_anonymous && data.handle) setContributorHandle(data.handle)
        }
      })
  }, [inscription?.submitted_by])

  // ── Lightbox keyboard nav ─────────────────────────────────────────────────────
  useEffect(() => {
    const photos = inscription?.photo_urls || []
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setLightboxIndex(null); setEditOpen(false) }
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
    const url = `https://shilalekh.org/inscription/${inscription?.shila_id || inscription?.id}`
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500) })
    } else {
      const el = document.createElement('textarea'); el.value = url
      document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el)
      setCopied(true); setTimeout(() => setCopied(false), 2500)
    }
  }

  // ── Bookmark ─────────────────────────────────────────────────────────────────
  const handleBookmark = () => {
    if (!isLoggedIn) { navigate('/signin'); return }
    if (inscription?.id) toggle(inscription.id)
  }
  const isBookmarked = inscription ? bookmarked.has(inscription.id) : false

  // ── Suggest-edit open ─────────────────────────────────────────────────────────
  const openEdit = () => {
    if (!isLoggedIn) { navigate('/signin'); return }
    setEditOpen(true); setEditMsg(null); setEditField(''); setEditSuggested(''); setEditJustify('')
  }

  // ── Suggest-edit field change ─────────────────────────────────────────────────
  const handleFieldChange = (key: string) => {
    setEditField(key)
    setEditSuggested('')  // reset suggested when field changes
  }

  const currentValueForField = (key: string): string => {
    if (!inscription || !key) return ''
    return inscription[key] ?? ''
  }

  // ── Suggest-edit submit ───────────────────────────────────────────────────────
  const submitEdit = async () => {
    setEditMsg(null)
    if (!editField)          { setEditMsg({ type: 'error', text: 'Please select a field.' }); return }
    if (!editSuggested.trim()) { setEditMsg({ type: 'error', text: 'Please enter a suggested value.' }); return }
    if (!editJustify.trim()) { setEditMsg({ type: 'error', text: 'Please provide a justification (source or reasoning).' }); return }
    if (!editUser)           { navigate('/signin'); return }

    setEditSubmitting(true)
    const { error } = await supabase.from('edit_requests').insert({
      inscription_id: inscription.id,
      submitted_by:   editUser.id,
      field_name:     editField,
      current_value:  currentValueForField(editField) || null,
      suggested_value: editSuggested.trim(),
      justification:  editJustify.trim(),
    })
    setEditSubmitting(false)
    if (error) setEditMsg({ type: 'error', text: error.message })
    else setEditMsg({ type: 'success', text: 'Thank you — your suggestion has been submitted for review.' })
  }

  const shortId = (uuid: string) => uuid.replace(/-/g, '').slice(0, 8)

  if (loading) return (
    <div style={{ minHeight: '100vh', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontSize: '12px', color: c.textDim, letterSpacing: '.1em' }}>LOADING...</p>
    </div>
  )

  if (!inscription) return (
    <div style={{ minHeight: '100vh', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
      <p style={{ fontSize: '12px', color: c.textDim, letterSpacing: '.1em' }}>INSCRIPTION NOT FOUND</p>
      <button onClick={() => navigate('/inscriptions')} style={{ fontSize: '11px', color: c.gold, background: 'transparent', border: `0.5px solid ${c.gold}`, padding: '8px 20px', borderRadius: '4px', cursor: 'pointer', letterSpacing: '.1em' }}>
        BACK TO INSCRIPTIONS
      </button>
    </div>
  )

  const photos: string[] = inscription.photo_urls || []
  const citations: any[] = inscription.citation_credits || []
  const displayType      = inscription.material_type || inscription.type
  const displayPurpose   = inscription.purpose_category || inscription.purpose

  const inputStyle = {
    width: '100%', background: c.bg, border: `0.5px solid ${c.border}`, borderRadius: '4px',
    padding: '10px 14px', color: c.text, fontSize: '13px', fontFamily: 'Georgia, serif',
    outline: 'none', boxSizing: 'border-box' as const,
  }

  return (
    <div style={{ minHeight: '100vh', background: c.bg, color: c.text, fontFamily: 'Georgia, serif' }}>
      <Nav />

      {/* ── Lightbox ── */}
      {lightboxIndex !== null && (
        <div onClick={() => setLightboxIndex(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.93)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <img src={photos[lightboxIndex]} onClick={e => e.stopPropagation()} style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '4px' }} />
          <button onClick={() => setLightboxIndex(null)} style={{ position: 'absolute', top: '20px', right: '24px', background: 'transparent', border: 'none', color: '#fff', fontSize: '28px', cursor: 'pointer' }}>×</button>
          {lightboxIndex > 0 && <button onClick={e => { e.stopPropagation(); setLightboxIndex(i => i! - 1) }} style={{ position: 'absolute', left: '16px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', padding: '12px 16px', borderRadius: '4px' }}>‹</button>}
          {lightboxIndex < photos.length - 1 && <button onClick={e => { e.stopPropagation(); setLightboxIndex(i => i! + 1) }} style={{ position: 'absolute', right: '16px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', padding: '12px 16px', borderRadius: '4px' }}>›</button>}
          <p style={{ position: 'absolute', bottom: '20px', color: 'rgba(255,255,255,0.5)', fontSize: '12px', letterSpacing: '.1em' }}>{lightboxIndex + 1} / {photos.length} · Press Esc to close</p>
        </div>
      )}

      {/* ── Suggest-edit modal ── */}
      {editOpen && (
        <div onClick={() => { if (editMsg?.type === 'success') setEditOpen(false) }}
          style={{ position: 'fixed', inset: 0, zIndex: 1500, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: '8px', padding: '32px', maxWidth: '540px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
              <div>
                <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '4px', fontFamily: 'Arial, sans-serif' }}>SUGGEST AN EDIT</p>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 300, color: c.gold, margin: 0 }}>{inscription.title}</h2>
              </div>
              <button onClick={() => setEditOpen(false)} style={{ background: 'transparent', border: 'none', color: c.textDim, fontSize: '22px', cursor: 'pointer', lineHeight: 1, marginTop: '-4px' }}>×</button>
            </div>
            <div style={{ width: '30px', height: '0.5px', background: c.gold, opacity: 0.5, margin: '14px 0 20px' }} />

            {editMsg && (
              <div style={{ background: editMsg.type === 'error' ? 'rgba(196,98,45,0.1)' : 'rgba(212,168,67,0.1)', border: `0.5px solid ${editMsg.type === 'error' ? c.orange : c.gold}`, borderRadius: '4px', padding: '10px 14px', marginBottom: '16px' }}>
                <p style={{ fontSize: '12px', color: editMsg.type === 'error' ? c.orange : c.gold, lineHeight: 1.5, margin: 0 }}>{editMsg.text}</p>
                {editMsg.type === 'success' && <button onClick={() => setEditOpen(false)} style={{ background: 'transparent', border: 'none', color: c.gold, fontSize: '11px', letterSpacing: '.08em', cursor: 'pointer', padding: 0, marginTop: '8px', display: 'block' }}>CLOSE ×</button>}
              </div>
            )}

            {editMsg?.type !== 'success' && (
              <>
                {/* Field selector */}
                <div style={{ marginBottom: '14px' }}>
                  <p style={{ fontSize: '10px', letterSpacing: '.12em', color: c.textDim, marginBottom: '6px', fontFamily: 'Arial, sans-serif' }}>FIELD TO CORRECT *</p>
                  <select value={editField} onChange={e => handleFieldChange(e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' as const,
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23888' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: '36px',
                    }}>
                    <option value="">Select field…</option>
                    {EDITABLE_FIELDS.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
                  </select>
                </div>

                {/* Current value (read-only) */}
                {editField && (
                  <div style={{ marginBottom: '14px' }}>
                    <p style={{ fontSize: '10px', letterSpacing: '.12em', color: c.textDim, marginBottom: '6px', fontFamily: 'Arial, sans-serif' }}>CURRENT VALUE</p>
                    <div style={{ ...inputStyle, background: c.bg, color: c.textDim, opacity: 0.75, minHeight: '40px', lineHeight: 1.6, borderStyle: 'dashed' }}>
                      {currentValueForField(editField) || <em style={{ opacity: 0.5 }}>Not recorded</em>}
                    </div>
                  </div>
                )}

                {/* Suggested value */}
                <div style={{ marginBottom: '14px' }}>
                  <p style={{ fontSize: '10px', letterSpacing: '.12em', color: c.textDim, marginBottom: '6px', fontFamily: 'Arial, sans-serif' }}>SUGGESTED VALUE *</p>
                  <textarea value={editSuggested} onChange={e => setEditSuggested(e.target.value)}
                    placeholder="Enter the corrected value…" rows={3}
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
                </div>

                {/* Justification */}
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '10px', letterSpacing: '.12em', color: c.textDim, marginBottom: '6px', fontFamily: 'Arial, sans-serif' }}>JUSTIFICATION & SOURCE *</p>
                  <textarea value={editJustify} onChange={e => setEditJustify(e.target.value)}
                    placeholder="Cite your source or explain the reasoning for this correction…" rows={3}
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
                  <p style={{ fontSize: '11px', color: c.textFaint, marginTop: '4px', lineHeight: 1.5 }}>
                    All suggestions are reviewed by Shilalekh editors before any changes are made.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={submitEdit} disabled={editSubmitting}
                    style={{ background: c.gold, border: 'none', color: '#0a0a0a', padding: '11px 24px', borderRadius: '4px', fontSize: '11px', letterSpacing: '.1em', cursor: editSubmitting ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: editSubmitting ? 0.6 : 1 }}>
                    {editSubmitting ? 'SUBMITTING…' : 'SUBMIT SUGGESTION'}
                  </button>
                  <button onClick={() => setEditOpen(false)}
                    style={{ background: 'transparent', border: `0.5px solid ${c.border}`, color: c.textDim, padding: '11px 20px', borderRadius: '4px', fontSize: '11px', letterSpacing: '.1em', cursor: 'pointer' }}>
                    CANCEL
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '100px 32px 60px' }}>

        <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.textDim, marginBottom: '16px', cursor: 'pointer', fontFamily: 'Arial, sans-serif' }} onClick={() => navigate('/inscriptions')}>← BACK TO INSCRIPTIONS</p>

        {/* Tags */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {displayType && <span style={{ fontSize: '10px', padding: '3px 10px', border: `0.5px solid ${c.gold}`, color: c.gold, borderRadius: '99px', letterSpacing: '.05em' }}>{displayType.toUpperCase()}</span>}
          {inscription.state_province && <span style={{ fontSize: '10px', padding: '3px 10px', border: `0.5px solid ${c.border}`, color: c.textDim, borderRadius: '99px', letterSpacing: '.05em' }}>{inscription.state_province.toUpperCase()}</span>}
          {inscription.year           && <span style={{ fontSize: '10px', padding: '3px 10px', border: `0.5px solid ${c.border}`, color: c.textDim, borderRadius: '99px', letterSpacing: '.05em' }}>{inscription.year}</span>}
          {inscription.script         && <span style={{ fontSize: '10px', padding: '3px 10px', border: `0.5px solid ${c.border}`, color: c.textDim, borderRadius: '99px', letterSpacing: '.05em' }}>{inscription.script.toUpperCase()}</span>}
        </div>

        {/* Title */}
        <h1 style={{ fontSize: '2.5rem', fontWeight: 300, color: c.gold, marginBottom: '16px', letterSpacing: '.05em' }}>{inscription.title}</h1>

        {/* ShilaID + Share + Bookmark + Suggest Edit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          {inscription.shila_id && (
            <span style={{ fontFamily: '"Courier New", Courier, monospace', fontSize: '11px', color: c.textDim, background: c.bgCard, border: `0.5px solid ${c.border}`, padding: '5px 12px', borderRadius: '4px', letterSpacing: '.1em', userSelect: 'all' as const }}>
              {inscription.shila_id}
            </span>
          )}

          {/* Share */}
          <button onClick={handleShare} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: copied ? 'rgba(212,168,67,0.1)' : 'transparent', border: `0.5px solid ${copied ? c.gold : c.border}`, color: copied ? c.gold : c.textDim, padding: '5px 14px', borderRadius: '4px', fontSize: '10px', letterSpacing: '.1em', cursor: 'pointer', fontFamily: 'Arial, sans-serif', transition: 'all 0.2s' }}
            onMouseEnter={e => { if (!copied) { e.currentTarget.style.borderColor = c.gold; e.currentTarget.style.color = c.gold } }}
            onMouseLeave={e => { if (!copied) { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.color = c.textDim } }}>
            <span style={{ fontSize: '12px' }}>{copied ? '✓' : '⎘'}</span>
            {copied ? 'LINK COPIED' : 'SHARE'}
          </button>

          {/* Bookmark */}
          <button onClick={handleBookmark} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: isBookmarked ? 'rgba(212,168,67,0.1)' : 'transparent', border: `0.5px solid ${isBookmarked ? c.gold : c.border}`, color: isBookmarked ? c.gold : c.textDim, padding: '5px 14px', borderRadius: '4px', fontSize: '10px', letterSpacing: '.1em', cursor: 'pointer', fontFamily: 'Arial, sans-serif', transition: 'all 0.2s' }}
            onMouseEnter={e => { if (!isBookmarked) { e.currentTarget.style.borderColor = c.gold; e.currentTarget.style.color = c.gold } }}
            onMouseLeave={e => { if (!isBookmarked) { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.color = c.textDim } }}>
            <svg width="10" height="13" viewBox="0 0 14 18" fill={isBookmarked ? c.gold : 'none'} stroke={isBookmarked ? c.gold : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1h12v15l-6-4-6 4V1z"/></svg>
            {isBookmarked ? 'BOOKMARKED' : 'BOOKMARK'}
          </button>

          {/* Suggest edit */}
          <button onClick={openEdit} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: `0.5px solid ${c.border}`, color: c.textDim, padding: '5px 14px', borderRadius: '4px', fontSize: '10px', letterSpacing: '.1em', cursor: 'pointer', fontFamily: 'Arial, sans-serif', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = c.gold; e.currentTarget.style.color = c.gold }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.color = c.textDim }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            SUGGEST EDIT
          </button>
        </div>

        {/* Location */}
        <p style={{ fontSize: '13px', color: c.textDim, marginBottom: '32px', letterSpacing: '.05em' }}>
          {inscription.current_location}
          {inscription.latitude && inscription.longitude && ` · ${inscription.latitude}° N, ${inscription.longitude}° E`}
        </p>

        <div style={{ width: '40px', height: '0.5px', background: c.gold, marginBottom: '32px', opacity: .5 }} />

        {/* PHOTOGRAPHS */}
        {photos.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '14px', fontFamily: 'Arial, sans-serif' }}>PHOTOGRAPHS</p>
            <div style={{ borderRadius: '8px', overflow: 'hidden', marginBottom: '8px', cursor: 'zoom-in', border: `0.5px solid ${c.border}` }} onClick={() => setLightboxIndex(0)}>
              <img src={photos[0]} alt={inscription.title} style={{ width: '100%', maxHeight: '480px', objectFit: 'cover', display: 'block' }} />
            </div>
            {photos.length > 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(photos.length - 1, 4)}, 1fr)`, gap: '8px' }}>
                {photos.slice(1).map((url, i) => (
                  <div key={i} style={{ borderRadius: '4px', overflow: 'hidden', aspectRatio: '4/3', cursor: 'zoom-in', border: `0.5px solid ${c.border}` }} onClick={() => setLightboxIndex(i + 1)}>
                    <img src={url} alt={`${inscription.title} ${i + 2}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                ))}
              </div>
            )}
            <p style={{ fontSize: '10px', color: c.textFaint, marginTop: '8px', fontFamily: 'Arial, sans-serif', letterSpacing: '.05em' }}>{photos.length} photo{photos.length > 1 ? 's' : ''} · Click to enlarge</p>
          </div>
        )}

        {/* SHORT DESCRIPTION */}
        {inscription.short_description && (
          <div style={{ background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: '8px', padding: '24px', marginBottom: '32px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '12px', fontFamily: 'Arial, sans-serif' }}>SHORT DESCRIPTION</p>
            <p style={{ fontSize: '15px', color: c.text, lineHeight: 1.8 }}>{inscription.short_description}</p>
          </div>
        )}

        {/* KEY FIELDS */}
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

        {/* ACTUAL TEXT */}
        {inscription.actual_text && (
          <div style={{ background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '12px', fontFamily: 'Arial, sans-serif' }}>ACTUAL TEXT</p>
            <p style={{ fontSize: '16px', color: c.text, lineHeight: 2 }}>{inscription.actual_text}</p>
          </div>
        )}

        {/* TRANSLITERATION */}
        {inscription.transliteration && (
          <div style={{ background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '12px', fontFamily: 'Arial, sans-serif' }}>TRANSLITERATION</p>
            <p style={{ fontSize: '14px', color: c.text, lineHeight: 1.8, fontStyle: 'italic' }}>{inscription.transliteration}</p>
          </div>
        )}

        {/* TRANSLATION */}
        {inscription.translation_english && (
          <div style={{ background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '12px', fontFamily: 'Arial, sans-serif' }}>TRANSLATION</p>
            <p style={{ fontSize: '14px', color: c.text, lineHeight: 1.8 }}>{inscription.translation_english}</p>
          </div>
        )}

        {/* IMPORTANCE */}
        {inscription.importance && (
          <div style={{ background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '12px', fontFamily: 'Arial, sans-serif' }}>IMPORTANCE</p>
            <p style={{ fontSize: '13px', color: c.textMuted, lineHeight: 1.8 }}>{inscription.importance}</p>
          </div>
        )}

        {/* DETAILED INFORMATION */}
        {inscription.detailed_information && (
          <div style={{ background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '12px', fontFamily: 'Arial, sans-serif' }}>DETAILED INFORMATION</p>
            <p style={{ fontSize: '13px', color: c.textMuted, lineHeight: 1.8 }}>{inscription.detailed_information}</p>
          </div>
        )}

        {/* CITATIONS */}
        {citations.length > 0 && (
          <div style={{ background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '16px', fontFamily: 'Arial, sans-serif' }}>CITATIONS & CREDITS</p>
            {citations.map((cite: any, i: number) => (
              <div key={i} style={{ paddingBottom: i < citations.length - 1 ? '14px' : 0, marginBottom: i < citations.length - 1 ? '14px' : 0, borderBottom: i < citations.length - 1 ? `0.5px solid ${c.borderLight}` : 'none' }}>
                <p style={{ fontSize: '9px', letterSpacing: '.15em', color: c.textDim, marginBottom: '5px', fontFamily: 'Arial, sans-serif' }}>{cite.type?.toUpperCase()}</p>
                {cite.url ? (
                  <a href={cite.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: c.gold, textDecoration: 'none', lineHeight: 1.6 }}
                    onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                    onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}>{cite.value}</a>
                ) : (
                  <p style={{ fontSize: '13px', color: c.text, lineHeight: 1.6 }}>{cite.value}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* RECORD ATTRIBUTION */}
        <div style={{ borderTop: `0.5px solid ${c.borderLight}`, paddingTop: '24px', marginTop: '8px' }}>
          <p style={{ fontSize: '9px', letterSpacing: '.15em', color: c.textDim, marginBottom: '12px', fontFamily: 'Arial, sans-serif' }}>RECORD ATTRIBUTION</p>
          {inscription.submitted_by ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', color: c.textDim, fontFamily: 'Arial, sans-serif' }}>Contributed by</span>
              {contributorHandle ? (
                <span onClick={() => navigate(`/u/${contributorHandle}`)}
                  style={{ fontSize: '12px', color: c.gold, fontFamily: '"Courier New", Courier, monospace', cursor: 'pointer', letterSpacing: '.05em' }}
                  onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                  onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}>
                  @{contributorHandle}
                </span>
              ) : (
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
            <p style={{ fontSize: '11px', color: c.textDim, fontFamily: 'Arial, sans-serif', fontStyle: 'italic' }}>Sourced from ASI records</p>
          )}
        </div>

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