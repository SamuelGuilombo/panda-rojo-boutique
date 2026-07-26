import type { Metadata } from "next"
import { ShoppingBag, Camera, Gift, Percent, Leaf } from "lucide-react"
import { PointsChecker } from "@/components/points-checker"
import { PageTransition, Reveal } from "@/components/motion-primitives"
import { site } from "@/lib/site"

export const metadata: Metadata = {
  title: "Puntos Bambú | Panda Rojo Boutique",
  description:
    "Club de fidelización Puntos Bambú: gana puntos con tus compras y al etiquetarnos. Canjéalos por descuentos y pines gratis.",
}

const rewards = [
  { points: "100 Puntos", reward: "3% de descuento", icon: Percent },
  { points: "300 Puntos", reward: "Pin metálico gratis", icon: Gift },
  { points: "500 Puntos", reward: "5% de descuento en compras", icon: Percent },
]

const earn = [
  {
    icon: ShoppingBag,
    title: "Compra en la boutique",
    desc: "Acumula puntos por cada compra que realices, presencial o por WhatsApp.",
  },
  {
    icon: Camera,
    title: "Etiquétanos en redes",
    desc: `Publica fotos con tus prendas etiquetando a ${site.social.instagramHandle} en Instagram o TikTok y suma puntos extra.`,
  },
]

export default function PuntosBambuPage() {
  return (
    <PageTransition>
      {/* Hero */}
      <section className="bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-foreground">
            <Leaf className="size-3.5" />
            Programa de fidelidad
          </span>
          <h1 className="mt-4 max-w-2xl text-balance font-serif text-4xl font-bold sm:text-5xl">
            Club Puntos Bambú
          </h1>
          <p className="mt-4 max-w-xl text-pretty leading-relaxed text-background/70">
            Nuestra forma de agradecerte por elegirnos. Cada compra y cada
            publicación suma puntos que puedes canjear por beneficios
            exclusivos. Crece con nosotros, tan firme y flexible como el bambú.
          </p>
        </div>
      </section>

      {/* Tabla de recompensas */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="font-serif text-3xl font-bold text-foreground">
            Tabla de Recompensas
          </h2>
          <p className="mt-1 text-muted-foreground">
            Canjea tus puntos acumulados por estos beneficios.
          </p>
        </Reveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {rewards.map((r, i) => (
            <Reveal key={r.points} delay={i * 0.08}>
              <div className="flex h-full flex-col items-start gap-3 rounded-xl border border-border bg-card p-6">
                <span className="flex size-11 items-center justify-center rounded-full bg-accent text-primary">
                  <r.icon className="size-5" />
                </span>
                <p className="font-serif text-2xl font-bold text-foreground">
                  {r.points}
                </p>
                <p className="text-muted-foreground">{r.reward}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Cómo ganar */}
      <section className="border-y border-border bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="font-serif text-3xl font-bold text-foreground">
              ¿Cómo ganar puntos?
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {earn.map((e, i) => (
              <Reveal key={e.title} delay={i * 0.08}>
                <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-6">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <e.icon className="size-6" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-foreground">{e.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {e.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Consulta de puntos */}
      <section className="mx-auto max-w-2xl px-4 py-14 sm:px-6 lg:px-8">
        <PointsChecker />
      </section>
    </PageTransition>
  )
}
