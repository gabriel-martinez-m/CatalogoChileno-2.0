import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import type { RolUsuario } from '@/interfaces/auth.interface'

interface RequireRoleProps {
  rol: RolUsuario
}

/**
 * Protege un grupo de rutas: sin sesión redirige a /login y con otro rol a /.
 */
export const RequireRole: React.FC<RequireRoleProps> = ({ rol }) => {
  const { session } = useAuth()

  if (!session) return <Navigate to="/login" replace />
  if (session.rol !== rol) return <Navigate to="/" replace />

  return <Outlet />
}
