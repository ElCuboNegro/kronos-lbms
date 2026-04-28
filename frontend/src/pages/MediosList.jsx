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
    <div style={s.page}>
      <h2 style={s.title}>Gestión de Laboratorio</h2>
      <p style={s.intro}>Inventario químico, formulaciones y trazabilidad de medios.</p>

      <div style={s.menuGrid}>
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
      </div>

      <h3 style={s.secTitle}>Formulaciones de Medios / Sustratos</h3>
      <MediosSubList />
    </div>
  )
}

function MenuCard({ title, desc, icon, onClick }) {
  return (
    <div style={s.menuCard} onClick={onClick}>
      <span style={s.menuIcon}>{icon}</span>
      <div>
        <h4 style={s.menuTitle}>{title}</h4>
        <p style={s.menuDesc}>{desc}</p>
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

  if (loading) return <p style={s.muted}>Cargando…</p>

  return (
    <div style={s.list}>
      {medios.map(m => (
        <div key={m.id} style={s.card}>
          <div style={s.cardTop}>
            <span style={s.codigo}>{m.codigo_formulacion}</span>
            <span style={s.tipoBadge}>{TIPOS.find(t => t.val === m.tipo)?.label || m.tipo}</span>
          </div>
          <span style={s.nombre}>{m.nombre}</span>
        </div>
      ))}
    </div>
  )
}

const s = {
  page: { padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  title: { color: '#7dca8f', margin: 0, fontSize: '1.4rem' },
  intro: { color: '#4a8c5c', fontSize: '0.85rem', margin: '-0.5rem 0 1rem' },
  menuGrid: { display: 'flex', flexDirection: 'column', gap: 12, marginBottom: '1.5rem' },
  menuCard: { background: '#1a2e1e', border: '1px solid #2d5c3a', borderRadius: 12, padding: '1.25rem', display: 'flex', gap: 15, alignItems: 'center', cursor: 'pointer' },
  menuIcon: { fontSize: '2rem' },
  menuTitle: { color: '#e0f0e5', margin: 0, fontSize: '1.05rem' },
  menuDesc: { color: '#4a8c5c', margin: '2px 0 0', fontSize: '0.82rem', lineHeight: 1.3 },
  secTitle: { color: '#7dca8f', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 },
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  card: { background: '#0f1f13', border: '1px solid #2d5c3a', borderRadius: 10, padding: '0.75rem' },
  cardTop: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 },
  codigo: { color: '#7dca8f', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '0.75rem' },
  tipoBadge: { background: '#2d5c3a', color: '#7dca8f', fontSize: '0.6rem', padding: '1px 4px', borderRadius: 4, textTransform: 'uppercase' },
  nombre: { color: '#e0f0e5', fontSize: '0.9rem' },
  muted: { color: '#4a5568', textAlign: 'center', padding: '1rem' },
}
