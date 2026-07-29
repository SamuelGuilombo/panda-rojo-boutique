"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useAdminAuth } from "@/hooks/useAdminAuth"
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
} from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { isAuthenticated, checkingAuth, logout } = useAdminAuth()

  if (checkingAuth) {
    return (
      <div className="fixed inset-0 z-50 bg-neutral-950 flex items-center justify-center text-xs text-neutral-400">
        Verificando sesión administrativa...
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

  const navItems = [
    { href: "/admin", label: "Inicio", icon: LayoutGrid, exact: true },
    { href: "/admin/inventory", label: "Inventario", icon: Package },
    { href: "/admin/points", label: "Puntos Bambú", icon: Award },
    { href: "/admin/orders", label: "Pedidos", icon: ShoppingCart },
    { href: "/admin/fiscal", label: "Control Fiscal", icon: FileText },
    { href: "/admin/settings", label: "Ajustes", icon: Settings },
  ]

  return (
    /* Usamos fixed inset-0 z-50 para ocultar cualquier header público o elementos heredados */
    <div className="fixed inset-0 z-50 bg-neutral-950 text-neutral-100 flex flex-col font-sans overflow-y-auto">
      {/* Navbar Superior Exclusivo de Admin */}
      <header className="sticky top-0 z-50 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="relative size-9 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src="/logo.png"
                  alt="Panda Rojo Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="font-serif text-lg font-bold text-white tracking-tight hidden sm:inline">
                Panda Rojo
              </span>
              <span className="text-amber-500 font-sans text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                ADMIN
              </span>
            </Link>

            {/* Pestañas de Navegación Desktop */}
            <nav className="hidden md:flex items-center gap-1 ml-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? "bg-neutral-800 text-amber-400 font-semibold shadow-xs"
                        : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
                    }`}
                  >
                    <Icon className="size-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white transition-colors bg-neutral-900 border border-neutral-800 hover:border-neutral-700 px-3 py-1.5 rounded-lg"
            >
              <Store className="size-3.5 text-amber-400" />
              <span>Ver Tienda</span>
            </Link>

            <Button
              onClick={logout}
              variant="outline"
              size="sm"
              className="border-rose-900/40 bg-rose-950/20 hover:bg-rose-900/40 text-rose-300 text-xs h-8"
            >
              <LogOut className="size-3.5 mr-1.5" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Contenido Principal de las Sub-rutas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 pb-24 md:pb-8">
        {children}
      </main>

      {/* Menú de Navegación Inferior (Móvil) */}
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