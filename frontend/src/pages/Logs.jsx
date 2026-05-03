import { useState, useEffect } from 'react'
import { Telemetry } from '../utils/telemetry'
import { api } from '../api/client'

export default function Logs() {
  const [logs, setLogs] = useState([])
  const [sending, setSending] = useState(false)

  useEffect(() => {
    setLogs(Telemetry.getLogs())
  }, [])

  const handleClear = () => {
    if (confirm('¿Borrar historial de logs?')) {
      Telemetry.clearLogs()
      setLogs([])
    }
  }

  const sendToServer = async () => {
    try {
      setSending(true)
      await api.post('/app/telemetry', { logs })
      alert('Logs enviados exitosamente al servidor para análisis.')
      Telemetry.clearLogs()
      setLogs([])
    } catch (e) {
      alert('Error enviando logs al servidor: ' + e.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 }}>
        <h2 className="page-title text-primary" style={{ margin: 0 }}>Telemetría Local</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn--secondary" onClick={sendToServer} disabled={logs.length === 0 || sending}>
            {sending ? 'Enviando...' : 'Enviar al Servidor'}
          </button>
          <button className="btn btn--danger" onClick={handleClear} disabled={logs.length === 0 || sending}>Borrar</button>
        </div>
      </div>

      <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>Historial de crashes y errores del navegador no capturados (Local).</p>

      {logs.length === 0 ? (
        <p className="text-muted text-center" style={{ padding: '2rem' }}>No hay logs registrados en este dispositivo.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {logs.map((l, i) => (
            <div key={i} style={{ background: 'var(--theme-background)', border: '1px solid var(--theme-border)', borderRadius: 8, padding: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className="badge badge--danger" style={{ fontSize: '0.7rem' }}>{l.level}</span>
                <span className="text-muted font-mono" style={{ fontSize: '0.7rem' }}>{new Date(l.timestamp).toLocaleString()}</span>
              </div>
              <p style={{ color: 'var(--error)', margin: '0 0 0.5rem 0', fontWeight: 'bold', fontSize: '0.9rem', wordBreak: 'break-word' }}>{l.message}</p>
              {l.details && (
                <pre style={{ background: 'var(--theme-surface)', padding: '0.5rem', borderRadius: 4, overflowX: 'auto', fontSize: '0.7rem', color: 'var(--theme-text-muted)', margin: 0, border: '1px solid var(--theme-border)' }}>
                  {l.details}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
