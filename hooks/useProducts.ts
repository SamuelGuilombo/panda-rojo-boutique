"use client"

import { useEffect, useState } from "react"
import { fetchProducts } from "@/services/productService"
import type { AdminProduct } from "@/data/products"

export function useProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchProducts()
      setProducts(data)
    } catch (err: any) {
      console.error("Error al obtener productos:", err)
      setError("No se pudo conectar con la base de datos para cargar el catálogo.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  return { products, loading, error, refreshProducts: loadProducts }
}