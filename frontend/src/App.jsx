import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { App as CapApp } from '@capacitor/app'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { TimerProvider } from './contexts/TimerContext'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
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
import Calculators from './pages/Calculators'
import ProtocolosList from './pages/ProtocolosList'
import ProtocolExecution from './pages/ProtocolExecution'
import ProtocoloEditor from './pages/ProtocoloEditor'
import ElementosList from './pages/ElementosList'
import Logs from './pages/Logs'
import UpdateModal from './components/UpdateModal'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', color: 'var(--theme-secondary)' }}>Cargando…</div>
  return user ? children : <Navigate to="/login" replace />
}

function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const isHome = location.pathname === '/'

  const handleBack = () => {
    // Si el enrutador tiene historial previo en esta sesión, retrocede normal
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1)
    } else {
      // Deep link detectado sin historial, retroceder al padre lógico
      const p = location.pathname
      if (p.startsWith('/especimen/')) navigate('/especies', { replace: true })
      else if (p.startsWith('/especies/')) navigate('/especies', { replace: true })
      else if (p.startsWith('/elemento/')) navigate('/elementos', { replace: true })
      else if (p.startsWith('/experimentos/')) navigate('/experimentos', { replace: true })
      else if (p.startsWith('/reactivos') || p.startsWith('/formulaciones') || p.startsWith('/lotes')) navigate('/medios', { replace: true })
      else if (p.startsWith('/protocolos/')) navigate('/protocolos', { replace: true })
      else navigate('/', { replace: true })
    }
  }

  useEffect(() => {
    const backButtonListener = CapApp.addListener('backButton', (event) => {
      // Evitar salir de la aplicación a menos que estemos en el inicio
      if (location.pathname === '/' || location.pathname === '/login') {
        CapApp.exitApp();
      } else {
        handleBack();
      }
    });

    return () => {
      backButtonListener.then(listener => listener.remove());
    };
  }, [location.pathname, navigate]);

  const getPageTitle = () => {
    const p = location.pathname
    if (p === '/') return 'Seymour-OS'
    if (p.startsWith('/scan')) return 'Escáner'
    if (p.startsWith('/especies')) return 'Genealogía'
    if (p.startsWith('/especimen/')) return 'Ficha Especímen'
    if (p.startsWith('/nuevo-individuo')) return 'Nuevo Individuo'
    if (p.startsWith('/contenedores')) return 'Contenedores'
    if (p.startsWith('/protocolos')) return 'Protocolos'
    if (p.startsWith('/elementos')) return 'Elementos'
    if (p.startsWith('/reactivos')) return 'Reactivos'
    if (p.startsWith('/formulaciones')) return 'Recetario'
    if (p.startsWith('/lotes')) return 'Lotes Preparados'
    if (p.startsWith('/lab')) return 'Sustratos'
    if (p.startsWith('/calculadoras')) return 'Micro-Herramientas'
    if (p.startsWith('/experimentos')) return 'Experimento'
    if (p.startsWith('/logs')) return 'Telemetría'
    return 'Seymour-OS'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <header className="page-header" style={{
        padding: '0.75rem 1rem',
        background: 'var(--theme-surface)',
        borderBottom: '1px solid var(--theme-border)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        margin: 0
      }}>
        {!isHome
          ? <button className="back-btn" onClick={handleBack}>←</button>
          : <span style={{ width: 40 }} />
        }
        <span className="text-primary" style={{ fontWeight: 700, letterSpacing: 1, fontSize: '0.95rem' }}>{getPageTitle()}</span>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: 0 }} onClick={toggleTheme} title="Cambiar diseño">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button style={{ background: 'none', border: 'none', color: 'var(--theme-text-muted)', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }} onClick={() => { logout(); navigate('/login') }}>Salir</button>
        </div>
      </header>
      <main style={{ flex: 1, overflowY: 'auto', paddingBottom: '90px' }}>{children}</main>
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--theme-surface)',
        borderTop: '1px solid var(--theme-border)',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '0.5rem 0 calc(0.5rem + env(safe-area-inset-bottom))',
        zIndex: 100
      }}>
        <NavBtn label="Scan" path="/scan" current={location.pathname} onClick={() => navigate('/scan')}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="18" width="3" height="3"/><rect x="18" y="14" width="3" height="3"/></svg>} />
        <NavBtn label="Inicio" path="/" exact current={location.pathname} onClick={() => navigate('/')}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>} />
        <NavBtn label="Especies" path="/especies" current={location.pathname} onClick={() => navigate('/especies')}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 4 13c0-6 7-11 7-11s7 5 7 11a7 7 0 0 1-7 7Z"></path><path d="M11 20v-6"></path></svg>} />
      </nav>
    </div>
  )
}

function NavBtn({ icon, label, path, exact, current, onClick }) {
  const active = exact ? current === path : (current === path || current.startsWith(path + '/'))
  return (
    <button
      style={{
        background: 'none',
        border: 'none',
        color: active ? 'var(--theme-primary)' : 'var(--theme-text-muted)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        cursor: 'pointer',
        padding: '0.25rem 1rem'
      }}
      onClick={onClick}
    >
      {icon}
      <span style={{ fontSize: '0.65rem' }}>{label}</span>
    </button>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TimerProvider>
          <UpdateModal />
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
                      <Route path="/elementos" element={<ElementosList />} />
                      <Route path="/elemento/:id" element={<ElementoDetail />} />
                      <Route path="/especies" element={<EspeciesList />} />
                      <Route path="/especies/:id" element={<EspecieDetail />} />
                      <Route path="/experimentos/:id" element={<ExperimentoDetail />} />
                      <Route path="/protocolos" element={<ProtocolosList />} />
                      <Route path="/protocolos/nuevo" element={<ProtocoloEditor />} />
                      <Route path="/protocolos/:id" element={<ProtocoloEditor />} />
                      <Route path="/protocolos/:id/ejecutar" element={<ProtocolExecution />} />
                      <Route path="/lab" element={<MediosList />} />
                      <Route path="/reactivos" element={<ReactivosList />} />
                      <Route path="/formulaciones" element={<FormulacionesList />} />
                      <Route path="/lotes" element={<LotesPreparadosList />} />
                      <Route path="/calculadoras" element={<Calculators />} />
                      <Route path="/logs" element={<Logs />} />
                      <Route path="*" element={<ComingSoon />} />
                    </Routes>
                  </Layout>
                </PrivateRoute>
              } />
            </Routes>
          </BrowserRouter>
        </TimerProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

function ComingSoon() {
  return (
    <div className="page-container" style={{ textAlign: 'center' }}>
      <p className="text-primary" style={{ fontSize: '1rem' }}>Sección en desarrollo</p>
    </div>
  )
}
