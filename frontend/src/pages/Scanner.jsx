import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import Layout from '../components/ui/Layout'
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
      const result = await api.get(\`/scan/\${encodeURIComponent(qrText)}\`)
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
    setScanResult(null)
    setError('')
    setScanning(true)
    setLastScan('')
    setShowBulkEvo(false)
    setShowReactivoForm(false)
  }

  const isUnknownUid = error && (error.toLowerCase().includes('no encontrado') || error.toLowerCase().includes('no reconocido')) && lastScan?.startsWith('UID:')
  const uidClean = isUnknownUid ? lastScan.substring(4) : ''

  const isUnknownReactivo = error && (error.toLowerCase().includes('no encontrado') || error.toLowerCase().includes('no reconocido')) && !lastScan?.startsWith('UID:') && !lastScan?.startsWith('CONT-') && !lastScan?.startsWith('SUST-') && !lastScan?.startsWith('REAC-')

  if (showBulkEvo) {
    return (
      <Layout title="Registro Grupal" showBack>
        <Card>
          <RegistroEvolucionForm
            contenedorUid={scanResult.contenedor.contenedor_uid}
            onSaved={() => {
              alert("Registro grupal completado con éxito.")
              reset()
            }}
            onCancel={() => setShowBulkEvo(false)}
          />
        </Card>
      </Layout>
    )
  }

  if (showReactivoForm) {
    return (
       <Layout title="Registrar Reactivo" showBack>
         <ReactivoForm
            initialCode={lastScan}
            onSaved={() => navigate('/reactivos')}
            onCancel={reset}
         />
       </Layout>
    )
  }

  return (
    <Layout title="Escanear Código">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>

        {scanning && !loading && !error && (
          <div style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--theme-primary)' }}>
            <QRScanner
              onResult={handleResult}
              onError={(msg) => { setError(msg); setScanning(false) }}
            />
          </div>
        )}

        {loading && (
          <Card style={{ textAlign: 'center', padding: '3rem' }}>
            <p className="text-primary" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>🔍 Identificando...</p>
          </Card>
        )}

        {scanResult && (
          <Card title="Resultado del Escaneo" subtitle={scanResult.tipo.toUpperCase()} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
              {scanResult.tipo === 'especimen' && '🌿'}
              {scanResult.tipo === 'elemento' && '🔧'}
              {scanResult.tipo === 'lote' && '📦'}
              {scanResult.tipo === 'reactivo' && '🧪'}
              {scanResult.tipo === 'sustrato' && '🪨'}
              {scanResult.tipo === 'contenedor' && '🗃️'}
            </div>

            <div style={{ padding: '1rem', background: 'var(--theme-background)', borderRadius: '8px', width: '100%', marginBottom: '1.5rem', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 0.5rem' }}>
                {scanResult.tipo === 'especimen' && scanResult.especimen.especie}
                {scanResult.tipo === 'elemento' && scanResult.elemento.descripcion}
                {scanResult.tipo === 'lote' && scanResult.lote.formulacion.nombre}
                {scanResult.tipo === 'reactivo' && scanResult.reactivo.nombre}
                {scanResult.tipo === 'sustrato' && scanResult.sustrato.nombre}
                {scanResult.tipo === 'contenedor' && \`Contenedor: \${scanResult.contenedor.contenedor_uid}\`}
              </h3>
              <p className="font-mono text-muted" style={{ fontSize: '0.85rem', margin: 0 }}>
                {scanResult.tipo === 'especimen' ? scanResult.especimen.uid :
                 scanResult.tipo === 'elemento' ? scanResult.elemento.element_id :
                 scanResult.tipo === 'lote' ? scanResult.lote.uid :
                 scanResult.tipo === 'reactivo' ? \`STOCK-\${scanResult.reactivo.id.substring(0,8)}\` :
                 scanResult.tipo === 'sustrato' ? \`SUST-\${scanResult.sustrato.codigo_formulacion}\` :
                 scanResult.contenedor.contenedor_uid}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%' }}>
               <Button onClick={() => {
                 if (scanResult.tipo === 'especimen') navigate(\`/especimen/\${scanResult.especimen.uid}\`)
                 else if (scanResult.tipo === 'elemento') navigate(\`/elemento/\${scanResult.elemento.element_id || scanResult.elemento.id}\`)
                 else if (scanResult.tipo === 'lote') navigate('/reactivos')
                 else if (scanResult.tipo === 'reactivo') navigate('/reactivos')
                 else if (scanResult.tipo === 'sustrato') navigate('/lab')
                 else if (scanResult.tipo === 'contenedor') navigate(\`/contenedores?c=\${scanResult.contenedor.contenedor_uid}\`)
               }}>Ver Ficha / Inventario</Button>

               {scanResult.tipo === 'especimen' && (
                 <>
                   <Button variant="secondary" onClick={() => navigate(\`/especimen/\${scanResult.especimen.uid}?quick=foto\`)}>
                     📸 Añadir Foto / Evolución
                   </Button>
                   <div style={{ display: 'flex', gap: '0.5rem' }}>
                     <Button variant="ghost" style={{ flex: 1 }} onClick={() => navigate(\`/nuevo-individuo?madre=\${scanResult.especimen.id}&especie=\${scanResult.especimen.especie_id}\`)}>
                       🌱 Nuevo Explante
                     </Button>
                     <Button variant="ghost" style={{ flex: 1, fontSize: '0.8rem' }} onClick={() => navigate(\`/nuevo-lote?madre=\${scanResult.especimen.id}&especie=\${scanResult.especimen.especie_id}\`)}>
                       🧬 Clonación Masiva
                     </Button>
                   </div>
                 </>
               )}

               {scanResult.tipo === 'contenedor' && (
                 <Button variant="secondary" onClick={() => setShowBulkEvo(true)}>
                   📸 Foto Grupal (Todo el Frasco)
                 </Button>
               )}

               <Button variant="ghost" onClick={reset}>Escanear Otro</Button>
            </div>
          </Card>
        )}

        {error && (
          <Card title="Error" style={{ textAlign: 'center' }}>
            <p className="text-danger" style={{ marginBottom: '1.5rem' }}>{error}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {isUnknownUid && (
                <Button variant="secondary" onClick={() => navigate(\`/nuevo-individuo?uid=\${encodeURIComponent(uidClean)}\`)}>
                  Registrar este espécimen
                </Button>
              )}

              {isUnknownReactivo && (
                <Button variant="secondary" onClick={() => setShowReactivoForm(true)}>
                  Registrar en Inventario
                </Button>
              )}

              <Button onClick={reset}>Reintentar Escaneo</Button>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  )
}
