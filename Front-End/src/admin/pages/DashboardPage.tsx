import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, CheckCircle2, Palette, ArrowRight, AlertCircle, DollarSign, CalendarClock } from 'lucide-react'
import type { Producto } from '@/interfaces/product.interface'
import type { UsuarioPerfil } from '@/interfaces/user.interface'
import { productService } from '@/services/product.service'
import { adminService } from '@/services/admin.service'
import { salesService } from '@/services/sales.service'
import { Card, CardContent } from '@/components/ui/card'

interface Kpi {
  etiqueta: string
  valor: string | number
  icono: React.ElementType
  color: string
}

const formatCLP = (monto: number): string =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(monto)

export const DashboardPage: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([])
  const [usuarios, setUsuarios] = useState<UsuarioPerfil[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cargar = async (): Promise<void> => {
      try {
        const [listaProductos, listaUsuarios] = await Promise.all([
          productService.getProductosPorEstado(),
          adminService.getUsuarios(),
        ])
        setProductos(listaProductos)
        setUsuarios(listaUsuarios)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los indicadores')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  const contar = (estado: Producto['estado']): number =>
    productos.filter((p) => p.estado === estado).length

  const obrasPendientes = contar('PENDIENTE_REVISION')
  const artistasPendientes = usuarios.filter((u) => !!u.perfilArtista && !u.estaVerificado).length
  const ventas = salesService.getVentas()
  const gananciaFee = ventas.reduce((acc, v) => acc + v.feePlataformaClp, 0)
  const proximoPago = salesService.getProximoPagoDia5()

  const kpis: Kpi[] = [
    { etiqueta: 'Obras pendientes', valor: obrasPendientes, icono: Clock, color: 'bg-amber-50 text-amber-600' },
    { etiqueta: 'Obras publicadas', valor: contar('APROBADO'), icono: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
    { etiqueta: 'Artistas por verificar', valor: artistasPendientes, icono: Palette, color: 'bg-[#F3F5FE] text-[#0000FE]' },
    { etiqueta: 'Ganancia FEE (15%)', valor: formatCLP(gananciaFee), icono: DollarSign, color: 'bg-emerald-50 text-emerald-700' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h2>
        <p className="text-sm text-slate-500">Resumen general de la plataforma</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 text-sm bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map(({ etiqueta, valor, icono: Icono, color }) => (
          <Card key={etiqueta} className="border-slate-200/80">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
                <Icono className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-slate-950">{loading ? '–' : valor}</p>
                <p className="text-xs text-slate-500">{etiqueta}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-slate-200/80">
        <CardContent className="p-6 space-y-3">
          <h3 className="font-bold text-slate-900">Requiere tu atención</h3>
          {obrasPendientes === 0 && artistasPendientes === 0 && (
            <p className="text-sm text-slate-500">No hay tareas pendientes. ¡Todo al día!</p>
          )}
          {obrasPendientes > 0 && (
            <Link
              to="/admin/moderacion"
              className="flex items-center justify-between p-4 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-medium text-amber-900">
                  {obrasPendientes} {obrasPendientes === 1 ? 'obra espera' : 'obras esperan'} moderación
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-700" />
            </Link>
          )}
          {artistasPendientes > 0 && (
            <Link
              to="/admin/verificacion"
              className="flex items-center justify-between p-4 rounded-xl bg-[#F3F5FE] border border-[#D8DFFA] hover:bg-[#E7ECFE] transition-colors"
            >
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-[#0000FE]" />
                <span className="text-sm font-medium text-slate-900">
                  {artistasPendientes} {artistasPendientes === 1 ? 'artista espera' : 'artistas esperan'} verificación de identidad
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#0000FE]" />
            </Link>
          )}
          <Link
            to="/admin/ventas"
            className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <CalendarClock className="w-5 h-5 text-emerald-700" />
              <span className="text-sm font-medium text-emerald-950">
                Próximo pago automático a artistas: <strong>{proximoPago.fechaTexto}</strong> ({ventas.length} ventas registradas)
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-700" />
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
