import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Card title="Acciones Rápidas">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
          <Button variant="secondary" onClick={() => navigate('/scan')}>🔍 Escanear</Button>
          <Button onClick={() => navigate('/nuevo-individuo')}>🌱 Registrar</Button>
        </div>
      </Card>

      <Card title="Estado del Sistema" subtitle="Resumen de actividad reciente">
        <p className="text-muted" style={{ fontSize: '0.9rem' }}>
          Todo operativo. 12 especímenes registrados hoy.
        </p>
      </Card>
    </div>
  )
}
