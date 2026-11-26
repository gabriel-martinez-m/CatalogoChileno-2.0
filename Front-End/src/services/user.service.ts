import { GATEWAY_URL, handleApiResponse } from './api.config'
import type { SolicitudArtistaData, UsuarioPerfil } from '@/interfaces/user.interface'

export const userService = {
  /**
   * Obtiene el perfil completo de un usuario a partir del ID de su credencial.
   */
  async obtenerPerfilPorCredencial(idCredencial: number): Promise<UsuarioPerfil> {
    const response = await fetch(`${GATEWAY_URL}/usuarios/credencial/${idCredencial}`)
    return handleApiResponse<UsuarioPerfil>(response)
  },

  /**
   * HU-06 & HU-07: Registra el perfil de artista (identidad/carnet) y sus datos bancarios,
   * dejando la cuenta en estado pendiente de verificación administrativa.
   */
  async solicitarSerArtista(idUsuario: number, data: SolicitudArtistaData): Promise<void> {
    const artistaParams = new URLSearchParams({
      nombreArtistico: data.nombreArtistico,
      biografia: data.biografia,
      fotoAnverso: data.fotoAnverso,
      fotoReverso: data.fotoReverso,
    })

    const resArtista = await fetch(
      `${GATEWAY_URL}/usuarios/${idUsuario}/artista?${artistaParams.toString()}`,
      { method: 'POST' },
    )
    await handleApiResponse<unknown>(resArtista)

    const bancoParams = new URLSearchParams({
      bancoNombre: data.bancoNombre,
      tipoCuenta: data.tipoCuenta,
      numeroCuenta: data.numeroCuenta,
      rutTitular: data.rutTitular,
    })

    const resBanco = await fetch(
      `${GATEWAY_URL}/usuarios/${idUsuario}/datos-bancarios?${bancoParams.toString()}`,
      { method: 'PUT' },
    )
    await handleApiResponse<unknown>(resBanco)

    // Marcar como pendiente de revisión manual (HU-69)
    await fetch(`${GATEWAY_URL}/usuarios/${idUsuario}/verificar?verificado=false`, {
      method: 'PUT',
    })
  },
}
