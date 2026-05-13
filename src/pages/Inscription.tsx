import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import Nav from '../components/Nav'
import { useTheme } from '../theme'
import { useBookmarks } from '../lib/useBookmarks'

// ─── Editable fields ──────────────────────────────────────────────────────────
const EDITABLE_FIELDS = [
  { key: 'title',                label: 'Title' },
  { key: 'script',               label: 'Script' },
  { key: 'language',             label: 'Language' },
  { key: 'year',                 label: 'Year / Date' },
  { key: 'dynasty',              label: 'Dynasty' },
  { key: 'reign_ruler',          label: 'Ruler / Reign' },
  { key: 'condition',            label: 'Condition' },
  { key: 'short_description',    label: 'Short Description' },
  { key: 'actual_text',          label: 'Actual Text (original script)' },
  { key: 'transliteration',      label: 'Transliteration' },
  { key: 'translation_english',  label: 'English Translation' },
  { key: 'importance',           label: 'Importance' },
  { key: 'detailed_information', label: 'Detailed Information' },
]
const FIELD_MAP = Object.fromEntries(EDITABLE_FIELDS.map(f => [f.key, f.label]))

// ─── Pencil icon ──────────────────────────────────────────────────────────────
function PencilBtn({ onClick, color }: { onClick: () => void; color: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button onClick={e => { e.stopPropagation(); onClick() }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      title="Suggest an edit"
      style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px 4px', display: 'inline-flex', alignItems: 'center', opacity: hovered ? 1 : 0.55, transition: 'opacity 0.15s', verticalAlign: 'middle', marginLeft: '6px' }}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    </button>
  )
}

// ─── Line-numbered text block ─────────────────────────────────────────────────
function LineNumberedText({ text, fontSize = '15px', italic = false, c }: { text: string; fontSize?: string; italic?: boolean; c: any }) {
  const lines = text.split('\n').filter(l => l.trim() !== '')
  if (lines.length === 0) return null
  return (
    <div style={{ fontFamily: 'Georgia, serif' }}>
      {lines.map((line, i) => (
        <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '6px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '10px', color: c.textFaint, fontFamily: 'Arial, sans-serif', letterSpacing: '.05em', minWidth: '18px', textAlign: 'right', paddingTop: '3px', flexShrink: 0, userSelect: 'none' }}>
            {i + 1}
          </span>
          <span style={{ fontSize, color: c.text, lineHeight: 1.8, fontStyle: italic ? 'italic' : 'normal', flex: 1 }}>
            {line}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Accordion section ────────────────────────────────────────────────────────
function AccordionSection({ label, children, defaultOpen = false, onEdit, editColor, c }: {
  label: string; children: React.ReactNode; defaultOpen?: boolean
  onEdit?: () => void; editColor?: string; c: any
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ borderTop: `0.5px solid ${c.borderLight}` }}>
      <div onClick={() => setOpen(v => !v)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', cursor: 'pointer', userSelect: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, fontFamily: 'Arial, sans-serif', margin: 0 }}>{label}</p>
          {onEdit && open && (
            <PencilBtn color={editColor || c.orange} onClick={() => { onEdit!() }} />
          )}
        </div>
        <span style={{ fontSize: '18px', color: c.textDim, lineHeight: 1, transition: 'transform 0.2s', display: 'inline-block', transform: open ? 'rotate(45deg)' : 'none' }}>+</span>
      </div>
      {open && (
        <div style={{ paddingBottom: '28px' }}>
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Inscription() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { c } = useTheme()
  const { bookmarked, toggle, isLoggedIn } = useBookmarks()

  const [inscription, setInscription]       = useState<any>(null)
  const [loading, setLoading]               = useState(true)
  const [lightboxIndex, setLightboxIndex]   = useState<number | null>(null)
  const [copied, setCopied]                 = useState(false)
  const [contributorHandle, setContributorHandle]       = useState<string | null>(null)
  const [contributorAnonymous, setContributorAnonymous] = useState(false)

  // Suggest-edit modal
  const [editOpen,       setEditOpen]       = useState(false)
  const [editField,      setEditField]      = useState('')
  const [editSuggested,  setEditSuggested]  = useState('')
  const [editJustify,    setEditJustify]    = useState('')
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editMsg,        setEditMsg]        = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [editUser,       setEditUser]       = useState<any>(null)
  const [isPhotoEdit,    setIsPhotoEdit]    = useState(false)

  useEffect(() => {
    if (!id) return
    const isShilaId = id.toUpperCase().startsWith('SHILA-')
    const q = isShilaId
      ? supabase.from('inscriptions').select('*').eq('shila_id', id.toUpperCase()).single()
      : supabase.from('inscriptions').select('*').eq('id', id).single()
    q.then(({ data, error }) => { if (!error && data) setInscription(data); setLoading(false) })
  }, [id])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setEditUser(user))
  }, [])

  useEffect(() => {
    if (!inscription?.submitted_by) return
    supabase.from('profiles').select('handle, is_anonymous').eq('id', inscription.submitted_by).single()
      .then(({ data }) => {
        if (data) { setContributorAnonymous(data.is_anonymous || false); if (!data.is_anonymous && data.handle) setContributorHandle(data.handle) }
      })
  }, [inscription?.submitted_by])

  useEffect(() => {
    const photos = inscription?.photo_urls || []
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setLightboxIndex(null); setEditOpen(false) }
      if (e.key === 'ArrowRight' && lightboxIndex !== null) setLightboxIndex(i => i !== null && i < photos.length - 1 ? i + 1 : i)
      if (e.key === 'ArrowLeft'  && lightboxIndex !== null) setLightboxIndex(i => i !== null && i > 0 ? i - 1 : i)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxIndex, inscription])

  const handleShare = () => {
    const url = `https://shilalekh.org/inscription/${inscription?.shila_id || inscription?.id}`
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500) })
    else { const el = document.createElement('textarea'); el.value = url; document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el); setCopied(true); setTimeout(() => setCopied(false), 2500) }
  }

  const handleBookmark = () => { if (!isLoggedIn) { navigate('/signin'); return }; if (inscription?.id) toggle(inscription.id) }
  const isBookmarked = inscription ? bookmarked.has(inscription.id) : false

  const openEdit = (fieldKey: string, photo = false) => {
    if (!isLoggedIn) { navigate('/signin'); return }
    setIsPhotoEdit(photo); setEditField(photo ? 'photos' : fieldKey)
    setEditSuggested(''); setEditJustify(''); setEditMsg(null); setEditOpen(true)
  }

  const submitEdit = async () => {
    setEditMsg(null)
    if (!isPhotoEdit && !editField) { setEditMsg({ type: 'error', text: 'Please select a field to correct.' }); return }
    if (!editSuggested.trim()) { setEditMsg({ type: 'error', text: 'Please enter a suggested value.' }); return }
    if (!editJustify.trim())   { setEditMsg({ type: 'error', text: 'Please provide a justification or source.' }); return }
    if (!editUser) { navigate('/signin'); return }
    setEditSubmitting(true)
    const currentVal = isPhotoEdit ? null : (inscription?.[editField] ?? null)
    const { error } = await supabase.from('edit_requests').insert({
      inscription_id: inscription.id, submitted_by: editUser.id,
      field_name: editField || 'general', current_value: currentVal ? String(currentVal) : null,
      suggested_value: editSuggested.trim(), justification: editJustify.trim(),
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
      <button onClick={() => navigate('/inscriptions')} style={{ fontSize: '11px', color: c.gold, background: 'transparent', border: `0.5px solid ${c.gold}`, padding: '8px 20px', borderRadius: '4px', cursor: 'pointer', letterSpacing: '.1em' }}>BACK TO INSCRIPTIONS</button>
    </div>
  )

  const photos: string[] = inscription.photo_urls || []
  const citations: any[] = inscription.citation_credits || []
  const displayType      = inscription.material_type || inscription.type
  const displayPurpose   = inscription.purpose_category || inscription.purpose

  const inputStyle = { width: '100%', background: c.bg, border: `0.5px solid ${c.border}`, borderRadius: '4px', padding: '10px 14px', color: c.text, fontSize: '13px', fontFamily: 'Georgia, serif', outline: 'none', boxSizing: 'border-box' as const }

  const metaFields = [
    { label: 'Type',          value: displayType },
    { label: 'Script',        value: inscription.script,        key: 'script' },
    { label: 'Language',      value: inscription.language,      key: 'language' },
    { label: 'Year',          value: inscription.year,          key: 'year' },
    { label: 'Dynasty',       value: inscription.dynasty,       key: 'dynasty' },
    { label: 'Ruler',         value: inscription.reign_ruler,   key: 'reign_ruler' },
    { label: 'Purpose',       value: displayPurpose },
    { label: 'Condition',     value: inscription.condition,     key: 'condition' },
    { label: 'Country',       value: inscription.country || inscription.current_country },
    { label: 'State',         value: inscription.state_province },
    { label: 'Location',      value: inscription.current_location },
    { label: 'In Situ',       value: inscription.in_situ === true ? 'Yes' : inscription.in_situ === false ? 'No' : null },
    { label: 'Height',        value: inscription.height_cm ? `${inscription.height_cm} cm` : null },
    { label: 'Width',         value: inscription.width_cm  ? `${inscription.width_cm} cm`  : null },
    { label: 'Depth',         value: inscription.depth_cm  ? `${inscription.depth_cm} cm`  : null },
    { label: 'Accession No.', value: inscription.accession_number },
  ].filter(f => f.value)

  return (
    <div style={{ minHeight: '100vh', background: c.bg, color: c.text, fontFamily: 'Georgia, serif' }}>
      <Nav />

      {/* ── Lightbox ── */}
      {lightboxIndex !== null && (
        <div onClick={() => setLightboxIndex(null)} style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.93)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <img src={photos[lightboxIndex]} onClick={e => e.stopPropagation()} style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '4px' }} />
          <button onClick={() => setLightboxIndex(null)} style={{ position: 'absolute', top: '20px', right: '24px', background: 'transparent', border: 'none', color: '#fff', fontSize: '28px', cursor: 'pointer' }}>×</button>
          {lightboxIndex > 0 && <button onClick={e => { e.stopPropagation(); setLightboxIndex(i => i! - 1) }} style={{ position: 'absolute', left: '16px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', padding: '12px 16px', borderRadius: '4px' }}>‹</button>}
          {lightboxIndex < photos.length - 1 && <button onClick={e => { e.stopPropagation(); setLightboxIndex(i => i! + 1) }} style={{ position: 'absolute', right: '16px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', padding: '12px 16px', borderRadius: '4px' }}>›</button>}
          <p style={{ position: 'absolute', bottom: '20px', color: 'rgba(255,255,255,0.5)', fontSize: '12px', letterSpacing: '.1em' }}>{lightboxIndex + 1} / {photos.length} · Press Esc to close</p>
        </div>
      )}

      {/* ── Suggest-edit modal ── */}
      {editOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1500, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: '8px', padding: '32px', maxWidth: '540px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
              <div>
                <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '4px', fontFamily: 'Arial, sans-serif' }}>SUGGEST AN EDIT</p>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 300, color: c.gold, margin: 0 }}>
                  {isPhotoEdit ? 'Photo correction' : editField ? (FIELD_MAP[editField] || editField) : 'Select a field to correct'}
                </h2>
                <p style={{ fontSize: '11px', color: c.textDim, marginTop: '4px', fontFamily: 'Arial, sans-serif' }}>{inscription.title}</p>
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
                {/* Field selector — shown when opened without pre-selected field */}
                {!isPhotoEdit && !editField && (
                  <div style={{ marginBottom: '14px' }}>
                    <p style={{ fontSize: '10px', letterSpacing: '.12em', color: c.textDim, marginBottom: '6px', fontFamily: 'Arial, sans-serif' }}>FIELD TO CORRECT *</p>
                    <select value={editField} onChange={e => setEditField(e.target.value)}
                      style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' as const, backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23888' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: '36px' }}>
                      <option value="">Select a field…</option>
                      {EDITABLE_FIELDS.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
                    </select>
                  </div>
                )}

                {/* Current value */}
                {!isPhotoEdit && editField && inscription[editField] && (
                  <div style={{ marginBottom: '14px' }}>
                    <p style={{ fontSize: '10px', letterSpacing: '.12em', color: c.textDim, marginBottom: '6px', fontFamily: 'Arial, sans-serif' }}>CURRENT VALUE</p>
                    <div style={{ ...inputStyle, color: c.textDim, opacity: 0.75, lineHeight: 1.6, borderStyle: 'dashed', minHeight: '40px' }}>{inscription[editField]}</div>
                  </div>
                )}

                {/* Suggested value */}
                <div style={{ marginBottom: '14px' }}>
                  <p style={{ fontSize: '10px', letterSpacing: '.12em', color: c.textDim, marginBottom: '6px', fontFamily: 'Arial, sans-serif' }}>
                    {isPhotoEdit ? 'DESCRIBE THE CORRECTION OR ADDITION' : 'SUGGESTED VALUE *'}
                  </p>
                  <textarea value={editSuggested} onChange={e => setEditSuggested(e.target.value)}
                    placeholder={isPhotoEdit ? 'Describe the photo issue or what should be added…' : 'Enter the corrected value…'}
                    rows={3} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
                </div>

                {/* Justification */}
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '10px', letterSpacing: '.12em', color: c.textDim, marginBottom: '6px', fontFamily: 'Arial, sans-serif' }}>JUSTIFICATION & SOURCE *</p>
                  <textarea value={editJustify} onChange={e => setEditJustify(e.target.value)}
                    placeholder="Cite your source or explain the reasoning for this correction…"
                    rows={3} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
                  <p style={{ fontSize: '11px', color: c.textFaint, marginTop: '6px', lineHeight: 1.5 }}>All suggestions are reviewed by Shilalekh editors before any changes are applied.</p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={submitEdit} disabled={editSubmitting}
                    style={{ background: c.gold, border: 'none', color: '#0a0a0a', padding: '11px 24px', borderRadius: '4px', fontSize: '11px', letterSpacing: '.1em', cursor: editSubmitting ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: editSubmitting ? 0.6 : 1 }}>
                    {editSubmitting ? 'SUBMITTING…' : 'SUBMIT SUGGESTION'}
                  </button>
                  <button onClick={() => setEditOpen(false)} style={{ background: 'transparent', border: `0.5px solid ${c.border}`, color: c.textDim, padding: '11px 20px', borderRadius: '4px', fontSize: '11px', letterSpacing: '.1em', cursor: 'pointer' }}>CANCEL</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Page content ── */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '100px 32px 60px' }}>

        <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.textDim, marginBottom: '16px', cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}
          onClick={() => navigate('/inscriptions')}>← BACK TO INSCRIPTIONS</p>

        {/* Tags */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {displayType && <span style={{ fontSize: '10px', padding: '3px 10px', border: `0.5px solid ${c.gold}`, color: c.gold, borderRadius: '99px', letterSpacing: '.05em' }}>{displayType.toUpperCase()}</span>}
          {inscription.state_province && <span style={{ fontSize: '10px', padding: '3px 10px', border: `0.5px solid ${c.border}`, color: c.textDim, borderRadius: '99px', letterSpacing: '.05em' }}>{inscription.state_province.toUpperCase()}</span>}
          {inscription.year          && <span style={{ fontSize: '10px', padding: '3px 10px', border: `0.5px solid ${c.border}`, color: c.textDim, borderRadius: '99px', letterSpacing: '.05em' }}>{inscription.year}</span>}
          {inscription.script        && <span style={{ fontSize: '10px', padding: '3px 10px', border: `0.5px solid ${c.border}`, color: c.textDim, borderRadius: '99px', letterSpacing: '.05em' }}>{inscription.script.toUpperCase()}</span>}
        </div>

        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 300, color: c.gold, letterSpacing: '.05em', margin: 0, lineHeight: 1.2 }}>{inscription.title}</h1>
          <div style={{ paddingTop: '10px' }}><PencilBtn color={c.orange} onClick={() => openEdit('title')} /></div>
        </div>

        {/* ShilaID + Share + Bookmark + Suggest Edit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {inscription.shila_id && (
            <span style={{ fontFamily: '"Courier New", Courier, monospace', fontSize: '11px', color: c.textDim, background: c.bgCard, border: `0.5px solid ${c.border}`, padding: '5px 12px', borderRadius: '4px', letterSpacing: '.1em', userSelect: 'all' as const }}>
              {inscription.shila_id}
            </span>
          )}
          <button onClick={handleShare} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: copied ? 'rgba(212,168,67,0.1)' : 'transparent', border: `0.5px solid ${copied ? c.gold : c.border}`, color: copied ? c.gold : c.textDim, padding: '5px 14px', borderRadius: '4px', fontSize: '10px', letterSpacing: '.1em', cursor: 'pointer', fontFamily: 'Arial, sans-serif', transition: 'all 0.2s' }}
            onMouseEnter={e => { if (!copied) { e.currentTarget.style.borderColor = c.gold; e.currentTarget.style.color = c.gold }}}
            onMouseLeave={e => { if (!copied) { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.color = c.textDim }}}>
            <span style={{ fontSize: '12px' }}>{copied ? '✓' : '⎘'}</span>
            {copied ? 'LINK COPIED' : 'SHARE'}
          </button>
          <button onClick={handleBookmark} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: isBookmarked ? 'rgba(212,168,67,0.1)' : 'transparent', border: `0.5px solid ${isBookmarked ? c.gold : c.border}`, color: isBookmarked ? c.gold : c.textDim, padding: '5px 14px', borderRadius: '4px', fontSize: '10px', letterSpacing: '.1em', cursor: 'pointer', fontFamily: 'Arial, sans-serif', transition: 'all 0.2s' }}
            onMouseEnter={e => { if (!isBookmarked) { e.currentTarget.style.borderColor = c.gold; e.currentTarget.style.color = c.gold }}}
            onMouseLeave={e => { if (!isBookmarked) { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.color = c.textDim }}}>
            <svg width="10" height="13" viewBox="0 0 14 18" fill={isBookmarked ? c.gold : 'none'} stroke={isBookmarked ? c.gold : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1h12v15l-6-4-6 4V1z"/></svg>
            {isBookmarked ? 'BOOKMARKED' : 'BOOKMARK'}
          </button>
          {/* Full-record suggest edit */}
          <button onClick={() => openEdit('')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: `0.5px solid ${c.border}`, color: c.textDim, padding: '5px 14px', borderRadius: '4px', fontSize: '10px', letterSpacing: '.1em', cursor: 'pointer', fontFamily: 'Arial, sans-serif', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = c.orange; e.currentTarget.style.color = c.orange }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.color = c.textDim }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            SUGGEST EDIT
          </button>
        </div>

        <div style={{ width: '40px', height: '0.5px', background: c.gold, marginBottom: '8px', opacity: .5 }} />

        {/* ── ACCORDION SECTIONS ── */}

        {/* READ */}
        {inscription.actual_text && (
          <AccordionSection label="READ" defaultOpen={true} onEdit={() => openEdit('actual_text')} editColor={c.orange} c={c}>
            {inscription.short_description && (
              <p style={{ fontSize: '13px', color: c.textDim, lineHeight: 1.7, marginBottom: '20px', fontStyle: 'italic', borderLeft: `2px solid ${c.borderLight}`, paddingLeft: '14px' }}>
                {inscription.short_description}
              </p>
            )}
            <LineNumberedText text={inscription.actual_text} fontSize="16px" c={c} />
          </AccordionSection>
        )}

        {/* TRANSLITERATION */}
        {inscription.transliteration && (
          <AccordionSection label="TRANSLITERATION" onEdit={() => openEdit('transliteration')} editColor={c.orange} c={c}>
            <LineNumberedText text={inscription.transliteration} fontSize="14px" italic={true} c={c} />
          </AccordionSection>
        )}

        {/* TRANSLATION */}
        {inscription.translation_english && (
          <AccordionSection label="TRANSLATION" onEdit={() => openEdit('translation_english')} editColor={c.orange} c={c}>
            <p style={{ fontSize: '14px', color: c.text, lineHeight: 1.9 }}>{inscription.translation_english}</p>
          </AccordionSection>
        )}

        {/* DETAILS */}
        <AccordionSection label="DETAILS" c={c}>
          {/* Metadata grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: metaFields.length > 0 ? '24px' : 0 }}>
            {metaFields.map((f, i) => (
              <div key={i} style={{ background: c.bgCard, border: `0.5px solid ${c.borderLight}`, borderRadius: '6px', padding: '10px 14px' }}>
                <p style={{ fontSize: '9px', letterSpacing: '.15em', color: c.textDim, marginBottom: '4px', fontFamily: 'Arial, sans-serif', display: 'flex', alignItems: 'center' }}>
                  {f.label.toUpperCase()}
                  {(f as any).key && <PencilBtn color={c.orange} onClick={() => openEdit((f as any).key)} />}
                </p>
                <p style={{ fontSize: '13px', color: c.text, fontWeight: 300 }}>{f.value}</p>
              </div>
            ))}
          </div>

          {/* Importance */}
          {inscription.importance && (
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '9px', letterSpacing: '.15em', color: c.textDim, marginBottom: '8px', fontFamily: 'Arial, sans-serif', display: 'flex', alignItems: 'center' }}>
                IMPORTANCE <PencilBtn color={c.orange} onClick={() => openEdit('importance')} />
              </p>
              <p style={{ fontSize: '13px', color: c.textMuted, lineHeight: 1.8 }}>{inscription.importance}</p>
            </div>
          )}

          {/* Detailed information */}
          {inscription.detailed_information && (
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '9px', letterSpacing: '.15em', color: c.textDim, marginBottom: '8px', fontFamily: 'Arial, sans-serif', display: 'flex', alignItems: 'center' }}>
                DETAILED INFORMATION <PencilBtn color={c.orange} onClick={() => openEdit('detailed_information')} />
              </p>
              <p style={{ fontSize: '13px', color: c.textMuted, lineHeight: 1.8 }}>{inscription.detailed_information}</p>
            </div>
          )}

          {/* Citations */}
          {citations.length > 0 && (
            <div>
              <p style={{ fontSize: '9px', letterSpacing: '.15em', color: c.textDim, marginBottom: '12px', fontFamily: 'Arial, sans-serif' }}>CITATIONS & CREDITS</p>
              {citations.map((cite: any, i: number) => (
                <div key={i} style={{ paddingBottom: i < citations.length - 1 ? '12px' : 0, marginBottom: i < citations.length - 1 ? '12px' : 0, borderBottom: i < citations.length - 1 ? `0.5px solid ${c.borderLight}` : 'none' }}>
                  <p style={{ fontSize: '9px', letterSpacing: '.12em', color: c.textDim, marginBottom: '4px', fontFamily: 'Arial, sans-serif' }}>{cite.type?.toUpperCase()}</p>
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
        </AccordionSection>

        {/* PHOTOS */}
        <AccordionSection label="PHOTOS" c={c}>
          {photos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <p style={{ fontSize: '12px', color: c.textFaint, marginBottom: '12px' }}>No photographs yet.</p>
              <button onClick={() => openEdit('photos', true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'transparent', border: `0.5px solid ${c.border}`, color: c.textDim, padding: '7px 16px', borderRadius: '4px', fontSize: '10px', letterSpacing: '.1em', cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = c.orange; e.currentTarget.style.color = c.orange }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.color = c.textDim }}>
                SUGGEST A PHOTO
              </button>
            </div>
          ) : (
            <>
              <div style={{ borderRadius: '8px', overflow: 'hidden', marginBottom: '8px', cursor: 'zoom-in', border: `0.5px solid ${c.border}` }} onClick={() => setLightboxIndex(0)}>
                <img src={photos[0]} alt={inscription.title} style={{ width: '100%', maxHeight: '480px', objectFit: 'cover', display: 'block' }} />
              </div>
              {photos.length > 1 && (
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(photos.length - 1, 4)}, 1fr)`, gap: '8px', marginBottom: '10px' }}>
                  {photos.slice(1).map((url, i) => (
                    <div key={i} style={{ borderRadius: '4px', overflow: 'hidden', aspectRatio: '4/3', cursor: 'zoom-in', border: `0.5px solid ${c.border}` }} onClick={() => setLightboxIndex(i + 1)}>
                      <img src={url} alt={`${inscription.title} ${i + 2}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: '10px', color: c.textFaint, fontFamily: 'Arial, sans-serif', letterSpacing: '.05em' }}>{photos.length} photo{photos.length > 1 ? 's' : ''} · Click to enlarge</p>
                <button onClick={() => openEdit('photos', true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'transparent', border: `0.5px solid ${c.border}`, color: c.textDim, padding: '4px 12px', borderRadius: '4px', fontSize: '9px', letterSpacing: '.1em', cursor: 'pointer', fontFamily: 'Arial, sans-serif', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = c.orange; e.currentTarget.style.color = c.orange }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.color = c.textDim }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  SUGGEST PHOTO CORRECTION
                </button>
              </div>
            </>
          )}
        </AccordionSection>

        {/* ── RECORD ATTRIBUTION ── */}
        <div style={{ borderTop: `0.5px solid ${c.borderLight}`, paddingTop: '24px', marginTop: '8px' }}>
          <p style={{ fontSize: '9px', letterSpacing: '.15em', color: c.textDim, marginBottom: '12px', fontFamily: 'Arial, sans-serif' }}>RECORD ATTRIBUTION</p>
          {inscription.submitted_by ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', color: c.textDim, fontFamily: 'Arial, sans-serif' }}>Contributed by</span>
              {contributorHandle ? (
                <span onClick={() => navigate(`/u/${contributorHandle}`)} style={{ fontSize: '12px', color: c.gold, fontFamily: '"Courier New", Courier, monospace', cursor: 'pointer', letterSpacing: '.05em' }}
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