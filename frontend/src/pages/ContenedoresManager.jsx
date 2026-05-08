import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import ContainerMap from '../components/ContainerMap'

export default function ContenedoresManager() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const initialContenedor = params.get('c') || ''

  const [containerId, setContainerId] = useState(initialContenedor)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState('list') // 'list' | 'map'
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchData = async () => {
    if (!containerId || containerId.length < 5) {
      setData(null)
      return
    }
    setLoading(true)
    try {
      const res = await api.get(\`/scan/\${encodeURIComponent(containerId)}\`)
      if (res.tipo === 'contenedor') setData(res.contenedor)
      else if (res.tipo === 'especimen') setData({ contenedor_uid: 'Unidad', especimenes: [res.especimen] })
      else setData(null)
    } catch (e) {
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [containerId, refreshKey])

  return (

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Card>
          <div className="input-group">
            <label>Identificador del Frasco / Contenedor</label>
            <input
              style={{ background: 'var(--theme-background)', border: '1px solid var(--theme-border)', borderRadius: 8, padding: '1rem', fontSize: '1.1rem', width: '100%' }}
              value={containerId}
              onChange={e => setContainerId(e.target.value)}
              placeholder="Ej: COTV-JAR-MIX-3"
            />
          </div>
        </Card>

        {data && (
          <>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setView('list')}
                className={\`btn \${view === 'list' ? 'btn--primary' : 'btn--ghost'}\`}
                style={{ flex: 1, borderRadius: '20px' }}
              > Lista ({data.especimenes.length}) </button>
              <button
                onClick={() => setView('map')}
                className={\`btn \${view === 'map' ? 'btn--primary' : 'btn--ghost'}\`}
                style={{ flex: 1, borderRadius: '20px' }}
              > 🗺️ Mapa Visual </button>
            </div>

            {view === 'list' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                 {data.especimenes.map(esp => (
                   <Card key={esp.id} onClick={() => navigate(\`/especimen/\${esp.uid}\`)} style={{ cursor: 'pointer', padding: '0.8rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                         <span className="font-mono" style={{ fontWeight: 'bold' }}>{esp.uid}</span>
                         {esp.coordenadas ? <span className="badge badge--success">Ubicado</span> : <span className="badge badge--outline">Sin Ubicar</span>}
                      </div>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem' }}>{esp.notas || 'Sin notas'}</p>
                   </Card>
                 ))}
              </div>
            ) : (
              <Card>
                <ContainerMap
                  container={data.contenedor_uid}
                  especimenes={data.especimenes}
                  onUpdate={() => setRefreshKey(k => k + 1)}
                />
              </Card>
            )}
          </>
        )}

        {loading && <p className="text-center text-muted">Buscando frasco...</p>}
      </div>

  )
}
