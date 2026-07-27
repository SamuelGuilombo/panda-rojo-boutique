"use client"

import { useState } from "react"
import { getCustomerPoints, CustomerPointsSummary } from "@/services/pointsService"
import { Search, Award, ArrowUpRight, ArrowDownLeft, History, Loader2, Sparkles, ShoppingBag } from "lucide-react"

export default function PuntosPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<CustomerPointsSummary | null>(null)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setLoading(true)
    setSearched(true)
    try {
      const result = await getCustomerPoints(searchQuery.trim())
      setData(result)
    } catch (err) {
      console.error(err)
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* ENCABEZADO */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-slate-900 text-white rounded-2xl shadow-sm mb-2">
            <Award size={32} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Consulta tus Puntos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto">
            Ingresa tu número de documento o celular para revisar tus puntos acumulados y tu historial de compras y redenciones.
          </p>
        </div>

        {/* BUSCADOR */}
        <form onSubmit={handleSearch} className="bg-white p-2 sm:p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Escribe tu Cédula o Teléfono..."
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-3 rounded-xl transition-colors shrink-0 flex items-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            Consultar
          </button>
        </form>

        {/* RESULTADOS */}
        {searched && !loading && !data && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 space-y-2">
            <ShoppingBag className="mx-auto text-slate-300" size={40} />
            <p className="font-bold text-slate-800 text-sm">No encontramos registros</p>
            <p className="text-xs text-slate-500">
              Verifica que el número digitado sea el mismo con el que registraste tus compras.
            </p>
          </div>
        )}

        {data && (
          <div className="space-y-5 animate-in fade-in duration-300">
            
            {/* TARJETA DE PUNTOS TOTALES */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <Sparkles size={140} />
              </div>
              <div className="relative z-10 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Cliente VIP
                    </span>
                    <h2 className="text-xl font-bold">{data.customerName}</h2>
                  </div>
                  <span className="bg-white/10 text-white border border-white/20 text-[11px] font-bold px-3 py-1 rounded-full">
                    Doc: {data.customerDocOrPhone}
                  </span>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <p className="text-xs font-medium text-slate-300">Puntos Disponibles</p>
                  <p className="text-4xl sm:text-5xl font-black text-amber-400 tracking-tight mt-1">
                    {data.totalPoints.toLocaleString()}{" "}
                    <span className="text-sm font-semibold text-white">pts</span>
                  </p>
                </div>
              </div>
            </div>

            {/* HISTORIAL DE MOVIMIENTOS */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <History size={18} className="text-slate-700" />
                <h3 className="font-bold text-slate-900 text-sm">Historial de Puntos</h3>
              </div>

              {data.history.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">
                  Aún no registras movimientos de puntos.
                </p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {data.history.map((tx) => {
                    const isEarn = tx.points > 0
                    return (
                      <div key={tx.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-xl shrink-0 ${
                              isEarn
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {isEarn ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">
                              {tx.description || (isEarn ? "Puntos ganados por compra" : "Redención de puntos")}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">
                              {new Date(tx.created_at).toLocaleDateString("es-CO", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span
                            className={`font-black text-sm ${
                              isEarn ? "text-emerald-600" : "text-rose-600"
                            }`}
                          >
                            {isEarn ? `+${tx.points}` : tx.points} pts
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  )
}