import type { OrdenConfirmada } from '@/interfaces/cart.interface'
import type { Producto } from '@/interfaces/product.interface'

export const PORCENTAJE_FEE = 0.15

export type EstadoLiquidacion = 'PENDIENTE_DIA_5' | 'LIQUIDADO'

export interface RegistroVenta {
  id: string
  numeroOrden: string
  fecha: string
  idProducto: number
  tituloObra: string
  idArtista: number
  compradorCorreo: string
  medioPago: string
  montoBrutoClp: number
  feePlataformaClp: number
  netoArtistaClp: number
  estadoLiquidacion: EstadoLiquidacion
  fechaLiquidacion?: string
}

const STORAGE_KEY = 'catalogochileno_ventas'

const VENTAS_INICIALES: RegistroVenta[] = [
  {
    id: 'V-101',
    numeroOrden: 'ORD-2026-410288',
    fecha: '2026-11-12',
    idProducto: 1,
    tituloObra: 'Atardecer en Cuernos del Paine',
    idArtista: 2,
    compradorCorreo: 'cliente@test.cl',
    medioPago: 'WEBPAY_PLUS',
    montoBrutoClp: 24990,
    feePlataformaClp: Math.round(24990 * PORCENTAJE_FEE),
    netoArtistaClp: 24990 - Math.round(24990 * PORCENTAJE_FEE),
    estadoLiquidacion: 'PENDIENTE_DIA_5',
  },
  {
    id: 'V-102',
    numeroOrden: 'ORD-2026-589104',
    fecha: '2026-11-18',
    idProducto: 2,
    tituloObra: 'Vuelo Dron 4K sobre Cerros de Valparaíso',
    idArtista: 2,
    compradorCorreo: 'agencia@medios.cl',
    medioPago: 'WEBPAY_PLUS',
    montoBrutoClp: 39990,
    feePlataformaClp: Math.round(39990 * PORCENTAJE_FEE),
    netoArtistaClp: 39990 - Math.round(39990 * PORCENTAJE_FEE),
    estadoLiquidacion: 'PENDIENTE_DIA_5',
  },
  {
    id: 'V-103',
    numeroOrden: 'ORD-2026-731920',
    fecha: '2026-11-24',
    idProducto: 5,
    tituloObra: 'Desembocadura del Río Biobío al Atardecer',
    idArtista: 2,
    compradorCorreo: 'diseno@estudio.cl',
    medioPago: 'MERCADOPAGO',
    montoBrutoClp: 22990,
    feePlataformaClp: Math.round(22990 * PORCENTAJE_FEE),
    netoArtistaClp: 22990 - Math.round(22990 * PORCENTAJE_FEE),
    estadoLiquidacion: 'PENDIENTE_DIA_5',
  },
]

function leerVentas(): RegistroVenta[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(VENTAS_INICIALES))
    return VENTAS_INICIALES
  }
  try {
    return JSON.parse(raw) as RegistroVenta[]
  } catch {
    return VENTAS_INICIALES
  }
}

function guardarVentas(ventas: RegistroVenta[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ventas))
}

export const salesService = {
  getVentas(): RegistroVenta[] {
    return leerVentas()
  },

  getVentasPorArtista(idArtista: number): RegistroVenta[] {
    return leerVentas().filter((v) => v.idArtista === idArtista)
  },

  /**
   * Registra en el libro de ventas cada obra comprada en Checkout para
   * contabilizar el FEE (15%) y acumular el saldo mensual del artista.
   */
  registrarVentaOrden(orden: OrdenConfirmada, productosMap: Record<number, Producto>): void {
    const actuales = leerVentas()
    const fechaHoy = new Date().toISOString().slice(0, 10)

    const nuevas: RegistroVenta[] = orden.items.map((item, idx) => {
      const bruto = item.precioUnitarioClp
      const fee = Math.round(bruto * PORCENTAJE_FEE)
      const producto = productosMap[item.idProducto]

      return {
        id: `V-${Date.now()}-${idx}`,
        numeroOrden: orden.numeroOrden,
        fecha: fechaHoy,
        idProducto: item.idProducto,
        tituloObra: item.titulo,
        idArtista: producto?.idArtista ?? 2,
        compradorCorreo: orden.compradorCorreo,
        medioPago: orden.medioPago,
        montoBrutoClp: bruto,
        feePlataformaClp: fee,
        netoArtistaClp: bruto - fee,
        estadoLiquidacion: 'PENDIENTE_DIA_5',
      }
    })

    guardarVentas([...nuevas, ...actuales])
  },

  /**
   * Ejecuta o simula la liquidación automática mensual del día 5.
   */
  liquidarPendientes(): RegistroVenta[] {
    const hoy = new Date().toISOString().slice(0, 10)
    const actualizadas = leerVentas().map((v) =>
      v.estadoLiquidacion === 'PENDIENTE_DIA_5'
        ? { ...v, estadoLiquidacion: 'LIQUIDADO' as const, fechaLiquidacion: hoy }
        : v,
    )
    guardarVentas(actualizadas)
    return actualizadas
  },

  /**
   * Calcula la próxima fecha de pago automático (día 5 de cada mes).
   */
  getProximoPagoDia5(): { fechaTexto: string; diasRestantes: number } {
    const hoy = new Date()
    const ano = hoy.getFullYear()
    const mes = hoy.getMonth()
    const target = hoy.getDate() <= 5 ? new Date(ano, mes, 5) : new Date(ano, mes + 1, 5)
    const diffMs = target.getTime() - new Date(ano, mes, hoy.getDate()).getTime()
    const diasRestantes = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
    const fechaTexto = target.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
    return { fechaTexto, diasRestantes }
  },
}
