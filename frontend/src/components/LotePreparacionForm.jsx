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
    <div style={{position:'fixed',inset:0,background:'#000c',display:'flex',alignItems:'flex-end',zIndex:200}}>
      <div style={{background:'var(--bio-surface)',borderRadius:'16px 16px 0 0',padding:'1.5rem',width:'100%',maxHeight:'90dvh',overflowY:'auto'}}>
        <h3 className="page-title" style={{color:'var(--bio-primary)',margin:'0 0 1rem'}}>Preparar: {formulacion.nombre}</h3>
        
        <div style={{display:'flex',gap:10,marginBottom:'1.5rem'}}>
          <div style={{flex:1,display:'flex',flexDirection:'column',gap:5}}>
            <label style={{color:'var(--bio-secondary)',fontSize:'0.75rem',fontWeight:700,textTransform:'uppercase'}}>Volumen a preparar (Litros)</label>
            <input style={{background:'var(--bio-background)',border:'1px solid var(--bio-border)',borderRadius:8,padding:'0.75rem',color:'var(--bio-text)',fontSize:'1rem',outline:'none'}} type="number" step="0.1" value={volumen} onChange={e => setVolumen(e.target.value)} />
          </div>
          <div style={{flex:1,display:'flex',flexDirection:'column',gap:5}}>
            <label style={{color:'var(--bio-secondary)',fontSize:'0.75rem',fontWeight:700,textTransform:'uppercase'}}>Concentración (X)</label>
            <input style={{background:'var(--bio-background)',border:'1px solid var(--bio-border)',borderRadius:8,padding:'0.75rem',color:'var(--bio-text)',fontSize:'1rem',outline:'none'}} type="number" step="1" value={concentracion} onChange={e => setConcentracion(e.target.value)} />
          </div>
        </div>

        <div style={{background:'var(--bio-background)',borderRadius:12,padding:'1rem',border:'1px solid var(--bio-border)'}}>
          <p style={{color:'var(--bio-primary)',fontSize:'0.85rem',fontWeight:600,margin:'0 0 10px'}}>Tabla de Pesaje / Medición</p>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{borderBottom:'1px solid var(--bio-surface)'}}>
                <th style={{textAlign:'left',color:'var(--bio-secondary)',fontSize:'0.7rem',padding:'5px'}}>Componente</th>
                <th style={{textAlign:'left',color:'var(--bio-secondary)',fontSize:'0.7rem',padding:'5px'}}>Cantidad</th>
                <th style={{textAlign:'left',color:'var(--bio-secondary)',fontSize:'0.7rem',padding:'5px'}}>Unidad</th>
              </tr>
            </thead>
            <tbody>
              {formulacion.componentes.map(c => (
                <tr key={c.id} style={{borderBottom:'1px solid var(--bio-surface)'}}>
                  <td style={{padding:'10px 5px',color:'var(--bio-text)',fontSize:'0.9rem'}}>{c.reactivo.nombre}</td>
                  <td style={{padding:'10px 5px',color:'var(--bio-primary)',fontWeight:'bold',fontSize:'1.1rem'}}>{(c.cantidad_base * ratio).toFixed(4)}</td>
                  <td style={{padding:'10px 5px',color:'var(--bio-text)',fontSize:'0.9rem'}}>{c.reactivo.unidad_medida}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p style={{color:'var(--bio-secondary)',fontSize:'0.8rem',marginTop:12,textAlign:'center',fontStyle:'italic'}}>Asegúrate de ajustar el pH tras disolver todos los componentes.</p>
        
        {error && <p style={{color:'var(--error)',fontSize:'0.85rem',marginTop:10}}>{error}</p>}
        
        <div style={{display:'flex',gap:10,marginTop:20}}>
          <button style={{flex:1,background:'none',border:'1px solid var(--bio-border)',borderRadius:10,color:'var(--bio-primary)',padding:'0.8rem',cursor:'pointer'}} onClick={onCancel}>Cancelar</button>
          <button style={{flex:2,background:'var(--bio-primary)',border:'none',borderRadius:10,color:'#fff',padding:'0.8rem',fontSize:'1rem',fontWeight:600,cursor:'pointer'}} onClick={preparar} disabled={loading}>
            {loading ? 'Procesando…' : 'Confirmar y Etiquetar'}
          </button>
        </div>
      </div>
    </div>
  )
}

