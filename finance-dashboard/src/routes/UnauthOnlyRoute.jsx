import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const UnauthOnlyRoute = () => {
  const { user } = useAuth()

  if (!user) {
    return <Outlet />
  }

  return <Navigate to={user.role === 'admin' ? '/admin' : '/user'} replace />
}
