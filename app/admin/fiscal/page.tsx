"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { AlertCircle, FileText, Calendar, Plus, Edit3 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function FiscalAdminPage() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)) // YYYY-MM
  const [showAlert, setShowAlert] = useState(false)
  
  // Estados para modal de edición manual (egresos o ingresos sin facturar)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null)
  const [editExpenses, setEditExpenses] = useState("")
  const [editUnbilled, setEditUnbilled] = useState("")
  const [editObservations, setEditObservations] = useState("")

  useEffect(() => {
    fetchMonthRecords()
    checkMonthEndAlert()
  }, [selectedMonth])

  async function fetchMonthRecords() {
    setLoading(true)
    const startDate = `${selectedMonth}-01`
    const [year, month] = selectedMonth.split('-')
    const lastDay = new Date(Number(year), Number(month), 0).getDate()
    const endDate = `${selectedMonth}-${lastDay}`

    const { data, error } = await supabase
      .from("daily_fiscal_records")
      .select("*")
      .gte("record_date", startDate)
      .lte("record_date", endDate)
      .order("record_date", { ascending: true })

    if (!error) {
      setRecords(data || [])
    }
    setLoading(false)
  }

  function checkMonthEndAlert() {
    const today = new Date()
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
    if (today.getDate() >= lastDayOfMonth - 3) {
      setShowAlert(true)
    }
  }

  function openEditModal(record: any) {
    setCurrentRecordId(record.id)
    setEditExpenses(record.global_expenses?.toString() || "0")
    setEditUnbilled(record.unbilled_income?.toString() || "0")
    setEditObservations(record.observations || "")
    setIsModalOpen(true)
  }

  async function handleSaveRecord(e: React.FormEvent) {
    e.preventDefault()
    if (!currentRecordId) return

    const expenses = Number(editExpenses) || 0
    const unbilled = Number(editUnbilled) || 0

    // Buscar el registro actual para recalcular el ingreso total (ingresos facturados + sin facturar)
    const target = records.find(r => r.id === currentRecordId)
    const totalInvoices = Number(target?.total_invoices_amount || 0)
    const totalIncome = totalInvoices + unbilled

    const { error } = await supabase
      .from("daily_fiscal_records")
      .update({
        global_expenses: expenses,
        unbilled_income: unbilled,
        total_income: totalIncome,
        observations: editObservations,
      })
      .eq("id", currentRecordId)

    if (!error) {
      setIsModalOpen(false)
      fetchMonthRecords()
    } else {
      alert("Error al actualizar el registro fiscal.")
    }
  }

  // Totales acumulados del mes
  const totalMonthInvoicesCount = records.reduce((acc, curr) => acc + (curr.invoice_count || 0), 0)
  const totalMonthInvoicesAmount = records.reduce((acc, curr) => acc + Number(curr.total_invoices_amount || 0), 0)
  const totalMonthUnbilled = records.reduce((acc, curr) => acc + Number(curr.unbilled_income || 0), 0)
  const totalMonthIncome = records.reduce((acc, curr) => acc + Number(curr.total_income || 0), 0)
  const totalMonthExpenses = records.reduce((acc, curr) => acc + Number(curr.global_expenses || 0), 0)

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="text-amber-400" size={24} />
            Control Diario y Libro Fiscal
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Registro automatizado de asientos formales, ingresos, facturación y egresos diarios.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 px-3 py-2 rounded-xl">
            <Calendar size={16} className="text-neutral-400" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Alerta de Cierre de Mes */}
      {showAlert && (
        <div className="bg-amber-950/30 border border-amber-900/50 rounded-2xl p-4 flex items-start gap-3 text-amber-200">
          <AlertCircle size={22} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs sm:text-sm">
            <p className="font-bold">¡Atención! Se acerca el cierre de mes</p>
            <p className="text-amber-300/90 font-medium">
              El periodo mensual está por finalizar. Revisa que todos los egresos y entradas sin facturar del mes estén registrados para consolidar tu libro fiscal sin contratiempos.
            </p>
          </div>
        </div>
      )}

      {/* Tarjetas de Resumen Acumulado del Mes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl">
          <p className="text-xs font-medium text-neutral-400">Total Facturado</p>
          <p className="text-lg font-bold text-white mt-1">${totalMonthInvoicesAmount.toLocaleString()} COP</p>
          <p className="text-[10px] text-neutral-500 mt-1">{totalMonthInvoicesCount} facturas emitidas</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl">
          <p className="text-xs font-medium text-neutral-400">Ingresos Totales (Mes)</p>
          <p className="text-lg font-bold text-emerald-400 mt-1">${totalMonthIncome.toLocaleString()} COP</p>
          <p className="text-[10px] text-neutral-500 mt-1">Facturado + Sin facturar</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl">
          <p className="text-xs font-medium text-neutral-400">Egresos / Costos (Mes)</p>
          <p className="text-lg font-bold text-rose-400 mt-1">${totalMonthExpenses.toLocaleString()} COP</p>
          <p className="text-[10px] text-neutral-500 mt-1">Gastos diarios registrados</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl">
          <p className="text-xs font-medium text-neutral-400">Balance Operativo</p>
          <p className={`text-lg font-bold mt-1 ${totalMonthIncome - totalMonthExpenses >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
            ${(totalMonthIncome - totalMonthExpenses).toLocaleString()} COP
          </p>
          <p className="text-[10px] text-neutral-500 mt-1">Ingresos menos Egresos</p>
        </div>
      </div>

      {/* Tabla de Asientos Formales */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <h3 className="font-bold text-white text-sm">Asientos Formales y Movimientos ({selectedMonth})</h3>
          <span className="text-xs font-bold text-neutral-400 bg-neutral-950 border border-neutral-800 px-3 py-1 rounded-full">
            {records.length} días con registro
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-950 text-neutral-400 font-bold border-b border-neutral-800">
                <th className="p-3">Fecha (Día)</th>
                <th className="p-3 text-center">N° Facturas</th>
                <th className="p-3 text-right">Valor Facturas ($)</th>
                <th className="p-3 text-right">Ingresos sin Facturar ($)</th>
                <th className="p-3 text-right">Total Ingresos ($)</th>
                <th className="p-3 text-right">Egresos Globales ($)</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 font-medium text-neutral-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-neutral-500">Cargando registros fiscales...</td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-neutral-500">No hay movimientos registrados para este mes.</td>
                </tr>
              ) : (
                records.map((row) => (
                  <tr key={row.id} className="hover:bg-neutral-800/50 transition-colors">
                    <td className="p-3 font-bold text-white">{row.record_date}</td>
                    <td className="p-3 text-center">{row.invoice_count}</td>
                    <td className="p-3 text-right">${Number(row.total_invoices_amount).toLocaleString()}</td>
                    <td className="p-3 text-right">${Number(row.unbilled_income).toLocaleString()}</td>
                    <td className="p-3 text-right font-bold text-emerald-400">${Number(row.total_income).toLocaleString()}</td>
                    <td className="p-3 text-right font-bold text-rose-400">${Number(row.global_expenses).toLocaleString()}</td>
                    <td className="p-3 text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(row)}
                        className="h-7 text-[11px] bg-neutral-950 border-neutral-800 hover:bg-neutral-800 text-neutral-300"
                      >
                        <Edit3 size={12} className="mr-1" />
                        Editar / Gastos
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Editar Egresos y Observaciones del Día */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-white text-base">Editar Registro Diario</h3>
            <p className="text-xs text-neutral-400">Actualiza los egresos globales o ingresos sin facturar de este día para el libro fiscal.</p>

            <form onSubmit={handleSaveRecord} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Egresos / Costos del Día ($)</label>
                <input
                  type="number"
                  value={editExpenses}
                  onChange={(e) => setEditExpenses(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Ingresos sin Facturar ($)</label>
                <input
                  type="number"
                  value={editUnbilled}
                  onChange={(e) => setEditUnbilled(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Observaciones o Notas (DIAN / Control)</label>
                <textarea
                  value={editObservations}
                  onChange={(e) => setEditObservations(e.target.value)}
                  rows={3}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                  placeholder="Notas adicionales..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-neutral-950 border-neutral-800 text-neutral-300 hover:bg-neutral-800 text-xs h-9"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs h-9 px-4"
                >
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}