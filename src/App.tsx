/**
 * HexaVale — PWA de campo para a mangueira.
 * Quatro calculadoras: safra, PBZ, calda orgânica e tratos culturais.
 */
import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { AtualizarApp } from '@/components/pwa/AtualizarApp'
import { AdminProtectedRoute } from '@/components/routes/AdminProtectedRoute'
import { ProtectedRoute } from '@/components/routes/ProtectedRoute'
import { RouteErrorBoundary } from '@/components/routes/RouteErrorBoundary'
import { AdGateProvider } from '@/context/AdContext'
import { AppProvider } from '@/context/AppContext'

const LoginPage = lazy(() =>
  import('@/pages/LoginPage').then((module) => ({ default: module.LoginPage })),
)
const PrivacidadePage = lazy(() =>
  import('@/pages/PrivacidadePage').then((module) => ({
    default: module.PrivacidadePage,
  })),
)
const AdminLoginPage = lazy(() =>
  import('@/pages/admin/AdminLoginPage').then((module) => ({
    default: module.AdminLoginPage,
  })),
)
const AdminVideosPage = lazy(() =>
  import('@/pages/admin/AdminVideosPage').then((module) => ({
    default: module.AdminVideosPage,
  })),
)
const AdminLoginsPage = lazy(() =>
  import('@/pages/admin/AdminLoginsPage').then((module) => ({
    default: module.AdminLoginsPage,
  })),
)
const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((module) => ({
    default: module.DashboardPage,
  })),
)
const MeusDadosPage = lazy(() =>
  import('@/pages/MeusDadosPage').then((module) => ({
    default: module.MeusDadosPage,
  })),
)
const CustoCaldaPage = lazy(() =>
  import('@/pages/CustoCaldaPage').then((module) => ({
    default: module.CustoCaldaPage,
  })),
)
const ReguladorPage = lazy(() =>
  import('@/pages/ReguladorPage').then((module) => ({
    default: module.ReguladorPage,
  })),
)
const CalendarioPage = lazy(() =>
  import('@/pages/CalendarioPage').then((module) => ({
    default: module.CalendarioPage,
  })),
)
const CalcularSafraPage = lazy(() =>
  import('@/pages/CalcularSafraPage').then((module) => ({
    default: module.CalcularSafraPage,
  })),
)

/** Fallback enquanto o chunk da rota ainda não chegou. */
function Carregando() {
  return (
    <p className="px-6 py-10 text-center text-sm font-semibold text-soil">
      Carregando…
    </p>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AdGateProvider>
        <BrowserRouter>
          <AtualizarApp />
          <RouteErrorBoundary>
          <Suspense fallback={<Carregando />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/privacidade" element={<PrivacidadePage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<AdminProtectedRoute />}>
                <Route index element={<AdminVideosPage />} />
                <Route path="logins" element={<AdminLoginsPage />} />
              </Route>
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/safra" element={<CalcularSafraPage />} />
                  <Route path="/regulador" element={<ReguladorPage />} />
                  <Route path="/custo-calda" element={<CustoCaldaPage />} />
                  <Route path="/calendario" element={<CalendarioPage />} />
                  <Route path="/meus-dados" element={<MeusDadosPage />} />
                  <Route path="/calda" element={<Navigate to="/custo-calda" replace />} />
                  <Route path="/produtor" element={<Navigate to="/" replace />} />
                  <Route path="/insumos" element={<Navigate to="/regulador" replace />} />
                  <Route path="/mao-de-obra" element={<Navigate to="/calendario" replace />} />
                  <Route path="/ciclo" element={<Navigate to="/safra" replace />} />
                  <Route path="/catalogo" element={<Navigate to="/" replace />} />
                </Route>
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          </RouteErrorBoundary>
        </BrowserRouter>
      </AdGateProvider>
    </AppProvider>
  )
}
