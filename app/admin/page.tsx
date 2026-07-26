"use client"

import { useState, useEffect } from "react"
import { useAdminAuth } from "@/hooks/useAdminAuth"
import { fetchProducts, DbProduct } from "@/services/productService"
import { AdminLoginForm } from "@/components/admin/AdminLoginForm"
import { AdminMenu } from "@/components/admin/AdminMenu"
import { InventoryModule } from "@/components/admin/InventoryModule"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw, LogOut, Award, ShoppingCart, Settings } from "lucide-react"

type AdminView = "menu" | "inventory" | "bamboo_points" | "orders" | "settings"

export default function AdminPage() {
  const { isAuthenticated, checkingAuth, logout } = useAdminAuth()
  const [activeView, setActiveView] = useState<AdminView>("menu")
  const [products, setProducts] = useState<DbProduct[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)

  const loadData = async () => {
    setLoadingProducts(true)
    try {
      const data = await fetchProducts()
      setProducts(data)
    } catch (error) {
      console.error("Error al cargar productos:", error)
    } finally {
      setLoadingProducts(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) loadData()
  }, [isAuthenticated])

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-xs text-neutral-400">
        Verificando sesión administrativa...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AdminLoginForm onSuccess={loadData} />
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
          <div className="flex items-center gap-3">
            {activeView !== "menu" && (
              <Button onClick={() => setActiveView("menu")} variant="outline" size="icon" className="border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-200">
                <ArrowLeft className="size-4" />
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-serif font-bold text-white">Panel Administrativo</h1>
              <p className="text-xs text-neutral-400 mt-0.5">
                {activeView === "menu" && "Selecciona un módulo para gestionar tu tienda."}
                {activeView === "inventory" && "Gestión de prendas, colores, tallas y márgenes."}
                {activeView === "bamboo_points" && "Gestión del programa de Puntos Bambú."}
                {activeView === "orders" && "Monitoreo e historial de pedidos."}
                {activeView === "settings" && "Configuración general."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activeView === "inventory" && (
              <Button onClick={loadData} variant="outline" size="sm" className="border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-200">
                <RefreshCw className="size-4 mr-2" /> Actualizar
              </Button>
            )}
            <Button onClick={logout} variant="outline" size="sm" className="border-rose-900/50 bg-rose-950/30 hover:bg-rose-900/50 text-rose-300">
              <LogOut className="size-4 mr-2" /> Cerrar Sesión
            </Button>
          </div>
        </div>

        {/* Orquestación de Módulos */}
        {activeView === "menu" && <AdminMenu onSelectView={setActiveView} productCount={products.length} />}
        {activeView === "inventory" && <InventoryModule products={products} loading={loadingProducts} onRefresh={loadData} />}
        
        {activeView === "bamboo_points" && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center space-y-4">
            <Award className="size-8 text-amber-400 mx-auto" />
            <h2 className="text-xl font-bold text-white">Módulo de Puntos Bambú</h2>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">Gestión de fidelización de clientes en desarrollo.</p>
          </div>
        )}

        {activeView === "orders" && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center space-y-4">
            <ShoppingCart className="size-8 text-blue-400 mx-auto" />
            <h2 className="text-xl font-bold text-white">Gestión de Pedidos</h2>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">Monitoreo de pedidos de WhatsApp en desarrollo.</p>
          </div>
        )}

        {activeView === "settings" && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center space-y-4">
            <Settings className="size-8 text-purple-400 mx-auto" />
            <h2 className="text-xl font-bold text-white">Configuración del Sistema</h2>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">Parámetros globales en desarrollo.</p>
          </div>
        )}

      </div>
    </div>
  )
}