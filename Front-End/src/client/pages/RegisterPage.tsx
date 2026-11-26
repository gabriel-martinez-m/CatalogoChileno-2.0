import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { formatearRut, validarRut } from '@/lib/rut'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

interface FormState {
  nombre: string
  rut: string
  correo: string
  telefono: string
  contrasena: string
  confirmar: string
}

const ESTADO_INICIAL: FormState = {
  nombre: '',
  rut: '',
  correo: '',
  telefono: '',
  contrasena: '',
  confirmar: '',
}

export const RegisterPage: React.FC = () => {
  const [form, setForm] = useState<FormState>(ESTADO_INICIAL)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  const actualizar = (campo: keyof FormState, valor: string): void => {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setError(null)

    if (!validarRut(form.rut)) {
      setError('El RUT ingresado no es válido.')
      return
    }
    if (form.contrasena.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (form.contrasena !== form.confirmar) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setIsLoading(true)
    try {
      await register({
        nombre: form.nombre.trim(),
        rut: formatearRut(form.rut),
        correo: form.correo.trim(),
        telefono: form.telefono.trim() || undefined,
        contrasena: form.contrasena,
      })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 1500)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto my-8">
      <Card className="border-slate-200/80 shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="w-12 h-12 bg-[#F3F5FE] text-[#0000FE] rounded-2xl mx-auto flex items-center justify-center mb-3">
            <UserPlus className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
            Crear cuenta
          </CardTitle>
          <CardDescription className="text-sm text-slate-500">
            Regístrate para comprar obras de artistas chilenos
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
              <div className="flex items-center gap-1.5 p-3 text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl">
                <CheckCircle2 className="w-4 h-4" />
                <span>¡Cuenta creada! Ahora puedes iniciar sesión...</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Nombre completo</label>
              <Input
                required
                value={form.nombre}
                onChange={(e) => actualizar('nombre', e.target.value)}
                placeholder="Sofía Rojas"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">RUT</label>
                <Input
                  required
                  value={form.rut}
                  onChange={(e) => actualizar('rut', e.target.value)}
                  onBlur={() => actualizar('rut', formatearRut(form.rut))}
                  placeholder="12.345.678-5"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Teléfono (opcional)</label>
                <Input
                  value={form.telefono}
                  onChange={(e) => actualizar('telefono', e.target.value)}
                  placeholder="+56912345678"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Correo electrónico</label>
              <Input
                type="email"
                required
                value={form.correo}
                onChange={(e) => actualizar('correo', e.target.value)}
                placeholder="ejemplo@correo.cl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Contraseña</label>
                <Input
                  type="password"
                  required
                  value={form.contrasena}
                  onChange={(e) => actualizar('contrasena', e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Confirmar</label>
                <Input
                  type="password"
                  required
                  value={form.confirmar}
                  onChange={(e) => actualizar('confirmar', e.target.value)}
                  placeholder="Repite la contraseña"
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button
              type="submit"
              size="lg"
              className="w-full text-base font-semibold"
              disabled={isLoading || success}
            >
              {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
            </Button>

            <p className="text-center text-xs text-slate-500">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-[#0000FE] font-semibold hover:underline">
                Iniciar sesión
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
