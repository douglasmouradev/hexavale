import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { AdminProtectedRoute } from '@/components/routes/AdminProtectedRoute'
import { ProtectedRoute } from '@/components/routes/ProtectedRoute'
import { AdGateProvider } from '@/context/AdContext'
import { AppProvider } from '@/context/AppContext'
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage'
import { AdminVideosPage } from '@/pages/admin/AdminVideosPage'
import { CaldaOrganicaPage } from '@/pages/CaldaOrganicaPage'
import { CicloCulturaPage } from '@/pages/CicloCulturaPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { InsumosPage } from '@/pages/InsumosPage'
import { LoginPage } from '@/pages/LoginPage'
import { MaoDeObraPage } from '@/pages/MaoDeObraPage'
import { ProdutorPage } from '@/pages/ProdutorPage'

export default function App() {
  return (
    <AppProvider>
      <AdGateProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route element={<AdminProtectedRoute />}>
              <Route path="/admin" element={<AdminVideosPage />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/produtor" element={<ProdutorPage />} />
                <Route path="/calda" element={<CaldaOrganicaPage />} />
                <Route path="/insumos" element={<InsumosPage />} />
                <Route path="/mao-de-obra" element={<MaoDeObraPage />} />
                <Route path="/ciclo" element={<CicloCulturaPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AdGateProvider>
    </AppProvider>
  )
}
