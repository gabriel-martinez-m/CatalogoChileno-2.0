import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Check, AlertCircle, MapPin, Eye, Camera, Video, ShieldCheck } from 'lucide-react'
import type { Producto } from '@/interfaces/product.interface'
import { productService } from '@/services/product.service'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export const CatalogPage: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [addedIds, setAddedIds] = useState<Record<number, boolean>>({})

  const { cart, addToCart, itemCount } = useCart()
  const { session } = useAuth()

  useEffect(() => {
    loadProductos()
  }, [])

  const loadProductos = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await productService.getProductos()
      setProductos(data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar catálogo'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (producto: Producto) => {
    try {
      setAddedIds((prev) => ({ ...prev, [producto.id]: true }))
      await addToCart(producto.id, producto.precio, 1)

      setTimeout(() => {
        setAddedIds((prev) => ({ ...prev, [producto.id]: false }))
      }, 2000)
    } catch (err) {
      console.error('Error al agregar al carrito:', err)
      setAddedIds((prev) => ({ ...prev, [producto.id]: false }))
    }
  }

  const formatCLP = (monto: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(monto)
  }

  const getCiudadProducto = (producto: Producto, index: number): string => {
    // Si viene la comuna asociada al producto en la base de datos
    const comuna = producto.comuna?.nombre?.trim()
    if (comuna && comuna.toLowerCase() !== 'chile') {
      return comuna
    }

    // Mapeo con nombres de ciudades chilenas diferenciadas para cada tarjeta
    const mapaCiudades: Record<number, string> = {
      1: 'Torres del Paine',
      2: 'Valparaíso',
      3: 'Puerto Varas',
      4: 'Santiago',
      5: 'Concepción',
    }

    const ciudadesFallback = [
      'Torres del Paine',
      'Valparaíso',
      'Puerto Varas',
      'Santiago',
      'Concepción',
      'San Pedro de Atacama',
      'La Serena',
      'Pucón',
    ]

    return mapaCiudades[producto.id] || ciudadesFallback[index % ciudadesFallback.length]
  }

  return (
    <div className="space-y-8">
      {/* Hero Section Behance Style */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-r from-slate-950 via-slate-900 to-[#0000FE]/90 text-white p-8 md:p-12 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-white/90 border border-white/10">
            <span>Contenido digital 100% chileno con derechos de autor</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-['Raleway'] leading-tight">
            Descubre y adquiere el talento visual de Chile
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Marketplace para adquirir fotografías 8K, tomas en drone 4K y material exclusivo de artistas chilenos con licencias comerciales inmediatas.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link to="/carrito">
              <Button variant="default" size="lg" className="gap-2 bg-[#0000FE] hover:bg-[#0000B8] text-white">
                <ShoppingCart className="w-4 h-4" />
                <span>Revisar Carrito ({itemCount})</span>
              </Button>
            </Link>
            
            {session && (
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 bg-black/30 px-3 py-2 rounded-full border border-emerald-500/20">
                <ShieldCheck className="w-4 h-4" />
                Sesión activa como: {session.nombre}
              </span>
            )}
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-[#0000FE]/20 blur-3xl pointer-events-none" />
      </section>

      {/* Barra de Título y Filtro */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Obras Destacadas
          </h2>
          <p className="text-xs text-slate-500">
            Fotografías y material visual exclusivo de artistas chilenos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="default" className="cursor-pointer">Todos</Badge>
          <Badge variant="outline" className="cursor-pointer">Fotografía</Badge>
          <Badge variant="outline" className="cursor-pointer">Video Drone</Badge>
        </div>
      </div>

      {/* Estados de Carga y Error */}
      {loading && (
        <div className="text-center py-16 space-y-3">
          <div className="w-10 h-10 border-4 border-[#0000FE] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-600">
            Cargando obras del catálogo...
          </p>
        </div>
      )}

      {error && (
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm">No se pudo cargar el catálogo automáticamente</h4>
            <p className="text-xs text-amber-800">{error}</p>
            <p className="text-xs text-slate-500 pt-2">
              Ocurrió un problema de conexión con el servidor. Intenta nuevamente en unos segundos.
            </p>
            <Button size="sm" variant="outline" onClick={loadProductos} className="mt-2 text-xs">
              Reintentar conexión
            </Button>
          </div>
        </div>
      )}

      {/* Grid de Productos */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {productos.map((producto, index) => {
            const enCarrito = !!cart?.items?.some((i) => i.idProductoRef === producto.id)
            const isAdded = !!addedIds[producto.id] || enCarrito

            return (
              <Card key={producto.id} className="overflow-hidden flex flex-col group border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all">
                {/* Imagen Preview con Badges (Clic abre detalle) */}
                <Link
                  to={`/producto/${producto.id}`}
                  className="relative aspect-4/3 w-full overflow-hidden bg-slate-100 block"
                >
                  <img
                    src={producto.urlPrevisualizacion || '/images/01.jpg'}
                    alt={producto.titulo}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      // Fallback a imagen local
                      (e.target as HTMLImageElement).src = '/images/01.jpg'
                    }}
                  />
                  
                  {/* Badges superiores */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <Badge variant="primary" className="bg-slate-900/80 backdrop-blur-md text-[10px] gap-1">
                      {producto.tipoMedio === 'VIDEO' ? <Video className="w-3 h-3" /> : <Camera className="w-3 h-3" />}
                      <span>{producto.tipoMedio}</span>
                    </Badge>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold text-slate-800 shadow-xs flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#0000FE]" />
                      {getCiudadProducto(producto, index)}
                    </span>
                  </div>
                </Link>

                {/* Información de la Obra */}
                <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <Link to={`/producto/${producto.id}`} className="space-y-1.5 block">
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-[#0000FE] transition-colors line-clamp-1">
                      {producto.titulo}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {producto.descripcion || 'Obra auténtica chilena en alta definición con licencia comercial.'}
                    </p>
                  </Link>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                        Precio CLP
                      </span>
                      <span className="text-lg font-extrabold text-slate-950">
                        {formatCLP(producto.precio)}
                      </span>
                    </div>

                    {/* Botón Acción Agregar (1 licencia por producto) */}
                    {enCarrito ? (
                      <Link to="/carrito">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>En carrito</span>
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        onClick={() => handleAddToCart(producto)}
                        variant={isAdded ? 'secondary' : 'default'}
                        size="sm"
                        className={`gap-1.5 transition-all ${
                          isAdded ? 'bg-emerald-600 text-white hover:bg-emerald-700' : ''
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>¡Agregado!</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Agregar</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
