"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { fetchProducts } from "@/services/productService"
import { Package, Award, ShoppingCart, Settings, ArrowRight } from "lucide-react"

export default function AdminDashboardPage() {
  const [productsCount, setProductsCount] = useState<number>(0)

  useEffect(() => {
    fetchProducts().then((data) => setProductsCount(data.length)).catch(() => {})
  }, [])

  const modules = [
    {
      title: "Control e Inventario",
      description: "Registra prendas, asigna imágenes, define precio de costo y venta, gestiona tallas y colores.",
      href: "/admin/inventory",
      icon: Package,
      badge: `${productsCount} productos`,
      color: "border-emerald-500/30 bg-emerald-500/5 text-emerald-400",
    },
    {
      title: "Puntos Bambú",
      description: "Administra el sistema de puntos por compras de tus clientes, recompensas e historial.",
      href: "/admin/points",
      icon: Award,
      badge: "Fidelización",
      color: "border-amber-500/30 bg-amber-500/5 text-amber-400",
    },
    {
      title: "Pedidos y Ventas",
      description: "Revisa las solicitudes realizadas por clientes por WhatsApp o la plataforma.",
      href: "/admin/orders",
      icon: ShoppingCart,
      badge: "WhatsApp",
      color: "border-blue-500/30 bg-blue-500/5 text-blue-400",
    },
    {
      title: "Configuración",
      description: "Ajustes del sistema, parámetros globales y datos del negocio.",
      href: "/admin/settings",
      icon: Settings,
      badge: "Sistema",
      color: "border-purple-500/30 bg-purple-500/5 text-purple-400",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Panel Administrativo</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Selecciona un módulo para gestionar Panda Rojo Boutique.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {modules.map((mod) => {
          const Icon = mod.icon
          return (
            <Link
              key={mod.href}
              href={mod.href}
              className="group relative flex flex-col justify-between p-6 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all hover:shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl border ${mod.color}`}>
                    <Icon className="size-6" />
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-300">
                    {mod.badge}
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                    {mod.title}
                  </h2>
                  <p className="text-xs text-neutral-400 leading-relaxed mt-1">
                    {mod.description}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center text-xs font-semibold text-amber-400 group-hover:translate-x-1 transition-transform">
                <span>Ingresar al módulo</span>
                <ArrowRight className="size-4 ml-1.5" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}