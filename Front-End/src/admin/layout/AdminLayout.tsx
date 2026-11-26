import React from 'react'
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ShieldCheck, UserCheck, DollarSign, Store, LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

const ENLACES = [
  { to: '/admin', etiqueta: 'Dashboard', icono: LayoutDashboard, fin: true },
  { to: '/admin/moderacion', etiqueta: 'Moderación de obras', icono: ShieldCheck, fin: false },
  { to: '/admin/verificacion', etiqueta: 'Verificación de artistas', icono: UserCheck, fin: false },
  { to: '/admin/ventas', etiqueta: 'Compras y Ventas', icono: DollarSign, fin: false },
]

export const AdminLayout: React.FC = () => {
  const { session, logout } = useAuth()
  const navigate = useNavigate()

  const cerrarSesion = (): void => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 text-slate-900 font-sans">
      <aside className="md:w-64 md:min-h-screen bg-slate-950 text-slate-300 flex md:flex-col shrink-0">
        <div className="px-6 py-5 border-b border-white/10 hidden md:block">
          <p className="text-lg font-bold tracking-tight text-white font-['Raleway']">
            Catálogo<span className="text-[#6B6BFF]">Chileno</span>
          </p>
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
            Administración
          </p>
        </div>

        <nav className="flex md:flex-col gap-1 p-3 flex-1 overflow-x-auto">
          {ENLACES.map(({ to, etiqueta, icono: Icono, fin }) => (
            <NavLink
              key={to}
              to={to}
              end={fin}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors',
                  isActive
                    ? 'bg-[#0000FE] text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white',
                )
              }
            >
              <Icono className="w-4 h-4" />
              <span>{etiqueta}</span>
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:block p-3 border-t border-white/10 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <Store className="w-4 h-4" />
            <span>Ver tienda</span>
          </Link>
          <button
            type="button"
            onClick={cerrarSesion}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-white/5 hover:text-red-400 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between">
          <h1 className="text-sm font-semibold text-slate-500">Panel de administración</h1>
          <div className="flex items-center gap-3">
            <div className="text-right leading-tight">
              <p className="text-xs font-bold text-slate-900">{session?.nombre}</p>
              <p className="text-[10px] text-slate-500">{session?.correo}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#F3F5FE] border border-[#D8DFFA] text-[#0000FE] flex items-center justify-center font-bold text-sm">
              {session?.nombre.charAt(0)}
            </div>
            <button
              type="button"
              onClick={cerrarSesion}
              title="Cerrar sesión"
              className="md:hidden text-slate-400 hover:text-red-600 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
