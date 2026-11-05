import { GATEWAY_URL, handleApiResponse } from './api.config'
import type { Producto } from '@/interfaces/product.interface'

export const productService = {
  /**
   * Obtiene la lista de obras aprobadas desde servicio-catalogo (via Gateway)
   */
  async getProductos(): Promise<Producto[]> {
    const response = await fetch(`${GATEWAY_URL}/productos?estado=APROBADO`)
    return handleApiResponse<Producto[]>(response)
  },

  /**
   * Obtiene el detalle de un producto específico
   */
  async getProductoById(id: number): Promise<Producto> {
    const response = await fetch(`${GATEWAY_URL}/productos/${id}`)
    return handleApiResponse<Producto>(response)
  },
}
