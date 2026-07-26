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
    subcategories: ["Vestidos"],
    showOrigin: true,
  },
  {
    id: "caballero",
    label: "Caballero",
    subcategories: ["Oversize"],
    showOrigin: true,
  },
  {
    id: "intima",
    label: "Ropa Íntima",
    subcategories: ["Encaje", "Lencería de noche", "Tangas"],
    showOrigin: true,
  },
  {
    id: "pines",
    label: "Pines Metálicos",
    subcategories: ["Anime/Otaku", "Música", "Arte", "Cine/Series", "Medicina/Ciencia", "Genéricos"],
    showOrigin: false,
  },
]

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

// Precio en pesos colombianos (COP)
export const products: Product[] = [
  // ---------------- DAMA / Vestidos ----------------
  {
    id: "dama-vestido-rojo",
    name: "Vestido Midi Rojo Escarlata",
    price: 129900,
    category: "dama",
    subcategory: "Vestidos",
    origin: "Nacional",
    images: ["/products/vestido-rojo.png", "/products/vestido-negro.png"],
    description:
      "Vestido midi en tela fluida con silueta ceñida y vuelo sutil. Ideal para eventos de tarde y noche. Confeccionado localmente con acabados de alta durabilidad.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Rojo", "Negro"],
    bestSeller: true,
  },
  {
    id: "dama-vestido-floral",
    name: "Vestido Floral Primavera",
    price: 109900,
    category: "dama",
    subcategory: "Vestidos",
    origin: "Nacional",
    images: ["/products/vestido-floral.png"],
    description:
      "Vestido corto con estampado floral, tirantes ajustables y falda con vuelo. Fresco y versátil para el día a día.",
    sizes: ["S", "M", "L"],
    colors: ["Floral crema", "Floral azul"],
    bestSeller: true,
  },
  {
    id: "dama-vestido-negro",
    name: "Vestido Negro Elegante",
    price: 149900,
    category: "dama",
    subcategory: "Vestidos",
    origin: "Importado",
    images: ["/products/vestido-negro.png", "/products/vestido-rojo.png"],
    description:
      "Vestido negro ceñido de corte clásico, perfecto para ocasiones especiales. Tela importada premium con excelente caída.",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Negro"],
  },
  {
    id: "dama-vestido-satinado",
    name: "Vestido Satinado Vino",
    price: 159900,
    category: "dama",
    subcategory: "Vestidos",
    origin: "Importado",
    images: ["/products/vestido-rojo.png"],
    description:
      "Vestido satinado en tono vino con espalda descubierta. Elegancia y brillo sutil para noches inolvidables.",
    sizes: ["S", "M", "L"],
    colors: ["Vino", "Rojo"],
  },

  // ---------------- CABALLERO / Oversize ----------------
  {
    id: "caballero-oversize-blanco",
    name: "Camiseta Oversize Blanca",
    price: 69900,
    category: "caballero",
    subcategory: "Oversize",
    origin: "Nacional",
    images: ["/products/oversize-blanco.png", "/products/oversize-negro.png"],
    description:
      "Camiseta oversize de algodón grueso con caída amplia y hombros caídos. Básico esencial para un look urbano.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Blanco", "Negro", "Beige"],
    bestSeller: true,
  },
  {
    id: "caballero-oversize-negro",
    name: "Camiseta Oversize Negra",
    price: 69900,
    category: "caballero",
    subcategory: "Oversize",
    origin: "Nacional",
    images: ["/products/oversize-negro.png", "/products/oversize-blanco.png"],
    description:
      "Camiseta oversize negra de corte relajado. Algodón premium con estampado minimalista en el pecho.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Negro"],
  },
  {
    id: "caballero-oversize-beige",
    name: "Camiseta Oversize Beige",
    price: 74900,
    category: "caballero",
    subcategory: "Oversize",
    origin: "Importado",
    images: ["/products/oversize-beige.png"],
    description:
      "Camiseta oversize tono tierra con tela pesada importada. Estilo streetwear con acabados de calidad premium.",
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["Beige", "Verde militar"],
    bestSeller: true,
  },
  {
    id: "caballero-hoodie-oversize",
    name: "Hoodie Oversize Grafito",
    price: 129900,
    category: "caballero",
    subcategory: "Oversize",
    origin: "Importado",
    images: ["/products/oversize-negro.png"],
    description:
      "Buzo oversize con capucha, felpa interna suave y bolsillo canguro. Comodidad y estilo para el clima fresco.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Grafito", "Negro"],
  },

  // ---------------- ROPA ÍNTIMA ----------------
  {
    id: "intima-encaje-rojo",
    name: "Conjunto de Encaje Rojo",
    price: 89900,
    category: "intima",
    subcategory: "Encaje",
    origin: "Importado",
    images: ["/products/encaje-rojo.png", "/products/encaje-negro.png"],
    description:
      "Conjunto de brasier y panty en encaje floral con detalles ajustables. Diseño delicado y sensual de calidad premium.",
    sizes: ["S", "M", "L"],
    colors: ["Rojo", "Negro"],
    bestSeller: true,
  },
  {
    id: "intima-encaje-negro",
    name: "Conjunto de Encaje Negro",
    price: 89900,
    category: "intima",
    subcategory: "Encaje",
    origin: "Importado",
    images: ["/products/encaje-negro.png", "/products/encaje-rojo.png"],
    description:
      "Conjunto en encaje negro con transparencias sutiles. Elegancia atemporal con excelente ajuste.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Negro"],
  },
  {
    id: "intima-lenceria-noche",
    name: "Baby Doll Lencería de Noche",
    price: 99900,
    category: "intima",
    subcategory: "Lencería de noche",
    origin: "Importado",
    images: ["/products/lenceria-noche.png"],
    description:
      "Baby doll en tul y encaje con lazo ajustable. Pensado para noches especiales, con acabados premium importados.",
    sizes: ["S", "M", "L"],
    colors: ["Rojo", "Negro", "Blanco"],
    bestSeller: true,
  },
  {
    id: "intima-tanga-set",
    name: "Set de Tangas x3",
    price: 49900,
    category: "intima",
    subcategory: "Tangas",
    origin: "Nacional",
    images: ["/products/tanga-set.png"],
    description:
      "Pack de 3 tangas en algodón suave y encaje. Comodidad diaria con excelente elasticidad. Confección nacional.",
    sizes: ["S", "M", "L"],
    colors: ["Surtido"],
  },
  {
    id: "intima-tanga-encaje",
    name: "Tanga de Encaje Premium",
    price: 29900,
    category: "intima",
    subcategory: "Tangas",
    origin: "Importado",
    images: ["/products/tanga-set.png", "/products/encaje-rojo.png"],
    description:
      "Tanga de encaje con laterales ajustables. Diseño delicado importado de calidad premium.",
    sizes: ["S", "M", "L"],
    colors: ["Rojo", "Negro", "Nude"],
  },

  // ---------------- PINES METÁLICOS (sin badge de origen) ----------------
  {
    id: "pin-anime-1",
    name: "Pin Metálico Anime Clásico",
    price: 15900,
    category: "pines",
    subcategory: "Anime/Otaku",
    images: ["/products/pin-anime.png"],
    description:
      "Pin metálico esmaltado con motivo anime. Broche trasero de mariposa. Perfecto para bolsos, chaquetas y morrales.",
    sizes: ["Único"],
    colors: ["Multicolor"],
    bestSeller: true,
  },
  {
    id: "pin-musica-1",
    name: "Pin Metálico Música",
    price: 15900,
    category: "pines",
    subcategory: "Música",
    images: ["/products/pin-musica.png"],
    description:
      "Pin esmaltado con diseño musical (nota / cassette). Acabado brillante y colores vibrantes.",
    sizes: ["Único"],
    colors: ["Multicolor"],
  },
  {
    id: "pin-arte-1",
    name: "Pin Metálico Arte",
    price: 16900,
    category: "pines",
    subcategory: "Arte",
    images: ["/products/pin-arte.png"],
    description:
      "Pin inspirado en el arte clásico y la pintura. Detalle fino esmaltado, ideal para coleccionistas.",
    sizes: ["Único"],
    colors: ["Multicolor"],
    bestSeller: true,
  },
  {
    id: "pin-cine-1",
    name: "Pin Metálico Cine/Series",
    price: 16900,
    category: "pines",
    subcategory: "Cine/Series",
    images: ["/products/pin-cine.png"],
    description:
      "Pin de referencia al cine y las series. Broche resistente, colores duraderos.",
    sizes: ["Único"],
    colors: ["Multicolor"],
  },
  {
    id: "pin-ciencia-1",
    name: "Pin Metálico Medicina/Ciencia",
    price: 16900,
    category: "pines",
    subcategory: "Medicina/Ciencia",
    images: ["/products/pin-ciencia.png"],
    description:
      "Pin con motivo científico y médico (ADN / estetoscopio). Regalo ideal para estudiantes y profesionales.",
    sizes: ["Único"],
    colors: ["Multicolor"],
    bestSeller: true,
  },
  {
    id: "pin-generico-1",
    name: "Pin Metálico Genérico",
    price: 12900,
    category: "pines",
    subcategory: "Genéricos",
    images: ["/products/pin-generico.png"],
    description:
      "Pin metálico de diseño genérico y versátil. Ideal para combinar y personalizar tus prendas favoritas.",
    sizes: ["Único"],
    colors: ["Surtido"],
  },
]

export function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value)
}

export const bestSellers = products.filter((p) => p.bestSeller)
