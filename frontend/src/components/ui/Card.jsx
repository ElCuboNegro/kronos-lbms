export default function Card({ children, title, subtitle, className = '', ...props }) {
  return (
    <div className={`card ${className}`} {...props}>
      {(title || subtitle) && (
        <div style={{ marginBottom: '1rem' }}>
          {title && <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--theme-primary)' }}>{title}</h3>}
          {subtitle && <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--theme-text-muted)' }}>{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  )
}
