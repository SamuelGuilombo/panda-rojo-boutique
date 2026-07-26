import { supabase } from "@/lib/supabase"
import type { AdminProduct } from "@/data/products"

export async function fetchProducts(): Promise<AdminProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error

  // Mapeo riguroso de snake_case (BD) a camelCase (Frontend)
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
    total_stock: productData.totalStock,
    best_seller: productData.bestSeller ?? false,
  }

  const { error } = await supabase.from("products").insert([payload])
  if (error) throw error
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
    const filePath = `products/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, file)

    if (uploadError) {
      console.error("Error subiendo imagen:", uploadError)
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