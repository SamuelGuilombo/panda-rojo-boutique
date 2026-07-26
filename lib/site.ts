export const site = {
  name: "Panda Rojo Boutique",
  phone: "3168788706",
  whatsapp: "573168788706",
  email: "pandarojoboutique@gmail.com",
  address: "Carrera 5 Este # 6A-04, Portal del Oriente",
  city: "Pitalito, Huila, Colombia",
  schedule: "Lunes a Sábado de 8:00 a.m. a 7:00 p.m.",
  social: {
    instagram: "https://instagram.com/pandarojoboutique",
    tiktok: "https://tiktok.com/@pandarojoboutique",
    facebook: "https://facebook.com/pandarojoboutique",
    instagramHandle: "@pandarojoboutique",
  },
  mapsEmbed:
    "https://maps.google.com/maps?q=Panda+Rojo+Boutique,+Carrera+5+Este+%23+6A-04,+Portal+del+Oriente,+Pitalito,+Huila,+Colombia&t=&z=16&ie=UTF8&iwloc=B&output=embed",
} as const

export const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/catalog", label: "Catálogo Completo" },
  { href: "/bamboo-points", label: "Puntos Bambú" },
  { href: "/about", label: "Nosotros" },
  { href: "/faq", label: "Preguntas Frecuentes" },
  { href: "/contact", label: "Contacto" },
] as const

export function whatsappLink(message: string): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`
}
