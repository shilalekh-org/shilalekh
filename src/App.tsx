function App() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#ffffff',
      fontFamily: 'Georgia, serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '24px'
    }}>
      <h1 style={{
        fontSize: '4rem',
        fontWeight: 300,
        letterSpacing: '0.1em',
        marginBottom: '8px',
        color: '#d4a843'
      }}>
        शिलालेख
      </h1>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: 300,
        letterSpacing: '0.3em',
        marginBottom: '24px'
      }}>
        SHILALEKH
      </h2>
      <p style={{
        fontSize: '1rem',
        color: '#888',
        letterSpacing: '0.15em',
        marginBottom: '8px'
      }}>
        GLOBAL DATABASE OF STONE INSCRIPTIONS
      </p>
      <p style={{
        fontSize: '0.85rem',
        color: '#555',
        letterSpacing: '0.1em',
        marginBottom: '48px'
      }}>
        शिला · STONE &nbsp;|&nbsp; लेख · INSCRIPTION
      </p>
      <div style={{
        width: '60px',
        height: '1px',
        background: '#d4a843',
        marginBottom: '48px'
      }}/>
      <p style={{
        fontSize: '0.8rem',
        color: '#444',
        letterSpacing: '0.2em'
      }}>
        COMING SOON
      </p>
    </div>
  )
}

export default App