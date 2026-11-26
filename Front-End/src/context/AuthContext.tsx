import React, { createContext, useContext, useState } from 'react'
import type { RegisterData, UserSession } from '@/interfaces/auth.interface'
import { authService } from '@/services/auth.service'

interface AuthContextType {
  session: UserSession | null
  login: (correo: string, contrasena: string) => Promise<UserSession>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<UserSession | null>(() => authService.getCurrentSession())

  const login = async (correo: string, contrasena: string): Promise<UserSession> => {
    const newSession = await authService.login(correo, contrasena)
    setSession(newSession)
    return newSession
  }

  const register = async (data: RegisterData): Promise<void> => {
    await authService.registrar(data)
  }

  const logout = (): void => {
    authService.logout()
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ session, login, register, logout, isAuthenticated: !!session }}>
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
