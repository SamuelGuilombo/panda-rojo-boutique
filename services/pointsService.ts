import { supabase } from "@/lib/supabase" // Ajusta la ruta si tu cliente de Supabase tiene otra ubicación

export interface PointTransaction {
  id: string
  customer_id: number | string
  points: number
  type: "EARN" | "REDEEM" | "EXPIRE" | "ADJUSTMENT"
  sale_id?: number | null
  description?: string | null
  created_at: string
}

export interface CustomerPointsSummary {
  customerId: number | string
  customerName: string
  customerPhone: string
  totalPoints: number
  history: PointTransaction[]
}

/**
 * Obtiene el resumen de puntos e historial de un cliente buscando por Teléfono o Documento
 */
export async function getPointsByPhone(phoneQuery: string): Promise<CustomerPointsSummary | null> {
  const cleanPhone = phoneQuery.replace(/\D/g, "")
  if (!cleanPhone) return null

  // 1. Intentar buscar el cliente en la tabla "customers"
  let { data: customer, error: custError } = await supabase
    .from("customers")
    .select("id, name, phone, document, points")
    .or(`phone.eq.${cleanPhone},document.eq.${cleanPhone}`)
    .maybeSingle()

  // Si no está en la tabla customers, creamos un objeto básico para rescatarlo por medio de sus transacciones
  let customerIdToSearch = customer?.id
  let customerName = customer?.name || "Cliente General"
  let customerPhone = customer?.phone || cleanPhone

  if (!customer) {
    // Si se guardó directamente el teléfono como customer_id en transacciones
    customerIdToSearch = cleanPhone as any
  }

  // 2. Traer las transacciones de puntos buscando tanto por el ID del cliente como por su representación en texto/teléfono
  const { data: transactions, error: transError } = await supabase
    .from("point_transactions")
    .select("*")
    .or(`customer_id.eq.${customer?.id || 0},customer_id.eq.${cleanPhone}`)
    .order("created_at", { ascending: false })

  if (transError) {
    console.error("Error cargando historial de puntos:", transError)
  }

  const history: PointTransaction[] = transactions || []
  
  // Calcular puntos totales sumando el historial, o respaldarse con el campo points de customers si existe
  let totalPoints = history.reduce((acc, curr) => acc + curr.points, 0)
  if (totalPoints === 0 && customer?.points) {
    totalPoints = customer.points
  }

  // Si no hay transacciones ni puntos en customers, retornamos null
  if (history.length === 0 && totalPoints === 0 && !customer) {
    return null
  }

  return {
    customerId: customerIdToSearch || cleanPhone,
    customerName: customerName,
    customerPhone: customerPhone,
    totalPoints,
    history,
  }
}

/**
 * Registra una nueva transacción de puntos (Acumulación o Redención)
 */
export async function addPointTransaction(payload: {
  customer_id: number | string
  points: number // Positivo para EARN, Negativo para REDEEM
  type: "EARN" | "REDEEM" | "EXPIRE" | "ADJUSTMENT"
  sale_id?: number
  description?: string
}): Promise<boolean> {
  const { error } = await supabase.from("point_transactions").insert([
    {
      customer_id: payload.customer_id,
      points: payload.points,
      type: payload.type,
      sale_id: payload.sale_id || null,
      description: payload.description || null,
    },
  ])

  if (error) {
    console.error("Error al registrar transacción de puntos:", error)
    return false
  }

  return true
}