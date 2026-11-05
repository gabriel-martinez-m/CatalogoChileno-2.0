export type RolUsuario = 'ROLE_CLIENTE' | 'ROLE_ARTISTA' | 'ROLE_ADMINISTRADOR'

export interface UserSession {
  correo: string
  token: string
  idUsuario: number
  nombre: string
  rol: RolUsuario
}

export interface LoginCredentials {
  correo: string
  contrasena: string
}
