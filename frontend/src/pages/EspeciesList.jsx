import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import EspecieForm from '../components/EspecieForm'

export default function EspeciesList() {
  const navigate = useNavigate()
  const [especies, setEspecies] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { fetchEspecies() }, [])

  async function fetchEspecies() {
    setLoading(true)
    try { setEspecies(await api.get('/especies')) }
    finally { setLoading(false) }
  }

  const filtradas = especies.filter(e =>
    e.nombre_cientifico.toLowerCase().includes(busqueda.toLowerCase()) ||
    (e.nombre_comun || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (e.familia || '').toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="page-container" style={{display:'flex',flexDirection:'column',gap:10}}>
      <div style={{display:'flex',gap:8}}>
        <input
          style={{flex:1,background:'var(--theme-surface)',border:'1px solid var(--theme-border)',borderRadius:10,padding:'0.6rem 0.9rem',color:'var(--theme-text)',fontSize:'0.95rem',outline:'none'}}
          placeholder="Buscar especie…"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        <button style={{background:'var(--theme-background)',border:'1px solid var(--theme-border)',borderRadius:10,color:'var(--theme-primary)',fontSize:'1.1rem',width:44,cursor:'pointer'}} onClick={() => navigate('/medios')} title="Medios">🧪</button>
        <button style={{background:'var(--theme-primary)',border:'none',borderRadius:10,color:'#fff',fontSize:'1.4rem',width:44,cursor:'pointer'}} onClick={() => setShowForm(true)}>+</button>
      </div>

      {loading
        ? <p style={{color:'var(--theme-text-muted)',textAlign:'center',padding:'2rem 0'}}>Cargando…</p>
        : filtradas.length === 0
          ? <p style={{color:'var(--theme-text-muted)',textAlign:'center',padding:'2rem 0'}}>{busqueda ? 'Sin resultados' : 'No hay especies registradas'}</p>
          : filtradas.map(e => (
              <EspecieCard key={e.id} e={e} onClick={() => navigate(`/especies/${e.codigo || e.id}`)} />
            ))
      }

      {showForm && (
        <EspecieForm
          onSaved={(nueva) => {
            setShowForm(false);
            fetchEspecies();
            if (nueva) navigate(`/especies/${nueva.id}`);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  )
}

function EspecieCard({ e, onClick }) {
  return (
    <button className="card" style={{textAlign:'left',cursor:'pointer',width:'100%'}} onClick={onClick}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',gap:8}}>
        <span style={{color:'var(--theme-primary)',fontSize:'1rem',fontWeight:600,fontStyle:'italic'}}>{e.nombre_cientifico}</span>
        <span style={{color:'var(--theme-text-muted)',fontSize:'0.75rem',flexShrink:0}}>{e.familia || 'Sin familia'}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <span style={{background:'var(--theme-border)',color:'var(--theme-primary)',fontSize:'0.65rem',padding:'1px 5px',borderRadius:4,textTransform:'uppercase',fontWeight:'bold',border:'1px solid var(--theme-border)'}}>{e.categoria}</span>
        {e.nombre_comun && <p style={{color:'var(--theme-text)',fontSize:'0.85rem',margin: 0}}>{e.nombre_comun}</p>}
      </div>

      <div style={{display:'flex',gap:16}}>
        <Stat label="Líneas" val={e.total_lineas} />
        <Stat label="Individuos" val={e.total_individuos} />
      </div>
    </button>
  )
}

function Stat({ label, val }) {
  return (
    <span style={{color:'var(--theme-secondary)',fontSize:'0.8rem'}}>
      <span style={{color:'var(--theme-primary)',fontWeight:700}}>{val}</span>
      <span > {label}</span>
    </span>
  )
}
