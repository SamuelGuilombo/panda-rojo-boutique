import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Heart, MapPin, Clock, ArrowRight } from "lucide-react"
import { PageTransition, Reveal } from "@/components/motion-primitives"
import { site } from "@/lib/site"

export const metadata: Metadata = {
  title: "Nosotros | Panda Rojo Boutique",
  description:
    "Conoce Panda Rojo Boutique: prendas seleccionadas con amor en Pitalito, Huila. Ubicación, horario y mapa.",
}

export default function NosotrosPage() {
  return (
    <PageTransition>
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:px-8">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            <Heart className="size-3.5" />
            Nuestra historia
          </span>
          <h1 className="mt-4 text-balance font-serif text-4xl font-bold text-foreground sm:text-5xl">
            Prendas seleccionadas con amor
          </h1>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            En Panda Rojo Boutique creemos que vestir bien es una forma de
            cuidarte. Por eso elegimos cada prenda con dedicación, combinando
            producción nacional y piezas importadas de calidad premium para
            ofrecerte estilo, comodidad y precios justos.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Somos una boutique orgullosamente pitaleña, ubicada en el corazón
            del Portal del Oriente. Nos encanta acompañarte a encontrar esa
            prenda que te hace sentir segura y auténtica.
          </p>
          <Link
            href="/catalogo"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Ver nuestra colección
            <ArrowRight className="size-4" />
          </Link>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-muted shadow-lg">
            <Image
              src="/nosotros.png"
              alt="Interior de Panda Rojo Boutique"
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
        </Reveal>
      </section>

      {/* Ubicación */}
      <section className="border-t border-border bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="font-serif text-3xl font-bold text-foreground">
              Visítanos
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <div className="flex flex-col gap-5">
              <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
                  <MapPin className="size-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-foreground">Dirección</h3>
                  <p className="mt-1 text-muted-foreground">
                    {site.address}
                    <br />
                    {site.city}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
                  <Clock className="size-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-foreground">Horario</h3>
                  <p className="mt-1 text-muted-foreground">{site.schedule}</p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-border">
              <iframe
                title="Ubicación de Panda Rojo Boutique en Pitalito, Huila"
                src={site.mapsEmbed}
                className="h-full min-h-72 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  )
}
