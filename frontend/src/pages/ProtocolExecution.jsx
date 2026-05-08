import { useState, useEffect, useRef, useReducer } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useTimers } from '../contexts/TimerContext'

// Protocol Execution Reducer (Simplified State Machine)
const protocolReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_SUCCESS':
      return { ...state, protocol: action.payload, currentStep: 1, loading: false }
    case 'NEXT_STEP':
      return { ...state, currentStep: state.currentStep + 1 }
    case 'PREV_STEP':
      return { ...state, currentStep: Math.max(1, state.currentStep - 1) }
    case 'SET_STEP':
      return { ...state, currentStep: action.payload }
    case 'COMPLETE':
      return { ...state, isFinished: true }
    default:
      return state
  }
}

export default function ProtocolExecution() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [state, dispatch] = useReducer(protocolReducer, {
    protocol: null,
    currentStep: 1,
    loading: true,
    isFinished: false
  })

  const { protocol, currentStep, loading, isFinished } = state

  useEffect(() => {
    api.get(`/protocolos/${id}`)
      .then(p => {
        dispatch({ type: 'LOAD_SUCCESS', payload: p })
        if (id && id.length > 20 && p.codigo) {
           navigate(`/protocolos/${p.codigo}/ejecutar`, { replace: true })
        }
      })
      .catch(e => alert(e.message))
  }, [id, navigate])

  if (loading) return <p className="text-center text-muted" style={{ padding: '2rem' }}>Cargando protocolo...</p>
  if (!protocol) return <p className="text-center text-danger" style={{ padding: '2rem' }}>Protocolo no encontrado</p>

  const steps = (protocol.pasos || []).sort((a,b) => a.orden - b.orden)
  const activePaso = steps.find(s => s.orden === currentStep) || steps[steps.length - 1]

  return (
    <div className="page-container" style={{ paddingBottom: '2rem' }}>
      <div className="page-header">
        <div>
          <span className="badge badge--info" style={{ marginBottom: '0.5rem' }}>EJECUCIÓN GUIADA</span>
          <h2 className="page-title text-primary">{protocol.nombre}</h2>
        </div>
        <div className="text-muted" style={{ fontSize: '0.9rem' }}>
          Paso {currentStep} de {steps.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ background: 'var(--theme-border)', height: '4px', borderRadius: '2px', marginBottom: '2rem', overflow: 'hidden' }}>
        <div style={{
          background: 'var(--theme-secondary)',
          height: '100%',
          width: `${(currentStep / steps.length) * 100}%`,
          transition: 'width 0.3s ease'
        }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <PasoCard
          paso={activePaso}
          protocoloId={protocol.id}
          isActive={true}
          onComplete={() => {
            if (currentStep < steps.length) dispatch({ type: 'NEXT_STEP' })
            else dispatch({ type: 'COMPLETE' })
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '1rem' }}>
          <button
            className="btn btn--ghost"
            disabled={currentStep === 1}
            onClick={() => dispatch({ type: 'PREV_STEP' })}
          > Anterior </button>

          {isFinished ? (
            <button className="btn btn--secondary" onClick={() => navigate('/protocolos')}>
              Finalizar y Salir
            </button>
          ) : (
            <button
              className="btn btn--primary"
              onClick={() => dispatch({ type: 'NEXT_STEP' })}
              disabled={currentStep === steps.length}
            > Siguiente Paso </button>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: '3rem', opacity: 0.7 }}>
        <h3 className="text-secondary" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Resumen de Materiales</h3>
        <ul style={{ paddingLeft: '1.2rem', margin: '0.5rem 0 0' }}>
          {(protocol.materiales || []).map((m, i) => (
            <li key={i} className="text-muted" style={{ fontSize: '0.85rem' }}>
              {m.nombre} {m.cantidad && <span>({m.cantidad} {m.unidad})</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function PasoCard({ paso, protocoloId, isActive, onComplete }) {
  const { timers, startTimer, pauseTimer, resetTimer, playBeep } = useTimers()
  const timerId = `proto_${protocoloId}_paso_${paso.orden}`
  const timerData = timers[timerId]

  const [timeLeft, setTimeLeft] = useState(null)
  const [isFinished, setIsFinished] = useState(false)
  const hasRung = useRef(false)

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
    <div className="card" style={{
      borderLeft: isActive ? '4px solid var(--theme-primary)' : '4px solid var(--theme-border)',
      transform: isActive ? 'scale(1.02)' : 'scale(1)',
      transition: 'all 0.2s ease'
    }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div style={{
          background: isActive ? 'var(--theme-primary)' : 'var(--theme-background)',
          color: isActive ? 'white' : 'var(--theme-text-muted)',
          width: '40px', height: '40px', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 'bold', border: '1px solid var(--theme-border)'
        }}>
          {paso.orden}
        </div>
        <div style={{ flex: 1 }}>
          <p className="text-text" style={{ fontSize: '1.2rem', fontWeight: 500, margin: '0 0 0.5rem' }}>{paso.instruccion}</p>
          {paso.notas && <p className="text-muted" style={{ fontSize: '0.9rem', fontStyle: 'italic', margin: '0 0 1.5rem' }}>{paso.notas}</p>}

          {paso.tiempo_minutos > 0 && (
            <div style={{ background: 'var(--theme-background)', borderRadius: 'var(--radius-base)', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: isRunning ? '2px solid var(--theme-primary)' : '1px solid var(--theme-border)' }}>
              <div style={{ fontSize: '3.5rem', fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: isFinished ? 'var(--theme-secondary)' : 'var(--theme-text)' }}>
                {formatTime(timeLeft)}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {!timerData ? (
                  <button className="btn btn--primary btn--lg" onClick={() => startTimer(timerId, paso.tiempo_minutos)}>Iniciar Timer</button>
                ) : isFinished ? (
                  <button className="btn btn--secondary btn--lg" onClick={onComplete}>Paso Completado</button>
                ) : isRunning ? (
                  <button className="btn btn--accent" onClick={() => pauseTimer(timerId, timeLeft)}>Pausar</button>
                ) : (
                  <button className="btn btn--primary" onClick={() => startTimer(timerId, paso.tiempo_minutos)}>Continuar</button>
                )}
              </div>
            </div>
          )}

          {paso.tiempo_minutos <= 0 && isActive && (
             <button className="btn btn--secondary btn--block" style={{ marginTop: '1rem' }} onClick={onComplete}>Marcar como Completado</button>
          )}
        </div>
      </div>
    </div>
  )
}
