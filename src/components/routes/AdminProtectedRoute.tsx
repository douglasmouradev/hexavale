/** Painel só com token JWT válido (login em /admin/login). */
import { Navigate, Outlet } from 'react-router-dom'
import { getAdminToken } from '@/lib/adminApi'

export function AdminProtectedRoute() {
  if (!getAdminToken()) {
    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}
