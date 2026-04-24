import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import Nav from '../components/Nav'
import { useTheme } from '../theme'

const TYPES = ['Rock Edict', 'Temple', 'Cave', 'Copper Plate', 'Bilingual', 'Victory', 'Commemorative', 'Dedicatory', 'Donative', 'Other']
const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor', 'Fragmentary', 'Lost']
const ERAS = ['BCE', 'CE']

export default function Submit() {
  const navigate = useNavigate()
  const { c } = useTheme()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const [form, setForm] = useState({
    title: '',
    type: '',
    short_description: '',
    country: '',
    state_province: '',
    village_town_city: '',
    current_location: '',
    latitude: '',
    longitude: '',
    year: '',
    year_is_approximate: false,
    era: 'CE',
    dynasty: '',
    reign_ruler: '',
    language: '',
    script: '',
    purpose: '',
    condition: '',
    actual_text: '',
    transliteration: '',
    translation_english: '',
    importance: '',
    detailed_information: '',
    first_discovered_by: '',
    reading_done_by: '',
    credits: '',
    accession_number: '',
    height_cm: '',
    width_cm: '',
    depth_cm: '',
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/signin')
      } else {
        setUser(session.user)
        setLoading(false)
      }
    })
  }, [navigate])

  const set = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    const errs: string[] = []
    if (!form.title.trim()) errs.push('Title is required.')
    if (!form.type) errs.push('Type is required.')
    if (!form.country.trim()) errs.push('Country is required.')
    if (errors.length) { setErrors(errs); return }
    setErrors(errs)
    if (errs.length) return

    setSubmitting(true)
    const payload: any = {
      ...form,
      status: 'pending',
      submitted_by: user.email,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
      height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
      width_cm: form.width_cm ? parseFloat(form.width_cm) : null,
      depth_cm: form.depth_cm ? parseFloat(form.depth_cm) : null,
      year: form.year ? `${form.year} ${form.era}` : null,
    }
    delete payload.era

    const { error } = await supabase.from('inscriptions').insert([payload])
    setSubmitting(false)
    if (error) {
      setErrors([`Submission failed: ${error.message}`])
    } else {
      setSubmitted(true)
    }
  }

  const inputStyle = {
    width: '100%',
    background: c.bg,
    border: `0.5px solid ${c.border}`,
    borderRadius: '4px',
    padding: '10px 14px',
    color: c.text,
    fontSize: '13px',
    fontFamily: 'Georgia, serif',
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
  }

  const textareaStyle = {
    ...inputStyle,
    resize: 'vertical' as const,
    minHeight: '90px',
    lineHeight: 1.6,
  }

  const labelStyle = {
    fontSize: '9px',
    letterSpacing: '.15em',
    color: c.textDim,
    marginBottom: '6px',
    display: 'block' as const,
    fontFamily: 'Arial, sans-serif',
  }

  const sectionLabel = (text: string, required = false) => (
    <div style={{ borderBottom: `0.5px solid ${c.borderLight}`, paddingBottom: '10px', marginBottom: '20px', marginTop: '36px' }}>
      <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, fontFamily: 'Arial, sans-serif' }}>
        {text}{required && <span style={{ color: c.orange }}> *</span>}
      </p>
    </div>
  )

  const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontSize: '12px', color: c.textDim, letterSpacing: '.1em' }}>LOADING...</p>
    </div>
  )

  if (submitted) return (
    <div style={{ minHeight: '100vh', background: c.bg, color: c.text, fontFamily: 'Georgia, serif' }}>
      <Nav />
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '160px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '24px', color: c.gold }}>शिलालेख</div>
        <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '16px', fontFamily: 'Arial, sans-serif' }}>SUBMISSION RECEIVED</p>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 300, color: c.gold, marginBottom: '16px' }}>Thank you for contributing</h2>
        <div style={{ width: '40px', height: '0.5px', background: c.gold, margin: '0 auto 24px', opacity: .5 }} />
        <p style={{ fontSize: '13px', color: c.textMuted, lineHeight: 1.8, marginBottom: '32px' }}>
          Your inscription has been submitted for review. Our team will verify the details and may contact you at <strong style={{ color: c.text }}>{user?.email}</strong> if we have any questions. Once approved, it will appear in the public database.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/inscriptions')} style={{ background: c.gold, border: 'none', color: '#0a0a0a', padding: '10px 28px', borderRadius: '4px', fontSize: '11px', letterSpacing: '.1em', cursor: 'pointer', fontWeight: 600 }}>BROWSE INSCRIPTIONS</button>
          <button onClick={() => { setSubmitted(false); setForm({ title: '', type: '', short_description: '', country: '', state_province: '', village_town_city: '', current_location: '', latitude: '', longitude: '', year: '', year_is_approximate: false, era: 'CE', dynasty: '', reign_ruler: '', language: '', script: '', purpose: '', condition: '', actual_text: '', transliteration: '', translation_english: '', importance: '', detailed_information: '', first_discovered_by: '', reading_done_by: '', credits: '', accession_number: '', height_cm: '', width_cm: '', depth_cm: '' }) }} style={{ background: 'transparent', border: `0.5px solid ${c.border}`, color: c.textMuted, padding: '10px 28px', borderRadius: '4px', fontSize: '11px', letterSpacing: '.1em', cursor: 'pointer' }}>SUBMIT ANOTHER</button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: c.bg, color: c.text, fontFamily: 'Georgia, serif' }}>
      <Nav />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '100px 32px 80px' }}>

        <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.textDim, marginBottom: '8px', cursor: 'pointer', fontFamily: 'Arial, sans-serif' }} onClick={() => navigate('/')}>← BACK TO HOME</p>
        <p style={{ fontSize: '11px', letterSpacing: '.3em', color: c.orange, marginBottom: '16px', fontFamily: 'Arial, sans-serif' }}>CONTRIBUTE</p>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 300, color: c.gold, marginBottom: '8px', letterSpacing: '.05em' }}>Submit an Inscription</h1>
        <div style={{ width: '40px', height: '0.5px', background: c.gold, margin: '20px 0', opacity: .5 }} />
        <p style={{ fontSize: '13px', color: c.textMuted, lineHeight: 1.8, marginBottom: '8px' }}>
          Fill in as much detail as you can. Only Title, Type and Country are required — the more you add, the more valuable the record.
        </p>
        <p style={{ fontSize: '12px', color: c.textDim, marginBottom: '8px' }}>
          Submitting as: <span style={{ color: c.gold }}>{user?.email}</span>
        </p>

        {/* Error banner */}
        {errors.length > 0 && (
          <div style={{ background: 'rgba(196,98,45,0.1)', border: `0.5px solid ${c.orange}`, borderRadius: '4px', padding: '12px 16px', marginTop: '16px' }}>
            {errors.map((e, i) => <p key={i} style={{ fontSize: '12px', color: c.orange, marginBottom: i < errors.length - 1 ? '4px' : 0 }}>{e}</p>)}
          </div>
        )}

        {/* ── SECTION 1: BASIC INFORMATION ── */}
        {sectionLabel('BASIC INFORMATION', true)}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>TITLE *</label>
          <input style={inputStyle} placeholder="e.g. Maski Rock Edict of Ashoka" value={form.title} onChange={e => set('title', e.target.value)} />
        </div>
        <div style={{ ...grid2, marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>TYPE *</label>
            <select style={selectStyle} value={form.type} onChange={e => set('type', e.target.value)}>
              <option value="">Select type...</option>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>CONDITION</label>
            <select style={selectStyle} value={form.condition} onChange={e => set('condition', e.target.value)}>
              <option value="">Select condition...</option>
              {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>SHORT DESCRIPTION</label>
          <textarea style={textareaStyle} placeholder="A brief description of the inscription — what it is and why it matters." value={form.short_description} onChange={e => set('short_description', e.target.value)} />
        </div>

        {/* ── SECTION 2: LOCATION ── */}
        {sectionLabel('LOCATION')}
        <div style={{ ...grid2, marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>COUNTRY *</label>
            <input style={inputStyle} placeholder="e.g. India" value={form.country} onChange={e => set('country', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>STATE / PROVINCE</label>
            <input style={inputStyle} placeholder="e.g. Maharashtra" value={form.state_province} onChange={e => set('state_province', e.target.value)} />
          </div>
        </div>
        <div style={{ ...grid2, marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>VILLAGE / TOWN / CITY</label>
            <input style={inputStyle} placeholder="e.g. Raigad" value={form.village_town_city} onChange={e => set('village_town_city', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>CURRENT LOCATION</label>
            <input style={inputStyle} placeholder="e.g. National Museum, New Delhi" value={form.current_location} onChange={e => set('current_location', e.target.value)} />
          </div>
        </div>
        <div style={{ ...grid2, marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>LATITUDE</label>
            <input style={inputStyle} type="number" step="any" placeholder="e.g. 18.2637" value={form.latitude} onChange={e => set('latitude', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>LONGITUDE</label>
            <input style={inputStyle} type="number" step="any" placeholder="e.g. 73.4403" value={form.longitude} onChange={e => set('longitude', e.target.value)} />
          </div>
        </div>

        {/* ── SECTION 3: HISTORICAL CONTEXT ── */}
        {sectionLabel('HISTORICAL CONTEXT')}
        <div style={{ ...grid2, marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>YEAR</label>
            <input style={inputStyle} placeholder="e.g. 250" value={form.year} onChange={e => set('year', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>ERA</label>
            <select style={selectStyle} value={form.era} onChange={e => set('era', e.target.value)}>
              {ERAS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input type="checkbox" id="approx" checked={form.year_is_approximate} onChange={e => set('year_is_approximate', e.target.checked)} style={{ accentColor: c.gold, width: '14px', height: '14px' }} />
          <label htmlFor="approx" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>YEAR IS APPROXIMATE</label>
        </div>
        <div style={{ ...grid2, marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>DYNASTY</label>
            <input style={inputStyle} placeholder="e.g. Maurya" value={form.dynasty} onChange={e => set('dynasty', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>REIGN / RULER</label>
            <input style={inputStyle} placeholder="e.g. Emperor Ashoka" value={form.reign_ruler} onChange={e => set('reign_ruler', e.target.value)} />
          </div>
        </div>
        <div style={{ ...grid2, marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>LANGUAGE</label>
            <input style={inputStyle} placeholder="e.g. Prakrit" value={form.language} onChange={e => set('language', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>SCRIPT</label>
            <input style={inputStyle} placeholder="e.g. Brahmi" value={form.script} onChange={e => set('script', e.target.value)} />
          </div>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>PURPOSE</label>
          <input style={inputStyle} placeholder="e.g. Royal proclamation, Temple dedication, Memorial" value={form.purpose} onChange={e => set('purpose', e.target.value)} />
        </div>

        {/* ── SECTION 4: THE TEXT ── */}
        {sectionLabel('THE INSCRIPTION TEXT')}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>ACTUAL TEXT (original script)</label>
          <textarea style={textareaStyle} placeholder="Paste the original inscription text here if known." value={form.actual_text} onChange={e => set('actual_text', e.target.value)} />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>TRANSLITERATION</label>
          <textarea style={textareaStyle} placeholder="Romanised transliteration of the text." value={form.transliteration} onChange={e => set('transliteration', e.target.value)} />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>ENGLISH TRANSLATION</label>
          <textarea style={textareaStyle} placeholder="English translation of the inscription." value={form.translation_english} onChange={e => set('translation_english', e.target.value)} />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>IMPORTANCE</label>
          <textarea style={textareaStyle} placeholder="Why is this inscription significant? What does it tell us?" value={form.importance} onChange={e => set('importance', e.target.value)} />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>DETAILED INFORMATION</label>
          <textarea style={{ ...textareaStyle, minHeight: '120px' }} placeholder="Any additional historical, archaeological or epigraphic details." value={form.detailed_information} onChange={e => set('detailed_information', e.target.value)} />
        </div>

        {/* ── SECTION 5: PHYSICAL DETAILS ── */}
        {sectionLabel('PHYSICAL DETAILS')}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>HEIGHT (cm)</label>
            <input style={inputStyle} type="number" step="any" placeholder="e.g. 120" value={form.height_cm} onChange={e => set('height_cm', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>WIDTH (cm)</label>
            <input style={inputStyle} type="number" step="any" placeholder="e.g. 80" value={form.width_cm} onChange={e => set('width_cm', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>DEPTH (cm)</label>
            <input style={inputStyle} type="number" step="any" placeholder="e.g. 30" value={form.depth_cm} onChange={e => set('depth_cm', e.target.value)} />
          </div>
        </div>

        {/* ── SECTION 6: CREDITS ── */}
        {sectionLabel('CREDITS & REFERENCES')}
        <div style={{ ...grid2, marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>FIRST DISCOVERED BY</label>
            <input style={inputStyle} placeholder="Name of discoverer or expedition" value={form.first_discovered_by} onChange={e => set('first_discovered_by', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>READING / DECIPHERMENT BY</label>
            <input style={inputStyle} placeholder="Scholar who read or deciphered the text" value={form.reading_done_by} onChange={e => set('reading_done_by', e.target.value)} />
          </div>
        </div>
        <div style={{ ...grid2, marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>CREDITS / SOURCES</label>
            <input style={inputStyle} placeholder="Books, papers, museums, institutions" value={form.credits} onChange={e => set('credits', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>ACCESSION NUMBER</label>
            <input style={inputStyle} placeholder="Museum or ASI accession number if known" value={form.accession_number} onChange={e => set('accession_number', e.target.value)} />
          </div>
        </div>

        {/* Submit */}
        <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: `0.5px solid ${c.borderLight}`, display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{ background: c.gold, border: 'none', color: '#0a0a0a', padding: '12px 36px', borderRadius: '4px', fontSize: '12px', letterSpacing: '.1em', cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: submitting ? 0.7 : 1 }}
          >{submitting ? 'SUBMITTING...' : 'SUBMIT FOR REVIEW'}</button>
          <p style={{ fontSize: '11px', color: c.textFaint, lineHeight: 1.6 }}>Your submission will be reviewed before appearing in the public database.</p>
        </div>

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