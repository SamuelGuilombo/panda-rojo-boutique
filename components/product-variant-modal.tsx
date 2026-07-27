"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { type AdminProduct } from "@/services/productService"
import { X, Plus, Minus, CheckCircle } from "lucide-react"

interface ProductVariantModalProps {
  product: AdminProduct | null
  isOpen: boolean
  onClose: () => void
  onAddToCart: (variantItem: {
    cartItemId: string
    id: string
    name: string
    price: number
    image: string
    selectedSize: string
    selectedColor: string
    quantity: number
    maxStock: number
  }) => void
}

export function ProductVariantModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
}: ProductVariantModalProps) {
  if (!isOpen || !product) return null

  const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : ["Única"]
  const [selectedSize, setSelectedSize] = useState<string>(sizes[0])

  // 1. Obtener colores específicos disponibles para la talla seleccionada
  const availableColorsForSize = useMemo(() => {
    if (product.colorsBySizes && product.colorsBySizes[selectedSize]) {
      return product.colorsBySizes[selectedSize]
    }
    return product.colors && product.colors.length > 0 ? product.colors : ["Único"]
  }, [product, selectedSize])

  const [selectedColor, setSelectedColor] = useState<string>(
    availableColorsForSize[0] || "Único"
  )
  const [quantity, setQuantity] = useState<number>(1)

  // 2. Obtener el stock exacto para la combinación específica (Talla - Color)
  const stockForSelectedVariant = useMemo(() => {
    const key = `${selectedSize}-${selectedColor}`
    
    if (product.stockBySizesAndColors && product.stockBySizesAndColors[key] !== undefined) {
      return product.stockBySizesAndColors[key]
    }
    
    if (product.stockBySizes && product.stockBySizes[selectedSize] !== undefined) {
      return product.stockBySizes[selectedSize]
    }

    return product.totalStock
  }, [product, selectedSize, selectedColor])

  // 3. Función auxiliar para calcular el stock total real de una talla sumando sus colores o consultando su mapa
  const getRealSizeStock = (sz: string) => {
    const colorsForSz = product.colorsBySizes?.[sz] || product.colors || []
    
    if (colorsForSz.length > 0 && colorsForSz[0] !== "Único" && product.stockBySizesAndColors) {
      // Sumamos el stock de todos los colores de esta talla específica
      return colorsForSz.reduce((acc, color) => {
        const k = `${sz}-${color}`
        return acc + (product.stockBySizesAndColors?.[k] || 0)
      }, 0)
    }

    return product.stockBySizes?.[sz] ?? product.totalStock ?? 0
  }

  // Asegurar que al abrir el modal o cambiar de producto, se seleccione una talla y color válidos con stock
  useMemo(() => {
    const validSize = sizes.find(sz => getRealSizeStock(sz) > 0) || sizes[0]
    if (validSize !== selectedSize) {
      setSelectedSize(validSize)
    }
  }, [product])

  const handleSizeChange = (size: string) => {
    setSelectedSize(size)
    setQuantity(1)

    // Al cambiar de talla, buscamos el primer color que SÍ tenga stock disponible en esa nueva talla
    const newColors = product.colorsBySizes?.[size] || product.colors || ["Único"]
    const firstAvailableColor = newColors.find(color => {
      const k = `${size}-${color}`
      const cStock = product.stockBySizesAndColors?.[k] ?? getRealSizeStock(size)
      return cStock > 0
    }) || newColors[0] || "Único"

    setSelectedColor(firstAvailableColor)
  }

  const handleIncrease = () => {
    if (quantity < stockForSelectedVariant) {
      setQuantity((prev) => prev + 1)
    }
  }

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1)
    }
  }

  const handleConfirm = () => {
    if (stockForSelectedVariant <= 0) return

    const cartItemId = `${product.id}-${selectedSize}-${selectedColor}`

    onAddToCart({
      cartItemId,
      id: product.id!,
      name: product.name,
      price: product.price,
      image: product.images[0] || "/placeholder.svg",
      selectedSize,
      selectedColor,
      quantity,
      maxStock: stockForSelectedVariant,
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl text-zinc-100">
        
        {/* ENCABEZADO */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h3 className="font-bold text-sm text-white">Seleccionar Talla y Color</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* DETALLE Y FOTO */}
          <div className="flex gap-4 items-center">
            <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0">
              <Image
                src={product.images[0] || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                {product.subcategory}
              </span>
              <h4 className="font-bold text-sm text-white leading-snug">{product.name}</h4>
              <p className="text-base font-black text-amber-400 mt-1">
                ${product.price.toLocaleString("es-CO")}
              </p>
            </div>
          </div>

          {/* 1. SELECCIÓN DE TALLA */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-zinc-300">1. Selecciona Talla</label>
            </div>
            <div className="flex flex-wrap gap-2">
              {sizes.map((sz) => {
                const realStockSz = getRealSizeStock(sz)
                const isDisabled = realStockSz <= 0

                return (
                  <button
                    key={sz}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleSizeChange(sz)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                      selectedSize === sz
                        ? "bg-amber-500 text-black border-amber-500"
                        : isDisabled
                        ? "bg-zinc-950/50 text-zinc-600 border-zinc-800/50 cursor-not-allowed line-through"
                        : "bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    {sz} {realStockSz > 0 ? `(${realStockSz})` : "(Agotado)"}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 2. SELECCIÓN DE COLORES Y STOCK INDIVIDUAL */}
          {availableColorsForSize.length > 0 && availableColorsForSize[0] !== "Único" && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-zinc-300">
                  2. Color disponible en talla <span className="text-amber-400">{selectedSize}</span>
                </label>
                <span className="text-[11px] text-zinc-400">
                  Stock:{" "}
                  <strong className={stockForSelectedVariant > 0 ? "text-emerald-400" : "text-rose-400"}>
                    {stockForSelectedVariant} ud(s)
                  </strong>
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableColorsForSize.map((color) => {
                  const colorKey = `${selectedSize}-${color}`
                  const colorStock = product.stockBySizesAndColors?.[colorKey] ?? stockForSelectedVariant
                  const isColorDisabled = colorStock <= 0

                  return (
                    <button
                      key={color}
                      type="button"
                      disabled={isColorDisabled}
                      onClick={() => {
                        setSelectedColor(color)
                        setQuantity(1)
                      }}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                        selectedColor === color
                          ? "bg-amber-500/10 text-amber-400 border-amber-500"
                          : isColorDisabled
                          ? "bg-zinc-950/40 text-zinc-600 border-zinc-800/40 cursor-not-allowed line-through"
                          : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      {color} {colorStock > 0 ? `(${colorStock})` : "(Agotado)"}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* CANTIDAD */}
          <div className="flex items-center justify-between bg-zinc-950 p-3 rounded-2xl border border-zinc-800">
            <span className="text-xs font-semibold text-zinc-300">Cantidad</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDecrease}
                disabled={quantity <= 1}
                className="p-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg hover:text-white disabled:opacity-30"
              >
                <Minus size={14} />
              </button>
              <span className="font-bold text-sm w-6 text-center text-white">{quantity}</span>
              <button
                type="button"
                onClick={handleIncrease}
                disabled={quantity >= stockForSelectedVariant}
                className="p-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg hover:text-white disabled:opacity-30"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* BOTÓN AGREGAR */}
          <button
            type="button"
            disabled={stockForSelectedVariant <= 0}
            onClick={handleConfirm}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <CheckCircle size={16} />
            {stockForSelectedVariant > 0
              ? `Agregar al Carrito • $${(product.price * quantity).toLocaleString("es-CO")}`
              : "Sin Stock para esta Talla/Color"}
          </button>
        </div>

      </div>
    </div>
  )
}