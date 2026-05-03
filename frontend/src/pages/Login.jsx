import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getBaseUrl } from '../api/client'

const PRECONFIGURED_SERVERS = [
  { label: 'Producción (Nube)', url: 'https://lbms.kronosb.com/api' },
  { label: 'Desarrollo (Red Local)', url: 'http://192.168.80.185:8001' }
];

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Server Selection State
  const [showServerConfig, setShowServerConfig] = useState(false)
  const [serverUrl, setServerUrl] = useState('')

  useEffect(() => {
    setServerUrl(getBaseUrl())
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, pass)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleSaveServer() {
    if (!serverUrl) {
      localStorage.removeItem('server_url')
    } else {
      // Ensure it doesn't end with a slash to avoid double slashes in paths
      const formatted = serverUrl.endsWith('/') ? serverUrl.slice(0, -1) : serverUrl
      localStorage.setItem('server_url', formatted)
    }
    setShowServerConfig(false)
    window.location.reload() // Reload to ensure client.js picks up the new BASE
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <div className="card" style={{ width: '100%', maxWidth: 360, margin: '1rem' }}>
        <h1 className="text-primary" style={{ margin: 0, fontSize: '2rem', textAlign: 'center', letterSpacing: 2 }}>Seymour-OS</h1>
        <p style={{ color: 'var(--theme-secondary)', textAlign: 'center', marginTop: 4, marginBottom: '2rem', fontSize: '0.85rem' }}>Kronos Biolabs SAS</p>

        {!showServerConfig ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="email"
              placeholder="Correo"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={pass}
              onChange={e => setPass(e.target.value)}
              required
              autoComplete="current-password"
            />
            {error && <p style={{ color: 'var(--error)', fontSize: '0.85rem', margin: 0 }}>{error}</p>}
            <button className="btn btn--primary btn--block" type="submit" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? 'Entrando…' : 'Ingresar'}
            </button>

            <button
              type="button"
              className="btn"
              style={{ background: 'transparent', color: 'var(--theme-text-muted)', fontSize: '0.75rem', marginTop: '1rem' }}
              onClick={() => setShowServerConfig(true)}
            >
              ⚙️ Configurar Servidor
            </button>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h3 style={{ fontSize: '1rem', margin: '0 0 0.5rem', color: 'var(--theme-text)' }}>URL del Servidor</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
              {PRECONFIGURED_SERVERS.map((server) => (
                <button
                  key={server.url}
                  type="button"
                  className="btn"
                  style={{
                    fontSize: '0.85rem',
                    textAlign: 'left',
                    background: serverUrl === server.url ? 'var(--theme-primary)' : 'var(--theme-background)',
                    color: serverUrl === server.url ? '#000' : 'var(--theme-text)'
                  }}
                  onClick={() => setServerUrl(server.url)}
                >
                  <strong>{server.label}</strong><br/>
                  <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>{server.url}</span>
                </button>
              ))}
            </div>

            <input
              type="url"
              placeholder="URL Personalizada (ej. https://api.ejemplo.com)"
              value={serverUrl}
              onChange={e => setServerUrl(e.target.value)}
            />

            <p style={{ fontSize: '0.7rem', color: 'var(--theme-text-muted)', margin: 0 }}>
              Actual: <code style={{ color: 'var(--theme-primary)' }}>{getBaseUrl()}</code>
            </p>

            <div style={{ display: 'flex', gap: 8, marginTop: '1rem' }}>
              <button className="btn btn--primary" style={{ flex: 1 }} onClick={handleSaveServer}>Guardar</button>
              <button className="btn" style={{ flex: 1 }} onClick={() => setShowServerConfig(false)}>Cancelar</button>
            </div>
          </div>
        )}
      </div>

      <div style={{ position: 'absolute', bottom: '1rem', color: 'var(--theme-text-muted)', fontSize: '0.7rem' }}>
        Server: {getBaseUrl()}
      </div>
    </div>
  )
}
