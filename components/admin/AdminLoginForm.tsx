"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, User, XCircle } from "lucide-react"

export function AdminLoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState<string | null>(null)
  const [loggingIn, setLoggingIn] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    setLoggingIn(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setAuthError("Credenciales inválidas. Verifica tu correo y contraseña.")
    } else {
      onSuccess()
    }
    setLoggingIn(false)
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="size-12 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white mx-auto">
            <Lock className="size-6" />
          </div>
          <h1 className="text-xl font-serif font-bold text-white">Acceso Administrativo</h1>
          <p className="text-xs text-neutral-400">
            Ingresa tus credenciales autorizadas para gestionar la tienda.
          </p>
        </div>

        {authError && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-medium flex items-center gap-2">
            <XCircle className="size-4 shrink-0" />
            {authError}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label className="text-xs text-neutral-300">Correo Electrónico</Label>
            <div className="relative mt-1">
              <User className="size-4 text-neutral-500 absolute left-3 top-2.5" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mitienda.com"
                required
                className="bg-neutral-950 border-neutral-800 text-white text-xs pl-9"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs text-neutral-300">Contraseña</Label>
            <div className="relative mt-1">
              <Lock className="size-4 text-neutral-500 absolute left-3 top-2.5" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-neutral-950 border-neutral-800 text-white text-xs pl-9"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loggingIn}
            className="w-full bg-white hover:bg-neutral-200 text-neutral-950 font-bold py-2.5 rounded-xl text-xs transition-colors"
          >
            {loggingIn ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
        </form>
      </div>
    </div>
  )
}