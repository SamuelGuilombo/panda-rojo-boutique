"use client"

import { useState } from "react"
import type { Product } from "@/data/products"
import { ProductCard } from "@/components/product-card"
import { ProductModal } from "@/components/product-modal"

export function ProductGrid({ products }: { products: Product[] }) {
  const [selected, setSelected] = useState<Product | null>(null)

  return (
    <>
      {products.length === 0 ? (
        <p className="col-span-full py-16 text-center text-muted-foreground">
          No hay productos en esta categoría por ahora.
        </p>
      ) : (
        /* items-stretch estira todas las filas para que midan exactamente lo mismo */
        <div className="grid grid-cols-2 items-stretch gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={setSelected}
            />
          ))}
        </div>
      )}
      <ProductModal product={selected} onClose={() => setSelected(null)} />
    </>
  )
}