export type Origin = "Nacional" | "Importado"

export type CategoryId = "dama" | "caballero" | "intima" | "pines"

export interface Category {
  id: CategoryId
  label: string
  subcategories: string[]
  showOrigin: boolean
}

export const categories: Category[] = [
  {
    id: "dama",
    label: "Dama",
    subcategories: ["Vestidos", "Tops/Blusas", "Pantalones", "Conjuntos"],
    showOrigin: true,
  },
  {
    id: "caballero",
    label: "Caballero",
    subcategories: ["Oversize", "Camisetas", "Chaquetas", "Bermudas"],
    showOrigin: true,
  },
  {
    id: "intima",
    label: "Ropa Íntima",
    subcategories: ["Encaje", "Lencería de noche", "Tangas", "Conjuntos"],
    showOrigin: true,
  },
  {
    id: "pines",
    label: "Pines Metálicos",
    subcategories: ["Anime/Otaku", "Música", "Arte", "Cine/Series", "Medicina/Ciencia", "Genéricos"],
    showOrigin: false,
  },
]

// Modelo base de Producto público
export interface Product {
  id: string
  name: string
  price: number
  category: CategoryId
  subcategory: string
  origin?: Origin
  images: string[]
  description: string
  sizes: string[]
  colors: string[]
  bestSeller?: boolean
}

// Extensión del Producto para la Base de Datos y Panel de Admin
export interface AdminProduct extends Product {
  costPrice: number // Precio de costo para cálculo de utilidad
  stockBySizes: Record<string, number> // Ej: { "S": 2, "M": 0, "L": 1 }
  totalStock: number // Total de unidades acumuladas
  createdAt?: string
}

// Registro de Ventas para Contabilidad y Control de Inventario
export interface SaleRecord {
  id?: string
  productId: string
  productName: string
  quantity: number
  size: string
  costPrice: number
  salePrice: number
  profit: number // Utilidad neta: (salePrice - costPrice) * quantity
  createdAt?: string
}

// Modelo para el Programa de Fidelización (Puntos Bambú)
export interface Customer {
  id?: string
  phone: string
  name?: string
  points: number
  createdAt?: string
}

// Transacción individual de Puntos Bambú
export interface PointTransaction {
  id?: string
  customerId: string
  points: number
  type: "earned_purchase" | "earned_social" | "earned_review" | "redeemed"
  description: string
  createdAt?: string
}

// Formateador oficial de moneda para Colombia
export function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value)
}