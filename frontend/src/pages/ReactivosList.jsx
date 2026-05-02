import { useState, useEffect } from 'react'
import { api } from '../api/client'

const PELIGROS = [
  { id: 'inflamable', label: '🔥 Inflamable' },
  { id: 'corrosivo', label: '🧪 Corrosivo' },
  { id: 'toxico', label: '💀 Tóxico' },
  { id: 'irritante', label: '⚠️ Irritante' },
  { id: 'oxidante', label: '💥 Oxidante' },
]

function PrintReactivoBtn({ id }) {
  const [printing, setPrinting] = useState(false)

  const handlePrint = async (e) => {
    e.stopPropagation()
    setPrinting(true)
    try {
      await api.post(`/printer/imprimir-reactivo/${id}`)
    } catch (err) {
      alert(err.message)
    } finally {
      setPrinting(false)
    }
  }

  return (
    <button 
      className="btn btn--ghost" 
      style={{ padding: '0.2rem 0.4rem', fontSize: '0.8rem', minHeight: '32px' }} 
      onClick={handlePrint} 
      disabled={printing}
      title="Imprimir Etiqueta"
    >
      {printing ? '…' : '🖨'}
    </button>
  )
}

export default function ReactivosList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingReactivo, setEditingReactivo] = useState(null)

  const fetchItems = async () => {
    setLoading(true)
    try { setItems(await api.get('/reactivos')) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchItems() }, [])

  const handleEdit = (reactivo) => {
    setEditingReactivo(reactivo)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingReactivo(null)
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">Inventario de Reactivos</h2>
        <button className="btn btn--primary" style={{ borderRadius: '50%', width: 40, height: 40, padding: 0 }} onClick={() => setShowForm(true)}>+</button>
      </div>

      {loading ? <p className="text-muted text-center" style={{ padding: '2rem' }}>Cargando…</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {items.length === 0 ? <p className="text-muted text-center" style={{ padding: '2rem' }}>No hay reactivos registrados</p> : (
            items.map(r => (
              <div key={r.id} className="tile" onClick={() => handleEdit(r)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--theme-text)', fontWeight: 600, fontSize: '1.1rem' }}>{r.nombre}</span>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className="font-mono text-primary" style={{ fontSize: '0.9rem' }}>{r.formula_quimica}</span>
                    <PrintReactivoBtn id={r.id} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', color: 'var(--theme-text-muted)', fontSize: '0.8rem' }}>
                  <span>Marca: {r.marca || '—'}</span>
                  <span>Pureza: {r.pureza_pct ? `${r.pureza_pct}%` : '—'}</span>
                  {r.concentracion_gl && <span>Conc: {r.concentracion_gl}</span>}
                </div>
                {r.peligrosidad?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.8rem' }}>
                    {r.peligrosidad.map(p => (
                      <span key={p} className="badge badge--danger" style={{ fontSize: '0.65rem' }}>{PELIGROS.find(x => x.id === p)?.label || p}</span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {showForm && (
        <ReactivoForm 
          reactivo={editingReactivo}
          onSaved={() => { handleCloseForm(); fetchItems() }}
          onCancel={handleCloseForm}
        />
      )}
    </div>
  )
}

export function ReactivoForm({ onSaved, onCancel }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ 
    codigo_barras: "",
    nombre: "", 
    formula_quimica: "", 
    marca: "", 
    pureza_pct: "", 
    concentracion_gl: "",
    fecha_expiracion: "",
    unidad_medida: "g", 
    peligrosidad: [], 
    notas: "" 
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showScanner, setShowScanner] = useState(false)
  const [existingElement, setExistingElement] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  
  const togglePeligro = (id) => {
    set("peligrosidad", form.peligrosidad.includes(id) 
      ? form.peligrosidad.filter(x => x !== id)
      : [...form.peligrosidad, id]
    )
  }

  const handleScan = async (scannedCode) => {
    setShowScanner(false)
    set("codigo_barras", scannedCode)
    
    try {
      setLoading(true)
      const res = await api.get(`/scan/${encodeURIComponent(scannedCode)}`)
      if (res.tipo === "reactivo") {
        setExistingElement(res.reactivo)
      } else {
        setExistingElement(null)
      }
    } catch (e) {
      setExistingElement(null)
    } finally {
      setLoading(false)
    }
  }

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { ...form, 
        codigo_barras: form.codigo_barras || undefined,
        pureza_pct: form.pureza_pct ? parseFloat(form.pureza_pct) : undefined,
        concentracion_gl: form.concentracion_gl ? parseFloat(form.concentracion_gl) : undefined,
        fecha_expiracion: form.fecha_expiracion || undefined
      }
      const nuevo = await api.post("/reactivos", payload)
      onSaved(nuevo)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  if (showScanner) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "#000" }}>
        <QRScanner onResult={handleScan} />
        <button 
          className="btn btn--secondary" 
          style={{ position: "absolute", bottom: "2rem", left: "50%", transform: "translateX(-50%)", zIndex: 2010 }}
          onClick={() => setShowScanner(false)}
        >
          Cancelar Escaneo
        </button>
      </div>
    )
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "flex-end", zIndex: 1000 }}>
      <div style={{ background: "var(--bio-surface)", borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 500, padding: "1.5rem", maxHeight: "90dvh", overflowY: "auto" }}>
        <h3 className="page-title text-primary" style={{ margin: "0 0 1rem" }}>Nuevo Reactivo / Medio Stock</h3>
        
        {existingElement ? (
          <div className="card" style={{ background: "rgba(125, 202, 143, 0.1)", border: "1px solid var(--bio-primary)", textAlign: "center", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            <p className="text-primary" style={{ margin: 0, fontWeight: "bold" }}>¡Este químico ya está en catálogo!</p>
            <p className="text-muted" style={{ margin: 0, fontSize: "0.9rem" }}>
              El código de barras <strong className="font-mono text-primary">{existingElement.codigo_barras}</strong> corresponde a <strong>{existingElement.nombre}</strong>.
            </p>
            <button 
              className="btn btn--ghost btn--block" 
              onClick={() => { setExistingElement(null); set("codigo_barras", "") }}
            >
              Escanear otro envase
            </button>
            <button 
              className="btn btn--secondary btn--block" 
              onClick={onCancel}
            >
              Cerrar y volver al inventario
            </button>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Código de Barras / EAN del Fabricante</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input style={{ flex: 1 }} value={form.codigo_barras} onChange={e => set("codigo_barras", e.target.value)} placeholder="Opcional. Ej: 8421..." />
                <button type="button" className="btn btn--secondary" style={{ padding: "0 1rem", fontSize: "1.2rem" }} onClick={() => setShowScanner(true)} title="Escanear Envase">
                  📷
                </button>
              </div>
            </div>

            <Field label="Nombre del reactivo *" value={form.nombre} onChange={v => set("nombre", v)} required />
            
            <div className="grid-2">
              <Field label="Fórmula Química" value={form.formula_quimica} onChange={v => set("formula_quimica", v)} />
              <Field label="Marca" value={form.marca} onChange={v => set("marca", v)} />
            </div>
            
            <div className="grid-2">
              <Field label="Pureza (%)" type="number" step="0.1" value={form.pureza_pct} onChange={v => set("pureza_pct", v)} />
              <Field label="Conc. (g/L o mg/mL)" type="number" step="any" value={form.concentracion_gl} onChange={v => set("concentracion_gl", v)} />
            </div>

            <div className="grid-2">
              <Field label="Fecha Vencimiento" type="date" value={form.fecha_expiracion} onChange={v => set("fecha_expiracion", v)} />
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Unidad Base</label>
                <select value={form.unidad_medida} onChange={e => set("unidad_medida", e.target.value)}>
                  <option value="g">Gramos (g)</option>
                  <option value="mg">Miligramos (mg)</option>
                  <option value="ml">Mililitros (ml)</option>
                  <option value="L">Litros (L)</option>
                  <option value="u">Unidades (u)</option>
                </select>
              </div>
            </div>
            
            <label className="text-secondary" style={{ fontSize: "0.78rem", fontWeight: 600, marginTop: "0.5rem" }}>Peligrosidad</label>
            <div className="grid-2">
              {PELIGROS.map(p => (
                <button key={p.id} type="button" 
                  onClick={() => togglePeligro(p.id)}
                  style={{ 
                    background: "var(--bio-background)", 
                    border: form.peligrosidad.includes(p.id) ? "1px solid var(--error)" : "1px solid var(--bio-border)", 
                    borderRadius: "var(--radius-base)", 
                    padding: "0.5rem", 
                    color: form.peligrosidad.includes(p.id) ? "var(--error)" : "var(--bio-secondary)", 
                    fontSize: "0.8rem", 
                    cursor: "pointer", 
                    textAlign: "left" 
                  }}>
                  {p.label}
                </button>
              ))}
            </div>

            <Field label="Notas" value={form.notas} onChange={v => set("notas", v)} textarea />
            
            {error && <p className="badge badge--danger" style={{ width: "100%", textAlign: "center" }}>{error}</p>}
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              <button type="button" className="btn btn--ghost btn--block" onClick={onCancel}>Cancelar</button>
              <button type="submit" className="btn btn--primary btn--block" disabled={loading}>Guardar</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, textarea, type="text", step, required }) {
  return (
    <div className="form-group" style={{ marginBottom: 0 }}>
      <label>{label}</label>
      {textarea
        ? <textarea style={{ minHeight: 60 }} value={value} onChange={e => onChange(e.target.value)} />
        : <input type={type} step={step} value={value} onChange={e => onChange(e.target.value)} required={required} />
      }
    </div>
  )
}

