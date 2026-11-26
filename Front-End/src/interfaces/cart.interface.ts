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

export type MedioPago = 'WEBPAY_PLUS' | 'MERCADOPAGO' | 'TRANSFERENCIA'
export type TipoComprobante = 'BOLETA' | 'FACTURA'

export interface ItemOrdenResumen {
  idProducto: number
  titulo: string
  ciudad: string
  formato: string
  urlImagen: string
  cantidad: number
  precioUnitarioClp: number
}

export interface OrdenConfirmada {
  numeroOrden: string
  codigoAutorizacion: string
  fechaHora: string
  compradorNombre: string
  compradorCorreo: string
  tipoComprobante: TipoComprobante
  medioPago: MedioPago
  totalClp: number
  items: ItemOrdenResumen[]
}
