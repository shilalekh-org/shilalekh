import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import Nav from '../components/Nav'
import { useTheme } from '../theme'

const ADMIN_EMAIL = 'aditya.gokhale07@gmail.com'

const ALLOWED_FIELDS = [
  'title', 'material_type', 'script', 'language', 'year', 'dynasty', 'reign_ruler',
  'purpose_category', 'condition', 'country', 'state_province', 'current_location',
  'in_situ', 'height_cm', 'width_cm', 'depth_cm', 'accession_number',
  'short_description', 'actual_text', 'transliteration', 'translation_english',
  'importance', 'detailed_information',
]
// Fields stored as boolean — suggested value "Yes"/"No" must be converted
const BOOLEAN_FIELDS = ['in_situ']
// Fields stored as numeric — suggested value must be parsed to float
const NUMERIC_FIELDS = ['height_cm', 'width_cm', 'depth_cm']

const FIELD_LABELS: Record<string, string> = {
  title: 'Title', material_type: 'Type', script: 'Script', language: 'Language',
  year: 'Year / Date', dynasty: 'Dynasty', reign_ruler: 'Ruler / Reign',
  purpose_category: 'Purpose', condition: 'Condition',
  country: 'Country', state_province: 'State / Province', current_location: 'Location',
  in_situ: 'In Situ', height_cm: 'Height (cm)', width_cm: 'Width (cm)', depth_cm: 'Depth (cm)',
  accession_number: 'Accession Number',
  short_description: 'Short Description', actual_text: 'Actual Text',
  transliteration: 'Transliteration', translation_english: 'English Translation',
  importance: 'Importance', detailed_information: 'Detailed Information',
  photos: 'Photo Upload', general: 'General Edit',
}

type Inscription = {
  id: string; shila_id: string; title: string; type: string; material_type: string
  status: string; submitted_by: string; created_at: string; country: string
  state_province: string; year: string; script: string; language: string
  dynasty: string; short_description: string; rejection_reason: string
}

type EditRequest = {
  id: string; inscription_id: number; submitted_by: string; field_name: string
  current_value: string | null; suggested_value: string; justification: string
  status: string; admin_note: string | null; reviewed_at: string | null
  created_at: string
  inscriptions: { id: number; shila_id: string; title: string } | null
  profiles: { handle: string | null; is_anonymous: boolean } | null
}

type AdminUser = {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  provider: string
  handle: string | null
  is_anonymous: boolean
  contribution_count: number
}

type ActiveTab = 'pending' | 'approved' | 'rejected' | 'edits' | 'users'

export default function Admin() {
  const navigate = useNavigate()
  const { c } = useTheme()
  const [user, setUser]         = useState<any>(null)
  const [loading, setLoading]   = useState(true)
  const [inscriptions, setInscriptions] = useState<Inscription[]>([])
  const [editRequests, setEditRequests] = useState<EditRequest[]>([])
  const [activeTab, setActiveTab]       = useState<ActiveTab>('pending')
  const [editStatusFilter, setEditStatusFilter] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [expandedId, setExpandedId]     = useState<string | null>(null)
  const [rejectionReasons, setRejectionReasons]   = useState<Record<string, string>>({})
  const [moreInfoMessages, setMoreInfoMessages]   = useState<Record<string, string>>({})
  const [editRejectNotes, setEditRejectNotes]     = useState<Record<string, string>>({})
  const [actionLoading, setActionLoading]         = useState<string | null>(null)
  const [message, setMessage]   = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // ── Users tab state ───────────────────────────────────────────────────────
  const [users, setUsers]             = useState<AdminUser[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersFetched, setUsersFetched] = useState(false)
  const [userMap, setUserMap]         = useState<Record<string, AdminUser>>({})
  const [userSearch, setUserSearch]   = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session || session.user.email !== ADMIN_EMAIL) navigate('/')
      else { setUser(session.user); fetchAll() }
    })
  }, [navigate])

  const fetchAll = async () => {
    setLoading(true)
    const [{ data: insData }, { data: editsData }, { data: usersData }] = await Promise.all([
      supabase.from('inscriptions').select('*').order('created_at', { ascending: false }),
      supabase.from('edit_requests')
        .select('*, inscriptions(id, shila_id, title), profiles(handle, is_anonymous)')
        .order('created_at', { ascending: false }),
      supabase.rpc('get_admin_users'),
    ])
    if (insData)   setInscriptions(insData)
    if (editsData) setEditRequests(editsData as EditRequest[])
    if (usersData) {
      const admUsers = usersData as AdminUser[]
      setUsers(admUsers)
      setUsersFetched(true)
      // Build UUID → user lookup for admin display (bypasses public anonymity)
      const map: Record<string, AdminUser> = {}
      admUsers.forEach(u => { map[u.id] = u })
      setUserMap(map)
    }
    setLoading(false)
  }

  const fetchUsers = async () => {
    setUsersLoading(true)
    const { data, error } = await supabase.rpc('get_admin_users')
    if (error) {
      setMessage({ type: 'error', text: `Could not load users: ${error.message}` })
    } else {
      setUsers((data as AdminUser[]) || [])
      setUsersFetched(true)
    }
    setUsersLoading(false)
  }

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab)
    setMessage(null)
    if (tab === 'users' && !usersFetched) fetchUsers()
  }

  const sendEmail = async (type: string, to: string, title: string, extra?: string) => {
    try {
      await fetch('/api/send-inscription-email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, to, title, extra }),
      })
    } catch { /* silent */ }
  }

  // ── Status movement ───────────────────────────────────────────────────────

  const moveTo = async (id: string, newStatus: 'pending' | 'approved' | 'rejected') => {
    const ins = inscriptions.find(i => i.id === id)!
    if (newStatus === 'rejected') {
      const reason = rejectionReasons[id]?.trim()
      if (!reason) { setMessage({ type: 'error', text: 'Please enter a rejection reason.' }); return }
    }
    setActionLoading(id); setMessage(null)
    const updates: any = { status: newStatus }
    if (newStatus === 'approved') {
      updates.approved_by = user?.id
      updates.approved_at = new Date().toISOString()
      updates.rejection_reason = null
    } else if (newStatus === 'rejected') {
      updates.rejection_reason = rejectionReasons[id]?.trim()
      updates.approved_by = null
      updates.approved_at = null
    } else {
      updates.approved_by = null
      updates.approved_at = null
      updates.rejection_reason = null
    }
    const { error } = await supabase.from('inscriptions').update(updates).eq('id', id)
    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      if (newStatus === 'approved') await sendEmail('approved', ins.submitted_by, ins.title)
      if (newStatus === 'rejected') await sendEmail('rejected', ins.submitted_by, ins.title, updates.rejection_reason)
      const labels: Record<string, string> = { pending: 'Moved to pending.', approved: 'Approved and live.', rejected: 'Rejected.' }
      setMessage({ type: 'success', text: labels[newStatus] })
      await fetchAll(); setExpandedId(null)
    }
    setActionLoading(null)
  }

  // ── Edit request actions ──────────────────────────────────────────────────

  const approveEdit = async (req: EditRequest) => {
    setActionLoading(`edit-${req.id}`); setMessage(null)

    let insUpdateError: any = null

    if (req.field_name === 'photos') {
      // Photo edit: fetch current photo_urls array, append new URL
      const { data: insData, error: fetchErr } = await supabase
        .from('inscriptions').select('photo_urls').eq('id', req.inscription_id).single()
      if (fetchErr) {
        setMessage({ type: 'error', text: fetchErr.message }); setActionLoading(null); return
      }
      const currentPhotos: string[] = (insData as any)?.photo_urls || []
      const { error } = await supabase
        .from('inscriptions')
        .update({ photo_urls: [...currentPhotos, req.suggested_value] })
        .eq('id', req.inscription_id)
      insUpdateError = error

    } else if (req.field_name === 'general' || !ALLOWED_FIELDS.includes(req.field_name)) {
      // Unknown or general field — cannot auto-apply
      setMessage({
        type: 'error',
        text: `Cannot auto-apply a "${FIELD_LABELS[req.field_name] || req.field_name}" edit. Apply the change manually in Supabase, then reject this request with a note explaining it was applied.`,
      })
      setActionLoading(null); return

    } else {
      // Coerce value type for boolean / numeric fields before saving
      let updateValue: any = req.suggested_value
      if (BOOLEAN_FIELDS.includes(req.field_name)) {
        updateValue = req.suggested_value.toLowerCase() === 'yes' ? true : false
      } else if (NUMERIC_FIELDS.includes(req.field_name)) {
        const parsed = parseFloat(req.suggested_value)
        updateValue = isNaN(parsed) ? null : parsed
      }
      const { error } = await supabase
        .from('inscriptions')
        .update({ [req.field_name]: updateValue })
        .eq('id', req.inscription_id)
      insUpdateError = error
    }

    if (insUpdateError) {
      setMessage({ type: 'error', text: insUpdateError.message }); setActionLoading(null); return
    }

    const { error: reqErr } = await supabase
      .from('edit_requests')
      .update({ status: 'approved', reviewed_at: new Date().toISOString() })
      .eq('id', req.id)

    if (reqErr) {
      setMessage({ type: 'error', text: reqErr.message })
    } else {
      const successMsg = req.field_name === 'photos'
        ? 'Photo approved and added to the inscription gallery.'
        : `"${FIELD_LABELS[req.field_name] || req.field_name}" edit approved — inscription updated.`
      setMessage({ type: 'success', text: successMsg })
      await fetchAll()
    }
    setActionLoading(null)
  }

  const rejectEdit = async (req: EditRequest) => {
    const note = editRejectNotes[req.id]?.trim()
    setActionLoading(`edit-${req.id}`); setMessage(null)
    const { error } = await supabase.from('edit_requests').update({
      status: 'rejected', admin_note: note || null, reviewed_at: new Date().toISOString(),
    }).eq('id', req.id)
    if (error) setMessage({ type: 'error', text: error.message })
    else { setMessage({ type: 'success', text: 'Edit request rejected.' }); await fetchAll() }
    setActionLoading(null)
  }

  const requestMoreInfo = async (id: string) => {
    const ins = inscriptions.find(i => i.id === id)!
    const msg = moreInfoMessages[id]?.trim()
    if (!msg) { setMessage({ type: 'error', text: 'Please type a message before sending.' }); return }
    setActionLoading(`moreinfo-${id}`)
    await sendEmail('more-info', ins.submitted_by, ins.title, msg)
    setMessage({ type: 'success', text: 'Message sent.' })
    setMoreInfoMessages(prev => ({ ...prev, [id]: '' }))
    setActionLoading(null)
  }

  // ── Derived lists ─────────────────────────────────────────────────────────

  const pending      = inscriptions.filter(i => i.status === 'pending')
  const approved     = inscriptions.filter(i => i.status === 'approved')
  const rejected     = inscriptions.filter(i => i.status === 'rejected')
  const pendingEdits = editRequests.filter(r => r.status === 'pending')
  const displayed    = activeTab === 'pending' ? pending
                     : activeTab === 'approved' ? approved
                     : activeTab === 'rejected' ? rejected
                     : []

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.handle || '').toLowerCase().includes(userSearch.toLowerCase())
  )

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  const formatRelative = (iso: string | null) => {
    if (!iso) return 'Never'
    const diff = Date.now() - new Date(iso).getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 30) return `${days}d ago`
    if (days < 365) return `${Math.floor(days / 30)}mo ago`
    return `${Math.floor(days / 365)}y ago`
  }

  const shortId = (uuid: string) => uuid.replace(/-/g, '').slice(0, 8)
  // Admin view: always show real identity (email + handle if set)
  // is_anonymous is a PUBLIC display preference only — admin always sees the truth
  const editContributor = (req: EditRequest): { primary: string; secondary: string | null } => {
    const u = userMap[req.submitted_by]
    if (u) return {
      primary: u.email,
      secondary: u.handle ? `@${u.handle}` : null,
    }
    // Fallback if users haven't loaded yet
    return {
      primary: req.profiles?.handle ? `@${req.profiles.handle}` : shortId(req.submitted_by),
      secondary: null,
    }
  }
  const displayType = (ins: Inscription) => ins.material_type || ins.type

  // ── Styles ────────────────────────────────────────────────────────────────

  const tabStyle = (tab: ActiveTab) => ({
    padding: '8px 18px', border: `0.5px solid ${activeTab === tab ? c.gold : c.border}`,
    borderRadius: '4px', fontSize: '11px', letterSpacing: '.1em',
    color: activeTab === tab ? c.gold : c.textDim,
    background: 'transparent', cursor: 'pointer', fontFamily: 'Arial, sans-serif',
    position: 'relative' as const,
  })

  const inputStyle = {
    width: '100%', background: c.bg, border: `0.5px solid ${c.border}`, borderRadius: '4px',
    padding: '10px 14px', color: c.text, fontSize: '12px', fontFamily: 'Georgia, serif',
    outline: 'none', resize: 'vertical' as const, marginBottom: '10px', boxSizing: 'border-box' as const,
  }

  const ActionBtn = ({ label, onClick, variant = 'ghost', disabled = false }: {
    label: string; onClick: () => void; variant?: 'gold' | 'danger' | 'ghost' | 'neutral'; disabled?: boolean
  }) => {
    const styles: Record<string, any> = {
      gold:    { background: c.gold, border: 'none', color: '#0a0a0a', fontWeight: 600 },
      danger:  { background: 'transparent', border: `0.5px solid ${c.orange}`, color: c.orange },
      ghost:   { background: 'transparent', border: `0.5px solid ${c.border}`, color: c.textDim },
      neutral: { background: 'transparent', border: `0.5px solid ${c.textDim}`, color: c.textDim },
    }
    return (
      <button onClick={onClick} disabled={disabled} style={{ ...styles[variant], padding: '8px 20px', borderRadius: '4px', fontSize: '11px', letterSpacing: '.1em', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1, fontFamily: 'Arial, sans-serif' }}>
        {label}
      </button>
    )
  }

  const moreInfoBlock = (id: string) => (
    <div style={{ background: c.bg, border: `0.5px solid ${c.borderLight}`, borderRadius: '6px', padding: '14px', marginTop: '12px' }}>
      <p style={{ fontSize: '9px', letterSpacing: '.12em', color: c.textDim, marginBottom: '8px', fontFamily: 'Arial, sans-serif' }}>REQUEST MORE INFORMATION</p>
      <textarea placeholder="Type your message to the contributor…" value={moreInfoMessages[id] || ''}
        onChange={e => setMoreInfoMessages(prev => ({ ...prev, [id]: e.target.value }))}
        style={{ ...inputStyle, minHeight: '70px' }} />
      <ActionBtn label={actionLoading === `moreinfo-${id}` ? 'SENDING…' : 'SEND MESSAGE'} onClick={() => requestMoreInfo(id)} disabled={actionLoading === `moreinfo-${id}`} />
    </div>
  )

  if (loading) return (
    <div style={{ minHeight: '100vh', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontSize: '12px', color: c.textDim, letterSpacing: '.1em' }}>LOADING...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: c.bg, color: c.text, fontFamily: 'Georgia, serif' }}>
      <Nav />
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '100px 32px 80px' }}>

        <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '8px', fontFamily: 'Arial, sans-serif' }}>ADMIN</p>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 300, color: c.gold, marginBottom: '4px', letterSpacing: '.05em' }}>Dashboard</h1>
        <p style={{ fontSize: '12px', color: c.textDim, marginBottom: '8px' }}>Signed in as <span style={{ color: c.gold }}>{user?.email}</span></p>
        <div style={{ width: '40px', height: '0.5px', background: c.gold, margin: '20px 0', opacity: .5 }} />

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '32px' }}>
          {[
            { label: 'PENDING',       count: pending.length,                           color: c.orange,   tab: 'pending'  as ActiveTab },
            { label: 'APPROVED',      count: approved.length,                          color: c.gold,     tab: 'approved' as ActiveTab },
            { label: 'REJECTED',      count: rejected.length,                          color: c.textDim,  tab: 'rejected' as ActiveTab },
            { label: 'EDIT REQUESTS', count: pendingEdits.length,                      color: '#7a9e6a',  tab: 'edits'    as ActiveTab },
            { label: 'USERS',         count: usersFetched ? users.length : '—',        color: '#7a8fa6',  tab: 'users'    as ActiveTab },
          ].map((s, i) => (
            <div key={i} onClick={() => handleTabChange(s.tab)}
              style={{ background: c.bgCard, border: `0.5px solid ${activeTab === s.tab ? s.color : c.border}`, borderRadius: '8px', padding: '16px 20px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s' }}>
              <p style={{ fontSize: '26px', fontWeight: 300, color: s.color, marginBottom: '4px' }}>{s.count}</p>
              <p style={{ fontSize: '9px', letterSpacing: '.1em', color: c.textDim, fontFamily: 'Arial, sans-serif' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {message && (
          <div style={{ background: message.type === 'error' ? 'rgba(196,98,45,0.1)' : 'rgba(212,168,67,0.1)', border: `0.5px solid ${message.type === 'error' ? c.orange : c.gold}`, borderRadius: '4px', padding: '10px 16px', marginBottom: '20px' }}>
            <p style={{ fontSize: '12px', color: message.type === 'error' ? c.orange : c.gold }}>{message.text}</p>
          </div>
        )}

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <button style={tabStyle('pending')}  onClick={() => handleTabChange('pending')}>PENDING ({pending.length})</button>
          <button style={tabStyle('approved')} onClick={() => handleTabChange('approved')}>APPROVED ({approved.length})</button>
          <button style={tabStyle('rejected')} onClick={() => handleTabChange('rejected')}>REJECTED ({rejected.length})</button>
          <button style={tabStyle('edits')}    onClick={() => handleTabChange('edits')}>
            EDIT REQUESTS ({pendingEdits.length})
            {pendingEdits.length > 0 && (
              <span style={{ position: 'absolute', top: -6, right: -6, width: 16, height: 16, borderRadius: '50%', background: c.orange, fontSize: 9, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif' }}>
                {pendingEdits.length}
              </span>
            )}
          </button>
          <button style={tabStyle('users')} onClick={() => handleTabChange('users')}>
            USERS {usersFetched ? `(${users.length})` : ''}
          </button>
        </div>

        {/* ══ INSCRIPTION TABS (pending / approved / rejected) ══════════════════ */}
        {(activeTab === 'pending' || activeTab === 'approved' || activeTab === 'rejected') && (
          <>
            {displayed.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <p style={{ fontSize: '12px', color: c.textDim, letterSpacing: '.1em' }}>NO {activeTab.toUpperCase()} INSCRIPTIONS</p>
              </div>
            ) : displayed.map(ins => (
              <div key={ins.id} style={{ background: c.bgCard, border: `0.5px solid ${expandedId === ins.id ? c.gold : c.border}`, borderRadius: '8px', marginBottom: '10px', overflow: 'hidden' }}>

                <div onClick={() => setExpandedId(expandedId === ins.id ? null : ins.id)}
                  style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <p style={{ fontSize: '14px', color: c.text }}>{ins.title}</p>
                      {ins.shila_id && (
                        <span style={{ fontSize: '9px', fontFamily: '"Courier New", monospace', color: c.textFaint, background: c.bg, border: `0.5px solid ${c.borderLight}`, padding: '2px 8px', borderRadius: '3px', letterSpacing: '.05em' }}>{ins.shila_id}</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {displayType(ins) && <span style={{ fontSize: '10px', color: c.orange, fontFamily: 'Arial, sans-serif' }}>{displayType(ins).toUpperCase()}</span>}
                      {ins.country       && <span style={{ fontSize: '10px', color: c.textDim }}>{ins.country}</span>}
                      {ins.state_province && <span style={{ fontSize: '10px', color: c.textDim }}>· {ins.state_province}</span>}
                      {ins.year          && <span style={{ fontSize: '10px', color: c.textDim }}>· {ins.year}</span>}
                    </div>
                    <p style={{ fontSize: '10px', color: c.textFaint, marginTop: '6px', fontFamily: 'Arial, sans-serif' }}>
                      Submitted by <span style={{ color: c.textDim }}>{shortId(ins.submitted_by)}</span> · {formatDate(ins.created_at)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    {ins.status === 'pending'  && <span style={{ fontSize: '9px', padding: '3px 10px', border: `0.5px solid ${c.orange}`, color: c.orange, borderRadius: '99px', letterSpacing: '.05em', fontFamily: 'Arial, sans-serif' }}>PENDING</span>}
                    {ins.status === 'approved' && <span style={{ fontSize: '9px', padding: '3px 10px', border: `0.5px solid ${c.gold}`, color: c.gold, borderRadius: '99px', letterSpacing: '.05em', fontFamily: 'Arial, sans-serif' }}>APPROVED</span>}
                    {ins.status === 'rejected' && <span style={{ fontSize: '9px', padding: '3px 10px', border: `0.5px solid ${c.textDim}`, color: c.textDim, borderRadius: '99px', letterSpacing: '.05em', fontFamily: 'Arial, sans-serif' }}>REJECTED</span>}
                    <span style={{ fontSize: '16px', color: c.textDim }}>{expandedId === ins.id ? '−' : '+'}</span>
                  </div>
                </div>

                {expandedId === ins.id && (
                  <div style={{ borderTop: `0.5px solid ${c.borderLight}`, padding: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
                      {[{ label: 'SCRIPT', value: ins.script }, { label: 'LANGUAGE', value: ins.language }, { label: 'DYNASTY', value: ins.dynasty }]
                        .filter(f => f.value).map((f, i) => (
                        <div key={i} style={{ background: c.bg, border: `0.5px solid ${c.borderLight}`, borderRadius: '6px', padding: '10px 12px' }}>
                          <p style={{ fontSize: '9px', letterSpacing: '.12em', color: c.textDim, marginBottom: '4px', fontFamily: 'Arial, sans-serif' }}>{f.label}</p>
                          <p style={{ fontSize: '12px', color: c.text }}>{f.value}</p>
                        </div>
                      ))}
                    </div>
                    {ins.short_description && (
                      <div style={{ background: c.bg, border: `0.5px solid ${c.borderLight}`, borderRadius: '6px', padding: '14px', marginBottom: '16px' }}>
                        <p style={{ fontSize: '9px', letterSpacing: '.12em', color: c.textDim, marginBottom: '6px', fontFamily: 'Arial, sans-serif' }}>SHORT DESCRIPTION</p>
                        <p style={{ fontSize: '13px', color: c.textMuted, lineHeight: 1.7 }}>{ins.short_description}</p>
                      </div>
                    )}
                    <p onClick={() => navigate(`/inscription/${ins.shila_id || ins.id}`)}
                      style={{ fontSize: '11px', color: c.gold, cursor: 'pointer', letterSpacing: '.05em', marginBottom: '20px', fontFamily: 'Arial, sans-serif' }}>
                      VIEW FULL RECORD →
                    </p>
                    {ins.rejection_reason && (
                      <div style={{ background: 'rgba(196,98,45,0.08)', border: `0.5px solid ${c.orange}`, borderRadius: '6px', padding: '12px 14px', marginBottom: '16px' }}>
                        <p style={{ fontSize: '9px', letterSpacing: '.12em', color: c.orange, marginBottom: '4px', fontFamily: 'Arial, sans-serif' }}>REJECTION REASON</p>
                        <p style={{ fontSize: '12px', color: c.textMuted }}>{ins.rejection_reason}</p>
                      </div>
                    )}

                    {/* Action panel */}
                    <div style={{ borderTop: `0.5px solid ${c.borderLight}`, paddingTop: '16px' }}>
                      <p style={{ fontSize: '9px', letterSpacing: '.12em', color: c.textDim, marginBottom: '10px', fontFamily: 'Arial, sans-serif' }}>MOVE TO</p>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                        {ins.status !== 'approved' && (
                          <ActionBtn label={actionLoading === ins.id ? 'SAVING…' : 'APPROVED'} variant="gold" disabled={actionLoading === ins.id} onClick={() => moveTo(ins.id, 'approved')} />
                        )}
                        {ins.status !== 'pending' && (
                          <ActionBtn label={actionLoading === ins.id ? 'SAVING…' : 'PENDING'} variant="neutral" disabled={actionLoading === ins.id} onClick={() => moveTo(ins.id, 'pending')} />
                        )}
                        {ins.status !== 'rejected' && (
                          <ActionBtn label={actionLoading === ins.id ? 'SAVING…' : 'REJECTED'} variant="danger" disabled={actionLoading === ins.id} onClick={() => moveTo(ins.id, 'rejected')} />
                        )}
                      </div>
                      {ins.status !== 'rejected' && (
                        <textarea placeholder="Rejection reason (required when moving to Rejected)"
                          value={rejectionReasons[ins.id] || ''}
                          onChange={e => setRejectionReasons(prev => ({ ...prev, [ins.id]: e.target.value }))}
                          style={{ ...inputStyle, minHeight: '70px' }} />
                      )}
                      {moreInfoBlock(ins.id)}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {/* ══ EDIT REQUESTS TAB ════════════════════════════════════════════════ */}
        {activeTab === 'edits' && (
          <>
            {/* Sub-status filter pills */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              {(['pending', 'approved', 'rejected'] as const).map(s => {
                const count = editRequests.filter(r => r.status === s).length
                const colors: Record<string, string> = { pending: c.orange, approved: c.gold, rejected: c.textDim }
                const active = editStatusFilter === s
                return (
                  <span key={s} onClick={() => setEditStatusFilter(s)}
                    style={{ fontSize: '10px', color: colors[s], padding: '3px 12px', border: `0.5px solid ${colors[s]}`, borderRadius: '99px', fontFamily: 'Arial, sans-serif', cursor: 'pointer', opacity: active ? 1 : 0.4, background: active ? `${colors[s]}15` : 'transparent', transition: 'opacity 0.15s' }}>
                    {s.toUpperCase()} ({count})
                  </span>
                )
              })}
            </div>

            {editRequests.filter(r => r.status === editStatusFilter).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <p style={{ fontSize: '12px', color: c.textDim, letterSpacing: '.1em' }}>NO {editStatusFilter.toUpperCase()} EDIT REQUESTS</p>
              </div>
            ) : editRequests.filter(r => r.status === editStatusFilter).map(req => (
              <div key={req.id} style={{ background: c.bgCard, border: `0.5px solid ${req.status === 'pending' ? c.border : req.status === 'approved' ? c.gold : c.textDim}`, borderRadius: '8px', marginBottom: '12px', padding: '20px' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <p style={{ fontSize: '13px', color: c.text, marginBottom: '4px' }}>
                      {req.inscriptions?.title || `Inscription #${req.inscription_id}`}
                    </p>
                    <p style={{ fontSize: '10px', color: c.textDim, fontFamily: 'Arial, sans-serif' }}>
                      Field: <span style={{ color: c.orange }}>{FIELD_LABELS[req.field_name] || req.field_name}</span>
                      {' · '}{formatDate(req.created_at)}
                      {' · '}by{' '}
                      {(() => { const who = editContributor(req); return (
                        <span>
                          <span style={{ fontFamily: '"Courier New", monospace', color: c.textDim }}>{who.primary}</span>
                          {who.secondary && <span style={{ fontFamily: '"Courier New", monospace', color: c.gold, marginLeft: '5px' }}>{who.secondary}</span>}
                        </span>
                      )})()}
                    </p>
                  </div>
                  <span style={{
                    fontSize: '9px', padding: '3px 10px', borderRadius: '99px', letterSpacing: '.06em', fontFamily: 'Arial, sans-serif',
                    border: `0.5px solid ${req.status === 'pending' ? c.orange : req.status === 'approved' ? c.gold : c.textDim}`,
                    color: req.status === 'pending' ? c.orange : req.status === 'approved' ? c.gold : c.textDim,
                  }}>{req.status.toUpperCase()}</span>
                </div>

                {/* Photo preview (if photo edit) */}
                {req.field_name === 'photos' && req.suggested_value && (
                  <div style={{ marginBottom: '14px', borderRadius: '6px', overflow: 'hidden', border: `0.5px solid ${c.border}` }}>
                    <img src={req.suggested_value} alt="Suggested photo"
                      style={{ width: '100%', maxHeight: '320px', objectFit: 'cover', display: 'block' }} />
                  </div>
                )}

                {/* Current vs Suggested (for non-photo edits) */}
                {req.field_name !== 'photos' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <div style={{ background: c.bg, border: `0.5px solid ${c.borderLight}`, borderRadius: '6px', padding: '12px 14px' }}>
                      <p style={{ fontSize: '9px', letterSpacing: '.12em', color: c.textDim, marginBottom: '6px', fontFamily: 'Arial, sans-serif' }}>CURRENT VALUE</p>
                      <p style={{ fontSize: '12px', color: c.textMuted, lineHeight: 1.6 }}>{req.current_value || <em style={{ opacity: 0.5 }}>Empty</em>}</p>
                    </div>
                    <div style={{ background: 'rgba(212,168,67,0.06)', border: `0.5px solid ${c.gold}`, borderRadius: '6px', padding: '12px 14px' }}>
                      <p style={{ fontSize: '9px', letterSpacing: '.12em', color: c.gold, marginBottom: '6px', fontFamily: 'Arial, sans-serif' }}>SUGGESTED VALUE</p>
                      <p style={{ fontSize: '12px', color: c.text, lineHeight: 1.6 }}>{req.suggested_value}</p>
                    </div>
                  </div>
                )}

                {/* Justification */}
                <div style={{ background: c.bg, border: `0.5px solid ${c.borderLight}`, borderRadius: '6px', padding: '12px 14px', marginBottom: '14px' }}>
                  <p style={{ fontSize: '9px', letterSpacing: '.12em', color: c.textDim, marginBottom: '6px', fontFamily: 'Arial, sans-serif' }}>JUSTIFICATION</p>
                  <p style={{ fontSize: '12px', color: c.textMuted, lineHeight: 1.6 }}>{req.justification}</p>
                </div>

                {req.admin_note && (
                  <div style={{ background: 'rgba(196,98,45,0.08)', border: `0.5px solid ${c.orange}`, borderRadius: '6px', padding: '12px 14px', marginBottom: '14px' }}>
                    <p style={{ fontSize: '9px', letterSpacing: '.12em', color: c.orange, marginBottom: '4px', fontFamily: 'Arial, sans-serif' }}>ADMIN NOTE</p>
                    <p style={{ fontSize: '12px', color: c.textMuted }}>{req.admin_note}</p>
                  </div>
                )}

                {/* Actions — pending only */}
                {req.status === 'pending' && (
                  <div style={{ borderTop: `0.5px solid ${c.borderLight}`, paddingTop: '14px' }}>
                    <textarea placeholder="Rejection note (optional)"
                      value={editRejectNotes[req.id] || ''}
                      onChange={e => setEditRejectNotes(prev => ({ ...prev, [req.id]: e.target.value }))}
                      style={{ ...inputStyle, minHeight: '60px' }} />
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <ActionBtn
                        label={actionLoading === `edit-${req.id}` ? 'SAVING…' : req.field_name === 'photos' ? 'APPROVE PHOTO' : 'APPROVE EDIT'}
                        variant="gold" disabled={actionLoading === `edit-${req.id}`}
                        onClick={() => approveEdit(req)} />
                      <ActionBtn label={actionLoading === `edit-${req.id}` ? 'SAVING…' : 'REJECT'} variant="danger" disabled={actionLoading === `edit-${req.id}`} onClick={() => rejectEdit(req)} />
                      <ActionBtn label="VIEW INSCRIPTION →" variant="ghost" onClick={() => navigate(`/inscription/${req.inscriptions?.shila_id || req.inscription_id}`)} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {/* ══ USERS TAB ════════════════════════════════════════════════════════ */}
        {activeTab === 'users' && (
          <>
            {usersLoading ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <p style={{ fontSize: '12px', color: c.textDim, letterSpacing: '.1em' }}>LOADING USERS…</p>
              </div>
            ) : (
              <>
                {/* Search + summary bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c.textFaint} strokeWidth="1.5" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                    </svg>
                    <input
                      type="text" placeholder="Search by email or handle…"
                      value={userSearch} onChange={e => setUserSearch(e.target.value)}
                      style={{ ...inputStyle, paddingLeft: '34px', margin: 0, fontSize: '12px', fontFamily: 'Arial, sans-serif' }} />
                  </div>
                  <p style={{ fontSize: '11px', color: c.textDim, fontFamily: 'Arial, sans-serif', flexShrink: 0 }}>
                    {filteredUsers.length} of {users.length} users
                  </p>
                  <button onClick={fetchUsers} style={{ background: 'transparent', border: `0.5px solid ${c.border}`, color: c.textDim, padding: '8px 14px', borderRadius: '4px', fontSize: '10px', letterSpacing: '.1em', cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
                    REFRESH
                  </button>
                </div>

                {/* User quick-stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '24px' }}>
                  {[
                    { label: 'TOTAL REGISTERED',  value: users.length },
                    { label: 'WITH CONTRIBUTIONS', value: users.filter(u => u.contribution_count > 0).length },
                    { label: 'GOOGLE OAUTH',       value: users.filter(u => u.provider === 'google').length },
                  ].map((s, i) => (
                    <div key={i} style={{ background: c.bgCard, border: `0.5px solid ${c.borderLight}`, borderRadius: '8px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ fontSize: '9px', letterSpacing: '.12em', color: c.textDim, fontFamily: 'Arial, sans-serif' }}>{s.label}</p>
                      <p style={{ fontSize: '20px', fontWeight: 300, color: c.gold }}>{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* User list */}
                {filteredUsers.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <p style={{ fontSize: '12px', color: c.textDim, letterSpacing: '.1em' }}>NO USERS FOUND</p>
                  </div>
                ) : filteredUsers.map(u => (
                  <div key={u.id} style={{ background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: '8px', padding: '16px 20px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>

                    {/* Avatar */}
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `${c.gold}18`, border: `0.5px solid ${c.gold}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '15px', color: c.gold, fontFamily: 'Georgia, serif' }}>
                        {u.email.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Identity */}
                    <div style={{ flex: 1, minWidth: '180px' }}>
                      <p style={{ fontSize: '13px', color: c.text, marginBottom: '3px' }}>{u.email}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {u.handle
                          ? <span style={{ fontSize: '10px', color: c.gold, fontFamily: '"Courier New", monospace' }}>@{u.handle}</span>
                          : <span style={{ fontSize: '10px', color: c.textFaint, fontFamily: 'Arial, sans-serif', fontStyle: 'italic' }}>no handle</span>
                        }
                        {u.is_anonymous && (
                          <span style={{ fontSize: '9px', color: c.textFaint, padding: '1px 6px', border: `0.5px solid ${c.borderLight}`, borderRadius: '3px', fontFamily: 'Arial, sans-serif' }}>ANONYMOUS</span>
                        )}
                      </div>
                    </div>

                    {/* Meta */}
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {/* Provider */}
                      <div style={{ textAlign: 'center' }}>
                        <span style={{
                          fontSize: '9px', letterSpacing: '.08em', fontFamily: 'Arial, sans-serif',
                          padding: '3px 10px', borderRadius: '3px',
                          background: u.provider === 'google' ? 'rgba(66,133,244,0.12)' : 'rgba(212,168,67,0.1)',
                          color: u.provider === 'google' ? '#4285f4' : c.gold,
                          border: `0.5px solid ${u.provider === 'google' ? '#4285f480' : `${c.gold}50`}`,
                        }}>
                          {u.provider === 'google' ? 'GOOGLE' : 'EMAIL'}
                        </span>
                      </div>

                      {/* Joined */}
                      <div style={{ textAlign: 'center', minWidth: '70px' }}>
                        <p style={{ fontSize: '9px', letterSpacing: '.1em', color: c.textFaint, marginBottom: '2px', fontFamily: 'Arial, sans-serif' }}>JOINED</p>
                        <p style={{ fontSize: '11px', color: c.textDim }}>{formatDate(u.created_at)}</p>
                      </div>

                      {/* Last seen */}
                      <div style={{ textAlign: 'center', minWidth: '70px' }}>
                        <p style={{ fontSize: '9px', letterSpacing: '.1em', color: c.textFaint, marginBottom: '2px', fontFamily: 'Arial, sans-serif' }}>LAST SEEN</p>
                        <p style={{ fontSize: '11px', color: c.textDim }}>{formatRelative(u.last_sign_in_at)}</p>
                      </div>

                      {/* Contributions */}
                      <div style={{ textAlign: 'center', minWidth: '60px' }}>
                        <p style={{ fontSize: '9px', letterSpacing: '.1em', color: c.textFaint, marginBottom: '2px', fontFamily: 'Arial, sans-serif' }}>ENTRIES</p>
                        <p style={{ fontSize: '18px', fontWeight: 300, color: u.contribution_count > 0 ? c.gold : c.textFaint }}>
                          {u.contribution_count}
                        </p>
                      </div>
                    </div>

                  </div>
                ))}
              </>
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