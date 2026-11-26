import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Camera,
  Video,
  Music,
  MapPin,
  ShoppingCart,
  Check,
  Maximize2,
  ZoomIn,
  ZoomOut,
  X,
  ShieldCheck,
  Maximize,
  Clock,
  Tag,
  FileText,
  CreditCard,
  AlertCircle,
} from 'lucide-react'
import { productService } from '@/services/product.service'
import { userService } from '@/services/user.service'
import { useCart } from '@/context/CartContext'
import type { Producto } from '@/interfaces/product.interface'
import type { UsuarioPerfil } from '@/interfaces/user.interface'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

const VIDEO_MUESTRA =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'

const formatCLP = (monto: number): string =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(monto)

const esUrlVideo = (url?: string): boolean => {
  if (!url) return false
  const lower = url.toLowerCase()
  return lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov')
}

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { cart, addToCart, isLoading: cartLoading } = useCart()

  const [producto, setProducto] = useState<Producto | null>(null)
  const [artista, setArtista] = useState<UsuarioPerfil | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const [agregado, setAgregado] = useState<boolean>(false)

  // Visor ampliado (Lightbox + Zoom) para fotografías
  const [ampliada, setAmpliada] = useState<boolean>(false)
  const [zoom, setZoom] = useState<number>(1)

  useEffect(() => {
    const cargar = async (): Promise<void> => {
      if (!id) return
      setLoading(true)
      setError(null)
      try {
        const data = await productService.getProductoById(Number(id))
        setProducto(data)

        if (data.idArtista) {
          try {
            const perfil = await userService.obtenerPerfilPorCredencial(data.idArtista)
            setArtista(perfil)
          } catch {
            // Si no está disponible el perfil del artista, no bloquea el detalle
          }
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar la obra')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [id])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        setAmpliada(false)
        setZoom(1)
      }
    }
    if (ampliada) window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [ampliada])

  const enCarrito = !!cart?.items?.some((item) => item.idProductoRef === producto?.id)

  const handleAgregar = async (): Promise<void> => {
    if (!producto || enCarrito) return
    await addToCart(producto.id, producto.precio, 1)
    setAgregado(true)
    setTimeout(() => setAgregado(false), 2000)
  }

  const handleComprarAhora = async (): Promise<void> => {
    if (!producto) return
    if (!enCarrito) {
      await addToCart(producto.id, producto.precio, 1)
    }
    navigate('/checkout')
  }

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-[#0000FE] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-500">Cargando especificaciones de la obra...</p>
      </div>
    )
  }

  if (error || !producto) {
    return (
      <Card className="max-w-lg mx-auto my-12 p-8 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-amber-600 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Obra no encontrada</h2>
        <p className="text-xs text-slate-500">{error || 'El producto solicitado no está disponible.'}</p>
        <Link to="/">
          <Button>Volver al Catálogo</Button>
        </Link>
      </Card>
    )
  }

  const imagenUrl = producto.urlPrevisualizacion || '/images/01.jpg'
  const nombreArtista =
    artista?.perfilArtista?.nombreArtistico || artista?.nombreCompleto || `Artista #${producto.idArtista}`

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Navegación superior */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-[#0000FE]">
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Catálogo</span>
        </Link>

        <div className="flex items-center gap-2">
          {producto.categoria && (
            <Badge variant="default" className="text-xs">
              {producto.categoria.nombre}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs gap-1">
            <MapPin className="w-3 h-3 text-[#0000FE]" />
            {producto.comuna?.nombre || 'Chile'}
          </Badge>
        </div>
      </div>

      {/* Contenedor Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Columna Izquierda: Visor Multimedia (Video / Audio / Foto ampliable) */}
        <div className="lg:col-span-7 space-y-3">
          <Card className="overflow-hidden border-slate-200/80 shadow-md bg-slate-950">
            {producto.tipoMedio === 'VIDEO' ? (
              <div className="relative aspect-video bg-black">
                <video
                  controls
                  playsInline
                  poster={imagenUrl}
                  className="w-full h-full object-contain"
                >
                  <source
                    src={esUrlVideo(producto.urlPrevisualizacion) ? producto.urlPrevisualizacion : VIDEO_MUESTRA}
                    type="video/mp4"
                  />
                  Tu navegador no soporta la reproducción de video HTML5.
                </video>
                <Badge className="absolute top-3 left-3 bg-slate-900/80 text-white border-none text-[10px] gap-1 pointer-events-none">
                  <Video className="w-3 h-3" />
                  Reproductor Video {producto.formato || '4K'}
                </Badge>
              </div>
            ) : producto.tipoMedio === 'AUDIO' ? (
              <div className="p-8 bg-linear-to-br from-slate-900 to-slate-950 text-white space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#0000FE]/20 border border-[#0000FE]/40 flex items-center justify-center text-[#6B6BFF]">
                    <Music className="w-8 h-8" />
                  </div>
                  <div>
                    <Badge variant="primary" className="mb-1 text-[10px]">Audio Profesional</Badge>
                    <p className="font-bold text-base">{producto.titulo}</p>
                  </div>
                </div>
                <audio controls className="w-full">
                  <source src={producto.urlPrevisualizacion} />
                </audio>
              </div>
            ) : (
              <div
                onClick={() => {
                  setZoom(1)
                  setAmpliada(true)
                }}
                className="relative aspect-4/3 bg-slate-100 group cursor-zoom-in overflow-hidden"
              >
                <img
                  src={imagenUrl}
                  alt={producto.titulo}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/01.jpg'
                  }}
                />
                <Badge className="absolute top-3 left-3 bg-slate-900/80 text-white border-none text-[10px] gap-1">
                  <Camera className="w-3 h-3" />
                  FOTO
                </Badge>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setZoom(1)
                    setAmpliada(true)
                  }}
                  className="absolute bottom-3 right-3 bg-slate-950/80 hover:bg-[#0000FE] text-white text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 backdrop-blur-md transition-colors cursor-pointer shadow-lg"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Ampliar fotografía</span>
                </button>
              </div>
            )}
          </Card>

          <p className="text-[11px] text-slate-400 text-center">
            {producto.tipoMedio === 'VIDEO'
              ? 'Vista previa optimizada para web. Al comprar recibes el archivo original sin marca de agua.'
              : 'Haz clic sobre la fotografía para ampliarla y revisar el detalle.'}
          </p>
        </div>

        {/* Columna Derecha: Especificaciones y Compra */}
        <div className="lg:col-span-5 space-y-5">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 font-['Raleway']">
              {producto.titulo}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span>Por <strong className="text-slate-900">{nombreArtista}</strong></span>
              {artista?.estaVerificado && (
                <Badge variant="success" className="text-[10px] gap-1 py-0">
                  <ShieldCheck className="w-3 h-3" />
                  Verificado
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-600 leading-relaxed pt-1">
              {producto.descripcion || 'Obra digital chilena en alta definición lista para uso comercial.'}
            </p>
          </div>

          {/* Ficha de Especificaciones Técnicas */}
          <Card className="border-slate-200/80 bg-white">
            <CardContent className="p-4 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Especificaciones Técnicas
              </h2>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 space-y-0.5">
                  <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                    <FileText className="w-3 h-3" /> Formato
                  </span>
                  <span className="font-bold text-slate-900 block">
                    {producto.formato || producto.tipoMedio}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 space-y-0.5">
                  <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                    <Maximize className="w-3 h-3" /> Resolución
                  </span>
                  <span className="font-bold text-slate-900 block">
                    {producto.ancho && producto.alto
                      ? `${producto.ancho} × ${producto.alto} px`
                      : 'Alta Definición'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 space-y-0.5">
                  <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                    <MapPin className="w-3 h-3" /> Ubicación
                  </span>
                  <span className="font-bold text-slate-900 block truncate">
                    {producto.comuna?.nombre || 'Chile'}
                    {producto.region ? `, ${producto.region.nombre}` : ''}
                  </span>
                </div>

                {producto.tipoMedio === 'VIDEO' || producto.tipoMedio === 'AUDIO' ? (
                  <div className="p-2.5 rounded-xl bg-slate-50 space-y-0.5">
                    <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3" /> Duración
                    </span>
                    <span className="font-bold text-slate-900 block">
                      {producto.duracionSegundos ? `${producto.duracionSegundos} seg` : 'Estándar'}
                    </span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-slate-50 space-y-0.5">
                    <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <Tag className="w-3 h-3" /> Licencia
                    </span>
                    <span className="font-bold text-slate-900 block">
                      {producto.tipoVenta === 'SUBASTA' ? 'Exclusiva (Única)' : 'Comercial Estándar'}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Caja de Compra */}
          <Card className="border-slate-200/80 shadow-md">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    Valor Licencia CLP
                  </span>
                  <span className="text-3xl font-extrabold text-[#0000FE]">
                    {formatCLP(producto.precio)}
                  </span>
                </div>

                <Badge variant="default" className="text-xs px-3 py-1">
                  1 Licencia por usuario
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {enCarrito ? (
                  <Link to="/carrito" className="w-full">
                    <Button
                      size="lg"
                      variant="secondary"
                      className="w-full gap-2 font-bold bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      <Check className="w-4 h-4" />
                      <span>Ya en tu carrito</span>
                    </Button>
                  </Link>
                ) : (
                  <Button
                    size="lg"
                    variant={agregado ? 'secondary' : 'outline'}
                    className={`gap-2 font-bold ${
                      agregado ? 'bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600' : ''
                    }`}
                    disabled={cartLoading}
                    onClick={handleAgregar}
                  >
                    {agregado ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>¡Agregado!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        <span>Agregar al Carrito</span>
                      </>
                    )}
                  </Button>
                )}

                <Button
                  size="lg"
                  className="gap-2 font-bold"
                  disabled={cartLoading}
                  onClick={handleComprarAhora}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Comprar ahora</span>
                </Button>
              </div>

              <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Incluye certificado digital de licencia comercial
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal Lightbox / Zoom para Ampliar Fotografía */}
      {ampliada && (
        <div
          onClick={() => setAmpliada(false)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-4"
        >
          {/* Barra superior de controles de zoom */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl flex items-center justify-between text-white pb-3"
          >
            <div className="min-w-0">
              <p className="font-bold text-sm truncate">{producto.titulo}</p>
              <p className="text-xs text-slate-400">
                {producto.ancho && producto.alto ? `${producto.ancho} × ${producto.alto} px • ` : ''}
                Zoom: {Math.round(zoom * 100)}%
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(1, Number((z - 0.5).toFixed(1))))}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                title="Alejar"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(2.5, Number((z + 0.5).toFixed(1))))}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                title="Acercar"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setAmpliada(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-red-500/80 transition-colors cursor-pointer"
                title="Cerrar (ESC)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Contenedor de imagen ampliada */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-5xl max-h-[82vh] overflow-auto rounded-2xl border border-white/10 bg-black flex items-center justify-center"
          >
            <img
              src={imagenUrl}
              alt={producto.titulo}
              style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
              className="max-h-[80vh] w-auto object-contain transition-transform duration-200"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/01.jpg'
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
