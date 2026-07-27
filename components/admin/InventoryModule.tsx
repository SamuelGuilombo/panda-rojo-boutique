"use client"

import { useState, useEffect } from "react"
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  AdminProduct,
} from "@/services/productService"
import { categories, formatCOP, type CategoryId } from "@/data/products"
import { CustomerCheckoutModal } from "@/components/admin/CustomerCheckoutModal"
import { Trash2, Edit, Image as ImageIcon, Loader2, AlertCircle, X, Package, Plus, RefreshCw, ShoppingCart } from "lucide-react"

interface ColorStock {
  color: string
  stockInput: string
}

interface SizeVariantConfig {
  size: string
  stockInput: string
  colorInput: string
  colors: ColorStock[]
}

interface InventoryModuleProps {
  products?: AdminProduct[]
  loading?: boolean
  onRefresh?: () => Promise<void>
}

export function InventoryModule({
  products: initialProducts,
  loading: initialLoading,
  onRefresh,
}: InventoryModuleProps) {
  const [internalProducts, setInternalProducts] = useState<AdminProduct[]>([])
  const [internalLoading, setInternalLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const products = initialProducts ?? internalProducts
  const loading = initialLoading ?? internalLoading

  const [editingId, setEditingId] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [costPrice, setCostPrice] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>("dama")
  const [selectedSubcategory, setSelectedSubcategory] = useState("")
  const [origin, setOrigin] = useState<"Nacional" | "Importado">("Nacional")
  const [description, setDescription] = useState("")

  const [pinStockInput, setPinStockInput] = useState("1")

  const [sizesInput, setSizesInput] = useState("")
  const [variants, setVariants] = useState<SizeVariantConfig[]>([])

  const [existingImages, setExistingImages] = useState<string[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [saving, setSaving] = useState(false)

  // Estado para ventas rápida desde inventario / checkout
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false)
  const [saleTotalAmount, setSaleTotalAmount] = useState(0)

  const loadInventory = async () => {
    if (onRefresh) {
      await onRefresh()
      return
    }

    setInternalLoading(true)
    setError(null)
    try {
      const data = await fetchProducts()
      setInternalProducts(data)
    } catch (err: any) {
      console.error("Error al cargar inventario:", err)
      setError("No se pudieron cargar los productos desde la base de datos.")
    } finally {
      setInternalLoading(false)
    }
  }

  useEffect(() => {
    if (!initialProducts) {
      loadInventory()
    }
  }, [])

  const currentCategoryObj = categories.find((c) => c.id === selectedCategory)
  const availableSubcategories = currentCategoryObj?.subcategories || []
  
  const isPinOrAccessory = (selectedCategory as string) === "pines" || (selectedCategory as string) === "accesorios"

  const handleSizesInputChange = (val: string) => {
    setSizesInput(val)

    const parsedSizes = val
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean)

    setVariants((prev) => {
      return parsedSizes.map((size) => {
        const existing = prev.find((v) => v.size === size)
        return (
          existing || {
            size,
            stockInput: "1",
            colorInput: "",
            colors: [],
          }
        )
      })
    })
  }

  const handleCategoryChange = (catId: CategoryId) => {
    setSelectedCategory(catId)
    const cat = categories.find((c) => c.id === catId)
    setSelectedSubcategory(cat?.subcategories[0] || "")

    if ((catId as string) === "pines" || (catId as string) === "accesorios") {
      setSizesInput("")
      setVariants([])
      setPinStockInput("1")
    }
  }

  const handleSizeStockChange = (variantIndex: number, value: string) => {
    setVariants((prev) => {
      const updated = [...prev]
      updated[variantIndex].stockInput = value
      return updated
    })
  }

  const handleAddColorToVariant = (variantIndex: number) => {
    const colorName = variants[variantIndex].colorInput.trim()
    if (!colorName) return

    setVariants((prev) => {
      const updated = [...prev]
      const currentVariant = updated[variantIndex]

      const exists = currentVariant.colors.some(
        (c) => c.color.toLowerCase() === colorName.toLowerCase()
      )

      if (!exists) {
        updated[variantIndex].colors.push({ color: colorName, stockInput: "1" })
      }
      updated[variantIndex].colorInput = ""
      return updated
    })
  }

  const handleColorStockChange = (
    variantIndex: number,
    colorIndex: number,
    value: string
  ) => {
    setVariants((prev) => {
      const updated = [...prev]
      updated[variantIndex].colors[colorIndex].stockInput = value
      return updated
    })
  }

  const handleRemoveColorFromVariant = (variantIndex: number, colorIndex: number) => {
    setVariants((prev) => {
      const updated = [...prev]
      updated[variantIndex].colors.splice(colorIndex, 1)
      return updated
    })
  }

  const applySizePreset = (preset: "textil" | "numerico") => {
    if (preset === "textil") handleSizesInputChange("S, M, L, XL")
    if (preset === "numerico") handleSizesInputChange("28, 30, 32, 34")
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles((prev) => [...prev, ...Array.from(e.target.files!)])
    }
  }

  const removeSelectedNewImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (urlToRemove: string) => {
    setExistingImages((prev) => prev.filter((url) => url !== urlToRemove))
  }

  const resetForm = () => {
    setEditingId(null)
    setName("")
    setPrice("")
    setCostPrice("")
    setDescription("")
    setSizesInput("")
    setVariants([])
    setPinStockInput("1")
    setExistingImages([])
    setImageFiles([])
  }

  const handleEditProduct = (product: AdminProduct) => {
    setEditingId(product.id || null)
    setName(product.name)
    setPrice(product.price.toString())
    setCostPrice(product.costPrice ? product.costPrice.toString() : "")
    setSelectedCategory(product.category as CategoryId)
    setSelectedSubcategory(product.subcategory)
    setOrigin((product.origin as "Nacional" | "Importado") || "Nacional")
    setDescription(product.description || "")
    setExistingImages(product.images || [])
    setImageFiles([])

    const isPin = (product.category as string) === "pines" || (product.category as string) === "accesorios"

    if (isPin) {
      setPinStockInput(product.totalStock.toString())
      setSizesInput("")
      setVariants([])
    } else {
      const sizesArray = product.sizes || []
      setSizesInput(sizesArray.join(", "))

      const loadedVariants: SizeVariantConfig[] = sizesArray.map((size) => {
        const sizeColors = product.colorsBySizes?.[size] || []
        const totalStockForSize = product.stockBySizes?.[size] ?? 0

        let colorStockList: ColorStock[] = []

        if (sizeColors.length > 0) {
          colorStockList = sizeColors.map((col) => {
            const specificKey = `${size}-${col}`
            const qty = product.stockBySizesAndColors?.[specificKey] ?? 
              Math.max(1, Math.floor(totalStockForSize / sizeColors.length))
            
            return {
              color: col,
              stockInput: qty.toString(),
            }
          })
        }

        return {
          size,
          stockInput: totalStockForSize.toString(),
          colorInput: "",
          colors: colorStockList,
        }
      })

      setVariants(loadedVariants)
    }

    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !price) {
      alert("Por favor completa el nombre y el precio de venta.")
      return
    }

    if (!isPinOrAccessory && variants.length === 0) {
      alert("Debes agregar al menos una talla válida.")
      return
    }

    setSaving(true)
    try {
      let uploadedUrls: string[] = []

      if (imageFiles.length > 0) {
        setUploadingImages(true)
        uploadedUrls = await uploadProductImages(imageFiles)
        setUploadingImages(false)
      }

      const finalImages = [...existingImages, ...uploadedUrls]

      const stockBySizes: Record<string, number> = {}
      const colorsBySizes: Record<string, string[]> = {}
      const stockBySizesAndColors: Record<string, number> = {}
      let allColorsSet = new Set<string>()
      let totalStock = 0
      let finalSizes: string[] = []

      if (isPinOrAccessory) {
        const pinQty = Math.max(0, Number(pinStockInput) || 0)
        finalSizes = ["Única"]
        stockBySizes["Única"] = pinQty
        stockBySizesAndColors["Única-Único"] = pinQty
        totalStock = pinQty
      } else {
        finalSizes = variants.map((v) => v.size)

        variants.forEach((v) => {
          let sizeTotalStock = 0
          const sizeColorsList: string[] = []

          if (v.colors.length > 0) {
            v.colors.forEach((c) => {
              const qty = Math.max(0, Number(c.stockInput) || 0)
              sizeTotalStock += qty
              if (c.color) {
                sizeColorsList.push(c.color)
                allColorsSet.add(c.color)
                stockBySizesAndColors[`${v.size}-${c.color}`] = qty
              }
            })
          } else {
            sizeTotalStock = Math.max(0, Number(v.stockInput) || 0)
            stockBySizesAndColors[`${v.size}-Único`] = sizeTotalStock
          }

          stockBySizes[v.size] = sizeTotalStock
          colorsBySizes[v.size] = sizeColorsList
          totalStock += sizeTotalStock
        })
      }

      const productPayload: Omit<AdminProduct, "id" | "createdAt"> = {
        name: name.trim(),
        price: Number(price) || 0,
        costPrice: Number(costPrice) || 0,
        category: selectedCategory,
        subcategory: selectedSubcategory || availableSubcategories[0] || "General",
        origin: currentCategoryObj?.showOrigin !== false ? origin : undefined,
        description: description.trim(),
        images: finalImages,
        sizes: finalSizes,
        colors: Array.from(allColorsSet),
        stockBySizes,
        colorsBySizes,
        stockBySizesAndColors,
        totalStock,
        bestSeller: false,
      }

      if (editingId) {
        await updateProduct(editingId, productPayload)
      } else {
        await createProduct(productPayload)
      }

      resetForm()
      await loadInventory()
    } catch (err: any) {
      console.error("Error al guardar producto:", err)
      alert(`Error al guardar: ${err?.message || "Revisa la conexión con Supabase"}`)
    } finally {
      setSaving(false)
      setUploadingImages(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return
    try {
      await deleteProduct(id)
      if (editingId === id) resetForm()
      await loadInventory()
    } catch (err) {
      console.error("Error al eliminar producto:", err)
      alert("No se pudo eliminar el producto.")
    }
  }

  // Abrir venta rápida para un producto específico
  const handleQuickSale = (product: AdminProduct) => {
    setSaleTotalAmount(product.price)
    setCheckoutModalOpen(true)
  }

  const handleConfirmCheckout = (checkoutData: {
    finalAmount: number
    discount: number
    customerId?: string
    customerName?: string
    paymentMethod: string
  }) => {
    console.log("Venta confirmada exitosamente:", checkoutData)
    setCheckoutModalOpen(false)
    alert(`¡Venta registrada! Total cobrado: ${formatCOP(checkoutData.finalAmount)} (${checkoutData.paymentMethod})`)
  }

  return (
    <div className="space-y-6 text-slate-900">
      {/* HEADER COMPACTO */}
      <div className="bg-slate-50 border-l-4 border-slate-900 border-y border-r border-slate-200 p-4 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-900 text-white rounded-lg shrink-0">
            <Package size={20} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 leading-tight">
              Control de Inventario y Productos
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Gestión precisa de variantes, tallas, stock y colores.
            </p>
          </div>
        </div>
        <button
          onClick={loadInventory}
          className="flex items-center gap-1.5 self-start sm:self-center px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          <span>Actualizar</span>
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle size={18} className="text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid Layout (5 Col Formulario / 7 Col Tabla) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* FORMULARIO IZQUIERDA */}
        <div className="lg:col-span-5 bg-white border border-slate-300 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">
              {editingId ? "Editar Producto" : "Agregar Producto"}
            </h3>
            {editingId && (
              <span className="text-[11px] font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                <Edit size={12} /> Modificando
              </span>
            )}
          </div>

          <form onSubmit={handleSaveProduct} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Nombre del Producto *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isPinOrAccessory ? "Ej. Pin Metálico NASA" : "Ej. Camiseta Algodón Oversize"}
                className="w-full border border-slate-300 bg-slate-50 text-slate-900 font-medium rounded-xl px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Precio Venta (COP) *</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Ej. 15000"
                  className="w-full border border-slate-300 bg-slate-50 text-slate-900 font-medium rounded-xl px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Costo (COP)</label>
                <input
                  type="number"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  placeholder="Ej. 5000"
                  className="w-full border border-slate-300 bg-slate-50 text-slate-900 font-medium rounded-xl px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Categoría</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value as CategoryId)}
                  className="w-full border border-slate-300 bg-slate-50 text-slate-900 font-medium rounded-xl px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {availableSubcategories.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Subcategoría</label>
                  <select
                    value={selectedSubcategory}
                    onChange={(e) => setSelectedSubcategory(e.target.value)}
                    className="w-full border border-slate-300 bg-slate-50 text-slate-900 font-medium rounded-xl px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    {availableSubcategories.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Origen</label>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value as any)}
                className="w-full border border-slate-300 bg-slate-50 text-slate-900 font-medium rounded-xl px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="Nacional">Nacional</option>
                <option value="Importado">Importado</option>
              </select>
            </div>

            {isPinOrAccessory ? (
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Cantidad / Unidades Disponibles *
                </label>
                <input
                  type="number"
                  min="0"
                  value={pinStockInput}
                  onChange={(e) => setPinStockInput(e.target.value)}
                  placeholder="Ej. 10"
                  className="w-full border border-slate-300 bg-white text-slate-900 font-bold rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            ) : (
              <div className="space-y-3 bg-slate-50 border border-slate-200 p-3 rounded-xl">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Tallas Disponibles (separadas por coma)
                  </label>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => applySizePreset("textil")}
                      className="text-[10px] bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-1.5 py-0.5 rounded"
                    >
                      S, M, L, XL
                    </button>
                    <button
                      type="button"
                      onClick={() => applySizePreset("numerico")}
                      className="text-[10px] bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-1.5 py-0.5 rounded"
                    >
                      28, 30, 32
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  value={sizesInput}
                  onChange={(e) => handleSizesInputChange(e.target.value)}
                  placeholder="Ej: S, M, L, XL"
                  className="w-full border border-slate-300 bg-white text-slate-900 font-medium rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 placeholder:text-slate-400"
                />

                {variants.length > 0 && (
                  <div className="space-y-3 pt-2 border-t border-slate-200">
                    <p className="text-[11px] font-bold text-slate-700">Configura Stock y Colores por Talla:</p>
                    
                    {variants.map((variant, vIdx) => {
                      const hasColors = variant.colors.length > 0
                      const sizeTotalStock = hasColors
                        ? variant.colors.reduce((acc, curr) => acc + (Number(curr.stockInput) || 0), 0)
                        : Number(variant.stockInput) || 0

                      return (
                        <div key={variant.size} className="bg-white border border-slate-300 p-3 rounded-xl space-y-2.5 shadow-2xs">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                            <span className="bg-slate-900 text-white text-xs font-bold px-2.5 py-0.5 rounded-md">
                              Talla {variant.size}
                            </span>
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                              Total Talla: {sizeTotalStock} un.
                            </span>
                          </div>

                          {!hasColors && (
                            <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200">
                              <span className="text-xs font-medium text-slate-700">Unidades de esta talla:</span>
                              <input
                                type="number"
                                min="0"
                                value={variant.stockInput}
                                onChange={(e) => handleSizeStockChange(vIdx, e.target.value)}
                                className="w-20 border border-slate-300 bg-white font-bold text-center text-slate-900 rounded-md py-1 text-xs focus:ring-1 focus:ring-slate-900"
                              />
                            </div>
                          )}

                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={variant.colorInput}
                              onChange={(e) => {
                                const val = e.target.value
                                setVariants((prev) => {
                                  const updated = [...prev]
                                  updated[vIdx].colorInput = val
                                  return updated
                                })
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault()
                                  handleAddColorToVariant(vIdx)
                                }
                              }}
                              placeholder="Agregar color opcional (ej. Negro)"
                              className="flex-1 border border-slate-200 bg-slate-50 text-slate-900 text-xs rounded-lg px-2.5 py-1 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddColorToVariant(vIdx)}
                              className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 shrink-0"
                            >
                              <Plus size={13} /> Añadir Color
                            </button>
                          </div>

                          {hasColors && (
                            <div className="space-y-1.5 pt-1">
                              {variant.colors.map((c, cIdx) => (
                                <div
                                  key={cIdx}
                                  className="flex items-center justify-between bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs"
                                >
                                  <span className="font-semibold text-slate-800 truncate max-w-[140px]">
                                    {c.color}
                                  </span>

                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-slate-500 font-medium">Stock:</span>
                                    <input
                                      type="number"
                                      min="0"
                                      value={c.stockInput}
                                      onChange={(e) => handleColorStockChange(vIdx, cIdx, e.target.value)}
                                      className="w-16 border border-slate-300 bg-white font-bold text-center text-slate-900 rounded-md py-0.5 text-xs focus:ring-1 focus:ring-slate-900"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveColorFromVariant(vIdx, cIdx)}
                                      className="text-slate-400 hover:text-rose-600 transition-colors p-0.5"
                                      title="Eliminar color"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Descripción</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalles del producto..."
                className="w-full border border-slate-300 bg-slate-50 text-slate-900 font-medium rounded-xl px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Imágenes</label>
              
              {existingImages.length > 0 && (
                <div className="mb-2">
                  <p className="text-[10px] font-bold text-slate-500 mb-1">Fotos Actuales:</p>
                  <div className="flex flex-wrap gap-2">
                    {existingImages.map((imgUrl, idx) => (
                      <div key={idx} className="relative group w-12 h-12 rounded-lg overflow-hidden border border-slate-300">
                        <img src={imgUrl} alt="Foto producto" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(imgUrl)}
                          className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Eliminar foto"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <label className="cursor-pointer border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 rounded-xl px-3 py-2 flex items-center gap-2 text-xs font-semibold text-slate-700 transition-colors">
                  <ImageIcon size={16} />
                  <span>Subir fotos</span>
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
                <span className="text-xs text-slate-500 font-medium">{imageFiles.length} nuevas</span>
              </div>

              {imageFiles.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {imageFiles.map((file, idx) => (
                    <div key={idx} className="bg-slate-100 border border-slate-300 rounded-md px-2 py-0.5 text-[11px] font-medium text-slate-800 flex items-center gap-1.5">
                      <span className="truncate max-w-[100px]">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeSelectedNewImage(idx)}
                        className="text-rose-600 hover:text-rose-800 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors"
              >
                {editingId ? "Cancelar" : "Limpiar"}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {uploadingImages
                  ? "Subiendo fotos..."
                  : saving
                  ? "Guardando..."
                  : editingId
                  ? "Actualizar Producto"
                  : "Guardar Producto"}
              </button>
            </div>
          </form>
        </div>

        {/* TABLA DERECHA */}
        <div className="lg:col-span-7 bg-white border border-slate-300 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-sm">Productos Registrados</h3>
            <span className="text-xs font-bold text-slate-700 bg-white border border-slate-300 px-2.5 py-0.5 rounded-full">
              Total: {products.length}
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin text-slate-400" size={28} />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <p className="text-sm font-medium">No hay productos en el inventario.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Producto</th>
                    <th className="py-2.5 px-3">Precio</th>
                    <th className="py-2.5 px-3">Stock x Talla</th>
                    <th className="py-2.5 px-3">Total</th>
                    <th className="py-2.5 px-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {products.map((product) => {
                    const isBeingEdited = editingId === product.id
                    return (
                      <tr
                        key={product.id}
                        className={`transition-colors ${
                          isBeingEdited ? "bg-amber-50/80" : "hover:bg-slate-50/80"
                        }`}
                      >
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2.5">
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-9 h-9 object-cover rounded-lg border border-slate-300 shrink-0"
                              />
                            ) : (
                              <div className="w-9 h-9 bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-center text-slate-400 text-[10px] shrink-0 font-semibold">
                                Sin foto
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate max-w-[120px] sm:max-w-[160px]">
                                {product.name}
                              </p>
                              <span className="text-[10px] font-medium text-slate-500 capitalize">
                                {product.category}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{formatCOP(product.price)}</td>
                        <td className="py-2.5 px-3">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {Object.entries(product.stockBySizes || {}).map(([sz, qty]) => {
                              const colors = product.colorsBySizes?.[sz] || []
                              return (
                                <span
                                  key={sz}
                                  className="bg-slate-100 border border-slate-300 text-slate-800 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 font-medium"
                                >
                                  <strong className="font-bold">{sz}:</strong> {qty}un.
                                  {colors.length > 0 && <span className="text-slate-500">({colors.join("/")})</span>}
                                </span>
                              )
                            })}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-md text-[11px] font-bold">
                            {product.totalStock} un.
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleQuickSale(product)}
                              className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Registrar venta directa"
                            >
                              <ShoppingCart size={15} />
                            </button>
                            <button
                              onClick={() => handleEditProduct(product)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isBeingEdited
                                  ? "bg-amber-200 text-amber-900"
                                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                              }`}
                              title="Editar producto"
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id!)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Eliminar producto"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Checkout / Cobro */}
      {checkoutModalOpen && (
        <CustomerCheckoutModal
          totalAmount={saleTotalAmount}
          onClose={() => setCheckoutModalOpen(false)}
          onConfirm={handleConfirmCheckout}
        />
      )}
    </div>
  )
}