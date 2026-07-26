import { supabase } from "@/lib/supabase"

const BUCKET_NAME = "products" // o "product-images" según tu bucket

export interface AdminProduct {
  id?: string
  name: string
  price: number
  costPrice?: number
  category: string
  subcategory: string
  origin?: string
  description?: string
  images: string[]
  sizes: string[]
  colors: string[]
  stockBySizes: Record<string, number>
  colorsBySizes?: Record<string, string[]>
  totalStock: number
  bestSeller?: boolean
  createdAt?: string
}

export async function fetchProducts(): Promise<AdminProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error

  return (data || []).map((item: any) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    costPrice: item.cost_price ?? 0,
    category: item.category,
    subcategory: item.subcategory,
    origin: item.origin,
    description: item.description ?? "",
    images: item.images ?? [],
    sizes: item.sizes ?? [],
    colors: item.colors ?? [],
    stockBySizes: item.stock_by_sizes ?? {},
    colorsBySizes: item.colors_by_sizes ?? {},
    totalStock: item.total_stock ?? 0,
    bestSeller: item.best_seller ?? false,
    createdAt: item.created_at,
  }))
}

export async function createProduct(productData: Omit<AdminProduct, "id" | "createdAt">) {
  const payload = {
    name: productData.name,
    price: productData.price,
    cost_price: productData.costPrice,
    category: productData.category,
    subcategory: productData.subcategory,
    origin: productData.origin,
    description: productData.description,
    images: productData.images,
    sizes: productData.sizes,
    colors: productData.colors,
    stock_by_sizes: productData.stockBySizes,
    colors_by_sizes: productData.colorsBySizes || {},
    total_stock: productData.totalStock,
    best_seller: productData.bestSeller ?? false,
  }

  const { data, error } = await supabase
    .from("products")
    .insert([payload])
    .select()

  if (error) {
    console.error("Error al insertar producto en Supabase:", error)
    throw error
  }

  return data
}

export async function updateProduct(id: string, productData: Partial<Omit<AdminProduct, "id" | "createdAt">>) {
  const payload: any = {}
  if (productData.name !== undefined) payload.name = productData.name
  if (productData.price !== undefined) payload.price = productData.price
  if (productData.costPrice !== undefined) payload.cost_price = productData.costPrice
  if (productData.category !== undefined) payload.category = productData.category
  if (productData.subcategory !== undefined) payload.subcategory = productData.subcategory
  if (productData.origin !== undefined) payload.origin = productData.origin
  if (productData.description !== undefined) payload.description = productData.description
  if (productData.images !== undefined) payload.images = productData.images
  if (productData.sizes !== undefined) payload.sizes = productData.sizes
  if (productData.colors !== undefined) payload.colors = productData.colors
  if (productData.stockBySizes !== undefined) payload.stock_by_sizes = productData.stockBySizes
  if (productData.colorsBySizes !== undefined) payload.colors_by_sizes = productData.colorsBySizes
  if (productData.totalStock !== undefined) payload.total_stock = productData.totalStock
  if (productData.bestSeller !== undefined) payload.best_seller = productData.bestSeller

  const { data, error } = await supabase
    .from("products")
    .update(payload)
    .eq("id", id)
    .select()

  if (error) {
    console.error("Error al actualizar producto en Supabase:", error)
    throw error
  }

  return data
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id)
  if (error) throw error
}

export async function uploadProductImages(files: File[]): Promise<string[]> {
  const uploadedUrls: string[] = []

  for (const file of files) {
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      console.error("Error subiendo imagen:", uploadError)
      throw new Error(`Error en Storage: ${uploadError.message}`)
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath)

    if (publicUrlData?.publicUrl) {
      uploadedUrls.push(publicUrlData.publicUrl)
    }
  }

  return uploadedUrls
}