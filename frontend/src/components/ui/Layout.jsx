import { useNavigate, useLocation } from 'react-router-dom'

export default function Layout({ children, title, showBack = false }) {
  const navigate = useNavigate()

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        padding: '1rem',
        background: 'var(--theme-surface)',
        borderBottom: '1px solid var(--theme-border)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        {showBack && (
          <button className="btn btn--ghost" onClick={() => navigate(-1)} style={{ padding: '0.4rem' }}>
            ←
          </button>
        )}
        <h1 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--theme-primary)', fontWeight: 800 }}>
          {title || 'Seymour OS'}
        </h1>
      </header>

      <main style={{ flex: 1, padding: '1rem' }}>
        {children}
      </main>

      <nav style={{
        display: 'flex',
        justifyContent: 'space-around',
        padding: '0.8rem',
        background: 'var(--theme-surface)',
        borderTop: '1px solid var(--theme-border)',
        position: 'sticky',
        bottom: 0
      }}>
        <NavIcon icon="🔍" label="Scan" onClick={() => navigate('/scan')} />
        <NavIcon icon="🏠" label="Inicio" onClick={() => navigate('/')} />
        <NavIcon icon="🧪" label="Lab" onClick={() => navigate('/lab')} />
        <NavIcon icon="📑" label="Logs" onClick={() => navigate('/logs')} />
      </nav>
    </div>
  )
}

function NavIcon({ icon, label, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: 'none', border: 'none', display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: '4px', cursor: 'pointer', color: 'var(--theme-text-muted)'
    }}>
      <span style={{ fontSize: '1.2rem' }}>{icon}</span>
      <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>{label}</span>
    </button>
  )
}
