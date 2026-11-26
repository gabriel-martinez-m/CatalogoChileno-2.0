import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingCart,
  Trash2,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Plus,
  Minus,
  MapPin,
  Download,
  FileCheck2,
} from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { productService } from '@/services/product.service'
import type { Producto } from '@/interfaces/product.interface'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const formatCLP = (monto: number): string =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(monto)

export const CartPage: React.FC = () => {
  const { cart, itemCount, totalAmount, isLoading, updateQuantity, removeFromCart, clearCart } = useCart()
  const { session } = useAuth()
  const navigate = useNavigate()
  const [productosMap, setProductosMap] = useState<Record<number, Producto>>({})

  useEffect(() => {
    const cargarCatalogo = async (): Promise<void> => {
      try {
        const lista = await productService.getProductosPorEstado()
        const mapa: Record<number, Producto> = {}
        lista.forEach((p) => {
          mapa[p.id] = p
        })
        setProductosMap(mapa)
      } catch {
        // Si falla, el carrito igualmente muestra el ID y precio guardado
      }
    }
    cargarCatalogo()
  }, [])

  const items = cart?.items ?? []

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <ShoppingCart className="w-6 h-6 text-[#0000FE]" />
            <span>Tu Carrito</span>
            {itemCount > 0 && (
              <Badge variant="default" className="text-xs px-2.5 py-0.5">
                {itemCount} {itemCount === 1 ? 'obra' : 'obras'}
              </Badge>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Revisa tu selección de obras antes de continuar al pago
          </p>
        </div>

        <Link to="/">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Seguir Explorando</span>
          </Button>
        </Link>
      </div>

      {/* Carrito Vacío */}
      {items.length === 0 && (
        <Card className="py-16 text-center border-dashed border-2 border-slate-200 bg-white/70">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#F3F5FE] text-[#0000FE] mx-auto flex items-center justify-center">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900">Tu carrito está vacío</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                Aún no has agregado obras. Explora el catálogo de fotografías y tomas aéreas chilenas.
              </p>
            </div>
            <Link to="/">
              <Button variant="default" className="mt-2 gap-2">
                <span>Explorar Catálogo</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Carrito con Productos */}
      {items.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Lista de Productos */}
          <div className="lg:col-span-8 space-y-3">
            {items.map((item) => {
              const info = productosMap[item.idProductoRef]
              const titulo = info?.titulo || `Obra Digital #${item.idProductoRef}`
              const imagen = info?.urlPrevisualizacion || '/images/01.jpg'
              const ciudad = info?.comuna?.nombre || 'Chile'
              const formato = info?.tipoMedio || 'DIGITAL'

              return (
                <Card
                  key={item.idItemCarrito}
                  className="p-4 sm:p-5 border-slate-200/80 hover:border-slate-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-24 h-20 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200/80">
                        <img
                          src={imagen}
                          alt={titulo}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/01.jpg'
                          }}
                        />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="text-[10px]">
                            {formato}
                          </Badge>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#0000FE]" />
                            {ciudad}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm sm:text-base text-slate-900 truncate">
                          {titulo}
                        </h4>
                        <p className="text-xs text-slate-500">
                          Valor unitario: <span className="font-semibold text-slate-700">{formatCLP(item.precioUnitarioClp)}</span>
                        </p>
                      </div>
                    </div>

                    {/* Controles de Cantidad + Subtotal + Eliminar */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50/70 p-0.5">
                        <button
                          type="button"
                          disabled={isLoading || item.cantidad <= 1}
                          onClick={() => updateQuantity(item.idItemCarrito, item.cantidad - 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:bg-white disabled:opacity-40 cursor-pointer"
                          title="Disminuir cantidad"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-slate-900">
                          {item.cantidad}
                        </span>
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => updateQuantity(item.idItemCarrito, item.cantidad + 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:bg-white disabled:opacity-40 cursor-pointer"
                          title="Aumentar cantidad"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right min-w-[90px]">
                        <span className="font-extrabold text-base text-slate-950">
                          {formatCLP(item.precioUnitarioClp * item.cantidad)}
                        </span>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.idProductoRef)}
                        disabled={isLoading}
                        title="Eliminar del carrito"
                        className="text-slate-400 hover:text-red-600 hover:bg-red-50 h-8 w-8"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}

            <div className="pt-2 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                disabled={isLoading}
                className="text-xs text-slate-500 hover:text-red-600 gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Vaciar Carrito</span>
              </Button>
            </div>
          </div>

          {/* Resumen Sticky */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <Card className="border-slate-200/80 shadow-md">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900">
                  Resumen de la Compra
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4 pt-4 text-xs">
                <div className="space-y-2.5 text-slate-600">
                  <div className="flex justify-between">
                    <span>Obras seleccionadas ({itemCount})</span>
                    <span className="font-semibold text-slate-900">{formatCLP(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Licencia de uso comercial</span>
                    <span className="font-semibold text-emerald-600">Incluida</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Comprador</span>
                    <span className="font-semibold text-slate-900 truncate max-w-[150px]">
                      {session ? session.nombre : 'Modo Invitado'}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-900">Total a Pagar</span>
                  <span className="text-2xl font-extrabold text-[#0000FE]">
                    {formatCLP(totalAmount)}
                  </span>
                </div>

                <Button
                  variant="default"
                  size="lg"
                  className="w-full gap-2 font-bold text-sm"
                  disabled={isLoading}
                  onClick={() => navigate('/checkout')}
                >
                  <span>Continuar al Pago</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>

                <div className="pt-2 space-y-2 border-t border-slate-100 text-[11px] text-slate-500">
                  <p className="flex items-center gap-2">
                    <Download className="w-3.5 h-3.5 text-[#0000FE] shrink-0" />
                    Descarga digital inmediata en alta resolución
                  </p>
                  <p className="flex items-center gap-2">
                    <FileCheck2 className="w-3.5 h-3.5 text-[#0000FE] shrink-0" />
                    Certificado oficial de licencia de autor
                  </p>
                  <p className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Pago protegido en pesos chilenos (CLP)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
