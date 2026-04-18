import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function SignIn() {
  const navigate = useNavigate()

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://shilalekh.org'
      }
    })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#e8e4d9', fontFamily: 'Georgia, serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

      <div style={{ cursor: 'pointer', textAlign: 'center', marginBottom: '48px' }} onClick={() => navigate('/')}>
        <p style={{ fontSize: '32px', color: '#d4a843', letterSpacing: '.05em', marginBottom: '4px' }}>शिलालेख</p>
        <p style={{ fontSize: '11px', color: '#555250', letterSpacing: '.3em' }}>SHILALEKH</p>
      </div>

      <div style={{ background: '#111', border: '0.5px solid #2a2a2a', borderRadius: '8px', padding: '40px', width: '100%', maxWidth: '380px', textAlign: 'center' }}>
        <p style={{ fontSize: '10px', letterSpacing: '.2em', color: '#c4622d', marginBottom: '12px' }}>WELCOME</p>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 300, color: '#e8e4d9', marginBottom: '8px' }}>Sign in to Shilalekh</h2>
        <div style={{ width: '30px', height: '0.5px', background: '#d4a843', margin: '16px auto', opacity: .5 }} />
        <p style={{ fontSize: '12px', color: '#555250', marginBottom: '32px', lineHeight: 1.6 }}>Access the full database of inscriptions, contribute records, and join the community of epigraphic researchers.</p>

        <button
          onClick={signInWithGoogle}
          style={{ width: '100%', background: '#fff', border: 'none', color: '#1a1a1a', padding: '12px 24px', borderRadius: '4px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: 500, marginBottom: '16px' }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
            <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
            <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
          </svg>
          Continue with Google
        </button>

        <p style={{ fontSize: '11px', color: '#333', lineHeight: 1.6 }}>
          By signing in you agree to our terms of service and privacy policy.
        </p>
      </div>

      <p style={{ fontSize: '11px', color: '#333', marginTop: '24px', cursor: 'pointer' }} onClick={() => navigate('/')}>← Back to Shilalekh</p>

    </div>
  )
}