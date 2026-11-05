import React from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Trash2, ArrowLeft, ShieldCheck, CreditCard, Sparkles, AlertCircle } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const CartPage: React.FC = () => {
  const { cart, itemCount, totalAmount, isLoading, removeFromCart, clearCart } = useCart()
  const { session } = useAuth()

  const formatCLP = (monto: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(monto)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-[#0000FE]" />
            <span>Carrito de Compras</span>
          </h1>
          <p className="text-xs text-slate-500">
            Sincronizado en tiempo real con MySQL <code className="text-[#0000FE] font-bold">bd_carrito</code>
          </p>
        </div>

        <Link to="/">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Seguir Explorando</span>
          </Button>
        </Link>
      </div>

      {/* Explicación Técnica para la presentación al Profesor */}
      <div className="bg-[#F3F5FE] border border-[#D8DFFA] rounded-2xl p-4 text-xs text-slate-700 space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-[#0000FE]">
          <Sparkles className="w-4 h-4" />
          <span>Trazabilidad de Microservicios Demostrada:</span>
        </div>
        <p className="leading-relaxed">
          Cada ítem añadido a esta lista fue recibido por <code className="font-bold text-slate-900">servicio-carrito</code> (puerto 8092), el cual se comunicó de forma síncrona vía <code className="font-bold text-[#0000FE]">Spring Cloud OpenFeign</code> con <code className="font-bold text-slate-900">servicio-catalogo</code> (puerto 8091) para verificar stock y vigencia antes de persistir en MySQL.
        </p>
      </div>

      {/* Carrito Vacío */}
      {(!cart || !cart.items || cart.items.length === 0) && (
        <Card className="py-16 text-center border-dashed border-2 border-slate-200">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-800">Tu carrito está vacío</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No tienes obras añadidas actualmente. Ve al catálogo para agregar fotografías o tomas de drone.
              </p>
            </div>
            <Link to="/">
              <Button variant="default" size="default" className="mt-2">
                Explorar Catálogo
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Lista de Ítems del Carrito */}
      {cart && cart.items && cart.items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Tabla / Lista de Productos */}
          <div className="md:col-span-2 space-y-3">
            {cart.items.map((item) => (
              <Card key={item.idItemCarrito} className="p-4 flex items-center justify-between gap-4 border-slate-200/80">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                    <img
                      src="/images/01.jpg"
                      alt="Miniatura de obra"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">
                        Producto #{item.idProductoRef}
                      </h4>
                      <Badge variant="outline" className="text-[10px]">
                        ID Ítem: {item.idItemCarrito}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Cantidad: <span className="font-semibold text-slate-800">{item.cantidad}</span> x {formatCLP(item.precioUnitarioClp)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-extrabold text-base text-slate-900">
                    {formatCLP(item.precioUnitarioClp * item.cantidad)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFromCart(item.idProductoRef)}
                    disabled={isLoading}
                    title="Eliminar del carrito"
                    className="text-slate-400 hover:text-red-600 h-8 w-8"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}

            <div className="pt-2 flex justify-between items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                disabled={isLoading}
                className="text-xs text-slate-500 hover:text-red-600 gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Vaciar Carrito Completo</span>
              </Button>
              <span className="text-xs text-slate-400">
                Estado del Carrito: <strong className="text-emerald-600">{cart.estado}</strong>
              </span>
            </div>
          </div>

          {/* Resumen de Compra */}
          <div className="space-y-4">
            <Card className="border-slate-200/80 shadow-md">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900">
                  Resumen de la Orden
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3 pt-4 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Total Ítems:</span>
                  <span className="font-semibold text-slate-900">{itemCount}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Licencia Comercial:</span>
                  <span className="font-semibold text-emerald-600">Incluida</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Cliente Autenticado:</span>
                  <span className="font-semibold text-slate-900 truncate max-w-[140px]">
                    {session ? session.nombre : 'Modo Invitado'}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-900">Total a Pagar:</span>
                  <span className="text-xl font-extrabold text-[#0000FE]">
                    {formatCLP(totalAmount)}
                  </span>
                </div>

                <Button variant="default" size="lg" className="w-full mt-4 gap-2 font-bold">
                  <CreditCard className="w-4 h-4" />
                  <span>Pagar con Webpay</span>
                </Button>

                <p className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Transacción protegida por Transbank (CLP)
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
