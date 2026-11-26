import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Lock, Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

export const LoginPage: React.FC = () => {
  const [correo, setCorreo] = useState<string>('')
  const [contrasena, setContrasena] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const session = await login(correo, contrasena)
      setSuccess(true)
      const destino = session.rol === 'ROLE_ADMINISTRADOR' ? '/admin' : '/'
      setTimeout(() => navigate(destino), 800)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al autenticar'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
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
            Ingresa con tu correo y contraseña
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-4">
            {error && (
              <div className="flex items-center gap-2 p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>¡Inicio de sesión exitoso! Redirigiendo...</span>
                </div>
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
                placeholder="ejemplo@correo.cl"
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
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button
              type="submit"
              variant="default"
              size="lg"
              className="w-full gap-2 text-base font-semibold"
              disabled={isLoading || success}
            >
              {isLoading ? (
                <span>Iniciando sesión...</span>
              ) : (
                <>
                  <span>Ingresar</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>

            <p className="text-center text-xs text-slate-500">
              ¿No tienes cuenta?{' '}
              <Link to="/registro" className="text-[#0000FE] font-semibold hover:underline">
                Crear cuenta
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
