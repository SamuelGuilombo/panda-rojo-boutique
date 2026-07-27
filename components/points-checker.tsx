"use client"

import { useState, type FormEvent } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Search, Leaf, Loader2, ArrowUpRight, ArrowDownLeft, History } from "lucide-react"
import { getPointsByPhone, type CustomerPointsSummary } from "@/services/pointsService"

export function PointsChecker() {
  const [phone, setPhone] = useState("")
  const [data, setData] = useState<CustomerPointsSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState("")

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const digits = phone.replace(/\D/g, "")
    if (digits.length < 7) {
      setError("Ingresa un número de teléfono válido.")
      setData(null)
      return
    }

    setError("")
    setLoading(true)
    setSearched(true)

    try {
      const result = await getPointsByPhone(phone)
      if (!result) {
        setError("No se encontraron puntos registrados para este número.")
        setData(null)
      } else {
        setData(result)
      }
    } catch (err) {
      console.error(err)
      setError("Ocurrió un error al consultar tus puntos. Inténtalo de nuevo.")
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <h3 className="font-serif text-2xl font-bold text-foreground">
        Consulta tus Puntos
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Ingresa tu número de teléfono para ver tu saldo acumulado y tu historial.
      </p>

      <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Ej: 3168788706"
            aria-label="Número de teléfono"
            className="w-full rounded-lg border border-border bg-background py-3 pl-9 pr-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : "Consultar"}
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      <AnimatePresence>
        {data !== null && !error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-5 space-y-4"
          >
            {/* SALDO PRINCIPAL */}
            <div className="flex items-center gap-4 rounded-xl bg-accent p-5">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Leaf className="size-6" />
              </span>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  ¡Hola, {data.customerName}!
                </p>
                <p className="font-serif text-3xl font-bold text-primary">
                  {data.totalPoints.toLocaleString()}{" "}
                  <span className="text-lg font-semibold">Puntos Bambú</span>
                </p>
              </div>
            </div>

            {/* HISTORIAL DETALLADO DE REDENCIONES Y PUNTOS GANADOS */}
            <div className="rounded-xl border border-border bg-background p-4 space-y-3">
              <div className="flex items-center gap-2 border-b border-border pb-2 text-foreground font-semibold text-xs">
                <History className="size-4 text-muted-foreground" />
                <span>Historial de Movimientos</span>
              </div>

              {data.history.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-3">
                  Aún no registras movimientos en tu cuenta.
                </p>
              ) : (
                <div className="divide-y divide-border/60 max-h-56 overflow-y-auto pr-1">
                  {data.history.map((tx) => {
                    const isEarn = tx.points > 0
                    return (
                      <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`p-1.5 rounded-md shrink-0 ${
                              isEarn
                                ? "bg-emerald-500/10 text-emerald-600"
                                : "bg-rose-500/10 text-rose-600"
                            }`}
                          >
                            {isEarn ? <ArrowDownLeft className="size-3.5" /> : <ArrowUpRight className="size-3.5" />}
                          </span>
                          <div className="truncate">
                            <p className="font-medium text-foreground truncate">
                              {tx.description || (isEarn ? "Puntos ganados por compra" : "Redención de puntos")}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {new Date(tx.created_at).toLocaleDateString("es-CO", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`font-bold shrink-0 text-sm ${
                            isEarn ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {isEarn ? `+${tx.points}` : tx.points} pts
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}