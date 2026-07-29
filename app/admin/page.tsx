"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { 
  Package, 
  TrendingUp, 
  DollarSign, 
  Store 
} from "lucide-react"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSalesCount: 0,
    totalRevenue: 0,
    monthIncome: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardMetrics()
  }, [])

  async function fetchDashboardMetrics() {
    setLoading(true)
    try {
      const { count: prodCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })

      const { data: salesData } = await supabase
        .from("sales")
        .select("sale_price, quantity")

      let revenue = 0
      let salesCount = 0
      if (salesData) {
        salesCount = salesData.length
        revenue = salesData.reduce((acc, curr) => acc + (Number(curr.sale_price) * Number(curr.quantity)), 0)
      }

      const currentMonth = new Date().toISOString().slice(0, 7)
      const { data: fiscalData } = await supabase
        .from("daily_fiscal_records")
        .select("total_income")
        .gte("record_date", `${currentMonth}-01`)

      let monthInc = 0
      if (fiscalData) {
        monthInc = fiscalData.reduce((acc, curr) => acc + Number(curr.total_income || 0), 0)
      }

      setStats({
        totalProducts: prodCount || 0,
        totalSalesCount: salesCount,
        totalRevenue: revenue,
        monthIncome: monthInc
      })
    } catch (error) {
      console.error("Error al cargar métricas del dashboard:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Bienvenida Limpia (Sin botón duplicado, ya que la barra superior incluye el acceso) */}
      <div className="bg-neutral-900 border border-neutral-800 p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
        <div>
          <span className="text-amber-400 font-bold text-xs uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
            Panel de Control
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-2">
            Resumen General
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Indicadores clave del estado actual de tu establecimiento en Pitalito.
          </p>
        </div>
      </div>

      {/* Tarjetas de Métricas Esenciales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium">Ingresos del Mes</span>
            <DollarSign size={18} className="text-emerald-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white">
            {loading ? "..." : `$${stats.monthIncome.toLocaleString()} COP`}
          </p>
          <p className="text-[10px] text-neutral-500 mt-1">Consolidado libro fiscal actual</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium">Ventas Totales Registradas</span>
            <TrendingUp size={18} className="text-amber-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white">
            {loading ? "..." : stats.totalSalesCount}
          </p>
          <p className="text-[10px] text-neutral-500 mt-1">Transacciones procesadas</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium">Ingreso Histórico Acumulado</span>
            <DollarSign size={18} className="text-blue-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white">
            {loading ? "..." : `$${stats.totalRevenue.toLocaleString()} COP`}
          </p>
          <p className="text-[10px] text-neutral-500 mt-1">Suma total de ventas</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium">Productos en Inventario</span>
            <Package size={18} className="text-purple-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white">
            {loading ? "..." : stats.totalProducts}
          </p>
          <p className="text-[10px] text-neutral-500 mt-1">Referencias registradas</p>
        </div>
      </div>
    </div>
  )
}