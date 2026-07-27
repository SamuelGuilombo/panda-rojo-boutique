"use client"

import { useEffect, useState } from "react"
import { fetchProducts, AdminProduct } from "@/services/productService"
import { InventoryModule } from "@/components/admin/InventoryModule"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export default function InventoryPage() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await fetchProducts()
      setProducts(data)
    } catch (error) {
      console.error("Error al cargar inventario:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Inventario</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Administra prendas, variantes, tallas, colores y existencias.
          </p>
        </div>
        <Button
          onClick={loadData}
          variant="outline"
          size="sm"
          className="border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs"
        >
          <RefreshCw className={`size-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      <InventoryModule products={products} loading={loading} onRefresh={loadData} />
    </div>
  )
}