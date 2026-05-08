import { useState } from 'react'
import { api } from '../api/client'

export default function ContainerMap({ container, especimenes, onUpdate }) {
  const [selected, setSelected] = useState(null)

  const handleSpotClick = async (e) => {
    if (!selected) return

    // Calcular coordenadas relativas al contenedor (0 a 100)
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    try {
      await api.patch(\`/especimenes/\${selected.id}/coordenadas\`, { x, y })
      onUpdate() // Refrescar datos
      setSelected(null)
    } catch (err) {
      alert("Error guardando posición: " + err.message)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <h4 style={{ margin: 0 }}>Mapa del Frasco: {container}</h4>
         {selected && <span className="badge badge--warning">Moviendo {selected.uid}...</span>}
      </div>

      <div
        onClick={handleSpotClick}
        style={{
          width: '100%', aspectRatio: '1', borderRadius: '50%',
          background: 'var(--theme-surface)', border: '4px solid var(--theme-border)',
          position: 'relative', boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.05)',
          cursor: selected ? 'crosshair' : 'default'
        }}
      >
        {/* Centro del frasco */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '4px', height: '4px', background: 'var(--theme-border)', borderRadius: '50%' }} />

        {especimenes.map(esp => {
          const { x, y } = esp.coordenadas || { x: -10, y: -10 }
          if (x < 0) return null

          return (
            <div
              key={esp.id}
              onClick={(e) => { e.stopPropagation(); setSelected(esp); }}
              style={{
                position: 'absolute', left: \`\${x}%\`, top: \`\${y}%\`,
                transform: 'translate(-50%, -50%)',
                width: '30px', height: '30px', borderRadius: '50%',
                background: selected?.id === esp.id ? 'var(--theme-accent)' : 'var(--theme-secondary)',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.6rem', fontWeight: 'bold', border: '2px solid white',
                boxShadow: 'var(--shadow-sm)', cursor: 'pointer', transition: 'all 0.2s'
              }}
              title={esp.notas}
            >
              {esp.uid.split('-').pop()}
            </div>
          )
        })}
      </div>

      <div className="card" style={{ padding: '0.5rem', opacity: 0.8 }}>
         <p style={{ fontSize: '0.75rem', margin: 0 }}>
           <strong>Instrucciones:</strong> Haz clic en un espécimen de la lista o el mapa para seleccionarlo, luego haz clic en el círculo para posicionarlo físicamente.
         </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
         {especimenes.filter(e => !e.coordenadas).map(e => (
           <div key={e.id} className="card" style={{ padding: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem' }}>{e.uid} ({e.notas})</span>
              <button className="btn btn--secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }} onClick={() => setSelected(e)}>Ubicar</button>
           </div>
         ))}
      </div>
    </div>
  )
}
