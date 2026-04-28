import { useState } from 'react'
import { api } from '../api/client'

export default function LotePreparacionForm({ formulacion, onSaved, onCancel }) {
  const [volumen, setVolumen] = useState(1.0)
  const [concentracion, setConcentracion] = useState(1.0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const ratio = (volumen / formulacion.volumen_base_l) * concentracion

  async function preparar(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const lote = await api.post('/reactivos/lotes', {
        formulacion_id: formulacion.id,
        volumen_l: parseFloat(volumen),
        concentracion_x: parseFloat(concentracion),
        ph_final: undefined,
        notas: `Preparación de ${volumen}L de ${formulacion.nombre}`
      })

      // Mandar a imprimir etiqueta de reactivo
      try {
        await api.post(`/printer/imprimir-lote/${lote.id}`)
      } catch (err) {
        console.error("Error al imprimir etiqueta de lote:", err)
      }

      alert("Lote registrado e impresión enviada.")
      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.overlay}>
      <div style={s.sheet}>
        <h3 style={s.title}>Preparar: {formulacion.nombre}</h3>
        
        <div style={s.controls}>
          <div style={s.field}>
            <label style={s.label}>Volumen a preparar (Litros)</label>
            <input style={s.input} type="number" step="0.1" value={volumen} onChange={e => setVolumen(e.target.value)} />
          </div>
          <div style={s.field}>
            <label style={s.label}>Concentración (X)</label>
            <input style={s.input} type="number" step="1" value={concentracion} onChange={e => setConcentracion(e.target.value)} />
          </div>
        </div>

        <div style={s.weighBox}>
          <p style={s.weighTitle}>Tabla de Pesaje / Medición</p>
          <table style={s.table}>
            <thead>
              <tr style={s.tr}>
                <th style={s.th}>Componente</th>
                <th style={s.th}>Cantidad</th>
                <th style={s.th}>Unidad</th>
              </tr>
            </thead>
            <tbody>
              {formulacion.componentes.map(c => (
                <tr key={c.id} style={s.tr}>
                  <td style={s.td}>{c.reactivo.nombre}</td>
                  <td style={s.tdBold}>{(c.cantidad_base * ratio).toFixed(4)}</td>
                  <td style={s.td}>{c.reactivo.unidad_medida}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p style={s.hint}>Asegúrate de ajustar el pH tras disolver todos los componentes.</p>
        
        {error && <p style={s.error}>{error}</p>}
        
        <div style={s.actions}>
          <button style={s.btnCancel} onClick={onCancel}>Cancelar</button>
          <button style={s.btnSave} onClick={preparar} disabled={loading}>
            {loading ? 'Procesando…' : 'Confirmar y Etiquetar'}
          </button>
        </div>
      </div>
    </div>
  )
}

const s = {
  overlay: { position: 'fixed', inset: 0, background: '#000c', display: 'flex', alignItems: 'flex-end', zIndex: 200 },
  sheet: { background: '#1a2e1e', borderRadius: '16px 16px 0 0', padding: '1.5rem', width: '100%', maxHeight: '90dvh', overflowY: 'auto' },
  title: { color: '#7dca8f', margin: '0 0 1rem' },
  controls: { display: 'flex', gap: 10, marginBottom: '1.5rem' },
  field: { flex: 1, display: 'flex', flexDirection: 'column', gap: 5 },
  label: { color: '#4a8c5c', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' },
  input: { background: '#0f1f13', border: '1px solid #2d5c3a', borderRadius: 8, padding: '0.75rem', color: '#e0f0e5', fontSize: '1rem', outline: 'none' },
  weighBox: { background: '#0f1f13', borderRadius: 12, padding: '1rem', border: '1px solid #2d5c3a' },
  weighTitle: { color: '#7dca8f', fontSize: '0.85rem', fontWeight: 600, margin: '0 0 10px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tr: { borderBottom: '1px solid #1a2e1e' },
  th: { textAlign: 'left', color: '#4a8c5c', fontSize: '0.7rem', padding: '5px' },
  td: { padding: '10px 5px', color: '#e0f0e5', fontSize: '0.9rem' },
  tdBold: { padding: '10px 5px', color: '#7dca8f', fontWeight: 'bold', fontSize: '1.1rem' },
  hint: { color: '#4a8c5c', fontSize: '0.8rem', marginTop: 12, textAlign: 'center', fontStyle: 'italic' },
  error: { color: '#f28b82', fontSize: '0.85rem', marginTop: 10 },
  actions: { display: 'flex', gap: 10, marginTop: 20 },
  btnCancel: { flex: 1, background: 'none', border: '1px solid #2d5c3a', borderRadius: 10, color: '#7dca8f', padding: '0.8rem', cursor: 'pointer' },
  btnSave: { flex: 2, background: '#2d7a47', border: 'none', borderRadius: 10, color: '#fff', padding: '0.8rem', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' },
}
