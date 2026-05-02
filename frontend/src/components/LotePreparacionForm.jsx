import { useState } from 'react'
import { api } from '../api/client'

export default function LotePreparacionForm({ formulacion, onSaved, onCancel }) {
  const [volumen, setVolumen] = useState(formulacion.volumen_base_l)
  const [concentracion, setConcentracion] = useState(1.0)
  const [trazabilidad, setTrazabilidad] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const ratio = (volumen / formulacion.volumen_base_l) * concentracion

  async function preparar(e) {
    e.preventDefault()
    setLoading(true)
    try {
      // Limpiar trazabilidad vacía
      const cleanTrazabilidad = Object.fromEntries(
        Object.entries(trazabilidad).filter(([k, v]) => v.trim() !== '')
      )

      const lote = await api.post('/reactivos/lotes', {
        formulacion_id: formulacion.id,
        volumen_l: parseFloat(volumen),
        concentracion_x: parseFloat(concentracion),
        ph_final: undefined,
        trazabilidad_reactivos: cleanTrazabilidad,
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
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',display:'flex',alignItems:'flex-end',zIndex:200}}>
      <div style={{background:'var(--theme-surface)',borderRadius:'24px 24px 0 0',padding:'1.5rem',width:'100%',maxHeight:'90dvh',overflowY:'auto'}}>
        <h3 className="page-title text-primary" style={{margin:'0 0 1.5rem'}}>Preparar: {formulacion.nombre}</h3>

        <div className="grid-2" style={{marginBottom:'1.5rem'}}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Volumen a preparar (L)</label>
            <input type="number" step="0.1" value={volumen} onChange={e => setVolumen(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Concentración (X)</label>
            <input type="number" step="1" value={concentracion} onChange={e => setConcentracion(e.target.value)} />
          </div>
        </div>

        <div className="card" style={{ padding: '1rem', margin: 0 }}>
          <p className="text-secondary" style={{fontSize:'0.85rem',fontWeight:600,margin:'0 0 10px'}}>Tabla de Pesaje y Trazabilidad</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {formulacion.componentes.map(c => {
              const esReactivo = !!c.reactivo;
              const itemNombre = esReactivo ? c.reactivo.nombre : c.formulacion_ingrediente.nombre;
              const itemUnidad = esReactivo ? c.reactivo.unidad_medida : c.formulacion_ingrediente.unidad_medida;
              const itemId = esReactivo ? c.reactivo.id : c.formulacion_ingrediente.id;

              return (
                <div key={c.id} style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingBottom: '0.8rem', borderBottom: '1px solid var(--theme-background)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="text-text" style={{ fontSize: '0.95rem' }}>{itemNombre}</span>
                    <span className="text-primary" style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                      {(c.cantidad_base * ratio).toFixed(4)} <span className="text-muted" style={{ fontSize: '0.8rem' }}>{itemUnidad}</span>
                    </span>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <input
                      type="text"
                      placeholder={esReactivo ? "Escanear Lote Proveedor (Ej. Sigma-123)" : "Escanear Lote Interno (Ej. REAC-240501-001)"}
                      value={trazabilidad[itemId] || ''}
                      onChange={e => setTrazabilidad(prev => ({ ...prev, [itemId]: e.target.value }))}
                      style={{ fontSize: '0.85rem', padding: '0.5rem' }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <p className="text-muted" style={{fontSize:'0.8rem',marginTop:16,textAlign:'center',fontStyle:'italic'}}>Asegúrate de ajustar el pH tras disolver todos los componentes.</p>

        {error && <p className="text-danger" style={{fontSize:'0.85rem',marginTop:10}}>{error}</p>}

        <div style={{display:'flex',gap:'1rem',marginTop:20}}>
          <button className="btn btn--ghost" style={{flex:1}} onClick={onCancel}>Cancelar</button>
          <button className="btn btn--primary" style={{flex:2}} onClick={preparar} disabled={loading}>
            {loading ? 'Procesando…' : 'Confirmar y Etiquetar'}
          </button>
        </div>
      </div>
    </div>
  )
}
