import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import QRScanner from '../components/QRScanner'
import RegistroEvolucionForm from '../components/RegistroEvolucionForm'
import { ReactivoForm } from './ReactivosList'

export default function Scanner() {
  const navigate = useNavigate()
  const [scanning, setScanning] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastScan, setLastScan] = useState('')
  const [scanResult, setScanResult] = useState(null)
  const [showBulkEvo, setShowBulkEvo] = useState(false)
  const [showReactivoForm, setShowReactivoForm] = useState(false)

  async function handleResult(qrText) {
    setScanning(false)
    setLoading(true)
    setError('')
    setLastScan(qrText)
    try {
      const result = await api.get(`/scan/${encodeURIComponent(qrText)}`)
      if (['especimen', 'elemento', 'lote', 'reactivo', 'sustrato', 'contenedor'].includes(result.tipo)) {
        setScanResult(result)
      } else {
        setError('QR no reconocido por el sistema')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setScanResult(null); setError(''); setScanning(true); setLastScan('');
    setShowBulkEvo(false); setShowReactivoForm(false);
  }

  if (showBulkEvo) return (
    <Card>
      <RegistroEvolucionForm
        contenedorUid={scanResult.contenedor.contenedor_uid}
        onSaved={() => { alert("Registro completado"); reset(); }}
        onCancel={() => setShowBulkEvo(false)}
      />
    </Card>
  )

  if (showReactivoForm) return (
    <ReactivoForm initialCode={lastScan} onSaved={() => navigate('/reactivos')} onCancel={reset} />
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      {scanning && !loading && !error && (
        <div style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--theme-primary)' }}>
          <QRScanner onResult={handleResult} onError={setError} />
        </div>
      )}

      {scanResult && (
        <Card title="Resultado del Escaneo" subtitle={scanResult.tipo.toUpperCase()}>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 1rem' }}>{scanResult.tipo} detectado</h3>
            <Button onClick={() => {
               if (scanResult.tipo === 'especimen') navigate(`/especimen/${scanResult.especimen.uid}`)
               else if (scanResult.tipo === 'contenedor') navigate(`/contenedores?c=${scanResult.contenedor.contenedor_uid}`)
               else navigate('/reactivos')
            }}>Ver Ficha</Button>
            {scanResult.tipo === 'contenedor' && (
               <Button variant="secondary" onClick={() => setShowBulkEvo(true)} style={{ marginTop: '0.5rem' }}>
                 📸 Foto Grupal
               </Button>
            )}
            <Button variant="ghost" onClick={reset} style={{ marginTop: '0.5rem' }}>Escanear Otro</Button>
          </div>
        </Card>
      )}

      {error && (
        <Card title="Error">
          <p className="text-danger">{error}</p>
          <Button onClick={reset}>Reintentar</Button>
        </Card>
      )}
    </div>
  )
}
