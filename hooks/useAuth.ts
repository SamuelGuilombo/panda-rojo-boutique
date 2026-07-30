"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export interface UserProfile {
  id: string
  email?: string
  name?: string
  role: "admin" | "cajero"
}

// Obtener los correos desde las variables de entorno
const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "").toLowerCase().trim()
const CASHIER_EMAIL = (process.env.NEXT_PUBLIC_CASHIER_EMAIL || "").toLowerCase().trim()

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    async function getUserSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!session?.user) {
          setUser(null)
          setCheckingAuth(false)
          return
        }

        const email = (session.user.email || "").toLowerCase().trim()

        // Determinar rol según las variables de entorno
        let role: "admin" | "cajero" = "cajero"
        let name = "Cajero Panda Rojo"

        if (ADMIN_EMAIL && email === ADMIN_EMAIL) {
          role = "admin"
          name = "Administrador"
        } else if (CASHIER_EMAIL && email === CASHIER_EMAIL) {
          role = "cajero"
          name = "Cajero Panda Rojo"
        } else {
          // Si el correo no coincide con las variables, se le asigna cajero con su nombre de usuario
          name = email.split("@")[0] || "Usuario"
        }

        setUser({
          id: session.user.id,
          email: session.user.email,
          name: name,
          role: role,
        })
      } catch (error) {
        console.error("Error al verificar la sesión:", error)
        setUser(null)
      } finally {
        setCheckingAuth(false)
      }
    }

    getUserSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      getUserSession()
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    window.location.reload()
  }

  const isAdmin = user?.role === "admin"
  const isCashier = user?.role === "cajero"
  const isAuthenticated = !!user

  return {
    user,
    isAuthenticated,
    checkingAuth,
    isAdmin,
    isCashier,
    logout,
  }
}