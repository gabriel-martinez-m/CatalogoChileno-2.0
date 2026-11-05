import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const LoginPage: React.FC = () => {
  const [correo, setCorreo] = useState<string>('cliente@test.cl')
  const [contrasena, setContrasena] = useState<string>('Password123!')
  const [error, setError] = useState<string | null>(null)
  const [successToken, setSuccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const session = await login(correo, contrasena)
      setSuccessToken(session.token)
      setTimeout(() => {
        navigate('/')
      }, 1200)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al autenticar'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const fillQuickCredentials = (tipo: 'cliente' | 'artista') => {
    if (tipo === 'cliente') {
      setCorreo('cliente@test.cl')
      setContrasena('Password123!')
    } else {
      setCorreo('artista@test.cl')
      setContrasena('Password123!')
    }
    setError(null)
  }

  return (
    <div className="max-w-md mx-auto my-8">
      <Card className="border-slate-200/80 shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="w-12 h-12 bg-[#F3F5FE] text-[#0000FE] rounded-2xl mx-auto flex items-center justify-center mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
            Iniciar Sesión
          </CardTitle>
          <CardDescription className="text-sm text-slate-500">
            Ingresa al ecosistema de microservicios autenticado con JWT
          </CardDescription>
        </CardHeader>

        {/* Atajos de prueba para el profesor */}
        <div className="px-6 py-2">
          <div className="bg-[#F3F5FE] border border-[#D8DFFA] rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0000FE] mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cuentas de prueba en MySQL (Docker):</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fillQuickCredentials('cliente')}
                className="flex-1 bg-white hover:bg-slate-50 text-[11px] font-semibold py-1.5 px-2 rounded-lg border border-slate-200 text-slate-700 transition-colors shadow-2xs text-center cursor-pointer"
              >
                👤 Cargar Cliente
              </button>
              <button
                type="button"
                onClick={() => fillQuickCredentials('artista')}
                className="flex-1 bg-white hover:bg-slate-50 text-[11px] font-semibold py-1.5 px-2 rounded-lg border border-slate-200 text-slate-700 transition-colors shadow-2xs text-center cursor-pointer"
              >
                🎨 Cargar Artista
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-4">
            {error && (
              <div className="flex items-center gap-2 p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successToken && (
              <div className="p-3 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>¡Token JWT emitido exitosamente! Redirigiendo...</span>
                </div>
                <p className="font-mono text-[10px] truncate text-slate-500">
                  {successToken.substring(0, 40)}...
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Correo Electrónico</span>
              </label>
              <Input
                type="email"
                required
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="ejemplo@test.cl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Contraseña</span>
              </label>
              <Input
                type="password"
                required
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="••••••••••••"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Encriptado con BCrypt
              </span>
              <span className="text-slate-400">Pass: Password123!</span>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button
              type="submit"
              variant="default"
              size="lg"
              className="w-full gap-2 text-base font-semibold"
              disabled={isLoading || !!successToken}
            >
              {isLoading ? (
                <span>Validando en Gateway...</span>
              ) : (
                <>
                  <span>Ingresar a CatálogoChileno</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>

            <p className="text-center text-xs text-slate-500">
              ¿Quieres explorar sin ingresar?{' '}
              <Link to="/" className="text-[#0000FE] font-semibold hover:underline">
                Ir al Catálogo Público
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
