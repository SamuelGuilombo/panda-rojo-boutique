import { Settings } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center space-y-4 max-w-xl mx-auto my-8">
      <div className="size-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
        <Settings className="size-7" />
      </div>
      <h1 className="text-xl font-bold text-white">Configuración del Sistema</h1>
      <p className="text-xs text-neutral-400 leading-relaxed">
        Ajustes de tienda, teléfono de WhatsApp y datos generales.
      </p>
    </div>
  )
}