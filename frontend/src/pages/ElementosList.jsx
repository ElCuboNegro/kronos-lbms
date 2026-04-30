import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import QRScanner from '../components/QRScanner'

export default function ElementosList() {
  const navigate = useNavigate()
  const [elementos, setElementos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const fetchElementos = () => {
    setLoading(true)
    api.get('/elementos')
      .then(setElementos)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchElementos()
  }, [])

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 }}>
        <h2 className="text-primary" style={{ margin: 0, fontSize: '1.4rem' }}>Inventario de Elementos</h2>
        <button className="btn btn--primary" onClick={() => setShowForm(true)}>+ Elemento</button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--bio-text-muted)', fontSize: '0.9rem', margin: 0 }}>Cargando…</p>
      ) : elementos.length === 0 ? (
        <p style={{ color: 'var(--bio-text-muted)', fontSize: '0.9rem', margin: 0 }}>No hay elementos registrados en el inventario.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {elementos.map(el => (
            <div key={el.id} className="card" style={{ padding: '1rem', cursor: 'pointer', margin: 0 }} onClick={() => navigate(`/elemento/${el.id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-primary" style={{ fontWeight: 600, fontSize: '0.95rem' }}>{el.descripcion}</span>
                <span className="badge badge--outline font-mono">{el.element_id}</span>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 4, color: 'var(--bio-text-muted)', fontSize: '0.78rem', flexWrap: 'wrap' }}>
                <span style={{ textTransform: 'capitalize' }}>{el.tipo}</span>
                {el.cantidad && <span>{el.cantidad} {el.unidad || ''}</span>}
                <span className={`badge ${el.estado === 'activo' ? 'badge--success' : el.estado === 'roto' ? 'badge--danger' : 'badge--outline'}`}>
                  {el.estado}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <ElementoForm 
          onSaved={() => { setShowForm(false); fetchElementos(); }} 
          onCancel={() => setShowForm(false)} 
        />
      )}
    </div>
  )
}

function ElementoForm({ onSaved, onCancel }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    element_id: '',
    tipo: 'equipo',
    descripcion: '',
    cantidad: '',
    unidad: '',
    estado: 'activo',
    notas: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showScanner, setShowScanner] = useState(false)
  const [existingElement, setExistingElement] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleScan = async (scannedCode) => {
    setShowScanner(false)
    const code = scannedCode.replace('ID:', '') // Limpiar prefijo si existe
    set('element_id', code)
    
    // Verificar si ya existe en la base de datos
    try {
      setLoading(true)
      const res = await api.get(`/scan/${code}`)
      if (res.tipo === 'elemento') {
        setExistingElement(res.elemento)
      } else {
        setExistingElement(null)
      }
    } catch (e) {
      // Ignorar 404, significa que es nuevo
      setExistingElement(null)
    } finally {
      setLoading(false)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/elementos', {
        ...form,
        cantidad: form.cantidad ? parseFloat(form.cantidad) : null
      })
      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (showScanner) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: '#000' }}>
        <QRScanner onScan={handleScan} />
        <button 
          className="btn btn--secondary" 
          style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 2010 }}
          onClick={() => setShowScanner(false)}
        >
          Cancelar Escaneo
        </button>
      </div>
    )
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{ background: 'var(--bio-surface)', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: '500px', padding: '1.5rem', paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))', maxHeight: '90dvh', overflowY: 'auto' }}>
        <h3 className="text-primary" style={{ margin: '0 0 1rem', fontSize: '1.2rem' }}>Registrar Nuevo Elemento</h3>
        
        {existingElement ? (
          <div className="card" style={{ background: 'rgba(125, 202, 143, 0.1)', border: '1px solid var(--bio-primary)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <p className="text-primary" style={{ margin: 0, fontWeight: 'bold' }}>¡Este elemento ya existe en el sistema!</p>
            <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>
              El código <strong>{existingElement.element_id}</strong> corresponde a <strong>{existingElement.descripcion}</strong>.
            </p>
            <button 
              className="btn btn--primary btn--block" 
              onClick={() => navigate(`/elemento/${existingElement.id}`)}
            >
              Ir a su Ficha para actualizar stock
            </button>
            <button 
              className="btn btn--ghost btn--block" 
              onClick={() => { setExistingElement(null); set('element_id', '') }}
            >
              Escanear / Ingresar otro código
            </button>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Identificador (ID / Código / EAN)</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input style={{ flex: 1 }} value={form.element_id} onChange={e => set('element_id', e.target.value)} placeholder="Ej: 84213... o MIC-001" required />
                <button type="button" className="btn btn--secondary" style={{ padding: '0 1rem', fontSize: '1.2rem' }} onClick={() => setShowScanner(true)} title="Escanear Código de Barras">
                  📷
                </button>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Descripción / Nombre</label>
              <input value={form.descripcion} onChange={e => set('descripcion', e.target.value)} placeholder="Ej: Agar Bacteriológico 500g" required />
            </div>

            <div className="grid-2">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Tipo</label>
                <select value={form.tipo} onChange={e => set('tipo', e.target.value)}>
                  <option value="equipo">Equipo (Microscopio, etc)</option>
                  <option value="sensor">Sensor / IoT</option>
                  <option value="herramienta">Herramienta</option>
                  <option value="insumo_general">Insumo General</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Estado</label>
                <select value={form.estado} onChange={e => set('estado', e.target.value)}>
                  <option value="activo">Activo / Operativo</option>
                  <option value="mantenimiento">En Mantenimiento</option>
                  <option value="roto">Roto / Fuera de servicio</option>
                  <option value="agotado">Agotado</option>
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Cantidad (Opcional)</label>
                <input type="number" step="any" value={form.cantidad} onChange={e => set('cantidad', e.target.value)} placeholder="Ej: 1" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Unidad (Opcional)</label>
                <input value={form.unidad} onChange={e => set('unidad', e.target.value)} placeholder="Ej: u, ml, g" />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Notas</label>
              <textarea style={{ minHeight: '60px', resize: 'vertical' }} value={form.notas} onChange={e => set('notas', e.target.value)} placeholder="Detalles, marca, modelo, ubicación..." />
            </div>

            {error && <p className="text-danger" style={{ fontSize: '0.85rem', margin: 0 }}>{error}</p>}
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="button" className="btn btn--ghost" style={{ flex: 1 }} onClick={onCancel}>Cancelar</button>
              <button type="submit" className="btn btn--primary" style={{ flex: 2 }} disabled={loading}>{loading ? 'Guardando…' : 'Registrar'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
