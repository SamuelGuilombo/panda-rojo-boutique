"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { PointsChecker } from "@/components/points-checker"
import { ShoppingBag, Camera, Gift, Percent, Leaf, Sparkles, Award } from "lucide-react"

// Cliente de Supabase para obtener las recompensas en tiempo real
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

interface Reward {
  id: string
  points_required: number
  reward_text: string
}

export default function PuntosBambuPage() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loadingRewards, setLoadingRewards] = useState(true)

  useEffect(() => {
    fetchRewards()
  }, [])

  const fetchRewards = async () => {
    const { data } = await supabase
      .from("rewards")
      .select("*")
      .order("points_required", { ascending: true })
    
    if (data) setRewards(data)
    setLoadingRewards(false)
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 pb-20">
      
      {/* 1. BANNER NEGRO: COMUNIDAD BAMBÚ */}
      <section className="bg-zinc-950 text-white border-b border-zinc-800 py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <Leaf size={14} />
            Comunidad Bambú
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Club Puntos Bambú
          </h1>
          <p className="max-w-xl mx-auto text-xs sm:text-sm text-zinc-400 leading-relaxed font-medium">
            Forma parte de nuestra comunidad exclusiva. Cada compra y cada mención te permite acumular Puntos Bambú para canjear por beneficios y descuentos especiales.
          </p>
        </div>
      </section>

      {/* 2. RECUADRO COMPACTO DE CONSULTA E HISTORIAL */}
      <section className="max-w-md mx-auto px-4 -mt-5 relative z-10">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xl shadow-slate-200/50">
          <PointsChecker />
        </div>
      </section>

      {/* 3. SECCIÓN DE RECOMPENSAS DINÁMICAS (ADMINISTRABLES POR EL ADMIN) */}
      <section className="max-w-4xl mx-auto px-4 pt-16 space-y-12">
        
        {/* TABLA DE RECOMPENSAS */}
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="font-serif text-2xl font-bold text-slate-900 flex items-center justify-center gap-2">
              <Award className="text-amber-500" size={24} />
              Recompensas Disponibles
            </h2>
            <p className="text-xs text-slate-500">
              Estos son los beneficios que puedes obtener redimiendo tus Puntos Bambú.
            </p>
          </div>

          {loadingRewards ? (
            <div className="text-center py-8 text-xs text-slate-400 animate-pulse">
              Cargando catálogo de recompensas...
            </div>
          ) : rewards.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 bg-white border border-slate-200 rounded-2xl">
              Próximamente agregaremos nuevas recompensas.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              {rewards.map((r) => (
                <div
                  key={r.id}
                  className="flex flex-col items-center justify-center text-center p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:border-amber-500/50 transition-all space-y-2"
                >
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-full">
                    <Sparkles size={20} />
                  </div>
                  <p className="font-serif text-xl font-bold text-slate-900">
                    {r.points_required} pts
                  </p>
                  <p className="text-xs font-semibold text-slate-600">
                    {r.reward_text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CÓMO GANAR PUNTOS */}
        <div className="bg-slate-100/70 border border-slate-200/60 rounded-3xl p-6 sm:p-8 space-y-6">
          <h3 className="font-serif text-xl font-bold text-slate-900 text-center">
            ¿Cómo sumar Puntos Bambú?
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-slate-200/80">
              <div className="p-2.5 bg-slate-900 text-white rounded-xl shrink-0">
                <ShoppingBag size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Compras en la Boutique</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Acumula puntos por cada prenda que adquieras en tienda física o WhatsApp.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-slate-200/80">
              <div className="p-2.5 bg-slate-900 text-white rounded-xl shrink-0">
                <Camera size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Menciónanos en Redes</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Sube una foto luciendo tus prendas etiquetándonos en Instagram o TikTok.
                </p>
              </div>
            </div>
          </div>
        </div>

      </section>

    </div>
  )
}