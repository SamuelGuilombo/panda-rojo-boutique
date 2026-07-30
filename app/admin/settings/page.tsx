"use client"

import { useState } from "react"
import { Store, Phone, Award, Save, CheckCircle2, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  const [settings, setSettings] = useState({
    storeName: "Panda Rojo Boutique",
    phone: "+57 300 000 0000",
    address: "Pitalito, Huila",
    pointsPerPurchase: "1000", // 1 Punto por cada $1.000 COP
    whatsappMessage: "¡Hola Panda Rojo! Quisiera consultar sobre un producto o pedido.",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulación de guardado de datos (aquí puedes conectar a Supabase o localStorage)
    setTimeout(() => {
      setLoading(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }, 600)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Configuración General
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Administra los datos comerciales de Panda Rojo, parámetros de atención y programa de fidelización.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos Comerciales */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm border-b border-neutral-800 pb-3">
            <Store size={18} />
            <h2>Perfil de la Tienda</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                Nombre de la Tienda
              </label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                Ubicación / Dirección Física
              </label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
                required
              />
            </div>
          </div>
        </div>

        {/* Configuración de WhatsApp */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm border-b border-neutral-800 pb-3">
            <Phone size={18} />
            <h2>Integración WhatsApp Tienda</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                Número de Celular (con indicativo)
              </label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                Mensaje Automático del Botón
              </label>
              <input
                type="text"
                value={settings.whatsappMessage}
                onChange={(e) => setSettings({ ...settings, whatsappMessage: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                required
              />
            </div>
          </div>
        </div>

        {/* Reglas de Puntos Bambú */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm border-b border-neutral-800 pb-3">
            <Award size={18} />
            <h2>Puntos Bambú (Fidelización)</h2>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-medium text-neutral-400">
              Valor de Compra necesario para acumular 1 Punto
            </label>
            <div className="flex items-center gap-3">
              <span className="text-xs text-neutral-500 font-bold">$</span>
              <input
                type="number"
                value={settings.pointsPerPurchase}
                onChange={(e) => setSettings({ ...settings, pointsPerPurchase: e.target.value })}
                className="w-full max-w-xs bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
              <span className="text-xs text-neutral-400 font-medium">COP = 1 Punto Bambú</span>
            </div>
            <p className="text-[11px] text-neutral-500">
              * Con la regla actual de $1.000 COP = 1 Punto, una venta realizada en caja por $60.000 COP le asignará automáticamente 60 puntos al cliente.
            </p>
          </div>
        </div>

        {/* Zona Inferior y Botón de Acción */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <ShieldAlert size={14} className="text-amber-500/80" />
            <span>Los cambios tendrán efecto inmediato en el sistema del cajero.</span>
          </div>

          <div className="flex items-center gap-3">
            {saved && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium animate-in fade-in">
                <CheckCircle2 size={16} /> ¡Ajustes guardados!
              </span>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs px-6 py-2 h-10 rounded-xl"
            >
              <Save size={16} className="mr-1.5" />
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}