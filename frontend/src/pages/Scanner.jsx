import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import Layout from '../components/ui/Layout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import RegistroEvolucionForm from '../components/RegistroEvolucionForm'

export default function Scanner() {
  const navigate = useNavigate()
  const [uid, setUid] = useState('')
  const [scanResult, setScanResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showBulkEvo, setShowBulkEvo] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus()
  }, [])

  const handleScan = async (e) => {
    e.preventDefault()
    if (!uid) return
    setLoading(true)
    try {
      const res = await api.get(`/scan/${uid}`)
      setScanResult(res)
    } catch (e) {
      alert("Error al escanear: " + e.message)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setUid('')
    setScanResult(null)
    setShowBulkEvo(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

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

  return (
    <Layout title="Escanear Código">
      {!scanResult ? (
        <Card title="Esperando Código" subtitle="Escanee un QR o ingrese un UID manual">
          <form onSubmit={handleScan} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              ref={inputRef}
              type="text"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              placeholder="UID:XXXX-XXXX"
              style={{ padding: '1rem', fontSize: '1.2rem', textAlign: 'center', borderRadius: '8px', border: '2px solid var(--theme-border)' }}
            />
            <Button type="submit" disabled={loading}>
              {loading ? 'Buscando...' : '🔎 Resolver Código'}
            </Button>
          </form>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Card title="Resultado del Escaneo" subtitle={scanResult.tipo.toUpperCase()}>
            <div style={{ padding: '1rem', background: 'var(--theme-background)', borderRadius: '8px', marginBottom: '1rem' }}>
              {scanResult.tipo === 'especimen' && (
                <p><strong>Espécimen:</strong> {scanResult.especimen.uid} ({scanResult.especimen.especie})</p>
              )}
              {scanResult.tipo === 'contenedor' && (
                <p><strong>Contenedor:</strong> {scanResult.contenedor.contenedor_uid} ({scanResult.contenedor.especimenes.length} especímenes)</p>
              )}
              {scanResult.tipo === 'lote' && (
                <p><strong>Lote:</strong> {scanResult.lote.uid} ({scanResult.lote.formulacion.nombre})</p>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
               <Button onClick={() => {
                 if (scanResult.tipo === 'especimen') navigate(`/especimen/${scanResult.especimen.uid}`)
                 else if (scanResult.tipo === 'contenedor') navigate(`/contenedores?c=${scanResult.contenedor.contenedor_uid}`)
                 else if (scanResult.tipo === 'lote') navigate('/reactivos')
               }}>Ver Ficha Completa</Button>

               {scanResult.tipo === 'contenedor' && (
                 <Button variant="secondary" onClick={() => setShowBulkEvo(true)}>
                   📸 Foto Grupal (Todo el Frasco)
                 </Button>
               )}

               <Button variant="ghost" onClick={reset}>Escanear Otro</Button>
            </div>
          </Card>
        </div>
      )}
    </Layout>
  )
}
