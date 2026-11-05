import React, { createContext, useContext, useState, useEffect } from 'react'
import type { UserSession } from '@/interfaces/auth.interface'
import { authService } from '@/services/auth.service'

interface AuthContextType {
  session: UserSession | null
  login: (correo: string, contrasena: string) => Promise<UserSession>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<UserSession | null>(null)

  useEffect(() => {
    const current = authService.getCurrentSession()
    if (current) {
      setSession(current)
    }
  }, [])

  const login = async (correo: string, contrasena: string) => {
    const newSession = await authService.login(correo, contrasena)
    setSession(newSession)
    return newSession
  }

  const logout = () => {
    authService.logout()
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ session, login, logout, isAuthenticated: !!session }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}
