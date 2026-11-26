import { GATEWAY_URL, handleApiResponse } from './api.config'
import type { Categoria, Comuna, CrearProductoData, Producto, Region } from '@/interfaces/product.interface'

export const artistService = {
  async getCategorias(): Promise<Categoria[]> {
    const response = await fetch(`${GATEWAY_URL}/productos/categorias`)
    return handleApiResponse<Categoria[]>(response)
  },

  async getRegiones(): Promise<Region[]> {
    const response = await fetch(`${GATEWAY_URL}/productos/regiones`)
    return handleApiResponse<Region[]>(response)
  },

  async getComunas(): Promise<Comuna[]> {
    const response = await fetch(`${GATEWAY_URL}/productos/comunas`)
    return handleApiResponse<Comuna[]>(response)
  },

  /**
   * HU-14: Lista todas las obras pertenecientes al artista autenticado.
   */
  async getMisObras(idArtista: number): Promise<Producto[]> {
    const response = await fetch(`${GATEWAY_URL}/productos`)
    const todas = await handleApiResponse<Producto[]>(response)
    return todas.filter((p) => p.idArtista === idArtista)
  },

  /**
   * HU-09, HU-10, HU-11, HU-12: Publica una nueva obra en estado PENDIENTE_REVISION.
   */
  async publicarObra(idArtista: number, data: CrearProductoData): Promise<Producto> {
    const params = new URLSearchParams({
      idArtista: String(idArtista),
      titulo: data.titulo,
      descripcion: data.descripcion,
      precio: String(data.precio),
      tipoMedio: data.tipoMedio,
      tipoVenta: data.tipoVenta,
      idCategoria: String(data.idCategoria),
      idRegion: String(data.idRegion),
      idComuna: String(data.idComuna),
      urlPrevisualizacion: data.urlPrevisualizacion,
    })

    const response = await fetch(`${GATEWAY_URL}/productos?${params.toString()}`, {
      method: 'POST',
    })
    return handleApiResponse<Producto>(response)
  },

  /**
   * HU-14 / HU-45: Pausa o da de baja una obra del catálogo.
   */
  async pausarObra(id: number): Promise<void> {
    const response = await fetch(`${GATEWAY_URL}/productos/${id}`, { method: 'DELETE' })
    await handleApiResponse<unknown>(response)
  },
}
