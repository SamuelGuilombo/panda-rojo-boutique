"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { formatCOP, categories } from "@/data/products"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Package,
  Plus,
  Trash2,
  DollarSign,
  TrendingUp,
  Upload,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Award,
  ShoppingCart,
  Settings,
  ArrowLeft,
  Boxes,
  Lock,
  LogOut,
  User,
} from "lucide-react"

// Orígenes definidos directamente
const LOCAL_ORIGINS = [
  { id: "importado", label: "Importado" },
  { id: "nacional", label: "Nacional / Colombia" },
]

interface DbProduct {
  id: string
  name: string
  price: number
  cost_price: number
  category: string
  subcategory: string
  origin: string
  description: string
  images: string[]
  sizes: string[]
  colors: string[]
  stock_by_sizes: Record<string, number>
  total_stock: number
  created_at?: string
}

type AdminView = "menu" | "inventory" | "bamboo_points" | "orders" | "settings"

export default function AdminPage() {
  // Estado de Autenticación
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState<string | null>(null)
  const [loggingIn, setLoggingIn] = useState(false)

  // Estado de Navegación del Panel
  const [activeView, setActiveView] = useState<AdminView>("menu")

  // Lista de productos
  const [products, setProducts] = useState<DbProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  // Formulario Nuevo Producto
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [costPrice, setCostPrice] = useState("")
  const [category, setCategory] = useState(categories[0]?.id || "dama")
  const [subcategory, setSubcategory] = useState(
    categories[0]?.subcategories[0] || "",
  )
  const [origin, setOrigin] = useState(LOCAL_ORIGINS[0].id)
  const [description, setDescription] = useState("")

  // Tallas y Colores
  const [sizesInput, setSizesInput] = useState("S, M, L, XL")
  const [colorsInput, setColorsInput] = useState("Negro, Blanco")

  // Imágenes
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)

  // 1. Verificar Sesión al Cargar la Página
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        setIsAuthenticated(true)
        fetchProducts()
      } else {
        setIsAuthenticated(false)
      }
      setCheckingAuth(false)
    }

    checkSession()

    // Escuchar cambios de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsAuthenticated(!!session)
        if (session) fetchProducts()
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  // Manejo de Inicio de Sesión
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    setLoggingIn(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setAuthError("Credenciales inválidas. Verifica tu correo y contraseña.")
    } else {
      setIsAuthenticated(true)
      fetchProducts()
    }
    setLoggingIn(false)
  }

  // Manejo de Cierre de Sesión
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsAuthenticated(false)
    setActiveView("menu")
  }

  // Actualizar subcategorías al cambiar categoría principal
  useEffect(() => {
    const selectedCat = categories.find((c) => c.id === category)
    if (selectedCat && selectedCat.subcategories.length > 0) {
      setSubcategory(selectedCat.subcategories[0])
    }
  }, [category])

  // Cargar productos de Supabase
  const fetchProducts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error al cargar productos:", error)
      setStatusMessage({ type: "error", text: "Error al cargar el inventario." })
    } else if (data) {
      setProducts(data as DbProduct[])
    }
    setLoading(false)
  }

  // Manejar selección de imágenes
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files))
    }
  }

  // Subir imágenes a Supabase Storage
  const uploadImagesToStorage = async (): Promise<string[]> => {
    const uploadedUrls: string[] = []

    for (const file of imageFiles) {
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
      const filePath = `products/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file)

      if (uploadError) {
        console.error("Error al subir imagen:", uploadError)
        continue
      }

      const { data: publicUrlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath)

      if (publicUrlData?.publicUrl) {
        uploadedUrls.push(publicUrlData.publicUrl)
      }
    }

    return uploadedUrls
  }

  // Guardar Nuevo Producto
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !price) {
      setStatusMessage({
        type: "error",
        text: "Nombre y Precio son obligatorios.",
      })
      return
    }

    setSaving(true)
    setStatusMessage(null)

    try {
      let imageUrls: string[] = []
      if (imageFiles.length > 0) {
        setUploadingImages(true)
        imageUrls = await uploadImagesToStorage()
        setUploadingImages(false)
      }

      const parsedSizes = sizesInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)

      const parsedColors = colorsInput
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)

      const initialStockBySizes: Record<string, number> = {}
      parsedSizes.forEach((s) => {
        initialStockBySizes[s] = 1
      })

      const newProduct = {
        name,
        price: Number(price),
        cost_price: Number(costPrice) || 0,
        category,
        subcategory,
        origin,
        description,
        images: imageUrls,
        sizes: parsedSizes,
        colors: parsedColors,
        stock_by_sizes: initialStockBySizes,
        total_stock: parsedSizes.length || 1,
      }

      const { error } = await supabase.from("products").insert([newProduct])

      if (error) throw error

      setStatusMessage({
        type: "success",
        text: "¡Producto guardado exitosamente!",
      })

      setName("")
      setPrice("")
      setCostPrice("")
      setDescription("")
      setImageFiles([])
      fetchProducts()
    } catch (err: any) {
      console.error("Error al guardar producto:", err)
      setStatusMessage({
        type: "error",
        text: err.message || "Error al guardar el producto.",
      })
    } finally {
      setSaving(false)
    }
  }

  // Eliminar Producto
  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este producto del inventario?")) return

    const { error } = await supabase.from("products").delete().eq("id", id)

    if (error) {
      setStatusMessage({
        type: "error",
        text: "No se pudo eliminar el producto.",
      })
    } else {
      setStatusMessage({
        type: "success",
        text: "Producto eliminado correctamente.",
      })
      setProducts(products.filter((p) => p.id !== id))
    }
  }

  // Pantalla de Carga de Autenticación
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-xs text-neutral-400">
        Verificando sesión administrativa...
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // PANTALLA DE LOGIN (SI NO TIENE SESIÓN ACTIVA)
  // ---------------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="size-12 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white mx-auto">
              <Lock className="size-6" />
            </div>
            <h1 className="text-xl font-serif font-bold text-white">Acceso Administrativo</h1>
            <p className="text-xs text-neutral-400">
              Ingresa tus credenciales autorizadas para gestionar la tienda.
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-medium flex items-center gap-2">
              <XCircle className="size-4 shrink-0" />
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label className="text-xs text-neutral-300">Correo Electrónico</Label>
              <div className="relative mt-1">
                <User className="size-4 text-neutral-500 absolute left-3 top-2.5" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mitienda.com"
                  required
                  className="bg-neutral-950 border-neutral-800 text-white text-xs pl-9"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs text-neutral-300">Contraseña</Label>
              <div className="relative mt-1">
                <Lock className="size-4 text-neutral-500 absolute left-3 top-2.5" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-neutral-950 border-neutral-800 text-white text-xs pl-9"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loggingIn}
              className="w-full bg-white hover:bg-neutral-200 text-neutral-950 font-bold py-2.5 rounded-xl text-xs transition-colors"
            >
              {loggingIn ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // PANEL ADMINISTRATIVO PRINCIPAL (SESIÓN INICIADA)
  // ---------------------------------------------------------------------------
  const totalItems = products.reduce((acc, p) => acc + (p.total_stock || 0), 0)
  const totalValue = products.reduce(
    (acc, p) => acc + p.price * (p.total_stock || 1),
    0,
  )
  const totalCost = products.reduce(
    (acc, p) => acc + (p.cost_price || 0) * (p.total_stock || 1),
    0,
  )
  const expectedProfit = totalValue - totalCost

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Encabezado Principal con Botón de Cerrar Sesión */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
          <div className="flex items-center gap-3">
            {activeView !== "menu" && (
              <Button
                onClick={() => setActiveView("menu")}
                variant="outline"
                size="icon"
                className="border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 shrink-0"
              >
                <ArrowLeft className="size-4" />
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-serif font-bold text-white">
                Panel Administrativo
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5">
                {activeView === "menu" && "Selecciona un módulo para gestionar tu tienda."}
                {activeView === "inventory" && "Gestión de prendas, colores, tallas y márgenes."}
                {activeView === "bamboo_points" && "Gestión del programa de Puntos Bambú."}
                {activeView === "orders" && "Monitoreo e historial de pedidos de clientes."}
                {activeView === "settings" && "Configuración general del catálogo y negocio."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activeView === "inventory" && (
              <Button
                onClick={fetchProducts}
                variant="outline"
                size="sm"
                className="border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-200"
              >
                <RefreshCw className="size-4 mr-2" />
                Actualizar
              </Button>
            )}

            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-rose-900/50 bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 hover:text-rose-200"
            >
              <LogOut className="size-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>

        {/* 1. MENÚ PRINCIPAL */}
        {activeView === "menu" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
            
            <div
              onClick={() => setActiveView("inventory")}
              className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-6 cursor-pointer transition-all hover:scale-[1.01] group flex flex-col justify-between"
            >
              <div>
                <div className="size-12 rounded-xl bg-emerald-950/50 border border-emerald-800/50 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                  <Boxes className="size-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Control e Inventario
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Registra prendas, asigna imágenes, define precio de costo y venta, gestiona tallas y colores disponibles.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-800/60 flex items-center justify-between text-xs font-semibold text-emerald-400">
                <span>{products.length} productos registrados</span>
                <span>Ingresar →</span>
              </div>
            </div>

            <div
              onClick={() => setActiveView("bamboo_points")}
              className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-6 cursor-pointer transition-all hover:scale-[1.01] group flex flex-col justify-between"
            >
              <div>
                <div className="size-12 rounded-xl bg-amber-950/50 border border-amber-800/50 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                  <Award className="size-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Puntos Bambú
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Administra el sistema de puntos por compras de tus clientes, recompensas e historial de redenciones.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-800/60 flex items-center justify-between text-xs font-semibold text-amber-400">
                <span>Módulo de Fidelización</span>
                <span>Ingresar →</span>
              </div>
            </div>

            <div
              onClick={() => setActiveView("orders")}
              className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-6 cursor-pointer transition-all hover:scale-[1.01] group flex flex-col justify-between"
            >
              <div>
                <div className="size-12 rounded-xl bg-blue-950/50 border border-blue-800/50 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                  <ShoppingCart className="size-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Pedidos y Ventas
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Revisa las solicitudes realizadas por clientes por WhatsApp o la plataforma y marca los despachos.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-800/60 flex items-center justify-between text-xs font-semibold text-blue-400">
                <span>Gestión de Pedidos</span>
                <span>Ingresar →</span>
              </div>
            </div>

            <div
              onClick={() => setActiveView("settings")}
              className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-6 cursor-pointer transition-all hover:scale-[1.01] group flex flex-col justify-between"
            >
              <div>
                <div className="size-12 rounded-xl bg-purple-950/50 border border-purple-800/50 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                  <Settings className="size-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Configuración General
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Ajustes de datos de la tienda, integración con Supabase y parámetros del sitio web.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-800/60 flex items-center justify-between text-xs font-semibold text-purple-400">
                <span>Parámetros de la Tienda</span>
                <span>Ingresar →</span>
              </div>
            </div>

          </div>
        )}

        {/* 2. MÓDULO CONTROL E INVENTARIO */}
        {activeView === "inventory" && (
          <>
            {statusMessage && (
              <div
                className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
                  statusMessage.type === "success"
                    ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                    : "bg-rose-950/80 text-rose-300 border border-rose-800"
                }`}
              >
                {statusMessage.type === "success" ? (
                  <CheckCircle2 className="size-5 shrink-0" />
                ) : (
                  <XCircle className="size-5 shrink-0" />
                )}
                {statusMessage.text}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-xs font-medium text-neutral-400">
                    Prendas Registradas
                  </span>
                  <Package className="size-4 text-neutral-400" />
                </div>
                <div className="text-2xl font-bold text-white">{products.length}</div>
                <p className="text-xs text-neutral-500 mt-1">{totalItems} unidades en stock</p>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-xs font-medium text-neutral-400">
                    Valor Total Inventario
                  </span>
                  <DollarSign className="size-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-emerald-400">
                  {formatCOP(totalValue)}
                </div>
                <p className="text-xs text-neutral-500 mt-1">Precio de venta público</p>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-xs font-medium text-neutral-400">
                    Inversión / Costo
                  </span>
                  <DollarSign className="size-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-amber-400">
                  {formatCOP(totalCost)}
                </div>
                <p className="text-xs text-neutral-500 mt-1">Costo total de adquisición</p>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-xs font-medium text-neutral-400">
                    Ganancia Estimada
                  </span>
                  <TrendingUp className="size-4 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-blue-400">
                  {formatCOP(expectedProfit)}
                </div>
                <p className="text-xs text-neutral-500 mt-1">Utilidad bruta esperada</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 h-fit">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Plus className="size-5 text-emerald-400" />
                  Agregar Nueva Prenda
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label className="text-xs text-neutral-300">Nombre de la Prenda *</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej: Camiseta Oversize Heavyweight"
                      required
                      className="bg-neutral-950 border-neutral-800 text-white text-xs mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-neutral-300">Precio Venta (COP) *</Label>
                      <Input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="85000"
                        required
                        className="bg-neutral-950 border-neutral-800 text-white text-xs mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-neutral-300">Precio Costo (COP)</Label>
                      <Input
                        type="number"
                        value={costPrice}
                        onChange={(e) => setCostPrice(e.target.value)}
                        placeholder="35000"
                        className="bg-neutral-950 border-neutral-800 text-white text-xs mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-neutral-300">Categoría</Label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full h-9 rounded-md border border-neutral-800 bg-neutral-950 text-white px-3 py-1 text-xs mt-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id} className="bg-neutral-900 text-white py-1">
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label className="text-xs text-neutral-300">Subcategoría</Label>
                      <select
                        value={subcategory}
                        onChange={(e) => setSubcategory(e.target.value)}
                        className="w-full h-9 rounded-md border border-neutral-800 bg-neutral-950 text-white px-3 py-1 text-xs mt-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                      >
                        {categories
                          .find((c) => c.id === category)
                          ?.subcategories.map((sc) => (
                            <option key={sc} value={sc} className="bg-neutral-900 text-white py-1">
                              {sc}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-neutral-300">Origen / Procedencia</Label>
                    <select
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      className="w-full h-9 rounded-md border border-neutral-800 bg-neutral-950 text-white px-3 py-1 text-xs mt-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                    >
                      {LOCAL_ORIGINS.map((o) => (
                        <option key={o.id} value={o.id} className="bg-neutral-900 text-white py-1">
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label className="text-xs text-neutral-300">
                      Tallas Disponibles (Separadas por coma)
                    </Label>
                    <Input
                      value={sizesInput}
                      onChange={(e) => setSizesInput(e.target.value)}
                      placeholder="S, M, L, XL"
                      className="bg-neutral-950 border-neutral-800 text-white text-xs mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-neutral-300">
                      Colores Disponibles (Separados por coma)
                    </Label>
                    <Input
                      value={colorsInput}
                      onChange={(e) => setColorsInput(e.target.value)}
                      placeholder="Negro, Naranjito, Azulito, Blanco"
                      className="bg-neutral-950 border-neutral-800 text-white text-xs mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-neutral-300">Descripción / Detalles</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Escribe detalles del material, ajuste o lavado..."
                      rows={3}
                      className="bg-neutral-950 border-neutral-800 text-white text-xs mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-neutral-300">Fotos de la Prenda</Label>
                    <div className="mt-1 flex items-center justify-center border-2 border-dashed border-neutral-800 rounded-xl p-4 bg-neutral-950/50 hover:border-neutral-700 transition-colors cursor-pointer relative">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <div className="text-center">
                        <Upload className="size-6 text-neutral-400 mx-auto mb-1" />
                        <p className="text-xs text-neutral-300 font-medium">
                          {imageFiles.length > 0
                            ? `${imageFiles.length} foto(s) seleccionada(s)`
                            : "Haz clic para seleccionar imágenes"}
                        </p>
                        <p className="text-[10px] text-neutral-500 mt-0.5">
                          Soporta JPG, PNG, WEBP
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={saving || uploadingImages}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-xl text-xs"
                  >
                    {saving || uploadingImages
                      ? "Guardando Prenda..."
                      : "Guardar en Inventario"}
                  </Button>
                </form>
              </div>

              <div className="lg:col-span-7 space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center justify-between">
                  <span>Inventario Actual</span>
                  <span className="text-xs font-normal text-neutral-400">
                    {products.length} productos
                  </span>
                </h2>

                {loading ? (
                  <div className="text-center py-12 text-neutral-500 text-xs">
                    Cargando productos de Supabase...
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-12 border border-neutral-800 rounded-2xl bg-neutral-900/50 text-neutral-500 text-xs">
                    Aún no hay productos en la base de datos.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[800px] overflow-y-auto pr-1">
                    {products.map((prod) => (
                      <div
                        key={prod.id}
                        className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex items-center justify-between gap-4 hover:border-neutral-700 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative size-14 rounded-lg bg-neutral-950 overflow-hidden shrink-0 border border-neutral-800">
                            {prod.images && prod.images.length > 0 ? (
                              <Image
                                src={prod.images[0]}
                                alt={prod.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <Package className="size-6 text-neutral-600 m-auto inset-0 absolute" />
                            )}
                          </div>

                          <div className="space-y-1">
                            <h3 className="text-sm font-bold text-white leading-tight">
                              {prod.name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className="text-emerald-400 font-semibold">
                                {formatCOP(prod.price)}
                              </span>
                              {prod.cost_price > 0 && (
                                <span className="text-neutral-500 text-[10px]">
                                  (Costo: {formatCOP(prod.cost_price)})
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-1 mt-1">
                              {prod.sizes?.map((s) => (
                                <span
                                  key={s}
                                  className="px-1.5 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-[10px] text-neutral-300"
                                >
                                  {s}
                                </span>
                              ))}
                              {prod.colors?.map((c) => (
                                <span
                                  key={c}
                                  className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-[10px] text-neutral-200"
                                >
                                  {c}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={() => handleDelete(prod.id)}
                          variant="ghost"
                          size="icon"
                          className="text-neutral-500 hover:text-rose-400 hover:bg-rose-950/30 shrink-0"
                          title="Eliminar producto"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* 3. VISTA PUNTOS BAMBÚ */}
        {activeView === "bamboo_points" && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center space-y-4">
            <div className="size-16 rounded-2xl bg-amber-950/50 border border-amber-800/50 flex items-center justify-center text-amber-400 mx-auto">
              <Award className="size-8" />
            </div>
            <h2 className="text-xl font-bold text-white">Módulo de Puntos Bambú</h2>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              Aquí podrás consultar clientes registrados, asignar puntos manuales, ver el historial de redenciones y ajustar la tasa de equivalencia en compras.
            </p>
          </div>
        )}

        {/* 4. VISTA PEDIDOS */}
        {activeView === "orders" && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center space-y-4">
            <div className="size-16 rounded-2xl bg-blue-950/50 border border-blue-800/50 flex items-center justify-center text-blue-400 mx-auto">
              <ShoppingCart className="size-8" />
            </div>
            <h2 className="text-xl font-bold text-white">Gestión de Pedidos</h2>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              Aquí aparecerán las órdenes realizadas por los clientes en la tienda para marcar su estado (Pendiente, Despachado, Entregado).
            </p>
          </div>
        )}

        {/* 5. VISTA CONFIGURACIÓN */}
        {activeView === "settings" && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center space-y-4">
            <div className="size-16 rounded-2xl bg-purple-950/50 border border-purple-800/50 flex items-center justify-center text-purple-400 mx-auto">
              <Settings className="size-8" />
            </div>
            <h2 className="text-xl font-bold text-white">Configuración del Sistema</h2>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              Parámetros de conexión a Supabase, métodos de pago configurados y datos de contacto del negocio.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}