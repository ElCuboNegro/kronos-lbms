import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import QRScanner from '../components/QRScanner'

export default function ContenedoresManager() {
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const initialContenedor = params.get('c') || ''

  const [origenId, setOrigenId] = useState(initialContenedor)
  const [destinoId, setDestinoId] = useState('')
  
  const [origenData, setOrigenData] = useState(null)
  const [destinoData, setDestinoData] = useState(null)
  
  const [loadingOrigen, setLoadingOrigen] = useState(false)
  const [loadingDestino, setLoadingDestino] = useState(false)
  
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [showScanner, setShowScanner] = useState(null) // 'origen' | 'destino'
  const [moving, setMoving] = useState(false)
  const [error, setError] = useState('')

  // Load Origen
  useEffect(() => {
    if (!origenId || origenId.length < 5) {
      setOrigenData(null)
      return
    }
    const fetchOrigen = async () => {
      setLoadingOrigen(true)
      try {
        const res = await api.get(`/scan/${encodeURIComponent(origenId)}`)
        if (res.tipo === 'contenedor') {
          setOrigenData(res.contenedor)
        } else if (res.tipo === 'especimen') {
          // It's a single specimen. We can mock a fake container of 1 item for it.
          setOrigenData({ contenedor_uid: 'Especímen Único', especimenes: [res.especimen] })
        } else {
          setOrigenData(null)
        }
      } catch (e) {
        setOrigenData(null)
      } finally {
        setLoadingOrigen(false)
      }
    }
    fetchOrigen()
  }, [origenId])

  // Load Destino
  useEffect(() => {
    if (!destinoId || destinoId.length < 5) {
      setDestinoData(null)
      return
    }
    if (destinoId === origenId) {
      setDestinoData(null)
      return
    }
    const fetchDestino = async () => {
      setLoadingDestino(true)
      try {
        const res = await api.get(`/scan/${encodeURIComponent(destinoId)}`)
        if (res.tipo === 'contenedor') {
          setDestinoData(res.contenedor)
        } else {
          // If it doesn't exist yet, we can create a "new" virtual container
          setDestinoData({ contenedor_uid: destinoId, especimenes: [] })
        }
      } catch (e) {
        // If 404, assume it's a completely new container UID
        setDestinoData({ contenedor_uid: destinoId, especimenes: [] })
      } finally {
        setLoadingDestino(false)
      }
    }
    fetchDestino()
  }, [destinoId, origenId])

  const handleScan = (code) => {
    const target = showScanner
    setShowScanner(null)
    if (target === 'origen') setOrigenId(code)
    else if (target === 'destino') setDestinoId(code)
  }

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    if (!origenData) return
    if (selectedIds.size === origenData.especimenes.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(origenData.especimenes.map(e => e.id)))
    }
  }

  const moverElementos = async () => {
    if (selectedIds.size === 0 || !destinoId) return
    setMoving(true)
    setError('')
    try {
      await api.post('/especimenes/contenedores/mover', {
        especimen_ids: Array.from(selectedIds),
        destino_contenedor_uid: destinoId,
        notas: `Transferido desde ${origenData.contenedor_uid}`
      })
      
      // Clear selection and refresh both sides
      setSelectedIds(new Set())
      
      // Force re-triggering the useEffects
      const currentO = origenId
      const currentD = destinoId
      setOrigenId('')
      setDestinoId('')
      setTimeout(() => {
        setOrigenId(currentO)
        setDestinoId(currentD)
      }, 50)
      
    } catch (err) {
      setError(err.message || 'Error al mover elementos')
    } finally {
      setMoving(false)
    }
  }

  if (showScanner) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: '#000' }}>
        <QRScanner onResult={handleScan} />
        <button 
          className="btn btn--secondary" 
          style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 2010 }}
          onClick={() => setShowScanner(null)}
        >
          Cancelar Escaneo
        </button>
      </div>
    )
  }

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '100%' }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <h2 className="page-title text-primary">Gestión de Contenedores</h2>
      </div>

      <p className="text-muted" style={{ margin: '0 0 0.5rem', fontSize: '0.85rem' }}>
        Mueve especímenes entre contenedores físicos o agrupa individuos sueltos en un nuevo frasco.
      </p>

      {/* ORIGEN */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: '1rem', borderColor: selectedIds.size > 0 ? 'var(--theme-primary)' : 'var(--theme-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 className="text-secondary" style={{ margin: 0, textTransform: 'uppercase', fontSize: '0.8rem' }}>1. Origen</h4>
          <button className="btn btn--secondary" style={{ padding: '0.2rem 0.6rem', fontSize: '0.9rem' }} onClick={() => setShowScanner('origen')}>📷 Escanear</button>
        </div>
        <input 
          style={{ background: 'var(--theme-background)', border: '1px solid var(--theme-border)', borderRadius: 8, padding: '0.6rem', color: 'var(--theme-text)', width: '100%' }}
          value={origenId} 
          onChange={e => setOrigenId(e.target.value)} 
          placeholder="Código de contenedor (ej. CONT-123) o UID" 
        />
        
        {loadingOrigen && <p className="text-muted" style={{ fontSize: '0.8rem', margin: 0 }}>Cargando origen...</p>}
        
        {origenData && !loadingOrigen && (
          <div style={{ marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span className="text-primary" style={{ fontWeight: 'bold' }}>{origenData.especimenes.length} elementos encontrados</span>
              <button className="btn btn--ghost" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={selectAll}>
                {selectedIds.size === origenData.especimenes.length ? 'Desmarcar todo' : 'Marcar todo'}
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '30vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {origenData.especimenes.map(esp => (
                <div 
                  key={esp.id} 
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.6rem', 
                    background: selectedIds.has(esp.id) ? 'rgba(125, 202, 143, 0.15)' : 'var(--theme-background)', 
                    border: selectedIds.has(esp.id) ? '1px solid var(--theme-primary)' : '1px solid var(--theme-border)', 
                    borderRadius: '8px', cursor: 'pointer' 
                  }}
                  onClick={() => toggleSelect(esp.id)}
                >
                  <input type="checkbox" checked={selectedIds.has(esp.id)} readOnly style={{ width: '1.2rem', height: '1.2rem', margin: 0, accentColor: 'var(--theme-primary)' }} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="font-mono text-primary" style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{esp.uid}</span>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>{esp.especie} {esp.notas ? `(${esp.notas})` : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', margin: '-0.5rem 0' }}>
        <span style={{ background: 'var(--theme-surface)', padding: '0.5rem', borderRadius: '50%', fontSize: '1.2rem' }}>⬇️</span>
      </div>

      {/* DESTINO */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 className="text-secondary" style={{ margin: 0, textTransform: 'uppercase', fontSize: '0.8rem' }}>2. Destino</h4>
          <button className="btn btn--secondary" style={{ padding: '0.2rem 0.6rem', fontSize: '0.9rem' }} onClick={() => setShowScanner('destino')}>📷 Escanear</button>
        </div>
        <input 
          style={{ background: 'var(--theme-background)', border: '1px solid var(--theme-border)', borderRadius: 8, padding: '0.6rem', color: 'var(--theme-text)', width: '100%' }}
          value={destinoId} 
          onChange={e => setDestinoId(e.target.value)} 
          placeholder="Código de destino (ej. CONT-NUEVO)" 
        />
        
        {loadingDestino && <p className="text-muted" style={{ fontSize: '0.8rem', margin: 0 }}>Comprobando destino...</p>}
        
        {destinoData && !loadingDestino && (
          <div style={{ marginTop: '0.5rem' }}>
            <span className="text-primary" style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
              {destinoData.especimenes.length > 0 ? `Contenedor existente (${destinoData.especimenes.length} elementos)` : 'Nuevo contenedor / Vacío'}
            </span>
            {destinoData.especimenes.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem', maxHeight: '15vh', overflowY: 'auto' }}>
                {destinoData.especimenes.map(esp => (
                  <div key={esp.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.6rem', background: 'var(--theme-background)', borderRadius: '6px', border: '1px solid var(--theme-border)' }}>
                    <span className="font-mono text-muted" style={{ fontSize: '0.8rem' }}>{esp.uid}</span>
                    <span className="text-muted" style={{ fontSize: '0.7rem' }}>{esp.especie}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {error && <p className="badge badge--danger" style={{ width: '100%', textAlign: 'center', padding: '0.5rem' }}>{error}</p>}
      
      <button 
        className="btn btn--primary btn--block" 
        style={{ padding: '1rem', fontSize: '1.1rem', marginTop: '0.5rem' }} 
        disabled={selectedIds.size === 0 || !destinoId || moving}
        onClick={moverElementos}
      >
        {moving ? 'Moviendo...' : `Mover ${selectedIds.size} elemento(s) al destino`}
      </button>
      
      {destinoData && (destinoData.especimenes.length > 0 || moving) && (
         <button 
          className="btn btn--ghost btn--block" 
          style={{ marginTop: '0.5rem' }}
          onClick={async () => {
            try {
              await api.post(`/printer/imprimir-contenedor/${destinoId}`)
              alert("Etiqueta de contenedor enviada a la impresora")
            } catch(e) {
              alert(e.message || "Error al imprimir")
            }
          }}
         >
           🖨 Imprimir etiqueta del destino
         </button>
      )}
    </div>
  )
}