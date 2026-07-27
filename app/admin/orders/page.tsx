"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { CustomerCheckoutModal } from "@/components/admin/CustomerCheckoutModal"
import { ProductVariantModal } from "@/components/product-variant-modal"
import { fetchProducts, processSale, type AdminProduct } from "@/services/productService"
import { ShoppingBag, Plus, Minus, Trash2, CreditCard, Package, Loader2, Search } from "lucide-react"

export interface CartVariantItem {
  cartItemId: string
  id: string
  name: string
  price: number
  image: string
  selectedSize: string
  selectedColor: string
  quantity: number
  maxStock: number
}

export default function OrdersAdminPage() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const [selectedProductForVariant, setSelectedProductForVariant] = useState<AdminProduct | null>(null)
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false)
  const [cart, setCart] = useState<CartVariantItem[]>([])
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  const loadProducts = async () => {
    try {
      setLoadingProducts(true)
      const data = await fetchProducts()
      setProducts(data)
    } catch (err) {
      console.error("Error al cargar productos desde Supabase:", err)
    } finally {
      setLoadingProducts(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  // Buscador interactivo por nombre, categoría o subcategoría
  const filteredProducts = products.filter((prod) => {
    const term = searchTerm.toLowerCase()
    return (
      prod.name.toLowerCase().includes(term) ||
      prod.category?.toLowerCase().includes(term) ||
      prod.subcategory?.toLowerCase().includes(term)
    )
  })

  const handleSelectProduct = (product: AdminProduct) => {
    setSelectedProductForVariant(product)
    setIsVariantModalOpen(true)
  }

  const handleAddToCartWithVariant = (newItem: CartVariantItem) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.cartItemId === newItem.cartItemId)

      if (existingIndex > -1) {
        return prev.map((item, idx) => {
          if (idx === existingIndex) {
            const updatedQty = item.quantity + newItem.quantity
            return {
              ...item,
              quantity: updatedQty > item.maxStock ? item.maxStock : updatedQty,
            }
          }
          return item
        })
      }

      return [...prev, newItem]
    })
  }

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta
            if (newQty <= 0) return null
            if (newQty > item.maxStock) return item
            return { ...item, quantity: newQty }
          }
          return item
        })
        .filter(Boolean) as CartVariantItem[]
    )
  }

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId))
  }

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  // Función ejecutada al completar el cobro conectando a Supabase
  const handleConfirmCheckout = async (checkoutData: {
    finalAmount: number
    discount: number
    customerId?: string
    customerName?: string
    paymentMethod: string
  }) => {
    try {
      // 1. Mapeamos los productos del carrito incluyendo selectedColor para el descuento exacto de variantes
      const itemsToProcess = cart.map((item) => ({
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        size: item.selectedSize,
        selectedColor: item.selectedColor,
        price: item.price,
      }))

      // 2. Ejecutamos la transacción en Supabase
      await processSale({
        items: itemsToProcess,
        finalAmount: checkoutData.finalAmount,
        discount: checkoutData.discount,
        paymentMethod: checkoutData.paymentMethod,
        customerId: checkoutData.customerId,
        customerName: checkoutData.customerName,
      })

      // 3. Notificación de éxito
      alert(`¡Venta realizada con éxito! Monto cobrado: $${checkoutData.finalAmount.toLocaleString("es-CO")}`)

      // 4. Limpiamos carrito, cerramos modal y recargamos productos para ver el stock actualizado
      setCart([])
      setIsCheckoutOpen(false)
      await loadProducts()
    } catch (error) {
      console.error("Error al procesar la venta en Supabase:", error)
      alert("Hubo un problema al registrar la venta. Por favor intenta de nuevo.")
    }
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-6 space-y-6">
      
      {/* ENCABEZADO Y BUSCADOR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <ShoppingBag className="text-amber-500" /> POS y Gestión de Pedidos
          </h1>
          <p className="text-xs text-zinc-400">
            Selecciona productos, confirma la talla/color y procesa la venta en el punto de venta.
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o categoría..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CATÁLOGO CON IMÁGENES Y TALLAS */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
            <Package size={18} className="text-zinc-500" /> Catálogo ({filteredProducts.length})
          </h2>

          {loadingProducts ? (
            <div className="flex items-center justify-center py-20 text-zinc-500 gap-2 border border-zinc-800/60 rounded-3xl bg-zinc-900/50">
              <Loader2 className="animate-spin" size={20} />
              <span className="text-xs">Cargando productos de la base de datos...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center text-zinc-500 text-xs">
              No se encontraron productos coincidentes.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => handleSelectProduct(prod)}
                  className="group cursor-pointer flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 hover:border-amber-500/50 transition-all text-left"
                >
                  <div className="relative aspect-[3/4] w-full bg-zinc-950 overflow-hidden">
                    <Image
                      src={prod.images[0] || "/placeholder.svg"}
                      alt={prod.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {prod.totalStock <= 0 && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-950/80 px-2.5 py-1 rounded-full border border-rose-800">
                          Agotado
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 flex flex-col justify-between flex-1 gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">
                        {prod.subcategory}
                      </span>
                      <h3 className="text-xs font-semibold text-white line-clamp-2 leading-tight">
                        {prod.name}
                      </h3>
                    </div>

                    {prod.sizes && prod.sizes.length > 0 && prod.sizes[0] !== "Única" && (
                      <div className="flex flex-wrap gap-1">
                        {prod.sizes.map((sz) => (
                          <span
                            key={sz}
                            className="bg-zinc-950 border border-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded text-[9px] font-bold"
                          >
                            {sz}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60">
                      <span className="text-sm font-black text-amber-400">
                        ${prod.price.toLocaleString("es-CO")}
                      </span>
                      <button
                        type="button"
                        className="p-1.5 bg-zinc-800 group-hover:bg-amber-500 group-hover:text-black text-zinc-300 rounded-lg transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CARRITO VISUAL CON MINIATURAS */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 flex flex-col justify-between h-[calc(100vh-180px)] sticky top-6">
          <div className="space-y-4 overflow-y-auto pr-1">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="font-bold text-base text-white">Carrito Actual</h2>
              <span className="text-xs font-semibold bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full border border-amber-500/20">
                {totalItems} ítems
              </span>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-xs">
                El carrito está vacío. Haz clic en un producto para elegir su talla/color.
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-2.5 flex items-center justify-between gap-3"
                  >
                    <div className="relative w-12 h-14 rounded-xl overflow-hidden bg-zinc-900 shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-semibold text-white line-clamp-1">{item.name}</p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                          {item.selectedSize}
                        </span>
                        {item.selectedColor !== "Único" && (
                          <span className="text-[10px] font-medium text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                            {item.selectedColor}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 font-medium">
                        ${(item.price * item.quantity).toLocaleString("es-CO")}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => removeFromCart(item.cartItemId)}
                        className="text-zinc-500 hover:text-rose-400 transition-colors p-1"
                      >
                        <Trash2 size={13} />
                      </button>

                      <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                        <button
                          onClick={() => updateQuantity(item.cartItemId, -1)}
                          className="p-1 text-zinc-400 hover:text-white"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId, 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="p-1 text-zinc-400 hover:text-white disabled:opacity-30"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* TOTAL Y COBRO */}
          <div className="border-t border-zinc-800 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-medium">Total</span>
              <span className="text-xl font-black text-white">
                ${totalAmount.toLocaleString("es-CO")}
              </span>
            </div>

            <button
              disabled={cart.length === 0}
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/10 cursor-pointer"
            >
              <CreditCard size={16} /> Proceder al Cobro
            </button>
          </div>
        </div>

      </div>

      <ProductVariantModal
        product={selectedProductForVariant}
        isOpen={isVariantModalOpen}
        onClose={() => setIsVariantModalOpen(false)}
        onAddToCart={handleAddToCartWithVariant}
      />

      {/* MODAL DE COBRO CON WRAPPER DE ALTURA CONTROLADA */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg max-h-[90vh] flex flex-col">
            <CustomerCheckoutModal
              totalAmount={totalAmount}
              onClose={() => setIsCheckoutOpen(false)}
              onConfirm={handleConfirmCheckout}
            />
          </div>
        </div>
      )}
    </div>
  )
}