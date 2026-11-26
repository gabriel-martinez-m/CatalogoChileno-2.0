import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Palette, ShieldCheck, Landmark, CheckCircle2, Clock, AlertCircle, Upload } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { userService } from '@/services/user.service'
import { validarRut, formatearRut } from '@/lib/rut'
import type { TipoCuenta, UsuarioPerfil } from '@/interfaces/user.interface'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

const BANCOS_CHILE = [
  'Banco de Chile',
  'BancoEstado',
  'Banco Santander Chile',
  'BCI (Banco de Crédito e Inversiones)',
  'Scotiabank Chile',
  'Banco Itaú',
  'Banco BICE',
  'Banco Security',
]

const TIPOS_CUENTA: { valor: TipoCuenta; etiqueta: string }[] = [
  { valor: 'CORRIENTE', etiqueta: 'Cuenta Corriente' },
  { valor: 'VISTA', etiqueta: 'Cuenta Vista' },
  { valor: 'RUT', etiqueta: 'CuentaRUT' },
  { valor: 'AHORRO', etiqueta: 'Cuenta de Ahorro' },
]

export const BecomeArtistPage: React.FC = () => {
  const { session } = useAuth()

  const [perfil, setPerfil] = useState<UsuarioPerfil | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [enviado, setEnviado] = useState<boolean>(false)

  const [nombreArtistico, setNombreArtistico] = useState<string>('')
  const [biografia, setBiografia] = useState<string>('')
  const [fotoAnverso, setFotoAnverso] = useState<string>('/images/01.jpg')
  const [fotoReverso, setFotoReverso] = useState<string>('/images/02.jpg')
  const [bancoNombre, setBancoNombre] = useState<string>(BANCOS_CHILE[0])
  const [tipoCuenta, setTipoCuenta] = useState<TipoCuenta>('CORRIENTE')
  const [numeroCuenta, setNumeroCuenta] = useState<string>('')
  const [rutTitular, setRutTitular] = useState<string>('')

  useEffect(() => {
    const cargar = async (): Promise<void> => {
      if (!session) {
        setLoading(false)
        return
      }
      try {
        const data = await userService.obtenerPerfilPorCredencial(session.idUsuario)
        setPerfil(data)
        setRutTitular(data.rutChileno)
        if (data.perfilArtista) {
          setNombreArtistico(data.perfilArtista.nombreArtistico)
          setBiografia(data.perfilArtista.biografia || '')
          setFotoAnverso(data.perfilArtista.fotoCarnetAnversoRuta || '/images/01.jpg')
          setFotoReverso(data.perfilArtista.fotoCarnetReversoRuta || '/images/02.jpg')
        }
        if (data.datosBancarios) {
          setBancoNombre(data.datosBancarios.bancoNombre)
          setTipoCuenta(data.datosBancarios.tipoCuenta)
          setNumeroCuenta(data.datosBancarios.numeroCuenta)
          setRutTitular(data.datosBancarios.rutTitular)
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar tu perfil')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [session])

  const seleccionarArchivo = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void,
  ): void => {
    const file = e.target.files?.[0]
    if (!file) return
    const ext = file.name.toLowerCase()
    if (!ext.endsWith('.jpg') && !ext.endsWith('.jpeg') && !ext.endsWith('.png')) {
      setError('Las fotos del carnet deben estar en formato JPG o PNG.')
      return
    }
    setError(null)
    setter(`/uploads/kyc/${file.name}`)
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!perfil) return
    setError(null)

    if (!validarRut(rutTitular)) {
      setError('El RUT del titular bancario no es válido.')
      return
    }
    if (formatearRut(rutTitular) !== formatearRut(perfil.rutChileno)) {
      setError(`El RUT del titular debe coincidir con tu RUT registrado (${perfil.rutChileno}).`)
      return
    }

    setSaving(true)
    try {
      await userService.solicitarSerArtista(perfil.idUsuario, {
        nombreArtistico: nombreArtistico.trim(),
        biografia: biografia.trim(),
        fotoAnverso: fotoAnverso.trim(),
        fotoReverso: fotoReverso.trim(),
        bancoNombre,
        tipoCuenta,
        numeroCuenta: numeroCuenta.trim(),
        rutTitular: formatearRut(rutTitular),
      })
      const actualizado = await userService.obtenerPerfilPorCredencial(session!.idUsuario)
      setPerfil(actualizado)
      setEnviado(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar la solicitud')
    } finally {
      setSaving(false)
    }
  }

  if (!session) {
    return (
      <Card className="max-w-lg mx-auto my-12 text-center p-8 space-y-4">
        <Palette className="w-10 h-10 text-[#0000FE] mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Inicia sesión para ser artista</h2>
        <p className="text-sm text-slate-500">
          Primero debes crear tu cuenta o iniciar sesión como usuario para postular como creador.
        </p>
        <div className="flex justify-center gap-3">
          <Link to="/login"><Button>Iniciar Sesión</Button></Link>
          <Link to="/registro"><Button variant="outline">Crear cuenta</Button></Link>
        </div>
      </Card>
    )
  }

  if (loading) {
    return <p className="text-center py-12 text-sm text-slate-500">Cargando tu perfil...</p>
  }

  const yaTieneSolicitud = !!perfil?.perfilArtista

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Palette className="w-6 h-6 text-[#0000FE]" />
            Conviértete en Artista
          </h1>
          <p className="text-sm text-slate-500">
            Completa tu verificación de identidad y datos bancarios para vender obras en CatálogoChileno.
          </p>
        </div>

        {yaTieneSolicitud && (
          <Badge variant={perfil?.estaVerificado ? 'success' : 'secondary'} className="gap-1.5 w-fit px-3 py-1">
            {perfil?.estaVerificado ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Artista Verificado
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Pendiente de revisión
              </>
            )}
          </Badge>
        )}
      </div>

      {enviado && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">¡Solicitud enviada al equipo de administración!</p>
            <p className="text-xs text-emerald-700 mt-0.5">
              Un administrador revisará tu RUT, carnet y datos bancarios para habilitar tu cuenta como artista verificado.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="border-slate-200/80 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">1. Perfil Artístico y Verificación de Identidad</CardTitle>
            <CardDescription>
              RUT registrado en tu cuenta: <strong className="text-slate-900">{perfil?.rutChileno}</strong>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Nombre artístico o estudio</label>
              <Input
                required
                value={nombreArtistico}
                onChange={(e) => setNombreArtistico(e.target.value)}
                placeholder="Ej: Patagonia Visual Studio"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Biografía profesional</label>
              <textarea
                required
                rows={3}
                value={biografia}
                onChange={(e) => setBiografia(e.target.value)}
                placeholder="Cuéntanos sobre tu especialidad fotográfica o audiovisual en Chile..."
                className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0000FE]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0000FE]" />
                  Carnet — Anverso (JPG/PNG)
                </label>
                <Input
                  required
                  value={fotoAnverso}
                  onChange={(e) => setFotoAnverso(e.target.value)}
                  placeholder="/uploads/kyc/anverso.jpg"
                />
                <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#0000FE] cursor-pointer hover:underline">
                  <Upload className="w-3 h-3" />
                  <span>Adjuntar archivo local</span>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => seleccionarArchivo(e, setFotoAnverso)}
                  />
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0000FE]" />
                  Carnet — Reverso (JPG/PNG)
                </label>
                <Input
                  required
                  value={fotoReverso}
                  onChange={(e) => setFotoReverso(e.target.value)}
                  placeholder="/uploads/kyc/reverso.jpg"
                />
                <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#0000FE] cursor-pointer hover:underline">
                  <Upload className="w-3 h-3" />
                  <span>Adjuntar archivo local</span>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => seleccionarArchivo(e, setFotoReverso)}
                  />
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Landmark className="w-4 h-4 text-[#0000FE]" />
                <span>2. Datos Bancarios para Liquidación de Ventas</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Banco</label>
                  <select
                    value={bancoNombre}
                    onChange={(e) => setBancoNombre(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0000FE]"
                  >
                    {BANCOS_CHILE.map((banco) => (
                      <option key={banco} value={banco}>{banco}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Tipo de cuenta</label>
                  <select
                    value={tipoCuenta}
                    onChange={(e) => setTipoCuenta(e.target.value as TipoCuenta)}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0000FE]"
                  >
                    {TIPOS_CUENTA.map((t) => (
                      <option key={t.valor} value={t.valor}>{t.etiqueta}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Número de cuenta</label>
                  <Input
                    required
                    value={numeroCuenta}
                    onChange={(e) => setNumeroCuenta(e.target.value)}
                    placeholder="000098765432"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">RUT del titular</label>
                  <Input
                    required
                    value={rutTitular}
                    onChange={(e) => setRutTitular(e.target.value)}
                    onBlur={() => setRutTitular(formatearRut(rutTitular))}
                    placeholder={perfil?.rutChileno}
                  />
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-3">
            <Link to="/"><Button type="button" variant="outline">Volver al catálogo</Button></Link>
            <Button type="submit" disabled={saving}>
              {saving ? 'Enviando solicitud...' : yaTieneSolicitud ? 'Actualizar solicitud' : 'Enviar solicitud de artista'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
