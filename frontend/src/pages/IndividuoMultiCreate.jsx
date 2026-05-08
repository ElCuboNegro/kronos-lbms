import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Layout from '../components/ui/Layout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { api } from '../api/client'

export default function IndividuoMultiCreate() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // State del formulario
  const [formData, setFormData] = useState({
    especie_id: searchParams.get('especie') || '',
    madre_id: searchParams.get('madre') || '',
    cantidad: 10,
    estado: 'activo',
    fecha_ingreso: new Date().toISOString().split('T')[0]
  })

  const handleNext = () => setStep(s => s + 1)
  const handlePrev = () => setStep(s => Math.max(1, s - 1))

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Adaptar al nuevo esquema de la Fase 1-3 (BulkItems)
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

  return (
    <Layout title="Clonación Masiva" showBack>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span className="text-muted" style={{ fontSize: '0.8rem' }}>Paso {step} de 3</span>
          <span className="text-primary" style={{ fontWeight: 600 }}>{Math.round((step/3)*100)}%</span>
        </div>
        <div style={{ height: '6px', background: 'var(--theme-border)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(step/3)*100}%`, background: 'var(--theme-secondary)', transition: 'width 0.3s' }} />
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
        <Card title="Configuración de Lote" subtitle="Parámetros de cultivo">
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label>Cantidad de Explantes</label>
              <input type="number" value={formData.cantidad} onChange={e => setFormData({...formData, cantidad: e.target.value})} />

              <label>Fecha de Registro</label>
              <input type="date" value={formData.fecha_ingreso} onChange={e => setFormData({...formData, fecha_ingreso: e.target.value})} />

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button variant="ghost" style={{ flex: 1 }} onClick={handlePrev}>Atrás</Button>
                <Button style={{ flex: 2 }} onClick={handleNext}>Revisar Lote</Button>
              </div>
           </div>
        </Card>
      )}

      {step === 3 && (
        <Card title="Confirmación" subtitle="Verifica los datos antes de generar">
           <div style={{ padding: '1rem', background: 'var(--theme-background)', borderRadius: 'var(--radius-base)', marginBottom: '1.5rem' }}>
              <p><strong>Total:</strong> {formData.cantidad} especímenes</p>
              <p><strong>Estado:</strong> {formData.estado}</p>
           </div>
           <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button variant="ghost" style={{ flex: 1 }} onClick={handlePrev}>Atrás</Button>
              <Button style={{ flex: 2 }} onClick={handleSubmit} disabled={loading}>
                {loading ? 'Generando...' : '🔥 Iniciar Producción'}
              </Button>
           </div>
        </Card>
      )}
    </Layout>
  )
}
