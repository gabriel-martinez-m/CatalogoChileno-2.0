import React, { useEffect, useState } from 'react'
import {
  DollarSign,
  TrendingUp,
  CalendarClock,
  Wallet,
  CheckCircle2,
  Clock,
  Landmark,
  Download,
  Play,
} from 'lucide-react'
import { salesService, type RegistroVenta } from '@/services/sales.service'
import { adminService } from '@/services/admin.service'
import type { UsuarioPerfil } from '@/interfaces/user.interface'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

const formatCLP = (monto: number): string =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(monto)

interface ResumenArtista {
  idArtista: number
  nombre: string
  banco: string
  ventasCount: number
  bruto: number
  fee: number
  netoPendiente: number
  netoLiquidado: number
}

export const SalesFinancePage: React.FC = () => {
  const [ventas, setVentas] = useState<RegistroVenta[]>(() => salesService.getVentas())
  const [usuariosMap, setUsuariosMap] = useState<Record<number, UsuarioPerfil>>({})
  const [liquidacionExitosa, setLiquidacionExitosa] = useState<boolean>(false)

  const proximoPago = salesService.getProximoPagoDia5()

  useEffect(() => {
    const cargarArtistas = async (): Promise<void> => {
      try {
        const lista = await adminService.getUsuarios()
        const mapa: Record<number, UsuarioPerfil> = {}
        lista.forEach((u) => {
          mapa[u.idCredencialRef] = u
          mapa[u.idUsuario] = u
        })
        setUsuariosMap(mapa)
      } catch {
        // Fallback con ID de artista
      }
    }
    cargarArtistas()
  }, [])

  const totalBruto = ventas.reduce((acc, v) => acc + v.montoBrutoClp, 0)
  const totalFee = ventas.reduce((acc, v) => acc + v.feePlataformaClp, 0)
  const totalPorPagar = ventas
    .filter((v) => v.estadoLiquidacion === 'PENDIENTE_DIA_5')
    .reduce((acc, v) => acc + v.netoArtistaClp, 0)

  // Agrupación acumulativa por artista
  const resumenPorArtista: ResumenArtista[] = Object.values(
    ventas.reduce<Record<number, ResumenArtista>>((acc, v) => {
      const perfil = usuariosMap[v.idArtista]
      const nombre =
        perfil?.perfilArtista?.nombreArtistico || perfil?.nombreCompleto || `Artista #${v.idArtista}`
      const banco = perfil?.datosBancarios
        ? `${perfil.datosBancarios.bancoNombre} • ${perfil.datosBancarios.tipoCuenta} ${perfil.datosBancarios.numeroCuenta}`
        : 'Cuenta bancaria por verificar'

      if (!acc[v.idArtista]) {
        acc[v.idArtista] = {
          idArtista: v.idArtista,
          nombre,
          banco,
          ventasCount: 0,
          bruto: 0,
          fee: 0,
          netoPendiente: 0,
          netoLiquidado: 0,
        }
      }

      acc[v.idArtista].ventasCount += 1
      acc[v.idArtista].bruto += v.montoBrutoClp
      acc[v.idArtista].fee += v.feePlataformaClp
      if (v.estadoLiquidacion === 'PENDIENTE_DIA_5') {
        acc[v.idArtista].netoPendiente += v.netoArtistaClp
      } else {
        acc[v.idArtista].netoLiquidado += v.netoArtistaClp
      }

      return acc
    }, {}),
  )

  const ejecutarLiquidacionDia5 = (): void => {
    const actualizadas = salesService.liquidarPendientes()
    setVentas(actualizadas)
    setLiquidacionExitosa(true)
    setTimeout(() => setLiquidacionExitosa(false), 3500)
  }

  const exportarCSV = (): void => {
    const encabezados = ['Orden', 'Fecha', 'Obra', 'ID Artista', 'Comprador', 'Medio Pago', 'Bruto CLP', 'FEE 15%', 'Neto Artista', 'Estado']
    const filas = ventas.map((v) => [
      v.numeroOrden,
      v.fecha,
      `"${v.tituloObra.replace(/"/g, '""')}"`,
      v.idArtista,
      v.compradorCorreo,
      v.medioPago,
      v.montoBrutoClp,
      v.feePlataformaClp,
      v.netoArtistaClp,
      v.estadoLiquidacion,
    ])
    const csv = [encabezados.join(','), ...filas.map((f) => f.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `reporte-ventas-catalogochileno-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Compras, Ventas y Liquidaciones</h2>
          <p className="text-sm text-slate-500">
            Control de obras vendidas, ganancia por comisión (FEE 15%) y pagos mensuales acumulados
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={exportarCSV} className="gap-2 text-xs">
          <Download className="w-4 h-4" />
          Exportar CSV
        </Button>
      </div>

      {/* KPIs Financieros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="border-slate-200/80">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-slate-950">{formatCLP(totalBruto)}</p>
              <p className="text-xs text-slate-500">Ventas brutas ({ventas.length} obras)</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#F3F5FE] text-[#0000FE] flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-[#0000FE]">{formatCLP(totalFee)}</p>
              <p className="text-xs text-slate-500">Ganancia Plataforma (FEE 15%)</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-slate-950">{formatCLP(totalPorPagar)}</p>
              <p className="text-xs text-slate-500">Acumulado por pagar (85%)</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-slate-950">{proximoPago.fechaTexto}</p>
              <p className="text-xs text-slate-500">
                Próximo pago automático ({proximoPago.diasRestantes} días)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Regla de Pago Automático Día 5 */}
      <Card className="border-[#D8DFFA] bg-[#F3F5FE]/70">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <CalendarClock className="w-4 h-4 text-[#0000FE]" />
              <span>Ciclo de Pago Automático Mensual — Día 5 de cada mes</span>
            </div>
            <p className="text-xs text-slate-600">
              Las ganancias netas (85%) se acumulan durante todo el mes calendario y se transfieren automáticamente el día 5 a la cuenta bancaria de cada artista.
            </p>
          </div>

          <Button
            size="sm"
            disabled={totalPorPagar === 0}
            onClick={ejecutarLiquidacionDia5}
            className="gap-1.5 shrink-0"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{totalPorPagar > 0 ? 'Simular pago del día 5' : 'Mes liquidado'}</span>
          </Button>
        </CardContent>
      </Card>

      {liquidacionExitosa && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>¡Liquidación mensual ejecutada! Todos los saldos acumulados fueron marcados como pagados.</span>
        </div>
      )}

      {/* Tabla 1: Acumulado Mensual por Artista */}
      <Card className="border-slate-200/80 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900">Acumulado del Mes por Artista</h3>
            <p className="text-xs text-slate-500">Saldo consolidado para transferencia automática el día 5</p>
          </div>
          <Badge variant="default">Pago día 5</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3">Artista</th>
                <th className="px-6 py-3">Cuenta Bancaria Destino</th>
                <th className="px-6 py-3 text-center">Obras</th>
                <th className="px-6 py-3 text-right">Ventas Brutas</th>
                <th className="px-6 py-3 text-right">FEE (15%)</th>
                <th className="px-6 py-3 text-right">Acumulado a Pagar</th>
                <th className="px-6 py-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {resumenPorArtista.map((a) => (
                <tr key={a.idArtista} className="hover:bg-slate-50/60">
                  <td className="px-6 py-3 font-bold text-slate-900">{a.nombre}</td>
                  <td className="px-6 py-3 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1.5">
                      <Landmark className="w-3.5 h-3.5 text-[#0000FE]" />
                      {a.banco}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center font-semibold text-slate-700">{a.ventasCount}</td>
                  <td className="px-6 py-3 text-right text-slate-700">{formatCLP(a.bruto)}</td>
                  <td className="px-6 py-3 text-right font-semibold text-[#0000FE]">{formatCLP(a.fee)}</td>
                  <td className="px-6 py-3 text-right font-extrabold text-emerald-700">
                    {formatCLP(a.netoPendiente > 0 ? a.netoPendiente : a.netoLiquidado)}
                  </td>
                  <td className="px-6 py-3 text-center">
                    {a.netoPendiente > 0 ? (
                      <Badge variant="secondary" className="gap-1 text-[11px]">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Acumulado (05)
                      </Badge>
                    ) : (
                      <Badge variant="success" className="gap-1 text-[11px]">
                        <CheckCircle2 className="w-3 h-3" />
                        Pagado
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Tabla 2: Detalle de Obras Vendidas */}
      <Card className="border-slate-200/80 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Historial de Obras Vendidas</h3>
          <p className="text-xs text-slate-500">Detalle por transacción con cálculo de ganancia de la plataforma</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3">N° Orden</th>
                <th className="px-6 py-3">Fecha</th>
                <th className="px-6 py-3">Obra Vendida</th>
                <th className="px-6 py-3">Comprador</th>
                <th className="px-6 py-3 text-right">Precio Venta</th>
                <th className="px-6 py-3 text-right">FEE Ganancia (15%)</th>
                <th className="px-6 py-3 text-right">Neto Artista</th>
                <th className="px-6 py-3 text-center">Liquidación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ventas.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/60">
                  <td className="px-6 py-3 font-mono text-xs text-slate-600">{v.numeroOrden}</td>
                  <td className="px-6 py-3 text-xs text-slate-500">{v.fecha}</td>
                  <td className="px-6 py-3 font-semibold text-slate-900">{v.tituloObra}</td>
                  <td className="px-6 py-3 text-xs text-slate-600">{v.compradorCorreo}</td>
                  <td className="px-6 py-3 text-right text-slate-800">{formatCLP(v.montoBrutoClp)}</td>
                  <td className="px-6 py-3 text-right font-bold text-[#0000FE]">+{formatCLP(v.feePlataformaClp)}</td>
                  <td className="px-6 py-3 text-right font-semibold text-emerald-700">{formatCLP(v.netoArtistaClp)}</td>
                  <td className="px-6 py-3 text-center">
                    {v.estadoLiquidacion === 'PENDIENTE_DIA_5' ? (
                      <Badge variant="secondary" className="text-[10px]">Pendiente día 5</Badge>
                    ) : (
                      <Badge variant="success" className="text-[10px]">Pagado</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
