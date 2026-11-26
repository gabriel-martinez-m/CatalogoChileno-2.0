import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Images, Clock, DollarSign, TrendingUp, UploadCloud, ShieldCheck, AlertCircle, Landmark } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { artistService } from '@/services/artist.service'
import { userService } from '@/services/user.service'
import { salesService } from '@/services/sales.service'
import type { Producto } from '@/interfaces/product.interface'
import type { UsuarioPerfil } from '@/interfaces/user.interface'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

const formatCLP = (monto: number): string =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(monto)

export const ArtistDashboardPage: React.FC = () => {
  const { session } = useAuth()
  const [obras, setObras] = useState<Producto[]>([])
  const [perfil, setPerfil] = useState<UsuarioPerfil | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cargar = async (): Promise<void> => {
      if (!session) return
      try {
        const [misObras, miPerfil] = await Promise.all([
          artistService.getMisObras(session.idUsuario),
          userService.obtenerPerfilPorCredencial(session.idUsuario),
        ])
        setObras(misObras)
        setPerfil(miPerfil)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar tu resumen')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [session])

  const aprobadas = obras.filter((o) => o.estado === 'APROBADO')
  const pendientes = obras.filter((o) => o.estado === 'PENDIENTE_REVISION')

  const ventasArtista = session ? salesService.getVentasPorArtista(session.idUsuario) : []
  const ventasDemo = ventasArtista.map((v) => ({
    idOrden: v.numeroOrden,
    obra: v.tituloObra,
    fecha: v.fecha,
    bruto: v.montoBrutoClp,
    fee: v.feePlataformaClp,
    neto: v.netoArtistaClp,
  }))
  const proximoPago = salesService.getProximoPagoDia5()

  const totalBruto = ventasDemo.reduce((acc, v) => acc + v.bruto, 0)
  const totalNeto = ventasDemo.reduce((acc, v) => acc + v.neto, 0)

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Hola, {perfil?.perfilArtista?.nombreArtistico || session?.nombre}
          </h2>
          <p className="text-sm text-slate-500">Gestiona tus obras, estado de aprobación y ganancias netas</p>
        </div>

        <div className="flex items-center gap-3">
          {perfil && (
            <Badge variant={perfil.estaVerificado ? 'success' : 'secondary'} className="gap-1.5 px-3 py-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              {perfil.estaVerificado ? 'Artista Verificado' : 'Verificación Pendiente'}
            </Badge>
          )}
          <Link to="/artista/publicar">
            <Button className="gap-2">
              <UploadCloud className="w-4 h-4" />
              Publicar Obra
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 text-sm bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="border-slate-200/80">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Images className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-950">{loading ? '–' : aprobadas.length}</p>
              <p className="text-xs text-slate-500">Obras publicadas</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-950">{loading ? '–' : pendientes.length}</p>
              <p className="text-xs text-slate-500">En revisión (Admin)</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#F3F5FE] text-[#0000FE] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-slate-950">{loading ? '–' : formatCLP(totalBruto)}</p>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                Ventas brutas <Badge variant="secondary" className="text-[9px] px-1.5 py-0">Demo</Badge>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-slate-950">{loading ? '–' : formatCLP(totalNeto)}</p>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                Ganancia neta (85%) <Badge variant="secondary" className="text-[9px] px-1.5 py-0">Demo</Badge>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cuenta Bancaria */}
      {perfil?.datosBancarios && (
        <Card className="border-slate-200/80 bg-white">
          <CardContent className="p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F3F5FE] text-[#0000FE] flex items-center justify-center">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Cuenta configurada para liquidaciones</p>
                <p className="text-sm font-bold text-slate-900">
                  {perfil.datosBancarios.bancoNombre} • {perfil.datosBancarios.tipoCuenta} N° {perfil.datosBancarios.numeroCuenta}
                </p>
              </div>
            </div>
            <Badge variant="outline">Titular: {perfil.datosBancarios.rutTitular}</Badge>
          </CardContent>
        </Card>
      )}

      {/* Tabla de Ventas / Desglose FEE */}
      <Card className="border-slate-200/80 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900">Detalle de Ventas y Liquidaciones</h3>
            <p className="text-xs text-slate-500">
              Pago mensual acumulativo los días 5 • Próximo pago automático: <strong>{proximoPago.fechaTexto}</strong>
            </p>
          </div>
          <Badge variant="secondary">Vista previa (Demo)</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3">Transacción</th>
                <th className="px-6 py-3">Obra</th>
                <th className="px-6 py-3">Fecha</th>
                <th className="px-6 py-3 text-right">Monto Bruto</th>
                <th className="px-6 py-3 text-right">FEE (15%)</th>
                <th className="px-6 py-3 text-right">Neto Artista</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ventasDemo.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400 text-xs">
                    Aún no tienes obras aprobadas para mostrar ventas.
                  </td>
                </tr>
              ) : (
                ventasDemo.map((v) => (
                  <tr key={v.idOrden} className="hover:bg-slate-50/60">
                    <td className="px-6 py-3 font-mono text-xs text-slate-600">{v.idOrden}</td>
                    <td className="px-6 py-3 font-medium text-slate-900">{v.obra}</td>
                    <td className="px-6 py-3 text-slate-500 text-xs">{v.fecha}</td>
                    <td className="px-6 py-3 text-right text-slate-700">{formatCLP(v.bruto)}</td>
                    <td className="px-6 py-3 text-right text-red-600">-{formatCLP(v.fee)}</td>
                    <td className="px-6 py-3 text-right font-bold text-emerald-700">{formatCLP(v.neto)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
