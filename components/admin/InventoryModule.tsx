"use client"

import { useState, useEffect } from "react"
import { fetchProducts, createProduct, deleteProduct, uploadProductImages } from "@/services/productService"
import { categories, formatCOP, type AdminProduct, type CategoryId } from "@/data/products"
import { Plus, Trash2, Image as ImageIcon, Loader2, AlertCircle } from "lucide-react"

export function InventoryModule() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Estados del formulario de creación
  const [isCreating, setIsCreating] = useState(false)
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [costPrice, setCostPrice] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>("dama")
  const [selectedSubcategory, setSelectedSubcategory] = useState("")
  const [origin, setOrigin] = useState<"Nacional" | "Importado">("Nacional")
  const [description, setDescription] = useState("")
  const [sizesInput, setSizesInput] = useState("S, M, L")
  const [colorsInput, setColorsInput] = useState("Negro, Blanco")
  
  // Manejo de imágenes
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadInventory = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchProducts()
      setProducts(data)
    } catch (err: any) {
      console.error("Error al cargar inventario:", err)
      setError("No se pudieron cargar los productos desde la base de datos.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInventory()
  }, [])

  // Obtener subcategorías según la categoría seleccionada
  const currentCategoryObj = categories.find((c) => c.id === selectedCategory)
  const availableSubcategories = currentCategoryObj?.subcategories || []

  const handleCategoryChange = (catId: CategoryId) => {
    setSelectedCategory(catId)
    const cat = categories.find((c) => c.id === catId)
    if (cat && cat.subcategories.length > 0) {
      setSelectedSubcategory(cat.subcategories[0])
    } else {
      setSelectedSubcategory("")
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setImageFiles((prev) => [...prev, ...filesArray])
    }
  }

  const removeSelectedImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !price) {
      alert("Por favor completa al menos el nombre y el precio de venta.")
      return
    }

    setSaving(true)
    try {
      let imageUrls: string[] = []

      if (imageFiles.length > 0) {
        setUploadingImages(true)
        imageUrls = await uploadProductImages(imageFiles)
        setUploadingImages(false)
      }

      // Procesar tallas y crear stock base por defecto (ej. 5 unidades por cada talla)
      const parsedSizes = sizesInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)

      const parsedColors = colorsInput
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)

      const stockBySizes: Record<string, number> = {}
      let totalStock = 0
      parsedSizes.forEach((size) => {
        stockBySizes[size] = 5 // Stock inicial por defecto
        totalStock += 5
      })

      const newProductData: Omit<AdminProduct, "id" | "createdAt"> = {
        name: name.trim(),
        price: Number(price) || 0,
        costPrice: Number(costPrice) || 0,
        category: selectedCategory,
        subcategory: selectedSubcategory || availableSubcategories[0] || "General",
        origin: currentCategoryObj?.showOrigin ? origin : undefined,
        description: description.trim(),
        images: imageUrls,
        sizes: parsedSizes,
        colors: parsedColors,
        stockBySizes,
        totalStock: totalStock || 1,
        bestSeller: false,
      }

      await createProduct(newProductData)

      // Limpiar formulario y recargar
      setName("")
      setPrice("")
      setCostPrice("")
      setDescription("")
      setImageFiles([])
      setIsCreating(false)
      await loadInventory()
    } catch (err: any) {
      console.error("Error al guardar producto:", err)
      alert("Hubo un error al guardar el producto en la base de datos.")
    } finally {
      setSaving(false)
      setUploadingImages(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este producto de la base de datos?")) return
    try {
      await deleteProduct(id)
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      console.error("Error al eliminar producto:", err)
      alert("No se pudo eliminar el producto.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventario y Productos</h2>
          <p className="text-sm text-gray-500">Gestiona el catálogo conectado directamente a tu base de datos.</p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus size={18} />
          {isCreating ? "Cancelar" : "Nuevo Producto"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Formulario de Creación */}
      {isCreating && (
        <form onSubmit={handleSaveProduct} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-3">Agregar Nuevo Producto</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nombre del Producto</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Vestido midi satinado"
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Precio Venta (COP)</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Ej. 89900"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Precio Costo (COP)</label>
                <input
                  type="number"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  placeholder="Ej. 45000"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Categoría</label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value as CategoryId)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Subcategoría</label>
              <select
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
              >
                {availableSubcategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            {currentCategoryObj?.showOrigin && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Origen</label>
                <select
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
                >
                  <option value="Nacional">Nacional</option>
                  <option value="Importado">Importado</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tallas (separadas por coma)</label>
              <input
                type="text"
                value={sizesInput}
                onChange={(e) => setSizesInput(e.target.value)}
                placeholder="S, M, L, XL"
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Colores (separados por coma)</label>
              <input
                type="text"
                value={colorsInput}
                onChange={(e) => setColorsInput(e.target.value)}
                placeholder="Negro, Beige, Blanco"
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles de la prenda, tela, cuidados..."
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Carga de Imágenes */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Imágenes del Producto</label>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer border-2 border-dashed border-gray-300 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-gray-600 hover:border-black transition-colors">
                <ImageIcon size={18} />
                <span>Seleccionar archivos</span>
                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
              <span className="text-xs text-gray-400">{imageFiles.length} archivo(s) seleccionado(s)</span>
            </div>

            {imageFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {imageFiles.map((file, idx) => (
                  <div key={idx} className="relative group bg-gray-100 border rounded-lg px-3 py-1 text-xs flex items-center gap-2">
                    <span className="truncate max-w-[120px]">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeSelectedImage(idx)}
                      className="text-red-500 hover:text-red-700 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 border rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-black text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {uploadingImages ? "Subiendo imágenes..." : saving ? "Guardando..." : "Guardar Producto"}
            </button>
          </div>
        </form>
      )}

      {/* Listado de Productos */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="animate-spin text-gray-400" size={32} />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-sm">No hay productos registrados en la base de datos todavía.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Producto</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">Precio Venta</th>
                  <th className="py-3 px-4">Costo</th>
                  <th className="py-3 px-4">Stock Total</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-3">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded-lg border"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-lg border flex items-center justify-center text-gray-400 text-xs">
                          Sin img
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.subcategory}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 capitalize text-gray-600">{product.category}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">{formatCOP(product.price)}</td>
                    <td className="py-3 px-4 text-gray-500">{formatCOP(product.costPrice || 0)}</td>
                    <td className="py-3 px-4">
                      <span className="bg-gray-100 px-2.5 py-1 rounded-md text-xs font-medium text-gray-800">
                        {product.totalStock} un.
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Eliminar producto"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}