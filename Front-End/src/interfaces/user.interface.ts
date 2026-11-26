export type TipoCuenta = 'CORRIENTE' | 'VISTA' | 'RUT' | 'AHORRO'

export interface PerfilArtista {
  idPerfilArtista: number
  nombreArtistico: string
  biografia: string
  fotoCarnetAnversoRuta?: string
  fotoCarnetReversoRuta?: string
}

export interface DatosBancarios {
  idDatosBancarios: number
  bancoNombre: string
  tipoCuenta: TipoCuenta
  numeroCuenta: string
  rutTitular: string
}

export interface UsuarioPerfil {
  idUsuario: number
  idCredencialRef: number
  nombreCompleto: string
  rutChileno: string
  telefono?: string
  estaVerificado: boolean
  fechaRegistro: string
  perfilArtista?: PerfilArtista | null
  datosBancarios?: DatosBancarios | null
}

export interface SolicitudArtistaData {
  nombreArtistico: string
  biografia: string
  fotoAnverso: string
  fotoReverso: string
  bancoNombre: string
  tipoCuenta: TipoCuenta
  numeroCuenta: string
  rutTitular: string
}
