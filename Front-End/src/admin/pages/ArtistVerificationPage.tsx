import React, { useCallback, useEffect, useState } from 'react'
import { Check, X, ShieldCheck, Clock, AlertCircle, Landmark, IdCard, UserCheck } from 'lucide-react'
import type { UsuarioPerfil } from '@/interfaces/user.interface'
import { adminService } from '@/services/admin.service'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type FiltroVerificacion = 'PENDIENTES' | 'VERIFICADOS' | 'TODOS'

const FILTROS: { id: FiltroVerificacion; etiqueta: string }[] = [
  { id: 'PENDIENTES', etiqueta: 'Pendientes' },
  { id: 'VERIFICADOS', etiqueta: 'Verificados' },
  { id: 'TODOS', etiqueta: 'Todos' },
]

export const ArtistVerificationPage: React.FC = () => {
  const [usuarios, setUsuarios] = useState<UsuarioPerfil[]>([])
  const [filtro, setFiltro] = useState<FiltroVerificacion>('PENDIENTES')
  const [seleccionado, setSeleccionado] = useState<UsuarioPerfil | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [procesando, setProcesando] = useState<boolean>(false)

  const [modalRechazo, setModalRechazo] = useState<boolean>(false)
  const [motivoRechazo, setMotivoRechazo] = useState<string>('')

  const cargar = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const lista = await adminService.getUsuarios()
      const artistas = lista.filter((u) => u.perfilArtista !== null && u.perfilArtista !== undefined)
      setUsuarios(artistas)
      setSeleccionado((prev) =>
        prev ? artistas.find((a) => a.idUsuario === prev.idUsuario) ?? artistas[0] ?? null : artistas[0] ?? null,
      )
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las solicitudes')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  const filtrados = usuarios.filter((u) => {
    if (filtro === 'PENDIENTES') return !u.estaVerificado
    if (filtro === 'VERIFICADOS') return u.estaVerificado
    return true
  })

  const cambiarEstado = async (idUsuario: number, verificado: boolean): Promise<void> => {
    setProcesando(true)
    setError(null)
    try {
      await adminService.verificarArtista(idUsuario, verificado)
      setUsuarios((prev) =>
        prev.map((u) => (u.idUsuario === idUsuario ? { ...u, estaVerificado: verificado } : u)),
      )
      setSeleccionado((prev) =>
        prev && prev.idUsuario === idUsuario ? { ...prev, estaVerificado: verificado } : prev,
      )
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la verificación')
    } finally {
      setProcesando(false)
    }
  }

  const confirmarRechazo = async (): Promise<void> => {
    if (!seleccionado || !motivoRechazo.trim()) return
    setModalRechazo(false)
    setMotivoRechazo('')
    await cambiarEstado(seleccionado.idUsuario, false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Verificación de artistas</h2>
        <p className="text-sm text-slate-500">Revisa RUT, carnet de identidad y datos bancarios antes de habilitar ventas</p>
      </div>

      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFiltro(f.id)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer',
              filtro === f.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900',
            )}
          >
            {f.etiqueta}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 text-sm bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && <p className="text-sm text-slate-500">Cargando solicitudes de artistas...</p>}

      {!loading && filtrados.length === 0 && (
        <Card className="border-dashed border-2 border-slate-200">
          <CardContent className="py-16 text-center text-sm text-slate-500">
            No hay artistas en esta categoría.
          </CardContent>
        </Card>
      )}

      {!loading && filtrados.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Columna Izquierda: Lista Maestra */}
          <div className="lg:col-span-5 space-y-2.5">
            {filtrados.map((u) => {
              const activo = seleccionado?.idUsuario === u.idUsuario
              return (
                <button
                  key={u.idUsuario}
                  type="button"
                  onClick={() => setSeleccionado(u)}
                  className={cn(
                    'w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3',
                    activo
                      ? 'bg-white border-[#0000FE] ring-2 ring-[#0000FE]/10 shadow-sm'
                      : 'bg-white border-slate-200/80 hover:border-slate-300',
                  )}
                >
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-slate-900 truncate">
                      {u.perfilArtista?.nombreArtistico || u.nombreCompleto}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{u.nombreCompleto}</p>
                    <p className="text-[11px] font-mono text-slate-400 mt-1">RUT: {u.rutChileno}</p>
                  </div>
                  <Badge variant={u.estaVerificado ? 'success' : 'secondary'} className="shrink-0 gap-1">
                    {u.estaVerificado ? (
                      <>
                        <Check className="w-3 h-3" />
                        Verificado
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3 text-amber-600" />
                        Pendiente
                      </>
                    )}
                  </Badge>
                </button>
              )
            })}
          </div>

          {/* Columna Derecha: Detalle KYC */}
          {seleccionado && (
            <Card className="lg:col-span-7 border-slate-200/80">
              <CardContent className="p-6 space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {seleccionado.perfilArtista?.nombreArtistico}
                    </h3>
                    <p className="text-sm text-slate-500">{seleccionado.nombreCompleto}</p>
                  </div>
                  <Badge variant={seleccionado.estaVerificado ? 'success' : 'secondary'} className="px-3 py-1">
                    {seleccionado.estaVerificado ? 'Identidad Verificada' : 'Pendiente de Revisión'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block">RUT registrado</span>
                    <span className="font-bold font-mono text-slate-900">{seleccionado.rutChileno}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block">Teléfono</span>
                    <span className="font-bold text-slate-900">{seleccionado.telefono || 'No informado'}</span>
                  </div>
                </div>

                {seleccionado.perfilArtista?.biografia && (
                  <div className="text-xs space-y-1">
                    <span className="font-semibold text-slate-700">Biografía</span>
                    <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl">
                      {seleccionado.perfilArtista.biografia}
                    </p>
                  </div>
                )}

                {/* Visor de Documentos (Carnet) */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <IdCard className="w-4 h-4 text-[#0000FE]" />
                    Documentación de Identidad (Carnet)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                      <img
                        src={seleccionado.perfilArtista?.fotoCarnetAnversoRuta || '/images/01.jpg'}
                        alt="Carnet anverso"
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/01.jpg'
                        }}
                      />
                      <p className="p-2 text-[11px] font-medium text-slate-600 truncate">
                        Anverso: {seleccionado.perfilArtista?.fotoCarnetAnversoRuta || 'No adjunto'}
                      </p>
                    </div>
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                      <img
                        src={seleccionado.perfilArtista?.fotoCarnetReversoRuta || '/images/02.jpg'}
                        alt="Carnet reverso"
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/02.jpg'
                        }}
                      />
                      <p className="p-2 text-[11px] font-medium text-slate-600 truncate">
                        Reverso: {seleccionado.perfilArtista?.fotoCarnetReversoRuta || 'No adjunto'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Datos Bancarios */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Landmark className="w-4 h-4 text-[#0000FE]" />
                    Datos Bancarios
                  </h4>
                  {seleccionado.datosBancarios ? (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block">Banco</span>
                        <span className="font-bold text-slate-900">{seleccionado.datosBancarios.bancoNombre}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Tipo y Número</span>
                        <span className="font-bold text-slate-900">
                          {seleccionado.datosBancarios.tipoCuenta} • {seleccionado.datosBancarios.numeroCuenta}
                        </span>
                      </div>
                      <div className="col-span-2 flex items-center justify-between pt-2 border-t border-slate-200/80">
                        <span>RUT Titular: <strong className="font-mono">{seleccionado.datosBancarios.rutTitular}</strong></span>
                        {seleccionado.datosBancarios.rutTitular === seleccionado.rutChileno ? (
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5" /> Coincide con perfil
                          </span>
                        ) : (
                          <span className="text-red-600 font-bold">No coincide con perfil</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Sin datos bancarios registrados.</p>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex gap-3 pt-2 border-t border-slate-100">
                  {!seleccionado.estaVerificado ? (
                    <>
                      <Button
                        className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700"
                        disabled={procesando}
                        onClick={() => cambiarEstado(seleccionado.idUsuario, true)}
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Aprobar Artista
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 gap-2 text-red-600 border-red-200 hover:bg-red-50"
                        disabled={procesando}
                        onClick={() => setModalRechazo(true)}
                      >
                        <X className="w-4 h-4" />
                        Rechazar
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full gap-2 text-red-600 border-red-200 hover:bg-red-50"
                      disabled={procesando}
                      onClick={() => setModalRechazo(true)}
                    >
                      <X className="w-4 h-4" />
                      Revocar Verificación
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {modalRechazo && seleccionado && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Rechazar / Revocar verificación</h3>
              <p className="text-sm text-slate-500">{seleccionado.nombreCompleto}</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Motivo</label>
              <textarea
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
                rows={3}
                placeholder="Ej: La foto del carnet es ilegible o el RUT bancario no coincide."
                className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0000FE]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setModalRechazo(false)
                  setMotivoRechazo('')
                }}
              >
                Cancelar
              </Button>
              <Button className="bg-red-600 hover:bg-red-700" disabled={!motivoRechazo.trim()} onClick={confirmarRechazo}>
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
