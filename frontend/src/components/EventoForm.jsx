import { useState } from 'react'
import { api } from '../api/client'

const TIPOS = ['siembra', 'transferencia', 'contaminacion', 'observacion', 'cosecha', 'entrada', 'salida', 'otro']

export default function EventoForm({ especimenId, elementoId, onSaved, onCancel }) {
  const [tipo, setTipo] = useState('observacion')
  const [descripcion, setDescripcion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/eventos', {
        tipo,
        descripcion,
        especimen_id: especimenId || undefined,
        elemento_id: elementoId || undefined,
      })
      onSaved?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.overlay}>
      <div style={s.sheet}>
        <h3 style={s.title}>Registrar evento</h3>
        <form onSubmit={handleSubmit} style={s.form}>
          <label style={s.label}>Tipo</label>
          <select style={s.input} value={tipo} onChange={e => setTipo(e.target.value)}>
            {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <label style={s.label}>Descripción</label>
          <textarea
            style={{ ...s.input, minHeight: 80, resize: 'vertical' }}
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            placeholder="Observaciones, condiciones, notas…"
            required
          />

          {error && <p style={s.error}>{error}</p>}

          <div style={s.actions}>
            <button type="button" style={s.btnCancel} onClick={onCancel}>Cancelar</button>
            <button type="submit" style={s.btnSave} disabled={loading}>
              {loading ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const s = {
  overlay: { position: 'fixed', inset: 0, background: '#0009', display: 'flex', alignItems: 'flex-end', zIndex: 100 },
  sheet: { background: '#1a2e1e', borderRadius: '16px 16px 0 0', padding: '1.5rem', width: '100%', maxHeight: '80dvh', overflowY: 'auto' },
  title: { color: '#7dca8f', margin: '0 0 1rem' },
  form: { display: 'flex', flexDirection: 'column', gap: 10 },
  label: { color: '#4a8c5c', fontSize: '0.8rem', fontWeight: 600 },
  input: { background: '#0f1f13', border: '1px solid #2d5c3a', borderRadius: 8, padding: '0.65rem 0.9rem', color: '#e0f0e5', fontSize: '1rem' },
  error: { color: '#f28b82', fontSize: '0.85rem', margin: 0 },
  actions: { display: 'flex', gap: 8, marginTop: 8 },
  btnCancel: { flex: 1, background: '#1a2e1e', border: '1px solid #2d5c3a', borderRadius: 8, color: '#7dca8f', padding: '0.75rem', fontSize: '0.95rem', cursor: 'pointer' },
  btnSave: { flex: 2, background: '#2d7a47', border: 'none', borderRadius: 8, color: '#fff', padding: '0.75rem', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' },
}
