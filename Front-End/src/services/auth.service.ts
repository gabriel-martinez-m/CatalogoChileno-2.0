import { GATEWAY_URL, handleApiResponse } from './api.config'
import type { UserSession } from '@/interfaces/auth.interface'

export const authService = {
  /**
   * Autentica credenciales en servicio-autenticacion (via Gateway)
   */
  async login(correo: string, contrasena: string): Promise<UserSession> {
    const params = new URLSearchParams({ correo, contrasena })
    const response = await fetch(`${GATEWAY_URL}/auth/login?${params.toString()}`, {
      method: 'POST',
    })

    const token = await handleApiResponse<string>(response)

    // Decodificar payload básico o asignar datos de sesión para la demo
    const esArtista = correo.includes('artista')
    const session: UserSession = {
      correo,
      token,
      idUsuario: esArtista ? 2 : 1,
      nombre: esArtista ? 'Matías Valenzuela (Artista)' : 'Gabriel Martínez (Cliente)',
      rol: esArtista ? 'ROLE_ARTISTA' : 'ROLE_CLIENTE',
    }

    localStorage.setItem('auth_session', JSON.stringify(session))
    return session
  },

  getCurrentSession(): UserSession | null {
    const data = localStorage.getItem('auth_session')
    if (!data) return null
    try {
      return JSON.parse(data) as UserSession
    } catch {
      return null
    }
  },

  logout(): void {
    localStorage.removeItem('auth_session')
  },
}
