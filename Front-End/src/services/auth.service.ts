import { GATEWAY_URL, handleApiResponse } from './api.config'
import type { RegisterData, RolUsuario, UserSession } from '@/interfaces/auth.interface'

interface JwtPayload {
  sub: string
  idCredencial: number
  rol: RolUsuario
  exp: number
}

interface PerfilUsuarioResponse {
  nombreCompleto: string
}

const SESSION_KEY = 'auth_session'

function decodeJwt(token: string): JwtPayload {
  const payload = token.split('.')[1]
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
  const json = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join(''),
  )
  return JSON.parse(json) as JwtPayload
}

async function obtenerNombre(idCredencial: number, respaldo: string): Promise<string> {
  try {
    const response = await fetch(`${GATEWAY_URL}/usuarios/credencial/${idCredencial}`)
    if (!response.ok) return respaldo
    const perfil = (await response.json()) as PerfilUsuarioResponse
    return perfil.nombreCompleto || respaldo
  } catch {
    return respaldo
  }
}

export const authService = {
  /**
   * Autentica credenciales en servicio-autenticacion y deriva rol e identidad
   * desde el JWT emitido (sin selección manual de perfil).
   */
  async login(correo: string, contrasena: string): Promise<UserSession> {
    const params = new URLSearchParams({ correo, contrasena })
    const response = await fetch(`${GATEWAY_URL}/auth/login?${params.toString()}`, {
      method: 'POST',
    })

    const token = await handleApiResponse<string>(response)
    const payload = decodeJwt(token)
    const nombre = await obtenerNombre(payload.idCredencial, correo)

    const session: UserSession = {
      correo: payload.sub,
      token,
      idUsuario: payload.idCredencial,
      nombre,
      rol: payload.rol,
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    return session
  },

  /**
   * Registra una cuenta nueva. Toda cuenta pública nace como cliente.
   */
  async registrar(data: RegisterData): Promise<void> {
    const params = new URLSearchParams({
      correo: data.correo,
      contrasena: data.contrasena,
      rol: 'ROLE_CLIENTE',
      nombre: data.nombre,
      rut: data.rut,
    })
    if (data.telefono) params.set('telefono', data.telefono)

    const response = await fetch(`${GATEWAY_URL}/auth/registro?${params.toString()}`, {
      method: 'POST',
    })
    await handleApiResponse<unknown>(response)
  },

  getCurrentSession(): UserSession | null {
    const data = localStorage.getItem(SESSION_KEY)
    if (!data) return null
    try {
      return JSON.parse(data) as UserSession
    } catch {
      return null
    }
  },

  logout(): void {
    localStorage.removeItem(SESSION_KEY)
  },
}
