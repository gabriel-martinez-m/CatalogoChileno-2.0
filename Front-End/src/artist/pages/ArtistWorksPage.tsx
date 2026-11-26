import React, { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { UploadCloud, Trash2, MapPin, Camera, Video, AlertCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { artistService } from '@/services/artist.service'
import type { EstadoProducto, Producto } from '@/interfaces/product.interface'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

const ESTADOS_UI: Record<EstadoProducto, { etiqueta: string; variante: 'success' | 'secondary' | 'destructive' | 'outline' }> = {
  APROBADO: { etiqueta: 'Publicada', variante: 'success' },
  PENDIENTE_REVISION: { etiqueta: 'Pendiente de revisión', variante: 'secondary' },
  RECHAZADO: { etiqueta: 'Rechazada', variante: 'destructive' },
  INACTIVO: { etiqueta: 'Pausada', variante: 'outline' },
}

const formatCLP = (monto: number): string =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(monto)

export const ArtistWorksPage: React.FC = () => {
  const { session } = useAuth()
  const [obras, setObras] = useState<Producto[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [procesando, setProcesando] = useState<number | null>(null)

  const cargar = useCallback(async (): Promise<void> => {
    if (!session) return
    setLoading(true)
    setError(null)
    try {
      setObras(await artistService.getMisObras(session.idUsuario))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar tus obras')
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    cargar()
  }, [cargar])

  const pausar = async (obra: Producto): Promise<void> => {
    if (!window.confirm(`¿Pausar "${obra.titulo}" del catálogo público?`)) return
    setProcesando(obra.id)
    try {
      await artistService.pausarObra(obra.id)
      setObras((prev) => prev.map((o) => (o.id === obra.id ? { ...o, estado: 'INACTIVO' } : o)))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo pausar la obra')
    } finally {
      setProcesando(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Mis Obras</h2>
          <p className="text-sm text-slate-500">Consulta el estado de aprobación y gestiona tu portafolio</p>
        </div>

        <Link to="/artista/publicar">
          <Button className="gap-2">
            <UploadCloud className="w-4 h-4" />
            Nueva Obra
          </Button>
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 text-sm bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && <p className="text-sm text-slate-500">Cargando tu portafolio...</p>}

      {!loading && obras.length === 0 && (
        <Card className="border-dashed border-2 border-slate-200 py-16 text-center">
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-500">Aún no has publicado obras en tu portafolio.</p>
            <Link to="/artista/publicar">
              <Button>Subir mi primera obra</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {obras.map((obra) => {
          const estadoInfo = ESTADOS_UI[obra.estado]
          return (
            <Card key={obra.id} className="overflow-hidden flex flex-col border-slate-200/80">
              <div className="relative aspect-4/3 bg-slate-100">
                <img
                  src={obra.urlPrevisualizacion || '/images/01.jpg'}
                  alt={obra.titulo}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/01.jpg'
                  }}
                />
                <Badge variant="primary" className="absolute top-3 left-3 bg-slate-900/80 text-[10px] gap-1">
                  {obra.tipoMedio === 'VIDEO' ? <Video className="w-3 h-3" /> : <Camera className="w-3 h-3" />}
                  {obra.tipoMedio}
                </Badge>
                <Badge variant={estadoInfo.variante} className="absolute top-3 right-3 text-[10px]">
                  {estadoInfo.etiqueta}
                </Badge>
              </div>

              <CardContent className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div className="space-y-1.5">
                  <h3 className="font-bold text-slate-900 line-clamp-1">{obra.titulo}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{obra.descripcion}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#0000FE]" />
                      {obra.comuna?.nombre ?? 'Chile'}
                    </span>
                    <span className="font-bold text-slate-900">{formatCLP(obra.precio)}</span>
                  </div>
                </div>

                {obra.estado !== 'INACTIVO' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
                    disabled={procesando === obra.id}
                    onClick={() => pausar(obra)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Pausar publicación
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
