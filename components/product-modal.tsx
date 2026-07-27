"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "motion/react"
import { X, Check } from "lucide-react"
import { formatCOP } from "@/data/products"
import { OriginBadge } from "@/components/origin-badge"
import { whatsappLink, site } from "@/lib/site"
import { cn } from "@/lib/utils"

export interface ExtendedProduct {
  id: string
  name: string
  price: number
  description?: string
  subcategory?: string
  origin?: string
  images: string[]
  sizes?: string[]
  colors?: string[]
  stockBySizes?: Record<string, number>
  stock_by_sizes?: Record<string, number>
  colorsBySizes?: Record<string, string[]>
  colors_by_sizes?: Record<string, string[]>
  stockBySizesAndColors?: Record<string, number>
  stock_by_sizes_and_colors?: Record<string, number>
  totalStock?: number
  total_stock?: number
}

function WhatsappIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.6.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-1.6-.8-2.7-1.5-3.7-3.3-.3-.5.3-.5.8-1.5.1-.2 0-.3 0-.5s-.6-1.5-.9-2c-.2-.5-.4-.5-.6-.5h-.5c-.2 0-.5.1-.7.3-.7.7-1 1.5-1 2.6 0 1.6 1.2 3.2 1.4 3.4.2.2 2.4 3.6 5.7 5 .8.3 1.4.5 1.9.7.8.2 1.5.2 2.1.1.6-.1 1.7-.7 2-1.4.2-.6.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.4 1.3 4.9L2 22l5.3-1.4c1.4.8 3 1.2 4.7 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2z" />
    </svg>
  )
}

export function ProductModal({
  product,
  onClose,
}: {
  product: ExtendedProduct | null
  onClose: () => void
}) {
  const [mounted, setMounted] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [size, setSize] = useState<string | null>(null)
  const [color, setColor] = useState<string | null>(null)

  useEffect(() => setMounted(true), [])

  const colorsBySizesMap = product?.colorsBySizes || product?.colors_by_sizes || {}
  const stockBySizesAndColorsMap = product?.stockBySizesAndColors || product?.stock_by_sizes_and_colors || {}
  const stockBySizesMap = product?.stockBySizes || product?.stock_by_sizes || {}

  const getStockForColor = (sz: string | null, clr: string): number => {
    if (!sz) return 0
    const key = `${sz}-${clr}`
    if (stockBySizesAndColorsMap[key] !== undefined) {
      return Number(stockBySizesAndColorsMap[key])
    }
    if (stockBySizesMap[sz] !== undefined) {
      return Number(stockBySizesMap[sz])
    }
    return 0
  }

  // Función para calcular si una talla tiene stock en general sumando sus colores
  const getStockForSize = (sz: string): number => {
    const availableColors = colorsBySizesMap[sz] || product?.colors || []
    if (availableColors.length > 0 && availableColors[0] !== "Único" && Object.keys(stockBySizesAndColorsMap).length > 0) {
      return availableColors.reduce((acc, clr) => acc + getStockForColor(sz, clr), 0)
    }
    return stockBySizesMap[sz] ?? product?.totalStock ?? 0
  }

  useEffect(() => {
    if (product) {
      setActiveImage(0)
      const firstValidSize = product.sizes?.find((s) => getStockForSize(s) > 0) ?? product.sizes?.[0] ?? null
      setSize(firstValidSize)

      const availableColors = firstValidSize && colorsBySizesMap[firstValidSize]
        ? colorsBySizesMap[firstValidSize]
        : product.colors ?? []

      const firstValidColor = availableColors.find((c) => getStockForColor(firstValidSize, c) > 0) ?? availableColors[0] ?? null
      setColor(firstValidColor)
    }
  }, [product])

  const availableColors = size && colorsBySizesMap[size]
    ? colorsBySizesMap[size]
    : product?.colors ?? []

  useEffect(() => {
    if (availableColors.length > 0) {
      if (!color || !availableColors.includes(color) || getStockForColor(size, color) <= 0) {
        const firstAvailable = availableColors.find((c) => getStockForColor(size, c) > 0)
        setColor(firstAvailable || availableColors[0])
      }
    } else {
      setColor(null)
    }
  }, [size])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    if (product) {
      document.body.style.overflow = "hidden"
      window.addEventListener("keydown", onKey)
    }
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", onKey)
    }
  }, [product, onClose])

  if (!mounted) return null

  const selectedColorStock = color ? getStockForColor(size, color) : 0
  const isFullyOutOStock = selectedColorStock <= 0

  const message = product
    ? `¡Hola Panda Rojo Boutique! Estoy interesad@ en: *${product.name}* (${formatCOP(
        product.price,
      )})${size ? ` · Talla: ${size}` : ""}${color ? ` · Color: ${color}` : ""}. ¿Está disponible?`
    : ""

  return createPortal(
    <AnimatePresence>
      {product && (
        <motion.div
          key="modal-backdrop"
          className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            key="modal-content"
            role="dialog"
            aria-modal="true"
            aria-label={product.name}
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-card shadow-xl sm:rounded-2xl"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar vista previa"
              className="absolute right-3 top-3 z-20 flex size-9 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <X className="size-5" />
            </button>

            <div className="grid gap-0 overflow-y-auto md:grid-cols-2">
              <div className="bg-muted p-4">
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-background">
                  <Image
                    src={product.images[activeImage] || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-cover"
                    priority
                  />
                </div>
                {product.images.length > 1 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {product.images.map((img, i) => (
                      <button
                        key={img + i}
                        type="button"
                        onClick={() => setActiveImage(i)}
                        aria-label={`Ver imagen ${i + 1}`}
                        className={cn(
                          "relative size-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                          activeImage === i
                            ? "border-primary"
                            : "border-transparent hover:border-border",
                        )}
                      >
                        <Image
                          src={img || "/placeholder.svg"}
                          alt=""
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4 p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {product.subcategory || "General"}
                  </span>
                  {product.origin && <OriginBadge origin={product.origin} />}
                </div>

                <div>
                  <h2 className="text-balance font-serif text-2xl font-bold leading-tight text-foreground">
                    {product.name}
                  </h2>
                  <p className="mt-1 font-serif text-2xl font-bold text-primary">
                    {formatCOP(product.price)}
                  </p>
                </div>

                {product.description && (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {product.description}
                  </p>
                )}

                {/* Seleccionador de Talla */}
                {product.sizes && product.sizes.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-foreground">Talla</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {product.sizes.map((s) => {
                        const sizeStock = getStockForSize(s)
                        const isSizeDisabled = sizeStock <= 0
                        return (
                          <button
                            key={s}
                            type="button"
                            disabled={isSizeDisabled}
                            onClick={() => setSize(s)}
                            className={cn(
                              "min-w-10 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                              size === s
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background text-foreground hover:border-primary",
                              isSizeDisabled && "opacity-40 cursor-not-allowed line-through bg-muted/50"
                            )}
                          >
                            {s}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Seleccionador de Color (LIMPIO, SIN MOSTRAR NÚMEROS DE STOCK) */}
                {availableColors.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        Color {size ? `en talla ${size}` : ""}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {availableColors.map((c) => {
                        const colorStock = getStockForColor(size, c)
                        const isSelected = color === c
                        const isDisabled = colorStock <= 0

                        return (
                          <button
                            key={c}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => setColor(c)}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                              isSelected
                                ? "border-primary bg-accent text-primary"
                                : "border-border bg-background text-foreground hover:border-primary",
                              isDisabled && "opacity-40 cursor-not-allowed hover:border-border line-through bg-muted/50"
                            )}
                          >
                            {isSelected && <Check className="size-3.5" />}
                            {c.toUpperCase()}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Botón de compra por WhatsApp */}
                <a
                  href={isFullyOutOStock ? "#" : whatsappLink(message)}
                  target={isFullyOutOStock ? "_self" : "_blank"}
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (isFullyOutOStock) e.preventDefault()
                  }}
                  className={cn(
                    "mt-2 inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-white transition-opacity",
                    isFullyOutOStock
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-[#25D366] hover:opacity-90"
                  )}
                >
                  <WhatsappIcon className="size-5" />
                  {isFullyOutOStock ? "Combinación Agotada" : "Comprar por WhatsApp"}
                </a>
                <p className="text-center text-xs text-muted-foreground">
                  Te atendemos al {site.phone}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}