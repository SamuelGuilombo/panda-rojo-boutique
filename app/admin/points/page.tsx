"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { 
  getPointsByPhone, 
  addPointTransaction, 
  type CustomerPointsSummary 
} from "@/services/pointsService"
import { 
  Search, 
  PlusCircle, 
  MinusCircle, 
  Loader2, 
  Award, 
  UserCheck, 
  History, 
  AlertCircle, 
  Plus, 
  Trash2 
} from "lucide-react"
import { Button } from "@/components/ui/button"

// Cliente de Supabase para la gestión dinámica de recompensas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

interface Reward {
  id: string
  points_required: number
  reward_text: string
  is_active?: boolean
}

export default function PointsAdminPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [customerData, setCustomerData] = useState<CustomerPointsSummary | null>(null)
  
  // Formulario manual de puntos
  const [pointsAmount, setPointsAmount] = useState("")
  const [actionType, setActionType] = useState<"EARN" | "REDEEM">("EARN")
  const [description, setDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Recompensas Dinámicas
  const [rewards, setRewards] = useState<Reward[]>([])
  const [newRewardPoints, setNewRewardPoints] = useState<number>(100)
  const [newRewardText, setNewRewardText] = useState("")

  useEffect(() => {
    fetchRewards()
  }, [])

  const fetchRewards = async () => {
    const { data } = await supabase
      .from("rewards")
      .select("*")
      .order("points_required", { ascending: true })
    
    if (data) setRewards(data)
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setLoading(true)
    setMessage(null)
    try {
      const data = await getPointsByPhone(searchQuery.trim())
      if (!data) {
        setMessage({ type: "error", text: "Cliente no encontrado por teléfono o documento." })
        setCustomerData(null)
      } else {
        setCustomerData(data)
      }
    } catch (err) {
      console.error(err)
      setMessage({ type: "error", text: "Error al consultar la base de datos." })
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

    const finalPoints = actionType === "REDEEM" ? -pts : pts

    if (actionType === "REDEEM" && customerData.totalPoints < pts) {
      alert("El cliente no cuenta con suficientes Puntos Bambú.")
      return
    }

    setSubmitting(true)
    setMessage(null)
    try {
      const ok = await addPointTransaction({
        customer_id: customerData.customerId,
        points: finalPoints,
        type: actionType,
        description: description.trim() || (actionType === "EARN" ? "Ajuste manual (Puntos agregados)" : "Redención manual de Puntos Bambú"),
      })

      if (ok) {
        setMessage({ type: "success", text: "Transacción realizada con éxito." })
        setPointsAmount("")
        setDescription("")
        // Recargar datos
        const updated = await getPointsByPhone(customerData.customerPhone)
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

  const handleAddReward = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRewardText.trim() || newRewardPoints <= 0) return

    const { error } = await supabase.from("rewards").insert({
      points_required: newRewardPoints,
      reward_text: newRewardText.trim(),
    })

    if (!error) {
      setNewRewardText("")
      setNewRewardPoints(100)
      fetchRewards()
    } else {
      alert("Error al agregar la recompensa.")
    }
  }

  const handleDeleteReward = async (id: string) => {
    const { error } = await supabase.from("rewards").delete().eq("id", id)
    if (!error) {
      fetchRewards()
    } else {
      alert("Error al eliminar la recompensa.")
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-zinc-100">
      
      {/* HEADER PRINCIPAL */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl">
            <Award size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Programa Puntos Bambú
            </h1>
            <p className="text-xs text-zinc-400">
              Administra la acumulación, redención y la tabla pública de recompensas.
            </p>
          </div>
        </div>
      </div>

      {/* GRID PRINCIPAL: GESTIÓN DE CLIENTES & RECOMPENSAS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* SECCIÓN IZQUIERDA: BUSCADOR, OPERACIONES E HISTORIAL (Columna de 8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* BUSCADOR DE CLIENTE */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-3">
            <label className="block text-xs font-semibold text-zinc-300">
              Buscar Cliente por Teléfono o Cédula
            </label>
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ej: 3168788706"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 shrink-0 disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                Buscar
              </button>
            </form>
          </div>

          {message && (
            <div
              className={`p-4 rounded-xl border text-xs font-medium flex items-center gap-2.5 ${
                message.type === "success"
                  ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/50"
                  : "bg-rose-950/40 text-rose-400 border-rose-800/50"
              }`}
            >
              <AlertCircle size={16} />
              <span>{message.text}</span>
            </div>
          )}

          {/* PANEL DE OPERACIONES E HISTORIAL DE CLIENTE */}
          {customerData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              
              {/* FORMULARIO DE PUNTOS */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <div className="flex items-center gap-2.5">
                    <UserCheck size={18} className="text-amber-400" />
                    <div>
                      <p className="font-bold text-sm text-white">{customerData.customerName}</p>
                      <p className="text-[11px] text-zinc-400">{customerData.customerPhone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Saldo</p>
                    <p className="text-lg font-black text-amber-400">
                      {customerData.totalPoints} <span className="text-xs font-normal text-zinc-300">pts</span>
                    </p>
                  </div>
                </div>

                <form onSubmit={handleTransaction} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-2">Acción</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setActionType("EARN")}
                        className={`py-2 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition-colors ${
                          actionType === "EARN"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/40"
                            : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        <PlusCircle size={15} /> Sumar Puntos
                      </button>
                      <button
                        type="button"
                        onClick={() => setActionType("REDEEM")}
                        className={`py-2 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition-colors ${
                          actionType === "REDEEM"
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/40"
                            : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        <MinusCircle size={15} /> Redimir Puntos
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Puntos *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={pointsAmount}
                      onChange={(e) => setPointsAmount(e.target.value)}
                      placeholder="Ej: 50"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Descripción / Motivo</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={actionType === "EARN" ? "Ej. Compra de Camiseta" : "Ej. Redención por Bono"}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-2"
                  >
                    {submitting && <Loader2 size={15} className="animate-spin" />}
                    {actionType === "EARN" ? "Cargar Puntos" : "Redimir Puntos"}
                  </button>
                </form>
              </div>

              {/* HISTORIAL */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
                  <History size={16} className="text-zinc-400" />
                  <h2 className="font-bold text-sm text-white">Historial de Transacciones</h2>
                </div>

                <div className="divide-y divide-zinc-800/60 max-h-[350px] overflow-y-auto pr-1">
                  {customerData.history.length === 0 ? (
                    <p className="text-xs text-zinc-500 py-8 text-center">
                      Este cliente no registra movimientos en Puntos Bambú.
                    </p>
                  ) : (
                    customerData.history.map((tx) => (
                      <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs gap-3">
                        <div>
                          <p className="font-semibold text-zinc-200">
                            {tx.description || (tx.points > 0 ? "Puntos Ganados" : "Redención")}
                          </p>
                          <p className="text-[10px] text-zinc-500">
                            {new Date(tx.created_at).toLocaleString("es-CO")}
                          </p>
                        </div>
                        <span
                          className={`font-black text-sm ${
                            tx.points > 0 ? "text-emerald-400" : "text-rose-400"
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

        {/* SECCIÓN DERECHA: ADMINISTRAR RECOMPENSAS PÚBLICAS (Columna de 4) */}
        <div className="lg:col-span-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="border-b border-zinc-800 pb-3">
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <Award size={18} className="text-amber-400" />
              Tabla de Recompensas
            </h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Configura los premios visibles para los clientes en la tienda.
            </p>
          </div>

          <form onSubmit={handleAddReward} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                Puntos Requeridos
              </label>
              <input
                type="number"
                min="1"
                required
                value={newRewardPoints}
                onChange={(e) => setNewRewardPoints(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                Beneficio / Premio
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Pin metálico gratis"
                value={newRewardText}
                onChange={(e) => setNewRewardText(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs h-9 rounded-xl"
            >
              <Plus size={15} className="mr-1" /> Añadir Recompensa
            </Button>
          </form>

          <div className="space-y-2 pt-3 border-t border-zinc-800">
            <p className="text-[11px] font-semibold text-zinc-400">Recompensas Activas:</p>
            {rewards.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center">No hay recompensas registradas.</p>
            ) : (
              rewards.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs"
                >
                  <div>
                    <span className="font-bold text-amber-400">{r.points_required} Pts</span>
                    <p className="text-zinc-300 text-[11px]">{r.reward_text}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteReward(r.id)}
                    className="text-zinc-500 hover:text-rose-400 p-1.5 transition-colors"
                    title="Eliminar recompensa"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  )
}