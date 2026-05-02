import re

with open('frontend/src/pages/IndividuoCreate.jsx', 'r') as f:
    content = f.read()

# 1. Page container and title
content = content.replace(
    '<div className="page-container" style={{display:\'flex\',flexDirection:\'column\',gap:\'1rem\'}}>',
    '<div className="page-container">'
)
content = content.replace(
    '<h2 className="page-title" style={{color:\'var(--bio-primary)\',margin:0,fontSize:\'1.2rem\'}}>Nuevo individuo</h2>',
    '<h2 className="page-title text-primary" style={{marginBottom: "1.5rem"}}>Nuevo individuo</h2>'
)

# 2. Breadcrumb
content = content.replace(
    '<div style={{display:\'flex\',alignItems:\'center\',gap:4,flexWrap:\'wrap\',background:\'var(--bio-surface)\',borderRadius:8,padding:\'0.5rem 0.75rem\'}}>',
    '<div className="card" style={{display:\'flex\',alignItems:\'center\',gap:4,flexWrap:\'wrap\',padding:\'0.5rem 0.75rem\',marginBottom:\'1rem\'}}>'
)
content = content.replace('color:\'var(--bio-primary)\'', 'color:\'var(--theme-primary)\'')
content = content.replace('color:\'var(--bio-border)\'', 'color:\'var(--theme-border)\'')

# 3. Form
content = content.replace(
    '<form onSubmit={handleSubmit} style={{display:\'flex\',flexDirection:\'column\',gap:\'1rem\'}}>',
    '<form onSubmit={handleSubmit}>'
)

# 4. Buttons
content = content.replace(
    'style={{background:\'var(--bio-primary)\',border:\'none\',borderRadius:8,color:\'#fff\',width:42,height:42,fontSize:\'1.4rem\',cursor:\'pointer\',display:\'flex\',alignItems:\'center\',justifyContent:\'center\',flexShrink:0}}',
    'className="btn btn--primary" style={{width:44,height:44,padding:0,fontSize:\'1.4rem\',flexShrink:0}}'
)
content = content.replace(
    'style={form.especie_id ? s.btnGenerar : s.btnGenerarDisabled}',
    'className={`btn ${form.especie_id ? "btn--primary" : "btn--ghost"}`} style={{minHeight: "44px"}}'
)
content = content.replace(
    'style={{background:\'var(--bio-primary)\',border:\'none\',borderRadius:10,color:\'#fff\',padding:\'0.9rem\',fontSize:\'1rem\',fontWeight:700,cursor:\'pointer\'}}',
    'className="btn btn--primary btn--block"'
)

# 5. UID Input
content = content.replace(
    '<label style={{color:\'var(--bio-secondary)\',fontSize:\'0.78rem\',fontWeight:600}}>UID *</label>',
    '<label>UID *</label>'
)
content = content.replace(
    '<input style={{background:\'var(--bio-background)\',border:\'1px solid var(--bio-border)\',borderRadius:8,padding:\'0.65rem 0.9rem\',color:\'var(--bio-text)\',fontSize:\'0.95rem\',outline:\'none\',width:\'100%\',boxSizing:\'border-box\'}} value={form.uid} onChange={e => set(\'uid\', e.target.value)}',
    '<input value={form.uid} onChange={e => set(\'uid\', e.target.value)}'
)
content = content.replace(
    '<div style={{ flex: 1 }}>\n              <label>UID *</label>\n              <input value={form.uid} onChange={e => set(\'uid\', e.target.value)}\n                placeholder="Genera o escribe…" />\n            </div>',
    '<div className="form-group" style={{ flex: 1, marginBottom: 0 }}>\n              <label>UID *</label>\n              <input value={form.uid} onChange={e => set(\'uid\', e.target.value)}\n                placeholder="Genera o escribe…" />\n            </div>'
)

# 6. Ubicacion
content = content.replace(
    '<div style={{display:\'flex\',flexDirection:\'column\',gap:4}}>',
    '<div className="form-group">'
)
content = content.replace(
    '<label style={{color:\'var(--bio-secondary)\',fontSize:\'0.78rem\',fontWeight:600}}>Ubicación In Situ</label>',
    '<label>Ubicación In Situ</label>'
)
content = content.replace(
    '<label style={{color:\'var(--bio-secondary)\',fontSize:\'0.78rem\',fontWeight:600}}>Fotografías iniciales</label>',
    '<label>Fotografías iniciales</label>'
)

# 7. Photos
content = content.replace(
    'style={fotos[ang] ? s.fotoLabelActive : s.fotoLabelEmpty}',
    'style={{display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", borderRadius: "var(--radius-base)", border: fotos[ang] ? "none" : "2px dashed var(--theme-border)", background: fotos[ang] ? "transparent" : "var(--theme-surface)", color: "var(--theme-text-muted)", cursor: "pointer", overflow: "hidden", textAlign: "center"}}'
)

# 8. Checkbox
content = content.replace(
    '<label style={{display:\'flex\',alignItems:\'center\',gap:8,cursor:\'pointer\'}}>',
    '<label style={{display:\'flex\',alignItems:\'center\',gap:8,cursor:\'pointer\',marginBottom:\'1.5rem\'}}>'
)
content = content.replace(
    '<span style={{color:\'var(--bio-primary)\',fontSize:\'0.9rem\'}}>Imprimir etiqueta al guardar</span>',
    '<span className="text-primary" style={{fontSize:\'0.9rem\', textTransform:\'none\', letterSpacing:\'normal\'}}>Imprimir etiqueta al guardar</span>'
)
content = content.replace(
    '<input type="checkbox" checked={printAfter} onChange={e => setPrintAfter(e.target.checked)} />',
    '<input type="checkbox" checked={printAfter} onChange={e => setPrintAfter(e.target.checked)} style={{width: "auto", marginTop: 0}} />'
)

# 9. Error
content = content.replace(
    '<p style={{color:\'var(--error)\',fontSize:\'0.85rem\',margin:0}}>{error}</p>',
    '<p className="text-center" style={{color:\'var(--error)\',fontSize:\'0.85rem\',marginBottom:\'1rem\'}}>{error}</p>'
)

# 10. Components
section_replacement = """function Section({ title, children }) {
  return (
    <div className="card">
      <h4 className="text-secondary" style={{ textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 1rem 0', fontSize: '0.85rem' }}>{title}</h4>
      {children}
    </div>
  )
}"""
content = re.sub(r'function Section.*?return.*?\).*?\}', section_replacement, content, flags=re.DOTALL)

field_replacement = """function Field({ label, value, onChange, placeholder, type = 'text', textarea, italic }) {
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
content = re.sub(r'function Field.*?return.*?\).*?\}', field_replacement, content, flags=re.DOTALL)

select_replacement = """function Select({ label, value, onChange, options, placeholder, noMargin }) {
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
content = re.sub(r'function Select.*?return.*?\).*?\}', select_replacement, content, flags=re.DOTALL)

especimen_search_replacement = """function EspecimenSearch({ label, value, onChange }) {
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
content = re.sub(r'function EspecimenSearch.*?return.*?\).*?\}', especimen_search_replacement, content, flags=re.DOTALL)

with open('frontend/src/pages/IndividuoCreate.jsx', 'w') as f:
    f.write(content)
