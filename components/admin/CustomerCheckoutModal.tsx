"use client"

import { useState, useEffect } from "react"
import { formatCOP } from "@/data/products"
import { Loader2, ShoppingBag, X } from "lucide-react"

export function CustomerCheckoutModal({
  totalAmount: initialTotalAmount,
  onConfirm,
  onClose,
}: {
  totalAmount: number
  onConfirm: (data: {
    finalAmount: number
    discount: number
    customerId?: string
    customerName?: string
    paymentMethod: string
  }) => Promise<void> | void
  onClose: () => void
}) {
  const [wantPoints, setWantPoints] = useState(false)
  const [customerId, setCustomerId] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("Efectivo")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Estado para el total a cobrar editable (permite aplicar descuentos directos)
  const [customTotalInput, setCustomTotalInput] = useState(initialTotalAmount.toString())

  // Sincronizar si cambia el monto inicial prop
  useEffect(() => {
    setCustomTotalInput(initialTotalAmount.toString())
  }, [initialTotalAmount])

  // Cerrar al presionar la tecla ESC (siempre que no esté procesando la venta)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose, isSubmitting])

  // Cálculo del monto final y el descuento
  const finalAmount = Math.max(0, Number(customTotalInput) || 0)
  const discountAmount = Math.max(0, initialTotalAmount - finalAmount)

  // Recálculo exacto de Puntos Bambú sobre el total real cobrado
  const pointsEarned = Math.floor(finalAmount / 1000)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    try {
      setIsSubmitting(true)
      await onConfirm({
        finalAmount,
        discount: discountAmount,
        customerId: wantPoints && customerId.trim() ? customerId.trim() : undefined,
        customerName: wantPoints && customerName.trim() ? customerName.trim() : "Cliente General",
        paymentMethod,
      })
    } catch (error) {
      console.error("Error al procesar la venta:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={() => !isSubmitting && onClose()} // Cierra al hacer clic en el backdrop
    >
      <div 
        className="w-full max-w-md my-8 rounded-2xl bg-zinc-900 border border-zinc-800 p-6 text-white shadow-2xl relative"
        onClick={(e) => e.stopPropagation()} // Evita cerrar si se hace clic dentro del modal
      >
        {/* Encabezado */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <ShoppingBag size={18} />
            </span>
            <h2 className="font-bold text-lg text-white">Completar Venta</h2>
          </div>
          
          <button 
            type="button" 
            onClick={onClose} 
            disabled={isSubmitting}
            className="size-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Total Original vs Ajustado (Descuento) */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-zinc-400 font-medium">Subtotal Catálogo</p>
              <p className="text-sm font-semibold text-zinc-400 line-through">
                {formatCOP(initialTotalAmount)}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-amber-400 font-bold">Total Final a Cobrar (COP)</label>
                {discountAmount > 0 && (
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                    Descuento: -{formatCOP(discountAmount)}
                  </span>
                )}
              </div>
              <input
                type="number"
                min="0"
                disabled={isSubmitting}
                value={customTotalInput}
                onChange={(e) => setCustomTotalInput(e.target.value)}
                className="w-full rounded-xl bg-zinc-900 border border-amber-500/40 px-4 py-2.5 text-xl font-black text-amber-400 focus:border-amber-500 focus:outline-none disabled:opacity-50"
              />
            </div>

            {wantPoints && (
              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                <span className="text-xs text-zinc-400">Puntos a otorgar:</span>
                <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                  +{pointsEarned} Puntos Bambú
                </span>
              </div>
            )}
          </div>

          {/* Toggle para acumular puntos */}
          <label className="flex items-center gap-3 p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/80 cursor-pointer hover:border-zinc-700 transition-colors">
            <input
              type="checkbox"
              checked={wantPoints}
              disabled={isSubmitting}
              onChange={(e) => setWantPoints(e.target.checked)}
              className="size-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500"
            />
            <div className="text-sm">
              <span className="font-medium text-zinc-200">¿El cliente desea acumular puntos?</span>
              <p className="text-xs text-zinc-500">Registra su teléfono o cédula para fidelización.</p>
            </div>
          </label>

          {/* Campos del cliente */}
          {wantPoints && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Teléfono o Cédula del Cliente *
                </label>
                <input
                  type="text"
                  placeholder="Ej: 3168788706"
                  disabled={isSubmitting}
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  required={wantPoints}
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Nombre Completo (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Nombre del cliente"
                  disabled={isSubmitting}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none disabled:opacity-50"
                />
              </div>
            </div>
          )}

          {/* Métodos de Pago */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-2">Método de Pago</label>
            <div className="grid grid-cols-3 gap-2">
              {["Efectivo", "Transferencia", "Tarjeta"].map((method) => (
                <button
                  key={method}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                    paymentMethod === method
                      ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
                      : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-1/3 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-sm transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-2/3 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm transition-colors shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={16} /> Procesando...
                </>
              ) : wantPoints ? (
                "Confirmar Venta y Asignar"
              ) : (
                "Confirmar Venta"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}