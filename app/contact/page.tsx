import type { Metadata } from "next"
import { MapPin, Clock, Phone, Mail } from "lucide-react"
import { InstagramIcon, FacebookIcon } from "@/components/social-icons"
import { PageTransition, Reveal } from "@/components/motion-primitives"
import { site, whatsappLink } from "@/lib/site"

export const metadata: Metadata = {
  title: "Contacto | Panda Rojo Boutique",
  description:
    "Contáctanos en Panda Rojo Boutique, Pitalito, Huila. Teléfono, correo, redes sociales, ubicación y horario de atención.",
}

function WhatsappIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.6.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-1.6-.8-2.7-1.5-3.7-3.3-.3-.5.3-.5.8-1.5.1-.2 0-.3 0-.5s-.6-1.5-.9-2c-.2-.5-.4-.5-.6-.5h-.5c-.2 0-.5.1-.7.3-.7.7-1 1.5-1 2.6 0 1.6 1.2 3.2 1.4 3.4.2.2 2.4 3.6 5.7 5 .8.3 1.4.5 1.9.7.8.2 1.5.2 2.1.1.6-.1 1.7-.7 2-1.4.2-.6.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.4 1.3 4.9L2 22l5.3-1.4c1.4.8 3 1.2 4.7 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2z" />
    </svg>
  )
}

export default function ContactoPage() {
  const items = [
    {
      icon: MapPin,
      title: "Dirección",
      lines: [site.address, site.city],
    },
    {
      icon: Clock,
      title: "Horario",
      lines: [site.schedule],
    },
    {
      icon: Phone,
      title: "Teléfono / WhatsApp",
      lines: [site.phone],
      href: `tel:+57${site.phone}`,
    },
    {
      icon: Mail,
      title: "Correo",
      lines: [site.email],
      href: `mailto:${site.email}`,
    },
  ]

  return (
    <PageTransition>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <Reveal>
          <h1 className="font-serif text-4xl font-bold text-foreground sm:text-5xl">
            Contáctanos
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Estamos para ayudarte. Escríbenos por WhatsApp para asesoría,
            disponibilidad y envíos, o visítanos en nuestra boutique en Pitalito.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {items.map((item) => {
                const content = (
                  <div className="flex h-full items-start gap-3 rounded-xl border border-border bg-card p-5">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
                      <item.icon className="size-5" />
                    </span>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {item.title}
                      </h3>
                      {item.lines.map((l) => (
                        <p
                          key={l}
                          className="mt-1 break-words text-sm text-muted-foreground"
                        >
                          {l}
                        </p>
                      ))}
                    </div>
                  </div>
                )
                return item.href ? (
                  <a key={item.title} href={item.href} className="block">
                    {content}
                  </a>
                ) : (
                  <div key={item.title}>{content}</div>
                )
              })}
            </div>

            <a
              href={whatsappLink(
                "¡Hola Panda Rojo Boutique! Quiero hacer una consulta.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-5 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              <WhatsappIcon className="size-5" />
              Escríbenos por WhatsApp
            </a>

            <div className="flex items-center gap-3">
              <a
                href={site.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex size-11 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <InstagramIcon className="size-5" />
              </a>
              <a
                href={site.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex size-11 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <FacebookIcon className="size-5" />
              </a>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border">
            <iframe
              title="Ubicación de Panda Rojo Boutique en Pitalito, Huila"
              src={site.mapsEmbed}
              className="h-full min-h-80 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </PageTransition>
  )
}
