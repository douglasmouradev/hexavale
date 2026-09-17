import { Navigate, Outlet } from 'react-router-dom'
import { useApp } from '@/context/AppContext'

export function ProtectedRoute() {
  const { propriedade } = useApp()

  if (!propriedade) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
