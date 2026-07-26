"use client"

import { Boxes, Award, ShoppingCart, Settings } from "lucide-react"

interface AdminMenuProps {
  onSelectView: (view: "inventory" | "bamboo_points" | "orders" | "settings") => void
  productCount: number
}

export function AdminMenu({ onSelectView, productCount }: AdminMenuProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
      <div
        onClick={() => onSelectView("inventory")}
        className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-6 cursor-pointer transition-all hover:scale-[1.01] group flex flex-col justify-between"
      >
        <div>
          <div className="size-12 rounded-xl bg-emerald-950/50 border border-emerald-800/50 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
            <Boxes className="size-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Control e Inventario</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Registra prendas, asigna imágenes, define precio de costo y venta, gestiona tallas y colores disponibles.
          </p>
        </div>
        <div className="mt-6 pt-4 border-t border-neutral-800/60 flex items-center justify-between text-xs font-semibold text-emerald-400">
          <span>{productCount} productos registrados</span>
          <span>Ingresar →</span>
        </div>
      </div>

      <div
        onClick={() => onSelectView("bamboo_points")}
        className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-6 cursor-pointer transition-all hover:scale-[1.01] group flex flex-col justify-between"
      >
        <div>
          <div className="size-12 rounded-xl bg-amber-950/50 border border-amber-800/50 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
            <Award className="size-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Puntos Bambú</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Administra el sistema de puntos por compras de tus clientes, recompensas e historial de redenciones.
          </p>
        </div>
        <div className="mt-6 pt-4 border-t border-neutral-800/60 flex items-center justify-between text-xs font-semibold text-amber-400">
          <span>Módulo de Fidelización</span>
          <span>Ingresar →</span>
        </div>
      </div>

      <div
        onClick={() => onSelectView("orders")}
        className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-6 cursor-pointer transition-all hover:scale-[1.01] group flex flex-col justify-between"
      >
        <div>
          <div className="size-12 rounded-xl bg-blue-950/50 border border-blue-800/50 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
            <ShoppingCart className="size-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Pedidos y Ventas</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Revisa las solicitudes realizadas por clientes por WhatsApp o la plataforma y marca los despachos.
          </p>
        </div>
        <div className="mt-6 pt-4 border-t border-neutral-800/60 flex items-center justify-between text-xs font-semibold text-blue-400">
          <span>Gestión de Pedidos</span>
          <span>Ingresar →</span>
        </div>
      </div>

      <div
        onClick={() => onSelectView("settings")}
        className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-6 cursor-pointer transition-all hover:scale-[1.01] group flex flex-col justify-between"
      >
        <div>
          <div className="size-12 rounded-xl bg-purple-950/50 border border-purple-800/50 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
            <Settings className="size-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Configuración General</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Ajustes de datos de la tienda, integración con Supabase y parámetros del sitio web.
          </p>
        </div>
        <div className="mt-6 pt-4 border-t border-neutral-800/60 flex items-center justify-between text-xs font-semibold text-purple-400">
          <span>Parámetros de la Tienda</span>
          <span>Ingresar →</span>
        </div>
      </div>
    </div>
  )
}