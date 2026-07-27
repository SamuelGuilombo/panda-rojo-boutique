import { supabase } from "@/lib/supabase"
import { addPointTransaction } from "./pointsService"

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

export interface ProcessSalePayload {
  customerPhoneOrDoc: string
  customerName?: string
  items: CartItem[]
  totalAmount: number
  paymentMethod: "CASH" | "TRANSFER" | "CARD"
  pointsRatio?: number
}

export async function getOrCreateCustomer(identifier: string, name?: string) {
  const cleanId = identifier.replace(/\D/g, "")
  if (!cleanId) return null

  const { data: existing } = await supabase
    .from("customers")
    .select("id, name, phone, document")
    .or(`phone.eq.${cleanId},document.eq.${cleanId}`)
    .maybeSingle()

  if (existing) return existing

  const { data: created, error } = await supabase
    .from("customers")
    .insert([
      {
        phone: cleanId,
        name: name?.trim() || `Cliente ${cleanId.slice(-4)}`,
      },
    ])
    .select("id, name, phone, document")
    .single()

  if (error) {
    console.error("Error al crear cliente:", error)
    return null
  }

  return created
}

export async function processSale(payload: ProcessSalePayload) {
  try {
    const customer = await getOrCreateCustomer(payload.customerPhoneOrDoc, payload.customerName)
    if (!customer) throw new Error("No se pudo registrar ni asociar el cliente.")

    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .insert([
        {
          customer_id: customer.id,
          total_amount: payload.totalAmount,
          payment_method: payload.paymentMethod,
          created_at: new Date().toISOString(),
        },
      ])
      .select("id")
      .single()

    if (saleError || !sale) throw saleError || new Error("Error al registrar la venta.")

    const saleItems = payload.items.map((item) => ({
      sale_id: sale.id,
      product_id: item.id.split("-")[0], // Extrae el ID base del producto
      quantity: item.quantity,
      unit_price: item.price,
      subtotal: item.price * item.quantity,
    }))

    const { error: itemsError } = await supabase.from("sale_items").insert(saleItems)
    if (itemsError) console.error("Error guardando detalles:", itemsError)

    const ratio = payload.pointsRatio || 1000
    const earnedPoints = Math.floor(payload.totalAmount / ratio)

    if (earnedPoints > 0) {
      await addPointTransaction({
        customer_id: customer.id,
        points: earnedPoints,
        type: "EARN",
        sale_id: sale.id,
        description: `Puntos ganados por Venta #${sale.id}`,
      })
    }

    return { success: true, saleId: sale.id, earnedPoints }
  } catch (err: any) {
    console.error("Error en processSale:", err)
    return { success: false, error: err?.message || "Error al procesar la venta." }
  }
}