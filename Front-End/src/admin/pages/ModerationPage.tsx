import React, { useCallback, useEffect, useState } from 'react'
import { Check, X, Trash2, AlertCircle, MapPin, Camera, Video } from 'lucide-react'
import type { EstadoProducto, Producto } from '@/interfaces/product.interface'
import { productService } from '@/services/product.service'
import { adminService } from '@/services/admin.service'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Pestana {
  estado: EstadoProducto
  etiqueta: string
}

const PESTANAS: Pestana[] = [
  { estado: 'PENDIENTE_REVISION', etiqueta: 'Pendientes' },
  { estado: 'APROBADO', etiqueta: 'Aprobadas' },
  { estado: 'RECHAZADO', etiqueta: 'Rechazadas' },
]

const formatCLP = (monto: number): string =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(monto)

export const ModerationPage: React.FC = () => {
  const [estado, setEstado] = useState<EstadoProducto>('PENDIENTE_REVISION')
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [procesando, setProcesando] = useState<number | null>(null)

  const [aRechazar, setARechazar] = useState<Producto | null>(null)
  const [motivo, setMotivo] = useState<string>('')

  const cargar = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      setProductos(await productService.getProductosPorEstado(estado))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las obras')
    } finally {
      setLoading(false)
    }
  }, [estado])

  useEffect(() => {
    cargar()
  }, [cargar])

  const ejecutar = async (id: number, accion: () => Promise<unknown>): Promise<void> => {
    setProcesando(id)
    setError(null)
    try {
      await accion()
      setProductos((prev) => prev.filter((p) => p.id !== id))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo completar la acción')
    } finally {
      setProcesando(null)
    }
  }

  const aprobar = (p: Producto): Promise<void> => ejecutar(p.id, () => adminService.aprobarProducto(p.id))

  const darDeBaja = (p: Producto): Promise<void> => {
    if (!window.confirm(`¿Dar de baja "${p.titulo}"? Dejará de estar disponible en el catálogo.`)) {
      return Promise.resolve()
    }
    return ejecutar(p.id, () => adminService.desactivarProducto(p.id))
  }

  const confirmarRechazo = async (): Promise<void> => {
    if (!aRechazar || !motivo.trim()) return
    const producto = aRechazar
    setARechazar(null)
    setMotivo('')
    await ejecutar(producto.id, () => adminService.rechazarProducto(producto.id, motivo.trim()))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Moderación de obras</h2>
        <p className="text-sm text-slate-500">Revisa y aprueba el contenido antes de que sea público</p>
      </div>

      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {PESTANAS.map((p) => (
          <button
            key={p.estado}
            type="button"
            onClick={() => setEstado(p.estado)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer',
              estado === p.estado ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900',
            )}
          >
            {p.etiqueta}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 text-sm bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && <p className="text-sm text-slate-500">Cargando obras...</p>}

      {!loading && !error && productos.length === 0 && (
        <Card className="border-dashed border-2 border-slate-200">
          <CardContent className="py-16 text-center text-sm text-slate-500">
            No hay obras en este estado.
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {productos.map((p) => (
          <Card key={p.id} className="overflow-hidden flex flex-col border-slate-200/80">
            <div className="relative aspect-4/3 bg-slate-100">
              <img
                src={p.urlPrevisualizacion || '/images/01.jpg'}
                alt={p.titulo}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/01.jpg'
                }}
              />
              <Badge variant="primary" className="absolute top-3 left-3 bg-slate-900/80 text-[10px] gap-1">
                {p.tipoMedio === 'VIDEO' ? <Video className="w-3 h-3" /> : <Camera className="w-3 h-3" />}
                {p.tipoMedio}
              </Badge>
            </div>

            <CardContent className="p-5 flex-1 flex flex-col justify-between gap-4">
              <div className="space-y-1.5">
                <h3 className="font-bold text-slate-900 leading-snug">{p.titulo}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{p.descripcion}</p>
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#0000FE]" />
                    {p.comuna?.nombre ?? 'Sin ubicación'}
                  </span>
                  <span className="font-bold text-slate-900">{formatCLP(p.precio)}</span>
                </div>
                <p className="text-[11px] text-slate-400">Artista #{p.idArtista}</p>
              </div>

              <div className="flex gap-2">
                {estado === 'PENDIENTE_REVISION' && (
                  <>
                    <Button
                      size="sm"
                      className="flex-1 gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                      disabled={procesando === p.id}
                      onClick={() => aprobar(p)}
                    >
                      <Check className="w-3.5 h-3.5" />
                      Aprobar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
                      disabled={procesando === p.id}
                      onClick={() => setARechazar(p)}
                    >
                      <X className="w-3.5 h-3.5" />
                      Rechazar
                    </Button>
                  </>
                )}
                {estado === 'APROBADO' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
                    disabled={procesando === p.id}
                    onClick={() => darDeBaja(p)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Dar de baja
                  </Button>
                )}
                {estado === 'RECHAZADO' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full gap-1.5"
                    disabled={procesando === p.id}
                    onClick={() => aprobar(p)}
                  >
                    <Check className="w-3.5 h-3.5" />
                    Aprobar igualmente
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {aRechazar && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Rechazar obra</h3>
              <p className="text-sm text-slate-500">{aRechazar.titulo}</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Motivo del rechazo</label>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                rows={4}
                placeholder="Ej: La obra no corresponde a contenido chileno."
                className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0000FE]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setARechazar(null)
                  setMotivo('')
                }}
              >
                Cancelar
              </Button>
              <Button className="bg-red-600 hover:bg-red-700" disabled={!motivo.trim()} onClick={confirmarRechazo}>
                Rechazar obra
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
