import React from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, LogOut, Compass, Sparkles } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export const ClienteLayout: React.FC = () => {
  const { session, logout, isAuthenticated } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Top Banner Informativo / Duoc UC */}
      <div className="bg-[#0000FE] text-white text-xs py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Ecosistema CatalogoChileno — Microservicios Fullstack 2 (Duoc UC)</span>
      </div>

      {/* Navbar Principal Estilo Behance */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo e Identidad */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="/images/LogoCatalogoChileno.svg" 
              alt="Logo Catálogo Chileno" 
              className="h-9 w-auto transition-transform group-hover:scale-105"
              onError={(e) => {
                // Fallback si no carga imagen directa
                (e.target as HTMLElement).style.display = 'none'
              }}
            />
             <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-950 font-['Raleway']">
                Catálogo<span className="text-[#0000FE]">Chileno</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1">
                Marketplace Digital
              </span>
            </div>
          </Link>

          {/* Navegación Central */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link to="/" className="hover:text-[#0000FE] transition-colors flex items-center gap-1.5 text-slate-900 font-semibold">
              <Compass className="w-4 h-4 text-[#0000FE]" />
              Explorar Catálogo
            </Link>
            <span className="text-slate-300">|</span>
            <span className="text-xs text-slate-400 font-normal">
              4 Microservicios activos en MySQL Docker
            </span>
          </nav>

          {/* Acciones de Usuario y Carrito */}
          <div className="flex items-center gap-3">
            {/* Botón Carrito */}
            <Link to="/carrito">
              <Button variant="outline" size="default" className="relative gap-2 border-slate-200 text-slate-700 hover:border-[#0000FE] hover:text-[#0000FE]">
                <ShoppingCart className="w-4 h-4 text-[#0000FE]" />
                <span className="hidden sm:inline font-semibold">Carrito</span>
                {itemCount > 0 && (
                  <Badge variant="primary" className="ml-1 px-2 py-0.5 text-xs animate-pulse">
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Estado de Sesión */}
            {isAuthenticated && session ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-900 leading-tight">
                    {session.nombre}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium">
                    {session.correo}
                  </span>
                </div>
                <div className="w-9 h-9 rounded-full bg-[#F3F5FE] border border-[#D8DFFA] text-[#0000FE] flex items-center justify-center font-bold text-sm">
                  {session.nombre.charAt(0)}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => {
                    logout()
                    navigate('/login')
                  }}
                  title="Cerrar sesión"
                  className="text-slate-400 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button variant="default" className="gap-2">
                  <User className="w-4 h-4" />
                  <span>Iniciar Sesión</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Vista de contenido */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer Minimalista */}
      <footer className="bg-white border-t border-slate-200/80 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 CatálogoChileno SpA. Proyecto Full Stack 2 — Duoc UC.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Spring Boot 3.x (Java 21)</span>
            <span>•</span>
            <span>MySQL Docker</span>
            <span>•</span>
            <span>Spring Cloud Gateway</span>
            <span>•</span>
            <span>React 19 + Tailwind v4</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
