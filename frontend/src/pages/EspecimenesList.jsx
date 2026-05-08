import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, useParams } from 'react-router-dom'
import { api } from '../api/client'

const ESTADO_COLOR = {
  activo: 'var(--theme-primary)', en_experimento: '#b07d1e',
  archivado: 'var(--theme-text-muted)', contaminado: 'var(--error)',
}

export default function EspecimenesList() {
  const navigate = useNavigate()
  const { especie_slug } = useParams()
  const [params] = useSearchParams()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [especieInfo, setEspecieInfo] = useState(null)
  const [lineaInfo, setLineaInfo] = useState(null)

  const especieParam = especie_slug || params.get('especie')
  const lineaId = params.get('linea')

  useEffect(() => {
    async function init() {
      let resolvedEspecieId = null;
      if (especieParam) {
        try {
          const esp = await api.get(`/especies/${especieParam}`)
          setEspecieInfo(esp)
          resolvedEspecieId = esp.id
        } catch (e) { console.error(e) }
      }
      await fetchItems(resolvedEspecieId)
    }
    init()
  }, [especieParam, lineaId])

  async function fetchItems(resolvedEspecieId) {
    setLoading(true)
    try {
      const data = await api.get('/especimenes')
      // Filtro básico en frontend por ahora
      let filtered = data
      if (resolvedEspecieId) filtered = filtered.filter(i => i.especie_id === resolvedEspecieId)
      if (lineaId) filtered = filtered.filter(i => i.linea_id === lineaId)
      setItems(filtered)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container" style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
      <div className="page-header" style={{marginBottom:'0.5rem'}}>
        <h2 className="page-title" style={{color:'var(--theme-primary)',margin:0,fontSize:'1.4rem'}}>Individuos</h2>
        {especieInfo && <p style={{color:'var(--theme-text)',margin:'4px 0',fontSize:'0.9rem'}}>Especie: <span style={{fontStyle:'italic'}}>{especieInfo.nombre_cientifico}</span></p>}
        <p style={{color:'var(--theme-secondary)',fontSize:'0.8rem',margin:0}}>{items.length} especímenes encontrados</p>
      </div>

      {loading ? (
        <p style={{color:'var(--theme-text-muted)',textAlign:'center',padding:'2rem'}}>Cargando…</p>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {items.length === 0 ? (
            <p style={{color:'var(--theme-text-muted)',textAlign:'center',padding:'2rem'}}>No hay individuos que coincidan con el filtro</p>
          ) : (
            items.map(i => (
              <div key={i.id} className="card" style={{cursor:'pointer'}} onClick={() => navigate(`/especimen/${i.id}`)}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                  <span style={{color:'var(--theme-primary)',fontWeight:'bold',fontFamily:'monospace'}}>{i.uid}</span>
                  <span style={{ borderRadius:20,padding:'0.1rem 0.6rem',fontSize:'0.65rem',color:'#fff',textTransform:'uppercase',fontWeight:600, background: ESTADO_COLOR[i.estado] || '#555' }}>{i.estado}</span>
                </div>
                <p style={{color:'var(--theme-text)',margin:0,fontSize:'0.95rem',fontWeight:500}}>{i.especie}</p>
                {i.linea_nombre && <p style={{color:'var(--theme-secondary)',margin:'2px 0',fontSize:'0.82rem'}}>Línea: {i.linea_nombre}</p>}
                <p style={{color:'var(--theme-text-muted)',margin:'4px 0 0',fontSize:'0.75rem'}}>Ingreso: {new Date(i.fecha_ingreso).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
