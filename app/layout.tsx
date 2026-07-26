import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { WhatsappButton } from '@/components/whatsapp-button'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Panda Rojo Boutique | Moda seleccionada con amor',
  description:
    'Boutique de moda en Pitalito, Huila. Ropa para dama y caballero, ropa íntima y pines metálicos. Prendas nacionales e importadas de calidad premium.',
  generator: 'v0.app',
  keywords: [
    'boutique',
    'moda',
    'Pitalito',
    'Huila',
    'ropa',
    'pines metálicos',
    'Panda Rojo',
  ],
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#c2261f',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`light ${inter.variable} ${playfair.variable}`}
    >
      <body className="antialiased bg-background font-sans">
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <WhatsappButton />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
