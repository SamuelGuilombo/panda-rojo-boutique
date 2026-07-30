"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import { formatCOP } from "@/data/products"
import { 
  Package, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart,
  Award,
  ArrowRight
} from "lucide-react"

export default function AdminDashboardPage() {
  const { isAdmin, user } = useAuth()
  
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSalesCount: 0,
    totalRevenue: 0,
    monthIncome: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardMetrics()
    } else {
      setLoading(false)
    }
  }, [isAdmin])

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
      {/* Encabezado de Bienvenida Personalizado */}
      <div className="bg-neutral-900 border border-neutral-800 p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
        <div>
          <span className={`font-bold text-xs uppercase tracking-wider px-2.5 py-1 rounded-full border ${
            isAdmin 
              ? "bg-amber-500/10 border-amber-500/20 text-amber-400" 
              : "bg-blue-500/10 border-blue-500/20 text-blue-400"
          }`}>
            {isAdmin ? "Panel de Administración" : "Punto de Venta / Caja"}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-2">
            ¡Hola, {user?.name || (isAdmin ? "Administrador" : "Cajero")}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            {isAdmin 
              ? "Indicadores clave del estado financiero y operativo de tu tienda."
              : "Bienvenido al terminal de venta. Selecciona una acción para comenzar."}
          </p>
        </div>
      </div>

      {/* VISTA MODO ADMINISTRADOR (Métricas Financieras Completas) */}
      {isAdmin ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-medium">Ingresos del Mes</span>
              <DollarSign size={18} className="text-emerald-400" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">
              {loading ? "..." : formatCOP(stats.monthIncome)}
            </p>
            <p className="text-[10px] text-neutral-500 mt-1">Consolidado libro fiscal actual</p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-medium">Ventas Registradas</span>
              <TrendingUp size={18} className="text-amber-400" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">
              {loading ? "..." : stats.totalSalesCount}
            </p>
            <p className="text-[10px] text-neutral-500 mt-1">Transacciones procesadas</p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-medium">Ingreso Histórico</span>
              <DollarSign size={18} className="text-blue-400" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">
              {loading ? "..." : formatCOP(stats.totalRevenue)}
            </p>
            <p className="text-[10px] text-neutral-500 mt-1">Suma total acumulada</p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-medium">Productos en Catálogo</span>
              <Package size={18} className="text-purple-400" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">
              {loading ? "..." : stats.totalProducts}
            </p>
            <p className="text-[10px] text-neutral-500 mt-1">Referencias activas</p>
          </div>
        </div>
      ) : (
        /* VISTA MODO CAJERO (Solo 2 Acciones Rápidas: Pedidos y Puntos) */
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-white">Acciones Rápidas de Caja</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link 
              href="/admin/orders" 
              className="bg-neutral-900 border border-neutral-800 hover:border-blue-500/50 p-6 rounded-2xl transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                  <ShoppingCart size={24} />
                </div>
                <ArrowRight size={18} className="text-neutral-500 group-hover:text-blue-400 transition-colors" />
              </div>
              <div className="mt-4">
                <h3 className="font-bold text-white text-base">Pedidos y Ventas</h3>
                <p className="text-xs text-neutral-400 mt-1">Gestión de facturación, prendas seleccionadas y registro de cobros.</p>
              </div>
            </Link>

            <Link 
              href="/admin/points" 
              className="bg-neutral-900 border border-neutral-800 hover:border-purple-500/50 p-6 rounded-2xl transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
                  <Award size={24} />
                </div>
                <ArrowRight size={18} className="text-neutral-500 group-hover:text-purple-400 transition-colors" />
              </div>
              <div className="mt-4">
                <h3 className="font-bold text-white text-base">Puntos Bambú</h3>
                <p className="text-xs text-neutral-400 mt-1">Registrar clientes nuevos o verificar e inscribir puntos de fidelización.</p>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}