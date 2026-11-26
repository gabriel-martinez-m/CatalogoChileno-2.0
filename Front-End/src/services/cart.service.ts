import { GATEWAY_URL, handleApiResponse } from './api.config'
import type { Carrito } from '@/interfaces/cart.interface'

export const cartService = {
  /**
   * Obtiene o crea el carrito activo del usuario desde servicio-carrito (via Gateway)
   */
  async getCarrito(idUsuarioRef?: number): Promise<Carrito> {
    const params = new URLSearchParams()
    if (idUsuarioRef) {
      params.append('idUsuarioRef', idUsuarioRef.toString())
    } else {
      params.append('tokenInvitado', 'invitado-demo-session')
    }

    const response = await fetch(`${GATEWAY_URL}/carrito?${params.toString()}`)
    return handleApiResponse<Carrito>(response)
  },

  /**
   * Agrega un producto al carrito invocando la validación Feign en backend
   */
  async agregarItem(
    idProductoRef: number,
    cantidad: number,
    precioUnitarioClp: number,
    idUsuarioRef?: number
  ): Promise<Carrito> {
    const params = new URLSearchParams({
      idProductoRef: idProductoRef.toString(),
      cantidad: cantidad.toString(),
      precioUnitarioClp: precioUnitarioClp.toString(),
    })

    if (idUsuarioRef) {
      params.append('idUsuarioRef', idUsuarioRef.toString())
    } else {
      params.append('tokenInvitado', 'invitado-demo-session')
    }

    const response = await fetch(`${GATEWAY_URL}/carrito/items?${params.toString()}`, {
      method: 'POST',
    })

    return handleApiResponse<Carrito>(response)
  },

  /**
   * Actualiza la cantidad de un ítem existente en el carrito
   */
  async actualizarCantidad(idItem: number, nuevaCantidad: number): Promise<Carrito> {
    const response = await fetch(
      `${GATEWAY_URL}/carrito/items/${idItem}?nuevaCantidad=${nuevaCantidad}`,
      { method: 'PUT' },
    )
    return handleApiResponse<Carrito>(response)
  },

  /**
   * Elimina un ítem del carrito
   */
  async eliminarItem(idCarrito: number, idProductoRef: number): Promise<Carrito> {
    const response = await fetch(`${GATEWAY_URL}/carrito/${idCarrito}/items/${idProductoRef}`, {
      method: 'DELETE',
    })
    return handleApiResponse<Carrito>(response)
  },

  /**
   * Vacía el carrito por completo
   */
  async vaciarCarrito(idCarrito: number): Promise<void> {
    await fetch(`${GATEWAY_URL}/carrito/${idCarrito}/vaciar`, {
      method: 'DELETE',
    })
  },

  /**
   * Marca el carrito como PROCESADO al confirmar el pago en Checkout
   */
  async procesarCarrito(idCarrito: number): Promise<void> {
    const response = await fetch(`${GATEWAY_URL}/carrito/${idCarrito}/procesar`, {
      method: 'PUT',
    })
    await handleApiResponse<unknown>(response)
  },
}
