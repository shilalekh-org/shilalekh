import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import Nav from '../components/Nav'
import { useTheme } from '../theme'

export default function Inscription() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { c } = useTheme()
  const [inscription, setInscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    supabase
      .from('inscriptions')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (!error && data) setInscription(data)
        setLoading(false)
      })
  }, [id])

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

  return (
    <div style={{ minHeight: '100vh', background: c.bg, color: c.text, fontFamily: 'Georgia, serif' }}>
      <Nav />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '100px 32px 60px' }}>

        <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.textDim, marginBottom: '8px', cursor: 'pointer' }}
          onClick={() => navigate('/inscriptions')}>← BACK TO INSCRIPTIONS</p>

        {/* Tags */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {inscription.type && <span style={{ fontSize: '10px', padding: '3px 10px', border: `0.5px solid ${c.gold}`, color: c.gold, borderRadius: '99px', letterSpacing: '.05em' }}>{inscription.type.toUpperCase()}</span>}
          {inscription.state_proviance && <span style={{ fontSize: '10px', padding: '3px 10px', border: `0.5px solid ${c.border}`, color: c.textDim, borderRadius: '99px', letterSpacing: '.05em' }}>{inscription.state_proviance.toUpperCase()}</span>}
          {inscription.year && <span style={{ fontSize: '10px', padding: '3px 10px', border: `0.5px solid ${c.border}`, color: c.textDim, borderRadius: '99px', letterSpacing: '.05em' }}>{inscription.year}</span>}
          {inscription.script && <span style={{ fontSize: '10px', padding: '3px 10px', border: `0.5px solid ${c.border}`, color: c.textDim, borderRadius: '99px', letterSpacing: '.05em' }}>{inscription.script.toUpperCase()}</span>}
        </div>

        {/* Title */}
        <h1 style={{ fontSize: '2.5rem', fontWeight: 300, color: c.gold, marginBottom: '8px', letterSpacing: '.05em' }}>{inscription.title}</h1>
        <p style={{ fontSize: '13px', color: c.textDim, marginBottom: '32px', letterSpacing: '.05em' }}>
          {inscription.current_location}
          {inscription.latitude && inscription.longitude && ` · ${inscription.latitude}° N, ${inscription.longitude}° E`}
        </p>

        <div style={{ width: '40px', height: '0.5px', background: c.gold, marginBottom: '32px', opacity: .5 }} />

        {/* Short description */}
        {inscription.short_description && (
          <div style={{ background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: '8px', padding: '24px', marginBottom: '32px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '12px' }}>SHORT DESCRIPTION</p>
            <p style={{ fontSize: '15px', color: c.text, lineHeight: 1.8 }}>{inscription.short_description}</p>
          </div>
        )}

        {/* Key fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Type', value: inscription.type },
            { label: 'Script', value: inscription.script },
            { label: 'Language', value: inscription.language },
            { label: 'Year', value: inscription.year },
            { label: 'Era', value: inscription.era },
            { label: 'Dynasty', value: inscription.dynasty },
            { label: 'Ruler', value: inscription.reign_ruler },
            { label: 'Purpose', value: inscription.purpose },
            { label: 'Condition', value: inscription.condition },
            { label: 'Country', value: inscription.current_country },
          ].filter(f => f.value).map((f, i) => (
            <div key={i} style={{ background: c.bgCard, border: `0.5px solid ${c.borderLight}`, borderRadius: '6px', padding: '12px 14px' }}>
              <p style={{ fontSize: '9px', letterSpacing: '.15em', color: c.textDim, marginBottom: '4px' }}>{f.label.toUpperCase()}</p>
              <p style={{ fontSize: '13px', color: c.text, fontWeight: 300 }}>{f.value}</p>
            </div>
          ))}
        </div>

        {/* Actual text */}
        {inscription.actual_text && (
          <div style={{ background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '12px' }}>ACTUAL TEXT</p>
            <p style={{ fontSize: '16px', color: c.text, lineHeight: 2, fontFamily: 'Georgia, serif' }}>{inscription.actual_text}</p>
          </div>
        )}

        {/* Transliteration */}
        {inscription.transliteration && (
          <div style={{ background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '12px' }}>TRANSLITERATION</p>
            <p style={{ fontSize: '14px', color: c.text, lineHeight: 1.8, fontStyle: 'italic' }}>{inscription.transliteration}</p>
          </div>
        )}

        {/* Translation */}
        {inscription.translation_english && (
          <div style={{ background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '12px' }}>TRANSLATION</p>
            <p style={{ fontSize: '14px', color: c.text, lineHeight: 1.8 }}>{inscription.translation_english}</p>
          </div>
        )}

        {/* Importance */}
        {inscription.importance && (
          <div style={{ background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '12px' }}>IMPORTANCE</p>
            <p style={{ fontSize: '13px', color: c.textMuted, lineHeight: 1.8 }}>{inscription.importance}</p>
          </div>
        )}

        {/* Detailed information */}
        {inscription.detailed_information && (
          <div style={{ background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: '8px', padding: '24px', marginBottom: '32px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '12px' }}>DETAILED INFORMATION</p>
            <p style={{ fontSize: '13px', color: c.textMuted, lineHeight: 1.8 }}>{inscription.detailed_information}</p>
          </div>
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