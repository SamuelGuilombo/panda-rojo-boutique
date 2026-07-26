"use client"

import { useState, type FormEvent } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Search, Leaf } from "lucide-react"

// Simulación de consulta de puntos (interfaz de cliente, sin backend real)
function simulatePoints(phone: string): number {
  const digits = phone.replace(/\D/g, "")
  let sum = 0
  for (const ch of digits) sum += Number(ch)
  return (sum * 37) % 620
}

export function PointsChecker() {
  const [phone, setPhone] = useState("")
  const [result, setResult] = useState<number | null>(null)
  const [error, setError] = useState("")

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const digits = phone.replace(/\D/g, "")
    if (digits.length < 7) {
      setError("Ingresa un número de teléfono válido.")
      setResult(null)
      return
    }
    setError("")
    setResult(simulatePoints(phone))
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <h3 className="font-serif text-2xl font-bold text-foreground">
        Consulta tus Puntos
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Ingresa tu número de teléfono para ver tu saldo acumulado.
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
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Consultar
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-primary">{error}</p>}

      <AnimatePresence>
        {result !== null && !error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-5 flex items-center gap-4 rounded-xl bg-accent p-5"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Leaf className="size-6" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Tu saldo actual</p>
              <p className="font-serif text-3xl font-bold text-primary">
                {result}{" "}
                <span className="text-lg font-semibold">Puntos Bambú</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <p className="mt-3 text-xs text-muted-foreground">
        * Consulta simulada con fines de demostración.
      </p>
    </div>
  )
}
