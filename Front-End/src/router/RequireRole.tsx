import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import type { RolUsuario } from '@/interfaces/auth.interface'

interface RequireRoleProps {
  rol: RolUsuario | RolUsuario[]
}

/**
 * Protege un grupo de rutas: sin sesión redirige a /login y sin el rol permitido a /.
 */
export const RequireRole: React.FC<RequireRoleProps> = ({ rol }) => {
  const { session } = useAuth()

  if (!session) return <Navigate to="/login" replace />

  const rolesPermitidos = Array.isArray(rol) ? rol : [rol]
  if (!rolesPermitidos.includes(session.rol)) return <Navigate to="/" replace />

  return <Outlet />
}
