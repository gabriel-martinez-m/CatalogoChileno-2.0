import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { artistService } from '@/services/artist.service'
import type { Categoria, Comuna, Region, TipoMedio, TipoVenta } from '@/interfaces/product.interface'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

const IMAGENES_EJEMPLO = [
  { etiqueta: 'Patagonia', url: 'https://images.unsplash.com/photo-1544986581-efac024faf62?auto=format&fit=crop&w=1200&q=80' },
  { etiqueta: 'Montaña y Lago', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80' },
  { etiqueta: 'Ciudad / Nocturna', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80' },
]

export const ArtistUploadPage: React.FC = () => {
  const { session } = useAuth()
  const navigate = useNavigate()

  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [regiones, setRegiones] = useState<Region[]>([])
  const [comunas, setComunas] = useState<Comuna[]>([])

  const [titulo, setTitulo] = useState<string>('')
  const [descripcion, setDescripcion] = useState<string>('')
  const [precio, setPrecio] = useState<string>('25000')
  const [tipoMedio, setTipoMedio] = useState<TipoMedio>('FOTO')
  const [tipoVenta, setTipoVenta] = useState<TipoVenta>('VENTA_NORMAL')
  const [idCategoria, setIdCategoria] = useState<number>(1)
  const [idRegion, setIdRegion] = useState<number>(1)
  const [idComuna, setIdComuna] = useState<number>(1)
  const [urlPrevisualizacion, setUrlPrevisualizacion] = useState<string>(IMAGENES_EJEMPLO[0].url)
  const [aceptaOrigenChileno, setAceptaOrigenChileno] = useState<boolean>(false)

  const [saving, setSaving] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [publicada, setPublicada] = useState<boolean>(false)

  useEffect(() => {
    const cargarMetadatos = async (): Promise<void> => {
      try {
        const [cats, regs, coms] = await Promise.all([
          artistService.getCategorias(),
          artistService.getRegiones(),
          artistService.getComunas(),
        ])
        setCategorias(cats)
        setRegiones(regs)
        setComunas(coms)
        if (cats[0]) setIdCategoria(cats[0].id)
        if (regs[0]) setIdRegion(regs[0].id)
        if (coms[0]) setIdComuna(coms[0].id)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar las categorías y ubicaciones')
      }
    }
    cargarMetadatos()
  }, [])

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!session) return
    setError(null)

    const monto = Number(precio)
    if (!Number.isFinite(monto) || monto <= 0) {
      setError('El precio en CLP debe ser mayor a cero.')
      return
    }
    if (!aceptaOrigenChileno) {
      setError('Debes declarar que la obra es 100% chilena y de tu autoría.')
      return
    }

    setSaving(true)
    try {
      await artistService.publicarObra(session.idUsuario, {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        precio: monto,
        tipoMedio,
        tipoVenta,
        idCategoria,
        idRegion,
        idComuna,
        urlPrevisualizacion: urlPrevisualizacion.trim(),
      })
      setPublicada(true)
      setTimeout(() => navigate('/artista/obras'), 1200)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo publicar la obra')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Publicar Nueva Obra</h2>
        <p className="text-sm text-slate-500">
          Tu obra ingresará a cola de moderación antes de aparecer en el catálogo público
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 text-xs bg-red-50 border border-red-200 text-red-700 rounded-2xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {publicada && (
        <div className="flex items-center gap-2 p-4 text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>¡Obra enviada a revisión administrativa! Redirigiendo a Mis Obras...</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="border-slate-200/80 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Detalles y Catalogación</CardTitle>
            <CardDescription>Completa los metadatos territoriales y comerciales</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Título de la obra</label>
              <Input
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej: Salar de Tara al Amanecer"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Descripción</label>
              <textarea
                required
                rows={3}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe la captura, resolución y contexto geográfico..."
                className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0000FE]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Precio (CLP)</label>
                <Input
                  type="number"
                  min={1}
                  required
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Formato</label>
                <select
                  value={tipoMedio}
                  onChange={(e) => setTipoMedio(e.target.value as TipoMedio)}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0000FE]"
                >
                  <option value="FOTO">Fotografía</option>
                  <option value="VIDEO">Video Drone / 4K</option>
                  <option value="AUDIO">Audio / Sonido</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Tipo de venta</label>
                <select
                  value={tipoVenta}
                  onChange={(e) => setTipoVenta(e.target.value as TipoVenta)}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0000FE]"
                >
                  <option value="VENTA_NORMAL">Venta Normal</option>
                  <option value="SUBASTA">Subasta Exclusiva</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Categoría</label>
                <select
                  value={idCategoria}
                  onChange={(e) => setIdCategoria(Number(e.target.value))}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0000FE]"
                >
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Región</label>
                <select
                  value={idRegion}
                  onChange={(e) => setIdRegion(Number(e.target.value))}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0000FE]"
                >
                  {regiones.map((r) => (
                    <option key={r.id} value={r.id}>{r.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Ciudad / Comuna</label>
                <select
                  value={idComuna}
                  onChange={(e) => setIdComuna(Number(e.target.value))}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0000FE]"
                >
                  {comunas.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-700">URL de previsualización</label>
              <Input
                required
                value={urlPrevisualizacion}
                onChange={(e) => setUrlPrevisualizacion(e.target.value)}
                placeholder="https://..."
              />
              <div className="flex flex-wrap gap-2">
                {IMAGENES_EJEMPLO.map((img) => (
                  <button
                    key={img.etiqueta}
                    type="button"
                    onClick={() => setUrlPrevisualizacion(img.url)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  >
                    Usar foto: {img.etiqueta}
                  </button>
                ))}
              </div>
              {urlPrevisualizacion && (
                <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 h-44 bg-slate-50">
                  <img
                    src={urlPrevisualizacion}
                    alt="Vista previa"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/01.jpg'
                    }}
                  />
                </div>
              )}
            </div>

            <label className="flex items-start gap-2.5 pt-2 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={aceptaOrigenChileno}
                onChange={(e) => setAceptaOrigenChileno(e.target.checked)}
                className="mt-0.5 accent-[#0000FE]"
              />
              <span>
                Declaro que esta obra es contenido 100% chileno capturado por mí y poseo los derechos de autor para su comercialización.
              </span>
            </label>
          </CardContent>

          <CardFooter className="flex justify-end gap-3">
            <Link to="/artista/obras"><Button type="button" variant="outline">Cancelar</Button></Link>
            <Button type="submit" className="gap-2" disabled={saving || publicada}>
              <UploadCloud className="w-4 h-4" />
              {saving ? 'Publicando...' : 'Publicar Obra'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
