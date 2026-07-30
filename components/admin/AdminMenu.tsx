"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { AdminLoginForm } from "@/components/admin/AdminLoginForm"
import { Button } from "@/components/ui/button"
import {
  LayoutGrid,
  Package,
  Award,
  ShoppingCart,
  Settings,
  LogOut,
  Store,
  FileText,
  UserCheck,
} from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { isAuthenticated, checkingAuth, isAdmin, user, logout } = useAuth()

  if (checkingAuth) {
    return (
      <div className="fixed inset-0 z-50 bg-neutral-950 flex items-center justify-center text-xs text-neutral-400">
        Verificando sesión y permisos...
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-neutral-950">
        <AdminLoginForm onSuccess={() => window.location.reload()} />
      </div>
    )
  }

  // Rutas bien definidas con textos concisos para evitar saturación
  const allNavItems = [
    { href: "/admin", label: "Inicio", icon: LayoutGrid, exact: true, adminOnly: false },
    { href: "/admin/orders", label: "Pedidos", icon: ShoppingCart, adminOnly: false },
    { href: "/admin/points", label: "Puntos", icon: Award, adminOnly: false },
    { href: "/admin/inventory", label: "Inventario", icon: Package, adminOnly: true },
    { href: "/admin/fiscal", label: "Fiscal", icon: FileText, adminOnly: true },
    { href: "/admin/settings", label: "Ajustes", icon: Settings, adminOnly: true },
  ]

  const navItems = allNavItems.filter((item) => !item.adminOnly || isAdmin)

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 text-neutral-100 flex flex-col font-sans overflow-y-auto">
      {/* Navbar Superior Descomprimido */}
      <header className="sticky top-0 z-50 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 gap-2">
          
          {/* Logo + Badge */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="relative size-8 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src="/logo.png"
                  alt="Panda Rojo Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="font-serif text-base font-bold text-white tracking-tight hidden lg:inline">
                Panda Rojo
              </span>
            </Link>

            <span 
              className={`font-sans text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                isAdmin
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                  : "bg-blue-500/10 border-blue-500/20 text-blue-400"
              }`}
            >
              {isAdmin ? "ADMIN" : "CAJERO"}
            </span>
          </div>

          {/* Navegación Desktop Distribuida */}
          <nav className="hidden md:flex items-center gap-1 overflow-x-auto py-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-neutral-800 text-amber-400 font-semibold shadow-xs"
                      : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
                  }`}
                >
                  <Icon className="size-3.5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Acciones del Perfil */}
          <div className="flex items-center gap-2 shrink-0">
            {user?.name && (
              <div className="hidden xl:flex items-center gap-1.5 text-xs text-neutral-400 bg-neutral-900 px-2.5 py-1 rounded-md border border-neutral-800">
                <UserCheck className="size-3.5 text-emerald-400" />
                <span className="font-medium text-neutral-300 max-w-[120px] truncate">{user.name}</span>
              </div>
            )}

            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white transition-colors bg-neutral-900 border border-neutral-800 hover:border-neutral-700 px-2.5 py-1.5 rounded-lg"
            >
              <Store className="size-3.5 text-amber-400" />
              <span className="hidden sm:inline">Ver Tienda</span>
            </Link>

            <Button
              onClick={logout}
              variant="outline"
              size="sm"
              className="border-rose-900/40 bg-rose-950/20 hover:bg-rose-900/40 text-rose-300 text-xs h-8 px-2.5"
            >
              <LogOut className="size-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 pb-24 md:pb-8">
        {children}
      </main>

      {/* Navegación Móvil */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-neutral-950/95 backdrop-blur-lg border-t border-neutral-800 px-2 py-2 flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-medium transition-colors ${
                isActive
                  ? "text-amber-400 bg-neutral-900 font-semibold"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Icon className="size-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}