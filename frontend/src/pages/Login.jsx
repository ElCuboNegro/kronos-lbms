import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h1 style={s.title}>LBMS</h1>
        <p style={s.sub}>Kronos Tech Labs</p>
        <form onSubmit={handleSubmit} style={s.form}>
          <input
            style={s.input}
            type="email"
            placeholder="Correo"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <input
            style={s.input}
            type="password"
            placeholder="Contraseña"
            value={pass}
            onChange={e => setPass(e.target.value)}
            required
            autoComplete="current-password"
          />
          {error && <p style={s.error}>{error}</p>}
          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? 'Entrando…' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f1f13' },
  card: { background: '#1a2e1e', borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 360, boxShadow: '0 8px 32px #0006' },
  title: { color: '#7dca8f', margin: 0, fontSize: '2rem', textAlign: 'center', letterSpacing: 2 },
  sub: { color: '#4a8c5c', textAlign: 'center', marginTop: 4, marginBottom: '2rem', fontSize: '0.85rem' },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  input: { background: '#0f1f13', border: '1px solid #2d5c3a', borderRadius: 8, padding: '0.75rem 1rem', color: '#e0f0e5', fontSize: '1rem', outline: 'none' },
  error: { color: '#f28b82', fontSize: '0.85rem', margin: 0 },
  btn: { background: '#2d7a47', color: '#fff', border: 'none', borderRadius: 8, padding: '0.85rem', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', marginTop: 4 },
}
