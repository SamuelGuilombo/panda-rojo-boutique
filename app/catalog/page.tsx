import type { Metadata } from "next"
import { CatalogView } from "@/components/catalog-view"
import { PageTransition } from "@/components/motion-primitives"

export const metadata: Metadata = {
  title: "Catálogo Completo | Panda Rojo Boutique",
  description:
    "Explora todo el inventario de Panda Rojo Boutique: dama, caballero, ropa íntima y pines metálicos. Filtra por categoría.",
}

export default function CatalogoPage() {
  return (
    <PageTransition>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="font-serif text-4xl font-bold text-foreground">
            Catálogo Completo
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Filtra por categoría y subcategoría. Haz clic en cualquier prenda
            para ver el detalle y comprar por WhatsApp.
          </p>
        </header>
        <CatalogView />
      </section>
    </PageTransition>
  )
}
