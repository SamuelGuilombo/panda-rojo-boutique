import { supabase } from "@/lib/supabase"

const BUCKET_NAME = "products"

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
  stockBySizesAndColors?: Record<string, number>
  totalStock: number
  bestSeller?: boolean
  createdAt?: string
}

export interface Product {
  id: string
  name: string
  price: number
  stock: number
}

export interface SaleItem {
  product_id: string
  product_name: string
  quantity: number
  size?: string
  selectedColor?: string
  price: number
}

export interface CompleteSaleData {
  items: SaleItem[]
  finalAmount: number
  discount: number
  paymentMethod: string
  customerId?: number | string
  customerName?: string
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, total_stock")
    .order("name", { ascending: true })

  if (error) {
    console.error("Error al obtener productos para POS:", error)
    return []
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    stock: item.total_stock ?? 0,
  }))
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
    stockBySizesAndColors: item.stock_by_sizes_and_colors ?? {},
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
    stock_by_sizes_and_colors: productData.stockBySizesAndColors || {},
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
  if (productData.stockBySizesAndColors !== undefined) payload.stock_by_sizes_and_colors = productData.stockBySizesAndColors
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

/**
 * Función auxiliar corregida para actualizar limpiamente el registro diario del libro fiscal
 */
async function updateDailyFiscalRecordOnSale(saleAmount: number) {
  const today = new Date().toISOString().split("T")[0] // Formato YYYY-MM-DD

  const { data: existing } = await supabase
    .from("daily_fiscal_records")
    .select("*")
    .eq("record_date", today)
    .maybeSingle()

  if (existing) {
    const newCount = (existing.invoice_count || 0) + 1
    const newTotalInvoicesAmount = Number(existing.total_invoices_amount || 0) + saleAmount
    const globalExpenses = Number(existing.global_expenses || 0)
    
    // El ingreso total real del día es la suma de facturas menos los egresos globales manuales
    const newTotalIncome = newTotalInvoicesAmount - globalExpenses

    await supabase
      .from("daily_fiscal_records")
      .update({
        invoice_count: newCount,
        total_invoices_amount: newTotalInvoicesAmount,
        total_income: newTotalIncome,
      })
      .eq("record_date", today)
  } else {
    await supabase.from("daily_fiscal_records").insert({
      record_date: today,
      invoice_count: 1,
      total_invoices_amount: saleAmount,
      unbilled_income: 0,
      total_income: saleAmount, // Arranca con el monto de la venta y 0 egresos
      global_expenses: 0,
    })
  }
}

/**
 * REGISTRO DE VENTA Y CONEXIÓN COMPLETA A SUPABASE
 */
export async function processSale(saleData: CompleteSaleData) {
  const { items, finalAmount, discount, paymentMethod, customerId, customerName } = saleData

  try {
    // 0. Asegurar que el cliente exista en la tabla "customers" antes de registrar la venta si se proporciona ID
    let numericCustomerId: number | null = null
    if (customerId) {
      numericCustomerId = Number(customerId)
      const { error: customerUpsertError } = await supabase
        .from("customers")
        .upsert(
          {
            id: numericCustomerId,
            phone: customerId.toString(),
            name: customerName || "Cliente General",
          },
          { onConflict: 'id' }
        )

      if (customerUpsertError) {
        console.error("Error al registrar o verificar el cliente automáticamente:", customerUpsertError)
        throw customerUpsertError
      }
    }

    for (const item of items) {
      // 1. Consultar el producto para obtener su stock actual y variantes
      const { data: prodData } = await supabase
        .from("products")
        .select("total_stock, stock_by_sizes, stock_by_sizes_and_colors, cost_price")
        .eq("id", item.product_id)
        .single()

      const costPrice = prodData?.cost_price ?? 0
      const unitPrice = item.price
      const totalItemSale = unitPrice * item.quantity
      const totalItemCost = costPrice * item.quantity
      const profit = totalItemSale - totalItemCost

      // 2. Registrar la venta en la tabla `sales`
      const { error: saleError } = await supabase.from("sales").insert({
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        size: item.size || null,
        sale_price: unitPrice,
        cost_price: costPrice,
        profit: profit,
        discount: discount,
        payment_method: paymentMethod,
        customer_id: numericCustomerId,
        created_at: new Date().toISOString(),
      })

      if (saleError) {
        console.error("Error insertando en sales:", saleError)
        throw saleError
      }

      // 3. Descontar inventario de manera precisa (Total, Tallas y Combinación Talla-Color)
      if (prodData) {
        const currentTotal = prodData.total_stock ?? 0
        const newTotal = Math.max(0, currentTotal - item.quantity)
        
        // Descontar en stock_by_sizes
        const updatedStockBySizes = { ...(prodData.stock_by_sizes || {}) }
        if (item.size && updatedStockBySizes[item.size] !== undefined) {
          updatedStockBySizes[item.size] = Math.max(0, updatedStockBySizes[item.size] - item.quantity)
        }

        // Descontar en stock_by_sizes_and_colors
        const updatedStockBySizesAndColors = { ...(prodData.stock_by_sizes_and_colors || {}) }
        const colorKey = item.selectedColor && item.selectedColor !== "Único" 
          ? `${item.size}-${item.selectedColor}` 
          : null

        if (colorKey && updatedStockBySizesAndColors[colorKey] !== undefined) {
          updatedStockBySizesAndColors[colorKey] = Math.max(0, updatedStockBySizesAndColors[colorKey] - item.quantity)
        } else if (item.size && updatedStockBySizesAndColors[item.size] !== undefined) {
          updatedStockBySizesAndColors[item.size] = Math.max(0, updatedStockBySizesAndColors[item.size] - item.quantity)
        }

        // Si el stock total llega a 0, eliminamos el producto automáticamente de la base de datos
        if (newTotal === 0) {
          const { error: deleteError } = await supabase
            .from("products")
            .delete()
            .eq("id", item.product_id)

          if (deleteError) {
            console.error("Error al eliminar el producto agotado:", deleteError)
          }
        } else {
          // Si aún queda stock, simplemente actualizamos las cantidades
          await supabase
            .from("products")
            .update({
              total_stock: newTotal,
              stock_by_sizes: updatedStockBySizes,
              stock_by_sizes_and_colors: updatedStockBySizesAndColors,
            })
            .eq("id", item.product_id)
        }
      }
    }

    // 4. Gestionar cliente y puntos (acumulación y transacciones detalladas)
    if (numericCustomerId) {
      const pointsEarned = Math.floor(finalAmount / 1000)

      const { data: existingCustomer } = await supabase
        .from("customers")
        .select("id, points, name")
        .eq("id", numericCustomerId)
        .single()

      if (existingCustomer) {
        const newPoints = (existingCustomer.points || 0) + pointsEarned
        await supabase
          .from("customers")
          .update({
            points: newPoints,
            name: customerName || existingCustomer.name,
          })
          .eq("id", numericCustomerId)
      }

      if (pointsEarned > 0) {
        const { error: txError } = await supabase.from("point_transactions").insert({
          customer_id: numericCustomerId,
          points: pointsEarned,
          type: "EARN",
          description: `Venta por ${finalAmount.toLocaleString()} COP`,
          created_at: new Date().toISOString(),
        })

        if (txError) {
          console.error("Error al registrar point_transactions:", txError)
        }
      }
    }

    // 5. Alimentar automáticamente el registro diario del libro fiscal con el monto real cobrado en la venta
    await updateDailyFiscalRecordOnSale(finalAmount)

    return { success: true }
  } catch (error) {
    console.error("Error en processSale:", error)
    throw error
  }
}

export type DbProduct = AdminProduct