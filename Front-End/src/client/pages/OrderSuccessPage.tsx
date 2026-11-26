import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  CheckCircle2,
  Download,
  FileCheck2,
  ArrowRight,
  MapPin,
  Printer,
  ShieldCheck,
  X,
} from 'lucide-react'
import type { ItemOrdenResumen, OrdenConfirmada } from '@/interfaces/cart.interface'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

const formatCLP = (monto: number): string =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(monto)

const ETIQUETA_PAGO: Record<OrdenConfirmada['medioPago'], string> = {
  WEBPAY_PLUS: 'Webpay Plus (Transbank)',
  MERCADOPAGO: 'Mercado Pago',
  TRANSFERENCIA: 'Transferencia Bancaria',
}

export const OrderSuccessPage: React.FC = () => {
  const location = useLocation()
  const state = location.state as { orden?: OrdenConfirmada } | null

  const [orden] = useState<OrdenConfirmada | null>(() => {
    if (state?.orden) return state.orden
    const guardada = sessionStorage.getItem('ultima_orden')
    if (!guardada) return null
    try {
      return JSON.parse(guardada) as OrdenConfirmada
    } catch {
      return null
    }
  })

  const [itemCertificado, setItemCertificado] = useState<ItemOrdenResumen | null>(null)

  if (!orden) {
    return (
      <Card className="max-w-lg mx-auto my-12 py-12 px-6 text-center space-y-4">
        <FileCheck2 className="w-10 h-10 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">No encontramos una orden reciente</h2>
        <p className="text-sm text-slate-500">
          Explora nuestro catálogo para adquirir obras de artistas chilenos.
        </p>
        <Link to="/">
          <Button>Ir al Catálogo</Button>
        </Link>
      </Card>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Cabecera de Éxito */}
      <Card className="border-emerald-200 bg-linear-to-br from-emerald-50/80 to-white shadow-md">
        <CardContent className="p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div className="space-y-1.5">
            <Badge variant="success" className="px-3 py-0.5 text-xs">
              Pago Autorizado
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 font-['Raleway']">
              ¡Compra realizada con éxito!
            </h1>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Hemos enviado tus enlaces de descarga y certificados de licencia a{' '}
              <strong className="text-slate-900">{orden.compradorCorreo}</strong>.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Detalle de la Transacción */}
      <Card className="border-slate-200/80">
        <CardContent className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block">N° de Orden</span>
            <span className="font-bold font-mono text-slate-900">{orden.numeroOrden}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Código Autorización</span>
            <span className="font-bold font-mono text-slate-900">{orden.codigoAutorizacion}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Medio de Pago</span>
            <span className="font-bold text-slate-900">{ETIQUETA_PAGO[orden.medioPago]}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Total Pagado</span>
            <span className="font-extrabold text-base text-[#0000FE]">{formatCLP(orden.totalClp)}</span>
          </div>
          <div className="col-span-2">
            <span className="text-slate-400 block">Titular / Comprador</span>
            <span className="font-semibold text-slate-800">{orden.compradorNombre}</span>
          </div>
          <div className="col-span-2">
            <span className="text-slate-400 block">Fecha y Documento</span>
            <span className="font-semibold text-slate-800">
              {orden.fechaHora} • {orden.tipoComprobante}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Obras Adquiridas y Descargas */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">Tus Obras y Licencias Disponibles</h2>
        {orden.items.map((item) => (
          <Card key={item.idProducto} className="p-4 sm:p-5 border-slate-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <img
                  src={item.urlImagen}
                  alt={item.titulo}
                  className="w-20 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/01.jpg'
                  }}
                />
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {item.formato}
                    </Badge>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#0000FE]" />
                      {item.ciudad}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 truncate">{item.titulo}</h3>
                  <p className="text-xs text-slate-500">
                    Cantidad: {item.cantidad} • {formatCLP(item.precioUnitarioClp * item.cantidad)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs"
                  onClick={() => setItemCertificado(item)}
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-[#0000FE]" />
                  <span>Licencia</span>
                </Button>
                <a href={item.urlImagen} target="_blank" rel="noreferrer" download>
                  <Button size="sm" className="gap-1.5 text-xs">
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar HD</span>
                  </Button>
                </a>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-center pt-4">
        <Link to="/">
          <Button variant="outline" size="lg" className="gap-2">
            <span>Seguir explorando el catálogo</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Modal Certificado de Licencia Comercial */}
      {itemCertificado && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-950 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-sm">Certificado Oficial de Licencia Comercial</span>
              </div>
              <button
                type="button"
                onClick={() => setItemCertificado(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-600">
              <div className="p-4 rounded-xl bg-[#F3F5FE] border border-[#D8DFFA] space-y-2">
                <p className="font-bold text-sm text-slate-900">{itemCertificado.titulo}</p>
                <p>Origen verificado: <strong>{itemCertificado.ciudad}, Chile</strong></p>
                <p>ID de Transacción: <strong className="font-mono">{orden.numeroOrden}</strong></p>
              </div>

              <div className="space-y-1.5">
                <p><strong>Titular de la Licencia:</strong> {orden.compradorNombre} ({orden.compradorCorreo})</p>
                <p><strong>Fecha de Emisión:</strong> {orden.fechaHora}</p>
                <p><strong>Alcance:</strong> Licencia Comercial Estándar para uso digital, editorial y publicitario a nivel mundial.</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5">
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir / Guardar PDF
                </Button>
                <Button size="sm" onClick={() => setItemCertificado(null)}>
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
