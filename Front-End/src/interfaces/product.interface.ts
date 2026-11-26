export type TipoMedio = 'FOTO' | 'VIDEO' | 'AUDIO'
export type TipoVenta = 'VENTA_NORMAL' | 'SUBASTA'
export type EstadoProducto = 'APROBADO' | 'PENDIENTE_REVISION' | 'RECHAZADO' | 'INACTIVO'

export interface Categoria {
  id: number
  nombre: string
  slug: string
  descripcion?: string
}

export interface Region {
  id: number
  codigo: string
  nombre: string
}

export interface Comuna {
  id: number
  nombre: string
}

export interface Producto {
  id: number
  idArtista: number
  titulo: string
  descripcion?: string
  precio: number
  tipoMedio: TipoMedio
  tipoVenta: TipoVenta
  estado: EstadoProducto
  formato?: string
  ancho?: number
  alto?: number
  duracionSegundos?: number
  urlPrevisualizacion?: string
  categoria?: Categoria
  region?: Region
  comuna?: Comuna
  fechaCreacion?: string
}

export interface CrearProductoData {
  titulo: string
  descripcion: string
  precio: number
  tipoMedio: TipoMedio
  tipoVenta: TipoVenta
  idCategoria: number
  idRegion: number
  idComuna: number
  urlPrevisualizacion: string
}
