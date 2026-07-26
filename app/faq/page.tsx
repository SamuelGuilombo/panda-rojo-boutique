import type { Metadata } from "next"
import Link from "next/link"
import { HelpCircle, ArrowRight } from "lucide-react"
import { FaqAccordion, type FaqItem } from "@/components/faq-accordion"
import { PageTransition, Reveal } from "@/components/motion-primitives"

export const metadata: Metadata = {
  title: "Preguntas Frecuentes | Panda Rojo Boutique",
  description:
    "Resolvemos tus dudas sobre envíos, medios de pago y calidad de las prendas en Panda Rojo Boutique.",
}

const faqs: FaqItem[] = [
  {
    q: "¿Hacen envíos locales y nacionales?",
    a: "Sí. Realizamos entregas locales en Pitalito y envíos a todo el territorio nacional a través de transportadoras. Coordinamos el envío contigo por WhatsApp una vez confirmado el pedido.",
  },
  {
    q: "¿Cuánto tarda un envío nacional?",
    a: "Los envíos nacionales suelen tardar entre 2 y 5 días hábiles dependiendo de la ciudad de destino. En Pitalito la entrega puede ser el mismo día o al día siguiente.",
  },
  {
    q: "¿Qué medios de pago aceptan?",
    a: "Aceptamos pagos directos por transferencia (Nequi, Daviplata, Bancolombia), efectivo en tienda y contra entrega en la zona local. Al confirmar tu pedido por WhatsApp te indicamos los datos de pago.",
  },
  {
    q: "¿Cómo es la calidad de las prendas importadas?",
    a: "Nuestras prendas importadas provienen de China y son de calidad premium. Seleccionamos cada pieza revisando materiales, costuras y acabados para garantizar durabilidad y buen ajuste.",
  },
  {
    q: "¿Puedo cambiar una prenda si no me queda?",
    a: "Sí, aceptamos cambios dentro de los primeros días siempre que la prenda esté sin uso y con sus etiquetas. Escríbenos por WhatsApp para gestionarlo.",
  },
  {
    q: "¿Cómo funcionan los Puntos Bambú?",
    a: "Acumulas puntos con cada compra y al etiquetarnos en tus fotos en redes sociales. Luego puedes canjearlos por descuentos y pines gratis. Consulta la sección Puntos Bambú para ver la tabla de recompensas.",
  },
]

export default function FaqPage() {
  return (
    <PageTransition>
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            <HelpCircle className="size-3.5" />
            Ayuda
          </span>
          <h1 className="mt-4 font-serif text-4xl font-bold text-foreground sm:text-5xl">
            Preguntas Frecuentes
          </h1>
          <p className="mt-3 text-muted-foreground">
            Todo lo que necesitas saber sobre envíos, pagos y calidad. ¿No
            encuentras tu respuesta? Escríbenos por WhatsApp.
          </p>
        </Reveal>

        <div className="mt-8">
          <FaqAccordion items={faqs} />
        </div>

        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl bg-secondary/50 p-8 text-center">
            <h2 className="font-serif text-2xl font-bold text-foreground">
              ¿Aún tienes dudas?
            </h2>
            <p className="max-w-md text-sm text-muted-foreground">
              Nuestro equipo estará encantado de ayudarte con cualquier
              consulta adicional.
            </p>
            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Ir a Contacto
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </Reveal>
      </section>
    </PageTransition>
  )
}
