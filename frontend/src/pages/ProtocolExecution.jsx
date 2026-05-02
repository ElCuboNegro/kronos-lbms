import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useTimers } from '../contexts/TimerContext'

export default function ProtocolExecution() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [protocol, setProtocol] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/protocolos/${id}`)
      .then(setProtocol)
      .catch(e => alert(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <p className="text-center text-muted" style={{ padding: '2rem' }}>Cargando protocolo...</p>
  if (!protocol) return <p className="text-center text-danger" style={{ padding: '2rem' }}>Protocolo no encontrado</p>

  return (
    <div className="page-container" style={{ paddingBottom: '2rem' }}>
      <div className="page-header">
        <div>
          <span className="badge badge--info" style={{ marginBottom: '0.5rem' }}>MODO EJECUCIÓN</span>
          <h2 className="page-title text-primary">{protocol.nombre}</h2>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 className="text-secondary" style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 1 }}>Materiales Requeridos</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' }}>
          {(protocol.materiales || []).map((m, i) => (
            <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', background: 'var(--theme-surface)', padding: '0.8rem', borderRadius: 'var(--radius-base)', border: '1px solid var(--theme-border)' }}>
              <input type="checkbox" style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--theme-primary)' }} />
              <span className="text-primary" style={{ fontSize: '1rem', fontWeight: 600 }}>{m.nombre}</span>
              {m.cantidad && <span className="text-muted" style={{ fontSize: '0.9rem' }}>{m.cantidad} {m.unidad}</span>}
            </label>
          ))}
          {(!protocol.materiales || protocol.materiales.length === 0) && (
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>No hay materiales listados.</p>
          )}
        </div>
      </div>

      <h3 className="text-secondary" style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '1rem' }}>Pasos del Procedimiento</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {(protocol.pasos || []).sort((a,b) => a.orden - b.orden).map((paso, idx) => (
          <PasoCard key={idx} paso={paso} protocoloId={protocol.id} />
        ))}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <button className="btn btn--secondary btn--block" onClick={() => {
          if (window.history.state && window.history.state.idx > 0) navigate(-1)
          else navigate('/protocolos', { replace: true })
        }}>Finalizar Ejecución</button>
      </div>
    </div>
  )
}

function PasoCard({ paso, protocoloId }) {
  const { timers, startTimer, pauseTimer, resetTimer, playBeep } = useTimers()
  const timerId = `proto_${protocoloId}_paso_${paso.orden}`
  const timerData = timers[timerId]

  const [timeLeft, setTimeLeft] = useState(null)
  const [isFinished, setIsFinished] = useState(false)
  const hasRung = useRef(false)

  // Timer loop
  useEffect(() => {
    if (!timerData) {
      setTimeLeft(paso.tiempo_minutos ? paso.tiempo_minutos * 60000 : null)
      setIsFinished(false)
      hasRung.current = false
      return
    }

    if (timerData.pausedLeft) {
      setTimeLeft(timerData.pausedLeft)
      return
    }

    if (timerData.endTime) {
      const interval = setInterval(() => {
        const remaining = timerData.endTime - Date.now()
        if (remaining <= 0) {
          setTimeLeft(0)
          setIsFinished(true)
          if (!hasRung.current) {
            hasRung.current = true
            playBeep()
          }
          clearInterval(interval)
        } else {
          setTimeLeft(remaining)
        }
      }, 100)
      return () => clearInterval(interval)
    }
  }, [timerData, paso.tiempo_minutos, playBeep])

  const formatTime = (ms) => {
    if (ms == null) return "00:00"
    const totalSecs = Math.ceil(ms / 1000)
    const m = Math.floor(totalSecs / 60)
    const s = totalSecs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const isRunning = timerData && timerData.endTime && !timerData.pausedLeft

  return (
    <div className="card" style={{ borderLeft: isFinished ? '4px solid var(--theme-secondary)' : '4px solid var(--theme-border)' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div style={{ background: 'var(--theme-background)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--theme-primary)', fontWeight: 'bold', border: '1px solid var(--theme-border)' }}>
          {paso.orden}
        </div>
        <div style={{ flex: 1 }}>
          <p className="text-text" style={{ fontSize: '1.05rem', margin: '0 0 0.5rem', lineHeight: 1.4 }}>{paso.instruccion}</p>
          {paso.notas && <p className="text-muted" style={{ fontSize: '0.85rem', fontStyle: 'italic', margin: '0 0 1rem' }}>{paso.notas}</p>}

          {paso.tiempo_minutos > 0 && (
            <div style={{ background: 'var(--theme-background)', borderRadius: 'var(--radius-base)', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: isRunning ? '1px solid var(--theme-primary)' : isFinished ? '1px solid transparent' : '1px solid var(--theme-border)' }}>
              <div style={{ fontSize: '3rem', fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: isFinished ? 'var(--theme-secondary)' : isRunning ? 'var(--theme-text)' : 'var(--theme-text-muted)' }}>
                {formatTime(timeLeft)}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {!timerData ? (
                  <button className="btn btn--primary" onClick={() => startTimer(timerId, paso.tiempo_minutos)}>Iniciar</button>
                ) : isFinished ? (
                  <button className="btn btn--ghost" onClick={() => resetTimer(timerId)}>Reiniciar</button>
                ) : isRunning ? (
                  <button className="btn btn--accent" onClick={() => pauseTimer(timerId, timeLeft)}>Pausar</button>
                ) : (
                  // Paused state
                  <>
                    <button className="btn btn--ghost" onClick={() => resetTimer(timerId)}>✖</button>
                    <button className="btn btn--primary" onClick={() => startTimer(timerId, paso.tiempo_minutos)}>Continuar</button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
