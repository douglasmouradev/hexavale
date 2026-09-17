/**
 * HexaVale — PWA de campo para manga e uva.
 * Rotas públicas (login, política) vs. área do produtor e painel admin.
 * Páginas entram com lazy para o login não carregar o caderno inteiro.
 */
import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
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
const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((module) => ({
    default: module.DashboardPage,
  })),
)
const ProdutorPage = lazy(() =>
  import('@/pages/ProdutorPage').then((module) => ({
    default: module.ProdutorPage,
  })),
)
const CaldaOrganicaPage = lazy(() =>
  import('@/pages/CaldaOrganicaPage').then((module) => ({
    default: module.CaldaOrganicaPage,
  })),
)
const InsumosPage = lazy(() =>
  import('@/pages/InsumosPage').then((module) => ({
    default: module.InsumosPage,
  })),
)
const MaoDeObraPage = lazy(() =>
  import('@/pages/MaoDeObraPage').then((module) => ({
    default: module.MaoDeObraPage,
  })),
)
const CicloCulturaPage = lazy(() =>
  import('@/pages/CicloCulturaPage').then((module) => ({
    default: module.CicloCulturaPage,
  })),
)
const MeusDadosPage = lazy(() =>
  import('@/pages/MeusDadosPage').then((module) => ({
    default: module.MeusDadosPage,
  })),
)
const CatalogoPage = lazy(() =>
  import('@/pages/CatalogoPage').then((module) => ({
    default: module.CatalogoPage,
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
          <RouteErrorBoundary>
          <Suspense fallback={<Carregando />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/privacidade" element={<PrivacidadePage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<AdminProtectedRoute />}>
                <Route index element={<AdminVideosPage />} />
              </Route>
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/produtor" element={<ProdutorPage />} />
                  <Route path="/calda" element={<CaldaOrganicaPage />} />
                  <Route path="/custo-calda" element={<CustoCaldaPage />} />
                  <Route path="/regulador" element={<ReguladorPage />} />
                  <Route path="/calendario" element={<CalendarioPage />} />
                  <Route path="/insumos" element={<InsumosPage />} />
                  <Route path="/mao-de-obra" element={<MaoDeObraPage />} />
                  <Route path="/ciclo" element={<CicloCulturaPage />} />
                  <Route path="/meus-dados" element={<MeusDadosPage />} />
                  <Route path="/catalogo" element={<CatalogoPage />} />
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
