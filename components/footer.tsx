import Link from "next/link"
import { Mail, Phone, MapPin } from "lucide-react"
import { InstagramIcon, FacebookIcon } from "@/components/social-icons"
import { navLinks, site } from "@/lib/site"

// TikTok no está en lucide-react, usamos un ícono SVG propio simple.
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M16.5 3c.4 2.3 1.7 3.8 4 4v2.6c-1.4.1-2.7-.3-4-1v6.4c0 3.3-2.6 5.9-5.9 5.9S4.7 18.3 4.7 15c0-3.1 2.4-5.7 5.5-5.9v2.7c-1.6.2-2.8 1.5-2.8 3.2 0 1.8 1.4 3.2 3.2 3.2s3.2-1.4 3.2-3.2V3h2.7z" />
    </svg>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              PR
            </span>
            <span className="font-serif text-lg font-bold text-foreground">
              Panda Rojo Boutique
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Prendas seleccionadas con amor en el corazón de Pitalito, Huila.
            Moda nacional e importada de calidad premium.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
            Navegación
          </h3>
          <ul className="mt-4 space-y-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
            Contacto
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>
                {site.address}
                <br />
                {site.city}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0 text-primary" />
              <a
                href={`tel:+57${site.phone}`}
                className="transition-colors hover:text-primary"
              >
                {site.phone}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 shrink-0 text-primary" />
              <a
                href={`mailto:${site.email}`}
                className="break-all transition-colors hover:text-primary"
              >
                {site.email}
              </a>
            </li>
          </ul>

          <div className="mt-5 flex items-center gap-3">
            <a
              href={site.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex size-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <InstagramIcon className="size-4" />
            </a>
            <a
              href={site.social.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="flex size-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <TikTokIcon className="size-4" />
            </a>
            <a
              href={site.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="flex size-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <FacebookIcon className="size-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-border py-5">
        <p className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Panda Rojo Boutique. Todos los
          derechos reservados.
        </p>
      </div>
    </footer>
  )
}
