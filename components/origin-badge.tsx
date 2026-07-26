import type { Origin } from "@/data/products"
import { cn } from "@/lib/utils"

export function OriginBadge({
  origin,
  className,
}: {
  origin: Origin
  className?: string
}) {
  const isImported = origin === "Importado"
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide",
        isImported
          ? "bg-foreground text-background"
          : "bg-accent text-primary",
        className,
      )}
    >
      {isImported ? "Importado · China Premium" : "Nacional"}
    </span>
  )
}
