import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import Nav from '../components/Nav'
import { useTheme } from '../theme'

const ADMIN_EMAIL = 'aditya.gokhale07@gmail.com'

type Inscription = {
  id: string
  title: string
  type: string
  status: string
  submitted_by: string
  created_at: string
  country: string
  state_province: string
  year: string
  script: string
  language: string
  dynasty: string
  short_description: string
  rejection_reason: string
}

export default function Admin() {
  const navigate = useNavigate()
  const { c } = useTheme()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [inscriptions, setInscriptions] = useState<Inscription[]>([])
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({})
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session || session.user.email !== ADMIN_EMAIL) {
        navigate('/')
      } else {
        setUser(session.user)
        fetchAll()
      }
    })
  }, [navigate])

  const fetchAll = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('inscriptions')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) setInscriptions(data)
    setLoading(false)
  }

  const approve = async (id: string) => {
    setActionLoading(id)
    setMessage(null)
    const { error } = await supabase
      .from('inscriptions')
      .update({ status: 'approved', approved_by: ADMIN_EMAIL, approved_at: new Date().toISOString(), rejection_reason: null })
      .eq('id', id)
    if (error) {
      setMessage({ type: 'error', text: `Failed to approve: ${error.message}` })
    } else {
      setMessage({ type: 'success', text: 'Inscription approved and now live.' })
      await fetchAll()
      setExpandedId(null)
    }
    setActionLoading(null)
  }

  const reject = async (id: string) => {
    const reason = rejectionReasons[id]?.trim()
    if (!reason) {
      setMessage({ type: 'error', text: 'Please enter a rejection reason before rejecting.' })
      return
    }
    setActionLoading(id)
    setMessage(null)
    const { error } = await supabase
      .from('inscriptions')
      .update({ status: 'rejected', rejection_reason: reason, approved_by: null, approved_at: null })
      .eq('id', id)
    if (error) {
      setMessage({ type: 'error', text: `Failed to reject: ${error.message}` })
    } else {
      setMessage({ type: 'success', text: 'Inscription rejected.' })
      await fetchAll()
      setExpandedId(null)
    }
    setActionLoading(null)
  }

  const pending = inscriptions.filter(i => i.status === 'pending')
  const approved = inscriptions.filter(i => i.status === 'approved')
  const rejected = inscriptions.filter(i => i.status === 'rejected')
  const displayed = activeTab === 'pending' ? pending : activeTab === 'approved' ? approved : rejected

  const tabStyle = (tab: string) => ({
    padding: '8px 24px',
    border: `0.5px solid ${activeTab === tab ? c.gold : c.border}`,
    borderRadius: '4px',
    fontSize: '11px',
    letterSpacing: '.1em',
    color: activeTab === tab ? c.gold : c.textDim,
    background: 'transparent',
    cursor: 'pointer',
    fontFamily: 'Arial, sans-serif',
  })

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  if (loading) return (
    <div style={{ minHeight: '100vh', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontSize: '12px', color: c.textDim, letterSpacing: '.1em' }}>LOADING...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: c.bg, color: c.text, fontFamily: 'Georgia, serif' }}>
      <Nav />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '100px 32px 80px' }}>

        {/* Header */}
        <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '8px', fontFamily: 'Arial, sans-serif' }}>ADMIN</p>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 300, color: c.gold, marginBottom: '4px', letterSpacing: '.05em' }}>Approval Dashboard</h1>
        <p style={{ fontSize: '12px', color: c.textDim, marginBottom: '8px' }}>Signed in as <span style={{ color: c.gold }}>{user?.email}</span></p>
        <div style={{ width: '40px', height: '0.5px', background: c.gold, margin: '20px 0', opacity: .5 }} />

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '32px' }}>
          {[
            { label: 'PENDING REVIEW', count: pending.length, color: c.orange },
            { label: 'APPROVED', count: approved.length, color: c.gold },
            { label: 'REJECTED', count: rejected.length, color: c.textDim },
          ].map((s, i) => (
            <div key={i} style={{ background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: '8px', padding: '16px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: '28px', fontWeight: 300, color: s.color, marginBottom: '4px' }}>{s.count}</p>
              <p style={{ fontSize: '9px', letterSpacing: '.12em', color: c.textDim, fontFamily: 'Arial, sans-serif' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Message banner */}
        {message && (
          <div style={{ background: message.type === 'error' ? 'rgba(196,98,45,0.1)' : 'rgba(212,168,67,0.1)', border: `0.5px solid ${message.type === 'error' ? c.orange : c.gold}`, borderRadius: '4px', padding: '10px 16px', marginBottom: '20px' }}>
            <p style={{ fontSize: '12px', color: message.type === 'error' ? c.orange : c.gold }}>{message.text}</p>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <button style={tabStyle('pending')} onClick={() => setActiveTab('pending')}>
            PENDING ({pending.length})
          </button>
          <button style={tabStyle('approved')} onClick={() => setActiveTab('approved')}>
            APPROVED ({approved.length})
          </button>
          <button style={tabStyle('rejected')} onClick={() => setActiveTab('rejected')}>
            REJECTED ({rejected.length})
          </button>
        </div>

        {/* List */}
        {displayed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontSize: '12px', color: c.textDim, letterSpacing: '.1em' }}>NO {activeTab.toUpperCase()} INSCRIPTIONS</p>
          </div>
        ) : (
          displayed.map(ins => (
            <div key={ins.id} style={{ background: c.bgCard, border: `0.5px solid ${expandedId === ins.id ? c.gold : c.border}`, borderRadius: '8px', marginBottom: '10px', overflow: 'hidden' }}>

              {/* Row */}
              <div
                onClick={() => setExpandedId(expandedId === ins.id ? null : ins.id)}
                style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', color: c.text, marginBottom: '6px' }}>{ins.title}</p>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {ins.type && <span style={{ fontSize: '10px', color: c.orange, fontFamily: 'Arial, sans-serif', letterSpacing: '.05em' }}>{ins.type.toUpperCase()}</span>}
                    {ins.country && <span style={{ fontSize: '10px', color: c.textDim, fontFamily: 'Arial, sans-serif' }}>{ins.country}</span>}
                    {ins.state_province && <span style={{ fontSize: '10px', color: c.textDim, fontFamily: 'Arial, sans-serif' }}>· {ins.state_province}</span>}
                    {ins.year && <span style={{ fontSize: '10px', color: c.textDim, fontFamily: 'Arial, sans-serif' }}>· {ins.year}</span>}
                  </div>
                  <p style={{ fontSize: '10px', color: c.textFaint, marginTop: '6px', fontFamily: 'Arial, sans-serif' }}>
                    Submitted by <span style={{ color: c.textDim }}>{ins.submitted_by}</span> · {formatDate(ins.created_at)}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  {ins.status === 'pending' && (
                    <span style={{ fontSize: '9px', padding: '3px 10px', border: `0.5px solid ${c.orange}`, color: c.orange, borderRadius: '99px', letterSpacing: '.05em', fontFamily: 'Arial, sans-serif' }}>PENDING</span>
                  )}
                  {ins.status === 'approved' && (
                    <span style={{ fontSize: '9px', padding: '3px 10px', border: `0.5px solid ${c.gold}`, color: c.gold, borderRadius: '99px', letterSpacing: '.05em', fontFamily: 'Arial, sans-serif' }}>APPROVED</span>
                  )}
                  {ins.status === 'rejected' && (
                    <span style={{ fontSize: '9px', padding: '3px 10px', border: `0.5px solid ${c.textDim}`, color: c.textDim, borderRadius: '99px', letterSpacing: '.05em', fontFamily: 'Arial, sans-serif' }}>REJECTED</span>
                  )}
                  <span style={{ fontSize: '16px', color: c.textDim }}>{expandedId === ins.id ? '−' : '+'}</span>
                </div>
              </div>

              {/* Expanded detail */}
              {expandedId === ins.id && (
                <div style={{ borderTop: `0.5px solid ${c.borderLight}`, padding: '20px' }}>

                  {/* Key fields */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
                    {[
                      { label: 'SCRIPT', value: ins.script },
                      { label: 'LANGUAGE', value: ins.language },
                      { label: 'DYNASTY', value: ins.dynasty },
                    ].filter(f => f.value).map((f, i) => (
                      <div key={i} style={{ background: c.bg, border: `0.5px solid ${c.borderLight}`, borderRadius: '6px', padding: '10px 12px' }}>
                        <p style={{ fontSize: '9px', letterSpacing: '.12em', color: c.textDim, marginBottom: '4px', fontFamily: 'Arial, sans-serif' }}>{f.label}</p>
                        <p style={{ fontSize: '12px', color: c.text }}>{f.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Short description */}
                  {ins.short_description && (
                    <div style={{ background: c.bg, border: `0.5px solid ${c.borderLight}`, borderRadius: '6px', padding: '14px', marginBottom: '16px' }}>
                      <p style={{ fontSize: '9px', letterSpacing: '.12em', color: c.textDim, marginBottom: '6px', fontFamily: 'Arial, sans-serif' }}>SHORT DESCRIPTION</p>
                      <p style={{ fontSize: '13px', color: c.textMuted, lineHeight: 1.7 }}>{ins.short_description}</p>
                    </div>
                  )}

                  {/* View full record link */}
                  <p
                    onClick={() => navigate(`/inscription/${ins.id}`)}
                    style={{ fontSize: '11px', color: c.gold, cursor: 'pointer', letterSpacing: '.05em', marginBottom: '20px', fontFamily: 'Arial, sans-serif' }}
                  >VIEW FULL RECORD →</p>

                  {/* Rejection reason if already rejected */}
                  {ins.status === 'rejected' && ins.rejection_reason && (
                    <div style={{ background: 'rgba(196,98,45,0.08)', border: `0.5px solid ${c.orange}`, borderRadius: '6px', padding: '12px 14px', marginBottom: '16px' }}>
                      <p style={{ fontSize: '9px', letterSpacing: '.12em', color: c.orange, marginBottom: '4px', fontFamily: 'Arial, sans-serif' }}>REJECTION REASON</p>
                      <p style={{ fontSize: '12px', color: c.textMuted }}>{ins.rejection_reason}</p>
                    </div>
                  )}

                  {/* Action buttons — only for pending */}
                  {ins.status === 'pending' && (
                    <div style={{ borderTop: `0.5px solid ${c.borderLight}`, paddingTop: '16px' }}>
                      <textarea
                        placeholder="Rejection reason (required if rejecting) — this will be recorded for your reference when emailing the submitter."
                        value={rejectionReasons[ins.id] || ''}
                        onChange={e => setRejectionReasons(prev => ({ ...prev, [ins.id]: e.target.value }))}
                        style={{ width: '100%', background: c.bg, border: `0.5px solid ${c.border}`, borderRadius: '4px', padding: '10px 14px', color: c.text, fontSize: '12px', fontFamily: 'Georgia, serif', outline: 'none', resize: 'vertical', minHeight: '70px', marginBottom: '12px', boxSizing: 'border-box' }}
                      />
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => approve(ins.id)}
                          disabled={actionLoading === ins.id}
                          style={{ background: c.gold, border: 'none', color: '#0a0a0a', padding: '10px 28px', borderRadius: '4px', fontSize: '11px', letterSpacing: '.1em', cursor: actionLoading === ins.id ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: actionLoading === ins.id ? 0.7 : 1, fontFamily: 'Arial, sans-serif' }}
                        >{actionLoading === ins.id ? 'SAVING...' : 'APPROVE'}</button>
                        <button
                          onClick={() => reject(ins.id)}
                          disabled={actionLoading === ins.id}
                          style={{ background: 'transparent', border: `0.5px solid ${c.orange}`, color: c.orange, padding: '10px 28px', borderRadius: '4px', fontSize: '11px', letterSpacing: '.1em', cursor: actionLoading === ins.id ? 'not-allowed' : 'pointer', opacity: actionLoading === ins.id ? 0.7 : 1, fontFamily: 'Arial, sans-serif' }}
                        >{actionLoading === ins.id ? 'SAVING...' : 'REJECT'}</button>
                      </div>
                    </div>
                  )}

                  {/* Re-review approved ones */}
                  {ins.status === 'approved' && (
                    <div style={{ borderTop: `0.5px solid ${c.borderLight}`, paddingTop: '16px' }}>
                      <textarea
                        placeholder="Rejection reason (required to move back to rejected)"
                        value={rejectionReasons[ins.id] || ''}
                        onChange={e => setRejectionReasons(prev => ({ ...prev, [ins.id]: e.target.value }))}
                        style={{ width: '100%', background: c.bg, border: `0.5px solid ${c.border}`, borderRadius: '4px', padding: '10px 14px', color: c.text, fontSize: '12px', fontFamily: 'Georgia, serif', outline: 'none', resize: 'vertical', minHeight: '70px', marginBottom: '12px', boxSizing: 'border-box' }}
                      />
                      <button
                        onClick={() => reject(ins.id)}
                        disabled={actionLoading === ins.id}
                        style={{ background: 'transparent', border: `0.5px solid ${c.orange}`, color: c.orange, padding: '10px 28px', borderRadius: '4px', fontSize: '11px', letterSpacing: '.1em', cursor: actionLoading === ins.id ? 'not-allowed' : 'pointer', fontFamily: 'Arial, sans-serif' }}
                      >MOVE TO REJECTED</button>
                    </div>
                  )}

                  {/* Re-approve rejected ones */}
                  {ins.status === 'rejected' && (
                    <div style={{ borderTop: `0.5px solid ${c.borderLight}`, paddingTop: '16px' }}>
                      <button
                        onClick={() => approve(ins.id)}
                        disabled={actionLoading === ins.id}
                        style={{ background: c.gold, border: 'none', color: '#0a0a0a', padding: '10px 28px', borderRadius: '4px', fontSize: '11px', letterSpacing: '.1em', cursor: actionLoading === ins.id ? 'not-allowed' : 'pointer', fontWeight: 600, fontFamily: 'Arial, sans-serif' }}
                      >APPROVE ANYWAY</button>
                    </div>
                  )}

                </div>
              )}
            </div>
          ))
        )}

      </div>

      {/* Footer */}
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