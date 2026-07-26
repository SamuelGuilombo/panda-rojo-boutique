"use client"

import Image from "next/image"
import { motion } from "motion/react"
import { formatCOP, type Product } from "@/data/products"
import { OriginBadge } from "@/components/origin-badge"

export function ProductCard({
  product,
  onSelect,
}: {
  product: Product
  onSelect: (product: Product) => void
}) {
  // Extraemos las tallas válidas disponibles
  const availableSizes = product.sizes || []

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(product)}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="group flex h-full w-full flex-col overflow-hidden rounded-xl border border-border bg-card text-left shadow-sm transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Contenedor de la imagen */}
      <div className="relative aspect-[3/4] w-full shrink-0 overflow-hidden bg-muted">
        <Image
          src={product.images[0] || "/placeholder.svg"}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.bestSeller && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-primary-foreground shadow-xs">
            Más vendido
          </span>
        )}
      </div>

      {/* Contenido de texto */}
      <div className="flex flex-1 flex-col justify-between gap-3 p-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {product.subcategory}
            </span>
          </div>

          <h3 className="line-clamp-2 text-balance font-medium leading-snug text-foreground">
            {product.name}
          </h3>

          {/* Muestra de Tallas Disponibles en la tarjeta */}
          {availableSizes.length > 0 && availableSizes[0] !== "Única" && (
            <div className="mt-1 flex flex-wrap gap-1">
              {availableSizes.map((sz) => (
                <span
                  key={sz}
                  className="rounded-md border border-border/60 bg-muted/50 px-1.5 py-0.5 text-[0.65rem] font-semibold text-muted-foreground"
                >
                  {sz}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Precio y Badge de Origen */}
        <div className="mt-auto flex min-h-[28px] items-center justify-between gap-2 pt-2 border-t border-border/40">
          <span className="font-serif text-lg font-bold text-foreground">
            {formatCOP(product.price)}
          </span>
          {product.origin ? <OriginBadge origin={product.origin} /> : <div aria-hidden="true" />}
        </div>
      </div>
    </motion.button>
  )
}