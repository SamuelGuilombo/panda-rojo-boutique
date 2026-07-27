"use client"

import { useState } from "react"
import { getCustomerPoints, addPointTransaction, CustomerPointsSummary } from "@/services/pointsService"
import { Search, PlusCircle, MinusCircle, Loader2, Award, UserCheck, AlertCircle } from "lucide-react"

export function PointsAdminModule() {
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [customerData, setCustomerData] = useState<CustomerPointsSummary | null>(null)
  
  // Campos del formulario manual
  const [pointsAmount, setPointsAmount] = useState("")
  const [actionType, setActionType] = useState<"EARN" | "REDEEM">("EARN")
  const [description, setDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setLoading(true)
    setMessage(null)
    try {
      const data = await getCustomerPoints(searchQuery.trim())
      if (!data) {
        setMessage({ type: "error", text: "Cliente no encontrado por cédula o teléfono." })
        setCustomerData(null)
      } else {
        setCustomerData(data)
      }
    } catch (err) {
      console.error(err)
      setMessage({ type: "error", text: "Error de conexión al buscar cliente." })
    } finally {
      setLoading(false)
    }
  }

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerData || !pointsAmount) return

    const pts = Math.abs(Number(pointsAmount))
    if (pts <= 0) {
      alert("Ingresa una cantidad válida de puntos.")
      return
    }

    // Si es redención, se envía valor negativo
    const finalPoints = actionType === "REDEEM" ? -pts : pts

    if (actionType === "REDEEM" && customerData.totalPoints < pts) {
      alert("El cliente no tiene suficientes puntos para esta redención.")
      return
    }

    setSubmitting(true)
    setMessage(null)
    try {
      const ok = await addPointTransaction({
        customer_id: customerData.customerId,
        points: finalPoints,
        type: actionType,
        description: description.trim() || (actionType === "EARN" ? "Ajuste manual (Puntos agregados)" : "Redención manual de puntos"),
      })

      if (ok) {
        setMessage({ type: "success", text: "Transacción realizada con éxito." })
        setPointsAmount("")
        setDescription("")
        // Recargar información del cliente
        const updated = await getCustomerPoints(customerData.customerDocOrPhone)
        setCustomerData(updated)
      } else {
        setMessage({ type: "error", text: "No se pudo registrar la transacción." })
      }
    } catch (err) {
      console.error(err)
      setMessage({ type: "error", text: "Error inesperado." })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 text-slate-900">
      
      {/* HEADER COMPACTO */}
      <div className="bg-slate-50 border-l-4 border-slate-900 border-y border-r border-slate-200 p-4 rounded-xl shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-900 text-white rounded-lg shrink-0">
            <Award size={20} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 leading-tight">
              Gestión Manual de Puntos
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Acumula o redime puntos para tus clientes directamente en el sistema.
            </p>
          </div>
        </div>
      </div>

      {/* BUSCADOR DE CLIENTE */}
      <div className="bg-white border border-slate-300 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">1. Buscar Cliente</h3>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cédula o Teléfono del cliente..."
            className="flex-1 border border-slate-300 bg-slate-50 text-slate-900 font-medium rounded-xl px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            Buscar
          </button>
        </form>
      </div>

      {message && (
        <div
          className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <AlertCircle size={16} />
          <span>{message.text}</span>
        </div>
      )}

      {/* DETALLES Y FORMULARIO */}
      {customerData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* PANEL IZQUIERDO: FORMULARIO */}
          <div className="lg:col-span-5 bg-white border border-slate-300 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <UserCheck size={18} className="text-slate-800" />
              <div>
                <p className="font-bold text-slate-900 text-sm">{customerData.customerName}</p>
                <p className="text-[11px] text-slate-500 font-medium">
                  Saldo Actual: <span className="font-extrabold text-amber-600">{customerData.totalPoints} pts</span>
                </p>
              </div>
            </div>

            <form onSubmit={handleTransaction} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Acción</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setActionType("EARN")}
                    className={`py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 ${
                      actionType === "EARN"
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    <PlusCircle size={14} /> Sumar Puntos
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionType("REDEEM")}
                    className={`py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 ${
                      actionType === "REDEEM"
                        ? "bg-rose-600 text-white border-rose-600"
                        : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    <MinusCircle size={14} /> Redimir Puntos
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Cantidad de Puntos *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={pointsAmount}
                  onChange={(e) => setPointsAmount(e.target.value)}
                  placeholder="Ej. 100"
                  className="w-full border border-slate-300 bg-slate-50 font-bold text-slate-900 rounded-xl px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Descripción / Motivo</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={actionType === "EARN" ? "Ej. Compra presencial" : "Ej. Bono de $10.000"}
                  className="w-full border border-slate-300 bg-slate-50 text-slate-900 font-medium rounded-xl px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                {actionType === "EARN" ? "Añadir Puntos" : "Redimir Puntos"}
              </button>
            </form>
          </div>

          {/* PANEL DERECHO: HISTORIAL */}
          <div className="lg:col-span-7 bg-white border border-slate-300 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">
              Historial del Cliente
            </h3>

            <div className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto">
              {customerData.history.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">Sin registros previos.</p>
              ) : (
                customerData.history.map((tx) => (
                  <div key={tx.id} className="py-2.5 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{tx.description || tx.type}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(tx.created_at).toLocaleString("es-CO")}
                      </p>
                    </div>
                    <span
                      className={`font-extrabold ${
                        tx.points > 0 ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {tx.points > 0 ? `+${tx.points}` : tx.points} pts
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  )
}