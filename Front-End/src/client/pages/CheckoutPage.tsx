import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  CreditCard,
  ShieldCheck,
  Lock,
  Mail,
  Building2,
  Receipt,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { productService } from '@/services/product.service'
import { salesService } from '@/services/sales.service'
import type { Producto } from '@/interfaces/product.interface'
import type {
  ItemOrdenResumen,
  MedioPago,
  OrdenConfirmada,
  TipoComprobante,
} from '@/interfaces/cart.interface'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const formatCLP = (monto: number): string =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(monto)

const MEDIOS_PAGO: { id: MedioPago; titulo: string; subtitulo: string; recomendado?: boolean }[] = [
  {
    id: 'WEBPAY_PLUS',
    titulo: 'Webpay Plus (Transbank)',
    subtitulo: 'Tarjetas de Débito, Crédito o Prepago chilenas',
    recomendado: true,
  },
  {
    id: 'MERCADOPAGO',
    titulo: 'Mercado Pago',
    subtitulo: 'Saldo en cuenta o tarjetas asociadas',
  },
  {
    id: 'TRANSFERENCIA',
    titulo: 'Transferencia Bancaria (Khipu)',
    subtitulo: 'Pago directo desde tu banco en línea',
  },
]

export const CheckoutPage: React.FC = () => {
  const { cart, itemCount, totalAmount, checkoutCart } = useCart()
  const { session } = useAuth()
  const navigate = useNavigate()

  const [productosMap, setProductosMap] = useState<Record<number, Producto>>({})
  const [nombre, setNombre] = useState<string>(session?.nombre || '')
  const [correo, setCorreo] = useState<string>(session?.correo || '')
  const [tipoComprobante, setTipoComprobante] = useState<TipoComprobante>('BOLETA')
  const [rutEmpresa, setRutEmpresa] = useState<string>('')
  const [razonSocial, setRazonSocial] = useState<string>('')
  const [medioPago, setMedioPago] = useState<MedioPago>('WEBPAY_PLUS')

  const [error, setError] = useState<string | null>(null)
  const [mostrarPasarela, setMostrarPasarela] = useState<boolean>(false)
  const [procesandoPago, setProcesandoPago] = useState<boolean>(false)

  useEffect(() => {
    if (session) {
      setNombre(session.nombre)
      setCorreo(session.correo)
    }
  }, [session])

  useEffect(() => {
    const cargar = async (): Promise<void> => {
      try {
        const lista = await productService.getProductosPorEstado()
        const mapa: Record<number, Producto> = {}
        lista.forEach((p) => {
          mapa[p.id] = p
        })
        setProductosMap(mapa)
      } catch {
        // fallback silencioso
      }
    }
    cargar()
  }, [])

  const items = cart?.items ?? []

  const abrirSimuladorPago = (e: React.FormEvent): void => {
    e.preventDefault()
    setError(null)

    if (!correo.trim() || !correo.includes('@')) {
      setError('Ingresa un correo electrónico válido para enviarte las descargas y tu licencia.')
      return
    }
    if (tipoComprobante === 'FACTURA' && (!rutEmpresa.trim() || !razonSocial.trim())) {
      setError('Para emitir Factura debes completar el RUT y la Razón Social de la empresa.')
      return
    }

    setMostrarPasarela(true)
  }

  const confirmarPagoExitoso = async (): Promise<void> => {
    setProcesandoPago(true)
    setError(null)

    try {
      const resumenItems: ItemOrdenResumen[] = items.map((item) => {
        const info = productosMap[item.idProductoRef]
        return {
          idProducto: item.idProductoRef,
          titulo: info?.titulo || `Obra Digital #${item.idProductoRef}`,
          ciudad: info?.comuna?.nombre || 'Chile',
          formato: info?.tipoMedio || 'FOTO',
          urlImagen: info?.urlPrevisualizacion || '/images/01.jpg',
          cantidad: item.cantidad,
          precioUnitarioClp: item.precioUnitarioClp,
        }
      })

      const totalSnapshot = totalAmount

      // Simula latencia de autorización bancaria y procesa el carrito real en MySQL
      await new Promise((r) => setTimeout(r, 1200))
      await checkoutCart()

      const orden: OrdenConfirmada = {
        numeroOrden: `ORD-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
        codigoAutorizacion: String(Math.floor(100000 + Math.random() * 900000)),
        fechaHora: new Date().toLocaleString('es-CL'),
        compradorNombre: nombre.trim() || 'Cliente Invitado',
        compradorCorreo: correo.trim(),
        tipoComprobante,
        medioPago,
        totalClp: totalSnapshot,
        items: resumenItems,
      }

      salesService.registrarVentaOrden(orden, productosMap)
      sessionStorage.setItem('ultima_orden', JSON.stringify(orden))
      navigate('/compra-exitosa', { state: { orden } })
    } catch (err: unknown) {
      setMostrarPasarela(false)
      setError(
        err instanceof Error
          ? err.message
          : 'No pudimos completar la orden. Tu carrito sigue guardado para reintentar.',
      )
    } finally {
      setProcesandoPago(false)
    }
  }

  const simularPagoRechazado = (): void => {
    setMostrarPasarela(false)
    setError(
      'Pago rechazado por el emisor (fondos insuficientes o cancelación del usuario). Tu carrito sigue intacto para que intentes nuevamente.',
    )
  }

  if (items.length === 0) {
    return (
      <Card className="max-w-lg mx-auto my-12 py-12 px-6 text-center space-y-4">
        <CreditCard className="w-10 h-10 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">No hay productos por pagar</h2>
        <p className="text-sm text-slate-500">
          Agrega obras a tu carrito antes de continuar al proceso de pago.
        </p>
        <Link to="/">
          <Button>Ir al Catálogo</Button>
        </Link>
      </Card>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Lock className="w-6 h-6 text-[#0000FE]" />
            <span>Finalizar Compra</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Completa tus datos de entrega y elige tu medio de pago
          </p>
        </div>

        <Link to="/carrito">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al Carrito</span>
          </Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">No se pudo procesar el pago</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={abrirSimuladorPago} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Columna Izquierda: Datos y Medio de Pago */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Datos de Entrega */}
          <Card className="border-slate-200/80">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#0000FE]" />
                  <span>1. Datos para Descarga y Licencia</span>
                </CardTitle>
                {!session && <Badge variant="secondary">Modo Invitado</Badge>}
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Nombre completo</label>
                  <Input
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Tu nombre"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Correo electrónico</label>
                  <Input
                    type="email"
                    required
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="correo@ejemplo.cl"
                  />
                </div>
              </div>

              {/* Boleta o Factura */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-[#0000FE]" />
                  <span>Tipo de documento tributario</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['BOLETA', 'FACTURA'] as TipoComprobante[]).map((tipo) => (
                    <button
                      key={tipo}
                      type="button"
                      onClick={() => setTipoComprobante(tipo)}
                      className={cn(
                        'py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2',
                        tipoComprobante === tipo
                          ? 'border-[#0000FE] bg-[#F3F5FE] text-[#0000FE]'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300',
                      )}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{tipo === 'BOLETA' ? 'Boleta Electrónica' : 'Factura Empresa'}</span>
                    </button>
                  ))}
                </div>

                {tipoComprobante === 'FACTURA' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <Input
                      required
                      value={rutEmpresa}
                      onChange={(e) => setRutEmpresa(e.target.value)}
                      placeholder="RUT Empresa (76.123.456-7)"
                    />
                    <Input
                      required
                      value={razonSocial}
                      onChange={(e) => setRazonSocial(e.target.value)}
                      placeholder="Razón Social SpA"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 2. Medio de Pago */}
          <Card className="border-slate-200/80">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#0000FE]" />
                <span>2. Selecciona tu Medio de Pago</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-4 space-y-3">
              {MEDIOS_PAGO.map((m) => {
                const seleccionado = medioPago === m.id
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMedioPago(m.id)}
                    className={cn(
                      'w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer',
                      seleccionado
                        ? 'border-[#0000FE] bg-[#F3F5FE]/60 ring-2 ring-[#0000FE]/10'
                        : 'border-slate-200 hover:border-slate-300 bg-white',
                    )}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{m.titulo}</span>
                        {m.recomendado && (
                          <Badge variant="default" className="text-[10px]">
                            Recomendado
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{m.subtitulo}</p>
                    </div>
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                        seleccionado ? 'border-[#0000FE]' : 'border-slate-300',
                      )}
                    >
                      {seleccionado && <div className="w-2.5 h-2.5 rounded-full bg-[#0000FE]" />}
                    </div>
                  </button>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* Columna Derecha: Resumen Final */}
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <Card className="border-slate-200/80 shadow-md">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900">
                Resumen del Pedido ({itemCount})
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {items.map((item) => {
                  const info = productosMap[item.idProductoRef]
                  return (
                    <div key={item.idItemCarrito} className="flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={info?.urlPrevisualizacion || '/images/01.jpg'}
                          alt={info?.titulo || 'Obra'}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/01.jpg'
                          }}
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">
                            {info?.titulo || `Obra #${item.idProductoRef}`}
                          </p>
                          <p className="text-slate-500">1 Licencia Comercial</p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900 shrink-0">
                        {formatCLP(item.precioUnitarioClp * item.cantidad)}
                      </span>
                    </div>
                  )
                })}
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatCLP(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Comisión de servicio</span>
                  <span className="text-emerald-600 font-semibold">$0 (Incluido)</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-900">Total a Pagar</span>
                  <span className="text-2xl font-extrabold text-[#0000FE]">
                    {formatCLP(totalAmount)}
                  </span>
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full gap-2 font-bold">
                <CreditCard className="w-4 h-4" />
                <span>Pagar {formatCLP(totalAmount)}</span>
              </Button>

              <p className="text-[11px] text-center text-slate-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Entorno de simulación segura (Transbank Sandbox)
              </p>
            </CardContent>
          </Card>
        </div>
      </form>

      {/* Modal Simulador de Pasarela Webpay Plus */}
      {mostrarPasarela && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-[#1B1464] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/70">Pasarela de Pagos</p>
                <p className="text-lg font-extrabold tracking-tight">Webpay Plus</p>
              </div>
              <Badge className="bg-white/15 text-white border-none text-[10px]">
                Simulador
              </Badge>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-xs border border-slate-200/80">
                <div className="flex justify-between">
                  <span className="text-slate-500">Comercio:</span>
                  <span className="font-bold text-slate-900">CatálogoChileno SpA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Comprador:</span>
                  <span className="font-semibold text-slate-900">{correo}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 items-baseline">
                  <span className="text-slate-700 font-bold">Monto a autorizar:</span>
                  <span className="text-xl font-extrabold text-[#0000FE]">{formatCLP(totalAmount)}</span>
                </div>
              </div>

              {procesandoPago ? (
                <div className="py-6 text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-[#0000FE] animate-spin mx-auto" />
                  <p className="text-sm font-semibold text-slate-700">
                    Autorizando pago y generando licencias...
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <Button
                    type="button"
                    size="lg"
                    className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 font-bold"
                    onClick={confirmarPagoExitoso}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirmar Pago Exitoso</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2 text-red-600 border-red-200 hover:bg-red-50"
                    onClick={simularPagoRechazado}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Simular Pago Rechazado</span>
                  </Button>

                  <button
                    type="button"
                    onClick={() => setMostrarPasarela(false)}
                    className="w-full text-center text-xs text-slate-400 hover:text-slate-600 pt-1 cursor-pointer"
                  >
                    Cancelar y volver
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
