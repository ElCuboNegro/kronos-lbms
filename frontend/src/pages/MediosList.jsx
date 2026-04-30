import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

const TIPOS = [
  { val: 'sustrato', label: 'Sustrato / Mezcla' },
  { val: 'agar', label: 'Agar / Medio in vitro' },
  { val: 'hidroponia', label: 'Solución Hidropónica' },
  { val: 'otro', label: 'Otro' }
]

export default function LaboratorioDashboard() {
  const navigate = useNavigate()
  
  return (
    <div className="page-container" style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
      <h2 className="page-title" style={{color:'var(--bio-primary)',margin:0,fontSize:'1.4rem'}}>Gestión de Laboratorio</h2>
      <p style={{color:'var(--bio-secondary)',fontSize:'0.85rem',margin:'-0.5rem 0 1rem'}}>Inventario químico, formulaciones y trazabilidad de medios.</p>

      <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:'1.5rem'}}>
        <MenuCard 
          title="Reactivos" 
          desc="Catálogo de químicos, hormonas y sales puras." 
          icon="🧪" 
          onClick={() => navigate('/reactivos')} 
        />
        <MenuCard 
          title="Recetario" 
          desc="Define formulaciones y composiciones estándar." 
          icon="📖" 
          onClick={() => navigate('/formulaciones')} 
        />
        <MenuCard 
          title="Lotes Preparados" 
          desc="Historial de medios listos y trazabilidad." 
          icon="📦" 
          onClick={() => navigate('/lotes')} 
        />
        <MenuCard 
          title="Micro-Herramientas" 
          desc="Diluciones, molaridad y contadores biológicos." 
          icon="🧮" 
          onClick={() => navigate('/calculadoras')} 
        />
      </div>

      <h3 style={{color:'var(--bio-primary)',fontSize:'0.9rem',fontWeight:700,textTransform:'uppercase',letterSpacing:1}}>Formulaciones de Medios / Sustratos</h3>
      <MediosSubList />
    </div>
  )
}

function MenuCard({ title, desc, icon, onClick }) {
  return (
    <div style={{background:'var(--bio-surface)',border:'1px solid var(--bio-border)',borderRadius:12,padding:'1.25rem',display:'flex',gap:15,alignItems:'center',cursor:'pointer'}} onClick={onClick}>
      <span style={{fontSize:'2rem'}}>{icon}</span>
      <div>
        <h4 style={{color:'var(--bio-text)',margin:0,fontSize:'1.05rem'}}>{title}</h4>
        <p style={{color:'var(--bio-secondary)',margin:'2px 0 0',fontSize:'0.82rem',lineHeight:1.3}}>{desc}</p>
      </div>
    </div>
  )
}

function MediosSubList() {
  const [medios, setMedios] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/sustratos').then(setMedios).finally(() => setLoading(false))
  }, [])

  if (loading) return <p style={{color:'var(--bio-text-muted)',textAlign:'center',padding:'1rem'}}>Cargando…</p>

  return (
    <div style={{display:'flex',flexDirection:'column',gap:10}}>
      {medios.map(m => (
        <div key={m.id} className="card">
          <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:4}}>
            <span style={{color:'var(--bio-primary)',fontWeight:'bold',fontFamily:'monospace',fontSize:'0.75rem'}}>{m.codigo_formulacion}</span>
            <span style={{background:'var(--bio-border)',color:'var(--bio-primary)',fontSize:'0.6rem',padding:'1px 4px',borderRadius:4,textTransform:'uppercase'}}>{TIPOS.find(t => t.val === m.tipo)?.label || m.tipo}</span>
          </div>
          <span style={{color:'var(--bio-text)',fontSize:'0.9rem'}}>{m.nombre}</span>
        </div>
      ))}
    </div>
  )
}

