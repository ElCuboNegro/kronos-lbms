import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Home from './pages/Home'
import Scanner from './pages/Scanner'
import EspecimenDetail from './pages/EspecimenDetail'
import EspecimenesList from './pages/EspecimenesList'
import ElementoDetail from './pages/ElementoDetail'
import EspeciesList from './pages/EspeciesList'
import EspecieDetail from './pages/EspecieDetail'
import ExperimentoDetail from './pages/ExperimentoDetail'
import MediosList from './pages/MediosList'
import ReactivosList from './pages/ReactivosList'
import FormulacionesList from './pages/FormulacionesList'
import LotesPreparadosList from './pages/LotesPreparadosList'
import IndividuoCreate from './pages/IndividuoCreate'
import IndividuoMultiCreate from './pages/IndividuoMultiCreate'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', color: '#4a8c5c' }}>Cargando…</div>
  return user ? children : <Navigate to="/login" replace />
}

function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()
  const isHome = location.pathname === '/'

  return (
    <div style={s.app}>
      <header style={s.header}>
        {!isHome
          ? <button style={s.back} onClick={() => navigate(-1)}>←</button>
          : <span style={{ width: 40 }} />
        }
        <span style={s.brand}>LBMS</span>
        <button style={s.logoutBtn} onClick={() => { logout(); navigate('/login') }}>Salir</button>
      </header>
      <main style={s.main}>{children}</main>
      <nav style={s.nav}>
        <NavBtn label="Scan" path="/scan" current={location.pathname} onClick={() => navigate('/scan')}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="18" width="3" height="3"/><rect x="18" y="14" width="3" height="3"/></svg>} />
        <NavBtn label="Inicio" path="/" exact current={location.pathname} onClick={() => navigate('/')}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>} />
        <NavBtn label="Especies" path="/especies" current={location.pathname} onClick={() => navigate('/especies')}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22V12M12 12C12 7 7 4 2 5c0 5 3 9 10 7M12 12c0-5 5-8 10-7-1 5-4 9-10 7"/></svg>} />
        <NavBtn label="Lab" path="/lab" current={location.pathname} onClick={() => navigate('/lab')}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v10m0 0l-4-4m4 4l4-4M5 20h14a2 2 0 002-2V7a2 2 0 00-2-2h-3l-2-2H8L6 5H3a2 2 0 00-2 2v11a2 2 0 002 2z"/></svg>} />
      </nav>
    </div>
  )
}

function NavBtn({ icon, label, path, exact, current, onClick }) {
  const active = exact ? current === path : (current === path || current.startsWith(path + '/'))
  return (
    <button style={{ ...s.navBtn, ...(active ? s.navActive : {}) }} onClick={onClick}>
      {icon}
      <span style={{ fontSize: '0.65rem' }}>{label}</span>
    </button>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <PrivateRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/scan" element={<Scanner />} />
                  <Route path="/nuevo-individuo" element={<IndividuoCreate />} />
                  <Route path="/nuevo-lote" element={<IndividuoMultiCreate />} />
                  <Route path="/especimenes" element={<EspecimenesList />} />
                  <Route path="/especimen/:id" element={<EspecimenDetail />} />
                  <Route path="/elemento/:id" element={<ElementoDetail />} />
                  <Route path="/especies" element={<EspeciesList />} />
                  <Route path="/especies/:id" element={<EspecieDetail />} />
                  <Route path="/experimentos/:id" element={<ExperimentoDetail />} />
                  <Route path="/lab" element={<MediosList />} />
                  <Route path="/reactivos" element={<ReactivosList />} />
                  <Route path="/formulaciones" element={<FormulacionesList />} />
                  <Route path="/lotes" element={<LotesPreparadosList />} />
                  <Route path="*" element={<ComingSoon />} />
                </Routes>
              </Layout>
            </PrivateRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

function ComingSoon() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <p style={{ color: '#4a8c5c', fontSize: '1rem' }}>Sección en desarrollo</p>
    </div>
  )
}

const s = {
  app: { display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: '#0f1f13', color: '#e0f0e5', fontFamily: 'system-ui, sans-serif' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: '#1a2e1e', borderBottom: '1px solid #2d5c3a', position: 'sticky', top: 0, zIndex: 50 },
  back: { background: 'none', border: 'none', color: '#7dca8f', fontSize: '1.3rem', cursor: 'pointer', padding: '0.25rem 0.5rem' },
  brand: { color: '#7dca8f', fontWeight: 700, letterSpacing: 2, fontSize: '0.95rem' },
  logoutBtn: { background: 'none', border: 'none', color: '#4a5568', fontSize: '0.8rem', cursor: 'pointer' },
  main: { flex: 1, overflowY: 'auto', paddingBottom: '5rem' },
  nav: { position: 'fixed', bottom: 0, left: 0, right: 0, background: '#1a2e1e', borderTop: '1px solid #2d5c3a', display: 'flex', justifyContent: 'space-around', padding: '0.5rem 0 calc(0.5rem + env(safe-area-inset-bottom))' },
  navBtn: { background: 'none', border: 'none', color: '#4a5568', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, cursor: 'pointer', padding: '0.25rem 1rem' },
  navActive: { color: '#7dca8f' },
}
