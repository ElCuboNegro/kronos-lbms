import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { api } from '../api/client'

export default function IndividuoMultiCreate() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [lotes, setLotes] = useState([])
  const [experimentos, setExperimentos] = useState([])

  const [formData, setFormData] = useState({
    especie_id: searchParams.get('especie') || '',
    madre_id: searchParams.get('madre') || '',
    lote_id: '',
    experimento_id: '',
    cantidad: 10,
    estado: 'activo',
    fecha_ingreso: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    api.get('/reactivos/lotes').then(setLotes).catch(() => {})
    api.get('/experimentos').then(setExperimentos).catch(() => {})
  }, [])

  const handleNext = () => setStep(s => s + 1)
  const handlePrev = () => setStep(s => Math.max(1, s - 1))

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const payload = {
        ...formData,
        items: [{ cantidad: parseInt(formData.cantidad), notas: 'Clonación masiva' }]
      }
      await api.post('/especimenes/bulk', payload)
      navigate('/especimenes')
    } catch (e) {
      alert("Error: " + e.message)
    } finally {
      setLoading(false)
    }
  }

  const totalSteps = 4

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span className="text-muted" style={{ fontSize: '0.8rem' }}>Paso {step} de {totalSteps}</span>
          <span className="text-primary" style={{ fontWeight: 600 }}>{Math.round((step/totalSteps)*100)}%</span>
        </div>
        <div style={{ height: '6px', background: 'var(--theme-border)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(step/totalSteps)*100}%`, background: 'var(--theme-secondary)', transition: 'width 0.3s' }} />
        </div>
      </div>

      {step === 1 && (
        <Card title="Origen Genético" subtitle="Identifica la planta madre">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             <div className="input-group">
                <label>ID Especie</label>
                <input type="text" readOnly value={formData.especie_id} style={{ background: '#eee' }} />
             </div>
             <div className="input-group">
                <label>Planta Madre (Opcional)</label>
                <input type="text" value={formData.madre_id} readOnly style={{ background: '#eee' }} />
             </div>
             <Button onClick={handleNext}>Continuar <span className="icon-sm">→</span></Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card title="Contexto de Trabajo" subtitle="Vincular con medio y experimento">
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="input-group">
                <label>Medio de Cultivo (Lote)</label>
                <select value={formData.lote_id} onChange={e => setFormData({...formData, lote_id: e.target.value})} style={{ width: '100%', padding: '0.5rem' }}>
                  <option value="">-- Seleccionar Lote --</option>
                  {lotes.map(l => <option key={l.id} value={l.id}>{l.uid}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Experimento (Opcional)</label>
                <select value={formData.experimento_id} onChange={e => setFormData({...formData, experimento_id: e.target.value})} style={{ width: '100%', padding: '0.5rem' }}>
                  <option value="">-- Sin Experimento --</option>
                  {experimentos.map(ex => <option key={ex.id} value={ex.id}>{ex.nombre}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button variant="ghost" onClick={handlePrev}>Atrás</Button>
                <Button onClick={handleNext}>Continuar</Button>
              </div>
           </div>
        </Card>
      )}

      {step === 3 && (
        <Card title="Configuración de Lote" subtitle="Parámetros de cultivo">
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label>Cantidad</label>
              <input type="number" value={formData.cantidad} onChange={e => setFormData({...formData, cantidad: e.target.value})} />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button variant="ghost" onClick={handlePrev}>Atrás</Button>
                <Button onClick={handleNext}>Revisar</Button>
              </div>
           </div>
        </Card>
      )}

      {step === 4 && (
        <Card title="Confirmación" subtitle="Verifica los datos">
           <div style={{ padding: '1rem', background: 'var(--theme-background)', marginBottom: '1.5rem' }}>
              <p>Total: {formData.cantidad} especímenes</p>
           </div>
           <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button variant="ghost" onClick={handlePrev}>Atrás</Button>
              <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Generando...' : '🔥 Iniciar'}</Button>
           </div>
        </Card>
      )}
    </>
  )
}
