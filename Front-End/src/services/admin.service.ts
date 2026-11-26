import { GATEWAY_URL, handleApiResponse } from './api.config'
import type { Producto } from '@/interfaces/product.interface'
import type { UsuarioPerfil } from '@/interfaces/user.interface'

export const adminService = {
  /**
   * HU-96: Aprueba una obra pendiente para publicarla en el catálogo.
   */
  async aprobarProducto(id: number): Promise<Producto> {
    const response = await fetch(`${GATEWAY_URL}/productos/${id}/aprobar`, { method: 'PUT' })
    return handleApiResponse<Producto>(response)
  },

  /**
   * HU-96: Rechaza una obra indicando el motivo de la moderación.
   */
  async rechazarProducto(id: number, motivo: string): Promise<Producto> {
    const params = new URLSearchParams({ motivo })
    const response = await fetch(`${GATEWAY_URL}/productos/${id}/rechazar?${params.toString()}`, {
      method: 'PUT',
    })
    return handleApiResponse<Producto>(response)
  },

  /**
   * HU-35: Da de baja una obra del catálogo (queda INACTIVA).
   */
  async desactivarProducto(id: number): Promise<void> {
    const response = await fetch(`${GATEWAY_URL}/productos/${id}`, { method: 'DELETE' })
    await handleApiResponse<unknown>(response)
  },

  /**
   * HU-69: Lista todos los perfiles de usuario registrados en la plataforma.
   */
  async getUsuarios(): Promise<UsuarioPerfil[]> {
    const response = await fetch(`${GATEWAY_URL}/usuarios`)
    return handleApiResponse<UsuarioPerfil[]>(response)
  },

  /**
   * HU-69: Aprueba o revoca la verificación de identidad KYC de un artista.
   */
  async verificarArtista(idUsuario: number, verificado: boolean): Promise<void> {
    const response = await fetch(
      `${GATEWAY_URL}/usuarios/${idUsuario}/verificar?verificado=${verificado}`,
      { method: 'PUT' },
    )
    await handleApiResponse<unknown>(response)
  },
}
