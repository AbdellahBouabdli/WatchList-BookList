import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function AdminRoute() {
  const { user, isAdmin, loading } = useAuth()

  if (loading) {
    return <div className="loading uppercase bold">Verifying Admin Access...</div>
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
