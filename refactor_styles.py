import re

with open('frontend/src/pages/EspecieDetail.jsx', 'r') as f:
    c = f.read()

# Badges / Tags
c = re.sub(r'style=\{\{background:\'var\(--bio-border\)\',color:\'var\(--bio-primary\)\',fontSize:\'0\.65rem\',padding:\'1px 5px\',borderRadius:4,textTransform:\'uppercase\',fontWeight:\'bold\',border:\'1px solid var\(--bio-border\)\',marginLeft:0\}\}', r'className="badge badge--outline"', c)
c = re.sub(r'style=\{\{background:\'var\(--bio-border\)\',color:\'var\(--bio-primary\)\',padding:\'0\.1rem 0\.4rem\',borderRadius:4,fontSize:\'0\.65rem\',textTransform:\'uppercase\',fontWeight:\'bold\'\}\}', r'className="badge badge--outline"', c)
c = re.sub(r'style=\{\{\s*borderRadius:4,padding:\'0\.1rem 0\.45rem\',fontSize:\'0\.68rem\',color:\'#fff\',fontWeight:700,textTransform:\'uppercase\',\s*background: ESTADO_COLOR\[exp\.estado\] \|\| \'var\(--bio-border\)\'\s*\}\}', r'className={`badge ${exp.estado === "activo" ? "badge--success" : exp.estado === "pausado" ? "badge--warning" : exp.estado === "cancelado" ? "badge--danger" : "badge--outline"}`}', c)
c = re.sub(r'style=\{\{\s*borderRadius:4,padding:\'0\.1rem 0\.45rem\',fontSize:\'0\.68rem\',color:\'#fff\',fontWeight:700,textTransform:\'uppercase\',\s*background: VALIDACION_COLOR\[p\.estado_validacion\] \|\| \'var\(--bio-border\)\'\s*\}\}', r'className={`badge ${p.estado_validacion === "validado" ? "badge--success" : p.estado_validacion === "obsoleto" ? "badge--danger" : "badge--outline"}`}', c)

# Code / Mono Badges
c = re.sub(r'style=\{\{background:\'var\(--bio-surface\)\',border:\'1px solid var\(--bio-border\)\',borderRadius:6,color:\'var\(--bio-secondary\)\',padding:\'0\.2rem 0\.5rem\',fontSize:\'0\.75rem\',fontWeight:700,letterSpacing:1,whiteSpace:\'nowrap\'\}\}', r'className="badge badge--outline font-mono"', c)

# Buttons
c = re.sub(r'<button\s+style=\{\{background:\'var\(--bio-primary\)\',border:\'none\',borderRadius:20,color:\'#fff\',padding:\'0\.3rem 0\.9rem\',fontSize:\'0\.85rem\',cursor:\'pointer\'\}\}', r'<button className="btn btn--primary"', c)
c = re.sub(r'<button\s+style=\{\{flex:1,background:\'var\(--bio-primary\)\',border:\'none\',borderRadius:10,color:\'#fff\',padding:\'0\.7rem 0\.5rem\',fontSize:\'0\.85rem\',cursor:\'pointer\',textAlign:\'center\',fontWeight:\'bold\'\}\}', r'<button className="btn btn--primary"', c)
c = re.sub(r'<button\s+style=\{\{flex:1,background:\'var\(--bio-secondary\)\',border:\'none\',borderRadius:10,color:\'#fff\',padding:\'0\.7rem 0\.5rem\',fontSize:\'0\.85rem\',cursor:\'pointer\',textAlign:\'center\',fontWeight:\'bold\'\}\}', r'<button className="btn btn--secondary"', c)
c = re.sub(r'<button\s+style=\{\{marginLeft:\'auto\',background:\'var\(--bio-primary\)\',border:\'none\',borderRadius:8,color:\'#fff\',padding:\'0\.35rem 0\.85rem\',fontSize:\'0\.8rem\',cursor:\'pointer\',fontWeight:600\}\}', r'<button className="btn btn--primary"', c)
c = re.sub(r'<button\s+type="submit"\s+style=\{\{flex:2,background:\'var\(--bio-primary\)\',border:\'none\',borderRadius:8,color:\'#fff\',padding:\'0\.75rem\',fontSize:\'0\.9rem\',fontWeight:600,cursor:\'pointer\'\}\}', r'<button type="submit" className="btn btn--primary"', c)

c = re.sub(r'<button\s+style=\{\{flex:2,background:\'var\(--bio-surface\)\',border:\'1px solid var\(--bio-border\)\',borderRadius:10,color:\'var\(--bio-primary\)\',padding:\'0\.7rem 0\.5rem\',fontSize:\'0\.85rem\',cursor:\'pointer\',textAlign:\'center\'\}\}', r'<button className="btn btn--ghost"', c)
c = re.sub(r'<button\s+style=\{\{background:\'var\(--bio-surface\)\',border:\'1px solid var\(--bio-border\)\',borderRadius:8,color:\'var\(--bio-text\)\',padding:\'0\.4rem 0\.85rem\',fontSize:\'0\.82rem\',cursor:\'pointer\'\}\}', r'<button className="btn btn--ghost"', c)
c = re.sub(r'<button\s+style=\{\{marginLeft:\'auto\',background:\'none\',border:\'1px solid var\(--bio-border\)\',borderRadius:8,color:\'var\(--bio-primary\)\',padding:\'0\.35rem 0\.75rem\',fontSize:\'0\.8rem\',cursor:\'pointer\'\}\}', r'<button className="btn btn--ghost"', c)
c = re.sub(r'<button\s+style=\{\{background:\'none\',border:\'1px solid var\(--bio-border\)\',borderRadius:8,color:\'var\(--bio-primary\)\',padding:\'0\.35rem 0\.75rem\',fontSize:\'0\.8rem\',cursor:\'pointer\'\}\}', r'<button className="btn btn--ghost"', c)
c = re.sub(r'<button\s+style=\{\{background:\'none\',border:\'1px solid var\(--bio-primary\)\',borderRadius:8,color:\'var\(--bio-primary\)\',padding:\'0\.3rem 0\.6rem\',fontSize:\'0\.75rem\',cursor:\'pointer\'\}\}', r'<button className="btn btn--ghost"', c)
c = re.sub(r'<button\s+type="button"\s+style=\{\{flex:1,background:\'none\',border:\'1px solid var\(--bio-border\)\',borderRadius:8,color:\'var\(--bio-primary\)\',padding:\'0\.75rem\',fontSize:\'0\.9rem\',cursor:\'pointer\'\}\}', r'<button type="button" className="btn btn--ghost"', c)

c = re.sub(r'style=\{so\.btnSave\}', r'className="btn btn--primary"', c)
c = re.sub(r'style=\{so\.btnCancel\}', r'className="btn btn--ghost"', c)
c = re.sub(r'style=\{s\.btnSec\}', r'className="btn btn--secondary"', c)

# Cards / Tiles
c = re.sub(r'style=\{\{background:\'var\(--bio-surface\)\',border:\'1px solid var\(--bio-border\)\',borderRadius:10,padding:\'0\.85rem\'\}\}', r'className="card"', c)
c = re.sub(r'style=\{\{background:\'var\(--bio-surface\)\',border:\'1px solid var\(--bio-border\)\',borderRadius:10,padding:\'0\.75rem\',cursor:\'pointer\',marginBottom:6\}\}', r'className="tile"', c)
c = re.sub(r'style=\{\{background:\'var\(--bio-surface\)\',border:\'1px solid var\(--bio-border\)\',borderRadius:12,overflow:\'hidden\'\}\}', r'className="card" style={{ padding: 0, overflow: "hidden" }}', c)

# Forms
c = re.sub(r'style=\{\{ display: \'grid\', gridTemplateColumns: \'1fr 1fr\', gap: 10 \}\}', r'className="grid-2"', c)
c = re.sub(r'style=\{\{display:\'grid\',gridTemplateColumns:\'1fr 1fr\',gap:8\}\}', r'className="grid-2"', c)
c = re.sub(r'style=\{\{\s*display: \'flex\', flexDirection: \'column\', gap: [34]\s*\}\}', r'className="form-group"', c)

# Remove input/textarea/select styles since they are global
c = re.sub(r'style=\{\{background:\'var\(--bio-background\)\',border:\'1px solid var\(--bio-border\)\',borderRadius:[68],padding:\'[^\']+\',color:\'var\(--bio-text\)\',fontSize:\'[^\']+\',(?:width:\'100%\',)?(?:boxSizing:\'border-box\'|outline:\'none\'|resize:\'vertical\',width:\'100%\',boxSizing:\'border-box\',fontFamily:\'inherit\')?\}\}', r'', c)
# another variation
c = re.sub(r'style=\{\{\s*background:\'var\(--bio-background\)\',border:\'1px solid var\(--bio-border\)\',borderRadius:[68],padding:\'[^\']+\',color:\'var\(--bio-text\)\',fontSize:\'[^\']+\',outline:\'none\'(?:,\s*minHeight:\s*60,\s*resize:\s*\'vertical\')?\s*\}\}', r'', c)
c = re.sub(r'style=\{\{\s*background:\'var\(--bio-background\)\',border:\'1px solid var\(--bio-border\)\',borderRadius:8,padding:\'0\.65rem\',color:\'var\(--bio-text\)\',fontSize:\'0\.9rem\',resize:\'vertical\',width:\'100%\',boxSizing:\'border-box\',fontFamily:\'inherit\'\s*\}\}', r'', c)


# Clean up empty classNames or styles just in case
c = re.sub(r' style=\{\{\s*\}\}', r'', c)

with open('frontend/src/pages/EspecieDetail.jsx', 'w') as f:
    f.write(c)

