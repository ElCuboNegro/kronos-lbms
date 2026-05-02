import { useState, useEffect } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { api } from '../api/client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import wikiLinkPlugin from 'remark-wiki-link'

export default function ProtocoloEditor() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  
  const draft = location.state?.draft || null

  const [form, setForm] = useState({
    nombre: '',
    tipo: 'otro',
    version: '1.0',
    descripcion: '',
    materiales: [],
    pasos: []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    if (id) {
      // Editar existente
      api.get(`/protocolos/${id}`).then(data => {
        setForm({
          nombre: data.nombre,
          tipo: data.tipo,
          version: data.version,
          descripcion: data.descripcion || '',
          materiales: data.materiales || [],
          pasos: data.pasos || []
        })
      })
    } else if (draft) {
      // Nuevo desde AI draft
      setForm({
        nombre: draft.nombre || '',
        tipo: draft.tipo || 'otro',
        version: draft.version || '1.0',
        descripcion: draft.descripcion || '',
        materiales: draft.materiales || [],
        pasos: draft.pasos || []
      })
    }
  }, [id, draft])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handlePasoChange = (index, field, value) => {
    const nuevosPasos = [...form.pasos]
    nuevosPasos[index] = { ...nuevosPasos[index], [field]: value }
    set('pasos', nuevosPasos)
  }

  const handleMaterialChange = (index, field, value) => {
    const nuevosMats = [...form.materiales]
    nuevosMats[index] = { ...nuevosMats[index], [field]: value }
    set('materiales', nuevosMats)
  }

  const addPaso = () => {
    const orden = form.pasos.length > 0 ? Math.max(...form.pasos.map(p => p.orden)) + 1 : 1
    set('pasos', [...form.pasos, { orden, instruccion: '', tiempo_minutos: '', notas: '' }])
  }

  const addMaterial = () => {
    set('materiales', [...form.materiales, { nombre: '', cantidad: '', unidad: '', notas: '' }])
  }

  const removePaso = (index) => {
    set('pasos', form.pasos.filter((_, i) => i !== index))
  }

  const removeMaterial = (index) => {
    set('materiales', form.materiales.filter((_, i) => i !== index))
  }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = {
        ...form,
        pasos: form.pasos.map(p => ({
          ...p,
          orden: parseInt(p.orden) || 1,
          tiempo_minutos: p.tiempo_minutos ? parseInt(p.tiempo_minutos) : null
        })),
        materiales: form.materiales.map(m => ({
          ...m,
          cantidad: m.cantidad ? parseFloat(m.cantidad) : null
        }))
      }

      if (id) {
        await api.patch(`/protocolos/${id}`, payload)
      } else {
        await api.post('/protocolos', payload)
      }
      navigate('/protocolos')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const wikiOptions = { 
    pageResolver: (name) => [name.replace(/ /g, '_').toLowerCase()],
    hrefTemplate: (permalink) => `/#/wiki/${permalink}` // Simplificación para demo
  }

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 900 }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <h2 className="text-primary" style={{ margin: 0 }}>{id ? 'Editar Protocolo' : 'Nuevo Protocolo'}</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={`btn ${previewMode ? 'btn--primary' : 'btn--ghost'}`} onClick={() => setPreviewMode(!previewMode)}>
            {previewMode ? 'Ver Editor' : 'Vista Previa (Markdown)'}
          </button>
        </div>
      </div>

      {previewMode ? (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h1 className="text-primary" style={{ margin: 0 }}>{form.nombre || 'Sin título'}</h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span className="badge badge--outline">{form.tipo.replace('_', ' ')}</span>
            <span className="badge badge--outline font-mono">v{form.version}</span>
          </div>
          
          <div className="markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm, [wikiLinkPlugin, wikiOptions]]}>
              {form.descripcion || '*Sin descripción*'}
            </ReactMarkdown>
          </div>

          <h3 className="text-secondary" style={{ margin: '1rem 0 0' }}>Materiales</h3>
          <ul>
            {form.materiales.map((m, i) => (
              <li key={i}>
                <strong>{m.nombre}</strong> {m.cantidad && m.unidad ? `(${m.cantidad} ${m.unidad})` : ''} - 
                <span className="text-muted"> {m.notas}</span>
              </li>
            ))}
          </ul>

          <h3 className="text-secondary" style={{ margin: '1rem 0 0' }}>Pasos</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {form.pasos.sort((a,b) => a.orden - b.orden).map((p, i) => (
              <div key={i} style={{ padding: '1rem', background: 'var(--theme-background)', borderRadius: 'var(--radius-base)', borderLeft: '4px solid var(--theme-secondary)' }}>
                <h4 style={{ margin: '0 0 0.5rem' }}>Paso {p.orden} {p.tiempo_minutos ? `(⏱ ${p.tiempo_minutos} min)` : ''}</h4>
                <div className="markdown-body text-text" style={{ fontSize: '0.95rem' }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm, [wikiLinkPlugin, wikiOptions]]}>
                    {p.instruccion}
                  </ReactMarkdown>
                </div>
                {p.notas && <p className="text-muted" style={{ margin: '0.5rem 0 0', fontSize: '0.85rem' }}><em>Nota: {p.notas}</em></p>}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h3 className="text-secondary" style={{ margin: '0 0 1rem' }}>Metadatos</h3>
            <div className="form-group">
              <label>Nombre del Protocolo *</label>
              <input value={form.nombre} onChange={e => set('nombre', e.target.value)} required />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>Tipo</label>
                <select value={form.tipo} onChange={e => set('tipo', e.target.value)}>
                  <option value="extraccion_meristema">Extracción Meristema</option>
                  <option value="propagacion_in_vitro">Propagación in vitro</option>
                  <option value="desinfeccion">Desinfección</option>
                  <option value="subcultivo">Subcultivo</option>
                  <option value="enraizamiento">Enraizamiento</option>
                  <option value="aclimatacion">Aclimatación</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div className="form-group">
                <label>Versión</label>
                <input value={form.version} onChange={e => set('version', e.target.value)} placeholder="1.0" required />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Descripción (Markdown soportado, imágenes ![]() y Wikilinks [[]] )</label>
              <textarea 
                value={form.descripcion} 
                onChange={e => set('descripcion', e.target.value)} 
                rows={6} 
                placeholder="Descripción, justificación, u observaciones generales. Puedes usar Markdown..."
                style={{ fontFamily: 'var(--font-mono)' }}
              />
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 className="text-secondary" style={{ margin: 0 }}>Materiales</h3>
              <button type="button" className="btn btn--ghost" onClick={addMaterial} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>+ Agregar</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {form.materiales.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <input style={{ flex: 3 }} placeholder="Nombre" value={m.nombre} onChange={e => handleMaterialChange(i, 'nombre', e.target.value)} required />
                  <input style={{ flex: 1 }} type="number" step="any" placeholder="Cant." value={m.cantidad} onChange={e => handleMaterialChange(i, 'cantidad', e.target.value)} />
                  <input style={{ flex: 1 }} placeholder="Und." value={m.unidad} onChange={e => handleMaterialChange(i, 'unidad', e.target.value)} />
                  <button type="button" className="btn btn--danger" onClick={() => removeMaterial(i)} style={{ padding: '0.8rem', minHeight: 'auto' }}>X</button>
                </div>
              ))}
              {form.materiales.length === 0 && <p className="text-muted" style={{ fontSize: '0.85rem' }}>Sin materiales definidos.</p>}
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 className="text-secondary" style={{ margin: 0 }}>Pasos</h3>
              <button type="button" className="btn btn--ghost" onClick={addPaso} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>+ Agregar</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {form.pasos.map((p, i) => (
                <div key={i} style={{ background: 'var(--theme-background)', padding: '1rem', borderRadius: 'var(--radius-base)', border: '1px solid var(--theme-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <label style={{ width: 80 }}>Orden: <input type="number" value={p.orden} onChange={e => handlePasoChange(i, 'orden', e.target.value)} style={{ padding: '0.4rem', marginTop: 4 }} /></label>
                      <label style={{ width: 120 }}>Mins: <input type="number" value={p.tiempo_minutos} onChange={e => handlePasoChange(i, 'tiempo_minutos', e.target.value)} style={{ padding: '0.4rem', marginTop: 4 }} /></label>
                    </div>
                    <button type="button" className="btn btn--danger" onClick={() => removePaso(i)} style={{ padding: '0.4rem 0.8rem', minHeight: 'auto', alignSelf: 'flex-start' }}>Eliminar</button>
                  </div>
                  <div className="form-group">
                    <label>Instrucción (Markdown soportado)</label>
                    <textarea value={p.instruccion} onChange={e => handlePasoChange(i, 'instruccion', e.target.value)} rows={3} style={{ fontFamily: 'var(--font-mono)' }} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Notas adicionales</label>
                    <input value={p.notas} onChange={e => handlePasoChange(i, 'notas', e.target.value)} />
                  </div>
                </div>
              ))}
              {form.pasos.length === 0 && <p className="text-muted" style={{ fontSize: '0.85rem' }}>Sin pasos definidos.</p>}
            </div>
          </div>

          {error && <p className="text-danger" style={{ margin: 0 }}>{error}</p>}
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="button" className="btn btn--ghost" style={{ flex: 1 }} onClick={() => {
              if (window.history.state && window.history.state.idx > 0) navigate(-1)
              else navigate('/protocolos', { replace: true })
            }}>Cancelar</button>
            <button type="submit" className="btn btn--primary" style={{ flex: 1 }} disabled={loading}>{loading ? 'Guardando...' : 'Guardar Protocolo'}</button>
          </div>
        </form>
      )}
    </div>
  )
}
