import sys

def process_file(filename):
    with open(filename, 'r') as f:
        content = f.read()

    # Section
    old_section = """function Section({ title, children }) {
  return (
    <div style={{background:'var(--bio-surface)',borderRadius:12,padding:'0.9rem 1rem',display:'flex',flexDirection:'column',gap:10}}>
      <p style={{color:'var(--bio-secondary)',fontSize:'0.78rem',fontWeight:700,textTransform:'uppercase',letterSpacing:1,margin:0}}>{title}</p>
      {children}
    </div>
  )
}"""
    new_section = """function Section({ title, children }) {
  return (
    <div className="card">
      <h4 className="text-secondary" style={{ textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 1rem 0', fontSize: '0.85rem' }}>{title}</h4>
      {children}
    </div>
  )
}"""
    content = content.replace(old_section, new_section)

    # Field (IndividuoCreate)
    old_field_create = """function Field({ label, value, onChange, placeholder, type = 'text', textarea, italic }) {
  const inputStyle = { background:'var(--bio-background)',border:'1px solid var(--bio-border)',borderRadius:8,padding:'0.65rem 0.9rem',color:'var(--bio-text)',fontSize:'0.95rem',outline:'none',width:'100%',boxSizing:'border-box', ...(italic ? { fontStyle: 'italic' } : {}) }
  return (
    <div style={{display:'flex',flexDirection:'column',gap:4}}>
      <label style={{color:'var(--bio-secondary)',fontSize:'0.78rem',fontWeight:600}}>{label}</label>
      {textarea
        ? <textarea style={{ ...inputStyle, minHeight: 64, resize: 'vertical' }} value={value}
            onChange={e => onChange(e.target.value)} placeholder={placeholder} />
        : <input style={inputStyle} type={type} value={value}
            onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      }
    </div>
  )
}"""
    new_field_create = """function Field({ label, value, onChange, placeholder, type = 'text', textarea, italic }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      {textarea
        ? <textarea style={{ minHeight: 64, resize: 'vertical', ...(italic ? { fontStyle: 'italic' } : {}) }} value={value}
            onChange={e => onChange(e.target.value)} placeholder={placeholder} />
        : <input type={type} style={italic ? { fontStyle: 'italic' } : {}} value={value}
            onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      }
    </div>
  )
}"""
    content = content.replace(old_field_create, new_field_create)

    # Field (IndividuoMultiCreate)
    old_field_multi = """function Field({ label, value, onChange, placeholder, type = 'text', textarea, italic, min }) {
  const inputStyle = { background:'var(--bio-background)',border:'1px solid var(--bio-border)',borderRadius:8,padding:'0.65rem 0.9rem',color:'var(--bio-text)',fontSize:'0.95rem',outline:'none',width:'100%',boxSizing:'border-box', ...(italic ? { fontStyle: 'italic' } : {}) }
  return (
    <div style={{display:'flex',flexDirection:'column',gap:4}}>
      <label style={{color:'var(--bio-secondary)',fontSize:'0.78rem',fontWeight:600}}>{label}</label>
      {textarea
        ? <textarea style={{ ...inputStyle, minHeight: 64, resize: 'vertical' }} value={value}
            onChange={e => onChange(e.target.value)} placeholder={placeholder} />
        : <input style={inputStyle} type={type} min={min} value={value}
            onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      }
    </div>
  )
}"""
    new_field_multi = """function Field({ label, value, onChange, placeholder, type = 'text', textarea, italic, min }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      {textarea
        ? <textarea style={{ minHeight: 64, resize: 'vertical', ...(italic ? { fontStyle: 'italic' } : {}) }} value={value}
            onChange={e => onChange(e.target.value)} placeholder={placeholder} />
        : <input type={type} min={min} style={italic ? { fontStyle: 'italic' } : {}} value={value}
            onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      }
    </div>
  )
}"""
    content = content.replace(old_field_multi, new_field_multi)

    # Select
    old_select = """function Select({ label, value, onChange, options, placeholder, noMargin }) {
  return (
    <div style={{ display:'flex',flexDirection:'column',gap:4, ...(noMargin ? { margin: 0 } : {}) }}>
      <label style={{color:'var(--bio-secondary)',fontSize:'0.78rem',fontWeight:600}}>{label}</label>
      <select style={{background:'var(--bio-background)',border:'1px solid var(--bio-border)',borderRadius:8,padding:'0.65rem 0.9rem',color:'var(--bio-text)',fontSize:'0.95rem',outline:'none',width:'100%',boxSizing:'border-box'}} value={value} onChange={e => onChange(e.target.value)}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}"""
    new_select = """function Select({ label, value, onChange, options, placeholder, noMargin }) {
  return (
    <div className="form-group" style={noMargin ? { marginBottom: 0 } : {}}>
      <label>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}"""
    content = content.replace(old_select, new_select)

    # EspecimenSearch
    old_search = """function EspecimenSearch({ label, value, onChange }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selectedUid, setSelectedUid] = useState('')

  useEffect(() => {
    if (value === '') {
      setSelectedUid('')
      setQuery('')
    }
  }, [value])

  const search = async (q) => {
    setQuery(q)
    if (q.length < 2) { setResults([]); return }
    try {
      const data = await api.get('/especimenes')
      const filtered = data.filter(e => e.uid.toLowerCase().includes(q.toLowerCase())).slice(0, 5)
      setResults(filtered)
    } catch { setResults([]) }
  }

  const select = (e) => {
    onChange(e.id)
    setSelectedUid(e.uid)
    setResults([])
    setQuery(e.uid)
  }

  return (
    <div style={{ display:'flex',flexDirection:'column',gap:4, position: 'relative' }}>
      <label style={{color:'var(--bio-secondary)',fontSize:'0.78rem',fontWeight:600}}>{label}</label>
      <input style={{background:'var(--bio-background)',border:'1px solid var(--bio-border)',borderRadius:8,padding:'0.65rem 0.9rem',color:'var(--bio-text)',fontSize:'0.95rem',outline:'none',width:'100%',boxSizing:'border-box'}} value={query} onChange={e => search(e.target.value)} placeholder="Buscar UID..." />
      {results.length > 0 && (
        <div style={{position:'absolute',top:'100%',left:0,right:0,background:'var(--bio-surface)',border:'1px solid var(--bio-border)',borderRadius:8,zIndex:10,marginTop:4,boxShadow:'0 4px 12px rgba(0,0,0,0.5)'}}>
          {results.map(r => (
            <div key={r.id} style={{padding:'0.6rem 0.8rem',cursor:'pointer',borderBottom:'1px solid var(--bio-background)',fontSize:'0.9rem'}} onClick={() => select(r)}>
              <span style={{ fontWeight: 'bold' }}>{r.uid}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--bio-secondary)', marginLeft: 6 }}>{r.especie}</span>
            </div>
          ))}
        </div>
      )}
      {selectedUid && query === selectedUid && (
        <button type="button" style={{position:'absolute',right:8,top:28,background:'none',border:'none',color:'var(--error)',cursor:'pointer',fontSize:'1.1rem'}} onClick={() => { onChange(''); setQuery(''); setSelectedUid(''); }}>✕</button>
      )}
    </div>
  )
}"""
    new_search = """function EspecimenSearch({ label, value, onChange }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selectedUid, setSelectedUid] = useState('')

  useEffect(() => {
    if (value === '') {
      setSelectedUid('')
      setQuery('')
    }
  }, [value])

  const search = async (q) => {
    setQuery(q)
    if (q.length < 2) { setResults([]); return }
    try {
      const data = await api.get('/especimenes')
      const filtered = data.filter(e => e.uid.toLowerCase().includes(q.toLowerCase())).slice(0, 5)
      setResults(filtered)
    } catch { setResults([]) }
  }

  const select = (e) => {
    onChange(e.id)
    setSelectedUid(e.uid)
    setResults([])
    setQuery(e.uid)
  }

  return (
    <div className="form-group" style={{ position: 'relative' }}>
      <label>{label}</label>
      <input value={query} onChange={e => search(e.target.value)} placeholder="Buscar UID..." />
      {results.length > 0 && (
        <div style={{position:'absolute',top:'100%',left:0,right:0,background:'var(--theme-surface)',border:'1px solid var(--theme-border)',borderRadius:'var(--radius-base)',zIndex:10,marginTop:4,boxShadow:'0 4px 12px rgba(0,0,0,0.5)'}}>
          {results.map(r => (
            <div key={r.id} style={{padding:'0.6rem 0.8rem',cursor:'pointer',borderBottom:'1px solid var(--theme-background)',fontSize:'0.9rem'}} onClick={() => select(r)}>
              <span style={{ fontWeight: 'bold' }}>{r.uid}</span>
              <span className="text-muted" style={{ fontSize: '0.7rem', marginLeft: 6 }}>{r.especie}</span>
            </div>
          ))}
        </div>
      )}
      {selectedUid && query === selectedUid && (
        <button type="button" style={{position:'absolute',right:8,top:32,background:'none',border:'none',color:'var(--error)',cursor:'pointer',fontSize:'1.1rem'}} onClick={() => { onChange(''); setQuery(''); setSelectedUid(''); }}>✕</button>
      )}
    </div>
  )
}"""
    content = content.replace(old_search, new_search)

    # Shared inline style replacements for the main body
    content = content.replace('<div className="page-container" style={{display:\'flex\',flexDirection:\'column\',gap:\'1rem\'}}>', '<div className="page-container">')
    content = content.replace('<h2 className="page-title" style={{color:\'var(--bio-primary)\',margin:0,fontSize:\'1.2rem\'}}>', '<h2 className="page-title text-primary" style={{marginBottom: "1.5rem"}}>')
    
    content = content.replace('style={{display:\'flex\',alignItems:\'center\',gap:4,flexWrap:\'wrap\',background:\'var(--bio-surface)\',borderRadius:8,padding:\'0.5rem 0.75rem\'}}', 'className="card" style={{display:\'flex\',alignItems:\'center\',gap:4,flexWrap:\'wrap\',padding:\'0.5rem 0.75rem\',marginBottom:\'1rem\'}}')
    content = content.replace('color:\'var(--bio-primary)\'', 'color:\'var(--theme-primary)\'')
    content = content.replace('color:\'var(--bio-border)\'', 'color:\'var(--theme-border)\'')
    
    content = content.replace('<form onSubmit={handleSubmit} style={{display:\'flex\',flexDirection:\'column\',gap:\'1rem\'}}>', '<form onSubmit={handleSubmit}>')
    
    # Especie form button
    content = content.replace('style={{background:\'var(--bio-primary)\',border:\'none\',borderRadius:8,color:\'#fff\',width:42,height:42,fontSize:\'1.4rem\',cursor:\'pointer\',display:\'flex\',alignItems:\'center\',justifyContent:\'center\',flexShrink:0}}', 'className="btn btn--primary" style={{width:44,height:44,padding:0,fontSize:\'1.4rem\',flexShrink:0}}')
    
    # Generar UID button
    content = content.replace('style={form.especie_id ? s.btnGenerar : s.btnGenerarDisabled}', 'className={`btn ${form.especie_id ? "btn--primary" : "btn--ghost"}`} style={{minHeight: "44px"}}')
    
    # Missing form-group wrapper around standard inline UID label/input
    content = content.replace('<label style={{color:\'var(--bio-secondary)\',fontSize:\'0.78rem\',fontWeight:600}}>UID *</label>', '<label>UID *</label>')
    content = content.replace('<input style={{background:\'var(--bio-background)\',border:\'1px solid var(--bio-border)\',borderRadius:8,padding:\'0.65rem 0.9rem\',color:\'var(--bio-text)\',fontSize:\'0.95rem\',outline:\'none\',width:\'100%\',boxSizing:\'border-box\'}}', '<input')
    content = content.replace('<div style={{ flex: 1 }}>\n              <label>UID *</label>', '<div className="form-group" style={{ flex: 1, marginBottom: 0 }}>\n              <label>UID *</label>')
    
    # MapPicker and Fotos wrappers
    content = content.replace('<div style={{display:\'flex\',flexDirection:\'column\',gap:4}}>', '<div className="form-group">')
    content = content.replace('<label style={{color:\'var(--bio-secondary)\',fontSize:\'0.78rem\',fontWeight:600}}>Ubicación In Situ</label>', '<label>Ubicación In Situ</label>')
    content = content.replace('<label style={{color:\'var(--bio-secondary)\',fontSize:\'0.78rem\',fontWeight:600}}>Fotografías iniciales</label>', '<label>Fotografías iniciales</label>')
    content = content.replace('<label style={{color:\'var(--bio-secondary)\',fontSize:\'0.78rem\',fontWeight:600}}>Fotografía del Lote (opcional)</label>', '<label>Fotografía del Lote (opcional)</label>')
    
    # Photos Labels
    content = content.replace('style={fotos[ang] ? s.fotoLabelActive : s.fotoLabelEmpty}', 'style={{display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", borderRadius: "var(--radius-base)", border: fotos[ang] ? "none" : "2px dashed var(--theme-border)", background: fotos[ang] ? "transparent" : "var(--theme-surface)", color: "var(--theme-text-muted)", cursor: "pointer", overflow: "hidden", textAlign: "center"}}')
    content = content.replace('style={fotoLote ? s.fotoLabelActive : s.fotoLabelEmpty}', 'style={{display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", borderRadius: "var(--radius-base)", border: fotoLote ? "none" : "2px dashed var(--theme-border)", background: fotoLote ? "transparent" : "var(--theme-surface)", color: "var(--theme-text-muted)", cursor: "pointer", overflow: "hidden", textAlign: "center"}}')
    
    # Print Checkbox
    content = content.replace('<label style={{display:\'flex\',alignItems:\'center\',gap:8,cursor:\'pointer\'}}>', '<label style={{display:\'flex\',alignItems:\'center\',gap:8,cursor:\'pointer\',marginBottom:\'1.5rem\'}}>')
    content = content.replace('<span style={{color:\'var(--bio-primary)\',fontSize:\'0.9rem\'}}>Imprimir etiqueta al guardar</span>', '<span className="text-primary" style={{fontSize:\'0.9rem\', textTransform:\'none\', letterSpacing:\'normal\'}}>Imprimir etiqueta al guardar</span>')
    content = content.replace('<span style={{color:\'var(--bio-primary)\',fontSize:\'0.9rem\'}}>Imprimir todas las etiquetas generadas automáticamente</span>', '<span className="text-primary" style={{fontSize:\'0.9rem\', textTransform:\'none\', letterSpacing:\'normal\'}}>Imprimir todas las etiquetas generadas automáticamente</span>')
    content = content.replace('type="checkbox" checked={printAfter} onChange={e => setPrintAfter(e.target.checked)} />', 'type="checkbox" checked={printAfter} onChange={e => setPrintAfter(e.target.checked)} style={{width: "auto", marginTop: 0}} />')
    
    # Submit Button
    content = content.replace('<button type="submit" style={{background:\'var(--bio-primary)\',border:\'none\',borderRadius:10,color:\'#fff\',padding:\'0.9rem\',fontSize:\'1rem\',fontWeight:700,cursor:\'pointer\'}} disabled={loading}>', '<button type="submit" className="btn btn--primary btn--block" disabled={loading}>')
    content = content.replace('<button type="submit" style={{background:\'var(--bio-primary)\',border:\'none\',borderRadius:10,color:\'#fff\',padding:\'0.9rem\',fontSize:\'1rem\',fontWeight:700,cursor:\'pointer\'}} disabled={loading || !form.especie_id}>', '<button type="submit" className="btn btn--primary btn--block" disabled={loading || !form.especie_id}>')
    
    # Error Message
    content = content.replace('<p style={{color:\'var(--error)\',fontSize:\'0.85rem\',margin:0}}>{error}</p>', '<p className="text-center" style={{color:\'var(--error)\',fontSize:\'0.85rem\',marginBottom:\'1rem\'}}>{error}</p>')

    # specific fixes for IndividuoMultiCreate.jsx
    content = content.replace('style={{background:\'var(--bio-background)\',borderRadius:8,padding:\'0.75rem\',border:\'1px dashed var(--bio-border)\',display:\'flex\',flexDirection:\'column\',gap:8}}', 'className="card" style={{padding: "1rem", border: "1px dashed var(--theme-border)", boxShadow: "none", display: "flex", flexDirection: "column", gap: 8}}')
    content = content.replace('style={{color:\'var(--bio-text)\',fontSize:\'0.85rem\',fontWeight:\'bold\'}}', 'className="text-primary" style={{fontSize:\'0.9rem\',fontWeight:\'bold\'}}')
    content = content.replace('style={{background:\'none\',border:\'1px dashed var(--bio-secondary)\',borderRadius:8,color:\'var(--bio-primary)\',padding:\'0.6rem\',fontSize:\'0.85rem\',cursor:\'pointer\',marginTop:4}}', 'className="btn btn--ghost" style={{marginTop: "0.5rem"}}')

    with open(filename, 'w') as f:
        f.write(content)

process_file('frontend/src/pages/IndividuoCreate.jsx')
process_file('frontend/src/pages/IndividuoMultiCreate.jsx')
