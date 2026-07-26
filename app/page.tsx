import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Sparkles, Truck, ShieldCheck } from "lucide-react"
import { bestSellers } from "@/data/products"
import { ProductGrid } from "@/components/product-grid"
import { PageTransition, Reveal } from "@/components/motion-primitives"

export default function HomePage() {
  return (
    <PageTransition>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 md:py-20 lg:px-8">
          <div className="order-2 md:order-1">
            <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              <Sparkles className="size-3.5" />
              Nueva colección
            </span>
            <h1 className="mt-4 text-balance font-serif text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
              Moda seleccionada{" "}
              <span className="text-primary">con amor</span>
            </h1>
            <p className="mt-4 max-w-md text-pretty leading-relaxed text-muted-foreground">
              Boutique en Pitalito, Huila. Prendas para dama y caballero, ropa
              íntima y pines metálicos. Piezas nacionales e importadas de
              calidad premium.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Ver Colección
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/puntos-bambu"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                Club Puntos Bambú
              </Link>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-2xl bg-muted shadow-lg">
              <Image
                src="/hero.png"
                alt="Modelo con prendas de Panda Rojo Boutique"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Beneficios rápidos */}
        <div className="border-y border-border bg-secondary/40">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:grid-cols-3 sm:px-6 lg:px-8">
            {[
              { icon: Truck, title: "Envíos locales y nacionales", desc: "A Pitalito y toda Colombia" },
              { icon: ShieldCheck, title: "Calidad premium", desc: "Nacional e importada seleccionada" },
              { icon: Sparkles, title: "Club Puntos Bambú", desc: "Gana beneficios en cada compra" },
            ].map((b) => (
              <div key={b.title} className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
                  <b.icon className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{b.title}</p>
                  <p className="text-xs text-muted-foreground">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lo más vendido */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-serif text-3xl font-bold text-foreground">
                Lo Más Vendido
              </h2>
              <p className="mt-1 text-muted-foreground">
                Un vistazo a las prendas favoritas de nuestras clientas.
              </p>
            </div>
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-opacity hover:opacity-80"
            >
              Ver todo
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </Reveal>

        <div className="mt-8">
          <ProductGrid products={bestSellers.slice(0, 6)} />
        </div>
      </section>

      {/* Banner Puntos Bambú */}
      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl bg-foreground px-6 py-12 text-background sm:px-12">
            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-foreground">
                  Programa de fidelidad
                </span>
                <h2 className="mt-4 text-balance font-serif text-3xl font-bold">
                  Únete al Club Puntos Bambú
                </h2>
                <p className="mt-3 text-pretty leading-relaxed text-background/70">
                  Gana puntos con cada compra y al etiquetarnos en tus fotos.
                  Canjéalos por descuentos y pines gratis.
                </p>
              </div>
              <Link
                href="/puntos-bambu"
                className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Conocer beneficios
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* CTA catálogo */}
      <section className="border-t border-border bg-secondary/40">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-14 text-center sm:px-6 lg:px-8">
          <h2 className="text-balance font-serif text-3xl font-bold text-foreground">
            ¿Lista para renovar tu clóset?
          </h2>
          <p className="max-w-md text-muted-foreground">
            Explora todo nuestro inventario con filtros por categoría y encuentra
            tu próxima prenda favorita.
          </p>
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Explorar Catálogo Completo
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </PageTransition>
  )
}
