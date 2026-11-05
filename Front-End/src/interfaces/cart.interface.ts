export type EstadoCarrito = 'ACTIVO' | 'PROCESANDO' | 'CONVERTIDO_EN_ORDEN' | 'ABANDONADO'

export interface ItemCarrito {
  idItemCarrito: number
  idProductoRef: number
  cantidad: number
  precioUnitarioClp: number
  fechaAgregado?: string
  // Datos opcionales para renderizar en vista
  tituloProducto?: string
  urlImagen?: string
}

export interface Carrito {
  idCarrito: number
  idUsuarioRef?: number
  tokenSesionInvitado?: string
  estado: EstadoCarrito
  items: ItemCarrito[]
  fechaCreacion?: string
  fechaActualizacion?: string
}
