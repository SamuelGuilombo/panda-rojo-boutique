"use client"

import { useMemo, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { categories, type CategoryId } from "@/data/products"
import { useProducts } from "@/hooks/useProducts"
import { ProductCard } from "@/components/product-card"
import { ProductModal } from "@/components/product-modal"
import { cn } from "@/lib/utils"
import type { Product } from "@/data/products"
import { Loader2 } from "lucide-react"

type Tab = "todos" | CategoryId

export function CatalogView() {
  const { products, loading, error } = useProducts()
  const [tab, setTab] = useState<Tab>("todos")
  const [sub, setSub] = useState<string | null>(null)
  const [selected, setSelected] = useState<Product | null>(null)

  const activeCategory = categories.find((c) => c.id === tab)

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (tab !== "todos" && p.category !== tab) return false
      if (sub && p.subcategory !== sub) return false
      return true
    })
  }, [products, tab, sub])

  function selectTab(next: Tab) {
    setTab(next)
    setSub(null)
  }

  return (
    <div>
      {/* Tabs de categorías */}
      <div className="flex flex-wrap gap-2">
        {(
          [{ id: "todos", label: "Todos" }, ...categories] as {
            id: Tab
            label: string
          }[]
        ).map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => selectTab(c.id)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              tab === c.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-muted",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Subcategorías */}
      <AnimatePresence initial={false}>
        {activeCategory && activeCategory.subcategories.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
              <button
                type="button"
                onClick={() => setSub(null)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  sub === null
                    ? "border-primary bg-accent text-primary"
                    : "border-border bg-background text-muted-foreground hover:text-foreground",
                )}
              >
                Ver todo
              </button>
              {activeCategory.subcategories.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSub(s)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    sub === s
                      ? "border-primary bg-accent text-primary"
                      : "border-border bg-background text-muted-foreground hover:text-foreground",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {loading ? "Cargando..." : `${filtered.length} ${filtered.length === 1 ? "producto" : "productos"}`}
        </p>
      </div>

      {/* Grid y Estados */}
      <div className="mt-4">
        {loading ? (
          <div className="flex justify-center items-center py-20 text-muted-foreground gap-2">
            <Loader2 className="size-5 animate-spin" />
            <span className="text-sm">Cargando catálogo...</span>
          </div>
        ) : error ? (
          <p className="py-16 text-center text-rose-500 text-sm">{error}</p>
        ) : filtered.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground text-sm">
            No hay productos en esta selección.
          </p>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                >
                  <ProductCard product={product} onSelect={setSelected} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <ProductModal product={selected} onClose={() => setSelected(null)} />
    </div>
  )
}