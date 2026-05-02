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
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ width: '100%', maxWidth: 360, margin: '1rem' }}>
        <h1 className="text-primary" style={{ margin: 0, fontSize: '2rem', textAlign: 'center', letterSpacing: 2 }}>Seymour-OS</h1>
        <p style={{ color: 'var(--theme-secondary)', textAlign: 'center', marginTop: 4, marginBottom: '2rem', fontSize: '0.85rem' }}>Kronos Biolabs SAS</p>
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
        </form>
      </div>
    </div>
  )
}

