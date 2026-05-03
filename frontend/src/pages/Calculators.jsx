import { useState } from 'react'
import PeatPHProtocol from '../components/Characterization/PeatPHProtocol'

export default function Calculators() {
  const [tab, setTab] = useState('c1v1')

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '100%' }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <h2 className="page-title text-primary" style={{ margin: 0 }}>Micro-Herramientas</h2>
      </div>

      <div style={{ display: 'flex', overflowX: 'auto', gap: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--theme-border)' }}>
        <TabButton active={tab === 'c1v1'} onClick={() => setTab('c1v1')}>C1V1</TabButton>
        <TabButton active={tab === 'molaridad'} onClick={() => setTab('molaridad')}>Molaridad</TabButton>
        <TabButton active={tab === 'viabilidad'} onClick={() => setTab('viabilidad')}>Viabilidad Celular</TabButton>
        <TabButton active={tab === 'cfu'} onClick={() => setTab('cfu')}>Contador UFC</TabButton>
        <TabButton active={tab === 'caracterizacion'} onClick={() => setTab('caracterizacion')}>Caracterización</TabButton>
      </div>

      <div style={{ flex: 1 }}>
        {tab === 'c1v1' && <C1V1Calculator />}
        {tab === 'molaridad' && <MolarityCalculator />}
        {tab === 'viabilidad' && <CellViabilityCounter />}
        {tab === 'cfu' && <ColonyCounter />}
        {tab === 'caracterizacion' && <PeatPHProtocol />}
      </div>
    </div>
  )
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? 'var(--theme-primary)' : 'var(--theme-surface)',
        color: active ? 'var(--theme-text-inverse)' : 'var(--theme-text-muted)',
        border: '1px solid var(--theme-border)',
        borderRadius: 'var(--radius-button)',
        padding: '0.4rem 1rem',
        fontSize: '0.85rem',
        fontWeight: active ? 700 : 500,
        cursor: 'pointer',
        whiteSpace: 'nowrap'
      }}
    >
      {children}
    </button>
  )
}

function C1V1Calculator() {
  const [c1, setC1] = useState('')
  const [c2, setC2] = useState('')
  const [v2, setV2] = useState('')

  const c1Val = parseFloat(c1)
  const c2Val = parseFloat(c2)
  const v2Val = parseFloat(v2)

  let v1 = null
  let diluent = null
  if (c1Val > 0 && c2Val > 0 && v2Val > 0 && c1Val > c2Val) {
    v1 = (c2Val * v2Val) / c1Val
    diluent = v2Val - v1
  }

  return (
    <div className="card">
      <h3 className="text-secondary" style={{ margin: '0 0 1rem' }}>Dilución Seriada (C₁V₁ = C₂V₂)</h3>
      <div className="grid-2">
        <div className="form-group">
          <label>Concentración Inicial (C₁)</label>
          <input type="number" step="any" value={c1} onChange={e => setC1(e.target.value)} placeholder="Ej: 10" />
        </div>
        <div className="form-group">
          <label>Concentración Final (C₂)</label>
          <input type="number" step="any" value={c2} onChange={e => setC2(e.target.value)} placeholder="Ej: 1" />
        </div>
        <div className="form-group">
          <label>Volumen Final (V₂) ml</label>
          <input type="number" step="any" value={v2} onChange={e => setV2(e.target.value)} placeholder="Ej: 1000" />
        </div>
      </div>

      {v1 !== null ? (
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--theme-background)', borderRadius: 'var(--radius-base)', border: '1px solid var(--theme-primary)' }}>
          <p className="text-muted" style={{ margin: '0 0 0.5rem', fontSize: '0.85rem' }}>Resultados:</p>
          <p style={{ margin: '0 0 0.5rem', fontSize: '1.1rem' }}>Añadir <strong className="text-primary">{v1.toFixed(2)} ml</strong> de solución madre (C₁).</p>
          <p style={{ margin: '0', fontSize: '1.1rem' }}>Añadir <strong className="text-secondary">{diluent.toFixed(2)} ml</strong> de diluyente.</p>
        </div>
      ) : (
        <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '1rem' }}>Ingresa los 3 valores (asegurando que C₁ &gt; C₂).</p>
      )}
    </div>
  )
}

function MolarityCalculator() {
  const [mw, setMw] = useState('')
  const [vol, setVol] = useState('')
  const [conc, setConc] = useState('')

  const mwVal = parseFloat(mw)
  const volVal = parseFloat(vol) // in Liters
  const concVal = parseFloat(conc) // in Molar (mol/L)

  let mass = null
  if (mwVal > 0 && volVal > 0 && concVal > 0) {
    mass = mwVal * volVal * concVal
  }

  return (
    <div className="card">
      <h3 className="text-secondary" style={{ margin: '0 0 1rem' }}>Calculadora de Molaridad</h3>
      <div className="form-group">
        <label>Peso Molecular (g/mol)</label>
        <input type="number" step="any" value={mw} onChange={e => setMw(e.target.value)} placeholder="Ej: 58.44 (NaCl)" />
      </div>
      <div className="grid-2">
        <div className="form-group">
          <label>Volumen (Litros)</label>
          <input type="number" step="any" value={vol} onChange={e => setVol(e.target.value)} placeholder="Ej: 1" />
        </div>
        <div className="form-group">
          <label>Concentración (Molar)</label>
          <input type="number" step="any" value={conc} onChange={e => setConc(e.target.value)} placeholder="Ej: 0.5" />
        </div>
      </div>

      {mass !== null ? (
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--theme-background)', borderRadius: 'var(--radius-base)', border: '1px solid var(--theme-primary)' }}>
          <p className="text-muted" style={{ margin: '0 0 0.5rem', fontSize: '0.85rem' }}>Resultados:</p>
          <p style={{ margin: '0', fontSize: '1.1rem' }}>Pesar <strong className="text-primary">{mass.toFixed(4)} g</strong> del soluto.</p>
        </div>
      ) : (
        <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '1rem' }}>Ingresa todos los valores.</p>
      )}
    </div>
  )
}

function CellViabilityCounter() {
  const [live, setLive] = useState(0)
  const [dead, setDead] = useState(0)

  const total = live + dead
  const viability = total > 0 ? ((live / total) * 100).toFixed(1) : 0

  const handleTap = (type) => {
    if (navigator.vibrate) navigator.vibrate(50) // Haptic feedback
    if (type === 'live') setLive(l => l + 1)
    if (type === 'dead') setDead(d => d + 1)
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="text-secondary" style={{ margin: 0 }}>Viabilidad Celular (Live/Dead)</h3>
        <button className="btn btn--ghost" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => { setLive(0); setDead(0) }}>Reset</button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', height: '200px' }}>
        <button
          style={{ flex: 1, background: 'rgba(72, 187, 120, 0.1)', border: '2px solid var(--theme-secondary)', borderRadius: 'var(--radius-card)', color: 'var(--theme-primary)', fontSize: '2rem', fontWeight: 'bold', cursor: 'pointer', userSelect: 'none' }}
          onClick={() => handleTap('live')}
        >
          {live}
          <div style={{ fontSize: '0.9rem', color: 'var(--theme-secondary)', textTransform: 'uppercase', marginTop: '0.5rem' }}>Vivas (Tocar)</div>
        </button>
        <button
          style={{ flex: 1, background: 'rgba(255, 87, 34, 0.1)', border: '2px solid var(--error)', borderRadius: 'var(--radius-card)', color: 'var(--error)', fontSize: '2rem', fontWeight: 'bold', cursor: 'pointer', userSelect: 'none' }}
          onClick={() => handleTap('dead')}
        >
          {dead}
          <div style={{ fontSize: '0.9rem', color: 'var(--error)', textTransform: 'uppercase', marginTop: '0.5rem' }}>Muertas (Tocar)</div>
        </button>
      </div>

      <div style={{ background: 'var(--theme-background)', padding: '1rem', borderRadius: 'var(--radius-base)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p className="text-muted" style={{ margin: 0, fontSize: '0.8rem' }}>Total Contadas</p>
          <p className="text-primary" style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>{total}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p className="text-muted" style={{ margin: 0, fontSize: '0.8rem' }}>Viabilidad</p>
          <p className="text-primary" style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>{viability}%</p>
        </div>
      </div>
    </div>
  )
}

function ColonyCounter() {
  const [count, setCount] = useState(0)
  const [dilution, setDilution] = useState('-4')
  const [volume, setVolume] = useState('0.1')

  const volVal = parseFloat(volume)
  const dilVal = Math.pow(10, parseFloat(dilution))

  let cfu = null
  if (count > 0 && volVal > 0 && !isNaN(dilVal)) {
    cfu = count / (volVal * dilVal)
  }

  const handleTap = () => {
    if (navigator.vibrate) navigator.vibrate(40)
    setCount(c => c + 1)
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="text-secondary" style={{ margin: 0 }}>Contador UFC</h3>
        <button className="btn btn--ghost" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setCount(0)}>Reset</button>
      </div>

      <button
        style={{ width: '100%', height: '150px', background: 'rgba(2, 60, 105, 0.2)', border: '2px dashed var(--primary)', borderRadius: 'var(--radius-card)', color: 'var(--theme-text-inverse)', fontSize: '3rem', fontWeight: 'bold', cursor: 'pointer', userSelect: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
        onClick={handleTap}
      >
        {count}
        <span style={{ fontSize: '0.85rem', color: 'var(--theme-text-muted)', fontWeight: 'normal', marginTop: '0.5rem' }}>Tocar para contar colonia</span>
      </button>

      <div className="grid-2">
        <div className="form-group">
          <label>Factor Dilución (10^x)</label>
          <input type="number" value={dilution} onChange={e => setDilution(e.target.value)} placeholder="Ej: -4" />
        </div>
        <div className="form-group">
          <label>Volumen Plaqueado (ml)</label>
          <input type="number" step="0.1" value={volume} onChange={e => setVolume(e.target.value)} placeholder="Ej: 0.1" />
        </div>
      </div>

      {cfu !== null && (
        <div style={{ background: 'var(--theme-background)', padding: '1rem', borderRadius: 'var(--radius-base)', textAlign: 'center', border: '1px solid var(--secondary)' }}>
          <p className="text-muted" style={{ margin: '0 0 0.2rem', fontSize: '0.8rem', textTransform: 'uppercase' }}>Resultado de la muestra original</p>
          <p className="text-primary" style={{ margin: 0, fontSize: '1.4rem', fontWeight: 'bold' }}>{cfu.toExponential(2)} UFC/ml</p>
        </div>
      )}
    </div>
  )
}
